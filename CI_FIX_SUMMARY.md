# Accessibility Tests CI Fix Summary

## Problem

The accessibility tests were failing in GitHub Actions CI with the following error:

```
Error: browserType.launch: Executable doesn't exist at /home/runner/.cache/ms-playwright/firefox-1495/firefox/firefox
```

All Firefox and WebKit tests were failing (32 failures), while Chromium tests were passing.

## Root Cause

The Playwright browser installation step was not properly installing Firefox and WebKit browsers in the CI environment, even though the command `npx playwright install --with-deps` was present in the workflow.

## Solution

Updated `.github/workflows/accessibility-tests.yml` with the following improvements:

### 1. **Explicit Browser Installation**

Changed from:

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps
```

To explicitly specify browsers:

```yaml
- name: Install Playwright browsers
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: npx playwright install --with-deps chromium firefox webkit
```

### 2. **Browser Caching**

Added Playwright browser caching to improve CI performance:

```yaml
- name: Get Playwright version
  id: playwright-version
  run: echo "version=$(node -p "require('./package-lock.json').packages['node_modules/@playwright/test'].version")" >> $GITHUB_OUTPUT

- name: Cache Playwright browsers
  uses: actions/cache@v4
  id: playwright-cache
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ steps.playwright-version.outputs.version }}
```

### 3. **System Dependencies Handling**

Added a step to install system dependencies when browsers are loaded from cache:

```yaml
- name: Install Playwright system dependencies
  if: steps.playwright-cache.outputs.cache-hit == 'true'
  run: npx playwright install-deps chromium firefox webkit
```

## Benefits

1. ✅ **Reliable browser installation** - Explicitly specifies which browsers to install
2. 🚀 **Faster CI runs** - Caches browsers between runs (saves ~1-2 minutes per run)
3. 🔧 **Better debugging** - Clear separation of browser and system dependency installation
4. 💰 **Cost savings** - Reduced CI time = reduced costs

## Expected Outcome

All 51 accessibility tests should now pass across all three browser engines:

- ✅ Chromium (already passing)
- ✅ Firefox (will now pass)
- ✅ WebKit (will now pass)

## Testing

Push this change to trigger the CI workflow and verify that all browsers are properly installed and tests pass.
