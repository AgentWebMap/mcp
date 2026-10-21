# Documentation discovery benchmark

Run 20 curated tasks against a configurable Agent Web Map deployment. The runner needs Node.js 20+ and no packages. It performs public reads sequentially, never registers sites or creates watches, and does not fetch the destination documentation pages.

From this repository's root:

```bash
node benchmarks/run.mjs --base-url http://localhost:3000 --label candidate --output candidate.json
node benchmarks/run.mjs --base-url https://agentwebmap.com --label baseline --output baseline.json
```

Run the old and changed service against the same database snapshot when evaluating code changes; different indexed content or cache states make the comparison partly a data comparison. Output is also printed as JSON; keep reports outside a published repository unless intentionally sharing them.

For response-size comparisons on one version:

```bash
node benchmarks/run.mjs --detail compact --label compact --output compact.json
node benchmarks/run.mjs --detail full --label full --output full.json
```

Use `--repeat 3` for repeated runs, `--limit 5` for a smoke check, `--timeout-ms 15000` to set the request timeout, `--max-age 86400` to set the freshness threshold, and `--source-limit 3` to control returned source count (1–5). `--tasks path/to/tasks.json` supplies a custom dataset. `--help` lists all options. Refresh is intentionally omitted so this benchmark does not add live validation work to a production service.

## What is measured

- **Source hit rate at 1 and 3:** the first or first three `sources[].url` values match a curated expected host/subdomain and path regex. A provider homepage or domain-only `best` is not a documentation-page hit. A non-2xx, malformed response or transport error always counts as a miss.
- **Provider hit rate:** `best.domain` matches an expected provider. This weaker metric lets an older domain-only resolver be compared honestly.
- **Latency:** client-observed median and p95, including response reading and failed attempts. No warm-up, retries or parallel requests are hidden.
- **Response bytes:** uncompressed UTF-8 body size, excluding HTTP headers and destination-page fetches.
- **Estimated response tokens:** `ceil(response.length / 4)` using JavaScript UTF-16 code units. This is a heuristic for payload comparison, not measured model token usage, tokenizer output, billing or total task cost.
- **Freshness:** stale and unknown counts are reported separately; older APIs without freshness fields remain unknown.

All attempts, errors, returned URLs and per-task matches are retained in the report. `404` is a valid absence response but a miss for a task expecting documentation. Missing source arrays in older API versions are page-level misses rather than inferred successes. Read `summary.non_2xx_or_transport_errors` before interpreting results; normal benchmark misses do not set the process exit code. Invalid options or datasets do.

## Dataset and limits

[tasks.json](tasks.json) has vendor-specific and open-topic development tasks. Each expected entry accepts a host and a regular expression over the URL pathname. Subdomains are allowed; deceptive suffixes such as `stripe.com.example.org` do not match `stripe.com`. Multiple acceptable providers are allowed for open topics.

The expected URLs are evaluation rules, not claims that those pages are indexed. Review rules against current official documentation before publishing benchmark conclusions. URL matches are a proxy for useful discovery; manually inspect returned pages, excerpts and whether they answer the actual question. A URL hit does not establish factual accuracy or implementation success. Extend the dataset with held-out tasks rather than tuning solely to these examples.

Historical measurements and their limits are available in the [run report](../docs/benchmark-results.md). They describe the dated runs rather than the current service. Current index figures are on the [statistics page](https://agentwebmap.com/stats). A full agent evaluation should compare time to a correct implementation, source fetches, model tokens, retries and task completion against official-site search or ordinary web search. This runner measures only the discovery step.

Run the runner's local checks without an external service:

```bash
node --test benchmarks/run.test.mjs
```
