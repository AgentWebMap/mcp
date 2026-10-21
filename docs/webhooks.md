# Listing health and notifications

Public domain watches and outbound owner email/webhook notifications were retired. Older references to `watch_domain`, `unwatch_domain`, `test_watch`, `test_notification` and `/v1/watch` describe removed interfaces. Historical watch examples in this repository should not be used with the current service.

For current listing health and activity, [verify your domain and open the owner dashboard](https://agentwebmap.com/manage). It provides file health, daily measured discovery activity, score history and an on-demand recheck.

Authenticated owners can also use `GET /v1/sites/{domain}/stats` or MCP `site_stats`. Request a fresh check through the dashboard, `POST /v1/sites/{domain}/recrawl`, or MCP `recrawl_site`.

[Current API reference](https://agentwebmap.com/docs) · [Ownership guide](ownership.md) · [Contact Agent Web Map](https://agentwebmap.com/contact)
