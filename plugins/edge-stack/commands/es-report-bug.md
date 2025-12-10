---
description: Report a bug in the edge-stack plugin with structured information
---

# Report Edge Stack Plugin Bug

<command_purpose> Report bugs encountered while using the edge-stack plugin. Gathers structured information and creates a GitHub issue for the maintainer. </command_purpose>

## Introduction

<role>Community Bug Reporter with structured issue creation workflow</role>

Help improve the edge-stack plugin by reporting bugs you encounter. This command guides you through a structured bug reporting process that collects all necessary information and creates a GitHub issue.

## Prerequisites

<requirements>
- GitHub CLI (`gh`) installed and authenticated
- Repository access to hirefrank/marketplace
</requirements>

## Main Tasks

### 1. Gather Bug Information

<thinking>
First, collect comprehensive information about the bug from the user through a series of targeted questions.
</thinking>

Use the AskUserQuestion tool to collect the following information:

**Question 1: Bug Category**
- What type of issue are you experiencing?
- Options:
  - Agent not working
  - Command not working
  - Skill not working
  - MCP server issue
  - Hooks not working
  - Installation problem
  - Deployment issue
  - Other

**Question 2: Specific Component**
- Which specific component is affected?
- Examples:
  - Agent name (e.g., "workers-runtime-guardian", "durable-objects-architect")
  - Command name (e.g., "/es-deploy", "/es-worker")
  - Skill name (e.g., "workers-runtime-validator", "cloudflare-security-checker")
  - MCP server name (e.g., "cloudflare-mcp", "wrangler-mcp")
  - Hook type (e.g., "PreToolUse", "PostToolUse")

**Question 3: What Happened (Actual Behavior)**
- Ask: "What happened when you used this component?"
- Get a clear, detailed description of the actual behavior
- Request any error messages seen

**Question 4: What Should Have Happened (Expected Behavior)**
- Ask: "What did you expect to happen instead?"
- Get a clear description of expected behavior

**Question 5: Steps to Reproduce**
- Ask: "What steps did you take before the bug occurred?"
- Request specific, sequential steps
- Example format:
  1. Run `/es-deploy`
  2. Confirm deployment
  3. See error...

**Question 6: Error Messages**
- Ask: "Did you see any error messages? Please share the complete error output."
- Capture full stack traces and error details

**Question 7: Additional Context (Optional)**
- Ask: "Is there any other information that might be helpful? (screenshots, logs, related issues, etc.)"
- Capture any supplementary information

### 2. Collect Environment Information

<thinking>
Automatically gather environment details to help with debugging. This includes plugin version, Claude Code version, OS info, and Cloudflare-specific tooling.
</thinking>

Run these commands to collect environment information:

```bash
# Get plugin version
PLUGIN_VERSION=$(cat ~/.claude/plugins/installed_plugins.json 2>/dev/null | grep -A5 "edge-stack" | grep "version" | head -1 | cut -d'"' -f4)
if [ -z "$PLUGIN_VERSION" ]; then
  PLUGIN_VERSION="Unknown (not found in installed_plugins.json)"
fi

# Get Claude Code version
CLAUDE_VERSION=$(claude --version 2>/dev/null || echo "Claude CLI version unknown")

# Get OS info
OS_INFO=$(uname -a)

# Get Cloudflare tooling versions (if available)
WRANGLER_VERSION=$(wrangler --version 2>/dev/null || echo "Not installed")
NODE_VERSION=$(node --version 2>/dev/null || echo "Not installed")

# Get git status (if in a repo)
GIT_STATUS=$(git status --short 2>/dev/null || echo "Not a git repository or git not available")
```

Store the collected information in variables for use in the bug report.

### 3. Format the Bug Report

<thinking>
Create a comprehensive, well-structured bug report that includes all collected information in a standardized format.
</thinking>

Create the bug report with this structure:

```markdown
## Bug Description

**Component:** [Type] - [Name]
**Category:** [Bug category from Question 1]

[Brief summary from collected information]

## Environment

- **Plugin Version:** [from plugin version check]
- **Claude Code Version:** [from claude --version]
- **Wrangler Version:** [from wrangler --version]
- **Node Version:** [from node --version]
- **OS:** [from uname -a]

## What Happened (Actual Behavior)

[Detailed description from Question 3]

## Expected Behavior

[Description from Question 4]

## Steps to Reproduce

[Numbered steps from Question 5]

## Error Messages

```
[Error output from Question 6, or "No error messages" if none]
```

## Additional Context

[Information from Question 7, or "None provided" if empty]

## Git Status (if applicable)

```
[Git status output, or "Not in a git repository"]
```

---
*Reported via `/es-report-bug` command*
```

### 4. Create GitHub Issue

<thinking>
Submit the bug report as a GitHub issue with appropriate labels and formatting.
</thinking>

#### Step 1: Prepare Issue Title

Create a concise, descriptive title:
```
[edge-stack] Bug: [Component] - [Brief description]
```

Example: `[edge-stack] Bug: /es-deploy - Fails with wrangler authentication error`

#### Step 2: Save Bug Report to Temporary File

```bash
# Create temp file with bug report content
BUG_REPORT_FILE=$(mktemp)
cat > "$BUG_REPORT_FILE" << 'EOF'
[Bug report markdown content from Step 3]
EOF
```

#### Step 3: Create GitHub Issue

Try to create the issue with the GitHub CLI:

```bash
gh issue create \
  --repo hirefrank/marketplace \
  --title "[edge-stack] Bug: [Brief description]" \
  --body-file "$BUG_REPORT_FILE" \
  --label "bug,edge-stack"
```

**Fallback if labels don't exist:**
```bash
gh issue create \
  --repo hirefrank/marketplace \
  --title "[edge-stack] Bug: [Brief description]" \
  --body-file "$BUG_REPORT_FILE"
```

**Fallback if `gh` CLI not authenticated:**

If the `gh` command fails with authentication error:
1. Display the formatted bug report to the user
2. Provide instructions:
```
GitHub CLI is not authenticated. Please either:

1. Run: gh auth login
   Then re-run this command

2. Or manually create an issue at:
   https://github.com/hirefrank/marketplace/issues/new

   And paste the bug report below:

[Display formatted bug report]
```

#### Step 4: Clean Up

```bash
rm -f "$BUG_REPORT_FILE"
```

### 5. Confirm Submission

<deliverable>
Provide clear confirmation of bug report submission with next steps
</deliverable>

**If issue created successfully:**

```
✅ Bug report submitted successfully!

Issue: https://github.com/hirefrank/marketplace/issues/[NUMBER]
Title: [edge-stack] Bug: [description]

Thank you for helping improve the edge-stack plugin!

Frank Harris (plugin maintainer) will review your report and respond as soon as possible.
You can track the issue at the URL above and will receive notifications when there are updates.

Next Steps:
- Watch the issue for maintainer response
- Be ready to provide additional details if requested
- Check for similar issues that might be related
```

**If manual submission required:**

```
⚠️ Unable to create GitHub issue automatically

Please create the issue manually at:
https://github.com/hirefrank/marketplace/issues/new

Title: [edge-stack] Bug: [description]

Body:
[Display complete formatted bug report]

Thank you for taking the time to report this bug!
```

## Error Handling

<error_handling>
Handle common error scenarios gracefully
</error_handling>

### Common Issues

**Issue**: `gh` CLI not installed
**Solution**:
```
Error: GitHub CLI (gh) is not installed.

Please install it:
- macOS: brew install gh
- Linux: See https://github.com/cli/cli#installation
- Windows: See https://github.com/cli/cli#installation

Then run: gh auth login

After authentication, re-run /es-report-bug
```

**Issue**: Not authenticated with GitHub
**Solution**: Display bug report and provide manual submission instructions

**Issue**: Repository not found or no permission
**Solution**:
```
Error: Cannot access hirefrank/marketplace repository.

Please verify:
1. You have internet connectivity
2. The repository exists at github.com/hirefrank/marketplace
3. You have permission to create issues

Manual submission option:
[Display bug report and manual submission instructions]
```

**Issue**: User cancels during question flow
**Solution**:
```
Bug report cancelled. No issue was created.

You can restart the bug reporting process anytime by running:
/es-report-bug
```

## Privacy Notice

<privacy_notice>
This command does NOT collect:
- Personal information beyond what you provide
- API keys, tokens, or credentials
- Private code from your projects
- File contents beyond basic git status
- Network requests or activity logs

Only technical information about the bug is included:
- Plugin and tool versions
- Operating system details
- Error messages you provide
- Steps to reproduce you describe
</privacy_notice>

## Best Practices

<best_practices>
Tips for writing effective bug reports:
</best_practices>

1. **Be Specific**: Provide exact component names and versions
2. **Include Context**: Describe what you were trying to accomplish
3. **Show, Don't Tell**: Include actual error messages, not paraphrases
4. **Minimal Reproduction**: Provide the simplest steps that trigger the bug
5. **One Bug Per Report**: File separate issues for different bugs
6. **Search First**: Check if similar issues already exist
7. **Stay Engaged**: Respond to maintainer questions promptly

## Output Format

The command produces:
1. Interactive question flow for bug details
2. Automatic environment information collection
3. Formatted bug report preview
4. GitHub issue creation or manual submission instructions
5. Confirmation with issue URL or fallback guidance

## Related Commands

- `/es-triage` - Triage and track findings
- `/es-issue` - Create feature requests and improvements
- `/es-review` - Comprehensive code review for quality issues

## Notes

- This command is for reporting plugin bugs, not application bugs
- For security vulnerabilities, contact the maintainer directly
- Screenshots and logs can be attached after issue creation
- The maintainer (Frank Harris) monitors all edge-stack issues
- Response time varies but typically within 24-48 hours
