<p align="center"><a href="https://agentwebmap.com/"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://agentwebmap.com/logo-dark.svg?v=awm-20261022">
  <img src="https://agentwebmap.com/logo.svg?v=awm-20261022" alt="Agent Web Map" width="420">
</picture></a></p>

# Agent Web Map — llms.txt directory, API and MCP server

[Agent Web Map](https://agentwebmap.com/) helps AI agents find publisher documentation and llms.txt files. Search for a website or task, inspect source links and check dates, and read the original publisher's documentation.

Use the **free JSON API**, connect to the **hosted MCP server**, or browse the same directory on the website. The original interactive **3D index explorer** shows connections between headings found in publisher files.

**[Browse the directory](https://agentwebmap.com/browse) · [Explore the index](https://agentwebmap.com/explore) · [Connect an agent](https://agentwebmap.com/docs#start) · [Manage your website](https://agentwebmap.com/manage)**

## What you can do

| Goal | Use |
|---|---|
| Find documentation for a task | Source links, matching evidence and recorded check dates |
| Find a publisher | Directory search, filters and domain lookup |
| Read an indexed llms.txt | A cached copy with its source URL and dates |
| Discover related sources | Similar publishers and the original 3D heading explorer |
| Prepare a website for agents | llms.txt checker, generator, draft validation and website audit |
| Manage your listing | Optional domain verification and a private owner dashboard |

The service has grown beyond its original directory: it now includes task-focused discovery, cached publisher files, named integrations and API keys, MCP OAuth, private workspaces and publisher controls. Agents can still start without creating an account.

<a id="add-it"></a>
<a id="mcp-tools"></a>

## Connect through MCP

Add this remote Streamable HTTP endpoint to your MCP client:

```text
https://agentwebmap.com/mcp
```

No local server installation is required. Start with the anonymous discovery allowance, or connect a free integration key or OAuth account for more access.

Try a prompt such as:

> Use Agent Web Map to find the Model Context Protocol authorization documentation. Show the source links and check dates, then read the original publisher pages.

Discovery tools include `resolve`, `search_index_preview`, `search_llms_registry`, `list_domains`, `lookup_domain`, `read_llms_txt`, `similar_sites` and the category, country and heading tools. Live website tools and owner management have separate access requirements. Use `tools/list` for the current inventory.

**[MCP setup and tools](https://agentwebmap.com/docs#mcp) · [First-use guide](https://agentwebmap.com/docs#start) · [Task examples](docs/task-examples.md)**

<a id="use-the-json-api"></a>

## Use the API

```sh
curl --get https://agentwebmap.com/v1/resolve \
  --data-urlencode "q=modelcontextprotocol authorization" \
  --data-urlencode "limit=3"
```

| Endpoint | Purpose |
|---|---|
| `GET /v1/resolve?q=…` | Find documentation for a task |
| `GET /v1/search/preview?q=…` | Get a small, non-exhaustive keyword preview |
| `GET /v1/search?q=…` | Search the directory |
| `GET /v1/domains` | Browse and filter publishers |
| `GET /v1/domain/{domain}` | Look up a publisher |
| `GET /v1/domain/{domain}/llms.txt` | Read a cached publisher file |
| `GET /v1/sections` | Discover indexed publisher headings |
| `GET /v1/similar/{domain}` | Find related publishers |

Filter by category, country, publisher-declared MCP capability, site type or indexed headings. Exact options and response formats are in the live reference.

**[API documentation](https://agentwebmap.com/docs) · [OpenAPI](https://agentwebmap.com/openapi.json) · [Markdown reference](https://agentwebmap.com/docs.md)**

## Developer guides

The documentation now has focused chapters, topic search and copyable examples. Start with one task, then open the reference you need.

| Build or connect | Guide |
|---|---|
| Make your first request | [Quick start](https://agentwebmap.com/docs#start) |
| Connect Claude Code, Cursor, VS Code or Codex | [MCP setup](https://agentwebmap.com/docs#mcp) |
| Create a scoped application key or use OAuth | [Integration access](https://agentwebmap.com/docs#accounts) |
| Handle allowances and temporary errors | [Limits and errors](https://agentwebmap.com/docs#limits) |
| Submit a published file or automate a deployment check | [Submission guide](https://agentwebmap.com/docs#submit) |
| Verify and manage a website | [Ownership guide](docs/ownership.md) |

The [Markdown API guide](docs/api.md) and [OpenAPI snapshot](openapi.json) are generated from the same reference as the hosted service. The [live reference](https://agentwebmap.com/docs) describes the active release.

<a id="access-and-source-quality"></a>

## Free access and accounts

- **Anonymous discovery:** 100 distinct publishers per network per UTC day, without an account or key.
- **Free identified access:** 5,000 distinct publishers per UTC day after confirming an account and adding an application name and purpose. Sessions, keys and OAuth connections share the account allowance.
- **Larger bulk access:** separately approved. Changing a key or application does not reset the allowance.
- **Public publisher pages:** individual HTML profiles remain available without signing in.
- **Live website tools:** checking, generation, website audits and MCP endpoint inspection require free registered access and have separate limits.

Discovery uses stored index data and cached files. A search or lookup does not fetch publisher websites, run paid AI or start a live recrawl. Live tools are separate and use bounded public website fetches. [Access details](https://agentwebmap.com/docs#limits).

<a id="why-verify-your-website"></a>

## For website owners

[Verify a domain you control](https://agentwebmap.com/verify?from=github) to manage its agent-facing summary, tags and terms, request a recrawl and review its recorded discovery activity and file health. Verification is optional for discovery and proves domain control. It does not certify content or guarantee search ranking.

The Overview comes from the publisher's llms.txt. A verified owner can separately edit the agent-facing summary or restore its generated version. These are distinct fields. [Owner guide](docs/ownership.md).

<a id="a-workspace-for-people"></a>

## Browse and explore

The website includes directory list and grid views, light and dark themes, source details, country filters and the original interactive 3D point cloud. A free private workspace adds favorites, collections, saved reports, recently opened sources and integration management.

**[Directory](https://agentwebmap.com/browse) · [3D index explorer](https://agentwebmap.com/explore) · [World map](https://agentwebmap.com/map) · [Workspace](https://agentwebmap.com/workspace) · [Current index statistics](https://agentwebmap.com/stats)**

## About the index

Agent Web Map builds on the [llms.txt proposal](https://llmstxt.org/) by Jeremy Howard. Publishers host their files; the platform indexes and checks them; clients query the stored directory and follow the original source links.

Coverage is incomplete. Check dates, inferred labels and matching evidence help you assess a result; read the publisher's pages before relying on technical details. Declared MCP endpoints and headings do not prove that an action is available. Index growth and request totals do not establish unique users or independent agent adoption.

This GitHub page introduces the hosted product and provides connection guides. The application, crawler, database and infrastructure source are private. Public API examples are for using the service.

**[About Agent Web Map](https://agentwebmap.com/about) · [What is llms.txt?](https://agentwebmap.com/what-is-llms-txt) · [Contact](https://agentwebmap.com/contact) · [X](https://x.com/AgentWebMap)**
