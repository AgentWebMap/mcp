<p><a href="https://agentwebmap.com/"><strong>agentwebmap.com</strong> — Agent Web Map</a></p>

<p align="center"><a href="https://agentwebmap.com/browse">Browse and search</a> · <a href="https://agentwebmap.com/explore">Explore sections</a> · <a href="https://agentwebmap.com/stats">Statistics</a> · <a href="https://agentwebmap.com/docs">API &amp; MCP</a> · <a href="https://agentwebmap.com/manage">Manage your listing</a></p>

# Agent Web Map: find the next useful source for your agent

[Agent Web Map](https://agentwebmap.com/) discovers and continuously validates websites publishing [llms.txt](https://agentwebmap.com/what-is-llms-txt). Search for a publisher or task, find original source links with matching evidence and freshness, and explore connections between the sections publishers include in their files.

People use the [website](https://agentwebmap.com/browse). Agents use the same index through the **free JSON API and hosted MCP server**. Public discovery needs no account or API key. Connect your client directly to the hosted service; no local server installation is needed.

This repository is the public introduction and integration reference. The platform's application, crawler and infrastructure are maintained separately.

We build on the original [llms.txt proposal](https://llmstxt.org/) by Jeremy Howard. [Meet the llms.txt project](https://agentwebmap.com/llms-txt-project), read its [upstream source](https://github.com/AnswerDotAI/llms-txt), and see how our independent directory uses the convention.

## Start with a task

[Try a real lookup on the homepage](https://agentwebmap.com/#task-discovery). Enter a publisher and task, inspect the original source links and actual API response, then read the publisher's pages. Match strength and stale flags make missing or older evidence visible. Refine weak results or use the publisher's search when coverage is insufficient.

For repeated use, [connect MCP](#add-it), use the public HTTP API, or explicitly install the optional [discovery skill](skills/agentwebmap-docs/SKILL.md) through your client's workflow. The skill describes when to try discovery, read primary sources and fall back. Connections make tools available; the host decides when to call them. An llms.txt or discovery manifest does not automatically install a connection or establish persistent agent adoption. [First-use workflow](https://agentwebmap.com/docs#start).

The service combines task-focused source discovery, explicit freshness and provenance, a growing graph of shared publisher headings, and optional verified publisher controls. The workspace supports people who want to inspect and save sources; discovery remains available without signing in.

## Start on the website

| Goal | Open |
|---|---|
| Try a task and inspect the actual response | [Live task lookup](https://agentwebmap.com/#task-discovery) |
| Find a website or documentation for a task | [Browse and search](https://agentwebmap.com/browse) |
| Keep favorites and private project collections | [Your workspace](https://agentwebmap.com/workspace) |
| Start with an editorial set of sources for a task | [Curated collections](https://agentwebmap.com/collections) |
| Explore shared publisher headings and connections | [Interactive section cloud](https://agentwebmap.com/explore) |
| See current counts, growth and file statistics | [Statistics](https://agentwebmap.com/stats) |
| Explore the index by inferred country | [World map](https://agentwebmap.com/map) |
| Validate an existing llms.txt | [Checker](https://agentwebmap.com/check) |
| Draft an llms.txt for a site | [Generator](https://agentwebmap.com/generate) |
| Submit a publisher's file for checking | [Submit a site](https://agentwebmap.com/submit) |
| Verify ownership and manage a listing | [Owner dashboard](https://agentwebmap.com/manage) |

Search combines keyword and meaning-based matches when available, with keyword fallback. Task relevance comes before authority and ownership signals. Filters include categories, publisher-declared MCP capabilities, inferred agentic labels, country and sections extracted from indexed files.

[Filter by country](https://agentwebmap.com/docs#countries) in Browse or the section cloud, or pass `country=FR` / `country=unknown` through REST and MCP. [`GET /v1/countries`](https://agentwebmap.com/v1/countries) and `list_countries` expose available codes and listed-site counts. Country reflects domain or hosting location; it does not establish company headquarters or markets served.

For agent-readable orientation, [llms.txt](https://agentwebmap.com/llms.txt) is the concise service guide. [llms-full.txt](https://agentwebmap.com/llms-full.txt) includes the complete platform/API/MCP reference generated from the same documentation as [docs.md](https://agentwebmap.com/docs.md), plus eligible owner-verified publishers. The guides cover country and section filters, the point cloud, public collections, optional private workspaces and owner management. Private account and admin records are excluded; unverified publishers remain discoverable through the public API.

The section catalogue grows as new files and headings are indexed. The point cloud connects labels shared by publishers; selecting labels reveals matching sites. These relationships come from heading co-occurrence, independently of meaning-based search and AI topic classification. Original headings and partial-coverage information remain available through the API. [Section discovery guide](docs/sections.md).

## A workspace for people

The full-width, text-file interface offers light and dark modes, source previews, list and grid views, and a persistent sidebar. [Sign in with an email code](https://agentwebmap.com/workspace/signin) to save favorites, organize private collections and return to recently opened sources across browser sessions. Codes expire after ten minutes and work once in the requesting browser. Your source lists are private and separate from the public index. Copy a reference prompt, download sources.md, or connect your agent through MCP or REST.

Connect verified websites to see their owner dashboards from the workspace. Email sign-in confirms access to a mailbox; domain ownership still requires a fresh proof or the current owner key. Standalone owner-key sign-in remains available. Public directory, API and MCP access require no account. [Live workspace reference](https://agentwebmap.com/docs#workspace).

## Add it

**MCP endpoint:** `https://agentwebmap.com/mcp` — stateless Streamable HTTP, with no key required for public reads. Codex, Claude Code, Cursor, VS Code and other remote HTTP MCP clients can use the same endpoint.

Codex:

```bash
codex mcp add agentwebmap --url https://agentwebmap.com/mcp
```

Claude Code, for the current project:

```bash
claude mcp add --transport http agentwebmap --scope project https://agentwebmap.com/mcp
```

Cursor, in `.cursor/mcp.json`:

```json
{"mcpServers":{"agentwebmap":{"url":"https://agentwebmap.com/mcp"}}}
```

VS Code, in `.vscode/mcp.json`:

```json
{"servers":{"agentwebmap":{"type":"http","url":"https://agentwebmap.com/mcp"}}}
```

Merge the entry into an existing configuration. Connecting makes tools available; the client chooses when to call them. Try: **“Use Agent Web Map to find the Model Context Protocol authorization documentation, then read the original source.”**

[Live MCP reference](https://agentwebmap.com/docs#mcp) · [Codex setup](https://developers.openai.com/codex/mcp/) · [Claude Code setup](https://code.claude.com/docs/en/mcp) · [Cursor setup](https://cursor.com/docs/mcp) · [VS Code setup](https://code.visualstudio.com/docs/agent-customization/mcp-servers)

## Use the JSON API

```bash
curl --get https://agentwebmap.com/v1/resolve \
  --data-urlencode "q=modelcontextprotocol authorization" \
  --data-urlencode "limit=3"
```

| Endpoint | Purpose |
|---|---|
| [`GET /v1`](https://agentwebmap.com/v1) | Discover API links and service information |
| [`GET /v1/resolve?q=modelcontextprotocol%20authorization`](https://agentwebmap.com/v1/resolve?q=modelcontextprotocol%20authorization) | Find documentation URLs, evidence and freshness for a task |
| [`GET /v1/search?q=cloudflare`](https://agentwebmap.com/v1/search?q=cloudflare) | Search publishers by words and meaning |
| [`GET /v1/domains`](https://agentwebmap.com/v1/domains) | Browse ranked listings with filters and pagination |
| [`GET /v1/countries`](https://agentwebmap.com/v1/countries) | Available inferred country codes, names and listed-site counts, including unknown locations |
| [`GET /v1/domain/agentwebmap.com`](https://agentwebmap.com/v1/domain/agentwebmap.com) | Look up one publisher and its files |
| [`GET /v1/domain/agentwebmap.com/llms.txt`](https://agentwebmap.com/v1/domain/agentwebmap.com/llms.txt) | Read a validated cached publisher file |
| [`GET /v1/categories`](https://agentwebmap.com/v1/categories) | Discover category IDs, counts and declared capabilities |
| [`GET /v1/sections`](https://agentwebmap.com/v1/sections) | Discover heading labels, counts and emerging sections |
| [`GET /v1/section-graph`](https://agentwebmap.com/v1/section-graph) | Explore heading connections and selected publishers |
| [`GET /stats.json`](https://agentwebmap.com/stats.json) | Read current index statistics |

[API reference](https://agentwebmap.com/docs) · [Markdown reference](https://agentwebmap.com/docs.md) · [Live OpenAPI](https://agentwebmap.com/openapi.json) · [Local reference](docs/api.md)

## MCP tools

The hosted server exposes **20 tools**, checked on 22 October 2026. `tools/list` is the live inventory.

| Tool | Purpose |
|---|---|
| `resolve` | Find documentation URLs, evidence, freshness, terms and alternatives |
| `search_llms_registry` | Search publishers and indexed documentation metadata |
| `list_domains` | Browse and filter ranked listings |
| `lookup_domain` | Read a publisher's listing and file URLs |
| `read_llms_txt` | Read a cached file with source URL, check date and hash |
| `list_categories` | Discover categories, agentic labels and declared capabilities |
| `list_countries` | Discover inferred countries and counts; filter list, search, resolve and sections with `country` |
| `list_sections` | Discover headings, counts, emerging labels and coverage |
| `explore_sections` | Explore shared headings, connections and matching publishers |
| `directory_stats` | Read directory-wide counts |
| `check_llms_txt` | Validate a published file and see suggested fixes |
| `generate_llms_txt` | Generate a draft for an owner to review before publishing |
| `verification_instructions` | Read ownership methods and how to start a private claim |
| `register_domain` | Submit a domain for checking |
| `begin_ownership_claim` | Start a fresh ownership challenge |
| `verify_domain` | Complete a challenge using private credentials and published proof |
| `rotate_owner_key` | Replace an owner's API key |
| `update_site` | Manage a verified listing and its terms for agents |
| `site_stats` | Read private health, discovery activity and score history |
| `recrawl_site` | Request a fresh check for a verified listing |

Owner tools require the domain's owner credentials. Public discovery does not require ownership verification. Registration, ownership and listing updates should be performed at the owner's request. [Ownership guide](docs/ownership.md).

## Why verify your website?

[Verify your website—free](https://agentwebmap.com/verify?from=github) to control its description and tags, publish terms for agents, recheck file health, and return to a private dashboard with daily discovery activity and score history. [Preview the dashboard](https://agentwebmap.com/manage/preview) before verifying; the preview is illustrative and contains no live publisher data. Valid, listed, unblocked, verified profiles become eligible for search-engine visibility. Verified listings receive an ownership signal and an embeddable badge; eligible verified publishers are included in [our llms-full.txt](https://agentwebmap.com/llms-full.txt). Default Browse puts verified listings first; task search prioritizes relevance.

Unverified publisher profiles stay available on the website and through REST/MCP, with search indexing disabled. Search engines decide which eligible verified profiles to index; verification does not guarantee ranking or establish endorsement.

The browser guides you through proof in llms.txt, DNS, a homepage meta tag or a well-known file. API and MCP clients start a fresh claim, publish its proof and complete the check using private claim credentials. No backlink is required. Verification confirms domain control, rather than accuracy or endpoint availability.

Listing health and activity are available in the owner dashboard. Public watches and outbound owner notifications have been retired. [Current owner controls](https://agentwebmap.com/docs#why-verify).

## Access and source quality

Public discovery has no automatic daily usage or pagination quotas. Usage is monitored; high activity creates an operator review alert, and the operator can explicitly block a source. Pages hold at most 100 results, and MCP batches at most 10 messages. Owner credentials are separate from optional integration keys. [Access details](https://agentwebmap.com/docs#limits).

Coverage is incomplete. Matching evidence comes from publisher metadata, link descriptions and headings, rather than the full text of every linked page. Read original sources before relying on implementation details. Use the publisher's search or web search when results are missing, weak or stale. Inferred labels and declared endpoints do not certify an available action. [Categories and capabilities](docs/categories.md) · [Terms for agents](docs/agent-terms.md).

Current figures are on the [statistics page](https://agentwebmap.com/stats). Request counts can include crawlers, tests and repeated calls; they do not establish unique visitors or independent agent adoption.

## Learn more and get in touch

- [What is llms.txt?](https://agentwebmap.com/what-is-llms-txt)
- [Real llms.txt examples](https://agentwebmap.com/llms-txt-examples)
- [llms.txt best practices](https://agentwebmap.com/llms-txt-best-practices)
- [How Agent Web Map works](https://agentwebmap.com/about)
- [Agent-readable service overview](https://agentwebmap.com/llms.txt)
- [Practical task examples](docs/task-examples.md)
- [Contact Agent Web Map](https://agentwebmap.com/contact) · [X](https://x.com/AgentWebMap)

Feedback: [Issues](https://github.com/AgentWebMap/mcp/issues) or [Discussions](https://github.com/AgentWebMap/mcp/discussions).

The [brand assets](brand/) may be used to link to Agent Web Map. The MIT license covers the materials in this public repository; the hosted platform and directory data are provided separately by agentwebmap.com.
