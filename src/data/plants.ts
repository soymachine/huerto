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
    { id: 'chard',       name: 'Acelga',     nameEn: 'Swiss chard',   emoji: '🍃' },
    { id: 'garlic',      name: 'Ajo',        nameEn: 'Garlic',        emoji: '🧄' },
    { id: 'artichoke',   name: 'Alcachofa',  nameEn: 'Artichoke',     emoji: '🌷' },
    { id: 'celery',      name: 'Apio',       nameEn: 'Celery',        emoji: '🌿' },
    { id: 'eggplant',    name: 'Berenjena',  nameEn: 'Aubergine',     emoji: '🍆' },
    { id: 'borage',      name: 'Borraja',    nameEn: 'Borage',        emoji: '🫐' },
    { id: 'broccoli',    name: 'Brócoli',    nameEn: 'Broccoli',      emoji: '🥦' },
    { id: 'zucchini',    name: 'Calabacín',  nameEn: 'Courgette',     emoji: '🍐' },
    { id: 'pumpkin',     name: 'Calabaza',   nameEn: 'Pumpkin',       emoji: '🎃' },
    { id: 'onion',       name: 'Cebolla',    nameEn: 'Onion',         emoji: '🧅' },
    { id: 'chili',       name: 'Chile',      nameEn: 'Chilli',        emoji: '🌶️' },
    { id: 'cabbage',     name: 'Col',        nameEn: 'Cabbage',       emoji: '🥗' },
    { id: 'cauliflower', name: 'Coliflor',   nameEn: 'Cauliflower',   emoji: '🏵️' },
    { id: 'escarole',    name: 'Escarola',   nameEn: 'Escarole',      emoji: '🥙' },
    { id: 'spinach',     name: 'Espinaca',   nameEn: 'Spinach',       emoji: '🍀' },
    { id: 'fennel',      name: 'Hinojo',     nameEn: 'Fennel',        emoji: '🌾' },
    { id: 'bean',        name: 'Judía',      nameEn: 'Bean',          emoji: '🫘' },
    { id: 'fava',        name: 'Haba',       nameEn: 'Broad bean',    emoji: '🥜' },
    { id: 'lamblettuce', name: 'Canónigos',  nameEn: 'Lamb\'s lettuce', emoji: '🌱' },
    { id: 'lettuce',     name: 'Lechuga',    nameEn: 'Lettuce',       emoji: '🥬' },
    { id: 'corn',        name: 'Maíz',       nameEn: 'Corn',          emoji: '🌽' },
    { id: 'turnip',      name: 'Nabo',       nameEn: 'Turnip',        emoji: '🍠' },
    { id: 'potato',      name: 'Patata',     nameEn: 'Potato',        emoji: '🥔' },
    { id: 'pea',         name: 'Guisante',   nameEn: 'Pea',           emoji: '🫛' },
    { id: 'parsley',     name: 'Perejil',    nameEn: 'Parsley',       emoji: '☘️' },
    { id: 'cucumber',    name: 'Pepino',     nameEn: 'Cucumber',      emoji: '🥒' },
    { id: 'pepper',      name: 'Pimiento',   nameEn: 'Bell pepper',   emoji: '🫑' },
    { id: 'leek',        name: 'Puerro',     nameEn: 'Leek',          emoji: '🎋' },
    { id: 'radish',      name: 'Rabanillo',  nameEn: 'Radish',        emoji: '🔴' },
    { id: 'beet',        name: 'Remolacha',  nameEn: 'Beetroot',      emoji: '🍷' },
    { id: 'tomato',      name: 'Tomate',     nameEn: 'Tomato',        emoji: '🍅' },
    { id: 'carrot',      name: 'Zanahoria',  nameEn: 'Carrot',        emoji: '🥕' },
  ]),
  Frutas: sortEs([
    { id: 'melon',       name: 'Melón',      nameEn: 'Melon',         emoji: '🍈' }, // honeydew melon emoji
    { id: 'strawberry',  name: 'Fresa',      nameEn: 'Strawberry',    emoji: '🍓' },
    { id: 'watermelon',  name: 'Sandía',     nameEn: 'Watermelon',    emoji: '🍉' },
  ]),
  Hierbas: sortEs([
    { id: 'basil',       name: 'Albahaca',   nameEn: 'Basil',         emoji: '🪴' },
    { id: 'calendula',   name: 'Caléndula',  nameEn: 'Calendula',     emoji: '🌼' },
    { id: 'cosmos',      name: 'Cosmos',     nameEn: 'Cosmos',        emoji: '🌸' },
    { id: 'lavender',    name: 'Lavanda',    nameEn: 'Lavender',      emoji: '🪻' },
    { id: 'nasturtium',  name: 'Capuchina',  nameEn: 'Nasturtium',    emoji: '🌺' },
    { id: 'rosemary',    name: 'Romero',     nameEn: 'Rosemary',      emoji: '🌲' },
    { id: 'sage',        name: 'Salvia',     nameEn: 'Sage',          emoji: '🍵' },
    { id: 'tagetes',     name: 'Tagete',     nameEn: 'Marigold',      emoji: '🌻' },
  ]),
};

export const ALL_PLANTS: Plant[] = Object.values(PLANTS).flat();

export function findPlant(id: string): Plant | undefined {
  return ALL_PLANTS.find(p => p.id === id);
}
