export type FieldType = 'text' | 'longtext' | 'number' | 'select' | 'multiselect' | 'boolean' | 'dilution' | 'volumetries'

export interface SpecField {
  key: string
  label: string
  type: FieldType
  options?: string[]
  unit?: string
  placeholder?: string
  help?: string
  showOnSubtypes?: string[]
  showOnProductType?: string[]
}

export interface CategorySpec {
  slug: string
  hasSubtype: boolean
  subtypeLabel?: string
  subtypeOptions?: string[]
  fields: SpecField[]
}

const acessorios: CategorySpec = {
  slug: 'acessorios-e-ferramentas',
  hasSubtype: false,
  fields: [
    { key: 'usage', label: 'Utilização da ferramenta ou acessório', type: 'longtext', placeholder: 'Explique para que o item serve e em quais tarefas pode ser utilizado...' },
    { key: 'notes', label: 'Observações adicionais', type: 'longtext' },
  ],
}

const aromatizantes: CategorySpec = {
  slug: 'aromatizantes',
  hasSubtype: false,
  fields: [
    { key: 'flavor_type', label: 'Tipo de aromatizador', type: 'select', options: ['Spray', 'Líquido', 'Difusor', 'Gel', 'Sachê', 'Pendurado', 'Aplicação em tecidos', 'Aplicação no sistema de ventilação', 'Outro'] },
    { key: 'fragrance', label: 'Fragrância', type: 'text', placeholder: 'Ex: carro novo, couro, cítrico, amadeirado...' },
    { key: 'olfactory_family', label: 'Família olfativa', type: 'multiselect', options: ['Cítrica', 'Amadeirada', 'Floral', 'Frutal', 'Aromática', 'Doce', 'Fresca', 'Especiada', 'Oriental', 'Couro', 'Outro'] },
    { key: 'intensity', label: 'Intensidade da fragrância', type: 'select', options: ['Suave', 'Moderada', 'Intensa'] },
    { key: 'duration', label: 'Duração estimada', type: 'text', placeholder: 'Ex: 30 dias', help: 'A duração pode variar conforme aplicação, ventilação e temperatura.' },
    { key: 'application_location', label: 'Local de aplicação', type: 'multiselect', options: ['Ambiente interno', 'Tecidos', 'Carpetes', 'Bancos', 'Porta-malas', 'Sistema de ventilação', 'Difusor', 'Outro'] },
    { key: 'application_method', label: 'Forma de aplicação', type: 'text', placeholder: 'Explique como o aromatizador deve ser utilizado...' },
    { key: 'surface_compatibility', label: 'Compatibilidade com superfícies', type: 'text', placeholder: 'Informar se pode ser aplicado diretamente em tecidos, carpetes, plásticos ou apenas no ambiente...' },
    { key: 'stain_risk', label: 'Risco de manchas', type: 'select', options: ['Não informado', 'Não mancha quando utilizado corretamente', 'Exige teste prévio', 'Não aplicar diretamente nas superfícies'] },
    { key: 'precautions', label: 'Cuidados de utilização', type: 'longtext', placeholder: 'Ex: evitar contato com couro, painéis, telas, superfícies pintadas, olhos, crianças ou animais...' },
    { key: 'notes', label: 'Observações adicionais', type: 'longtext' },
  ],
}

const cerasSelantes: CategorySpec = {
  slug: 'ceras-e-selantes',
  hasSubtype: false,
  fields: [
    { key: 'product_type', label: 'Tipo de produto', type: 'select', options: ['Cere de carnaúba', 'Cere sintética', 'Cere híbrida', 'Cere líquida', 'Cere em pasta', 'Cere spray', 'Selante de pintura', 'Selante de vidros', 'Selante para plásticos', 'Manutenção de vitrificador', 'Outro'] },
    { key: 'application_surface', label: 'Superfície de aplicação', type: 'multiselect', options: ['Pintura', 'Vidros', 'Plásticos', 'Faróis', 'Rodas', 'Superfícies cromadas', 'Outro'] },
    { key: 'technology', label: 'Tecnologia ou base principal', type: 'select', options: ['Carnaúba', 'Polímeros sintéticos', 'Sílica ou SiO₂', 'Fórmula híbrida', 'Não informado'] },
    { key: 'finish', label: 'Acabamento proporcionado', type: 'multiselect', options: ['Brilho intenso', 'Efeito molhado', 'Profundidade de cor', 'Toque liso', 'Acabamento natural', 'Repelência à água', 'Outro'] },
    { key: 'durability', label: 'Durabilidade estimada da proteção', type: 'text', placeholder: 'Ex: 3 meses', help: 'A durabilidade depende da preparação, aplicação, manutenção e exposição do veículo.' },
    { key: 'water_repellency', label: 'Nível de repelência à água', type: 'select', options: ['Baixo', 'Moderado', 'Alto', 'Não informado'] },
    { key: 'curing_time', label: 'Tempo de cura', type: 'text', placeholder: 'Ex: 1 hora ou Não exige cura' },
    { key: 'wait_time', label: 'Tempo de espera para remoção', type: 'text', placeholder: 'Ex: 5 minutos' },
    { key: 'application_method', label: 'Método de aplicação', type: 'multiselect', options: ['Aplicador manual', 'Pano de microfibra', 'Pulverizador', 'Politriz', 'Outro'] },
    { key: 'preparation', label: 'Preparação necessária', type: 'text', placeholder: 'Ex: exige descontaminação, polimento, superfície seca...' },
    { key: 'coating_compat', label: 'Compatibilidade com vitrificadores', type: 'select', options: ['Pode ser utilizado sobre vitrificadores', 'Indicado para manutenção de vitrificadores', 'Não recomendado sobre vitrificadores', 'Não informado'] },
    { key: 'cleaning_action', label: 'Possui ação limpadora ou abrasiva', type: 'select', options: ['Sim', 'Não', 'Não informado'] },
    { key: 'yield', label: 'Rendimento estimado', type: 'text', placeholder: 'Ex: 5 veículos, 10 m²...' },
    { key: 'usage_instructions', label: 'Modo de uso', type: 'longtext' },
    { key: 'precautions', label: 'Cuidados de utilização', type: 'longtext', placeholder: 'Ex: não aplicar sob o sol, em superfície quente...' },
    { key: 'notes', label: 'Observações adicionais', type: 'longtext' },
  ],
}

const limpezaVidros: CategorySpec = {
  slug: 'limpeza-de-vidros',
  hasSubtype: false,
  fields: [
    { key: 'product_type', label: 'Tipo de produto', type: 'select', options: ['Limpa-vidros', 'Desengordurante para vidros', 'Removedor de marcas dágua', 'Removedor de resíduos minerais', 'Antiembaçante', 'Limpador de películas', 'Outro'] },
    { key: 'usage_area', label: 'Área de utilização', type: 'select', options: ['Vidros internos', 'Vidros externos', 'Uso interno e externo'] },
    { key: 'ready_to_use', label: 'Produto pronto para uso ou concentrado', type: 'select', options: ['Pronto para uso', 'Concentrado', 'Não informado'] },
    { key: 'ph', label: 'pH', type: 'text', placeholder: 'Ex: 7.0 ou Não informado' },
    { key: 'dilutions', label: 'Diluição recomendada', type: 'dilution' },
    { key: 'ammonia', label: 'Contém amônia', type: 'select', options: ['Sim', 'Não', 'Não informado'] },
    { key: 'film_compat', label: 'Compatível com películas automotivas', type: 'select', options: ['Sim', 'Não', 'Exige teste prévio', 'Não informado'] },
    { key: 'surface_compat', label: 'Compatibilidade com superfícies', type: 'multiselect', options: ['Vidros', 'Espelhos', 'Películas', 'Acrílico', 'Policarbonato', 'Telas', 'Outro'] },
    { key: 'dirt_type', label: 'Tipo de sujeira removida', type: 'multiselect', options: ['Gordura', 'Marcas de dedos', 'Fumaça', 'Nicotina', 'Poeira', 'Resíduos de insetos', 'Marcas dágua', 'Contaminação mineral', 'Outro'] },
    { key: 'antifog', label: 'Possui efeito antiembaçante', type: 'select', options: ['Sim', 'Não', 'Não informado'] },
    { key: 'residue', label: 'Deixa resíduos ou manchas', type: 'select', options: ['Não deixa resíduos quando utilizado corretamente', 'Pode exigir acabamento com microfibra seca', 'Não informado'] },
    { key: 'action_time', label: 'Tempo de ação', type: 'text', placeholder: 'Ex: 2 minutos' },
    { key: 'usage_instructions', label: 'Modo de uso', type: 'longtext' },
    { key: 'precautions', label: 'Cuidados de utilização', type: 'longtext', placeholder: 'Destacar incompatibilidades com películas, telas, plásticos, acrílicos...' },
    { key: 'notes', label: 'Observações adicionais', type: 'longtext' },
  ],
}

const limpezaExterna: CategorySpec = {
  slug: 'limpeza-externa',
  hasSubtype: false,
  fields: [
    { key: 'product_type', label: 'Tipo de produto', type: 'select', options: ['Shampoo neutro', 'Shampoo alcalino', 'Shampoo ácido', 'Shampoo com cera', 'Lava-autos', 'Detergente automotivo', 'Pré-lavador', 'Snow foam', 'Desengraxante', 'Desincrustante', 'Limpador multiuso externo', 'Outro'] },
    { key: 'main_indication', label: 'Indicação principal', type: 'multiselect', options: ['Lavagem de manutenção', 'Pré-lavagem', 'Lavagem técnica', 'Limpeza pesada', 'Remoção de gordura', 'Remoção de sujeira mineral', 'Remoção de barro', 'Remoção de fuligem', 'Descontaminação', 'Outro'] },
    { key: 'ph', label: 'pH', type: 'text', placeholder: 'Ex: 7.0 ou Não informado' },
    { key: 'chemical_class', label: 'Classificação química', type: 'select', options: ['Ácido', 'Neutro', 'Alcalino', 'Não informado'] },
    { key: 'ready_to_use', label: 'Produto pronto para uso ou concentrado', type: 'select', options: ['Pronto para uso', 'Concentrado', 'Não informado'] },
    { key: 'dilutions', label: 'Diluições recomendadas', type: 'dilution' },
    { key: 'removes_protections', label: 'Remove ceras, selantes ou vitrificadores', type: 'select', options: ['Não remove proteções quando utilizado corretamente', 'Pode reduzir ceras e selantes', 'Remove ceras e selantes', 'Pode afetar vitrificadores', 'Produto indicado para remoção de proteções', 'Não informado'] },
    { key: 'foam_level', label: 'Nível de formação de espuma', type: 'select', options: ['Baixo', 'Moderado', 'Alto', 'Não informado'] },
    { key: 'lubricity', label: 'Nível de lubricidade', type: 'select', options: ['Baixo', 'Moderado', 'Alto', 'Não informado'] },
    { key: 'application_methods', label: 'Métodos de aplicação', type: 'multiselect', options: ['Balde', 'Pulverizador', 'Pulverizador de compressão', 'Canhão de espuma', 'Snow foam', 'Tornador', 'Aplicação manual', 'Outro'] },
    { key: 'compatible_surfaces', label: 'Superfícies compatíveis', type: 'multiselect', options: ['Pintura', 'Vidros', 'Plásticos', 'Borrachas', 'Rodas', 'Pneus', 'Motor', 'Caixa de roda', 'Chassi', 'Outro'] },
    { key: 'action_time', label: 'Tempo de ação', type: 'text', placeholder: 'Ex: 2 minutos ou Não deixar secar' },
    { key: 'needs_rinse', label: 'Necessidade de enxágue', type: 'select', options: ['Sim', 'Não', 'Depende da aplicação'] },
    { key: 'usage_instructions', label: 'Modo de uso', type: 'longtext' },
    { key: 'precautions', label: 'Cuidados de utilização', type: 'longtext' },
    { key: 'notes', label: 'Observações adicionais', type: 'longtext' },
  ],
}

const limpezaInterna: CategorySpec = {
  slug: 'limpeza-interna',
  hasSubtype: false,
  fields: [
    { key: 'product_type', label: 'Tipo de produto', type: 'select', options: ['APC', 'Limpador de tecidos', 'Limpador de carpetes', 'Limpador de bancos', 'Limpador de couro', 'Hidratante de couro', 'Limpador e hidratante de couro', 'Limpador de plásticos', 'Limpador de painéis', 'Protetor de plásticos internos', 'Outro'] },
    { key: 'main_function', label: 'Função principal', type: 'multiselect', options: ['Limpar', 'Desengordurar', 'Remover manchas', 'Hidratar', 'Proteger', 'Renovar', 'Neutralizar odores', 'Outro'] },
    { key: 'ready_to_use', label: 'Produto pronto para uso ou concentrado', type: 'select', options: ['Pronto para uso', 'Concentrado', 'Não informado'] },
    { key: 'ph', label: 'pH', type: 'text', placeholder: 'Ex: 9.5 ou Não informado' },
    { key: 'dilutions', label: 'Diluições recomendadas', type: 'dilution' },
    { key: 'compatible_surfaces', label: 'Superfícies compatíveis', type: 'multiselect', options: ['Tecidos', 'Carpetes', 'Couro natural', 'Couro sintético', 'Couro perfurado', 'Plásticos', 'Vinil', 'Borracha', 'Painéis', 'Forro de teto', 'Cintos de segurança', 'Outro'] },
    { key: 'needs_rinse', label: 'Necessita enxágue', type: 'select', options: ['Sim', 'Não', 'Depende da superfície', 'Não informado'] },
    { key: 'needs_extractor', label: 'Necessita extratora', type: 'select', options: ['Sim', 'Não', 'Opcional', 'Não informado'] },
    { key: 'finish', label: 'Acabamento proporcionado', type: 'select', options: ['Fosco', 'Natural', 'Acetinado', 'Brilhante', 'Não altera o acabamento', 'Não informado'] },
    { key: 'uv_protection', label: 'Possui proteção contra raios UV', type: 'select', options: ['Sim', 'Não', 'Não informado'] },
    { key: 'moisturizing', label: 'Possui ação hidratante', type: 'select', options: ['Sim', 'Não', 'Não informado'] },
    { key: 'residual_fragrance', label: 'Fragrância residual', type: 'select', options: ['Sem fragrância', 'Suave', 'Moderada', 'Intensa', 'Não informado'] },
    { key: 'leaves_residue', label: 'Deixa resíduos', type: 'select', options: ['Não', 'Pode exigir remoção com pano úmido', 'Exige enxágue ou extração', 'Não informado'] },
    { key: 'usage_instructions', label: 'Modo de uso', type: 'longtext' },
    { key: 'precautions', label: 'Cuidados de utilização', type: 'longtext', placeholder: 'Destacar necessidade de teste prévio em couro, tecidos delicados, forro de teto...' },
    { key: 'notes', label: 'Observações adicionais', type: 'longtext' },
  ],
}

const pneusRodas: CategorySpec = {
  slug: 'pneus-e-rodas',
  hasSubtype: false,
  fields: [
    { key: 'product_type', label: 'Tipo de produto', type: 'select', options: ['Pretinho para pneus', 'Renovador de pneus', 'Selante para pneus', 'Coating para pneus', 'Limpador de pneus', 'Limpador de rodas', 'Descontaminante ferroso', 'Desengraxante para rodas', 'Limpador ácido para rodas', 'Outro'] },
    { key: 'application_surface', label: 'Superfície de aplicação', type: 'multiselect', options: ['Pneus', 'Rodas', 'Caixas de roda', 'Pinças de freio', 'Componentes metálicos', 'Outro'] },
    { key: 'ready_to_use', label: 'Produto pronto para uso ou concentrado', type: 'select', options: ['Pronto para uso', 'Concentrado', 'Não informado'] },
    { key: 'ph', label: 'pH', type: 'text', placeholder: 'Ex: 6.0 ou Não informado' },
    { key: 'chemical_class', label: 'Classificação química', type: 'select', options: ['Ácido', 'Neutro', 'Alcalino', 'Não informado'] },
    { key: 'dilutions', label: 'Diluições recomendadas', type: 'dilution' },
    { key: 'tire_finish', label: 'Acabamento no pneu', type: 'select', options: ['Fosco', 'Natural', 'Acetinado', 'Brilhante', 'Brilho intenso', 'Não informado'], showOnProductType: ['Pretinho para pneus', 'Renovador de pneus', 'Selante para pneus', 'Coating para pneus'] },
    { key: 'tire_durability', label: 'Durabilidade estimada no pneu', type: 'text', placeholder: 'Ex: 30 dias', showOnProductType: ['Pretinho para pneus', 'Renovador de pneus', 'Selante para pneus', 'Coating para pneus'] },
    { key: 'water_resistance', label: 'Resistência à água', type: 'select', options: ['Baixa', 'Moderada', 'Alta', 'Não informado'], showOnProductType: ['Pretinho para pneus', 'Renovador de pneus', 'Selante para pneus', 'Coating para pneus'] },
    { key: 'drying_time', label: 'Tempo de secagem ou cura', type: 'text', placeholder: 'Ex: 10 minutos', showOnProductType: ['Pretinho para pneus', 'Selante para pneus', 'Coating para pneus'] },
    { key: 'splash_risk', label: 'Risco de respingos durante a rodagem', type: 'select', options: ['Baixo quando aplicado corretamente', 'Pode respingar se houver excesso', 'Não informado'], showOnProductType: ['Pretinho para pneus', 'Renovador de pneus', 'Selante para pneus', 'Coating para pneus'] },
    { key: 'iron_reaction', label: 'Possui reação ferrosa com mudança de cor', type: 'select', options: ['Sim', 'Não', 'Não informado'], showOnProductType: ['Descontaminante ferroso'] },
    { key: 'wheel_finishes_compat', label: 'Acabamentos de rodas compatíveis', type: 'multiselect', options: ['Rodas pintadas', 'Rodas envernizadas', 'Rodas cromadas', 'Alumínio polido', 'Rodas diamantadas', 'Rodas foscas', 'Rodas vitrificadas', 'Não informado'] },
    { key: 'removes_wheel_protections', label: 'Remove ceras, selantes ou coatings das rodas', type: 'select', options: ['Não', 'Pode reduzir a proteção', 'Sim', 'Não informado'] },
    { key: 'action_time', label: 'Tempo de ação', type: 'text', placeholder: 'Ex: 3 minutos ou Não deixar secar' },
    { key: 'agitation', label: 'Necessidade de agitação', type: 'select', options: ['Não', 'Recomendada', 'Obrigatória', 'Depende do nível de sujeira'] },
    { key: 'usage_instructions', label: 'Modo de uso', type: 'longtext' },
    { key: 'precautions', label: 'Cuidados de utilização', type: 'longtext' },
    { key: 'notes', label: 'Observações adicionais', type: 'longtext' },
  ],
}

const polimentoVitrificadores: CategorySpec = {
  slug: 'polimento-e-vitrificadores',
  hasSubtype: true,
  subtypeLabel: 'Tipo de produto',
  subtypeOptions: [
    'Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step',
    'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento',
    'Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos',
    'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção',
  ],
  fields: [
    { key: 'polish_surface', label: 'Superfície indicada', type: 'multiselect', options: ['Pintura', 'Verniz automotivo', 'Vidros', 'Faróis', 'Black piano', 'Metais', 'Outro'], showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'cut_level', label: 'Nível de corte (0-10)', type: 'text', placeholder: 'Ex: 7 ou Não informado', showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'finish_level', label: 'Nível de acabamento (0-10)', type: 'text', placeholder: 'Ex: 8 ou Não informado', showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'polish_step', label: 'Etapa do polimento', type: 'select', options: ['Corte', 'Refino', 'Lustro', 'One step', 'Acabamento', 'Polimento manual', 'Outro'], showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'abrasive_tech', label: 'Tecnologia dos abrasivos', type: 'select', options: ['Abrasivos de quebra', 'Abrasivos não decrescentes', 'Tecnologia híbrida', 'Não informado'], showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'machine_compat', label: 'Tipo de máquina compatível', type: 'multiselect', options: ['Politriz rotativa', 'Politriz roto-orbital', 'Politriz de movimento forçado', 'Aplicação manual', 'Outro'], showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'pad_recommended', label: 'Boina recomendada', type: 'multiselect', options: ['Lã', 'Microfibra', 'Espuma agressiva', 'Espuma média', 'Espuma macia', 'Boina específica do fabricante', 'Não informado'], showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'dust_level', label: 'Nível de geração de pó', type: 'select', options: ['Baixo', 'Moderado', 'Alto', 'Não informado'], showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'work_time', label: 'Tempo de trabalho', type: 'text', placeholder: 'Ex: 2 minutos por painel', showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'has_fillers', label: 'Possui mascaradores ou fillers', type: 'select', options: ['Sim', 'Não', 'Não informado'], showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'has_silicone', label: 'Possui silicone', type: 'select', options: ['Sim', 'Não', 'Não informado'], showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'repaint_safe', label: 'Indicado para uso em repintagem', type: 'select', options: ['Sim', 'Não', 'Não informado'], showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'polish_usage', label: 'Modo de uso', type: 'longtext', placeholder: 'Quantidade, velocidade da máquina, pressão, número de passadas, remoção do resíduo...', showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'polish_precautions', label: 'Cuidados de utilização', type: 'longtext', showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'polish_notes', label: 'Observações adicionais', type: 'longtext', showOnSubtypes: ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento'] },
    { key: 'coat_surface', label: 'Superfície indicada', type: 'multiselect', options: ['Pintura', 'Vidros', 'Rodas', 'Plásticos', 'Faróis', 'Metais', 'Outro'], showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_technology', label: 'Tecnologia ou composição declarada', type: 'select', options: ['SiO₂', 'Polissilazano', 'Grafeno', 'Cerâmica', 'Polímeros', 'Não informado'], showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_durability', label: 'Durabilidade estimada', type: 'text', placeholder: 'Ex: 1 ano', help: 'A durabilidade depende da preparação, aplicação, manutenção e condições de uso.', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_hardness', label: 'Dureza declarada pelo fabricante', type: 'text', placeholder: 'Ex: 9H ou Não informado', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_water_repellency', label: 'Nível de repelência à água', type: 'select', options: ['Baixo', 'Moderado', 'Alto', 'Muito alto', 'Não informado'], showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_finish', label: 'Acabamento proporcionado', type: 'multiselect', options: ['Brilho', 'Profundidade de cor', 'Toque liso', 'Efeito molhado', 'Repelência à água', 'Facilidade de limpeza', 'Outro'], showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_layers', label: 'Número recomendado de camadas', type: 'select', options: ['Uma camada', 'Duas ou mais camadas', 'Não informado'], showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_layer_interval', label: 'Intervalo entre camadas', type: 'text', placeholder: 'Ex: 1 hora', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'flash_time', label: 'Tempo de flash', type: 'text', placeholder: 'Ex: 30 segundos', help: 'O tempo pode variar conforme temperatura e umidade.', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'initial_cure_time', label: 'Tempo de cura inicial', type: 'text', placeholder: 'Ex: 2 horas', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'total_cure_time', label: 'Tempo de cura total', type: 'text', placeholder: 'Ex: 24 horas', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'no_water_time', label: 'Tempo sem contato com água', type: 'text', placeholder: 'Ex: 12 horas', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_yield', label: 'Rendimento estimado', type: 'text', placeholder: 'Ex: 3 veículos, 15 m²...', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_preparation', label: 'Preparação necessária', type: 'longtext', placeholder: 'Ex: lavagem, descontaminação, polimento, desengraxe...', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_conditions', label: 'Condições recomendadas para aplicação', type: 'text', placeholder: 'Ex: 15-30°C, umidade < 70%, ambiente coberto...', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_maintenance', label: 'Manutenção recomendada', type: 'text', placeholder: 'Produtos de manutenção, prazos e cuidados...', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_usage', label: 'Modo de uso', type: 'longtext', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_precautions', label: 'Cuidados de utilização', type: 'longtext', placeholder: 'Uso de EPIs, ventilação, respeito aos tempos de flash e cura...', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
    { key: 'coat_notes', label: 'Observações adicionais', type: 'longtext', showOnSubtypes: ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção'] },
  ],
}

const categorySpecs: Record<string, CategorySpec> = {
  'acessorios-e-ferramentas': acessorios,
  'aromatizantes': aromatizantes,
  'ceras-e-selantes': cerasSelantes,
  'limpeza-de-vidros': limpezaVidros,
  'limpeza-externa': limpezaExterna,
  'limpeza-interna': limpezaInterna,
  'pneus-e-rodas': pneusRodas,
  'polimento-e-vitrificadores': polimentoVitrificadores,
}

export function getCategorySpec(slug: string): CategorySpec | null {
  return categorySpecs[slug] ?? null
}

export function getSpecFieldsForCategory(slug: string, subtype?: string): SpecField[] {
  const spec = categorySpecs[slug]
  if (!spec) return []
  return spec.fields.filter(f => {
    if (!f.showOnSubtypes) return true
    if (!subtype) return true
    return f.showOnSubtypes.includes(subtype)
  })
}

export function getFieldsForCategoryAndProductType(slug: string, productType?: string): SpecField[] {
  const spec = categorySpecs[slug]
  if (!spec) return []
  return spec.fields.filter(f => {
    if (!f.showOnProductType) return true
    if (!productType) return false
    return f.showOnProductType.includes(productType)
  })
}

export function hasSubtype(slug: string): boolean {
  const spec = categorySpecs[slug]
  return spec?.hasSubtype ?? false
}

export function getSubtypeOptions(slug: string): string[] {
  const spec = categorySpecs[slug]
  return spec?.subtypeOptions ?? []
}

export function getSubtypeGroup(subtype: string): 'polimento' | 'vitrificacao' | null {
  const polimentoTypes = ['Composto de corte', 'Composto de refino', 'Composto de lustro', 'Polidor de acabamento', 'Polidor one step', 'Removedor de marcas dágua por polimento', 'Polidor de vidros', 'Polidor manual', 'Glaze', 'Outro produto de polimento']
  const vitrificacaoTypes = ['Vitrificador de pintura', 'Vitrificador de vidros', 'Vitrificador de rodas', 'Vitrificador de plásticos', 'Coating para pintura', 'Coating para vidros', 'Manutenção de coating', 'Outro produto de proteção']
  if (polimentoTypes.includes(subtype)) return 'polimento'
  if (vitrificacaoTypes.includes(subtype)) return 'vitrificacao'
  return null
}

export function getFieldsForCategoryAndSubtype(slug: string, subtype?: string, productType?: string): SpecField[] {
  const spec = categorySpecs[slug]
  if (!spec) return []
  return spec.fields.filter(f => {
    if (f.showOnSubtypes) {
      if (!subtype) return false
      return f.showOnSubtypes.includes(subtype)
    }
    if (f.showOnProductType) {
      if (!productType) return false
      return f.showOnProductType.includes(productType)
    }
    return true
  })
}
