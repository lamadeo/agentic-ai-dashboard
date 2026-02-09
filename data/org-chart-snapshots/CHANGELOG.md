# Org Chart Change History

This file tracks significant organizational changes over time based on org chart snapshots.

## How to Use

Run comparison between snapshots to generate change reports:

```bash
node scripts/manage-org-chart-snapshot.js compare YYYY-MM-DD YYYY-MM-DD
```

Or use the dedicated comparison script directly:

```bash
node scripts/compare-org-charts.js YYYY-MM-DD YYYY-MM-DD
```

---

## 2026-01-21 (Pending - Latest Update)

**Snapshot Date:** 2026-01-21
**Total Employees:** 258 (+5 from Dec 2025)
**Growth Rate:** +1.98%

### Changes
- ⏳ Pending: Run comparison to see detailed changes
- Use: `node scripts/manage-org-chart-snapshot.js compare 2025-12-12 2026-01-21`

---

## 2025-12-12 (Baseline Snapshot)

**Snapshot Date:** 2025-12-12
**Total Employees:** 253
**Growth Rate:** Baseline

### Notes
- This is the baseline snapshot for comparison
- Organization structure established as of December 12, 2025
- Includes all full-time employees and contingent workers

---

## Snapshot Management Commands

### Save a New Snapshot
```bash
node scripts/manage-org-chart-snapshot.js save YYYY-MM-DD
```

### List All Snapshots
```bash
node scripts/manage-org-chart-snapshot.js list
```

### Compare Two Snapshots
```bash
node scripts/manage-org-chart-snapshot.js compare <old-date> <new-date>
```

### View Latest Snapshot
```bash
node scripts/manage-org-chart-snapshot.js latest
```

---

## Change Categories

Changes are tracked in these categories:

- **Added:** New employees joining the organization
- **Removed:** Employees leaving the organization
- **Title Changes:** Promotions, role changes, or title updates
- **Reporting Changes:** Changes in reporting structure (new manager)
- **Department Transfers:** Moves between departments
- **Employment Type Changes:** Conversion between FTE and contingent

---

## Comparison Report Location

Detailed JSON comparison reports are saved to:
```
data/org-chart-snapshots/comparison_<old-date>_to_<new-date>.json
```

These reports contain:
- Summary metrics (total changes, growth rate)
- Detailed lists of added/removed employees
- Title and reporting structure changes
- Contingent worker statistics

---

## Best Practices

1. **Take snapshots regularly** (monthly recommended)
2. **Run comparisons after each snapshot** to document changes
3. **Update this CHANGELOG** with notable changes and insights
4. **Review trends** quarterly to understand growth patterns
5. **Archive old snapshots** (keep at least 12 months of history)

---

## Future Enhancements

Potential additions to the snapshot system:

- [ ] Automated snapshot creation on schedule
- [ ] Department-level growth tracking
- [ ] Attrition rate calculations
- [ ] Visualization of org structure changes
- [ ] Integration with HRIS systems
- [ ] Slack notifications for significant changes
