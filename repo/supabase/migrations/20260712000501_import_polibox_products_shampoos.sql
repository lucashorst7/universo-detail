-- Products imported from Polibox catalog (no kits/combos, no prices)
-- Category IDs:
--   shampoos-limpeza:           330f3e55-c35d-411b-afff-3d2184e0f3b9
--   ceras-selantes:             f1341dff-415a-4e17-8262-5549273d6b1d
--   polimentos-compounds:      f13b7270-b3c6-449b-b1d0-78394cafbd51
--   detalhamento-interno:       fc57ced6-8e7f-449e-860d-6fd7fcab1081
--   pneus-rodas:                cb24dc5d-1f78-485b-80bf-6a734afb2f65
--   vidros-cristalizadores:     70c01ac7-0184-4d49-9e17-8887cfd4cf7c
--   aromatizantes-perfumes:     8ef857d3-fd72-4595-8339-a4f25e83dab7
-- Brand IDs:
--   vonixx:     2521bc20-0c66-4bea-91fa-83cef52db28b
--   easytech:   16ed7769-be17-4581-8fbd-90a4d5d6499b
--   lincoln:    791f9478-d15a-4863-966b-90777fa6bfb0
--   cadillac:   89fcb84c-3878-4df6-b40a-091b42980372
--   soft99:     e992f177-70fb-4f9e-8188-455de352d018
--   menzerna:   78b7fed4-2a85-4bfd-8668-9aa21a97d076
--   autoamerica: 2b39cb65-a982-40a6-a5e2-89b41a74bceb
--   vintex:     d4f656fc-78dd-4f8e-a792-0e64df4b49ab
--   mothers:    9d92839d-dd51-4e10-9ee8-8e298075970d
--   sonax:      e2b10d5e-82fd-46ee-bc1c-da5c8d8a1788
--   carpro:     932d8081-e1dc-49e9-921d-2524688ee6a1
--   evox:       d78b1eae-ba8a-4bc9-b51a-9e17174a6cda
--   autoshine:  ea720c10-751e-4e7a-a83c-547e3152d45c
--   alcance:    8b51b80f-04d1-4897-96af-1b0fe342fbf7
--   areon:      385f81e4-b24d-435f-9425-4e642ad1ab49
--   little-trees: 6d378b3b-2d45-4344-bd11-8b115760f614
--   sandet:     60e4659f-4ae3-4f30-9a14-187dc8c8411d
--   protelim:   8da721ad-aaec-4015-80e0-fe8efc9d894f
--   detailer:   2bdadc92-74a3-4390-b2fd-93ec18bad73b
--   auto-crazy: 0034e49a-0e94-44bd-bd3e-782f864ef600

-- ===================== SHAMPOOS & LIMPEZA =====================
INSERT INTO products (name, slug, short_description, description, image_url, gallery_images, category_id, brand_id, status, is_new, is_featured, rating, review_count, specifications) VALUES
('V-FLOC Lava Auto Super Concentrado Vonixx 1,5L', 'v-floc-lava-auto-vonixx-15l',
'Lava autos de alta performance, pH neutro, super concentrado com diluição 1:400.',
'V-FLOC é um lava autos de alta performance e de pH neutro. Sua fórmula contém agentes condicionadores e tensoativos especiais que proporcionam uma lavagem suave e eficiente. V-FLOC tem alto grau de lubrificação, promovendo redução significativa do coeficiente de atrito, proporcionando um melhor deslize da luva de microfibra e reduzindo de forma efetiva as chances de microrriscos na pintura. Também promove brilho e aspecto de renovação da pintura. Diluição: 1:20 para Snow Foam, 1:400 para lavagem comum com balde.',
'https://images.tcdn.com.br/img/img_prod/1152560/v_floc_lava_auto_super_concentrado_diluicao_1_400_vonixx_1_5l_643_1_e1f90007537384edda15cfb2e9030ea1.jpg',
'["https://images.tcdn.com.br/img/img_prod/1152560/v_floc_lava_auto_super_concentrado_diluicao_1_400_vonixx_1_5l_643_1_e1f90007537384edda15cfb2e9030ea1.jpg"]',
'330f3e55-c35d-411b-afff-3d2184e0f3b9', '2521bc20-0c66-4bea-91fa-83cef52db28b', 'published', false, true, 5.0, 4,
'{"pH":"Neutro","Diluição":"1:400 (lavagem) / 1:20 (snow foam)","Rendimento":"Até 600 litros de solução","Volume":"1,5 Litros","Marca":"Vonixx"}'),

('LS1 Detail Wash Shampoo Automotivo Concentrado Lincoln 2L', 'ls1-detail-wash-lincoln-2l',
'Shampoo automotivo concentrado com excelente poder de limpeza e máxima segurança. Diluição 1:400.',
'O LS1 Detail Wash Lincoln associa excelente poder de limpeza com máxima segurança. Limpa sem manchar ou danificar a pintura. Associa alta lubrificação com alto poder de limpeza, removendo sujeiras sem agredir a superfície. pH neutro, indicado para superfícies pintadas, carrocerias de veículos, náuticos e aeronaves.',
'https://images.tcdn.com.br/img/img_prod/1152560/ls1_detail_wash_shampoo_automotivo_concentrado_1_400_lincoln_2_litros_27806_1.jpg',
'["https://images.tcdn.com.br/img/img_prod/1152560/ls1_detail_wash_shampoo_automotivo_concentrado_1_400_lincoln_2_litros_27806_1.jpg"]',
'330f3e55-c35d-411b-afff-3d2184e0f3b9', '791f9478-d15a-4863-966b-90777fa6bfb0', 'published', false, false, 5.0, 2,
'{"pH":"Neutro","Diluição":"1:400","Volume":"2 Litros","Marca":"Lincoln"}'),

('PINK Shampoo Automotivo Híbrido Concentrado EasyTech 1,5L', 'pink-shampoo-hibrido-easytech-15l',
'Shampoo automotivo versátil que age como desengraxante ou shampoo de manutenção conforme diluição.',
'Pink é um shampoo automotivo versátil. Em determinadas concentrações age como um desengraxante ou como um shampoo de manutenção do dia a dia. Super concentrado com diluição de até 1:200, oferece alto rendimento e excelente relação custo-benefício. pH neutro, seguro para todas as superfícies pintadas.',
'https://images.tcdn.com.br/img/img_prod/1152560/pink_shampoo_automotivo_hibrido_concentrado_easytech_15l_diluicao_1_200_29136_1.jpg',
'["https://images.tcdn.com.br/img/img_prod/1152560/pink_shampoo_automotivo_hibrido_concentrado_easytech_15l_diluicao_1_200_29136_1.jpg"]',
'330f3e55-c35d-411b-afff-3d2184e0f3b9', '16ed7769-be17-4581-8fbd-90a4d5d6499b', 'published', true, false, 4.5, 3,
'{"pH":"Neutro","Diluição":"Até 1:200","Volume":"1,5 Litros","Marca":"EasyTech"}'),

('MELON Shampoo Automotivo Super Concentrado EasyTech 5L', 'melon-shampoo-easytech-5l',
'O melhor shampoo automotivo já produzido no Brasil. Super concentrado com diluição 1:400.',
'O MELON é super concentrado, com alto poder de limpeza mesmo diluído em 1:400. pH neutro, promove alta lubrificação e brilho, sem remover ceras ou selantes. Ideal para uso profissional e hobista, oferece rendimento excepcional.',
'https://images.tcdn.com.br/img/img_prod/1152560/melon_shampoo_automotivo_super_concentrado_easytech_5_litros_diluicao_1_400_27944_1.jpg',
'["https://images.tcdn.com.br/img/img_prod/1152560/melon_shampoo_automotivo_super_concentrado_easytech_5_litros_diluicao_1_400_27944_1.jpg"]',
'330f3e55-c35d-411b-afff-3d2184e0f3b9', '16ed7769-be17-4581-8fbd-90a4d5d6499b', 'published', false, true, 5.0, 5,
'{"pH":"Neutro","Diluição":"1:400","Volume":"5 Litros","Marca":"EasyTech"}'),

('Citrus Shampoo Automotivo Evox 500ml', 'citrus-shampoo-evox-500ml',
'Shampoo de alto rendimento com pH neutro que limpa, mantém e renova o brilho sem remover ceras ou selantes.',
'CITRUS é um produto de alto rendimento com pH neutro que limpa, mantém e renova o brilho da pintura sem remover ceras ou selantes da superfície. Diluição de até 1:400, oferece excelente rendimento e lubrificação para lavagem segura.',
'https://images.tcdn.com.br/img/img_prod/1152560/citrus_shampoo_automotivo_evox_500ml_diluicao_ate_1_400_28502_1.jpg',
'["https://images.tcdn.com.br/img/img_prod/1152560/citrus_shampoo_automotivo_evox_500ml_diluicao_ate_1_400_28502_1.jpg"]',
'330f3e55-c35d-411b-afff-3d2184e0f3b9', 'd78b1eae-ba8a-4bc9-b51a-9e17174a6cda', 'published', false, false, 4.0, 2,
'{"pH":"Neutro","Diluição":"Até 1:400","Volume":"500ml","Marca":"Evox"}'),

('Lava Autos Shampoo Automotivo Vintex 500ml', 'lava-autos-vintex-500ml',
'Shampoo automotivo com pH neutro e alta concentração. Diluição 1:40 para lavagem prática e eficiente.',
'Lava Autos Vintex limpa e conserva a pintura do veículo com pH neutro e alta concentração. Diluição 1:40 para lavagem prática e eficiente, removendo sujeiras sem agredir a superfície.',
'https://images.tcdn.com.br/img/img_prod/1152560/lava_autos_shampoo_automotivo_vintex_5_litros_diluicao_1_40_28622_1.jpg',
'["https://images.tcdn.com.br/img/img_prod/1152560/lava_autos_shampoo_automotivo_vintex_5_litros_diluicao_1_40_28622_1.jpg"]',
'330f3e55-c35d-411b-afff-3d2184e0f3b9', 'd4f656fc-78dd-4f8e-a792-0e64df4b49ab', 'published', false, false, 4.0, 1,
'{"pH":"Neutro","Diluição":"1:40","Volume":"500ml","Marca":"Vintex"}'),

('MELON COLOURS Shampoo Espuma Amarela EasyTech 500ml', 'melon-colours-amarela-easytech-500ml',
'Shampoo automotivo neutro com efeito de espuma amarela para diferenciar a lavagem do dia a dia.',
'Melon Colours é um shampoo automotivo neutro com um maravilhoso efeito de espuma Amarela, ideal para diferenciar a lavagem do dia a dia. pH neutro, seguro para todas as superfícies pintadas.',
'https://images.tcdn.com.br/img/img_prod/1152560/melon_colours_shampoo_automotivo_espuma_amarela_easytech_500ml_29035_1.jpg',
'["https://images.tcdn.com.br/img/img_prod/1152560/melon_colours_shampoo_automotivo_espuma_amarela_easytech_500ml_29035_1.jpg"]',
'330f3e55-c35d-411b-afff-3d2184e0f3b9', '16ed7769-be17-4581-8fbd-90a4d5d6499b', 'published', true, false, 4.5, 1,
'{"pH":"Neutro","Volume":"500ml","Cor da Espuma":"Amarela","Marca":"EasyTech"}'),

('PROT SH400 Detergente Automotivo Protelim 20L', 'prot-sh400-protelim-20l',
'Detergente automotivo concentrado de alto rendimento para superfícies pintadas e carrocerias.',
'PROT SH400 é um detergente automotivo concentrado de alto rendimento, indicado para superfícies pintadas, carrocerias de veículos, náuticos, aeronaves, etc. Produto profissional de alta performance para lavagem técnica.',
'https://images.tcdn.com.br/img/img_prod/1152560/prot_sh400_detergente_automotivo_neutro_concentrado_protelim_20_litros_1.jpg',
'["https://images.tcdn.com.br/img/img_prod/1152560/prot_sh400_detergente_automotivo_neutro_concentrado_protelim_20_litros_1.jpg"]',
'330f3e55-c35d-411b-afff-3d2184e0f3b9', '8da721ad-aaec-4015-80e0-fe8efc9d894f', 'published', false, false, 4.0, 1,
'{"pH":"Neutro","Volume":"20 Litros","Marca":"Protelim","Tipo":"Concentrado"}'),

('CMX Ceramic Wash & Coat Shampoo com Cera Mothers 1,4L', 'cmx-ceramic-wash-coat-mothers-14l',
'Shampoo com cera cerâmica que lubrifica, dissolve sujeira e neutraliza minerais causadores de manchas.',
'Esta fórmula de alta eficiência lubrifica e dissolve a sujeira. Suspende os contaminantes opacos, enquanto neutraliza os minerais que causam manchas de água. CMX Ceramic Wash & Coat é um shampoo com tecnologia cerâmica que protege e mantém o brilho da pintura.',
'https://images.tcdn.com.br/img/img_prod/1152560/cmx_ceramic_wash_coat_shampoo_com_cera_mothers_14_l_28587_1.jpg',
'["https://images.tcdn.com.br/img/img_prod/1152560/cmx_ceramic_wash_coat_shampoo_com_cera_mothers_14_l_28587_1.jpg"]',
'330f3e55-c35d-411b-afff-3d2184e0f3b9', '9d92839d-dd51-4e10-9ee8-8e298075970d', 'published', true, false, 4.5, 2,
'{"Volume":"1,4 Litros","Marca":"Mothers","Tipo":"Shampoo com Cera","Tecnologia":"Cerâmica"}')
ON CONFLICT (slug) DO NOTHING;
