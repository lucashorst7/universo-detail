#!/usr/bin/env python3
"""
Re-process the descriptions in fetched_details4.jsonl to improve
usability and tips extraction. The descriptions are already fetched;
we just need better section extraction logic.
"""
import json
import re
import sys

# Section header patterns
USABILITY_HEADERS = [
    r'modo\s+de\s+uso',
    r'como\s+usar',
    r'aplica[çc][ãa]o',
    r'aplicac',
    r'forma\s+de\s+uso',
    r'instru[çc][õo]es\s+de\s+uso',
    r'passo\s+a\s+passo',
    r'aprenda\s+a\s+forma\s+correta',
]

TIPS_HEADERS = [
    r'dicas\b',
    r'cuidados\b',
    r'precau[çc][õo]es',
    r'aten[çc][ãa]o\b',
    r'aviso\b',
    r'advert[êe]ncia',
]

# Stop headers (end any section)
STOP_HEADERS = [
    r'modo\s+de\s+uso',
    r'como\s+usar',
    r'aplica[çc][ãa]o',
    r'aplicac',
    r'dicas\b',
    r'cuidados\b',
    r'precau[çc][õo]es',
    r'aten[çc][ãa]o\b',
    r'aviso\b',
    r'advert[êe]ncia',
    r'especifica[çc][õo]es',
    r'caracter[íi]sticas',
    r'composi[çc][ãa]o',
    r'informa[çc][õo]es\s+t[ée]cnicas',
    r'ficha\s+t[ée]cnica',
    r'indica[çc][ãa]o\s+de\s+uso',
    r'indica[çc][õo]es',
    r'conte[úu]do\s+da\s+embalagem',
    r'embalagem',
    r'garantia',
    r'validade',
]

def is_header_line(line, patterns):
    """Check if a line is a header matching any of the patterns."""
    line_lower = line.lower().strip()
    if not line_lower or len(line_lower) > 80:
        return False
    for pat in patterns:
        if re.search(pat, line_lower):
            return True
    return False

def find_inline_header(line, patterns):
    """
    Check if a line starts with or contains an inline header like 'PRECAUÇÕES: content...'.
    Returns (header_match, content_after_header) or (None, None).
    """
    line_stripped = line.strip()
    line_lower = line_stripped.lower()
    for pat in patterns:
        match = re.search(pat, line_lower)
        if match:
            # Check if the header is at the start of the line or after a colon
            start = match.start()
            # Get the content after the header (skip the header word and any colon/space)
            after_match = match.end()
            # Look for a colon after the header
            colon_pos = line_stripped.find(':', after_match)
            if colon_pos >= 0 and colon_pos < after_match + 30:
                content = line_stripped[colon_pos + 1:].strip()
            else:
                content = line_stripped[after_match:].strip()
            if content and len(line_stripped) > 20:
                return match, content
    return None, None

def extract_section_improved(text, target_patterns, stop_patterns):
    """
    Extract a section from text by finding target header lines,
    then collecting content until a stop header is found.
    Also handles inline headers like 'PRECAUÇÕES: content...'.
    """
    if not text:
        return None

    lines = text.split('\n')
    sections = []

    for i, line in enumerate(lines):
        line_stripped = line.strip()
        if not line_stripped:
            continue

        # Check if this line is a standalone target header
        if is_header_line(line_stripped, target_patterns):
            # Collect content after this header
            content_lines = []
            for j in range(i + 1, len(lines)):
                next_line = lines[j].strip()
                if not next_line:
                    if content_lines:
                        content_lines.append('')
                    continue

                if is_header_line(next_line, stop_patterns):
                    break
                if is_header_line(next_line, target_patterns):
                    break

                content_lines.append(next_line)

            while content_lines and not content_lines[-1]:
                content_lines.pop()

            if content_lines:
                sections.append('\n'.join(content_lines))

        # Check for inline header (e.g., "PRECAUÇÕES: content...")
        header_match, inline_content = find_inline_header(line_stripped, target_patterns)
        if header_match and inline_content:
            # This line has an inline header with content
            content_lines = [inline_content]
            # Collect more content from following lines
            for j in range(i + 1, len(lines)):
                next_line = lines[j].strip()
                if not next_line:
                    if content_lines:
                        content_lines.append('')
                    continue

                if is_header_line(next_line, stop_patterns):
                    break
                if is_header_line(next_line, target_patterns):
                    break
                # Also check for inline headers in next lines
                nh, ncontent = find_inline_header(next_line, stop_patterns)
                if nh and ncontent:
                    break

                content_lines.append(next_line)

            while content_lines and not content_lines[-1]:
                content_lines.pop()

            if content_lines:
                sections.append('\n'.join(content_lines))

    if sections:
        return '\n\n'.join(sections)
    return None


def extract_specifications_improved(text, product_data):
    """Extract specifications from text and product data."""
    specs = {}
    if not text and not product_data:
        return specs

    all_text = text or ""

    # Check product properties if available
    if product_data:
        properties = product_data.get('properties', [])
        if isinstance(properties, list):
            for prop in properties:
                if isinstance(prop, dict):
                    p = prop.get('Property', prop)
                    name = p.get('name', '').strip()
                    value = p.get('value', '').strip()
                    if name and value:
                        specs[name] = value

        variants = product_data.get('variants', [])
        if isinstance(variants, list):
            for v in variants:
                if isinstance(v, dict):
                    vp = v.get('Variant', v)
                    vprops = vp.get('properties', [])
                    if isinstance(vprops, list):
                        for prop in vprops:
                            if isinstance(prop, dict):
                                p = prop.get('Property', prop)
                                name = p.get('name', '').strip()
                                value = p.get('value', '').strip()
                                if name and value and name not in specs:
                                    specs[name] = value

    # Extract from text using patterns
    if all_text:
        patterns = {
            'pH': r'(?:pH|PH)[:\s]*([0-9]+[.,]?[0-9]*)',
            'Diluição': r'(?:Dilui[çc][ãa]o|Dilui[cç][aã]o)[:\s]*([^\n]+)',
            'Volume': r'(?:Volume|Conte[úu]do)[:\s]*([^\n]+)',
            'Tipo': r'Tipo[:\s]*([^\n]+)',
            'Marca': r'Marca[:\s]*([^\n]+)',
            'Peso': r'Peso[:\s]*([^\n]+)',
            'Cor': r'Cor[:\s]*([^\n]+)',
            'Fragrância': r'(?:Fragr[âa]ncia|Aroma|Ess[êe]ncia)[:\s]*([^\n]+)',
            'Composição': r'Composi[çc][ãa]o[:\s]*([^\n]+)',
        }

        for key, pat in patterns.items():
            if key not in specs:
                match = re.search(pat, all_text, re.IGNORECASE)
                if match:
                    val = match.group(1).strip()
                    if val:
                        specs[key] = val

    # Remove empty values
    specs = {k: v for k, v in specs.items() if v and v.strip()}
    return specs


# Read all results
results = []
with open('/tmp/fetched_details4.jsonl') as f:
    for line in f:
        results.append(json.loads(line))

# Re-process each result
updated = 0
for r in results:
    desc = r.get('description')
    if not desc:
        continue

    # Re-extract usability
    usability = extract_section_improved(desc, USABILITY_HEADERS, STOP_HEADERS)
    if usability:
        r['usability'] = usability

    # Re-extract tips
    tips = extract_section_improved(desc, TIPS_HEADERS, STOP_HEADERS)
    if tips:
        r['tips'] = tips

    # Re-extract specifications (keep existing + add new from text)
    existing_specs = r.get('specifications', {})
    new_specs = extract_specifications_improved(desc, None)
    merged = {**existing_specs, **new_specs}  # New specs override
    r['specifications'] = {k: v for k, v in merged.items() if v and v.strip()}

    updated += 1

# Write back
with open('/tmp/fetched_details4.jsonl', 'w') as f:
    for r in results:
        f.write(json.dumps(r, ensure_ascii=False) + '\n')

# Print stats
total = len(results)
has_usability = sum(1 for r in results if r.get('usability'))
has_tips = sum(1 for r in results if r.get('tips'))
has_specs = sum(1 for r in results if r.get('specifications'))

print(f"Updated {updated} products", file=sys.stderr)
print(f"Has usability: {has_usability}/{total}", file=sys.stderr)
print(f"Has tips: {has_tips}/{total}", file=sys.stderr)
print(f"Has specifications: {has_specs}/{total}", file=sys.stderr)
