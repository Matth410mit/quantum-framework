# Runs the algorithm sync on a schedule (from cron) and writes logs to ./logs.
# The sync reads the sheet's public CSV export, so no Google credentials are needed.

set -euo pipefail

# Settings

PROJECT_DIR="/Users/matth410/quantum-framework"

SYNC_SCRIPT="src/store/syncAlgorithms.js"

LOG_DIR="$PROJECT_DIR/logs"
TODAY="$(date +%Y-%m-%d)"
LOG_FILE="$LOG_DIR/algorithm-sync-$TODAY.log"

# Email for success and failure notices (needs `mail` set up). Change this if
# someone else takes over.
NOTIFICATION_EMAIL="matth410@mit.edu"

# If cron can't find node, set this to the output of `which node`.
NODE_BIN="$(command -v node || true)"

log() {
  mkdir -p "$LOG_DIR"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_error() {
  mkdir -p "$LOG_DIR"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE" >&2
}

send_notification() {
  local subject="$1"
  local message="$2"

  if [ -n "$NOTIFICATION_EMAIL" ] && command -v mail >/dev/null 2>&1; then
    echo "$message" | mail -s "$subject" "$NOTIFICATION_EMAIL" || true
  fi
}

die() {
  log_error "$1"
  send_notification "Algorithm Sync Failed" "$1
Log: $LOG_FILE"
  exit 1
}

log "=========================================="
log "Starting Algorithm Sync"
log "=========================================="

[ -d "$PROJECT_DIR" ] || die "Project directory not found: $PROJECT_DIR"

cd "$PROJECT_DIR" || die "Failed to cd into project directory: $PROJECT_DIR"
log "Working directory: $(pwd)"

if [ -z "$NODE_BIN" ]; then
  # Common install locations on macOS and Homebrew
  if [ -x "/opt/homebrew/bin/node" ]; then
    NODE_BIN="/opt/homebrew/bin/node"
  elif [ -x "/usr/local/bin/node" ]; then
    NODE_BIN="/usr/local/bin/node"
  else
    die "Node.js not found. Run 'which node' and set NODE_BIN in this script."
  fi
fi

log "Node: $NODE_BIN"
log "Node version: $("$NODE_BIN" --version)"

# Load .env if there is one (for example SPREADSHEET_ID to read a different
# sheet). cron doesn't load the shell profile.
if [ -f ".env" ]; then
  set -a
  source ".env"
  set +a
fi

[ -f "$SYNC_SCRIPT" ] || die "Sync script not found at: $PROJECT_DIR/$SYNC_SCRIPT"

log "Running sync: $NODE_BIN $SYNC_SCRIPT"
if "$NODE_BIN" "$SYNC_SCRIPT" >> "$LOG_FILE" 2>&1; then
  log "Sync completed successfully!"
  log "Updated: $PROJECT_DIR/src/store/algorithmVariants.js and docs/sheet-sync-report.md"
  send_notification "Algorithm Sync Success" "Algorithms updated successfully at $(date)
Log: $LOG_FILE"
else
  die "Sync script failed. See log: $LOG_FILE"
fi

# Delete logs older than 30 days
find "$LOG_DIR" -name "algorithm-sync-*.log" -mtime +30 -delete >/dev/null 2>&1 || true
log "Cleaned up old logs (kept last 30 days)"

log "=========================================="
log "Sync Complete"
log "=========================================="

exit 0
