# Categories and declared capabilities

Use categories to narrow documentation discovery by the publisher's subject or business. Use a capability filter to find a specific publisher-declared technical entry point. These signals are separate: a company can publish payment documentation without exposing an MCP endpoint, and an infrastructure company can expose an MCP endpoint without being an AI provider.

## Discover the taxonomy

`GET https://agentwebmap.com/v1/categories` or MCP `list_categories` returns `taxonomy_version`, `categories`, `uncategorized`, and `capabilities`.

Each category has `id`, `label`, `description` and `count`. Version `"2"` retains all 16 original IDs and adds ten publisher industries:

| ID | Label |
|---|---|
| `ai-ml` | AI and machine learning |
| `developer-tools` | Developer tools |
| `infrastructure` | Infrastructure |
| `data-analytics` | Data and analytics |
| `cybersecurity` | Cybersecurity |
| `finance-payments` | Finance and payments |
| `ecommerce` | Ecommerce |
| `productivity` | Productivity |
| `marketing` | Marketing |
| `education` | Education |
| `healthcare` | Healthcare |
| `media` | Media |
| `design` | Design |
| `gaming` | Gaming |
| `travel` | Travel |
| `community` | Community |
| `legal` | Legal |
| `recruiting-careers` | Recruiting and careers |
| `industrial-manufacturing` | Industry and manufacturing |
| `real-estate` | Real estate |
| `arts-culture` | Arts and culture |
| `sports-fitness` | Sports and fitness |
| `food-dining` | Food and dining |
| `automotive` | Automotive |
| `government-public-services` | Government and public services |
| `science-research` | Science and research |

Counts cover unblocked `listed` and `featured` domains, matching the default browsable directory. Sites can have up to five categories, so counts overlap. Empty `categories: []` means the rules found insufficient evidence; it does not mean a site is low quality or unsafe. A newly indexed or not-yet-backfilled site can also lack classification. `uncategorized` includes both empty cases. Discover current IDs and descriptions from the endpoint rather than inventing a filter value.

## Filter a discovery task

```bash
curl --get --fail-with-body https://agentwebmap.com/v1/search \
  --data-urlencode "q=webhooks" \
  --data-urlencode "category=finance-payments" \
  --data-urlencode "per_page=10"
```

```json
{"name":"resolve","arguments":{"query":"webhook retries","category":"finance-payments","limit":3}}
```

`/v1/search`, `/v1/domains` and `/v1/resolve` accept the same optional `category` filter; the MCP equivalents are `search_llms_registry`, `list_domains` and `resolve`. Apply a filter when the task benefits from that restriction. If evidence is sparse, retry without it so uncategorized sources remain discoverable. Category membership does not replace text relevance or reading the source.

Category and capability filters combine with AND when both are supplied. Invalid or empty IDs return `400`. A domain-only resolve still applies the filters; a known domain outside the selected category or capability returns `404` with `error: "no_match"`. Omit the filter to look up that domain without the restriction.

## Inspect the classification evidence

Compact domain responses include `categories`. Request `detail=full` on a domain lookup to inspect:

- `category_evidence`: entries with `id`, `confidence`, `evidence` (publisher metadata snippets), and `source: "publisher_metadata"`.
- `category_version`: the rules version used for the classification.
- `categorized_at`: when stored classification was computed.

Categories are inferred labels that help narrow discovery. A site can have several labels or remain uncategorized when evidence is insufficient. Inspect the returned publisher evidence when deciding whether a label fits your task.

`confidence` is a rule-strength score from 0 to 1, not a calibrated probability or verified business claim. Evidence is publisher-provided and may be incomplete, outdated or wrong. Ownership verification, authority, source health and category confidence answer different questions. Fetch the original source when the classification matters to a decision.

## Find a publisher-declared MCP endpoint

The taxonomy response also lists capabilities, including `id: "mcp"` with a count of sites that explicitly declare an MCP endpoint link. To discover these sites:

```bash
curl --get --fail-with-body https://agentwebmap.com/v1/domains \
  --data-urlencode "capability=mcp" \
  --data-urlencode "per_page=10"
```

```json
{"name":"list_domains","arguments":{"capability":"mcp","detail":"full","per_page":10}}
```

The `capability` filter is also accepted by search and resolve. Compact domain responses include `capabilities: ["mcp"]` when qualifying evidence exists; an empty array means no qualifying declaration was indexed. Full responses expose `capability_evidence` with `id`, `url`, `source_url`, and `status: "publisher_declared"`.

Detection requires a publisher-provided link explicitly labeled as an MCP server, endpoint or Model Context Protocol, with a same-publisher URL ending in `/mcp` or `/sse`. Documentation links are excluded. A generic mention of MCP, an AI-related category, or an unrelated third-party endpoint does not qualify.

**Publisher-declared does not mean validated or working.** The classifier does not contact the endpoint, complete an MCP handshake, inspect its tools, or prove its authentication and terms fit the task. Treat returned endpoint URLs as discovery candidates; inspect their documentation and validate the endpoint through an appropriate client before relying on it. Category metadata alone does not authorize connecting or invoking tools.

## Stored classification and backfill

New crawls compute classification from publisher metadata, including an opening prose description when a publisher does not use a blockquote summary. The crawler automatically processes stored rows whose classification version is stale in bounded batches; changing the rules version schedules reassessment from stored metadata without fetching each site again. Newly indexed documentation also triggers classification using its richer evidence. Reclassification updates category and declared capability metadata from stored evidence. It does not validate a declared MCP endpoint. Versioned rules make later classification changes reviewable. The separate documentation backfill has request, worker and time budgets, and failed attempts back off instead of blocking other publishers. Directory coverage and counts change as crawling and backfills progress; an uncategorized result remains valid when evidence is insufficient.
