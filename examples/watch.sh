#!/usr/bin/env sh
# Watch a domain: get a signed JSON POST when its llms.txt changes or breaks.
#   sh watch.sh modelcontextprotocol.io https://your-endpoint.example/hooks/agentwebmap
set -e
curl -s -X POST https://agentwebmap.com/v1/watch \
  -H "content-type: application/json" \
  -d "{\"domain\": \"$1\", \"webhook_url\": \"$2\"}"
echo
echo "Keep the secret: it signs every delivery (see docs/webhooks.md) and is needed to test or unsubscribe:"
echo "  curl -X POST https://agentwebmap.com/v1/watch/<id>/test -H 'authorization: Bearer <secret>'"
echo "  curl -X DELETE https://agentwebmap.com/v1/watch/<id>    -H 'authorization: Bearer <secret>'"
