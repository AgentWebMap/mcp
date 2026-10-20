#!/usr/bin/env sh
# Documentation sources for a domain or task, in one call.
#   sh resolve.sh modelcontextprotocol.io
#   sh resolve.sh "modelcontextprotocol authorization"
set -eu
q=${1:-modelcontextprotocol.io}
base_url=${AGENTWEBMAP_BASE_URL:-https://agentwebmap.com}
curl --silent --show-error --fail-with-body --get "${base_url%/}/v1/resolve" \
  --data-urlencode "q=$q" \
  --data-urlencode "detail=compact" \
  --data-urlencode "limit=3" \
  --data-urlencode "max_age=86400"
