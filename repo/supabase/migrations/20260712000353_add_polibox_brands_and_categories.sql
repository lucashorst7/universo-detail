-- Brands from Polibox catalog
INSERT INTO brands (name, slug, description, country, is_featured) VALUES
  ('Vonixx', 'vonixx', 'Marca brasileira de produtos de estética automotiva, reconhecida por suas linhas de shampoos, ceras, polidores e vitrificadores.', 'Brasil', true),
  ('EasyTech', 'easytech', 'Marca nacional especializada em produtos profissionais para estética automotiva, com linha completa de shampoos, compostos, APCs e produtos de couro.', 'Brasil', true),
  ('Lincoln', 'lincoln', 'Marca tradicional brasileira de produtos automotivos, conhecida por compostos polidores, ceras e limpadores de alta qualidade.', 'Brasil', true),
  ('Cadillac', 'cadillac', 'Marca brasileira de produtos para estética automotiva, com linha de compostos polidores, ceras e APCs.', 'Brasil', false),
  ('Soft99', 'soft99', 'Marca japonesa renomada mundialmente por suas ceras, selantes e cristalizadores de vidros de alta performance.', 'Japão', true),
  ('Menzerna', 'menzerna', 'Marca alemã referência mundial em compostos polidores profissionais para polimento técnico automotivo.', 'Alemanha', true),
  ('Autoamerica', 'autoamerica', 'Marca brasileira com linha completa de produtos para estética automotiva, de shampoos a ceras e microfibras.', 'Brasil', false),
  ('Vintex', 'vintex', 'Marca brasileira de produtos automotivos, conhecida por shampoos, pneu pretinho e massas de polir.', 'Brasil', false),
  ('Mothers', 'mothers', 'Marca americana premium de produtos para cuidado automotivo, com linha de shampoos, ceras e limpadores de couro.', 'Estados Unidos', false),
  ('Sonax', 'sonax', 'Marca alemã de produtos automotivos de alta qualidade, com linha completa de limpeza, proteção e cuidado.', 'Alemanha', false),
  ('CarPro', 'carpro', 'Marca especializada em produtos de detalhamento automotivo premium, com APCs, selantes e produtos cerâmicos.', 'Coreia do Sul', false),
  ('Evox', 'evox', 'Marca brasileira de produtos para estética automotiva, com ceras, limpadores de couro e shampoos.', 'Brasil', false),
  ('Autoshine', 'autoshine', 'Marca nacional de produtos automotivos com linha de hidratantes de couro, ceras e cristalizadores.', 'Brasil', false),
  ('Alcance', 'alcance', 'Marca brasileira especializada em vitrificadores cerâmicos e grafeno de alta durabilidade.', 'Brasil', false),
  ('Areon', 'areon', 'Marca europeia especializada em aromatizantes e perfumes automotivos premium.', 'Bulgária', false),
  ('Little Trees', 'little-trees', 'Marca americana icônica de aromatizantes automotivos com clássicos formatos de árvore.', 'Estados Unidos', false),
  ('Sandet', 'sandet', 'Marca brasileira de produtos automotivos, com linha de limpadores e finalizadores para pneus.', 'Brasil', false),
  ('Protelim', 'protelim', 'Marca brasileira de produtos de limpeza automotiva industrial, com detergentes e shampoos concentrados.', 'Brasil', false),
  ('Detailer', 'detailer', 'Marca de acessórios e utilitários para detalhamento automotivo, com escovas, aplicadores e flanelas.', 'Brasil', false),
  ('Auto Crazy', 'auto-crazy', 'Marca de acessórios para detalhamento, especializada em flanelas e toalhas de microfibra.', 'Brasil', false),
  ('Dimension', 'dimension', 'Marca premium de produtos para coating cerâmico e proteção automotiva de alta performance.', 'Brasil', false),
  ('Nobre Car', 'nobre-car', 'Marca brasileira de produtos para estética automotiva com linha de shampoos e cuidados.', 'Brasil', false)
ON CONFLICT (slug) DO NOTHING;

-- New categories for Vidros and Aromatizantes
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
  ('Vidros & Cristalizadores', 'vidros-cristalizadores', 'Produtos para limpeza, cristalização e repelência de vidros automotivos.', 'eye', 6),
  ('Aromatizantes & Perfumes', 'aromatizantes-perfumes', 'Aromatizantes, perfumes e odorizadores para o interior do veículo.', 'sparkles', 7)
ON CONFLICT (slug) DO NOTHING;
