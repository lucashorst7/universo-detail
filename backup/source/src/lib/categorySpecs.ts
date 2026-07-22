export interface SpecField { key: string; label: string; type: 'text' | 'number' | 'select' | 'boolean'; unit?: string; options?: string[] }
interface CategorySpecConfig { categoryName: string; fields: SpecField[] }

const categorySpecConfigs: Record<string, CategorySpecConfig> = {
  'shampoo e limpeza externa': { categoryName: 'Shampoo e Limpeza Externa', fields: [
    { key: 'ph', label: 'pH', type: 'number' },
    { key: 'dilution_ratio', label: 'Diluição', type: 'text' },
    { key: 'foam_level', label: 'Nível de Espuma', type: 'select', options: ['Baixo', 'Médio', 'Alto'] },
    { key: 'volume_ml', label: 'Volume', type: 'number', unit: 'ml' },
  ]},
  'limpeza interna': { categoryName: 'Limpeza Interna', fields: [
    { key: 'cleaner_type', label: 'Tipo', type: 'text' },
    { key: 'ph', label: 'pH', type: 'number' },
    { key: 'dilution_ratio', label: 'Diluição', type: 'text' },
    { key: 'surface', label: 'Superfície', type: 'text' },
    { key: 'volume_ml', label: 'Volume', type: 'number', unit: 'ml' },
  ]},
  'ceras e selantes': { categoryName: 'Ceras e Selantes', fields: [
    { key: 'product_type', label: 'Tipo', type: 'select', options: ['Cera', 'Selante', 'Pneu Pretinho', 'Revitalizador de Plásticos'] },
    { key: 'durability_months', label: 'Durabilidade', type: 'number', unit: 'meses' },
    { key: 'application_method', label: 'Método de Aplicação', type: 'text' },
    { key: 'volume_ml', label: 'Volume/Peso', type: 'number', unit: 'g/ml' },
  ]},
  'limpeza de vidros': { categoryName: 'Limpeza de Vidros', fields: [
    { key: 'product_type', label: 'Tipo', type: 'select', options: ['Limpa-vidros', 'Remoção de Chuva Ácida', 'Cristalizador', 'Repelente de Água'] },
    { key: 'volume_ml', label: 'Volume', type: 'number', unit: 'ml' },
  ]},
  'polimento e vitrificadores': { categoryName: 'Polimento e Vitrificadores', fields: [
    { key: 'cut_level', label: 'Nível de Corte', type: 'select', options: ['Leve', 'Médio', 'Pesado', 'Muito Pesado'] },
    { key: 'product_type', label: 'Tipo', type: 'select', options: ['Composto de Polimento', 'Vitrificador'] },
    { key: 'finish_type', label: 'Tipo de Acabamento', type: 'text' },
    { key: 'volume_ml', label: 'Volume', type: 'number', unit: 'ml' },
  ]},
  'flanelas e toalhas': { categoryName: 'Flanelas e Toalhas', fields: [
    { key: 'material', label: 'Material', type: 'text' },
    { key: 'size_cm', label: 'Tamanho', type: 'text', unit: 'cm' },
    { key: 'grammage', label: 'Gramatura', type: 'text', unit: 'g/m²' },
    { key: 'use', label: 'Uso', type: 'select', options: ['Secagem', 'Polimento', 'Aplicação', 'Geral'] },
  ]},
  'acessórios e ferramentas': { categoryName: 'Acessórios e Ferramentas', fields: [
    { key: 'tool_type', label: 'Tipo', type: 'select', options: ['Pincel', 'Snow Foam', 'Escova', 'Luva de Lavagem', 'Outro'] },
    { key: 'material', label: 'Material', type: 'text' },
    { key: 'dimensions', label: 'Dimensões', type: 'text' },
  ]},
  'aromatizantes': { categoryName: 'Aromatizantes', fields: [
    { key: 'fragrance', label: 'Fragrância', type: 'text' },
    { key: 'duration_days', label: 'Duração', type: 'number', unit: 'dias' },
    { key: 'volume_ml', label: 'Volume', type: 'number', unit: 'ml' },
  ]},
}

export function getSpecFieldsForCategory(categoryName: string): SpecField[] {
  const key = categoryName.toLowerCase().trim()
  return categorySpecConfigs[key]?.fields ?? []
}
export function getSpecFieldsByCategoryId(_categoryId: string): SpecField[] { return [] }
