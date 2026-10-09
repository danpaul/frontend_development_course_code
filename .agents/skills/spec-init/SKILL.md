---
name: spec-init
description: >-
  Creates a new spec at specs/NNN-kebab-slug/spec.md from the template in this
  skill, using the next sequential 3-digit prefix. Does not grill, plan, or
  implement. Use when the user says "spec-init", @-mentions this skill, or asks
  to start or initialize a new spec.
disable-model-invocation: true
---

# Spec init

Create one new spec folder from the template below.

Do not grill the spec. Do not create `plan.md` or `task.md`. Do not implement. Do not edit `AGENTS.md` or `README.md`.

If the topic or slug is unclear, ask instead of guessing.

## When invoked

1. Get the feature from the user (message, or a short description they already gave). If there is no topic, ask what the spec is for before creating anything.
2. Choose the folder name (below). If that folder already exists, or another `specs/*-<slug>/` uses the same slug, stop and ask. Do not overwrite.
3. Write `specs/<NNN>-<slug>/spec.md` from the template below.
4. Replace the `# Title` line with a short title taken from the user's words.
5. Draft only what the user already said. Leave every other heading empty.
6. Tell the user the path and that the next step is **spec-grill-me** on that `spec.md`.

## Naming and location

- One new folder: `specs/<NNN>-<slug>/`.
- Only file: `spec.md` in that folder.
- `<NNN>` is the next sequential prefix: among directories directly under `specs/` whose names match `NNN-…` (`NNN` is three digits), take the highest prefix, add 1, and zero-pad to 3 digits (`009` → `010`). If none exist, use `001`. Do not fill gaps.
- `<slug>` is kebab-case: lowercase `a-z`, digits, and single hyphens. Short (a few words). If the user gave a slug, normalize that. Otherwise derive it from the title.
- Do not put the number in the slug.

## Template

Write this file, then change only the H1. Do not add, remove, or rename headings.

```markdown
# Title

## Context

## Goals

## Requirements

## Out of scope
```

## Rough draft

Under a heading, add bullets only for facts the user already stated that belong there. Do not invent requirements, exclusions, or alternatives. If they did not speak to a heading, leave it as the heading alone.

## Example

User: "Initialize a spec for dark mode on Button." Highest existing prefix is `009`.

Create `specs/010-button-dark-mode/spec.md`:

```markdown
# Button dark mode

## Context

- Dark mode styles for the Button atom.

## Goals

## Requirements

## Out of scope
```
