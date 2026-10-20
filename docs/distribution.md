# Describe and evaluate AgentWebMap

AgentWebMap helps AI agents find relevant publisher documentation through an existing llms.txt index. Distribution should make that task easy to try, show evidence of usefulness and clearly state where coverage ends.

## Ready listing description

**Name:** AgentWebMap

**Short description:** Find publisher documentation through a free llms.txt discovery API and MCP server.

**Description:** AgentWebMap indexes websites publishing llms.txt and resolves domains or development tasks into original documentation URLs, publisher-provided matching evidence and stored freshness information. Public reads require no API key. Agents can connect through Streamable HTTP MCP or REST; a dependency-aware Node.js CLI previews recognized package-to-publisher mappings before requesting sources. Optional change notifications and owner-managed listings support ongoing use. Coverage is incomplete, and consumers should read original pages and fall back when evidence is missing, weak or stale.

**Links:**

- Website and task demo: [agentwebmap.com/discover](https://agentwebmap.com/discover)
- Client setup, docs and examples: [github.com/AgentWebMap/mcp](https://github.com/AgentWebMap/mcp)
- MCP endpoint: `https://agentwebmap.com/mcp`
- Free REST API: [agentwebmap.com/v1](https://agentwebmap.com/v1)
- Current index counts: [coverage report](https://agentwebmap.com/coverage)
- Reproducible evaluation: [benchmark report](https://agentwebmap.com/benchmarks), [runner and task dataset](../benchmarks/README.md)
- Official project account: [x.com/AgentWebMap](https://x.com/AgentWebMap)

Listing a publisher means its public file was discovered. It does not imply partnership, participation or endorsement. Ownership confirmation establishes domain control, not technical accuracy. A publisher-declared MCP endpoint does not establish availability or protocol compatibility.

## Manual adoption steps

1. **Try one real task.** Use [discovery](https://agentwebmap.com/discover) or the free API with a publisher and task, such as `modelcontextprotocol authorization`. Read the returned original page and record whether it answered the question. Include failures and fallback steps.
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
