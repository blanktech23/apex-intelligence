# Kiptra AI - Claude Code Instructions

## GitHub Standards (Enforced)

This repo follows hardened GitHub practices. All CI/CD and GitHub infrastructure changes MUST consult the GitHub expertise knowledge base at `~/Downloads/github-expertise/` before implementation.

### CI/CD
- All Actions pinned to SHA hashes (see `.github/workflows/`)
- CI pipeline: lint → type-check → build (gated, not parallel)
- CodeQL runs on PRs + weekly schedule with `security-extended` queries
- Dependency review blocks PRs introducing moderate+ vulnerabilities
- Dependabot groups minor/patch updates, ignores major versions, auto-merges patches

### Branch Protection (main)
- PRs required, 1 approval minimum
- Stale approvals dismissed on new commits
- CODEOWNERS review required
- Status checks (Lint, Type Check, Build) must pass
- Strict mode: branch must be up-to-date with main
- Linear history enforced (squash merge only)
- Force pushes and branch deletion blocked
- Admins cannot bypass

### Repository Settings
- Default GITHUB_TOKEN: read-only
- Actions cannot approve PRs
- Secret scanning + push protection enabled
- Dependabot alerts + security updates enabled
- Auto-delete merged branches

### When Adding New Workflows
1. Pin all actions to SHA — use `gh api repos/{owner}/{action}/commits/{ref} --jq .sha` to get hashes
2. Start with `permissions: {}`, add only what's needed per-job
3. Set `persist-credentials: false` on checkout
4. Set explicit `timeout-minutes` on every job
5. Use `fetch-depth: 1` unless git history is needed
6. Add concurrency group if the workflow runs on push/PR

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Deployed on Vercel
