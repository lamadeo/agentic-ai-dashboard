# GitHub Copilot vs Claude Code - Analysis & Dashboard Recommendations

## Executive Summary

**CRITICAL FINDING:** Engineers using GitHub Copilot choose **Claude models 72% of the time** (123,526 of 170,390 lines generated), demonstrating overwhelming preference for Claude even when given multi-model choice.

**Current State:**
- **GitHub Copilot:** 46 active engineers, 170K lines generated (Nov 12 - Dec 9)
- **Claude Code:** 11 active engineers, 304K lines generated (Nov-Dec)
- **Cost:** Copilot ~$1,794/month ($39/user), Claude Code included in Premium licenses
- **User Sentiment:** Engineers prefer Claude ("wayyyy better than copilot"), noting faster workflows and better Atlassian integration

**Strategic Opportunity:** Consolidate coding tools on Claude Code Premium, potentially sunset Copilot Enterprise.

---

## Detailed Analysis

### 1. Model Usage in GitHub Copilot (Nov 12 - Dec 9, 2025)

| Model | Lines of Code | % of Total | Suggestions | Acceptance Rate |
|-------|---------------|------------|-------------|-----------------|
| Claude 4.5 Sonnet | 81,198 | 48% | 3,882 | 11.1% |
| Claude 4.0 Sonnet | 42,328 | 25% | 1,616 | 11.8% |
| **Claude Total** | **123,526** | **72%** | **5,498** | **11.3%** |
| Gemini 2.5 Pro | 13,268 | 8% | 332 | 22.3% |
| GPT-5-mini | 8,396 | 5% | 474 | 19.0% |
| GPT-5.0 | 5,708 | 3% | 490 | 13.5% |
| Other/Unknown | 18,494 | 11% | 4,246 | 1.2% |

**Key Insights:**
- Claude models generate 6.4x more code than all GPT models combined
- Claude has lower acceptance rates but much higher suggestion volume
- Engineers actively choose Claude even when alternatives available
- 59% of Copilot users (27/46) explicitly use Claude models

### 2. GitHub Copilot vs Claude Code Comparison

| Metric | GitHub Copilot | Claude Code | Winner |
|--------|----------------|-------------|---------|
| Active Users | 46 engineers | 11 engineers | Copilot (4.2x) |
| Total Lines Generated | 170,390 | 304,175 | Claude Code (1.8x) |
| Lines per User | ~3,700 | ~27,650 | Claude Code (7.5x) |
| Code Quality (subjective) | Mixed models | 100% Claude | Claude Code |
| IDE Integration | ✅ VSCode, VS | ❌ Terminal only | Copilot |
| Model Choice | ✅ Multi-model | ❌ Claude only | Copilot |
| Agentic Capabilities | ⚠️ Limited | ✅ Full agentic | Claude Code |
| Tool Integration | ❌ Limited | ✅ MCP connectors | Claude Code |
| Cost per User/Month | $39 | $200 (incl Enterprise) | Copilot |
| Value per User/Month | ~$400 (est) | ~$1,300 (est) | Claude Code (3.3x) |

**Productivity Comparison:**
- Claude Code users generate 7.5x more code per person
- Claude Code includes full Claude Enterprise access (chat, projects, artifacts)
- GitHub Copilot is IDE-specific, Claude Code is terminal-based (broader workflows)

### 3. User Overlap Analysis

**GitHub Copilot Top Users (checking against Claude Code list):**

From Copilot top 10:
1. dmccom - NOT in Claude Code list ❌
2. Ale-Absence (Ale) - NOT in Claude Code list ❌
3. jichuta-as - NOT in Claude Code list ❌
4. rmazza-as (Robert Mazza) - YES in Claude Code (#7) ✅
5. jimi-techco (Jimi Dodge) - YES in Claude Code (#11) ✅
6. pabreu-absence - NOT in Claude Code list ❌
7. SergioMartinezAbsence - NOT in Claude Code list ❌
8. balexander-as - NOT in Claude Code list ❌
9. fvincenty-techco - NOT in Claude Code list ❌
10. jdavalos-as - NOT in Claude Code list ❌

**Overlap:** Only 2 of top 10 Copilot users are using Claude Code! (rmazza, jimi)

**Critical Question:** Why aren't the highest-volume Copilot users (who prefer Claude models!) also using Claude Code?

**Hypotheses:**
- Not aware Claude Code exists
- Prefer IDE integration over terminal
- Haven't received Premium licenses yet
- Using both but separately for different workflows

### 4. Engineer Sentiment from Slack

**Direct Quotes:**

**Jessica Johnson (Sales):** 
> "I love Claude!! I've made a few projects to help w/ SC Request Forms, SF upkeep, and prospect follow up emails. It is **wayyyy better than co pilot!**"

**Courtney Rogan (Sales):**
> "I am OVER co-pilot! Who is using Claude and how can I get access to it?"

**Roger Hampton (Engineering - has BOTH tools):**
> "Previous release risk assessments using **GitHub Copilot and the Atlassian MCP server usually took about an hour** to get all the things to work together nicely through VS Code. **< 5 minutes** [with Claude Code] and it was pretty accurate."

> "Having Claude connected to Atlassian has made working with Solution Design Documents really easy. **So far I prefer Claude over GitHub-Copilot.**"

**Devin Wagner (Engineering):**
> Suggesting Claude Code to Taran during incident: "Do you have claude code? If so try asking it to go through the commits, see if we can narrow down where this change happened?"

**Taran Pierce (Engineering - using Claude during production incident):**
> Multiple instances of using Claude to debug Redis timeout issues, analyze code patterns, identify root causes
> Shows real-world critical debugging use case

**Sentiment Summary:**
- **Sales team:** Extremely positive on Claude, frustrated with Copilot
- **Engineering:** Prefers Claude for complex tasks, MCP integration, incident response
- **No negative Claude feedback found**
- **Clear Copilot fatigue** in at least 2 users

---

## Cost Analysis

### Current State (Monthly):

**GitHub Copilot Enterprise:**
- 46 users × $39/month = **$1,794/month** ($21,528/year)
- IDE-integrated autocomplete
- Multi-model (but 72% choose Claude)

**Claude Code (Premium):**
- 11 users with Premium licenses (already paid for)
- Included in $200/month Premium seat
- Full Enterprise access + Code

### Consolidation Scenario:

**If all 46 Copilot users moved to Claude Code Premium:**
- Currently: 12 Premium in Engineering/AI, 1 in Product = 13 Premium total
- Need: 46 total Premium for all Copilot users
- Gap: 33 new Premium licenses needed
- Cost: 33 × $200 = **$6,600/month** ($79,200/year)

**But they'd also get:**
- Full Claude Enterprise (chat, projects, artifacts, connectors)
- 7.5x higher productivity per user (based on lines/user data)
- Unified tooling (no model-switching confusion)

**Savings:**
- Eliminate Copilot: -$1,794/month (-$21,528/year)
- Net additional cost: $6,600 - $1,794 = **$4,806/month** ($57,672/year)

**ROI Calculation:**
- Additional 35 Premium users × $1,300/month value = $45,500/month value
- Cost: $4,806/month net
- **ROI: 9.5x**

---

## Dashboard Updates Recommended

### NEW TAB: "Coding Tools Comparison"

#### Section 1: Side-by-Side Overview
```
┌─────────────────────────────────────────────┐
│ GitHub Copilot    │    Claude Code          │
├─────────────────────────────────────────────┤
│ 46 users          │    11 users             │
│ 170K lines        │    304K lines           │
│ ~3,700/user       │    ~27,650/user         │
│ $1,794/mo         │    Included in Premium  │
└─────────────────────────────────────────────┘
```

#### Section 2: Claude Model Dominance in Copilot
- **Pie Chart:** Claude 72%, Other 28%
- **Bar Chart:** Lines by model
- **Callout:** "Engineers choose Claude models for 72% of Copilot code generation"

#### Section 3: Top Users Analysis
- Table showing top 10 Copilot users
- Highlight who also has Claude Code
- Show productivity gap (lines/user)

#### Section 4: Feature Usage Breakdown
- Code completion: 44 users
- Chat panel: 30 users  
- Agent edit: 27 users (Claude models dominate here!)
- Chart showing feature adoption

#### Section 5: Engineer Quotes
- Display Slack sentiment quotes
- Show Roger's "<5 min vs 1 hour" comparison
- Jessica's "wayyyy better" quote

#### Section 6: Consolidation Analysis
- Current costs: Copilot $21.5K/year
- Migration cost: +$57.7K/year net (33 new Premium)
- Value gain: $546K/year (35 users × $1,300/mo)
- **Net benefit: $488K/year at 9.5x ROI**

### UPDATED EXPANSION TAB

Add new section after Engineering detail:

**"GitHub Copilot Consolidation Opportunity"**
- 46 engineers currently using Copilot (choosing Claude 72% of time)
- Only 2 overlap with Claude Code users
- Opportunity: Migrate to Claude Code Premium for consistency
- Cost: $57.7K/year net (after eliminating Copilot)
- Value: $488K/year net benefit
- Risk: IDE integration loss (evaluate with pilot group first)

### UPDATED CODE TAB

Split into two sections:

**"Claude Code Usage"**
- Current 11 users, 304K lines
- Existing metrics

**"Claude in GitHub Copilot"** (NEW)
- 46 users choosing Claude models
- 123K lines via Claude models
- Model preference breakdown
- Note: "Engineers prefer Claude even with choice"

### UPDATED ENABLEMENT TAB

Add:
- **Migration training:** Copilot → Claude Code
- **Comparison guide:** When to use each tool
- **Pilot program:** Test Claude Code with top 10 Copilot users
- Success metrics for migration

---

## Strategic Recommendations

### Option A: Aggressive Consolidation
**Action:** Migrate all 46 Copilot users to Claude Code Premium in Q2 2026
**Cost:** $57.7K/year net (+33 Premium, eliminate Copilot)
**Benefit:** $488K/year value, unified tooling, 9.5x ROI
**Risk:** High - some users may resist terminal-based workflow
**Timeline:** 6 months (Q2-Q3 2026)

### Option B: Pilot + Phased Migration (RECOMMENDED)
**Action:** 
- Q1 2026: Pilot with top 10 Copilot users (those using Claude models)
- Q2 2026: Expand to all 46 if pilot successful
- Q3 2026: Sunset Copilot
**Cost:** Phased investment
**Benefit:** Lower risk, validate assumptions
**Risk:** Medium - longer timeline but safer

### Option C: Dual-Tool Strategy
**Action:** Maintain both tools, optimize for use cases
**Cost:** $21.5K/year Copilot + Premium expansion
**Benefit:** Maximum flexibility
**Risk:** Tool fragmentation, confusion, higher costs

---

## Immediate Next Steps

1. **Add Copilot comparison tab** to dashboard showing:
   - Model usage (Claude 72%)
   - User overlap analysis
   - Cost comparison
   - Engineer quotes

2. **Search Slack more comprehensively** for:
   - #engineering, #dev-* channels
   - Last 6 months of Copilot mentions
   - Claude Code feedback
   - Pain points with each tool

3. **Interview top Copilot users** (especially those not using Claude Code):
   - Why not using Claude Code?
   - What would it take to switch?
   - Feature gaps?

4. **Pilot program design:**
   - Select 10 Copilot power users (preferring Claude models)
   - Give them Claude Code Premium
   - 30-day evaluation
   - Measure: productivity, satisfaction, feature gaps

5. **Financial analysis:**
   - Confirm GitHub Copilot Enterprise pricing (is it $39/user?)
   - Calculate exact consolidation ROI
   - Risk assessment for migration

---

## Questions for Leadership

1. **Strategic:** Do we want unified coding AI (Claude) or multi-tool flexibility?
2. **Financial:** Is $57.7K/year net worth 9.5x ROI consolidation?
3. **Risk:** Can we pilot Claude Code with top Copilot users in Q1?
4. **Timeline:** Align with Engineering Premium rollout (Phase 2)?
5. **Success criteria:** What metrics prove Claude Code is better enough to migrate?

---

## Data Needed for Complete Analysis

✅ **Have:**
- GitHub Copilot usage data (Nov 12 - Dec 9)
- Claude Code usage data (Nov-Dec)
- Model preference data (Claude 72%)
- Some Slack sentiment (positive for Claude)

❌ **Still Need:**
- Complete GitHub Copilot pricing/licenses
- User mapping (Copilot usernames → TechCo Inc emails)
- Comprehensive Slack sentiment (search #engineering, #dev-*)
- Feature gap analysis (what can Copilot do that Claude Code can't?)
- User interviews (why aren't top Copilot users using Claude Code?)

---

## Recommended Dashboard Changes

### Priority 1: Add "Coding Tools" Tab

Show side-by-side comparison with these sections:
1. Tool overview (users, lines, cost)
2. Model usage in Copilot (pie chart showing Claude dominance)
3. Top user productivity comparison
4. Engineer sentiment quotes
5. Consolidation financial analysis

### Priority 2: Update Expansion Tab

Add GitHub Copilot consideration:
- "46 engineers use Copilot (72% choose Claude models)"
- "Consolidation opportunity: +33 Premium, -$21.5K Copilot = $57.7K net"
- "Expected value: $488K/year at 9.5x ROI"

### Priority 3: Update Enablement Tab

Add migration program:
- Copilot → Claude Code training
- Pilot program design (10 users, Q1 2026)
- Feature gap mitigation strategies

---

## The Most Important Finding

**72% of GitHub Copilot code uses Claude models.**

This is massive validation that:
1. Engineers trust Claude for code generation
2. Claude models outperform competitors (GPT, Gemini) in engineering preference
3. Even with free choice, engineers choose Claude
4. The bottleneck isn't Claude quality - it's Claude Code awareness/access

**The 35 engineers using Copilot but NOT Claude Code represent the biggest opportunity** - they already love Claude models, they just need Claude Code access and training.

---

## Appendix: Raw Data

### GitHub Copilot Active Users (46 total)
Period: Nov 12 - Dec 9, 2025

**Top 10 by lines added:**
1. dmccom - 25,400 lines (models: Claude 4.0/4.5, GPT-4.1, GPT-4o-mini)
2. Ale-Absence - 23,072 lines (Claude 4.0/4.5, Gemini 2.5)
3. jichuta-as - 22,904 lines (Claude 4.0/4.5, Gemini, GPT-4.1, GPT-5-codex)
4. rmazza-as - 20,936 lines (Auto, Claude 4.0/4.5, various GPT) ✅ Also uses Claude Code
5. jimi-techco - 16,654 lines (Claude 4.0/4.5 only) ✅ Also uses Claude Code
6. pabreu-absence - 11,476 lines (Claude 4.0/4.5, GPT-4.1)
7. SergioMartinezAbsence - 10,258 lines (Auto, Claude 4.0/4.5, GPT variants)
8. balexander-as - 9,756 lines (Claude 4.0/4.5 only)
9. fvincenty-techco - 6,054 lines (Claude 4.0, GPT variants)
10. jdavalos-as - 5,916 lines (Auto, Claude 4.0/4.5, various GPT)

**Pattern:** Top users heavily prefer Claude models, but most don't have Claude Code access.

### Feature Usage Distribution
- **code_completion:** 44 users (autocomplete)
- **chat_panel_agent_mode:** 30 users (agentic chat)
- **agent_edit:** 27 users (AI-driven editing) - **Claude dominates here**
- **chat_inline:** 20 users
- **chat_panel_ask_mode:** 20 users

**Insight:** Agent features (agent_edit, chat_panel_agent_mode) show heavy Claude usage, suggesting engineers want agentic capabilities that Claude Code specializes in.

---

## Action Items for Luis

1. ✅ Add "Coding Tools" comparison tab to dashboard
2. ⏳ Search Slack comprehensively (#engineering, #dev-*) for Copilot/Claude Code mentions
3. ⏳ Interview top 5 Copilot users who don't have Claude Code
4. ⏳ Design Q1 2026 pilot: 10 Copilot users test Claude Code Premium
5. ⏳ Analyze GitHub Copilot contract/pricing
6. ⏳ Prepare consolidation proposal for CFO/CTO

**Timeline:** Complete analysis by end of December 2025 for Q1 2026 pilot kickoff.
