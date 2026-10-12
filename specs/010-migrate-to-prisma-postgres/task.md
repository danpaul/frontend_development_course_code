# Tasks: Prisma Postgres migration

Source: [plan.md](./plan.md) · [spec.md](./spec.md)

Do not change Server Actions, page wiring, or UI. Do not hand-edit `src/generated/prisma`. Do not commit `.env` or a real password. Do not add `DIRECT_URL`, a pooled URL, or `prisma+postgres://`. Do not edit specs `001`–`009`. Do not re-add Playwright e2e or action tests. Do not copy SQLite rows. Do not create the hosted database or run `prisma migrate deploy`.

## 1. Dependencies and scripts

- [x] `npm install @prisma/adapter-pg@^7.10.0 pg` and `npm install -D @types/pg`.
- [x] `npm uninstall @prisma/adapter-better-sqlite3 @playwright/test`. Leave `playwright` and `@vitest/browser-playwright`.
- [x] Set `prisma:migrate` to `prisma migrate deploy`. Leave `prisma:generate` and `test`. Remove `test:e2e`.
- [x] Let npm update `package-lock.json`. Do not hand-edit it.

## 2. Schema and migration

- [x] Set `prisma/schema.prisma` provider to `postgresql`. Do not change the `Todo` model or the generator block.
- [x] Delete `prisma/migrations/20260826133321_init_todos/`.
- [x] Add `prisma/migrations/<YYYYMMDDHHMMSS>_init_todos/migration.sql`. Timestamp is creation time UTC. Do not reuse `20260826133321`.
- [x] Fill that file with `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output <that path>` after the provider change. Do not hand-write the SQL. Do not use `prisma migrate dev`.
- [x] Set `prisma/migrations/migration_lock.toml` provider to `postgresql`. Keep its header comments.

## 3. Client and Next config

- [x] Rewrite `src/prisma/prismaClient.ts`: `PrismaPg` from `@prisma/adapter-pg` with `{ connectionString }`. If `DATABASE_URL` is missing, `throw new Error("DATABASE_URL is required")`. No fallback URL.
- [x] Remove `serverExternalPackages` from `next.config.ts`. Keep `reactCompiler: true`. Do not add one for `pg`.

## 4. Tests removed

- [x] Delete the `actions` project from `vitest.config.ts`. Leave `storybook` and `components`. Set the projects comment to `storybook and components`.
- [x] Delete `tests/e2e/`, `tests/actions/`, `playwright.config.ts`, and the `tests/` directory.
- [x] Do not delete `src/actions/` or edit component tests or stories.

## 5. Env, gitignore, local db files

- [x] Replace `.env.example` with the `postgres://USER:PASSWORD@db.prisma.io:5432/postgres?sslmode=require` URL and keep the existing copy-to-`.env` comment.
- [x] Do not edit `.env`.
- [x] Remove the `# sqlite` gitignore block (`*.db`, `*.db-journal`, `*.db-wal`, `*.db-shm`). Leave the `# testing` ignores.
- [x] Delete local `*.db`, `*.db-journal`, `*.db-wal`, and `*.db-shm` if they exist, including `prisma/dev.db` and `prisma/test.db`.

## 6. Generate client

- [x] Run `npm run prisma:generate`. Commit the generated diff. Do not hand-edit `src/generated/prisma`.

## 7. Docs

- [x] README stack: Prisma bullet is hosted Prisma Postgres (`prisma/schema.prisma`, `src/prisma/prismaClient.ts`). Remove the SQLite bullet. Vitest bullet is component and story tests in the browser and colocated `*.test.tsx`. Remove the Playwright e2e bullet.
- [x] README setup, in order: Node/npm and clone → `npm install` → create a Prisma Postgres database (Console or `npx create-db`) → copy `.env.example` to `.env` and replace the placeholder with the direct `db.prisma.io` string (not the pooled host); do not commit `.env` → `npm run prisma:generate` → `npm run prisma:migrate` → `npm run dev` → http://localhost:3000/.
- [x] README scripts: remove `test:e2e`. `test` is Vitest (storybook and components). `prisma:migrate` applies the committed migrations. No `dev.db` or `test.db`.
- [x] README file tree: remove `tests/` and `playwright.config.ts`. Vitest note is storybook and components only.
- [x] `AGENTS.md` opening stack sentence: `Prisma 7 (hosted Prisma Postgres; generated client in `src/generated/prisma`)`. Leave `Vitest browser + Playwright`.
- [x] `AGENTS.md` Testing: remove the Playwright e2e bullet, the `prisma/test.db` bullet, and `test:e2e`. `test` runs projects `storybook` and `components`.
- [x] Delete the `## Action tests` subsection. Leave Server Action conventions.
- [x] App wiring `## Tests`: remove the Playwright / `dev.db` sentence. Keep the component-test mock sentence.
- [x] Leave the Next.js agent block at the bottom of `AGENTS.md` unchanged. Do not edit specs `001`–`009`.

## 8. Verify

- [x] `npx tsc --noEmit`.
- [x] `npm test` (storybook and components only).
- [x] Confirm `package.json` has no `test:e2e`, no `@playwright/test`, and no `@prisma/adapter-better-sqlite3`, and still has `playwright` and `@vitest/browser-playwright`.
- [x] Confirm `src/actions/`, `src/app/`, and `src/components/` are unchanged, and specs `001`–`009` are unchanged.
