# Discover publisher sections and connections

[Explore sections](https://agentwebmap.com/explore) is an interactive cloud of headings extracted from indexed publisher files. Labels emerge from the corpus and continue growing as files are added or updated. There is no fixed list based on a handful of example sites.

For agents, the same catalogue and relationships are available through [the JSON API](https://agentwebmap.com/docs#sections) and [MCP](https://agentwebmap.com/docs#mcp).

The point cloud uses heading co-occurrence: an edge means distinct publishers share both labels. Heading extraction works independently of semantic-search embeddings and AI-inferred categories. The graph's visual distance is an approximate arrangement, not a measurement of meaning or a verified business relationship. [Try task discovery separately](https://agentwebmap.com/#task-discovery).

## Discover real labels first

Use [`GET /v1/sections?sort=common&per_page=20`](https://agentwebmap.com/v1/sections?sort=common&per_page=20), or call MCP `list_sections` with `sort: "common"` and `per_page: 20`.

Results include section keys and labels, distinct-site counts, first observation dates, seven-day membership changes and coverage. Other sort orders are `alphabetical` and `emerging`; `q` searches label prefixes. Emerging means first observed after the initial catalogue baseline, not necessarily newly published on the web.

Use returned keys in later calls. Different words are not automatically treated as synonyms. Normalization handles formatting and case while preserving original heading evidence.

## Explore relationships

[`GET /v1/section-graph`](https://agentwebmap.com/v1/section-graph) or MCP `explore_sections` without a selection returns aggregate section clusters and their connections. Select up to five returned section keys to reveal matching publishers and related labels.

- REST: `sections=FIRST_KEY,SECOND_KEY&section_match=all`.
- MCP: `sections: ["FIRST_KEY", "SECOND_KEY"]`, `section_match: "all"`.
- Use `section_match=any` for publishers carrying any selected label.
- Use `include_sites=false` when only aggregate connections are needed.

Edges count distinct eligible sites sharing both labels within the selection. Repeated headings on one site count once. Positions provide a visual arrangement, not a publisher ranking or affiliation claim.

## Filter publisher search

[Search](https://agentwebmap.com/docs#search), domain listing and Browse accept section filters alongside category, agentic and country filters. REST uses comma-separated keys; MCP `search_llms_registry` and `list_domains` accept arrays. Query the catalogue before choosing keys instead of inventing them.

The explorer, catalogue and graph also accept `country=FR` or `country=unknown`. MCP `list_sections` and `explore_sections` use the same `country` argument. Discover available codes with [`GET /v1/countries`](https://agentwebmap.com/v1/countries) or `list_countries`. Label `sites` counts, graph edges and publisher results respect the selected country. `total_sites`, seven-day changes, emergence dates and coverage remain global context. Country is inferred from domains or hosting, not verified headquarters or markets served. [Country reference](https://agentwebmap.com/docs#countries).

Compact publisher results include `section_keys`, `section_partial` and `section_indexed_at`. With `detail=full`, `section_headings` retains original labels, heading levels and hierarchy, source URLs, line evidence and parsing format. Line numbers may be absent for older link metadata.

## Coverage and access

Counts cover valid, listed, unblocked publishers and update as files, visibility and memberships change. Coverage identifies indexed, eligible and partial sites. Size-limited files and older metadata can provide incomplete evidence; an absent label does not establish that the publisher lacks that topic.

Public reads need no API key and have no automatic discovery usage quotas. Standard page and per-call bounds still apply. See [the live reference](https://agentwebmap.com/docs#sections) for current parameters and [current statistics](https://agentwebmap.com/stats) for the overall index.

A heading describes published content. It does not certify an API, booking flow, job application endpoint or any other executable action.
