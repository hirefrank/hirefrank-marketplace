# Edge Stack Development Guidelines

This file defines the rules and conventions for AI agents working on this project.

---

## Project Overview

**Edge Stack** is a Cloudflare Workers-first development framework optimized for:
- Edge-first architecture (Workers, KV, R2, D1, Durable Objects)
- Modern React stack (Tanstack Start, shadcn/ui, Tailwind 4)
- Token-efficient AI workflows ("Hard Tools" over "Soft Instructions")

---

## Framework Preferences (STRICT)

### UI Framework
- **USE**: Tanstack Start (React 19) with Server Functions
- **NOT**: Next.js, Remix, plain React, Vue, Svelte

### Component Library
- **USE**: shadcn/ui (Radix UI primitives + Tailwind)
- **NOT**: Material UI, Chakra, Ant Design, custom components

### Styling
- **USE**: Tailwind CSS utilities, cn() helper
- **NOT**: CSS modules, styled-components, SASS, custom CSS files

### Backend
- **USE**: Hono (lightweight, edge-optimized)
- **NOT**: Express, Fastify, Koa, NestJS

### AI Integration
- **USE**: Vercel AI SDK + Cloudflare AI Gateway
- **NOT**: LangChain, direct OpenAI/Anthropic SDKs

### Authentication
- **USE**: better-auth (D1 compatible)
- **NOT**: Lucia, Auth.js, Passport, Clerk, Supabase Auth

### Billing
- **USE**: Polar.sh
- **NOT**: Stripe direct, Paddle, Lemon Squeezy

### Deployment
- **USE**: Cloudflare Workers with static assets
- **NOT**: Cloudflare Pages, Vercel, Netlify

---

## Cloudflare Workers Rules

### 1. Workers Are Stateless
```typescript
// ❌ FORBIDDEN: In-memory state
let cache = new Map(); // Dies between requests

// ✅ REQUIRED: State in bindings
export default {
  async fetch(request: Request, env: Env) {
    const value = await env.KV.get("key");
  }
}
```

### 2. Use env Parameter, Not process.env
```typescript
// ❌ FORBIDDEN
const apiKey = process.env.API_KEY;

// ✅ REQUIRED
export default {
  async fetch(request: Request, env: Env) {
    const apiKey = env.API_KEY;
  }
}
```

### 3. Web APIs Only (No Node.js)
```typescript
// ❌ FORBIDDEN: Node.js APIs
import fs from 'fs';
import { Buffer } from 'buffer';
const path = require('path');

// ✅ REQUIRED: Web APIs
const encoder = new TextEncoder();
const hash = await crypto.subtle.digest('SHA-256', data);
const response = await fetch(url);
```

### 4. Right Resource for Right Job

| Use Case | Resource | Reason |
|----------|----------|--------|
| Read-heavy cache | KV | Eventually consistent, fast reads |
| User sessions | KV | Simple key-value, TTL support |
| Rate limiting | Durable Objects | Strong consistency required |
| WebSockets | Durable Objects | Stateful connections |
| File storage | R2 | Large objects, S3-compatible |
| Relational data | D1 | SQL queries, joins |
| Coordination | Durable Objects | Single-threaded consistency |

### 5. Always Define Env Interface
```typescript
// src/env.d.ts
interface Env {
  // KV Namespaces
  CACHE: KVNamespace;

  // R2 Buckets
  STORAGE: R2Bucket;

  // D1 Databases
  DB: D1Database;

  // Durable Objects
  RATE_LIMITER: DurableObjectNamespace;

  // Secrets (via wrangler secret)
  API_KEY: string;
}
```

---

## Design Anti-Patterns (FORBIDDEN)

### Typography
- ❌ Inter font (80%+ of websites use it)
- ❌ Roboto font
- ✅ Space Grotesk, Archivo Black, JetBrains Mono

### Colors
- ❌ Purple gradients (#8B5CF6 range)
- ❌ Default Tailwind gray palette
- ✅ Custom brand colors with semantic naming

### Animations
- ❌ No hover states on interactive elements
- ❌ Static buttons and cards
- ✅ transition-all, hover:scale-105, micro-interactions

### Components
- ❌ Default shadcn/ui props only
- ❌ className="" with no customization
- ✅ Deep customization via cn() utility

See `.opencode/knowledge/design-anti-patterns.md` for complete patterns.

---

## Code Style

### TypeScript Required
All code must be TypeScript with strict mode enabled.

### Conventional Commits
```
<type>(<scope>): <description>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Error Handling
```typescript
// Always use try/catch with appropriate HTTP status
try {
  const result = await operation();
  return new Response(JSON.stringify(result), { status: 200 });
} catch (error) {
  console.error('Operation failed:', error);
  return new Response('Internal error', { status: 500 });
}
```

### Secrets Management
```bash
# ❌ FORBIDDEN: Hardcoded secrets
const API_KEY = "sk-live-xxx";

# ✅ REQUIRED: Wrangler secrets
wrangler secret put API_KEY
```

---

## Validation Before Commit

Always run before committing:

1. **Hard Tools Validation**
   ```bash
   ./bin/es-validate.sh
   ```

2. **Type Check**
   ```bash
   pnpm typecheck
   ```

3. **Lint**
   ```bash
   pnpm lint
   ```

4. **Bundle Size**
   - Target: < 50KB
   - Check: `du -h dist/*.js`

---

## MCP Server Usage

### Always Query Before Implementing

Use MCP servers for ground truth:

```typescript
// shadcn/ui components
shadcn.get_component("Button") // Get real props, not guessed

// Framework docs
context7.resolve("cloudflare workers kv") // Get current docs

// Auth patterns
better-auth.getProviderSetup("github") // Get real setup
```

### Never Trust AI Memory
AI can hallucinate component props and API patterns.
Hard Tools and MCP servers provide ground truth.

---

## Quick Reference

| Task | Command |
|------|---------|
| Code review | `/es-review` |
| Start work | `/es-work` |
| Validate | `/es-validate` |
| New worker | `/es-worker` |
| Release | `/es-release` |
| Check upstream | `/es-upstream` |

| Agent | Purpose |
|-------|---------|
| @architect | High-level design decisions |
| @reviewer | Code review with confidence scoring |
| @runtime-guardian | Workers runtime compatibility |
| @durable-objects | DO patterns and state management |

---

## File Locations

```
.opencode/
├── agent/           # AI agent definitions
├── command/         # Slash commands
├── tool/            # Hard Tools (JS validators)
├── knowledge/       # Context and patterns
└── opencode.jsonc   # Main configuration

bin/                 # Workflow shell scripts
```
