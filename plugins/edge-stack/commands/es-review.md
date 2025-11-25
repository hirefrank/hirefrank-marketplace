---
description: Perform exhaustive code reviews using multi-agent analysis and Git worktrees
---

# Review Command

<command_purpose> Perform exhaustive code reviews using multi-agent analysis, ultra-thinking, and Git worktrees for deep local inspection. </command_purpose>

## Introduction

<role>Senior Code Review Architect with expertise in security, performance, architecture, and quality assurance</role>

## Prerequisites

<requirements>
- Git repository with GitHub CLI (`gh`) installed and authenticated
- Clean main/master branch
- Proper permissions to create worktrees and access the repository
- For document reviews: Path to a markdown file or document
</requirements>

## Main Tasks

### 1. Worktree Creation and Branch Checkout (ALWAYS FIRST)

<review_target> #$ARGUMENTS </review_target>

<critical_requirement> MUST create worktree FIRST to enable local code analysis. No exceptions. </critical_requirement>

<thinking>
First, I need to determine the review target type and set up the worktree.
This enables all subsequent agents to analyze actual code, not just diffs.
</thinking>

#### Immediate Actions:

<task_list>

- [ ] Determine review type: PR number (numeric), GitHub URL, file path (.md), or empty (latest PR)
- [ ] Create worktree directory structure at `$git_root/.worktrees/reviews/pr-$identifier`
- [ ] Check out PR branch in isolated worktree using `gh pr checkout`
- [ ] Navigate to worktree - ALL subsequent analysis happens here

- Fetch PR metadata using `gh pr view --json` for title, body, files, linked issues
- Clone PR branch into worktree with full history `gh pr checkout $identifier`
- Set up language-specific analysis tools
- Prepare security scanning environment

Ensure that the worktree is set up correctly and that the PR is checked out. ONLY then proceed to the next step.

</task_list>

#### Verify Cloudflare Workers Project

<thinking>
Confirm this is a Cloudflare Workers project by checking for wrangler.toml.
All Cloudflare-specific agents will be used regardless of language (TypeScript/JavaScript).
</thinking>

<project_verification>

Check for Cloudflare Workers indicators:

**Required**:
- `wrangler.toml` - Cloudflare Workers configuration

**Common**:
- `package.json` with `wrangler` dependency
- TypeScript/JavaScript files (`.ts`, `.js`)
- Worker entry point (typically `src/index.ts` or `src/worker.ts`)

If not a Cloudflare Workers project, warn user and ask to confirm.

</project_verification>

#### Parallel Agents to review the PR:

<parallel_tasks>

Run ALL these agents in parallel. Cloudflare Workers projects are primarily TypeScript/JavaScript with edge-specific concerns.

**Phase 1: Context Gathering (3 agents in parallel)**

1. Task binding-context-analyzer(PR content)
   - Parse wrangler.toml for bindings
   - Generate TypeScript Env interface
   - Provide context to other agents

2. Task git-history-analyzer(PR content)
   - Analyze commit history and patterns
   - Identify code evolution

3. Task repo-research-analyst(PR content)
   - Research codebase patterns
   - Document conventions

**Phase 2: Cloudflare-Specific Review (5 agents in parallel)**

4. Task workers-runtime-guardian(PR content)
   - Runtime compatibility (V8, not Node.js)
   - Detect forbidden APIs (fs, process, Buffer)
   - Validate env parameter patterns

5. Task durable-objects-architect(PR content)
   - DO lifecycle and state management
   - Hibernation patterns
   - WebSocket handling

6. Task cloudflare-security-sentinel(PR content)
   - Workers security model
   - Secret management (wrangler secret)
   - CORS, CSP, auth patterns

7. Task edge-performance-oracle(PR content)
   - Cold start optimization
   - Bundle size analysis
   - Edge caching strategies

8. Task cloudflare-pattern-specialist(PR content)
   - Cloudflare-specific patterns
   - Anti-patterns (stateful Workers, KV for strong consistency)
   - Idiomatic Cloudflare code

**Phase 2.5: Frontend Design Review (3 agents in parallel - if shadcn/ui components detected)**

If the PR includes React components with shadcn/ui:

9a. Task frontend-design-specialist(PR content)
    - Identify generic patterns (Inter fonts, purple gradients, minimal animations)
    - Map aesthetic improvements to Tailwind/shadcn/ui code
    - Prioritize distinctiveness opportunities
    - Ensure brand identity vs generic "AI aesthetic"

9b. Task shadcn-ui-architect(PR content)
    - Validate shadcn/ui component usage and props (via MCP if available)
    - Check customization depth (`ui` prop usage)
    - Ensure consistent component patterns
    - Prevent prop hallucination

9c. Task accessibility-guardian(PR content)
    - WCAG 2.1 AA compliance validation
    - Color contrast checking
    - Keyboard navigation validation
    - Screen reader support
    - Ensure distinctive design remains accessible

**Phase 3: Architecture & Data (5 agents in parallel)**

9. Task cloudflare-architecture-strategist(PR content)
   - Workers/DO/KV/R2 architecture
   - Service binding strategies
   - Edge-first design

10. Task cloudflare-data-guardian(PR content)
    - KV/D1/R2 data integrity
    - Consistency models
    - Storage selection

11. Task kv-optimization-specialist(PR content)
    - TTL strategies
    - Key naming patterns
    - Batch operations

12. Task r2-storage-architect(PR content)
    - Upload patterns (multipart, streaming)
    - CDN integration
    - Lifecycle management

13. Task edge-caching-optimizer(PR content)
    - Cache hierarchies
    - Invalidation strategies
    - Performance optimization

**Phase 4: Specialized (3 agents in parallel)**

14. Task workers-ai-specialist(PR content)
    - Vercel AI SDK patterns
    - Cloudflare AI Agents
    - RAG implementations

15. Task code-simplicity-reviewer(PR content)
    - YAGNI enforcement
    - Complexity reduction
    - Minimalism review

16. Task feedback-codifier(PR content)
    - Extract patterns from review
    - Update agent knowledge
    - Self-improvement loop

</parallel_tasks>

### 4. Ultra-Thinking Deep Dive Phases

<ultrathink_instruction> For each phase below, spend maximum cognitive effort. Think step by step. Consider all angles. Question assumptions. And bring all reviews in a synthesis to the user.</ultrathink_instruction>

<deliverable>
Complete system context map with component interactions
</deliverable>

#### Phase 3: Stakeholder Perspective Analysis

<thinking_prompt> ULTRA-THINK: Put yourself in each stakeholder's shoes. What matters to them? What are their pain points? </thinking_prompt>

<stakeholder_perspectives>

1. **Developer Perspective** <questions>

   - How easy is this to understand and modify?
   - Are the APIs intuitive?
   - Is debugging straightforward?
   - Can I test this easily? </questions>

2. **Operations Perspective** <questions>

   - How do I deploy this safely?
   - What metrics and logs are available?
   - How do I troubleshoot issues?
   - What are the resource requirements? </questions>

3. **End User Perspective** <questions>

   - Is the feature intuitive?
   - Are error messages helpful?
   - Is performance acceptable?
   - Does it solve my problem? </questions>

4. **Security Team Perspective** <questions>

   - What's the attack surface?
   - Are there compliance requirements?
   - How is data protected?
   - What are the audit capabilities? </questions>

5. **Business Perspective** <questions>
   - What's the ROI?
   - Are there legal/compliance risks?
   - How does this affect time-to-market?
   - What's the total cost of ownership? </questions> </stakeholder_perspectives>

#### Phase 4: Scenario Exploration

<thinking_prompt> ULTRA-THINK: Explore edge cases and failure scenarios. What could go wrong? How does the system behave under stress? </thinking_prompt>

<scenario_checklist>

- [ ] **Happy Path**: Normal operation with valid inputs
- [ ] **Invalid Inputs**: Null, empty, malformed data
- [ ] **Boundary Conditions**: Min/max values, empty collections
- [ ] **Concurrent Access**: Race conditions, deadlocks
- [ ] **Scale Testing**: 10x, 100x, 1000x normal load
- [ ] **Network Issues**: Timeouts, partial failures
- [ ] **Resource Exhaustion**: Memory, disk, connections
- [ ] **Security Attacks**: Injection, overflow, DoS
- [ ] **Data Corruption**: Partial writes, inconsistency
- [ ] **Cascading Failures**: Downstream service issues </scenario_checklist>

### 6. Multi-Angle Review Perspectives

#### Technical Excellence Angle

- Code craftsmanship evaluation
- Engineering best practices
- Technical documentation quality
- Tooling and automation assessment

#### Business Value Angle

- Feature completeness validation
- Performance impact on users
- Cost-benefit analysis
- Time-to-market considerations

#### Risk Management Angle

- Security risk assessment
- Operational risk evaluation
- Compliance risk verification
- Technical debt accumulation

#### Team Dynamics Angle

- Code review etiquette
- Knowledge sharing effectiveness
- Collaboration patterns
- Mentoring opportunities

### 4. Simplification and Minimalism Review

Run the Task code-simplicity-reviewer() to see if we can simplify the code.

### 5. Findings Synthesis and Todo Creation

<critical_requirement> All findings MUST be converted to actionable todos in the CLI todo system </critical_requirement>

#### Step 1: Synthesize All Findings

<thinking>
Consolidate all agent reports into a categorized list of findings.
Remove duplicates, prioritize by severity and impact.
Apply confidence scoring to filter false positives.
</thinking>

<synthesis_tasks>
- [ ] Collect findings from all parallel agents
- [ ] Categorize by type: security, performance, architecture, quality, etc.
- [ ] **Apply confidence scoring (0-100) to each finding**
- [ ] **Filter out findings below 80 confidence threshold**
- [ ] Assign severity levels: 🔴 CRITICAL (P1), 🟡 IMPORTANT (P2), 🔵 NICE-TO-HAVE (P3)
- [ ] Remove duplicate or overlapping findings
- [ ] Estimate effort for each finding (Small/Medium/Large)
</synthesis_tasks>

#### Confidence Scoring System (Adopted from Anthropic's code-review plugin)

Each finding receives an independent confidence score:

| Score | Meaning | Action |
|-------|---------|--------|
| **0-25** | Not confident; likely false positive | Auto-filter (don't show) |
| **26-50** | Somewhat confident; might be valid | Auto-filter (don't show) |
| **51-79** | Moderately confident; real but uncertain | Auto-filter (don't show) |
| **80-89** | Highly confident; real and important | ✅ Show to user |
| **90-100** | Absolutely certain; definitely real | ✅ Show to user (prioritize) |

**Confidence Threshold: 80** - Only findings scoring 80+ are surfaced to the user.

<confidence_criteria>
When scoring a finding, consider:

1. **Evidence Quality** (+20 points each):
   - [ ] Specific file and line number identified
   - [ ] Code snippet demonstrates the issue
   - [ ] Issue is in changed code (not pre-existing)
   - [ ] Clear violation of documented standard

2. **False Positive Indicators** (-20 points each):
   - [ ] Issue exists in unchanged code
   - [ ] Would be caught by linter/type checker
   - [ ] Has explicit ignore comment
   - [ ] Is a style preference, not a bug

3. **Verification** (+10 points each):
   - [ ] Multiple agents flagged same issue
   - [ ] CLAUDE.md or PREFERENCES.md mentions this pattern
   - [ ] Issue matches known Cloudflare anti-pattern

Example scoring:
```
Finding: Using process.env in Worker
- Specific location: src/index.ts:45 (+20)
- Code snippet shows violation (+20)
- In changed code (+20)
- Violates Workers runtime rules (+20)
- Multiple agents flagged (+10)
= 90 confidence ✅ SHOW
```

```
Finding: Consider adding more comments
- No specific location (-20)
- Style preference (-20)
- Not in PREFERENCES.md (-10)
= 30 confidence ❌ FILTER
```
</confidence_criteria>

#### Step 2: Present Findings for Triage

For EACH finding (with confidence ≥80), present in this format:

```
---
Finding #X: [Brief Title]

Confidence: [Score]/100 ✅
Severity: 🔴 P1 / 🟡 P2 / 🔵 P3

Category: [Security/Performance/Architecture/Quality/etc.]

Description:
[Detailed explanation of the issue or improvement]

Location: [file_path:line_number]

Problem:
[What's wrong or could be better]

Impact:
[Why this matters, what could happen]

Proposed Solution:
[How to fix it]

Effort: Small/Medium/Large

Evidence:
- [Why confidence is high - specific indicators]

---
Do you want to add this to the todo list?
1. yes - create todo file
2. next - skip this finding
3. custom - modify before creating
```

**Note**: Findings with confidence <80 are automatically filtered and not shown.

#### Step 3: Create Todo Files for Approved Findings

<instructions>
When user says "yes", create a properly formatted todo file:
</instructions>

<todo_creation_process>

1. **Determine next issue ID:**
   ```bash
   ls todos/ | grep -o '^[0-9]\+' | sort -n | tail -1
   ```

2. **Generate filename:**
   ```
   {next_id}-pending-{priority}-{brief-description}.md
   ```
   Example: `042-pending-p1-sql-injection-risk.md`

3. **Create file from template:**
   ```bash
   cp todos/000-pending-p1-TEMPLATE.md todos/{new_filename}
   ```

4. **Populate with finding data:**
   ```yaml
   ---
   status: pending
   priority: p1  # or p2, p3 based on severity
   issue_id: "042"
   tags: [code-review, security, rails]  # add relevant tags
   dependencies: []
   ---

   # [Finding Title]

   ## Problem Statement
   [Detailed description from finding]

   ## Findings
   - Discovered during code review by [agent names]
   - Location: [file_path:line_number]
   - [Key discoveries from agents]

   ## Proposed Solutions

   ### Option 1: [Primary solution from finding]
   - **Pros**: [Benefits]
   - **Cons**: [Drawbacks]
   - **Effort**: [Small/Medium/Large]
   - **Risk**: [Low/Medium/High]

   ## Recommended Action
   [Leave blank - needs manager triage]

   ## Technical Details
   - **Affected Files**: [List from finding]
   - **Related Components**: [Models, controllers, services affected]
   - **Database Changes**: [Yes/No - describe if yes]

   ## Resources
   - Code review PR: [PR link if applicable]
   - Related findings: [Other finding numbers]
   - Agent reports: [Which agents flagged this]

   ## Acceptance Criteria
   - [ ] [Specific criteria based on solution]
   - [ ] Tests pass
   - [ ] Code reviewed

   ## Work Log

   ### {date} - Code Review Discovery
   **By:** Claude Code Review System
   **Actions:**
   - Discovered during comprehensive code review
   - Analyzed by multiple specialized agents
   - Categorized and prioritized

   **Learnings:**
   - [Key insights from agent analysis]

   ## Notes
   Source: Code review performed on {date}
   Review command: /workflows:review {arguments}
   ```

5. **Track creation:**
   Add to TodoWrite list if tracking multiple findings

</todo_creation_process>

#### Step 4: Summary Report

After processing all findings:

```markdown
## Code Review Complete

**Review Target:** [PR number or branch]
**Total Findings:** [X] (from all agents)
**High-Confidence (≥80):** [Y] (shown to user)
**Filtered (<80):** [Z] (auto-removed as likely false positives)
**Todos Created:** [W]

### Confidence Distribution:
- 90-100 (certain): [count]
- 80-89 (confident): [count]
- <80 (filtered): [count]

### Created Todos:
- `{issue_id}-pending-p1-{description}.md` - {title} (confidence: 95)
- `{issue_id}-pending-p2-{description}.md` - {title} (confidence: 85)
...

### Skipped Findings (User Choice):
- [Finding #Z]: {reason}
...

### Auto-Filtered (Low Confidence):
- [X] findings filtered with confidence <80
- Run with `--show-all` flag to see filtered findings

### Next Steps:
1. Triage pending todos: `ls todos/*-pending-*.md`
2. Use `/triage` to review and approve
3. Work on approved items: `/resolve_todo_parallel`
```

#### Alternative: Batch Creation

If user wants to convert all findings to todos without review:

```bash
# Ask: "Create todos for all X findings? (yes/no/show-critical-only)"
# If yes: create todo files for all findings in parallel
# If show-critical-only: only present P1 findings for triage
```
