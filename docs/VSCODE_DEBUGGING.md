# VS Code Debugging Guide

This guide explains how to use the VS Code debugging configurations set up for this portfolio project.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Available Configurations](#available-configurations)
- [How to Use](#how-to-use)
- [Debugging Workflows](#debugging-workflows)
- [Troubleshooting](#troubleshooting)

## Overview

This project includes VS Code launch configurations that enable you to:

- Debug your React application in the browser with breakpoints
- Debug unit tests with Vitest
- Debug end-to-end tests with Playwright
- Step through code execution line by line
- Inspect variables and call stacks in real-time

## Prerequisites

### Required VS Code Extensions

1. **JavaScript Debugger** (built-in to VS Code)
2. **Chrome** browser installed on your system

### Optional but Recommended

- **Playwright Test for VSCode** - Enhanced Playwright debugging experience

## Available Configurations

### 1. Debug Dev Server

**Purpose:** Debug your React application running in development mode.

**What it does:**

- Automatically starts the Vite dev server (`npm run start:dev`)
- Opens Chrome with debugging enabled
- Connects VS Code debugger to the running application
- Allows you to set breakpoints in `.tsx` and `.ts` files

**When to use:**

- Debugging UI issues
- Understanding component lifecycle
- Inspecting state changes
- Tracking down runtime errors

### 2. Debug Unit Tests

**Purpose:** Debug all Vitest unit tests.

**What it does:**

- Runs `npm run test` with debugging enabled
- Stops at breakpoints in test files or source code
- Shows test execution in the integrated terminal

**When to use:**

- Tests are failing and you don't understand why
- You want to see what values variables have during test execution
- Debugging complex test logic

### 3. Debug Current Unit Test File

**Purpose:** Debug only the test file currently open in the editor.

**What it does:**

- Runs Vitest for just the active file
- Faster than running all tests
- Same debugging capabilities as "Debug Unit Tests"

**When to use:**

- Working on a specific test file
- Iterating quickly on test fixes
- You only care about one test suite

### 4. Debug E2E Tests

**Purpose:** Debug Playwright end-to-end tests.

**What it does:**

- Runs `npm run test:e2e:debug`
- Opens Playwright Inspector for step-by-step debugging
- Pauses test execution so you can inspect the browser state

**When to use:**

- E2E tests are flaky or failing
- Understanding browser automation issues
- Verifying element selectors

### 5. Debug Accessibility Tests

**Purpose:** Debug accessibility-specific Playwright tests.

**What it does:**

- Runs `npm run test:a11y:debug`
- Same as E2E debugging but focused on accessibility tests
- Useful for understanding axe-core violations

**When to use:**

- Debugging accessibility violations
- Understanding why a11y tests fail
- Verifying ARIA attributes and roles

## How to Use

### Opening the Debug Panel

1. Click the **Run and Debug** icon in the VS Code sidebar (bug icon)
   - Or press `Cmd+Shift+D` (Mac) / `Ctrl+Shift+D` (Windows/Linux)

2. You'll see a dropdown at the top showing all available configurations

### Running a Debug Configuration

1. Select the configuration you want from the dropdown
2. Press **F5** or click the green **▶️ play button**
3. The debugger will start and connect to your application/tests

### Setting Breakpoints

1. **Set a breakpoint:**
   - Click in the gutter (left of line numbers) in any `.ts` or `.tsx` file
   - A red dot appears indicating a breakpoint

2. **Run the debugger** using one of the configurations

3. **When execution hits the breakpoint:**
   - Execution pauses
   - You can inspect variables in the sidebar
   - You can hover over variables to see their values

### Debug Controls

When paused at a breakpoint, use these controls:

| Action        | Keyboard     | Description                                 |
| ------------- | ------------ | ------------------------------------------- |
| **Continue**  | F5           | Resume execution until next breakpoint      |
| **Step Over** | F10          | Execute current line, don't enter functions |
| **Step Into** | F11          | Enter function calls to debug inside them   |
| **Step Out**  | Shift+F11    | Exit current function and return to caller  |
| **Restart**   | Cmd+Shift+F5 | Restart the debugging session               |
| **Stop**      | Shift+F5     | Stop debugging                              |

### Inspecting Variables

While paused at a breakpoint:

1. **Variables Panel** - Shows all local and global variables
2. **Watch Panel** - Add expressions to monitor (e.g., `user.name`)
3. **Call Stack** - See the function call hierarchy
4. **Hover** - Hover over any variable in the editor to see its value

## Debugging Workflows

### Workflow 1: Debug a React Component Issue

```
1. Open the component file (e.g., src/App.tsx)
2. Set a breakpoint in the problematic code
3. Select "Debug Dev Server" from the debug dropdown
4. Press F5
5. Wait for Chrome to open and the page to load
6. Interact with your app to trigger the breakpoint
7. Inspect variables and step through code
```

### Workflow 2: Debug a Failing Unit Test

```
1. Open the test file (e.g., src/App.test.tsx)
2. Set a breakpoint in the failing test
3. Select "Debug Current Unit Test File"
4. Press F5
5. The debugger stops at your breakpoint
6. Inspect what's different from your expectations
```

### Workflow 3: Debug E2E Test Failures

```
1. Open the E2E test file (e.g., e2e/accessibility.spec.ts)
2. Set a breakpoint where you want to pause
3. Select "Debug E2E Tests" or "Debug Accessibility Tests"
4. Press F5
5. Playwright Inspector opens
6. Step through the test and inspect browser state
```

### Workflow 4: Debug Tests Without Breakpoints

Sometimes you want to run tests with the debugger attached even without breakpoints:

```
1. Select a test debug configuration
2. Press F5
3. Tests run normally
4. If an uncaught error occurs, debugger pauses automatically
5. You can see the exact line and call stack where it failed
```

## Troubleshooting

### Issue: "Cannot connect to runtime process"

**Solution:**

- Make sure no other instance of the dev server is running
- Kill any processes on port 5173: `lsof -ti:5173 | xargs kill -9`
- Try running the configuration again

### Issue: Breakpoints appear gray/hollow

**Possible causes:**

1. **Source maps not loaded** - Wait a few seconds after starting
2. **Wrong file** - Make sure you're setting breakpoints in `.tsx/.ts` files, not compiled `.js` files
3. **Build issue** - Stop debugger, run `npm run build`, then try again

### Issue: Dev server doesn't start automatically

**Solution:**

- The first time you run "Debug Dev Server", it may take a moment
- Check the terminal output for errors
- Manually run `npm run start:dev` to verify it works
- Check `.vscode/tasks.json` exists and is properly formatted

### Issue: Chrome doesn't open

**Solution:**

- Make sure Chrome is installed
- VS Code may ask for permission to use Chrome the first time
- Try closing all Chrome instances and running again

### Issue: Tests run but don't stop at breakpoints

**Solution:**

- Make sure the test actually executes the code with the breakpoint
- Verify the test file is saved
- Try setting a breakpoint on the test itself (the `it()` or `test()` line)

### Issue: E2E tests timeout in debug mode

**This is normal!** Debug mode in Playwright:

- Disables timeouts by default
- Pauses execution for manual inspection
- Use the Playwright Inspector to step through

## Tips and Best Practices

### 1. Use Conditional Breakpoints

Right-click a breakpoint and select "Edit Breakpoint" to add conditions:

```javascript
// Only break when count > 5
count > 5;

// Only break when user is admin
user.role === 'admin';
```

### 2. Use Logpoints Instead of console.log

Right-click in the gutter and select "Add Logpoint":

```javascript
// This logs without modifying code:
User clicked: {event.target.name}
```

### 3. Debug Console

Use the Debug Console to:

- Execute JavaScript in the current context
- Modify variables on the fly
- Test expressions

### 4. Keyboard Shortcuts

Learn these shortcuts to debug faster:

- `F5` - Start/Continue
- `F9` - Toggle breakpoint
- `F10` - Step over
- `F11` - Step into

### 5. Watch Expressions

Add expressions to the Watch panel to monitor them:

- `props.user`
- `state.isLoading`
- `localStorage.getItem('token')`

## Files Reference

The debugging setup consists of two files:

### `.vscode/launch.json`

Contains all debug configurations. Each configuration specifies:

- `name` - What appears in the debug dropdown
- `type` - Debugger type (chrome, node, etc.)
- `request` - Usually "launch"
- `runtimeExecutable` - What command to run (e.g., "npm")
- `runtimeArgs` - Arguments to pass

### `.vscode/tasks.json`

Defines the background task for starting the dev server:

- Uses `isBackground: true` to keep running
- Problem matcher detects when Vite is ready
- Allows debugger to wait for server before connecting

## Further Resources

- [VS Code Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [Vitest Debugging](https://vitest.dev/guide/debugging.html)
- [Playwright Debugging](https://playwright.dev/docs/debug)
- [Chrome DevTools Integration](https://code.visualstudio.com/docs/nodejs/browser-debugging)

## Quick Reference Card

```
Debug Dev Server      → Debug React app in Chrome
Debug Unit Tests      → Debug all Vitest tests
Debug Current File    → Debug just the open test file
Debug E2E Tests       → Debug Playwright tests
Debug A11y Tests      → Debug accessibility tests

F5        → Start/Continue
F9        → Toggle breakpoint
F10       → Step over
F11       → Step into
Shift+F11 → Step out
Shift+F5  → Stop debugging
```

---

**Need help?** If you encounter issues not covered here, check the VS Code output panel for error messages or consult the official VS Code documentation.
