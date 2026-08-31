# Todoish — course sample

**Todoish** is a single-user todo sample for the course, not a production app.

Coding conventions for this repo live in [`AGENTS.md`](./AGENTS.md).

## Stack

- [React 19](https://react.dev/) — UI library; `src/components/`
- [Next.js](https://nextjs.org/) — App Router; `src/app/page.tsx`, `src/app/layout.tsx`
- [Prisma](https://www.prisma.io/) — SQLite ORM; `prisma/schema.prisma`, `src/prisma/prismaClient.ts`
- [Storybook](https://storybook.js.org/) — UI in isolation; `.storybook/`, colocated `*.stories.tsx`
- [Atomic Design](https://atomicdesign.bradfrost.com/chapter-2/) — UI folder map; `src/components/{atoms,molecules,organisms,templates,pages}`
- [Tailwind CSS](https://tailwindcss.com/) — utility classes; `src/app/globals.css`
- [Vite](https://vite.dev/) — Storybook and Vitest toolchain, not the Next.js bundler; `.storybook/main.ts`, `vitest.config.ts`
- [Vitest](https://vitest.dev/) — component/story/action tests; colocated `*.test.tsx`, `tests/actions/`
- [Playwright](https://playwright.dev/) — e2e; `tests/e2e/`, `playwright.config.ts`
- SQLite — local DB used by Prisma; `prisma/dev.db` is gitignored and created on migrate; `prisma/schema.prisma`

## Setup

1. Install Node.js and npm. Clone this repo.
2. `npm install`
3. Copy `.env.example` to `.env` (do not commit `.env`)
4. `npm run prisma:generate`
5. `npm run prisma:migrate` (applies existing migrations; creates `prisma/dev.db`)
6. `npm run dev` → [http://localhost:3000/](http://localhost:3000/)

## Scripts

See `./package.json`
Execute using `npm run [name of script]`

- `dev` — Next.js app at http://localhost:3000/
- `storybook` — Storybook UI on port 6006
- `test` — Vitest (storybook, components, and actions projects)
- `test:e2e` — Playwright e2e
- `prisma:migrate` — apply existing migrations; creates `prisma/dev.db`
- `prisma:generate` — generate the Prisma client

## File structure

```
.
├── src/
│   ├── app/                         # routes (`page.tsx` is `/`)
│   │   ├── page.tsx                 # `/` — loads todos, injects Server Actions
│   │   ├── layout.tsx               # root layout and document metadata
│   │   └── globals.css              # Tailwind entry
│   ├── components/                  # atomic UI
│   │   └── atoms/Button/Button.tsx  # canonical atom
│   ├── actions/                     # Server Actions
│   │   └── todo/createTodo/createTodo.ts
│   ├── prisma/prismaClient.ts       # Prisma client used by actions
│   └── generated/prisma/            # generated client; do not edit
├── prisma/                          # schema and migrations
├── .storybook/                      # Storybook config
├── tests/
│   ├── actions/                     # action tests (`prisma/test.db`)
│   └── e2e/                         # Playwright (`prisma/dev.db`)
├── specs/                           # application specs
├── vitest.config.ts                 # Vitest projects (storybook, components, actions)
├── playwright.config.ts             # Playwright e2e config
└── AGENTS.md                        # conventions for this repo
```

To explore the codebase, starte with `src\app\page.tsx`.