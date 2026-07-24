import json, re, glob

files = sorted(glob.glob("/tmp/cc-agent/68779494/.v3/persisted-tool-results/v3-session/call_*.txt"))
url_to_content = {}
for f in files:
    try:
        data = json.load(open(f))
        for r in data.get("results", []):
            rc = r.get("rawContent")
            if rc:
                url_to_content[r["url"]] = rc
    except Exception:
        pass

# Add inline content for the 4 missing URLs (extracted from tool output above)
inline_content = {
    "https://www.polibox.com.br/produto/limpa-para-brisa-em-pastilha-eco-w-wurth-5g/27792": '''
[![Limpa Pneus STAR - Protelim (500ml) - Foto 0](https://images.tcdn.com.br/img/img_prod/1152560/limpa_pneus_star_protelim_500ml_2335_1_a4ba152d55794d6db16cb981586f8fbe.jpg)]
![Limpa Pneus STAR - Protelim (500ml)](https://images.tcdn.com.br/img/img_prod/1152560/90_limpa_pneus_star_protelim_500ml_2335_1_a4ba152d55794d6db16cb981586f8fbe.jpg)
''',
    "https://www.polibox.com.br/produto/pneu-pretinho-vintex-5-litros/27544": '''
[![Pneu Pretinho - Vintex (5 Litros) - Foto 0](https://images.tcdn.com.br/img/img_prod/1152560/pneu_pretinho_vintex_5_litros_707_1_1e5cf1f4cd0b3a1f0485f3e1113c65e0.jpg)]   [![Pneu Pretinho - Vintex (5 Litros) - Foto 1](https://images.tcdn.com.br/img/img_prod/1152560/pneu_pretinho_vintex_5_litros_707_2_12c9dc6b9a72a09c41641b12e6d73697.jpg)]   [![Pneu Pretinho - Vintex (5 Litros) - Foto 2](https://images.tcdn.com.br/img/img_prod/1152560/pneu_pretinho_vintex_5_litros_707_3_5287c18ab04f5d1e4d9c24a757d61a59.jpg)]
![Pneu Pretinho - Vintex (5 Litros)](https://images.tcdn.com.br/img/img_prod/1152560/90_pneu_pretinho_vintex_5_litros_707_1_1e5cf1f4cd0b3a1f0485f3e1113c65e0.jpg)
''',
    "https://www.polibox.com.br/produto/pneu-pretinho-vintex-500ml/26799": '''
[![Pneu Pretinho - Vintex (500ml) - Foto 0](https://images.tcdn.com.br/img/img_prod/1152560/pneu_pretinho_vintex_500ml_1_20260301145927_33bc1d6c00f6.jpg)]   [![Pneu Pretinho - Vintex (500ml) - Foto 1](https://images.tcdn.com.br/img/img_prod/1152560/pneu_pretinho_vintex_500ml_2_20260301145927_a76e81d44648.jpg)]   [![Pneu Pretinho - Vintex (500ml) - Foto 2](https://images.tcdn.com.br/img/img_prod/1152560/pneu_pretinho_vintex_500ml_3_20260301145927_5cad928a4627.jpg)]
![Pneu Pretinho - Vintex (500ml)](https://images.tcdn.com.br/img/img_prod/1152560/90_pneu_pretinho_vintex_500ml_1_20260301145927_33bc1d6c00f6.jpg)
''',
    "https://www.polibox.com.br/produto/pneu-pretinho-vintexvonixx-15-l/29255": '''
[![Pneu Pretinho - Vintex (1,5 L) - Foto 0](https://images.tcdn.com.br/img/img_prod/1152560/pneu_pretinho_vintex_1_5_l_2173_1_3b8c5ff1be52ca9ead9e785dfa981c99.jpg)]   [![Pneu Pretinho - Vintex (1,5 L) - Foto 1](https://images.tcdn.com.br/img/img_prod/1152560/pneu_pretinho_vintex_vonixx_1_5_l_2173_2_12c9dc6b9a72a09c41641b12e6d73697.jpg)]   [![Pneu Pretinho - Vintex (1,5 L) - Foto 2](https://images.tcdn.com.br/img/img_prod/1152560/pneu_pretinho_vintex_1_5_l_2173_3_3b8c5ff1be52ca9ead9e785dfa981c99.jpg)]
![Pneu Pretinho - Vintex (1,5 L)](https://images.tcdn.com.br/img/img_prod/1152560/90_pneu_pretinho_vintex_1_5_l_2173_1_3b8c5ff1be52ca9ead9e785dfa981c99.jpg)
''',
}
url_to_content.update(inline_content)

urls = [
    "https://www.polibox.com.br/polimento/ceras-e-selantes/carnauba-hybrid-wax-vonixx-120g",
    "https://www.polibox.com.br/polimento/ceras-e-selantes/cherry-wax-cera-4-em-1-zacs-500ml",
    "https://www.polibox.com.br/polimento/ceras-e-selantes/hydrox-fast-coating-ceramico-hidro-reativo-vonixx-500ml",
    "https://www.polibox.com.br/polimento/ceras-e-selantes/hydrox-pro-coating-ceramico-hidro-reativo-vonixx-500ml-diluicao-ate-160",
    "https://www.polibox.com.br/polimento/ceras-e-selantes/spell-2-0-brilho-e-protecao-instantaneo-vonixx-500ml-nova-formula",
    "https://www.polibox.com.br/polimento/ceras-e-selantes/toque-de-mestre-cera-rapida-de-carnauba-tipo-3-easytech-500ml",
    "https://www.polibox.com.br/polimento/vidro/resolvidro-gold-em-po-composto-para-polimento-de-vidros-100g",
    "https://www.polibox.com.br/produto/areon-mon-brazilian-vanilla/29402",
    "https://www.polibox.com.br/produto/areon-perfume-blister-new-car-35ml/29404",
    "https://www.polibox.com.br/produto/black-magic-condicionador-de-pneus-cadillac-500-ml/21631",
    "https://www.polibox.com.br/produto/brilha-pneu-gel-para-pneus-autoclean-pro-line-autoamerica-5-litros/29167",
    "https://www.polibox.com.br/produto/cera-fusso-coat-black-para-cores-escuras-soft99-200g",
    "https://www.polibox.com.br/produto/cera-fusso-coat-light-para-cores-claras-soft99-200g/27783",
    "https://www.polibox.com.br/produto/extreme-tire-gel-autoamerica-473ml/25651",
    "https://www.polibox.com.br/produto/limpa-para-brisa-em-pastilha-eco-w-wurth-5g/27792",
    "https://www.polibox.com.br/produto/native-cleaner-wax-brazilian-carnauba-vonixx-500ml/27679",
    "https://www.polibox.com.br/produto/native-spray-wax-brazilian-carnauba-vonixx-500ml/27680",
    "https://www.polibox.com.br/produto/pneu-pretinho-vintex-5-litros/27544",
    "https://www.polibox.com.br/produto/pneu-pretinho-vintex-500ml/26799",
    "https://www.polibox.com.br/produto/pneu-pretinho-vintexvonixx-15-l/29255",
]

# Pattern for img_prod URLs ending in .jpg
pattern = re.compile(r'https://images\.tcdn\.com\.br/img/img_prod/1152560/[A-Za-z0-9_./\-]+\.(?:jpg|jpeg)')

for u in urls:
    content = url_to_content.get(u) or ""
    found = pattern.findall(content)
    filtered = []
    seen = set()
    for img in found:
        low = img.lower()
        if "loading.gif" in low or "themes/" in low or "categoria_img" in low or "files/" in low:
            continue
        if img in seen:
            continue
        seen.add(img)
        filtered.append(img)
    print(json.dumps({"url": u, "images": filtered}, ensure_ascii=False))
