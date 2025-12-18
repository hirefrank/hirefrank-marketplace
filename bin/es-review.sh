#!/usr/bin/env bash
#
# es-review - Edge Stack Code Review
#
# Performs exhaustive code reviews using "Hard Tools" first, then AI analysis.
# This is the token-efficient replacement for the markdown es-review.md command.
#
# Usage:
#   es-review [PR_NUMBER]      # Review a specific PR
#   es-review                   # Review the latest PR
#   es-review --local          # Review current branch changes
#
# The script:
#   1. Creates an isolated git worktree for the PR
#   2. Copies .env file (critical for Workers dev server)
#   3. Runs validation scripts (deterministic, never miss)
#   4. Boots OpenCode with @reviewer persona and script outputs
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_ROOT="$(git rev-parse --show-toplevel)"
OPENCODE_TOOLS="$GIT_ROOT/.opencode/tool"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Parse arguments
PR_NUMBER=""
LOCAL_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --local)
            LOCAL_MODE=true
            shift
            ;;
        --help)
            echo "Usage: es-review [PR_NUMBER] [--local]"
            echo ""
            echo "Options:"
            echo "  PR_NUMBER    Review a specific PR (default: latest)"
            echo "  --local      Review current branch without worktree"
            echo ""
            exit 0
            ;;
        *)
            PR_NUMBER="$1"
            shift
            ;;
    esac
done

# Get PR number if not specified
if [[ -z "$PR_NUMBER" ]] && [[ "$LOCAL_MODE" == false ]]; then
    log_info "Fetching latest PR..."
    PR_NUMBER=$(gh pr list --limit 1 --json number --jq '.[0].number' 2>/dev/null || echo "")
    if [[ -z "$PR_NUMBER" ]]; then
        log_error "No open PRs found. Use --local for local branch review."
        exit 1
    fi
    log_success "Found PR #$PR_NUMBER"
fi

# Set up review directory
if [[ "$LOCAL_MODE" == true ]]; then
    REVIEW_DIR="$GIT_ROOT"
    log_info "Running local review (no worktree)"
else
    WORKTREE_BASE="$GIT_ROOT/.worktrees/reviews"
    REVIEW_DIR="$WORKTREE_BASE/pr-$PR_NUMBER"

    # Create worktree
    log_info "Creating isolated worktree for PR #$PR_NUMBER..."
    mkdir -p "$WORKTREE_BASE"

    # Remove existing worktree if present
    if [[ -d "$REVIEW_DIR" ]]; then
        log_warn "Removing existing worktree..."
        git worktree remove "$REVIEW_DIR" --force 2>/dev/null || rm -rf "$REVIEW_DIR"
    fi

    # Create new worktree and checkout PR
    git worktree add "$REVIEW_DIR" --detach 2>/dev/null
    cd "$REVIEW_DIR"
    gh pr checkout "$PR_NUMBER"
    log_success "Worktree created at $REVIEW_DIR"

    # Copy .env file (critical for Workers dev server)
    if [[ -f "$GIT_ROOT/.env" ]]; then
        cp "$GIT_ROOT/.env" "$REVIEW_DIR/.env"
        log_success "Copied .env to worktree"
    else
        log_warn "No .env file found in repository root"
    fi
fi

cd "$REVIEW_DIR"

# Phase 1: Run Hard Tools (deterministic validation)
log_info "Phase 1: Running validation scripts..."

# Create temporary output directory
OUTPUT_DIR=$(mktemp -d)
trap "rm -rf $OUTPUT_DIR" EXIT

# Runtime validation
log_info "  → Checking Workers runtime compatibility..."
if [[ -d "src" ]]; then
    node "$OPENCODE_TOOLS/validate-runtime.js" src > "$OUTPUT_DIR/runtime.json" 2>/dev/null || true
    RUNTIME_CRITICAL=$(jq -r '.critical // 0' "$OUTPUT_DIR/runtime.json" 2>/dev/null || echo "0")
    if [[ "$RUNTIME_CRITICAL" -gt 0 ]]; then
        log_error "    Found $RUNTIME_CRITICAL critical runtime violations!"
    else
        log_success "    No runtime violations found"
    fi
else
    echo '{"scanned":"src","total":0,"critical":0,"warnings":0,"violations":[]}' > "$OUTPUT_DIR/runtime.json"
    log_warn "    No src/ directory found"
fi

# Binding analysis
log_info "  → Analyzing Cloudflare bindings..."
if [[ -f "wrangler.toml" ]]; then
    node "$OPENCODE_TOOLS/analyze-bindings.js" wrangler.toml > "$OUTPUT_DIR/bindings.json" 2>/dev/null || true
    BINDING_COUNT=$(jq -r '.summary | length' "$OUTPUT_DIR/bindings.json" 2>/dev/null || echo "0")
    log_success "    Found $BINDING_COUNT binding types"
else
    echo '{"error":"wrangler.toml not found","bindings":null}' > "$OUTPUT_DIR/bindings.json"
    log_warn "    No wrangler.toml found"
fi

# UI validation (if React components exist)
log_info "  → Validating UI components..."
if [[ -d "src/components" ]] || [[ -d "app/components" ]]; then
    COMP_DIR=$(ls -d src/components app/components 2>/dev/null | head -1)
    node "$OPENCODE_TOOLS/validate-ui.js" "$COMP_DIR" > "$OUTPUT_DIR/ui.json" 2>/dev/null || true
    UI_ERRORS=$(jq -r '.errors // 0' "$OUTPUT_DIR/ui.json" 2>/dev/null || echo "0")
    if [[ "$UI_ERRORS" -gt 0 ]]; then
        log_warn "    Found $UI_ERRORS potential UI prop issues"
    else
        log_success "    No UI prop issues found"
    fi
else
    echo '{"scanned":"none","total":0,"errors":0,"warnings":0,"issues":[]}' > "$OUTPUT_DIR/ui.json"
    log_info "    No component directories found"
fi

# Phase 2: Prepare context for OpenCode
log_info "Phase 2: Preparing AI analysis context..."

# Get PR info
if [[ "$LOCAL_MODE" == false ]]; then
    PR_INFO=$(gh pr view "$PR_NUMBER" --json title,body,files,commits 2>/dev/null || echo '{}')
    PR_TITLE=$(echo "$PR_INFO" | jq -r '.title // "Unknown"')
    PR_FILES=$(echo "$PR_INFO" | jq -r '.files[].path' 2>/dev/null | head -20 || echo "")
else
    PR_TITLE="Local changes on $(git branch --show-current)"
    PR_FILES=$(git diff --name-only HEAD~1 2>/dev/null || git diff --name-only --cached)
fi

# Create combined context file
CONTEXT_FILE="$OUTPUT_DIR/review-context.md"
cat > "$CONTEXT_FILE" << EOF
# Code Review Context

## Review Target
$(if [[ "$LOCAL_MODE" == true ]]; then echo "**Local Branch**: $(git branch --show-current)"; else echo "**PR #$PR_NUMBER**: $PR_TITLE"; fi)

## Validation Results (from Hard Tools)

### Runtime Validation
\`\`\`json
$(cat "$OUTPUT_DIR/runtime.json")
\`\`\`

### Binding Analysis
\`\`\`json
$(cat "$OUTPUT_DIR/bindings.json")
\`\`\`

### UI Validation
\`\`\`json
$(cat "$OUTPUT_DIR/ui.json")
\`\`\`

## Changed Files
\`\`\`
$PR_FILES
\`\`\`

## Instructions
1. The validation scripts above provide GROUND TRUTH - trust their results
2. Analyze findings with confidence scoring (80+ threshold to show)
3. Focus on Cloudflare-specific patterns:
   - Workers runtime compatibility
   - Resource selection (KV vs DO vs R2 vs D1)
   - Edge optimization
   - Binding patterns
4. Generate actionable findings with file:line locations
EOF

log_success "Context prepared"

# Phase 3: Launch OpenCode with @reviewer agent
log_info "Phase 3: Launching OpenCode analysis..."
echo ""
echo "================================================"
echo "Review context file: $CONTEXT_FILE"
echo "Worktree: $REVIEW_DIR"
echo ""
echo "To start the AI review, run:"
echo ""
echo "  opencode @reviewer < $CONTEXT_FILE"
echo ""
echo "Or manually:"
echo "  opencode"
echo "  Then: @reviewer Review the code based on the validation results"
echo "================================================"
echo ""

# If opencode is available, offer to start it
if command -v opencode &> /dev/null; then
    read -p "Start OpenCode now? [Y/n] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        cd "$REVIEW_DIR"
        cat "$CONTEXT_FILE" | opencode @reviewer
    fi
else
    log_warn "opencode CLI not found. Install from https://opencode.ai"
    echo ""
    echo "Context saved to: $CONTEXT_FILE"
fi
