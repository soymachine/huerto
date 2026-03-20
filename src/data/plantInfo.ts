export interface PlantInfo {
  sowMonths: number[];
  transplantMonths?: number[];
  harvestMonths: number[];
  spacing: string;
  depth: string;
  duration: string;
  difficulty: 1 | 2 | 3;
  companions: string[];
  avoid: string[];
  tip: string;
}

export const DIFFICULTY_LABEL: Record<number, string> = {
  1: 'Fácil',
  2: 'Media',
  3: 'Difícil',
};

// ─── Fuente de asociaciones ───────────────────────────────────────────────────
// "El huerto urbano. Manual de cultivo ecológico en balcones y terrazas"
// (Vallés, 2007) y "Huerto urbano sostenible" (Pérez y Velázquez, 2013).

export const PLANT_INFO: Record<string, PlantInfo> = {

  // ── Tomate ────────────────────────────────────────────────────────────────
  tomato: {
    sowMonths: [2, 3, 4],
    transplantMonths: [4, 5, 6],
    harvestMonths: [7, 8, 9, 10],
    spacing: '50–70 cm',
    depth: '0,5 cm',
    duration: '70–90 días',
    difficulty: 2,
    companions: ['chard', 'garlic', 'basil', 'celery', 'onion', 'cabbage',
                 'spinach', 'pea', 'bean', 'lettuce', 'corn', 'parsley',
                 'leek', 'radish', 'carrot'],
    avoid: ['fennel', 'potato', 'cucumber', 'beet'],
    tip: 'Poda los chupones laterales y coloca un tutor desde los 30 cm de altura para mayor producción y ventilación.',
  },

  // ── Chile ─────────────────────────────────────────────────────────────────
  chili: {
    sowMonths: [2, 3],
    transplantMonths: [4, 5],
    harvestMonths: [7, 8, 9, 10],
    spacing: '40–50 cm',
    depth: '0,5 cm',
    duration: '90–120 días',
    difficulty: 2,
    companions: ['tomato', 'carrot', 'parsley', 'basil'],
    avoid: ['fennel'],
    tip: 'Necesita calor constante. Siembra en interior 10–12 semanas antes del trasplante. Riega regularmente sin encharcar.',
  },

  // ── Pimiento ──────────────────────────────────────────────────────────────
  pepper: {
    sowMonths: [2, 3],
    transplantMonths: [4, 5],
    harvestMonths: [7, 8, 9, 10],
    spacing: '40–60 cm',
    depth: '0,5 cm',
    duration: '80–100 días',
    difficulty: 2,
    companions: ['chard', 'garlic', 'basil', 'cabbage', 'spinach',
                 'pea', 'bean', 'lettuce', 'leek', 'radish'],
    avoid: ['potato'],
    tip: 'Recoge los primeros frutos en verde para estimular la producción. El acolchado del suelo conserva la humedad y el calor.',
  },

  // ── Calabacín ─────────────────────────────────────────────────────────────
  zucchini: {
    sowMonths: [4, 5, 6],
    harvestMonths: [6, 7, 8, 9],
    spacing: '80–100 cm',
    depth: '2–3 cm',
    duration: '45–55 días',
    difficulty: 1,
    companions: ['radish', 'onion', 'bean'],
    avoid: ['potato'],
    tip: 'Cosecha cuando mida 15–20 cm. Si dejas crecer los frutos demasiado, la planta reduce su producción drásticamente.',
  },

  // ── Pepino ────────────────────────────────────────────────────────────────
  cucumber: {
    sowMonths: [4, 5],
    transplantMonths: [5, 6],
    harvestMonths: [6, 7, 8, 9],
    spacing: '40–60 cm',
    depth: '1–2 cm',
    duration: '50–65 días',
    difficulty: 1,
    companions: ['garlic', 'basil', 'celery', 'borage', 'onion', 'cabbage',
                 'pea', 'bean', 'lettuce', 'corn', 'turnip', 'radish', 'beet'],
    avoid: ['eggplant', 'potato', 'tomato'],
    tip: 'Con tutor vertical aprovecha mucho mejor el espacio. Riega con regularidad para evitar el sabor amargo.',
  },

  // ── Berenjena ─────────────────────────────────────────────────────────────
  eggplant: {
    sowMonths: [2, 3],
    transplantMonths: [4, 5],
    harvestMonths: [7, 8, 9, 10],
    spacing: '50–70 cm',
    depth: '0,5 cm',
    duration: '80–100 días',
    difficulty: 2,
    companions: ['garlic', 'celery', 'borage', 'onion', 'cabbage', 'spinach',
                 'bean', 'lettuce', 'potato', 'leek', 'radish', 'carrot'],
    avoid: ['cucumber'],
    tip: 'Muy exigente en temperatura. No trasplantes si hay riesgo de heladas. Precisa pleno sol y riego constante.',
  },

  // ── Lechuga ───────────────────────────────────────────────────────────────
  lettuce: {
    sowMonths: [2, 3, 4, 5, 9, 10],
    transplantMonths: [3, 4, 5, 10, 11],
    harvestMonths: [4, 5, 6, 7, 11, 12],
    spacing: '25–30 cm',
    depth: '0,5 cm',
    duration: '45–60 días',
    difficulty: 1,
    companions: ['garlic', 'eggplant', 'onion', 'cabbage', 'spinach', 'strawberry',
                 'pea', 'fava', 'corn', 'melon', 'turnip', 'potato', 'cucumber',
                 'pepper', 'leek', 'radish', 'beet', 'watermelon', 'tomato', 'carrot'],
    avoid: ['celery', 'parsley'],
    tip: 'Siembra escalonada cada 3 semanas para cosecha continua. En verano busca semisombra para evitar que espigue rápido.',
  },

  // ── Col / Repollo ─────────────────────────────────────────────────────────
  cabbage: {
    sowMonths: [6, 7, 8],
    transplantMonths: [8, 9],
    harvestMonths: [11, 12, 1, 2],
    spacing: '50–60 cm',
    depth: '1 cm',
    duration: '90–120 días',
    difficulty: 2,
    companions: ['chard', 'celery', 'eggplant', 'pumpkin', 'onion', 'spinach',
                 'pea', 'bean', 'lettuce', 'turnip', 'potato', 'cucumber',
                 'pepper', 'leek', 'beet', 'tomato', 'carrot'],
    avoid: ['garlic', 'onion', 'strawberry', 'fennel'],
    tip: 'Cultivo de otoño-invierno. Cubre con malla anti-insectos desde el trasplante para prevenir la oruga de la col.',
  },

  // ── Acelga ────────────────────────────────────────────────────────────────
  chard: {
    sowMonths: [3, 4, 5, 6, 7, 8, 9],
    harvestMonths: [5, 6, 7, 8, 9, 10, 11],
    spacing: '30–40 cm',
    depth: '2 cm',
    duration: '50–70 días',
    difficulty: 1,
    companions: ['celery', 'onion', 'cabbage', 'bean', 'lettuce',
                 'pepper', 'radish', 'tomato', 'carrot'],
    avoid: ['leek'],
    tip: 'Cosecha las hojas externas dejando el cogollo central intacto. Una sola planta puede producir durante varios meses.',
  },

  // ── Zanahoria ─────────────────────────────────────────────────────────────
  carrot: {
    sowMonths: [3, 4, 5, 6, 7],
    harvestMonths: [6, 7, 8, 9, 10],
    spacing: '5–10 cm',
    depth: '1 cm',
    duration: '70–90 días',
    difficulty: 2,
    companions: ['chard', 'garlic', 'eggplant', 'onion', 'cabbage',
                 'bean', 'pea', 'lettuce', 'potato', 'leek', 'tomato'],
    avoid: ['celery', 'beet'],
    tip: 'Necesita tierra suelta y profunda, sin piedras. Aclara a 5 cm para que la raíz engorde. Riega de forma uniforme.',
  },

  // ── Cebolla ───────────────────────────────────────────────────────────────
  onion: {
    sowMonths: [1, 2, 9, 10],
    transplantMonths: [3, 4, 10, 11],
    harvestMonths: [5, 6, 7, 8],
    spacing: '15–20 cm',
    depth: '1–2 cm',
    duration: '90–150 días',
    difficulty: 1,
    companions: ['eggplant', 'zucchini', 'cabbage', 'spinach', 'strawberry', 'lettuce',
                 'melon', 'cucumber', 'parsley', 'leek', 'beet', 'watermelon', 'tomato', 'carrot'],
    avoid: ['pea', 'potato'],
    tip: 'Deja de regar cuando el tallo empiece a caer. Cura al sol durante 2 semanas antes de guardar para larga conservación.',
  },

  // ── Ajo ───────────────────────────────────────────────────────────────────
  garlic: {
    sowMonths: [10, 11],
    harvestMonths: [5, 6, 7],
    spacing: '10–15 cm',
    depth: '3–5 cm',
    duration: '180–210 días',
    difficulty: 1,
    companions: ['basil', 'eggplant', 'strawberry', 'lettuce', 'turnip',
                 'cucumber', 'pepper', 'beet', 'tomato', 'carrot'],
    avoid: ['cabbage', 'pea', 'fava', 'bean', 'leek'],
    tip: 'Planta los dientes con la punta hacia arriba. Cosecha cuando las 3–4 hojas inferiores empiecen a amarillear.',
  },

  // ── Patata ────────────────────────────────────────────────────────────────
  potato: {
    sowMonths: [2, 3, 4, 8, 9],
    harvestMonths: [6, 7, 8, 11, 12],
    spacing: '30–40 cm',
    depth: '8–10 cm',
    duration: '90–120 días',
    difficulty: 1,
    companions: ['eggplant', 'cabbage', 'fava', 'bean', 'corn', 'leek', 'radish', 'carrot'],
    avoid: ['celery', 'cucumber', 'pepper', 'tomato'],
    tip: 'Aporca (cubre con tierra) cuando la planta mida 15 cm. Evita plantar donde hubo tomates o pimientos el año anterior.',
  },

  // ── Maíz ──────────────────────────────────────────────────────────────────
  corn: {
    sowMonths: [4, 5, 6],
    harvestMonths: [8, 9, 10],
    spacing: '25–30 cm',
    depth: '3–4 cm',
    duration: '75–90 días',
    difficulty: 2,
    companions: ['pea', 'fava', 'bean', 'melon', 'potato', 'cucumber', 'watermelon', 'tomato'],
    avoid: ['celery', 'beet'],
    tip: 'Planta en bloques cuadrados, no en filas únicas, para favorecer la polinización cruzada por el viento.',
  },

  // ── Calabaza ──────────────────────────────────────────────────────────────
  pumpkin: {
    sowMonths: [4, 5],
    harvestMonths: [9, 10, 11],
    spacing: '100–150 cm',
    depth: '2–3 cm',
    duration: '90–110 días',
    difficulty: 1,
    companions: ['corn', 'bean', 'radish', 'cabbage'],
    avoid: ['potato'],
    tip: 'Deja un solo fruto por planta si quieres máximo tamaño. Coloca una tabla bajo el fruto para evitar podredumbre.',
  },

  // ── Brócoli ───────────────────────────────────────────────────────────────
  broccoli: {
    sowMonths: [6, 7, 8],
    transplantMonths: [8, 9],
    harvestMonths: [11, 12, 1, 2],
    spacing: '40–60 cm',
    depth: '1 cm',
    duration: '80–100 días',
    difficulty: 2,
    companions: ['celery', 'onion', 'carrot', 'potato', 'lettuce'],
    avoid: ['tomato', 'bean', 'strawberry'],
    tip: 'Cosecha la cabeza central antes de que abra en flores amarillas. La planta seguirá produciendo brotes laterales.',
  },

  // ── Judía ─────────────────────────────────────────────────────────────────
  bean: {
    sowMonths: [4, 5, 6, 7],
    harvestMonths: [6, 7, 8, 9],
    spacing: '20–30 cm',
    depth: '3–4 cm',
    duration: '55–70 días',
    difficulty: 1,
    companions: ['basil', 'chard', 'celery', 'cabbage', 'spinach', 'strawberry',
                 'lettuce', 'corn', 'turnip', 'potato', 'cucumber', 'pepper',
                 'radish', 'tomato', 'carrot'],
    avoid: ['garlic', 'eggplant', 'onion', 'pea', 'fava', 'fennel', 'leek', 'beet'],
    tip: 'Fija nitrógeno en el suelo, por lo que no necesita abono nitrogenado. Para judía de enrame, coloca tutores de 150 cm.',
  },

  // ── Guisante ──────────────────────────────────────────────────────────────
  pea: {
    sowMonths: [10, 11, 12, 1, 2, 3],
    harvestMonths: [3, 4, 5, 6],
    spacing: '5–10 cm',
    depth: '3–4 cm',
    duration: '60–90 días',
    difficulty: 1,
    companions: ['celery', 'cabbage', 'spinach', 'lettuce', 'corn', 'melon',
                 'turnip', 'potato', 'cucumber', 'pepper', 'radish',
                 'watermelon', 'tomato', 'carrot'],
    avoid: ['garlic', 'onion', 'leek'],
    tip: 'Cultivo de temporada fresca. Coloca red o ramaje como soporte. Cosecha cada 2–3 días para prolongar la producción.',
  },

  // ── Espinaca ──────────────────────────────────────────────────────────────
  spinach: {
    sowMonths: [2, 3, 4, 9, 10],
    harvestMonths: [4, 5, 6, 11, 12],
    spacing: '15–20 cm',
    depth: '1–2 cm',
    duration: '40–55 días',
    difficulty: 1,
    companions: ['celery', 'eggplant', 'borage', 'onion', 'cabbage', 'strawberry',
                 'pea', 'fava', 'bean', 'lettuce', 'turnip', 'pepper',
                 'leek', 'radish', 'tomato', 'carrot'],
    avoid: ['chard'],
    tip: 'Espiga rápido con el calor. Siembra en otoño o al inicio de primavera. Recoge hojas externas y la planta rebrota.',
  },

  // ── Apio ──────────────────────────────────────────────────────────────────
  celery: {
    sowMonths: [2, 3],
    transplantMonths: [4, 5],
    harvestMonths: [7, 8, 9, 10],
    spacing: '30–40 cm',
    depth: '0,2 cm',
    duration: '120–140 días',
    difficulty: 3,
    companions: ['chard', 'eggplant', 'cabbage', 'spinach', 'bean',
                 'cucumber', 'leek', 'radish', 'pepper', 'tomato'],
    avoid: ['potato', 'carrot'],
    tip: 'Semilla muy fina: mézclala con arena para sembrar uniformemente. Necesita humedad constante en el suelo, nunca que se seque.',
  },

  // ── Perejil ───────────────────────────────────────────────────────────────
  parsley: {
    sowMonths: [3, 4, 5, 6, 7, 8, 9],
    harvestMonths: [5, 6, 7, 8, 9, 10, 11],
    spacing: '15–20 cm',
    depth: '1 cm',
    duration: '70–90 días',
    difficulty: 1,
    companions: ['tomato', 'carrot', 'pepper', 'strawberry', 'onion'],
    avoid: ['lettuce'],
    tip: 'Germinación lenta (2–4 semanas). Remoja las semillas 24 h en agua templada antes de sembrar para acelerar el proceso.',
  },

  // ── Hinojo ────────────────────────────────────────────────────────────────
  fennel: {
    sowMonths: [3, 4, 5, 8, 9],
    harvestMonths: [7, 8, 9, 11, 12],
    spacing: '30–40 cm',
    depth: '1 cm',
    duration: '60–90 días',
    difficulty: 2,
    companions: [],
    avoid: ['tomato', 'pepper', 'bean', 'carrot', 'cucumber', 'lettuce', 'cabbage'],
    tip: 'Planta muy alelopática: segrega sustancias que inhiben a casi todas las hortalizas. Aíslalo en un rincón del huerto.',
  },

  // ── Rabanillo ─────────────────────────────────────────────────────────────
  radish: {
    sowMonths: [3, 4, 5, 6, 9, 10],
    harvestMonths: [4, 5, 6, 7, 10, 11],
    spacing: '5–8 cm',
    depth: '1 cm',
    duration: '25–35 días',
    difficulty: 1,
    companions: ['chard', 'garlic', 'celery', 'eggplant', 'spinach', 'pea',
                 'bean', 'lettuce', 'potato', 'cucumber', 'pepper', 'tomato', 'carrot'],
    avoid: ['turnip', 'leek', 'cabbage'],
    tip: 'El cultivo más rápido del huerto. Úsalo como marcador de filas de zanahoria mientras estas germinan, ambas conviven bien.',
  },

  // ── Fresa ─────────────────────────────────────────────────────────────────
  strawberry: {
    sowMonths: [8, 9, 10],
    harvestMonths: [4, 5, 6],
    spacing: '30–40 cm',
    depth: '—',
    duration: 'Perenne',
    difficulty: 2,
    companions: ['garlic', 'onion', 'spinach', 'lettuce', 'leek'],
    avoid: ['cabbage'],
    tip: 'Planta estolones en otoño. Retira todas las flores el primer año para fortalecer la planta. Renueva cada 3–4 años.',
  },

  // ══ NUEVOS CULTIVOS ═══════════════════════════════════════════════════════

  // ── Albahaca ──────────────────────────────────────────────────────────────
  basil: {
    sowMonths: [3, 4, 5],
    transplantMonths: [5, 6],
    harvestMonths: [6, 7, 8, 9, 10],
    spacing: '20–30 cm',
    depth: '0,5 cm',
    duration: '40–60 días',
    difficulty: 1,
    companions: ['bean', 'cucumber', 'pepper', 'tomato'],
    avoid: [],
    tip: 'Pinza las flores para que las hojas sean más aromáticas. Riega por la mañana y evita que el sustrato se seque. Muy sensible al frío.',
  },

  // ── Alcachofa ─────────────────────────────────────────────────────────────
  artichoke: {
    sowMonths: [2, 3],
    transplantMonths: [4, 5],
    harvestMonths: [3, 4, 5],
    spacing: '80–100 cm',
    depth: '1 cm',
    duration: 'Perenne',
    difficulty: 2,
    companions: ['bean', 'lettuce', 'pea', 'radish', 'fava'],
    avoid: ['potato'],
    tip: 'Se propaga mejor por esquejes laterales (hijuelos) que por semilla. Corta la cabeza antes de que abra. Planta perenne: vive 5–7 años.',
  },

  // ── Borraja ───────────────────────────────────────────────────────────────
  borage: {
    sowMonths: [3, 4, 5],
    harvestMonths: [6, 7, 8, 9],
    spacing: '30–40 cm',
    depth: '1–2 cm',
    duration: '50–70 días',
    difficulty: 1,
    companions: ['eggplant', 'spinach', 'cucumber'],
    avoid: [],
    tip: 'Planta benefactora: atrae polinizadores y repele plagas. Sus flores azules son comestibles. Se autosiembra fácilmente.',
  },

  // ── Coliflor ──────────────────────────────────────────────────────────────
  cauliflower: {
    sowMonths: [6, 7, 8],
    transplantMonths: [8, 9],
    harvestMonths: [11, 12, 1, 2],
    spacing: '50–60 cm',
    depth: '1 cm',
    duration: '80–100 días',
    difficulty: 3,
    companions: ['celery', 'tomato'],
    avoid: ['onion', 'cabbage', 'potato'],
    tip: 'Cuando la cabeza alcance 10 cm, dobla las hojas sobre ella para blanquearla y protegerla del sol. Muy exigente en agua y temperatura.',
  },

  // ── Haba ──────────────────────────────────────────────────────────────────
  fava: {
    sowMonths: [10, 11, 12, 1],
    harvestMonths: [3, 4, 5, 6],
    spacing: '20–30 cm',
    depth: '5–8 cm',
    duration: '150–180 días',
    difficulty: 1,
    companions: ['artichoke', 'celery', 'spinach', 'lettuce', 'corn', 'potato'],
    avoid: ['garlic', 'cauliflower', 'leek'],
    tip: 'Cultivo de invierno: aguanta heladas leves. Cuando florezca, pinza el ápice para prevenir los pulgones negros que adoran los brotes tiernos.',
  },

  // ── Melón ─────────────────────────────────────────────────────────────────
  melon: {
    sowMonths: [4, 5],
    transplantMonths: [5, 6],
    harvestMonths: [7, 8, 9],
    spacing: '100–150 cm',
    depth: '1–2 cm',
    duration: '90–110 días',
    difficulty: 2,
    companions: ['onion', 'pea', 'lettuce', 'corn'],
    avoid: [],
    tip: 'Necesita mucho calor y sol. Cuando el fruto alcance el tamaño de un puño, deja solo 2–3 frutos por planta para mayor tamaño y dulzor.',
  },

  // ── Nabo ──────────────────────────────────────────────────────────────────
  turnip: {
    sowMonths: [8, 9, 10],
    harvestMonths: [11, 12, 1, 2],
    spacing: '10–15 cm',
    depth: '1 cm',
    duration: '50–70 días',
    difficulty: 1,
    companions: ['cabbage', 'spinach', 'pea', 'bean', 'lettuce',
                 'cucumber', 'leek', 'beet', 'tomato'],
    avoid: ['radish', 'carrot'],
    tip: 'Siembra de otoño para cosechar en invierno. Aclara a 15 cm para que engordan las raíces. Cosecha joven (6–7 cm) para mayor terneza.',
  },

  // ── Puerro ────────────────────────────────────────────────────────────────
  leek: {
    sowMonths: [1, 2, 3],
    transplantMonths: [4, 5, 6],
    harvestMonths: [10, 11, 12, 1, 2, 3],
    spacing: '15–20 cm',
    depth: '1 cm',
    duration: '120–160 días',
    difficulty: 2,
    companions: ['celery', 'eggplant', 'onion', 'cabbage', 'spinach', 'lettuce',
                 'potato', 'pepper', 'beet', 'tomato', 'carrot'],
    avoid: ['garlic', 'pea', 'fava', 'bean', 'radish'],
    tip: 'Al trasplantar, haz hoyos de 15 cm y deja que se rellenen solos con el riego para obtener más tallo blanco. Muy resistente al frío.',
  },

  // ── Remolacha ─────────────────────────────────────────────────────────────
  beet: {
    sowMonths: [3, 4, 5, 6, 9],
    harvestMonths: [6, 7, 8, 9, 10],
    spacing: '10–15 cm',
    depth: '2 cm',
    duration: '60–90 días',
    difficulty: 1,
    companions: ['celery', 'garlic', 'onion', 'cabbage', 'lettuce',
                 'turnip', 'cucumber', 'leek'],
    avoid: ['bean', 'tomato', 'carrot'],
    tip: 'Remoja las semillas 24 h antes de sembrar. Aclara a 10–15 cm y aprovecha las plantas aclaradas en ensalada. La raíz, hojas y tallo son comestibles.',
  },

  // ── Sandía ────────────────────────────────────────────────────────────────
  watermelon: {
    sowMonths: [4, 5],
    transplantMonths: [5, 6],
    harvestMonths: [8, 9],
    spacing: '150–200 cm',
    depth: '2 cm',
    duration: '80–100 días',
    difficulty: 2,
    companions: ['onion', 'bean', 'lettuce', 'corn'],
    avoid: [],
    tip: 'Necesita mucho espacio y calor. Golpea la sandía: si suena hueco, está madura. Deja solo 2–3 frutos por planta para mayor tamaño.',
  },
};
