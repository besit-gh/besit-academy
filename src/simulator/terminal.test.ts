import { describe, expect, it } from 'vitest';
import { initialTerminalState, runCommand } from './terminal';

describe('virtual terminal safety and behavior', () => {
  it('starts in the rookie home directory and exposes only virtual files', () => {
    const state = initialTerminalState();
    expect(state.cwd).toBe('/home/rookie');
    expect(runCommand(state, 'pwd').output).toBe('/home/rookie');
    expect(runCommand(state, 'ls').output).toContain('README.txt');
  });

  it('normalizes relative paths without escaping the virtual root', () => {
    const state = initialTerminalState();
    const result = runCommand(state, 'cat ../../var/log/app.log');
    expect(result.output).toContain('ERROR cannot read');
    expect(result.state.cwd).toBe('/home/rookie');
  });

  it('supports navigation and reading a virtual log', () => {
    const state = initialTerminalState();
    const moved = runCommand(state, 'cd /var/log');
    expect(moved.state.cwd).toBe('/var/log');
    expect(runCommand(moved.state, 'cat app.log').output).toContain('WARN config file missing');
  });

  it('rejects unsupported commands without executing them', () => {
    const state = initialTerminalState();
    const result = runCommand(state, 'rm -rf /');
    expect(result.output).toContain('не поддерживается');
    expect(result.state.files).toEqual(state.files);
  });

  it('records a bounded command history and clears the screen explicitly', () => {
    let state = initialTerminalState();
    for (let i = 0; i < 105; i += 1) state = runCommand(state, 'pwd').state;
    expect(state.history).toHaveLength(100);
    const cleared = runCommand(state, 'clear');
    expect(cleared.output).toBe('\u0000CLEAR');
    expect(cleared.state.history).toHaveLength(0);
  });
});
