import { describe, expect, it } from 'vitest';
import { createProfile } from './game';
import { exportSave, importSave } from './save';
import type { SaveFile } from './types';

const validSave = (): SaveFile => ({
  schemaVersion: 1,
  exportedAt: '2026-10-21T10:00:00.000Z',
  profile: createProfile('Tester'),
  events: [],
});

describe('save format', () => {
  it('round-trips a versioned save', () => {
    const profile = createProfile('Tester');
    const result = importSave(exportSave(profile, []));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.save.profile.callsign).toBe('Tester');
  });

  it('rejects malformed JSON, unknown schema versions, and oversized files', () => {
    expect(importSave('{broken')).toMatchObject({ ok: false });
    expect(importSave(JSON.stringify({ schemaVersion: 9 }))).toMatchObject({ ok: false });
    expect(importSave('x'.repeat(1_000_001))).toMatchObject({ ok: false, message: expect.stringContaining('1 МБ') });
  });

  it('rejects unknown mission IDs and duplicate completed missions', () => {
    const unknown = validSave();
    unknown.profile.completedMissionIds = ['not-a-real-mission'];
    expect(importSave(JSON.stringify(unknown))).toMatchObject({ ok: false });

    const duplicate = validSave();
    duplicate.profile.completedMissionIds = ['first-login', 'first-login'];
    expect(importSave(JSON.stringify(duplicate))).toMatchObject({ ok: false });
  });

  it('rejects invalid progression values and malformed events', () => {
    const impossibleLevel = validSave();
    impossibleLevel.profile.xp = 100;
    expect(importSave(JSON.stringify(impossibleLevel))).toMatchObject({ ok: false });

    const invalidEvent = validSave();
    invalidEvent.events = [{
      id: 'bad',
      type: 'run-shell-command',
      message: 'invalid type',
      createdAt: 'not-a-date',
    } as never];
    expect(importSave(JSON.stringify(invalidEvent))).toMatchObject({ ok: false });
  });

  it('accepts a legitimate completed mission and corresponding event', () => {
    const save = validSave();
    save.profile.completedMissionIds = ['first-login'];
    save.profile.unlockedCompetencies = ['terminal-navigation'];
    save.events = [{
      id: 'mission-first-login',
      type: 'mission_completed',
      message: 'Миссия завершена',
      createdAt: '2026-10-21T10:00:00.000Z',
    }];
    expect(importSave(JSON.stringify(save))).toMatchObject({ ok: true });
  });
});
