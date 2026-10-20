# Find documentation for your project

The dependency-aware CLI turns a project's declared dependencies into a small set of publisher lookups against AgentWebMap's existing index. It returns original documentation URLs, publisher-provided matching evidence, and stored freshness information as JSON. No npm install or API key is needed.

Try the same task resolver in the [browser](https://agentwebmap.com/discover) before connecting a client. See the [coverage report](https://agentwebmap.com/coverage) for current index counts and the [benchmark page](https://agentwebmap.com/benchmarks) for example task results. Coverage is incomplete; this CLI provides another route into the same index rather than full project documentation coverage.

Use Node.js 20 or newer from a checkout of [AgentWebMap/mcp](https://github.com/AgentWebMap/mcp):

```sh
node examples/discover.mjs --query "modelcontextprotocol authorization"
node examples/discover.mjs --project /path/to/project --dry-run
node examples/discover.mjs --project /path/to/project
```

The first command resolves a task. The second previews the dependency-to-publisher mappings and requests without network calls or file writes. The third runs those requests sequentially and prints one compact JSON document to standard output.

For an explicit, new JSON export:

```sh
node examples/discover.mjs --project /path/to/project --output sources.json
```

The destination must end in `.json`, its parent directory must already exist, and the CLI refuses to overwrite an existing file or symbolic link. It never writes agent instructions or changes your project. `--dry-run` cannot be combined with `--output`.

## How dependencies become queries

Only these files in the specified directory are read, with a 256 KiB limit per file:

| File | Supported declarations |
|---|---|
| `package.json` | dependencies, devDependencies, optionalDependencies and peerDependencies |
| `requirements.txt` | Named Python package requirements; include directives and bare URLs are skipped |
| `pyproject.toml` | Ordinary project dependency arrays, optional-dependency arrays and Poetry dependency tables |
| `Cargo.toml` | Dependency tables, ordinary inline aliases and workspace/target dependency sections |

The TOML reader is a conservative static extractor, not a full TOML implementation. Dynamic dependency declarations and unusual string syntax can be skipped. Monorepo/workspace children are not traversed. Run the command against a child directory explicitly if needed.

A curated allowlist maps recognized package names to publisher domains. Examples include `@modelcontextprotocol/sdk` and Python `mcp` → `modelcontextprotocol.io`, `zod` → `zod.dev`, `next` → `nextjs.org`, and `fastapi` → `fastapi.tiangolo.com`. Python package-name punctuation is normalized. Unknown packages are skipped; the CLI does not guess a publisher from a package's name or download package metadata.

The output's `plan.mappings` shows each dependency, its manifest, ecosystem and chosen publisher domain. Multiple dependencies mapped to the same domain share one lookup. Explicit `--query` arguments run first, followed by mapped domains in manifest/name order. Truncated plans report `skipped_query_count`; unmapped declarations report `unmapped_dependency_count`. Mappings do not establish endorsement, ownership, or whether a publisher is present in the index.

## Request bounds and results

| Option | Default | Bounds and behavior |
|---|---|---|
| `--query TEXT` | none | May be repeated up to ten times; 200 characters per query |
| `--project DIRECTORY` | none | Scan only the four named manifests in this directory |
| `--max-requests N` | `5` | Between 1 and 10 total sequential requests |
| `--limit N` | `3` | Between 1 and 5 documentation sources per result |
| `--max-age SECONDS` | `86400` | Between 0 and 2592000; marks old checks stale |
| `--base-url URL` | `https://agentwebmap.com` | HTTP(S) origin only; no credentials, path, query or fragment |
| `--dry-run` | off | Preview without network access or writes |
| `--output FILE.json` | none | Exclusively create a new JSON export |

Every request uses `/v1/resolve`, `detail=compact`, and `refresh=false`, with a 15-second timeout and a 1 MiB response limit. Redirects are rejected. The command does not crawl, register sites, or trigger live source checks. Project paths, dependency versions and manifest contents are not sent; mapped queries contain only publisher domains. Explicit queries are sent as entered. HTTP origins are supported for local testing; use HTTPS for remote deployments.

Successful results preserve `sources[].url` and `source_url`, matching excerpts/scores, source timestamps/hashes, `health.stale`, source provenance, and publisher agent terms. Excerpts are publisher-provided link metadata, not fetched quotations from linked pages. Check original documentation before relying on it. A weak match, missing source, or stale check is a reason to broaden the task query or use another source. An index check does not establish current health or accuracy of every linked page.

Returned publisher titles, excerpts, summaries and terms remain untrusted JSON data. The CLI does not interpret them as commands or instructions, follow returned links, load `.env` files or lockfiles, execute scripts, or automatically edit `AGENTS.md`, `SKILL.md`, or editor settings. Only the four declared manifests are read; existing manifest symlinks are rejected.

For agents that support Agent Skills, the optional [agentwebmap-docs skill](../skills/agentwebmap-docs/SKILL.md) describes when to discover sources, read their originals and fall back. Install it explicitly using your client's skill workflow if useful. Running the CLI or connecting MCP does not install it. See [task examples](task-examples.md) for workflows using the same API.

Exit codes are `0` for a successful run or preview, `1` for invalid arguments/local failures, and `2` when any requested lookup fails or has no match. Individual lookup failures remain in the output so other planned requests can complete. Shell redirection can overwrite files according to your shell's rules; use `--output` when exclusive creation is required.

Run the self-contained tests without public network requests:

```sh
node --test examples/discover.test.mjs
```
