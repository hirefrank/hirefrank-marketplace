# Task Management with beads

beads is a git-backed task tracker designed for AI agents. Use it for persistent, cross-session task memory.

## When to Use Each Tool

| Tool | When | Example |
|------|------|---------|
| **TodoWrite** | Current session tasks | "Fix these 3 type errors" |
| **beads** | Multi-session work | "Migration spanning multiple conversations" |
| **GitHub Issues** | Team/external | "Bug report from user" |

## Core Commands

```bash
# See what's ready to work on (unblocked tasks)
bd ready

# Add a new task
bd add "Implement rate limiting for API"

# Add with dependency
bd add "Write tests for rate limiter" --dep bd-a1b2

# Mark task complete
bd done bd-a1b2

# List all tasks
bd list

# Show task details
bd show bd-a1b2
```

## Workflow Pattern

### Session Start
```bash
# Check what's pending from previous sessions
bd ready
```

### During Session
- Use TodoWrite for real-time progress visibility
- Work on tasks from `bd ready`

### Session End
```bash
# Mark completed work
bd done bd-a1b2

# Create tasks for next session
bd add "Continue implementing feature X"
bd add "Review PR feedback" --dep bd-a1b2
```

## Task Hierarchy

beads supports epics, tasks, and sub-tasks:

```bash
# Epic (high-level goal)
bd add "Migrate to OpenCode architecture"  # → bd-a3f8

# Task (specific work item)
bd add "Migrate agents" --parent bd-a3f8   # → bd-a3f8.1

# Sub-task
bd add "Consolidate architect agents" --parent bd-a3f8.1  # → bd-a3f8.1.1
```

## Dependencies

```bash
# Task B depends on Task A
bd dep add bd-b2c3 bd-a1b2

# bd-b2c3 won't appear in `bd ready` until bd-a1b2 is done
```

## Best Practices

1. **Always start sessions with `bd ready`** - shows unblocked work
2. **Always end sessions with `bd done`** - maintains accurate state
3. **Use dependencies** - prevents working on blocked tasks
4. **Keep tasks atomic** - one clear deliverable per task
5. **Use TodoWrite in parallel** - for user visibility during session

## Installation

```bash
# Install beads CLI
cargo install beads

# Initialize in repo
bd init
```

Creates `.beads/` directory (add to git).

## Integration with GitHub Issues

For user-facing work, create GitHub Issue AND beads task:

```bash
# Create linked task
bd add "Fix login bug (see #123)" --label bug
```

beads = agent memory, GitHub Issues = team communication.
