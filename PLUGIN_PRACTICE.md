# Практика: плагин Claude Code

Учебная практика: собрали минимальный плагин Claude Code, проверили его, установили через локальный маркетплейс, обновили и откатили установку. Ветка `chore/plugin-practice` в `main` не мерджится.

## Что такое плагин

Плагин — это набор настроек Claude Code в одной папке: навыки, субагенты, хуки, MCP-серверы, команды. Его можно установить одной командой, включать и выключать, обновлять и раздавать другим. Плагины распространяются через маркетплейсы — каталоги с файлом `.claude-plugin/marketplace.json`.

Правило выбора: пока навык нужен в одном проекте, его место в `.claude/` проекта; если он нужен в нескольких проектах или другим людям, его стоит упаковать в плагин.

## Структура

```
plugins/
├── .claude-plugin/
│   └── marketplace.json        # local marketplace "health-monitor-practice"
└── hello-plugin/
    ├── .claude-plugin/
    │   └── plugin.json         # plugin manifest: name, description, version
    └── skills/
        └── git-summary/
            └── SKILL.md        # skill: branch, changes, last commits
```

- `plugin.json` — паспорт плагина, обязательно только поле `name`.
- `SKILL.md` — навык. Поле `name` должно совпадать с именем папки. `description` подсказывает Claude, когда запускать навык.
- `marketplace.json` — каталог: имя маркетплейса, владелец и список плагинов. `source` указывается относительно папки маркетплейса, а `name` плагина совпадает с `name` в `plugin.json`.

Навык из плагина вызывается с префиксом имени плагина: `/hello-plugin:git-summary`. Claude также выбирает его сам по обычной фразе, например «покажи git-сводку».

## Шаги

1. Создали `plugin.json`.
2. Создали навык `git-summary`.
3. Проверили без установки: `claude --plugin-dir ./plugins/hello-plugin`. Флаг действует только на эту сессию и ничего не пишет в настройки.
4. Создали `marketplace.json`.
5. Установили:
   - сделали резервную копию `~/.claude/settings.json`;
   - выполнили `/plugin marketplace add ./plugins`;
   - установили `hello-plugin` в области `local`, только для себя и только в этом проекте.
6. Проверили, что плагин виден в `/plugin` и навык срабатывает.
7. Обновили навык (3 коммита заменили на 5) и выполнили `/reload-plugins`: правка подхватилась без переустановки.
8. Откатили установку командой `/plugin marketplace remove health-monitor-practice` и сверили файлы с резервными копиями.

## Что меняется при установке

| Команда | Что записывается |
|---|---|
| `/plugin marketplace add` | `extraKnownMarketplaces` в `~/.claude/settings.json`; запись в `~/.claude/plugins/known_marketplaces.json` |
| `/plugin install ... --scope local` | `enabledPlugins` в `.claude/settings.local.json` проекта (исключён из git); запись в `~/.claude/plugins/installed_plugins.json`; копия плагина в `~/.claude/plugins/cache/` |

Области установки:
- `user` (по умолчанию): `~/.claude/settings.json`, плагин включён во всех проектах;
- `project`: `.claude/settings.json`, коммитится и включает плагин для всей команды;
- `local`: `.claude/settings.local.json`, только для себя и только в этом проекте.

## Наблюдения

- **Обновление локального плагина.** Хотя при установке плагин копируется в кэш, для маркетплейса из локальной папки `/reload-plugins` перечитывает файлы прямо из исходной папки. Поднимать версию и выполнять `/plugin update` нужно, когда плагин ставят из удалённого маркетплейса (GitHub): тогда у пользователя есть только копия в кэше.
- **Откат неполный.** `marketplace remove` удалил плагин и запись в `installed_plugins.json`, но оставил:
  - пустой `"extraKnownMarketplaces": {}` в `~/.claude/settings.json`;
  - пустой `"enabledPlugins": {}` в `.claude/settings.local.json`;
  - папку `~/.claude/plugins/cache/health-monitor-practice/`.

  Всё это безвредно. `settings.json` вернули из резервной копии, папку кэша удалили вручную, `settings.local.json` оставили.
- **Резервная копия** `~/.claude/settings.json` перед экспериментами с плагинами позволяет точно проверить, что поменялось, и вернуть всё как было.

## Документация

- [Установка плагинов](https://code.claude.com/docs/en/plugins/install)
- [Создание плагина](https://code.claude.com/docs/en/plugins/create)
- [Публикация и маркетплейс](https://code.claude.com/docs/en/plugins/publish)
- [Структура плагина](https://code.claude.com/docs/en/plugins/manifest-reference)
