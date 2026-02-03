# Slack Integration Setup Checklist

**Status**: Waiting for admin installation approval
**App Name**: AI Tools Sentiment Analyzer
**App ID**: A0A6N3M794N
**Created**: January 4, 2026

---

## ✅ Completed Steps

- [x] Created Slack app from JSON manifest
- [x] Configured permissions (4 bot scopes)
- [x] Requested admin installation approval

---

## ⏳ Waiting on Admin

### Admin Tasks:
- [ ] Review and approve app installation
- [ ] Install app to TechCo Inc workspace
- [ ] Share **Bot User OAuth Token** with you (starts with `xoxb-`)
- [ ] Invite bot to 6 channels (or delegate to channel owners)

---

## 📝 Next Steps (After Admin Approval)

### Step 1: Get Bot Token from Admin
Add to `.env` file:
```bash
SLACK_BOT_TOKEN=xoxb-[token-from-admin]
```

### Step 2: Invite Bot to Channels
In each channel, type:
```
/invite @AI Sentiment Bot
```

**Channels needed** (6 total):
- [ ] #claude-code-dev
- [ ] #claude-enterprise
- [ ] #ai-collab
- [ ] #techco-thrv
- [ ] #as-ai-dev
- [ ] #technology

### Step 3: Get Channel IDs
Run this script (after bot token configured):
```bash
node scripts/get-channel-ids.js
```

Or manually:
1. Open each channel in Slack
2. Click channel name → View channel details
3. Scroll to bottom → Copy Channel ID
4. Add to `.env` file

### Step 4: Configure .env
Complete `.env` configuration:
```bash
# Slack Bot Token (from admin)
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx

# Channel IDs (from step 3)
SLACK_CHANNEL_CLAUDE_CODE_DEV=C01234567
SLACK_CHANNEL_CLAUDE_ENTERPRISE=C01234568
SLACK_CHANNEL_AI_COLLAB=C01234569
SLACK_CHANNEL_TECHCO_THRV=C0123456A
SLACK_CHANNEL_AS_AI_DEV=C0123456B
SLACK_CHANNEL_TECHNOLOGY=C0123456C

# Optional: Days back to fetch (default: 30)
SLACK_DAYS_BACK=30
```

### Step 5: Test Slack Integration
```bash
# Test connection and message fetching
node scripts/parse-slack-sentiment.js

# Expected: Fetches real messages from 6 channels
```

### Step 6: Run Full Pipeline
```bash
# Parse all data + analyze sentiment
npm run refresh

# Expected: Analyzes sentiment with Claude API, generates perceived value scores
```

### Step 7: Verify Dashboard
```bash
# Start dev server
npm run dev

# Open: http://localhost:3000
# Navigate to: 💎 Value → Perceived Value
# Verify: Real data from your team (not sample data)
```

---

## 🔍 How to Verify Real Data

Once pipeline runs successfully, check:

1. **Last Updated Date**: Should show today's date (not Dec 23, 2025)
2. **Quote Authors**: Should be real TechCo Inc employees (not "Sarah Chen", "Marcus Williams")
3. **Source Breakdown**: Should show Slack as primary source with recent message count
4. **Sentiment Scores**: May differ from sample data (87, 72, 65, 58)

---

## 🆘 Troubleshooting

### Bot Token Not Working
- Verify token starts with `xoxb-`
- Check token copied correctly (no extra spaces)
- Confirm admin installed app (not just created it)

### Channel Access Issues
- Error: `channel_not_found` → Wrong channel ID
- Error: `not_in_channel` → Bot not invited to channel
- Solution: Re-invite bot with `/invite @AI Sentiment Bot`

### No Messages Found
- Check channels have recent AI tool discussions
- Increase `SLACK_DAYS_BACK=90` to fetch older messages
- Verify bot has `channels:history` permission

---

## 📊 Expected Results

**First Run** (30 days of history):
- Messages fetched: ~60-200 (depends on channel activity)
- Analysis time: ~30-90 seconds
- Sentiment scores: Will reflect actual team sentiment
- Cost: ~$0.10-0.30 (Claude API for analysis)

**Subsequent Runs** (delta mode):
- Only new messages since last run
- Much faster (only analyze new data)
- Incremental updates to scores

---

## ✅ Success Criteria

Ready for production when:
- [ ] Bot token configured in `.env`
- [ ] Bot invited to all 6 channels
- [ ] Channel IDs configured
- [ ] `node scripts/parse-slack-sentiment.js` runs successfully
- [ ] `npm run refresh` completes without errors
- [ ] Dashboard shows real data (not sample)
- [ ] Last updated shows current date
- [ ] Quotes are from real employees

---

**Admin Contact**: [Name of Slack admin helping with installation]
**Next Check**: [When you expect admin approval]

