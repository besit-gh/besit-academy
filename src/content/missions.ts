import type { Mission } from '../domain/types';
export const missions: Mission[] = [
 { id:'first-login', title:'Первый вход: где я вообще?', department:'Service Desk', summary:'Освой первые безопасные команды и найди дорогу в виртуальной системе.', difficulty:'starter', xp:80, competency:'terminal-navigation', steps:[
  {id:'pwd',prompt:'Наставник просит узнать текущий рабочий каталог. Какая команда показывает полный путь?',explanation:'pwd (print working directory) печатает путь текущего рабочего каталога. Это безопасная диагностическая команда.',options:[{id:'pwd',label:'pwd'},{id:'cd',label:'cd'},{id:'where',label:'where'}],correctOptionId:'pwd'},
  {id:'ls',prompt:'Теперь нужно увидеть файлы и каталоги в текущем месте. Что выберешь?',explanation:'ls показывает содержимое каталога. Флаги вроде -la добавляют скрытые файлы и подробную информацию.',options:[{id:'rm',label:'rm'},{id:'ls',label:'ls'},{id:'chmod',label:'chmod'}],correctOptionId:'ls'},
  {id:'safe',prompt:'Коллега предлагает запустить неизвестный скрипт через sudo, чтобы «не тратить время». Как поступить?',explanation:'Сначала проверь источник, содержимое и последствия. sudo не делает неизвестный код безопасным.',options:[{id:'run',label:'Сразу выполнить с sudo'},{id:'inspect',label:'Проверить источник, содержимое и необходимые права'},{id:'ignore',label:'Удалить всё окружение'}],correctOptionId:'inspect'}
 ]},
 { id:'permission-puzzle', title:'Кто трогал права?', department:'Linux Operations', summary:'Диагностируй отказ в доступе, не выдавая всем лишние привилегии.', difficulty:'basic', xp:120, competency:'permissions', steps:[
  {id:'inspect-mode',prompt:'С чего безопаснее начать диагностику отказа в доступе к файлу?',explanation:'Проверь путь, владельца, группу и режим доступа. ls -l показывает основные сведения; также проверь права родительских каталогов.',options:[{id:'inspect',label:'Проверить путь, владельца и права (ls -l)'},{id:'777',label:'Сразу поставить chmod 777'},{id:'reboot',label:'Перезагрузить сервер'}],correctOptionId:'inspect'}
 ]},
 { id:'logs-detective', title:'Археолог логов', department:'Monitoring & SRE', summary:'Найди первопричину по журналу, а не методом «перезапустим и посмотрим».', difficulty:'basic', xp:140, competency:'troubleshooting', steps:[
  {id:'logs',prompt:'В журнале сервиса есть ERROR: cannot read /etc/besit/app.conf. Какова первая полезная гипотеза?',explanation:'Сервис не может прочитать конфигурацию. Проверь существование файла, путь и права доступа до перезапуска или изменения настроек.',options:[{id:'network',label:'Сломался DNS'},{id:'config',label:'Проблема с конфигурационным файлом или доступом к нему'},{id:'reboot',label:'Нужна обязательная перезагрузка'}],correctOptionId:'config'}
 ]}
];
