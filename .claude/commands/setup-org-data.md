You are an expert at setting up organizational data with proper email mapping for this AI Dashboard project. This command runs the modular email mapping script that ensures 100% email coverage from org chart through department mapping validation.

---

## Workflow Overview

This command runs: `node scripts/setup-org-email-mapping.js`

The script orchestrates a complete org data setup:
1. Load org chart and Claude Enterprise users
2. Auto-match emails using name similarity + email pattern variants
3. Interactive resolution of unmatched users
4. Generate and update EMAIL_ALIAS_MAP in scripts/parse-hierarchy.js
5. Validate 100% email coverage
6. Provide next steps for data refresh

**Architecture**: Uses modular components:
- `scripts/modules/email-mapper.js` - Reusable matching logic (DRY)
- `scripts/setup-org-email-mapping.js` - Interactive CLI orchestrator
- Follows existing pipeline architecture patterns

---

## Step 1: Prerequisites Check

Check that required files exist:
- ✅ Org chart: `data/techco_org_chart.json`
- ✅ Claude Enterprise seats: `data/claude_enterprise_seats.json`

If org chart doesn't exist:
- Run `/generate-org-chart` first
- Wait for completion
- Then retry this command

If seats file doesn't exist:
- Run `/update-claude-seats` first
- Wait for completion
- Then retry this command

---

## Step 2: Run the Email Mapping Script

Execute the modular email mapping script:

```bash
node scripts/setup-org-email-mapping.js
```

**The script will:**
1. Load org chart (258 employees with generated emails)
2. Load Claude Enterprise users (117 users with real emails)
3. Auto-match using:
   - Direct email match
   - Email pattern variants ({f}{lastname}, {first}.{last}, etc.)
   - Name similarity (Levenshtein distance, 80% threshold)
4. Display auto-matching results (coverage percentage)
5. **Interactive resolution** for unmatched users:
   - Shows potential matches with similarity scores
   - User selects match or skips
   - Handles edge cases (same names, nicknames, etc.)
6. Generate EMAIL_ALIAS_MAP code with all mappings
7. Update `scripts/parse-hierarchy.js` with new aliases
8. Validate 100% coverage
9. Display summary and next steps

**Expected output:**
- Auto-match coverage: ~60-80% (varies by name patterns)
- Interactive resolution: 20-40% (manual matching)
- Final coverage: 100% required

---

## Step 3: Review Script Output

After the script completes, review the summary:

```
✅ Setup Complete! 🎉

📊 Final Results:
   Claude Enterprise Users: 115
   Auto-matched: 68
   Manually resolved: 45
   Skipped: 2
   EMAIL_ALIAS_MAP: 115 total aliases

📁 Files Updated:
   ✅ scripts/parse-hierarchy.js
      └─ EMAIL_ALIAS_MAP expanded (103 new aliases)

🎯 Next Steps:
   1. Run data refresh to update expansion analysis
   2. Verify expansion opportunities show correct totals
   3. Check Phase 2 Rollout Tracker for accurate counts
```

---

## Step 4: Run Data Refresh

After EMAIL_ALIAS_MAP is updated, run data refresh:

```bash
npm run refresh
```

Wait for completion (~2-3 minutes)

---

## Step 5: Verify Expansion Data

Check that expansion analysis now shows correct numbers:

```bash
# Check total users in expansion opportunities
jq '[.expansion.opportunities[].currentUsers] | add' app/ai-tools-data.json
```

**Expected results:**
- Total users: 115 (was 94 before)
- Premium: 41 (was 31 before)
- Standard: 74 (was 63 before)

**Verification checklist:**
- [ ] Expansion opportunities show 115 users
- [ ] Premium/Standard breakdown: 41/74
- [ ] All 16 departments have user counts
- [ ] Phase 2 Rollout Tracker shows correct remaining seats
- [ ] No "Unknown" department (except intentionally skipped users)

---

## Step 6: Summary Report

Provide summary to user:

```
✅ Org Data Setup Complete

📊 Email Mapping Results:
   • Coverage: 100% (115/115 users matched)
   • Auto-matched: X users via pattern/similarity
   • Manually resolved: Y users interactively
   • Skipped: Z users (not in org chart)

📁 Files Updated:
   • scripts/parse-hierarchy.js (EMAIL_ALIAS_MAP: 12 → 115 aliases)

📈 Expansion Data Verified:
   • Before: 94 users (82% unmatched)
   • After: 115 users (100% matched)
   • Premium: 41, Standard: 74 ✓

🎯 Dashboard Ready:
   • Expansion ROI tab now shows accurate data
   • Phase 2 Rollout Tracker has correct counts
   • Department breakdowns complete

💡 Maintenance:
   • Re-run when new employees join
   • Re-run after Claude Enterprise license changes
   • Re-run if "Unknown" departments appear
```

**Do NOT repeat entire file contents - just confirm success.**

---

## Error Handling

### Error: Org Chart Not Found
```
❌ Org chart not found at: data/techco_org_chart.json
   Run /generate-org-chart first to create the org chart
```

**Solution**: Run `/generate-org-chart` first

### Error: Claude Enterprise Seats Not Found
```
❌ Claude Enterprise seats file not found
   Run /update-claude-seats first to import seat data
```

**Solution**: Run `/update-claude-seats` first

### Error: Validation Failed (<100% coverage)
```
❌ VALIDATION FAILED: Not all users matched
   Re-run this script to resolve remaining users
```

**Solution**: Script will show unmatched users. Re-run and resolve them interactively.

### Error: Email Alias Map Update Failed
```
❌ Failed to update EMAIL_ALIAS_MAP
```

**Solution**: Check file permissions on `scripts/parse-hierarchy.js`. May need manual edit.

---

## Special Cases

### Case 1: User Skipped (Not in Org Chart)
- Expected for contractors/temps not in HR system
- Expected for brand new hires not yet added to org chart
- These users won't appear in expansion opportunities (correct behavior)
- Add to org chart if they should be tracked

### Case 2: Multiple Manual Resolutions
- Some names are significantly different (married names, nicknames)
- Script shows top 3 potential matches with similarity scores
- User selects best match interactively
- All selections are validated in Step 6

### Case 3: Re-running After Partial Completion
- Script preserves existing aliases
- Only adds new aliases for new users
- Safe to re-run multiple times
- Idempotent operation

---

## Architecture Notes

**Modular Design:**
- `scripts/modules/email-mapper.js` - Core reusable logic (pure functions)
  - `matchEmailsByName()` - Auto-matching algorithm
  - `calculateNameSimilarity()` - Levenshtein distance
  - `generateEmailVariants()` - Pattern generation
  - `validateEmailCoverage()` - Coverage validation
  - `generateAliasMapCode()` - Code generation
  - `updateAliasMapInFile()` - File updating

- `scripts/setup-org-email-mapping.js` - Interactive CLI orchestrator
  - Uses email-mapper module
  - Handles user interaction
  - Coordinates workflow steps

**Benefits:**
- ✅ No code duplication (DRY)
- ✅ Follows pipeline architecture patterns
- ✅ Reusable across other scripts
- ✅ Testable components
- ✅ Single responsibility per module

**Integration Points:**
- Can be used by pipeline-orchestrator for validation
- Can be used by other ingestors
- Can be extended for other email matching needs

---

## File Paths

**Always use these exact paths:**
- Org chart: `data/techco_org_chart.json`
- Claude Enterprise seats: `data/claude_enterprise_seats.json`
- Parse hierarchy script: `scripts/parse-hierarchy.js`
- Email mapper module: `scripts/modules/email-mapper.js`
- Setup script: `scripts/setup-org-email-mapping.js`
- Generated dashboard data: `app/ai-tools-data.json`

---

## Notes

- This workflow ensures the fundamental data integrity of the entire dashboard
- Without proper email → department mapping, all expansion analysis is wrong
- 100% coverage is mandatory - no exceptions
- This process should be run:
  - Initially when setting up the dashboard
  - Monthly or when org structure changes significantly
  - After adding/removing Claude Enterprise licenses
  - When you notice "Unknown" departments or missing users

This is the foundation for accurate dashboard metrics.
