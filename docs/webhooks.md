# Webhooks: owner alerts and watches

Two things send webhooks: a verified owner's `webhook_url` (set with `PATCH /v1/sites/{domain}`) and any agent's watch on a domain (`POST /v1/watch`). Same payload, same signature scheme.

## Events

| Event | Meaning |
|---|---|
| `llms_txt_changed` | The file's content changed |
| `llms_txt_broken` | The file no longer validates |
| `llms_txt_restored` | It validates again |
| `llms_full_txt_missing` | llms-full.txt is no longer served |
| `verification_failing` | Ownership proof not found; verification lapses after 14 days |
| `verification_ok` | Proof found again |
| `verification_lapsed` | Verification lapsed; the listing is no longer verified |
| `tier_changed` | Listing tier changed |
| `test` | Sent on request |

Each event is sent at most once a day per domain to the owner; watches get every occurrence.

## Payload

JSON POST, `Content-Type: application/json`:

```json
{
  "event": "llms_txt_broken",
  "message": "llms.txt no longer validates",
  "detail": "HTTP 404, status invalid",
  "domain": "example.com",
  "status": "invalid",
  "tier": null,
  "authority": null,
  "verified": true,
  "llms_txt": null,
  "checked_at": "2026-10-19T14:02:11.000Z",
  "lookup": "https://agentwebmap.com/v1/domain/example.com",
  "page": "https://agentwebmap.com/domain/example.com",
  "watch_id": 12
}
```

`watch_id` is present on watch deliveries only.

## Headers

| Header | Value |
|---|---|
| `X-AgentWebMap-Event` | the event name |
| `X-AgentWebMap-Watch` | the watch id (watch deliveries only) |
| `X-AgentWebMap-Signature` | `sha256=` + HMAC-SHA256 of the raw request body, keyed with your secret, hex |
| `User-Agent` | `agentwebmap-bot/…` |

Redirects are not followed. Any 2xx counts as delivered. Ten consecutive failures switch a watch off; owner webhooks keep being retried on later events.

## Verifying the signature

Node.js:

```js
import crypto from 'node:crypto';

export function verify(rawBody, signatureHeader, secret) {
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return expected.length === signatureHeader.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}
```

Python:

```python
import hmac, hashlib

def verify(raw_body: bytes, signature_header: str, secret: str) -> bool:
    expected = "sha256=" + hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header)
```

Always compute the HMAC over the raw bytes you received, before any JSON parsing.
