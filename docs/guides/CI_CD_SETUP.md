# CI/CD Setup Guide

**Last Updated**: January 8, 2026
**Status**: MVP Implemented ✅

## Overview

This project uses **GitHub Actions** for Continuous Integration (CI) and **Vercel** for Continuous Deployment (CD). Every push and pull request triggers automated testing and builds.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Developer Workflow                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │   git push / PR     │
                    └─────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌───────────────────────────┐   ┌──────────────────────┐
│   GitHub Actions (CI)     │   │   Vercel (CD)        │
│                           │   │                      │
│  1. Run Tests (Jest)      │   │  1. Build Next.js    │
│  2. Build Next.js         │   │  2. Deploy Preview   │
│  3. Coverage Report       │   │  3. Deploy Production│
│  4. Lint (future)         │   │                      │
└───────────────────────────┘   └──────────────────────┘
                │                           │
                ▼                           ▼
        ✅ Tests Pass               🚀 Live Deployment
        ❌ Tests Fail              https://as-ai-dashboard.vercel.app
```

---

## GitHub Actions CI Pipeline

### Workflow File

**Location**: `.github/workflows/ci.yml`

### Triggers

- **Push to `main`**: Runs full CI pipeline
- **Pull Requests to `main`**: Runs tests before merge

### Jobs

#### 1. **Test Job** (`test`)
- **Purpose**: Run Jest test suite across multiple Node versions
- **Matrix Strategy**: Tests on Node 18.x and 20.x
- **Steps**:
  1. Checkout code
  2. Setup Node.js with npm cache
  3. Install dependencies (`npm ci`)
  4. Run tests (`npm test`) - 76 tests
  5. Generate coverage report (Node 20.x only)
  6. Upload coverage to Codecov (optional)

**Expected Output**:
```
Test Suites: 15 passed, 15 total
Tests:       76 passed, 76 total
Snapshots:   0 total
Time:        1.168 s
```

#### 2. **Build Job** (`build`)
- **Purpose**: Verify Next.js production build succeeds
- **Depends On**: Test job must pass first
- **Steps**:
  1. Checkout code
  2. Setup Node.js 20.x with npm cache
  3. Install dependencies
  4. Build Next.js app (`npm run build`)
  5. Check build artifacts

**Why This Matters**: Catches build errors before deployment

#### 3. **Lint Check Job** (`lint-check`)
- **Status**: Placeholder for future implementation
- **Planned Features**:
  - ESLint for code quality
  - TypeScript type checking
  - Prettier formatting check

---

## Vercel Deployment (CD)

### How It Works

Vercel automatically detects your GitHub repository and:

1. **Preview Deployments**: Every PR gets a unique preview URL
2. **Production Deployments**: Every push to `main` deploys to production
3. **Build Command**: `npm run build` (from package.json)
4. **Output Directory**: `.next/` (Next.js default)

### Current Vercel Settings

**No `vercel.json` required** - Vercel auto-detects Next.js projects.

If you need custom configuration, create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Vercel Preview URLs

When you create a PR, Vercel comments with:
```
✅ Preview deployment ready!
https://as-ai-dashboard-abc123.vercel.app
```

### Production URL

- **Live Site**: https://as-ai-dashboard.vercel.app
- **Alternative**: https://as-ai-dashboard-techco.vercel.app

---

## Running Tests Locally

### Basic Test Run
```bash
npm test
```

### Watch Mode (Re-run on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

**Output**:
```
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   62.5  |   45.2   |   58.3  |   62.1  |
 components/tabs      |   65.0  |   50.0   |   60.0  |   64.8  |
 components/shared    |   80.0  |   75.0   |   85.0  |   79.5  |
```

---

## CI/CD Integration Points

### 1. GitHub Actions + Vercel

**Both run in parallel** on every push:
- **GitHub Actions**: Tests and builds (validates code quality)
- **Vercel**: Builds and deploys (publishes live site)

**Why both?**
- GitHub Actions: Full control, matrix testing, coverage reports
- Vercel: Optimized for Next.js, instant deployments, preview URLs

### 2. Branch Protection Rules (Recommended)

Configure in GitHub Settings → Branches:

```yaml
Branch Protection Rule: main
├─ ✅ Require status checks before merging
│  ├─ ✅ test (Node 18.x)
│  ├─ ✅ test (Node 20.x)
│  └─ ✅ build
├─ ✅ Require branches to be up to date
├─ ✅ Require pull request reviews (optional)
└─ ✅ Do not allow bypassing the above settings
```

**Result**: Cannot merge PRs with failing tests!

### 3. Status Badges (Optional)

Add to `README.md`:
```markdown
[![CI Status](https://github.com/techco/as-ai-dashboard/workflows/CI%20-%20Tests%20&%20Build/badge.svg)](https://github.com/techco/as-ai-dashboard/actions)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://as-ai-dashboard.vercel.app)
```

---

## Troubleshooting

### Tests Fail in CI but Pass Locally

**Possible Causes**:
1. **Node version mismatch**: CI uses 18.x and 20.x, check `node -v` locally
2. **Environment variables**: CI doesn't have `.env` file
3. **Dependencies**: Run `npm ci` instead of `npm install` locally

**Fix**:
```bash
# Clean install matching CI
rm -rf node_modules package-lock.json
npm install
npm test
```

### Build Fails in Vercel

**Common Issues**:
1. **Missing dependencies**: Check if all imports are in `package.json`
2. **Environment variables**: Set in Vercel Dashboard → Settings → Environment Variables
3. **Build timeout**: Default is 15 minutes, upgrade plan if needed

**Debug**:
- Check Vercel deployment logs: https://vercel.com/dashboard → Project → Deployments
- Run `npm run build` locally to reproduce

### Coverage Upload Fails

**Expected**: Coverage upload to Codecov is `continue-on-error: true`

If you want to enable:
1. Sign up at https://codecov.io
2. Add `CODECOV_TOKEN` to GitHub Secrets
3. Update workflow to remove `continue-on-error: true`

---

## Future Enhancements

### Planned Improvements

1. **ESLint Integration** (~2 hours)
   - Add `.eslintrc.json` configuration
   - Run `npm run lint` in CI
   - Auto-fix on commit with Husky

2. **TypeScript Type Checking** (~1 hour)
   - Add `npm run type-check` script
   - Run in CI alongside tests

3. **E2E Testing with Playwright** (~1 week)
   - Test critical user flows
   - Run in CI with screenshots on failure

4. **Performance Budget** (~2 hours)
   - Fail builds if bundle size exceeds threshold
   - Track JavaScript bundle size over time

5. **Automated Dependency Updates** (Dependabot)
   - Auto-create PRs for security patches
   - Weekly dependency updates

6. **Slack/Discord Notifications** (~1 hour)
   - Notify team on build failures
   - Post preview URLs to Slack

---

## Testing the CI Pipeline

### Manual Test

1. Create a new branch:
   ```bash
   git checkout -b test-ci-pipeline
   ```

2. Make a trivial change (e.g., update README):
   ```bash
   echo "Testing CI" >> README.md
   git add README.md
   git commit -m "test: Verify CI pipeline works"
   ```

3. Push and create PR:
   ```bash
   git push origin test-ci-pipeline
   ```

4. Watch GitHub Actions run:
   - Go to: https://github.com/techco/as-ai-dashboard/actions
   - See all 3 jobs running (test, build, lint-check)

5. Check Vercel preview deployment in PR comments

### Expected Results

✅ **All checks passing**:
- `test (18.x)` - 76 tests passed
- `test (20.x)` - 76 tests passed
- `build` - Next.js build succeeded
- `lint-check` - Placeholder (always passes)
- Vercel preview deployed

---

## Cost Analysis

### GitHub Actions

**Free tier**: 2,000 minutes/month for private repos (unlimited for public)

**Current usage per workflow run**:
- Test job (Node 18.x): ~2 minutes
- Test job (Node 20.x): ~2 minutes
- Build job: ~3 minutes
- Lint job: ~1 minute
- **Total**: ~8 minutes per push/PR

**Monthly estimate**:
- 20 pushes/PRs per month = 160 minutes
- **Cost**: $0 (well within free tier)

### Vercel

**Free tier**: 100 GB-hours/month, unlimited deployments

**Current usage**:
- Preview deployments: ~50/month
- Production deployments: ~20/month
- **Cost**: $0 (within free tier)

**Total CI/CD Cost**: $0/month 🎉

---

## Quick Reference

| Action | Command |
|--------|---------|
| Run tests locally | `npm test` |
| Watch mode | `npm run test:watch` |
| Coverage report | `npm run test:coverage` |
| Build locally | `npm run build` |
| Start production server | `npm start` |
| View CI runs | https://github.com/techco/as-ai-dashboard/actions |
| View Vercel deployments | https://vercel.com/dashboard |

---

## Related Documentation

- [Testing Strategy](./TESTING_STRATEGY.md) - Test architecture and patterns
- [Data Refresh Process](./DATA_REFRESH.md) - How to update dashboard data
- [Architecture Decisions](../architecture/) - ADR documents

---

**Questions?** Ask in #as-ai-dev Slack channel or check GitHub Actions logs.
