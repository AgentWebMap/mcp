# Documentation tasks for agents

These examples describe workflows, not recorded benchmark results. Success depends on the indexed publisher metadata. A `200` response with weak evidence is not sufficient evidence that a task has been answered.

## Find webhook documentation

User task: “Add a Stripe webhook endpoint and verify its signature.”

```json
{"name":"resolve","arguments":{"query":"stripe webhook signature","limit":3,"detail":"compact","max_age":86400}}
```

Read `sources[].url`, compare titles and excerpts, and fetch the official page that supports signature verification. Check the user's framework and SDK version against that page. Cite the original documentation in the implementation explanation. If `sources` is empty or weak, search Stripe's documentation directly.

Dependency-free examples:

```bash
sh examples/resolve.sh "stripe webhook signature"
python examples/resolve.py "stripe webhook signature" --max-age 3600
node examples/mcp-client.mjs resolve '{"query":"stripe webhook signature","limit":3}'
```

## Find a source without knowing the vendor

User task: “Find official documentation about webhook retries.”

```json
{"name":"resolve","arguments":{"query":"webhook retries","limit":5}}
```

Compare source relevance and domains. Retry behavior is vendor-specific; explain which provider's documentation supports each claim. Use alternatives or ordinary search if returned descriptions do not discuss retries. Owner verification indicates domain control, not universal applicability.

## Inspect a known domain


```bash
curl --get --fail-with-body https://agentwebmap.com/v1/resolve \
  --data-urlencode "q=modelcontextprotocol.io" \
  --data-urlencode "detail=compact"
```

Use `read.llms_txt` for the publisher's documentation map. Prefer a relevant source page over downloading llms-full.txt when a short page will answer the task. Use `lookup_domain` with `detail: "full"` only if expanded directory or ownership details are needed.

## Discover a type of provider

User task: “Find payment-provider documentation about webhook retries.”

Call `list_categories` to get the current IDs and counts, then restrict the task if the category matches the user's intent:

```json
{"name":"resolve","arguments":{"query":"webhook retries","category":"finance-payments","limit":3}}
```

Inspect full domain details if category evidence matters. Categories use heuristic publisher metadata rules; weak evidence stays uncategorized. If the filter excludes useful sources, retry without it and inspect the documentation directly. See the [category reference](categories.md).

## Discover an MCP endpoint candidate

User task: “Which indexed sites explicitly publish an MCP server endpoint?”

```json
{"name":"list_domains","arguments":{"capability":"mcp","detail":"full","per_page":10}}
```

Inspect `capability_evidence` for the declared endpoint URL, original llms.txt and `publisher_declared` status. These are explicit same-publisher endpoint declarations, rather than generic MCP mentions. They have not been tested for availability, tools or authentication. Read the provider's documentation and validate with an appropriate MCP client before relying on a candidate.

## Require a recent check

```json
{"name":"resolve","arguments":{"query":"cloudflare workers bindings","max_age":3600,"refresh":true,"limit":3}}
```

Inspect `health.ok`, `health.stale` and `health.live_checked`. Refresh returns live llms.txt health and metadata; it does not rewrite the stored index or verify every linked page. Fetch the relevant Cloudflare page and confirm its current API details. Cache successful reads and respect validation rate limits.

## Handle missing or uncertain results

An unknown domain or absent topic can return `404`; a metadata-only result may return `200` with a weak match. Neither warrants silently inventing a documentation URL. Refine the query once with a known vendor or precise API concept, then fall back to official search if it still lacks evidence. A missing `terms` value means terms are unknown.

## Compare the cost of discovery

Run the [benchmark](../benchmarks/README.md) before and after an index or ranking change. Inspect exact documentation hits separately from provider-domain hits. Response bytes measure the discovery payload, and the token estimate is a heuristic; a full task comparison must also count destination page retrieval, model tokens, retries and implementation correctness.
