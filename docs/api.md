# Agent Web Map API

Base URL: `https://agentwebmap.com`. Reads need no key. Responses are JSON; errors are JSON with an `error` code and usually a `hint`. Public responses carry `Cache-Control`; please cache. Live, machine-readable version of this page: [`/openapi.json`](https://agentwebmap.com/openapi.json). Index of everything: [`/v1`](https://agentwebmap.com/v1).

## Start here: resolve

`GET /v1/resolve?q=<domain or topic>`

One call, one answer. `q` is a domain (`stripe.com`, with or without scheme or path; subdomains fall back to the main domain) or a topic (`payments api`).

```json
{
  "query": "stripe.com",
  "mode": "domain",
  "best": { "domain": "stripe.com", "tier": "featured", "authority": 72, "verified": false, "llms_txt": "https://stripe.com/llms.txt", "why": ["authority 72 (featured)", "checked 12 minutes ago", "publishes llms-full.txt"], "...": "every field of /v1/domain/{domain}" },
  "read": { "llms_txt": "https://stripe.com/llms.txt", "llms_full_txt": "https://stripe.com/llms-full.txt", "nested_llms_txt": [] },
  "terms": null,
  "health": { "ok": true, "status": "valid", "tier": "featured", "authority": 72, "last_checked": "2026-10-19T…", "checked_minutes_ago": 12 },
  "alternatives": [],
  "watch": "POST https://agentwebmap.com/v1/watch with {\"domain\": \"stripe.com\", \"webhook_url\": \"https://your-endpoint\"} …"
}
```

An unknown domain returns `404` with `suggest.check` and `suggest.register`; a topic with no match returns `404` with a broader search link.

## Reading the directory

| Endpoint | Returns |
|---|---|
| `GET /v1/stats` | Directory-wide counts |
| `GET /v1/domains?page=&per_page=&verified=&include_unlisted=` | Ranked listing, verified owners first (`per_page` ≤ 100) |
| `GET /v1/search?q=…` | Full-text search over domain, title, summary, description, tags; same paging params |
| `GET /v1/domain/{domain}` | Everything published about one domain |
| `GET /v1/map` | Sites with a valid llms.txt per country |
| `GET /badge/{domain}.svg` | Status badge |

A domain object has: `domain`, `status` (`pending`, `valid`, `invalid`, `unreachable`), `tier` (`featured`, `listed`, `unlisted`), `authority` (0–100), `verified`, `verified_at`, `llms_txt`, `llms_full_txt`, `nested_llms_txt`, `title`, `summary`, `description`, `tags`, `contact`, `sections`, `links`, `rank`, `registered_at`, `country`, `agent_terms`, `first_seen`, `last_checked`, `badge`, and on unverified domains a `claim` block that says how the owner can verify and what it buys.

Every `/domain/{domain}` page also answers with JSON for `Accept: application/json` and Markdown for `Accept: text/markdown`.

## Tools

| Endpoint | Returns |
|---|---|
| `GET /v1/check/{domain}` | Validates the site's llms.txt the way an agent sees it: each check with what to fix, plus a preview |
| `GET /v1/generate/{domain}` | Drafts an llms.txt from the site's homepage, sitemap and page titles (10–30 s) |

## Watching a domain

| Endpoint | Auth | Does |
|---|---|---|
| `POST /v1/watch` `{"domain", "webhook_url"}` | none | Subscribe; returns `watch_id` and a `secret` (shown once) |
| `POST /v1/watch/{id}/test` | `Authorization: Bearer <secret>` | Sends a `test` event |
| `DELETE /v1/watch/{id}` | `Authorization: Bearer <secret>` | Unsubscribe |

Events and payloads: [webhooks.md](webhooks.md). Limits: 20 new watches per hour per client, 5 active per domain per client; ten consecutive failed deliveries switch a watch off.

## Listing and verifying a site

| Endpoint | Auth | Does |
|---|---|---|
| `POST /v1/sites` `{"domain"}` | none | Register a domain; the answer includes the verification token and the four methods |
| `GET /v1/sites/{domain}/verification` | none | Token and methods |
| `POST /v1/sites/{domain}/verify` | none | Checks the four methods; on success returns the owner API key (shown once), the badge embed and alert setup |

The four methods: a line in the site's llms.txt that links to its listing (recommended), a DNS TXT record, a meta tag on the homepage, or a well-known file. Verification is re-checked over time and lapses after 14 days of continuous failure.

## Owner endpoints (`Authorization: Bearer <api_key>`)

| Endpoint | Does |
|---|---|
| `PATCH /v1/sites/{domain}` | Set `description`, `tags`, `nested_llms_txt`, `contact`, `agent_terms` ([spec](agent-terms.md)), `webhook_url` (answer carries a signing secret), `notify_email`; `null` clears a field |
| `GET /v1/sites/{domain}/stats` | Lookup count, score breakdown, recent notifications, badge embed, last 30 score snapshots |
| `POST /v1/sites/{domain}/recrawl` | Re-validate now (once per 10 minutes) |
| `POST /v1/sites/{domain}/notify/test` | Send a test alert to the configured channels |

## Rate limits

Register 10/hour per client. Verify 30/hour per client and 10/hour per domain. Check 20 and generate 5 per 10 minutes. Watch 20/hour. MCP 120 calls/minute. Everything else: be reasonable and cache.

## MCP

The same operations as tools at `https://agentwebmap.com/mcp` (Streamable HTTP, stateless). See the [README](../README.md).
