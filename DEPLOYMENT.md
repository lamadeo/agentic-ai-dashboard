# Deployment Guide

**Last Updated**: January 8, 2026
**Status**: Automated CI/CD with Vercel

## Overview

This project uses **automated CI/CD** with GitHub Actions and Vercel. Deployments happen automatically when you push code - **no manual deployment required**.

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Pull Request Created                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions CI                                           │
│  1. Run Tests (Node 18.x & 20.x) - 76 tests                │
│  2. Build Next.js app                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    Tests Pass? ✅
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Deploy Preview to Vercel                                    │
│  - Unique URL per PR                                        │
│  - Integration tests run on deployed preview                │
│  - GitHub bot comments with preview URL                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    PR Merged to Main
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions CI (on main)                                │
│  1. Run Tests                                                │
│  2. Build Next.js app                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    Tests Pass? ✅
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Deploy Production to Vercel                                 │
│  - URL: as-ai-dashboard.vercel.app                          │
│  - Automatic production deployment                          │
└─────────────────────────────────────────────────────────────┘
```

---

## For Contributors

### Making Changes (No Manual Deployment!)

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "feat: Your feature description"
   ```

3. **Push to GitHub**:
   ```bash
   git push origin feat/your-feature
   ```

4. **Create a Pull Request** on GitHub

5. **Wait for CI/CD** (automatic):
   - ✅ GitHub Actions runs tests (2-3 minutes)
   - ✅ Tests pass → Vercel deploys preview
   - 🧪 Integration tests run on preview
   - 💬 GitHub bot comments with preview URL

6. **Review your changes** at the preview URL

7. **Merge PR** when ready:
   - ✅ Tests run again on main
   - 🚀 Production automatically deploys!

### Preview URLs

Each PR gets a **unique preview URL** that you can share for review:
- Preview URL format: `https://as-ai-dashboard-<hash>-<org>.vercel.app`
- GitHub bot posts the URL as a comment on your PR
- Preview is updated automatically when you push new commits

### Production URL

After merging to main, production is automatically deployed to:
- **Production**: `https://as-ai-dashboard.vercel.app`

---

## For Repository Admins

### Initial Setup (One-Time)

If you're setting up CI/CD for the first time, follow the comprehensive setup guide:

👉 **[CI/CD Vercel Setup Guide](./docs/guides/CI_CD_VERCEL_SETUP.md)**

This guide covers:
1. Getting Vercel API tokens
2. Adding 5 required GitHub secrets
3. Disabling Vercel automatic deployments
4. Testing the CI/CD pipeline
5. Troubleshooting common issues

### Required GitHub Secrets

The following secrets must be configured in GitHub repository settings:

1. **`VERCEL_TOKEN`** - Vercel API token
2. **`VERCEL_ORG_ID`** - Organization ID
3. **`VERCEL_PROJECT_ID`** - Project ID
4. **`ANTHROPIC_API_KEY`** - For AI insights generation
5. **`SLACK_BOT_TOKEN`** - For sentiment analysis

See [CI_CD_VERCEL_SETUP.md](./docs/guides/CI_CD_VERCEL_SETUP.md) for detailed instructions.

---

## Manual Deployment (Not Recommended)

**⚠️ Note**: Manual deployment is not recommended since automated CI/CD is configured. However, if you need to deploy manually for testing:

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option 2: Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select project: `as-ai-dashboard`
3. Go to **Deployments** tab
4. Click **Redeploy** on the latest deployment

---

## Local Development

To test changes locally before pushing:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the dashboard.

### Run Tests Locally

Before pushing, ensure tests pass:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Build production bundle (test before deploying)
npm run build
```

---

## What Gets Deployed

### Dashboard Features

- ✅ **13 Fully Operational Tabs**: Overview, Briefings, Tool Deep Dives, Comparisons, ROI & Planning, Enablement, Annual Plan
- ✅ **AI-Powered Insights**: 15-24 insights generated using Claude API
- ✅ **Real Data**: 238+ active users tracked across 4 AI tools
- ✅ **Context-Aware Sentiment**: Multi-tool sentiment attribution from Slack feedback
- ✅ **Interactive Charts**: Adoption trends, department heatmaps, comparison visualizations
- ✅ **Portfolio Management**: 5 AI projects with clickable detail views
- ✅ **2026 Annual Plan**: Interactive presentation with full-screen mode

### Environment Variables

Both preview and production deployments include:
- `ANTHROPIC_API_KEY` - For AI insights generation
- `SLACK_BOT_TOKEN` - For sentiment analysis
- `NODE_ENV=production` - Production mode

---

## Deployment Pipeline Details

### CI Jobs (GitHub Actions)

1. **Lint & Type Check** (~20s) - Placeholder for future ESLint/TypeScript
2. **Run Tests** (~40s each) - Matrix testing on Node 18.x and 20.x (76 tests)
3. **Build Next.js App** (~60s) - Production build verification

### CD Jobs (Vercel via GitHub Actions)

#### For Pull Requests:
1. **Deploy Preview** - Creates preview deployment after tests pass
2. **Integration Tests** - Runs 3 smoke tests on deployed preview:
   - Homepage loads (HTTP 200)
   - Dashboard content present
   - Next.js rendering confirmed
3. **Comment PR** - Bot posts preview URL and test results
4. **Cleanup** - Handled by Vercel retention policy (preview deployments deleted after 1 day)

#### For Main Branch:
1. **Deploy Production** - Deploys to production after tests pass
2. **Health Check** - Validates production deployment
3. **Summary** - Posts deployment summary to GitHub Actions

---

## Troubleshooting

### Tests Failing on CI

**Problem**: PR cannot deploy because tests are failing

**Solution**:
```bash
# Run tests locally first
npm test

# Fix any failures
# Commit and push again
```

### Preview Deployment Fails

**Problem**: Vercel deployment fails even though tests pass

**Solution**:
1. Check GitHub Actions logs for error details
2. Verify all required secrets are configured
3. Check Vercel dashboard for deployment errors
4. See [CI_CD_VERCEL_SETUP.md](./docs/guides/CI_CD_VERCEL_SETUP.md) troubleshooting section

### Production Not Deploying After Merge

**Problem**: Merged to main but production didn't update

**Solution**:
1. Check GitHub Actions workflow status
2. Verify workflow file: `.github/workflows/ci-cd.yml` exists
3. Ensure `vercel.json` has `deploymentEnabled: false`
4. Check GitHub Actions logs for errors

### Build Fails

**Problem**: Next.js build fails during deployment

**Solution**:
```bash
# Test build locally
npm run build

# Fix any errors
# Commit and push
```

---

## Cost

**CI/CD Pipeline**: $0/month

- **GitHub Actions**: 2,000 free minutes/month (uses ~8 min per PR)
- **Vercel**: Unlimited deployments on free tier

---

## Monitoring Deployments

### Via GitHub Actions Web UI

1. Go to [Actions tab](https://github.com/absencesoft/as-ai-dashboard/actions)
2. View workflow runs for each PR/push
3. Click on a run to see detailed logs

### Via GitHub CLI

```bash
# Watch current workflow run
gh run watch

# List recent runs
gh run list

# View specific run
gh run view <run-id>

# View failed job logs
gh run view <run-id> --log-failed
```

### Via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select project: `as-ai-dashboard`
3. View deployments and logs

---

## Security Considerations

### Public Access

The dashboard is currently **publicly accessible**. Future enhancement planned:
- Add simple login page with password authentication
- Store password hash in environment variables
- Protect all routes except login page

### API Keys

All API keys are stored as encrypted GitHub secrets and passed to Vercel at deployment time. **Never commit API keys to the repository.**

---

## Related Documentation

- **[CI/CD Setup Guide](./docs/guides/CI_CD_SETUP.md)** - General CI/CD overview
- **[CI/CD Vercel Setup](./docs/guides/CI_CD_VERCEL_SETUP.md)** - Detailed Vercel integration setup
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contributor workflow and guidelines
- **[README.md](./README.md)** - Project overview and documentation

---

**Questions?** Check the troubleshooting section or see [CI_CD_VERCEL_SETUP.md](./docs/guides/CI_CD_VERCEL_SETUP.md).
