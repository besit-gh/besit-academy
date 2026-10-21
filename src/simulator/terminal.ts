export interface TerminalState {
  cwd: string;
  files: Record<string, string>;
  history: string[];
}
export interface TerminalResult { state: TerminalState; output: string }

export const initialTerminalState = (): TerminalState => ({
  cwd: '/home/rookie',
  files: {
    '/home/rookie/README.txt': 'Добро пожаловать в учебное окружение BESIT. Это симулятор, не полноценный Linux.',
    '/home/rookie/notes.txt': 'Цель смены: изучить окружение и проверить состояние сервиса.',
    '/var/log/app.log': 'INFO service starting\nWARN config file missing\nERROR cannot read /etc/besit/app.conf',
    '/etc/besit/app.conf': 'PORT=8080\nMODE=training',
  },
  history: [],
});
const normalize = (path: string, cwd: string): string => {
  const parts = (path.startsWith('/') ? path : `${cwd}/${path}`).split('/');
  const out: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return '/' + out.join('/');
};
export function runCommand(state: TerminalState, input: string): TerminalResult {
  const commandLine = input.trim();
  if (!commandLine) return { state, output: '' };
  const history = [...state.history, commandLine].slice(-100);
  const [command, ...args] = commandLine.split(/\s+/);
  const next = { ...state, history };
  const children = (dir: string) => [...new Set(Object.keys(state.files)
    .filter((p) => p.startsWith(dir === '/' ? '/' : dir + '/'))
    .map((p) => p.slice((dir === '/' ? 0 : dir.length + 1)).split('/')[0]))].sort();
  switch (command) {
    case 'help':
      return { state: next, output: 'Доступно: help, pwd, ls, cd, cat, whoami, echo, clear. Ограниченный учебный симулятор; произвольные команды не исполняются.' };
    case 'pwd': return { state: next, output: state.cwd };
    case 'whoami': return { state: next, output: 'rookie' };
    case 'ls': {
      const path = normalize(args.find((a) => !a.startsWith('-')) ?? '.', state.cwd);
      const names = children(path);
      return { state: next, output: names.length ? names.join('  ') : (state.files[path] !== undefined ? path.split('/').pop() ?? '/' : 'Нет такого каталога или он пуст.') };
    }
    case 'cd': {
      const path = normalize(args[0] ?? '/home/rookie', state.cwd);
      const isDir = path === '/' || Object.keys(state.files).some((p) => p.startsWith(path + '/'));
      return isDir ? { state: { ...next, cwd: path }, output: '' } : { state: next, output: `cd: каталог не найден: ${path}` };
    }
    case 'cat': {
      if (!args[0]) return { state: next, output: 'Использование: cat <файл>' };
      const path = normalize(args[0], state.cwd);
      return { state: next, output: state.files[path] ?? `cat: файл не найден: ${path}` };
    }
    case 'echo': return { state: next, output: args.join(' ') };
    case 'clear': return { state: { ...next, history: [] }, output: '\u0000CLEAR' };
    default: return { state: next, output: `Команда «${command}» не поддерживается. Введите help. Ничего не было выполнено в вашей ОС.` };
  }
}
