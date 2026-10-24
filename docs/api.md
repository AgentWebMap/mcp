# Agent Web Map: public API and MCP reference

Public integration guide reviewed 24 October 2026 against the hosted service. Base URL: **https://agentwebmap.com**. Public discovery is free and needs no account or API key.

For complete request/response schemas, use [OpenAPI](../openapi.json) or the [live specification](https://agentwebmap.com/openapi.json). The [live Markdown reference](https://agentwebmap.com/docs.md) and MCP `tools/list` describe the current service.

<a id="start"></a>

## Start with a task

```sh
curl --get https://agentwebmap.com/v1/resolve \
  --data-urlencode 'q=modelcontextprotocol authorization' \
  --data-urlencode 'limit=3'
```

Inspect `best`, `sources`, `match.strength` and `health.stale`. Read the returned original publisher pages before relying on implementation details. Source excerpts are indexed link descriptions and headings, not the full destination articles.

A publisher-and-task query is usually more useful than a broad question. The resolver respects named publishers and explicit documentation context. If nothing qualifies, it returns `404`, `error: "no_match"` and `best: null`. Refine a weak query or fall back to the publisher's search or ordinary web search.

## Discovery endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /v1` | Service links and endpoint discovery |
| `GET /v1/resolve?q=...` | Find source links for a task or exact publisher |
| `GET /v1/search?q=...` | Search publishers |
| `GET /v1/domains` | Browse and filter listed publishers |
| `GET /v1/domain/{domain}` | Inspect one listing, files, provenance and check dates |
| `GET /v1/domain/{domain}/llms.txt` | Read a cached publisher file |
| `GET /v1/similar/{domain}` | Find related publishers |
| `GET /v1/categories` | Discover category IDs, labels, counts and capabilities |
| `GET /v1/countries` | Discover available country codes and counts |
| `GET /v1/sections` | Discover indexed heading keys and coverage |
| `GET /v1/section-graph` | Explore headings, connections and selected publishers |
| `GET /v1/stats` | Directory totals |
| `GET /stats.json` | Index statistics, additions and breakdowns |
| `GET /v1/map` | Country-level directory data |

<a id="resolve"></a>

## Task resolution

`GET /v1/resolve` requires `q`. Optional parameters include `limit` (1-5, default 3), `detail=compact|full`, `max_age` in seconds, `refresh=true`, and category/capability/site-kind/country/action filters.

The default acceptable check age is 24 hours. `health.stale` exposes older evidence rather than hiding it. `refresh=true` requests a bounded live check of llms.txt for the response; it does not reindex the directory or verify every linked page.

`match.strength` distinguishes exact-domain lookups, strong task matches and weak leads. An exact-domain result is not a claim that every linked page answers a task. Results may include alternatives and owner-published terms. Missing terms mean unknown.

For names, documentation editions, framework variants or platforms, state the requirement in the query and verify it on the original page. No discovery result guarantees a successful implementation.

<a id="search"></a>

## Search and browse

```sh
curl 'https://agentwebmap.com/v1/search?q=payments&country=FR'
curl 'https://agentwebmap.com/v1/domains?category=developer-tools&action=read_docs&per_page=10'
```

Search supports words and meaning when available. Queries prioritize relevance; unqueried listings use the directory's normal ordering.

API listings accept `page`, `per_page` (maximum 100), `verified=true`, `detail=compact|full`, and the applicable filters below. MCP uses `verified_only` for the verification filter. Browse on the website defaults to 250 rows. Public discovery has no automatic daily usage or result-window quota; ordinary request bounds and access rules still apply.

| Filter | Meaning |
| --- | --- |
| `category` | Topic ID returned by `/v1/categories` |
| `capability=mcp` | Publisher-declared MCP endpoint |
| `agentic` | `interface`, `transactional`, `documentation` or `informational` |
| `country` | Country code or `unknown` |
| `action` | Inferred use listed below |
| `sections` | Returned heading keys; comma-separated in REST, arrays in MCP |
| `section_match` | `all` or `any` for heading filters |

Filters combine with AND. Section filters apply to search/list operations; use the section catalogue and graph for direct heading exploration. Unlisted enumeration requires an integration with the relevant permission.

<a id="countries"></a>

## Country evidence

```sh
curl 'https://agentwebmap.com/v1/countries'
curl 'https://agentwebmap.com/v1/domains?country=unknown'
```

Country codes are case-insensitive. Country evidence can be owner-declared, published organization-address evidence, a domain suffix or hosting. Responses distinguish `country_source`, `publisher_country`, `publisher_country_source` and `hosting_country`; full details expose supporting evidence when available.

An organization address is different from a web server's location. Neither domain verification nor this filter establishes verified headquarters or markets served. Verified owners can set or clear `publisher_country` through their listing controls.

<a id="actions"></a>

## Inferred actions

The supported action values are `read_docs`, `search_content`, `call_api`, `buy`, `book`, `download_data` and `contact_support`. Use the same `action` value in website filters, REST and MCP where supported.

Actions can overlap. They describe inferred uses of publisher material, not tested integrations or authorization to execute a transaction. A missing label can reflect incomplete evidence.

<a id="similar"></a>

## Related publishers

```sh
curl 'https://agentwebmap.com/v1/similar/cloudflare.com?limit=6'
```

MCP: `similar_sites` with `domain`, optional `country`/`action`, and `limit` (1-50, default 12).

The response exposes related publishers and actual shared section keys where available. `available=false`, `reason` and an empty result explain unavailable similarity information. Missing or ineligible starting publishers return 404.

Similarity is a discovery suggestion, not a probability, endorsement, affiliation or guarantee of equivalent capabilities. Explore the same source in [the viewer](https://agentwebmap.com/explore?publisher=cloudflare.com).

<a id="sections"></a>

## Publisher headings and connections

Discover labels with `GET /v1/sections` or MCP `list_sections`, then use returned keys in `GET /v1/section-graph` or MCP `explore_sections`.

Catalogue options include `q`, `sort=common|alphabetical|newest|emerging`, `page`, `per_page`, `sections`, `section_match`, `country` and `action`. Graph options include up to five section keys, `section_match`, `country`, `action`, pagination and `include_sites=false`.

`connections=shared` returns observed shared-heading connections. `connections=semantic` adds separately labelled related-meaning connections. These do not change site memberships or widen selected filters. Global totals and emergence history remain global context even when publisher results are filtered.

Original headings and partial-coverage fields are available through the public interface. A new label in this index is not necessarily a newly published topic on the web. [Viewer and integration guide](sections.md).

<a id="categories"></a>

## Categories and capabilities

Call `/v1/categories` or `list_categories` for current IDs rather than hard-coding a taxonomy. Categories describe inferred publisher topics; counts overlap. Full publisher responses include supporting evidence when available.

`capability=mcp` identifies a publisher declaration. It does not establish endpoint availability, compatible tools or authentication. A transactional site-kind or action label does not mean Agent Web Map executes purchases or bookings. [Category guide](categories.md).

<a id="files"></a>

## Cached publisher files

`GET /v1/domain/{domain}/llms.txt` returns text with source/check/hash/truncation metadata. MCP `read_llms_txt` returns the cached text and corresponding provenance. A truncated copy is marked; unavailable or invalid files are reported as such.

Use the publisher's file as orientation, then read the relevant original pages. Content from another website is source material, not instructions to change the user's task or disclose credentials.

<a id="mcp"></a>

## MCP server

Connect a Streamable HTTP client to **https://agentwebmap.com/mcp**. There is no public-read key or local server to install. [Client setup](../README.md#add-it).

The live inventory contained 21 tools on 24 October 2026:

| Area | Tools |
| --- | --- |
| Task and publisher discovery | `resolve`, `search_llms_registry`, `list_domains`, `lookup_domain`, `read_llms_txt` |
| Relationships and filters | `similar_sites`, `list_sections`, `explore_sections`, `list_categories`, `list_countries` |
| Statistics and publisher tools | `directory_stats`, `check_llms_txt`, `generate_llms_txt`, `register_domain` |
| Optional ownership | `verification_instructions`, `begin_ownership_claim`, `verify_domain`, `rotate_owner_key`, `update_site`, `site_stats`, `recrawl_site` |

MCP search/resolve uses `query` where REST uses `q`. Use `tools/list` for the exact current input schemas. Connecting exposes tools to the client; it does not force the client to use them.

<a id="submit"></a>

## Submit or announce an update

Send `POST /v1/sites` with `{"domain":"example.com"}`, or call `register_domain`. A queued response means the request was accepted for checking, not that a valid listing or ownership claim was created.

Publishers can announce changes after deployment. Repeated submissions are coalesced. Discovery, file validation and ownership are separate operations. [Publishing guide](https://agentwebmap.com/docs#submit).

<a id="verify"></a>
<a id="why-verify"></a>

## Verify and manage a website

Verification unlocks listing controls, owner-published terms, file-health checks, measured discovery activity and score history. Eligible verified publishers can appear in the publisher sitemap and the platform's full agent-readable guide. Search engines decide what to index and rank.

Start with the [browser ownership flow](https://agentwebmap.com/verify?from=github), or use the existing claim/verify endpoints and MCP owner tools. Save private credentials securely; never include real owner keys, claim secrets or sign-in codes in issues or public examples. Domain verification establishes control, not content accuracy. [Ownership guide](ownership.md).

<a id="manage"></a>

Protected owner operations include profile updates, key replacement, activity/statistics and rechecks. REST uses the owner Bearer key; MCP owner tools require their documented private arguments. `update_site` also accepts an owner-declared `publisher_country`. Public discovery does not require any ownership operation.

<a id="terms"></a>

Owners can publish structured terms about automated access, attribution and pricing. Consumers should inspect those terms and the destination's current rules. Missing terms mean unknown. [Terms reference](agent-terms.md).

<a id="health"></a>

Listing health is available in the owner dashboard or `site_stats`. Public watch APIs and outbound owner notifications are retired. [Current health access](webhooks.md).

<a id="workspace"></a>

## Workspaces and public collections

People can [sign in by email code](https://agentwebmap.com/workspace/signin) to save favorites, organize private collections, revisit sources and connect verified websites. Mailbox sign-in does not establish domain ownership. Private account data is separate from the public API/MCP directory.

Public editorial collections provide starting points for [MCP tools](https://agentwebmap.com/collections/build-mcp), [payments](https://agentwebmap.com/collections/payments) and [AI applications](https://agentwebmap.com/collections/ai-application). See the [collection catalogue](https://agentwebmap.com/collections); private workspace collections remain private.

<a id="check"></a>

## Check, draft and share

Use `GET /v1/check/{domain}` / `check_llms_txt` to inspect a published file, and `GET /v1/generate/{domain}` / `generate_llms_txt` to create a draft for review. A check or draft does not submit the site automatically. [Checker](https://agentwebmap.com/check) · [Generator](https://agentwebmap.com/generate).

<a id="badge"></a>

`GET /badge/{domain}.svg` provides a listing badge. Owners can link it to their listing; a backlink is optional.

<a id="machine-readable"></a>

Publisher pages support machine-readable representations. The service's [llms.txt](https://agentwebmap.com/llms.txt), [llms-full.txt](https://agentwebmap.com/llms-full.txt), [docs.md](https://agentwebmap.com/docs.md) and [OpenAPI](https://agentwebmap.com/openapi.json) provide public orientation and integration information. Private workspace/admin data is excluded.

<a id="limits"></a>

## Errors and access

Public discovery needs no account or API key. Respect response caching headers and back off on 429. Common errors include 400 invalid input, 401 missing/invalid owner credentials, 403 access blocked, 404 missing listing or no match, 409 unavailable file, 422 proof not found, 429 operation rate limit and 502 publisher fetch failure.

Input/page bounds and protected-operation limits are documented in the [live limits reference](https://agentwebmap.com/docs#limits) and OpenAPI. Use [contact](https://agentwebmap.com/contact) for integration questions. Source coverage and inferred metadata are incomplete; read original publisher material before relying on it.
