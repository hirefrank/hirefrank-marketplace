---
name: es-validate
description: Run pre-deployment validation with Hard Tools
---

# Edge Stack Validation

Run comprehensive pre-deployment validation using deterministic Hard Tools.

## Usage

```
/es-validate              Full validation suite
/es-validate --quick      Runtime check only
/es-validate --fix        Attempt auto-fixes where possible
```

## Workflow

This command executes `bin/es-validate.sh` which runs:

1. **Runtime Validation** (`validate-runtime.js`)
   - Detects Node.js API usage (fs, path, process, Buffer)
   - Checks for process.env usage (should use env parameter)
   - Validates Web API compatibility

2. **Binding Analysis** (`analyze-bindings.js`)
   - Parses wrangler.toml for configured bindings
   - Generates expected Env interface
   - Validates binding naming conventions

3. **UI Validation** (`validate-ui.js`)
   - Checks shadcn/ui component prop usage
   - Detects potentially hallucinated props
   - Validates className patterns

4. **TypeScript & Lint**
   - Runs `pnpm typecheck`
   - Runs `pnpm lint`

5. **Bundle Size Check**
   - Verifies bundle stays under 50KB target

## Output

Returns JSON validation results with:
- `critical`: Must-fix issues
- `warnings`: Should-review issues
- `passed`: Validation checks passed

## Execute

```bash
./bin/es-validate.sh $ARGUMENTS
```
