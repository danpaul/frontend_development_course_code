# Implementation Plan: Prisma Postgres migration

Source spec: [spec.md](./spec.md)

Switch Prisma from SQLite to hosted Prisma Postgres, drop e2e and action tests, and update README and `AGENTS.md`. Do not change Todo behavior, the `Todo` model, or Server Actions.

## Technical context

- Next.js 16 / React 19 / Prisma 7.10 (`prisma` and `@prisma/client` `^7.10.0`) / Tailwind 4 / Vitest browser
- Datasource URL lives in `prisma.config.ts` (`env("DATABASE_URL")` after `dotenv/config`), not in `prisma/schema.prisma`
- Schema provider is `sqlite`. Model `Todo` stays as written: `id` `Int` `@id @default(autoincrement())`, `createdAt` `DateTime` `@default(now())`, `title` `String`, `description` `String?`. Do not reformat those fields
- One migration: `prisma/migrations/20260826133321_init_todos/migration.sql` (SQLite). `prisma/migrations/migration_lock.toml` provider is `sqlite`
- Client singleton: `src/prisma/prismaClient.ts` uses `PrismaBetterSqlite3` and falls back to `file:./prisma/dev.db`. Generated client: `src/generated/prisma` (committed; sqlite query compiler today)
- `next.config.ts` has `reactCompiler: true` and `serverExternalPackages: ["@prisma/adapter-better-sqlite3"]`
- `npm run prisma:migrate` is `prisma migrate dev`. `npm run prisma:generate` is `prisma generate`. `npm test` is `vitest run`
- Vitest projects in `vitest.config.ts`: `storybook`, `components`, `actions`. The `actions` project points at `tests/actions/**/*.test.ts` and `file:./prisma/test.db`
- Playwright e2e: `playwright.config.ts`, `tests/e2e/todo.spec.ts`, script `test:e2e` (`@playwright/test`). Component tests use `playwright` and `@vitest/browser-playwright`, not `@playwright/test`
- `.env.example` is the sqlite URL plus the comment `# create a new file called .env and copy the contents of .env.example`. `.env` is gitignored
- `.gitignore` sqlite block: `*.db`, `*.db-journal`, `*.db-wal`, `*.db-shm`. Leave the `# testing` ignores (`/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/`)
- No CI workflows. No `serverExternalPackages` entry to add for `pg`
- Local `prisma/dev.db` and `prisma/test.db` may exist and are gitignored

## Target structure

```
prisma/schema.prisma                                 (provider postgresql; model unchanged)
prisma/migrations/migration_lock.toml                (provider postgresql)
prisma/migrations/<YYYYMMDDHHMMSS>_init_todos/migration.sql
src/prisma/prismaClient.ts                           (PrismaPg)
src/generated/prisma/                                (regenerated; do not hand-edit)
next.config.ts                                       (drop serverExternalPackages)
vitest.config.ts                                     (drop actions project)
package.json                                         (deps + scripts)
package-lock.json                                    (npm; do not hand-edit)
.env.example
.gitignore                                           (drop sqlite block)
README.md
AGENTS.md
```

Delete:

```
prisma/migrations/20260826133321_init_todos/
tests/actions/
tests/e2e/
tests/                                               (directory; empty after the two trees go)
playwright.config.ts
```

Delete local `*.db`, `*.db-journal`, `*.db-wal`, and `*.db-shm` if present (including `prisma/dev.db` and `prisma/test.db`). Do not commit them. Do not copy their rows.

Unchanged: `src/actions/`, `src/app/`, `src/components/`, `prisma.config.ts`, component tests, stories, `playwright`, `@vitest/browser-playwright`, specs `001`–`009`.

## Schema and migration

**File:** `prisma/schema.prisma`

- Set `provider = "postgresql"`. Leave the `Todo` model and the generator block as they are (`output = "../src/generated/prisma"`).

**Delete** `prisma/migrations/20260826133321_init_todos/`.

**Add** one folder `prisma/migrations/<timestamp>_init_todos/` where `<timestamp>` is the UTC time the migration is created (`YYYYMMDDHHMMSS`). Do not reuse `20260826133321`.

Create the directory, then write the SQL with Prisma (do not hand-write it, do not use `prisma migrate dev`):

```
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output prisma/migrations/<timestamp>_init_todos/migration.sql
```

Run that only after the schema provider is `postgresql`. `--from-empty` does not connect. `prisma.config.ts` still requires `DATABASE_URL` to be set; the existing local `.env` value is enough. Do not commit `.env`.

**File:** `prisma/migrations/migration_lock.toml`

```
provider = "postgresql"
```

Keep the two Prisma header comments. This file is the only migration history: one PostgreSQL migration that creates `Todo`.

## Connection

**File:** `src/prisma/prismaClient.ts`

```ts
/*
 * Prisma client for server code only. Do not import from UI.
 */
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
```

No fallback URL. No `Pool` wrapper, `DIRECT_URL`, or Accelerate URL.

**Packages** (npm updates `package.json` and `package-lock.json`):

- `npm install @prisma/adapter-pg@^7.10.0 pg`
- `npm install -D @types/pg`
- `npm uninstall @prisma/adapter-better-sqlite3 @playwright/test`

Leave `playwright` and `@vitest/browser-playwright`.

**File:** `next.config.ts`

- Remove `serverExternalPackages`. Keep `reactCompiler: true`. Do not add `pg`.

**File:** `.env.example`

```
DATABASE_URL="postgres://USER:PASSWORD@db.prisma.io:5432/postgres?sslmode=require"
# create a new file called .env and copy the contents of .env.example
```

Do not edit `.env`. Do not commit a real password.

## Scripts and Vitest

**File:** `package.json`

- `prisma:migrate`: `prisma migrate deploy`
- Leave `prisma:generate` (`prisma generate`) and `test` (`vitest run`)
- Remove `test:e2e`

**File:** `vitest.config.ts`

- Delete the `actions` project (the third `projects` entry: `tests/actions`, `globalSetup`, `setupFiles`, `DATABASE_URL`, `better-sqlite3` external).
- Leave `storybook` and `components` as they are, including `provider: playwright({})`.
- Comment becomes: `Vitest projects: storybook and components.`

## Tests removed

- Delete `tests/e2e/`, `tests/actions/`, and `playwright.config.ts`.
- Delete `tests/` once it is empty.
- Do not delete or edit `src/actions/`. Do not change component tests or stories.

## Client generation

After the schema provider is `postgresql`:

```
npm run prisma:generate
```

Commit the `src/generated/prisma` diff. Do not hand-edit those files. Do not change UI or actions because of the regenerate.

## Docs

### README

Stack:

- Prisma bullet: `[Prisma](https://www.prisma.io/) — ORM for hosted Prisma Postgres; `prisma/schema.prisma`, `src/prisma/prismaClient.ts``
- Remove the SQLite bullet.
- Vitest bullet: `[Vitest](https://vitest.dev/) — component and story tests in the browser; colocated `*.test.tsx``
- Remove the Playwright e2e bullet.
- Leave the other stack bullets.

Setup, this order only:

1. Install Node.js and npm. Clone this repo.
2. `npm install`
3. Create a Prisma Postgres database (Console or `npx create-db`)
4. Copy `.env.example` to `.env` and replace the placeholder with the direct connection string (`db.prisma.io`, not the pooled host). Do not commit `.env`.
5. `npm run prisma:generate`
6. `npm run prisma:migrate`
7. `npm run dev` → [http://localhost:3000/](http://localhost:3000/)

Scripts (name + one line). Remove `test:e2e`.

- `test` — Vitest (storybook and components projects)
- `prisma:migrate` — apply the committed migrations
- Leave `dev`, `storybook`, and `prisma:generate` lines as they are

File tree: remove the `tests/` block and `playwright.config.ts`. Vitest line: `Vitest projects (storybook, components)`. No `dev.db` or `test.db` notes.

### AGENTS.md

- Opening stack sentence: `Prisma 7 (hosted Prisma Postgres; generated client in `src/generated/prisma`)`. Leave `Vitest browser + Playwright`.
- Testing: delete the Playwright e2e bullet and the action-test `prisma/test.db` bullet.
- Scripts bullet: `` `test` (Vitest run, projects: `storybook`, `components`). `` Remove `` `test:e2e` ``.
- Delete the `## Action tests` subsection.
- App wiring `## Tests`: delete the Playwright / `dev.db` sentence. Keep the component-test mock sentence.
- Leave Server Action conventions. Leave the Next.js agent block at the bottom unchanged.
- Do not edit specs `001`–`009`.

## Implementation order

1. Install `@prisma/adapter-pg@^7.10.0`, `pg`, and `@types/pg`. Uninstall `@prisma/adapter-better-sqlite3` and `@playwright/test`. Set `prisma:migrate` to `prisma migrate deploy`. Remove `test:e2e`.
2. Set the schema provider to `postgresql`. Delete the SQLite migration. Write `<timestamp>_init_todos/migration.sql` via `prisma migrate diff --from-empty`. Set `migration_lock.toml` to `postgresql`.
3. Switch `prismaClient.ts` to `PrismaPg` and the missing-`DATABASE_URL` throw. Remove `serverExternalPackages` from `next.config.ts`.
4. Remove the Vitest `actions` project. Delete `tests/`, `playwright.config.ts`.
5. Remove the sqlite gitignore block. Delete local `*.db` files if present. Replace `.env.example`.
6. `npm run prisma:generate`.
7. Update README and `AGENTS.md`.
8. Typecheck and `npm test`.

## Out of scope

- Changing `Todo` fields or adding models
- Copying SQLite rows
- Creating the hosted database, editing `.env`, or running `prisma migrate deploy` (README setup, after a direct URL exists)
- Local Postgres, Docker, or `prisma dev`
- Pooled connections, `DIRECT_URL`, `TEST_DATABASE_URL`, `prisma+postgres://`
- Re-adding Playwright e2e or action tests
- Removing `playwright` or `@vitest/browser-playwright`
- Removing the `# testing` gitignore entries
- Editing specs `001`–`009`
- Editing Server Actions, page wiring, or UI
- Route Handlers, a service layer, or new app features
- `serverExternalPackages` for `pg`
- Hand-editing `src/generated/prisma`
