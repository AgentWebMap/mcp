# Categories and declared capabilities

Use categories to narrow documentation discovery by the publisher's subject or business. Use a capability filter to find a specific publisher-declared technical entry point. These signals are separate: a company can publish payment documentation without exposing an MCP endpoint, and an infrastructure company can expose an MCP endpoint without being an AI provider.

## Discover the taxonomy

`GET https://agentwebmap.com/v1/categories` or MCP `list_categories` returns `taxonomy_version`, `categories`, `uncategorized`, and `capabilities`.

Each category has an id, label, description and count. Read the live endpoint for current IDs and counts; categories can evolve as the directory improves.

| ID | Label |
|---|---|
| `agriculture` | Agriculture |
| `ai-agents-mcp` | AI agents and MCP |
| `ai-ml` | AI and machine learning |
| `apis-sdks` | APIs and SDKs |
| `arts-culture` | Arts and culture |
| `auth-identity` | Authentication and identity |
| `automotive` | Automotive |
| `saas-business-software` | Business software |
| `communications` | Communications |
| `community` | Community |
| `construction-architecture` | Construction and architecture |
| `consumer-electronics` | Consumer electronics |
| `crypto-web3` | Crypto and Web3 |
| `cybersecurity` | Cybersecurity |
| `data-analytics` | Data and analytics |
| `databases` | Databases |
| `design` | Design |
| `developer-tools` | Developer tools |
| `devops-observability` | DevOps and observability |
| `documentation-reference` | Documentation and reference |
| `ecommerce` | Ecommerce |
| `education` | Education |
| `energy-utilities` | Energy and utilities |
| `entertainment` | Entertainment and streaming |
| `events` | Events and conferences |
| `fashion-beauty` | Fashion and beauty |
| `finance-payments` | Finance and payments |
| `food-dining` | Food and dining |
| `gaming` | Gaming |
| `government-public-services` | Government and public services |
| `healthcare` | Healthcare |
| `home-garden` | Home and garden |
| `industrial-manufacturing` | Industry and manufacturing |
| `infrastructure` | Infrastructure |
| `insurance` | Insurance |
| `legal` | Legal |
| `local-business` | Local business |
| `logistics-shipping` | Logistics and shipping |
| `marketing` | Marketing |
| `media` | Media |
| `no-code-automation` | No-code and automation |
| `nonprofit` | Nonprofit and advocacy |
| `open-source` | Open source projects |
| `personal-blog` | Personal sites and blogs |
| `pets` | Pets |
| `productivity` | Productivity |
| `real-estate` | Real estate |
| `recruiting-careers` | Recruiting and careers |
| `science-research` | Science and research |
| `sports-fitness` | Sports and fitness |
| `telecom` | Telecom |
| `travel` | Travel |

Counts cover the public browsable directory. A website can have several categories, so totals overlap. Empty `categories: []` means no category is currently available; it does not establish low quality or unsafe content. Discover current IDs and descriptions from the endpoint rather than inventing a filter value.

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
- `category_version`: the version associated with the stored classification.
- `categorized_at`: when stored classification was computed.

Categories are inferred labels that help narrow discovery. A site can have several labels or remain uncategorized when evidence is insufficient. Inspect the returned publisher evidence when deciding whether a label fits your task.

`confidence` is an inferred evidence signal, not a calibrated probability or verified business claim. Evidence is publisher-provided and may be incomplete, outdated or wrong. Ownership verification, authority, source health and category confidence answer different questions. Fetch the original source when the classification matters to a decision.

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

A generic mention of MCP or an AI-related category is different from a publisher-declared endpoint. Inspect the returned declaration and its source before treating it as an integration candidate.

**Publisher-declared does not mean validated or working.** Treat returned endpoint URLs as discovery candidates; inspect their documentation and validate availability, relevant tools, authentication and terms through an appropriate client. Category metadata alone does not authorize connecting or invoking tools.

## Classification and coverage

Categories describe inferred publisher topics. Metadata can be incomplete or wrong, and some sites remain uncategorized. Full responses expose evidence when available. Category totals overlap because one website can cover several topics. An ownership badge establishes domain control, not the correctness of a category.

## Agentic labels

Listings also carry an inferred `agentic` field: `interface` for an API or declared MCP endpoint, `transactional` for buying/booking, `documentation` for docs to read, or `informational` for general content. Unlabelled sites return null. Filter search, list and resolve with `agentic=<value>`; this combines with category and capability filters. These hints do not certify an endpoint or authorize transactions.

Each site counts at most once within a category. Totals overlap across different categories, and full responses retain available evidence.

## Filter by inferred action

Use `action=read_docs`, `search_content`, `call_api`, `buy`, `book`, `download_data` or `contact_support` alongside country/category filters where supported. These actions can overlap; they do not prove a working integration or authorize a transaction.

```sh
curl 'https://agentwebmap.com/v1/domains?category=finance-payments&action=call_api&country=FR'
```

MCP uses the same `action` argument. [Current action reference](https://agentwebmap.com/docs#actions).
