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
    { id: 'chard',      name: 'Acelga',     nameEn: 'Swiss chard',  emoji: '🫛' },
    { id: 'garlic',     name: 'Ajo',        nameEn: 'Garlic',       emoji: '🧄' },
    { id: 'celery',     name: 'Apio',       nameEn: 'Celery',       emoji: '🌿' },
    { id: 'eggplant',   name: 'Berenjena',  nameEn: 'Aubergine',    emoji: '🍆' },
    { id: 'broccoli',   name: 'Brócoli',    nameEn: 'Broccoli',     emoji: '🥦' },
    { id: 'zucchini',   name: 'Calabacín',  nameEn: 'Courgette',    emoji: '🥒' },
    { id: 'pumpkin',    name: 'Calabaza',   nameEn: 'Pumpkin',      emoji: '🎃' },
    { id: 'cabbage',    name: 'Col',        nameEn: 'Cabbage',      emoji: '🥬' },
    { id: 'onion',      name: 'Cebolla',    nameEn: 'Onion',        emoji: '🧅' },
    { id: 'chili',      name: 'Chile',      nameEn: 'Chilli',       emoji: '🌶️' },
    { id: 'spinach',    name: 'Espinaca',   nameEn: 'Spinach',      emoji: '🌿' },
    { id: 'fennel',     name: 'Hinojo',     nameEn: 'Fennel',       emoji: '🌾' },
    { id: 'bean',       name: 'Judía',      nameEn: 'Bean',         emoji: '🫘' },
    { id: 'lettuce',    name: 'Lechuga',    nameEn: 'Lettuce',      emoji: '🥬' },
    { id: 'corn',       name: 'Maíz',       nameEn: 'Corn',         emoji: '🌽' },
    { id: 'potato',     name: 'Patata',     nameEn: 'Potato',       emoji: '🥔' },
    { id: 'pea',        name: 'Guisante',   nameEn: 'Pea',          emoji: '🫛' },
    { id: 'parsley',    name: 'Perejil',    nameEn: 'Parsley',      emoji: '🌿' },
    { id: 'cucumber',   name: 'Pepino',     nameEn: 'Cucumber',     emoji: '🥒' },
    { id: 'pepper',     name: 'Pimiento',   nameEn: 'Bell pepper',  emoji: '🫑' },
    { id: 'radish',     name: 'Rabanillo',  nameEn: 'Radish',       emoji: '🌱' },
    { id: 'tomato',     name: 'Tomate',     nameEn: 'Tomato',       emoji: '🍅' },
    { id: 'carrot',     name: 'Zanahoria',  nameEn: 'Carrot',       emoji: '🥕' },
  ]),
  Frutas: sortEs([
    { id: 'strawberry', name: 'Fresa',      nameEn: 'Strawberry',   emoji: '🍓' },
  ]),
};

export const ALL_PLANTS: Plant[] = Object.values(PLANTS).flat();

export function findPlant(id: string): Plant | undefined {
  return ALL_PLANTS.find(p => p.id === id);
}
