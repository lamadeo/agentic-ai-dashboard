# Data Anonymization Rollback Plan
**Created**: February 4, 2026
**Feature Branch**: `feat/anonymize-data-for-open-source`

## Quick Rollback Options

### Option 1: Restore Working Dashboard Files (FASTEST - 30 seconds)
**Use when**: Dashboard stops working after data refresh

```bash
# Restore the working dashboard JSON files
cp backups/app-backup-working-20260204-124822/*.json app/

# Verify dashboard works
npm run dev
```

**What this restores**:
- ✅ Dashboard will work immediately
- ✅ All 15 tabs functional
- ⚠️ Data still shows some AbsenceSoft references (but it works!)

---

### Option 2: Restore Original /data/ Directory (1-2 minutes)
**Use when**: Need to go back to original AbsenceSoft data

```bash
# Replace /data/ with original AbsenceSoft data
rm -rf data/
cp -r data-original/ data/

# Run data refresh with original data
npm run refresh

# Verify dashboard works
npm run dev
```

**What this restores**:
- ✅ Original AbsenceSoft data
- ✅ Dashboard regenerated from source
- ⚠️ Back to company data (not anonymized)

---

### Option 3: Abandon Feature Branch (SAFEST - instant)
**Use when**: Want to completely abandon anonymization work

```bash
# Switch back to main (production is safe)
git checkout main

# Delete feature branch
git branch -D feat/anonymize-data-for-open-source

# Verify production still works
npm run dev
```

**What this restores**:
- ✅ Back to exact production state
- ✅ No changes made to main branch
- ✅ Production deployment untouched

---

### Option 4: Full Rollback with Clean Slate (5 minutes)
**Use when**: Want to retry anonymization from scratch

```bash
# 1. Switch to main
git checkout main

# 2. Delete feature branch
git branch -D feat/anonymize-data-for-open-source

# 3. Restore original data
rm -rf data/
cp -r data-original/ data/

# 4. Restore working dashboard files
cp backups/app-backup-working-20260204-124822/*.json app/

# 5. Clean up anonymization artifacts
rm -rf data-anonymized/
rm -rf data-test-anonymized/
rm scripts/anonymize-data-safe.sh

# 6. Verify everything works
npm run dev
```

**What this restores**:
- ✅ Complete clean slate
- ✅ All anonymization work removed
- ✅ Can start fresh if needed

---

## What's Protected

1. **main branch**: UNTOUCHED - production deployment safe
2. **app/ai-*.json backups**: Working dashboard files saved in `backups/app-backup-working-20260204-124822/`
3. **Original data**: Preserved in `data-original/` (86 files)
4. **Anonymized data**: Available in `data-anonymized/` (86 files, clean)

## What Can Be Lost

⚠️ **ONLY on this feature branch**:
- Uncommitted changes to feature branch
- New anonymization script `scripts/anonymize-data-safe.sh` (not on main)
- `data-anonymized/` directory (not committed)

## Recovery Priority

1. **First**: Dashboard must work → Use Option 1
2. **Second**: Data must be correct → Use Option 2
3. **Third**: Clean up and retry → Use Option 4
4. **Last resort**: Abandon entirely → Use Option 3

---

## Test Before Committing

Before merging to main:
1. ✅ Dashboard loads without errors
2. ✅ All 15 tabs render correctly
3. ✅ AI insights generated successfully
4. ✅ No AbsenceSoft references in UI
5. ✅ Preview deployment works
6. ✅ Login with password works

Only merge to main after ALL tests pass.
