#!/usr/bin/env python3
"""
Fetch product details from Polibox API for products without Polibox IDs.
Strategy:
1. Identify brand from product name
2. Fetch all products for that brand from Polibox API
3. Match by name similarity
4. Fetch full details for matched products
5. Extract description, short_description, usability, tips, specifications
"""

import json
import urllib.request
import urllib.parse
import re
import time
import sys
import os
import html
from html.parser import HTMLParser

# ─── HTML stripping ───
class HTMLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
    def handle_data(self, data):
        self.text.append(data)
    def get_text(self):
        return ''.join(self.text)

def strip_html(html_str):
    if not html_str:
        return None
    # Replace block tags with newlines
    html_str = re.sub(r'<br\s*/?>', '\n', html_str, flags=re.IGNORECASE)
    html_str = re.sub(r'</(p|div|li|h[1-6]|tr)>', '\n', html_str, flags=re.IGNORECASE)
    html_str = re.sub(r'<li[^>]*>', '\n• ', html_str, flags=re.IGNORECASE)
    s = HTMLStripper()
    s.feed(html_str)
    text = s.get_text()
    # Decode HTML entities
    text = html.unescape(text)
    # Clean up whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()
    return text if text else None

# ─── HTTP fetch ───
def fetch_url(url, timeout=30):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0"
    })
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        return None

def fetch_json(url):
    raw = fetch_url(url)
    if not raw:
        return None
    try:
        return json.loads(raw)
    except:
        return None

# ─── Brand mapping ───
# Map brand names to Polibox brand IDs
BRAND_MAP = {
    "Vonixx": "211",
    "Alcance": "5",
    "Areon": "13",
    "Cadillac": "33",
    "Vintex": "207",
    "Autoamerica": "23",
    "Spartan": "191",
    "Magil Clean": "276",
    "Soft99": "225",
    "Easytech": "77",
    "EasyTech": "77",
    "Lincoln": "109",
    "Evox": "79",
    "Protelim": "231",
    "Dub Boyz": "71",
    "Zacs": "253",
    "Resolvidro": "268",
    "Finisher": "81",
}

def identify_brand(name):
    """Identify the brand from product name."""
    name_upper = name.upper()
    # Check multi-word brands first (longer matches)
    for brand in sorted(BRAND_MAP.keys(), key=len, reverse=True):
        if brand.upper() in name_upper:
            return brand, BRAND_MAP[brand]
    return None, None

# ─── Name matching ───
def normalize_name(name):
    """Normalize a product name for comparison."""
    name = name.lower()
    name = re.sub(r'[áàâãä]', 'a', name)
    name = re.sub(r'[éèêë]', 'e', name)
    name = re.sub(r'[íìîï]', 'i', name)
    name = re.sub(r'[óòôõö]', 'o', name)
    name = re.sub(r'[úùûü]', 'u', name)
    name = re.sub(r'ç', 'c', name)
    name = re.sub(r'[^a-z0-9 ]', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def name_similarity(name1, name2):
    """Calculate similarity between two product names."""
    n1 = normalize_name(name1)
    n2 = normalize_name(name2)
    
    # Exact match
    if n1 == n2:
        return 1.0
    
    words1 = set(n1.split())
    words2 = set(n2.split())
    
    # Word overlap
    if not words1 or not words2:
        return 0.0
    
    intersection = words1 & words2
    union = words1 | words2
    jaccard = len(intersection) / len(union)
    
    # Check if one is substring of other
    if n1 in n2 or n2 in n1:
        return max(jaccard, 0.8)
    
    # Check word containment (important words)
    important_words1 = {w for w in words1 if len(w) > 2 and w not in {'para', 'com', 'the', 'and'}}
    important_words2 = {w for w in words2 if len(w) > 2 and w not in {'para', 'com', 'the', 'and'}}
    if important_words1 and important_words2:
        important_overlap = len(important_words1 & important_words2) / max(len(important_words1), len(important_words2))
        return max(jaccard, important_overlap * 0.9)
    
    return jaccard

# ─── Fetch all products for a brand ───
brand_cache = {}

def fetch_brand_products(brand_id):
    """Fetch all products for a brand, with caching."""
    if brand_id in brand_cache:
        return brand_cache[brand_id]
    
    products = []
    page = 1
    while True:
        url = f"https://www.polibox.com.br/web_api/products?brand_id={brand_id}&limit=50&page={page}"
        data = fetch_json(url)
        if not data or 'Products' not in data:
            break
        
        page_products = []
        for item in data['Products']:
            p = item.get('Product', item)
            page_products.append({
                'id': p.get('id'),
                'name': p.get('name', ''),
                'slug': p.get('slug', ''),
            })
        
        products.extend(page_products)
        
        total = data['paging']['total']
        if len(products) >= total or len(page_products) == 0:
            break
        
        page += 1
        time.sleep(0.3)
    
    brand_cache[brand_id] = products
    print(f"  Fetched {len(products)} products for brand_id={brand_id}", file=sys.stderr)
    return products

# ─── Fetch full product details ───
def fetch_product_details(product_id):
    """Fetch full product details from API."""
    url = f"https://www.polibox.com.br/web_api/products/{product_id}"
    data = fetch_json(url)
    if not data:
        return None
    
    if 'Product' in data:
        return data['Product']
    elif 'Products' in data and data['Products']:
        return data['Products'][0].get('Product', data['Products'][0])
    return None

# ─── Extract fields from product details ───
def extract_section(text, section_names):
    """Extract a section from text by looking for header keywords."""
    if not text:
        return None
    
    lines = text.split('\n')
    collecting = False
    section_lines = []
    
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        line_lower = line_stripped.lower()
        
        # Check if this line is a section header we're looking for
        is_header = False
        for name in section_names:
            if name.lower() in line_lower and len(line_stripped) < 100:
                is_header = True
                collecting = True
                break
        
        if is_header:
            continue
        
        # Check if we hit a different section header (stop collecting)
        if collecting and line_stripped:
            # Common section headers that would end our section
            stop_headers = ['modo de uso', 'como usar', 'aplicação', 'aplicacao', 
                          'dicas', 'cuidados', 'precauções', 'precaucoes',
                          'especificações', 'especificacoes', 'características', 'caracteristicas',
                          'composição', 'composicao', 'aviso', 'atenção', 'atencao',
                          'informações', 'informacoes', 'descrição', 'descricao']
            for sh in stop_headers:
                if sh in line_lower and len(line_stripped) < 100:
                    # Check it's not one of our target headers
                    is_target = False
                    for name in section_names:
                        if name.lower() in line_lower:
                            is_target = True
                            break
                    if not is_target:
                        if section_lines:  # Only stop if we've collected something
                            collecting = False
                            break
        
        if collecting and line_stripped:
            section_lines.append(line_stripped)
    
    result = '\n'.join(section_lines).strip()
    return result if result else None

def extract_specifications(text, product_data):
    """Extract specifications from text and product data."""
    specs = {}
    if not text and not product_data:
        return specs
    
    all_text = text or ""
    
    # Also check product properties if available
    if product_data:
        # Check for properties in the API response
        properties = product_data.get('properties', [])
        if isinstance(properties, list):
            for prop in properties:
                if isinstance(prop, dict):
                    p = prop.get('Property', prop)
                    name = p.get('name', '').strip()
                    value = p.get('value', '').strip()
                    if name and value:
                        specs[name] = value
        
        # Check for variant properties
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
        # pH
        ph_match = re.search(r'pH[:\s]*([0-9]+[.,]?[0-9]*)', all_text, re.IGNORECASE)
        if ph_match and 'pH' not in specs:
            specs['pH'] = ph_match.group(1).replace('.', ',')
        
        # Diluição
        dil_match = re.search(r'(?:Dilui[çc][ãa]o|Dilui[cç][aã]o)[:\s]*([^\n]+)', all_text, re.IGNORECASE)
        if dil_match and 'Diluição' not in specs:
            specs['Diluição'] = dil_match.group(1).strip()
        
        # Volume
        vol_match = re.search(r'(?:Volume|Conte[úu]do)[:\s]*([^\n]+)', all_text, re.IGNORECASE)
        if vol_match and 'Volume' not in specs:
            specs['Volume'] = vol_match.group(1).strip()
        
        # Tipo
        tipo_match = re.search(r'Tipo[:\s]*([^\n]+)', all_text, re.IGNORECASE)
        if tipo_match and 'Tipo' not in specs:
            specs['Tipo'] = tipo_match.group(1).strip()
        
        # Marca
        marca_match = re.search(r'Marca[:\s]*([^\n]+)', all_text, re.IGNORECASE)
        if marca_match and 'Marca' not in specs:
            specs['Marca'] = marca_match.group(1).strip()
        
        # Peso
        peso_match = re.search(r'Peso[:\s]*([^\n]+)', all_text, re.IGNORECASE)
        if peso_match and 'Peso' not in specs:
            specs['Peso'] = peso_match.group(1).strip()
        
        # Cor
        cor_match = re.search(r'Cor[:\s]*([^\n]+)', all_text, re.IGNORECASE)
        if cor_match and 'Cor' not in specs:
            specs['Cor'] = cor_match.group(1).strip()
        
        # Fragrância/Scent
        frag_match = re.search(r'(?:Fragr[âa]ncia|Aroma|Ess[êe]ncia)[:\s]*([^\n]+)', all_text, re.IGNORECASE)
        if frag_match and 'Fragrância' not in specs:
            specs['Fragrância'] = frag_match.group(1).strip()
    
    # Remove empty values
    specs = {k: v for k, v in specs.items() if v and v.strip()}
    return specs

def extract_product_info(product_data):
    """Extract all required fields from product API data."""
    if not product_data:
        return None
    
    # Description
    raw_desc = product_data.get('description', '')
    description = strip_html(raw_desc) if raw_desc else None
    
    # Short description
    raw_short = product_data.get('short_description', '')
    short_description = strip_html(raw_short) if raw_short else None
    
    # If no short_description, try to create one from description
    if not short_description and description:
        # Take first paragraph or first 200 chars
        first_para = description.split('\n')[0].strip()
        if first_para and len(first_para) > 20:
            short_description = first_para[:200]
    
    # Usability (Modo de Uso, Como Usar, Aplicação)
    usability = extract_section(description, ['modo de uso', 'como usar', 'aplicaç', 'aplicac'])
    
    # Tips (Dicas, Cuidados, Precauções)
    tips = extract_section(description, ['dicas', 'cuidados', 'precauç', 'precauc'])
    
    # Specifications
    specifications = extract_specifications(description, product_data)
    
    return {
        'description': description,
        'short_description': short_description,
        'usability': usability,
        'tips': tips,
        'specifications': specifications,
    }

# ─── Main processing ───
def process_product(product, output_file):
    """Process a single product."""
    db_id = product['id']
    name = product['name']
    
    print(f"\n--- Processing: {name}", file=sys.stderr)
    
    # Identify brand
    brand_name, brand_id = identify_brand(name)
    if not brand_id:
        print(f"  WARNING: Could not identify brand for: {name}", file=sys.stderr)
        result = {
            'db_id': db_id,
            'name': name,
            'polibox_id': None,
            'description': None,
            'short_description': None,
            'usability': None,
            'tips': None,
            'specifications': {},
            'error': 'brand_not_found'
        }
        with open(output_file, 'a') as f:
            f.write(json.dumps(result, ensure_ascii=False) + '\n')
        return result
    
    print(f"  Brand: {brand_name} (id={brand_id})", file=sys.stderr)
    
    # Fetch all products for this brand
    brand_products = fetch_brand_products(brand_id)
    
    # Find best match
    best_match = None
    best_score = 0.0
    
    for bp in brand_products:
        score = name_similarity(name, bp['name'])
        if score > best_score:
            best_score = score
            best_match = bp
    
    if not best_match or best_score < 0.3:
        print(f"  WARNING: No good match found (best score: {best_score:.2f})", file=sys.stderr)
        if best_match:
            print(f"  Best candidate: {best_match['name']} (score: {best_score:.2f})", file=sys.stderr)
        result = {
            'db_id': db_id,
            'name': name,
            'polibox_id': best_match['id'] if best_match else None,
            'description': None,
            'short_description': None,
            'usability': None,
            'tips': None,
            'specifications': {},
            'error': 'no_match',
            'best_candidate': best_match['name'] if best_match else None,
            'match_score': round(best_score, 3)
        }
        with open(output_file, 'a') as f:
            f.write(json.dumps(result, ensure_ascii=False) + '\n')
        return result
    
    print(f"  Match: {best_match['name']} (id={best_match['id']}, score={best_score:.2f})", file=sys.stderr)
    
    # Fetch full details
    time.sleep(0.5)
    details = fetch_product_details(best_match['id'])
    
    if not details:
        print(f"  ERROR: Could not fetch details for id={best_match['id']}", file=sys.stderr)
        result = {
            'db_id': db_id,
            'name': name,
            'polibox_id': best_match['id'],
            'description': None,
            'short_description': None,
            'usability': None,
            'tips': None,
            'specifications': {},
            'error': 'details_fetch_failed'
        }
        with open(output_file, 'a') as f:
            f.write(json.dumps(result, ensure_ascii=False) + '\n')
        return result
    
    # Extract info
    info = extract_product_info(details)
    
    result = {
        'db_id': db_id,
        'name': name,
        'polibox_id': best_match['id'],
        'polibox_name': best_match['name'],
        'match_score': round(best_score, 3),
        'description': info['description'] if info else None,
        'short_description': info['short_description'] if info else None,
        'usability': info['usability'] if info else None,
        'tips': info['tips'] if info else None,
        'specifications': info['specifications'] if info else {},
    }
    
    with open(output_file, 'a') as f:
        f.write(json.dumps(result, ensure_ascii=False) + '\n')
    
    print(f"  ✓ Extracted: desc={'yes' if result['description'] else 'no'}, short={'yes' if result['short_description'] else 'no'}, usability={'yes' if result['usability'] else 'no'}, tips={'yes' if result['tips'] else 'no'}, specs={len(result['specifications'])}", file=sys.stderr)
    
    return result

# ─── Entry point ───
if __name__ == '__main__':
    input_file = sys.argv[1] if len(sys.argv) > 1 else '/tmp/cc-agent/68779494/project/products_no_id.json'
    output_file = sys.argv[2] if len(sys.argv) > 2 else '/tmp/fetched_details4.jsonl'
    start_idx = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    end_idx = int(sys.argv[4]) if len(sys.argv) > 4 else -1
    
    with open(input_file) as f:
        products = json.load(f)
    
    if end_idx == -1:
        end_idx = len(products)
    
    batch = products[start_idx:end_idx]
    
    print(f"Processing products {start_idx} to {end_idx-1} ({len(batch)} products)", file=sys.stderr)
    print(f"Output: {output_file}", file=sys.stderr)
    
    for i, product in enumerate(batch):
        idx = start_idx + i
        print(f"\n[{idx+1}/{len(products)}]", file=sys.stderr)
        process_product(product, output_file)
        time.sleep(0.5)
    
    print(f"\n✅ Done! Processed {len(batch)} products.", file=sys.stderr)
