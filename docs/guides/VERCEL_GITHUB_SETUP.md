# Vercel & GitHub Setup Guide

Complete guide for linking the Agentic AI Dashboard to Vercel with GitHub Actions CI/CD.

## Overview

This guide walks you through:
1. Getting Vercel credentials (token, org ID, project ID)
2. Configuring GitHub Secrets for CI/CD pipeline
3. Linking Vercel project to GitHub repository
4. Testing preview and production deployments

## Prerequisites

- GitHub repository: `lamadeo/agentic-ai-dashboard` (created ✅)
- Vercel account with project created
- Anthropic API key for Claude insights

---

## Step 1: Get Vercel Token

1. Go to: https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Token settings:
   - **Name**: `agentic-ai-dashboard-github-actions`
   - **Scope**: `Full Account`
4. Click **"Create"**
5. **⚠️ Copy the token immediately** (you won't see it again!)

---

## Step 2: Get Vercel Project IDs

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your Vercel project (select from list)
vercel link

# Get your project details
vercel project ls

# The output will show:
# - Project Name
# - Project ID (prj_xxxxxxxxxxxxx)
# - Org/Team ID
```

### Option B: Manual from Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your project: `agentic-ai-dashboard`
3. Go to **Settings → General**
4. Copy:
   - **Project ID**: Found under "Project ID" section
   - **Team/Org ID**: Found in URL or Settings

---

## Step 3: Configure GitHub Secrets

Go to: https://github.com/lamadeo/agentic-ai-dashboard/settings/secrets/actions

Click **"New repository secret"** for each:

### Required Secrets (Tier 1):

1. **VERCEL_TOKEN**
   - Value: `[Token from Step 1]`
   - Purpose: Authenticate GitHub Actions with Vercel

2. **VERCEL_ORG_ID**
   - Value: `[Your Vercel team/org ID]`
   - Purpose: Identify your Vercel organization

3. **VERCEL_PROJECT_ID**
   - Value: `[Your project ID from Step 2]`
   - Purpose: Identify the specific project to deploy

4. **ANTHROPIC_API_KEY**
   - Value: `sk-ant-api03-...`
   - Get from: https://console.anthropic.com/
   - Purpose: Generate AI-powered insights

5. **TEMP_PWD_HASH**
   - Value: `$2b$10$W7xQHvK8xJ5F4YvN9QZ8ZeK7xY5F8ZvN9QZ8ZeK7xY5F8ZvN9QZ8Ze`
   - Purpose: Password hash for dashboard authentication
   - Note: This is the hash for `thefutureisagentic`

6. **TEMP_PWD**
   - Value: `thefutureisagentic`
   - Purpose: Plain text password for integration tests
   - Note: Used by automated tests to verify auth flow

### Optional Secrets (Tier 2):

7. **SLACK_BOT_TOKEN**
   - Value: `xoxb-...`
   - Purpose: Enable real-time sentiment analysis from Slack
   - Only required if you want the Perceived Value tab features

---

## Step 4: Link Vercel Project to GitHub

1. Go to: https://vercel.com/dashboard
2. Click on your project: `agentic-ai-dashboard`
3. Go to **Settings → Git**
4. Click **"Connect Git Repository"**
5. Select GitHub as provider
6. Choose repository: `lamadeo/agentic-ai-dashboard`
7. **⚠️ Important**: Under **"Production Branch"**, set to `main`
8. **⚠️ Critical**: Disable **"Automatic Deployments"**
   - Reason: GitHub Actions will handle all deployments
   - This prevents duplicate deployments

---

## Step 5: Configure Vercel Environment Variables

Go to: **Project Settings → Environment Variables**

Add these variables for **Production** and **Preview** environments:

### Required Variables:

1. **ANTHROPIC_API_KEY**
   - Value: `[Same as GitHub secret]`
   - Environments: ✅ Production, ✅ Preview
   - Purpose: AI insights generation

2. **TEMP_PWD_HASH**
   - Value: `[Same as GitHub secret]`
   - Environments: ✅ Production, ✅ Preview
   - Purpose: Dashboard authentication

### Optional Variables (Tier 2):

3. **SLACK_BOT_TOKEN**
   - Value: `[Same as GitHub secret]`
   - Environments: ✅ Production, ✅ Preview
   - Purpose: Sentiment analysis pipeline

### Optional Variables (Tier 3):

4. **CONFLUENCE_BASE_URL**
   - Value: `https://yourcompany.atlassian.net`
   - Environments: ✅ Production, ✅ Preview

5. **CONFLUENCE_USERNAME**
   - Value: `your-email@company.com`
   - Environments: ✅ Production, ✅ Preview

6. **CONFLUENCE_API_TOKEN**
   - Value: `[Your Confluence API token]`
   - Environments: ✅ Production, ✅ Preview

---

## Step 6: Verify Build Settings

In Vercel **Project Settings → Build & Development Settings**:

Verify these settings:

- **Framework Preset**: `Next.js`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`
- **Node.js Version**: `20.x`
- **Root Directory**: `.` (leave empty)

---

## Step 7: Test CI/CD Pipeline

### Create Test PR

```bash
# Create test branch
git checkout -b test/ci-cd-setup

# Make a small change
echo "\n<!-- Testing CI/CD pipeline -->" >> README.md

# Commit and push
git add README.md
git commit -m "test: Verify CI/CD pipeline setup"
git push origin test/ci-cd-setup
```

### Create Pull Request

1. Go to: https://github.com/lamadeo/agentic-ai-dashboard/pulls
2. Click **"New pull request"**
3. Base: `main` ← Compare: `test/ci-cd-setup`
4. Click **"Create pull request"**
5. Title: `Test: Verify CI/CD Pipeline`

### Watch Pipeline Execute

The pipeline will automatically:

1. **Run Tests** (76 tests on Node 18.x and 20.x)
   - Unit tests with Jest
   - Component tests with React Testing Library
   - Coverage report generation

2. **Build Application**
   - Next.js production build
   - Static analysis
   - Bundle size check

3. **Deploy to Preview**
   - Create preview deployment on Vercel
   - Get unique preview URL

4. **Run Integration Tests**
   - Wait for deployment to be ready
   - Test authentication flow
   - Verify dashboard loads
   - Check content rendering

5. **Post PR Comment**
   - Preview URL
   - Test results
   - Environment status

### Verify Success

Check that:
- ✅ All tests pass (76/76)
- ✅ Build succeeds
- ✅ Preview URL is posted as PR comment
- ✅ Integration tests pass
- ✅ Preview site is accessible
- ✅ Can login with `thefutureisagentic`
- ✅ Dashboard loads with all 15 tabs

### Clean Up Test PR

If everything works:
```bash
# Go back to main branch
git checkout main

# Delete test branch
git branch -D test/ci-cd-setup

# Delete remote branch
git push origin --delete test/ci-cd-setup

# Close PR on GitHub (don't merge)
```

---

## Step 8: Test Production Deployment

### Trigger Production Deploy

```bash
# Make sure you're on main branch
git checkout main

# Make a small change (e.g., add deployment badge to README)
# This will trigger production deployment

git add .
git commit -m "docs: Add CI/CD deployment status"
git push origin main
```

### Watch Production Pipeline

The pipeline will:
1. Run all tests
2. Build application
3. Deploy to Vercel Production
4. Run health checks
5. Post deployment summary

### Verify Production

1. Go to Actions tab: https://github.com/lamadeo/agentic-ai-dashboard/actions
2. Click on latest "CI/CD - Tests & Deploy" workflow
3. Verify all jobs succeeded:
   - ✅ test
   - ✅ build
   - ✅ deploy-production
4. Check production URL from workflow summary
5. Access production site
6. Login with password
7. Test all 15 tabs
8. Test dark/light mode toggle

---

## Troubleshooting

### Tests Fail

**Check:**
- All dependencies installed correctly
- No breaking changes in code
- Environment variables set in Vercel

**Fix:**
```bash
npm ci
npm test
```

### Build Fails

**Check:**
- Next.js configuration
- No TypeScript errors
- All imports resolve

**Fix:**
```bash
npm run build
```

### Deployment Fails

**Check:**
- GitHub secrets are set correctly
- Vercel token has correct permissions
- Org ID and Project ID match your Vercel project
- Automatic deployments disabled in Vercel

**Fix:**
1. Verify secrets at: https://github.com/lamadeo/agentic-ai-dashboard/settings/secrets/actions
2. Re-create Vercel token if needed
3. Check Vercel project settings

### Preview URL Not Posted

**Check:**
- GitHub Actions has permissions to comment on PRs
- Workflow completed successfully
- No errors in `integration-test-preview` job

**Fix:**
1. Check workflow logs
2. Verify GitHub token permissions
3. Re-run workflow

### Integration Tests Fail

**Check:**
- Preview deployment is live
- `TEMP_PWD` secret matches `TEMP_PWD_HASH`
- Environment variables set in Vercel

**Fix:**
1. Verify password hash matches password
2. Check Vercel environment variables
3. Test login manually on preview URL

---

## Success Criteria

When everything is working, you should have:

### CI/CD Pipeline:
- ✅ Tests run automatically on all PRs
- ✅ Build verification on all PRs
- ✅ Preview deployments for every PR
- ✅ Integration tests on preview deployments
- ✅ PR comments with deployment status
- ✅ Production deployments on main branch pushes
- ✅ Health checks after production deploy

### Vercel Integration:
- ✅ Project linked to GitHub repo
- ✅ Environment variables configured
- ✅ Build settings correct
- ✅ Automatic deployments disabled

### GitHub Configuration:
- ✅ All secrets configured
- ✅ Workflow permissions set
- ✅ Branch protection rules (optional)

### Dashboard:
- ✅ Production site live and accessible
- ✅ Authentication works
- ✅ All 15 tabs functional
- ✅ Dark/light mode works
- ✅ AI insights display correctly
- ✅ Charts render properly

---

## Next Steps

After successful CI/CD setup:

1. **Enable Branch Protection** (Optional but recommended)
   - Go to: Settings → Branches → Add rule
   - Branch name pattern: `main`
   - Require status checks: ✅ test, ✅ build
   - Require PR reviews: 1 approval

2. **Set Up Notifications** (Optional)
   - Configure Slack/Teams notifications for deployments
   - Set up email alerts for failures

3. **Monitor Deployments**
   - Check Vercel Analytics
   - Monitor error logs
   - Track performance metrics

4. **Regular Updates**
   - Keep dependencies updated
   - Review security alerts
   - Update documentation

---

## Additional Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Vercel Deployment Docs**: https://vercel.com/docs/deployments/git
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **CI/CD Best Practices**: `/docs/guides/CI_CD_SETUP.md`

---

## Support

If you encounter issues:

1. Check workflow logs: https://github.com/lamadeo/agentic-ai-dashboard/actions
2. Review Vercel deployment logs: https://vercel.com/dashboard
3. Open issue: https://github.com/lamadeo/agentic-ai-dashboard/issues
4. Email: luis.amadeo@gmail.com
