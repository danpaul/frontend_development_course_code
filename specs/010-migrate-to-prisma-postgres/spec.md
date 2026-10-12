# Prisma postgres migration

## Context

- This Next app uses Prisma 7 with SQLite through `@prisma/adapter-better-sqlite3` in `src/prisma/prismaClient.ts`. `DATABASE_URL` defaults to `file:./prisma/dev.db` when unset.
- Schema: `prisma/schema.prisma`, provider `sqlite`. One migration: `prisma/migrations/20260826133321_init_todos` (SQLite SQL). `migration_lock.toml` provider is `sqlite`.
- Generated client is committed at `src/generated/prisma`. Do not hand-edit it.
- `prisma.config.ts` reads `DATABASE_URL`. `npm run prisma:migrate` is `prisma migrate dev`. `npm run prisma:generate` is `prisma generate`.
- Action tests live under `tests/actions/`. Vitest project `actions` sets `DATABASE_URL` to `file:./prisma/test.db`. `tests/actions/globalSetup.ts` runs `prisma migrate deploy`. `tests/actions/setup.ts` runs `prisma.todo.deleteMany()` before each test.
- Playwright e2e is `tests/e2e/todo.spec.ts`, `playwright.config.ts`, and `npm run test:e2e` (`@playwright/test`). It uses the app database.
- Component and Storybook tests use Vitest browser mode (`playwright`, `@vitest/browser-playwright`). They do not use `@playwright/test` or the database.
- Server Actions under `src/actions/` stay the app backend.
- README and `AGENTS.md` document SQLite file databases, action tests, and Playwright e2e.

## Goals

- Move the app from SQLite to one hosted Prisma Postgres database.
- Remove SQLite code, packages, file databases, and docs.
- Remove Playwright e2e and the action tests.
- Keep current Todo behavior, the current `Todo` model, and the Server Actions.

## Requirements

### Schema and migrations

- Set the datasource provider to `postgresql`.
- Keep the `Todo` model as it is: `id` `Int` `@id @default(autoincrement())`, `createdAt` `DateTime` `@default(now())`, `title` `String`, `description` `String?`.
- Delete the SQLite migration `prisma/migrations/20260826133321_init_todos`.
- Commit one new PostgreSQL migration that creates that same `Todo` table. `migration_lock.toml` provider is `postgresql`.
- Do not copy rows from SQLite files.
- Delete local `*.db` files if they exist. Remove the SQLite gitignore block (`*.db`, `*.db-journal`, `*.db-wal`, `*.db-shm`).

### Connection

- One direct `postgres://` URL for both Prisma Client and the Prisma CLI. No `DIRECT_URL`, no `TEST_DATABASE_URL`, and no pooled URL. No `prisma+postgres://` Accelerate URL.
- `DATABASE_URL` is that direct Prisma Postgres string (`db.prisma.io`, `sslmode=require`).
- `prisma.config.ts` keeps reading `DATABASE_URL`.
- `src/prisma/prismaClient.ts` uses `PrismaPg` from `@prisma/adapter-pg` with `{ connectionString: process.env.DATABASE_URL }`.
- If `DATABASE_URL` is missing, throw `new Error("DATABASE_URL is required")`. No fallback URL.
- Add dependencies `@prisma/adapter-pg` and `pg`. `@prisma/adapter-pg` matches the installed Prisma 7 major (`^7.10.0`). Add devDependency `@types/pg`.
- Remove `@prisma/adapter-better-sqlite3`.
- Remove `serverExternalPackages` from `next.config.ts`. Do not add one for `pg`.
- `.env.example` is only:

  ```
  DATABASE_URL="postgres://USER:PASSWORD@db.prisma.io:5432/postgres?sslmode=require"
  ```

  Keep the existing comment that says to copy it to `.env`. `.env` stays gitignored. Do not commit a real password.

### Scripts

- Change `prisma:migrate` to `prisma migrate deploy`.
- Leave `prisma:generate` and `npm test` (`vitest run`) as they are.
- Remove the `test:e2e` script.

### Client generation

- Regenerate `src/generated/prisma` with `npm run prisma:generate`. Do not hand-edit generated files.

### Tests removed

- Delete `tests/e2e/`, `tests/actions/`, `playwright.config.ts`, and the `tests/` directory if it is empty.
- Remove the Vitest `actions` project from `vitest.config.ts`. Leave the `storybook` and `components` projects as they are. `npm test` runs those two only.
- Remove the `@playwright/test` devDependency.
- Keep `playwright` and `@vitest/browser-playwright`. Do not change component tests or stories.
- Do not delete `src/actions/` or change Server Actions.

### Docs

Update README:

- Prisma stack line: ORM for hosted Prisma Postgres; `prisma/schema.prisma`, `src/prisma/prismaClient.ts`.
- Remove the SQLite stack bullet.
- Vitest stack line: component and story tests in the browser; colocated `*.test.tsx`. Drop action tests from that line.
- Remove the Playwright e2e stack bullet.
- Setup, in this order: Node/npm and clone → `npm install` → create a Prisma Postgres database (Console or `npx create-db`) → copy `.env.example` to `.env` and replace the placeholder with the direct connection string (`db.prisma.io`, not the pooled host) → `npm run prisma:generate` → `npm run prisma:migrate` → `npm run dev` → http://localhost:3000/. Do not commit `.env`.
- Scripts: remove `test:e2e`. Describe `prisma:migrate` as applying the committed migrations. Do not mention `prisma/dev.db` or `prisma/test.db`.
- File tree: remove `tests/`, `playwright.config.ts`, and any `dev.db` / `test.db` notes.

Update `AGENTS.md`:

- Remove the Playwright e2e bullet, the action-test database bullet, and the `test:e2e` script mention. `test` runs Vitest projects `storybook` and `components`.
- Remove the `## Action tests` subsection.
- Under App wiring tests, remove the Playwright / `dev.db` sentence. Keep the component-test mock sentence.
- Leave Server Action conventions in place. Leave the Next.js agent block at the bottom unchanged.
- Do not edit older specs.

### Behavior

- Todo list, create, update, and delete keep their current behavior.
- Do not change Server Action shape, page wiring, or UI.

## Out of scope

- Changing `Todo` fields or adding models.
- Copying existing SQLite rows.
- Local Postgres, Docker, or `prisma dev`.
- Pooled connections, `DIRECT_URL`, `TEST_DATABASE_URL`, and the Accelerate `prisma+postgres://` URL.
- Re-adding Playwright e2e or action tests.
- Editing specs `001` through `009`.
- Deleting or rewriting Server Actions.
- Route Handlers, a service layer, or new app features.
