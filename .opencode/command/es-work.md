---
name: es-work
description: Start a feature development session with isolated worktree and validation
---

# Edge Stack Work Session

Create an isolated development environment and start a feature development session.

## Usage

```
/es-work <plan-file>       Start work from a plan document
/es-work --branch <name>   Create new feature branch
/es-work --continue        Resume work in current worktree
/es-work --cleanup         Remove all worktrees
/es-work --list            List active worktrees
```

## Arguments

$PLAN_FILE - Path to a plan document (markdown, specification)
$BRANCH_NAME - Name for the feature branch (used with --branch)

## Workflow

This command executes `bin/es-work.sh` which:

1. **Updates main branch** and creates feature branch
2. **Creates isolated git worktree** in `.worktrees/`
3. **Copies environment files** (.env, .dev.vars)
4. **Runs initial validation** via Hard Tools
5. **Installs dependencies** if needed
6. **Prepares context** for @architect agent
7. **Launches OpenCode** with work context

## Examples

```
/es-work docs/plans/auth-feature.md
```
Starts work session from a plan document.

```
/es-work --branch add-user-dashboard
```
Creates new feature branch and worktree.

```
/es-work --cleanup
```
Removes all worktrees when done.

## Execute

```bash
./bin/es-work.sh $ARGUMENTS
```
