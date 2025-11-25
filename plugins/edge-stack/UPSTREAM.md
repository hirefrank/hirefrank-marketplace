# Upstream Tracking Log

## Upstream Sources

This plugin tracks two upstream sources for improvements:

| Source | Focus | Priority |
|--------|-------|----------|
| **Every Inc** | Multi-agent orchestration, feedback codification, workflow patterns | PRIMARY |
| **Anthropic** | Frontend design, code review patterns, official Claude Code plugins | SECONDARY |

---

## Source 1: Every Inc (Compounding Engineering)

- **Source**: https://github.com/EveryInc/every-marketplace/tree/main/plugins/compounding-engineering
- **Date Copied**: 2025-11-05
- **License**: MIT
- **Original Author**: Kieran Klaassen (kieran@every.to)

## Architecture Attribution

This plugin's architecture and workflow orchestration is derived from Every's Compounding Engineering Plugin. We gratefully acknowledge their pioneering work in self-improving AI development tools.

**What we adopted**:
- Multi-agent orchestration system
- Parallel execution patterns
- Multi-phase workflow structure
- Triage system
- Feedback codification approach
- Git worktree isolation
- Command structure (6 commands)

**What we modified**:
- All agents specialized for Cloudflare ecosystem
- Removed language-specific agents (Rails, Python, TypeScript)
- Added Cloudflare-specific agents (Workers, Durable Objects, KV, R2)
- Adapted generic agents with Cloudflare context

## Tracking Setup

```bash
# Add upstream remote
git remote add every-upstream https://github.com/EveryInc/every-marketplace.git
git fetch every-upstream

# Monthly check script
./scripts/check-upstream.sh
```

## Agent Migration

### Removed (Language-Specific)
- ❌ `dhh-rails-reviewer.md` - Rails-specific
- ❌ `kieran-rails-reviewer.md` - Rails-specific
- ❌ `kieran-python-reviewer.md` - Python-specific
- ❌ `kieran-typescript-reviewer.md` - Generic TypeScript (not Workers-specific)
- ❌ `best-practices-researcher.md` - Rails/Python/TS docs
- ❌ `framework-docs-researcher.md` - Rails/Django/Express
- ❌ `every-style-editor.md` - Writing style (not code)
- ❌ `pr-comment-resolver.md` - GitHub-specific (may add back later)

### Kept (Generic)
- ✅ `feedback-codifier.md` - Learning engine (unchanged)
- ✅ `git-history-analyzer.md` - Generic (unchanged)
- ✅ `repo-research-analyst.md` - Generic (unchanged)
- ✅ `code-simplicity-reviewer.md` - Generic (unchanged)

### Adapted (Cloudflare Context)
- 🔄 `architecture-strategist.md` → `cloudflare-architecture-strategist.md`
- 🔄 `security-sentinel.md` → `cloudflare-security-sentinel.md`
- 🔄 `performance-oracle.md` → `edge-performance-oracle.md`
- 🔄 `pattern-recognition-specialist.md` → `cloudflare-pattern-specialist.md`
- 🔄 `data-integrity-guardian.md` → `cloudflare-data-guardian.md`

### Added (Cloudflare-Specific)
- ➕ `workers-runtime-guardian.md` - Workers runtime compatibility
- ➕ `binding-context-analyzer.md` - wrangler.toml parsing
- ➕ `durable-objects-architect.md` - Durable Objects patterns
- ➕ (More to be added: KV, R2, Workers AI specialists)

## Adopted Changes

### 2025-11-14: Fixed Command Prefix Documentation
- **Upstream commit**: 4d66320
- **Description**: Updated all command examples to use plugin namespace prefixes
- **Applied to**: README.md (marketplace + plugin)
- **Changes**:
  - `/review` → `/edge-stack:review`
  - `/work` → `/edge-stack:work`
  - `/plan` → `/edge-stack:plan`
  - All generic commands now show correct namespace
  - Edge-specific commands (es-*) unchanged
- **Reason**: Prevents user confusion - marketplace plugins require namespace prefix

### 2025-11-14: Enhanced Marketplace README Structure
- **Upstream commit**: daf3afc
- **Description**: Expanded marketplace README with philosophy, examples, and comprehensive documentation
- **Applied to**: README.md (marketplace)
- **Changes**:
  - Added "What Is Edge-First Development?" section
  - Added workflow diagrams (Mermaid)
  - Added practical command examples
  - Improved value proposition clarity
- **Reason**: Better first impressions, improved discoverability, clearer use cases

### 2025-11-14: Added Cross-Documentation References
- **Upstream commit**: b87934c + 4d66320
- **Description**: Improved navigation between marketplace and plugin-specific documentation
- **Applied to**: README.md (both marketplace and plugin)
- **Changes**:
  - Marketplace README links to plugin README for details
  - Plugin README links to marketplace README for installation
  - Clear separation of concerns (overview vs reference)
- **Reason**: Better user navigation, clearer documentation structure

## Ignored Changes

### 2025-11-14: Droid (Factory) Installation Instructions
- **Upstream commit**: 4e2a828
- **Description**: Added quick start guide for Droid (Factory) alternative to Claude Code
- **Reason**: We target Claude Code users exclusively. Droid is a separate product with different architecture. Not relevant to our user base.

### 2025-11-14: CHANGELOG.md Deletion
- **Upstream commit**: a230b2b
- **Description**: Deleted plugins/compounding-engineering/CHANGELOG.md file
- **Reason**: We don't have a CHANGELOG.md file. We use git history and GitHub releases for change tracking.

### 2025-11-14: Merge Commit (No Unique Content)
- **Upstream commit**: b1284a2
- **Description**: Merge pull request combining documentation changes
- **Reason**: Merge commit with no unique content - actual changes tracked in individual commits.

## Review Schedule

- **Monthly**: Quick review of new commits
- **Quarterly**: Deep dive on all changes
- **As Needed**: Critical bug fixes or security updates

## Adoption Metrics

_To be tracked over time:_

- Changes reviewed: 0
- Changes adopted: 0
- Changes ignored: 0
- Time investment: 0 hours
- Value assessment: TBD

## Current Status

**Last Review**: 2025-11-05 (initial template copy)
**Next Review**: 2025-12-05
**Tracking Active**: Yes
**Value Assessment**: Too early (just started)

## Contributing Back

If we create genuinely generic improvements (not Cloudflare-specific), we may contribute back to Every's repository:

**Potential contributions**:
- Triage UI improvements
- Git worktree helpers
- Parallel execution optimizations
- TodoWrite integration enhancements

**Not contributing** (Cloudflare-specific):
- All Cloudflare agents
- Workers runtime checks
- Binding analysis tools
- Edge optimization patterns

## Adoption Metrics

- **Changes reviewed**: 22 (6 + 16)
- **Changes adopted**: 3
- **Changes adapted**: 5 (pending)
- **Changes ignored**: 14 (3 + 11)
- **Time investment**: ~8-11 hours (pending work)
- **Value assessment**: High (MCP servers, design workflow, agent organization, image generation)

## Current Status

**Last Review**: 2025-11-25
**Next Review**: 2025-12-25
**Tracking Active**: Yes
**Value Assessment**: High value - upstream continues providing valuable MCP integrations and workflow improvements

---

## Review: 2025-11-25

**Review Period**: 2025-11-14 → 2025-11-25
**Commits Analyzed**: 16
**Upstream Version**: v2.4.1 (major reorganization)

### Summary Statistics

| Category | Count |
|----------|-------|
| To Adopt | 1 (Context7 MCP) |
| To Adapt | 5 (Design improvements, Playwright docs, Agent reorganization, Gemini imagegen) |
| To Ignore | 10 (Language-specific, intermediate fixes, merge commits) |

### Changes to Adopt

#### Context7 MCP Server for Framework Documentation
- **Upstream commit**: a1cc81c
- **Description**: Added Context7 MCP (SSE) for instant docs lookup across 100+ frameworks
- **Relevance**: HIGH - Supports React, TanStack Router, and other frameworks we use
- **Implementation**: Add to plugin.json mcpServers section
- **Effort**: TRIVIAL (15 min)
- **Status**: Pending

### Changes to Adapt

#### 1. Design Iterator Improvements (Focused Screenshots)
- **Upstream commits**: 364b3f5, 5a7bcc5
- **Description**:
  - Add focused screenshot guidance (capture target element, not full page)
  - Browser_resize recommendations for different component sizes
  - Proactive iteration (suggest 5x or 10x iterations when design isn't working)
- **Adaptation needed**: Apply to frontend-design-specialist.md for Tanstack/React context
- **Effort**: SMALL (1-2 hrs)
- **Status**: Pending

#### 2. Playwright MCP Documentation
- **Upstream commit**: bd4a659
- **Description**: Comprehensive Playwright tool documentation (browser_navigate, browser_take_screenshot, browser_click, browser_fill_form, browser_snapshot, browser_evaluate)
- **Adaptation needed**: Enhance playwright-testing-specialist.md with tool usage examples
- **Effort**: SMALL (1 hr)
- **Status**: Pending

#### 3. Agent Directory Reorganization
- **Upstream commit**: 8cc99ab
- **Description**: v2.0.0 reorganized agents into categories (review/, research/, design/, workflow/, docs/)
- **Adaptation needed**: Reorganize our 27 agents into subdirectories matching our Cloudflare/Tanstack focus:
  - `cloudflare/` - Workers, KV, R2, D1, Durable Objects specialists
  - `tanstack/` - Routing, SSR, migration, UI specialists
  - `integrations/` - Polar, better-auth, Resend, Playwright
  - `workflow/` - Feedback codifier, code simplicity, pattern specialist
  - `research/` - Git history, repo research analysts
- **Effort**: MEDIUM (2-3 hrs) - file moves + reference updates
- **Status**: Pending

#### 4. Gemini Imagegen Skill (Node.js Adaptation)
- **Upstream commits**: 15e0763, 8cd694c
- **Description**: Image generation skill using Gemini API (originally Python)
- **Adaptation needed**: Rewrite as Node.js skill for local execution:
  - Use `@google/generative-ai` npm package
  - Scripts: generate-image.ts, edit-image.ts, compose-images.ts
  - SKILL.md with usage examples
  - Runs locally (not on Workers - Gemini API calls)
- **Effort**: MEDIUM (3-4 hrs) - full rewrite from Python to TypeScript
- **Status**: Pending

### Ignored Changes

#### MCP Configuration Evolution (5 commits)
- **Commits**: be1e957, bf00391, 66e35bb, e3e7640, 39e41f4
- **Description**: Series of fixes moving MCP servers between plugin.json and .mcp.json
- **Reason**: We already use plugin.json correctly. These are intermediate fixes we don't need.

#### Language-Specific Skills (from v2.0.0)
- **Skills ignored**: andrew-kane-gem-writer, dhh-ruby-style, dspy-ruby
- **Reason**: Ruby/Rails-specific, not applicable to our Cloudflare Workers stack.

#### Documentation-Only Changes
- **Commits**: bd2a19d, e262127, d44804f
- **Description**: Versioning requirements, README updates, CLAUDE.md updates
- **Reason**: Internal to Every's workflow, not directly applicable.

#### Merge Commits
- **Commit**: 6a9188d
- **Reason**: No unique content.

### Implementation Priority

| Priority | Change | Effort | Week |
|----------|--------|--------|------|
| HIGH | Context7 MCP Server | 15 min | 1 |
| HIGH | Playwright docs enhancement | 1 hr | 1 |
| MEDIUM | Design iterator improvements | 1-2 hrs | 2 |
| MEDIUM | Agent directory reorganization | 2-3 hrs | 2 |
| MEDIUM | Gemini imagegen (Node.js) | 3-4 hrs | 3 |

**Total estimated effort**: ~8-11 hours

### Value Assessment

**High-value changes identified**:
1. Context7 MCP - Instant access to framework documentation improves development velocity
2. Playwright tool documentation - Better leverage of browser automation we already bundle
3. Design iteration guidance - Proactive suggestions improve UI development workflow
4. Agent directory reorganization - Better discoverability as agent count grows (27 → categorized)
5. Gemini imagegen (Node.js) - Image generation capability for design workflows

**Strategic insight**: Upstream is focusing heavily on MCP servers and design workflows. Our next review should monitor for additional MCP integrations relevant to our stack.

---

## Source 2: Anthropic (Claude Code Plugins)

- **Source**: https://github.com/anthropics/claude-code/tree/main/plugins
- **Date Added**: 2025-11-25
- **License**: MIT
- **Maintainer**: Anthropic

### Plugins Monitored

| Plugin | Relevance | Action |
|--------|-----------|--------|
| `frontend-design` | HIGH | Reference patterns, don't install (we have Cloudflare-specific version) |
| `code-review` | HIGH | Adopt confidence scoring pattern |
| `feature-dev` | MEDIUM | Reference 7-phase workflow |
| `commit-commands` | LOW | Consider `/clean_gone` command |
| `hookify` | HIGH | Adopt safety hook patterns |
| `plugin-dev` | USEFUL | Install for our own development |
| `agent-sdk-dev` | USEFUL | Reference for Agent SDK work |
| `pr-review-toolkit` | LOW | 6 specialized agents (ours is more specific) |

### What We Adopted

#### 2025-11-25: Confidence Scoring Pattern (from `code-review`)
- **Source**: `code-review` plugin
- **Description**: 0-100 confidence scoring with 80-point threshold to filter false positives
- **Applied to**: `/es-review` command
- **Benefits**: Reduces noise, surfaces only high-confidence findings

#### 2025-11-25: Safety Hook Patterns (from `hookify`)
- **Source**: `hookify` plugin
- **Description**: Pattern-based hooks for warn/block actions on dangerous operations
- **Applied to**: New `.claude/settings.json` hooks section
- **Benefits**: Prevents accidental destructive commands, sensitive data exposure

#### 2025-11-25: 4-Dimension Design Context (from `frontend-design`)
- **Source**: `frontend-design` SKILL.md
- **Description**: Pre-coding framework: Purpose, Tone, Constraints, Differentiation
- **Applied to**: `frontend-design-specialist.md`
- **Benefits**: More intentional design decisions, less generic output

### What We Reference (Not Install)

#### `frontend-design` Plugin
- **Reason**: Our `frontend-design-specialist.md` is Cloudflare/Tanstack-specific
- **Monitor**: Their SKILL.md for prompt improvements
- **Key patterns adopted**:
  - "Distributional convergence" terminology
  - Typography/color/motion/spatial composition framework
  - Anti-pattern lists (Inter, purple gradients)

#### `feature-dev` Plugin
- **Reason**: Our `/es-plan` + `/es-work` covers similar workflow
- **Monitor**: Their 7-phase structure for improvements
- **Key patterns**:
  - Phase blocking (wait for clarification before proceeding)
  - Multiple architect agents proposing alternatives
  - Explicit approval gates

### Plugins to Consider Installing

```bash
# For plugin development work
/plugin install plugin-dev@claude-code-plugins

# For safety hooks (if not implementing ourselves)
/plugin install hookify@claude-code-plugins
```

### Review Schedule

- **Monthly**: Check for new plugins and updates to monitored plugins
- **Focus**: `frontend-design`, `code-review`, `hookify` changes
- **Command**: `/check-upstream` (covers both Every and Anthropic)

### Anthropic Plugin Metrics

- **Plugins reviewed**: 13
- **Patterns adopted**: 3 (confidence scoring, hooks, 4-dimension context)
- **Plugins installed**: 0 (implementing patterns ourselves)
- **Last review**: 2025-11-25
- **Next review**: 2025-12-25
