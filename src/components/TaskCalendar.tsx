import { useMemo } from 'react';
import { PLANT_INFO } from '../data/plantInfo';
import { findPlant }  from '../data/plants';
import { useLang }    from '../context/LangContext';
import type { GardenData } from '../lib/storage';

type TaskType = 'sow' | 'transplant' | 'harvest';
interface Task { plantId: string; name: string; emoji: string; type: TaskType; }
const TASK_ORDER: Record<TaskType, number> = { sow: 0, transplant: 1, harvest: 2 };

interface Props { gardenData: GardenData; year: number; }

export default function TaskCalendar({ gardenData, year }: Props) {
  const { t, lang } = useLang();
  const today        = new Date();
  const currentMonth = today.getFullYear() === year ? today.getMonth() + 1 : null;

  const taskConfig = {
    sow:        { label: t.taskSow,        icon: '🌱', cls: 'task-sow' },
    transplant: { label: t.taskTransplant, icon: '🌿', cls: 'task-transplant' },
    harvest:    { label: t.taskHarvest,    icon: '🌾', cls: 'task-harvest' },
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
          <span key={type} className={`cal-leg-item ${cfg.cls}`}>{cfg.icon} {cfg.label}</span>
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
                          <span className="cal-task-icon">{cfg.icon}</span>
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
