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
  it('uses valid acyclic mission prerequisites', () => {
    const byId = new Map(missions.map((mission) => [mission.id, mission]));
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const visit = (id: string) => {
      expect(visiting.has(id), `dependency cycle at ${id}`).toBe(false);
      if (visited.has(id)) return;
      visiting.add(id);
      const mission = byId.get(id)!;
      for (const prerequisiteId of mission.prerequisiteMissionIds ?? []) {
        expect(byId.has(prerequisiteId), `${id} -> ${prerequisiteId}`).toBe(true);
        expect(prerequisiteId).not.toBe(id);
        visit(prerequisiteId);
      }
      visiting.delete(id);
      visited.add(id);
    };
    for (const mission of missions) visit(mission.id);
    expect(visited.size).toBe(missions.length);
  });
  it('covers the core Junior DevOps learning journey with distinct competencies', () => {
    expect(missions.length).toBeGreaterThanOrEqual(12);
    expect(new Set(missions.map((mission) => mission.competency)).size).toBeGreaterThanOrEqual(12);
  });
});
