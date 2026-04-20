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
  goalWpm?: number;      // meta de WPM (p/ frases/textos)
};

// ---------- Pools de palavras e frases (PT-BR, amigáveis) ----------

const HOME_ROW_WORDS = ['asa', 'dá', 'fala', 'lá', 'ala', 'ajudar', 'fada', 'saia', 'falsa'];
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

// ---------- Helper para expandir letras individuais ----------
const letters = (arr: string[]): string[] => arr;

// ---------- Níveis ----------
export const LEVELS: Level[] = [
  // ===== MUNDO 1 — HOME ROW =====
  {
    id: 'w1-l1',
    world: 1,
    order: 1,
    mode: 'balloons',
    title: 'F e J',
    emoji: '🎈',
    subtitle: 'As teclas-guia! Sinta os relevinhos.',
    focusKeys: ['f', 'j'],
    pool: letters(['f', 'j']),
    target: 10,
    speed: 8,
  },
  {
    id: 'w1-l2',
    world: 1,
    order: 2,
    mode: 'balloons',
    title: 'D e K',
    emoji: '🎈',
    subtitle: 'Os dedos médios entram no jogo.',
    focusKeys: ['d', 'k'],
    pool: letters(['f', 'j', 'd', 'k']),
    target: 12,
    speed: 7,
  },
  {
    id: 'w1-l3',
    world: 1,
    order: 3,
    mode: 'balloons',
    title: 'S e L',
    emoji: '🎈',
    subtitle: 'Anelares na pista!',
    focusKeys: ['s', 'l'],
    pool: letters(['f', 'j', 'd', 'k', 's', 'l']),
    target: 14,
    speed: 6.5,
  },
  {
    id: 'w1-l4',
    world: 1,
    order: 4,
    mode: 'balloons',
    title: 'A e Ç',
    emoji: '🎈',
    subtitle: 'Mindinhos firmes!',
    focusKeys: ['a', 'ç'],
    pool: letters(['f', 'j', 'd', 'k', 's', 'l', 'a', 'ç']),
    target: 16,
    speed: 6,
  },
  {
    id: 'w1-l5',
    world: 1,
    order: 5,
    mode: 'pies',
    title: 'Primeiras palavras',
    emoji: '🥧',
    subtitle: 'Só com a linha de base!',
    focusKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ç'],
    pool: HOME_ROW_WORDS,
    target: 8,
    speed: 12,
  },

  // ===== MUNDO 2 — TOP ROW =====
  {
    id: 'w2-l1',
    world: 2,
    order: 1,
    mode: 'balloons',
    title: 'E e I',
    emoji: '🎈',
    subtitle: 'Suba os dedos médios.',
    focusKeys: ['e', 'i'],
    pool: letters(['e', 'i', 'f', 'j', 'd', 'k']),
    target: 14,
    speed: 6,
  },
  {
    id: 'w2-l2',
    world: 2,
    order: 2,
    mode: 'balloons',
    title: 'R e U',
    emoji: '🎈',
    subtitle: 'Indicadores esticam!',
    focusKeys: ['r', 'u'],
    pool: letters(['e', 'i', 'r', 'u', 'f', 'j']),
    target: 14,
    speed: 5.5,
  },
  {
    id: 'w2-l3',
    world: 2,
    order: 3,
    mode: 'balloons',
    title: 'T, Y e o resto',
    emoji: '🎈',
    subtitle: 'Q W O P também!',
    focusKeys: ['t', 'y', 'q', 'w', 'o', 'p'],
    pool: letters(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']),
    target: 18,
    speed: 5,
  },
  {
    id: 'w2-l4',
    world: 2,
    order: 4,
    mode: 'pies',
    title: 'Palavras simples',
    emoji: '🥧',
    subtitle: 'Misturando linhas!',
    focusKeys: [],
    pool: SIMPLE_WORDS,
    target: 10,
    speed: 10,
  },

  // ===== MUNDO 3 — BOTTOM ROW =====
  {
    id: 'w3-l1',
    world: 3,
    order: 1,
    mode: 'balloons',
    title: 'V, B, N, M',
    emoji: '🎈',
    subtitle: 'Curve os indicadores.',
    focusKeys: ['v', 'b', 'n', 'm'],
    pool: letters(['v', 'b', 'n', 'm', 'f', 'j']),
    target: 16,
    speed: 5,
  },
  {
    id: 'w3-l2',
    world: 3,
    order: 2,
    mode: 'balloons',
    title: 'C, X, Z',
    emoji: '🎈',
    subtitle: 'Completa a linha de baixo!',
    focusKeys: ['c', 'x', 'z'],
    pool: letters(['z', 'x', 'c', 'v', 'b', 'n', 'm']),
    target: 16,
    speed: 4.8,
  },
  {
    id: 'w3-l3',
    world: 3,
    order: 3,
    mode: 'pies',
    title: 'Bichos e bichinhos',
    emoji: '🐾',
    subtitle: 'Nome dos animais!',
    focusKeys: [],
    pool: ANIMAL_WORDS,
    target: 10,
    speed: 10,
  },

  // ===== MUNDO 4 — PALAVRAS =====
  {
    id: 'w4-l1',
    world: 4,
    order: 1,
    mode: 'pies',
    title: 'Frutaria',
    emoji: '🍓',
    subtitle: 'Deliciosas palavras!',
    focusKeys: [],
    pool: FRUIT_WORDS,
    target: 12,
    speed: 9,
  },
  {
    id: 'w4-l2',
    world: 4,
    order: 2,
    mode: 'pies',
    title: 'Aventura',
    emoji: '🚀',
    subtitle: 'Palavras maiores.',
    focusKeys: [],
    pool: MEDIUM_WORDS,
    target: 12,
    speed: 9,
  },

  // ===== MUNDO 5 — FRASES =====
  {
    id: 'w5-l1',
    world: 5,
    order: 1,
    mode: 'sentence',
    title: 'Frases amigas',
    emoji: '💬',
    subtitle: 'Digite frases completas.',
    focusKeys: [],
    pool: KID_SENTENCES.slice(0, 5),
    target: 5,
    goalWpm: 15,
  },
  {
    id: 'w5-l2',
    world: 5,
    order: 2,
    mode: 'sentence',
    title: 'Mais frases!',
    emoji: '💬',
    subtitle: 'Vamos subir o nível.',
    focusKeys: [],
    pool: KID_SENTENCES.slice(5),
    target: 5,
    goalWpm: 18,
  },

  // ===== MUNDO 6 — TEXTOS =====
  {
    id: 'w6-l1',
    world: 6,
    order: 1,
    mode: 'text',
    title: 'Pequenos contos',
    emoji: '📚',
    subtitle: 'Um parágrafo de cada vez.',
    focusKeys: [],
    pool: [KID_TEXTS[0]],
    target: 1,
    goalWpm: 20,
  },
  {
    id: 'w6-l2',
    world: 6,
    order: 2,
    mode: 'text',
    title: 'Joaninha',
    emoji: '🐞',
    subtitle: 'Leia e digite.',
    focusKeys: [],
    pool: [KID_TEXTS[1]],
    target: 1,
    goalWpm: 22,
  },
  {
    id: 'w6-l3',
    world: 6,
    order: 2,
    mode: 'text',
    title: 'Fundo do mar',
    emoji: '🐚',
    subtitle: 'Digitador experiente!',
    focusKeys: [],
    pool: [KID_TEXTS[2]],
    target: 1,
    goalWpm: 25,
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

export function getNextLevel(current: Level): Level | undefined {
  const idx = LEVELS.findIndex((l) => l.id === current.id);
  return LEVELS[idx + 1];
}

export function getPrevLevelId(current: Level): string | undefined {
  const idx = LEVELS.findIndex((l) => l.id === current.id);
  return idx > 0 ? LEVELS[idx - 1].id : undefined;
}
