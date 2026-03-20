import { createContext, useContext, useState, useEffect } from 'react';

export type Lang = 'es' | 'en';

// ─────────────────────────────────────────────────────────────────────────────

export interface Translations {
  // App
  appTitle:           string;
  appSubtitle:        string;
  loading:            string;
  // Header
  summer:             string;
  winter:             string;
  // Tabs
  tabGarden:          string;
  tabCalendar:        string;
  // Controls
  year:               string;
  season:             string;
  gridSize:           string;
  colLabel:           string;
  rowLabel:           string;
  // Plant picker modal
  choosePlant:        string;
  plot:               string;
  removePlant:        string;
  currentlyPlanted:   string;
  plantNotes:         string;
  notesPlaceholder:   string;
  categories:         Record<string, string>;
  // Rotation / compat warnings
  rotationWarning:    string;
  rotationDetail:     (prevName: string, family: string) => string;
  compatWarning:      string;
  compatDetail:       (neighborName: string, currentName: string) => string;
  // Grid / unified bar
  viewLabel:          string;
  familiesLabel:      string;
  clickToPlant:       string;
  hasNote:            string;
  showFamilies:       string;
  hideFamilies:       string;
  familiesHint:       string;
  botanicalFamilies:  string;
  familyNames:        Record<string, string>;
  // Legend
  plantedThisSeason:  string;
  nothingPlanted:     string;
  // Garden selector
  myGardens:          string;
  newGarden:          string;
  createGarden:       string;
  gardenNamePlaceholder: string;
  deleteConfirm:      (name: string) => string;
  // User
  signIn:             string;
  signOut:            string;
  // Calendar
  taskSow:            string;
  taskTransplant:     string;
  taskHarvest:        string;
  noPlants:           (year: number) => string;
  noPlantsCta:        string;
  now:                string;
  months:             string[];
  monthsAbbr:         string[];
  // Copy season
  copySeason:         string;
  copySeasonLabel:    string;
  copySeasonConfirm:  (prevLabel: string) => string;
  // Config panel
  settings:           string;
  language:           string;
  // Planting date
  plantingDate:       string;
  clearDate:          string;
  // Print
  print:              string;
  // Reminders
  monthlyReminder:    string;
  reminderHint:       string;
  reminderOn:         string;
  reminderOff:        string;
  // Auth modal
  signInTitle:        string;
  registerTitle:      string;
  signInSub:          string;
  registerSub:        string;
  emailLabel:         string;
  passwordLabel:      string;
  passwordHint:       string;
  noAccount:          string;
  registerHere:       string;
  hasAccount:         string;
  signInHere:         string;
  confirmEmail:       string;
  // Plant info modal
  back:               string;
  difficulty:         string;
  spacing:            string;
  depth:              string;
  duration:           string;
  sowMonths:          string;
  transplantMonths:   string;
  harvestMonths:      string;
  companions:         string;
  avoid:              string;
  tip:                string;
}

// ─────────────────────────────────────────────────────────────────────────────

const ES: Translations = {
  appTitle:           'El Huerto',
  appSubtitle:        'Planificador estacional de cultivos',
  loading:            'Cargando el huerto…',
  summer:             'Verano',
  winter:             'Invierno',
  tabGarden:          'Huerto',
  tabCalendar:        'Calendario',
  year:               'Año',
  season:             'Temporada',
  gridSize:           'Cuadrícula',
  colLabel:           'Col.',
  rowLabel:           'Fil.',
  choosePlant:        'Elegir una planta',
  plot:               'Parcela',
  removePlant:        'Quitar planta',
  currentlyPlanted:   'Plantado actualmente',
  plantNotes:         'Notas de esta parcela',
  notesPlaceholder:   'Añade observaciones sobre esta parcela…',
  categories:         { Verduras: 'Verduras', Frutas: 'Frutas', Hierbas: 'Hierbas' },
  rotationWarning:    'Rotación',
  rotationDetail:     (prev, family) =>
    `La temporada anterior había ${prev} aquí (${family}). Considera cambiar de familia.`,
  compatWarning:      'Incompatibilidad',
  compatDetail:       (neighbor, current) =>
    `${neighbor} no es buena planta vecina para ${current}.`,
  viewLabel:          'Vista',
  familiesLabel:      'Familias',
  clickToPlant:       'Haz clic para plantar algo aquí',
  hasNote:            'Esta parcela tiene notas',
  showFamilies:       'Ver familias',
  hideFamilies:       'Ocultar familias',
  familiesHint:       'Cada color representa una familia botánica — útil para planificar la rotación',
  botanicalFamilies:  'Familias botánicas',
  familyNames: {
    solanaceae:   'Solanácea',     cucurbit:     'Cucurbitácea',
    brassica:     'Crucífera',     apiaceae:     'Umbelífera',
    allium:       'Liliácea',      legume:       'Leguminosa',
    asteraceae:   'Compuesta',     grass:        'Gramínea',
    chenopod:     'Quenopodiácea', rosaceae:     'Rosácea',
    boraginaceae: 'Boraginacea',   lamiaceae:    'Labiada',
  },
  plantedThisSeason:  'Plantado esta temporada:',
  nothingPlanted:     'Nada plantado aún',
  myGardens:          'Mis huertos',
  newGarden:          '+ Nuevo huerto',
  createGarden:       'Crear',
  gardenNamePlaceholder: 'Nombre del huerto…',
  deleteConfirm:      name => `¿Eliminar el huerto "${name}"? Esta acción no se puede deshacer.`,
  signIn:             'Iniciar sesión',
  signOut:            'Cerrar sesión',
  taskSow:            'Sembrar',
  taskTransplant:     'Trasplantar',
  taskHarvest:        'Cosechar',
  noPlants:           year => `No hay plantas registradas para ${year}.`,
  noPlantsCta:        'Ve a la vista Huerto y añade plantas para ver el calendario.',
  now:                'Ahora',
  months:             ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthsAbbr:         ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  copySeason:         'Copiar temporada',
  copySeasonLabel:    'Anterior',
  copySeasonConfirm:  prev => `¿Copiar el plan de ${prev} a esta temporada? Se sobreescribirá lo que haya ahora.`,
  settings:           'Configuración',
  language:           'Idioma',
  plantingDate:       'Fecha de plantación',
  clearDate:          'Borrar fecha',
  print:              'Imprimir',
  monthlyReminder:    'Recordatorio mensual',
  reminderHint:       'Recibe un email el 1 de cada mes con las tareas de tu huerto',
  reminderOn:         'Activo',
  reminderOff:        'Inactivo',
  signInTitle:        'Acceder a tu huerto',
  registerTitle:      'Crear una cuenta',
  signInSub:          'Tus datos se guardan en la nube y puedes acceder desde cualquier dispositivo.',
  registerSub:        'Crea una cuenta para guardar tu huerto en la nube de forma segura.',
  emailLabel:         'Correo electrónico',
  passwordLabel:      'Contraseña',
  passwordHint:       'Mínimo 6 caracteres',
  noAccount:          '¿No tienes cuenta?',
  registerHere:       'Regístrate aquí',
  hasAccount:         '¿Ya tienes cuenta?',
  signInHere:         'Inicia sesión',
  confirmEmail:       '✅ Revisa tu correo para confirmar la cuenta.',
  back:               '← Volver',
  difficulty:         'Dificultad',
  spacing:            'Espaciado',
  depth:              'Profundidad',
  duration:           'Duración',
  sowMonths:          'Meses de siembra',
  transplantMonths:   'Meses de trasplante',
  harvestMonths:      'Meses de cosecha',
  companions:         'Plantas compañeras',
  avoid:              'Evitar junto a',
  tip:                'Consejo',
};

const EN: Translations = {
  appTitle:           'The Garden',
  appSubtitle:        'Seasonal crop planner',
  loading:            'Loading garden…',
  summer:             'Summer',
  winter:             'Winter',
  tabGarden:          'Garden',
  tabCalendar:        'Calendar',
  year:               'Year',
  season:             'Season',
  gridSize:           'Grid',
  colLabel:           'Col.',
  rowLabel:           'Row.',
  choosePlant:        'Choose a plant',
  plot:               'Plot',
  removePlant:        'Remove plant',
  currentlyPlanted:   'Currently planted',
  plantNotes:         'Notes for this plot',
  notesPlaceholder:   'Add notes about this plot…',
  categories:         { Verduras: 'Vegetables', Frutas: 'Fruits', Hierbas: 'Herbs' },
  rotationWarning:    'Rotation',
  rotationDetail:     (prev, family) =>
    `${prev} (${family}) was here last season. Consider rotating families.`,
  compatWarning:      'Incompatibility',
  compatDetail:       (neighbor, current) =>
    `${neighbor} is not a good neighbour for ${current}.`,
  viewLabel:          'View',
  familiesLabel:      'Families',
  clickToPlant:       'Click to plant something here',
  hasNote:            'This plot has notes',
  showFamilies:       'Show families',
  hideFamilies:       'Hide families',
  familiesHint:       'Each colour represents a botanical family — useful for planning crop rotation',
  botanicalFamilies:  'Botanical families',
  familyNames: {
    solanaceae:   'Solanaceae',  cucurbit:     'Cucurbit',
    brassica:     'Brassica',    apiaceae:     'Apiaceae',
    allium:       'Allium',      legume:       'Legume',
    asteraceae:   'Asteraceae',  grass:        'Grass',
    chenopod:     'Chenopod',    rosaceae:     'Rosaceae',
    boraginaceae: 'Boraginaceae', lamiaceae:   'Lamiaceae',
  },
  plantedThisSeason:  'Planted this season:',
  nothingPlanted:     'Nothing planted yet',
  myGardens:          'My gardens',
  newGarden:          '+ New garden',
  createGarden:       'Create',
  gardenNamePlaceholder: 'Garden name…',
  deleteConfirm:      name => `Delete "${name}"? This cannot be undone.`,
  signIn:             'Sign in',
  signOut:            'Sign out',
  taskSow:            'Sow',
  taskTransplant:     'Transplant',
  taskHarvest:        'Harvest',
  noPlants:           year => `No plants recorded for ${year}.`,
  noPlantsCta:        'Go to the Garden view and add plants to see the calendar.',
  now:                'Now',
  months:             ['January','February','March','April','May','June','July','August','September','October','November','December'],
  monthsAbbr:         ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  copySeason:         'Copy season',
  copySeasonLabel:    'Previous',
  copySeasonConfirm:  prev => `Copy the plan from ${prev} to this season? Current plantings will be overwritten.`,
  settings:           'Settings',
  language:           'Language',
  plantingDate:       'Planting date',
  clearDate:          'Clear date',
  print:              'Print',
  monthlyReminder:    'Monthly reminder',
  reminderHint:       'Receive an email on the 1st of each month with your garden tasks',
  reminderOn:         'Active',
  reminderOff:        'Inactive',
  signInTitle:        'Access your garden',
  registerTitle:      'Create an account',
  signInSub:          'Your data is saved in the cloud and accessible from any device.',
  registerSub:        'Create an account to securely save your garden in the cloud.',
  emailLabel:         'Email',
  passwordLabel:      'Password',
  passwordHint:       'At least 6 characters',
  noAccount:          "Don't have an account?",
  registerHere:       'Register here',
  hasAccount:         'Already have an account?',
  signInHere:         'Sign in',
  confirmEmail:       '✅ Check your email to confirm your account.',
  back:               '← Back',
  difficulty:         'Difficulty',
  spacing:            'Spacing',
  depth:              'Depth',
  duration:           'Duration',
  sowMonths:          'Sowing months',
  transplantMonths:   'Transplant months',
  harvestMonths:      'Harvest months',
  companions:         'Companion plants',
  avoid:              'Avoid near',
  tip:                'Tip',
};

export const TRANSLATIONS: Record<Lang, Translations> = { es: ES, en: EN };

// ─── Context ──────────────────────────────────────────────────────────────────

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: Translations; }

const LangContext = createContext<LangCtx>({ lang: 'es', setLang: () => {}, t: ES });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try { return (localStorage.getItem('el-huerto-lang') as Lang) ?? 'es'; } catch { return 'es'; }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('el-huerto-lang', l); } catch {}
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() { return useContext(LangContext); }
