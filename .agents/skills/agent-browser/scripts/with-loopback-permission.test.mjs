import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { test } from 'node:test';
import { validateInputs, loopbackPermission, run } from './with-loopback-permission.mjs';

const execute = promisify(execFile);
const protocol = values => ({ domains: [{ domain: 'Browser', types: [{ id: 'PermissionType', enum: values }] }] });

test('requires an explicit session and credential-free HTTPS origin', () => {
  assert.equal(validateInputs('auth-test', 'https://example.com/'), 'https://example.com');
  for (const origin of ['http://example.com', 'https://user:secret@example.com', 'https://example.com/path', 'https://example.com/?secret=x', 'https://example.com/#x']) {
    assert.throws(() => validateInputs('auth-test', origin));
  }
  for (const session of [undefined, '', '../other', 'auth test']) assert.throws(() => validateInputs(session, 'https://example.com'));
});

test('prefers narrow loopback permission and only falls back to the advertised legacy permission', () => {
  assert.equal(loopbackPermission(protocol(['localNetworkAccess', 'loopbackNetwork'])), 'loopbackNetwork');
  assert.equal(loopbackPermission(protocol(['localNetworkAccess'])), 'localNetworkAccess');
  assert.throws(() => loopbackPermission(protocol(['localNetwork'])));
});

test('rejects empty/oversized eval files before contacting a browser', async () => {
  const root = await mkdtemp(join(tmpdir(), 'loopback-unit-'));
  try {
    const file = join(root, 'eval.js');
    await writeFile(file, '');
    await assert.rejects(run('auth-test', 'https://example.com', file), /Invalid evaluation file/);
    await writeFile(file, 'x'.repeat(65537));
    await assert.rejects(run('auth-test', 'https://example.com', file), /Invalid evaluation file/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('rejects non-loopback CDP endpoints without leaking capabilities in CLI errors', async () => {
  const root = await mkdtemp(join(tmpdir(), 'loopback-boundary-'));
  const oldPath = process.env.PATH;
  try {
    const binary = join(root, 'agent-browser');
    await writeFile(binary, '#!/bin/sh\necho "ws://public.example/devtools/browser/private-capability"\n', { mode: 0o700 });
    const file = join(root, 'eval.js');
    await writeFile(file, '({ready:true})');
    process.env.PATH = `${root}:${oldPath}`;
    await assert.rejects(run('auth-test', 'https://example.com', file), /CDP must remain on loopback/);
    await assert.rejects(execute(process.execPath, [new URL('./with-loopback-permission.mjs', import.meta.url).pathname, 'auth-test', 'https://example.com', file]), error => {
      assert.equal(error.stdout, '');
      assert.match(error.stderr, /^Loopback evaluation failed;/);
      assert.doesNotMatch(error.stderr, /private-capability|public.example/);
      return true;
    });
  } finally { process.env.PATH = oldPath; await rm(root, { recursive: true, force: true }); }
});

test('permission remains alive through eval and is removed on disconnect', { skip: !process.env.AGENT_BROWSER_LIVE_TEST }, async () => {
  const root = await mkdtemp(join(tmpdir(), 'loopback-live-'));
  const session = 'skill-loopback-regression';
  const server = createServer((request, response) => {
    response.writeHead(request.method === 'OPTIONS' ? 204 : 200, {
      'Access-Control-Allow-Origin': 'https://example.com', 'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Private-Network': 'true',
      'Content-Type': 'application/json',
    });
    response.end(request.method === 'OPTIONS' ? undefined : JSON.stringify({ ready: true }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await execute('agent-browser', ['--session', session, 'open', 'https://example.com'], { timeout: 30000 });
    const expression = `fetch('http://127.0.0.1:${server.address().port}/ready',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(r=>r.json())`;
    const file = join(root, 'eval.js');
    await writeFile(file, expression);
    assert.deepEqual(JSON.parse(await run(session, 'https://example.com', file)), { ready: true });
    const { stdout } = await execute('agent-browser', ['--session', session, 'eval', `${expression}.then(()=>({blocked:false})).catch(()=>({blocked:true}))`], { timeout: 10000 });
    assert.deepEqual(JSON.parse(stdout), { blocked: true });
    await writeFile(file, 'throw new Error("private-synthetic-diagnostic")');
    await assert.rejects(run(session, 'https://example.com', file), /Browser evaluation failed/);
    const afterFailure = await execute('agent-browser', ['--session', session, 'eval', `${expression}.then(()=>({blocked:false})).catch(()=>({blocked:true}))`], { timeout: 10000 });
    assert.deepEqual(JSON.parse(afterFailure.stdout), { blocked: true });
  } finally {
    await execute('agent-browser', ['--session', session, 'close']).catch(() => {});
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});
