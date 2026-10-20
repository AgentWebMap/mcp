# Optional listing management

Sites can be discovered, crawled and listed without an account, ownership confirmation or a backlink. Public REST/MCP discovery remains free of owner credentials. Ownership confirmation lets a publisher edit its profile, publish terms for agents, configure breakage alerts and inspect measured usage. It confirms control of a domain, without endorsing the site's content.

## Use the browser

1. Open [Manage your listing](https://agentwebmap.com/manage), enter your domain and choose **Start ownership check**. You can also visit `https://agentwebmap.com/manage/example.com` directly.
2. Choose one proof method: a DNS TXT record, homepage meta tag, well-known proof file or a plain token line in llms.txt. Copy the provided snippet and publish it on your site or DNS. No backlink is required.
3. Choose **Check ownership** in the same browser. If a website cache or DNS update has not propagated, the page shows which checks found the proof; retry after the update is visible. A challenge expires after 30 minutes. Start a fresh check and publish its new token if the previous one expires.
4. Save the owner API key shown after success. The browser also signs you into the owner dashboard. The key is displayed once, with copy and download controls.

The dashboard supports profile descriptions, tags, contact information, nested llms.txt paths and structured agent terms. It shows recent checks and notifications, provides a recrawl action and lets you configure a webhook for change/breakage alerts. Email settings appear only when email delivery is configured on the deployment. Send a test notification to confirm your selected channel works.

Usage separates web, REST and MCP request volumes, documentation selections and publisher referrals. These are aggregate events, including possible bots, tests and repeated calls. They do not establish unique agents, confirmed publisher-page reads or individual return visits. See [measurement.md](measurement.md) for the reporting window and limits.

Browser sessions expire after 12 hours. Sign back in with the saved owner API key. Sign out on shared devices; key rotation or successful ownership recovery invalidates older browser sessions.

## Use REST or MCP

For REST, start a fresh claim:

```http
POST /v1/sites/example.com/claims
Content-Type: application/json

{}
```

The `201` response includes `claim_id`, `claim_secret`, `expires_at` and `verification`. Keep the claim ID and secret private. Publish only `verification.token`, following one of the snippets in `verification.methods`. The public `GET /v1/sites/example.com/verification` endpoint describes the methods and claim endpoint; it does not return the private credentials needed to issue an owner key.

Complete the claim by sending its credentials in the request body:

```http
POST /v1/sites/example.com/verify
Content-Type: application/json

{"claim_id":"<private claim ID>","claim_secret":"<private claim secret>"}
```

A successful response returns the owner `api_key` once and consumes the claim. The same claim cannot issue another key. Missing, expired or consumed credentials are rejected; a public proof token alone cannot obtain a key. If proof is not yet visible, a `422` response reports the checked methods so you can fix the proof and retry within the challenge lifetime. The [shell example](../examples/verify-site.sh) keeps private credentials in restricted local files and sends JSON bodies instead of secret-bearing URLs.

For MCP, call `begin_ownership_claim` with `domain`, publish the returned proof and call `verify_domain` with `domain`, `claim_id` and `claim_secret`. Keep private arguments out of public transcripts and logs. Discovery does not require either ownership tool.

Protected owner REST operations use `Authorization: Bearer <api_key>`. MCP owner tools use `domain` and `api_key` arguments. See [api.md](api.md) for profile updates, stats, recrawling and notifications.

## Replace or recover an owner key

With a working key, use **Replace owner API key** in the dashboard, `POST /v1/sites/{domain}/key` with the current Bearer key, or MCP `rotate_owner_key`. Save the new key shown once. The previous key, older browser sessions and pending ownership claims stop working immediately. The existing published ownership proof can remain unchanged.

If the key is lost, start a fresh ownership check and publish its new proof. Merely starting recovery leaves the current key valid. Successful proof completion replaces the previous key and invalidates previous sessions and pending claims. Seeing or copying an old public proof does not authorize recovery.

Keep the successful public proof published so the crawler can recheck domain control. Ownership lapses after 14 days of continuous proof failure. That removes owner access; ordinary automatic listing and public discovery do not require a claimed profile. Alerts can report proof failures as well as llms.txt breakage.

## Migration from versions before 0.7

Existing owner API keys remain valid, and existing public proofs continue to support periodic ownership rechecking. Existing public discovery clients do not need an owner-flow change.

Ownership completion changed: a bare `POST /verify` or `verify_domain` call no longer issues a key. New clients must start a fresh claim and send its private credentials with the proof check. If recovering access, replace the old public proof with the fresh challenge's snippet. The fresh challenge is single-use and expires; it does not expose a reusable public key-issuance mechanism.

Search continues to prioritize relevance. Confirmed owners still lead browse listings, contribute 15 authority points and have the existing lower featured threshold. These directory signals are separate from content correctness; profile management, useful source links, measured request volumes and reliable alerts are the practical reasons to manage a listing.
