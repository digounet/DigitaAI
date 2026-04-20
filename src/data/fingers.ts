// Mapeamento tecla -> dedo responsável (método de digitação por toque padrão).
// 1 = mindinho esquerdo, 2 = anelar esquerdo, 3 = médio esquerdo, 4 = indicador esquerdo,
// 5 = indicador direito,  6 = médio direito,    7 = anelar direito,    8 = mindinho direito,
// 9 = polegar (espaço).
export type Finger = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const FINGER_COLORS: Record<Finger, string> = {
  1: 'bg-coral text-white',
  2: 'bg-tangerine text-white',
  3: 'bg-sun text-gray-800',
  4: 'bg-grass text-white',
  5: 'bg-sky1 text-gray-800',
  6: 'bg-mint text-gray-800',
  7: 'bg-grape text-white',
  8: 'bg-candy text-white',
  9: 'bg-gray-200 text-gray-800',
};

export const FINGER_NAMES: Record<Finger, string> = {
  1: 'mindinho esquerdo',
  2: 'anelar esquerdo',
  3: 'médio esquerdo',
  4: 'indicador esquerdo',
  5: 'indicador direito',
  6: 'médio direito',
  7: 'anelar direito',
  8: 'mindinho direito',
  9: 'polegar',
};

// Teclado ABNT2 simplificado (brasileiro) em três filas.
export const KEY_ROWS: string[][] = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

export const KEY_FINGER: Record<string, Finger> = {
  // números (linha superior)
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 4,
  '6': 5, '7': 5, '8': 6, '9': 7, '0': 8,
  // linha de cima
  q: 1, w: 2, e: 3, r: 4, t: 4,
  y: 5, u: 5, i: 6, o: 7, p: 8,
  // linha de base
  a: 1, s: 2, d: 3, f: 4, g: 4,
  h: 5, j: 5, k: 6, l: 7, 'ç': 8,
  // linha de baixo
  z: 1, x: 2, c: 3, v: 4, b: 4,
  n: 5, m: 5, ',': 6, '.': 7, ';': 7, '/': 8,
  // pontuação comum
  '!': 1, '?': 8,
  // espaço
  ' ': 9,
};

export function fingerFor(ch: string): Finger | undefined {
  const c = ch.toLowerCase();
  return KEY_FINGER[c];
}
