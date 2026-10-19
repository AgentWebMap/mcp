#!/usr/bin/env sh
# Register a site you control, then verify it once the token is in place.
#   sh verify-site.sh example.com
set -e
d="$1"
echo "1. Registering $d (the answer includes the token and the four ways to place it):"
curl -s -X POST https://agentwebmap.com/v1/sites -H "content-type: application/json" -d "{\"domain\": \"$d\"}"
echo
echo
echo "2. Place the token (easiest: add the llms.txt line from 'verification.methods[0].snippet'), then run:"
echo "   curl -X POST https://agentwebmap.com/v1/sites/$d/verify"
echo "   The answer carries your API key (shown once), the badge embed, and how to set up alerts."
