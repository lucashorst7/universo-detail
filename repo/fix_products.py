#!/usr/bin/env python3
"""Fix specific unmatched products by directly fetching known Polibox product IDs."""
import json
import sys
import os
sys.path.insert(0, '/tmp/cc-agent/68779494/project')
from fetch_polibox import fetch_product_details, extract_product_info, strip_html

# Products to fix: (db_id, name, polibox_id)
FIXES = [
    # Product 14: Aromatizante Air Freshner Niponitos Samurai Soft 99 -> ID 6682
    ("3471e5f6-5643-446f-b5d3-ab66207d2dbe", "Aromatizante Air Freshner Niponitos Samurai Soft 99", "6682"),
    # Product 21: Finisherfresh Summer Spartan 5L -> ID 6658
    ("1d7182dd-e7d3-43f0-ae76-ab0cb71c5f93", "Finisherfresh Summer Odorizador para Tecidos Spartan 5 Litros Diluicao ate 1 10", "6658"),
]

# Read existing results
results = {}
with open('/tmp/fetched_details4.jsonl') as f:
    for line in f:
        d = json.loads(line)
        results[d['db_id']] = d

# Apply fixes
for db_id, name, polibox_id in FIXES:
    print(f"Fixing: {name} -> Polibox ID {polibox_id}", file=sys.stderr)
    details = fetch_product_details(polibox_id)
    if details:
        info = extract_product_info(details)
        results[db_id] = {
            'db_id': db_id,
            'name': name,
            'polibox_id': polibox_id,
            'polibox_name': details.get('name', ''),
            'match_score': 1.0,
            'description': info['description'] if info else None,
            'short_description': info['short_description'] if info else None,
            'usability': info['usability'] if info else None,
            'tips': info['tips'] if info else None,
            'specifications': info['specifications'] if info else {},
        }
        print(f"  ✓ Fixed: desc={'yes' if results[db_id]['description'] else 'no'}, specs={len(results[db_id]['specifications'])}", file=sys.stderr)
    else:
        print(f"  ✗ Could not fetch details for ID {polibox_id}", file=sys.stderr)

# Write back all results in original order
import json
with open('/tmp/cc-agent/68779494/project/products_no_id.json') as f:
    products = json.load(f)

with open('/tmp/fetched_details4.jsonl', 'w') as f:
    for product in products:
        db_id = product['id']
        if db_id in results:
            f.write(json.dumps(results[db_id], ensure_ascii=False) + '\n')
        else:
            f.write(json.dumps({
                'db_id': db_id,
                'name': product['name'],
                'polibox_id': None,
                'description': None,
                'short_description': None,
                'usability': None,
                'tips': None,
                'specifications': {},
                'error': 'not_processed'
            }, ensure_ascii=False) + '\n')

print("\n✅ Fixes applied!", file=sys.stderr)
