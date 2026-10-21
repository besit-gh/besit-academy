import { missions } from '../src/content/missions';

const errors: string[] = [];
const ids = new Set<string>();
for (const mission of missions) {
  if (ids.has(mission.id)) errors.push(`Повторяющийся ID миссии: ${mission.id}`);
  ids.add(mission.id);
  if (!mission.title.trim() || !mission.summary.trim()) errors.push(`Миссия ${mission.id}: отсутствует название или описание`);
  if (mission.xp <= 0) errors.push(`Миссия ${mission.id}: XP должен быть положительным`);
  if (!mission.steps.length) errors.push(`Миссия ${mission.id}: нет шагов проверки`);
  const stepIds = new Set<string>();
  for (const step of mission.steps) {
    if (stepIds.has(step.id)) errors.push(`Миссия ${mission.id}: повтор шага ${step.id}`);
    stepIds.add(step.id);
    if (!step.options.some((option) => option.id === step.correctOptionId)) errors.push(`Миссия ${mission.id}, шаг ${step.id}: правильный ответ отсутствует среди вариантов`);
    if (new Set(step.options.map((o) => o.id)).size !== step.options.length) errors.push(`Миссия ${mission.id}, шаг ${step.id}: повтор ID варианта`);
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Проверено миссий: ${missions.length}; ошибок контента: 0.`);
}
