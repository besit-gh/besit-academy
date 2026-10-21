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
      return usage('Команды: help, pwd, ls [-la], cd, cat, touch, mkdir, chmod, echo, whoami, tail, grep, dig, nc, git (чтение), docker (чтение), terraform (учебный план), kubectl (чтение), clear.\nТолько виртуальная файловая система: команды не запускаются в вашей ОС.');
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
    case 'tail': {
      const target = args[args.length - 1];
      const path = normalize(target ?? '', state.cwd);
      if (!target || !next.files[path]) return usage(`tail: файл не найден: ${target ?? ''}`);
      const nIndex = args.indexOf('-n');
      const count = nIndex >= 0 ? Math.max(1, Number(args[nIndex + 1]) || 10) : 10;
      return usage(next.files[path].split('\\n').slice(-count).join('\\n'));
    }
    case 'grep': {
      const ignoreCase = args.includes('-i');
      const target = args[args.length - 1];
      const pattern = args.filter(a => a !== '-i' && a !== target).join(' ');
      const path = normalize(target ?? '', state.cwd);
      if (!target || !next.files[path]) return usage(`grep: файл не найден: ${target ?? ''}`);
      const needle = ignoreCase ? pattern.toLowerCase() : pattern;
      return usage(next.files[path].split('\\n').filter(line => (ignoreCase ? line.toLowerCase() : line).includes(needle)).join('\\n'));
    }
    case 'dig': return usage(`; <<>> DiG 9.18 (учебный ответ) <<>> ${args[0] ?? 'api.internal'}\\n;; ANSWER SECTION:\\napi.internal. 60 IN A 10.20.0.15\\n\\n;; Симуляция: ответ DNS не доказывает доступность TCP-порта.`);
    case 'nc': return usage(`nc: учебная проверка TCP ${args[args.length - 1] ?? '443'} к ${args[args.length - 2] ?? 'api.internal'}: Connection refused\\nПодсказка: проверь маршрут, firewall и состояние слушающего порта.`);
    case 'git': {
      const sub = args[0];
      if (sub === 'log') return usage('a12bc34 fix: update app config\\n91de234 feat: add health endpoint\\n73ac102 chore: initial service setup');
      if (sub === 'show') return usage('diff --git a/config.yml b/config.yml\\n- port: 8080\\n+ port: 8081\\n\\nУчебный diff: проверь, соответствует ли изменение ожидаемому.');
      if (sub === 'diff') return usage('diff --git a/config.yml b/config.yml\\n- timeout: 30\\n+ timeout: 3\\n\\nУчебный diff: изменение timeout может повлиять на поведение приложения.');
      if (sub === 'status') return usage(' M config.yml\\n?? notes.txt');
      return usage('Учебный git поддерживает только чтение: git log, git show, git diff, git status.');
    }
    case 'docker': {
      if (args[0] === 'image' && args[1] === 'ls') return usage('REPOSITORY       TAG       IMAGE ID       SIZE\\nbesit/api        latest    a1b2c3d4e5f6   82MB');
      if (args[0] === 'ps') return usage('CONTAINER ID   IMAGE        STATUS                     NAMES\\nabc123         besit/api    Exited (1) 2 minutes ago   api-training');
      if (args[0] === 'volume') return usage('DRIVER    VOLUME NAME\\nlocal     api-data');
      return usage('Учебный docker поддерживает только безопасный просмотр: docker image ls, docker ps -a, docker volume ls.');
    }
    case 'terraform': return usage('Учебный план: 1 to add, 0 to change, 1 to destroy.\\nВнимание: обнаружено неожиданное уничтожение ресурса. Не применяй план до выяснения причины.');
    case 'kubectl': {
      if (args[0] === 'logs') return usage('INFO starting api\\nERROR cannot load config /etc/besit/app.conf');
      if (args[0] === 'describe') return usage('Status: Running\\nConditions: Ready=False\\nEvents: Readiness probe failed: HTTP probe failed with statuscode: 503');
      return usage('Учебный kubectl поддерживает только чтение: kubectl describe pod <имя>, kubectl logs <pod>.');
    }
    case 'clear': return { state: { ...next, history: [] }, output: '\\u0000CLEAR' };
    default: return usage(`Команда «${cmd}» не поддерживается. Ничего не выполнялось в вашей ОС.`);
  }
}
