# Agent Web Map: API and MCP documentation

Free public reads. Base URL: https://agentwebmap.com.

<a id="start"></a>

## Start with a task

Try a real lookup on the [homepage](https://agentwebmap.com/#task-discovery) or call the public API. No account or key is needed.

1. Send a publisher and task to resolve, for example `modelcontextprotocol authorization`.
2. Inspect `sources`, `match.strength` and `health.stale`, then read the original publisher pages. The returned excerpts are link metadata, not the full pages.
3. Refine a weak match once, or use the publisher’s search or ordinary web search when coverage is insufficient.

For repeated use, [connect an MCP client](#mcp) or use HTTP from your existing tools. The optional [discovery skill](https://github.com/AgentWebMap/mcp/tree/main/skills/agentwebmap-docs) describes when to try this workflow and when to fall back. Connection exposes tools to the client; the client decides when to use them. Publishing llms.txt or an MCP manifest does not automatically install a connection or establish persistent use.

For relationships between publishers, [open the point cloud](https://agentwebmap.com/explore) or use [section discovery](#sections). Its connections come from shared file headings. Voyage embeddings power meaning-based search; AI categorization supplies inferred topics and summaries separately. Neither is needed to extract a heading.

The [workspace](#workspace) is optional for people who want saved sources. Domain verification is optional for owners who want listing controls; neither is required for agent discovery.

<a id="workspace"></a>

## A workspace for people

The [private workspace](https://agentwebmap.com/workspace) lets people save favorite sources, organize private collections, revisit recently opened sources and connect verified websites. [Sign in](https://agentwebmap.com/workspace/signin) using a six-digit email code. Codes expire after 10 minutes, work once and must be entered in the requesting browser. Browser sessions last up to 30 days, or until sign-out.

Favorites, collections, email addresses and browsing history are private account data. They are not part of the public directory, REST API or MCP tools. Source prompts, MCP setup and downloadable Markdown source lists help bring saved references into your agent’s workflow; publisher files remain reference material.

Email sign-in confirms access to a mailbox. To manage a website, separately confirm domain ownership or sign in with its current owner key while logged into your workspace. Changing an owner key or lapsing verification invalidates linked dashboard access until the website is reconnected. Standalone owner-key access remains available without a workspace account.

The directory, public API and MCP server remain usable without signing in. [Curated collections](https://agentwebmap.com/collections) provide public, task-focused starting points; your own collections stay private.

<a id="resolve"></a>

## Find a source for a task

Start with a publisher and a task, or an exact domain. Public reads need no API key.

```sh
curl 'https://agentwebmap.com/v1/resolve?q=modelcontextprotocol%20authorization&limit=3'
```

Read `best`, `sources`, `match.strength` and `health.stale`, then fetch the linked publisher pages. Source excerpts come from publisher link titles, descriptions and headings; they are not the full text of those pages. Weak matches need a more specific query or broader search.

| Parameter | Meaning |
| --- | --- |
| `q` | Domain, URL or task; required, up to 200 characters |
| `detail` | `compact` (default) or `full`, which adds owner/profile details |
| `limit` | 1–5 documentation targets; default 3 |
| `max_age` | Acceptable check age in seconds; 0–2592000, default 86400 |
| `refresh` | `true` performs a bounded live llms.txt check for this response |
| `category`, `capability`, `agentic`, `country` | Optional filters, combined with AND |

`health.stale` marks old checks without hiding them. A live refresh checks llms.txt, not every linked page, and does not update the stored index. Missing owner terms mean unknown. A topic with no match returns `404`, `error: "no_match"` and `best: null`; discovery does not require registering the missing site.

<a id="search"></a>

## Search and browse

Use [Browse](https://agentwebmap.com/browse) or the same search through REST and MCP. Search combines keyword matches with meaning-based matches when available, removes duplicates and ranks relevance before verification and authority. If semantic search is unavailable, keyword search still works. Listings without a query use verified-first authority ordering.

```sh
curl 'https://agentwebmap.com/v1/search?q=event%20delivery%20retries&per_page=10'
curl 'https://agentwebmap.com/v1/domains?category=developer-tools&agentic=interface'
curl 'https://agentwebmap.com/v1/domain/modelcontextprotocol.io'
```

| Endpoint | Returns |
| --- | --- |
| `GET /v1/search?q=…` | Query, page, per_page, total and matching results |
| `GET /v1/domains` | Ranked listings; also accepts `q` |
| `GET /v1/domain/{domain}` | One domain’s file URLs, summary, categories, agentic label and check date |
| `GET /v1/categories` | Taxonomy, overlapping counts, declared capabilities and agentic counts |
| `GET /v1/countries` | Available country codes, names and listed-site counts, plus unknown and total counts |
| `GET /v1/stats` | Directory counts |
| `GET /v1/map` | Valid sites by inferred country |

Search and list accept `page` (default 1), `per_page` (default 10, maximum 100), `verified=true`, `detail` and the filters below. There is no discovery result-window quota; continue through pages or refine your query. `include_unlisted=true` requires an approved client with that permission. MCP uses `verified_only` for the verified filter. Browse uses 25 rows per page and shares the same ranking.

<a id="countries"></a>

## Filter by country

Choose a country in [Browse](https://agentwebmap.com/browse) or [Explore](https://agentwebmap.com/explore). REST and MCP accept the same `country` filter on listings, keyword/semantic search, task resolution, the section catalogue and section graph.


```sh
curl 'https://agentwebmap.com/v1/countries'
curl 'https://agentwebmap.com/v1/domains?country=FR&category=developer-tools'
curl 'https://agentwebmap.com/v1/search?q=payments&country=US'
curl 'https://agentwebmap.com/v1/section-graph?sections=services&country=GB'
curl 'https://agentwebmap.com/v1/domains?country=unknown'
```


Use a two-letter ISO 3166-1 country code, case-insensitive (`FR` and `fr` are equivalent); `XK` is also supported for Kosovo. `country=unknown` selects sites without an assigned location, including those masked by a CDN. Omit the filter for all countries. Invalid values return `400 invalid_country`; valid countries with no matching sites return empty results. Filters combine with AND; exact-domain resolution outside the country returns `404 no_match`.

Call `GET /v1/countries` or the MCP tool `list_countries` to discover available codes, names and counts. Its `countries` array is alphabetized by name; `unknown` and `total` count valid, listed, unblocked sites. MCP accepts, for example, `list_domains({"country":"FR"})`, `resolve({"query":"payments api","country":"US"})` and `explore_sections({"sections":["services"],"country":"GB"})`.

Country is inferred from a country-code domain when meaningful, otherwise from hosting IP location. It does **not** establish company headquarters, nationality, language, availability or markets served. Shared CDN edge locations are withheld. Compact and full domain results include `country` (code or null) and `country_source` (`tld`, `ip`, `cdn` or null); `cdn` explains why location was withheld. The filter does not require another crawl or a paid AI call.

In the section catalogue and graph, `sites` counts and edges respect the selected country. `total_sites`, `change_7d`, emergence dates and `coverage` remain global context for the index. Counts can lag by about a minute.

<a id="sections"></a>

## Publisher sections and connections

Explore [the section cloud](https://agentwebmap.com/explore) or query the same growing catalogue through REST and MCP. Labels are extracted from indexed publisher headings without a fixed topic list or paid AI classification. Formatting and case are normalized; original headings, hierarchy, source files and lines remain available. Different words are not automatically treated as synonyms.

| Endpoint / tool | Returns |
| --- | --- |
| GET /v1/sections · list_sections | Section keys, labels, unique-site counts, first observation, emerging dates, seven-day changes and coverage |
| GET /v1/section-graph · explore_sections | Up to 36 section clusters, their strongest 180 connections and a bounded page of matching publishers |

Start with `GET /v1/sections?sort=common&per_page=20`. Substitute returned keys in `GET /v1/section-graph?sections=SECTION_KEY&include_sites=false` or `GET /v1/domains?sections=FIRST_KEY,SECOND_KEY&section_match=all`.

Catalogue options: `q` (word-prefix search), `sort=common|alphabetical|emerging`, `page`, `per_page` (1–100, default 36), and optional `sections` / `section_match` to find co-occurring labels. Graph options: up to five `sections`, `section_match=all|any`, `page`, `per_page` (default 50) and `include_sites=false` for aggregate-only refreshes. REST accepts comma-separated keys; MCP accepts an array. Standard pagination limits apply.

Search, list and Browse accept these section filters alongside category and agentic filters. Compact domain results add `section_keys`, `section_partial` and `section_indexed_at`. Full detail adds `section_headings`: original label, key, level, path, source URL, line (null for older link metadata) and parsing format. Heading presence describes published content and does not certify a capability.

Counts include each valid, listed, unblocked domain once per label. Repeated headings do not inflate counts. Graph edges count sites carrying both labels within the selection; `strength` is overlap divided by the square root of the two label counts. Positions are an approximate visual layout, not a ranking or publisher affiliation. Root graphs contain aggregates. Publisher reads are measured for operator review without automatic quotas; metadata-only refreshes return no publisher records.

Root files are parsed independently of sampled links, up to 512 KiB of characters and 512 headings. Size limits, incomplete copies and nested/legacy link-only evidence are marked partial. `coverage` reports indexed and eligible sites, partial sites, pending files and baseline status. A missing label on an incompletely indexed site does not prove the publisher lacks that content.

New files, file edits and indexed metadata changes enter a durable extraction queue. Broken files, blocks and tier changes update memberships automatically. `first_seen` means first observed by this catalogue, not first published. `emerging` shows labels first observed after the initial backfill finished; initial backfill labels are excluded. `change_7d` is net unique-site membership growth after the baseline. Cached views can lag by about a minute.

<a id="categories"></a>

## Categories, capabilities and agentic labels

Get category IDs from [GET /v1/categories](https://agentwebmap.com/v1/categories). A site can have several categories or remain uncategorized. Categories describe topics. `capability=mcp` requires a qualifying publisher-declared MCP endpoint; the declaration does not certify endpoint availability or protocol compatibility.

The `agentic` field summarizes what an agent may find at the site. These inferred labels help discovery; read the publisher’s documentation and terms before acting.

| Value | Meaning |
| --- | --- |
| `interface` | a documented API or declared MCP endpoint an agent can call |
| `transactional` | buying or booking an agent could carry out |
| `documentation` | developer or product docs worth reading, nothing to call |
| `informational` | content or services for people, nothing to operate |

Filter search, list and resolve with `agentic=interface`, `transactional`, `documentation` or `informational`. Unlabelled sites have `agentic: null`. Filters combine with AND. Invalid filter values return `400`; an exact-domain resolve outside the selected filters returns `404 no_match`. Use `detail=full` for category and capability evidence.

<a id="files"></a>

## Read cached files

Read our validated copy of a publisher’s llms.txt without another request to the publisher.

```sh
curl -i 'https://agentwebmap.com/v1/domain/modelcontextprotocol.io/llms.txt'
```

The response is `text/plain`, with `X-Source-URL`, `X-Checked-At`, `X-Content-Hash` and `X-Truncated` headers. A size-limited copy is marked as truncated. The MCP tool `read_llms_txt` returns the content inline with the same metadata. Files not yet cached are fetched on demand with bounded work per call. Invalid files return `409`; unavailable copies return an error rather than an invented file.

[Our llms.txt](https://agentwebmap.com/llms.txt) is a concise service guide with discovery, country filters, publisher sections, public collections, private workspaces and owner tools. [Our llms-full.txt](https://agentwebmap.com/llms-full.txt) includes this complete platform/API/MCP reference, generated from the same documentation sections, followed by eligible valid, listed, unblocked sites whose owners have verified their domains. Those entries include file links and summaries. The full searchable directory remains available through the API; unverified publishers are not enumerated in the full file. Private workspace and admin data are excluded.

<a id="statistics"></a>

## Directory statistics

[Statistics](https://agentwebmap.com/stats) and [stats.json](https://agentwebmap.com/stats.json) describe the index, updated hourly: listed sites, llms-full.txt availability, additions by day, categories, inferred country, language and file sizes.

These figures measure this index, not all websites. Additions record when a valid file entered the index, not the publisher’s adoption date. Category counts overlap; country inference may reflect hosting location. Cite the statistics URL and `generated_at` date when reusing figures.

<a id="mcp"></a>

## MCP server

Connect to `https://agentwebmap.com/mcp` using stateless Streamable HTTP. Public reads need no key. Owner tools take the domain-scoped `api_key` as an argument. Discovery metadata: [/.well-known/mcp.json](https://agentwebmap.com/.well-known/mcp.json).

### Codex

```sh
codex mcp add agentwebmap --url https://agentwebmap.com/mcp
```

### Claude Code

```sh
claude mcp add --transport http agentwebmap https://agentwebmap.com/mcp
```

### Cursor
Save in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "agentwebmap": {
      "url": "https://agentwebmap.com/mcp"
    }
  }
}
```

### VS Code
Save in `.vscode/mcp.json`:

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

### Available tools (20)

| Tool | Purpose |
| --- | --- |
| `list_sections` | Discover publisher section labels across the indexed corpus, distinct-site counts, new labels and seven-day membership changes |
| `explore_sections` | Explore relationships between publisher headings |
| `resolve` | Start here to find documentation for a domain or development task |
| `directory_stats` | Directory-wide counts for Agent Web Map: domains tracked, valid llms.txt files, listed, verified, pending. |
| `list_countries` | List inferred country codes and names with valid listed-site counts, plus the unknown count |
| `list_categories` | List topic taxonomy and counts by inferred category and agentic label, unclassified sites and publisher-declared MCP endpoints |
| `search_llms_registry` | Search domains and indexed documentation links by words and meaning |
| `list_domains` | Ranked listing of the directory (verified first, then authority) |
| `lookup_domain` | Look up a domain: source URLs, summary, authority, ownership verification, inferred country, last check and owner-stated terms |
| `read_llms_txt` | Return our validated copy of a listed site's llms.txt as text, with its source URL, check date and content hash |
| `verification_instructions` | Describe optional ownership management and its four proof methods |
| `check_llms_txt` | Validate a site's llms.txt: reachability, HTML-instead-of-text, redirects to other domains, H1 title, summary, sections, links, link health, llms-full.txt and charset |
| `generate_llms_txt` | Draft an llms.txt for a site from its own homepage, sitemap and page titles |
| `register_domain` | Submit a domain that publishes an llms.txt so it gets crawled and indexed |
| `begin_ownership_claim` | Start optional ownership management or recovery for a domain you control |
| `verify_domain` | Complete the fresh challenge from begin_ownership_claim using its private claim credentials |
| `rotate_owner_key` | Owner only |
| `update_site` | Verified owner only |
| `site_stats` | Verified owner only |
| `recrawl_site` | Verified owner only |


```sh
curl -X POST 'https://agentwebmap.com/mcp' -H 'content-type: application/json' -H 'accept: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"read_llms_txt","arguments":{"domain":"modelcontextprotocol.io"}}}'
```

Tools publish input/output schemas and behavior annotations. Annotations describe effects; they do not grant authorization. [Optional discovery skill](https://github.com/AgentWebMap/mcp/tree/main/skills/agentwebmap-docs) and [dependency discovery CLI](https://github.com/AgentWebMap/mcp/blob/main/docs/discovery-cli.md).

<a id="why-verify"></a>

## What verification unlocks

See how your site is discovered—and control what agents see. [Verify your website—free](https://agentwebmap.com/verify?from=docs) or [preview the owner dashboard](https://agentwebmap.com/manage/preview). Your private dashboard brings together listing controls, file health, on-demand rechecks, daily discovery activity and score history. Return to review the latest results. API and MCP clients can use the same owner operations.

Listings and public discovery are usable without verification. Search-engine indexing of individual publisher profiles requires ownership verification and a valid, listed, unblocked profile. Unverified profiles stay available on the website, REST and MCP, with search indexing disabled. Verification makes a profile eligible; it does not guarantee indexing or ranking. Ownership confirmation proves domain control, not content accuracy or endorsement.

- Control what agents see: Edit your listing description, tags, public contact details and additional llms.txt paths. Publish your terms for automated access, attribution and pricing.
- Make your profile eligible for search: A valid, listed, unblocked, verified profile can appear in our publisher sitemap and become eligible for search-engine visibility. Search engines decide what to index and rank.
- Appear in our llms-full.txt: Eligible verified publishers are listed by name, with their file links and summaries, in the service overview agents can read.
- Review discovery activity: Your private dashboard shows measured web, REST and MCP requests, documentation selections, publisher-link clicks and daily activity. Counts include bots and repeats; they do not identify unique agents or confirm publisher page reads.
- Check file health: Review validation results, request a fresh check on demand and follow your directory score history.
- Show confirmed ownership: Your listing carries a domain-ownership signal. Default Browse places verified listings first; task searches prioritize relevance. Verification confirms domain control, not content quality or endorsement.

An owner’s coding agent may complete verification on their behalf when authorized to manage that domain. Publish only the public proof; keep claim credentials and API keys private.

<a id="submit"></a>

## Submit a site

Publish a public llms.txt, then submit the domain for crawling. Verification is optional.

```sh
curl -X POST 'https://agentwebmap.com/v1/sites' -H 'content-type: application/json' -d '{"domain":"example.com"}'
```

Returns `202` when queued or `200` for an existing domain. The response includes public verification guidance.

<a id="verify"></a>

## Verify domain ownership

Start a fresh claim. This also creates the domain record if needed, so an existing publisher can verify in two API calls with a proof publication between them.

```sh
curl -X POST 'https://agentwebmap.com/v1/sites/example.com/claims'
```

Keep `claim_id` and `claim_secret` private. Publish the returned `verification.token` using one of its snippets: llms.txt, DNS TXT, a homepage meta tag or a well-known file. Then complete the claim:

```sh
curl -X POST 'https://agentwebmap.com/v1/sites/example.com/verify' \
  -H 'content-type: application/json' -d '{"claim_id":"...","claim_secret":"..."}'
```

MCP uses `begin_ownership_claim`, then `verify_domain`. The claim expires after 30 minutes and succeeds only once. Success returns a domain-scoped API key, shown once. A failed proof returns `422`; fix it and retry before expiry. Public proofs alone cannot issue keys. Keep the successful proof published: checks recur and verification lapses after 14 days of continuous failure.

`GET /v1/sites/{domain}/verification` describes methods without private credentials. Recover a lost owner key with a fresh claim and proof. Authenticated `POST /v1/sites/{domain}/key` or `rotate_owner_key` replaces a key and invalidates old keys, browser sessions and pending claims.

<a id="manage"></a>

## Manage a verified listing

Use `Authorization: Bearer <api_key>` for REST owner endpoints.

| Endpoint | Action |
| --- | --- |
| `PATCH /v1/sites/{domain}` | Edit description, tags, nested_llms_txt, contact and agent_terms; null clears a field |
| `GET /v1/sites/{domain}/stats` | Measured usage by surface, daily activity, file health, score history and badge |
| `POST /v1/sites/{domain}/recrawl` | Revalidate now; once per 10 minutes |
| `POST /v1/sites/{domain}/key` | Rotate the owner key; replacement shown once |


```sh
curl -X PATCH 'https://agentwebmap.com/v1/sites/example.com' \
  -H 'authorization: Bearer awm_key_...' -H 'content-type: application/json' \
  -d '{"description":"Publisher documentation","tags":["docs"],"nested_llms_txt":["/docs/llms.txt"]}'
```

Description: up to 500 characters. Tags: up to 10 lowercase slugs. Nested paths: up to 20 same-site paths ending in .txt or .md. Usage measures requests, including bots, tests and repeats; it does not count unique agents or prove that returned publisher pages were read.

<a id="agent-terms"></a>

## Publish terms for agents

Set an `agent_terms` object with the owner PATCH endpoint. These owner-stated terms appear in listings and resolve responses. Missing terms remain unknown.

| Field | Meaning |
| --- | --- |
| `automated_access` | one of welcome / limited / ask / not_allowed: may agents use the site automatically? |
| `rate_limit` | short text, e.g. "60 requests/minute" |
| `attribution` | one of required / appreciated / none |
| `attribution_text` | how to credit the site (≤200 chars) |
| `pricing` | one of free / freemium / paid |
| `pricing_url` | where prices are published |
| `terms_url` | the full terms for automated use |
| `notes` | anything else an agent should know (≤500 chars) |

<a id="tools"></a>

## Check or generate llms.txt

| Endpoint | Action |
| --- | --- |
| `GET /v1/check/{domain}` | Live validation with diagnostics and preview; MCP: check_llms_txt |
| `GET /v1/generate/{domain}` | Draft from homepage, sitemap and page titles; MCP: generate_llms_txt |

The browser [checker](https://agentwebmap.com/check) and [generator](https://agentwebmap.com/generate) use the same operations. Review a generated draft before publishing it. Validation and generation do not submit the site automatically.

<a id="badge"></a>

## Directory badge

`GET /badge/{domain}.svg` returns a current status badge. Owners can embed it with a link to their listing; a backlink is optional.

```html
<a href="https://agentwebmap.com/domain/example.com"><img src="https://agentwebmap.com/badge/example.com.svg" alt="Agent Web Map listing"></a>
```


<a id="negotiation"></a>

## Machine-readable pages

Domain pages support `Accept: application/json` and `Accept: text/markdown`. Browse supports JSON. These docs support `Accept: text/markdown`, or use [docs.md](https://agentwebmap.com/docs.md) directly. [OpenAPI](https://agentwebmap.com/openapi.json) describes REST request and response schemas; [GET /v1](https://agentwebmap.com/v1) lists discovery links and endpoints.

<a id="limits"></a>

## Access, monitoring and errors

Public discovery is free and needs no account or API key. There are no automatic daily request, returned-record, distinct-domain, byte or result-window quotas for website, REST or MCP discovery. High activity creates an operator review alert; it does not automatically deny access. An operator can explicitly block a particular source network or client. A manual block returns `403 access_blocked`.

We record source network addresses, self-reported agent names, operations and returned-record counts for service operations and abuse review. Detailed activity is retained for 7 days and daily usage for 30 days. IPv6 sources share a /64 identity. Credentials and query text are excluded. These observations describe requests and networks, not verified people.

An optional operator-issued client key identifies an integration. Send `Authorization: Bearer awm_client_…` or `X-AgentWebMap-Key: awm_client_…` on API and MCP requests. Owner keys manage one listing and are separate. Invalid or revoked client keys return `401`; omit the key for public discovery.

Responses use `X-AgentWebMap-Access: monitor` and `Cache-Control: private, no-store`. Each page contains at most 100 records. MCP accepts at most 10 messages per batch, and oversized requests are rejected before execution. Unlisted enumeration still requires explicit permission, and bulk export remains disabled unless separately enabled for an approved client. Automated collection to reproduce or redistribute the directory requires prior written approval. Publisher content remains subject to its publisher’s terms.

Ownership checks, registration and sign-in retain their workflow safeguards. Live source probes are coalesced for a minute per domain; cached directory discovery remains available. Errors are JSON with an `error` code and usually a `hint`. Common statuses: `400` invalid input, `401` missing/bad credentials, `403` manual block or private-data permission required, `404` missing listing or no match, `409` unavailable valid file or changed ownership, `413` oversized request or MCP batch, `422` proof not found, `429` protected workflow throttle, `502` publisher fetch failure. Respect owner terms and the source site’s access rules.
