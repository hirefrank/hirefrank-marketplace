---
description: Import GitHub issues into Beads with automatic task breakdown and dependency detection
---

# Beads Import from GitHub

## Introduction

This command imports GitHub issues into Beads for multi-session coordination. It fetches issue details via GitHub CLI, intelligently breaks down complex issues into sub-tasks, detects dependencies, and creates a coordinated set of Beads issues for the 27 edge-stack agents.

## Prerequisites

- Beads initialized (`/es-beads-init` completed)
- GitHub CLI (`gh`) installed and authenticated
- Git repository with GitHub remote
- Beads CLI (`bd`) or MCP server available

## Command Usage

```bash
/es-beads-import <github-issue-number>
```

**Examples:**
- `/es-beads-import 42` - Import GitHub issue #42
- `/es-beads-import 123` - Import GitHub issue #123

## Import Workflow

### Step 1: Verify Prerequisites

```bash
# Check GitHub CLI
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) not found"
  echo "   Install: https://cli.github.com/"
  exit 1
fi

# Check gh authentication
if ! gh auth status &> /dev/null; then
  echo "❌ GitHub CLI not authenticated"
  echo "   Run: gh auth login"
  exit 1
fi

# Check Beads
if [ ! -d ".beads" ]; then
  echo "❌ Beads not initialized"
  echo "   Run: /es-beads-init"
  exit 1
fi

if ! command -v bd &> /dev/null; then
  echo "❌ Beads CLI (bd) not found"
  exit 1
fi
```

### Step 2: Fetch GitHub Issue

```bash
issue_number="$ARGUMENTS"

# Validate issue number
if ! [[ "$issue_number" =~ ^[0-9]+$ ]]; then
  echo "❌ Invalid issue number: $issue_number"
  echo "   Usage: /es-beads-import <number>"
  exit 1
fi

# Fetch issue details
echo "Fetching GitHub issue #$issue_number..."

issue_json=$(gh issue view "$issue_number" --json number,title,body,labels,state,url,assignees,milestone,author)

if [ $? -ne 0 ]; then
  echo "❌ Failed to fetch GitHub issue #$issue_number"
  echo "   Check issue exists and you have access"
  exit 1
fi

# Extract fields
title=$(echo "$issue_json" | jq -r '.title')
body=$(echo "$issue_json" | jq -r '.body // ""')
state=$(echo "$issue_json" | jq -r '.state')
url=$(echo "$issue_json" | jq -r '.url')
labels=$(echo "$issue_json" | jq -r '.labels[].name' | tr '\n' ',' | sed 's/,$//')
author=$(echo "$issue_json" | jq -r '.author.login')

echo "✅ Fetched: #$issue_number - $title"
echo "   State: $state"
echo "   Labels: $labels"
echo "   URL: $url"
```

### Step 3: Check if Already Imported

```bash
# Check if issue already imported
existing=$(bd list --format json | jq --arg url "$url" '[.[] | select(.github_issue == $url)]')
existing_count=$(echo "$existing" | jq length)

if [ "$existing_count" -gt 0 ]; then
  echo "⚠️  GitHub issue #$issue_number already imported to Beads:"
  echo "$existing" | jq -r '.[] | "  \(.id): \(.title)"'
  echo ""
  echo "Re-import anyway? (y/n)"
  read -r reimport
  if [ "$reimport" != "y" ]; then
    echo "Aborting import."
    exit 0
  fi
fi
```

### Step 4: Analyze Issue Complexity

```bash
# Analyze issue to determine if it needs breakdown
echo ""
echo "Analyzing issue complexity..."

# Task cloudflare-architecture-strategist to break down the issue
echo "Consulting cloudflare-architecture-strategist for task breakdown..."

breakdown_prompt="Analyze this GitHub issue and break it down into sub-tasks:

Title: $title
Body:
$body

Labels: $labels

Instructions:
1. Identify if this is a single task or needs breakdown
2. If breakdown needed, create 3-7 sub-tasks with clear dependencies
3. For each sub-task, suggest:
   - Brief title (1 line)
   - Priority (P1/P2/P3)
   - Tags (cloudflare, workers-runtime, durable-objects, kv, security, etc.)
   - Assigned agent (based on tags)
   - Dependencies (which tasks must complete first)
4. Output as JSON:
   {
     \"needs_breakdown\": true/false,
     \"main_task\": {
       \"title\": \"...\",
       \"priority\": \"p1\",
       \"tags\": [\"cloudflare\", \"workers-runtime\"],
       \"agent\": \"workers-runtime-guardian\"
     },
     \"subtasks\": [
       {
         \"title\": \"...\",
         \"priority\": \"p2\",
         \"tags\": [...],
         \"agent\": \"...\",
         \"depends_on\": [0]  // Index of dependency (0 = main task)
       }
     ]
   }
"

# Task agent for breakdown analysis
Task cloudflare-architecture-strategist("$breakdown_prompt")

# Parse agent response (assuming JSON output)
# For now, we'll use a simple heuristic
```

### Step 5: Heuristic Task Breakdown (Fallback)

```bash
# Simple heuristic if agent unavailable
needs_breakdown=false

# Check if body has multiple sections, bullet lists, or checkboxes
if echo "$body" | grep -qE '(^## |^### |- \[ \]|^- |^[0-9]+\.)'; then
  needs_breakdown=true
fi

# Check if body is long (> 500 chars) and has multiple paragraphs
body_length=$(echo "$body" | wc -c)
paragraph_count=$(echo "$body" | grep -cE '^$')

if [ "$body_length" -gt 500 ] && [ "$paragraph_count" -gt 2 ]; then
  needs_breakdown=true
fi

echo "Breakdown needed: $needs_breakdown"
```

### Step 6a: Simple Import (No Breakdown)

**If needs_breakdown == false:**

```bash
echo "Creating single Beads issue from GitHub #$issue_number..."

# Determine priority from labels
priority="p2"  # default
if echo "$labels" | grep -qiE '(critical|urgent|p1)'; then
  priority="p1"
elif echo "$labels" | grep -qiE '(low|minor|p3)'; then
  priority="p3"
fi

# Extract tags from labels
beads_tags="cloudflare,edge-stack,github-import"
if echo "$labels" | grep -qiE '(worker|runtime)'; then
  beads_tags="$beads_tags,workers-runtime"
fi
if echo "$labels" | grep -qiE '(durable|objects|DO)'; then
  beads_tags="$beads_tags,durable-objects"
fi
if echo "$labels" | grep -qiE '(kv|storage)'; then
  beads_tags="$beads_tags,kv"
fi
if echo "$labels" | grep -qiE '(security|auth)'; then
  beads_tags="$beads_tags,security"
fi
if echo "$labels" | grep -qiE '(performance|perf)'; then
  beads_tags="$beads_tags,performance"
fi

# Create Beads issue
beads_id=$(bd create \
  --title "$title (GH#$issue_number)" \
  --priority "$priority" \
  --tag "$beads_tags" \
  --meta github_issue="$url" \
  --meta github_number="$issue_number" \
  --meta imported_at="$(date -Iseconds)" \
  --meta author="$author" \
  | grep -oE 'bd-[a-z0-9]{4}')

# Add issue body as description
if [ -n "$body" ]; then
  bd update "$beads_id" --description "$body"
fi

echo "✅ Created Beads issue: $beads_id"
echo "   GitHub: #$issue_number"
echo "   Priority: $priority"
echo "   Tags: $beads_tags"

# Add comment to GitHub issue
gh issue comment "$issue_number" --body "$(cat <<EOF
Imported to Beads for multi-session coordination: \`$beads_id\`

Track progress:
- \`/es-beads-status\`
- \`/es-work $beads_id\`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

echo ""
echo "Next: /es-work $beads_id"
```

### Step 6b: Complex Import (With Breakdown)

**If needs_breakdown == true:**

```bash
echo "Creating main Beads issue with sub-tasks..."

# Create main tracking issue
main_id=$(bd create \
  --title "$title (GH#$issue_number)" \
  --priority "p1" \
  --tag "cloudflare,edge-stack,github-import,parent" \
  --meta github_issue="$url" \
  --meta github_number="$issue_number" \
  --meta imported_at="$(date -Iseconds)" \
  --meta author="$author" \
  --meta type="parent" \
  | grep -oE 'bd-[a-z0-9]{4}')

echo "✅ Created main issue: $main_id"

# Parse body for sub-tasks (look for checkboxes, numbered lists, headers)
subtasks=()

# Extract checkbox items: - [ ] Task description
while IFS= read -r line; do
  if [[ "$line" =~ ^-[[:space:]]\[[[:space:]]\][[:space:]](.+)$ ]]; then
    task_title="${BASH_REMATCH[1]}"
    subtasks+=("$task_title")
  fi
done <<< "$body"

# Extract numbered items: 1. Task description
while IFS= read -r line; do
  if [[ "$line" =~ ^[0-9]+\.[[:space:]](.+)$ ]]; then
    task_title="${BASH_REMATCH[1]}"
    subtasks+=("$task_title")
  fi
done <<< "$body"

# Extract section headers: ## Task description
while IFS= read -r line; do
  if [[ "$line" =~ ^##[[:space:]](.+)$ ]]; then
    section_title="${BASH_REMATCH[1]}"
    # Skip common non-task headers
    if ! [[ "$section_title" =~ (Description|Context|Background|Notes|Resources) ]]; then
      subtasks+=("$section_title")
    fi
  fi
done <<< "$body"

# If no structured tasks found, create generic breakdown
if [ ${#subtasks[@]} -eq 0 ]; then
  subtasks=(
    "Analyze requirements and design approach"
    "Implement core functionality"
    "Add tests and validation"
    "Update documentation"
  )
fi

echo "Creating ${#subtasks[@]} sub-task(s)..."

# Create sub-task Beads issues
subtask_ids=()
for i in "${!subtasks[@]}"; do
  task_num=$((i + 1))
  subtask_title="${subtasks[$i]}"

  # Determine priority (first tasks P1, middle P2, last P3)
  if [ $i -eq 0 ]; then
    subtask_priority="p1"
  elif [ $i -eq $((${#subtasks[@]} - 1)) ]; then
    subtask_priority="p3"
  else
    subtask_priority="p2"
  fi

  # Create subtask
  subtask_id=$(bd create \
    --title "$subtask_title (GH#$issue_number/$task_num)" \
    --priority "$subtask_priority" \
    --tag "cloudflare,edge-stack,github-import,subtask" \
    --meta github_issue="$url" \
    --meta github_number="$issue_number" \
    --meta parent="$main_id" \
    | grep -oE 'bd-[a-z0-9]{4}')

  subtask_ids+=("$subtask_id")

  # Create dependency: subtask depends on previous subtask (sequential)
  if [ $i -gt 0 ]; then
    prev_subtask="${subtask_ids[$((i - 1))]}"
    bd block "$prev_subtask" "$subtask_id"
    echo "  $subtask_id: $subtask_title (blocked by $prev_subtask)"
  else
    # First subtask has no blocker (ready to start)
    echo "  $subtask_id: $subtask_title (READY)"
  fi
done

# Main issue blocked by all subtasks
for subtask_id in "${subtask_ids[@]}"; do
  bd block "$subtask_id" "$main_id"
done

echo ""
echo "✅ Import complete:"
echo "   Main: $main_id (blocked until all subtasks done)"
echo "   Subtasks: ${#subtasks[@]} (sequential dependencies)"

# Add comment to GitHub issue with breakdown
subtask_list=""
for i in "${!subtask_ids[@]}"; do
  subtask_list="$subtask_list- \`${subtask_ids[$i]}\`: ${subtasks[$i]}\n"
done

gh issue comment "$issue_number" --body "$(cat <<EOF
Imported to Beads with task breakdown:

**Main Issue**: \`$main_id\` (tracks overall completion)

**Sub-tasks** (${#subtasks[@]} tasks with sequential dependencies):
$subtask_list

Track progress:
- \`/es-beads-status\`
- Start first task: \`/es-work ${subtask_ids[0]}\`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

echo ""
echo "Next: /es-work ${subtask_ids[0]}"
```

### Step 7: Show Status

```bash
echo ""
echo "Beads import complete. Showing status..."
/es-beads-status
```

### Step 8: Enable Auto-Sync (Optional)

```bash
echo ""
echo "Enable auto-sync to keep GitHub issue updated? (y/n)"
echo "  This will update GitHub #$issue_number when Beads issues close"
read -r enable_sync

if [ "$enable_sync" = "y" ]; then
  # Update edge-stack.local.md
  if grep -q "beads_auto_sync_github: false" .claude/edge-stack.local.md; then
    sed -i 's/beads_auto_sync_github: false/beads_auto_sync_github: true/' .claude/edge-stack.local.md
    echo "✅ Auto-sync enabled in .claude/edge-stack.local.md"
  fi

  # Add GitHub label to Beads issues for tracking
  for beads_id in "${subtask_ids[@]}" "$main_id"; do
    bd update "$beads_id" --tag "github-synced"
  done

  echo "   When Beads issues close, GitHub #$issue_number will be updated"
  echo "   Run /es-beads-sync to manually sync anytime"
fi
```

## Advanced Features

### Import Multiple Issues

```bash
# Usage: /es-beads-import 42,43,44
IFS=',' read -ra issue_numbers <<< "$ARGUMENTS"

for issue_num in "${issue_numbers[@]}"; do
  echo "Importing GitHub issue #$issue_num..."
  # Run import workflow for each
done
```

### Filter by Label

Only import issues with specific labels:

```bash
# Usage: /es-beads-import --label bug
label_filter="$ARGUMENTS"

# Fetch all issues with label
gh issue list --label "$label_filter" --json number --jq '.[].number' | while read -r issue_num; do
  /es-beads-import "$issue_num"
done
```

### Import from PR Comments

Import todo items from PR review comments:

```bash
# Fetch PR comments
gh pr view "$PR_NUMBER" --json comments | jq -r '.comments[].body' | grep -E '- \[ \]' | while read -r task; do
  # Create Beads issue for each unchecked task
done
```

## Error Handling

### GitHub Issue Not Found

```bash
if ! gh issue view "$issue_number" &> /dev/null; then
  echo "❌ GitHub issue #$issue_number not found"
  echo ""
  echo "Check:"
  echo "  1. Issue number is correct"
  echo "  2. You have access to the repository"
  echo "  3. gh CLI is authenticated: gh auth status"
  exit 1
fi
```

### Issue Already Closed

```bash
if [ "$state" = "CLOSED" ]; then
  echo "⚠️  GitHub issue #$issue_number is already closed"
  echo "   Import anyway? (y/n)"
  read -r import_closed
  if [ "$import_closed" != "y" ]; then
    echo "Aborting import."
    exit 0
  fi
fi
```

### Beads Not Initialized

```bash
if [ ! -d ".beads" ]; then
  echo "❌ Beads not initialized"
  echo ""
  echo "Initialize Beads first:"
  echo "  /es-beads-init"
  exit 1
fi
```

## Notes

- **GitHub Comments**: Adds comment to GitHub issue with Beads IDs for tracking
- **Bidirectional Tracking**: GitHub issue URL stored in Beads metadata
- **Dependency Detection**: Sequential dependencies for subtasks (task 1 → task 2 → task 3)
- **Parent/Child**: Main issue tracks overall completion, subtasks track specific work
- **Auto-tagging**: Extracts tags from GitHub labels (bug → priority, feature → enhancement)
- **Agent Assignment**: Suggests agents based on tags and content analysis
- **Sync Ready**: Issues tagged "github-synced" can be synced with `/es-beads-sync`
