#!/usr/bin/env python3
"""Re-process the fetched descriptions with improved extraction."""
import json
import re
import html

INPUT_FILE = "/tmp/fetched_details3.jsonl"
OUTPUT_FILE = "/tmp/fetched_details3.jsonl"

# Read all results
with open(INPUT_FILE, "r") as f:
    results = [json.loads(line) for line in f]

# All known section headers (for boundary detection)
ALL_HEADERS = [
    "Modo de Uso", "Modo de usar", "Modo de Usar",
    "Como Usar", "Como usar", "Como Aplicar",
    "Aplicação", "Aplicacao",
    "Instruções de Uso", "Instrucoes de Uso", "Instruções", "Instrucoes",
    "Indicações de Uso", "Indicacoes de Uso", "Indicações", "Indicacoes",
    "Dicas", "Cuidados", "Precauções", "Precaucoes",
    "Atenção", "Atencao", "Aviso", "Importante",
    "Recomendações", "Recomendacoes", "Observações", "Observacoes",
    "Armazenamento", "Validade", "Garantia",
    "Especificações", "Especificacoes",
    "Características", "Caracteristicas", "Caraterísticas", "Carateristicas",
    "Composição", "Composicao", "Ingredientes",
    "Descrição", "Descricao",
    "Benefícios", "Beneficios", "Vantagens e Benefícios", "Vantagens",
    "O que é", "O que e",
    "Processo indicado", "Processo Indicado",
    "TECNOLOGIA", "APLICAÇÃO",
    "Diluição", "Diluicao", "Dilui",
    "Composição", "Composicao",
]

def extract_section_flexible(text, section_names):
    """Extract content after a section header, handling both:
    1. Header on its own line, content on next lines
    2. Header followed by colon and content on same line
    """
    stop_pattern = '|'.join(re.escape(h) for h in ALL_HEADERS)
    
    for name in section_names:
        # Pattern: header name, optionally followed by colon, then capture content
        # Content can be on same line or next line(s)
        # Stop at next known header or end of text
        pattern = rf'(?i)(?:^|\n)\s*{re.escape(name)}\s*:?\s*(.+?)(?=\n\s*(?:{stop_pattern})\s*:?\s*(?:\n|$)|$)'
        match = re.search(pattern, text, flags=re.DOTALL)
        if match:
            content = match.group(1).strip()
            # Remove leading newlines/whitespace
            content = re.sub(r'^\s*\n\s*', '', content)
            content = content.strip()
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
        'Corte': r'(?:^|\n)\s*Corte\s*:?\s*([0-9]+)',
        'Brilho': r'(?:^|\n)\s*Brilho\s*:?\s*([0-9]+)',
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
    return extract_section_flexible(text, [
        "Modo de Uso",
        "Modo de Usar",
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
        "Indicações de Uso",
        "Indicacoes de Uso",
        "Indicações",
        "Indicacoes",
        "Processo indicado",
        "Processo Indicado",
    ])

def extract_tips(text):
    """Extract tips and precautions."""
    return extract_section_flexible(text, [
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
        "Vantagens e Benefícios",
        "Vantagens",
        "Benefícios",
        "Beneficios",
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

# Re-process each result
for result in results:
    desc = result.get("description")
    if not desc:
        continue
    
    # Re-extract with improved patterns
    result["usability"] = extract_usability(desc)
    result["tips"] = extract_tips(desc)
    result["specifications"] = extract_specifications(desc)
    
    # Regenerate short description if it was generated (not from API)
    # Keep existing short_description if it looks good
    if not result.get("short_description") or len(result["short_description"]) < 10:
        result["short_description"] = make_short_description(desc)

# Write back
with open(OUTPUT_FILE, "w") as f:
    for result in results:
        f.write(json.dumps(result, ensure_ascii=False) + "\n")

# Print summary
print("Re-extraction complete!")
for r in results:
    desc_len = len(r["description"]) if r["description"] else 0
    usab = "Y" if r["usability"] else "N"
    tips = "Y" if r["tips"] else "N"
    specs = list(r["specifications"].keys()) if r["specifications"] else []
    print(f"  {r['polibox_id']:>5} | {r['name'][:45]:45} | desc={desc_len:>4} | usab={usab} | tips={tips} | specs={specs}")
