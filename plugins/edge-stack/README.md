# Edge Stack Plugin

**Complete full-stack development toolkit optimized for edge computing.**

Build modern web applications with **Tanstack Start** (React), Cloudflare Workers, Polar.sh billing, better-auth authentication, and shadcn/ui design system. Features AI-powered development assistance, autonomous validation, and expert guidance that gets smarter with every use.

> **Installation**: See the [marketplace README](../../README.md) for installation instructions.

**Philosophy**: Self-improving through feedback codification, multi-agent parallel analysis, and structured workflow orchestration.

**Architecture**: Inspired by [Every's Compounding Engineering Plugin](https://github.com/EveryInc/every-marketplace/tree/main/plugins/compounding-engineering) by Kieran Klaassen and [Cloudflare's VibeSDK](https://github.com/cloudflare/vibesdk) AI tuning techniques. Adapted for edge-first full-stack development with persona-based constraints and self-improving workflows.

## Overview

This plugin transforms Claude Code into a complete edge-first full-stack development platform through:
- **27 specialized agents** ([browse all](agents/)) - 12 Cloudflare + 5 Tanstack + 6 Integration + 3 Workflow + 1 Research, all with MCP integration
- **14 autonomous SKILLs** ([browse all](skills/)) - 7 Cloudflare + 4 Frontend Design + 2 Security + 1 Architecture
- **26 workflow commands** ([browse all](commands/)) - Setup wizards, migration tools, test generation, community tools, and automation
- **Self-improvement** through feedback codification
- **Multi-phase parallel execution**
- **Real-time account context** via MCP servers (optional but recommended)
- **Cloudflare-specific expertise** baked in
- **Distinctive frontend design** preventing generic "AI aesthetics"

## 🚀 MCP Server Integration (Automatically Bundled)

**NEW**: MCP servers are now bundled with the plugin! When you install this plugin, 9 MCP servers are automatically configured (6 active by default):

**Active by default**:
- **shadcn/ui MCP** (`npx shadcn@latest mcp`) - Component documentation for Tanstack Start projects
- **better-auth MCP** (`https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp`) - Authentication patterns and OAuth provider setup
- **Playwright MCP** (`npx @playwright/mcp@latest`) - Official Microsoft browser automation for E2E test generation
- **Package Registry MCP** (`npx -y package-registry-mcp`) - Search NPM, Cargo, PyPI, and NuGet for up-to-date package information
- **Tailwind CSS MCP** (`npx -y tailwindcss-mcp-server`) - Tailwind utilities, CSS-to-Tailwind conversion, and component templates
- **Context7 MCP** (`npx -y @context7/mcp`) - Instant documentation lookup for 100+ frameworks including Cloudflare (Workers, KV, R2, D1), TanStack Router, React, Next.js, Vue, Django, Laravel

**Disabled by default** (available in `.mcp.json` if needed):
- **Cloudflare MCP** (`https://docs.mcp.cloudflare.com/mcp`) - Disabled (documentation covered by Context7)
- **TanStack Router MCP** (`https://gitmcp.io/TanStack/router`) - Disabled (documentation covered by Context7)
- **Polar MCP** (`https://mcp.polar.sh/mcp/polar-mcp`) - Disabled (requires authentication - enable when needed)

**No manual configuration needed!** Just install the plugin and the 6 core MCP servers work immediately.

### What MCP Provides

**Without MCP**: Agents use static knowledge
- "Consider adding a KV namespace"
- "Install @tanstack/react-router package"
- "Button component probably has these props..."
- "Use bg-blue-500 for blue background"
- "Check the React documentation for hooks..."

**With MCP**: Agents use your real account and validated docs
- "You already have a CACHE KV namespace (ID: abc123). Reuse it?"
- "Package @tanstack/react-router@1.75.2 is available (published 2 days ago, 500K weekly downloads)"
- "shadcn/ui Button props (validated): `variant`, `size`, `asChild`, `className`"
- "Tailwind utility: `bg-blue-500` → Use `bg-sky-500` for better accessibility (WCAG AA compliant)"
- "React 19 useOptimistic hook documentation (via Context7): handles optimistic UI updates..."

**Benefits**:
- ✅ **Accurate documentation** (always latest from Cloudflare, shadcn/ui, TanStack, React, and 100+ frameworks via Context7)
- ✅ **No hallucinations** (component props validated from official sources)
- ✅ **Current package data** (NPM, PyPI, Cargo, NuGet with version info and weekly downloads)
- ✅ **Browser automation** (Playwright for E2E testing and screenshot capture)
- ✅ **Type-safe components** (shadcn/ui props, Tailwind utilities, better-auth patterns)

### MCP Setup (Automatic)

The plugin includes a `.mcp.json` file that automatically configures these servers:

```json
{
  "mcpServers": {
    "cloudflare-docs": {
      "type": "http",
      "url": "https://docs.mcp.cloudflare.com/mcp",
      "enabled": true
    },
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"],
      "enabled": true
    },
    "better-auth": {
      "type": "http",
      "url": "https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp",
      "enabled": true
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "enabled": true
    },
    "package-registry": {
      "command": "npx",
      "args": ["-y", "package-registry-mcp"],
      "enabled": true
    },
    "tanstack-router": {
      "type": "sse",
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://gitmcp.io/TanStack/router"],
      "enabled": true
    },
    "tailwindcss": {
      "command": "npx",
      "args": ["-y", "tailwindcss-mcp-server"],
      "enabled": true
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp"],
      "type": "stdio",
      "enabled": true
    },
    "polar": {
      "type": "http",
      "url": "https://mcp.polar.sh/mcp/polar-mcp",
      "enabled": false
    }
  }
}
```

**Verification**: Check that MCP servers are active:
```bash
# In Claude Code, run:
/mcp

# You should see:
# ✓ cloudflare-docs (active)
# ✓ shadcn (active)
# ✓ better-auth (active)
# ✓ playwright (active)
# ✓ package-registry (active)
# ✓ tanstack-router (active)
# ✓ tailwindcss (active)
# ✓ context7 (active)
# ⚠ polar (disabled - requires authentication)
```

**Note**: The Polar MCP is disabled by default because it requires authentication with your Polar.sh account. Enable it when you need billing features:

1. **Enable Polar MCP**: Run `/mcp` and authenticate with Polar.sh
2. **Or enable in config**: Edit `.mcp.json` and set `polar.enabled: true`
3. **Use billing features**: Run `/es-billing-setup` for guided integration

**MCP Server Features**:

**Framework Documentation** - `context7` MCP provides:
- Instant documentation lookup for 100+ frameworks and libraries
- Tools: `resolve-library-id`, `get-library-docs`
- Supports: React, TanStack Router, Next.js, Vue, Svelte, Angular, Django, Laravel, FastAPI, Express, and many more
- Always up-to-date documentation from official sources
- Perfect for cross-framework development and migration projects

**Frontend Design** - `shadcn-ui` MCP provides:
- `frontend-design-specialist` agent - Validates component customizations
- `shadcn-ui-architect` agent - Prevents prop hallucination
- `/es-component` command - Scaffolds components with correct props
- `/es-design-review` command - Validates component usage

**Authentication** - `better-auth` MCP provides:
- Complete authentication setup guidance
- Provider configuration (OAuth, passkeys, magic links)
- Session management patterns
- Security best practices for Cloudflare Workers
- Integration with Tanstack Start and Workers

**Billing** - `polar` MCP provides (optional, requires authentication):
- Product and subscription setup
- Webhook handling for payment events
- Customer management integration
- Cloudflare Workers billing patterns
- **Default billing solution** for all new projects
- **Enable when needed**: The `/es-billing-setup` command will prompt you to authenticate

**Troubleshooting**: If MCP servers don't appear:
1. Ensure plugin is installed: `/plugin list`
2. Restart Claude Code
3. Check `.mcp.json` is in plugin directory
4. Verify internet connectivity (MCP servers are HTTP-based)
5. **For Polar authentication errors**: This is expected - Polar MCP requires authentication. Enable it via `/mcp` when you need billing features.

## Installation

```bash
# Add the marketplace
/plugin marketplace add hirefrank/hirefrank-marketplace

# Install this plugin
/plugin install edge-stack

# Restart Claude Code to activate
```

## Code Quality Validation

This plugin includes comprehensive validation to ensure high-quality Cloudflare code:

### `/validate` Command

Run validation checks anytime before committing:

```bash
/validate
```

**What it validates**:
- ✅ Build verification (if build script exists)
- ✅ Linting with warning threshold (≤5 warnings allowed)
- ✅ TypeScript checks (zero errors required)
- ✅ wrangler.toml syntax and validity
- ✅ compatibility_date is 2025-09-15+
- ✅ Bundle size analysis
- ✅ Remote bindings configuration

### Pre-commit Hook (Automatic)

Automatic validation runs when you commit code:

```bash
git commit  # Validation runs automatically
```

**Quality Standards**:
- **0 errors** - All errors must be fixed (zero tolerance)
- **≤5 warnings** - More than 5 warnings must be addressed
- **Fail-fast** - Stops on first error to save time

**Exit Codes**:
- **0**: All checks passed ✅
- **1**: Validation failed ❌ (fix issues before committing)

This prevents sloppy code and ensures consistent quality across all commits.

## Commands

All 25 commands are organized by functional area. [Browse all commands →](commands/)

### Workflow & Planning (6)
- **[`/es-review`](commands/es-review.md)** - Multi-phase code review with parallel Cloudflare-focused agents
- **[`/es-work`](commands/es-work.md)** - Execute work plans in isolated Git worktrees with validation
- **[`/es-plan`](commands/es-plan.md)** - Create GitHub issues from feature descriptions (alias: `/es-issue`)
- **[`/es-triage`](commands/es-triage.md)** - Process code review findings systematically
- **[`/es-resolve-parallel`](commands/es-resolve-parallel.md)** - Execute multiple todos and GitHub issues concurrently
- **[`/generate_command`](commands/generate_command.md)** - Meta-command for creating custom commands

### Cloudflare Workers (5)
- **[`/es-worker`](commands/es-worker.md)** - Generate Workers with bindings, validation, and deployment
- **[`/es-deploy`](commands/es-deploy.md)** - Pre-flight validation + wrangler deploy
- **[`/es-migrate`](commands/es-migrate.md)** - Migrate from other platforms to Cloudflare Workers
- **[`/es-validate`](commands/es-validate.md)** - Run comprehensive code quality checks
- **[`/es-verify-output`](commands/es-verify-output.md)** - Verify AI-generated code with confidence scoring

### Tanstack Start (4)
- **[`/es-tanstack-migrate`](commands/es-tanstack-migrate.md)** - Migrate React apps to Tanstack Start
- **[`/es-tanstack-route`](commands/es-tanstack-route.md)** - Create type-safe TanStack Router routes
- **[`/es-tanstack-server-fn`](commands/es-tanstack-server-fn.md)** - Generate React Server Functions
- **[`/es-tanstack-component`](commands/es-tanstack-component.md)** - Scaffold shadcn/ui components with distinctive design

### Frontend Design (3)
- **[`/es-design-review`](commands/es-design-review.md)** - Comprehensive design review preventing generic aesthetics
- **[`/es-component`](commands/es-component.md)** - Generate distinctive shadcn/ui components (legacy, use `/es-tanstack-component`)
- **[`/es-theme`](commands/es-theme.md)** - Generate custom Tailwind + shadcn/ui themes

### Integration Setup (4)
- **[`/es-auth-setup`](commands/es-auth-setup.md)** - Configure better-auth authentication
- **[`/es-billing-setup`](commands/es-billing-setup.md)** - Configure Polar.sh billing integration
- **[`/es-email-setup`](commands/es-email-setup.md)** - Configure Resend email integration
- **[`/es-test-setup`](commands/es-test-setup.md)** - Configure Playwright E2E testing

### Testing & CI (2)
- **[`/es-test-gen`](commands/es-test-gen.md)** - Generate Playwright E2E tests
- **[`/es-validate`](commands/es-validate.md)** - Run comprehensive validation (build, lint, types, wrangler)

### Utilities (2)
- **[`/es-commit`](commands/es-commit.md)** - Auto-stage, generate commit message, and push to current branch
- **[`/es-report-bug`](commands/es-report-bug.md)** - Report bugs in edge-stack plugin with structured information

## Agents

All 27 agents include MCP integration for real-time account context and documentation validation. Agents are now organized into categorized subdirectories for easier navigation. [Browse all agents →](agents/)

### Cloudflare (12) - [Browse →](agents/cloudflare/)
- **[`workers-runtime-guardian`](agents/cloudflare/workers-runtime-guardian.md)** - Ensures Workers runtime compatibility (V8, not Node.js)
- **[`cloudflare-architecture-strategist`](agents/cloudflare/cloudflare-architecture-strategist.md)** - Workers/DO/KV/R2 architecture decisions
- **[`cloudflare-security-sentinel`](agents/cloudflare/cloudflare-security-sentinel.md)** - Security model, secret management, CORS/CSP
- **[`cloudflare-pattern-specialist`](agents/cloudflare/cloudflare-pattern-specialist.md)** - Cloudflare-specific patterns and anti-patterns
- **[`cloudflare-data-guardian`](agents/cloudflare/cloudflare-data-guardian.md)** - KV/D1/R2 data integrity and consistency models
- **[`binding-context-analyzer`](agents/cloudflare/binding-context-analyzer.md)** - Parses wrangler.toml, generates TypeScript Env interface
- **[`durable-objects-architect`](agents/cloudflare/durable-objects-architect.md)** - DO lifecycle, state persistence, WebSocket patterns
- **[`edge-performance-oracle`](agents/cloudflare/edge-performance-oracle.md)** - Cold start optimization, edge caching strategies
- **[`edge-caching-optimizer`](agents/cloudflare/edge-caching-optimizer.md)** - Cache hierarchy, invalidation strategies
- **[`kv-optimization-specialist`](agents/cloudflare/kv-optimization-specialist.md)** - TTL strategies, key naming, batch operations
- **[`r2-storage-architect`](agents/cloudflare/r2-storage-architect.md)** - Upload patterns, streaming, CDN integration
- **[`workers-ai-specialist`](agents/cloudflare/workers-ai-specialist.md)** - Vercel AI SDK, Cloudflare AI Agents, RAG patterns

### Tanstack (5) - [Browse →](agents/tanstack/)
- **[`tanstack-ui-architect`](agents/tanstack/tanstack-ui-architect.md)** - shadcn/ui + TanStack integration patterns
- **[`tanstack-routing-specialist`](agents/tanstack/tanstack-routing-specialist.md)** - File-based routing, loaders, type-safe navigation
- **[`tanstack-ssr-specialist`](agents/tanstack/tanstack-ssr-specialist.md)** - Server-side rendering, React Server Functions
- **[`tanstack-migration-specialist`](agents/tanstack/tanstack-migration-specialist.md)** - Migrate React apps to Tanstack Start
- **[`frontend-design-specialist`](agents/tanstack/frontend-design-specialist.md)** - Prevents generic aesthetics, distinctive design patterns

### Integrations (6) - [Browse →](agents/integrations/)
- **[`polar-billing-specialist`](agents/integrations/polar-billing-specialist.md)** - Subscriptions, webhooks, customer lifecycle
- **[`better-auth-specialist`](agents/integrations/better-auth-specialist.md)** - OAuth, passkeys, magic links, session management
- **[`resend-email-specialist`](agents/integrations/resend-email-specialist.md)** - Transactional email, templates, deliverability
- **[`playwright-testing-specialist`](agents/integrations/playwright-testing-specialist.md)** - E2E testing, Workers bindings, accessibility tests
- **[`mcp-efficiency-specialist`](agents/integrations/mcp-efficiency-specialist.md)** - MCP integration patterns and best practices
- **[`accessibility-guardian`](agents/integrations/accessibility-guardian.md)** - WCAG 2.1 AA compliance, keyboard navigation, screen readers

### Workflow (3) - [Browse →](agents/workflow/)
- **[`feedback-codifier`](agents/workflow/feedback-codifier.md)** - Analyzes user corrections, extracts patterns, updates agents
- **[`code-simplicity-reviewer`](agents/workflow/code-simplicity-reviewer.md)** - YAGNI enforcement, complexity reduction
- **[`repo-research-analyst`](agents/workflow/repo-research-analyst.md)** - Codebase pattern research, convention identification

### Research (1) - [Browse →](agents/research/)
- **[`git-history-analyzer`](agents/research/git-history-analyzer.md)** - Commit history analysis, pattern identification

## Skills

All 14 autonomous SKILLs provide real-time validation and guidance during development. [Browse all skills →](skills/)

### Cloudflare Validation (4)
- **[`workers-runtime-validator`](skills/workers-runtime-validator/)** - Auto-validates Workers runtime compatibility (forbidden APIs, env patterns)
- **[`workers-binding-validator`](skills/workers-binding-validator/)** - Auto-checks binding usage against wrangler.toml configuration
- **[`durable-objects-pattern-checker`](skills/durable-objects-pattern-checker/)** - Auto-validates DO lifecycle, state persistence, ID generation
- **[`edge-performance-optimizer`](skills/edge-performance-optimizer/)** - Auto-analyzes cold starts, bundle size, edge caching patterns

### Storage & Data (2)
- **[`kv-optimization-advisor`](skills/kv-optimization-advisor/)** - Auto-suggests TTL strategies, key naming, batch operations
- **[`cors-configuration-validator`](skills/cors-configuration-validator/)** - Auto-validates CORS headers, preflight handling

### Frontend Design (4)
- **[`shadcn-ui-design-validator`](skills/shadcn-ui-design-validator/)** - Auto-validates component usage, prevents prop hallucination via MCP
- **[`component-aesthetic-checker`](skills/component-aesthetic-checker/)** - Auto-detects generic patterns (Inter fonts, purple gradients)
- **[`animation-interaction-validator`](skills/animation-interaction-validator/)** - Auto-ensures engaging UX (transitions, hover states, loading feedback)
- **[`gemini-imagegen`](skills/gemini-imagegen/)** - AI image generation with Gemini API (generate, edit, compose)

### Integration & Security (3)
- **[`auth-security-validator`](skills/auth-security-validator/)** - Auto-validates better-auth patterns, session security, CSRF protection
- **[`polar-integration-validator`](skills/polar-integration-validator/)** - Auto-checks Polar.sh webhook handling, subscription flows
- **[`cloudflare-security-checker`](skills/cloudflare-security-checker/)** - Auto-validates secret management, runtime isolation, CORS/CSP

### Architecture & Patterns (1)
- **[`agent-native-architecture`](skills/agent-native-architecture/)** - Dan Shipper's architectural philosophy for building agent systems on Cloudflare (Durable Objects, Workers, Queues)

## How It Works

### Multi-Phase Workflow Example: `/review`

```markdown
**Phase 1: Context Gathering** (Parallel)
├─ binding-context-analyzer: Parse wrangler.toml
├─ repo-research-analyst: Understand codebase patterns
└─ git-history-analyzer: Review recent changes

**Phase 2: Cloudflare-Specific Review** (Parallel)
├─ workers-runtime-guardian: Runtime compatibility
├─ durable-objects-architect: DO pattern review
├─ binding-context-analyzer: Binding usage validation
└─ edge-performance-oracle: Performance analysis

**Phase 3: Security & Architecture** (Parallel)
├─ cloudflare-security-sentinel: Security review
├─ cloudflare-architecture-strategist: Architecture assessment
└─ cloudflare-pattern-specialist: Pattern detection

**Phase 4: Finding Synthesis**
- Consolidate all agent reports
- Classify by severity (P1/P2/P3)
- Remove duplicates
- Format for triage

**Phase 5: User Triage**
- Present findings one-by-one
- Create todos for approved items
- Track metrics
```

### Self-Improvement Loop

```markdown
1. User runs /es-worker generate API endpoint
2. Claude generates code using Workers runtime patterns
3. User corrects: "Use Durable Objects for rate limiting"
4. feedback-codifier agent analyzes the correction
5. Extracts pattern: "Rate limiting → Durable Objects (not KV)"
6. Updates workers-runtime-guardian with new guideline
7. Next time: Automatically suggests Durable Objects for rate limiting
```

**Result**: Plugin learns from your corrections and preferences.

## Current Status

### ✅ Completed (Priority 1-5)

**Priority 1: Core Infrastructure** ✅
- [x] Plugin structure from compounding-engineering
- [x] 3 core Cloudflare agents created
- [x] All 6 commands preserved
- [x] User preferences codified (PREFERENCES.md)
- [x] MCP integration strategy (MCP-INTEGRATION.md)

**Priority 2: MCP Integration** ✅
- [x] All 13 Cloudflare agents with MCP integration
- [x] Real-time account context support
- [x] Documentation validation patterns
- [x] shadcn/ui component verification
- [x] MCP setup guide created
- [x] README updated with MCP benefits

**Priority 3: Specialized Agents** ✅
- [x] kv-optimization-specialist (TTL, naming, batching)
- [x] r2-storage-architect (uploads, streaming, CDN)
- [x] workers-ai-specialist (Vercel AI SDK, RAG)
- [x] edge-caching-optimizer (cache hierarchies, invalidation)

**Priority 4: Command Updates** ✅
- [x] Update all 6 commands with Cloudflare agent references
- [x] /review → reference all 16 agents in 4 phases
- [x] /plan → use binding-context-analyzer as critical first step
- [x] /work → validate with 4 Cloudflare agents after each task
- [x] /triage → add Cloudflare-specific tags
- [x] /generate_command → Workers examples and MCP integrations
- [x] /resolve_todo_parallel → no changes needed (already generic)

**Priority 5: Cloudflare Commands** ✅
- [x] Create /es-deploy command (pre-flight + deployment)
- [x] Create /es-migrate command (platform → Workers migration)

### 📋 Remaining Priorities

**Priority 6: Testing & Refinement** (8-12 hours)
- [ ] Test with real Cloudflare projects
- [ ] Validate agent orchestration
- [ ] Refine finding priorities
- [ ] Optimize parallel execution

## Usage Examples

### Example 1: Review Workers Code

```bash
# Run comprehensive review
/review

# Output:
🔍 Phase 1: Context Gathering (3 agents)...
✅ Found 4 bindings: KV, R2, DO, D1

🔍 Phase 2: Cloudflare Review (4 agents)...
🔴 CRITICAL: Using process.env (src/index.ts:45)
🟡 IMPORTANT: KV get without error handling (src/api.ts:23)

🔍 Phase 3: Synthesis...
Total findings: 12 (3 P1, 5 P2, 4 P3)

Ready for triage: /triage
```

### Example 2: Build New Feature

```bash
# Create GitHub issue from description
/plan Add WebSocket-based chat with Durable Objects

# Output creates comprehensive issue:
## Summary
Build real-time chat using Durable Objects for message coordination...

## Architecture
- 1 Worker: HTTP + WebSocket upgrade handler
- 1 Durable Object class: ChatRoom (manages connections)
- Bindings needed: CHAT_ROOM (DO), MESSAGES (KV)

## Files to Create
- src/chat-room.ts (Durable Object)
- src/index.ts (Worker, WebSocket handling)

[Full implementation plan...]
```

### Example 3: Execute Work Plan

```bash
# Execute the plan
/work .claude/todos/001-pending-p1-add-chat.md

# Output:
🔧 Creating worktree...
📋 Task breakdown:
  1. Create Durable Object class
  2. Add WebSocket handling
  3. Update wrangler.toml
  4. Write tests
  5. Deploy to preview

✅ Task 1/5 complete
✅ Task 2/5 complete
...
✅ All tasks complete
📤 Creating PR...
```

## Architecture Inspiration

This plugin adopts Every's compounding-engineering philosophy:

**From Every's Plugin**:
- ✅ Multi-agent orchestration
- ✅ Parallel execution
- ✅ Feedback codification (self-improvement)
- ✅ Multi-phase workflows
- ✅ Git worktree isolation
- ✅ Triage system
- ✅ Command structure

**Our Cloudflare Adaptation**:
- ✅ All agents specialized for Workers/DO/KV/R2
- ✅ Runtime compatibility enforcement
- ✅ Binding-aware code generation
- ✅ Edge-first architecture patterns
- ✅ Cloudflare security model
- ✅ wrangler.toml integration

**Result**: Proven architecture + Cloudflare expertise

## Contributing

### To This Plugin

Issues and suggestions:
- [GitHub Issues](https://github.com/hirefrank/hirefrank-marketplace/issues)
- Label: `edge-stack`

### To Upstream (Every's Plugin)

If you create genuinely generic improvements (not Cloudflare-specific), consider contributing to Every's original plugin:
- [Every Marketplace](https://github.com/EveryInc/every-marketplace)

## Credits

**Architecture & Philosophy**: [Every's Compounding Engineering Plugin](https://github.com/EveryInc/every-marketplace/tree/main/plugins/compounding-engineering) by Kieran Klaassen

**Cloudflare Adaptation**: Frank Harris (frank@hirefrank.com)

## License

MIT License

Original architecture: Copyright (c) 2024 Every Inc.
Cloudflare adaptations: Copyright (c) 2025 Frank Harris

See [LICENSE](./LICENSE) for full details.

## Resources

**MCP Servers** (9 bundled with plugin):
- [Cloudflare MCP](https://docs.mcp.cloudflare.com/mcp) - Account context + documentation
- [shadcn/ui MCP](https://www.shadcn.io/api/mcp) - Component documentation
- [better-auth MCP](https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp) - Authentication patterns
- [Playwright MCP](https://github.com/microsoft/playwright-mcp) - Browser automation and E2E testing
- [Package Registry MCP](https://github.com/zcaceres/package-registry-mcp) - NPM, Cargo, PyPI, NuGet search
- [TanStack Router MCP](https://gitmcp.io/TanStack/router) - TanStack Router documentation
- [Tailwind CSS MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/tailwindcss) - Tailwind utilities and templates
- [Context7 MCP](https://context7.com) - Instant documentation for 100+ frameworks
- [Polar MCP](https://mcp.polar.sh/mcp/polar-mcp) - Billing integration
- [MCP Usage Examples](./docs/mcp-usage-examples.md) - Query patterns and workflows
- [MCP Protocol](https://modelcontextprotocol.io) - Official MCP specification

**Cloudflare Docs**:
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Workers KV](https://developers.cloudflare.com/kv/)
- [R2 Storage](https://developers.cloudflare.com/r2/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

**User Preferences**:
- [PREFERENCES.md](./PREFERENCES.md) - Strict framework/SDK requirements
- [Tanstack Start](https://tanstack.com/start) - Required UI framework
- [Hono](https://hono.dev) - Required backend framework
- [Vercel AI SDK](https://ai-sdk.dev) - Required AI SDK
- [Cloudflare AI Agents](https://developers.cloudflare.com/agents/) - Agentic workflows

**Every's Original**:
- [Blog Post](https://every.to/source-code/my-ai-had-already-fixed-the-code-before-i-saw-it)
- [Plugin Repository](https://github.com/EveryInc/every-marketplace/tree/main/plugins/compounding-engineering)

## Version History

- **v1.0.0**: Initial release
  - Template copied from compounding-engineering
  - Language-specific agents removed
  - 3 Cloudflare agents created
  - 5 agents renamed for adaptation
  - All commands preserved
  - UPSTREAM tracking established
