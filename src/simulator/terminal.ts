export interface TerminalState {
  cwd: string;
  files: Record<string, string>;
  directories: string[];
  modes: Record<string, number>;
  history: string[];
}
export interface TerminalResult { state: TerminalState; output: string }

const home = '/home/rookie';
export const initialTerminalState = (): TerminalState => ({
  cwd: home,
  directories: ['/', '/home', home, '/var', '/var/log', '/etc', '/etc/besit'],
  files: {
    [home + '/README.txt']: 'Добро пожаловать в BESIT. Это симулятор, не полноценный Linux.',
    [home + '/notes.txt']: 'Цель смены: изучить окружение и проверить сервис.',
    '/var/log/app.log': 'INFO service starting\nWARN config file missing\nERROR cannot read /etc/besit/app.conf',
    '/etc/besit/app.conf': 'PORT=8080\nMODE=training'
  },
  modes: {
    '/': 0o755, '/home': 0o755, [home]: 0o755, '/var': 0o755, '/var/log': 0o755,
    '/etc': 0o755, '/etc/besit': 0o755,
    [home + '/README.txt']: 0o644, [home + '/notes.txt']: 0o644,
    '/var/log/app.log': 0o644, '/etc/besit/app.conf': 0o640
  },
  history: []
});

const normalize = (path: string, cwd: string) => {
  const out: string[] = [];
  for (const part of (path.startsWith('/') ? path : `${cwd}/${path}`).split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop(); else out.push(part);
  }
  return '/' + out.join('/');
};
const permissionString = (mode: number, directory = false) => {
  const bits = [0o400, 0o200, 0o100, 0o040, 0o020, 0o010, 0o004, 0o002, 0o001];
  return (directory ? 'd' : '-') + bits.map((bit, i) => mode & bit ? ['r','w','x'][i % 3] : '-').join('');
};
const basename = (path: string) => path.split('/').filter(Boolean).pop() ?? '/';

export function runCommand(state: TerminalState, input: string): TerminalResult {
  const line = input.trim();
  if (!line) return { state, output: '' };
  const history = [...state.history, line].slice(-100);
  const next: TerminalState = { ...state, files: { ...state.files }, directories: [...state.directories], modes: { ...state.modes }, history };
  const parts = line.split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);
  const isDir = (path: string) => next.directories.includes(path);
  const exists = (path: string) => isDir(path) || Object.prototype.hasOwnProperty.call(next.files, path);
  const children = (dir: string) => {
    const prefix = dir === '/' ? '/' : dir + '/';
    const names = [...next.directories.filter(p => p !== dir && p.startsWith(prefix)).map(p => p.slice(prefix.length).split('/')[0]),
      ...Object.keys(next.files).filter(p => p.startsWith(prefix)).map(p => p.slice(prefix.length).split('/')[0])];
    return [...new Set(names)].sort();
  };
  const usage = (text: string) => ({ state: next, output: text });
  switch (cmd) {
    case 'help':
      return usage('Команды: help, pwd, ls [-la], cd, cat, touch, mkdir, chmod, echo, whoami, clear.\nТолько виртуальная файловая система: команды не запускаются в вашей ОС.');
    case 'pwd': return usage(state.cwd);
    case 'whoami': return usage('rookie');
    case 'ls': {
      const long = args.some(a => a.startsWith('-') && a.includes('l'));
      const all = args.some(a => a.startsWith('-') && a.includes('a'));
      const target = args.find(a => !a.startsWith('-')) ?? '.';
      const path = normalize(target, state.cwd);
      if (!exists(path)) return usage(`ls: не удалось получить доступ к '${target}': нет такого файла или каталога`);
      if (!isDir(path)) {
        const mode = next.modes[path] ?? 0o644;
        return usage(long ? `${permissionString(mode)} 1 rookie rookie ${next.files[path].length} ${basename(path)}` : basename(path));
      }
      const names = children(path);
      if (all) names.unshift('.', '..');
      if (!names.length) return usage(long ? 'итого 0' : '');
      if (!long) return usage(names.join('  '));
      return usage(['итого ' + names.length, ...names.map(name => {
        const full = name === '.' ? path : name === '..' ? normalize('..', path) : normalize(name, path);
        const directory = isDir(full) || name === '.' || name === '..';
        const mode = next.modes[full] ?? (directory ? 0o755 : 0o644);
        const size = next.files[full]?.length ?? 4096;
        return `${permissionString(mode, directory)} 1 rookie rookie ${size} ${name}`;
      })].join('\n'));
    }
    case 'cd': {
      const path = normalize(args[0] ?? home, state.cwd);
      return isDir(path) ? { state: { ...next, cwd: path }, output: '' } : usage(`cd: каталог не найден: ${path}`);
    }
    case 'cat': {
      if (!args[0]) return usage('Использование: cat <файл>');
      const path = normalize(args[0], state.cwd);
      return usage(next.files[path] ?? `cat: файл не найден: ${path}`);
    }
    case 'touch': {
      if (!args[0] || args[0].startsWith('-')) return usage('Использование: touch <файл>');
      const path = normalize(args[0], state.cwd);
      if (isDir(path)) return usage(`touch: '${args[0]}' является каталогом`);
      const parent = normalize('..', path);
      if (!isDir(parent)) return usage(`touch: каталог не существует: ${parent}`);
      if (!(path in next.files)) { next.files[path] = ''; next.modes[path] = 0o644; }
      return usage('');
    }
    case 'mkdir': {
      const name = args.find(a => !a.startsWith('-'));
      if (!name) return usage('Использование: mkdir <каталог>');
      const path = normalize(name, state.cwd);
      if (exists(path)) return usage(`mkdir: не удалось создать каталог '${name}': файл существует`);
      if (!isDir(normalize('..', path))) return usage(`mkdir: родительский каталог не существует: ${normalize('..', path)}`);
      next.directories.push(path); next.modes[path] = 0o755;
      return usage('');
    }
    case 'chmod': {
      if (args.length < 2 || !/^[0-7]{3,4}$/.test(args[0])) return usage('Использование: chmod <режим 000-777> <файл или каталог>');
      const path = normalize(args[1], state.cwd);
      if (!exists(path)) return usage(`chmod: не удалось получить доступ к '${args[1]}': нет такого файла или каталога`);
      const mode = Number.parseInt(args[0], 8);
      if (mode > 0o777) return usage('chmod: в учебном симуляторе поддерживаются права от 000 до 777');
      next.modes[path] = mode;
      return usage('');
    }
    case 'echo': {
      const redirectIndex = args.indexOf('>');
      if (redirectIndex >= 0) {
        const target = args[redirectIndex + 1];
        if (!target || target.startsWith('-')) return usage('Использование: echo текст > файл');
        const path = normalize(target, state.cwd);
        if (!isDir(normalize('..', path))) return usage(`echo: каталог не существует: ${normalize('..', path)}`);
        if (isDir(path)) return usage(`echo: '${target}' является каталогом`);
        next.files[path] = args.slice(0, redirectIndex).join(' ');
        next.modes[path] ??= 0o644;
        return usage('');
      }
      return usage(args.join(' '));
    }
    case 'clear': return { state: { ...next, history: [] }, output: '\\u0000CLEAR' };
    default: return usage(`Команда «${cmd}» не поддерживается. Ничего не выполнялось в вашей ОС.`);
  }
}
