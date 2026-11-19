# Hollama

A minimal LLM chat app that runs entirely in the browser. SvelteKit on Cloudflare, also shipped as a Docker image and an Electron app.

## Worktrees

T3 opens each thread in `.worktrees/<branch>` and runs `scripts/worktree-setup`
(wired in `t3.json`), which writes this checkout's `PORT` and `PREVIEW_PORT` to
`.env`, runs `npm ci`, and installs Playwright's Chromium. Dev, preview, and
Playwright read those ports with `strictPort`, so a collision fails instead of
drifting. Without `.env`, as in CI, they fall back to 5173 and 4173. The fleet
`worktree-dev` skill covers which processes are yours, the tailnet link, and
retiring the worktree.

npm's `allow-scripts` warning during install is expected. Build and tests run
without those install scripts, and Electron downloads its binary the first time
it starts. In development, `npm run electron` always loads `127.0.0.1:5173`, not
this checkout's `PORT`.

## Commands

- `npm run dev` serves on `PORT`
- `npm run preview` serves the last `npm run build` on `PREVIEW_PORT`
- `npm test` builds, serves on `PREVIEW_PORT`, and runs Playwright from `tests/`

Every test leaves a trace, screenshots included, under `test-results/`. Open one
with `npx playwright show-trace <path>/trace.zip`.

## Pull requests

Keep the description to a few short sentences: what the feature or problem is,
and how the change solves it, at a high level. File-by-file detail belongs in
the diff.

When the UI changes, show it with screenshots. `gh` can't upload images, so
commit them to a `pr-assets/<branch>` branch with `git hash-object`,
`git mktree` and `git commit-tree`, push that commit, and embed
`https://raw.githubusercontent.com/fmaclen/hollama/<sha>/<file>.png`.
