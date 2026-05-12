#!/bin/bash
# Chiral Network Channel — DS124 launcher.
# Triggered from DSM Task Scheduler on boot-up, or runnable manually
# for debugging. Not intended to be exec-ed from within node server.js.

APP_DIR=/volume1/homes/admin/ds124player

# Synology's default shell PATH is /usr/bin:/bin:/usr/sbin:/sbin and
# does NOT include /usr/local/bin where the Node.js package symlinks
# node + npm. Without this export, npm-cli.js's `#!/usr/bin/env node`
# shebang fails even though node itself is installed.
export PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

# Point config.js at the Synology shared folders created via Control
# Panel. Files dropped into \\NAS\video over SMB show up in the video
# subsystem automatically on the next /api/collections fetch.
export MEDIA_ROOT=/volume1/video
export AUDIO_ROOT=/volume1/audio
export IMAGE_ROOT=/volume1/Manga
export NOVEL_ROOT=/volume1/Novel
export DATA_ROOT="$APP_DIR/data"

# HOST=0.0.0.0 lets you reach the server directly at http://NAS_IP:8080
# during bring-up. Once the Login Portal reverse proxy is live and
# you're happy with http://NAS_IP/, flip this to 127.0.0.1 to hide the
# raw port from the LAN.
export PORT=8080
export HOST=0.0.0.0

cd "$APP_DIR" || exit 1
mkdir -p "$DATA_ROOT"

# Kill any prior instance started by a previous run of this script.
# DSM's busybox `ps -ef` only shows `node server.js` (the relative argv
# used when we cd into APP_DIR), which makes string matching unreliable
# — any other node process on the NAS with that argv would get caught.
# Walk /proc instead: a process is "one of ours" iff its cwd link
# points at APP_DIR and its comm is 'node'. That combination is both
# precise (only this app) and robust (immune to argv/path variations).
# Makes the script safe to re-run manually or click "Run" twice in
# Task Scheduler without ghost instances on fallback ports 8081/8088/...
find_our_pids() {
  for p in /proc/[0-9]*; do
    [ -L "$p/cwd" ] || continue
    [ "$(readlink "$p/cwd" 2>/dev/null)" = "$APP_DIR" ] || continue
    [ "$(cat "$p/comm" 2>/dev/null)" = "node" ] || continue
    basename "$p"
  done
}
PRIOR_PIDS=$(find_our_pids)
if [ -n "$PRIOR_PIDS" ]; then
  kill $PRIOR_PIDS 2>/dev/null || true
  sleep 1
  STILL=$(find_our_pids)
  [ -n "$STILL" ] && kill -9 $STILL 2>/dev/null || true
fi

# Append-mode logs so multiple restarts don't lose history. Rotate
# by hand if they ever get big — no rotation daemon for a personal NAS.
exec node server.js >> "$APP_DIR/server.log" 2>> "$APP_DIR/server.err"
