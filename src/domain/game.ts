import type { GameEvent, Mission, PlayerProfile } from './types';

export const SAVE_KEY = 'besit-academy.save.v1';
export const xpForNextLevel = (level: number): number => 100 + Math.max(0, level - 1) * 75;

export function createProfile(callsign: string): PlayerProfile {
  const clean = callsign.trim().slice(0, 24) || 'Новичок';
  return {
    callsign: clean,
    level: 1,
    xp: 0,
    completedMissionIds: [],
    unlockedCompetencies: [],
    achievementIds: [],
    favoriteMissionIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function awardMission(
  profile: PlayerProfile,
  mission: Mission,
): { profile: PlayerProfile; events: GameEvent[]; alreadyCompleted: boolean } {
  if (profile.completedMissionIds.includes(mission.id)) {
    return { profile, events: [], alreadyCompleted: true };
  }
  let xp = profile.xp + mission.xp;
  let level = profile.level;
  const events: GameEvent[] = [];
  while (xp >= xpForNextLevel(level)) {
    xp -= xpForNextLevel(level);
    level += 1;
    events.push({
      id: `level-${level}-${mission.id}`,
      type: 'level_up',
      message: `Новый уровень: ${level}. Доступ к более сложным задачам становится ближе.`,
      createdAt: new Date().toISOString(),
    });
  }
  const completed = [...profile.completedMissionIds, mission.id];
  const unlocked = profile.unlockedCompetencies.includes(mission.competency)
    ? profile.unlockedCompetencies
    : [...profile.unlockedCompetencies, mission.competency];
  const next = { ...profile, xp, level, completedMissionIds: completed, unlockedCompetencies: unlocked, updatedAt: new Date().toISOString() };
  if (completed.length === 1) {
    next.achievementIds = [...new Set([...next.achievementIds, 'first-login'])];
    events.push({
      id: 'achievement-first-login',
      type: 'achievement_unlocked',
      message: 'Достижение открыто: «Первый вход». Первая миссия позади.',
      createdAt: new Date().toISOString(),
    });
  }
  events.unshift({
    id: `mission-${mission.id}`,
    type: 'mission_completed',
    message: `Миссия «${mission.title}» завершена: +${mission.xp} XP.`,
    createdAt: new Date().toISOString(),
  });
  return { profile: next, events, alreadyCompleted: false };
}
