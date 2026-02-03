# M365 Copilot Artifacts Calculation - Data Source Analysis

**Date**: December 31, 2024
**Analyzed By**: Claude Code
**Issue**: Verify that M365 Copilot "artifacts" calculation only includes Word, Excel, PowerPoint prompts

---

## Executive Summary

**FINDING**: The current artifacts calculation (1,641 artifacts from ~8,205 prompts in December) **INCLUDES ALL M365 COPILOT APPS**, not just Word, Excel, and PowerPoint.

**ISSUE**: The 20% conversion rate is being applied to prompts from:
- ✅ Word Copilot (should include)
- ✅ Excel Copilot (should include)
- ✅ PowerPoint Copilot (should include)
- ❌ Teams Copilot (should exclude - conversations, not artifacts)
- ❌ Copilot Chat (work) (should exclude - chat sessions, not saved content)
- ❌ Copilot Chat (web) (should exclude - web research, not artifacts)
- ❌ Outlook Copilot (questionable - email drafts, not traditional artifacts)
- ❌ OneNote Copilot (questionable - notes, not documents)
- ❌ Loop Copilot (questionable - collaborative content)
- ❌ M365 App (mobile app - unclear what constitutes "artifacts")

**IMPACT**: The artifacts count is likely **OVERSTATED** because it includes conversational prompts that don't produce saved content.

---

## Data Source Investigation

### Current Implementation

**File**: `/scripts/parse-copilot-data.js`
**Line**: 1450

```javascript
const totalPrompts = parseInt(row['Prompts submitted for All Apps'] || 0);
```

**Line**: 2994-2996

```javascript
const PROMPT_TO_ARTIFACT_CONVERSION_RATE = 0.20; // 20% industry benchmark
const m365TotalPromptsLatestMonth = m365Monthly[m365Monthly.length - 1].totalPrompts;
const m365ApproximateArtifacts = Math.round(m365TotalPromptsLatestMonth * PROMPT_TO_ARTIFACT_CONVERSION_RATE);
```

### Microsoft CSV Data Structure

**Source File**: `365 CopilotActivityUserDetail - Last 6 months prior to Dec 30.csv`

**Available Columns**:
1. `Prompts submitted for All Apps` ← **Currently used** (includes everything)
2. `Prompts submitted for Copilot Chat (work)` ← Specific count available
3. `Prompts submitted for Copilot Chat (web)` ← Specific count available
4. `Last activity date of [App] Copilot (UTC)` ← Activity dates only, NO prompt counts

**Apps Tracked** (activity dates only):
- Teams Copilot
- Word Copilot
- Excel Copilot
- PowerPoint Copilot
- Outlook Copilot
- OneNote Copilot
- Loop Copilot
- M365 App (mobile)
- Edge
- Copilot Agent

### Sample Data Analysis

| User | Total Prompts | Chat (work) | Chat (web) | Other Apps | Percentage in "Other" |
|------|---------------|-------------|------------|------------|----------------------|
| Courtney Rogan | 139 | 120 | 0 | **19** | **13.7%** |
| Brett Honkanen | 62 | 0 | 0 | **62** | **100%** |
| Jimi Dodge | 266 | 6 | 19 | **241** | **90.6%** |

**Observation**: Users vary significantly in where they use M365 Copilot:
- Some users are 86% in Chat apps (Courtney)
- Some users are 100% in content apps (Brett)
- Most users have a mix

---

## Data Limitation

### What We CAN Do

✅ **Calculate total prompts across all apps**
```javascript
totalPrompts = row['Prompts submitted for All Apps']
```

✅ **Subtract Chat prompts to get "Non-Chat" prompts**
```javascript
nonChatPrompts = totalPrompts - row['Copilot Chat (work)'] - row['Copilot Chat (web)']
```

### What We CANNOT Do

❌ **Calculate prompts for ONLY Word + Excel + PowerPoint**

**Reason**: Microsoft does NOT provide per-app prompt counts (except for the two Chat variants). We only get:
- Activity dates per app (when last used)
- Total prompt count across ALL apps
- Specific counts for Chat (work) and Chat (web) only

Therefore, "Non-Chat prompts" would still include:
- Teams conversations (no artifacts)
- Outlook email drafting (not traditional artifacts)
- OneNote note-taking (debatable)
- Loop collaborative editing (debatable)
- M365 mobile app usage (unknown artifact type)

---

## Recommended Solutions

### Option 1: Exclude Chat Prompts (Partial Fix) ⭐ RECOMMENDED

**Approach**: Subtract Copilot Chat prompts from total to get "content app prompts"

**Implementation**:
```javascript
// Line 1450 - Modify to exclude Chat prompts
const allAppsPrompts = parseInt(row['Prompts submitted for All Apps'] || 0);
const chatWorkPrompts = parseInt(row['Prompts submitted for Copilot Chat (work)'] || 0);
const chatWebPrompts = parseInt(row['Prompts submitted for Copilot Chat (web)'] || 0);
const contentAppPrompts = allAppsPrompts - chatWorkPrompts - chatWebPrompts;
```

**Rationale**:
- Chat prompts definitely don't produce saved artifacts
- Removes the biggest source of non-artifact prompts
- Conservative approach that improves accuracy
- Still includes some non-artifact sources (Teams, Outlook) but closer to reality

**Example Impact** (using Courtney Rogan's data):
- Current: 139 total prompts × 20% = **28 artifacts**
- Revised: 19 content prompts × 20% = **4 artifacts** (7x reduction)

### Option 2: Use App Activity Dates as Proxy (Heuristic)

**Approach**: For each user, determine which apps they've used based on "Last activity date" columns, then adjust conversion rate

**Implementation**:
```javascript
// If user has used Word/Excel/PowerPoint, assume higher conversion
// If user only used Teams/Outlook, assume lower conversion
const hasContentApps = hasActivity('Word') || hasActivity('Excel') || hasActivity('PowerPoint');
const conversionRate = hasContentApps ? 0.20 : 0.05; // Lower for non-content apps
```

**Rationale**:
- Uses available data (activity dates) to infer content creation likelihood
- More sophisticated than simple exclusion
- Still an approximation but better segmented

**Cons**:
- Complex logic
- Activity date doesn't indicate volume of usage
- Still not precise

### Option 3: Add Transparency Label (Current State + Disclosure)

**Approach**: Keep current calculation but add clear labeling about what's included

**Implementation**:
```javascript
artifactsNote: "Industry-backed approximation: 20% of total prompts (ALL APPS: Word, Excel, PowerPoint, Teams, Outlook, Chat) estimated to produce saved content. Note: Includes conversational apps which may not create artifacts."
```

**Rationale**:
- No code changes needed
- Transparent about limitations
- Executives understand the methodology

**Cons**:
- Doesn't improve accuracy
- May overstate artifact creation
- Could mislead decision-making

### Option 4: Request Better Data from Microsoft (Long-term)

**Approach**: Export more detailed M365 Copilot usage reports that break down prompts by app

**Requirements**:
- Admin portal may have more detailed reports
- Microsoft Graph API might provide per-app prompt counts
- Power BI exports could have more granular data

**Timeline**: Research and investigation needed

---

## Current December Data (Latest Month)

From the latest parsing run, here's what we're working with:

```
M365 Copilot Metrics (Latest Month - December):
- Total prompts: ~8,205 (ALL APPS)
- Estimated artifacts: 1,641 (20% of all prompts)
- Active users: 240 users
```

**Breakdown Needed**:
- How many prompts are from Chat (work)?
- How many prompts are from Chat (web)?
- How many prompts are from "content apps" (Word/Excel/PowerPoint/OneNote/Loop)?
- How many prompts are from "communication apps" (Teams/Outlook)?

**Action**: Run analysis on December CSV to get this breakdown

---

## Next Steps

1. **Immediate**: Run analysis on December CSV to quantify the Chat vs Non-Chat split
2. **Decision**: Choose which option to implement (recommend Option 1)
3. **Implementation**: Update `parse-copilot-data.js` with new logic
4. **Validation**: Re-run parser and verify new artifact counts
5. **Documentation**: Update UI labels and notes to reflect methodology change
6. **Communication**: Inform stakeholders of methodology change and rationale

---

## Questions for User

1. **Precision vs Simplicity**: Do you prefer Option 1 (exclude Chat, simpler) or Option 2 (app activity heuristic, more complex)?

2. **Artifact Definition**: What counts as an "artifact" in your organization?
   - Word documents? ✅
   - Excel spreadsheets? ✅
   - PowerPoint presentations? ✅
   - Email drafts (Outlook)? ❓
   - Teams message suggestions? ❌
   - OneNote notes? ❓

3. **Acceptable Error Margin**: Given Microsoft's data limitations, what level of approximation is acceptable?
   - ±10%: Very tight, may require complex heuristics
   - ±20%: Moderate, achievable with Chat exclusion
   - ±30%: Loose, current methodology acceptable with disclaimers

4. **Strategic Context**: How is this metric being used?
   - Executive presentations? (needs high accuracy)
   - Internal tracking? (approximation okay)
   - Budget justification? (needs conservative estimates)

---

## References

- Current implementation: `/scripts/parse-copilot-data.js` lines 1450, 2994-3009
- Data source: `/data/365 CopilotActivityUserDetail - Last 6 months prior to Dec 30.csv`
- UI display: `/app/page.jsx` lines 2141, 2149, 3769, 4330-4335
