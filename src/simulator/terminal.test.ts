import { describe, expect, it } from 'vitest';
import { initialTerminalState, runCommand } from './terminal';

describe('bounded terminal simulator', () => {
  it('supports basic navigation and reading', () => {
    const state = initialTerminalState();
    expect(runCommand(state, 'pwd').output).toBe('/home/rookie');
    expect(runCommand(state, 'cat /var/log/app.log').output).toContain('ERROR');
    expect(runCommand(state, 'cd /var/log').state.cwd).toBe('/var/log');
  });
  it('rejects unknown commands without executing them', () => {
    const result = runCommand(initialTerminalState(), 'rm -rf /');
    expect(result.output).toContain('не поддерживается');
    expect(result.state.files['/home/rookie/README.txt']).toBeDefined();
  });
});
