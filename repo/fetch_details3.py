#!/usr/bin/env python3
import json
import re
import subprocess
import sys
import html

BATCH_FILE = "/tmp/details_batch3.json"
OUTPUT_FILE = "/tmp/fetched_details3.jsonl"

with open(BATCH_FILE, "r") as f:
    products = json.load(f)

def strip_html(text):
    """Strip HTML tags and decode entities, returning clean text."""
    if not text:
        return ""
    # Replace <br>, <br/>, </p>, </div>, </li> with newlines
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</(p|div|li|h[1-6]|tr)>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<li[^>]*>', '• ', text, flags=re.IGNORECASE)
    # Remove all remaining tags
    text = re.sub(r'<[^>]+>', '', text)
    # Decode HTML entities
    text = html.unescape(text)
    # Normalize whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n[ \t]+', '\n', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()
    return text

def extract_section(text, section_names):
    """Extract content after a section header until the next section or end."""
    # Known section headers to stop at
    stop_headers = [
        "Modo de Uso", "Modo de usar", "Como Usar", "Como usar",
        "Aplicação", "Aplicacao", "Como Aplicar",
        "Instruções de Uso", "Instrucoes de Uso", "Instruções", "Instrucoes",
        "Dicas", "Cuidados", "Precauções", "Precaucoes",
        "Atenção", "Atencao", "Aviso", "Importante",
        "Recomendações", "Recomendacoes", "Observações", "Observacoes",
        "Armazenamento", "Validade", "Garantia",
        "Especificações", "Especificacoes", "Características", "Caracteristicas",
        "Composição", "Composicao", "Ingredientes",
        "Descrição", "Descricao",
        "Benefícios", "Beneficios", "Vantagens",
        "O que é", "O que e",
    ]
    stop_pattern = '|'.join(re.escape(h) for h in stop_headers)
    
    for name in section_names:
        # Match the section name as a header (case-insensitive)
        pattern = rf'(?i)({re.escape(name)})\s*:?\s*\n(.+?)(?=\n\s*(?:{stop_pattern})\s*:?\s*\n|$)'
        match = re.search(pattern, text, flags=re.DOTALL)
        if match:
            content = match.group(2).strip()
            if content and len(content) > 5:
                return content
    return None

def extract_specifications(text):
    """Extract specifications like pH, Diluição, Volume, etc."""
    specs = {}
    spec_patterns = {
        'pH': r'(?:^|\n)\s*(?:pH|PH|ph)\s*:?\s*([0-9]+(?:[.,][0-9]+)?(?:\s*[-–]\s*[0-9]+(?:[.,][0-9]+)?)?)',
        'Diluição': r'(?:^|\n)\s*(?:Dilui[çc][ãa]o|Diluicao|Dilui)\s*:?\s*(.+?)(?=\n|$)',
        'Volume': r'(?:^|\n)\s*(?:Volume|Capacidade|Conte[úu]do)\s*:?\s*(.+?)(?=\n|$)',
        'Tipo': r'(?:^|\n)\s*Tipo\s*:?\s*(.+?)(?=\n|$)',
        'Marca': r'(?:^|\n)\s*Marca\s*:?\s*(.+?)(?=\n|$)',
        'Rendimento': r'(?:^|\n)\s*(?:Rendimento|Renderimento)\s*:?\s*(.+?)(?=\n|$)',
        'Durabilidade': r'(?:^|\n)\s*Durabilidade\s*:?\s*(.+?)(?=\n|$)',
        'Fragrância': r'(?:^|\n)\s*(?:Fragr[âa]ncia|Aroma|Cheiro|Odor)\s*:?\s*(.+?)(?=\n|$)',
        'Cor': r'(?:^|\n)\s*Cor\s*:?\s*(.+?)(?=\n|$)',
        'Peso': r'(?:^|\n)\s*(?:Peso|Peso L[íi]quido|Peso Liquido)\s*:?\s*(.+?)(?=\n|$)',
        'Embalagem': r'(?:^|\n)\s*Embalagem\s*:?\s*(.+?)(?=\n|$)',
        'Concentração': r'(?:^|\n)\s*(?:Concentra[çc][ãa]o|Concentracao)\s*:?\s*(.+?)(?=\n|$)',
        'Composição': r'(?:^|\n)\s*(?:Composi[çc][ãa]o|Composicao|Ingredientes)\s*:?\s*(.+?)(?=\n|$)',
        'Validade': r'(?:^|\n)\s*Validade\s*:?\s*(.+?)(?=\n|$)',
        'Toque': r'(?:^|\n)\s*Toque\s*:?\s*(.+?)(?=\n|$)',
        'Acabamento': r'(?:^|\n)\s*Acabamento\s*:?\s*(.+?)(?=\n|$)',
        'Abrasividade': r'(?:^|\n)\s*Abrasividade\s*:?\s*(.+?)(?=\n|$)',
        'Corte': r'(?:^|\n)\s*Corte\s*:?\s*(.+?)(?=\n|$)',
        'Proteção': r'(?:^|\n)\s*(?:Prote[çc][ãa]o|Protecao)\s*:?\s*(.+?)(?=\n|$)',
    }
    
    for key, pattern in spec_patterns.items():
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            value = match.group(1).strip()
            # Clean up the value
            value = re.sub(r'^\s*[-–•]\s*', '', value)
            value = value.strip()
            if value and len(value) > 0 and len(value) < 200:
                specs[key] = value
    
    return specs if specs else None

def extract_usability(text):
    """Extract usage instructions."""
    return extract_section(text, [
        "Modo de Uso",
        "Modo de usar",
        "Como Usar",
        "Como usar",
        "Aplicação",
        "Aplicacao",
        "Como Aplicar",
        "Instruções de Uso",
        "Instrucoes de Uso",
        "Instruções",
        "Instrucoes",
    ])

def extract_tips(text):
    """Extract tips and precautions."""
    return extract_section(text, [
        "Dicas",
        "Cuidados",
        "Precauções",
        "Precaucoes",
        "Atenção",
        "Atencao",
        "Aviso",
        "Importante",
        "Recomendações",
        "Recomendacoes",
        "Observações",
        "Observacoes",
        "Armazenamento",
    ])

def make_short_description(description):
    """Create a brief 1-2 sentence summary from the full description."""
    if not description:
        return None
    # Take first 1-2 sentences
    sentences = re.split(r'(?<=[.!?])\s+', description)
    short = ""
    for s in sentences[:2]:
        s = s.strip()
        if not s:
            continue
        if short:
            short += " " + s
        else:
            short = s
        if len(short) > 200:
            break
    if not short:
        short = description[:200].strip()
    return short.strip() if short.strip() else None

def fetch_product(product):
    """Fetch product data using Tray Commerce API."""
    db_id = product["db_id"]
    polibox_id = product["polibox_id"]
    name = product["name"]
    
    raw_description = None
    api_short = None
    
    # Try Tray Commerce API
    api_url = f"https://www.polibox.com.br/web_api/products/{polibox_id}"
    try:
        result = subprocess.run(
            ["curl", "-sL", "-H", "User-Agent: Mozilla/5.0", "--max-time", "30", api_url],
            capture_output=True, text=True, timeout=35
        )
        if result.stdout:
            api_data = json.loads(result.stdout)
            if isinstance(api_data, list) and len(api_data) > 0:
                product_data = api_data[0].get("Product", api_data[0])
            elif isinstance(api_data, dict):
                product_data = api_data.get("Product", api_data)
            else:
                product_data = {}
            
            raw_description = product_data.get("description", "")
            api_short_raw = product_data.get("short_description", "") or product_data.get("small_description", "")
            if api_short_raw:
                api_short = strip_html(api_short_raw)
                if not api_short or len(api_short) < 10:
                    api_short = None
    except json.JSONDecodeError as e:
        print(f"  JSON decode error for {polibox_id}: {e}", file=sys.stderr)
    except Exception as e:
        print(f"  API error for {polibox_id}: {e}", file=sys.stderr)
    
    if not raw_description:
        print(f"  No description from API for {polibox_id}", file=sys.stderr)
        return {
            "db_id": db_id,
            "polibox_id": polibox_id,
            "name": name,
            "description": None,
            "short_description": None,
            "usability": None,
            "tips": None,
            "specifications": None
        }
    
    # Strip HTML
    clean_desc = strip_html(raw_description)
    
    if not clean_desc or len(clean_desc) < 10:
        print(f"  Empty description after stripping for {polibox_id}", file=sys.stderr)
        return {
            "db_id": db_id,
            "polibox_id": polibox_id,
            "name": name,
            "description": None,
            "short_description": None,
            "usability": None,
            "tips": None,
            "specifications": None
        }
    
    # Extract fields
    usability = extract_usability(clean_desc)
    tips = extract_tips(clean_desc)
    specs = extract_specifications(clean_desc)
    
    # Use API short description if available, otherwise generate
    short_desc = api_short if api_short else make_short_description(clean_desc)
    
    return {
        "db_id": db_id,
        "polibox_id": polibox_id,
        "name": name,
        "description": clean_desc,
        "short_description": short_desc,
        "usability": usability,
        "tips": tips,
        "specifications": specs
    }

# Process all products
results = []
for i, product in enumerate(products):
    print(f"[{i+1}/{len(products)}] Fetching {product['name']} (ID: {product['polibox_id']})...", file=sys.stderr)
    result = fetch_product(product)
    results.append(result)
    # Print summary
    desc_len = len(result["description"]) if result["description"] else 0
    has_usability = "Y" if result["usability"] else "N"
    has_tips = "Y" if result["tips"] else "N"
    has_specs = "Y" if result["specifications"] else "N"
    spec_keys = list(result["specifications"].keys()) if result["specifications"] else []
    print(f"  desc={desc_len} chars, usability={has_usability}, tips={has_tips}, specs={has_specs} {spec_keys}", file=sys.stderr)

# Write JSONL output
with open(OUTPUT_FILE, "w") as f:
    for result in results:
        f.write(json.dumps(result, ensure_ascii=False) + "\n")

print(f"\nWrote {len(results)} results to {OUTPUT_FILE}", file=sys.stderr)
