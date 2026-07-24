#!/usr/bin/env python3
"""
Clean up specifications - remove all false positives.
Only keep specs that look like real specification values.
"""
import json
import re
import sys

def is_valid_spec_value(key, value):
    """Check if a specification value looks valid."""
    if not value or not value.strip():
        return False

    v = value.strip()

    # Skip if too long (specs are usually short)
    if len(v) > 80:
        return False

    # Skip if contains sentence-like words (false positive indicators)
    false_positive_words = [
        'permite', 'deixando', 'retorna', 'devolve', 'garante', 'proporciona',
        'superfície', 'superficie', 'aplicação', 'aplicacao', 'produto',
        'retamente', 'rer o risco', 'do com o grau', 'RETA DE APLICAÇÃO',
        'pinturas', 'vitificadores', 'encardidos', 'desejada',
        'excelente rendimento', 'acabamento', 'agradável',
        'diferença', 'diferenca', 'tradicional',
        'estiloso', 'energia', 'criativo', 'divertido',
        'estilo', 'moderno', 'leve',
        'resiste', 'altas temperaturas',
        'proteção', 'protecao',
        'transformar', 'experiência', 'experiencia',
        'morango' if key != 'Fragrância' else None,
    ]
    for word in false_positive_words:
        if word and word.lower() in v.lower():
            return False

    # Key-specific validation
    if key == 'pH':
        # pH should be a number or range
        if not re.match(r'^[0-9]+[.,]?[0-9]*(\s*[-–]\s*[0-9]+[.,]?[0-9]*)?$', v):
            return False
    elif key == 'Diluição':
        # Diluição should contain ratio like 1:400 or "Pronto uso" or "Puro"
        if not re.search(r'[0-9]+:[0-9]+|pronto\s+uso|puro|at[ée]\s+1:', v, re.IGNORECASE):
            return False
        # Skip if it's a sentence
        if len(v) > 50:
            return False
    elif key == 'Volume':
        # Volume should contain ml, L, Litros, g, kg, etc.
        if not re.search(r'\d+\s*(?:ml|ml|L|litro|litros|g|kg|ml|cc|unid|und)', v, re.IGNORECASE):
            return False
    elif key == 'Tipo':
        # Tipo should be short
        if len(v) > 40:
            return False
        # Skip if starts with lowercase (likely continuation of sentence)
        if v[0].islower():
            return False
    elif key == 'Marca':
        # Marca should be a known brand or short name
        if len(v) > 30:
            return False
        if v[0].islower():
            return False
        if ' ' in v and not v[0].isupper():
            return False
    elif key == 'Cor':
        # Cor should be a color name
        if len(v) > 30:
            return False
        if v[0].islower():
            return False
        # Skip if contains action words
        if re.search(r'\b(?:deix|retor|devol|garant|propor)\w*', v, re.IGNORECASE):
            return False
    elif key == 'Fragrância':
        # Fragrância should be a scent name
        if len(v) > 50:
            return False
        if v[0].islower():
            return False
        # Skip if contains sentence-like patterns
        if re.search(r'\b(?:que|seu|sua|para|onde|qualquer|casa|carro|escrit[óo]rio)\b', v, re.IGNORECASE):
            return False
    elif key == 'Composição':
        # Composição should list ingredients
        if len(v) > 100:
            return False
    elif key == 'Peso':
        if not re.search(r'\d+\s*(?:g|kg|mg)', v, re.IGNORECASE):
            return False
    elif key == 'Embalagem':
        if len(v) > 50:
            return False

    return True


def extract_specs_from_api_properties(product_data):
    """Extract specs from API product properties (most reliable source)."""
    specs = {}
    if not product_data:
        return specs

    properties = product_data.get('properties', [])
    if isinstance(properties, list):
        for prop in properties:
            if isinstance(prop, dict):
                p = prop.get('Property', prop)
                name = p.get('name', '').strip()
                value = p.get('value', '').strip()
                if name and value and is_valid_spec_value(name, value):
                    specs[name] = value

    return specs


# Read all results
results = []
with open('/tmp/fetched_details4.jsonl') as f:
    for line in f:
        results.append(json.loads(line))

# Clean up specifications
for r in results:
    specs = r.get('specifications', {})
    clean_specs = {}
    for k, v in specs.items():
        if is_valid_spec_value(k, v):
            clean_specs[k] = v.strip()
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
        print(f"  {r['name'][:45]}: {json.dumps(specs, ensure_ascii=False)}", file=sys.stderr)
    else:
        print(f"  {r['name'][:45]}: (none)", file=sys.stderr)
