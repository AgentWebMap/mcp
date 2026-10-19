"""Best source for a domain or a topic, with what to read and the owner's terms.

    python resolve.py stripe.com
    python resolve.py "payments api"
"""
import json, sys, urllib.parse, urllib.request

q = sys.argv[1] if len(sys.argv) > 1 else "stripe.com"
with urllib.request.urlopen("https://agentwebmap.com/v1/resolve?q=" + urllib.parse.quote(q)) as r:
    data = json.load(r)

best = data.get("best")
if not best:
    print("nothing found;", data.get("suggest"))
    sys.exit(1)

print(best["domain"], "|", best["tier"], best["authority"], "| verified" if best["verified"] else "")
print("read:", data["read"]["llms_txt"], data["read"]["llms_full_txt"] or "")
print("terms:", data["terms"] or "not stated")
print("health:", data["health"])
for alt in data["alternatives"]:
    print("  also:", alt["domain"], alt["authority"])
