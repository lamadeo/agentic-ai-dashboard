# How to Use the Updated Marketplace 2026 Project Analysis

**Document:** MARKETPLACE_2026_PROJECT_ANALYSIS_V2_WITH_OPTIONS.md  
**Purpose:** Portfolio-driven decision support tool for Marketplace adoption planning

---

## What's New in V2

The updated analysis now provides **three distinct adoption options** (A, B, C) that are **directly tied to which AI projects get funded**. This allows you to:

1. **Match Marketplace scope to portfolio decisions** - If only Engineering projects are funded, use Option A (Engineering focus)
2. **Calculate accurate ROI based on actual adoption** - Each option shows WAU targets based on departments impacted by funded projects
3. **Make data-driven funding decisions** - Compare options to see impact of different portfolio scenarios

---

## The Three Options at a Glance

| Option | WAU Target | Departments | Budget | ROI (3-yr) | Best For |
|--------|------------|-------------|--------|------------|----------|
| **A: Conservative** | 100-120 | Eng, Product, BDR, Docs | $315K | 295% | Engineering productivity focus |
| **B: Balanced** | 130-150 | Eng, Product, Sales, Ops, Finance, CS, HR | $385K | 411% | Cross-functional transformation |
| **C: Aggressive** | 150-180 | All 8-9 departments | $415K | 545% | Full AI-first transformation |

---

## How to Select the Right Option

### Step 1: Determine Which AI Projects Will Be Funded

Review your portfolio and check which projects are approved:

**IF funding:** OP-008 only (or OP-008 + OP-002 limited + OP-005)  
**THEN choose:** Option A (Engineering Focus)

**IF funding:** OP-001, OP-002, OP-004, OP-006, OP-007, OP-008  
**THEN choose:** Option B (Balanced) ✅ *RECOMMENDED*

**IF funding:** All or most projects (OP-001 through OP-010)  
**THEN choose:** Option C (Full Transformation)

### Step 2: Validate Department Alignment

Each option shows a detailed table of:
- Which departments are included
- Target adoption % per department
- Required plugins
- Which AI projects drive adoption in that department

**Cross-check:**
- If Sales team will use OP-001 (Deal Intelligence) + OP-004 (Proposals), they need Marketplace plugins → included in Option B/C
- If Finance team will use OP-007 (Forecasting), they need Marketplace prompts → included in Option B/C
- If PS team will use OP-006 (TTV Accelerator), they need playbooks → included in Option B/C

### Step 3: Review Financial Model for Your Option

Each option provides:
- **Detailed ROI calculation** with quarterly breakdown
- **3-year cumulative value** and net profit
- **Payback period** (how long until breakeven)
- **Portfolio acceleration value** (how much time/cost saved on other projects)

### Step 4: Assess Risks and Complexity

**Option A risks:**
- Limited portfolio acceleration (~10 weeks vs 31 weeks in Option C)
- Missed opportunity if cross-functional projects funded later
- Engineering silo (not organizational transformation)

**Option B risks:**
- Requires Plugin Champions in 6-7 departments
- If OP-001 or OP-004 delayed, Sales adoption may stall

**Option C risks:**
- Highest complexity (8-9 departments simultaneously)
- Requires Plugin Champions in ALL departments
- If ANY major project fails, adoption target at risk

---

## Decision Framework Quick Reference

### Choose Option A if:
- [ ] Budget constrained to ~$315K for Marketplace
- [ ] Only Engineering/Product projects funded
- [ ] Want to "prove it" before cross-functional expansion
- [ ] Comfortable with 295% ROI (excellent, not exceptional)

### Choose Option B if: *(RECOMMENDED DEFAULT)*
- [ ] Balanced portfolio (OP-001, OP-002, OP-004, OP-006, OP-007, OP-008)
- [ ] Budget allows ~$385K
- [ ] Want cross-functional transformation
- [ ] Target 411% ROI + $265K portfolio acceleration

### Choose Option C if:
- [ ] Full portfolio funding (most/all projects)
- [ ] "AI-first transformation" is top priority
- [ ] Budget allows $415K
- [ ] Plugin Champions identified in 7-8 departments
- [ ] Target 545% ROI + $322K portfolio acceleration

---

## Using This in Portfolio Planning Sessions

### Scenario Planning Exercise

**Use the document to model:**

1. **Conservative Budget Scenario**
   - "If we only fund OP-001, OP-002, OP-008, what's our Marketplace adoption?"
   - Answer: Option A (100-120 WAU, $315K, 295% ROI)

2. **Balanced Budget Scenario**
   - "If we fund Tier 1 projects across Sales/Eng/Ops/Finance?"
   - Answer: Option B (130-150 WAU, $385K, 411% ROI)

3. **Maximum Impact Scenario**
   - "If we go all-in on AI transformation, what's the return?"
   - Answer: Option C (150-180 WAU, $415K, 545% ROI)

### Portfolio Acceleration Analysis

Each option shows **which projects benefit from Marketplace**:

**Example from Option B:**
- OP-001 saves 5 weeks ($60K) via deal intel prompts
- OP-002 saves 4 weeks ($40K) via knowledge extraction
- OP-004 saves 3 weeks ($30K) via document templates
- **Total: 24 weeks saved, $265K cost avoided**

**This means:** The incremental $70K from Option A to Option B ($315K → $385K) is justified by **$265K in portfolio acceleration** = **3.8x ROI on the increment**.

---

## Key Insights from the Updated Analysis

### Insight 1: WAU Targets Are Portfolio-Dependent

**Original analysis assumed:** 150 WAU across all 225 Claude Enterprise users (67% adoption)

**Updated analysis shows:** 150 WAU requires **Option C funding** (all departments + projects)
- If only Engineering focus (Option A): 100-120 WAU is realistic
- If balanced portfolio (Option B): 130-150 WAU is realistic

### Insight 2: Adoption Requires Project Funding

You **cannot** achieve high Marketplace adoption without funding the underlying AI projects:
- Sales won't use Marketplace if OP-001/OP-004 aren't funded (no use cases)
- Finance won't use Marketplace if OP-007 isn't funded (no forecasting prompts)
- Operations won't scale adoption if OP-002/OP-006 aren't funded (limited value)

### Insight 3: Portfolio Acceleration Is Real Value

The Marketplace doesn't just save engineer time—it **accelerates other projects**:
- Option A: ~10 weeks saved across 3 projects = $100K
- Option B: ~24 weeks saved across 6 projects = $265K
- Option C: ~31 weeks saved across 8 projects = $322K

**This value should be added to the ROI calculation.**

### Insight 4: Department-by-Department Build-Up

Each option provides a **detailed department breakdown** showing:
- Staff count in each department
- Target adoption % (varies by department: Eng 80%, Sales 50%, etc.)
- Target WAU contribution
- Specific Marketplace use cases
- Required plugins
- Which AI project drives adoption

**This allows bottom-up validation** of the WAU target.

---

## Recommended Next Steps

### For Budget Approval Meeting:

1. **Present all three options** side-by-side using the Scenario Comparison Matrix (Section 2.2)

2. **Tie to portfolio decisions:**
   - "If we approve OP-001, OP-002, OP-004, OP-006, OP-007, then we should fund Option B ($385K)"
   - "This gives us 411% ROI + $265K portfolio acceleration"

3. **Highlight flexibility:**
   - "We can start with Option B and adjust quarterly based on adoption"
   - "Q2 Go/No-Go decision allows scaling back to A or expanding to C"

### For Engineering/Department Leaders:

1. **Show department-specific impact** from the detailed tables in each option
   - "Your team (Sales) will have 10-13 active users if we fund OP-001 + OP-004"
   - "These users will need sales-proposal-assistant and deal-intel-prompts plugins"

2. **Identify Plugin Champions:**
   - Use the department tables to identify 1 champion per department
   - Champions will drive adoption, provide feedback, contribute plugins

### For CFO/Finance Review:

1. **Present 3-year cumulative tables** showing net profit for each option
   - Option A: $2.69M net profit
   - Option B: $4.43M net profit
   - Option C: $6.33M net profit

2. **Show sensitivity to portfolio decisions:**
   - "If we fund fewer projects, we automatically drop to lower option"
   - "This protects us from overinvesting in unused infrastructure"

---

## Common Questions & Answers

**Q: Can we start with Option A and upgrade to B/C later?**  
A: Yes, but with some catch-up costs. If you later fund OP-004 (Proposals) but haven't built the Marketplace plugin library, you'll need to backfill prompts/plugins. Better to align from the start.

**Q: What if adoption is slower than projected?**  
A: The Q2 Go/No-Go gate protects you. If WAU < 50 by Q2 (vs target 70-90), you scale back to Option A scope or pivot.

**Q: How accurate are the hours saved estimates?**  
A: Based on Engineering survey showing 5-10x gains on specific tasks. We use conservative 2.5-3.5 hrs/week avg to account for variance across users.

**Q: What's the risk of choosing the wrong option?**  
A: Option B (Balanced) is the "safest" because:
- Supports most likely portfolio scenario
- Flexible quarterly adjustment mechanism
- Medium complexity (manageable change management)

**Q: Should we always choose the highest ROI option?**  
A: Not necessarily. Option C has highest ROI (545%) but also highest risk. If you don't have Plugin Champions in all departments, Option C will fail. Better to choose the option that matches your **organizational readiness**.

---

## How to Update This Analysis

If portfolio decisions change during the year, you can update the analysis by:

1. **Add/Remove projects from the "Portfolio Scenario" section** of each option
2. **Adjust department adoption %** based on which projects are funded
3. **Recalculate WAU target** using the department-by-department tables
4. **Recalculate financial model** based on new WAU target
5. **Update portfolio acceleration table** to reflect funded projects only

The structure is designed to be **modular** - you can mix and match components as your portfolio evolves.

---

**Document Version:** V2 (Updated Dec 29, 2025)  
**Replaces:** Original single-target model (150 WAU regardless of portfolio)  
**Key Innovation:** Portfolio-driven adoption model with 3 options tied to project funding decisions
