# Cloudflare Patterns Knowledge Base

This file contains validated patterns for Cloudflare Workers development.
Patterns are validated against official documentation before being added.

---

## Pattern: Use Durable Objects for Rate Limiting

**Category**: Resource Selection
**Confidence**: High (validated via Cloudflare docs)
**Source**: Official Cloudflare documentation

### Problem
Using KV for rate limiting causes race conditions due to eventual consistency.
Two concurrent requests can both read the same count and both proceed.

### Solution
Use Durable Objects which provide single-threaded execution and atomic operations.

### Example
```typescript
// WRONG - KV is eventually consistent
const count = await env.KV.get(`ratelimit:${ip}`);
if (Number(count) < 10) {
  await env.KV.put(`ratelimit:${ip}`, String(Number(count) + 1));
}
// Race condition: two requests can both see count=9

// CORRECT - Durable Object is atomic
const id = env.RATE_LIMITER.idFromName(ip);
const stub = env.RATE_LIMITER.get(id);
const allowed = await stub.fetch(request);
// Single-threaded: no race conditions
```

### Validation
MCP query: `context7 search "cloudflare rate limiting durable objects"`

---

## Pattern: Always Set TTL on KV Writes

**Category**: Resource Selection
**Confidence**: High (validated via Cloudflare docs)
**Source**: Official Cloudflare best practices

### Problem
KV entries without TTL persist indefinitely, causing storage bloat and stale data.

### Solution
Always specify `expirationTtl` when writing to KV.

### Example
```typescript
// WRONG - No expiration
await env.KV.put('session:123', sessionData);

// CORRECT - With TTL
await env.KV.put('session:123', sessionData, {
  expirationTtl: 3600 // 1 hour
});
```

### Validation
MCP query: `context7 search "cloudflare kv expiration ttl"`

---

## Pattern: Access Secrets via env Parameter

**Category**: Runtime Compatibility
**Confidence**: High (validated via Cloudflare docs)
**Source**: Workers runtime documentation

### Problem
`process.env` does not exist in Workers runtime. Using it causes ReferenceError.

### Solution
Access all environment variables and secrets via the `env` parameter.

### Example
```typescript
// WRONG - process.env doesn't exist
const apiKey = process.env.API_KEY;

// CORRECT - Use env parameter
export default {
  async fetch(request: Request, env: Env) {
    const apiKey = env.API_KEY;
  }
}
```

### Validation
MCP query: `context7 search "cloudflare workers environment variables secrets"`

---

## Pattern: Use Uint8Array Instead of Buffer

**Category**: Runtime Compatibility
**Confidence**: High (validated via Cloudflare docs)
**Source**: Workers runtime documentation

### Problem
`Buffer` is a Node.js API that doesn't exist in Workers. Using it causes ReferenceError.

### Solution
Use Web API alternatives: `Uint8Array`, `ArrayBuffer`, `TextEncoder`/`TextDecoder`.

### Example
```typescript
// WRONG - Node.js Buffer
const buf = Buffer.from(data);
const str = buf.toString('base64');

// CORRECT - Web APIs
const encoder = new TextEncoder();
const bytes = encoder.encode(data);
const str = btoa(String.fromCharCode(...bytes));
```

### Validation
MCP query: `context7 search "cloudflare workers binary data uint8array"`

---

## Pattern: Use Service Bindings for Worker-to-Worker

**Category**: Edge Optimization
**Confidence**: High (validated via Cloudflare docs)
**Source**: Official Cloudflare architecture guide

### Problem
Calling other Workers via HTTP (public URLs) incurs DNS lookup, TLS handshake,
and routes through public internet. Slow and insecure.

### Solution
Use Service Bindings for direct, fast, secure Worker-to-Worker communication.

### Example
```typescript
// WRONG - HTTP call
const response = await fetch('https://api.workers.dev/endpoint');

// CORRECT - Service Binding
const response = await env.API_SERVICE.fetch(request);
// Benefits: No DNS, no TLS overhead, internal routing
```

### Validation
MCP query: `context7 search "cloudflare service bindings worker to worker"`

---

## Pattern: Bundle Size < 50KB for Fast Cold Starts

**Category**: Edge Optimization
**Confidence**: High (validated via Cloudflare performance data)
**Source**: Cold start benchmarks

### Problem
Large bundles cause slow cold starts. Workers have ~5ms cold start baseline,
but large bundles can push this to 200ms+.

### Solution
Keep bundle size under 50KB. Avoid heavy dependencies (lodash, moment, axios).

### Example
```typescript
// WRONG - Heavy imports
import _ from 'lodash';
import moment from 'moment';

// CORRECT - Light alternatives
const values = Object.values(obj);  // Instead of _.values
const date = new Date().toISOString();  // Instead of moment
```

### Validation
Measure with: `npx wrangler deploy --dry-run` and check bundle size

---
