# Edge Stack - OpenCode Configuration

Migrated from Claude Code plugin architecture to script-native OpenCode.
Optimized for Claude 4.5 Opus with token-efficient "Hard Tools".

## Architecture Overview

```
.opencode/
├── agent/              # AI personas (consolidated from 27 agents)
│   ├── architect.md    # Senior Cloudflare Architect
│   ├── reviewer.md     # Code Review Orchestrator
│   ├── cloudflare/     # Cloudflare specialists
│   │   ├── binding-analyzer.md
│   │   ├── durable-objects.md
│   │   └── runtime-guardian.md
│   └── workflow/
│       └── feedback-codifier.md
├── tool/               # Hard Tools (deterministic scripts)
│   ├── validate-runtime.js    # Workers runtime validator
│   ├── analyze-bindings.js    # wrangler.toml parser
│   ├── validate-ui.js         # shadcn prop validator
│   └── codify-feedback.js     # Learning engine
├── knowledge/          # Progressive disclosure context
│   ├── cloudflare-patterns.md # Validated patterns
│   ├── guidelines.md          # Development standards
│   └── context-triggers.md    # When to load context
└── README.md           # This file

bin/                    # CLI workflow scripts
├── es-review.sh        # Code review workflow
├── es-worker.sh        # Worker scaffolding
└── es-validate.sh      # Pre-deployment checks

opencode.jsonc          # Main configuration (MCP, agents, permissions)
```

## Key Concepts

### Hard Tools vs Soft Instructions

**Before (Claude Code)**: AI reads markdown instructions and interprets them.
- Token cost: 10k-50k tokens per workflow
- Reliability: Can miss patterns, hallucinate

**After (OpenCode)**: Scripts execute locally, AI analyzes results.
- Token cost: ~2k tokens per workflow (98% reduction)
- Reliability: Scripts are deterministic, never miss

### Progressive Disclosure

Instead of loading all 27 agents at startup, context is loaded dynamically:
- Mention "rate limiting" → Load Durable Objects knowledge
- Mention "shadcn" → Query shadcn MCP server
- Code review → Run validation scripts first

### MCP Server Configuration

Heavy servers use `defer_loading` to prevent context overload:
```jsonc
"playwright": {
  "defer_loading": true  // Only load when testing
}
```

## Workflow Commands

### Code Review
```bash
./bin/es-review.sh 123     # Review PR #123
./bin/es-review.sh --local # Review local changes
```

### Scaffold Worker
```bash
./bin/es-worker.sh api           # Create API worker
./bin/es-worker.sh --do Counter  # Create Durable Object
```

### Pre-deployment Validation
```bash
./bin/es-validate.sh           # Run all checks
./bin/es-validate.sh --strict  # Fail on warnings
```

## Agent Usage

In OpenCode, invoke agents with `@agent_name`:

```
@architect How should I structure the API?
@reviewer Review this PR
@runtime-guardian Check this file for Node.js APIs
```

## Learning Engine

The feedback codifier tool validates patterns before storing:

```bash
# Add a validated pattern
node .opencode/tool/codify-feedback.js \
  --pattern "Use DO for rate limiting" \
  --category resource

# List patterns
node .opencode/tool/codify-feedback.js --list

# Validate before codifying
node .opencode/tool/codify-feedback.js \
  --validate "Use KV for rate limiting"
# → REJECTED: Use Durable Objects instead
```

## Migration from Claude Code

| Claude Code | OpenCode |
|-------------|----------|
| `/es-review 123` | `./bin/es-review.sh 123` |
| `/es-worker api` | `./bin/es-worker.sh api` |
| `/es-validate` | `./bin/es-validate.sh` |
| 27 markdown agents | 6 consolidated personas |
| 14 SKILL.md files | 4 executable scripts |
| Markdown orchestration | Shell + scripts |

## Framework Preferences

All code follows these standards:
- **UI**: Tanstack Start + shadcn/ui + Tailwind 4
- **Backend**: Hono (not Express)
- **AI**: Vercel AI SDK + Cloudflare AI Agents
- **Auth**: better-auth
- **Billing**: Polar.sh
- **Deploy**: Workers with static assets (not Pages)

See `knowledge/guidelines.md` for full details.
