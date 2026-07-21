# Sapphire Learning Hub

## Prerequisites

- Node.js `>=22.13.0`
- Bun `>=1.3.10`

## Local Development

```bash
bun install
bun run dev
```

## Production Build

```bash
bun run build
bun run start
```

## Verification

```bash
bun run test
bun run lint
bun run build
```

## Project Structure

- `app/`: Next.js App Router pages and global styles
- `public/`: static assets served as-is
- `tests/`: lightweight repository regression tests
