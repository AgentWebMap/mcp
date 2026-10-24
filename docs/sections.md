# Explore publisher headings and related websites

[Explore](https://agentwebmap.com/explore) is an interactive viewer of the headings publishers include in their llms.txt files. Pick a topic, follow a connection, and open the matching websites. New headings join the catalogue as files are indexed.

People can navigate visually or use topic search and lists. Agents can use the same public catalogue through REST and MCP. Public discovery needs no account or API key.

## Use the viewer

- Click a heading to focus it, then choose **See websites**.
- Open a publisher to inspect its headings and related sites.
- Open **Layers** for shared headings, related meanings and emerging highlights.
- Open **Filters** to choose a country or inferred action, or combine topics with all/any matching.
- Shift-click to combine up to five headings. Use Back, All topics or your browser's Back button to return.

Topic details, website lists and controls open when selected. The scene's positions help navigation; they do not establish business relationships or a ranking of publishers.

## Understand the layers

| Layer | What it shows |
| --- | --- |
| Shared headings, teal | Websites actually publish the same indexed heading keys |
| Related meanings, violet | Inferred similarities between heading labels or publisher descriptions |
| Emerging, amber | Qualifying headings newly observed and growing within this index |

Shared headings and related meanings are separate signals. Similar wording does not add a publisher to a heading or widen a filter. Common platform templates can influence the connections; inspect the underlying websites before interpreting a commercial relationship.

## Discover heading keys first

```sh
curl 'https://agentwebmap.com/v1/sections?sort=common&per_page=20'
```

MCP equivalent: `list_sections` with `sort: "common"` and `per_page: 20`.

The catalogue returns keys, labels, distinct-site counts and coverage. Sort options are `common`, `alphabetical`, `newest` and `emerging`; `q` searches heading prefixes. Use returned keys rather than guessing labels. Original heading evidence is retained in full publisher details.

## Explore connections programmatically

```sh
curl 'https://agentwebmap.com/v1/section-graph?sections=services&connections=semantic&include_sites=false'
```

First confirm `services` is present in the current catalogue. REST uses comma-separated `sections`; MCP `explore_sections` accepts an array. Use `section_match=all` for websites containing every selected heading or `any` for at least one.

`connections=shared` is the default. `connections=semantic` includes separately labelled `semantic_edges`. `include_sites=false` requests the connections without a publisher result page.

Counts reflect distinct eligible sites, so repeating a heading within one file does not multiply its site count. Semantic-neighbor counts can describe their own matching publishers independently of the current section selection; retain node metadata when displaying the response.

## Start from a publisher

Open [Cloudflare in the viewer](https://agentwebmap.com/explore?publisher=cloudflare.com), or use:

```sh
curl 'https://agentwebmap.com/v1/similar/cloudflare.com?limit=6'
```

MCP equivalent: `similar_sites` with `domain: "cloudflare.com"` and `limit: 6`.

Results include related publishers and actual shared headings where available. If similarity information is unavailable, `available=false` and a reason explain the state. Similarity is a discovery suggestion, not affiliation, endorsement or proof of equivalent capabilities. Profile pages distinguish semantic related sites from a broader category fallback.

## Filter consistently

Catalogue, graph, search and listing operations support country/action filters. Related-publisher discovery also accepts `country` and `action`. For example, `country=FR` or `country=unknown` can narrow the view; `action=read_docs` can narrow it to an inferred use.

`sites` counts and matching publishers respect selected filters. Global totals, seven-day changes and emergence dates remain index-wide context. Country evidence is labelled and can come from published addresses, owner declarations, domain suffixes or hosting. [Country and action reference](https://agentwebmap.com/docs#countries).

## Coverage

The catalogue covers currently eligible publishers with indexed heading evidence. Partial or older records can be incomplete. An absent heading does not establish that a website lacks a topic. Emerging means observed in this index, not necessarily newly published across the web.

A heading describes content. It does not certify a working API, booking flow, job application endpoint or another executable action.

[Live documentation](https://agentwebmap.com/docs#sections) · [API reference](api.md) · [Current statistics](https://agentwebmap.com/stats)
