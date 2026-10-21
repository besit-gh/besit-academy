import type { GameEvent, PlayerProfile, SaveFile } from './types';
import { SAVE_KEY, xpForNextLevel } from './game';
import { missions } from '../content/missions';

const missionIds = new Set(missions.map((mission) => mission.id));
const competencyIds = new Set([
  'linux-basics',
  'terminal-navigation',
  'permissions',
  'troubleshooting',
  'network-diagnostics',
  'git-workflow',
  'scripting',
  'containers',
  'cicd',
  'infrastructure-as-code',
  'kubernetes-basics',
  'security-basics',
  'observability',
  'career-readiness',
]);
const eventTypes = new Set<GameEvent['type']>([
  'mission_completed',
  'level_up',
  'achievement_unlocked',
  'profile_created',
]);

function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

function hasUniqueValues(values: string[]): boolean {
  return new Set(values).size === values.length;
}

function isProfile(value: unknown): value is PlayerProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<PlayerProfile>;
  if (
    typeof profile.callsign !== 'string' ||
    profile.callsign.trim().length === 0 ||
    profile.callsign.length > 24 ||
    !Number.isInteger(profile.level) ||
    (profile.level ?? 0) < 1 ||
    !Number.isInteger(profile.xp) ||
    (profile.xp ?? -1) < 0 ||
    (profile.xp ?? 0) >= xpForNextLevel(profile.level ?? 1) ||
    !strings(profile.completedMissionIds) ||
    !strings(profile.unlockedCompetencies) ||
    !strings(profile.achievementIds) ||
    !strings(profile.favoriteMissionIds) ||
    !isTimestamp(profile.updatedAt)
  ) return false;

  if (
    !hasUniqueValues(profile.completedMissionIds) ||
    !profile.completedMissionIds.every((id) => missionIds.has(id)) ||
    !hasUniqueValues(profile.unlockedCompetencies) ||
    !profile.unlockedCompetencies.every((id) => competencyIds.has(id)) ||
    !hasUniqueValues(profile.achievementIds) ||
    !hasUniqueValues(profile.favoriteMissionIds) ||
    !profile.favoriteMissionIds.every((id) => missionIds.has(id))
  ) return false;

  return true;
}

function isGameEvent(value: unknown): value is GameEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<GameEvent>;
  return typeof event.id === 'string' &&
    event.id.trim().length > 0 &&
    typeof event.message === 'string' &&
    event.message.length <= 2_000 &&
    typeof event.type === 'string' &&
    eventTypes.has(event.type as GameEvent['type']) &&
    isTimestamp(event.createdAt);
}

export function isSaveFile(value: unknown): value is SaveFile {
  if (!value || typeof value !== 'object') return false;
  const save = value as Partial<SaveFile>;
  return save.schemaVersion === 1 &&
    isTimestamp(save.exportedAt) &&
    isProfile(save.profile) &&
    Array.isArray(save.events) &&
    save.events.length <= 1_000 &&
    save.events.every(isGameEvent);
}

export function exportSave(profile: PlayerProfile, events: GameEvent[]): string {
  return JSON.stringify({
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    profile,
    events,
  } satisfies SaveFile, null, 2);
}

export function importSave(raw: string): { ok: true; save: SaveFile } | { ok: false; message: string } {
  try {
    if (raw.length > 1_000_000) {
      return { ok: false, message: 'Файл слишком большой (максимум 1 МБ).' };
    }
    const parsed: unknown = JSON.parse(raw);
    return isSaveFile(parsed)
      ? { ok: true, save: parsed }
      : { ok: false, message: 'Формат сохранения не распознан. Текущий прогресс не изменён.' };
  } catch {
    return { ok: false, message: 'Не удалось прочитать JSON. Текущий прогресс не изменён.' };
  }
}

export function persistSave(profile: PlayerProfile, events: GameEvent[]) {
  try {
    if (typeof localStorage === 'undefined') {
      return { ok: false, message: 'Хранилище браузера недоступно.' };
    }
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
    return isSaveFile(parsed) ? { profile: parsed.profile, events: parsed.events } : null;
  } catch {
    return null;
  }
}
