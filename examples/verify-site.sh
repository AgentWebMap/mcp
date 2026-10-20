#!/usr/bin/env sh
# Optional ownership flow for a site you control; requires curl and Node.js.
# Easiest: open https://agentwebmap.com/manage in your browser instead.
#   sh examples/verify-site.sh example.com
# Private claim credentials stay in restricted files, never URL parameters.
set -eu
umask 077

if [ "$#" -ne 1 ]; then
  echo "Usage: sh verify-site.sh example.com" >&2
  exit 1
fi
command -v node >/dev/null 2>&1 || { echo 'Node.js is required.' >&2; exit 1; }
command -v curl >/dev/null 2>&1 || { echo 'curl is required.' >&2; exit 1; }
d="$1"
node -e 'if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(process.argv[1])) process.exit(1)' "$d" || {
  echo 'Use a lowercase hostname without a scheme, path or query.' >&2
  exit 1
}

work_dir=$(mktemp -d "${TMPDIR:-/tmp}/agentwebmap-owner.XXXXXX")
claim_file="$work_dir/claim.json"
request_file="$work_dir/verify-request.json"
response_file="$work_dir/verify-response.json"
echo "Starting an optional ownership check for $d. Private working directory: $work_dir"
curl --silent --show-error --fail-with-body --max-time 60 \
  --request POST "https://agentwebmap.com/v1/sites/$d/claims" \
  --header 'content-type: application/json' --data '{}' --output "$claim_file"

node --input-type=module - "$claim_file" "$request_file" <<'NODE'
import fs from 'node:fs';
const claim = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
if (!claim.claim_id || !claim.claim_secret || !claim.verification?.token) throw new Error('No claim credentials returned');
fs.writeFileSync(process.argv[3], JSON.stringify({ claim_id: claim.claim_id, claim_secret: claim.claim_secret }), { mode: 0o600 });
console.log('Publish ONE of these public proof snippets (no backlink required):');
for (const method of claim.verification.methods) console.log(`\n${method.method}:\n${method.snippet}`);
console.log(`\nThis check expires at ${claim.expires_at}. Keep the private working files out of logs and source control.`);
NODE

printf '\nAfter publishing the proof, press Enter to check ownership: '
read -r answer
if ! curl --silent --show-error --fail-with-body --max-time 120 \
  --request POST "https://agentwebmap.com/v1/sites/$d/verify" \
  --header 'content-type: application/json' --data-binary "@$request_file" --output "$response_file"; then
  echo "Proof is not confirmed. The private response is in $response_file." >&2
  echo 'Inspect its checked methods. Retry the same JSON body before expiry, or start a fresh challenge.' >&2
  exit 1
fi

node --input-type=module - "$response_file" "$work_dir" "$claim_file" "$request_file" <<'NODE'
import fs from 'node:fs';
import path from 'node:path';
const result = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
if (!result.verified || !result.api_key) throw new Error('No owner key returned');
const keyFile = path.join(process.argv[3], 'owner-key.txt');
fs.writeFileSync(keyFile, result.api_key + '\n', { mode: 0o600, flag: 'wx' });
for (const file of [process.argv[2], process.argv[4], process.argv[5]]) fs.unlinkSync(file);
console.log(`Ownership confirmed. Save the key from this private file in a password manager: ${keyFile}`);
console.log(`Manage your listing: https://agentwebmap.com/manage/${result.domain}`);
console.log('The claim is consumed. Existing keys and sessions were replaced; the successful public proof should stay published.');
NODE
