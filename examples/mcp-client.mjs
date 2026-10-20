// Minimal MCP client over Streamable HTTP, no dependencies (Node 20+).
//   node mcp-client.mjs                    # lists the tools
//   node mcp-client.mjs resolve '{"query":"modelcontextprotocol authorization","limit":3}'
//   node mcp-client.mjs lookup_domain modelcontextprotocol.io
const MCP = process.env.AGENTWEBMAP_MCP_URL || 'https://agentwebmap.com/mcp';
let id = 0;
let protocolVersion;

async function rpc(method, params = {}, notification = false) {
  const res = await fetch(MCP, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream',
      ...(protocolVersion ? { 'MCP-Protocol-Version': protocolVersion } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', ...(notification ? {} : { id: ++id }), method, params }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  if (notification || res.status === 204) return;
  if (!res.headers.get('content-type')?.includes('application/json')) {
    throw new Error('This example expects JSON responses from the stateless Agent Web Map server.');
  }
  const msg = await res.json();
  if (msg.error) throw new Error(`${msg.error.code}: ${msg.error.message}`);
  return msg.result;
}

const [tool, arg] = process.argv.slice(2);
const initialized = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'agentwebmap-example', version: '1' } });
protocolVersion = initialized.protocolVersion;
await rpc('notifications/initialized', {}, true);

if (!tool) {
  const { tools } = await rpc('tools/list');
  for (const t of tools) console.log(`${t.name.padEnd(26)} ${t.description.split('. ')[0]}.`);
} else {
  const args = arg?.startsWith('{') ? JSON.parse(arg) : tool === 'resolve' ? { query: arg } : arg ? { domain: arg } : {};
  const r = await rpc('tools/call', { name: tool, arguments: args });
  console.log(JSON.stringify(r.structuredContent ?? r.content, null, 2));
  if (r.isError) process.exitCode = 1;
}
