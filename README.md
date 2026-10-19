<p align="center"><a href="https://agentwebmap.com"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="brand/logo-dark.svg">
  <img src="brand/logo.svg" alt="Agent Web Map" width="420">
</picture></a></p>

# Agent Web Map MCP server

[Agent Web Map](https://agentwebmap.com) is a directory of websites that publish [`llms.txt`](https://llmstxt.org/), validated and ranked by an authority score. This MCP server gives agents the same directory as tools: search it, look up a site's `llms.txt` and `llms-full.txt`, check or draft an `llms.txt`, and register and verify a site you control.

- **Endpoint:** `https://agentwebmap.com/mcp` (Streamable HTTP, stateless, no auth for reads)
- **Docs:** https://agentwebmap.com/docs#mcp · OpenAPI: https://agentwebmap.com/openapi.json · `llms.txt`: https://agentwebmap.com/llms.txt

## Add it

Claude Code:

```bash
claude mcp add --transport http agentwebmap https://agentwebmap.com/mcp
```

Cursor, Windsurf, VS Code and other clients that take a JSON config:

```json
{
  "mcpServers": {
    "agentwebmap": {
      "url": "https://agentwebmap.com/mcp"
    }
  }
}
```

Plain HTTP, for a quick test:

```bash
curl -X POST https://agentwebmap.com/mcp \
  -H "content-type: application/json" -H "accept: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"lookup_domain","arguments":{"domain":"stripe.com"}}}'
```

## Tools

| Tool | What it does |
|---|---|
| `resolve` | Start here: a domain or a topic in, the best source out, with what to read, the owner's terms for agents, health and alternatives |
| `watch_domain` | Get a signed JSON POST when a site's llms.txt changes, breaks or comes back |
| `unwatch_domain` / `test_watch` | Manage a watch with its id and secret |
| `directory_stats` | Directory-wide counts |
| `search_llms_registry` | Full-text search over the directory, ranked by authority, verified owners first |
| `list_domains` | Ranked listing; `verified_only` for owner-verified sites |
| `lookup_domain` | Everything published about one domain: llms.txt and llms-full.txt URLs, title, summary, score, tier, verification state, country |
| `check_llms_txt` | Validate a site's llms.txt the way an agent sees it, with what to fix |
| `generate_llms_txt` | Draft an llms.txt from a site's own homepage, sitemap and page titles |
| `verification_instructions` | The token and the four ways to prove ownership of a domain |
| `register_domain` | Submit a domain for listing; returns the verification instructions |
| `verify_domain` | Check the proof; on success returns the owner API key |
| `update_site` | Owner: edit the profile and notification channels |
| `site_stats` | Owner: lookups, score history, notifications, badge |
| `recrawl_site` | Owner: re-validate now |
| `test_notification` | Owner: send a test alert |

Owner tools take the API key as an argument; everything else is open. Owners can also publish their terms for agents (`agent_terms`: automated access, rate limit, attribution, pricing, terms URL) through `update_site`; every lookup and `resolve` answer carries them.

## Why verify a site

Verified owners are sorted first, reach the featured tier sooner, get a link in agentwebmap.com's own `llms.txt`, an embeddable badge, breakage alerts by webhook or email, an editable profile and lookup analytics. Verification is two calls and needs no account: `register_domain`, place the token (a line in your llms.txt, a DNS TXT record, a meta tag, or a well-known file), `verify_domain`.

## REST

Everything above is also a JSON API. Start with `GET https://agentwebmap.com/v1/resolve?q=<domain or topic>`; `GET https://agentwebmap.com/v1` lists the rest. Live docs: https://agentwebmap.com/docs

## Docs and examples in this repository

- [docs/api.md](docs/api.md): the full API reference
- [docs/webhooks.md](docs/webhooks.md): owner alerts and watches, payloads, signature verification in Node and Python
- [docs/agent-terms.md](docs/agent-terms.md): the terms-for-agents specification
- [openapi.json](openapi.json): snapshot of the OpenAPI description (the live one is at https://agentwebmap.com/openapi.json)
- [examples/](examples/): `resolve.sh`, `resolve.py`, `mcp-client.mjs` (a dependency-free MCP client), `verify-site.sh`, `watch.sh`

Questions and ideas: [Discussions](https://github.com/AgentWebMap/mcp/discussions).

## Brand

The logo and mark are in [`brand/`](brand/) (SVG and PNG). Use them to link to agentwebmap.com; verified owners can also embed the [status badge](https://agentwebmap.com/docs#badge).

## Contact

admin@agentwebmap.com

## License

The contents of this repository are released under the MIT License. The directory's data and the service are provided by agentwebmap.com.
