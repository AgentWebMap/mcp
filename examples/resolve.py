"""Find documentation sources with publisher evidence, terms and freshness.

    python resolve.py modelcontextprotocol.io
    python resolve.py "modelcontextprotocol authorization" --max-age 3600
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("query", nargs="?", default="modelcontextprotocol.io")
parser.add_argument("--base-url", default=os.getenv("AGENTWEBMAP_BASE_URL", "https://agentwebmap.com"))
parser.add_argument("--max-age", type=int, default=86400)
parser.add_argument("--refresh", action="store_true")
args = parser.parse_args()
query = urllib.parse.urlencode({"q": args.query, "detail": "compact", "limit": 3,
                                "max_age": args.max_age, "refresh": str(args.refresh).lower()})
try:
    with urllib.request.urlopen(args.base_url.rstrip("/") + "/v1/resolve?" + query, timeout=30) as response:
        data = json.load(response)
except urllib.error.HTTPError as error:
    print("resolve failed:", error.code, error.read().decode("utf-8", errors="replace"), file=sys.stderr)
    sys.exit(1)
except urllib.error.URLError as error:
    print("request failed:", error.reason, file=sys.stderr)
    sys.exit(1)

best = data.get("best")
if not best:
    print("nothing found;", data.get("suggest"))
    sys.exit(1)

print(best["domain"], "| match:", data.get("match", {}).get("strength", "not stated"))
for source in data.get("sources", []):
    print("source:", source["url"])
    print("  title:", source.get("title", ""))
    print("  evidence from", source.get("source_url", "llms.txt"), ":", source.get("excerpt", ""))
    print("  checked:", source.get("checked_at"))
print("read:", data.get("read"))
print("terms:", data.get("terms") or "unknown")
print("health:", data.get("health"))
if data.get("health", {}).get("stale") or not data.get("sources") or data.get("match", {}).get("strength") == "weak":
    print("Check the original documentation or fall back to official search; evidence is stale, absent or weak.")
