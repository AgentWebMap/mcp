# Documentation discovery runs — 2026-10-19

The same unchanged 20-task dataset was run sequentially against public API versions **0.7.0** and **0.8.0**. Expected-provider matches rose from **8/20 (40%) to 15/20 (75%)**. Expected source URLs at rank 1 and within rank 3 rose from **5/20 (25%) to 6/20 (30%)**. Provider selection improved in this sample; task-specific source discovery still has major gaps. These are URL matches, not agent task-success rates.

The runs began about 12 minutes apart against a changing production index, without a frozen database or controlled cache state. Code and indexed data can both affect results; this comparison cannot isolate the algorithm's contribution. It is not a competing-service comparison.

Both complete reports retain every attempt, returned URL, HTTP status, freshness flag and payload measurement: [0.7.0 baseline](../benchmarks/results/2026-10-19.json) and [0.8.0 later run](../benchmarks/results/2026-10-19-v0.8.0.json). The [task set](../benchmarks/tasks.json), expected-host/path rules and [runner](../benchmarks/run.mjs) were unchanged. Original baseline detail is retained below.

## Comparison

| Measure | 0.7.0 baseline | 0.8.0 later run |
| --- | ---: | ---: |
| Attempts | 20 | 20 |
| Expected source URL at rank 1 | 5/20 (25%) | 6/20 (30%) |
| Expected source URL in first 3 | 5/20 (25%) | 6/20 (30%) |
| Expected provider selected | 8/20 (40%) | 15/20 (75%) |
| Non-2xx responses | 2, both HTTP 404 | 0 |
| Transport errors | 0 | 0 |
| API health.stale = true | 14 | 19 |
| Within requested freshness threshold | 4 | 1 |
| Freshness unknown | 2 | 0 |
| Client-observed median / p95 latency | 28.49 / 124.56 ms | 30.71 / 70.37 ms |
| Mean / total uncompressed response body | 3,046.75 / 60,935 bytes | 3,111.75 / 62,235 bytes |
| Mean / total estimated response tokens | 760.95 / 15,219 | 777.9 / 15,558 |

The estimate is `ceil(JSON response UTF-16 code units / 4)` for each response, not tokenizer output, model usage, billing or total task cost. Bytes exclude headers, destination-page retrieval and model work. Latency includes the client's network and response reading, including initial connection and errors; there were no retries or warm-up. One run per version does not establish a latency improvement.

The later run returned 19 stale flags, one result within the threshold and no unknown freshness values. A stale flag means the stored check is older than the requested 24-hour threshold; it does not establish whether content is correct or currently reachable. Stored checks can exceed the requested freshness window. The API threshold `max_age=86400` does not request a refresh or guarantee freshness. Selecting different records also changes which stored check dates are measured.

## Later-run successes and every remaining source miss

The additional source hit is Stripe webhooks: the first result changed from another publisher's integration to `https://docs.stripe.com/webhooks.md`. The other five automated source hits remain Next.js caching, Prisma transactions, Resend webhooks, Clerk session tokens and Durable Objects. The evaluator's Clerk hit is an account dashboard rather than documentation; Prisma and Durable Objects also demonstrate why a broad path match alone does not prove useful implementation guidance.

Expected providers were selected for seven additional queries: Stripe webhooks, idempotency and subscriptions; Cloudflare bindings; Supabase RLS and authentication; and Next.js middleware. The two baseline 404s now selected expected providers, but neither became a source-URL hit. Provider selection and useful page discovery are separate outcomes.

Fourteen of 20 queries still missed the unchanged source-URL rules. Destination pages were not fetched or semantically evaluated. All misses are shown here:

| Query | First later-run source or absence | Why the fixed rule misses / remaining limitation |
| --- | --- | --- |
| stripe idempotent requests | Stripe selected; no source links | Right provider, missing task-specific page. |
| stripe subscriptions | docs.stripe.com/billing/quickstart.md | Other sources are support root and billing product URL; none match the subscription rule. |
| cloudflare workers bindings | www.cloudflare.com/products/workers-ai.md | Workers product and plans URLs do not identify bindings documentation. Later match is weak. |
| cloudflare workers kv | www.cloudflare.com/products/kv.md | Narrow fixed regex does not accept kv.md; product-page usefulness requires review. |
| cloudflare r2 object storage | www.cloudflare.com/products/r2.md | Narrow fixed regex does not accept r2.md. |
| supabase row level security | supabase.com/docs/guides/security.md | Generic security URL rather than an RLS path. Later match is weak. |
| supabase authentication | Supabase selected; no source links | Right provider, missing task-specific page. |
| vercel environment variables | vercel.com/academy/filesystem-agents/filesystem-project-setup | Different URL topic; no environment-variable path match. |
| nextjs middleware | Next.js selected; no source links | Right provider, missing task-specific page. |
| astro routing | yippy.com/t/y1z2ywxmnczdvakjywwh/ | Different provider and opaque URL; later resolver labels the candidate weak. |
| openai function calling | supermemory.ai/docs/integrations/openai.md | Another publisher's integration; later resolver labels it weak. |
| anthropic tool use | exa.ai/docs/integrations/tool-calling/anthropic.md | Another publisher's integration; later resolver labels it weak. |
| webhook retries | developer.loopwork.co/reference/webhook-retry-mechanism.md | Potentially relevant topic URL outside the expected-provider list; requires page review. |
| database connection pooling | render.com/docs/postgresql-connection-pooling.md | Potentially relevant topic URL outside the expected-provider list; requires page review. |

Rules and results were preserved rather than adjusted to raise the score. Source hits at rank 3 equal source hits at rank 1 in both runs: no extra hits appeared at ranks 2 or 3. Future evaluation should add independently reviewed, held-out tasks and assess source contents and completed implementations, rather than tune only these 20 examples.

## Run provenance and limits

| Provenance | 0.7.0 baseline | 0.8.0 later run |
| --- | --- | --- |
| Started, UTC | 2026-10-19T17:54:00.693Z | 2026-10-19T18:06:10.278Z |
| Completed, UTC | 2026-10-19T17:54:01.879Z | 2026-10-19T18:06:11.126Z |
| API version observed from /openapi.json, UTC | 2026-10-19T17:54:14.864Z | 2026-10-19T18:06:22.057Z |

Task SHA-256: `85b1d4d6afb3e81f1daedcba7def46063fd30ff954e64263297e3e8675da0479`.

Runner SHA-256: `ac3550d05997fd01ee9c60425eda8b8c777763d4afbe396993b0ab303f90b06f`.

The unchanged runner and tasks are available at published reference commit `9eb30c97d7b4aa96dbd4bce94128617801751ea5`, also the local baseline release reference. The API exposes a version, not a verifiable deployed source commit. Both reports record commands and parameters. Each used compact responses, three requested sources, a 15-second timeout, max_age=86400, one sequential pass and no refresh. Neither run seeded, submitted, created watches, initiated live validation or fetched destination pages.

These 20 hand-curated developer tasks are a convenience sample, not an estimate of whole-index coverage. There is no ordinary-search or competing-service baseline. The runner does not measure agent task success, answer correctness, full model usage, total source-fetch cost or unique agents. The two runs' 40 API requests contribute QA traffic to AgentWebMap's counters and must not be presented as independent adoption. Reproduce using the command and methodology retained in the original baseline section below, recognizing that production contents and caches can change.


## Original 0.7.0 baseline — 2026-10-19

One sequential pass of the existing 20-task dataset against `https://agentwebmap.com/v1/resolve` returned the expected source URL at rank 1 for **5/20 queries (25%)**, with no additional hits by rank 3. The expected provider was selected for **8/20 (40%)**. These results expose substantial provider-selection and documentation-coverage work; they are not a product comparison or an agent task-success claim.

The [complete report](../benchmarks/results/2026-10-19.json) retains all attempts, returned URLs, HTTP statuses, freshness flags and measured payloads. The [task set](../benchmarks/tasks.json) and [runner](../benchmarks/run.mjs) were not changed for this run.

### Observations

| Measure | Result |
| --- | ---: |
| Attempts | 20 |
| Expected source URL at rank 1 | 5/20 (25%) |
| Expected source URL in first 3 | 5/20 (25%) |
| Expected provider selected | 8/20 (40%) |
| Non-2xx responses | 2, both HTTP 404 |
| Transport errors | 0 |
| API `health.stale = true` | 14 |
| Freshness unknown | 2 |
| Client-observed median / p95 latency | 28.49 / 124.56 ms |
| Mean / total uncompressed response body | 3,046.75 / 60,935 bytes |
| Mean / total estimated response tokens | 760.95 / 15,219 |

The token estimate is `ceil(JSON response UTF-16 code units / 4)` for each response. It is not tokenizer output, model usage, billing or total task cost. Response bytes exclude headers, destination-page retrieval and model work. Latency includes the measuring client's network, response reading, the initial connection and failed attempts; no retries or warm-up were hidden.

The two HTTP 404 results are absence responses, not transport failures. A stale flag means the API considers its source check older than the requested threshold; it does not establish whether the content is correct or currently reachable.

### Failures and evaluation limitations

This review uses returned URLs only. Destination pages were not fetched or evaluated for semantic correctness.

| Query | Selected provider / first returned URL | Automated source match | What the URL reveals |
| --- | --- | --- | --- |
| stripe webhooks | [paidmembershipspro.com](https://www.paidmembershipspro.com/gateway/stripe/setup/) | No | A Stripe integration on another publisher, rather than Stripe documentation. |
| stripe idempotent requests | None — HTTP 404 | No | No result; this report cannot distinguish missing coverage from retrieval failure. |
| stripe subscriptions | [trackdesk.com](https://trackdesk.com/integrations/stripe) | No | Another publisher's Stripe integration. |
| cloudflare workers bindings | [gologin.com](https://gologin.com/blog/cloudflare-browser-rendering/) | No | A third-party article, not Cloudflare's documentation. |
| cloudflare workers kv | [cloudflare.com](https://www.cloudflare.com/products/kv.md) | No | Expected provider, but the fixed regex does not accept `kv.md`; it is also a product URL, not demonstrated task documentation. |
| cloudflare r2 object storage | [cloudflare.com](https://www.cloudflare.com/products/r2.md) | No | Expected provider; the fixed regex does not accept `r2.md`. |
| supabase row level security | None — HTTP 404 | No | No result; cause not established by the response alone. |
| supabase authentication | [onspace.ai](https://docs.onspace.ai/integrations/supabase-integration) | No | Supabase integration on another publisher. |
| vercel environment variables | [vercel.com](https://vercel.com/academy/filesystem-agents/filesystem-project-setup) | No | Expected provider, different URL topic. |
| nextjs caching | [nextjs.org](https://nextjs.org/docs/app/getting-started/caching) | Yes | Host and path match; page correctness was not checked. |
| nextjs middleware | [alestaweb.com](https://alestaweb.com/haber/nextjs-15-destek-sonu-21-ekim-2026-nextjs-16-gecis-rehberi) | No | A third-party article rather than Next.js documentation. |
| prisma transactions | [prisma.io](https://www.prisma.io/postgres/customer-order-transactions) | Yes | Broad transaction regex accepts this URL; it does not establish that this is transaction API guidance. |
| resend webhooks | [resend.com](https://resend.com/docs/webhooks/contacts/topics-updated.md) | Yes | A specific webhook event URL passes a broad webhook rule. |
| clerk session tokens | [clerk.com](https://dashboard.clerk.com/settings/access-tokens) | Yes | Dashboard access-token URL passes the token regex; this is a false positive for a documentation-only interpretation. |
| astro routing | [yippy.com](https://yippy.com/t/y1z2ywxmnczdvakjywwh/) | No | Different provider and opaque path. |
| openai function calling | [supermemory.ai](https://supermemory.ai/docs/integrations/openai.md) | No | Another publisher's OpenAI integration. |
| anthropic tool use | [exa.ai](https://exa.ai/docs/integrations/tool-calling/anthropic.md) | No | Another publisher's Anthropic integration. |
| webhook retries | [loopwork.co](https://developer.loopwork.co/reference/webhook-retry-mechanism.md) | No | Potentially relevant topic URL outside the expected-provider list; requires page review. |
| database connection pooling | [render.com](https://render.com/docs/postgresql-connection-pooling.md) | No | Potentially relevant topic URL outside the expected-provider list; requires page review. |
| durable objects | [cloudflare.com](https://www.cloudflare.com/products/durable-objects.md) | Yes | Product URL passes the broad path rule; implementation usefulness was not evaluated. |

The expected-host lists and path expressions can undercount relevant sources and overcount irrelevant ones. The results remain unchanged to expose both problems. A future evaluation should add independently reviewed, held-out tasks and assess retrieved page contents and completed implementations, rather than tune only these 20 examples.

### Reproduce and compare

Run from the public repository root with Node.js 20+:

```bash
node benchmarks/run.mjs --base-url https://agentwebmap.com --label live-baseline --repeat 1 --limit 20 --output baseline.json
```

The run used compact responses, a source limit of 3, `max_age=86400`, a 15-second request timeout and no refresh. It did not initiate live validation, submit sites, create watches or fetch destination pages. The public service and indexed content can change, so a later run is not expected to reproduce identical values. For code comparisons, use the same database snapshot and comparable cache states; compare all attempts, including misses and errors.

The report records API version `0.7.0`, observed from `/openapi.json` after the run. The local published-release reference commit is `9eb30c97d7b4aa96dbd4bce94128617801751ea5`; the public API exposes a version, not a verifiable deployed commit. Task and runner SHA-256 values are recorded in the report. The run began at `2026-10-19T17:54:00.693Z` and finished at `2026-10-19T17:54:01.879Z`.

These hand-curated developer tasks are a small convenience sample, not an estimate of whole-index coverage. There is no ordinary-search or competing-service baseline. The runner does not measure agent task success, answer correctness, full model token usage, total source-fetch cost or unique agents. Its 20 API requests contribute QA traffic to AgentWebMap's own activity counters and must not be presented as independent adoption.

### AI visibility is a separate measurement

The [fixed visibility prompts](../benchmarks/visibility-prompts.json) provide a manual protocol for checking unbranded mentions and citations. No cross-platform runs or results are claimed here. Record the platform, model if shown, time, search mode, full answer and source URLs; distinguish a mention from a citation and both from successful API/MCP use. Repeat from a fresh conversation without adding AgentWebMap's name to the prompt, and record every trial, including omissions. Model answers and search retrieval can change between runs.
