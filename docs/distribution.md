# Describe and evaluate AgentWebMap

AgentWebMap helps AI agents find relevant publisher documentation through an existing llms.txt index. Distribution should make that task easy to try, show evidence of usefulness and clearly state where coverage ends.

## Ready listing description

**Name:** Agent Web Map

**Short description:** An llms.txt directory for AI agents: find documentation, explore related websites and save useful sources.

**Description:** Agent Web Map discovers and validates websites publishing llms.txt. Search for a publisher or task, inspect original source links and check dates, or explore shared headings and related publishers in the interactive point cloud. Country, topic and inferred-action filters work across the website and public tools. Agents connect through a free JSON API or hosted MCP server without a public-read key. People can save favorites and private collections in an optional workspace. Verified owners can manage their listing and review file health and measured discovery activity. Read the original publisher pages when using a result.

**Links:**

- Try a task: [live homepage lookup](https://agentwebmap.com/#task-discovery)
- Interactive relationships: [point cloud](https://agentwebmap.com/explore)
- Public starting points: [curated collections](https://agentwebmap.com/collections)
- Website search: [agentwebmap.com/browse](https://agentwebmap.com/browse)
- Client setup, docs and examples: [github.com/AgentWebMap/mcp](https://github.com/AgentWebMap/mcp)
- MCP endpoint: `https://agentwebmap.com/mcp`
- Free REST API: [agentwebmap.com/v1](https://agentwebmap.com/v1)
- Current index counts: [statistics page](https://agentwebmap.com/stats)
- Reproducible evaluation: [benchmark report](https://github.com/AgentWebMap/mcp/blob/main/benchmarks/README.md), [runner and task dataset](../benchmarks/README.md)
- Official project account: [x.com/AgentWebMap](https://x.com/AgentWebMap)

Listing a publisher means its public file was discovered. It does not imply partnership, participation or endorsement. Ownership confirmation establishes domain control, not technical accuracy. A publisher-declared MCP endpoint does not establish availability or protocol compatibility.

## Manual adoption steps

1. **Try one real task.** Use [discovery](https://agentwebmap.com/browse) or the free API with a publisher and task, such as `modelcontextprotocol authorization`. Read the returned original page and record whether it answered the question. Include failures and fallback steps.
2. **Connect an existing client.** Follow the [MCP setup](../README.md#add-it) for Codex, Claude Code, Cursor or VS Code. Then repeat the real task and verify that the client actually called the tool. Tool availability alone is not usage.
3. **Try a project workflow.** Preview the [dependency-aware CLI](discovery-cli.md), inspect its mappings and run the bounded lookups. Install the [optional discovery skill](../skills/agentwebmap-docs/SKILL.md) only when its workflow suits the project.
4. **Keep existing distribution surfaces accurate.** Use the same description and endpoint on the GitHub repository, organization profile, existing MCP Registry entry and official X account. Link to the task demo, dated coverage and evaluation evidence instead of relying on a directory count alone.
5. **Collect reproducible feedback.** Open an [issue](https://github.com/AgentWebMap/mcp/issues) with the query, relevant response fields, expected publisher/page and whether the original page solved the task. Remove private project details and credentials before posting.

These are manual steps using existing project channels. No additional npm package, agent marketplace installation, partnership or third-party endorsement is implied.

## Separate visibility from successful use

Use a fixed, unbranded prompt when checking whether an AI service independently discovers the project:

> Are you aware of any websites or platforms that index websites with llms.txt and what those sites offer to AI agents?

For each run, record the date, platform/model when shown, exact prompt, whether Search or Deep Research was enabled, and links to cited sources. Keep three outcomes separate: a project mention, a cited link, and a successful API/MCP call for a real task. Search retrieval, model knowledge and configured tools can produce different results. Repeat a small consistent sample; a single answer does not establish general visibility.

Do not promise inclusion in ChatGPT or another AI's recommendations. Readable pages, useful evidence and clear AgentWebMap setup instructions improve the information available to consumers; those services still choose their own sources and tools.
