#!/usr/bin/env bash
# kill-active-window-kwin.sh
# Finds the active window via KWin and asks KWin to kill it immediately via DBus.

set -euo pipefail

# If qdbus isn't available, fail early
command -v qdbus >/dev/null 2>&1 || { echo "qdbus not found; please install qt6-tools or qt5-tools" >&2; exit 1; }

# Use KWin's killWindow method on org.kde.KWin
# This tells KWin to kill the window (Q_NOREPLY), which forcefully terminates it.
qdbus org.kde.KWin /KWin org.kde.KWin.killWindow
