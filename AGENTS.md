# AGENTS.md

Applies to the whole repository.

- Use Bun only. Run `bun install` and `bun run <script>`. Do not use `npm`, `yarn`, or `pnpm`, and do not add their lockfiles.
- Commit messages must follow Conventional Commits, for example `feat(site): ...` or `chore(repo): ...`.
- Before committing changes that affect runtime behavior, run `bun run test`, `bun run lint`, and `bun run build`.
- Keep this repository a standard Next.js App Router site. Route code belongs in `app/`, and static assets belong in `public/`.
- Do not reintroduce Vite, vinext, Worker, or OpenAI Sites-specific build layers unless the user explicitly asks for them.
- Prefer small, focused changes. Add dependencies or infrastructure only when the current site actually needs them.
