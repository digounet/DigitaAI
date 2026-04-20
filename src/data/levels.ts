export type GameMode = 'balloons' | 'pies' | 'sentence' | 'text';

export type Level = {
  id: string;
  world: number;
  order: number;
  mode: GameMode;
  title: string;
  emoji: string;
  subtitle: string;
  focusKeys: string[];   // teclas novas/focadas desta lição
  pool: string[];        // letras / palavras / frases utilizadas
  target: number;        // itens a completar
  speed?: number;        // segundos para itens descerem (modo balão/tortas)
  maxAtOnce?: number;    // quantos balões/tortas simultâneas (1 = bem calmo)
  goalWpm?: number;      // meta de WPM (p/ frases/textos)
};

// ---------- Pools de palavras e frases (PT-BR, amigáveis) ----------

const HOME_ROW_WORDS = ['asa', 'dá', 'fala', 'lá', 'ala', 'fada', 'saia', 'sala', 'jaca', 'lasca'];
const SIMPLE_WORDS = ['sol', 'lua', 'pão', 'pipa', 'rio', 'casa', 'mel', 'uva', 'azul', 'flor'];
const ANIMAL_WORDS = ['gato', 'cão', 'peixe', 'pato', 'leão', 'rato', 'galo', 'coelho', 'urso', 'cavalo'];
const FRUIT_WORDS = ['banana', 'maçã', 'melão', 'uva', 'abacaxi', 'laranja', 'morango', 'pera'];
const MEDIUM_WORDS = ['escola', 'amigo', 'brincar', 'jardim', 'família', 'alegria', 'sonhar', 'cantar', 'pintar', 'correr'];

const KID_SENTENCES = [
  'o gato pulou no muro',
  'eu gosto de chocolate',
  'a pipa voou bem alto',
  'minha mãe faz bolo',
  'vamos brincar no parque',
  'o sol brilha no céu azul',
  'a lua apareceu na janela',
  'meu cachorro se chama rex',
  'as estrelas piscam à noite',
  'o peixe nada no rio',
];

const KID_TEXTS = [
  'era uma vez um pequeno dragão que tinha medo de fogo. ele gostava mesmo era de soprar bolhas coloridas pelo céu.',
  'a joaninha vermelha pousou na flor amarela. ela contou as pétalas uma a uma e sorriu para a abelha passageira.',
  'no fundo do mar havia um caracol curioso. todo dia ele acordava cedo para descobrir um novo tesouro brilhante.',
];

// Helper: repete letras para o pool do modo balão ficar bem enxuto
const only = (chars: string[]): string[] => chars;

// ---------- Níveis ----------
// Regra: cada lição introduz 1 letra nova. Depois tem uma lição de revisão
// combinando a nova com as anteriores.
export const LEVELS: Level[] = [
  // ===== MUNDO 1 — LINHA DE BASE (home row) =====
  // Teclas-guia F e J primeiro (têm relevinhos no teclado físico)
  {
    id: 'w1-l1', world: 1, order: 1, mode: 'balloons',
    title: 'Descubra F', emoji: '🎈',
    subtitle: 'Use o indicador esquerdo. Sinta o relevinho!',
    focusKeys: ['f'], pool: only(['f']),
    target: 6, speed: 15, maxAtOnce: 1,
  },
  {
    id: 'w1-l2', world: 1, order: 2, mode: 'balloons',
    title: 'Descubra J', emoji: '🎈',
    subtitle: 'Use o indicador direito. Relevinho também!',
    focusKeys: ['j'], pool: only(['j']),
    target: 6, speed: 15, maxAtOnce: 1,
  },
  {
    id: 'w1-l3', world: 1, order: 3, mode: 'balloons',
    title: 'F e J juntos', emoji: '🎈',
    subtitle: 'Alternando as teclas-guia.',
    focusKeys: ['f', 'j'], pool: only(['f', 'j']),
    target: 10, speed: 14, maxAtOnce: 1,
  },
  {
    id: 'w1-l4', world: 1, order: 4, mode: 'balloons',
    title: 'Descubra D', emoji: '🎈',
    subtitle: 'Dedo médio esquerdo — coladinho no F.',
    focusKeys: ['d'], pool: only(['d']),
    target: 6, speed: 14, maxAtOnce: 1,
  },
  {
    id: 'w1-l5', world: 1, order: 5, mode: 'balloons',
    title: 'Descubra K', emoji: '🎈',
    subtitle: 'Dedo médio direito — coladinho no J.',
    focusKeys: ['k'], pool: only(['k']),
    target: 6, speed: 14, maxAtOnce: 1,
  },
  {
    id: 'w1-l6', world: 1, order: 6, mode: 'balloons',
    title: 'D K F J', emoji: '🎈',
    subtitle: 'Revisão com os quatro dedos médios/indicadores.',
    focusKeys: ['d', 'k', 'f', 'j'], pool: only(['d', 'k', 'f', 'j']),
    target: 12, speed: 13, maxAtOnce: 2,
  },
  {
    id: 'w1-l7', world: 1, order: 7, mode: 'balloons',
    title: 'Descubra S', emoji: '🎈',
    subtitle: 'Anelar esquerdo.',
    focusKeys: ['s'], pool: only(['s']),
    target: 6, speed: 13, maxAtOnce: 1,
  },
  {
    id: 'w1-l8', world: 1, order: 8, mode: 'balloons',
    title: 'Descubra L', emoji: '🎈',
    subtitle: 'Anelar direito.',
    focusKeys: ['l'], pool: only(['l']),
    target: 6, speed: 13, maxAtOnce: 1,
  },
  {
    id: 'w1-l9', world: 1, order: 9, mode: 'balloons',
    title: 'S L com as amigas', emoji: '🎈',
    subtitle: 'Misturando S, L, D, K, F, J.',
    focusKeys: ['s', 'l'], pool: only(['s', 'l', 'd', 'k', 'f', 'j']),
    target: 14, speed: 12, maxAtOnce: 2,
  },
  {
    id: 'w1-l10', world: 1, order: 10, mode: 'balloons',
    title: 'Descubra A', emoji: '🎈',
    subtitle: 'Mindinho esquerdo.',
    focusKeys: ['a'], pool: only(['a']),
    target: 6, speed: 12, maxAtOnce: 1,
  },
  {
    id: 'w1-l11', world: 1, order: 11, mode: 'balloons',
    title: 'Descubra Ç', emoji: '🎈',
    subtitle: 'Mindinho direito.',
    focusKeys: ['ç'], pool: only(['ç']),
    target: 6, speed: 12, maxAtOnce: 1,
  },
  {
    id: 'w1-l12', world: 1, order: 12, mode: 'balloons',
    title: 'Linha de base completa', emoji: '🎈',
    subtitle: 'A S D F J K L Ç — todos os dedos!',
    focusKeys: ['a', 'ç'], pool: only(['a', 's', 'd', 'f', 'j', 'k', 'l', 'ç']),
    target: 18, speed: 11, maxAtOnce: 2,
  },
  {
    id: 'w1-l13', world: 1, order: 13, mode: 'pies',
    title: 'Palavras da base', emoji: '🥧',
    subtitle: 'Só com a linha de base!',
    focusKeys: [], pool: HOME_ROW_WORDS,
    target: 8, speed: 14, maxAtOnce: 1,
  },

  // ===== MUNDO 2 — LINHA DE CIMA =====
  // Dedos sobem para top row, aos pares.
  {
    id: 'w2-l1', world: 2, order: 1, mode: 'balloons',
    title: 'Descubra E', emoji: '🎈',
    subtitle: 'Dedo médio esquerdo sobe (do D).',
    focusKeys: ['e'], pool: only(['e']),
    target: 6, speed: 13, maxAtOnce: 1,
  },
  {
    id: 'w2-l2', world: 2, order: 2, mode: 'balloons',
    title: 'Descubra I', emoji: '🎈',
    subtitle: 'Dedo médio direito sobe (do K).',
    focusKeys: ['i'], pool: only(['i']),
    target: 6, speed: 13, maxAtOnce: 1,
  },
  {
    id: 'w2-l3', world: 2, order: 3, mode: 'balloons',
    title: 'E I + base', emoji: '🎈',
    subtitle: 'Mistura com a linha de base.',
    focusKeys: ['e', 'i'], pool: only(['e', 'i', 'd', 'k', 'f', 'j']),
    target: 14, speed: 12, maxAtOnce: 2,
  },
  {
    id: 'w2-l4', world: 2, order: 4, mode: 'balloons',
    title: 'R e U', emoji: '🎈',
    subtitle: 'Indicadores esticam para cima.',
    focusKeys: ['r', 'u'], pool: only(['r', 'u']),
    target: 8, speed: 12, maxAtOnce: 1,
  },
  {
    id: 'w2-l5', world: 2, order: 5, mode: 'balloons',
    title: 'R U E I + base', emoji: '🎈',
    subtitle: 'Juntando tudo.',
    focusKeys: ['r', 'u', 'e', 'i'], pool: only(['r', 'u', 'e', 'i', 'd', 'k', 'f', 'j']),
    target: 16, speed: 11, maxAtOnce: 2,
  },
  {
    id: 'w2-l6', world: 2, order: 6, mode: 'balloons',
    title: 'W e O', emoji: '🎈',
    subtitle: 'Anelares sobem (do S e L).',
    focusKeys: ['w', 'o'], pool: only(['w', 'o']),
    target: 8, speed: 11, maxAtOnce: 1,
  },
  {
    id: 'w2-l7', world: 2, order: 7, mode: 'balloons',
    title: 'Q e P', emoji: '🎈',
    subtitle: 'Mindinhos sobem (do A e Ç).',
    focusKeys: ['q', 'p'], pool: only(['q', 'p']),
    target: 8, speed: 11, maxAtOnce: 1,
  },
  {
    id: 'w2-l8', world: 2, order: 8, mode: 'balloons',
    title: 'T e Y', emoji: '🎈',
    subtitle: 'Indicadores esticam ainda mais.',
    focusKeys: ['t', 'y'], pool: only(['t', 'y']),
    target: 8, speed: 11, maxAtOnce: 1,
  },
  {
    id: 'w2-l9', world: 2, order: 9, mode: 'balloons',
    title: 'Linha de cima completa', emoji: '🎈',
    subtitle: 'Q W E R T Y U I O P.',
    focusKeys: [], pool: only(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']),
    target: 18, speed: 10, maxAtOnce: 3,
  },
  {
    id: 'w2-l10', world: 2, order: 10, mode: 'pies',
    title: 'Primeiras palavras mistas', emoji: '🥧',
    subtitle: 'Linhas de cima + base.',
    focusKeys: [], pool: SIMPLE_WORDS,
    target: 10, speed: 12, maxAtOnce: 2,
  },

  // ===== MUNDO 3 — LINHA DE BAIXO =====
  {
    id: 'w3-l1', world: 3, order: 1, mode: 'balloons',
    title: 'V e N', emoji: '🎈',
    subtitle: 'Indicadores descem (do F e J).',
    focusKeys: ['v', 'n'], pool: only(['v', 'n']),
    target: 8, speed: 11, maxAtOnce: 1,
  },
  {
    id: 'w3-l2', world: 3, order: 2, mode: 'balloons',
    title: 'B e M', emoji: '🎈',
    subtitle: 'Indicadores esticam descendo.',
    focusKeys: ['b', 'm'], pool: only(['b', 'm']),
    target: 8, speed: 11, maxAtOnce: 1,
  },
  {
    id: 'w3-l3', world: 3, order: 3, mode: 'balloons',
    title: 'V B N M', emoji: '🎈',
    subtitle: 'Combinando os quatro.',
    focusKeys: [], pool: only(['v', 'b', 'n', 'm']),
    target: 12, speed: 10, maxAtOnce: 2,
  },
  {
    id: 'w3-l4', world: 3, order: 4, mode: 'balloons',
    title: 'C e vírgula', emoji: '🎈',
    subtitle: 'Dedos médios descem.',
    focusKeys: ['c'], pool: only(['c']),
    target: 6, speed: 10, maxAtOnce: 1,
  },
  {
    id: 'w3-l5', world: 3, order: 5, mode: 'balloons',
    title: 'X e Z', emoji: '🎈',
    subtitle: 'Anelar e mindinho descem.',
    focusKeys: ['x', 'z'], pool: only(['x', 'z']),
    target: 8, speed: 10, maxAtOnce: 1,
  },
  {
    id: 'w3-l6', world: 3, order: 6, mode: 'balloons',
    title: 'Linha de baixo completa', emoji: '🎈',
    subtitle: 'Z X C V B N M.',
    focusKeys: [], pool: only(['z', 'x', 'c', 'v', 'b', 'n', 'm']),
    target: 16, speed: 9, maxAtOnce: 3,
  },
  {
    id: 'w3-l7', world: 3, order: 7, mode: 'pies',
    title: 'Bichos e bichinhos', emoji: '🐾',
    subtitle: 'Nomes de animais.',
    focusKeys: [], pool: ANIMAL_WORDS,
    target: 10, speed: 11, maxAtOnce: 2,
  },

  // ===== MUNDO 4 — PALAVRAS (todas as teclas) =====
  {
    id: 'w4-l1', world: 4, order: 1, mode: 'pies',
    title: 'Frutaria', emoji: '🍓',
    subtitle: 'Deliciosas palavras!',
    focusKeys: [], pool: FRUIT_WORDS,
    target: 12, speed: 10, maxAtOnce: 2,
  },
  {
    id: 'w4-l2', world: 4, order: 2, mode: 'pies',
    title: 'Aventura', emoji: '🚀',
    subtitle: 'Palavras maiores.',
    focusKeys: [], pool: MEDIUM_WORDS,
    target: 12, speed: 10, maxAtOnce: 3,
  },

  // ===== MUNDO 5 — FRASES =====
  {
    id: 'w5-l1', world: 5, order: 1, mode: 'sentence',
    title: 'Frases amigas', emoji: '💬',
    subtitle: 'Digite frases completas.',
    focusKeys: [], pool: KID_SENTENCES.slice(0, 5),
    target: 5, goalWpm: 12,
  },
  {
    id: 'w5-l2', world: 5, order: 2, mode: 'sentence',
    title: 'Mais frases!', emoji: '💬',
    subtitle: 'Vamos subir o nível.',
    focusKeys: [], pool: KID_SENTENCES.slice(5),
    target: 5, goalWpm: 16,
  },

  // ===== MUNDO 6 — TEXTOS =====
  {
    id: 'w6-l1', world: 6, order: 1, mode: 'text',
    title: 'Pequenos contos', emoji: '📚',
    subtitle: 'Um parágrafo de cada vez.',
    focusKeys: [], pool: [KID_TEXTS[0]],
    target: 1, goalWpm: 20,
  },
  {
    id: 'w6-l2', world: 6, order: 2, mode: 'text',
    title: 'Joaninha', emoji: '🐞',
    subtitle: 'Leia e digite.',
    focusKeys: [], pool: [KID_TEXTS[1]],
    target: 1, goalWpm: 22,
  },
  {
    id: 'w6-l3', world: 6, order: 3, mode: 'text',
    title: 'Fundo do mar', emoji: '🐚',
    subtitle: 'Digitador experiente!',
    focusKeys: [], pool: [KID_TEXTS[2]],
    target: 1, goalWpm: 25,
  },
];

export const WORLDS = [
  { id: 1, title: 'Ilha das Letras', emoji: '🏝️', desc: 'Linha de base: asdfjklç', color: 'from-sky1 to-sky2' },
  { id: 2, title: 'Nuvem Voadora', emoji: '☁️', desc: 'Linha de cima: qwertyuiop', color: 'from-grape to-candy' },
  { id: 3, title: 'Caverna Secreta', emoji: '🕳️', desc: 'Linha de baixo: zxcvbnm', color: 'from-tangerine to-sun' },
  { id: 4, title: 'Pomar das Palavras', emoji: '🍓', desc: 'Palavras com todas as letras', color: 'from-coral to-candy' },
  { id: 5, title: 'Jardim das Frases', emoji: '🌻', desc: 'Frases completas', color: 'from-grass to-mint' },
  { id: 6, title: 'Castelo dos Textos', emoji: '🏰', desc: 'Pequenos contos para digitar', color: 'from-grape to-sky1' },
];

export function getLevelsByWorld(world: number): Level[] {
  return LEVELS.filter((l) => l.world === world).sort((a, b) => a.order - b.order);
}

export function getWorldMeta(worldId: number) {
  return WORLDS.find((w) => w.id === worldId);
}

/**
 * Posição da lição dentro do mundo (1-based) e total do mundo.
 */
export function getLessonPosition(level: Level): { index: number; total: number } {
  const all = getLevelsByWorld(level.world);
  const index = all.findIndex((l) => l.id === level.id) + 1;
  return { index, total: all.length };
}

export function getNextLevel(current: Level): Level | undefined {
  const idx = LEVELS.findIndex((l) => l.id === current.id);
  return LEVELS[idx + 1];
}

export function getPrevLevelId(current: Level): string | undefined {
  const idx = LEVELS.findIndex((l) => l.id === current.id);
  return idx > 0 ? LEVELS[idx - 1].id : undefined;
}

/**
 * Com base no resultado do teste diagnóstico inicial,
 * devolve o id do nível recomendado para começar.
 */
export function recommendLevelId(wpm: number, accuracy: number): string {
  if (accuracy < 60 || wpm < 5) return 'w1-l1';     // iniciante total
  if (accuracy < 80 || wpm < 10) return 'w1-l10';   // sabe um pouco da base
  if (wpm < 18) return 'w2-l1';                     // começa a linha de cima
  if (wpm < 28) return 'w3-l1';                     // linha de baixo
  if (wpm < 40) return 'w4-l1';                     // palavras
  return 'w5-l1';                                   // frases
}
