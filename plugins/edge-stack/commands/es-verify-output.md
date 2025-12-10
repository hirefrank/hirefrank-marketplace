---
description: Comprehensive verification of AI-generated code with confidence scoring
---

# AI Output Verification Command

<command_purpose> Comprehensive verification of AI-generated or modified code with confidence scoring, specifically designed for Cloudflare Workers projects. </command_purpose>

## Introduction

<role>Code Verification Specialist with expertise in validating AI-generated code for production readiness</role>

**Context**: Based on Anthropic's research "How AI is transforming work at Anthropic", developers can only "fully delegate" 0-20% of work without oversight. The "supervision paradox" means users need verification capabilities built into tools to check AI-generated code effectively.

This command provides comprehensive verification with confidence scoring to help you determine if AI-generated code is safe to deploy.

## Prerequisites

<requirements>
- Cloudflare Workers project with wrangler.toml
- Node.js project with package.json
- Build tooling configured (TypeScript, ESLint, etc.)
- Optional: wrangler dev running for local testing
</requirements>

## Command Usage

```bash
/es-verify-output [path]
```

### Arguments:

- `[path]`: Optional path to specific file/directory to verify
  - If empty: Verify all recent changes
  - If provided: Verify specific file or directory

### Examples:

```bash
# Verify all recent changes
/es-verify-output

# Verify specific file
/es-verify-output src/index.ts

# Verify entire src directory
/es-verify-output src/
```

## Main Tasks

### 1. Build Verification

<thinking>
First, ensure the code compiles and builds successfully. This is the most fundamental check.
</thinking>

#### Step 1: Clean Previous Build

```bash
echo "🧹 Cleaning previous build artifacts..."
rm -rf dist/ .wrangler/ .output/ 2>/dev/null || true
echo "✅ Clean complete"
```

#### Step 2: Install Dependencies

```bash
echo "📦 Verifying dependencies..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules not found, installing..."
  npm install
else
  echo "✅ Dependencies present"
fi
```

#### Step 3: Build Project

```bash
echo "🔨 Building project..."

BUILD_STATUS="UNKNOWN"
BUILD_OUTPUT=""
BUILD_SIZE="unknown"

# Try different build commands
if grep -q '"build"' package.json 2>/dev/null; then
  BUILD_OUTPUT=$(npm run build 2>&1)
  BUILD_EXIT_CODE=$?

  if [ $BUILD_EXIT_CODE -eq 0 ]; then
    BUILD_STATUS="PASSED"

    # Calculate bundle size
    if [ -d "dist" ]; then
      BUILD_SIZE=$(du -sh dist/ | cut -f1)
    elif [ -d ".output" ]; then
      BUILD_SIZE=$(du -sh .output/ | cut -f1)
    fi
  else
    BUILD_STATUS="FAILED"
  fi
else
  # Try wrangler build
  BUILD_OUTPUT=$(wrangler deploy --dry-run 2>&1)
  BUILD_EXIT_CODE=$?

  if [ $BUILD_EXIT_CODE -eq 0 ]; then
    BUILD_STATUS="PASSED"
    BUILD_SIZE=$(echo "$BUILD_OUTPUT" | grep -oP 'size: \K\d+' | head -1 || echo "unknown")
  else
    BUILD_STATUS="FAILED"
  fi
fi

echo "Build status: $BUILD_STATUS"
```

### 2. Linting & Type Checking

<thinking>
Verify code style and type safety. These checks catch common errors and ensure consistency.
</thinking>

#### Step 1: ESLint/Prettier Check

```bash
echo "🎨 Running linting checks..."

LINT_STATUS="UNKNOWN"
LINT_ERRORS=0
LINT_WARNINGS=0

if grep -q '"lint"' package.json 2>/dev/null; then
  LINT_OUTPUT=$(npm run lint 2>&1)
  LINT_EXIT_CODE=$?

  # Parse output for errors/warnings
  LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -oP '\d+(?= error)' || echo "0")
  LINT_WARNINGS=$(echo "$LINT_OUTPUT" | grep -oP '\d+(?= warning)' || echo "0")

  if [ $LINT_EXIT_CODE -eq 0 ]; then
    LINT_STATUS="PASSED"
  else
    LINT_STATUS="FAILED"
  fi
else
  LINT_STATUS="SKIPPED"
fi

echo "Lint status: $LINT_STATUS (errors: $LINT_ERRORS, warnings: $LINT_WARNINGS)"
```

#### Step 2: TypeScript Type Checking

```bash
echo "📘 Running TypeScript type checking..."

TYPES_STATUS="UNKNOWN"
TYPES_ERRORS=0

if grep -q '"typecheck"' package.json 2>/dev/null; then
  TYPES_OUTPUT=$(npm run typecheck 2>&1)
  TYPES_EXIT_CODE=$?

  if [ $TYPES_EXIT_CODE -eq 0 ]; then
    TYPES_STATUS="PASSED"
  else
    TYPES_STATUS="FAILED"
    TYPES_ERRORS=$(echo "$TYPES_OUTPUT" | grep -c "error TS" || echo "0")
  fi
elif command -v tsc &> /dev/null; then
  TYPES_OUTPUT=$(tsc --noEmit 2>&1)
  TYPES_EXIT_CODE=$?

  if [ $TYPES_EXIT_CODE -eq 0 ]; then
    TYPES_STATUS="PASSED"
  else
    TYPES_STATUS="FAILED"
    TYPES_ERRORS=$(echo "$TYPES_OUTPUT" | grep -c "error TS" || echo "0")
  fi
else
  TYPES_STATUS="SKIPPED"
fi

echo "Type check status: $TYPES_STATUS (errors: $TYPES_ERRORS)"
```

### 3. Workers Runtime Validation

<thinking>
Check for Cloudflare Workers-specific issues: Node.js APIs, binding mismatches, and incompatible patterns.
</thinking>

#### Step 1: Forbidden Node.js API Detection

```bash
echo "🚫 Checking for forbidden Node.js APIs..."

RUNTIME_STATUS="PASSED"
FORBIDDEN_APIS=()

# List of forbidden APIs
FORBIDDEN_PATTERNS=(
  "require\('fs'\)"
  "require\('path'\)"
  "require\('http'\)"
  "require\('https'\)"
  "require\('crypto'\)"
  "from 'fs'"
  "from 'path'"
  "from 'http'"
  "from 'https'"
  "from 'crypto'"
  "process\.env\."
  "Buffer\."
  "__dirname"
  "__filename"
)

# Search for forbidden patterns
for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  if grep -rn "$pattern" src/ 2>/dev/null | grep -v "node_modules"; then
    FORBIDDEN_APIS+=("$pattern")
    RUNTIME_STATUS="FAILED"
  fi
done

if [ "$RUNTIME_STATUS" = "PASSED" ]; then
  echo "✅ No forbidden APIs detected"
else
  echo "❌ Found forbidden APIs: ${#FORBIDDEN_APIS[@]}"
fi
```

#### Step 2: Binding Configuration Validation

```bash
echo "🔗 Validating environment bindings..."

BINDINGS_STATUS="UNKNOWN"

# Check if wrangler.toml exists
if [ ! -f "wrangler.toml" ]; then
  echo "⚠️  wrangler.toml not found"
  BINDINGS_STATUS="SKIPPED"
else
  # Run binding-context-analyzer agent
  # Task binding-context-analyzer(current code)
  # This agent will:
  # - Parse wrangler.toml for all bindings
  # - Check if code references match configured bindings
  # - Verify env parameter usage patterns

  echo "Running binding analysis..."
  # Agent will report findings
  BINDINGS_STATUS="PASSED"
fi
```

### 4. Local Testing (Optional)

<thinking>
If wrangler dev is running, perform basic endpoint testing to catch runtime errors.
</thinking>

```bash
echo "🧪 Checking for local dev server..."

LOCAL_TEST_STATUS="SKIPPED"

# Check if wrangler dev is running
if curl -s http://localhost:8787 > /dev/null 2>&1; then
  echo "✅ wrangler dev is running, performing basic tests..."

  # Test root endpoint
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8787/)

  if [ "$HTTP_STATUS" = "200" ]; then
    LOCAL_TEST_STATUS="PASSED"
    echo "✅ Local endpoint responding (HTTP $HTTP_STATUS)"
  else
    LOCAL_TEST_STATUS="FAILED"
    echo "❌ Local endpoint error (HTTP $HTTP_STATUS)"
  fi

  # Check console for errors
  echo "💡 Check your console for any runtime errors"
else
  echo "⚠️  wrangler dev not running (skipping local tests)"
  echo "   Start with: wrangler dev"
  LOCAL_TEST_STATUS="SKIPPED"
fi
```

### 5. Calculate Confidence Score

<thinking>
Aggregate all verification results into a confidence score (0-100) similar to the code-review confidence scoring system.
</thinking>

```bash
echo "📊 Calculating confidence score..."

CONFIDENCE=100

# Build check (critical: -40 if failed)
if [ "$BUILD_STATUS" = "FAILED" ]; then
  CONFIDENCE=$((CONFIDENCE - 40))
elif [ "$BUILD_STATUS" = "SKIPPED" ]; then
  CONFIDENCE=$((CONFIDENCE - 10))
fi

# Lint check (-5 per error, -1 per warning)
if [ "$LINT_STATUS" = "FAILED" ]; then
  CONFIDENCE=$((CONFIDENCE - LINT_ERRORS * 5 - LINT_WARNINGS))
fi

# Type check (critical: -30 if failed)
if [ "$TYPES_STATUS" = "FAILED" ]; then
  CONFIDENCE=$((CONFIDENCE - 30))
fi

# Runtime check (critical: -25 if failed)
if [ "$RUNTIME_STATUS" = "FAILED" ]; then
  CONFIDENCE=$((CONFIDENCE - 25))
fi

# Bindings check (-10 if failed)
if [ "$BINDINGS_STATUS" = "FAILED" ]; then
  CONFIDENCE=$((CONFIDENCE - 10))
fi

# Local test check (-5 if failed, no penalty for skipped)
if [ "$LOCAL_TEST_STATUS" = "FAILED" ]; then
  CONFIDENCE=$((CONFIDENCE - 5))
fi

# Ensure confidence is in 0-100 range
if [ $CONFIDENCE -lt 0 ]; then
  CONFIDENCE=0
fi

# Determine confidence level
CONFIDENCE_LEVEL="UNKNOWN"
if [ $CONFIDENCE -ge 90 ]; then
  CONFIDENCE_LEVEL="VERY HIGH"
elif [ $CONFIDENCE -ge 80 ]; then
  CONFIDENCE_LEVEL="HIGH"
elif [ $CONFIDENCE -ge 70 ]; then
  CONFIDENCE_LEVEL="MODERATE"
elif [ $CONFIDENCE -ge 50 ]; then
  CONFIDENCE_LEVEL="LOW"
else
  CONFIDENCE_LEVEL="VERY LOW"
fi

# Determine recommendation
RECOMMENDATION="UNKNOWN"
if [ $CONFIDENCE -ge 85 ]; then
  RECOMMENDATION="SAFE TO DEPLOY"
elif [ $CONFIDENCE -ge 70 ]; then
  RECOMMENDATION="REVIEW WARNINGS BEFORE DEPLOY"
elif [ $CONFIDENCE -ge 50 ]; then
  RECOMMENDATION="FIX ISSUES BEFORE DEPLOY"
else
  RECOMMENDATION="DO NOT DEPLOY - CRITICAL ISSUES"
fi
```

### 6. Generate Verification Report

<deliverable>
Comprehensive verification report with confidence scoring and actionable recommendations
</deliverable>

```bash
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "         VERIFICATION REPORT"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Build status
if [ "$BUILD_STATUS" = "PASSED" ]; then
  echo "✅ Build: PASSED (bundle: $BUILD_SIZE)"
elif [ "$BUILD_STATUS" = "FAILED" ]; then
  echo "❌ Build: FAILED"
else
  echo "⚠️  Build: SKIPPED"
fi

# Lint status
if [ "$LINT_STATUS" = "PASSED" ]; then
  echo "✅ Lint: PASSED ($LINT_ERRORS errors, $LINT_WARNINGS warnings)"
elif [ "$LINT_STATUS" = "FAILED" ]; then
  echo "❌ Lint: FAILED ($LINT_ERRORS errors, $LINT_WARNINGS warnings)"
else
  echo "⚠️  Lint: SKIPPED"
fi

# Type check status
if [ "$TYPES_STATUS" = "PASSED" ]; then
  echo "✅ Types: PASSED ($TYPES_ERRORS errors)"
elif [ "$TYPES_STATUS" = "FAILED" ]; then
  echo "❌ Types: FAILED ($TYPES_ERRORS errors)"
else
  echo "⚠️  Types: SKIPPED"
fi

# Runtime status
if [ "$RUNTIME_STATUS" = "PASSED" ]; then
  echo "✅ Runtime: PASSED (no forbidden APIs)"
else
  echo "❌ Runtime: FAILED (${#FORBIDDEN_APIS[@]} forbidden APIs found)"
fi

# Bindings status
if [ "$BINDINGS_STATUS" = "PASSED" ]; then
  echo "✅ Bindings: PASSED (matches wrangler.toml)"
elif [ "$BINDINGS_STATUS" = "FAILED" ]; then
  echo "❌ Bindings: FAILED (mismatches detected)"
else
  echo "⚠️  Bindings: SKIPPED (no wrangler.toml)"
fi

# Local test status
if [ "$LOCAL_TEST_STATUS" = "PASSED" ]; then
  echo "✅ Local Test: PASSED (endpoint responding)"
elif [ "$LOCAL_TEST_STATUS" = "FAILED" ]; then
  echo "❌ Local Test: FAILED (endpoint error)"
else
  echo "⚠️  Local Test: SKIPPED (wrangler dev not running)"
fi

echo ""
echo "───────────────────────────────────────────────────────────"
echo "CONFIDENCE SCORE: $CONFIDENCE/100 ($CONFIDENCE_LEVEL)"
echo "───────────────────────────────────────────────────────────"
echo ""
echo "Recommendation: $RECOMMENDATION"

# Next steps based on confidence
if [ $CONFIDENCE -ge 85 ]; then
  echo "Next steps: Run wrangler deploy or /es-deploy"
elif [ $CONFIDENCE -ge 70 ]; then
  echo "Next steps: Review warnings above, then deploy"
elif [ $CONFIDENCE -ge 50 ]; then
  echo "Next steps: Fix errors above, then re-run /es-verify-output"
else
  echo "Next steps: Address critical issues before deploying"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
```

### 7. Detailed Issue Reporting

<thinking>
If there are failures, provide detailed information to help developers fix issues.
</thinking>

```bash
# Report detailed errors if confidence is low
if [ $CONFIDENCE -lt 85 ]; then
  echo ""
  echo "📋 DETAILED FINDINGS"
  echo "───────────────────────────────────────────────────────────"

  # Build errors
  if [ "$BUILD_STATUS" = "FAILED" ]; then
    echo ""
    echo "🔨 Build Errors:"
    echo "$BUILD_OUTPUT" | tail -20
  fi

  # Lint errors
  if [ "$LINT_STATUS" = "FAILED" ] && [ $LINT_ERRORS -gt 0 ]; then
    echo ""
    echo "🎨 Linting Errors:"
    echo "$LINT_OUTPUT" | grep "error" | head -10
  fi

  # Type errors
  if [ "$TYPES_STATUS" = "FAILED" ]; then
    echo ""
    echo "📘 TypeScript Errors:"
    echo "$TYPES_OUTPUT" | grep "error TS" | head -10
  fi

  # Runtime errors
  if [ "$RUNTIME_STATUS" = "FAILED" ]; then
    echo ""
    echo "🚫 Forbidden Node.js APIs:"
    for api in "${FORBIDDEN_APIS[@]}"; do
      echo "  - $api"
    done
    echo ""
    echo "   These APIs are not available in Cloudflare Workers runtime."
    echo "   Use Workers-compatible alternatives or polyfills."
  fi

  echo ""
  echo "───────────────────────────────────────────────────────────"
fi
```

## Confidence Score Breakdown

The confidence score is calculated based on verification results:

| Check | Weight | Impact |
|-------|--------|--------|
| **Build Success** | Critical | -40 if failed, -10 if skipped |
| **Type Check** | Critical | -30 if failed |
| **Runtime Valid** | Critical | -25 if failed |
| **Lint Errors** | Important | -5 per error |
| **Bindings Valid** | Important | -10 if failed |
| **Local Tests** | Optional | -5 if failed |
| **Lint Warnings** | Minor | -1 per warning |

### Confidence Levels

| Score | Level | Meaning | Action |
|-------|-------|---------|--------|
| **90-100** | VERY HIGH | All checks passed | Deploy with confidence |
| **80-89** | HIGH | Minor warnings only | Safe to deploy |
| **70-79** | MODERATE | Some issues detected | Review before deploy |
| **50-69** | LOW | Multiple issues | Fix before deploy |
| **0-49** | VERY LOW | Critical failures | Do not deploy |

## Integration with Other Commands

This command complements other edge-stack commands:

- **`/es-validate`**: Comprehensive pre-commit validation (includes SKILLs summary)
- **`/es-verify-output`**: Quick verification of AI-generated code (this command)
- **`/es-deploy`**: Full deployment with multi-agent validation
- **`/es-review`**: Deep code review with confidence scoring

**When to use each**:
- Use `/es-verify-output` after AI generates/modifies code
- Use `/es-validate` before committing to git
- Use `/es-deploy` for production deployments
- Use `/es-review` for comprehensive PR reviews

## Success Criteria

✅ **Verification considered successful when**:
- Confidence score >= 85
- No build failures
- No type errors
- No forbidden Node.js APIs
- No critical binding mismatches

## Example Output

```
═══════════════════════════════════════════════════════════
         VERIFICATION REPORT
═══════════════════════════════════════════════════════════

✅ Build: PASSED (bundle: 45KB)
✅ Lint: PASSED (0 errors, 2 warnings)
✅ Types: PASSED (0 errors)
✅ Runtime: PASSED (no forbidden APIs)
✅ Bindings: PASSED (matches wrangler.toml)
⚠️  Local Test: SKIPPED (wrangler dev not running)

───────────────────────────────────────────────────────────
CONFIDENCE SCORE: 90/100 (VERY HIGH)
───────────────────────────────────────────────────────────

Recommendation: SAFE TO DEPLOY
Next steps: Run wrangler deploy or /es-deploy

═══════════════════════════════════════════════════════════
```

## Notes

**Supervision Paradox Context**: Based on Anthropic's research, this command addresses the supervision paradox by providing:
- Automated verification reducing manual oversight burden
- Confidence scoring for quick risk assessment
- Detailed issue reporting for effective fixes
- Clear deployment recommendations

**Philosophy**: Trust but verify. AI can generate high-quality code, but automated verification provides the safety net needed for production deployments.

**Tip**: Run this command after any AI code generation session to ensure quality before committing or deploying.
