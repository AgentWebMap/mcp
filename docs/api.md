# Agent Web Map: API and MCP documentation

Free basic discovery; registered tools and deeper enumeration. Base URL: https://agentwebmap.com.

<a id="start"></a>

## Quick start

Connect an AI client through MCP, or call the JSON API from an application. Both use the same stored directory.

### Connect an AI client

```text
https://agentwebmap.com/mcp
```

Add this hosted Streamable HTTP endpoint to your client. [Open client setup](#mcp) for Claude Code, Cursor, VS Code and Codex.

### Make an API request
```sh
curl --get 'https://agentwebmap.com/v1/resolve' \
  --data-urlencode 'q=modelcontextprotocol authorization' \
  --data-urlencode 'limit=3'
```
Inspect the returned source links and check dates, then read the original publisher pages. [Open the resolve reference](#resolve) for parameters and response fields.

### Access and keys
Start without a key: 100 distinct publishers per network per UTC day. A free email-confirmed account with an application name and purpose receives 5,000/day, shared across sessions, keys and OAuth connections.

[Create an integration key or connect OAuth](#accounts) for recurring use. [Live website tools](#website-tools) require registered access; managing a listing also requires domain proof. [Read the limits and error guidance](#limits).

### How source discovery works

Agent Web Map is an llms.txt directory, JSON API and hosted MCP server for finding publisher documentation. It returns sources and evidence for your agent to inspect; it does not execute publisher actions or replace reading the original documentation.

Try a stored-data lookup on the [homepage](https://agentwebmap.com/#task-discovery) or call the public API within the free anonymous allowance.


```sh
curl --get 'https://agentwebmap.com/v1/resolve' \
  --data-urlencode 'q=modelcontextprotocol authorization' \
  --data-urlencode 'limit=3'
```


Anonymous discovery includes 100 distinct publishers per UTC day across the website, API and MCP. A free email-confirmed account with a named application and declared purpose includes 5,000/day, shared across its sessions and credentials. Repeated publishers do not use another publisher. Larger bulk access requires approval. Domain ownership proof is required to manage a listing, not to read the directory. Registered live tools have separate limits; ordinary reads use stored data and never start paid AI work.

1. Send a publisher and task to resolve, for example `modelcontextprotocol authorization`.
2. Inspect `sources`, `match.strength` and `health.stale`, then read the original publisher pages. The returned excerpts are link metadata, not the full pages.
3. Refine a weak match once, or use the publisher’s search or ordinary web search when coverage is insufficient.

For repeated use, [connect an MCP client](#mcp) or use HTTP from your existing tools. The optional [discovery skill](https://github.com/AgentWebMap/mcp/tree/main/skills/agentwebmap-docs) describes when to try this workflow and when to fall back. Connection exposes tools to the client; the client decides when to use them. Publishing llms.txt or an MCP manifest does not automatically install a connection or establish persistent use.

For relationships between publishers, [open the point cloud](https://agentwebmap.com/explore) or use [section discovery](#sections). Solid connections count shared file headings; the optional Related meanings overlay adds separately labeled inferred similarities. Stored Voyage embeddings support related publishers and semantic heading connections; AI categorization supplies inferred topics and summaries separately. Neither is needed to extract a heading.

The [workspace](#workspace) is optional for people who want saved sources. Domain verification is optional for owners who want listing controls; neither is required for agent discovery.

<a id="workspace"></a>

## A workspace for people

The [private workspace](https://agentwebmap.com/workspace) lets people save favorite sources, organize private collections, revisit recently opened sources and connect verified websites. [Sign in](https://agentwebmap.com/workspace/signin) using a six-digit email code. Codes expire after 10 minutes, work once and must be entered in the requesting browser. Browser sessions last up to 30 days, or until sign-out.

Favorites, collections, email addresses and browsing history are private account data. They are not part of the public directory, REST API or MCP tools. Source prompts, MCP setup and downloadable Markdown source lists help bring saved references into your agent’s workflow; publisher files remain reference material.

Email sign-in confirms access to a mailbox. To manage a website, separately confirm domain ownership or sign in with its current owner key while logged into your workspace. Changing an owner key or lapsing verification invalidates linked dashboard access until the website is reconnected. Standalone owner-key access remains available without a workspace account.

The directory, public API and MCP server remain usable without signing in. [Curated collections](https://agentwebmap.com/collections) provide public, hand-picked starting points for building MCP servers, integrating payments and shipping AI applications; your own collections stay private. Each collection explains its selections and filters sources against the live index. Read the catalogue or a collection with `Accept: application/json` or `text/markdown`; collection pages also have a `.md` version. For example, [Build an MCP server](https://agentwebmap.com/collections/build-mcp) links protocol, tool and deployment documentation.

<a id="resolve"></a>

## Find a source for a task

Start with a publisher and a task, or an exact domain. Public reads need no API key.

```sh
curl 'https://agentwebmap.com/v1/resolve?q=modelcontextprotocol%20authorization&limit=3'
```

Read `best`, `sources`, `match.strength` and `health.stale`, then fetch the linked publisher pages. Source excerpts come from publisher link titles, descriptions and headings; they are not the full text of those pages. Weak matches need a more specific query or broader search. Task lookup uses stored keyword and documentation evidence. It performs no paid query embedding or reranking.

| Parameter | Meaning |
| --- | --- |
| `q` | Domain, URL or task; required, up to 200 characters |
| `detail` | `compact` (default) or `full`, which adds owner/profile details |
| `limit` | 1–5 documentation targets; default 3 |
| `max_age` | Acceptable check age in seconds; 0–2592000, default 86400 |
| `refresh` | Deprecated: `true` returns `stored_data_only`. Use the registered checker for live validation. |
| `category`, `capability`, `agentic`, `country`, `action` | Optional filters, combined with AND |

`health.stale` marks old root-file checks without hiding valid sources. The default remains 24 hours. A separate maintenance worker revisits listed publishers oldest first, starting after 23 hours. Only a fully received, unchanged, valid root file renews that check date; changes and failures queue a complete crawl. This is bounded maintenance, not a guarantee that every file is less than a day old. Documentation, optional full files and ownership proof have separate crawl dates and checks.

`health.documentation_indexed_at` is the stored documentation-index date; individual `sources[].checked_at` values describe the file containing each excerpt and retain their original stored timestamps. Stale reads never enqueue a refresh. Missing owner terms mean unknown. A topic with no match returns `404`, `error: "no_match"` and `best: null`; discovery does not require registering the missing site.

### How matching and evidence work

Resolve preserves a named publisher's scope, including curated product and renamed-documentation aliases. It returns `404 no_match` with `best: null` when that publisher has no usable source or no candidate passes the relevance threshold. It does not substitute an unrelated publisher. An invalid exact-domain record can resolve to a valid sibling or known replacement; otherwise it returns no match. Use `GET /v1/domain/{domain}` to inspect an unavailable listing's historical status.

`strong` requires task evidence in the page's title or path as well as supporting metadata and publisher fit. It is a retrieval label, not a correctness probability, endorsement or proof of a working API. Ownership verification does not strengthen a task match. A library named alongside a framework keeps its own publisher scope. Established abbreviations such as RLS are expanded for matching. Equivalent documentation versions share a source slot. A task's documentation sources use a consistent edition even when paths moved between releases: current documentation or the latest indexed stable edition is preferred, unless the query requests a version or comparison. API version resource paths remain distinct.

Returned sources must support the task's distinguishing terms; a shared word such as verification alone is insufficient for a webhook task. Reference documentation precedes equally relevant skill artifacts unless a skill is requested. Ranking uses stored metadata and local rules; no paid reranking is performed. The resolver can return fewer than `limit` sources when additional links lack task evidence.

Explicit router names in `q`, such as App Router or Pages Router, constrain candidates before ranking. Shared documentation remains eligible, but pages explicitly belonging to the opposite router are excluded. Relevant reference pages take priority over KB guides, blogs and changelogs unless those publication types are requested. Only already-indexed reference links participate; a read does not fetch navigation files.

Next.js renamed Middleware to Proxy in v16 ([publisher reference](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)). An unversioned Next.js middleware task uses current Proxy documentation and explains the rename in `match.reason`. Explicit pre-v16 requests retain Middleware documentation; Edge-runtime requests are not rewritten. If an unversioned task returns only one numbered historical edition, that edition is named in `match.reason`. A publisher-specific rename never changes another library's middleware request.

Resolver, search, lookup, explorer and cached-file reads use stored data only. They never call paid AI, fetch publisher pages or enqueue paid enrichment. A missing cached file returns `cached_file_unavailable`; existing copies keep their original timestamps. Repeated resolutions may reuse a worker-local result for 20 seconds. Bounded live scraping requires a free account, integration credential or MCP OAuth; paid AI is prohibited for registered clients too.

<a id="search"></a>

## Search and browse

Use [Browse](https://agentwebmap.com/browse) or the same search through REST and MCP. Search uses stored keywords and indexed documentation evidence, ranking relevance before verification and authority. It performs no paid query embeddings or reranking. More specific task words help narrow broad searches. Stored vectors still support similar publishers and semantic heading connections. Listings without a query use verified-first authority ordering. For a small, faster result set, use GET /v1/search/preview?q=…&limit=10 or MCP search_index_preview. This examines at most 500 keyword candidates and returns at most 20 current records, with exhaustive:false and a full_search_url; it does not compute complete totals or hydrate documentation.

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
| `GET /v1/map` | Valid sites by country signal |

Search and list accept `page` (default 1), `per_page` (default 10, maximum 100), `verified=true`, `detail` and the filters below. Anonymous enumeration covers the first 250 results of a query; free accounts and integration credentials cover the first 1,000. Refine your query for focused discovery. Further enumeration requires separately approved bulk access. `include_unlisted=true` requires an approved client with that permission. MCP uses `verified_only` for the verified filter. Browse defaults to 20 rows per page and shares the same ranking.

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

Country prefers an owner-declared or site-published organization address, followed by a meaningful country-code domain or non-CDN hosting inference. It does **not** independently verify company headquarters, nationality, language, availability or markets served. Shared CDN edge locations are withheld.

Compact and full domain results include `country` and `country_source` (`owner`, `structured_data`, `contact_page`, `tld`, `ip`, `cdn` or null), plus separate `publisher_country`, `publisher_country_source` and `hosting_country`. Publisher country is null when published addresses conflict or evidence is absent; domain/hosting fallback can still populate the ordinary country filter. Full detail includes `domain_country`, `country_evidence` (country, source, URL, date and extraction method), `country_checked_at` and `country_status`.

Automatic extraction reads public organization-address structured data and explicit address elements on linked contact/legal pages. It does not infer publisher country from language, service areas, shipping destinations or CDN addresses. Pages remain subject to robots and public-address/redirect checks; up to three small pages are read per site. An ongoing backfill prioritizes missing entries, refreshes evidence monthly and retries temporary failures sooner. This requires no paid AI calls.

Verified owners can set `publisher_country` to a two-letter code using `PATCH /v1/sites/{domain}`, MCP `update_site`, or the owner dashboard; null clears their declaration. It is labeled owner-declared. Domain verification proves control, not location accuracy. Owner declarations take precedence over automated evidence. The country filter uses the same stored values across the website, REST and MCP.

In the section catalogue and graph, `sites` counts and edges respect the selected country. `total_sites`, `change_7d`, emergence dates and `coverage` remain global context for the index. Counts can lag by about a minute.

<a id="similar"></a>

## Find related publishers

Use `GET /v1/similar/{domain}` or MCP `similar_sites` to find publishers related to a known source by meaning.


```sh
curl 'https://agentwebmap.com/v1/similar/cloudflare.com?limit=6'
```


Results include compact profiles, `similarity` (cosine similarity of stored metadata vectors) and `shared_sections` (actual shared heading keys). Similarity is not a probability, affiliation, endorsement or proof of equivalent capabilities. This uses stored site vectors without a paid call for each lookup. Publisher profile pages use the same semantic ranking for Related sites. If semantic results are unavailable, the page explicitly labels category suggestions as a fallback.

Optional `country` and `action` filters apply to returned neighbors; `limit` is 1–50, default 12. Only valid, listed, unblocked publishers with current embeddings qualify. A missing or ineligible starting publisher returns 404. If vectors are stale or temporarily unavailable, `available=false`, `reason` and an empty result explain the state.

In [Explore](https://agentwebmap.com/explore), click a topic to focus its connections, then choose See websites to open matching publishers. Publisher details include source headings and similar publishers when the Related meanings layer is enabled. Details, topic lists, color layers and filters open on demand over the full-screen viewer. Search or Browse topics provides a keyboard-accessible alternative to navigating the map. Shift-click combines up to five topics; Filters lets you remove topics, choose all/any, or narrow by country and action. Back, All topics and the browser’s Back button support navigation.

<a id="sections"></a>

## Publisher sections and connections

Explore [the section cloud](https://agentwebmap.com/explore) or query the same growing catalogue through REST and MCP. Labels are extracted from indexed publisher headings without a fixed topic list or paid AI classification. Formatting and case are normalized; original headings, hierarchy, source files and lines remain available. Different words are not automatically treated as synonyms.

| Endpoint / tool | Returns |
| --- | --- |
| GET /v1/sections · list_sections | Section keys, labels, unique-site counts, first observation, emerging dates, seven-day changes and coverage |
| GET /v1/sections/history?keys=KEY,KEY | Recorded daily heading additions and removals for up to 12 known keys; eight UTC date buckets, latest day partial, whole-index scope. Missing rows are unknown rather than observed zero. Standard discovery read gates apply. |
| GET /v1/section-graph · explore_sections | Up to 36 section clusters, their strongest 180 connections and a bounded page of matching publishers |

Start with `GET /v1/sections?sort=common&per_page=20`. Substitute returned keys in `GET /v1/section-graph?sections=SECTION_KEY&include_sites=false` or `GET /v1/domains?sections=FIRST_KEY,SECOND_KEY&section_match=all`.

Catalogue options: `q` (word-prefix search), `sort=common|alphabetical|newest|emerging`, `page`, `per_page` (1–100, default 36), and optional `sections` / `section_match` to find co-occurring labels. Graph options: up to five `sections`, `section_match=all|any`, `page`, `per_page` (default 50) and `include_sites=false` for aggregate-only refreshes. Add `connections=semantic` to include `semantic_edges` alongside the original shared-heading `edges`. The default is `connections=shared`. Both also accept `country` and `action`. REST accepts comma-separated keys; MCP accepts an array. Standard pagination limits apply.

Search, list and Browse accept these section filters alongside category and agentic filters. Compact domain results add `section_keys`, `section_partial` and `section_indexed_at`. Full detail adds `section_headings`: original label, key, level, path, source URL, line (null for older link metadata) and parsing format. Heading presence describes published content and does not certify a capability.

Counts include each valid, listed, unblocked domain once per label. Repeated headings do not inflate counts. Graph edges count sites carrying both labels within the selection; `strength` is overlap divided by the square root of the two label counts. Positions are an approximate visual layout, not a ranking or publisher affiliation. Semantic connections compare heading text using stored embeddings. They do not merge heading keys, change publisher memberships or widen your section filters. Nodes with `semantic_related=true` count publishers with that related heading within country/action filters, independently of the current section selection. `semantic.indexed` reports vector coverage among visible nodes; newly observed labels acquire vectors in bounded background passes. Root graphs contain aggregates. Publisher reads share the documented enumeration windows; metadata-only refreshes return no publisher records.

The viewer’s Layers control separates teal Shared headings (observed co-occurrence, solid lines), violet Related meanings (inferred similarity, dashed lines) and amber Emerging patterns (headings meeting the criteria below). Shared headings and Related meanings are enabled initially in the viewer; the API still defaults to shared headings. Amber describes the heading’s emergence evidence; its connection style continues to identify observed or inferred relationships. Heading point sizes reflect website counts with perspective depth; the highlighted center marks the current selection. Solid points are headings; outlined points are sampled publishers. Line weight reflects overlap or similarity. The viewer progressively loads a bounded field of real headings, with sparse labels, hover details, direct point selection and additional labels when zoomed in. Drag to rotate; pause the slow orbit with the motion control. Reduced-motion preferences disable ambient animation. Search and Browse topics expose the wider catalogue. Colors do not score quality, establish causation or imply endorsement.

Root files are parsed independently of sampled links, up to 512 KiB of characters and 512 headings. Size limits, incomplete copies and nested/legacy link-only evidence are marked partial. `coverage` reports indexed and eligible sites, partial sites, pending files and baseline status. A missing label on an incompletely indexed site does not prove the publisher lacks that content.

New files, file edits and indexed metadata changes enter a durable extraction queue. Broken files, blocks and tier changes update memberships automatically. `first_seen` means first observed by this catalogue, not first published. `newest` (Newly seen in the website) shows labels first observed after the baseline within the last 30 days, including single-site and single-brand discoveries.

`emerging` is a conservative index signal: a label must have been observed for at least three days, first observed within 30 days, have positive net seven-day membership growth, and occur across at least ten estimated domain-name families in complete files. Known platform-generated files and duplicate fingerprints are excluded from that evidence. Regional variants with the same registrable name are grouped; this heuristic does not verify independent ownership or detect every shared template. No broad categories are created automatically.

`trend_evidence.publisher_groups` reports the global estimated family count for an emerging result; it is null for other sorts. `trend_policy` explains the criteria. `sites` respects the selected filters; evidence, `total_sites`, dates, `change_7d` and coverage remain global. `change_7d` is net unique-site membership growth after the baseline, not an adoption rate. Ordinary views can lag by about a minute; emerging evidence is cached for up to 15 minutes. Headings do not prove a working integration.

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

<a id="actions"></a>

## Filter by inferred agent action

Choose an action in [Browse](https://agentwebmap.com/browse) or [Explore](https://agentwebmap.com/explore). REST and MCP use the same optional `action` filter on listings, keyword/semantic search, task resolution, section counts and graph edges.

| Value | Action |
| --- | --- |
| `read_docs` | Read documentation |
| `search_content` | Search content |
| `call_api` | Call an API |
| `buy` | Buy products |
| `book` | Book a service |
| `download_data` | Download data |
| `contact_support` | Support / contact |


```sh
curl 'https://agentwebmap.com/v1/domains?action=book&country=FR'
curl 'https://agentwebmap.com/v1/sections?action=download_data'
curl 'https://agentwebmap.com/v1/section-graph?sections=services&action=contact_support'
```


MCP examples: `list_domains({"action":"book","country":"FR"})`, `resolve({"query":"example.com","action":"call_api"})` and `explore_sections({"sections":["services"],"action":"contact_support"})`. Omit the filter for all sites. It combines with other filters using AND. Unknown values return `400 invalid_action`; exact-domain resolution outside the filter returns `404 no_match`.

Actions are inferred from publisher content. They can overlap and do not prove a working integration, authorization or task success. Unclassified sites may be missing useful actions. A missing label does not prove an action is unavailable. These existing classification labels are separate from a publisher-declared `capability=mcp` and do not require a new AI call. The four broad site kinds and topic taxonomy remain unchanged.

<a id="files"></a>

## Read cached files

Read our validated copy of a publisher’s llms.txt without another request to the publisher.

```sh
curl -i 'https://agentwebmap.com/v1/domain/modelcontextprotocol.io/llms.txt'
```

The response is `text/plain`, with `X-Source-URL`, `X-Checked-At`, `X-Content-Hash` and `X-Truncated` headers. A size-limited copy is marked as truncated. The MCP tool `read_llms_txt` returns the content inline with the same metadata. Files not yet cached return cached_file_unavailable; reads never fetch a missing copy. Invalid files return `409`; unavailable copies return an error rather than an invented file.

[Our llms.txt](https://agentwebmap.com/llms.txt) is a concise service guide with discovery, country filters, publisher sections, public collections, private workspaces and owner tools. [Our llms-full.txt](https://agentwebmap.com/llms-full.txt) includes this complete platform/API/MCP reference, generated from the same documentation sections, followed by eligible valid, listed, unblocked sites whose owners have verified their domains. Those entries include file links and summaries. The full searchable directory remains available through the API; unverified publishers are not enumerated in the full file. Private workspace and admin data are excluded.

<a id="project"></a>

## The llms.txt project

The original [llms.txt proposal](https://llmstxt.org/) was first published by Jeremy Howard in September 2024. Its reference site explains the format and links to the public [AnswerDotAI/llms-txt project](https://github.com/AnswerDotAI/llms-txt).

[Our introduction to the project](https://agentwebmap.com/llms-txt-project.md) credits the upstream work and explains how Agent Web Map uses the convention. Agent Web Map is an independent discovery service: we index and validate publisher files, provide source discovery and map shared headings. For format definitions, consult the original proposal.

<a id="statistics"></a>

## Directory statistics

[Statistics](https://agentwebmap.com/stats) and [stats.json](https://agentwebmap.com/stats.json) describe the index, updated hourly: listed sites, llms-full.txt availability, additions by day, categories, inferred country, language and file sizes.

These figures measure this index, not all websites. Additions record when a valid file entered the index, not the publisher’s adoption date. Category counts overlap; country inference may reflect hosting location. Cite the statistics URL and `generated_at` date when reusing figures.

<a id="mcp"></a>

## MCP server

Connect to `https://agentwebmap.com/mcp` using stateless Streamable HTTP. Basic public reads need no key. Live llms.txt checks, generator, website audit and MCP endpoint checks require a free account credential with `tools:run`; deeper enumeration requires registration. MCP clients can sign in through OAuth with PKCE, or send an integration key in the Authorization header. An HTTP 401 challenge advertises OAuth metadata before any protected batch member executes. Owner tools take the domain-scoped `api_key` as an argument. Discovery metadata: [/.well-known/mcp.json](https://agentwebmap.com/.well-known/mcp.json).

### Codex

```sh
codex mcp add agentwebmap --url https://agentwebmap.com/mcp
```

[Official Codex setup](https://developers.openai.com/codex/mcp). If your client requests registered access, sign in through its OAuth flow or configure an integration credential using the client's supported secret storage.

### Claude Code

```sh
claude mcp add --transport http agentwebmap https://agentwebmap.com/mcp
```

[Official Claude Code setup](https://code.claude.com/docs/en/mcp).

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

[Official Cursor setup](https://cursor.com/docs/mcp).

### VS Code / Copilot
Use MCP: Add Server, choose HTTP, and enter the endpoint. Current Copilot setups use the portable configuration below in a supported workspace-root `.mcp.json` or personal MCP configuration. Older editor-managed setups use `.vscode/mcp.json` with a top-level `servers` object instead. Follow the [official configuration guide](https://code.visualstudio.com/docs/agents/reference/mcp-configuration) for your installed client.

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

### Available tools (25)

| Tool | Purpose |
| --- | --- |
| `similar_sites` | Find related listed publishers by vector similarity to a known domain |
| `list_sections` | Discover publisher section labels across the indexed corpus, distinct-site counts, newly observed labels, conservative emerging signals and seven-day membership changes |
| `explore_sections` | Explore relationships between publisher headings |
| `resolve` | Start here to find documentation for a domain or development task |
| `directory_stats` | Directory-wide counts for Agent Web Map: domains tracked, valid llms.txt files, listed, verified, pending. |
| `list_countries` | List country codes and names with valid listed-site counts, plus the unknown count |
| `list_categories` | List topic taxonomy and counts by inferred category and agentic label, unclassified sites and publisher-declared MCP endpoints |
| `search_index_preview` | Fast, non-exhaustive stored keyword preview |
| `search_llms_registry` | Search stored domains and documentation links by words and indexed evidence |
| `list_domains` | Ranked listing of the directory (verified first, then authority) |
| `lookup_domain` | Look up a domain: source URLs, summary, authority, ownership verification, inferred country, last check and owner-stated terms |
| `read_llms_txt` | Return our validated copy of a listed site's llms.txt as text, with its source URL, check date and content hash |
| `verification_instructions` | Describe optional ownership management and its four proof methods |
| `check_llms_txt` | Requires tools:run via a registered integration or OAuth |
| `generate_llms_txt` | Draft an llms.txt from a bounded crawl of a publisher’s public pages, sitemaps and documentation links |
| `validate_llms_txt` | Check a pasted llms.txt draft in memory |
| `audit_website` | Requires tools:run via a free integration key or OAuth |
| `check_mcp_endpoint` | Requires tools:run via a free account integration key or OAuth |
| `register_domain` | Submit a public domain or announce a file update to queue a live crawl, including previously invalid tracked domains |
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

- See your website in the map: Review your indexed topics, nearby publishers sharing headings, measured listing exposure and map snapshots in a private report for your website.
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
curl -X POST 'https://agentwebmap.com/v1/sites' -H 'Authorization: Bearer <integration_key>' -H 'content-type: application/json' -d '{"domain":"example.com"}'
```

Returns `202` when queued, including a fresh crawl of an existing domain; `200` if no new crawl is queued. Existing valid listings stay visible until a crawl supplies a new result. Requests are coalesced per domain with a ten-minute cooldown; `reason` explains the result and `retry_after` is supplied during cooldown. Submission requires a free email-confirmed account or an integration credential with tools:run scope. This does not prove ownership or guarantee listing.

Run the same request after a successful deployment to announce a newly published or updated file. Use it in a CI step or post-deploy command, replacing the domain. Keep the integration key in a CI secret or environment variable, never in source control. A dependency-free [Node.js 20+ deployment helper](https://agentwebmap.com/assets/notify-deployment.mjs) checks the live file before submitting: download and review it, set `AWM_API_KEY` to an integration key with `tools:run`, then run `node notify-deployment.mjs example.com`. The key is sent only to Agent Web Map, never to the publisher. [Publish from the browser](https://agentwebmap.com/submit) for platform instructions. The [generator](https://agentwebmap.com/generate) leads through review, publishing, live validation, submission and optional verification.

The crawler recognizes publisher-advertised `Link: </docs/llms.txt>; rel="llms-txt"` and `X-Llms-Txt` headers, `/.well-known/llms.txt`, and linked nested indexes under `/_llms/` (including documentation base paths). Recursive collection is limited to eight additional files, three levels and 1 MiB in total, on the same publisher. A source index is reference metadata, not an executable instruction. Root file validation and listing rules still apply.

<a id="verify"></a>

## Verify domain ownership

For a new proof, sign in to a free account or use an integration credential with `tools:run`. An integration key identifies your application; the returned owner key is separate and controls only the proven domain. Start a fresh claim. This also creates the domain record if needed, so an existing publisher can verify in two API calls with a proof publication between them.

```sh
curl -X POST 'https://agentwebmap.com/v1/sites/example.com/claims' -H 'Authorization: Bearer <integration_key>'
```

Keep `claim_id` and `claim_secret` private. Publish the returned `verification.token` using one of its snippets: llms.txt, DNS TXT, a homepage meta tag or a well-known file. Then complete the claim:

```sh
curl -X POST 'https://agentwebmap.com/v1/sites/example.com/verify' -H 'Authorization: Bearer <integration_key>' \
  -H 'content-type: application/json' -d '{"claim_id":"...","claim_secret":"..."}'
```

MCP uses `begin_ownership_claim`, then `verify_domain`. The claim expires after 30 minutes and succeeds only once. Success returns a domain-scoped API key, shown once. A failed proof returns `422`; fix it and retry before expiry. Public proofs alone cannot issue keys. Keep the successful proof published: checks recur and verification lapses after 14 days of continuous failure.

`GET /v1/sites/{domain}/verification` describes methods without private credentials. Recover a lost owner key with a fresh claim and proof. Authenticated `POST /v1/sites/{domain}/key` or `rotate_owner_key` replaces a key and invalidates old keys, browser sessions and pending claims.

<a id="manage"></a>

## Manage a verified listing

Use `Authorization: Bearer <api_key>` for REST owner endpoints.

| Endpoint | Action |
| --- | --- |
| `PATCH /v1/sites/{domain}` | Edit description, agent_summary, tags, nested_llms_txt, contact, publisher_country and agent_terms; null clears a field |
| `GET /v1/sites/{domain}/stats` | Measured usage by surface, daily activity, file health, score history and badge |
| `POST /v1/sites/{domain}/recrawl` | Revalidate now; once per 10 minutes |
| `POST /v1/sites/{domain}/key` | Rotate the owner key; replacement shown once |


```sh
curl -X PATCH 'https://agentwebmap.com/v1/sites/example.com' \
  -H 'authorization: Bearer awm_key_...' -H 'content-type: application/json' \
  -d '{"description":"Publisher documentation","tags":["docs"],"nested_llms_txt":["/docs/llms.txt"]}'
```

Agent summary: verified owners can set `agent_summary` to a single plain-text line of up to 300 characters in the dashboard, owner PATCH endpoint or MCP `update_site`. Public responses include `agent_summary_source: "verified_owner"` or `"ai"` (null when absent). Owner text takes precedence while that ownership remains current and survives recrawls and AI updates. Pass null, or use Restore generated summary, to remove it without a paid regeneration. A fresh ownership claim invalidates the old owner's override; ordinary key rotation preserves it. The generated version is kept separately. The source-derived `summary` continues to come from the publisher's llms.txt.

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
| `GET /v1/check/{domain}` | Registered live validation without paid AI; MCP: check_llms_txt |
| `GET /v1/generate/{domain}` | Draft from homepage, sitemap and page titles; MCP: generate_llms_txt |

The browser [checker](https://agentwebmap.com/check) and [generator](https://agentwebmap.com/generate) use the same operations. Required delivery and format checks determine validity; summaries, sections and optional full files are recommendations. Generation skips failed sampled pages and links to llms-full.txt only when an actual public file was observed. The editor checks, copies and downloads your current text. Review the draft before publishing; neither tool submits your site automatically.

<a id="website-tools"></a>

## Website audits, draft validation and MCP diagnostics

[All free tools](https://agentwebmap.com/tools) have public information pages. Live scraping runs require a free account, integration credential or MCP OAuth; pasted-text validation needs no sign-in. The same checks are available to agents:

| Endpoint | MCP tool | Purpose |
| --- | --- | --- |
| `POST /v1/validate` | `validate_llms_txt` | Analyze pasted Markdown without fetching its links or storing the text; maximum 512 KiB |
| `GET /v1/audit/{domain}` | `audit_website` | Bounded snapshot of homepage response, llms.txt, robots rules and public interface hints |
| `POST /v1/mcp-check` | `check_mcp_endpoint` | Read public MCP protocol metadata and up to 100 tools from the first inventory page |


```sh
curl 'https://agentwebmap.com/v1/validate' -H 'content-type: application/json' -d '{"text":"# My website"}'
curl 'https://agentwebmap.com/v1/audit/example.com'
curl 'https://agentwebmap.com/v1/mcp-check' -H 'content-type: application/json' -d '{"endpoint":"https://agentwebmap.com/mcp"}'
```


The [website audit](https://agentwebmap.com/audit) separates search and training crawler rules, general indexing directives, MCP-related links and static WebMCP hints. It does not render JavaScript, confirm search indexing, query AI answers or prove that service actions work. No combined visibility score is invented.

Live website checks, generation, audits and endpoint diagnostics share enforced caller, destination and service-wide work limits across the browser, REST and MCP. A limit returns `429` with `retry_after_seconds` and an HTTP `Retry-After` header; wait before retrying. Excluded destinations return `403 outbound_target_blocked`. Redirects to another publisher and custom ports are refused. Cached directory reads remain available when live checks are limited.

The [MCP checker](https://agentwebmap.com/mcp-check) attempts a current stateless tool-list request, then supported legacy initialization when necessary. Agent Web Map’s own MCP server continues to negotiate its published 2025/2024 protocol versions. A successful inventory response does not by itself prove a negotiated version. Authentication and redirects are reported separately. No discovered tools are called, no redirects are followed, and no credentials or schema-reference requests are forwarded. Use a public HTTPS endpoint without query parameters, credentials or a custom port. These diagnostics are not a security certification. MCP endpoint checks require registered access and tools:run scope. Registered tool throttles and endpoint-specific probe limits both apply; inspect Retry-After rather than assuming a fixed combined allowance. Public discovery remains available within its own allowance.

On public website pages, [WebMCP](https://agentwebmap.com/webmcp) registers four read-only browser tools when the browser exposes a supported API: `awm_resolve`, `awm_search`, `awm_lookup` and `awm_sections`. Private pages do not register tools; public reads omit account cookies. Browser availability is experimental and client-controlled. WebMCP registration does not automatically install our remote MCP server or establish persistent adoption.

<a id="badge"></a>

## Directory badge

`GET /badge/{domain}.svg` returns a current status badge. Owners can embed it with a link to their listing; a backlink is optional.

```html
<a href="https://agentwebmap.com/domain/example.com"><img src="https://agentwebmap.com/badge/example.com.svg" alt="Agent Web Map listing"></a>
```


<a id="negotiation"></a>

## Machine-readable pages

Domain pages support `Accept: application/json` and `Accept: text/markdown`. Browse supports JSON. These docs support `Accept: text/markdown`, or use [docs.md](https://agentwebmap.com/docs.md) directly. [OpenAPI](https://agentwebmap.com/openapi.json) describes REST request and response schemas; [GET /v1](https://agentwebmap.com/v1) lists discovery links and endpoints.

<a id="accounts"></a>

## Free accounts and integrations

Create an [email-confirmed account](https://agentwebmap.com/workspace/signup) without a credit card or website verification. Sign in with a single-use email code, then open [your dashboard](https://agentwebmap.com/workspace). Existing workspace accounts use the same sign-in.

Your account includes private saved reports, favorites, collections and named integrations. Run and save reports from the dashboard; up to 100 reports are retained for 90 days. Generated drafts download as Markdown; diagnostics download as JSON. Reports use public observations and do not certify security or guarantee AI citations.

Generator runs, website audits and MCP endpoint diagnostics require registration across website, REST and MCP. Pasted-text validation stays anonymous. Stored search and machine-readable publisher lookups share the free daily discovery allowance; individual public HTML publisher pages remain available. Live llms.txt checks require registration. Registered generator allowance is 5 runs per 10 minutes per account; audits and MCP checks each allow 20 per 10 minutes. All of an account's keys share those limits, alongside existing destination, network and service work limits. These are free allowances, not a paid plan. Duplicate live targets share bounded jobs. Dated checker and MCP results may be reused for sixty seconds, audits for two minutes and generated files for ten minutes. Domain-control proof and owner recrawl use their independent fresh checks.

In Integrations & keys, create an app with a name and intended use, and up to five active credentials. Choose discovery:read for directory reads and tools:run for registered tools. Choose a 30, 90, 180 or 365-day expiry. Copy the secret once and keep it in your secret manager; only its hash and a masked hint are stored. Rotate immediately or allow a 24-hour overlap while updating your client. Revocation stops access immediately. Signing out of the browser leaves explicitly connected apps active.

Send API keys in Authorization: Bearer or X-AgentWebMap-Key headers, never in URLs. MCP OAuth uses public-client authorization code with S256 PKCE, exact callback/resource binding, explicit consent with your intended use, one-hour access tokens and rotating refresh tokens for a connection lasting up to 90 days. Revoke an OAuth connection from the same dashboard. Browser cookies do not authenticate MCP calls. Resource metadata: [/.well-known/oauth-protected-resource/mcp](https://agentwebmap.com/.well-known/oauth-protected-resource/mcp); authorization server metadata: [/.well-known/oauth-authorization-server](https://agentwebmap.com/.well-known/oauth-authorization-server). Public HTTPS client metadata documents and dynamic client registration are supported.

Usage is attributed to integrations and credentials, with request counts, returned records, payload bytes, response times, operations and recent errors. X-AgentWebMap-Request-Id and MCP result metadata expose support references. It normally appears within 15 seconds. Email confirmation identifies an account, not a person, organization or website owner. It does not grant bulk, unlisted, publisher-owner or administrator permissions. The private operator directory can pause integrations and revoke credentials.

<a id="limits"></a>

## Access, limits and errors

Public discovery starts with 100 distinct publishers per UTC day per network, shared across website discovery, REST and MCP. A free email-confirmed account with a named application and declared purpose receives 5,000 distinct publishers per UTC day, shared across browser sessions and all its integration keys or OAuth connections. Repeated reads of an already exposed publisher do not consume another publisher. Rotating keys does not reset usage. Anonymous result windows cover 250 results per query across website, REST and MCP; free registered accounts and integration keys cover 1,000. Further enumeration needs separately approved bulk permission. Search and machine-readable exact-domain lookup use the same daily publisher allowance and stored data only. Individual public HTML publisher pages, aggregate statistics, setup instructions and pasted-text validation remain available. Live website checks, scraping tools, submissions and ownership-check actions require a registered account or authorized integration. Registration never enables paid AI calls. Distinct-publisher discovery allowances are enforced before data is returned. Anonymous exhaustion returns 401 registration_required; incomplete account setup returns 403 integration_setup_required; account exhaustion returns 429 discovery_allowance_exceeded with a UTC reset and retry hint. A response larger than the remaining allowance is rejected as a whole: request fewer results. Usage starts when this policy is deployed, without replaying historical traffic. Other request/data counters remain review observations. An operator can explicitly block a particular source network or client. A manual block returns `403 access_blocked`.

We record source network addresses, self-reported agent names, operations and returned-record counts for service operations and abuse review. Detailed source activity is retained for 7 days and daily usage for 30 days. Current admission state is retained for the current and two preceding UTC dates and pruned in bounded batches. Signed-in request activity includes the account reference for private operator review. Account integration aggregates and request-ID error details are retained for 30 days; dashboard charts show 7 days. IPv6 sources share a /64 identity. Credentials and query text are excluded. These observations describe requests and networks, not verified people.

A self-service integration key identifies an application under your confirmed account. Send `Authorization: Bearer awm_client_…` or `X-AgentWebMap-Key: awm_client_…` on API and MCP requests. Owner keys manage one listing and are separate. Invalid or revoked client keys return `401`; omit the key for public discovery.

Create a free account and name your application and describe its intended use in [Integrations & keys](https://agentwebmap.com/workspace/integrations). You can start basic discovery anonymously and connect later; website ownership verification is only needed to manage a listing. Keep keys in client headers, outside public URLs and prompts.


```sh
# Public lookup: no registration or key
curl 'https://agentwebmap.com/v1/domain/agentwebmap.com'
# Optional integration label; self-reported, without credentials
curl 'https://agentwebmap.com/v1/domain/agentwebmap.com' -H 'X-AgentWebMap-Client: MyApp/1.0'
# Self-service integration key, stored in your environment
curl 'https://agentwebmap.com/v1/domain/agentwebmap.com' -H "Authorization: Bearer $AWM_CLIENT_KEY"
```


Integrations may optionally send `X-AgentWebMap-Client: MyApp/1.0` without an account or key. MCP initialization client names are also recorded when supplied. These names are self-reported and do not grant trust or access. Browser interaction measurement records controlled actions and coarse arrival-source buckets using anonymous sessions that expire after 30 minutes of inactivity; Do Not Track and Global Privacy Control disable it. Interaction detail is retained for 30 days. Raw searches, prompts, full referrer URLs and private collection names are not retained. Demand topics are matched to existing indexed headings or selected categories. Audience, attribution and demand reporting is private to the operator; verified owners can see a separate report limited to their own website.

Responses expose `X-AgentWebMap-Access`, `X-AgentWebMap-Publisher-Limit`, `X-AgentWebMap-Publisher-Remaining` and `X-AgentWebMap-Publisher-Reset` and `Cache-Control: private, no-store`. REST and MCP pages contain at most 100 records; website browse defaults to 20 and offers 20, 50, 100, 250 or 500 within the remaining daily allowance and result window. MCP accepts at most 10 messages per batch, and oversized requests are rejected before execution. Unlisted enumeration still requires explicit permission, and bulk export remains disabled unless separately enabled for an approved client. Automated collection to reproduce or redistribute the directory requires prior written approval. Publisher content remains subject to its publisher’s terms.

Ownership checks, registration and sign-in retain their workflow safeguards. Live source probes are coalesced for a minute per domain; cached directory discovery remains available. Errors are JSON with an `error` code and usually a `hint`. Common statuses: `400` invalid input, `401` missing/bad credentials, `403` manual block or private-data permission required, `404` missing listing or no match, `409` unavailable valid file or changed ownership, `413` oversized request or MCP batch, `422` proof not found, `429` account discovery allowance or protected workflow throttle, `502` publisher fetch failure. Respect owner terms and the source site’s access rules.

### Handle limits and temporary failures

Daily publisher allowances and result windows are separate constraints. Request small result sets, reuse cached responses, and follow the returned remaining/reset headers. A free account does not provide unlimited bulk access.

A `401 registration_required` asks you to register or connect a credential; `403 insufficient_scope` requires the right permission, and `403 access_blocked` is a manual access decision. Do not retry those errors repeatedly or evade a block. `429` can mean a quota or workflow throttle. Use its error code, reset information and `Retry-After`.

A `503 temporarily_busy` is a temporary capacity failure, not a successful empty search or proof that the daily allowance is spent. Honor `Retry-After`, use bounded exponential backoff with jitter, and avoid parallel retry storms. Other unavailable/stale-data codes retain their documented meaning; never treat them as a confirmed absence of publisher information.
