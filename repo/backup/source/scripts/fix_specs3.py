#!/usr/bin/env python3
"""
Extract specifications from Polibox product names (which often contain
structured info like "(500ml)", "Diluição: Até 1:400", etc.)
and from the description with very strict patterns.
"""
import json
import re
import sys

def is_valid_spec_value(key, value):
    """Check if a specification value looks valid."""
    if not value or not value.strip():
        return False
    v = value.strip()
    if len(v) > 80:
        return False

    # Skip if contains sentence-like words
    false_positive_words = [
        'permite', 'deixando', 'retorna', 'devolve', 'garante', 'proporciona',
        'superfície', 'superficie', 'aplicação', 'aplicacao',
        'retamente', 'rer o risco', 'do com o grau', 'RETA DE APLICAÇÃO',
        'pinturas', 'vitificadores', 'encardidos', 'desejada',
        'excelente rendimento', 'acabamento',
        'diferença', 'diferenca', 'tradicional',
        'estiloso', 'energia', 'criativo', 'divertido',
        'estilo', 'moderno', 'leve',
        'resiste', 'altas temperaturas',
        'proteção', 'protecao',
        'transformar', 'experiência', 'experiencia',
    ]
    for word in false_positive_words:
        if word.lower() in v.lower():
            return False

    if key == 'pH':
        if not re.match(r'^[0-9]+[.,]?[0-9]*(\s*[-–]\s*[0-9]+[.,]?[0-9]*)?$', v):
            return False
    elif key == 'Diluição':
        if not re.search(r'[0-9]+:[0-9]+|pronto\s+uso|puro', v, re.IGNORECASE):
            return False
        if len(v) > 50:
            return False
    elif key == 'Volume':
        if not re.search(r'\d+\s*(?:ml|L|litro|litros|g|kg|cc|unid|und)', v, re.IGNORECASE):
            return False
    elif key == 'Tipo':
        if len(v) > 40 or v[0].islower():
            return False
    elif key == 'Marca':
        if len(v) > 30 or v[0].islower():
            return False
    elif key == 'Cor':
        if len(v) > 30 or v[0].islower():
            return False
        if re.search(r'\b(?:deix|retor|devol|garant|propor)\w*', v, re.IGNORECASE):
            return False
    elif key == 'Fragrância':
        if len(v) > 50 or v[0].islower():
            return False
        if re.search(r'\b(?:que|seu|sua|para|onde|qualquer|casa|carro|escrit[óo]rio)\b', v, re.IGNORECASE):
            return False
    elif key == 'Composição':
        if len(v) > 100:
            return False
    elif key == 'Peso':
        if not re.search(r'\d+\s*(?:g|kg|mg)', v, re.IGNORECASE):
            return False
    elif key == 'Embalagem':
        if len(v) > 50:
            return False

    return True


def extract_specs_from_polibox_name(polibox_name):
    """Extract specs from the Polibox product name."""
    specs = {}
    if not polibox_name:
        return specs

    # Volume: look for patterns like (500ml), (1,5 L), (5 Litros), (120ml), (100g)
    vol_match = re.search(r'\((\d+(?:[.,]\d+)?\s*(?:ml|L|litros?|g|kg|cc))\)', polibox_name, re.IGNORECASE)
    if vol_match:
        specs['Volume'] = vol_match.group(1).strip()

    # Diluição: look for "Diluição: Até 1:400" or "Diluição 1:50"
    dil_match = re.search(r'Dilui[çc][ãa]o\s*:?\s*(At[ée]\s*)?([0-9]+:[0-9]+)', polibox_name, re.IGNORECASE)
    if dil_match:
        prefix = "Até " if dil_match.group(1) else ""
        specs['Diluição'] = f"{prefix}{dil_match.group(2)}"

    # pH: look for "pH 7,5" or "pH: 6.5"
    ph_match = re.search(r'pH\s*[:\s]*([0-9]+[.,]?[0-9]*)', polibox_name, re.IGNORECASE)
    if ph_match:
        specs['pH'] = ph_match.group(1).replace('.', ',')

    # Fragrância: look for known scent names
    fragrances = [
        'Apple & Cinnamon', 'Black Crystal', 'New Car', 'Cold Black',
        'Fine Leather', 'Hot Coffee', 'Lavanda', 'Cereja', 'Morango',
        'Tutti-frutti', 'Bouquet', 'Summer', 'Requinte', 'Carro Novo',
        'Chiclete', 'Bamboo',
    ]
    for frag in fragrances:
        if frag.lower() in polibox_name.lower():
            specs['Fragrância'] = frag
            break

    return specs


def extract_specs_from_description_strict(desc):
    """Extract specs from description with very strict line-based patterns."""
    specs = {}
    if not desc:
        return specs

    lines = desc.split('\n')

    for line in lines:
        line = line.strip()
        if not line:
            continue

        line_lower = line.lower()

        # pH: "pH: 7,5" or "pH 6.5" (must be at start of line)
        if re.match(r'^(?:pH|PH)\s*[:\-]\s*([0-9]+[.,]?[0-9]*)', line, re.IGNORECASE):
            m = re.match(r'^(?:pH|PH)\s*[:\-]\s*([0-9]+[.,]?[0-9]*)', line, re.IGNORECASE)
            if m:
                specs['pH'] = m.group(1).replace('.', ',')
            continue

        # Diluição: "Diluição: Até 1:400" (must be at start of line)
        if re.match(r'^Dilui[çc][ãa]o\s*[:\-]\s*', line, re.IGNORECASE):
            m = re.match(r'^Dilui[çc][ãa]o\s*[:\-]\s*(.+)', line, re.IGNORECASE)
            if m:
                val = m.group(1).strip()
                # Only keep if it contains a ratio or "pronto uso" or "puro"
                if re.search(r'[0-9]+:[0-9]+|pronto\s+uso|puro', val, re.IGNORECASE) and len(val) < 50:
                    specs['Diluição'] = val
            continue

        # Volume: "Volume: 500ml" (must be at start of line)
        if re.match(r'^(?:Volume|Conte[úu]do)\s*[:\-]\s*', line, re.IGNORECASE):
            m = re.match(r'^(?:Volume|Conte[úu]do)\s*[:\-]\s*(.+)', line, re.IGNORECASE)
            if m:
                val = m.group(1).strip()
                if re.search(r'\d+\s*(?:ml|L|litro|litros|g|kg|cc)', val, re.IGNORECASE) and len(val) < 50:
                    specs['Volume'] = val
            continue

        # Composição: "Composição: ..." (must be at start of line)
        if re.match(r'^Composi[çc][ãa]o\s*[:\-]\s*', line, re.IGNORECASE):
            m = re.match(r'^Composi[çc][ãa]o\s*[:\-]\s*(.+)', line, re.IGNORECASE)
            if m:
                val = m.group(1).strip()
                if len(val) < 100:
                    specs['Composição'] = val
            continue

        # Tipo: "Tipo: ..." (must be at start of line, short value)
        if re.match(r'^Tipo\s*[:\-]\s*', line, re.IGNORECASE):
            m = re.match(r'^Tipo\s*[:\-]\s*(.+)', line, re.IGNORECASE)
            if m:
                val = m.group(1).strip()
                if len(val) < 40 and val[0].isupper():
                    specs['Tipo'] = val
            continue

        # Fragrância: "Fragrância: ..." (must be at start of line)
        if re.match(r'^(?:Fragr[âa]ncia|Aroma|Ess[êe]ncia)\s*[:\-]\s*', line, re.IGNORECASE):
            m = re.match(r'^(?:Fragr[âa]ncia|Aroma|Ess[êe]ncia)\s*[:\-]\s*(.+)', line, re.IGNORECASE)
            if m:
                val = m.group(1).strip()
                if len(val) < 50 and val[0].isupper():
                    specs['Fragrância'] = val
            continue

        # Cor: "Cor: ..." (must be at start of line)
        if re.match(r'^Cor\s*[:\-]\s*', line, re.IGNORECASE):
            m = re.match(r'^Cor\s*[:\-]\s*(.+)', line, re.IGNORECASE)
            if m:
                val = m.group(1).strip()
                if len(val) < 30 and val[0].isupper():
                    specs['Cor'] = val
            continue

    return specs


# Read all results
results = []
with open('/tmp/fetched_details4.jsonl') as f:
    for line in f:
        results.append(json.loads(line))

# Re-extract specifications
for r in results:
    old_specs = r.get('specifications', {})

    # Source 1: From Polibox name
    name_specs = extract_specs_from_polibox_name(r.get('polibox_name', ''))

    # Source 2: From description (strict)
    desc_specs = extract_specs_from_description_strict(r.get('description', ''))

    # Merge: old specs (already validated) + name specs + desc specs
    merged = {}
    # First add validated old specs
    for k, v in old_specs.items():
        if is_valid_spec_value(k, v):
            merged[k] = v
    # Then add name specs (override)
    for k, v in name_specs.items():
        merged[k] = v
    # Then add desc specs (don't override name specs)
    for k, v in desc_specs.items():
        if k not in merged and is_valid_spec_value(k, v):
            merged[k] = v

    r['specifications'] = merged

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
        print(f"  {r['name'][:45]}: {json.dumps(specs, ensure_ascii=False)}", file=sys.stderr)
    else:
        print(f"  {r['name'][:45]}: (none)", file=sys.stderr)
