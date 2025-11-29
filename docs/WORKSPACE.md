# Workspace Settings

This project includes workspace settings for Cursor/VS Code to ensure consistent editor behavior across all developers.

## 📁 Files

- `.vscode/settings.json` - Workspace settings
- `.vscode/extensions.json` - Recommended extensions

Both files are committed to the repository to ensure consistency.

## ⚙️ Configured Settings

### Auto-Formatting

- ✅ **Format on save** enabled
- ✅ **Prettier** as default formatter
- ✅ **ESLint** auto-fix on save
- ✅ **Trailing whitespace** removed on save
- ✅ **Final newline** inserted on save

### Code Quality

- ✅ ESLint integration for TypeScript/React
- ✅ TypeScript workspace version used
- ✅ Import module specifier set to non-relative (uses `@/` paths)

### Editor Behavior

- **Tab size**: 2 spaces
- **Line endings**: LF (`\n`)
- **Indentation**: Spaces (not tabs)
- **Detect indentation**: Disabled (enforces project standard)

### File Exclusions

Hidden from file explorer:

- `node_modules`
- `dist`
- `coverage`
- `.git`
- `.DS_Store`

### Testing

- Peek view opens automatically for test failures

## 🔌 Recommended Extensions

When you open this project in Cursor/VS Code, you'll be prompted to install these recommended extensions:

### Essential

1. **Prettier** (`esbenp.prettier-vscode`)
   - Code formatter
   - Required for format on save

2. **ESLint** (`dbaeumer.vscode-eslint`)
   - Linting for TypeScript/JavaScript
   - Auto-fix on save

### TypeScript

3. **TypeScript Next** (`ms-vscode.vscode-typescript-next`)
   - Latest TypeScript features

### Testing

4. **Vitest** (`vitest.explorer`)
   - Run and debug Vitest tests in the sidebar

5. **Playwright** (`ms-playwright.playwright`)
   - E2E test runner and debugger

### Git

6. **Conventional Commits** (`vivaxy.vscode-conventional-commits`)
   - Helper for writing conventional commit messages

### Productivity

7. **Error Lens** (`usernamehw.errorlens`)
   - Inline error/warning messages

8. **Path Intellisense** (`christian-kohler.path-intellisense`)
   - Autocomplete for file paths

9. **HTML CSS Class Completion** (`zignd.html-css-class-completion`)
   - Autocomplete for CSS classes

### React

10. **ES7+ React Snippets** (`dsznajder.es7-react-js-snippets`)
    - React code snippets

### Markdown

11. **Markdown All in One** (`yzhang.markdown-all-in-one`)
    - Enhanced markdown editing

### Utilities

12. **Code Spell Checker** (`streetsidesoftware.code-spell-checker`)
    - Catch typos in code and comments

13. **DotENV** (`mikestead.dotenv`)
    - Syntax highlighting for `.env` files

## 🚀 Getting Started

### First Time Setup

1. **Open the project** in Cursor/VS Code
2. **Accept prompt** to install recommended extensions
3. **Reload** editor if needed
4. **Verify** format on save is working:
   - Make a small change to a file
   - Save it (`Cmd/Ctrl + S`)
   - File should auto-format

### Manual Extension Installation

If you didn't accept the prompt:

1. Open Command Palette (`Cmd/Ctrl + Shift + P`)
2. Type: `Extensions: Show Recommended Extensions`
3. Install all workspace recommendations

### Verify Settings

Check that workspace settings are active:

1. Open Command Palette (`Cmd/Ctrl + Shift + P`)
2. Type: `Preferences: Open Workspace Settings (JSON)`
3. You should see the settings from `.vscode/settings.json`

## 🎨 Prettier Configuration

Prettier settings are in `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## 🔍 ESLint Configuration

ESLint configuration is in `eslint.config.js` and includes:

- TypeScript rules
- React hooks rules
- Prettier integration
- React Fast Refresh rules

## 💡 Tips

### Format Selection

- **Mac**: `Cmd + K, Cmd + F`
- **Windows/Linux**: `Ctrl + K, Ctrl + F`

### Organize Imports

- **Mac**: `Opt + Shift + O`
- **Windows/Linux**: `Alt + Shift + O`

### Fix All ESLint Issues

1. Open Command Palette
2. Type: `ESLint: Fix all auto-fixable Problems`

### Run Tests from Sidebar

With Vitest extension installed:

1. Click Testing icon in sidebar
2. See all tests in tree view
3. Click play button to run
4. Click debug icon to debug

## 🔧 Customization

### Personal Settings

If you want personal settings that differ from the workspace:

1. Open User Settings (`Cmd/Ctrl + ,`)
2. Add your personal preferences
3. User settings override workspace settings (for you only)

### Don't Commit Personal Settings

Personal `.vscode` files to NOT commit:

- `.vscode/*.code-workspace`
- `.vscode/launch.json` (user-specific debugging configurations)
- `.vscode/tasks.json` (user-specific tasks)

These are typically user-specific and excluded by `.gitignore`. The workspace settings in `.vscode/settings.json` and recommended extensions in `.vscode/extensions.json` ARE committed for team consistency.

## 🐛 Troubleshooting

### Format on save not working?

1. Check Prettier extension is installed
2. Verify it's set as default formatter:
   ```json
   "editor.defaultFormatter": "esbenp.prettier-vscode"
   ```
3. Check format on save is enabled:
   ```json
   "editor.formatOnSave": true
   ```
4. Reload VS Code window

### ESLint not working?

1. Check ESLint extension is installed
2. Verify workspace uses local ESLint:
   - Should see `node_modules/.bin/eslint`
3. Check output panel for ESLint errors
4. Try: `ESLint: Restart ESLint Server`

### Path aliases not resolving?

1. Check `tsconfig.app.json` has paths configured
2. Verify TypeScript version:
   - Bottom right of editor should show version
   - Click it and select "Use Workspace Version"
3. Reload TypeScript server:
   - `Cmd/Ctrl + Shift + P`
   - Type: `TypeScript: Restart TS Server`

### Extensions not installing?

1. Check internet connection
2. Check Cursor/VS Code marketplace access
3. Try installing manually from Extensions view (`Cmd/Ctrl + Shift + X`)

## 📚 Resources

- [VS Code Workspace Settings](https://code.visualstudio.com/docs/getstarted/settings)
- [Prettier Documentation](https://prettier.io/docs/en/index.html)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [VS Code Extension Marketplace](https://marketplace.visualstudio.com/)

## 🎯 Benefits

### For Solo Development

- ✅ Consistent setup across machines
- ✅ Auto-formatting saves time
- ✅ Catch errors as you type
- ✅ Better code quality

### For Team Development

- ✅ Everyone has same editor setup
- ✅ No formatting debates in PRs
- ✅ Consistent code style
- ✅ Same linting rules for all
- ✅ Easier onboarding for new team members

## 📋 Checklist

When setting up a new machine:

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Open in Cursor/VS Code
- [ ] Install recommended extensions
- [ ] Verify format on save works
- [ ] Verify ESLint shows errors inline
- [ ] Test path aliases autocomplete
- [ ] Run tests from sidebar
- [ ] Make a test commit to verify hooks

## 🔄 Keeping Settings Updated

If you add new tools or change formatting rules:

1. Update `.vscode/settings.json`
2. Update `.vscode/extensions.json` if adding new extensions
3. Update this documentation
4. Commit changes
5. Notify team to reload/update extensions

---

**Note**: These settings work for both Cursor and VS Code. Cursor is built on VS Code, so all VS Code extensions and settings are compatible.
