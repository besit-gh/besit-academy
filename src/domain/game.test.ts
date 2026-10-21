import { describe, expect, it } from 'vitest';
import { awardMission, createProfile } from './game';
import { missions } from '../content/missions';

describe('game progression', () => {
  it('awards mission XP and first achievement once', () => {
    const first = missions[0]!;
    const result = awardMission(createProfile('Rook'), first);
    expect(result.profile.completedMissionIds).toContain(first.id);
    expect(result.profile.achievementIds).toContain('first-login');
    expect(result.profile.xp).toBe(80);
    const repeated = awardMission(result.profile, first);
    expect(repeated.alreadyCompleted).toBe(true);
    expect(repeated.profile.xp).toBe(80);
    expect(repeated.events).toHaveLength(0);
  });
});
