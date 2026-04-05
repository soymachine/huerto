export interface Plant {
  id:     string;
  name:   string;   // Spanish
  nameEn: string;   // English
  emoji:  string;
}

export type PlantCategory = Record<string, Plant[]>;

const sortEs = (arr: Plant[]) => [...arr].sort((a, b) => a.name.localeCompare(b.name, 'es'));

export const PLANTS: PlantCategory = {
  Verduras: sortEs([
    { id: 'chard',       name: 'Acelga',     nameEn: 'Swiss chard',     emoji: '🍃' }, // falling leaf = leafy green
    { id: 'garlic',      name: 'Ajo',        nameEn: 'Garlic',          emoji: '🧄' },
    { id: 'artichoke',   name: 'Alcachofa',  nameEn: 'Artichoke',       emoji: '🌹' }, // rose = layered petals like artichoke scales
    { id: 'celery',      name: 'Apio',       nameEn: 'Celery',          emoji: '🫒' }, // olive = elongated green stalk
    { id: 'eggplant',    name: 'Berenjena',  nameEn: 'Aubergine',       emoji: '🍆' },
    { id: 'borage',      name: 'Borraja',    nameEn: 'Borage',          emoji: '🪷' }, // lotus = blue/purple star-shaped flower
    { id: 'broccoli',    name: 'Brócoli',    nameEn: 'Broccoli',        emoji: '🥦' },
    { id: 'zucchini',    name: 'Calabacín',  nameEn: 'Courgette',       emoji: '🍐' }, // pear = green elongated
    { id: 'pumpkin',     name: 'Calabaza',   nameEn: 'Pumpkin',         emoji: '🎃' },
    { id: 'lamblettuce', name: 'Canónigos',  nameEn: "Lamb's lettuce",  emoji: '🌿' }, // herb = small delicate leafy plant
    { id: 'onion',       name: 'Cebolla',    nameEn: 'Onion',           emoji: '🧅' },
    { id: 'chili',       name: 'Chile',      nameEn: 'Chilli',          emoji: '🌶️' },
    { id: 'cabbage',     name: 'Col',        nameEn: 'Cabbage',         emoji: '🥬' }, // leafy green = cabbage family
    { id: 'cauliflower', name: 'Coliflor',   nameEn: 'Cauliflower',     emoji: '💮' }, // white flower = dense white florets
    { id: 'escarole',    name: 'Escarola',   nameEn: 'Escarole',        emoji: '🍀' }, // four-leaf clover = leafy rosette shape
    { id: 'spinach',     name: 'Espinaca',   nameEn: 'Spinach',         emoji: '🌱' }, // seedling = very different from ☘️ parsley
    { id: 'fennel',      name: 'Hinojo',     nameEn: 'Fennel',          emoji: '🌾' }, // feathery stalks = fennel fronds
    { id: 'bean',        name: 'Judía',      nameEn: 'Bean',            emoji: '🫘' },
    { id: 'fava',        name: 'Haba',       nameEn: 'Broad bean',      emoji: '🥜' }, // peanut = legume in pod
    { id: 'lettuce',     name: 'Lechuga',    nameEn: 'Lettuce',         emoji: '🥗' }, // salad bowl = primary use of lettuce
    { id: 'corn',        name: 'Maíz',       nameEn: 'Corn',            emoji: '🌽' },
    { id: 'turnip',      name: 'Nabo',       nameEn: 'Turnip',          emoji: '🍠' }, // sweet potato = round root vegetable
    { id: 'potato',      name: 'Patata',     nameEn: 'Potato',          emoji: '🥔' },
    { id: 'pea',         name: 'Guisante',   nameEn: 'Pea',             emoji: '🫛' },
    { id: 'parsley',     name: 'Perejil',    nameEn: 'Parsley',         emoji: '☘️' }, // shamrock = flat trifoliate leaf
    { id: 'cucumber',    name: 'Pepino',     nameEn: 'Cucumber',        emoji: '🥒' },
    { id: 'pepper',      name: 'Pimiento',   nameEn: 'Bell pepper',     emoji: '🫑' },
    { id: 'leek',        name: 'Puerro',     nameEn: 'Leek',            emoji: '🎋' }, // bamboo = tall cylindrical green plant
    { id: 'radish',      name: 'Rabanillo',  nameEn: 'Radish',          emoji: '🍒' }, // cherries = small round red food
    { id: 'beet',        name: 'Remolacha',  nameEn: 'Beetroot',        emoji: '🍇' }, // grapes = dark purple/red color
    { id: 'tomato',      name: 'Tomate',     nameEn: 'Tomato',          emoji: '🍅' },
    { id: 'carrot',      name: 'Zanahoria',  nameEn: 'Carrot',          emoji: '🥕' },
  ]),
  Frutas: sortEs([
    { id: 'melon',       name: 'Melón',      nameEn: 'Melon',           emoji: '🍈' },
    { id: 'strawberry',  name: 'Fresa',      nameEn: 'Strawberry',      emoji: '🍓' },
    { id: 'watermelon',  name: 'Sandía',     nameEn: 'Watermelon',      emoji: '🍉' },
  ]),
  Hierbas: sortEs([
    { id: 'basil',       name: 'Albahaca',   nameEn: 'Basil',           emoji: '🪴' }, // potted plant = basil sold in pots
    { id: 'calendula',   name: 'Caléndula',  nameEn: 'Calendula',       emoji: '🌼' }, // blossom = calendula flower
    { id: 'nasturtium',  name: 'Capuchina',  nameEn: 'Nasturtium',      emoji: '🌺' }, // hibiscus = orange/red flower
    { id: 'cosmos',      name: 'Cosmos',     nameEn: 'Cosmos',          emoji: '🌸' }, // cherry blossom = cosmos flower
    { id: 'lavender',    name: 'Lavanda',    nameEn: 'Lavender',        emoji: '🪻' }, // hyacinth = lavender spike
    { id: 'rosemary',    name: 'Romero',     nameEn: 'Rosemary',        emoji: '🌲' }, // evergreen = rosemary is an evergreen shrub
    { id: 'sage',        name: 'Salvia',     nameEn: 'Sage',            emoji: '🍵' }, // herbal tea = sage infusion
    { id: 'tagetes',     name: 'Tagete',     nameEn: 'Marigold',        emoji: '🌻' }, // sunflower = marigold/tagetes
  ]),
};

export const ALL_PLANTS: Plant[] = Object.values(PLANTS).flat();

export function findPlant(id: string): Plant | undefined {
  return ALL_PLANTS.find(p => p.id === id);
}
