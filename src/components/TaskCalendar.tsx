import { useMemo } from 'react';
import { PLANT_INFO } from '../data/plantInfo';
import { findPlant }  from '../data/plants';
import type { GardenData } from '../lib/storage';

// ─────────────────────────────────────────────────────────────────────────────

type TaskType = 'sow' | 'transplant' | 'harvest';

interface Task {
  plantId: string;
  name:    string;
  emoji:   string;
  type:    TaskType;
}

const TASK_CONFIG: Record<TaskType, { label: string; icon: string; cls: string }> = {
  sow:        { label: 'Sembrar',      icon: '🌱', cls: 'task-sow' },
  transplant: { label: 'Trasplantar',  icon: '🌿', cls: 'task-transplant' },
  harvest:    { label: 'Cosechar',     icon: '🌾', cls: 'task-harvest' },
};

const TASK_ORDER: Record<TaskType, number> = { sow: 0, transplant: 1, harvest: 2 };

const MONTH_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  gardenData: GardenData;
  year:       number;
}

export default function TaskCalendar({ gardenData, year }: Props) {
  const today        = new Date();
  const currentMonth = today.getFullYear() === year ? today.getMonth() + 1 : null;

  // Collect all unique plants for the current year (both seasons)
  const plantIds = useMemo(() => {
    const ids = new Set<string>();
    for (const [sk, cells] of Object.entries(gardenData)) {
      if (sk.startsWith(`${year}-`)) Object.values(cells).forEach(id => ids.add(id));
    }
    return ids;
  }, [gardenData, year]);

  // Build month → tasks map
  const tasksByMonth = useMemo(() => {
    const result: Record<number, Task[]> = {};
    for (let m = 1; m <= 12; m++) result[m] = [];

    plantIds.forEach(plantId => {
      const info  = PLANT_INFO[plantId];
      const plant = findPlant(plantId);
      if (!info || !plant) return;

      const push = (months: number[], type: TaskType) =>
        months.forEach(m => result[m].push({ plantId, name: plant.name, emoji: plant.emoji, type }));

      push(info.sowMonths,              'sow');
      push(info.transplantMonths ?? [], 'transplant');
      push(info.harvestMonths,          'harvest');
    });

    // Sort each month: sow → transplant → harvest, then alphabetically
    for (const m of Object.keys(result)) {
      result[+m].sort((a, b) =>
        TASK_ORDER[a.type] - TASK_ORDER[b.type] || a.name.localeCompare(b.name),
      );
    }
    return result;
  }, [plantIds]);

  const hasAnyTask = useMemo(
    () => Object.values(tasksByMonth).some(t => t.length > 0),
    [tasksByMonth],
  );

  return (
    <section className="cal-wrap">
      {/* ── Legend ── */}
      <div className="cal-legend">
        {(Object.entries(TASK_CONFIG) as [TaskType, typeof TASK_CONFIG[TaskType]][]).map(([type, cfg]) => (
          <span key={type} className={`cal-leg-item ${cfg.cls}`}>
            {cfg.icon} {cfg.label}
          </span>
        ))}
      </div>

      {/* ── Month grid ── */}
      {hasAnyTask ? (
        <div className="cal-grid">
          {MONTH_FULL.map((name, idx) => {
            const m     = idx + 1;
            const tasks = tasksByMonth[m] ?? [];
            const isNow = m === currentMonth;

            return (
              <div key={m} className={`cal-month${isNow ? ' cal-now' : ''}${tasks.length === 0 ? ' cal-empty-month' : ''}`}>
                <div className="cal-month-head">
                  <span className="cal-month-name">{name}</span>
                  {isNow && <span className="cal-badge-now">Ahora</span>}
                </div>

                <div className="cal-tasks">
                  {tasks.length === 0 ? (
                    <span className="cal-dash">—</span>
                  ) : (
                    tasks.map((t, i) => {
                      const cfg = TASK_CONFIG[t.type];
                      return (
                        <div key={`${t.plantId}-${t.type}-${i}`} className={`cal-task ${cfg.cls}`}>
                          <span className="cal-task-icon">{cfg.icon}</span>
                          <span className="cal-task-plant">{t.emoji} {t.name}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="cal-no-plants">
          <p>No hay plantas registradas para {year}.</p>
          <p>Ve a la vista <strong>Huerto</strong> y añade plantas para ver el calendario.</p>
        </div>
      )}
    </section>
  );
}
