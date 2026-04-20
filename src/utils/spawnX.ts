/**
 * Escolhe uma posição X (0..100 ≈ %) pra spawnar um balão/torta nova,
 * evitando sobreposição com itens ativos.
 *
 * - `existing`: posições X (0..100) dos itens já visíveis.
 * - `minDist`: distância mínima em % entre centros (default 32).
 * - `range`: [min, max] da faixa de X válidos (default [5, 85]).
 *
 * Tenta algumas vezes com random; se não conseguir espaçar, devolve o ponto
 * da grade com maior distância mínima aos existentes (best-effort).
 */
export function pickSpawnX(
  existing: number[],
  opts: { minDist?: number; range?: [number, number]; attempts?: number } = {}
): number {
  const minDist = opts.minDist ?? 32;
  const [lo, hi] = opts.range ?? [5, 85];
  const attempts = opts.attempts ?? 8;

  for (let i = 0; i < attempts; i++) {
    const x = lo + Math.random() * (hi - lo);
    if (existing.every((ex) => Math.abs(x - ex) >= minDist)) return x;
  }

  // Fallback: varre a faixa em passos e pega o ponto com maior "folga".
  let bestX = lo;
  let bestDist = -1;
  for (let cand = lo; cand <= hi; cand += 4) {
    const d = existing.length === 0 ? Infinity : Math.min(...existing.map((ex) => Math.abs(cand - ex)));
    if (d > bestDist) {
      bestDist = d;
      bestX = cand;
    }
  }
  return bestX;
}
