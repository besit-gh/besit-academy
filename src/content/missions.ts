import type { Mission } from '../domain/types';

export const missions: Mission[] = [
  {
    id: 'first-login',
    title: 'Первый вход: где я вообще?',
    department: 'Service Desk',
    summary: 'Познакомься с терминалом и выясни, в каком каталоге начинается твоя рабочая смена.',
    difficulty: 'starter',
    xp: 80,
    competency: 'terminal-navigation',
    steps: [
      {
        id: 'pwd',
        prompt: 'Наставник просит узнать текущий рабочий каталог. Какая команда показывает его полный путь?',
        explanation: 'pwd (print working directory) печатает путь текущего рабочего каталога. Это безопасная диагностическая команда.',
        options: [
          { id: 'pwd', label: 'pwd' },
          { id: 'cd', label: 'cd' },
          { id: 'where', label: 'where' },
        ],
        correctOptionId: 'pwd',
      },
      {
        id: 'ls',
        prompt: 'Теперь нужно увидеть файлы и каталоги в текущем месте. Что выберешь?',
        explanation: 'ls показывает содержимое каталога. Флаги вроде -la добавляют скрытые файлы и подробную информацию.',
        options: [
          { id: 'rm', label: 'rm' },
          { id: 'ls', label: 'ls' },
          { id: 'chmod', label: 'chmod' },
        ],
        correctOptionId: 'ls',
      },
      {
        id: 'safe',
        prompt: 'Коллега предлагает выполнить неизвестный скрипт через sudo, чтобы «не тратить время». Как поступить?',
        explanation: 'Сначала изучи источник и содержимое скрипта, пойми необходимые привилегии и проверь последствия. sudo не делает неизвестный код безопасным.',
        options: [
          { id: 'run', label: 'Сразу выполнить с sudo' },
          { id: 'inspect', label: 'Проверить источник, содержимое и требуемые права' },
          { id: 'ignore', label: 'Удалить всё окружение' },
        ],
        correctOptionId: 'inspect',
      },
    ],
  },
  {
    id: 'permission-puzzle',
    title: 'Кто трогал права?',
    department: 'Linux Operations',
    summary: 'Разберись, почему скрипт не запускается, не выдавая всем лишние привилегии.',
    difficulty: 'basic',
    xp: 120,
    competency: 'permissions',
    steps: [
      {
        id: 'inspect-mode',
        prompt: 'С чего безопаснее начать диагностику отказа в доступе к файлу?',
        explanation: 'Проверь владельца, группу, режим доступа и путь. ls -l показывает базовые сведения о правах; затем проверь родительские каталоги.',
        options: [
          { id: 'inspect', label: 'Проверить путь, владельца и права (ls -l)' },
          { id: '777', label: 'Сразу поставить chmod 777' },
          { id: 'reboot', label: 'Перезагрузить сервер' },
        ],
        correctOptionId: 'inspect',
      },
    ],
  },
];
