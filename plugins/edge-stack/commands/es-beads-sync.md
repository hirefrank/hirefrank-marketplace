---
description: Bidirectional sync between Beads issues and GitHub issues with conflict resolution
---

# Beads-GitHub Sync Command

## Introduction

This command synchronizes Beads issues with GitHub issues bidirectionally. It keeps both systems in sync by updating GitHub when Beads issues are closed, and importing new GitHub issues when they're labeled with "beads". Includes intelligent conflict detection and resolution.

## Prerequisites

- Beads initialized (`/es-beads-init` completed)
- GitHub CLI (`gh`) installed and authenticated
- Git repository with GitHub remote
- Auto-sync enabled in `.claude/edge-stack.local.md` (optional but recommended)

## Command Usage

```bash
/es-beads-sync
```

**Optional flags:**
- `/es-beads-sync --dry-run` - Show what would be synced without making changes
- `/es-beads-sync --force` - Force sync even if conflicts detected

## Sync Workflow

### Step 1: Verify Prerequisites

```bash
# Check GitHub CLI
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) not found"
  exit 1
fi

if ! gh auth status &> /dev/null; then
  echo "❌ GitHub CLI not authenticated"
  exit 1
fi

# Check Beads
if [ ! -d ".beads" ]; then
  echo "❌ Beads not initialized"
  exit 1
fi

if ! command -v bd &> /dev/null; then
  echo "❌ Beads CLI (bd) not found"
  exit 1
fi
```

### Step 2: Fetch All Beads Issues with GitHub Links

```bash
echo "🔄 Syncing Beads ↔ GitHub..."
echo ""

# Get all Beads issues that have GitHub metadata
beads_with_github=$(bd list --format json | jq '[.[] | select(.github_issue != null)]')
beads_count=$(echo "$beads_with_github" | jq length)

echo "Found $beads_count Beads issues linked to GitHub"
```

### Step 3: Beads → GitHub Sync

Update GitHub issues based on Beads state changes.

```bash
echo ""
echo "📤 Syncing Beads → GitHub..."

# Track sync actions
updated_count=0
errors=()

# For each Beads issue linked to GitHub
echo "$beads_with_github" | jq -c '.[]' | while read -r beads_issue; do
  beads_id=$(echo "$beads_issue" | jq -r '.id')
  beads_status=$(echo "$beads_issue" | jq -r '.status')
  github_url=$(echo "$beads_issue" | jq -r '.github_issue')
  github_number=$(echo "$beads_issue" | jq -r '.github_number')
  last_synced=$(echo "$beads_issue" | jq -r '.last_synced_at // ""')

  # Skip if no GitHub number
  if [ -z "$github_number" ] || [ "$github_number" = "null" ]; then
    continue
  fi

  # Fetch current GitHub issue state
  gh_state=$(gh issue view "$github_number" --json state --jq '.state')

  # Check if sync needed
  sync_needed=false

  # Case 1: Beads closed, GitHub open → Close GitHub
  if [ "$beads_status" = "closed" ] && [ "$gh_state" = "OPEN" ]; then
    sync_needed=true
    action="close_github"
  fi

  # Case 2: Beads reopened, GitHub closed → Reopen GitHub
  if [ "$beads_status" = "open" ] && [ "$gh_state" = "CLOSED" ]; then
    # Check if this is intentional
    echo "⚠️  Conflict: $beads_id (open) vs GitHub #$github_number (closed)"
    echo "   Reopen GitHub issue? (y/n)"
    read -r reopen
    if [ "$reopen" = "y" ]; then
      sync_needed=true
      action="reopen_github"
    fi
  fi

  # Case 3: Beads updated recently → Add progress comment
  if [ -n "$last_synced" ]; then
    beads_updated=$(echo "$beads_issue" | jq -r '.updated_at // .created_at')
    if [ "$beads_updated" \> "$last_synced" ]; then
      sync_needed=true
      action="update_github"
    fi
  fi

  # Perform sync action
  if [ "$sync_needed" = true ]; then
    case $action in
      close_github)
        echo "  Closing GitHub #$github_number (Beads $beads_id closed)"
        gh issue close "$github_number" --comment "$(cat <<EOF
Closed via Beads issue \`$beads_id\`

All related Beads tasks completed.

🤖 Synced with [Claude Code](https://claude.com/claude-code)
EOF
)"
        updated_count=$((updated_count + 1))
        bd update "$beads_id" --meta last_synced_at="$(date -Iseconds)"
        ;;

      reopen_github)
        echo "  Reopening GitHub #$github_number (Beads $beads_id reopened)"
        gh issue reopen "$github_number" --comment "Reopened via Beads issue \`$beads_id\`"
        updated_count=$((updated_count + 1))
        bd update "$beads_id" --meta last_synced_at="$(date -Iseconds)"
        ;;

      update_github)
        echo "  Updating GitHub #$github_number (Beads $beads_id progress)"

        # Get recent activity on Beads issue
        progress_msg="Progress update from Beads \`$beads_id\`:\n\n"

        if [ "$beads_status" = "in_progress" ]; then
          locked_by=$(echo "$beads_issue" | jq -r '.locked_by // ""')
          progress_msg="${progress_msg}- Status: In progress"
          if [ -n "$locked_by" ] && [ "$locked_by" != "null" ]; then
            progress_msg="${progress_msg} (working: $locked_by)"
          fi
        else
          progress_msg="${progress_msg}- Status: $beads_status"
        fi

        gh issue comment "$github_number" --body "$progress_msg"
        updated_count=$((updated_count + 1))
        bd update "$beads_id" --meta last_synced_at="$(date -Iseconds)"
        ;;
    esac
  fi
done

echo "✅ Updated $updated_count GitHub issue(s)"
```

### Step 4: GitHub → Beads Sync

Import new GitHub issues with "beads" label.

```bash
echo ""
echo "📥 Syncing GitHub → Beads..."

# Fetch open GitHub issues with "beads" label
beads_labeled=$(gh issue list --label beads --state open --json number,title,url --jq '.[]')

if [ -z "$beads_labeled" ]; then
  echo "No GitHub issues with 'beads' label to import"
else
  import_count=0

  echo "$beads_labeled" | jq -c '.' | while read -r gh_issue; do
    gh_number=$(echo "$gh_issue" | jq -r '.number')
    gh_url=$(echo "$gh_issue" | jq -r '.url')

    # Check if already imported
    existing=$(bd list --format json | jq --arg url "$gh_url" '[.[] | select(.github_issue == $url)]')
    existing_count=$(echo "$existing" | jq length)

    if [ "$existing_count" -eq 0 ]; then
      echo "  Importing GitHub #$gh_number..."
      /es-beads-import "$gh_number"
      import_count=$((import_count + 1))
    else
      echo "  GitHub #$gh_number already imported ($(echo "$existing" | jq -r '.[].id'))"
    fi
  done

  echo "✅ Imported $import_count new GitHub issue(s)"
fi
```

### Step 5: Detect and Resolve Conflicts

```bash
echo ""
echo "🔍 Checking for conflicts..."

conflicts=()

# Check for issues closed in GitHub but open in Beads
echo "$beads_with_github" | jq -c '.[]' | while read -r beads_issue; do
  beads_id=$(echo "$beads_issue" | jq -r '.id')
  beads_status=$(echo "$beads_issue" | jq -r '.status')
  github_number=$(echo "$beads_issue" | jq -r '.github_number')

  if [ -z "$github_number" ] || [ "$github_number" = "null" ]; then
    continue
  fi

  gh_state=$(gh issue view "$github_number" --json state,updatedAt --jq '.')
  gh_status=$(echo "$gh_state" | jq -r '.state')
  gh_updated=$(echo "$gh_state" | jq -r '.updatedAt')

  beads_updated=$(echo "$beads_issue" | jq -r '.updated_at // .created_at')

  # Conflict: Both modified independently
  if [ "$beads_status" = "open" ] && [ "$gh_status" = "CLOSED" ]; then
    if [ "$gh_updated" \> "$beads_updated" ]; then
      conflicts+=("$beads_id:$github_number:github_newer")
      echo "⚠️  Conflict: $beads_id (open) vs GitHub #$github_number (closed, updated later)"
    fi
  elif [ "$beads_status" = "closed" ] && [ "$gh_status" = "OPEN" ]; then
    if [ "$beads_updated" \> "$gh_updated" ]; then
      conflicts+=("$beads_id:$github_number:beads_newer")
      echo "⚠️  Conflict: $beads_id (closed, updated later) vs GitHub #$github_number (open)"
    fi
  fi
done

# Resolve conflicts
if [ ${#conflicts[@]} -gt 0 ]; then
  echo ""
  echo "Found ${#conflicts[@]} conflict(s). Resolve now? (y/n)"
  read -r resolve_conflicts

  if [ "$resolve_conflicts" = "y" ]; then
    for conflict in "${conflicts[@]}"; do
      IFS=':' read -r beads_id github_number winner <<< "$conflict"

      echo ""
      echo "Conflict: $beads_id ↔ GitHub #$github_number"
      echo "Which is the source of truth?"
      echo "  1. Beads (close GitHub issue)"
      echo "  2. GitHub (close Beads issue)"
      echo "  3. Keep both open (manual resolution)"
      read -r choice

      case $choice in
        1)
          gh issue close "$github_number" --comment "Closed to match Beads \`$beads_id\` state"
          echo "✅ Closed GitHub #$github_number"
          ;;
        2)
          bd close "$beads_id"
          echo "✅ Closed Beads $beads_id"
          ;;
        3)
          echo "⏩ Skipped - manual resolution needed"
          ;;
      esac
    done
  fi
else
  echo "✅ No conflicts detected"
fi
```

### Step 6: Sync Parent/Child Relationships

```bash
echo ""
echo "🔗 Syncing parent/child relationships..."

# Find parent Beads issues
parents=$(bd list --format json | jq '[.[] | select(.type == "parent")]')
parent_count=$(echo "$parents" | jq length)

if [ "$parent_count" -gt 0 ]; then
  echo "$parents" | jq -c '.[]' | while read -r parent; do
    parent_id=$(echo "$parent" | jq -r '.id')
    github_number=$(echo "$parent" | jq -r '.github_number')

    if [ -z "$github_number" ] || [ "$github_number" = "null" ]; then
      continue
    fi

    # Find all subtasks
    subtasks=$(bd list --format json | jq --arg pid "$parent_id" '[.[] | select(.parent == $pid)]')
    total_subtasks=$(echo "$subtasks" | jq length)
    closed_subtasks=$(echo "$subtasks" | jq '[.[] | select(.status == "closed")] | length')

    # Calculate progress
    if [ "$total_subtasks" -gt 0 ]; then
      progress=$(( (closed_subtasks * 100) / total_subtasks ))
      echo "  GitHub #$github_number: $closed_subtasks/$total_subtasks tasks done ($progress%)"

      # Update GitHub with progress
      gh issue comment "$github_number" --body "$(cat <<EOF
Progress update: $closed_subtasks/$total_subtasks tasks completed ($progress%)

Beads parent: \`$parent_id\`

🤖 Synced with [Claude Code](https://claude.com/claude-code)
EOF
)"
    fi

    # If all subtasks done, close parent
    if [ "$closed_subtasks" -eq "$total_subtasks" ] && [ "$total_subtasks" -gt 0 ]; then
      parent_status=$(echo "$parent" | jq -r '.status')
      if [ "$parent_status" != "closed" ]; then
        bd close "$parent_id"
        echo "  ✅ Closed parent $parent_id (all subtasks done)"
      fi
    fi
  done
fi
```

### Step 7: Summary Report

```bash
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Sync Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Beads → GitHub:"
echo "  Updated: $updated_count issue(s)"
echo ""
echo "GitHub → Beads:"
echo "  Imported: $import_count new issue(s)"
echo ""
echo "Conflicts:"
echo "  Detected: ${#conflicts[@]}"
echo "  Resolved: $resolved_count"
echo ""
echo "Parent/Child Sync:"
echo "  Parents synced: $parent_count"
echo ""
echo "Last sync: $(date -Iseconds)"
echo ""

# Update sync timestamp in config
if [ -f .claude/edge-stack.local.md ]; then
  if grep -q "last_beads_sync:" .claude/edge-stack.local.md; then
    sed -i "s/last_beads_sync:.*/last_beads_sync: $(date -Iseconds)/" .claude/edge-stack.local.md
  else
    # Add to frontmatter
    sed -i "/^---$/a last_beads_sync: $(date -Iseconds)" .claude/edge-stack.local.md
  fi
fi

echo "Next sync: Run /es-beads-sync again anytime"
echo "Auto-sync: Enable in .claude/edge-stack.local.md"
```

## Auto-Sync Configuration

Enable automatic sync when Beads issues change:

```yaml
# .claude/edge-stack.local.md
---
beads_auto_sync_github: true
beads_sync_frequency: on_close  # or: hourly, daily, manual
beads_sync_direction: bidirectional  # or: beads_to_github, github_to_beads
---
```

**Sync triggers:**
- `on_close` - Sync when Beads issue closes (recommended)
- `hourly` - Sync every hour (for active projects)
- `daily` - Sync once per day (for maintenance projects)
- `manual` - Only sync via `/es-beads-sync` command

## Advanced Features

### Dry Run Mode

Preview sync without making changes:

```bash
/es-beads-sync --dry-run

# Shows:
# Would close GitHub #42 (Beads bd-a1b2 closed)
# Would import GitHub #57 (has 'beads' label)
# Would update GitHub #123 (Beads bd-c3d4 progress)
```

### Sync Specific Issue

```bash
# Sync only one Beads issue
/es-beads-sync bd-a1b2

# Sync only one GitHub issue
/es-beads-sync gh-42
```

### Batch GitHub Import

Import all open issues with "beads" label:

```bash
gh issue list --label beads --state open --json number --jq '.[].number' | while read -r num; do
  /es-beads-import "$num"
done
```

## Error Handling

### GitHub API Rate Limit

```bash
# Check rate limit
rate_limit=$(gh api rate_limit --jq '.rate')
remaining=$(echo "$rate_limit" | jq '.remaining')

if [ "$remaining" -lt 10 ]; then
  reset_time=$(echo "$rate_limit" | jq '.reset')
  echo "⚠️  GitHub API rate limit low: $remaining requests remaining"
  echo "   Resets at: $(date -d @$reset_time)"
  echo "   Continue anyway? (y/n)"
  read -r continue_sync
  if [ "$continue_sync" != "y" ]; then
    exit 0
  fi
fi
```

### Network Issues

```bash
# Test GitHub connectivity
if ! gh auth status &> /dev/null; then
  echo "❌ Cannot connect to GitHub"
  echo "   Check:"
  echo "   1. Internet connection"
  echo "   2. gh authentication: gh auth status"
  echo "   3. GitHub service status: https://www.githubstatus.com/"
  exit 1
fi
```

### Sync Lock

Prevent concurrent syncs:

```bash
# Create sync lock
sync_lock="/tmp/beads-sync.lock"

if [ -f "$sync_lock" ]; then
  lock_age=$(($(date +%s) - $(stat -c %Y "$sync_lock")))
  if [ "$lock_age" -lt 300 ]; then
    echo "❌ Sync already in progress (started $(($lock_age / 60))m ago)"
    echo "   Wait or force unlock: rm $sync_lock"
    exit 1
  else
    echo "⚠️  Removing stale lock (> 5 minutes old)"
    rm "$sync_lock"
  fi
fi

touch "$sync_lock"
trap "rm -f $sync_lock" EXIT
```

## Notes

- **Bidirectional**: Syncs both Beads → GitHub and GitHub → Beads
- **Conflict Detection**: Warns when both systems modified independently
- **Progress Tracking**: Updates GitHub with completion percentage for parent issues
- **Label-Based Import**: Auto-imports GitHub issues with "beads" label
- **Safe Defaults**: Asks for confirmation on destructive operations
- **Rate Limit Aware**: Checks GitHub API limits before bulk operations
- **Parent/Child Sync**: Keeps GitHub updated with subtask progress
