---
description: Generate Playwright E2E tests for Tanstack Start routes, server functions, and components
---

# Playwright Test Generator Command

<command_purpose> Automatically generate comprehensive Playwright tests for Tanstack Start routes, server functions, and components with Cloudflare Workers-specific patterns. </command_purpose>

## Introduction

<role>Senior QA Engineer specializing in test generation for Tanstack Start applications</role>

This command generates ready-to-use Playwright tests that cover:
- TanStack Router route loading and navigation
- Server function calls with Cloudflare bindings
- Component interactions
- Accessibility validation
- Error handling
- Loading states

## Prerequisites

<requirements>
- Playwright installed (`/es-test-setup`)
- Tanstack Start project
- Route or component to test
</requirements>

## Security Considerations

⚠️ **Security Note**: When generating tests that interact with external websites or untrusted content, be aware that malicious web pages could attempt prompt injection attacks against browser automation agents. Review generated test code carefully, especially:
- Navigation logic (`page.goto()` calls to external sites)
- Data extraction from untrusted pages
- Form filling with sensitive information
- Click actions on external sites

**Best Practices**:
- Test against your own controlled test environments when possible
- Review any navigation to external URLs in generated tests
- Avoid testing workflows that expose credentials to untrusted sites
- Use test fixtures and mocked data instead of live external APIs

For more information, see [Anthropic's research on prompt injection defenses](https://www.anthropic.com/research/prompt-injection-defenses).

## Command Usage

```bash
/es-test-gen <target> [options]
```

### Arguments:

- `<target>`: What to generate tests for
  - Route path: `/users/$id`, `/dashboard`, `/blog`
  - Server function: `src/lib/server-functions/createUser.ts`
  - Component: `src/components/UserCard.tsx`

- `[options]`: Optional flags:
  - `--with-auth`: Include authentication tests
  - `--with-server-fn`: Include server function tests
  - `--with-a11y`: Include accessibility tests (default: true)
  - `--output <path>`: Custom output path

### Examples:

```bash
# Generate tests for a route
/es-test-gen /users/$id

# Generate tests for server function
/es-test-gen src/lib/server-functions/createUser.ts --with-auth

# Generate tests for component
/es-test-gen src/components/UserCard.tsx --with-a11y
```

## Main Tasks

### 1. Analyze Target

<thinking>
Parse the target to understand what type of tests to generate.
</thinking>

```bash
# Determine target type
if [[ "$TARGET" == /* ]]; then
  TYPE="route"
elif [[ "$TARGET" == *server-functions* ]]; then
  TYPE="server-function"
elif [[ "$TARGET" == *components* ]]; then
  TYPE="component"
fi
```

### 2. Generate Route Tests

For route: `/users/$id`

**Task playwright-testing-specialist(analyze route and generate tests)**:
- Identify dynamic parameters
- Detect loaders and data dependencies
- Check for authentication requirements
- Generate test cases

**Output**: `e2e/routes/users.$id.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('User Profile Page', () => {
  const testUserId = '123'

  test('loads user profile successfully', async ({ page }) => {
    await page.goto(`/users/${testUserId}`)

    // Wait for loader to complete
    await page.waitForSelector('[data-testid="user-profile"]')

    // Verify user data displayed
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="user-email"]')).toBeVisible()
  })

  test('shows loading state during navigation', async ({ page }) => {
    await page.goto('/')

    // Navigate to user profile
    await page.click(`a[href="/users/${testUserId}"]`)

    // Verify loading indicator
    await expect(page.locator('[data-testid="loading"]')).toBeVisible()

    // Wait for content to load
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
  })

  test('handles non-existent user (404)', async ({ page }) => {
    const response = await page.goto('/users/999999')

    // Verify error state
    await expect(page.locator('text=/user not found/i')).toBeVisible()
  })

  test('has no accessibility violations', async ({ page }) => {
    await page.goto(`/users/${testUserId}`)

    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('navigates back correctly', async ({ page }) => {
    await page.goto(`/users/${testUserId}`)

    // Go back
    await page.goBack()

    // Verify we're back at previous page
    await expect(page).toHaveURL('/')
  })
})
```

### 3. Generate Server Function Tests

For: `src/lib/server-functions/createUser.ts`

**Output**: `e2e/server-functions/create-user.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Create User Server Function', () => {
  test('creates user successfully', async ({ page }) => {
    await page.goto('/users/new')

    // Fill form
    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="email"]', 'test@example.com')

    // Submit (calls server function)
    await page.click('button[type="submit"]')

    // Wait for redirect
    await page.waitForURL(/\/users\/\d+/)

    // Verify user created
    await expect(page.locator('h1')).toContainText('Test User')
  })

  test('validates required fields', async ({ page }) => {
    await page.goto('/users/new')

    // Submit empty form
    await page.click('button[type="submit"]')

    // Verify validation errors
    await expect(page.locator('[data-testid="name-error"]'))
      .toContainText(/required/i)
  })

  test('shows loading state during submission', async ({ page }) => {
    await page.goto('/users/new')

    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="email"]', 'test@example.com')

    // Start submission
    await page.click('button[type="submit"]')

    // Verify loading indicator
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
    await expect(page.locator('[data-testid="loading"]')).toBeVisible()
  })

  test('handles server errors gracefully', async ({ page }) => {
    await page.goto('/users/new')

    // Simulate server error by using invalid data
    await page.fill('[name="email"]', 'invalid-email')

    await page.click('button[type="submit"]')

    // Verify error message
    await expect(page.locator('[data-testid="error"]')).toBeVisible()
  })

  test('stores data in Cloudflare D1', async ({ page, request }) => {
    await page.goto('/users/new')

    const testEmail = `test-${Date.now()}@example.com`

    await page.fill('[name="name"]', 'D1 Test User')
    await page.fill('[name="email"]', testEmail)

    await page.click('button[type="submit"]')

    // Wait for creation
    await page.waitForURL(/\/users\/\d+/)

    // Verify data persisted (reload page)
    await page.reload()

    await expect(page.locator('[data-testid="user-email"]'))
      .toContainText(testEmail)
  })
})
```

### 4. Generate Component Tests

For: `src/components/UserCard.tsx`

**Output**: `e2e/components/user-card.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('UserCard Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to component demo/storybook page
    await page.goto('/components/user-card-demo')
  })

  test('renders user information correctly', async ({ page }) => {
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="user-email"]')).toBeVisible()
  })

  test('handles click interactions', async ({ page }) => {
    await page.click('[data-testid="user-card"]')

    // Verify click handler triggered
    await expect(page).toHaveURL(/\/users\/\d+/)
  })

  test('displays avatar image', async ({ page }) => {
    const avatar = page.locator('[data-testid="user-avatar"]')

    await expect(avatar).toBeVisible()

    // Verify image loaded
    await expect(avatar).toHaveJSProperty('complete', true)
  })

  test('has no accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="user-card"]')
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('keyboard navigation works', async ({ page }) => {
    // Tab to card
    await page.keyboard.press('Tab')

    // Verify focus
    await expect(page.locator('[data-testid="user-card"]')).toBeFocused()

    // Press Enter
    await page.keyboard.press('Enter')

    // Verify navigation
    await expect(page).toHaveURL(/\/users\/\d+/)
  })

  test('matches visual snapshot', async ({ page }) => {
    await expect(page.locator('[data-testid="user-card"]'))
      .toHaveScreenshot('user-card.png')
  })
})
```

### 5. Generate Authentication Tests (--with-auth)

**Output**: `e2e/auth/protected-route.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Protected Route - /users/$id', () => {
  test('redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/users/123')

    // Should redirect to login
    await page.waitForURL(/\/login/)

    // Verify redirect query param
    expect(page.url()).toContain('redirect=%2Fusers%2F123')
  })

  test('allows access when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Navigate to protected route
    await page.goto('/users/123')

    // Should not redirect
    await expect(page).toHaveURL('/users/123')
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
  })

  test('redirects to original destination after login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/users/123')

    // Should be on login page
    await page.waitForURL(/\/login/)

    // Login
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should redirect back to original destination
    await expect(page).toHaveURL('/users/123')
  })
})
```

### 6. Update Test Metadata

Add test to suite configuration:

```typescript
// e2e/test-registry.ts (auto-generated)
export const testRegistry = {
  routes: [
    'e2e/routes/users.$id.spec.ts',
    // ... other routes
  ],
  serverFunctions: [
    'e2e/server-functions/create-user.spec.ts',
    // ... other server functions
  ],
  components: [
    'e2e/components/user-card.spec.ts',
    // ... other components
  ],
}
```

### 7. Generate Test Documentation

**Output**: `e2e/routes/users.$id.README.md`

```markdown
# User Profile Route Tests

## Test Coverage

- ✅ Route loading with valid user ID
- ✅ Loading state during navigation
- ✅ 404 handling for non-existent users
- ✅ Accessibility (zero violations)
- ✅ Back navigation

## Running Tests

```bash
# Run all tests for this route
pnpm test:e2e e2e/routes/users.$id.spec.ts

# Run specific test
pnpm test:e2e e2e/routes/users.$id.spec.ts -g "loads user profile"

# Debug mode
pnpm test:e2e:debug e2e/routes/users.$id.spec.ts
```

## Test Data

Uses test user ID: `123` (configured in test fixtures)

## Dependencies

- Requires D1 database with test data
- Requires user with ID 123 to exist
```

## Test Generation Patterns

### Pattern: Dynamic Route Parameters

For `/blog/$category/$slug`:

```typescript
test.describe('Blog Post Page', () => {
  const testCategory = 'tech'
  const testSlug = 'tanstack-start-guide'

  test('loads blog post successfully', async ({ page }) => {
    await page.goto(`/blog/${testCategory}/${testSlug}`)

    await expect(page.locator('article')).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
  })
})
```

### Pattern: Search Params

For `/users?page=2&sort=name`:

```typescript
test.describe('Users List with Search Params', () => {
  test('paginates users correctly', async ({ page }) => {
    await page.goto('/users?page=2')

    // Verify page 2 content
    await expect(page.locator('[data-testid="pagination"]'))
      .toContainText('Page 2')
  })

  test('sorts users by name', async ({ page }) => {
    await page.goto('/users?sort=name')

    const userNames = await page.locator('[data-testid="user-name"]').allTextContents()

    // Verify sorted
    const sorted = [...userNames].sort()
    expect(userNames).toEqual(sorted)
  })
})
```

## Validation

After generating tests:

1. **Syntax check**: Verify TypeScript compiles
2. **Dry run**: Run tests without executing
3. **Coverage**: Ensure critical paths covered

```bash
# Check syntax
npx tsc --noEmit

# Dry run
pnpm test:e2e --list

# Run generated tests
pnpm test:e2e e2e/routes/users.$id.spec.ts
```

## Success Criteria

✅ Tests generated for target
✅ All tests pass on first run
✅ Accessibility tests included
✅ Error handling covered
✅ Loading states tested
✅ Documentation generated
✅ Test registered in test suite

## Resources

- **Playwright Best Practices**: https://playwright.dev/docs/best-practices
- **Testing TanStack Router**: https://tanstack.com/router/latest/docs/framework/react/guide/testing
- **Accessibility Testing**: https://playwright.dev/docs/accessibility-testing
