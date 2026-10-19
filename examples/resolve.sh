#!/usr/bin/env sh
# Best source for a domain or a topic, in one call.
#   sh resolve.sh stripe.com
#   sh resolve.sh "payments api"
q=$(printf '%s' "$1" | sed 's/ /+/g')
curl -s "https://agentwebmap.com/v1/resolve?q=$q"
