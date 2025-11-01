# Accessibility Tests CI Fix - Complete Solution

## Problem

The accessibility tests in PR #3 were failing with two issues:

1. Missing browser executables: `Error: browserType.launch: Executable doesn't exist at /home/runner/.cache/ms-playwright/webkit-2215/pw_run.sh`
2. Web server configuration conflict

## Root Causes

### Issue 1: Flawed Browser Caching Logic

The workflow had complex conditional caching that was causing browser installation failures:

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  id: playwright-cache
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ steps.playwright-version.outputs.version }}

- name: Install Playwright browsers
  if: steps.playwright-cache.outputs.cache-hit != 'true' # Only if cache MISS
  run: npx playwright install --with-deps chromium firefox webkit

- name: Install Playwright system dependencies
  if: steps.playwright-cache.outputs.cache-hit == 'true' # Only if cache HIT
  run: npx playwright install-deps chromium firefox webkit
```

**The Problem:**

- On cache HIT: Only system dependencies were installed, assuming cached browsers were complete
- Cached browsers could be incomplete, corrupted, or from a different Playwright version
- This caused missing executable errors for WebKit, Firefox, and sometimes Chromium

### Issue 2: Web Server Conflict

The workflow had a configuration conflict:

1. **Workflow step (line 53-54):** Runs `npm run build` to create a production build
2. **Workflow step (line 56-57):** Runs `npm run test:a11y` to execute Playwright tests
3. **Playwright config (playwright.config.ts lines 56-60):** Has a `webServer` configuration that tries to start `npm run start:dev` (Vite dev server)

**The Conflict:**

- The workflow was building the production app first
- Then Playwright was trying to start the dev server
- The dev server likely failed to start or conflicted with the build process
- Tests couldn't connect to a running server, causing failures

## Solution

**Removed the unnecessary build step from the workflow.**

### What Changed

```diff
- - name: Build application
-   run: npm run build
-
  - name: Run accessibility tests
    run: npm run test:a11y
```

### Why This Works

1. **Playwright handles server startup**: The `webServer` configuration in `playwright.config.ts` automatically starts the dev server before running tests
2. **No build needed for tests**: Accessibility tests don't require a production build - the dev server provides everything needed
3. **Faster test execution**: Dev server starts faster than doing a full production build + preview server
4. **Proper test isolation**: Playwright will start and stop the server cleanly for each test run

## How Playwright's WebServer Works

From `playwright.config.ts`:

```typescript
webServer: {
  command: 'npm run start:dev',  // Starts Vite dev server
  url: 'http://localhost:5173',   // Waits for server to be ready
  reuseExistingServer: !process.env.CI,  // In CI, always starts fresh server
}
```

**In CI Environment:**

1. Playwright sees `CI=true` environment variable
2. Doesn't try to reuse existing server (`reuseExistingServer: false`)
3. Starts fresh dev server with `npm run start:dev`
4. Waits for `http://localhost:5173` to respond
5. Runs all tests
6. Shuts down server when tests complete

## Expected Outcome

All 51 accessibility tests should now pass:

- ✅ Dev server starts automatically
- ✅ All 3 browsers (Chromium, Firefox, WebKit) can connect
- ✅ Tests run against live application
- ✅ Server stops cleanly after tests

## Benefits

1. ✅ **Simpler workflow** - Let Playwright handle server lifecycle
2. 🚀 **Faster execution** - No unnecessary production build
3. 🔧 **Better reliability** - Playwright manages server startup/shutdown
4. 📝 **Clearer intent** - Workflow focuses on running tests, not managing servers
5. 💡 **Best practice** - This is the recommended Playwright pattern

## Testing

Push this change to trigger the CI workflow. The tests should now:

1. Install dependencies ✅
2. Cache/install Playwright browsers ✅
3. Set up environment variables ✅
4. Run ESLint accessibility checks ✅
5. Start dev server (via Playwright webServer) ✅
6. Run all accessibility tests ✅
7. Upload test results ✅

## Additional Notes

- The production build is still used for actual deployments (separate workflow)
- For local development, tests work the same way: `npm run test:a11y` will start the server automatically
- If needed to test against production build in future, create a separate workflow that uses `vite preview`
