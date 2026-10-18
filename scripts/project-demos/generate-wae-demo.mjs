#!/usr/bin/env node
// Run the unmodified CLI against fictional REST/WebDAV fixtures, in a temp cwd.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { fileURLToPath, URL } from 'node:url';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const exec = promisify(execFile);
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const source = path.resolve(process.argv[2] ?? '../wild-apricot-exports');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'portfolio-wae-demo-'));
const captured = path.join(root, 'assets/source/project-demos/wild-apricot');
const output = path.join(temp, 'demo-exports');
const fixtures = JSON.parse(
  await fs.readFile(path.join(captured, 'fixtures.json'), 'utf8')
);
const pkg = JSON.parse(
  await fs.readFile(path.join(source, 'package.json'), 'utf8')
);
const revision = (
  await exec('git', ['rev-parse', 'HEAD'], { cwd: source })
).stdout.trim();
const dirty = (
  await exec('git', ['status', '--porcelain'], { cwd: source })
).stdout.trim();
assert.equal(dirty, '', 'Capture requires an unchanged source checkout.');

const originals = new Map([
  [
    '/Documents/member-guide.txt',
    Buffer.from(
      'Northside Community Club\nFictional portfolio demo document.\nMembership renews each October.\n'
    ),
  ],
  [
    '/Pictures/club-mark.svg',
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="28" fill="#182b36"/><path d="M40 116V44h16l48 48V44h16v72h-16L56 68v48Z" fill="#ddbb70"/></svg>'
    ),
  ],
]);
const requests = [];
const xml = (name, directory) =>
  `<d:response><d:href>${name}</d:href><d:propstat><d:prop><d:resourcetype>${directory ? '<d:collection/>' : ''}</d:resourcetype><d:getcontentlength>${originals.get(name)?.length ?? 0}</d:getcontentlength><d:getlastmodified>Thu, 15 Oct 2026 00:00:00 GMT</d:getlastmodified></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response>`;
const server = http.createServer((req, res) => {
  const name =
    decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(
      /\/$/,
      ''
    ) || '/';
  requests.push(`${req.method} ${name}`);
  if (req.method === 'PROPFIND') {
    const children =
      name === '/'
        ? [
            ['/Documents', true],
            ['/Pictures', true],
          ]
        : [...originals.keys()]
            .filter((file) => path.posix.dirname(file) === name)
            .map((file) => [file, false]);
    res.writeHead(207, { 'Content-Type': 'application/xml' });
    res.end(
      `<?xml version="1.0"?><d:multistatus xmlns:d="DAV:">${xml(name, true)}${children.map(([file, directory]) => xml(file, directory)).join('')}</d:multistatus>`
    );
  } else if (req.method === 'GET' && originals.has(name)) {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
    res.end(originals.get(name));
  } else {
    res.writeHead(404);
    res.end();
  }
});

try {
  // Build a disposable copy; source files and installed dependencies stay untouched.
  await exec(process.execPath, [
    path.join(source, 'node_modules/typescript/bin/tsc'),
    '--project',
    path.join(source, 'tsconfig.json'),
    '--outDir',
    path.join(temp, 'dist'),
  ]);
  await fs.symlink(
    path.join(source, 'node_modules'),
    path.join(temp, 'node_modules')
  );
  await fs.mkdir(path.join(temp, 'bin'));
  await fs.copyFile(
    path.join(source, 'bin/wa-export.js'),
    path.join(temp, 'bin/wa-export.js')
  );
  await fs.writeFile(path.join(temp, 'package.json'), JSON.stringify(pkg));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const env = {
    PATH: process.env.PATH,
    TMPDIR: temp,
    WAE_DEMO_FIXTURES: path.join(captured, 'fixtures.json'),
    WAE_DEMO_WEBDAV: origin,
    WILD_APRICOT_API_KEY: 'offline-fixture-only',
    WILD_APRICOT_ACCOUNT_ID: '123456',
    WILD_APRICOT_WEBDAV_URL: origin,
    WILD_APRICOT_ADMIN_EMAIL: 'demo@example.com',
    WILD_APRICOT_ADMIN_PASSWORD: 'offline-fixture-only',
    WA_EVENT_REQUEST_DELAY_MS: '0',
  };
  const run = async (args) => {
    const result = await exec(
      process.execPath,
      [
        '--import',
        path.join(root, 'scripts/project-demos/wae-fixtures.mjs'),
        path.join(temp, 'bin/wa-export.js'),
        ...args,
      ],
      { cwd: temp, env, timeout: 30_000 }
    );
    assert.equal(result.stderr, '', 'CLI must not report warnings or errors.');
    return result.stdout
      .replaceAll(await fs.realpath(temp), '.')
      .replaceAll(temp, '.')
      .replaceAll(origin, 'http://127.0.0.1:FIXTURE');
  };
  const command =
    'wa-export all --include events,contacts,files --out-dir demo-exports';
  const log = await run([
    'all',
    '--include',
    'events,contacts,files',
    '--out-dir',
    'demo-exports',
  ]);
  assert.match(log, /✓ events/);
  assert.match(log, /✓ contacts/);
  assert.match(log, /✓ files/);
  const firstDownloads = requests.filter((request) =>
    request.startsWith('GET ')
  ).length;
  assert.equal(firstDownloads, 2);
  const resumeCommand = 'wa-export files --out-dir demo-exports';
  const resumeLog = await run(['files', '--out-dir', 'demo-exports']);
  assert.match(resumeLog, /Skipped \(cached\)\s+: 2/);
  assert.equal(
    requests.filter((request) => request.startsWith('GET ')).length,
    firstDownloads
  );
  const contacts = JSON.parse(
    await fs.readFile(path.join(output, 'contacts/contacts.json'), 'utf8')
  );
  assert.deepEqual(contacts, fixtures.contacts);
  const csv = await fs.readFile(
    path.join(output, 'contacts/contacts.csv'),
    'utf8'
  );
  assert.match(csv, /membershipLevelName/);
  assert.match(csv, /Community/);
  // Fixtures contain no commas, quotes, or newlines inside fields.
  assert.ok(!csv.includes('"'));
  const [columns, ...rows] = csv.split('\n').map((line) => line.split(','));
  const previewColumns = [
    'id',
    'firstName',
    'lastName',
    'membershipLevelName',
    'status',
    'renewalDueDate',
  ];
  const csvPreview = {
    columns: previewColumns,
    rows: rows.map((row) =>
      previewColumns.map((column) => row[columns.indexOf(column)])
    ),
    totalColumns: columns.length,
  };
  for (const [name, contents] of originals)
    assert.deepEqual(
      await fs.readFile(path.join(output, 'files', name)),
      contents
    );

  await fs.mkdir(captured, { recursive: true });
  await fs.rm(path.join(captured, 'demo-exports'), {
    recursive: true,
    force: true,
  });
  await fs.cp(output, path.join(captured, 'demo-exports'), { recursive: true });
  await fs.writeFile(
    path.join(captured, 'run.log'),
    `$ ${command}\n${log}\n$ ${resumeCommand}\n${resumeLog}`
  );
  const files = (
    await fs.readdir(output, { recursive: true, withFileTypes: true })
  )
    .filter((file) => file.isFile())
    .map((file) => path.relative(output, path.join(file.parentPath, file.name)))
    .sort();
  const summary = {
    version: pkg.version,
    revision,
    command,
    resumeCommand,
    // Excerpt is selected verbatim from the captured log. Full log is in the ZIP.
    logExcerpt: log
      .split('\n')
      .filter((line) =>
        /Got \d+ contacts|\[DOWN\]|✓|Downloaded\s+:|Failed\s+:/.test(line)
      )
      .join('\n'),
    resumeExcerpt: resumeLog
      .split('\n')
      .filter((line) =>
        /\[SKIP\]|Downloaded\s+:|Skipped \(cached\)|Failed\s+:/.test(line)
      )
      .join('\n'),
    contacts,
    csvPreview,
    files,
    counts: {
      contacts: contacts.length,
      events: fixtures.events.length,
      originalFiles: originals.size,
    },
    hashes: Object.fromEntries(
      await Promise.all(
        files.map(async (file) => [
          file,
          createHash('sha256')
            .update(await fs.readFile(path.join(output, file)))
            .digest('hex'),
        ])
      )
    ),
  };
  await fs.writeFile(
    path.join(root, 'src/content/generated/wild-apricot-demo.json'),
    JSON.stringify(summary, null, 2) + '\n'
  );
  await fs.writeFile(
    path.join(captured, 'README.txt'),
    `FICTIONAL DATA — OFFLINE PORTFOLIO DEMO\n\nwild-apricot-exports ${pkg.version}\nSource revision: ${revision}\n\nThe unmodified CLI ran against fixed REST responses and a loopback WebDAV fixture.\nNo real account, credentials, or network API was used.\nrun.log is actual output; only the temporary path and loopback port are normalized.\nCSV and JSON are complete exporter output. Original file bytes are preserved.\nA second file export made zero downloads and skipped two cached files.\n\nThis demonstrates local serialization and file resume, not live Wild Apricot\nauthentication, API availability, or large-account performance.\n`
  );
  const archive = path.join(root, 'public/demos/wild-apricot-sample.zip');
  // Replace only this generated artifact so repeated captures cannot retain stale entries.
  await fs.rm(archive, { force: true });
  await exec(
    '/usr/bin/zip',
    ['-qr', archive, 'README.txt', 'run.log', 'demo-exports'],
    { cwd: captured }
  );
  globalThis.console.log(
    `Captured ${contacts.length} contacts, ${fixtures.events.length} events and ${originals.size} files; cached rerun made zero downloads.`
  );
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(temp, { recursive: true, force: true });
}
