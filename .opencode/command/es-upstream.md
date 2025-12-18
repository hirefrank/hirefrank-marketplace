---
name: es-upstream
description: Check upstream sources for template changes and new patterns
---

# Edge Stack Upstream Tracker

Monitor upstream sources for changes, new patterns, and adoption opportunities.

## Usage

```
/es-upstream              Check all upstream sources
/es-upstream every        Check Every Inc template only
/es-upstream anthropic    Check Anthropic changes only
/es-upstream joelhooks    Check joelhooks/opencode-config
/es-upstream omo          Check oh-my-opencode
```

## Arguments

$SOURCE - Optional specific source to check (every, anthropic, joelhooks, omo)

## Tracked Sources

### 1. Every Inc Compounding Engineering Plugin
- **Repo**: `every-inc/compounding-engineering-plugin`
- **Track**: Agent patterns, command structure, MCP configs
- **Strategy**: Selective adoption (we've diverged significantly)

### 2. Anthropic Claude Code
- **Track**: New capabilities, best practices, hooks system
- **Strategy**: Feature parity where applicable

### 3. joelhooks/opencode-config
- **Track**: Configuration patterns, agent structures
- **Strategy**: Pattern inspiration (not direct adoption)

### 4. oh-my-opencode
- **Track**: Plugin patterns, async workflows
- **Strategy**: Plugin architecture reference

## Output

For each source, shows:
- Last check timestamp
- New commits since last check
- Relevant changes (filtered by keywords)
- Adoption recommendation

## Workflow

This command executes `bin/es-check-upstream.sh` which:

1. Fetches latest from each tracked repository
2. Compares against last recorded state
3. Filters for relevant changes
4. Generates adoption recommendations
5. Updates `.opencode/knowledge/UPSTREAM.md`

## Execute

```bash
./bin/es-check-upstream.sh $SOURCE
```
