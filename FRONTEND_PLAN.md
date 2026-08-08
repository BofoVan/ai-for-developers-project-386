# План реализации Frontend (Календарь звонков)

## Актуальная архитектура (после Этапа 0)

- **Фреймворк**: React 19 + TypeScript ~5.7 + Vite 8
- **UI библиотека**: shadcn/ui (стиль `base-nova`, базовый цвет `neutral`, CSS variables)
- **Стилизация**: Tailwind CSS v4 (через `@tailwindcss/vite`)
- **Маршрутизация**: `react-router-dom` (`HashRouter` — для SPA без серверного роутинга)
- **Работа с API**: `TanStack Query` (React Query) + `openapi-fetch`
- **Типы из контракта**: `openapi-typescript` — генерация TypeScript типов из `openapi.yaml`
- **Мок-сервер**: Prism (`@stoplight/prism-cli`) — запускается из `frontend/schema/openapi.yaml`
- **Работа с датами**: `date-fns`
- **Иконки**: `lucide-react`

### Фактическая структура проекта

```
frontend/
├── public/
├── schema/
│   └── openapi.yaml           # Копия контракта для Prism и генерации типов
├── src/
│   ├── api/
│   │   ├── client.ts          # openapi-fetch клиент (baseUrl: localhost:4010)
│   │   ├── admin.ts           # TanStack Query hooks для AdminPage
│   │   ├── guest.ts           # TanStack Query hooks для BookingPage
│   │   └── generated/
│   │       └── types.ts       # Сгенерированные TypeScript типы из OpenAPI
│   ├── components/
│   │   ├── layout.tsx         # Общий Layout (Header + Footer)
│   │   └── ui/                # shadcn/ui компоненты
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── textarea.tsx
│   │       ├── badge.tsx
│   │       ├── table.tsx
│   │       ├── dialog.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── sonner.tsx
│   │       ├── calendar.tsx
│   │       ├── select.tsx
│   │       └── skeleton.tsx
│   ├── lib/
│   │   └── utils.ts           # cn() и другие утилиты
│   ├── pages/
│   │   ├── LandingPage.tsx    # Hero + преимущества + типы встреч из API
│   │   ├── AdminPage.tsx      # CRUD типов встреч + бронирования
│   │   └── BookingPage.tsx    # 4-шаговый flow бронирования
│   ├── App.tsx                # Роутер: /, /admin, /book
│   ├── main.tsx               # Entry point (QueryClientProvider + HashRouter)
│   └── index.css              # Tailwind + shadcn/ui тема
├── .env.local                 # VITE_API_BASE_URL=http://localhost:4010
├── components.json            # Конфиг shadcn/ui
├── package.json
├── tsconfig.app.json          # baseUrl + paths: {"@/*": ["./src/*"]}
├── tsconfig.node.json
└── vite.config.ts             # @tailwindcss/vite + alias @ -> /src
```

### Запуск для разработки

```bash
cd frontend

# Терминал 1 — мок API (Prism)
npm run mock:api
# или: npx prism mock schema/openapi.yaml --port 4010

# Терминал 2 — фронтенд (Vite)
npm run dev
# Открыть: http://localhost:5173/#/
```

URL после перехода на `HashRouter`:
- `http://localhost:5173/#/` — LandingPage
- `http://localhost:5173/#/admin` — AdminPage
- `http://localhost:5173/#/book` — BookingPage

### npm-скрипты (package.json)

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "generate-types": "openapi-typescript schema/openapi.yaml -o src/api/generated/types.ts",
  "mock:api": "prism mock schema/openapi.yaml --port 4010"
}
```

### API клиент (`src/api/client.ts`)

```ts
import createClient from 'openapi-fetch';
import type { paths } from './generated/types';

export const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4010',
});

// Использование: client.GET('/api/event-types')
// Методы uppercase: GET, POST, DELETE, PATCH, PUT
```

---

## Этап 0: Инфраструктура и подготовка ✅ ЗАВЕРШЁН

> **Цель**: Создать фронтенд-проект, настроить мок-сервер, сгенерировать типы. Работающий скелет приложения, который ходит в Prism.

### Выполненные шаги:

1. **Создан Vite-проект**: `npm create vite@latest frontend -- --template react-ts`
2. **Установлены зависимости**:
   - runtime: `react-router-dom`, `@tanstack/react-query`, `date-fns`, `lucide-react`, `openapi-fetch`
   - dev: `@tailwindcss/vite`, `tailwindcss`, `@stoplight/prism-cli`, `openapi-typescript`, `@types/node`
3. **Инициализирован shadcn/ui**: `npx shadcn@latest init --yes --defaults`
   - Автоматически обнаружен Vite + Tailwind v4
   - Добавлены компоненты: `button`, `card`, `input`, `label`, `textarea`
4. **Скопирована OpenAPI схема** в `frontend/schema/openapi.yaml`
5. **Сгенерированы TypeScript типы**: `src/api/generated/types.ts` (484 строки, полностью покрывают контракт)
6. **Настроен API клиент**: `openapi-fetch` с типами `paths`, baseUrl из `.env.local`
7. **Настроен TanStack Query**: `QueryClientProvider` в `main.tsx` (`staleTime: 5 мин`)
8. **Настроен HashRouter**: `BrowserRouter` заменён на `HashRouter` (корректная работа при прямом заходе на `/admin`, `/book`)
9. **Запущен Prism**: `localhost:4010`, проверен `GET /api/event-types` → возвращает мок-данные
10. **Создан базовый Layout**: Header с логотипом + навигация + Footer
11. **Созданы страницы-заглушки**: `LandingPage`, `AdminPage`, `BookingPage` (только `<h1>`)
12. **Сборка проходит без ошибок**: `npm run build` ✅

### Проверки:
- [x] Vite dev server запускается (`npm run dev` → `http://localhost:5173`)
- [x] Prism запущен и отвечает на запросы (`curl http://localhost:4010/api/event-types`)
- [x] Типы сгенерированы и импортируются без ошибок TypeScript
- [x] Навигация между `/#/`, `/#/admin`, `/#/book` работает корректно
- [x] shadcn/ui стили применяются (Tailwind CSS v4 + тема neutral)

---

## Этап 1: Страница приветствия (LandingPage) ✅ ЗАВЕРШЁН

> **Цель**: Публичная страница с описанием сервиса, навигацией на бронирование и вход в админку.
> **API endpoints**: `GET /api/event-types` (опционально, для отображения доступных типов встреч).

### Выполненные шаги:

1. **Добавлены shadcn/ui компоненты**: `button`, `card`, `badge`
2. **Реализованы секции страницы**:
   - **Hero**: Заголовок "Календарь звонков", краткое описание, иконка CalendarDays.
   - **Преимущества**: 3 карточки (Выберите время, Заполните данные, Готово!).
   - **CTA**: Кнопки "Записаться" → `/#/book`, "Войти как администратор" → `/#/admin`.
3. **Добавлено получение типов событий** из `GET /api/event-types`
   - Отображение доступных типов встреч в виде карточек с Badge длительности

### Проверки:
- [x] Страница открывается по `/#/`
- [x] Кнопка "Записаться" ведет на `/#/book`
- [x] Кнопка "Войти как администратор" ведет на `/#/admin`
- [x] Список типов событий подгружается из Prism

---

## Этап 2: Админ-панель (AdminPage) ✅ ЗАВЕРШЁН

> **Цель**: CRUD управление типами событий и просмотр/удаление бронирований.
> **API endpoints**:
> - `POST /admin/event-types` — создать тип
> - `GET /admin/event-types` — список типов
> - `DELETE /admin/event-types/{eventTypeId}` — удалить тип
> - `GET /admin/bookings` — список бронирований
> - `DELETE /admin/bookings/{bookingId}` — удалить бронирование

### Выполненные шаги:

1. **Добавлены shadcn/ui компоненты**:
   - `table`, `dialog`, `input`, `label`, `textarea`, `sonner` (toast), `alert-dialog`
2. **Реализованы TanStack Query hooks** (`src/api/admin.ts`):
   - `useAdminEventTypes()` — `client.GET('/admin/event-types')`
   - `useCreateEventType()` — `client.POST('/admin/event-types', { body })`
   - `useDeleteEventType()` — `client.DELETE('/admin/event-types/{eventTypeId}')`
   - `useAdminBookings()` — `client.GET('/admin/bookings')`
   - `useDeleteBooking()` — `client.DELETE('/admin/bookings/{bookingId}')`
3. **Реализованы UI секции**:
   - **A. Управление типами событий**: inline-форма создания + таблица списка + удаление с AlertDialog
   - **B. Просмотр бронирований**: таблица + удаление с подтверждением
4. **Обработка ошибок**: Toast-уведомления (`toast.success`, `toast.error`), валидация формы

### Проверки:
- [x] Список типов событий загружается
- [x] Можно создать новый тип события
- [x] Новый тип появляется в списке без перезагрузки
- [x] Можно удалить тип события
- [x] Список бронирований загружается
- [x] Можно удалить бронирование

---

## Этап 3: Страница бронирования (BookingPage) ✅ ЗАВЕРШЁН

> **Цель**: Пользователь выбирает тип встречи, видит календарь со свободными слотами, выбирает время и записывается.
> **API endpoints**:
> - `GET /api/event-types` — выбор типа встречи
> - `GET /api/event-types/{eventTypeId}/slots` — получение слотов
> - `POST /api/bookings` — создание бронирования

### Выполненные шаги:

1. **Добавлены shadcn/ui компоненты**:
   - `calendar`, `card`, `input`, `button`, `badge`, `skeleton`, `select`
2. **Реализованы TanStack Query hooks** (`src/api/guest.ts`):
   - `usePublicEventTypes()` — `client.GET('/api/event-types')`
   - `useAvailableSlots(eventTypeId, from, to)` — `client.GET('/api/event-types/{eventTypeId}/slots')`
   - `useCreateBooking()` — `client.POST('/api/bookings', { body })`
3. **Реализован UI пошагового флоу**:
   - **Шаг 1**: Выбор типа события (карточки с названием, описанием, длительностью)
   - **Шаг 2**: Выбор даты (Calendar) и времени (кнопки слотов)
   - **Шаг 3**: Форма записи (имя, email) + валидация
   - **Шаг 4**: Подтверждение / ошибка (201 → успех, 409 → "Это время уже занято")
4. **Обработка ошибок и состояний**:
   - Loading states (Skeleton + Loader2)
   - Ошибка 409 → "Это время уже занято"
   - Валидация email
   - Toast-уведомления

### Проверки:
- [x] Список типов событий загружается
- [x] При выборе типа загружаются слоты
- [x] Можно выбрать дату и время
- [x] Форма отправляется, возвращается 201
- [x] Успешная запись показывает подтверждение
- [x] Навигация "Назад" работает между шагами

---

## Дополнительные рекомендации

### 1. Prism и тестовые данные
Prism stateless — данные не сохраняются между запросами. Для удобной разработки:
- Добавьте `examples` в `openapi.yaml` для responses (особенно для `Slot[]` и `Booking[]`).
- При тестировании AdminPage: бронирования создаются в Этапе 3, потом видны в админке.

### 2. shadcn/ui компоненты
Добавляются через MCP или CLI:
```bash
npx shadcn@latest add <component-name>
```
Установленные: `button`, `card`, `input`, `label`, `textarea`, `badge`, `table`, `dialog`, `alert-dialog`, `sonner`, `calendar`, `select`, `skeleton`.

### 3. Генерация типов
```bash
npm run generate-types
```
Перегенерация при изменении контракта.

### 4. State management
**Не нужен Redux/Zustand**. TanStack Query покрывает серверное состояние. Локальное состояние шагов бронирования — `useState` на уровне `BookingPage`.

### 5. Переменные окружения
`.env.local`:
```
VITE_API_BASE_URL=http://localhost:4010
```
При переходе на реальный бэкенд — поменять URL.

---

## Итоговый чек-лист поэтапной реализации

| Этап | Что делаем | API endpoints | Состояние |
|------|-----------|---------------|-----------|
| **0** | Инфраструктура: Vite, shadcn/ui, HashRouter, TanStack Query, Prism, типы | — | ✅ Готово |
| **1** | Landing Page: приветствие, описание, навигация | `GET /api/event-types` (опц.) | ✅ Готово |
| **2** | Admin Page: CRUD типов событий + бронирования | `POST/GET /admin/event-types`, `DELETE /admin/event-types/{id}`, `GET /admin/bookings`, `DELETE /admin/bookings/{id}` | ✅ Готово |
| **3** | Booking Page: календарь, слоты, форма записи | `GET /api/event-types`, `GET /api/event-types/{id}/slots`, `POST /api/bookings` | ✅ Готово |

**Рекомендуемый порядок**: 0 ✅ → 1 ✅ → 2 ✅ → 3 ✅. Все этапы завершены. Сборка проходит без ошибок.
