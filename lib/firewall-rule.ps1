# Chiral Network Channel - one-stop firewall manager
#
# This script is the single source of firewall truth for the
# launcher. It self-elevates via Start-Process -Verb RunAs and runs
# as Administrator inside the elevated child.
#
# Action 'Add' (one-stop allow phones on LAN):
#   1. Find every enabled inbound Block rule whose Application
#      filter points at *node.exe (the most common cause of phones
#      "ICMP works but TCP times out" -- legacy Block rules from
#      past Windows-Firewall popups override our port-scoped Allow
#      rule because Block has higher precedence than Allow).
#   2. Save those rule identities to firewall-state.json so
#      Action='Remove' can re-enable exactly the rules we touched.
#   3. Disable them (reversible; the firewall UI shows them greyed,
#      not deleted).
#   4. Add an inbound TCP <port> Allow rule named "Chiral Network
#      Channel <port>" with Profile=Any.
#   5. Re-query and write everything that happened to a log file
#      the bat can `type` after the elevated window closes.
#
# Action 'Remove' (restore previous state):
#   1. Remove the Allow rule we added.
#   2. Re-enable every rule recorded in firewall-state.json (the
#      ones we disabled in step 3 of Add). If state file is missing,
#      enable every node.exe Block-Inbound rule that is currently
#      Disabled (best-effort fallback).
#   3. Delete firewall-state.json.

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('Add', 'Remove')]
    [string]$Action,

    [Parameter(Mandatory = $true)]
    [ValidateRange(1, 65535)]
    [int]$Port
)

$ErrorActionPreference = 'Stop'

$logFile   = Join-Path $PSScriptRoot 'firewall-rule.log'
$stateFile = Join-Path $PSScriptRoot 'firewall-state.json'

function Write-Log([string]$Line) {
    $stamp = (Get-Date -Format 'HH:mm:ss')
    "[$stamp] $Line" | Out-File -FilePath $logFile -Append -Encoding utf8
    Write-Host $Line
}

# ---- Self-elevation ----------------------------------------------
$identity  = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($identity)
$isAdmin   = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    "" | Out-File -FilePath $logFile -Encoding utf8
    Write-Log "Unelevated parent: requesting elevation. Action=$Action Port=$Port"

    # Pass path WITHOUT pre-quoting -- Start-Process applies its own
    # argument quoting. A previous version wrapped $PSCommandPath in
    # literal quotes, Start-Process double-quoted it, and the
    # elevated child received a non-existent path with literal quotes
    # baked in, crashing on launch.
    $argList = @(
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-File',   $PSCommandPath,
        '-Action', $Action,
        '-Port',   $Port
    )
    try {
        Start-Process powershell.exe -Verb RunAs -ArgumentList $argList -Wait
        Write-Log "Unelevated parent: elevated child returned. See log lines above."
        exit 0
    } catch {
        Write-Log "ERROR launching elevated PowerShell: $($_.Exception.Message)"
        Write-Log "  If a UAC prompt appeared and you clicked No, that is why."
        Write-Log "  If no UAC prompt appeared, your account may not be in the"
        Write-Log "  Administrators group, or UAC is disabled by Group Policy."
        exit 1
    }
}

# ===================================================================
#  Elevated work below
# ===================================================================
$displayName = "Chiral Network Channel $Port"

function Get-NodeBlockInboundRules {
    # All enabled inbound Block rules whose Application filter
    # references a node.exe binary, regardless of profile.
    $apps = Get-NetFirewallApplicationFilter -All -ErrorAction SilentlyContinue |
        Where-Object { $_.Program -like '*node.exe*' }
    foreach ($app in $apps) {
        $r = Get-NetFirewallRule -AssociatedNetFirewallApplicationFilter $app -ErrorAction SilentlyContinue
        if (-not $r)                     { continue }
        if ($r.Direction -ne 'Inbound')  { continue }
        if ($r.Action    -ne 'Block')    { continue }
        if ($r.Enabled   -ne 'True')     { continue }
        [PSCustomObject]@{
            Rule        = $r
            DisplayName = $r.DisplayName
            Name        = $r.Name           # GUID-like internal name
            Profile     = $r.Profile.ToString()
            Program     = $app.Program
        }
    }
}

if ($Action -eq 'Add') {
    Write-Log "Elevated child: Action=Add for '$displayName'"

    # Step 1: cleanup conflicting Block rules.
    Write-Log "  Scanning for legacy node.exe Block-Inbound rules ..."
    $blockers = @(Get-NodeBlockInboundRules)
    if ($blockers.Count -gt 0) {
        Write-Log "  Found $($blockers.Count) Block rule(s) that would override Allow:"
        $stateRecords = @()
        foreach ($b in $blockers) {
            Write-Log "    - '$($b.DisplayName)' Profile=$($b.Profile) Program=$($b.Program)"
            $stateRecords += [PSCustomObject]@{
                Name        = $b.Name
                DisplayName = $b.DisplayName
                Profile     = $b.Profile
                Program     = $b.Program
            }
        }
        # Persist state so Action=Remove can restore exactly these rules.
        $stateRecords | ConvertTo-Json -Depth 4 |
            Out-File -FilePath $stateFile -Encoding utf8
        Write-Log "  Saved restoration state to $stateFile"

        Write-Log "  Disabling them ..."
        foreach ($b in $blockers) {
            try {
                $b.Rule | Disable-NetFirewallRule
                Write-Log "    disabled: '$($b.DisplayName)' Profile=$($b.Profile)"
            } catch {
                Write-Log "    FAILED to disable '$($b.DisplayName)': $($_.Exception.Message)"
            }
        }
    } else {
        Write-Log "  No Block rules to clean up."
        # Still write an empty state file so Remove knows nothing was disabled.
        '[]' | Out-File -FilePath $stateFile -Encoding utf8
    }

    # Step 2: idempotent re-add of our Allow rule.
    Write-Log "  Removing any pre-existing rule named '$displayName' ..."
    Get-NetFirewallRule -DisplayName $displayName -ErrorAction SilentlyContinue |
        Remove-NetFirewallRule -ErrorAction SilentlyContinue

    Write-Log "  Adding inbound TCP $Port Allow rule (Profile=Any) ..."
    try {
        New-NetFirewallRule `
            -DisplayName $displayName `
            -Direction   Inbound `
            -Protocol    TCP `
            -LocalPort   $Port `
            -Action      Allow `
            -Profile     Any | Out-Null
        Write-Log "  OK -- rule '$displayName' added."
    } catch {
        Write-Log "  ERROR adding Allow rule: $($_.Exception.Message)"
        exit 1
    }

    # Step 3: verify (admin context sees PersistentStore reliably).
    Start-Sleep -Milliseconds 300
    $verify = Get-NetFirewallRule -DisplayName $displayName -ErrorAction SilentlyContinue
    if ($verify) {
        $pf = $verify | Get-NetFirewallPortFilter -ErrorAction SilentlyContinue
        Write-Log ""
        Write-Log "VERIFY OK -- LAN access is now configured:"
        Write-Log "  Allow : '$displayName' Profile=$($verify.Profile) LocalPort=$($pf.LocalPort)"
        Write-Log "  Block : $($blockers.Count) legacy node.exe Block rule(s) disabled"
        Write-Log ""
        Write-Log "Phones / tablets on the same Wi-Fi can now connect."
    } else {
        Write-Log "VERIFY FAIL -- Allow rule missing after add. Possible Group Policy override or third-party firewall."
        exit 1
    }
    exit 0
}

if ($Action -eq 'Remove') {
    Write-Log "Elevated child: Action=Remove for '$displayName'"

    # Step 1: drop our Allow rule.
    $existing = Get-NetFirewallRule -DisplayName $displayName -ErrorAction SilentlyContinue
    if ($existing) {
        $existing | Remove-NetFirewallRule -ErrorAction SilentlyContinue
        Write-Log "  Removed Allow rule '$displayName'."
    } else {
        Write-Log "  No Allow rule named '$displayName' to remove."
    }

    # Step 2: re-enable Block rules from state file (precise undo)
    # or fall back to "enable every disabled node.exe Block-Inbound".
    $restored = 0
    if (Test-Path $stateFile) {
        Write-Log "  Reading restoration state from $stateFile ..."
        try {
            $records = @(Get-Content $stateFile -Raw | ConvertFrom-Json)
            foreach ($rec in $records) {
                if (-not $rec.Name) { continue }
                $r = Get-NetFirewallRule -Name $rec.Name -ErrorAction SilentlyContinue
                if ($r) {
                    $r | Enable-NetFirewallRule -ErrorAction SilentlyContinue
                    Write-Log "    re-enabled: '$($rec.DisplayName)' Profile=$($rec.Profile)"
                    $restored++
                } else {
                    Write-Log "    skip (rule no longer exists): '$($rec.DisplayName)'"
                }
            }
        } catch {
            Write-Log "  WARN reading state file: $($_.Exception.Message)"
        }
        Remove-Item $stateFile -ErrorAction SilentlyContinue
    } else {
        Write-Log "  No state file -- using fallback: enable every disabled node.exe Block-Inbound rule."
        $apps = Get-NetFirewallApplicationFilter -All -ErrorAction SilentlyContinue |
            Where-Object { $_.Program -like '*node.exe*' }
        foreach ($app in $apps) {
            $r = Get-NetFirewallRule -AssociatedNetFirewallApplicationFilter $app -ErrorAction SilentlyContinue
            if ($r -and $r.Direction -eq 'Inbound' -and $r.Action -eq 'Block' -and $r.Enabled -ne 'True') {
                $r | Enable-NetFirewallRule -ErrorAction SilentlyContinue
                Write-Log "    re-enabled: '$($r.DisplayName)' Profile=$($r.Profile)"
                $restored++
            }
        }
    }

    Write-Log ""
    Write-Log "OK -- restored $restored Block rule(s); Allow rule for port $Port removed."
    exit 0
}
