# AGENT.md

This is a lightweight guide for AI coding agents in this repository.

## Quick start

- Use `yarn` commands from the repo root.
- Start local development with `yarn dev`.
- Run targeted checks before broad checks.

## Working style

- Keep changes focused to the request.
- Prefer editing existing files over creating new files.
- Do not revert unrelated user changes.

## Validation

- Run the smallest relevant test or lint command first.
- Use `yarn typecheck` for shared type or cross-package changes.

## Safety

- Avoid destructive git commands unless explicitly requested.
- Do not commit secrets or environment files.
