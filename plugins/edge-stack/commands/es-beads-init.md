---
description: Initialize Beads issue tracking for multi-session coordination across edge-stack agents
---

# Beads Initialization Command

## Introduction

This command initializes Beads issue tracking for your project, enabling multi-session work coordination across Claude Code conversations. Beads provides git-versioned issue tracking with dependency management, ready-work detection, and agent coordination for the 27 edge-stack specialized agents.

## Prerequisites

- Git repository
- Either:
  - Node.js with npx (for Beads MCP server)
  - OR Rust/Cargo (for Beads CLI: `cargo install beads-cli`)

## Initialization Workflow

### Step 1: Check Beads Availability

First, determine which Beads installation method is available:

```bash
# Check if bd CLI is installed
if command -v bd &> /dev/null; then
  echo "✅ Beads CLI (bd) found"
  BEADS_METHOD="cli"
elif command -v npx &> /dev/null; then
  echo "✅ npx available - will use Beads MCP server"
  BEADS_METHOD="mcp"
else
  echo "❌ Neither bd CLI nor npx found"
  BEADS_METHOD="none"
fi
```

### Step 2: Handle Installation Path

**If Beads CLI available** (`BEADS_METHOD="cli"`):
- Proceed to Step 3 (Initialize Beads)

**If npx available** (`BEADS_METHOD="mcp"`):
- Enable Beads MCP server in edge-stack configuration
- Note: MCP server provides bd-like functionality via npx

**If neither available** (`BEADS_METHOD="none"`):
- Present installation options to user

### Step 3: Present Installation Options (if needed)

If Beads is not available, ask the user:

```
Beads is not installed. How would you like to proceed?

1️⃣  Install Beads CLI (recommended)
   - Requires: Rust and Cargo
   - Command: cargo install beads-cli
   - Installation guide: https://rustup.rs

2️⃣  Use simple context file (no Beads dependency)
   - Git-versioned markdown file for work tracking
   - Manual dependency management
   - No ready-work detection or agent coordination

3️⃣  Skip Beads integration
   - Continue using TodoWrite only
   - Single-session tracking

Choose (1/2/3):
```

**If user chooses 1 (Install Beads CLI):**
```markdown
To install Beads CLI:

1. Install Rust (if not already installed):
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env

2. Install Beads:
   cargo install beads-cli

3. Verify installation:
   bd --version

4. Re-run this command: /es-beads-init
```

**If user chooses 2 (Simple context file):**
- Create `.claude/edge-stack-context.md` with basic structure
- Skip Beads-specific setup
- Document limitations

**If user chooses 3 (Skip):**
- Exit without changes
- Suggest using TodoWrite for single-session work

### Step 4: Initialize Beads Directory

Once Beads is available (CLI or MCP), initialize the `.beads/` directory:

```bash
# Get git root
git_root=$(git rev-parse --show-toplevel)

# Initialize Beads in project root
cd "$git_root"
bd init

# Verify .beads/ directory created
if [ -d ".beads" ]; then
  echo "✅ Created .beads/ directory"
  ls -la .beads/
else
  echo "❌ Failed to create .beads/ directory"
  exit 1
fi
```

**Expected output:**
```
.beads/
  issues.jsonl       # Git-versioned source of truth
  beads.db           # SQLite cache (will be gitignored)
  config.json        # Beads configuration
```

### Step 5: Configure Git

**Add .beads/*.db to .gitignore:**

SQLite cache should be local-only (not versioned):

```bash
# Check if .beads/*.db already in .gitignore
if ! grep -q "^\.beads/\*\.db" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Beads SQLite cache (local-only)" >> .gitignore
  echo ".beads/*.db" >> .gitignore
  echo ".beads/*.db-journal" >> .gitignore
  echo ".beads/*.db-wal" >> .gitignore
  echo "✅ Added .beads/*.db to .gitignore"
else
  echo "✅ .beads/*.db already in .gitignore"
fi
```

**Configure git merge driver:**

Beads uses a custom merge driver to resolve JSONL conflicts:

```bash
# Configure merge driver for .beads/*.jsonl files
git config merge.beads.driver "bd merge-driver %O %A %B %P"
git config merge.beads.name "Beads JSONL merge driver"

echo "✅ Configured git merge driver for Beads"
```

**Create .gitattributes:**

```bash
# Ensure .beads/*.jsonl uses custom merge driver
if [ ! -f .gitattributes ]; then
  touch .gitattributes
fi

if ! grep -q "\.beads/\*\.jsonl.*merge=beads" .gitattributes; then
  echo "" >> .gitattributes
  echo "# Beads JSONL files use custom merge driver" >> .gitattributes
  echo ".beads/*.jsonl merge=beads" >> .gitattributes
  echo "✅ Added Beads merge driver to .gitattributes"
else
  echo "✅ Beads merge driver already in .gitattributes"
fi
```

### Step 6: Create Edge-Stack Beads Configuration

Create or update `.claude/edge-stack.local.md` with Beads settings:

```bash
# Ensure .claude/ directory exists
mkdir -p .claude

# Check if edge-stack.local.md exists
if [ ! -f .claude/edge-stack.local.md ]; then
  # Create new configuration
  cat > .claude/edge-stack.local.md << 'EOF'
---
beads_enabled: true
beads_default_tags: [cloudflare, edge-stack]
beads_agent_coordination: true
beads_auto_sync_github: false
beads_ready_work_threshold: 0
---

# Edge-Stack Beads Configuration

## Beads Integration Settings

### Default Tags
All Beads issues created by edge-stack commands automatically get these tags:
- `cloudflare` - Cloudflare Workers ecosystem
- `edge-stack` - Created by edge-stack plugin

You can add project-specific tags here (e.g., your project name).

### Agent Coordination
When enabled, the 27 edge-stack agents can:
- Assign themselves to Beads issues based on tags
- Lock issues during work to prevent conflicts
- Coordinate via metadata (assigned agent, priority, etc.)

### GitHub Sync
Set `beads_auto_sync_github: true` to enable bidirectional sync with GitHub Issues.
Requires: GitHub CLI (`gh`) authenticated.

### Ready Work Detection
Issues are "ready" when they have ≤ `beads_ready_work_threshold` blocking dependencies.
- `0` = only issues with NO blockers are ready (strict)
- `1` = issues with up to 1 blocker can be ready
- Higher values = more lenient

## Usage

### Create Issues
- From /es-review: Choose "BEADS" option when prompted
- Manually: /es-beads-create "description"
- From GitHub: /es-beads-import <issue-number>

### View Status
- /es-beads-status - See ready work, blockers, progress

### Work on Issues
- /es-work bd-xxxx - Execute a Beads issue (creates TodoWrite)
- Issues auto-close when work completes

### Sync with GitHub (if enabled)
- /es-beads-sync - Bidirectional sync between Beads and GitHub Issues

## Tips

- Use Beads for multi-session work (spans multiple days/conversations)
- Use TodoWrite for single-session work (< 2 hours)
- Use GitHub Issues for public/permanent tracking (external visibility)
EOF
  echo "✅ Created .claude/edge-stack.local.md with Beads settings"
else
  # File exists - append Beads configuration if not present
  if ! grep -q "beads_enabled" .claude/edge-stack.local.md; then
    cat >> .claude/edge-stack.local.md << 'EOF'

---
beads_enabled: true
beads_default_tags: [cloudflare, edge-stack]
beads_agent_coordination: true
beads_auto_sync_github: false
beads_ready_work_threshold: 0
---

# Beads Configuration (added by /es-beads-init)

See .claude/edge-stack.local.md for full Beads settings and usage guide.
EOF
    echo "✅ Updated .claude/edge-stack.local.md with Beads settings"
  else
    echo "✅ Beads settings already in .claude/edge-stack.local.md"
  fi
fi
```

### Step 7: Enable Beads MCP Server (if using MCP)

If using the MCP server approach:

```bash
# Read current .mcp.json
mcp_config="plugins/edge-stack/.mcp.json"

# Enable Beads MCP server
if [ -f "$mcp_config" ]; then
  # Use jq to enable Beads server
  tmp=$(mktemp)
  jq '.mcpServers.beads.enabled = true' "$mcp_config" > "$tmp"
  mv "$tmp" "$mcp_config"
  echo "✅ Enabled Beads MCP server in $mcp_config"
else
  echo "⚠️  MCP config not found at $mcp_config"
fi
```

### Step 8: Verify Installation

Test that Beads is working correctly:

```bash
# Test bd command
echo "Testing Beads installation..."

# List issues (should be empty)
if bd list 2>&1 | grep -q "0 issues" || bd list 2>&1 | grep -q "No issues"; then
  echo "✅ Beads is working correctly"
else
  echo "⚠️  Unexpected output from 'bd list'"
  bd list
fi

# Show help
bd --help | head -10
```

### Step 9: Success Summary

Present final summary to user:

```markdown
🎉 Beads Initialized Successfully!

## What was configured:

✅ Beads directory: .beads/ (git-versioned JSONL + local SQLite)
✅ Git ignore: .beads/*.db (SQLite cache excluded)
✅ Git merge driver: Custom JSONL conflict resolution
✅ Git attributes: .beads/*.jsonl uses merge driver
✅ Edge-stack config: .claude/edge-stack.local.md
✅ Default tags: cloudflare, edge-stack
✅ Agent coordination: Enabled

## Next Steps:

1. **Create your first Beads issue:**
   /es-beads-create "Your first task description"

2. **Run a code review and track findings in Beads:**
   /es-review
   (Choose "BEADS" when prompted)

3. **Check status and ready work:**
   /es-beads-status

4. **Work on a Beads issue:**
   /es-work bd-xxxx

## The 3-Tier System:

📝 **TodoWrite** → Active work in current session
🔗 **Beads** → Multi-session coordination (NEW!)
🐙 **GitHub Issues** → Public/permanent tracking

## Documentation:

Full settings and usage guide: .claude/edge-stack.local.md

Happy tracking! 🚀
```

## Error Handling

### Beads Init Fails

If `bd init` fails:

```bash
Error: Failed to initialize Beads

Possible causes:
1. Not in a git repository
   - Solution: cd to git repo root and retry

2. .beads/ directory already exists
   - Solution: This is ok! Beads is already initialized
   - Run: bd list

3. Permission issues
   - Solution: Check write permissions in current directory

4. bd command not found
   - Solution: Install Beads CLI or use MCP server
   - See installation options above
```

### Git Configuration Fails

If git config fails:

```bash
Error: Failed to configure git merge driver

This is optional but recommended for conflict resolution.
You can continue without it, but may need to manually resolve
.beads/issues.jsonl conflicts when merging branches.

To configure manually later:
  git config merge.beads.driver "bd merge-driver %O %A %B %P"
  echo ".beads/*.jsonl merge=beads" >> .gitattributes
```

### MCP Server Not Available

If npx fails to run Beads MCP server:

```bash
Error: Beads MCP server not available via npx

Possible causes:
1. @beads/mcp-server package doesn't exist yet
   - Solution: Use Beads CLI instead (cargo install beads-cli)

2. No internet connection
   - Solution: Check connection and retry

3. npx not installed
   - Solution: Install Node.js with npx, or use Beads CLI

Fallback: Install Beads CLI
  cargo install beads-cli
```

## Notes

- **Beads is opt-in:** This command only runs when explicitly called or when user chooses Beads in /es-review
- **Git-versioned:** Only `.beads/issues.jsonl` is tracked in git (SQLite cache is local)
- **Multi-machine sync:** Beads syncs via git - pull/push to sync issues across machines
- **Conflict resolution:** Custom merge driver handles JSONL conflicts automatically
- **Agent coordination:** 27 edge-stack agents use Beads metadata to prevent duplicate work
