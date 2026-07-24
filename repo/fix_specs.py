#!/usr/bin/env python3
"""
Fix specifications extraction - remove false positives and re-extract
with stricter patterns.
"""
import json
import re
import sys

def extract_specifications_strict(text):
    """Extract specifications with strict patterns to avoid false positives."""
    specs = {}
    if not text:
        return specs

    # Strict patterns - require the label to be at start of line or preceded by newline
    # Pattern: (?:^|\n)\s*Label\s*[:\-]\s*value
    patterns = {
        'pH': r'(?:^|\n)\s*(?:pH|PH)\s*[:\-]\s*([0-9]+[.,]?[0-9]*(?:\s*[-–]\s*[0-9]+[.,]?[0-9]*)?)',
        'Diluição': r'(?:^|\n)\s*(?:Dilui[çc][ãa]o|Dilui[cç][aã]o)\s*[:\-]\s*([^\n]+)',
        'Volume': r'(?:^|\n)\s*(?:Volume|Conte[úu]do)\s*[:\-]\s*([^\n]+)',
        'Tipo': r'(?:^|\n)\s*Tipo\s*[:\-]\s*([^\n]+)',
        'Marca': r'(?:^|\n)\s*Marca\s*[:\-]\s*([^\n]+)',
        'Peso': r'(?:^|\n)\s*Peso\s*[:\-]\s*([^\n]+)',
        'Cor': r'(?:^|\n)\s*Cor\s*[:\-]\s*([^\n]+)',
        'Fragrância': r'(?:^|\n)\s*(?:Fragr[âa]ncia|Aroma|Ess[êe]ncia)\s*[:\-]\s*([^\n]+)',
        'Composição': r'(?:^|\n)\s*Composi[çc][ãa]o\s*[:\-]\s*([^\n]+)',
        'Embalagem': r'(?:^|\n)\s*Embalagem\s*[:\-]\s*([^\n]+)',
    }

    for key, pat in patterns.items():
        match = re.search(pat, text, re.IGNORECASE | re.MULTILINE)
        if match:
            val = match.group(1).strip()
            # Clean up the value
            val = re.sub(r'\s+', ' ', val)
            # Skip if value is too long (likely a false positive)
            if len(val) > 100:
                continue
            # Skip if value contains sentence-like patterns
            if re.search(r'\b(?:permite|deixando|retorna|devolve|garante|proporciona)\b', val, re.IGNORECASE):
                continue
            if val:
                specs[key] = val

    # Also look for patterns like "pH 7,5" without colon
    if 'pH' not in specs:
        ph_match = re.search(r'(?:^|\n)\s*(?:pH|PH)\s+([0-9]+[.,]?[0-9]*)', text, re.IGNORECASE)
        if ph_match:
            val = ph_match.group(1).strip()
            if val and len(val) < 20:
                specs['pH'] = val

    # Look for dilution patterns like "Diluição: Até 1:400" or "Diluição até 1:50"
    if 'Diluição' not in specs:
        dil_match = re.search(r'(?:^|\n)\s*(?:Dilui[çc][ãa]o|Dilui[cç][aã]o)\s*(?:at[ée]\s*)?([0-9]+:[0-9]+)', text, re.IGNORECASE)
        if dil_match:
            val = f"Até {dil_match.group(1)}"
            specs['Diluição'] = val

    # Look for "Conteúdo da embalagem:" pattern
    if 'Volume' not in specs:
        vol_match = re.search(r'(?:^|\n)\s*Conte[úu]do\s+da\s+embalagem\s*[:\-]\s*([^\n]+)', text, re.IGNORECASE)
        if vol_match:
            val = vol_match.group(1).strip()
            if val and len(val) < 100:
                specs['Volume'] = val

    return specs


# Read all results
results = []
with open('/tmp/fetched_details4.jsonl') as f:
    for line in f:
        results.append(json.loads(line))

# Re-extract specifications for each product
for r in results:
    desc = r.get('description', '')
    if not desc:
        continue

    # Get strict specs from description
    new_specs = extract_specifications_strict(desc)

    # Keep API-provided properties (from product_data.properties) if any
    # These are stored in the original specs with exact property names
    old_specs = r.get('specifications', {})

    # Merge: API properties take precedence, then text-extracted
    merged = {**new_specs, **{k: v for k, v in old_specs.items() if k not in new_specs}}

    # Only keep specs with reasonable values
    clean_specs = {}
    for k, v in merged.items():
        v = v.strip() if v else ''
        if not v:
            continue
        # Skip values that look like sentence fragments
        if len(v) > 100:
            continue
        if re.search(r'\b(?:permite|deixando|retorna|devolve|garante|proporciona|superf[íi]cie)\b', v, re.IGNORECASE):
            continue
        clean_specs[k] = v

    r['specifications'] = clean_specs

# Write back
with open('/tmp/fetched_details4.jsonl', 'w') as f:
    for r in results:
        f.write(json.dumps(r, ensure_ascii=False) + '\n')

# Print stats
total = len(results)
has_specs = sum(1 for r in results if r.get('specifications'))
print(f"Has specifications: {has_specs}/{total}", file=sys.stderr)

# Show all specs
for r in results:
    specs = r.get('specifications', {})
    if specs:
        print(f"  {r['name'][:40]}: {specs}", file=sys.stderr)
