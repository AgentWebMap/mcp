# Agent Web Map API

Base URL: `https://agentwebmap.com`. Public reads need no key. Errors are JSON with an `error` code and usually a `hint`. Cache responses according to their `Cache-Control` headers. The [live OpenAPI specification](https://agentwebmap.com/openapi.json) describes the currently deployed version; [`/v1`](https://agentwebmap.com/v1) lists the endpoints.

## Start with resolve

`GET /v1/resolve?q=<domain or task>`

Use a domain such as `modelcontextprotocol.io`, or a development task such as `modelcontextprotocol authorization`. A domain may include a scheme or path; subdomain lookup can fall back to the registrable domain. Task search includes titles, descriptions and section headings of links published in the indexed llms.txt, in addition to domain metadata. It does not search the full body of every linked page.

Use a specific publisher and task. Include the exact domain in ambiguous queries, such as `modelcontextprotocol.io authorization`. Try the [browser search](https://agentwebmap.com/discover), [dependency-aware CLI](discovery-cli.md), [coverage](https://agentwebmap.com/coverage) and [measured results](https://agentwebmap.com/benchmarks).

| Parameter | Default | Meaning |
|---|---|---|
| `q` | required | Domain, vendor and task, or topic |
| `category` | none | Optional category ID from `/v1/categories`; restricts the candidate domains |
| `capability` | none | `mcp` restricts discovery to publisher-declared MCP endpoint links; availability is unverified |
| `detail` | `compact` | `compact` for consumers, `full` for expanded directory and owner information |
| `limit` | `3` | Number of documentation sources, from 1 to 5 |
| `max_age` | `86400` | Acceptable check age in seconds, from 0 to 2592000; older results are marked stale |
| `refresh` | `false` | `true` performs a live llms.txt check using the validation tool |

```bash
curl --get --fail-with-body https://agentwebmap.com/v1/resolve \
  --data-urlencode "q=modelcontextprotocol authorization" \
  --data-urlencode "limit=3" \
  --data-urlencode "max_age=3600"
```

The MCP equivalent is `resolve` with `{"query":"modelcontextprotocol authorization","limit":3,"max_age":3600}`. REST uses `q`; MCP uses `query`.

A successful response contains:

| Field | Meaning |
|---|---|
| `query`, `mode` | Input query and domain/topic routing |
| `best` | Best matching domain, with metadata and match reasons |
| `sources` | Relevant documentation links, bounded by `limit` |
| `sources[].url`, `title` | Original documentation URL and published title |
| `sources[].excerpt` | Matching publisher-provided description or section context from llms.txt, not a fetched quotation from the linked page |
| `sources[].source_url` | The llms.txt from which the entry was indexed |
| `sources[].match_score` | Relative match strength, not a probability or proof of correctness |
| `sources[].checked_at`, `content_hash` | Check time and fingerprint of the indexed source; these do not certify every linked page |
| `read` | llms.txt, llms-full.txt and any nested llms.txt URLs |
| `terms` | Owner-published agent terms, or `null` when unknown |
| `health` | Source status, last check time, `stale` against `max_age`, and `live_checked` identifying a live check |
| `alternatives` | Other matching domains |

Read the returned documentation URL before relying on its current instructions. Authority and verification indicate directory signals and domain control; search relevance comes first. `match.strength=weak` means publisher or task evidence is insufficient. Inspect `match.reason`: a weak result may be an indexed publisher without the task page, or a third-party fallback with source URLs. Weak matches may return `200` without useful sources: refine the query or fall back rather than treating `best` as definitive.

An unknown domain returns `404` with suggested check/register endpoints; a topic without a match returns `404` with `error: "no_match"`, `best: null` and a search suggestion. Discovery alone is not a reason to register a site.

`max_age` marks freshness; it does not force a recrawl or hide old results. `refresh=true` checks llms.txt live and returns the live health and link metadata for this response, without updating the stored index or reading the full text of documentation pages. Refresh is bounded to 20 requests per ten minutes per client and one probe per minute per domain. Inspect `health.ok`, `health.stale` and `health.live_checked` when current evidence matters. Individual source metadata retains its own timestamps; a fresh llms.txt check does not certify destination page health.

## Reading the directory

| Endpoint | Returns |
|---|---|
| `GET /v1/stats` | Directory-wide counts |
| `GET /v1/domains?page=&per_page=&verified=&include_unlisted=&category=&capability=` | Browsable listing ordered by directory signals; verified owners first; optional category/capability filters |
| `GET /v1/search?q=…&page=&per_page=&detail=&category=&capability=` | Search ranked by relevance before authority and verification; default 10 results per page, maximum 100; optional category/capability filters |
| `GET /v1/categories` | Taxonomy version, category IDs/descriptions/counts, uncategorized count and publisher-declared capabilities |
| `GET /v1/domain/{domain}?detail=compact` | Domain metadata without owner claim instructions |
| `GET /v1/domain/{domain}?detail=full` | Expanded domain details, including verification instructions for an unverified owner |
| `GET /v1/map` | Sites with a valid llms.txt per country |
| `GET /badge/{domain}.svg` | Status badge |

Compact domain metadata includes `domain`, `status`, `tier`, `authority`, `verified`, `categories`, `capabilities`, llms URLs, `title`, `summary`, `agent_terms` and `last_checked`. Expanded details include descriptions, tags, nested URLs, enrichment signals, badge and owner information. `detail=full` includes the optional `claim` block for unverified domains, `category_evidence`, `category_version`, `categorized_at` and `capability_evidence`. See the OpenAPI schemas for exact fields.

Category labels come from versioned rules over publisher metadata and can be empty when evidence is insufficient. Use MCP `list_categories` or the REST taxonomy before choosing a `category` filter. `capability=mcp` requires an explicit qualifying endpoint link and is a publisher declaration, not verified availability. See [categories.md](categories.md) for confidence/evidence semantics and endpoint validation limits.

Filters combine with AND and also apply to domain-only resolve. A known domain that fails a selected filter produces `404 no_match`; invalid or empty category/capability IDs produce `400`. Taxonomy counts cover unblocked listed/featured domains and overlap for multi-label sites.

Domain pages at `/domain/{domain}` also support `Accept: application/json` and `Accept: text/markdown`.

## Validation and generation

| Endpoint | Returns |
|---|---|
| `GET /v1/check/{domain}` | Live llms.txt validation, diagnostics and preview |
| `GET /v1/generate/{domain}` | Draft llms.txt from the site's homepage, sitemap and page titles (may take 10–30 seconds) |

## Watching a domain

| Endpoint | Auth | Effect |
|---|---|---|
| `POST /v1/watch` `{"domain","webhook_url"}` | none | Subscribe; returns `watch_id` and a secret shown once |
| `POST /v1/watch/{id}/test` | `Authorization: Bearer <secret>` | Send a test event |
| `DELETE /v1/watch/{id}` | `Authorization: Bearer <secret>` | Unsubscribe |

See [webhooks.md](webhooks.md) for events and signatures. Limits: 20 new watches per hour per client, 5 active per domain per client; ten consecutive failed deliveries disable a watch.

## Listing and optional ownership management

Automatic listing and public API/MCP access do not require ownership confirmation. To manage a listing in the browser, open [`/manage`](https://agentwebmap.com/manage), enter your domain and follow the ownership check. The dashboard supports profile and agent-term edits, breakage alerts, request statistics and owner-key rotation. Email alerts are available only when the deployment has email delivery configured; webhooks are supported separately. No account or backlink is required.

| Endpoint | Auth | Effect |
|---|---|---|
| `POST /v1/sites` `{"domain":"example.com"}` | none | Submit a domain for checking and read the available ownership methods |
| `GET /v1/sites/{domain}/verification` | none | Read public methods and the claim endpoint; no private claim credential or reusable issuance token is returned |
| `POST /v1/sites/{domain}/claims` | none | Start a fresh claim; returns `claim_id`, private `claim_secret`, `expires_at` and `verification.token` with proof snippets |
| `POST /v1/sites/{domain}/verify` `{"claim_id":"…","claim_secret":"…"}` | private claim credentials in JSON body | Check the fresh proof and consume the claim once; on success return the owner API key, shown once |

Publish only the fresh `verification.token` using one of the returned methods: an llms.txt line, DNS TXT record, homepage meta tag or well-known file. Keep the claim ID/secret private and submit them in the JSON body. Claims expire after 30 minutes and cannot be reused after success. A failed proof check returns `422` with the checked methods; correct the proof and retry before expiry. Starting a recovery claim leaves the current owner key working until the fresh proof succeeds. See [ownership.md](ownership.md) and the [shell example](../examples/verify-site.sh).

Successful confirmation proves domain control, without endorsing content quality. Keep the successful public proof published: it is rechecked over time, and ownership lapses after 14 days of continuous failure. Search relevance comes first. Existing verified-first browse ordering and the ownership contribution to authority remain directory ranking signals; they are not a prerequisite for listing or access.

**0.7 owner-flow migration:** `/verify` now requires fresh claim credentials; calling it without them, or presenting an old public token alone, cannot issue an API key. Existing owner API keys remain valid, and existing public proofs continue to work for periodic rechecking. A new claim is required when recovering a lost key. Public discovery endpoints do not require this migration.

## Owner endpoints

Use `Authorization: Bearer <api_key>`.

| Endpoint | Effect |
|---|---|
| `PATCH /v1/sites/{domain}` | Edit `description`, `tags`, `nested_llms_txt`, `contact`, `agent_terms`, `webhook_url` and `notify_email`; `null` clears a field |
| `GET /v1/sites/{domain}/stats` | Read aggregate `usage`, the separate historical `lookups` counter, scores, recent notifications and badge |
| `POST /v1/sites/{domain}/recrawl` | Revalidate now (once per 10 minutes) |
| `POST /v1/sites/{domain}/notify/test` | Send a test notification |
| `POST /v1/sites/{domain}/key` | Return a replacement API key once; immediately invalidate the previous key, browser owner sessions and pending claims |

Terms are specified in [agent-terms.md](agent-terms.md). A missing term is unknown. Check the original site's current terms and access rules before automated retrieval.

The stats `usage` object reports `measurement_started_at`, the UTC reporting window, per-surface `requests`, `active_days`, `documentation_selections`, `referrals`, event totals and daily aggregates. These are request volumes, including possible bots, tests and repeated calls. Documentation selections mean returned links, without confirming destination reads. Active days count dates with requests rather than returning individuals. The historical `lookups` counter has mixed origins and is not backfilled into the new measurement. See [measurement.md](measurement.md) for limits and retention.

## Limits and MCP

Registration: 10/hour per client. Claim creation and verification each allow 30/hour per client and 10/hour per domain. Live check: 20 per 10 minutes. Generation: 5 per 10 minutes. Watches: 20/hour. MCP: 120 calls/minute. Cache repeat reads and back off on `429`.

The same operations are MCP tools at `https://agentwebmap.com/mcp`. For ownership, call `begin_ownership_claim` with `domain`, publish the returned proof, then call `verify_domain` with `domain`, `claim_id` and `claim_secret`. Protected owner tools take `domain` and `api_key`; `rotate_owner_key` replaces that key. Tools include output schemas and operation annotations; annotations describe behavior and are not authorization. See [client configuration](../README.md#add-it), [task examples](task-examples.md), and the [benchmark](../benchmarks/README.md).
