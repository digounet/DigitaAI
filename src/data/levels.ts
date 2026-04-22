export type GameMode = 'balloons' | 'pies' | 'sentence' | 'text' | 'climb';

export type Level = {
  id: string;
  world: number;
  order: number;
  mode: GameMode;
  title: string;
  emoji: string;
  subtitle: string;
  focusKeys: string[];
  pool: string[];
  target: number;
  speed?: number;        // segundos p/ item atravessar a tela (balões/tortas)
  maxAtOnce?: number;    // itens simultâneos
  goalWpm?: number;      // meta de PPM (frases/textos)
  /**
   * Quando true, o spawn percorre o `pool` em ordem (round-robin) em vez de
   * sortear aleatoriamente. Usado nas lições "Descubra X" pra alternar a
   * tecla-guia da linha de base com a letra nova (F, T, F, T...).
   */
  sequence?: boolean;
};

// =======================================================================
// POOLS DE CONTEÚDO
// =======================================================================

// ATENÇÃO: nos mundos 1-3, os pools devem usar SOMENTE as letras já
// ensinadas até aquele ponto. Pseudo-palavras são bem-vindas — o objetivo
// é treinar a posição dos dedos, não vocabulário. Um drill tipo "asdfg"
// é melhor do que uma palavra real que contenha letras ainda não ensinadas.

// Drills da LINHA DE BASE (a s d f g h j k l ç) — seguros em w1-l14/l15.
// Sem i, e, o, z, c, v, m, etc., e sem acentos.
const HOME_ROW_DRILLS = [
  'fj', 'dk', 'sl', 'ga', 'ha',
  'fjd', 'jkf', 'dfj', 'slk',
  'asdf', 'jkl', 'aslk',
  'asa', 'fala', 'sala', 'fada', 'gala',
  'flash', 'halls',
];
// Um passinho acima dos DRILLS básicos — ainda só letras da linha de base,
// e no máximo 5 caracteres (mundo 1 é beginner, nada de monstros tipo
// 'asdfghjkl'). Sequências de 2-5 letras, misturando os dois lados.
const HOME_ROW_DRILLS_HARD = [
  'asdf', 'jkl', 'asdfg', 'hjkl',
  'fjdk', 'slka', 'jfds', 'lkas',
  'gafda', 'hajka', 'lasha', 'dajha',
  'fajka', 'sagha', 'dlash',
];

// Palavras que usam SOMENTE base + linha de cima (após w2, antes de w3).
// Sem v/b/n/m/c/x/z e sem acentos.
const TOP_HOME_WORDS = [
  'sol', 'lua', 'rio', 'tio', 'tua', 'seu',
  'flor', 'teto', 'foto', 'hotel', 'sapo',
  'papel', 'rato', 'dedo', 'rua', 'feito',
  'jeito', 'quero', 'siri', 'suor', 'urso', 'partir',
];

// Palavras seguras até o fim do w3 — todas as letras latinas, sem acentos.
const ANIMAL_WORDS_BASE = [
  'gato', 'peixe', 'pato', 'rato', 'galo', 'coelho',
  'urso', 'cavalo', 'tigre', 'macaco', 'foca', 'zebra',
  'pomba', 'burro',
];
const SIMPLE_WORDS_BASE = [
  'sol', 'lua', 'rio', 'tio', 'flor', 'teto', 'foto',
  'papel', 'sapo', 'hotel', 'rato', 'dedo', 'casa',
  'mesa', 'bolo', 'suco', 'uva',
];
const MEDIUM_WORDS_BASE = [
  'escola', 'amigo', 'brincar', 'jardim', 'alegria',
  'sonhar', 'cantar', 'pintar', 'correr',
];

const SIMPLE_WORDS = ['sol', 'lua', 'pão', 'pipa', 'rio', 'casa', 'mel', 'uva', 'azul', 'flor', 'teto', 'tio'];
const ANIMAL_WORDS = ['gato', 'cão', 'peixe', 'pato', 'leão', 'rato', 'galo', 'coelho', 'urso', 'cavalo', 'tigre', 'macaco'];
const FRUIT_WORDS = ['banana', 'maçã', 'melão', 'uva', 'abacaxi', 'laranja', 'morango', 'pera', 'limão', 'manga', 'cereja'];
const COLOR_WORDS = ['azul', 'verde', 'amarelo', 'rosa', 'roxo', 'branco', 'preto', 'marrom', 'dourado', 'cinza'];
const BODY_WORDS = ['mão', 'olho', 'boca', 'nariz', 'perna', 'braço', 'cabeça', 'dedo', 'pé', 'orelha'];
const FAMILY_WORDS = ['mãe', 'pai', 'irmã', 'irmão', 'vovô', 'vovó', 'tio', 'tia', 'prima', 'filho'];
const SCHOOL_WORDS = ['livro', 'caderno', 'lápis', 'borracha', 'mochila', 'régua', 'aluno', 'professor', 'sala', 'quadro'];
const TOY_WORDS = ['bola', 'boneca', 'carrinho', 'pipa', 'pião', 'jogo', 'urso', 'cubo', 'massinha', 'pipa'];
const FOOD_WORDS = ['arroz', 'feijão', 'bolo', 'suco', 'queijo', 'batata', 'cenoura', 'sopa', 'leite', 'salada'];
const NATURE_WORDS = ['árvore', 'nuvem', 'flor', 'rio', 'mar', 'montanha', 'folha', 'vento', 'chuva', 'estrela'];
const CLOTHES_WORDS = ['camisa', 'calça', 'sapato', 'meia', 'blusa', 'chapéu', 'cachecol', 'luva', 'bota', 'saia'];
const TRANSPORT_WORDS = ['carro', 'ônibus', 'bicicleta', 'avião', 'barco', 'trem', 'moto', 'foguete', 'caminhão', 'navio'];
const SPORT_WORDS = ['futebol', 'vôlei', 'xadrez', 'natação', 'corrida', 'judô', 'tênis', 'basquete', 'boxe', 'skate'];
const JOB_WORDS = ['médico', 'professor', 'bombeiro', 'padeiro', 'artista', 'piloto', 'dentista', 'cozinheiro', 'cientista', 'astronauta'];
const BIG_WORDS = ['elefante', 'abacaxi', 'borboleta', 'hipopótamo', 'computador', 'dinossauro', 'helicóptero', 'geladeira'];
const MEDIUM_WORDS = ['escola', 'amigo', 'brincar', 'jardim', 'família', 'alegria', 'sonhar', 'cantar', 'pintar', 'correr'];

// Frases temáticas
const SENT_SIMPLE = [
  'o gato pulou no muro',
  'eu gosto de chocolate',
  'a pipa voou bem alto',
  'minha mãe faz bolo',
  'vamos brincar no parque',
];
const SENT_ANIMALS = [
  'o cachorro late no quintal',
  'a borboleta pousou na flor',
  'os peixes nadam felizes',
  'o coelho come cenoura',
  'a coruja dorme de dia',
];
const SENT_FOOD = [
  'eu adoro pão com manteiga',
  'a sopa está quentinha',
  'vovó faz o melhor bolo',
  'banana com aveia é gostoso',
  'o suco de laranja é azedo',
];
const SENT_FAMILY = [
  'meu pai conta histórias à noite',
  'minha irmã gosta de desenhar',
  'a vovó mora perto daqui',
  'o tio trouxe um presente',
  'somos uma família feliz',
];
const SENT_NATURE = [
  'a chuva molha o jardim',
  'o vento balança as folhas',
  'as nuvens formam desenhos',
  'a montanha é bem alta',
  'a estrela brilha à noite',
];
const SENT_PLAY = [
  'vamos jogar esconde esconde',
  'eu gosto de pular corda',
  'a bola entrou no gol',
  'meu brinquedo favorito é o urso',
  'vamos andar de bicicleta',
];
const SENT_QUESTIONS = [
  'como você se chama?',
  'qual é a sua cor favorita?',
  'você gosta de sorvete?',
  'onde você mora?',
  'quer brincar comigo?',
];
const SENT_SHORT_STORIES = [
  'o pequeno esquilo guardou nozes para o inverno',
  'a sereia cantou para os peixes do fundo do mar',
  'o dragão bebê queimou sua própria capinha',
  'o robô aprendeu a dançar balé',
  'a nuvem soltou uma chuva de estrelas',
];
const SENT_TONGUE_TWISTERS = [
  'o rato roeu a roupa do rei de roma',
  'três pratos de trigo para três tigres tristes',
  'a aranha arranha a rã',
  'o sabiá não sabia que o sábio sabia assobiar',
  'bagre branco barba preta',
];
const SENT_RHYMES = [
  'sapo na lagoa não tem cabelo nem tem coroa',
  'a galinha do vizinho bota ovo amarelinho',
  'uni duni tê salamê mingê',
  'hoje é domingo pede cachimbo',
  'atirei o pau no gato mas o gato não morreu',
];
const SENT_DIALOG = [
  'oi! bom dia, como vai?',
  'obrigado pelo presente',
  'por favor, me passa a água',
  'com licença, posso entrar?',
  'tudo bem, até amanhã',
];
const SENT_LONG = [
  'ontem fui ao parque com meu primo e brincamos a tarde toda',
  'a professora disse que amanhã vai ter prova de matemática',
  'minha mãe preparou um delicioso bolo de chocolate no forno',
  'o passarinho amarelo cantou na janela logo cedo de manhã',
  'todos os dias eu levo meu cachorro para passear no quarteirão',
];
const SENT_PUNCTUATION = [
  'oi, tudo bem? estou ótimo!',
  'cuidado, o chão está molhado.',
  'uau! que presente lindo!',
  'olha ali: uma estrela cadente.',
  'vem cá, quero te contar um segredo.',
];
const SENT_HARD_WORDS = [
  'o paleontólogo estuda dinossauros antigos',
  'a astronauta viajou para a estratosfera',
  'o chapéu do mágico tinha coelhos engraçados',
  'a biblioteca guarda livros interessantíssimos',
  'o hipopótamo tomou banho na lagoa',
];
const SENT_POETRY = [
  'a rosa do jardim aberta ao sol sorria lindamente',
  'as estrelas do céu cantam baixinho canções',
  'pequenina borboleta voa voa sem parar',
  'a lua de papel ilumina meu travesseiro',
];

// Textos curtos
const TEXTS = [
  'era uma vez um pequeno dragão que tinha medo de fogo. ele gostava mesmo era de soprar bolhas coloridas pelo céu.',
  'a joaninha vermelha pousou na flor amarela. ela contou as pétalas uma a uma e sorriu para a abelha passageira.',
  'no fundo do mar havia um caracol curioso. todo dia ele acordava cedo para descobrir um novo tesouro brilhante.',
  'no bosque encantado vivia um urso que tocava violino. os animais paravam para ouvir suas canções ao pôr do sol.',
  'o gato maroto escondeu as meias da vovó. quando ela encontrou, riu tanto que o bichano ganhou biscoito de peixe.',
  'a princesa corajosa não tinha medo de dragões. ela preferia oferecer chá e bolachas para os monstros visitantes.',
  'o pirata tímido navegava sozinho pelos sete mares procurando um amigo de verdade para dividir seus mapas.',
  'o foguete de papel subiu tão alto que chegou até a lua. lá encontrou coelhos astronautas comendo cenouras prateadas.',
  'na floresta encantada os cogumelos cantavam óperas para os vaga-lumes que dançavam em círculos dourados.',
  'o leão rei decidiu que todos os animais teriam férias. e assim começou o verão mais feliz da savana.',
];

// Números
const NUM_LOW = ['1', '2', '3'];
const NUM_MID = ['4', '5', '6'];
const NUM_HIGH = ['7', '8', '9', '0'];
const ALL_NUMS = ['0','1','2','3','4','5','6','7','8','9'];

// Pontuações
const PUNCT_BASIC = [',', '.'];
const PUNCT_EMPH = ['!', '?'];

const only = (chars: string[]): string[] => chars;

// =======================================================================
// NÍVEIS
// =======================================================================

export const LEVELS: Level[] = [
  // ===== MUNDO 1 — LINHA DE BASE =====
  { id: 'w1-l1',  world:1, order:1,  mode:'balloons', title:'Descubra F', emoji:'🎈', subtitle:'Indicador esquerdo. Sinta o relevinho!',         focusKeys:['f'],        pool:only(['f']),                 target:10, speed:7,  maxAtOnce:2 },
  { id: 'w1-l2',  world:1, order:2,  mode:'balloons', title:'Descubra J', emoji:'🎈', subtitle:'Indicador direito. Relevinho também!',            focusKeys:['j'],        pool:only(['j']),                 target:10, speed:7,  maxAtOnce:2 },
  { id: 'w1-l3',  world:1, order:3,  mode:'balloons', title:'F e J juntos', emoji:'🎈', subtitle:'Alternando as teclas-guia.',                    focusKeys:['f','j'],    pool:only(['f','j']),             target:16, speed:6,  maxAtOnce:2 },
  { id: 'w1-l4',  world:1, order:4,  mode:'balloons', title:'Descubra D', emoji:'🎈', subtitle:'Dedo médio esquerdo, coladinho no F.',            focusKeys:['d'],        pool:only(['d']),                 target:10, speed:6,  maxAtOnce:2 },
  { id: 'w1-l5',  world:1, order:5,  mode:'balloons', title:'Descubra K', emoji:'🎈', subtitle:'Dedo médio direito, coladinho no J.',             focusKeys:['k'],        pool:only(['k']),                 target:10, speed:6,  maxAtOnce:2 },
  { id: 'w1-l6',  world:1, order:6,  mode:'balloons', title:'D K F J',  emoji:'🎈', subtitle:'Os quatro dedos centrais.',                         focusKeys:['d','k','f','j'], pool:only(['d','k','f','j']), target:20, speed:5,  maxAtOnce:3 },
  { id: 'w1-l7',  world:1, order:7,  mode:'balloons', title:'Descubra S', emoji:'🎈', subtitle:'Anelar esquerdo.',                                focusKeys:['s'],        pool:only(['s']),                 target:10, speed:6,  maxAtOnce:2 },
  { id: 'w1-l8',  world:1, order:8,  mode:'balloons', title:'Descubra L', emoji:'🎈', subtitle:'Anelar direito.',                                 focusKeys:['l'],        pool:only(['l']),                 target:10, speed:6,  maxAtOnce:2 },
  { id: 'w1-l9',  world:1, order:9,  mode:'balloons', title:'S L com as amigas', emoji:'🎈', subtitle:'Misturando com D K F J.',                  focusKeys:['s','l'],    pool:only(['s','l','d','k','f','j']), target:22, speed:5,  maxAtOnce:3 },
  { id: 'w1-l10', world:1, order:10, mode:'balloons', title:'Descubra A', emoji:'🎈', subtitle:'Mindinho esquerdo.',                              focusKeys:['a'],        pool:only(['a']),                 target:10, speed:5,  maxAtOnce:2 },
  { id: 'w1-l11', world:1, order:11, mode:'balloons', title:'Descubra Ç', emoji:'🎈', subtitle:'Mindinho direito.',                               focusKeys:['ç'],        pool:only(['ç']),                 target:10, speed:5,  maxAtOnce:2 },
  { id: 'w1-l12', world:1, order:12, mode:'balloons', title:'Linha de base completa', emoji:'🎈', subtitle:'A S D F J K L Ç — todos os dedos!',  focusKeys:['a','ç'],    pool:only(['a','s','d','f','j','k','l','ç']), target:26, speed:5,  maxAtOnce:3 },
  { id: 'w1-l13', world:1, order:13, mode:'balloons', title:'Descubra G e H', emoji:'🎈', subtitle:'Do F pro G, do J pro H — alternando.',          focusKeys:['g','h'],    pool:only(['f','g','j','h']),     target:18, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w1-l14', world:1, order:14, mode:'pies',     title:'Sequências da base', emoji:'🥧', subtitle:'Só letras da linha de base — pode ser qualquer combinação!', focusKeys:[], pool:HOME_ROW_DRILLS, target:12, speed:12, maxAtOnce:1 },
  { id: 'w1-l15', world:1, order:15, mode:'pies',     title:'Desafio da base', emoji:'🏆', subtitle:'Sequências maiores, ainda na linha de base.', focusKeys:[], pool:[...HOME_ROW_DRILLS,...HOME_ROW_DRILLS_HARD], target:12, speed:11, maxAtOnce:2 },

  // ===== MUNDO 2 — LINHA DE CIMA =====
  { id: 'w2-l1',  world:2, order:1,  mode:'balloons', title:'Descubra E', emoji:'🎈', subtitle:'Do D pro E e volta — dedo médio esquerdo.',       focusKeys:['e'],        pool:only(['d','e']),             target:10, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w2-l2',  world:2, order:2,  mode:'balloons', title:'Descubra I', emoji:'🎈', subtitle:'Do K pro I e volta — dedo médio direito.',        focusKeys:['i'],        pool:only(['k','i']),             target:10, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w2-l3',  world:2, order:3,  mode:'balloons', title:'E e I juntos', emoji:'🎈', subtitle:'Alternando.',                                  focusKeys:['e','i'],    pool:only(['e','i']),             target:16, speed:5,  maxAtOnce:2 },
  { id: 'w2-l4',  world:2, order:4,  mode:'balloons', title:'E I + base', emoji:'🎈', subtitle:'Misturando com a linha de base.',                focusKeys:['e','i'],    pool:only(['e','i','d','k','f','j']), target:20, speed:5,  maxAtOnce:3 },
  { id: 'w2-l5',  world:2, order:5,  mode:'balloons', title:'Descubra R', emoji:'🎈', subtitle:'Do F pro R e volta — indicador esquerdo.',        focusKeys:['r'],        pool:only(['f','r']),             target:10, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w2-l6',  world:2, order:6,  mode:'balloons', title:'Descubra U', emoji:'🎈', subtitle:'Do J pro U e volta — indicador direito.',         focusKeys:['u'],        pool:only(['j','u']),             target:10, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w2-l7',  world:2, order:7,  mode:'balloons', title:'R U + E I', emoji:'🎈', subtitle:'Juntando os indicadores.',                         focusKeys:['r','u','e','i'], pool:only(['r','u','e','i','f','j','d','k']), target:22, speed:5,  maxAtOnce:3 },
  { id: 'w2-l8',  world:2, order:8,  mode:'balloons', title:'Descubra T', emoji:'🎈', subtitle:'Do F pro T e volta — indicador esquerdo estica.', focusKeys:['t'],        pool:only(['f','t']),             target:12, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w2-l9',  world:2, order:9,  mode:'balloons', title:'Descubra Y', emoji:'🎈', subtitle:'Do J pro Y e volta — indicador direito estica.',  focusKeys:['y'],        pool:only(['j','y']),             target:12, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w2-l10', world:2, order:10, mode:'balloons', title:'Descubra W', emoji:'🎈', subtitle:'Do S pro W e volta — anelar esquerdo.',           focusKeys:['w'],        pool:only(['s','w']),             target:12, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w2-l11', world:2, order:11, mode:'balloons', title:'Descubra O', emoji:'🎈', subtitle:'Do L pro O e volta — anelar direito.',            focusKeys:['o'],        pool:only(['l','o']),             target:12, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w2-l12', world:2, order:12, mode:'balloons', title:'Descubra Q', emoji:'🎈', subtitle:'Do A pro Q e volta — mindinho esquerdo.',         focusKeys:['q'],        pool:only(['a','q']),             target:12, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w2-l13', world:2, order:13, mode:'balloons', title:'Descubra P', emoji:'🎈', subtitle:'Do Ç pro P e volta — mindinho direito.',          focusKeys:['p'],        pool:only(['ç','p']),             target:12, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w2-l14', world:2, order:14, mode:'balloons', title:'Linha de cima completa', emoji:'🎈', subtitle:'Q W E R T Y U I O P.',               focusKeys:[],           pool:only(['q','w','e','r','t','y','u','i','o','p']), target:26, speed:7,  maxAtOnce:3 },
  { id: 'w2-l15', world:2, order:15, mode:'pies',     title:'Palavras simples', emoji:'🥧', subtitle:'Base + linha de cima. Sem v, m, c ainda.', focusKeys:[],           pool:TOP_HOME_WORDS,              target:14, speed:10, maxAtOnce:2 },

  // ===== MUNDO 3 — LINHA DE BAIXO =====
  { id: 'w3-l1',  world:3, order:1,  mode:'balloons', title:'Descubra V', emoji:'🎈', subtitle:'Do F pro V e volta — indicador esquerdo desce.',  focusKeys:['v'],        pool:only(['f','v']),             target:10, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w3-l2',  world:3, order:2,  mode:'balloons', title:'Descubra N', emoji:'🎈', subtitle:'Do J pro N e volta — indicador direito desce.',   focusKeys:['n'],        pool:only(['j','n']),             target:10, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w3-l3',  world:3, order:3,  mode:'balloons', title:'V e N juntos', emoji:'🎈', subtitle:'Alternando.',                                  focusKeys:['v','n'],    pool:only(['v','n']),             target:16, speed:5,  maxAtOnce:2 },
  { id: 'w3-l4',  world:3, order:4,  mode:'balloons', title:'Descubra B', emoji:'🎈', subtitle:'Do F pro B e volta — indicador esquerdo estica baixo.', focusKeys:['b'],    pool:only(['f','b']),             target:12, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w3-l5',  world:3, order:5,  mode:'balloons', title:'Descubra M', emoji:'🎈', subtitle:'Do J pro M e volta — indicador direito estica baixo.',  focusKeys:['m'],    pool:only(['j','m']),             target:12, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w3-l6',  world:3, order:6,  mode:'balloons', title:'V B N M',   emoji:'🎈', subtitle:'Indicadores dominados.',                           focusKeys:[],           pool:only(['v','b','n','m']),     target:20, speed:5,  maxAtOnce:3 },
  { id: 'w3-l7',  world:3, order:7,  mode:'balloons', title:'Descubra C', emoji:'🎈', subtitle:'Do D pro C e volta — médio esquerdo desce.',      focusKeys:['c'],        pool:only(['d','c']),             target:12, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w3-l8',  world:3, order:8,  mode:'balloons', title:'Descubra X', emoji:'🎈', subtitle:'Do S pro X e volta — anelar esquerdo desce.',     focusKeys:['x'],        pool:only(['s','x']),             target:12, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w3-l9',  world:3, order:9,  mode:'balloons', title:'Descubra Z', emoji:'🎈', subtitle:'Do A pro Z e volta — mindinho esquerdo desce.',   focusKeys:['z'],        pool:only(['a','z']),             target:12, speed:5,  maxAtOnce:2, sequence:true },
  { id: 'w3-l10', world:3, order:10, mode:'balloons', title:'Z X C juntos', emoji:'🎈', subtitle:'Lado esquerdo completo embaixo.',             focusKeys:[],           pool:only(['z','x','c']),         target:18, speed:7,  maxAtOnce:2 },
  { id: 'w3-l11', world:3, order:11, mode:'balloons', title:'Linha de baixo completa', emoji:'🎈', subtitle:'Z X C V B N M.',                     focusKeys:[],           pool:only(['z','x','c','v','b','n','m']), target:22, speed:7,  maxAtOnce:3 },
  { id: 'w3-l12', world:3, order:12, mode:'pies',     title:'Bichos e bichinhos', emoji:'🐾', subtitle:'Nomes de animais (sem acento ainda).',   focusKeys:[],           pool:ANIMAL_WORDS_BASE,           target:12, speed:10, maxAtOnce:2 },
  { id: 'w3-l13', world:3, order:13, mode:'balloons', title:'Revisão das três linhas', emoji:'🎈', subtitle:'Tudo misturado, devagarinho.',      focusKeys:[],           pool:only(['a','s','d','f','j','k','l','e','i','r','u','v','n','c','m']), target:24, speed:7,  maxAtOnce:2 },
  { id: 'w3-l14', world:3, order:14, mode:'pies',     title:'Palavras mistas', emoji:'🥧', subtitle:'Tudo o que aprendeu — sem acentos.',         focusKeys:[],           pool:[...SIMPLE_WORDS_BASE,...ANIMAL_WORDS_BASE],    target:14, speed:9,  maxAtOnce:2 },
  { id: 'w3-l15', world:3, order:15, mode:'pies',     title:'Super desafio', emoji:'🏆', subtitle:'Tudo junto, mais rápido.',                    focusKeys:[],           pool:[...SIMPLE_WORDS_BASE,...ANIMAL_WORDS_BASE,...MEDIUM_WORDS_BASE], target:14, speed:9,  maxAtOnce:3 },
  { id: 'w3-l16', world:3, order:16, mode:'climb',    title:'Escalada da aventura', emoji:'🧗', subtitle:'Suba as nuvens com palavras simples!',    focusKeys:[], pool:[...SIMPLE_WORDS_BASE,...ANIMAL_WORDS_BASE], target:10 },

  // ===== MUNDO 4 — POMAR DAS PALAVRAS =====
  { id: 'w4-l1',  world:4, order:1,  mode:'pies', title:'Frutaria',     emoji:'🍓', subtitle:'Frutas deliciosas!',                     focusKeys:[], pool:FRUIT_WORDS,     target:10, speed:11, maxAtOnce:2 },
  { id: 'w4-l2',  world:4, order:2,  mode:'pies', title:'Zoo divertido',emoji:'🦁', subtitle:'Nome dos animais.',                      focusKeys:[], pool:ANIMAL_WORDS,    target:10, speed:11, maxAtOnce:2 },
  { id: 'w4-l3',  world:4, order:3,  mode:'pies', title:'Arco-íris',    emoji:'🌈', subtitle:'As cores do mundo.',                     focusKeys:[], pool:COLOR_WORDS,     target:10, speed:11, maxAtOnce:2 },
  { id: 'w4-l4',  world:4, order:4,  mode:'pies', title:'Meu corpinho', emoji:'🦵', subtitle:'Partes do corpo.',                       focusKeys:[], pool:BODY_WORDS,      target:10, speed:11, maxAtOnce:2 },
  { id: 'w4-l5',  world:4, order:5,  mode:'pies', title:'Família',       emoji:'👨‍👩‍👧‍👦', subtitle:'As pessoas que amamos.',             focusKeys:[], pool:FAMILY_WORDS,    target:10, speed:11, maxAtOnce:2 },
  { id: 'w4-l6',  world:4, order:6,  mode:'pies', title:'Na escola',    emoji:'🎒', subtitle:'Coisas da sala de aula.',                focusKeys:[], pool:SCHOOL_WORDS,    target:10, speed:11, maxAtOnce:2 },
  { id: 'w4-l7',  world:4, order:7,  mode:'pies', title:'Brinquedos',   emoji:'🧸', subtitle:'Para brincar muito!',                    focusKeys:[], pool:TOY_WORDS,       target:10, speed:10, maxAtOnce:2 },
  { id: 'w4-l8',  world:4, order:8,  mode:'pies', title:'Na cozinha',   emoji:'🍲', subtitle:'Comidas gostosas.',                       focusKeys:[], pool:FOOD_WORDS,      target:10, speed:10, maxAtOnce:2 },
  { id: 'w4-l9',  world:4, order:9,  mode:'pies', title:'Natureza',     emoji:'🌳', subtitle:'Palavras ao ar livre.',                   focusKeys:[], pool:NATURE_WORDS,    target:10, speed:10, maxAtOnce:2 },
  { id: 'w4-l10', world:4, order:10, mode:'pies', title:'Roupas',       emoji:'👕', subtitle:'Pra vestir!',                             focusKeys:[], pool:CLOTHES_WORDS,   target:10, speed:10, maxAtOnce:2 },
  { id: 'w4-l11', world:4, order:11, mode:'pies', title:'Transporte',   emoji:'🚗', subtitle:'Como se locomover.',                      focusKeys:[], pool:TRANSPORT_WORDS, target:10, speed:10, maxAtOnce:2 },
  { id: 'w4-l12', world:4, order:12, mode:'pies', title:'Esportes',     emoji:'⚽', subtitle:'Movimente-se!',                            focusKeys:[], pool:SPORT_WORDS,     target:10, speed:10, maxAtOnce:2 },
  { id: 'w4-l13', world:4, order:13, mode:'pies', title:'Profissões',   emoji:'👩‍🚀', subtitle:'O que quer ser?',                        focusKeys:[], pool:JOB_WORDS,       target:10, speed:10, maxAtOnce:2 },
  { id: 'w4-l14', world:4, order:14, mode:'pies', title:'Aventura',     emoji:'🚀', subtitle:'Palavras maiores.',                        focusKeys:[], pool:MEDIUM_WORDS,    target:12, speed:10, maxAtOnce:3 },
  { id: 'w4-l15', world:4, order:15, mode:'pies',  title:'Gigantes',     emoji:'🦕', subtitle:'Palavras compridas.',                      focusKeys:[], pool:BIG_WORDS,       target:10, speed:13, maxAtOnce:2 },
  { id: 'w4-l16', world:4, order:16, mode:'climb', title:'Escalada das frutas', emoji:'🧗', subtitle:'Suba as nuvens digitando palavras certinho!', focusKeys:[], pool:[...FRUIT_WORDS,...SIMPLE_WORDS], target:10 },

  // ===== MUNDO 5 — JARDIM DAS FRASES =====
  { id: 'w5-l1',  world:5, order:1,  mode:'sentence', title:'Frases amigas',     emoji:'💬', subtitle:'Digite frases completas.',    focusKeys:[], pool:SENT_SIMPLE,          target:5, goalWpm:10 },
  { id: 'w5-l2',  world:5, order:2,  mode:'sentence', title:'Sobre animais',    emoji:'🐾', subtitle:'Bichos fofinhos.',             focusKeys:[], pool:SENT_ANIMALS,         target:5, goalWpm:12 },
  { id: 'w5-l3',  world:5, order:3,  mode:'sentence', title:'Na cozinha',       emoji:'🍰', subtitle:'Frases gostosas.',              focusKeys:[], pool:SENT_FOOD,            target:5, goalWpm:14 },
  { id: 'w5-l4',  world:5, order:4,  mode:'sentence', title:'Em família',       emoji:'❤️', subtitle:'Gente que a gente ama.',        focusKeys:[], pool:SENT_FAMILY,          target:5, goalWpm:14 },
  { id: 'w5-l5',  world:5, order:5,  mode:'sentence', title:'Ao ar livre',      emoji:'🌳', subtitle:'Frases da natureza.',           focusKeys:[], pool:SENT_NATURE,          target:5, goalWpm:16 },
  { id: 'w5-l6',  world:5, order:6,  mode:'sentence', title:'Brincadeiras',     emoji:'🎈', subtitle:'Frases pra brincar.',           focusKeys:[], pool:SENT_PLAY,            target:5, goalWpm:16 },
  { id: 'w5-l7',  world:5, order:7,  mode:'sentence', title:'Perguntas',        emoji:'❓', subtitle:'Perguntas do dia a dia.',       focusKeys:[], pool:SENT_QUESTIONS,       target:5, goalWpm:16 },
  { id: 'w5-l8',  world:5, order:8,  mode:'sentence', title:'Mini histórias',   emoji:'📖', subtitle:'Uma frase cada.',               focusKeys:[], pool:SENT_SHORT_STORIES,   target:5, goalWpm:18 },
  { id: 'w5-l9',  world:5, order:9,  mode:'sentence', title:'Trava-línguas',    emoji:'👅', subtitle:'Cuidado com a pressa!',         focusKeys:[], pool:SENT_TONGUE_TWISTERS, target:5, goalWpm:15 },
  { id: 'w5-l10', world:5, order:10, mode:'sentence', title:'Rimas infantis',   emoji:'🎵', subtitle:'Cantarolando.',                 focusKeys:[], pool:SENT_RHYMES,          target:5, goalWpm:16 },
  { id: 'w5-l11', world:5, order:11, mode:'sentence', title:'Conversas',        emoji:'💭', subtitle:'Diálogos curtos.',              focusKeys:[], pool:SENT_DIALOG,          target:5, goalWpm:18 },
  { id: 'w5-l12', world:5, order:12, mode:'sentence', title:'Frases compridas', emoji:'📏', subtitle:'Concentração!',                 focusKeys:[], pool:SENT_LONG,            target:5, goalWpm:18 },
  { id: 'w5-l13', world:5, order:13, mode:'sentence', title:'Com pontuação',    emoji:'‼️', subtitle:'Cuidado com vírgula e ponto.',  focusKeys:[], pool:SENT_PUNCTUATION,     target:5, goalWpm:18 },
  { id: 'w5-l14', world:5, order:14, mode:'sentence', title:'Palavras difíceis',emoji:'🧠', subtitle:'Vocabulário maior.',            focusKeys:[], pool:SENT_HARD_WORDS,      target:5, goalWpm:20 },
  { id: 'w5-l15', world:5, order:15, mode:'sentence', title:'Poesia curta',     emoji:'🌸', subtitle:'Digite com carinho.',           focusKeys:[], pool:SENT_POETRY,          target:4, goalWpm:20 },

  // ===== MUNDO 6 — CASTELO DOS TEXTOS =====
  { id: 'w6-l1',  world:6, order:1,  mode:'text', title:'Pequeno dragão',  emoji:'🐉', subtitle:'Um parágrafo.',           focusKeys:[], pool:[TEXTS[0]], target:1, goalWpm:18 },
  { id: 'w6-l2',  world:6, order:2,  mode:'text', title:'Joaninha',         emoji:'🐞', subtitle:'Leia e digite.',          focusKeys:[], pool:[TEXTS[1]], target:1, goalWpm:20 },
  { id: 'w6-l3',  world:6, order:3,  mode:'text', title:'Fundo do mar',     emoji:'🐚', subtitle:'Digitador experiente!',   focusKeys:[], pool:[TEXTS[2]], target:1, goalWpm:22 },
  { id: 'w6-l4',  world:6, order:4,  mode:'text', title:'Urso violinista',  emoji:'🎻', subtitle:'Um conto musical.',       focusKeys:[], pool:[TEXTS[3]], target:1, goalWpm:22 },
  { id: 'w6-l5',  world:6, order:5,  mode:'text', title:'Gato maroto',      emoji:'😼', subtitle:'Risadas no quintal.',     focusKeys:[], pool:[TEXTS[4]], target:1, goalWpm:24 },
  { id: 'w6-l6',  world:6, order:6,  mode:'text', title:'Princesa corajosa',emoji:'👸', subtitle:'Uma princesa bem diferente.', focusKeys:[], pool:[TEXTS[5]], target:1, goalWpm:24 },
  { id: 'w6-l7',  world:6, order:7,  mode:'text', title:'Pirata tímido',    emoji:'🏴‍☠️', subtitle:'Um pirata que busca amigo.', focusKeys:[], pool:[TEXTS[6]], target:1, goalWpm:26 },
  { id: 'w6-l8',  world:6, order:8,  mode:'text', title:'Foguete de papel', emoji:'🚀', subtitle:'Aventura espacial.',       focusKeys:[], pool:[TEXTS[7]], target:1, goalWpm:26 },
  { id: 'w6-l9',  world:6, order:9,  mode:'text', title:'Floresta encantada', emoji:'🌲', subtitle:'Cogumelos que cantam.',  focusKeys:[], pool:[TEXTS[8]], target:1, goalWpm:28 },
  { id: 'w6-l10', world:6, order:10, mode:'text', title:'Leão rei',         emoji:'🦁', subtitle:'Último conto.',            focusKeys:[], pool:[TEXTS[9]], target:1, goalWpm:30 },

  // ===== MUNDO 7 — TORRE DOS NÚMEROS =====
  { id: 'w7-l1',  world:7, order:1,  mode:'balloons', title:'Números 1 2 3',   emoji:'🔢', subtitle:'Mindinho, anelar, médio.',          focusKeys:['1','2','3'], pool:NUM_LOW,  target:10, speed:12, maxAtOnce:1 },
  { id: 'w7-l2',  world:7, order:2,  mode:'balloons', title:'Números 4 5 6',   emoji:'🔢', subtitle:'Indicadores alcançando.',           focusKeys:['4','5','6'], pool:NUM_MID,  target:10, speed:12, maxAtOnce:1 },
  { id: 'w7-l3',  world:7, order:3,  mode:'balloons', title:'Números 7 8 9 0', emoji:'🔢', subtitle:'Lado direito.',                     focusKeys:['7','8','9','0'], pool:NUM_HIGH, target:12, speed:12, maxAtOnce:1 },
  { id: 'w7-l4',  world:7, order:4,  mode:'balloons', title:'Todos os números',emoji:'🔢', subtitle:'0 até 9 misturados.',               focusKeys:[], pool:ALL_NUMS,           target:16, speed:11, maxAtOnce:2 },
  { id: 'w7-l5',  world:7, order:5,  mode:'balloons', title:'Vírgula e ponto', emoji:'.,', subtitle:'Pontuação básica.',                 focusKeys:[',','.'], pool:PUNCT_BASIC, target:10, speed:11, maxAtOnce:1 },
  { id: 'w7-l6',  world:7, order:6,  mode:'balloons', title:'! e ?',           emoji:'‼️', subtitle:'Sentimentos!',                      focusKeys:['!','?'], pool:PUNCT_EMPH,  target:10, speed:11, maxAtOnce:1 },
  { id: 'w7-l7',  world:7, order:7,  mode:'pies',     title:'Contando coisas', emoji:'🧮', subtitle:'Palavras com números.',             focusKeys:[], pool:['2 gatos','3 bolas','4 carros','5 flores','6 doces','7 livros','8 lápis','9 uvas','10 dedos'], target:9, speed:10, maxAtOnce:2 },
  { id: 'w7-l8',  world:7, order:8,  mode:'sentence', title:'Frases com números', emoji:'✏️', subtitle:'Incluindo dígitos.',              focusKeys:[], pool:['eu tenho 7 anos','minha casa tem 3 janelas','comi 2 maçãs no lanche','a prova é no dia 15','minha turma tem 25 alunos'], target:5, goalWpm:18 },
  { id: 'w7-l9',  world:7, order:9,  mode:'sentence', title:'Com pontuação',     emoji:'⁉️', subtitle:'Vírgulas, pontos, tudo.',            focusKeys:[], pool:['cuidado, está quente!','vamos, está atrasado!','onde você foi?','ah, que lindo!','vem aqui, agora.'], target:5, goalWpm:18 },
  { id: 'w7-l10', world:7, order:10, mode:'sentence', title:'Desafio final',     emoji:'🏰', subtitle:'Números + pontuação.',               focusKeys:[], pool:['hoje é dia 25 de maio, meu aniversário!','tenho 8 primos e 4 primas, total 12.','às 7:00 tomamos café, delicioso!','comprei 3 livros na feira do dia 10.','acordei às 6, almocei ao meio-dia.'], target:5, goalWpm:22 },

  // ===== MUNDO 8 — REINO DA VELOCIDADE =====
  { id: 'w8-l1',  world:8, order:1,  mode:'balloons', title:'Turbo da base',     emoji:'⚡', subtitle:'Home row bem rápido.',           focusKeys:[], pool:only(['a','s','d','f','j','k','l','ç']), target:30, speed:6, maxAtOnce:4 },
  { id: 'w8-l2',  world:8, order:2,  mode:'balloons', title:'Turbo do topo',    emoji:'⚡', subtitle:'Linha de cima, correndo!',        focusKeys:[], pool:only(['q','w','e','r','t','y','u','i','o','p']), target:30, speed:6, maxAtOnce:4 },
  { id: 'w8-l3',  world:8, order:3,  mode:'balloons', title:'Turbo do fundo',   emoji:'⚡', subtitle:'Linha de baixo em velocidade.',    focusKeys:[], pool:only(['z','x','c','v','b','n','m']),       target:26, speed:6, maxAtOnce:3 },
  { id: 'w8-l4',  world:8, order:4,  mode:'pies',     title:'Rajada de palavras',emoji:'💨', subtitle:'Palavras curtas, rápidas.',       focusKeys:[], pool:[...SIMPLE_WORDS,...FRUIT_WORDS.slice(0,5)], target:15, speed:7, maxAtOnce:3 },
  { id: 'w8-l5',  world:8, order:5,  mode:'pies',     title:'Chuva de palavras', emoji:'🌧️', subtitle:'Médias, atenção!',                focusKeys:[], pool:[...MEDIUM_WORDS,...SCHOOL_WORDS],            target:15, speed:7, maxAtOnce:3 },
  { id: 'w8-l6',  world:8, order:6,  mode:'sentence', title:'Frases relâmpago',  emoji:'⚡', subtitle:'Vá pra mais de 30 PPM!',          focusKeys:[], pool:SENT_SIMPLE.concat(SENT_ANIMALS), target:8, goalWpm:30 },
  { id: 'w8-l7',  world:8, order:7,  mode:'sentence', title:'Frases trovão',     emoji:'🌩️', subtitle:'Meta 35 PPM.',                     focusKeys:[], pool:[...SENT_LONG,...SENT_QUESTIONS], target:8, goalWpm:35 },
  { id: 'w8-l8',  world:8, order:8,  mode:'text',     title:'Monte Everest',     emoji:'🏔️', subtitle:'Texto inteiro, meta 40 PPM.',      focusKeys:[], pool:[TEXTS[1]], target:1, goalWpm:40 },
  { id: 'w8-l9',  world:8, order:9,  mode:'text',     title:'Supernova',         emoji:'💫', subtitle:'Meta 45 PPM.',                     focusKeys:[], pool:[TEXTS[3]], target:1, goalWpm:45 },
  { id: 'w8-l10', world:8, order:10, mode:'text',     title:'Campeão da digitação', emoji:'🏆', subtitle:'A prova final! 50 PPM.',       focusKeys:[], pool:[TEXTS[9]], target:1, goalWpm:50 },
  { id: 'w8-l11', world:8, order:11, mode:'climb',    title:'Escalada relâmpago',   emoji:'🧗', subtitle:'Palavras rápidas sem errar. Suba a montanha!', focusKeys:[], pool:[...SIMPLE_WORDS,...MEDIUM_WORDS], target:12 },

  // ===== MUNDO 9 — GALERIA DOS ACENTOS =====
  { id: 'w9-l1',  world:9, order:1,  mode:'pies',     title:'Cedilha (ç)',    emoji:'🎨', subtitle:'A letrinha do rabicho.',                focusKeys:['ç'], pool:['aço','caça','laço','moça','braço','dança','abraço','lança','poça','caça'], target:8, speed:12, maxAtOnce:1 },
  { id: 'w9-l2',  world:9, order:2,  mode:'pies',     title:'Acento agudo: á', emoji:'🎨', subtitle:'Palavras com á.',                       focusKeys:[], pool:['pá','já','sofá','cálculo','máquina','ímã','lápis','bíblia','água','ácido'], target:8, speed:12, maxAtOnce:1 },
  { id: 'w9-l3',  world:9, order:3,  mode:'pies',     title:'Agudo: é í ó ú',   emoji:'🎨', subtitle:'Mais acentos agudos.',                  focusKeys:[], pool:['café','pé','fé','médico','bíblia','íris','nós','avó','iglú','número'], target:10, speed:12, maxAtOnce:2 },
  { id: 'w9-l4',  world:9, order:4,  mode:'pies',     title:'Circunflexo: â ê ô',emoji:'🎨', subtitle:'Chapeuzinho em cima da vogal.',       focusKeys:[], pool:['câmbio','pêssego','avô','ônibus','ângulo','três','tênis','vovô','côncavo','mês'], target:10, speed:12, maxAtOnce:2 },
  { id: 'w9-l5',  world:9, order:5,  mode:'pies',     title:'Til: ã õ',         emoji:'🎨', subtitle:'A cobrinha em cima.',                   focusKeys:[], pool:['manhã','cão','pão','limão','botão','coração','lições','mão','irmã','verão'], target:10, speed:12, maxAtOnce:2 },
  { id: 'w9-l6',  world:9, order:6,  mode:'pies',     title:'Tudo com acento', emoji:'🎨', subtitle:'Misturando todos os acentos.',           focusKeys:[], pool:['coração','manhã','pêssego','açúcar','família','óculos','história','médico','ônibus','máquina'], target:12, speed:11, maxAtOnce:2 },
  { id: 'w9-l7',  world:9, order:7,  mode:'sentence', title:'Frases acentuadas',emoji:'💬', subtitle:'Pratique em contexto.',                focusKeys:[], pool:['o pé do avô é grande','a mamãe fez coração de papel','o leão é o rei da savana','pêssego é uma fruta doce','três crianças brincam no pátio'], target:5, goalWpm:18 },
  { id: 'w9-l8',  world:9, order:8,  mode:'sentence', title:'Palavras difíceis',emoji:'✨', subtitle:'Acentos + pontuação.',                  focusKeys:[], pool:['minha avó cozinha açúcar queimado','o ônibus já passou às sete','o médico é muito atencioso','três pássaros pousaram no galho','família é amor à primeira vista'], target:5, goalWpm:20 },
  { id: 'w9-l9',  world:9, order:9,  mode:'climb',    title:'Escalada com acentos', emoji:'🧗', subtitle:'Palavras acentuadas, nuvem a nuvem.', focusKeys:[], pool:['café','pé','fé','avó','vovô','mãe','pão','coração','manhã','três','médico','ônibus','bíblia','família'], target:10 },

  // ===== MUNDO 10 — PRAÇA DOS DÍGRAFOS =====
  { id: 'w10-l1', world:10, order:1, mode:'pies', title:'CH',  emoji:'🔤', subtitle:'ch como em chave.',                focusKeys:[], pool:['chave','chuva','chocolate','chão','chinelo','china','chamada','chefe'], target:8, speed:11, maxAtOnce:2 },
  { id: 'w10-l2', world:10, order:2, mode:'pies', title:'NH',  emoji:'🔤', subtitle:'nh como em ninho.',                focusKeys:[], pool:['ninho','banho','manhã','tamanho','vinho','sonho','caminho','piranha'], target:8, speed:11, maxAtOnce:2 },
  { id: 'w10-l3', world:10, order:3, mode:'pies', title:'LH',  emoji:'🔤', subtitle:'lh como em filho.',                focusKeys:[], pool:['filho','olho','galho','mulher','orelha','velho','trabalho','baralho'], target:8, speed:11, maxAtOnce:2 },
  { id: 'w10-l4', world:10, order:4, mode:'pies', title:'QU / GU', emoji:'🔤', subtitle:'quatro, guerra, aquele.',    focusKeys:[], pool:['queijo','quadro','quente','aquilo','guerra','guitarra','esquilo','água'], target:10, speed:11, maxAtOnce:2 },
  { id: 'w10-l5', world:10, order:5, mode:'pies', title:'RR / SS', emoji:'🔤', subtitle:'Duplas que mudam o som.',     focusKeys:[], pool:['carro','terra','passo','massa','pessoa','torre','garra','essência'], target:10, speed:11, maxAtOnce:2 },
  { id: 'w10-l6', world:10, order:6, mode:'sentence', title:'Frases com dígrafos', emoji:'💬', subtitle:'Tudo junto.', focusKeys:[], pool:['o carrinho passa na chuva','meu filho tem orelha pequena','a manhã de sol é linda','o cachorro mora no canil','minha irmã ganhou um vestido'], target:5, goalWpm:18 },

  // ===== MUNDO 11 — MONTANHA DAS MAIÚSCULAS =====
  { id: 'w11-l1', world:11, order:1, mode:'pies', title:'Nomes próprios',  emoji:'🔠', subtitle:'Começam com maiúscula.',    focusKeys:[], pool:['Ana','Bruno','Carla','Davi','Eduardo','Fernanda','Gabriel','Helena','Igor','Júlia'], target:10, speed:12, maxAtOnce:2 },
  { id: 'w11-l2', world:11, order:2, mode:'pies', title:'Cidades',          emoji:'🏙️', subtitle:'Nomes de cidades.',          focusKeys:[], pool:['Recife','Fortaleza','Manaus','Brasília','Salvador','Curitiba','Natal','Belém','Santos','Goiânia'], target:10, speed:12, maxAtOnce:2 },
  { id: 'w11-l3', world:11, order:3, mode:'sentence', title:'Frases iniciais', emoji:'🔠', subtitle:'Primeira letra grande.',  focusKeys:[], pool:['Ana foi à escola hoje','Bruno gosta de jogar bola','Carla tem uma bicicleta nova','Davi come maçã no lanche','Eduardo brinca no parque'], target:5, goalWpm:18 },
  { id: 'w11-l4', world:11, order:4, mode:'sentence', title:'Lugares e pessoas', emoji:'🗺️', subtitle:'Nomes próprios nas frases.', focusKeys:[], pool:['Mariana mora no Rio de Janeiro','Pedro viajou para Salvador','Roberto adora a cidade de Recife','Fernanda estuda em Brasília','Gabriela conhece o Amazonas'], target:5, goalWpm:20 },
  { id: 'w11-l5', world:11, order:5, mode:'sentence', title:'Diálogos',        emoji:'💬', subtitle:'Cada fala começa com maiúscula.', focusKeys:[], pool:['- Oi, Ana! Tudo bem?','- Bom dia, Professor Pedro!','- Vamos, Carla, está atrasado!','- Obrigado, vovó Helena!','- Até logo, Davi!'], target:5, goalWpm:20 },
  { id: 'w11-l6', world:11, order:6, mode:'text',     title:'Texto com maiúsculas', emoji:'📝', subtitle:'Aplicando tudo.', focusKeys:[], pool:['Ana e Bruno foram ao Parque Municipal. Eles encontraram Carla e Davi brincando perto do lago. Todos voltaram para casa felizes ao entardecer.'], target:1, goalWpm:22 },
  { id: 'w11-l7', world:11, order:7, mode:'climb',    title:'Escalada dos nomes', emoji:'🧗', subtitle:'Nomes próprios nas nuvens!',            focusKeys:[], pool:['Ana','Bruno','Carla','Davi','Eduardo','Fernanda','Gabriel','Helena','Igor','Júlia','Recife','Manaus','Salvador','Curitiba','Natal','Belém'], target:10 },

  // ===== MUNDO 12 — BIBLIOTECA MÁGICA =====
  { id: 'w12-l1', world:12, order:1, mode:'sentence', title:'Sabedoria popular', emoji:'📚', subtitle:'Ditados conhecidos.', focusKeys:[], pool:['de grão em grão a galinha enche o papo','a pressa é inimiga da perfeição','quem não tem cão caça com gato','devagar se vai ao longe','antes só do que mal acompanhado'], target:5, goalWpm:20 },
  { id: 'w12-l2', world:12, order:2, mode:'sentence', title:'Citações infantis', emoji:'📚', subtitle:'Frases de livros famosos.', focusKeys:[], pool:['imaginação é mais importante que conhecimento','viva cada dia como se fosse o primeiro','não há dragão que não possa ser vencido','sonhar não custa nada','amor é o que faz o mundo girar'], target:5, goalWpm:22 },
  { id: 'w12-l3', world:12, order:3, mode:'sentence', title:'Pensamentos bons', emoji:'🌟', subtitle:'Frases motivadoras.', focusKeys:[], pool:['acredite em você mesmo sempre','cada erro é uma chance de aprender','bondade nunca é demais','seja gentil até com os diferentes','sorria para quem passa na rua'], target:5, goalWpm:22 },
  { id: 'w12-l4', world:12, order:4, mode:'sentence', title:'Provérbios animais',emoji:'🐾', subtitle:'Com bichos.',            focusKeys:[], pool:['cachorro que late não morde','em casa de ferreiro espeto é de pau','quem com o ferro fere com ferro será ferido','filho de peixe peixinho é','macaco velho não mete a mão em cumbuca'], target:5, goalWpm:22 },
  { id: 'w12-l5', world:12, order:5, mode:'text',     title:'Pensador curioso', emoji:'🧠', subtitle:'Reflexão com acentuação.', focusKeys:[], pool:['a gentileza é uma linguagem que os surdos escutam e os cegos veem. pequenas atitudes mudam o dia de muita gente. comece hoje mesmo.'], target:1, goalWpm:24 },

  // ===== MUNDO 13 — TEATRO DAS EMOÇÕES =====
  { id: 'w13-l1', world:13, order:1, mode:'sentence', title:'Alegria!',     emoji:'😄', subtitle:'Exclamações felizes.',   focusKeys:[], pool:['que dia maravilhoso!','eu ganhei o jogo!','que surpresa boa!','estou tão feliz hoje!','uau, que bolo gostoso!'], target:5, goalWpm:20 },
  { id: 'w13-l2', world:13, order:2, mode:'sentence', title:'Tristeza',     emoji:'😢', subtitle:'Frases melancólicas.',   focusKeys:[], pool:['hoje eu estou tão cansado','que pena que acabou','saudade é uma coisa engraçada','às vezes só quero ficar quieto','o dia parece estar cinza hoje'], target:5, goalWpm:20 },
  { id: 'w13-l3', world:13, order:3, mode:'sentence', title:'Surpresa!',    emoji:'😲', subtitle:'Coisas inesperadas.',    focusKeys:[], pool:['nossa, que barulhão!','olha só quem chegou!','não acredito que funcionou!','isso é incrível!','mas olha só, que legal!'], target:5, goalWpm:20 },
  { id: 'w13-l4', world:13, order:4, mode:'sentence', title:'Gratidão',     emoji:'🙏', subtitle:'Obrigado de todo jeito.',focusKeys:[], pool:['obrigado por tudo, vovó','muito obrigada pelo presente','valeu pela ajuda, amigo!','fico grato pelo carinho','que bom ter você aqui'], target:5, goalWpm:22 },
  { id: 'w13-l5', world:13, order:5, mode:'sentence', title:'Coragem',      emoji:'💪', subtitle:'Frases fortes.',          focusKeys:[], pool:['eu vou conseguir, sim!','nada pode me parar agora','uma hora de cada vez, calma','confiança é meu superpoder','vamos, de cabeça erguida!'], target:5, goalWpm:22 },
  { id: 'w13-l6', world:13, order:6, mode:'text',     title:'Monólogo', emoji:'🎭', subtitle:'Textinho teatral.',          focusKeys:[], pool:['era uma manhã ensolarada quando decidi começar tudo de novo. peguei minha mochila, sorri e segui em frente cantando baixinho.'], target:1, goalWpm:24 },
  { id: 'w13-l7', world:13, order:7, mode:'climb',    title:'Escalada dos sentimentos', emoji:'🧗', subtitle:'Emoções em cada nuvem.',   focusKeys:[], pool:['feliz','triste','bravo','calmo','medo','alegria','susto','raiva','carinho','coragem','paz','gratidão','amor','saudade'], target:10 },

  // ===== MUNDO 14 — CIRCO DAS ADIVINHAS =====
  { id: 'w14-l1', world:14, order:1, mode:'sentence', title:'O que é o que é?',  emoji:'🎪', subtitle:'Adivinhas clássicas.',  focusKeys:[], pool:['o que cai sem se machucar?','tem pé mas não anda','tem boca mas não fala','tem dente mas não morde','tem cabeça e não pensa'], target:5, goalWpm:20 },
  { id: 'w14-l2', world:14, order:2, mode:'sentence', title:'Charadas curtas',   emoji:'🎩', subtitle:'Pensar e digitar.',     focusKeys:[], pool:['qual o bicho que é duas vogais?','o que amassa mas não come?','o que quebra quando fala?','qual a coisa que sobe e desce parada?','o que tem asa mas não voa?'], target:5, goalWpm:22 },
  { id: 'w14-l3', world:14, order:3, mode:'sentence', title:'Adivinhas com rima',emoji:'🎭', subtitle:'Rimadas, fofinhas.',    focusKeys:[], pool:['três patinhos foram passear','uma vaca amarela atravessou a rua','o gato pulou no telhado','um rato comeu meu queijo','o leão dorme na selva'], target:5, goalWpm:22 },
  { id: 'w14-l4', world:14, order:4, mode:'sentence', title:'Qual é?',            emoji:'❓', subtitle:'Mais adivinhas.',        focusKeys:[], pool:['é branca por fora e amarela por dentro','é azul e não é céu, salgada e não é sal','tem olho e não enxerga','é cheio de dentes mas não morde','tem pelo mas não é animal'], target:5, goalWpm:22 },
  { id: 'w14-l5', world:14, order:5, mode:'text',     title:'Charada longa',      emoji:'🔮', subtitle:'Tudo junto.',            focusKeys:[], pool:['certo dia a coruja sábia fez uma pergunta à raposa curiosa: o que é redondo, tem ponteiros e nunca para? a raposa pensou e respondeu: o relógio!'], target:1, goalWpm:24 },

  // ===== MUNDO 15 — COZINHA CURIOSA =====
  { id: 'w15-l1', world:15, order:1, mode:'sentence', title:'Ingredientes',  emoji:'🥄', subtitle:'Coisinhas da receita.',    focusKeys:[], pool:['pegue dois ovos e um copo de leite','misture uma xícara de farinha de trigo','acrescente duas colheres de açúcar','coloque uma pitada de sal','rale um pouco de limão'], target:5, goalWpm:20 },
  { id: 'w15-l2', world:15, order:2, mode:'sentence', title:'Modo de preparo',emoji:'🍳', subtitle:'Passo a passo.',           focusKeys:[], pool:['bata os ovos na tigela','aqueça o forno em duzentos graus','unte a forma com manteiga','leve ao forno por trinta minutos','deixe esfriar antes de servir'], target:5, goalWpm:22 },
  { id: 'w15-l3', world:15, order:3, mode:'sentence', title:'Receita do bolo', emoji:'🎂', subtitle:'Passinhos doces.',         focusKeys:[], pool:['coloque os ingredientes secos numa tigela','adicione os líquidos e misture bem','despeje na forma untada com manteiga','enfeite com granulado colorido depois','compartilhe com seus amigos no lanche'], target:5, goalWpm:22 },
  { id: 'w15-l4', world:15, order:4, mode:'sentence', title:'Lanche rapidinho',emoji:'🥪', subtitle:'Prático demais.',           focusKeys:[], pool:['corte o pão ao meio','passe manteiga dos dois lados','coloque uma fatia de queijo','adicione presunto se quiser','leve à frigideira por dois minutos'], target:5, goalWpm:22 },
  { id: 'w15-l5', world:15, order:5, mode:'text',     title:'Receita completa', emoji:'📋', subtitle:'Texto com instruções.',    focusKeys:[], pool:['para fazer uma salada de frutas, pique banana, maçã e morango em cubos pequenos. misture tudo numa tigela grande. adicione suco de laranja e um pouco de mel. sirva bem geladinho.'], target:1, goalWpm:24 },

  // ===== MUNDO 16 — CONSTELAÇÃO DAS POESIAS =====
  { id: 'w16-l1', world:16, order:1, mode:'sentence', title:'Versos curtinhos',emoji:'🌙', subtitle:'Uma linha de cada vez.', focusKeys:[], pool:['estrelinha que brilha no céu','a lua cheia ilumina a rua','o vento canta na copa da árvore','flores dançam com a brisa','o mar murmura sua canção'], target:5, goalWpm:20 },
  { id: 'w16-l2', world:16, order:2, mode:'sentence', title:'Rimas bonitas',    emoji:'✨', subtitle:'Palavras que combinam.',focusKeys:[], pool:['pipa pequena sobe pro céu sereno','gatinho travesso pulou na sacola fresca','borboleta leve pousou flor de azaleia','cachorrinho alegre corre pela rua verde','peixinho azul brilha no mar do sul'], target:5, goalWpm:22 },
  { id: 'w16-l3', world:16, order:3, mode:'sentence', title:'Natureza',         emoji:'🍃', subtitle:'Poesia do mundo.',       focusKeys:[], pool:['o sol pinta o horizonte de laranja','a chuva fina beija as flores do jardim','a neblina cobre os montes de manhã','o riacho canta para as pedras','o arco-íris aparece depois do temporal'], target:5, goalWpm:22 },
  { id: 'w16-l4', world:16, order:4, mode:'sentence', title:'Sentimentos',      emoji:'💖', subtitle:'Versos que emocionam.',  focusKeys:[], pool:['amor é como bolha de sabão','saudade é o tempo que não volta','alegria é confete voando','coragem é sorrir ao contrário','amizade é sapato confortável'], target:5, goalWpm:22 },
  { id: 'w16-l5', world:16, order:5, mode:'text',     title:'Poema completo',  emoji:'🌸', subtitle:'Uma pequena poesia.',    focusKeys:[], pool:['no jardim encantado onde brotam os sonhos, as flores conversam em rimas bonitinhas. o sol ri de olhos fechados e a lua escreve poemas no caderno das estrelas.'], target:1, goalWpm:24 },

  // ===== MUNDO 17 — LABIRINTO DAS ENROSCADAS =====
  { id: 'w17-l1', world:17, order:1, mode:'sentence', title:'Travinhas fáceis', emoji:'🌀', subtitle:'Cuidado com a pressa.',  focusKeys:[], pool:['o rato roeu a roupa do rei','três pratos de trigo','pedro pedreiro prega pregos','boca de poço boca de pote','larga a lagarta lá'], target:5, goalWpm:20 },
  { id: 'w17-l2', world:17, order:2, mode:'sentence', title:'Médias',           emoji:'🌀', subtitle:'Um pouco mais difíceis.',focusKeys:[], pool:['o tempo perguntou ao tempo quanto tempo o tempo tem','o pintor pinta pouco mas pinta bem','sai do saco do sapo o seco papo do sapo','a aranha arranha a rã a rã arranha a aranha','um tigre dois tigres três tigres trotando tristes'], target:5, goalWpm:22 },
  { id: 'w17-l3', world:17, order:3, mode:'sentence', title:'Difíceis!',        emoji:'🌀', subtitle:'Concentração total.',     focusKeys:[], pool:['o sabiá não sabia que o sábio sabia assobiar','atrás da pia tem um prato tem um pato na pia atrás','bagre branco barba preta bagre preto barba branca','a babá boba bebeu a baba do bebê','o caju do juca e a jaca do cajá'], target:5, goalWpm:22 },
  { id: 'w17-l4', world:17, order:4, mode:'sentence', title:'Muito difíceis',    emoji:'🧩', subtitle:'Quase impossível!',       focusKeys:[], pool:['o arcebispo de constantinopla se quer desconstantinopolizar','paz por favor pois o peixe apodreceu','debaixo da pia tem uma pinguela pela pinguela passa um pinguim','o rato roeu a rolha da garrafa do rei da rússia','num ninho de mafagafos seis mafagafinhos há'], target:5, goalWpm:24 },

  // ===== MUNDO 18 — UNIVERSIDADE =====
  { id: 'w18-l1', world:18, order:1, mode:'sentence', title:'Sabia que?',    emoji:'💡', subtitle:'Fatos curiosos.',           focusKeys:[], pool:['o polvo tem três corações e sangue azul','as abelhas dançam para indicar onde tem flor','o sol é mil vezes maior que a terra','o coração dos beija-flores bate mil vezes por minuto','a lua se afasta três centímetros por ano'], target:5, goalWpm:22 },
  { id: 'w18-l2', world:18, order:2, mode:'sentence', title:'Ciência divertida',emoji:'🔬', subtitle:'Como as coisas funcionam.', focusKeys:[], pool:['a água ferve a cem graus celsius','o arco-íris nasce do sol atravessando a chuva','as plantas respiram fazendo fotossíntese','os elefantes podem sentir as vibrações pelas patas','o som viaja mais rápido na água do que no ar'], target:5, goalWpm:22 },
  { id: 'w18-l3', world:18, order:3, mode:'sentence', title:'Corpo humano',   emoji:'🧠', subtitle:'Nosso organismo.',         focusKeys:[], pool:['temos cerca de duzentos e seis ossos no corpo','o cérebro usa vinte por cento da nossa energia','os olhos enviam sinais para o cérebro','o coração bombeia sete mil litros por dia','os cabelos crescem cerca de um centímetro por mês'], target:5, goalWpm:22 },
  { id: 'w18-l4', world:18, order:4, mode:'text',     title:'Pequeno conhecimento', emoji:'📘', subtitle:'Aprendendo enquanto digita.', focusKeys:[], pool:['o brasil é o quinto maior país do mundo em extensão e concentra uma enorme biodiversidade. na floresta amazônica vivem milhões de espécies de animais e plantas.'], target:1, goalWpm:26 },

  // ===== MUNDO 19 — PISTA DE RESISTÊNCIA =====
  { id: 'w19-l1', world:19, order:1, mode:'text', title:'Maratona pequena', emoji:'🏃', subtitle:'Texto de aquecimento.',   focusKeys:[], pool:[TEXTS[0]+' '+TEXTS[1]], target:1, goalWpm:22 },
  { id: 'w19-l2', world:19, order:2, mode:'text', title:'Fôlego médio',     emoji:'🏃‍♂️', subtitle:'Dois parágrafos.',        focusKeys:[], pool:[TEXTS[2]+' '+TEXTS[3]], target:1, goalWpm:24 },
  { id: 'w19-l3', world:19, order:3, mode:'text', title:'Meia distância',   emoji:'🚴', subtitle:'Aguenta firme!',           focusKeys:[], pool:[TEXTS[4]+' '+TEXTS[5]], target:1, goalWpm:26 },
  { id: 'w19-l4', world:19, order:4, mode:'text', title:'Corrida longa',    emoji:'🏃‍♀️', subtitle:'Três parágrafos.',       focusKeys:[], pool:[TEXTS[6]+' '+TEXTS[7]+' '+TEXTS[8]], target:1, goalWpm:28 },
  { id: 'w19-l5', world:19, order:5, mode:'text', title:'Ultramaratona!',   emoji:'🏆', subtitle:'Todo o resto.',            focusKeys:[], pool:[TEXTS.join(' ')], target:1, goalWpm:32 },

  // ===== MUNDO 20 — TRONO DOS CAMPEÕES =====
  { id: 'w20-l1', world:20, order:1, mode:'balloons', title:'Tempestade de letras', emoji:'🌀', subtitle:'Tudo misturado.',    focusKeys:[], pool:only(['a','s','d','f','j','k','l','ç','q','w','e','r','t','y','u','i','o','p','z','x','c','v','b','n','m']), target:40, speed:5, maxAtOnce:5 },
  { id: 'w20-l2', world:20, order:2, mode:'pies',     title:'Rajada final',         emoji:'💨', subtitle:'Palavras voando.',    focusKeys:[], pool:[...ANIMAL_WORDS,...FRUIT_WORDS,...MEDIUM_WORDS,...SCHOOL_WORDS], target:20, speed:6, maxAtOnce:4 },
  { id: 'w20-l3', world:20, order:3, mode:'sentence', title:'Frases elite',         emoji:'⚡', subtitle:'40+ PPM pra 3 estrelas.',focusKeys:[], pool:[...SENT_LONG,...SENT_HARD_WORDS], target:8, goalWpm:40 },
  { id: 'w20-l4', world:20, order:4, mode:'sentence', title:'Dígrafos rápidos',     emoji:'🔤', subtitle:'Com ch, lh, nh, qu.', focusKeys:[], pool:['o chocolate derreteu na manhã quentinha','meu filho quer ganhar um cachorrinho','o guarda-chuva voou pela chuva forte','minha mulher fez cachinhos no cabelo','o carrinho passou pelo caminho estreito'], target:5, goalWpm:42 },
  { id: 'w20-l5', world:20, order:5, mode:'text',     title:'Desafio supremo',      emoji:'👑', subtitle:'Texto longo, alto WPM.', focusKeys:[], pool:[TEXTS.slice(0,3).join(' ')], target:1, goalWpm:45 },
  { id: 'w20-l6', world:20, order:6, mode:'sentence', title:'Acentos em velocidade',emoji:'🎨', subtitle:'Todos os acentos rápidos.', focusKeys:[], pool:['minha vovó fez pão de três cores','o avô é o coração da família','três pêssegos caíram do pé','açúcar e água formam calda grossa','lições de manhã, brincadeiras à tarde'], target:5, goalWpm:45 },
  { id: 'w20-l7', world:20, order:7, mode:'text',     title:'Mestre da digitação',  emoji:'🏆', subtitle:'Tudo junto e misturado.',   focusKeys:[], pool:[TEXTS.slice(3,6).join(' ')], target:1, goalWpm:48 },
  { id: 'w20-l8', world:20, order:8, mode:'text',     title:'Coroação',             emoji:'👑', subtitle:'50+ PPM! Você é o(a) campeã(o)!', focusKeys:[], pool:[TEXTS.slice(6).join(' ')], target:1, goalWpm:55 },
];

export const WORLDS = [
  { id: 1,  title: 'Ilha das Letras',        emoji: '🏝️',  desc: 'Linha de base: asdfjklç',        color: 'from-sky1 to-sky2' },
  { id: 2,  title: 'Nuvem Voadora',          emoji: '☁️',  desc: 'Linha de cima: qwertyuiop',      color: 'from-grape to-candy' },
  { id: 3,  title: 'Caverna Secreta',        emoji: '🕳️',  desc: 'Linha de baixo: zxcvbnm',         color: 'from-tangerine to-sun' },
  { id: 4,  title: 'Pomar das Palavras',     emoji: '🍓',  desc: 'Palavras do dia a dia',          color: 'from-coral to-candy' },
  { id: 5,  title: 'Jardim das Frases',      emoji: '🌻',  desc: 'Frases completas e rimas',       color: 'from-grass to-mint' },
  { id: 6,  title: 'Castelo dos Textos',     emoji: '🏰',  desc: 'Pequenos contos para digitar',   color: 'from-grape to-sky1' },
  { id: 7,  title: 'Torre dos Números',      emoji: '🔢',  desc: '0 a 9 + pontuação',              color: 'from-sun to-tangerine' },
  { id: 8,  title: 'Reino da Velocidade',    emoji: '🚀',  desc: 'Desafios de PPM',                color: 'from-candy to-grape' },
  { id: 9,  title: 'Galeria dos Acentos',    emoji: '🎨',  desc: 'ç, á, é, â, ã, ê, ô, õ, etc.',   color: 'from-tangerine to-candy' },
  { id: 10, title: 'Praça dos Dígrafos',     emoji: '🔤',  desc: 'ch, nh, lh, qu, gu, rr, ss',     color: 'from-sky1 to-mint' },
  { id: 11, title: 'Montanha das Maiúsculas',emoji: '🔠',  desc: 'Shift + letra. Nomes próprios.', color: 'from-grape to-tangerine' },
  { id: 12, title: 'Biblioteca Mágica',      emoji: '📚',  desc: 'Provérbios e citações',          color: 'from-coral to-sun' },
  { id: 13, title: 'Teatro das Emoções',     emoji: '🎭',  desc: 'Diálogos expressivos',           color: 'from-candy to-coral' },
  { id: 14, title: 'Circo das Adivinhas',    emoji: '🎪',  desc: 'Charadas e o-que-é-o-que-é',     color: 'from-sun to-grass' },
  { id: 15, title: 'Cozinha Curiosa',        emoji: '🍳',  desc: 'Receitas passo a passo',         color: 'from-tangerine to-coral' },
  { id: 16, title: 'Constelação das Poesias',emoji: '🌌',  desc: 'Versos e rimas encantadas',      color: 'from-grape to-sky1' },
  { id: 17, title: 'Labirinto das Enroscadas',emoji:'🌀',  desc: 'Trava-línguas avançados',        color: 'from-mint to-grape' },
  { id: 18, title: 'Universidade',           emoji: '🎓',  desc: 'Curiosidades que ensinam',       color: 'from-sky1 to-grass' },
  { id: 19, title: 'Pista de Resistência',   emoji: '🏁',  desc: 'Textos longos, fôlego',          color: 'from-grass to-sky1' },
  { id: 20, title: 'Trono dos Campeões',     emoji: '👑',  desc: 'Desafio final, tudo misturado',  color: 'from-candy to-grape' },
];

export function getLevelsByWorld(world: number): Level[] {
  return LEVELS.filter((l) => l.world === world).sort((a, b) => a.order - b.order);
}

export function getWorldMeta(worldId: number) {
  return WORLDS.find((w) => w.id === worldId);
}

export function getLessonPosition(level: Level): { index: number; total: number } {
  const all = getLevelsByWorld(level.world);
  const index = all.findIndex((l) => l.id === level.id) + 1;
  return { index, total: all.length };
}

export function getNextLevel(current: Level): Level | undefined {
  const idx = LEVELS.findIndex((l) => l.id === current.id);
  return LEVELS[idx + 1];
}

/** True se o nível envolve digitar dígitos (0-9) — no pool ou focusKeys. */
export function levelHasDigits(level: Level): boolean {
  if (level.focusKeys.some((k) => /\d/.test(k))) return true;
  return level.pool.some((item) => /\d/.test(item));
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
  if (accuracy < 60 || wpm < 5)  return 'w1-l1';    // iniciante total
  if (accuracy < 75 || wpm < 10) return 'w1-l10';   // sabe um pouco da base
  if (wpm < 15) return 'w2-l1';                     // começa top row
  if (wpm < 22) return 'w3-l1';                     // bottom row
  if (wpm < 30) return 'w4-l1';                     // palavras
  if (wpm < 40) return 'w5-l1';                     // frases
  if (wpm < 50) return 'w6-l1';                     // textos
  return 'w8-l6';                                   // velocidade
}
