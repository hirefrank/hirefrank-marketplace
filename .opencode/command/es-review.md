---
name: es-review
description: Run comprehensive code review with Hard Tools validation and AI analysis
---

# Edge Stack Code Review

Run a comprehensive code review using the "Hard Tools first" methodology.

## Usage

```
/es-review [PR_NUMBER]     Review a specific PR
/es-review                  Review the latest PR
/es-review --local         Review current branch changes
```

## Arguments

$PR_NUMBER - Optional PR number to review. If not provided, reviews the latest PR.

## Workflow

This command executes `bin/es-review.sh` which:

1. **Creates isolated git worktree** for the PR (prevents contamination)
2. **Copies .env file** to worktree (needed for Workers dev)
3. **Runs Hard Tools** (deterministic validation):
   - `validate-runtime.js` - Catches Node.js API violations
   - `analyze-bindings.js` - Validates wrangler.toml bindings
   - `validate-ui.js` - Checks shadcn/ui prop usage
4. **Prepares context** for AI analysis with validation results
5. **Launches @reviewer agent** with confidence scoring

## Example

```
/es-review 42
```

Reviews PR #42 with full validation pipeline.

## Execute

```bash
./bin/es-review.sh $PR_NUMBER
```
