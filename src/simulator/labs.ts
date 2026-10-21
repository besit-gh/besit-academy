import type { TerminalState } from './terminal';

export interface LabCheck {
  passed: boolean;
  checks: { id: string; label: string; passed: boolean; detail: string }[];
}

/** Validate the Linux permissions mission against simulator state, not command history. */
export function checkPermissionsLab(state: TerminalState): LabCheck {
  const home = '/home/rookie';
  const secret = home + '/secret.txt';
  const shared = home + '/shared';
  const checks = [
    {
      id: 'secret-exists',
      label: 'Файл secret.txt создан',
      passed: Object.prototype.hasOwnProperty.call(state.files, secret),
      detail: Object.prototype.hasOwnProperty.call(state.files, secret) ? 'Файл существует в виртуальной файловой системе.' : 'Создай файл командой touch secret.txt.'
    },
    {
      id: 'secret-mode',
      label: 'Права secret.txt — 600',
      passed: state.modes[secret] === 0o600,
      detail: state.modes[secret] === 0o600 ? 'Чтение и запись доступны только владельцу.' : 'Нужно выполнить chmod 600 secret.txt.'
    },
    {
      id: 'shared-exists',
      label: 'Каталог shared создан',
      passed: state.directories.includes(shared),
      detail: state.directories.includes(shared) ? 'Каталог существует.' : 'Создай каталог командой mkdir shared.'
    },
    {
      id: 'shared-mode',
      label: 'Права shared — 755',
      passed: state.modes[shared] === 0o755,
      detail: state.modes[shared] === 0o755 ? 'Владелец может читать, изменять и входить; остальные — читать и входить.' : 'Нужно выполнить chmod 755 shared.'
    }
  ];
  return { passed: checks.every(check => check.passed), checks };
}
