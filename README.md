# Scrappy Monorepo

This project is organized as a monorepo using [pnpm workspaces](https://pnpm.io/workspaces), with separate packages for the frontend and backend (API).

## Structure

```
/ (root)
  pnpm-workspace.yaml
  /frontend    # Frontend app (Vite/React)
  /api         # Backend serverless API (Vercel)
```

## Getting Started

### Prerequisites

- [pnpm](https://pnpm.io/installation) (recommended)

### Install dependencies

From the root directory:

```sh
pnpm install
```

### Working with packages

- **Frontend:**
  ```sh
  cd frontend
  pnpm dev
  ```
- **API (serverless backend):**
  Deploy `/api` to Vercel or run locally with your preferred serverless emulator.

### Running Tests

From the root or within a package:

```sh
pnpm test
```

## Notes

- Each package (`frontend`, `api`) has its own `package.json` and dependencies.
- Use `pnpm` for all install and run commands to ensure workspace compatibility.
