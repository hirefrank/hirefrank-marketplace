# Semantic Code Search with mgrep

Use mgrep for intent-based code search. It understands what you're looking for semantically, not just pattern matching.

## When to Use mgrep vs grep

| Use Case | Tool | Example |
|----------|------|---------|
| Exact string match | `grep` | `grep "TODO" src/` |
| Regex pattern | `grep` | `grep "function.*async" src/` |
| Find by intent | `mgrep` | `mgrep "error handling logic"` |
| Understand relationships | `mgrep` | `mgrep "what calls the auth service"` |
| Find implementations | `mgrep` | `mgrep "rate limiting implementation"` |

## Usage Patterns

### Basic Search
```bash
# Find where authentication happens
mgrep "authentication flow"

# Find error handling
mgrep "how errors are handled"

# Find API endpoints
mgrep "REST endpoints for users"
```

### With Filters
```bash
# Search only TypeScript files
mgrep "state management" --glob "*.ts"

# Search specific directory
mgrep "database queries" src/db/
```

### OpenCode Agent Mode
```bash
# Run as OpenCode-integrated tool
mgrep --opencode "find rate limiting logic"
```

## Best Practices

1. **Use natural language**: "functions that validate user input" not "validate.*input"
2. **Be specific about intent**: "error handling in API routes" not just "errors"
3. **Fallback to grep**: For exact matches, grep is faster and deterministic

## Token Efficiency

mgrep reduces token usage ~2x compared to grep-based exploration:
- grep returns raw matches requiring AI interpretation
- mgrep returns semantically relevant results pre-filtered

## Installation

```bash
# Via Homebrew
brew install mixedbread-ai/tap/mgrep

# Via npm
npm install -g @mixedbread-ai/mgrep
```

Requires `MIXEDBREAD_API_KEY` environment variable.
