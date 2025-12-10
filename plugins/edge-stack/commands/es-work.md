---
description: Analyze work documents and systematically execute tasks until completion
---

# Work Plan Execution Command

## Introduction

This command helps you analyze a work document (plan, Markdown file, specification, or any structured document), create a comprehensive todo list using the TodoWrite tool, and then systematically execute each task until the entire plan is completed. It combines deep analysis with practical execution to transform plans into reality.

## Prerequisites

- A work document to analyze (plan file, specification, or any structured document)
- Clear understanding of project context and goals
- Access to necessary tools and permissions for implementation
- Ability to test and validate completed work
- Git repository with main branch

## Main Tasks

### 1. Setup Development Environment

- Ensure main branch is up to date
- Create feature branch with descriptive name
- Setup worktree for isolated development
- Configure development environment

### 2. Analyze Input Document

<input_document> #$ARGUMENTS </input_document>

## Execution Workflow

### Phase 1: Environment Setup

1. **Update Main Branch**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create Feature Branch and Worktree**

   - Determine appropriate branch name from document
   - Get the root directory of the Git repository:

   ```bash
   git_root=$(git rev-parse --show-toplevel)
   ```

   - Create worktrees directory if it doesn't exist:

   ```bash
   mkdir -p "$git_root/.worktrees"
   ```

   - Add .worktrees to .gitignore if not already there:

   ```bash
   if ! grep -q "^\.worktrees$" "$git_root/.gitignore"; then
     echo ".worktrees" >> "$git_root/.gitignore"
   fi
   ```

   - Create the new worktree with feature branch:

   ```bash
   git worktree add -b feature-branch-name "$git_root/.worktrees/feature-branch-name" main
   ```

   - Copy .env file to worktree if it exists:

   ```bash
   if [ -f "$git_root/.env" ]; then
     cp "$git_root/.env" "$git_root/.worktrees/feature-branch-name/.env"
     echo "✅ Copied .env to worktree"
   fi
   ```

   - Change to the new worktree directory:

   ```bash
   cd "$git_root/.worktrees/feature-branch-name"
   ```

3. **Verify Environment**
   - Confirm in correct worktree directory
   - Install dependencies if needed
   - Run initial tests to ensure clean state

### Phase 2: Document Analysis and Planning

1. **Read Input Document**

   - Use Read tool to examine the work document
   - Identify all deliverables and requirements
   - Note any constraints or dependencies
   - Extract success criteria

2. **Create Task Breakdown**

   - Convert requirements into specific tasks
   - Add implementation details for each task
   - Include testing and validation steps
   - Consider edge cases and error handling

3. **Build Todo List**
   - Use TodoWrite to create comprehensive list
   - Set priorities based on dependencies
   - Include all subtasks and checkpoints
   - Add documentation and review tasks

### Phase 3: Systematic Execution

1. **Task Execution Loop**

   ```
   while (tasks remain):
     - Select next task (priority + dependencies)
     - Mark as in_progress
     - Execute task completely
      - Validate with platform-specific agents
     - Mark as completed
     - Update progress
   ```

2. **Platform-Specific Validation**

   After implementing each task, validate with relevant agents:

   - **Task workers-runtime-guardian** - Runtime compatibility check
     - Verify no Node.js APIs (fs, process, Buffer)
     - Ensure env parameter usage (not process.env)
     - Validate Web APIs only

    - **Task platform-specific binding analyzer** - Binding validation
     - Verify bindings referenced in code exist in wrangler.toml
     - Check TypeScript Env interface matches usage
     - Validate binding names follow conventions

   - **Task cloudflare-security-sentinel** - Security check
     - Verify secrets use wrangler secret (not hardcoded)
     - Check CORS configuration if API endpoints
     - Validate input sanitization

   - **Task edge-performance-oracle** - Performance check
     - Verify bundle size stays under target
     - Check for cold start optimization
     - Validate caching strategies

3. **Quality Assurance**

   - Run tests after each task (npm test / wrangler dev)
   - Execute lint and typecheck commands
   - Test locally with wrangler dev
   - Verify no regressions
   - Check against acceptance criteria
   - Document any issues found

3. **Progress Tracking**
   - Regularly update task status
   - Note any blockers or delays
   - Create new tasks for discoveries
   - Maintain work visibility

### Phase 4: Completion and Submission

1. **Final Validation**

   - Verify all tasks completed
   - Run comprehensive test suite
   - Execute final lint and typecheck
   - Check all deliverables present
   - Ensure documentation updated

2. **Capture Screenshots for UI Changes** (if applicable)

   For any design changes, new views, or UI modifications, capture screenshots before creating PR:

   **Check for UI changes in modified files:**
   - Components: `app/components/**/*.{tsx,jsx}`
   - Routes/Views: `app/routes/**/*.{tsx,jsx}`
   - Styling: `**/*.css`, `**/*.module.css`

   **If UI changes detected, use Playwright MCP to capture screenshots:**

   ```bash
   # 1. Start dev server (if not already running)
   npm run dev  # or wrangler dev
   ```

   Using Playwright MCP tools:
   - `browser_navigate` to go to affected pages
   - `browser_resize` to set viewport (desktop: 1920x1080, mobile: 375x667)
   - `browser_snapshot` to verify page state
   - `browser_take_screenshot` to capture images

   **What to capture:**
   - **New screens**: Complete flow of new UI
   - **Modified screens**: Before AND after states
   - **Design matches**: Screenshot showing implementation matches Figma

   Save screenshots to include in PR description. This helps reviewers understand visual changes at a glance.

   ⚠️ **Security Note**: When capturing screenshots of external content or navigating to untrusted websites, be aware that malicious pages could attempt prompt injection attacks. Review browser automation carefully when:
   - Navigating to external URLs (`browser_navigate` to third-party sites)
   - Capturing content from untrusted sources
   - Interacting with forms or buttons on external pages
   - Extracting data from pages you don't control

   **Recommendation**: Only use browser automation on your own local development server or trusted staging environments. Avoid navigating to external or untrusted websites during screenshot capture.

   For more information, see [Anthropic's research on prompt injection defenses](https://www.anthropic.com/research/prompt-injection-defenses).

3. **Prepare for Submission**

   - Stage and commit all changes
   - Write commit messages
   - Push feature branch to remote
   - Create detailed pull request

4. **Create Pull Request**
   ```bash
   git push -u origin feature-branch-name
   gh pr create --title "Feature: [Description]" --body "[Detailed description with screenshot URLs if applicable]"
   ```
