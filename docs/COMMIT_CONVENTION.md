# Commit Message Convention

This project enforces **Conventional Commits** using [commitlint](https://commitlint.js.org/).

## 📋 Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Examples

```bash
feat(auth): add user login functionality
fix(api): resolve timeout issue on user fetch
docs(readme): update installation instructions
style(button): fix indentation in component
refactor(utils): simplify date formatting function
perf(images): optimize image loading performance
test(auth): add unit tests for login function
build(deps): upgrade React to v19
ci(github): add automated deployment workflow
chore(config): update prettier configuration
```

## 🏷️ Commit Types

| Type         | Description                                               | Example                                   |
| ------------ | --------------------------------------------------------- | ----------------------------------------- |
| **feat**     | A new feature                                             | `feat(auth): add OAuth login`             |
| **fix**      | A bug fix                                                 | `fix(form): validate email format`        |
| **docs**     | Documentation only changes                                | `docs(api): add endpoint descriptions`    |
| **style**    | Code style changes (formatting, missing semi-colons, etc) | `style(app): format with prettier`        |
| **refactor** | Code change that neither fixes a bug nor adds a feature   | `refactor(hooks): simplify useAuth logic` |
| **perf**     | Performance improvement                                   | `perf(list): virtualize long lists`       |
| **test**     | Adding or updating tests                                  | `test(utils): add tests for formatDate`   |
| **build**    | Changes to build system or dependencies                   | `build(vite): update to v5.0`             |
| **ci**       | Changes to CI configuration                               | `ci(actions): add test workflow`          |
| **chore**    | Other changes that don't modify src or test files         | `chore(eslint): update rules`             |
| **revert**   | Reverts a previous commit                                 | `revert: feat(auth): add OAuth login`     |

## 🎯 Scope

The scope is **optional** but recommended. It should be a noun describing the section of the codebase:

- `auth` - Authentication related
- `api` - API/backend related
- `ui` - UI components
- `form` - Form related
- `utils` - Utility functions
- `config` - Configuration files
- `deps` - Dependencies

## ✍️ Subject

- Use **imperative, present tense**: "add" not "added" nor "adds"
- Don't capitalize first letter
- No period (.) at the end
- Maximum 100 characters

### ✅ Good Examples

```bash
feat(auth): add user registration
fix(api): handle null response
docs(readme): update setup instructions
```

### ❌ Bad Examples

```bash
feat(auth): Added user registration      # Wrong tense
fix(api): Handle null response.          # Capitalized, has period
docs: Updated the readme file yesterday  # Past tense, too descriptive
WIP                                      # Not descriptive
fixed bug                                # No type, missing scope
```

## 📝 Body (Optional)

The body should include the motivation for the change and contrast this with previous behavior.

```bash
feat(api): add caching layer

Implement Redis caching to reduce database queries and improve
response times. Cache TTL is set to 5 minutes for user data.
```

## 🔗 Footer (Optional)

The footer should contain any information about **Breaking Changes** and reference **Issues**.

### Breaking Changes

```bash
feat(api): update user endpoint response format

BREAKING CHANGE: The user endpoint now returns camelCase instead of snake_case.
```

### Issue References

```bash
fix(auth): resolve login timeout issue

Closes #123
Fixes #456
```

## 🚫 What Happens If You Break the Rules?

If your commit message doesn't follow the convention, the commit will be **rejected**:

```bash
❌ subject may not be empty [subject-empty]
❌ type may not be empty [type-empty]

✖   found 2 problems, 0 warnings
```

## 💡 Tips

### Use Git Commit Template (Optional)

Create a commit template to remind yourself of the format:

```bash
# Create template file
cat > ~/.gitmessage << 'EOF'
# <type>(<scope>): <subject>
#
# Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
# Scope: auth, api, ui, form, utils, config, deps, etc.
# Subject: imperative mood, lowercase, no period, max 100 chars
#
# Body (optional): motivation for change
#
# Footer (optional): breaking changes, issue references
EOF

# Configure git to use it
git config --global commit.template ~/.gitmessage
```

### Commit Often

Make small, focused commits rather than large ones. It's easier to write good commit messages for small changes.

### VS Code Extension

Install the [Conventional Commits extension](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits) for VS Code to help you write conventional commits.

## 🎁 Benefits

1. **Automatically generate CHANGELOGs**
2. **Automatically determine semantic version bump** (based on types of commits)
3. **Better collaboration** - team members understand changes quickly
4. **Easier code reviews** - clear, structured commit history
5. **Better tooling** - many tools integrate with conventional commits

## 📚 Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [commitlint Documentation](https://commitlint.js.org/)
- [Semantic Versioning](https://semver.org/)
