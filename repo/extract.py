import json, re, glob

files = sorted(glob.glob("/tmp/cc-agent/68779494/.v3/persisted-tool-results/v3-session/call_*.txt"))
pattern = re.compile(r'https://images\.tcdn\.com\.br/img/img_prod/[^"\s\\)]+')
skip = re.compile(r'loading\.gif|themes/|categoria_img|files/')

order = [
"https://www.polibox.com.br/lavagem/limpadores-especiais/limpa-estofados-vintex-1-5-l",
"https://www.polibox.com.br/lavagem/shampoos/aquo-guard-shampoo-automotivo-desengraxante-alcance-500ml-diluicao-ate-1400",
"https://www.polibox.com.br/lavagem/shampoos/demolidor-lava-auto-desengraxante-cadillac-1-5l-diluicao-ate-1200",
"https://www.polibox.com.br/lavagem/shampoos/mittus-shampoo-neutro-concentrado-zacs-500ml",
"https://www.polibox.com.br/lavagem/shampoos/nevasca-lava-auto-ultra-concentrado-cadillac-1-5l-diluicao-ate-11600",
"https://www.polibox.com.br/lavagem/shampoos/nevasca-lava-auto-ultra-concentrado-cadillac-diluicao-ate-11600",
"https://www.polibox.com.br/lavagem/shampoos/prot-sh400-detergente-automotivo-neutro-concentrado-protelim-20-litros",
"https://www.polibox.com.br/lavagem/shampoos/puri-mol-super-detergente-automotivo-easytech-1-5l-diluicao-ate-1100",
"https://www.polibox.com.br/lavagem/shampoos/puri-mol-super-detergente-automotivo-easytech-5-litros-diluicao-ate-1100",
"https://www.polibox.com.br/limpadores-especiais/acidus-fast-limpador-de-uso-geral-uso-externo-vonixx-500ml",
"https://www.polibox.com.br/limpadores-especiais/acidus-pro-limpador-de-uso-geral-uso-externo-vonixx-1-5-l",
"https://www.polibox.com.br/limpadores-especiais/descole-removedor-de-cola-e-piche-cadillac-1-5-l",
"https://www.polibox.com.br/limpadores-especiais/descole-removedor-de-cola-e-piche-cadillac-500ml",
"https://www.polibox.com.br/limpadores-especiais/magnus-removedor-de-cola-de-adesivos-graxa-e-piche-evox-500ml",
"https://www.polibox.com.br/limpadores-especiais/megaclean-limpador-super-concentrado-easytech-5-litros-diluicao-ate-1100",
"https://www.polibox.com.br/limpadores-especiais/pluri-fast-limpador-pronto-uso-easytech-500ml",
"https://www.polibox.com.br/limpadores-especiais/tapetex-limpador-para-tapetes-e-carpetes-easytech-5-litros-diluicao-ate-1150",
"https://www.polibox.com.br/limpadores-especiais/ultra-limpador-magil-clean-1-15-litros-diluicao-ate-1100",
"https://www.polibox.com.br/limpadores-especiais/ultra-limpador-magil-clean-5-litros-diluicao-ate-1100",
"https://www.polibox.com.br/limpadores-especiais/zyon-limpador-automotivo-zacs-500ml",
]
order_set = set(order)

by_url = {}
for f in files:
    with open(f) as fh:
        d = fh.read()
    try:
        j = json.loads(d)
        url = j["results"][0]["url"]
        content = j["results"][0].get("rawContent") or ""
    except:
        continue
    if url not in order_set:
        continue
    imgs = pattern.findall(content)
    imgs = [i for i in imgs if not skip.search(i)]
    seen = set()
    deduped = []
    for i in imgs:
        if i not in seen:
            seen.add(i)
            deduped.append(i)
    by_url[url] = deduped

with open("/tmp/cc-agent/68779494/project/results.jsonl", "w") as out:
    for u in order:
        imgs = by_url.get(u, [])
        out.write(json.dumps({"url": u, "images": imgs}, ensure_ascii=False) + "\n")
print("done", len(order))
