# CI/CD & Automation Standards

[Purpose: Automated quality gates, consistent workflows, and AI-assisted development patterns]

## Philosophy

- **Fail Fast**: Catch issues before merge via automated checks
- **Shift Left**: Quality gates in development (hooks) and CI (GitHub Actions)
- **AI-Augmented**: Claude Code integration for reviews and assistance
- **Reproducible**: Locked dependencies, pinned versions, consistent environments

## Quality Gate Layers

```
Local (Git Hooks) → CI (GitHub Actions) → Review (Claude Code) → Merge
```

### Layer 1: Git Hooks (Husky)

Pre-commit quality gates run before code enters version control:

**Pre-commit** (`.husky/pre-commit`):

```bash
pnpm exec lint-staged
```

**Pre-push** (`.husky/pre-push`):

```bash
pnpm run type-check
pnpm run test
```

**Staged Files** (`.lintstagedrc.json`):

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

**Principles**:

- Pre-commit: Fast checks on changed files only (lint, format)
- Pre-push: Full validation before sharing (type-check, test)
- Auto-fix where possible (ESLint --fix, Prettier)
- Block commit/push on failure

### Layer 2: CI Pipeline (GitHub Actions)

**Main CI** (`.github/workflows/ci.yml`):

Triggers:

- Push to `main`
- Pull requests to `main`

Quality checks (sequential):

1. Lint (`pnpm run lint`)
2. Type Check (`pnpm run type-check`)
3. Format Check (`pnpm run format:check`)
4. Tests with Coverage (`pnpm run test:coverage`)
5. Build (`pnpm run build`)

**Key Patterns**:

```yaml
# Use .node-version file for consistency
node-version-file: .node-version

# Use pnpm with frozen lockfile
uses: pnpm/action-setup@v4
run: pnpm install --frozen-lockfile
# Fail pipeline on any quality gate failure
# (default behavior - no --force or ignore errors)
```

**Principles**:

- All checks must pass before merge
- Same checks as pre-push (consistency)
- No dependency drift (frozen lockfile)
- Build validates production readiness

### Layer 3: AI-Assisted Review

**Claude Code Review** (`.github/workflows/claude-code-review.yml`):

Triggers:

- PR opened
- PR synchronized (new commits)

Review criteria:

- Code quality and best practices
- Potential bugs or issues
- Performance considerations
- Security concerns
- Test coverage

Uses `CLAUDE.md` for project-specific guidance.

**Claude Code Interactive** (`.github/workflows/claude.yml`):

Triggers:

- Issue/PR comment with `@claude`
- Issue opened/assigned with `@claude`
- PR review comment with `@claude`

Permissions:

- Read repository, PRs, issues
- Read CI results on PRs
- ID token (authentication)

**Principles**:

- AI augments human review (not replaces)
- Context-aware via CLAUDE.md
- Can read CI failures for assistance
- Invoked explicitly via @mention

## Package Scripts

Standard automation commands:

```json
{
  "dev": "next dev", // Local development server
  "dev:debug": "dev3000 -p 3030 --command 'next dev -p 3030'", // Debug mode with dev3000
  "build": "next build", // Production build
  "start": "next start", // Production server
  "lint": "eslint .", // ESLint check
  "format": "prettier --write .", // Format all files
  "format:check": "prettier --check .", // Verify formatting
  "type-check": "tsc --noEmit", // TypeScript validation
  "test": "jest", // Run tests
  "test:watch": "jest --watch", // Watch mode
  "test:coverage": "jest --coverage", // With coverage
  "test:e2e": "playwright test", // E2E tests (Playwright)
  "prepare": "husky" // Initialize hooks
}
```

**Principles**:

- Consistent naming (check vs action: `format:check` vs `format`)
- CI uses same scripts as local development
- Coverage in CI, watch mode for local
- `prepare` auto-runs on install (sets up hooks)

## Environment Setup

**Node.js Version**:

- Defined in `.node-version` file
- Used by GitHub Actions (`node-version-file`)
- Ensures consistent runtime across environments

**Package Manager**:

- pnpm specified in `package.json`: `"packageManager": "pnpm@9.0.0"`
- GitHub Actions auto-detects via `pnpm/action-setup@v4`
- Always use `--frozen-lockfile` in CI

**Dependencies**:

- Lock file committed (`pnpm-lock.yaml`)
- No version drift between environments
- Reproducible builds

## Workflow Patterns

### Feature Development Flow

```
1. Create feature branch
2. Code + Local Tests (TDD)
3. Pre-commit hook → Lint/Format changed files
4. Pre-push hook → Type-check + Full test suite
5. Push to GitHub
6. CI Pipeline → All quality gates
7. Claude Review → AI analysis (automatic)
8. Human Review → Code review
9. @claude in PR → AI assistance if needed
10. Merge to main
```

### Quality Gate Failure Response

**Local Hook Failure**:

- Fix issues immediately (blocked from commit/push)
- Auto-fixes applied for format/lint where possible

**CI Failure**:

- Check GitHub Actions logs
- Reproduce locally with same script
- @mention `@claude` with context for AI help

**Review Feedback**:

- Address Claude Code suggestions
- Request clarification via @mention if needed
- Human reviewer has final say

## AI Integration Patterns

### When to @mention Claude

**In Issues**:

- Architecture questions
- Implementation guidance
- Bug triage assistance

**In PRs**:

- Review interpretation
- Refactoring suggestions
- Test coverage gaps

**In Comments**:

- Specific line/file questions
- Alternative approach exploration

### Claude Code Capabilities

**Can Access**:

- Full repository code
- CLAUDE.md conventions
- CI results on PRs
- Issue/PR context

**Review Focus**:

- Aligns with project patterns (from CLAUDE.md)
- Security and performance
- TypeScript best practices
- Test coverage

**Limitations**:

- Assists, doesn't replace human review
- May need clarification on business logic
- Works best with clear, specific requests

## Security & Secrets

**Required Secrets** (GitHub repository settings):

- `CLAUDE_CODE_OAUTH_TOKEN` - For Claude Code integration

**Never Commit**:

- API keys, credentials
- `.env` files (add to `.gitignore`)
- Service account tokens

**Permissions Model**:

- GitHub Actions use minimal required permissions
- Explicit permission grants in workflow files
- ID token for Claude Code authentication

## Maintenance

### Adding New Quality Gates

1. Add script to `package.json`
2. Test locally
3. Add to appropriate hook (`.husky/pre-commit` or `.husky/pre-push`)
4. Add to CI workflow (`.github/workflows/ci.yml`)
5. Document in this file

### Updating Dependencies

```bash
# Update lock file
pnpm update

# Verify quality gates still pass
pnpm run lint
pnpm run type-check
pnpm run test
pnpm run build

# Commit with frozen lockfile
git add pnpm-lock.yaml
```

### Debugging CI Failures

1. Check GitHub Actions logs for specific failure
2. Reproduce locally with exact same script
3. Use `@claude` with error context if needed
4. Verify environment matches (Node version, pnpm version)

## Rationale

**Why Husky + lint-staged?**

- Prevents bad code from entering version control
- Faster than full CI (runs only on changed files)
- Auto-fixes reduce friction

**Why separate pre-commit and pre-push?**

- Pre-commit: Fast feedback on style (< 5 seconds)
- Pre-push: Comprehensive validation (may take 30+ seconds)
- Balance between speed and thoroughness

**Why Claude Code integration?**

- Scales code review with AI assistance
- Context-aware via CLAUDE.md
- Can help debug CI failures
- Complements human review

**Why frozen lockfile?**

- Prevents "works on my machine" issues
- Reproducible builds across environments
- Explicit dependency updates only

---

## Debug & Development Tools

**dev3000 Integration**:

- **Purpose**: Comprehensive development timeline recording (server + browser events)
- **Trigger**: `pnpm dev:debug` (separate from normal development)
- **Features**:
  - Timeline Dashboard (`http://localhost:3684/logs`)
  - MCP Server for Claude Code (CLI) AI-assisted debugging
  - Automated browser monitoring via Playwright
  - Screenshots, console logs, network requests
- **Workflow**: Normal dev (`pnpm dev`) for speed, debug mode for problem diagnosis

**Why Separate Debug Mode?**

- Avoids overhead during normal development
- Provides powerful diagnostics when needed
- AI integration via MCP for context-aware debugging
- Full event history for complex bug reproduction

---

**Key Takeaway**: Quality gates at every layer (hooks → CI → review) with AI augmentation, ensuring issues caught early and development flow stays fast.

_Created: 2025-10-21_
_Updated: 2025-10-25_
