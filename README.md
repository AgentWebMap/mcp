<p align="center"><a href="https://agentwebmap.com"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="brand/logo-dark.svg">
  <img src="brand/logo.svg" alt="Agent Web Map" width="420">
</picture></a></p>

<p align="center"><a href="https://agentwebmap.com/discover">Try discovery</a> · <a href="https://agentwebmap.com/coverage">Coverage</a> · <a href="https://agentwebmap.com/benchmarks">Benchmarks</a> · <a href="https://agentwebmap.com/contact">Contact us</a> · <a href="https://x.com/AgentWebMap">X</a></p>

# AgentWebMap: llms.txt documentation discovery for AI agents

[AgentWebMap](https://agentwebmap.com) indexes websites publishing [`llms.txt`](https://llmstxt.org/) and helps AI agents find relevant publisher documentation through a free API and MCP server. A domain or development task returns original source URLs, publisher-provided matching evidence, stored freshness information and owner-stated agent terms. Change notifications can help consumers notice when an indexed llms.txt changes or breaks.

Start with a task such as **“modelcontextprotocol authorization”** in the [browser discovery page](https://agentwebmap.com/discover), or call the same resolver from your agent. Public reads need no account or API key. Connecting MCP makes the tools available to your client; your client decides when to call them.

- **MCP:** `https://agentwebmap.com/mcp` (Streamable HTTP, stateless)
- **REST:** [`/v1/resolve?q=modelcontextprotocol%20authorization`](https://agentwebmap.com/v1/resolve?q=modelcontextprotocol%20authorization)
- **Project CLI:** `node examples/discover.mjs --project . --dry-run` ([guide](docs/discovery-cli.md))
- **Reference:** [API docs](docs/api.md) · [OpenAPI](https://agentwebmap.com/openapi.json) · [directory llms.txt](https://agentwebmap.com/llms.txt)

Coverage is incomplete. The index searches published link descriptions and headings, rather than the full text of every documentation page. Read returned original pages before implementing or quoting instructions; use the publisher's own search or web search when matches are missing, weak or stale. Ownership confirmation is a domain-control signal, not evidence of documentation accuracy. See the [coverage report](https://agentwebmap.com/coverage) for current index counts.

## Add it

The same server works with Codex, Claude Code, Cursor, VS Code and other clients supporting remote HTTP MCP. Merge entries into an existing configuration rather than replacing it. `~` means your home directory.

### Codex

```bash
codex mcp add agentwebmap --url https://agentwebmap.com/mcp
```

Or add to `~/.codex/config.toml` (all projects), or `.codex/config.toml` in a trusted project:

```toml
[mcp_servers.agentwebmap]
url = "https://agentwebmap.com/mcp"
```

[Official Codex MCP setup](https://developers.openai.com/codex/mcp/).

### Claude Code

```bash
claude mcp add --transport http agentwebmap --scope project https://agentwebmap.com/mcp
```

Project configuration lives in `.mcp.json` at the project root:

```json
{
  "mcpServers": {
    "agentwebmap": {
      "type": "http",
      "url": "https://agentwebmap.com/mcp"
    }
  }
}
```

Use `--scope user` for all projects, stored in `~/.claude.json`. [Official Claude Code MCP setup](https://code.claude.com/docs/en/mcp).

### Cursor

Add to `.cursor/mcp.json` in the project, or `~/.cursor/mcp.json` for all projects:

```json
{
  "mcpServers": {
    "agentwebmap": {
      "url": "https://agentwebmap.com/mcp"
    }
  }
}
```

[Official Cursor MCP setup](https://cursor.com/docs/mcp).

### VS Code

Add to `.vscode/mcp.json` in the workspace. VS Code uses `servers` as the top-level key:

```json
{
  "servers": {
    "agentwebmap": {
      "type": "http",
      "url": "https://agentwebmap.com/mcp"
    }
  }
}
```

For profile-level configuration, run **MCP: Open User Configuration** from the Command Palette. Current VS Code also supports the portable `.mcp.json` format shown for Claude Code, and user configuration in `~/.copilot/mcp-config.json` using `mcpServers`. [Official VS Code MCP setup](https://code.visualstudio.com/docs/agent-customization/mcp-servers).

### Plain HTTP

```bash
curl --get --fail-with-body https://agentwebmap.com/v1/resolve \
  --data-urlencode "q=modelcontextprotocol authorization" \
  --data-urlencode "limit=3" \
  --data-urlencode "max_age=86400"
```

A dependency-free MCP client with initialization and tool discovery is in [examples/mcp-client.mjs](examples/mcp-client.mjs):

```bash
node examples/mcp-client.mjs resolve '{"query":"modelcontextprotocol authorization","limit":3}'
```

## Discover documentation for a project

The dependency-aware CLI reads a small set of manifests and maps recognized packages to publisher domains. Review the plan first, then request sources:

```bash
node examples/discover.mjs --project /path/to/project --dry-run
node examples/discover.mjs --project /path/to/project
node examples/discover.mjs --query "modelcontextprotocol authorization"
```

Node.js 20+ is sufficient; the CLI has no dependencies to install. It shows every curated mapping, skips unknown packages, and makes at most five sequential index requests by default. It does not execute project code, read `.env` files or lockfiles, crawl sites, or edit agent instructions. JSON results retain original URLs, source evidence and freshness. Use `--output sources.json` to create a new export without overwriting an existing file. See [the CLI guide](docs/discovery-cli.md) for supported manifests, bounds and fallback behavior.

## Give agents a reason to call it

Use `resolve` when a task needs a site's documentation and the exact page is unknown. Pass the publisher and task when known, for example `modelcontextprotocol authorization`. Read the returned source page before implementing or quoting it. Fall back to the site's documentation search or web search if evidence is weak, missing or stale. An empty result is useful information; listing ownership does not prove technical relevance.

An optional, portable [agentwebmap-docs skill](skills/agentwebmap-docs/SKILL.md) describes that workflow, including terms, freshness and fallback behavior. To use it in a repository that supports Agent Skills, copy the `skills/agentwebmap-docs` folder to `.agents/skills/agentwebmap-docs`. This is an optional project change; connecting the MCP server does not install a skill. Other clients can use the same `SKILL.md` or adapt it to their instructions format.

The index contains publisher-provided link descriptions and section headings, rather than the full text of every documentation page. Returned excerpts explain the match using that index; fetch the original source for current API details. Missing owner terms mean **unknown**, not unrestricted permission.

## Tools

| Tool | What it does |
|---|---|
| `resolve` | Domain or task to relevant documentation URLs, evidence, terms, freshness and alternatives; compact by default |
| `search_llms_registry` | Search domains, titles, summaries, descriptions, tags and published documentation links; relevance ranks before verification |
| `lookup_domain` | Find a domain's llms.txt, llms-full.txt, terms and directory metadata; `detail: "full"` includes owner information |
| `list_domains` | Browse ranked sites; `verified_only` restricts to owner-verified sites |
| `list_categories` | Read category IDs/descriptions/counts, the uncategorized count and publisher-declared capabilities before filtering discovery |
| `directory_stats` | Directory-wide counts |
| `check_llms_txt` | Live validation of a site's llms.txt, with suggested fixes |
| `generate_llms_txt` | Draft an llms.txt from a site's homepage, sitemap and page titles |
| `watch_domain` | Subscribe a webhook to changes, breakage and restoration |
| `unwatch_domain` / `test_watch` | Manage an existing watch with its ID and secret |
| `verification_instructions` | Public ownership methods and the endpoint for starting a private claim |
| `register_domain` | Submit a domain for automatic checking; ownership confirmation is optional |
| `begin_ownership_claim` / `verify_domain` | Start a fresh ownership challenge, then complete it using its private claim credentials |
| `rotate_owner_key` | Owner: replace the API key and invalidate old keys, browser sessions and pending claims |
| `update_site` | Owner: edit profile, terms and notification channels |
| `site_stats` | Owner: measured web/REST/MCP requests, documentation selections, score history and notifications |
| `recrawl_site` / `test_notification` | Owner: revalidate or send a test notification |

Protected owner tools require the site's API key. Starting a claim returns private claim credentials; `verify_domain` requires those credentials and the freshly published proof. Watch creation and owner operations have effects outside the current task: use them when requested. Documentation discovery needs only public read tools. Tools publish output schemas and annotations so clients can identify reads and writes.

## Freshness and response size

`resolve` accepts `detail: "compact" | "full"`, `max_age` in seconds (0–2592000, default `86400`), `refresh: true` for live llms.txt validation, and `limit` from 1 to 5 for documentation sources (default 3). `health.stale` reports whether the check is older than the requested age; `health.live_checked` identifies a live check. A refresh checks the published llms.txt; it does not validate every linked page or update the stored index. Compact results keep owner-verification instructions out of repeated consumer calls. Use `detail: "full"` when those details are needed.

## Discover by category

Call `list_categories` or `GET /v1/categories` to discover the taxonomy, then pass one category ID to `resolve`, `search_llms_registry` or `list_domains`. REST search, domain listing and resolve accept the same `category` filter. Compact domain responses include `categories`; full responses add the matching evidence and classification version. Use `capability: "mcp"` (REST `capability=mcp`) to discover sites publishing an explicit MCP endpoint link, separately from their business categories.

Categories are deterministic, multi-label classifications from publisher metadata. A site can have several labels or remain uncategorized when evidence is insufficient. Confidence is a rule score, not a probability, endorsement or verified business fact. Business categories do not prove that a site runs an MCP server; capability detection requires an explicit same-publisher endpoint declaration. Its availability and tools remain unverified, and a generic MCP mention is insufficient. See [category discovery and evidence](docs/categories.md) for the taxonomy, response fields and examples.

## Evidence and adoption

[Task examples](docs/task-examples.md) show discovery, source reading and fallback. The [benchmark runner](benchmarks/README.md) uses 20 curated documentation tasks and reports source hit rate at 1 and 3, provider matches, latency, response bytes and a clearly labeled token estimate. The [live benchmark page](https://agentwebmap.com/benchmarks) explains published runs and their limits. Curated retrieval tasks do not establish accuracy for arbitrary work or adoption by independent agents. Run the same tasks against a baseline before claiming an improvement.

The [coverage report](https://agentwebmap.com/coverage) shows current index counts. A directory listing is not a partnership, and requests can include bots, tests and repeated calls. [Distribution notes](docs/distribution.md) provide a concise project description and practical manual adoption steps without promising inclusion in AI answers.

## For site owners

Publish an llms.txt with descriptive links to useful documentation pages. Sites can be discovered and listed automatically; ownership confirmation is optional. To edit your listing, publish agent terms, configure breakage alerts or view measured usage, open [Manage your listing](https://agentwebmap.com/manage) and enter your domain. The browser guides you through publishing a DNS record, meta tag, proof file or llms.txt token, then provides a **Check ownership** button and an owner dashboard. No account or backlink is required.

Ownership confirmation records domain control, without endorsing a site's content. Search prioritizes relevance; browse listings still place confirmed owners first. Usage reports distinguish web, REST and MCP request volumes; they do not establish unique agents or confirmed reads of publisher pages. See the [ownership guide](docs/ownership.md) for API/MCP instructions, key recovery and the 0.7 migration. Existing owner keys continue to work; new ownership checks require fresh, expiring private claim credentials.

## Reference and examples

- [docs/api.md](docs/api.md): API parameters and response fields
- [docs/task-examples.md](docs/task-examples.md): practical agent workflows
- [docs/discovery-cli.md](docs/discovery-cli.md): dependency-aware discovery, preview and safe JSON exports
- [docs/distribution.md](docs/distribution.md): ready listing copy and manual adoption/visibility checks
- [docs/categories.md](docs/categories.md): category discovery, filters and publisher evidence
- [docs/webhooks.md](docs/webhooks.md): payloads and signature verification
- [docs/agent-terms.md](docs/agent-terms.md): terms-for-agents specification
- [docs/ownership.md](docs/ownership.md): optional browser management, secure claims, alerts and key recovery
- [openapi.json](openapi.json): OpenAPI snapshot; the [live specification](https://agentwebmap.com/openapi.json) describes the deployed service
- [examples/](examples/): shell, Python and Node clients, ownership verification and watches
- [benchmarks/](benchmarks/): reproducible task dataset and dependency-free runner

Questions and ideas: [Discussions](https://github.com/AgentWebMap/mcp/discussions) or [Issues](https://github.com/AgentWebMap/mcp/issues). Contact: admin@agentwebmap.com.

## Brand and license

The [brand assets](brand/) may be used to link to agentwebmap.com. The [X profile banner](brand/agentwebmap-x-banner.png) matches the website palette in a 3:1 format. This repository is released under the MIT License; the directory data and service are provided by agentwebmap.com.
