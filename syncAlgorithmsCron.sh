# Algorithm Sync Cron Job Wrapper (Service Account + .env)

# Runs the Node sync script on a schedule and writes logs to ./logs

set -euo pipefail

# CONFIGURATION

# actual repo path
PROJECT_DIR="/Users/matth410/Documents/quantum-framework"

# The Node script to run
SYNC_SCRIPT="src/store/syncAlgorithms.js"

# Log location
LOG_DIR="$PROJECT_DIR/logs"
TODAY="$(date +%Y-%m-%d)"
LOG_FILE="$LOG_DIR/algorithm-sync-$TODAY.log"

# Optional: email notifications (requires `mail` configured on system)
# please update this if someone else takes over
NOTIFICATION_EMAIL="matth410@mit.edu"

# If cron can't find node, hardcode it:
# Run `which node` in your terminal and paste it here.
NODE_BIN="$(command -v node || true)"

# FUNCTIONS

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

# MAIN

log "=========================================="
log "Starting Algorithm Sync"
log "=========================================="

# Validate project directory
[ -d "$PROJECT_DIR" ] || die "Project directory not found: $PROJECT_DIR"

cd "$PROJECT_DIR" || die "Failed to cd into project directory: $PROJECT_DIR"
log "Working directory: $(pwd)"

# Ensure node exists
if [ -z "$NODE_BIN" ]; then
  # fallback common locations (macOS + brew)
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

# Load environment variables from .env (cron does NOT load shell profile)
if [ ! -f ".env" ]; then
  die ".env not found in project root ($PROJECT_DIR). Create it with GOOGLE_APPLICATION_CREDENTIALS and SPREADSHEET_ID."
fi

# Export variables from .env (simple KEY=VALUE lines)
set -a
source ".env"
set +a

# Validate required env vars
[ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ] || die "GOOGLE_APPLICATION_CREDENTIALS missing (check .env)."
[ -n "${SPREADSHEET_ID:-}" ] || die "SPREADSHEET_ID missing (check .env)."

# Validate service account json exists
[ -f "$GOOGLE_APPLICATION_CREDENTIALS" ] || die "Service account JSON not found at: $GOOGLE_APPLICATION_CREDENTIALS"

# Validate script exists
[ -f "$SYNC_SCRIPT" ] || die "Sync script not found at: $PROJECT_DIR/$SYNC_SCRIPT"

# Run sync
log "Running sync: $NODE_BIN $SYNC_SCRIPT"
if "$NODE_BIN" "$SYNC_SCRIPT" >> "$LOG_FILE" 2>&1; then
  log "Sync completed successfully!"
  log "Updated: $PROJECT_DIR/src/store/algorithmVariants.js"
  send_notification "Algorithm Sync Success" "Algorithms updated successfully at $(date)
Log: $LOG_FILE"
else
  die "Sync script failed. See log: $LOG_FILE"
fi

# Clean up old logs (keep last 30 days)
find "$LOG_DIR" -name "algorithm-sync-*.log" -mtime +30 -delete >/dev/null 2>&1 || true
log "Cleaned up old logs (kept last 30 days)"

log "=========================================="
log "Sync Complete"
log "=========================================="

exit 0
