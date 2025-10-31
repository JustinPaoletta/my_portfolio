/**
 * Commitlint configuration
 * Enforces conventional commit message format
 *
 * Format: <type>(<scope>): <subject>
 * Example: feat(auth): add user login functionality
 */

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enum - allowed commit types
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only changes
        'style', // Changes that don't affect code meaning (formatting, etc)
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf', // Performance improvement
        'test', // Adding or updating tests
        'build', // Changes to build system or dependencies
        'ci', // Changes to CI configuration files and scripts
        'chore', // Other changes that don't modify src or test files
        'revert', // Reverts a previous commit
      ],
    ],
    // Scope is optional but must be lowercase if provided
    'scope-case': [2, 'always', 'lower-case'],
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    // Subject must not end with a period
    'subject-full-stop': [2, 'never', '.'],
    // Subject must be in lowercase
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    // Body must have blank line before it
    'body-leading-blank': [1, 'always'],
    // Footer must have blank line before it
    'footer-leading-blank': [1, 'always'],
    // Header must not be longer than 100 characters
    'header-max-length': [2, 'always', 100],
  },
};
