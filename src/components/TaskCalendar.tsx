import { useMemo } from 'react';
import { PLANT_INFO } from '../data/plantInfo';
import { findPlant }  from '../data/plants';
import { useLang }    from '../context/LangContext';
import type { GardenData } from '../lib/storage';

type TaskType = 'sow' | 'transplant' | 'harvest';
interface Task { plantId: string; name: string; emoji: string; type: TaskType; }
const TASK_ORDER: Record<TaskType, number> = { sow: 0, transplant: 1, harvest: 2 };

// ─── Task icons as SVG ────────────────────────────────────────────────────────

/** Sembrar: arrow pointing down into a ground line */
function IconSow() {
  return (
    <svg width="13" height="14" viewBox="0 0 13 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="6.5" y1="1" x2="6.5" y2="9.5" />
      <polyline points="3.5,6.5 6.5,10 9.5,6.5" />
      <line x1="2" y1="13" x2="11" y2="13" />
    </svg>
  );
}

/** Transplantar: dot with a curved arrow looping around it */
function IconTransplant() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="7" r="1.8" fill="currentColor" stroke="none" />
      <path d="M 7 1.5 A 5.5 5.5 0 1 1 1.5 7" />
      <polyline points="1.5,3.5 1.5,7 5,7" />
    </svg>
  );
}

/** Cosechar: arrow pointing up out of a ground line */
function IconHarvest() {
  return (
    <svg width="13" height="14" viewBox="0 0 13 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="2" y1="1" x2="11" y2="1" />
      <line x1="6.5" y1="13" x2="6.5" y2="4.5" />
      <polyline points="3.5,7.5 6.5,4 9.5,7.5" />
    </svg>
  );
}

interface Props { gardenData: GardenData; year: number; }

export default function TaskCalendar({ gardenData, year }: Props) {
  const { t, lang } = useLang();
  const today        = new Date();
  const currentMonth = today.getFullYear() === year ? today.getMonth() + 1 : null;

  const taskConfig = {
    sow:        { label: t.taskSow,        Icon: IconSow,        cls: 'task-sow' },
    transplant: { label: t.taskTransplant, Icon: IconTransplant, cls: 'task-transplant' },
    harvest:    { label: t.taskHarvest,    Icon: IconHarvest,    cls: 'task-harvest' },
  };

  const plantIds = useMemo(() => {
    const ids = new Set<string>();
    for (const [sk, cells] of Object.entries(gardenData)) {
      if (sk.startsWith(`${year}-`)) Object.values(cells).forEach(id => ids.add(id));
    }
    return ids;
  }, [gardenData, year]);

  const tasksByMonth = useMemo(() => {
    const result: Record<number, Task[]> = {};
    for (let m = 1; m <= 12; m++) result[m] = [];
    plantIds.forEach(plantId => {
      const info  = PLANT_INFO[plantId];
      const plant = findPlant(plantId);
      if (!info || !plant) return;
      const name = lang === 'en' ? plant.nameEn : plant.name;
      const push = (months: number[], type: TaskType) =>
        months.forEach(m => result[m].push({ plantId, name, emoji: plant.emoji, type }));
      push(info.sowMonths, 'sow');
      push(info.transplantMonths ?? [], 'transplant');
      push(info.harvestMonths, 'harvest');
    });
    for (const m of Object.keys(result)) {
      result[+m].sort((a, b) => TASK_ORDER[a.type] - TASK_ORDER[b.type] || a.name.localeCompare(b.name));
    }
    return result;
  }, [plantIds, lang]);

  const hasAnyTask = useMemo(() => Object.values(tasksByMonth).some(tasks => tasks.length > 0), [tasksByMonth]);

  return (
    <section className="cal-wrap">
      <div className="cal-legend">
        {(Object.entries(taskConfig) as [TaskType, typeof taskConfig[TaskType]][]).map(([type, cfg]) => (
          <span key={type} className={`cal-leg-item ${cfg.cls}`}><cfg.Icon /> {cfg.label}</span>
        ))}
      </div>
      {hasAnyTask ? (
        <div className="cal-grid">
          {t.months.map((name, idx) => {
            const m     = idx + 1;
            const tasks = tasksByMonth[m] ?? [];
            const isNow = m === currentMonth;
            return (
              <div key={m} className={`cal-month${isNow ? ' cal-now' : ''}${tasks.length === 0 ? ' cal-empty-month' : ''}`}>
                <div className="cal-month-head">
                  <span className="cal-month-name">{name}</span>
                  {isNow && <span className="cal-badge-now">{t.now}</span>}
                </div>
                <div className="cal-tasks">
                  {tasks.length === 0 ? (
                    <span className="cal-dash">—</span>
                  ) : (
                    tasks.map((task, i) => {
                      const cfg = taskConfig[task.type];
                      return (
                        <div key={`${task.plantId}-${task.type}-${i}`} className={`cal-task ${cfg.cls}`}>
                          <span className="cal-task-icon"><cfg.Icon /></span>
                          <span className="cal-task-plant">{task.emoji} {task.name}</span>
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
          <p>{t.noPlants(year)}</p>
          <p>{t.noPlantsCta}</p>
        </div>
      )}
    </section>
  );
}
