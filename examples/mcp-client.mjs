// Minimal MCP client over Streamable HTTP, no dependencies (Node 18+).
//   node mcp-client.mjs                    # lists the tools
//   node mcp-client.mjs resolve stripe.com # calls a tool
const MCP = 'https://agentwebmap.com/mcp';
let id = 0;

async function rpc(method, params = {}) {
  const res = await fetch(MCP, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
  });
  const msg = await res.json();
  if (msg.error) throw new Error(`${msg.error.code}: ${msg.error.message}`);
  return msg.result;
}

const [tool, arg] = process.argv.slice(2);
await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'example', version: '0' } });

if (!tool) {
  const { tools } = await rpc('tools/list');
  for (const t of tools) console.log(`${t.name.padEnd(26)} ${t.description.split('. ')[0]}.`);
} else {
  const args = tool === 'resolve' ? { query: arg } : { domain: arg };
  const r = await rpc('tools/call', { name: tool, arguments: args });
  console.log(JSON.stringify(r.structuredContent ?? r.content, null, 2));
}
