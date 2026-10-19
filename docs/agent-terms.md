# Terms for agents

A verified owner can publish a short, fixed-shape statement about automated use of their site. It is shown on the listing page, in every API answer for the domain (`agent_terms`), in the Markdown rendering of the page, and in `resolve` (`terms`), so an agent can act on it without guessing.

Set it with `PATCH /v1/sites/{domain}` (owner API key) or the `update_site` MCP tool:

```json
{
  "agent_terms": {
    "automated_access": "welcome",
    "rate_limit": "60 requests/minute",
    "attribution": "appreciated",
    "attribution_text": "Source: Example Docs (example.com)",
    "pricing": "free",
    "pricing_url": "https://example.com/pricing",
    "terms_url": "https://example.com/terms",
    "notes": "Use the JSON API where possible; HTML pages are rate limited harder."
  }
}
```

## Fields

| Field | Values |
|---|---|
| `automated_access` | `welcome` · `limited` · `ask` · `not_allowed` |
| `rate_limit` | short text, ≤ 100 chars |
| `attribution` | `required` · `appreciated` · `none` |
| `attribution_text` | how to credit the site, ≤ 200 chars |
| `pricing` | `free` · `freemium` · `paid` |
| `pricing_url` | absolute http(s) URL |
| `terms_url` | absolute http(s) URL to the full terms |
| `notes` | anything else an agent should know, ≤ 500 chars |

All fields are optional, but at least one is required. Unknown fields are rejected, so consumers can rely on the shape. `"agent_terms": null` clears it.

## Reading it as an agent

```
GET https://agentwebmap.com/v1/resolve?q=example.com   →  .terms
GET https://agentwebmap.com/v1/domain/example.com       →  .agent_terms
```

`null` means the owner has not stated terms (or is not verified). Treat that as "unknown", not as permission.
