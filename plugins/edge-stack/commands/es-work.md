---
description: Analyze work documents and systematically execute tasks until completion
---

# Work Plan Execution Command

## Introduction

This command helps you analyze a work document (plan, Markdown file, specification, or any structured document), create a comprehensive todo list using the TodoWrite tool, and then systematically execute each task until the entire plan is completed. It combines deep analysis with practical execution to transform plans into reality.

## Prerequisites

- A work document to analyze (plan file, specification, or any structured document)
- Clear understanding of project context and goals
- Access to necessary tools and permissions for implementation
- Ability to test and validate completed work
- Git repository with main branch

## Main Tasks

### 1. Setup Development Environment

- Ensure main branch is up to date
- Create feature branch with descriptive name
- Setup worktree for isolated development
- Configure development environment

### 2. Analyze Input Document

<input_document> #$ARGUMENTS </input_document>

#### Determine Input Type

The input can be one of three types:

1. **Beads Issue ID** (format: bd-xxxx)
   - Example: `bd-a1b2`, `bd-c3d4`
   - Source: Beads issue tracking system
   - Action: Fetch from Beads and sync with TodoWrite

2. **Markdown File Path** (legacy)
   - Example: `plan.md`, `todos/042-pending-p1-fix-bug.md`
   - Source: Local markdown file
   - Action: Read file and extract tasks

3. **Plain Description** (new task)
   - Example: `"Add KV caching layer"`
   - Source: User-provided description
   - Action: Optionally create Beads issue, then work

```bash
# Detect input type
input="$ARGUMENTS"

if [[ "$input" =~ ^bd-[a-z0-9]{4}$ ]]; then
  INPUT_TYPE="beads"
  BEADS_ID="$input"
elif [ -f "$input" ]; then
  INPUT_TYPE="markdown"
  MARKDOWN_FILE="$input"
else
  INPUT_TYPE="description"
  DESCRIPTION="$input"
fi
```

## Execution Workflow

### Phase 0: Handle Beads Issue (if applicable)

**If INPUT_TYPE == "beads":**

#### Step 1: Verify Beads Available

```bash
# Check if Beads is initialized
if [ ! -d ".beads" ]; then
  echo "❌ Beads not initialized. Run /es-beads-init first."
  exit 1
fi

# Verify bd command available
if ! command -v bd &> /dev/null; then
  echo "❌ Beads CLI (bd) not found"
  exit 1
fi
```

#### Step 2: Fetch Beads Issue

```bash
# Get issue details
issue_json=$(bd show "$BEADS_ID" --format json)

if [ $? -ne 0 ]; then
  echo "❌ Beads issue $BEADS_ID not found"
  echo "   Available issues: bd list"
  exit 1
fi

# Extract issue fields
title=$(echo "$issue_json" | jq -r '.title')
description=$(echo "$issue_json" | jq -r '.description // ""')
priority=$(echo "$issue_json" | jq -r '.priority // "p2"')
tags=$(echo "$issue_json" | jq -r '.tags // [] | join(", ")')
assigned_agent=$(echo "$issue_json" | jq -r '.assigned_agent // ""')
location=$(echo "$issue_json" | jq -r '.location // ""')
blocked_by=$(echo "$issue_json" | jq -r '.blocked_by // []')

# Check if issue is blocked
if [ "$(echo "$blocked_by" | jq length)" -gt 0 ]; then
  echo "⚠️  Issue $BEADS_ID is blocked by:"
  echo "$blocked_by" | jq -r '.[] | "  - \(.)"'
  echo ""
  echo "Complete blocker issues first, or force continue? (y/n)"
  read -r force_continue
  if [ "$force_continue" != "y" ]; then
    exit 1
  fi
fi
```

#### Step 3: Check Lock Status

```bash
# Check if issue is locked by another agent
locked_by=$(echo "$issue_json" | jq -r '.locked_by // ""')

if [ -n "$locked_by" ] && [ "$locked_by" != "null" ]; then
  echo "⚠️  Issue $BEADS_ID is locked by: $locked_by"
  lock_expires=$(echo "$issue_json" | jq -r '.lock_expires // ""')
  echo "   Lock expires: $lock_expires"
  echo ""
  echo "Force unlock and continue? (y/n)"
  read -r force_unlock
  if [ "$force_unlock" != "y" ]; then
    echo "Aborting. Wait for $locked_by to complete."
    exit 1
  fi
fi
```

#### Step 4: Acquire Lock

```bash
# Lock issue for this work session
bd update "$BEADS_ID" \
  --meta locked_by="es-work-session" \
  --meta locked_at="$(date -Iseconds)" \
  --meta lock_expires="$(date -Iseconds -d '+2 hours')" \
  --meta status="in_progress"

echo "🔒 Acquired lock on $BEADS_ID"
```

#### Step 5: Create TodoWrite from Beads

```bash
# Create TodoWrite task from Beads issue
# This provides real-time progress visibility in Claude Code UI

todo_content="Work on $BEADS_ID: $title"
todo_active_form="Working on $BEADS_ID: $title"

# If description exists, parse into sub-tasks
if [ -n "$description" ]; then
  # Extract task list from description (lines starting with - [ ])
  subtasks=$(echo "$description" | grep -E '^- \[ \]' | sed 's/^- \[ \] //')

  if [ -n "$subtasks" ]; then
    # Create TodoWrite with subtasks
    echo "Creating TodoWrite with subtasks from Beads issue..."
    # Add to TodoWrite
  else
    # Single task
    echo "Creating TodoWrite for Beads issue..."
  fi
fi
```

#### Step 6: Consult Assigned Agent (if applicable)

```bash
# If issue has assigned agent, consult for specialized guidance
if [ -n "$assigned_agent" ] && [ "$assigned_agent" != "null" ]; then
  echo "📋 Issue assigned to: $assigned_agent"
  echo "   Consulting agent for specialized guidance..."

  # Task the assigned agent with the Beads issue
  # Agent provides implementation strategy, patterns, gotchas
  Task "$assigned_agent"("Provide implementation guidance for Beads issue $BEADS_ID:
    Title: $title
    Location: $location
    Tags: $tags
    Description: $description

    Suggest:
    1. Implementation approach
    2. Common patterns for this type of issue
    3. Potential gotchas to avoid
    4. Testing strategy")

  echo "Agent guidance received. Proceeding with work..."
fi
```

#### Step 7: Execute Work

Proceed to Phase 1 (Environment Setup) below with TodoWrite created from Beads.

**After work completes** (in Phase 4):
- Close Beads issue: `bd close "$BEADS_ID"`
- Release lock (automatic on close)
- Show next ready work: `bd ready`
- Unblock dependent issues (automatic)

---

**If INPUT_TYPE == "description":**

#### Step 1: Offer Beads Creation

```bash
echo "Create Beads issue for multi-session tracking? (y/n)"
echo "  y: Create git-versioned Beads issue (resume across sessions)"
echo "  n: Use TodoWrite only (single-session tracking)"
read -r create_beads

if [ "$create_beads" = "y" ]; then
  # Check Beads available
  if [ -d ".beads" ] && command -v bd &> /dev/null; then
    # Create Beads issue
    beads_id=$(bd create --title "$DESCRIPTION" --priority p2 | grep -oE 'bd-[a-z0-9]{4}')
    echo "✅ Created Beads issue: $beads_id"
    BEADS_ID="$beads_id"
    INPUT_TYPE="beads"
    # Proceed with Beads workflow above
  else
    echo "⚠️  Beads not initialized. Run /es-beads-init first."
    echo "   Continuing with TodoWrite only..."
    INPUT_TYPE="description"
  fi
fi
```

If user chose "n" or Beads not available, proceed with TodoWrite-only workflow.

---

### Phase 1: Environment Setup

1. **Update Main Branch**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create Feature Branch and Worktree**

   - Determine appropriate branch name from document
   - Get the root directory of the Git repository:

   ```bash
   git_root=$(git rev-parse --show-toplevel)
   ```

   - Create worktrees directory if it doesn't exist:

   ```bash
   mkdir -p "$git_root/.worktrees"
   ```

   - Add .worktrees to .gitignore if not already there:

   ```bash
   if ! grep -q "^\.worktrees$" "$git_root/.gitignore"; then
     echo ".worktrees" >> "$git_root/.gitignore"
   fi
   ```

   - Create the new worktree with feature branch:

   ```bash
   git worktree add -b feature-branch-name "$git_root/.worktrees/feature-branch-name" main
   ```

   - Change to the new worktree directory:

   ```bash
   cd "$git_root/.worktrees/feature-branch-name"
   ```

3. **Verify Environment**
   - Confirm in correct worktree directory
   - Install dependencies if needed
   - Run initial tests to ensure clean state

### Phase 2: Document Analysis and Planning

1. **Read Input Document**

   - Use Read tool to examine the work document
   - Identify all deliverables and requirements
   - Note any constraints or dependencies
   - Extract success criteria

2. **Create Task Breakdown**

   - Convert requirements into specific tasks
   - Add implementation details for each task
   - Include testing and validation steps
   - Consider edge cases and error handling

3. **Build Todo List**
   - Use TodoWrite to create comprehensive list
   - Set priorities based on dependencies
   - Include all subtasks and checkpoints
   - Add documentation and review tasks

### Phase 3: Systematic Execution

1. **Task Execution Loop**

   ```
   while (tasks remain):
     - Select next task (priority + dependencies)
     - Mark as in_progress
     - Execute task completely
      - Validate with platform-specific agents
     - Mark as completed
     - Update progress
   ```

2. **Platform-Specific Validation**

   After implementing each task, validate with relevant agents:

   - **Task workers-runtime-guardian** - Runtime compatibility check
     - Verify no Node.js APIs (fs, process, Buffer)
     - Ensure env parameter usage (not process.env)
     - Validate Web APIs only

    - **Task platform-specific binding analyzer** - Binding validation
     - Verify bindings referenced in code exist in wrangler.toml
     - Check TypeScript Env interface matches usage
     - Validate binding names follow conventions

   - **Task cloudflare-security-sentinel** - Security check
     - Verify secrets use wrangler secret (not hardcoded)
     - Check CORS configuration if API endpoints
     - Validate input sanitization

   - **Task edge-performance-oracle** - Performance check
     - Verify bundle size stays under target
     - Check for cold start optimization
     - Validate caching strategies

3. **Quality Assurance**

   - Run tests after each task (npm test / wrangler dev)
   - Execute lint and typecheck commands
   - Test locally with wrangler dev
   - Verify no regressions
   - Check against acceptance criteria
   - Document any issues found

3. **Progress Tracking**
   - Regularly update task status
   - Note any blockers or delays
   - Create new tasks for discoveries
   - Maintain work visibility

### Phase 4: Completion and Submission

1. **Final Validation**

   - Verify all tasks completed
   - Run comprehensive test suite
   - Execute final lint and typecheck
   - Check all deliverables present
   - Ensure documentation updated

2. **Close Beads Issue (if applicable)**

   **If INPUT_TYPE == "beads":**

   ```bash
   # Close Beads issue after successful completion
   if [ -n "$BEADS_ID" ]; then
     echo "Closing Beads issue: $BEADS_ID"

     # Add completion metadata
     bd update "$BEADS_ID" \
       --meta completed_at="$(date -Iseconds)" \
       --meta completed_by="es-work-session"

     # Close issue (automatically releases lock and unblocks dependents)
     bd close "$BEADS_ID"

     echo "✅ Closed $BEADS_ID"
     echo ""

     # Show next ready work
     echo "Checking for newly unblocked issues..."
     ready_work=$(bd ready --format json)
     ready_count=$(echo "$ready_work" | jq length)

     if [ "$ready_count" -gt 0 ]; then
       echo "🎉 $ready_count issue(s) now ready to work on:"
       echo "$ready_work" | jq -r '.[] | "  \(.id) [\(.priority)] \(.title)"'
       echo ""

       # Get first ready issue
       next_issue=$(echo "$ready_work" | jq -r '.[0].id')
       echo "Next: /es-work $next_issue"
     else
       echo "No additional ready work. View status:"
       echo "  /es-beads-status"
     fi
   fi
   ```

3. **Prepare for Submission**

   - Stage and commit all changes
   - Write commit messages
   - Push feature branch to remote
   - Create detailed pull request

4. **Create Pull Request**
   ```bash
   git push -u origin feature-branch-name
   gh pr create --title "Feature: [Description]" --body "[Detailed description]"
   ```

   **If Beads issue exists**, include in PR body:
   ```bash
   # Add Beads reference to PR description
   if [ -n "$BEADS_ID" ]; then
     gh pr create --title "Feature: [Description]" --body "$(cat <<EOF
[Detailed description]

## Related Beads Issues
- $BEADS_ID (completed)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
   fi
   ```
