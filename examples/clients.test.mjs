import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execute = promisify(execFile);
const client = fileURLToPath(new URL('./mcp-client.mjs', import.meta.url));

test('MCP example initializes, announces readiness, discovers and calls tools with JSON arguments', async () => {
  const requests = [];
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const message = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    requests.push(message);
    assert.ok(request.headers.accept.includes('text/event-stream'));
    if (message.method !== 'initialize') assert.equal(request.headers['mcp-protocol-version'], '2025-06-18');
    if (message.method === 'notifications/initialized') {
      assert.equal(message.id, undefined);
      response.writeHead(202).end();
      return;
    }
    let result;
    if (message.method === 'initialize') result = { protocolVersion: '2025-06-18', capabilities: {}, serverInfo: { name: 'fixture', version: '1' } };
    else if (message.method === 'tools/list') result = { tools: [{ name: 'resolve', description: 'Find sources. Read them.' }] };
    else {
      assert.equal(message.method, 'tools/call');
      assert.deepEqual(message.params, { name: 'resolve', arguments: { query: 'stripe webhooks', limit: 3 } });
      result = { structuredContent: { sources: [{ url: 'https://docs.stripe.com/webhooks' }] }, content: [] };
    }
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ jsonrpc: '2.0', id: message.id, result }));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const env = { ...process.env, AGENTWEBMAP_MCP_URL: `http://127.0.0.1:${server.address().port}/mcp` };
  try {
    const listed = await execute(process.execPath, [client], { env });
    assert.match(listed.stdout, /resolve\s+Find sources\./);
    const called = await execute(process.execPath, [client, 'resolve', JSON.stringify({ query: 'stripe webhooks', limit: 3 })], { env });
    assert.deepEqual(JSON.parse(called.stdout), { sources: [{ url: 'https://docs.stripe.com/webhooks' }] });
    assert.deepEqual(requests.map(request => request.method), [
      'initialize', 'notifications/initialized', 'tools/list',
      'initialize', 'notifications/initialized', 'tools/call',
    ]);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
