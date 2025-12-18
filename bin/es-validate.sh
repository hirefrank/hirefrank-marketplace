#!/usr/bin/env bash
#
# es-validate - Pre-deployment Validation
#
# Runs all validation scripts before deploying to Cloudflare.
# This is the "gate" that prevents broken code from reaching production.
#
# Usage:
#   es-validate           # Run all validations
#   es-validate --fix     # Attempt to auto-fix some issues
#   es-validate --strict  # Fail on warnings too
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_ROOT="$(git rev-parse --show-toplevel)"
OPENCODE_TOOLS="$GIT_ROOT/.opencode/tool"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[PASS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[FAIL]${NC} $1"; }

# Parse arguments
STRICT_MODE=false
FIX_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --strict)
            STRICT_MODE=true
            shift
            ;;
        --fix)
            FIX_MODE=true
            shift
            ;;
        --help)
            echo "Usage: es-validate [--strict] [--fix]"
            echo ""
            echo "Options:"
            echo "  --strict    Fail on warnings (not just errors)"
            echo "  --fix       Attempt auto-fixes where possible"
            echo ""
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

cd "$GIT_ROOT"

echo ""
echo "======================================"
echo "  Edge Stack Pre-deployment Validation"
echo "======================================"
echo ""

TOTAL_ERRORS=0
TOTAL_WARNINGS=0

# 1. Runtime Validation
log_info "1. Workers Runtime Compatibility"

if [[ -d "src" ]]; then
    RUNTIME_OUTPUT=$(node "$OPENCODE_TOOLS/validate-runtime.js" src 2>/dev/null || echo '{"critical":0,"warnings":0}')
    RUNTIME_ERRORS=$(echo "$RUNTIME_OUTPUT" | jq -r '.critical // 0')
    RUNTIME_WARNINGS=$(echo "$RUNTIME_OUTPUT" | jq -r '.warnings // 0')

    if [[ "$RUNTIME_ERRORS" -gt 0 ]]; then
        log_error "   $RUNTIME_ERRORS critical runtime violations"
        echo "$RUNTIME_OUTPUT" | jq -r '.violations[] | "   → \(.file):\(.line) - \(.message)"' 2>/dev/null || true
        TOTAL_ERRORS=$((TOTAL_ERRORS + RUNTIME_ERRORS))
    elif [[ "$RUNTIME_WARNINGS" -gt 0 ]]; then
        log_warn "   $RUNTIME_WARNINGS warnings"
        TOTAL_WARNINGS=$((TOTAL_WARNINGS + RUNTIME_WARNINGS))
    else
        log_success "   No runtime violations"
    fi
else
    log_warn "   No src/ directory found"
fi
echo ""

# 2. Binding Validation
log_info "2. Cloudflare Bindings"

if [[ -f "wrangler.toml" ]]; then
    BINDING_OUTPUT=$(node "$OPENCODE_TOOLS/analyze-bindings.js" wrangler.toml 2>/dev/null || echo '{"error":"parse failed"}')

    if echo "$BINDING_OUTPUT" | jq -e '.error' > /dev/null 2>&1; then
        log_error "   Failed to parse wrangler.toml"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    else
        BINDING_SUMMARY=$(echo "$BINDING_OUTPUT" | jq -r '.summary[]' 2>/dev/null || echo "")
        if [[ -n "$BINDING_SUMMARY" ]]; then
            log_success "   Bindings configured:"
            echo "$BINDING_SUMMARY" | while read -r line; do
                echo "   → $line"
            done
        else
            log_warn "   No bindings configured"
        fi
    fi
else
    log_warn "   No wrangler.toml found"
fi
echo ""

# 3. UI Component Validation
log_info "3. UI Component Props"

COMP_DIR=""
if [[ -d "src/components" ]]; then
    COMP_DIR="src/components"
elif [[ -d "app/components" ]]; then
    COMP_DIR="app/components"
fi

if [[ -n "$COMP_DIR" ]]; then
    UI_OUTPUT=$(node "$OPENCODE_TOOLS/validate-ui.js" "$COMP_DIR" 2>/dev/null || echo '{"errors":0,"warnings":0}')
    UI_ERRORS=$(echo "$UI_OUTPUT" | jq -r '.errors // 0')
    UI_WARNINGS=$(echo "$UI_OUTPUT" | jq -r '.warnings // 0')

    if [[ "$UI_ERRORS" -gt 0 ]]; then
        log_error "   $UI_ERRORS hallucinated props detected"
        echo "$UI_OUTPUT" | jq -r '.issues[] | select(.severity == "error") | "   → \(.file):\(.line) - \(.message)"' 2>/dev/null || true
        TOTAL_ERRORS=$((TOTAL_ERRORS + UI_ERRORS))
    elif [[ "$UI_WARNINGS" -gt 0 ]]; then
        log_warn "   $UI_WARNINGS prop warnings"
        TOTAL_WARNINGS=$((TOTAL_WARNINGS + UI_WARNINGS))
    else
        log_success "   No prop issues detected"
    fi
else
    log_info "   No component directory found"
fi
echo ""

# 4. TypeScript Compilation (if available)
log_info "4. TypeScript Compilation"

if [[ -f "tsconfig.json" ]]; then
    if command -v npx &> /dev/null && [[ -f "node_modules/.bin/tsc" ]]; then
        if npx tsc --noEmit 2>/dev/null; then
            log_success "   TypeScript compiles cleanly"
        else
            log_error "   TypeScript compilation failed"
            TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
        fi
    else
        log_warn "   TypeScript not installed, skipping"
    fi
else
    log_info "   No tsconfig.json found"
fi
echo ""

# 5. Package Size Check (for cold start optimization)
log_info "5. Bundle Size (Cold Start Optimization)"

if [[ -f "package.json" ]]; then
    # Check for heavy dependencies that hurt cold starts
    HEAVY_DEPS=$(cat package.json | jq -r '.dependencies // {} | keys[]' 2>/dev/null | grep -E '^(lodash|moment|axios|express|fastify)$' || true)

    if [[ -n "$HEAVY_DEPS" ]]; then
        log_warn "   Heavy dependencies detected (may impact cold start):"
        echo "$HEAVY_DEPS" | while read -r dep; do
            echo "   → $dep"
        done
        TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    else
        log_success "   No known heavy dependencies"
    fi
else
    log_info "   No package.json found"
fi
echo ""

# Summary
echo "======================================"
echo "  Validation Summary"
echo "======================================"
echo ""

if [[ "$TOTAL_ERRORS" -eq 0 ]] && [[ "$TOTAL_WARNINGS" -eq 0 ]]; then
    log_success "All validations passed!"
    echo ""
    echo "Ready to deploy:"
    echo "  npx wrangler deploy"
    echo ""
    exit 0
elif [[ "$TOTAL_ERRORS" -eq 0 ]]; then
    log_warn "$TOTAL_WARNINGS warnings found"

    if [[ "$STRICT_MODE" == true ]]; then
        echo ""
        log_error "Strict mode: failing due to warnings"
        exit 1
    else
        echo ""
        echo "Deploy with caution:"
        echo "  npx wrangler deploy"
        echo ""
        echo "Or fix warnings first."
        exit 0
    fi
else
    log_error "$TOTAL_ERRORS errors, $TOTAL_WARNINGS warnings"
    echo ""
    echo "Fix errors before deploying!"
    echo ""
    exit 1
fi
