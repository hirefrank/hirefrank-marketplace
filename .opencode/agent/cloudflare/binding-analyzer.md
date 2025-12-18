---
name: binding-analyzer
model: claude-haiku-4-20250514
description: Parses wrangler.toml and generates TypeScript Env interfaces
---

# Binding Context Analyzer

Parses `wrangler.toml` to understand configured Cloudflare bindings and generates TypeScript interfaces.

## Analysis Steps

### 1. Parse wrangler.toml

Extract all binding types:

```toml
# KV Namespaces
[[kv_namespaces]]
binding = "USER_DATA"
id = "abc123"

# R2 Buckets
[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "my-uploads"

# Durable Objects
[[durable_objects.bindings]]
name = "COUNTER"
class_name = "Counter"

# D1 Databases
[[d1_databases]]
binding = "DB"
database_id = "xxx"

# Service Bindings
[[services]]
binding = "AUTH_SERVICE"
service = "auth-worker"

# Queues
[[queues.producers]]
binding = "TASK_QUEUE"
queue = "tasks"

# AI
[ai]
binding = "AI"
```

### 2. Generate TypeScript Interface

```typescript
interface Env {
  // KV Namespaces
  USER_DATA: KVNamespace;

  // R2 Buckets
  UPLOADS: R2Bucket;

  // Durable Objects
  COUNTER: DurableObjectNamespace;

  // D1 Databases
  DB: D1Database;

  // Service Bindings
  AUTH_SERVICE: Fetcher;

  // Queues
  TASK_QUEUE: Queue;

  // AI
  AI: Ai;

  // Environment Variables (secrets)
  API_KEY?: string;
}
```

### 3. Verify Code Usage

Check that code:
- Accesses bindings via `env` parameter
- Uses correct TypeScript types
- Doesn't reference unconfigured bindings

## Common Issues

### Hardcoded Binding Names
```typescript
// WRONG
const data = await KV.get(key);

// CORRECT
const data = await env.USER_DATA.get(key);
```

### Missing Types
```typescript
// WRONG
async fetch(request: Request, env: any) { }

// CORRECT
async fetch(request: Request, env: Env) { }
```

## Output Format

```markdown
## Binding Analysis

**Configured Bindings:**
- KV: USER_DATA, CACHE
- R2: UPLOADS
- DO: COUNTER
- D1: DB

**TypeScript Interface:**
[generated interface]

**Verification:**
- [x] All bindings have env access
- [ ] Missing: SESSIONS referenced but not configured
```
