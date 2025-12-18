# Context Triggers - Progressive Disclosure

This file defines when to load additional context based on conversation content.
Agents should load relevant knowledge files when these patterns are detected.

---

## Cloudflare Resource Selection

### Trigger Patterns
- "should I use KV or"
- "KV vs Durable"
- "which storage"
- "rate limit"
- "strong consistency"
- "eventual consistency"

### Load Context
- cloudflare-patterns.md (Resource Selection patterns)
- @durable-objects agent (if DO is relevant)

---

## Runtime Compatibility

### Trigger Patterns
- "process.env"
- "require("
- "Buffer"
- "fs module"
- "Node.js"
- "not working in Workers"

### Load Context
- cloudflare-patterns.md (Runtime Compatibility patterns)
- @runtime-guardian agent

---

## UI Components

### Trigger Patterns
- "Button"
- "shadcn"
- "component"
- "Tailwind"
- "prop"
- "variant"

### Load Context
- Use shadcn MCP server directly
- @ui-validator agent

### MCP Queries
```
shadcn.get_component("ComponentName")
shadcn.list_components()
```

---

## Authentication

### Trigger Patterns
- "auth"
- "login"
- "session"
- "OAuth"
- "passkey"
- "better-auth"

### Load Context
- Use better-auth MCP server
- guidelines.md (Authentication section)

---

## Billing

### Trigger Patterns
- "billing"
- "subscription"
- "payment"
- "Polar"
- "checkout"

### Load Context
- guidelines.md (Billing section)
- Use Polar MCP server (if enabled)

---

## Performance

### Trigger Patterns
- "cold start"
- "bundle size"
- "slow"
- "optimize"
- "performance"
- "latency"

### Load Context
- cloudflare-patterns.md (Edge Optimization patterns)
- @architect agent

---

## Durable Objects Specifically

### Trigger Patterns
- "Durable Object"
- "DO"
- "WebSocket"
- "alarm"
- "state.storage"
- "hibernation"

### Load Context
- @durable-objects agent
- cloudflare-patterns.md (Durable Objects patterns)

---

## Code Review

### Trigger Patterns
- "review"
- "PR"
- "pull request"
- "check this"
- "what's wrong"

### Load Context
- Run es-review.sh (Hard Tools first)
- @reviewer agent

---

## Implementation Notes

For OpenCode integration, add these triggers to opencode.jsonc:

```jsonc
{
  "context_triggers": {
    "rate limit|strong consistency": {
      "load": ["knowledge/cloudflare-patterns.md"],
      "agent": "durable-objects"
    },
    "process\\.env|require\\(|Buffer": {
      "agent": "runtime-guardian"
    },
    "shadcn|Button|variant": {
      "mcp": "shadcn",
      "agent": "ui-validator"
    }
  }
}
```

This enables progressive disclosure - only load relevant context when needed,
reducing token usage and improving response quality.
