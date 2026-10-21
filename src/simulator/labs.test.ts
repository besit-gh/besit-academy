import { describe, expect, it } from 'vitest';
import { initialTerminalState, runCommand } from './terminal';
import { checkPermissionsLab } from './labs';

describe('Linux permissions lab', () => {
  it('does not pass an untouched environment', () => {
    const result = checkPermissionsLab(initialTerminalState());
    expect(result.passed).toBe(false);
    expect(result.checks.filter(check => !check.passed)).toHaveLength(4);
  });

  it('passes only when the required virtual filesystem state is correct', () => {
    let state = initialTerminalState();
    for (const command of [
      'touch secret.txt',
      'chmod 600 secret.txt',
      'mkdir shared',
      'chmod 755 shared'
    ]) state = runCommand(state, command).state;

    const result = checkPermissionsLab(state);
    expect(result.passed).toBe(true);
    expect(result.checks.every(check => check.passed)).toBe(true);
  });

  it('rejects a superficially similar but unsafe permission mode', () => {
    let state = initialTerminalState();
    for (const command of [
      'touch secret.txt',
      'chmod 777 secret.txt',
      'mkdir shared',
      'chmod 755 shared'
    ]) state = runCommand(state, command).state;

    const result = checkPermissionsLab(state);
    expect(result.passed).toBe(false);
    expect(result.checks.find(check => check.id === 'secret-mode')?.passed).toBe(false);
  });
});
