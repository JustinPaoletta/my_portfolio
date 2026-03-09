# Workspace Guide

This repo does not currently commit a `.vscode/` workspace configuration. Editor setup is intentionally left local so each machine can keep its own preferences.

## Current State

- no committed `.vscode/settings.json`
- no committed `.vscode/extensions.json`
- no committed `.vscode/launch.json`
- no committed `.vscode/tasks.json`

That means Cursor and VS Code will use your personal editor settings unless you create project-local files yourself.

## What To Create Locally If You Want A Project Workspace

Create a local `.vscode/` directory and add only the files you actually need:

- `.vscode/settings.json`
  - local editor behavior such as format-on-save or ESLint integration
- `.vscode/extensions.json`
  - extension recommendations for your own machine
- `.vscode/launch.json`
  - debugger profiles
- `.vscode/tasks.json`
  - helper tasks such as running the Vite dev server

See [docs/VSCODE_DEBUGGING.md](/Users/justinpaoletta/Desktop/PROJECTS/APPS/my_portfolio/docs/VSCODE_DEBUGGING.md) for launch/task examples.

## Recommended Local Settings

If you want a sensible local baseline, these are good defaults for this repo:

- Prettier as the default formatter
- ESLint fixes on save
- TypeScript workspace version
- LF line endings
- 2-space indentation

Example:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\n",
  "editor.tabSize": 2,
  "editor.insertSpaces": true
}
```

## Helpful Extensions

Useful extensions for this repo:

- `esbenp.prettier-vscode`
- `dbaeumer.vscode-eslint`
- `ms-playwright.playwright`
- `vitest.explorer`
- `streetsidesoftware.code-spell-checker`
- `mikestead.dotenv`

## What To Commit

By default, treat local `.vscode/` files as personal setup unless the team explicitly decides to standardize them.

If the project ever starts committing shared workspace files, update this guide at the same time.
