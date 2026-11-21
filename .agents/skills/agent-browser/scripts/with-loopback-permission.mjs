import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const execute = promisify(execFile);

export function validateInputs(session, origin) {
  if (!/^[\w-]+$/.test(session ?? '')) throw new Error('Invalid session');
  const url = new URL(origin);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('An HTTPS origin without credentials or a path is required');
  }
  return url.origin;
}

export function loopbackPermission(protocol) {
  const values = protocol.domains.find(d => d.domain === 'Browser')?.types.find(t => t.id === 'PermissionType')?.enum ?? [];
  if (values.includes('loopbackNetwork')) return 'loopbackNetwork';
  if (values.includes('localNetworkAccess')) return 'localNetworkAccess';
  throw new Error('Browser does not advertise a loopback permission');
}

export function connectCDP(url) {
  const ws = new WebSocket(url);
  const pending = new Map();
  let nextId = 0;
  const opened = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', () => reject(new Error('CDP connection failed')), { once: true });
  });
  ws.addEventListener('message', event => {
    const response = JSON.parse(event.data);
    const request = pending.get(response.id);
    if (!request) return;
    pending.delete(response.id);
    if (response.error) request.reject(new Error('CDP command failed'));
    else request.resolve(response.result);
  });
  ws.addEventListener('close', () => {
    for (const request of pending.values()) request.reject(new Error('CDP connection closed'));
    pending.clear();
  });
  return {
    async send(method, params = {}) {
      await opened;
      return await new Promise((resolve, reject) => {
        const id = ++nextId;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    },
    close: () => ws.close(),
  };
}

export async function run(session, origin, file) {
  origin = validateInputs(session, origin);
  const expression = await readFile(file, 'utf8');
  if (!expression.trim() || Buffer.byteLength(expression) > 65536) throw new Error('Invalid evaluation file');
  const args = ['--session', session];
  const { stdout } = await execute('agent-browser', [...args, 'get', 'cdp-url'], { timeout: 10000, maxBuffer: 4096 });
  const endpoint = new URL(stdout.trim());
  if (endpoint.protocol !== 'ws:' || !['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname)) {
    throw new Error('CDP must remain on loopback');
  }
  const response = await fetch(`http://${endpoint.host}/json/protocol`, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('CDP protocol unavailable');
  const permission = loopbackPermission(await response.json());
  const cdp = connectCDP(endpoint.href);
  let timer;
  try {
    const operation = (async () => {
      const { targetInfos } = await cdp.send('Target.getTargets');
      const pages = targetInfos.filter(t => t.type === 'page' && new URL(t.url || 'about:blank').origin === origin);
      if (pages.length !== 1) throw new Error('Exactly one page at the authorized origin is required');
      const browserContextId = pages[0].browserContextId;
      await cdp.send('Browser.grantPermissions', { permissions: [permission], origin, ...(browserContextId && { browserContextId }) });
      // Permission overrides disappear on CDP disconnect: keep this connection open through eval.
      return await new Promise((resolve, reject) => {
        const child = execFile('agent-browser', [...args, 'eval', '--stdin'], { timeout: 30000, maxBuffer: 16384 }, (error, stdout) => {
          if (error) reject(new Error('Browser evaluation failed'));
          else resolve(stdout);
        });
        child.stdin.on('error', () => {});
        child.stdin.end(expression);
      });
    })();
    return await Promise.race([operation, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Loopback evaluation timed out')), 45000);
    })]);
  } finally {
    clearTimeout(timer);
    cdp.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [session, origin, file, ...extra] = process.argv.slice(2);
    if (!file || extra.length) throw new Error('Usage: with-loopback-permission.mjs <session> <https-origin> <eval-file>');
    process.stdout.write(await run(session, origin, file));
  } catch {
    // Do not relay subprocess stderr, auth URLs, or the evaluated program into logs.
    process.stderr.write('Loopback evaluation failed; preserve browser storage and inspect the stage with metadata only.\n');
    process.exitCode = 1;
  }
}
