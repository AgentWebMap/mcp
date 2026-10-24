# Practical discovery tasks for agents

These are example workflows, not recorded benchmark results. Public discovery needs no account or API key. Inspect the evidence and read the original publisher pages before relying on an answer.

## Find official documentation for a named task

Task: "Add a Stripe webhook endpoint and verify its signature."

```json
{"name":"resolve","arguments":{"query":"stripe webhook signature verification","limit":3,"max_age":86400}}
```

Read `sources[].url`, inspect titles and excerpts, then open the relevant original documentation. Match the user's framework and SDK version. If evidence is weak or missing, refine once or use the publisher's documentation search.

## Keep a framework constraint explicit

Task: "Find Next.js App Router data-fetching documentation."

```json
{"name":"resolve","arguments":{"query":"next.js app router data fetching","limit":3}}
```

Check that the returned original pages apply to App Router and the required version. A publisher match alone does not establish that a page satisfies every constraint.

## Discover providers by country and action

Task: "Find indexed payment providers in France that publish API material."

```json
{"name":"list_domains","arguments":{"category":"finance-payments","country":"FR","action":"call_api","per_page":10}}
```

Obtain current category IDs with `list_categories` and country codes with `list_countries`. Country evidence can be owner-declared, a published address, a domain suffix or hosting. Inspect its provenance before interpreting it as a verified business location. Actions are inferred uses, not tested integrations.

REST equivalent:

```sh
curl 'https://agentwebmap.com/v1/domains?category=finance-payments&country=FR&action=call_api&per_page=10'
```

## Find publishers related to a known source

```json
{"name":"similar_sites","arguments":{"domain":"cloudflare.com","limit":6}}
```

Inspect each suggested publisher and actual shared headings. `available=false` explains unavailable similarity information. Related does not mean affiliated or interchangeable. [Open the same source in Explore](https://agentwebmap.com/explore?publisher=cloudflare.com).

## Follow headings across websites

First discover actual keys:

```json
{"name":"list_sections","arguments":{"sort":"common","per_page":20}}
```

Then use returned keys in a graph request. This example assumes `services` is present:

```json
{"name":"explore_sections","arguments":{"sections":["services"],"connections":"semantic","include_sites":false}}
```

Keep shared-heading evidence separate from inferred related meanings. Use `section_match` for all/any combinations and country/action filters when useful. [Section guide](sections.md).

## Inspect a known domain and its file

```json
{"name":"lookup_domain","arguments":{"domain":"modelcontextprotocol.io"}}
```

Call `read_llms_txt` for its cached orientation file and inspect source URL, check date, hash and truncation information. Prefer a relevant linked article over downloading an entire full file when one page can answer the task.

## Discover a publisher-declared MCP endpoint

```json
{"name":"list_domains","arguments":{"capability":"mcp","detail":"full","per_page":10}}
```

Inspect `capability_evidence`. A publisher declaration is not an availability, compatibility or authentication test. Read the provider's documentation before connecting. Discovery does not authorize invocation of another service's tools.

## Request a recent source check

```json
{"name":"resolve","arguments":{"query":"cloudflare workers kv","max_age":3600,"refresh":true,"limit":3}}
```

Inspect `health.ok`, `health.stale` and `health.live_checked`. Refresh checks the public orientation file for the response; it does not verify every linked article or guarantee that the destination API is unchanged.

## Start from an editorial source list

Browse collections for [MCP tools](https://agentwebmap.com/collections/build-mcp), [payments](https://agentwebmap.com/collections/payments) or [AI applications](https://agentwebmap.com/collections/ai-application). People can save useful sources in a [private workspace](https://agentwebmap.com/workspace). Public collections and private saved lists are different features.

## Handle uncertainty

`404 no_match` with `best: null` means no qualifying match was found. A weak `200` result is a lead, not proof of an answer. Refine a useful query once, then fall back to official search or ordinary web search. Do not invent missing URLs or treat absent owner terms as permission.

Existing [integration examples](../examples/) show HTTP/MCP usage. [Benchmark documentation](../benchmarks/README.md) describes historical evaluation tooling and its limits; it does not establish current accuracy across the web.
