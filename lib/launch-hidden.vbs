' launch-hidden.vbs — used by ChiralNetworkChannel.bat to start node fully hidden.
'
' Usage: wscript launch-hidden.vbs <node.exe> <script.js> <log> <err>
'
' Why this exists: PowerShell's Start-Process with -WindowStyle Minimized
' still parks a node console window in the taskbar, and -WindowStyle Hidden
' is not reliable together with -RedirectStandardOutput in Windows
' PowerShell 5.1. A WScript.Shell.Run with intWindowStyle=0 is the
' battle-tested Windows trick for a truly hidden, detached process.
'
' The node PID is no longer captured here — server.js writes .server.pid
' itself on a successful listen (and unlinks it on shutdown).

Option Explicit

Dim sh, q, cmd
Set sh = CreateObject("WScript.Shell")
q = Chr(34)

' Build:  cmd /c ""<node>" "<script>" > "<log>" 2> "<err>""
' The outer pair of quotes is required so cmd preserves the inner quoting
' around paths that may contain spaces.
cmd = "cmd /c " & q & q & WScript.Arguments(0) & q _
    & " " & q & WScript.Arguments(1) & q _
    & " > " & q & WScript.Arguments(2) & q _
    & " 2> " & q & WScript.Arguments(3) & q & q

' intWindowStyle = 0 (hidden), bWaitOnReturn = False (detach).
sh.Run cmd, 0, False
