# Development Guidelines

Validated best practices for edge-first development with Cloudflare Workers.

---

## Framework Preferences

### UI Framework
**Choice**: Tanstack Start (React 19 + shadcn/ui + Tailwind 4)
**NOT**: Next.js, React standalone, SvelteKit, Remix

### Backend Framework
**Choice**: Hono (lightweight, edge-optimized)
**NOT**: Express, Fastify, Koa, NestJS

### Styling
**Choice**: Tailwind CSS utilities, shadcn/ui components
**NOT**: Custom CSS, SASS, CSS-in-JS

### AI SDK
**Choice**: Vercel AI SDK + Cloudflare AI Agents
**NOT**: LangChain, direct OpenAI/Anthropic SDKs

### Deployment
**Choice**: Workers with static assets
**NOT**: Cloudflare Pages

### Billing
**Choice**: Polar.sh
**NOT**: Stripe, Paddle, Lemon Squeezy

### Authentication
**Choice**: better-auth (in Workers)
**NOT**: Lucia, Auth.js, Passport, Clerk

---

## Cloudflare Architecture Principles

### 1. Workers Are Stateless
All state must be in bindings (KV, R2, D1, Durable Objects).
Never use in-memory state in Workers.

### 2. Edge-First Design
Minimize origin round-trips. Cache at edge.
Use Cache API for ephemeral data, KV for persistent.

### 3. Async Only
No blocking operations. All I/O must use async/await.
CPU time limits (50ms default) require async patterns.

### 4. Web APIs Only
No Node.js APIs (fs, path, process, buffer).
Use fetch, crypto.subtle, TextEncoder, etc.

### 5. Right Resource for Right Job
- KV: Eventually consistent key-value (read-heavy)
- DO: Strongly consistent coordination (writes, WebSockets)
- R2: Large object storage (files)
- D1: Relational data (SQL, joins)

---

## Code Style

### TypeScript Required
All Workers code must be TypeScript with proper types.
Always define Env interface for bindings.

### Error Handling
Use try/catch with appropriate HTTP status codes.
Never expose internal errors to clients.

### Logging
Use console.log/error (appears in wrangler tail).
Never log secrets or PII.

---

## Deployment Checklist

1. [ ] Run `es-validate` - all checks pass
2. [ ] Bundle size < 50KB
3. [ ] No Node.js API usage
4. [ ] All bindings configured in wrangler.toml
5. [ ] Secrets set via `wrangler secret put`
6. [ ] Preview deployment tested

---

## MCP Server Usage

### Always Query Before Implementing
Use context7 to verify patterns against official docs.
Use shadcn MCP to verify component props.

### Never Trust Memory
AI memory can hallucinate props and patterns.
Scripts + MCP provide ground truth.

---
