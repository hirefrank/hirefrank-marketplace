---
name: es-worker
description: Scaffold a new Cloudflare Worker or Durable Object
---

# Edge Stack Worker Generator

Scaffold a new Cloudflare Worker or Durable Object with best practices built-in.

## Usage

```
/es-worker <name>              Create a basic Worker
/es-worker <name> --do         Create a Durable Object
/es-worker <name> --api        Create an API Worker with Hono
/es-worker <name> --scheduled  Create a scheduled Worker (cron)
```

## Arguments

$NAME - Name for the Worker (kebab-case recommended)

## Templates

### Basic Worker
- Fetch handler with typed Env
- Error handling patterns
- Cache API integration

### Durable Object
- State management patterns
- WebSocket support (optional)
- Alarm scheduling
- Hibernation support

### API Worker (Hono)
- Hono router setup
- Middleware patterns
- OpenAPI documentation
- Error handling

### Scheduled Worker
- Cron trigger handler
- Batch processing patterns
- Error recovery

## Generated Files

```
src/workers/<name>/
├── index.ts           # Main entry point
├── types.ts           # TypeScript interfaces
└── README.md          # Usage documentation
```

Also updates:
- `wrangler.toml` - Adds Worker configuration
- `src/env.d.ts` - Updates Env interface

## Execute

```bash
./bin/es-worker.sh $NAME $ARGUMENTS
```
