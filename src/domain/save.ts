import type { GameEvent, PlayerProfile, SaveFile } from './types';
import { SAVE_KEY } from './game';

export interface SaveResult { ok: boolean; message: string }

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
export function isSaveFile(value: unknown): value is SaveFile {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<SaveFile>;
  if (v.schemaVersion !== 1 || !v.profile || typeof v.profile !== 'object' || !Array.isArray(v.events)) return false;
  const p = v.profile as Partial<PlayerProfile>;
  return typeof p.callsign === 'string' && p.callsign.length <= 24 &&
    Number.isInteger(p.level) && (p.level ?? 0) >= 1 &&
    Number.isInteger(p.xp) && (p.xp ?? -1) >= 0 &&
    isStringArray(p.completedMissionIds) && isStringArray(p.unlockedCompetencies) &&
    isStringArray(p.achievementIds) && isStringArray(p.favoriteMissionIds) &&
    typeof p.updatedAt === 'string' &&
    v.events.every((e) => !!e && typeof e === 'object' && typeof (e as GameEvent).id === 'string' && typeof (e as GameEvent).message === 'string');
}
export function exportSave(profile: PlayerProfile, events: GameEvent[]): string {
  return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), profile, events } satisfies SaveFile, null, 2);
}
export function importSave(raw: string): { ok: true; save: SaveFile } | { ok: false; message: string } {
  try {
    if (raw.length > 1_000_000) return { ok: false, message: 'Файл слишком большой (максимум 1 МБ).' };
    const parsed: unknown = JSON.parse(raw);
    if (!isSaveFile(parsed)) return { ok: false, message: 'Формат сохранения не распознан. Текущий прогресс не изменён.' };
    return { ok: true, save: parsed };
  } catch {
    return { ok: false, message: 'Не удалось прочитать JSON. Текущий прогресс не изменён.' };
  }
}
export function persistSave(profile: PlayerProfile, events: GameEvent[]): SaveResult {
  try {
    if (typeof localStorage === 'undefined') return { ok: false, message: 'Хранилище браузера недоступно.' };
    localStorage.setItem(SAVE_KEY, exportSave(profile, events));
    return { ok: true, message: 'Прогресс сохранён локально.' };
  } catch {
    return { ok: false, message: 'Браузер не смог сохранить данные. Экспортируй сохранение в файл.' };
  }
}
export function readSave(): { profile: PlayerProfile; events: GameEvent[] } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isSaveFile(parsed)) return null;
    return { profile: parsed.profile, events: parsed.events };
  } catch {
    return null;
  }
}
