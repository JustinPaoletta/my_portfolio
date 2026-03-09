import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const baseRef =
  process.argv[2] ?? process.env.GITHUB_BASE_REF ?? process.env.BASE_REF;

if (!baseRef) {
  console.error(
    '::error::Missing base branch. Run with a branch name or set GITHUB_BASE_REF.'
  );
  process.exit(1);
}

const runGit = (args) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const semverPattern = /^(\d+)\.(\d+)\.(\d+)(?:[-+][0-9A-Za-z-.]+)?$/;

const parseSemver = (version) => {
  const match = version.match(semverPattern);

  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  return match.slice(1, 4).map((segment) => Number(segment));
};

const compareSemver = (left, right) => {
  const leftParts = parseSemver(left);
  const rightParts = parseSemver(right);

  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] > rightParts[index]) {
      return 1;
    }

    if (leftParts[index] < rightParts[index]) {
      return -1;
    }
  }

  return 0;
};

const failures = [];
const fail = (message) => {
  failures.push(message);
  console.error(`::error::${message}`);
};

try {
  runGit(['fetch', '--no-tags', '--depth=1', 'origin', baseRef]);
} catch (error) {
  fail(`Unable to fetch origin/${baseRef}: ${error.message}`);
}

let changedFiles = new Set();

try {
  const committedChanges = runGit([
    'diff',
    '--name-only',
    `origin/${baseRef}...HEAD`,
  ])
    .split('\n')
    .filter(Boolean);
  const stagedChanges = runGit(['diff', '--name-only', '--cached'])
    .split('\n')
    .filter(Boolean);
  const unstagedChanges = runGit(['diff', '--name-only'])
    .split('\n')
    .filter(Boolean);

  changedFiles = new Set([
    ...committedChanges,
    ...stagedChanges,
    ...unstagedChanges,
  ]);
} catch (error) {
  fail(`Unable to diff against origin/${baseRef}: ${error.message}`);
}

for (const requiredFile of [
  'CHANGELOG.md',
  'package.json',
  'package-lock.json',
]) {
  if (!changedFiles.has(requiredFile)) {
    fail(
      `${requiredFile} must be updated in every pull request targeting ${baseRef}.`
    );
  }
}

let basePackage;
let headPackage;
let headLockfile;

try {
  basePackage = JSON.parse(runGit(['show', `origin/${baseRef}:package.json`]));
  headPackage = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8')
  );
  headLockfile = JSON.parse(
    readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8')
  );
} catch (error) {
  fail(`Unable to read release metadata: ${error.message}`);
}

if (basePackage && headPackage) {
  if (basePackage.version === headPackage.version) {
    fail(
      `package.json version is still ${headPackage.version}. Bump it for this pull request.`
    );
  } else if (compareSemver(basePackage.version, headPackage.version) >= 0) {
    fail(
      `package.json version must increase from ${basePackage.version}; found ${headPackage.version}.`
    );
  }
}

if (headPackage && headLockfile) {
  if (headLockfile.version !== headPackage.version) {
    fail(
      `package-lock.json version (${headLockfile.version}) must match package.json version (${headPackage.version}).`
    );
  }

  if (headLockfile.packages?.['']?.version !== headPackage.version) {
    fail(
      `package-lock.json root package version (${headLockfile.packages?.['']?.version ?? 'missing'}) must match package.json version (${headPackage.version}).`
    );
  }
}

if (failures.length > 0) {
  console.error(`Release guard failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log(
  `Release guard passed: CHANGELOG.md updated and version bumped from ${basePackage.version} to ${headPackage.version}.`
);
