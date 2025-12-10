# hirefrank Marketplace

The official hirefrank marketplace where I share my AI workflow tools and productivity plugins. Featuring specialized Claude Code plugins for AI analysis and Cloudflare Workers development.

## Available Plugins

### 🔍 Claude Skills Analyzer
**Plugin ID**: `claude-skills-analyzer`

Analyzes your AI conversation exports (Claude, ChatGPT) to automatically generate reusable Custom Skills based on your actual usage patterns.

**Key Features:**
- Cross-platform analysis (Claude + ChatGPT)
- Pattern recognition and workflow automation
- Smart deduplication across platforms
- Complete skill package generation
- Incremental processing for efficiency

**Usage**:
- `/skills-setup` - Get setup guidance and export instructions
- `/analyze-skills` - Run the main conversation analysis
- `/skills-troubleshoot` - Diagnose and fix common issues

[📖 Full Documentation](./plugins/claude-skills-analyzer/README.md)

### ⚡ Edge Stack
**Plugin ID**: `edge-stack`

Complete full-stack development toolkit optimized for edge computing. Build modern web applications with Tanstack Start (React), Cloudflare Workers, Polar.sh billing, better-auth authentication, Resend email, and shadcn/ui design system.

**Key Features:**
- **27 specialized agents** (all with MCP integration) - [View all agents](./plugins/edge-stack/agents/)
- **14 autonomous SKILLs** (continuous validation) - [View all skills](./plugins/edge-stack/skills/)
- **26 workflow commands** (including setup wizards, test generation, verification, and community tools) - [View all commands](./plugins/edge-stack/commands/)
- **9 bundled MCP servers** (Cloudflare, shadcn/ui, better-auth, Playwright, Package Registry, TanStack Router, Tailwind CSS, Context7, Polar) - no manual setup required
- **E2E testing** with Playwright and automated test generation
- **Email integration** with Resend for transactional and marketing emails
- **Bundled statusline** - at-a-glance development context
- **Documentation validation** - keeps docs in sync with code
- Distinctive design system preventing generic "AI aesthetics"

**Command Highlights** (see [full list](./plugins/edge-stack/commands/)):
- **Setup**: `/es-billing-setup`, `/es-auth-setup`, `/es-test-setup`, `/es-email-setup`
- **Development**: `/es-tanstack-route`, `/es-tanstack-component`, `/es-component`, `/es-worker`
- **Testing**: `/es-test-gen`, `/es-test-setup`
- **Validation**: `/es-validate`, `/es-design-review`
- **Workflow**: `/es-commit`, `/es-review`, `/es-work`, `/es-resolve-parallel`
- **Migration**: `/es-tanstack-migrate`, `/es-migrate`
- **Utilities**: `/es-plan`, `/es-issue`, `/es-triage`, `/es-theme`, `/es-deploy`

For detailed documentation on all agents, commands, skills, and MCP integration, see the [Edge Stack Plugin README](./plugins/edge-stack/README.md).

**Quick Start**:
- `/es-billing-setup` - Interactive Polar.sh billing integration
- `/es-auth-setup` - Interactive authentication configuration
- `/es-test-setup` - Initialize Playwright E2E testing
- `/es-test-gen` - Generate tests for routes/components/server functions
- `/es-tanstack-component` - Generate shadcn/ui components
- `/es-tanstack-route` - Create TanStack Router routes
- `/es-commit` - Auto-commit with generated messages
- `/es-validate` - Comprehensive validation before commit

[📖 Full Documentation](./plugins/edge-stack/README.md)

## Quick Start

### Standard Installation
Run Claude and add the marketplace:

```bash
/plugin marketplace add hirefrank/hirefrank-marketplace
```

Then install a plugin:

```bash
/plugin install claude-skills-analyzer
# or
/plugin install edge-stack
```

### One-Command Installation
Use the [Claude Plugins CLI](https://claude-plugins.dev) to skip the marketplace setup:

```bash
npx claude-plugins install @hirefrank/hirefrank-marketplace/claude-skills-analyzer
```

This automatically adds the marketplace and installs the plugin in a single step.

## What Is Edge-First Development?

Edge-first development prioritizes:
- **Serverless-first**: No servers to manage, automatic scaling
- **Globally distributed**: Run at the edge, close to users
- **TypeScript native**: Type-safe from Workers to frontend
- **Platform primitives**: KV, D1, R2, Durable Objects, not vendor-agnostic abstractions

This plugin accelerates edge development by:
1. **Preventing platform pitfalls**: Validates Workers runtime compatibility, detects forbidden APIs
2. **Enforcing best practices**: Optimizes cold starts, caching, data access patterns
3. **Generating edge-aware code**: Scaffolds Workers, DOs, bindings with correct patterns

## Quick Start Guide

### For Claude Skills Analyzer:
```shell
# 1. Install the plugin
/plugin install claude-skills-analyzer

# 2. Follow the interactive setup
/skills-setup

# 3. Run the analysis
/analyze-skills
```

See the [full Quick Start guide](./plugins/claude-skills-analyzer/README.md#quick-start) for detailed instructions including export steps and skill installation.

### For Edge Stack:
```shell
# 1. Install the plugin
/plugin install edge-stack

# 2. Setup billing integration
/es-billing-setup

# 3. Setup authentication
/es-auth-setup

# 4. Initialize E2E testing
/es-test-setup

# 5. Generate a TanStack Router route
/es-tanstack-route /dashboard

# 6. Generate a shadcn/ui component
/es-tanstack-component button PrimaryButton

# 7. Validate and commit
/es-validate
/es-commit
```

See the [full documentation](./plugins/edge-stack/README.md) for detailed instructions including all 27 agents, 24 commands, 13 SKILLs, and 9 MCP servers.

## Plugin Categories

- **🎯 Productivity**: Tools for workflow optimization and automation
- **📊 Analysis**: Data processing and pattern recognition tools
- **🔧 Development**: Code and project management utilities

## Planned Plugins

Future plugins in development:
- **conversation-summarizer**: Generate executive summaries from meeting transcripts
- **code-pattern-extractor**: Identify reusable code patterns from projects
- **writing-style-analyzer**: Analyze and replicate writing styles across content

## Contributing

### Suggesting New Plugins
Have an idea for a plugin? [Open an issue](https://github.com/hirefrank/hirefrank-marketplace/issues) with:
- Plugin concept and use case
- Expected input/output formats
- Target user workflow

### Plugin Development
Interested in contributing? Check out:
- [Claude Code Plugin Documentation](https://docs.anthropic.com/en/docs/claude-code/plugins)
- Plugin development guidelines in each plugin directory
- Code standards and testing requirements

### Feedback & Issues
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/hirefrank/hirefrank-marketplace/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/hirefrank/hirefrank-marketplace/discussions)
- 📧 **Direct Contact**: frank@hirefrank.com

## Repository Structure

```
hirefrank-marketplace/
├── .claude-plugin/
│   └── marketplace.json     # Marketplace configuration
├── plugins/
│   ├── claude-skills-analyzer/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   ├── commands/
│   │   ├── skills/
│   │   └── README.md
│   └── edge-stack/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── .claude-code/
│       │   └── statusline.json
│       ├── agents/        # 27 specialized agents
│       ├── commands/      # 24 workflow commands
│       ├── skills/        # 13 autonomous SKILLs
│       └── README.md
├── docs/                    # Shared documentation
├── examples/               # Usage examples
└── README.md              # This file
```

## License

All plugins are released under MIT License - feel free to use, modify, and distribute for personal and commercial use.
