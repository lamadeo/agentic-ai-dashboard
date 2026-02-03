# CI/CD Vercel Integration Setup Guide

**Last Updated**: January 8, 2026
**Status**: Configuration Required

## Overview

This guide configures **CI-gated deployments** where Vercel only deploys AFTER tests pass in GitHub Actions.

### Workflow

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
│  - Unique URL per PR: pr-26-as-ai-dashboard.vercel.app     │
│  - GitHub bot comments with URL                             │
│  - Only 1 preview per PR (old ones cleaned up)             │
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

## Prerequisites

- Vercel account with project deployed
- GitHub repository admin access
- Vercel CLI installed (for getting tokens)

---

## Step 1: Get Vercel Tokens

### 1.1 Get Vercel API Token

**Via Vercel Dashboard**:

1. Go to: https://vercel.com/account/tokens
2. Click **Create Token**
3. Name: `GitHub Actions CI/CD`
4. Scope: `Full Account`
5. Expiration: `No Expiration` (or 1 year)
6. Click **Create**
7. **Copy the token** (shown once!) - Save it somewhere safe

**Token looks like**: `vtok_abc123...xyz789`

### 1.2 Get Vercel Organization ID

**Via Vercel CLI**:

```bash
# Navigate to project directory
cd as-ai-dashboard

# Link to Vercel (if not already)
vercel link

# Get org ID from .vercel/project.json
cat .vercel/project.json | grep orgId
```

**Output**:
```json
{
  "orgId": "team_abc123xyz789",
  "projectId": "prj_def456uvw012"
}
```

**Or via Vercel Dashboard**:
1. Go to: https://vercel.com/account
2. Look at URL: `https://vercel.com/[ORG_ID]/settings`
3. The `[ORG_ID]` part is your Organization ID

**Org ID looks like**: `team_abc123xyz789` or `user_abc123xyz789`

### 1.3 Get Vercel Project ID

**Same as above** - from `.vercel/project.json`:

```bash
cat .vercel/project.json | grep projectId
```

**Output**:
```json
"projectId": "prj_abc123xyz789"
```

**Or via Vercel Dashboard**:
1. Go to project: https://vercel.com/dashboard
2. Click on `as-ai-dashboard`
3. Go to Settings → General
4. Scroll to **Project ID**

**Project ID looks like**: `prj_abc123xyz789`

---

## Step 2: Add GitHub Secrets

### 2.1 Navigate to Repository Secrets

1. Go to: https://github.com/techco/as-ai-dashboard/settings/secrets/actions
2. Click **New repository secret**

### 2.2 Add VERCEL_TOKEN

- **Name**: `VERCEL_TOKEN`
- **Value**: Paste the token from Step 1.1 (starts with `vtok_...`)
- Click **Add secret**

### 2.3 Add VERCEL_ORG_ID

- **Name**: `VERCEL_ORG_ID`
- **Value**: Paste the org ID from Step 1.2 (starts with `team_...` or `user_...`)
- Click **Add secret**

### 2.4 Add VERCEL_PROJECT_ID

- **Name**: `VERCEL_PROJECT_ID`
- **Value**: Paste the project ID from Step 1.3 (starts with `prj_...`)
- Click **Add secret**

### 2.5 Verify Secrets

**Check that you have 3 secrets**:
```
✅ VERCEL_TOKEN       (vtok_...)
✅ VERCEL_ORG_ID      (team_... or user_...)
✅ VERCEL_PROJECT_ID  (prj_...)
```

---

## Step 3: Disable Automatic Vercel Deployments

**Important**: We want GitHub Actions to control when Vercel deploys, not automatic GitHub integration.

### 3.1 Via Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select project: `as-ai-dashboard`
3. Go to **Settings** → **Git**
4. Scroll to **Deploy Hooks**
5. Under **Ignored Build Step**, click **Edit**
6. Set the command to:
   ```bash
   exit 0
   ```
   This tells Vercel to skip automatic deployments from GitHub pushes.

**Alternative method** (Recommended):

Create `vercel.json` in project root:

```json
{
  "github": {
    "silent": true
  },
  "git": {
    "deploymentEnabled": {
      "main": false,
      "*": false
    }
  }
}

### 3.2 Verify Automatic Deployments are Disabled

Push a test commit to a branch and verify:
- ❌ Vercel does NOT automatically deploy
- ✅ GitHub Actions workflow controls deployment

---

## Step 4: Update GitHub Actions Workflow

### 4.1 Remove Old Workflow (Optional)

If you want to completely replace the old workflow:

```bash
# Rename old workflow
mv .github/workflows/ci.yml .github/workflows/ci-old.yml.backup

# Or delete it
rm .github/workflows/ci.yml
```

**The new workflow** (`.github/workflows/ci-cd.yml`) is already created!

### 4.2 Workflow Features

The new `ci-cd.yml` workflow includes:

#### For Pull Requests:
1. **Test job** - Runs 76 tests on Node 18.x & 20.x
2. **Build job** - Verifies Next.js build succeeds
3. **Deploy Preview job** - ONLY runs if tests pass
   - Creates preview deployment to Vercel
   - Comments on PR with preview URL
   - Uses alias: `pr-NUMBER-as-ai-dashboard.vercel.app`
4. **Integration Tests** - Runs smoke tests on deployed preview
5. **Cleanup info** - Notes that cleanup is handled by Vercel retention policy (1-day)

#### For Main Branch (Production):
1. **Test job** - Runs tests on main
2. **Build job** - Verifies build
3. **Deploy Production job** - ONLY runs if tests pass
   - Deploys to production Vercel
   - Posts summary to GitHub Actions

---

## Step 5: Test the Setup

### 5.1 Test Preview Deployment (PR)

```bash
# Create test branch
git checkout -b test/ci-cd-preview-deployment

# Make a small change
echo "# Testing CI-gated preview deployment" >> README.md

# Commit and push
git add README.md
git commit -m "test: Verify CI-gated preview deployment"
git push origin test/ci-cd-preview-deployment

# Create PR on GitHub
gh pr create --title "test: CI-gated preview deployment" --body "Testing new CI/CD workflow"
```

**Expected behavior**:
1. GitHub Actions runs tests (2-3 minutes)
2. Tests pass ✅
3. Vercel preview deployment starts
4. GitHub bot comments with preview URL
5. Preview URL accessible

**Verify**:
- [ ] Tests run before deployment
- [ ] Preview URL works
- [ ] Dashboard loads correctly

### 5.2 Test Production Deployment (Main)

```bash
# Merge the test PR (after preview works)
gh pr merge --squash

# Wait 3-4 minutes

# Check deployments
vercel ls

# Should see new Production deployment!
```

**Expected behavior**:
1. PR merged to main
2. GitHub Actions runs tests
3. Tests pass ✅
4. Production deployment starts automatically
5. Production site updated

**Verify**:
- [ ] Tests run on main branch
- [ ] Production deploys after tests pass
- [ ] Production URL updated

---

## Step 6: Preview Deployment Cleanup

### Automatic Cleanup via Vercel Retention Policy ✅

Preview deployments are automatically cleaned up by Vercel's retention policy.

**Current Configuration**: Preview deployments are deleted after **1 day**

This ensures old previews don't accumulate while keeping recent ones available for review.

### Configuring Vercel Retention Policy

To adjust the retention policy:

1. Go to: https://vercel.com/dashboard
2. Select project: `as-ai-dashboard`
3. Go to **Settings** → **General**
4. Scroll to **Preview Deployment Lifetime**
5. Options:
   - Keep for 7 days
   - Keep for 1 day (current setting)
   - Delete after PR closes

**Recommended**: Keep current 1-day retention for active development.

---

## Troubleshooting

### Problem: "Vercel token is invalid"

**Cause**: Token expired or incorrect

**Solution**:
1. Generate new token: https://vercel.com/account/tokens
2. Update GitHub secret: `VERCEL_TOKEN`
3. Re-run workflow

### Problem: "Could not find project"

**Cause**: Incorrect `VERCEL_PROJECT_ID` or `VERCEL_ORG_ID`

**Solution**:
```bash
# Verify IDs
cat .vercel/project.json

# Update GitHub secrets with correct IDs
```

### Problem: Vercel still auto-deploys

**Cause**: Automatic deployments not disabled

**Solution**:
1. Add `vercel.json` with `deploymentEnabled: false`
2. Or set Ignored Build Step in Vercel dashboard

### Problem: Tests pass but no deployment

**Cause**: Workflow not triggering deployment job

**Solution**:
```bash
# Check workflow file
cat .github/workflows/ci-cd.yml

# Verify job dependencies:
# deploy-preview: needs: [test, build]
# deploy-production: needs: [test, build]
```

---

## Workflow Comparison

### Before (Old Workflow)

```
PR Created
  ↓
GitHub Actions CI (parallel) + Vercel deploys (parallel)
  ↓
Multiple previews pile up
  ↓
PR Merged → No production deploy ❌
```

**Issues**:
- ❌ Vercel deploys even if tests fail
- ❌ Multiple preview deployments per PR
- ❌ No automatic production deployment

### After (New Workflow)

```
PR Created
  ↓
GitHub Actions CI
  ↓
Tests Pass? ✅
  ↓
Vercel preview deploys (one per PR)
  ↓
PR Merged → GitHub Actions CI
  ↓
Tests Pass? ✅
  ↓
Vercel production deploys ✅
```

**Benefits**:
- ✅ Only deploy after tests pass
- ✅ One preview per PR (cleanup old ones)
- ✅ Automatic production deployment
- ✅ Full control via GitHub Actions

---

## Security Considerations

### Token Security

**Best practices**:
- ✅ Store tokens as GitHub Secrets (encrypted)
- ✅ Use token with minimum required scope
- ✅ Rotate tokens every 6-12 months
- ❌ Never commit tokens to repository
- ❌ Never share tokens in Slack/email

### Access Control

**Who can trigger deployments**:
- Anyone who can push to repository (tests must pass)
- Only merged PRs deploy to production
- Branch protection enforces review (optional)

---

## Cost Analysis

### GitHub Actions

**Free tier**: 2,000 minutes/month

**Usage per workflow run**:
- Test (18.x): ~2 minutes
- Test (20.x): ~2 minutes
- Build: ~3 minutes
- Deploy: ~1 minute
- **Total**: ~8 minutes per PR/push

**Monthly estimate**:
- 20 PRs × 8 min = 160 minutes
- 20 main pushes × 8 min = 160 minutes
- **Total**: ~320 minutes/month
- **Cost**: $0 (well within free tier)

### Vercel

**Free tier**: Unlimited deployments

**Usage**:
- ~20 preview deployments/month
- ~20 production deployments/month
- **Cost**: $0 (unlimited on free tier)

**Total CI/CD Cost**: $0/month 🎉

---

## Quick Reference

### GitHub Secrets Required

```
VERCEL_TOKEN         # Vercel API token (vtok_...)
VERCEL_ORG_ID        # Organization ID (team_... or user_...)
VERCEL_PROJECT_ID    # Project ID (prj_...)
```

### Workflow Files

```
.github/workflows/ci-cd.yml    # New CI/CD workflow (use this!)
.github/workflows/ci.yml       # Old workflow (can delete)
```

### Vercel Configuration

```
vercel.json                    # Disable auto-deploy
{
  "git": {
    "deploymentEnabled": false
  }
}
```

### Commands

```bash
# Get Vercel IDs
cat .vercel/project.json

# List deployments
vercel ls

# Test workflow
gh workflow run ci-cd.yml

# Watch workflow
gh run watch
```

---

## Next Steps

1. ✅ Get Vercel tokens (Step 1)
2. ✅ Add GitHub secrets (Step 2)
3. ✅ Disable Vercel auto-deploy (Step 3)
4. ✅ Verify workflow file exists (Step 4)
5. ✅ Test with PR (Step 5.1)
6. ✅ Test production deploy (Step 5.2)
7. ✅ Configure preview cleanup (Step 6)

---

## Related Documentation

- [CI/CD Setup Guide](./CI_CD_SETUP.md) - General CI/CD overview
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contributor workflow
- [GitHub Actions Workflow](../../.github/workflows/ci-cd.yml) - Workflow file

---

**Questions?** Check troubleshooting section or ask in #as-ai-dev Slack channel.
