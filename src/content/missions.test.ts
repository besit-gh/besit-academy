import { describe, expect, it } from 'vitest';
import { missions } from './missions';

describe('campaign content', () => {
  it('has a unique ID and at least one validated step for every mission', () => {
    expect(new Set(missions.map((mission) => mission.id)).size).toBe(missions.length);
    for (const mission of missions) {
      expect(mission.steps.length, mission.id).toBeGreaterThan(0);
      for (const step of mission.steps) {
        expect(step.explanation.trim(), `${mission.id}/${step.id}`).not.toBe('');
        expect(step.options.some((option) => option.id === step.correctOptionId), `${mission.id}/${step.id}`).toBe(true);
      }
    }
  });
  it('covers the core Junior DevOps learning journey with distinct competencies', () => {
    expect(missions.length).toBeGreaterThanOrEqual(12);
    expect(new Set(missions.map((mission) => mission.competency)).size).toBeGreaterThanOrEqual(12);
  });
});
