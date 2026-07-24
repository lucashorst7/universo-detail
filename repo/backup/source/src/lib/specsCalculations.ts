export function fmtBRL(value: number): string { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); }
export function fmtNum(value: number): string { return new Intl.NumberFormat('pt-BR').format(value); }
function parseRatio(ratio: string): number { const m = ratio.match(/(\d+)\s*:\s*(\d+)/); if (!m) return 0; const c = parseInt(m[1]); const w = parseInt(m[2]); return c === 0 ? 0 : w / c; }
export function calcDilution(ratio: string | number, bottleMl = 1000): number { const r = typeof ratio === 'string' ? parseRatio(ratio) : ratio; if (!r || r <= 0) return bottleMl; return bottleMl / (r + 1); }
export function calcYield(ratio: string | number, bottleMl: number): number { const r = typeof ratio === 'string' ? parseRatio(ratio) : ratio; if (!r || r <= 0 || !bottleMl || bottleMl <= 0) return 0; return bottleMl * (r + 1); }
export function calcCostPerUse(price: number, uses: number): string { if (uses <= 0) return '—'; return fmtBRL(price / uses); }
export function calcCostPerLiterReady(price: number, ratio: string | number, bottleMl: number): number | null { const r = typeof ratio === 'string' ? parseRatio(ratio) : ratio; if (!r || r <= 0 || !bottleMl || bottleMl <= 0) return null; const totalL = (bottleMl * (r + 1)) / 1000; return totalL <= 0 ? null : price / totalL; }
