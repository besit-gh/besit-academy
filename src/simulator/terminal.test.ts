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

  it('creates virtual files and directories without touching the host system', () => {
    const state = initialTerminalState();
    const touched = runCommand(state, 'touch secret.txt');
    expect(touched.state.files['/home/rookie/secret.txt']).toBe('');
    const made = runCommand(touched.state, 'mkdir shared');
    expect(made.state.directories).toContain('/home/rookie/shared');
    expect(runCommand(made.state, 'ls').output).toContain('shared');
  });

  it('writes virtual file content using echo redirection', () => {
    const state = runCommand(initialTerminalState(), 'echo hello academy > secret.txt').state;
    expect(state.files['/home/rookie/secret.txt']).toBe('hello academy');
    expect(runCommand(state, 'cat secret.txt').output).toBe('hello academy');
  });

  it('applies numeric permissions and displays them with ls -la', () => {
    let state = runCommand(initialTerminalState(), 'touch secret.txt').state;
    state = runCommand(state, 'chmod 600 secret.txt').state;
    state = runCommand(state, 'mkdir shared').state;
    state = runCommand(state, 'chmod 755 shared').state;
    const listing = runCommand(state, 'ls -la').output;
    expect(listing).toContain('-rw-------');
    expect(listing).toContain('drwxr-xr-x');
    expect(listing).toContain('secret.txt');
    expect(listing).toContain('shared');
  });

  it('rejects malformed permission modes and missing paths', () => {
    const state = initialTerminalState();
    expect(runCommand(state, 'chmod 999 README.txt').output).toContain('режим');
    expect(runCommand(state, 'chmod 600 absent.txt').output).toContain('нет такого файла');
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
    expect(cleared.output).toBe('\\u0000CLEAR');
    expect(cleared.state.history).toHaveLength(0);
  });
  it('supports safe read-only diagnostic commands used in lessons', () => {
    const state = initialTerminalState();
    expect(runCommand(state, 'tail -n 2 /var/log/app.log').output).toContain('ERROR cannot read');
    expect(runCommand(state, 'grep -i warn /var/log/app.log').output).toContain('WARN config file missing');
    expect(runCommand(state, 'dig api.internal').output).toContain('10.20.0.15');
    expect(runCommand(state, 'nc -vz api.internal 443').output).toContain('Connection refused');
  });

  it('simulates DevOps tools without running host commands or changing files', () => {
    const state = initialTerminalState();
    expect(runCommand(state, 'git log --oneline -10').output).toContain('fix: update app config');
    expect(runCommand(state, 'git grep -n TOKEN').output).toContain('значение секрета не выводится');
    expect(runCommand(state, 'docker ps -a').output).toContain('api-training');
    expect(runCommand(state, 'terraform plan').output).toContain('1 to destroy');
    expect(runCommand(state, 'kubectl describe pod api').output).toContain('Ready=False');
    expect(runCommand(state, 'kubectl logs api').output).toContain('ERROR cannot load config');
    expect(runCommand(state, 'rm -rf /').output).toContain('не поддерживается');
    expect(runCommand(state, 'docker ps -a').state.files).toEqual(state.files);
  });

});
