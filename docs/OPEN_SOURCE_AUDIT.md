# BESIT ACADEMY — технический и open-source аудит

Дата проверки: 2026-10-21. Это инженерный скрининг публичных GitHub-репозиториев, не юридическое заключение и не полный аудит всех зависимостей. В этом изменении сторонний исходный код не копировался.

## Текущее состояние BESIT

Проверенный репозиторий: [besit-gh/besit-academy](https://github.com/besit-gh/besit-academy), ветка `main`.

- **Стек:** React 18, TypeScript, Vite 6, lucide-react; SPA для GitHub Pages.
- **Проверки:** TypeScript, Vitest, скрипт проверки учебного контента и CI workflow публикации.
- **Backend / БД / auth:** отсутствуют. Профиль, прогресс и события хранятся в localStorage; есть JSON import/export.
- **RPG:** миссии с вариантами ответов, XP/уровни, компетенции, достижения и журнал событий.
- **Терминал:** безопасная виртуальная файловая система и явный список реализованных команд; произвольный shell-код не выполняется.
- **Реальные лаборатории:** отсутствуют. GitHub Pages не может безопасно выполнять команды ученика или предоставлять изолированные Linux/Kubernetes-окружения.
- **Доверие:** клиентские сохранения можно редактировать; они не доказывают прохождение сертификации.
- **Лицензия BESIT:** в проверенном корне LICENSE не найден, GitHub API сообщает `license: null`. До определения и добавления собственной лицензии права на повторное использование кода BESIT не следует считать явно предоставленными.

## Реестр сторонних компонентов

Статусы относятся к предложенному способу использования. Перед поставкой продукта требуется отдельная проверка зависимостей и конкретных файлов.

| Компонент | Проверенные факты | Лицензия | План использования и обязательства | Статус |
|---|---|---|---|---|
| [DevOps Odyssey](https://github.com/YusufKaya00/devops-odyssey) | TypeScript/React, Express, PostgreSQL; `server.js` использует permissive CORS, принимает fallback identity из `x-user-id`, а при сетевой ошибке tokeninfo локально декодирует JWT без проверки подписи. В корне main LICENSE/COPYING не найден; GitHub license=null. | Не обнаружена | Не копировать. Даже как архитектурный пример host sandbox/auth требует отдельного threat review; указанные пути авторизации нельзя переносить в BESIT. | **BLOCKED** для копирования |
| [K8s Isekai](https://github.com/wongcyrus/k8s-isekai) | RPG Maker, NPC Kubernetes-задачи; README ссылается на отдельные AWS SAM grader и Kubernetes game-rule проекты. В корне main LICENSE/COPYING не найден. | Не обнаружена | Только изучение сценарной модели. Проверять лицензии отдельно у grader, game rules, assets и шрифтов. | **BLOCKED** для копирования |
| [Educates Training Platform](https://github.com/educates/educates-training-platform) | Ветка develop, Go multi-module, session manager, REST API, training portal, terminal/editor; per-session container, namespace, vcluster или VM. LICENSE и NOTICE присутствуют. | Apache-2.0 | Приоритетный кандидат как отдельный runtime через API/SSO, а не перенос в SPA. Сохранять LICENSE/NOTICE и применимые уведомления; проверить лицензии модулей, образов и зависимостей. | **APPROVED** для оценки отдельного сервиса |
| [TechIndustry](https://github.com/polichdev/TechIndustry) | Express 5, PostgreSQL/Sequelize, Handlebars SSR, JWT/OAuth; корневой LICENSE обозначен GitHub как MIT, но `package.json` заявляет `ISC`. Архитектурно отличается от SPA BESIT. | Конфликт: MIT в LICENSE vs ISC в manifest | Изучать идеи без копирования. До согласования противоречия правообладателем не переносить код; после уточнения проверить конкретные файлы и зависимости. | **REVIEW REQUIRED** |
| [DevOps Academy AU](https://github.com/devopsacademyau/academy) | Ветка master, classes/exercises/projects, workflow с pull requests; LICENSE присутствует. | CC BY-SA 4.0 указана GitHub | Учебные материалы при адаптации требуют атрибуции и ShareAlike, если лицензия применима. Не предполагать, что каждый кодовый файл, изображение или внешний ресурс лицензирован так же — проверять происхождение. | **REVIEW REQUIRED** |
| [LabEx Learn DevOps](https://github.com/labex-labs/learn-devops) | Ветка master; проверенный корень содержит локализованные README, LICENSE не найден; GitHub license=null. | Не обнаружена | Не копировать код/тексты без лицензии или разрешения; публичная доступность не даёт автоматических прав. | **BLOCKED** для копирования |
| [DevOps Learn By Doing](https://github.com/deepakkumar-platform/DevOps-Learn-By-Doing) | Ветка main, коллекция labs/challenges/projects; LICENSE содержит MIT License, Copyright 2025 Deepak kumar. | MIT | Подходит как ориентир roadmap и ограниченного повторного использования после проверки конкретных файлов. Сохранять MIT notice; не считать внешние ссылки/assets автоматически MIT. | **APPROVED** для ограниченного повторного использования |

## Сравнение стратегий

| Стратегия | Выгода | Стоимость / риск | Вывод |
|---|---|---|---|
| A. Повторное использование кода | Быстрее реализовать отдельную функцию | Лицензия, стек, зависимости и безопасность требуют проверки | Только файлы с подтверждёнными правами и file-level review |
| B. Отдельная подсистема | Чёткая граница runtime/UI, меньше форка и копирования | Нужны Kubernetes/эксплуатация, SSO/API, квоты, мониторинг и бюджет | **Предпочтительно для реальных лабораторий: пилот Educates** |
| C. Самостоятельная реализация | Контроль и совместимость с текущей моделью | Дорого и рискованно для полноценного multi-tenant sandbox | Предпочтительно для небольших RPG-функций; не писать собственный runtime без причины |

## Рекомендуемый путь

1. Расширять собственную модель миссий, валидаторы и тесты, сохраняя local-first архитектуру.
2. Терминал оставлять симулятором; отдельно определить контракт лабораторного задания и критерии оценки.
3. Перед реальными лабораториями провести threat model и disposable dev-пилот Educates: RBAC, изоляция сессий, egress, CPU/RAM/storage quotas, TTL/cleanup, аудит и стоимость.
4. Не подключать лаборатории к production-данным; не хранить секреты в браузере; результат оценивать на серверной стороне.
5. Добавить собственный LICENSE после определения политики правообладателя; внедрить SBOM/проверку лицензий и реестр атрибуций.

## Первая безопасная интеграция

В BESIT добавлены декларативные зависимости миссий: первая миссия остаётся открытой, остальные доступны после её завершения. Формат сохранений не меняется, внешние зависимости не добавляются. Это не реальный sandbox и не доверенная сертификация.

## Источники

- https://github.com/YusufKaya00/devops-odyssey
- https://github.com/wongcyrus/k8s-isekai
- https://github.com/educates/educates-training-platform
- https://github.com/polichdev/TechIndustry
- https://github.com/devopsacademyau/academy
- https://github.com/labex-labs/learn-devops
- https://github.com/deepakkumar-platform/DevOps-Learn-By-Doing
