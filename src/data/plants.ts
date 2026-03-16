export interface Plant {
  id: string;
  name: string;
  emoji: string;
}

export type PlantCategory = Record<string, Plant[]>;

export const PLANTS: PlantCategory = {
  Verduras: [
    { id: 'tomato',     name: 'Tomate',    emoji: '🍅' },
    { id: 'chili',      name: 'Chile',     emoji: '🌶️' },
    { id: 'pepper',     name: 'Pimiento',  emoji: '🫑' },
    { id: 'zucchini',   name: 'Calabacín', emoji: '🥒' },
    { id: 'cucumber',   name: 'Pepino',    emoji: '🥒' },
    { id: 'eggplant',   name: 'Berenjena', emoji: '🍆' },
    { id: 'lettuce',    name: 'Lechuga',   emoji: '🥬' },
    { id: 'cabbage',    name: 'Col',       emoji: '🥬' },
    { id: 'chard',      name: 'Acelga',    emoji: '🫛' },
    { id: 'carrot',     name: 'Zanahoria', emoji: '🥕' },
    { id: 'onion',      name: 'Cebolla',   emoji: '🧅' },
    { id: 'garlic',     name: 'Ajo',       emoji: '🧄' },
    { id: 'potato',     name: 'Patata',    emoji: '🥔' },
    { id: 'corn',       name: 'Maíz',      emoji: '🌽' },
    { id: 'pumpkin',    name: 'Calabaza',  emoji: '🎃' },
    { id: 'broccoli',   name: 'Brócoli',   emoji: '🥦' },
    { id: 'bean',       name: 'Judía',     emoji: '🫘' },
    { id: 'pea',        name: 'Guisante',  emoji: '🫛' },
    { id: 'spinach',    name: 'Espinaca',  emoji: '🌿' },
    { id: 'celery',     name: 'Apio',      emoji: '🌿' },
    { id: 'parsley',    name: 'Perejil',   emoji: '🌿' },
    { id: 'fennel',     name: 'Hinojo',    emoji: '🌾' },
    { id: 'radish',     name: 'Rabanillo', emoji: '🌱' },
  ],
  Frutas: [
    { id: 'strawberry', name: 'Fresa',     emoji: '🍓' },
  ],
};

export const ALL_PLANTS: Plant[] = Object.values(PLANTS).flat();

export function findPlant(id: string): Plant | undefined {
  return ALL_PLANTS.find(p => p.id === id);
}
