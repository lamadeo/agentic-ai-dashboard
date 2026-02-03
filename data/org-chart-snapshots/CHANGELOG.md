# Org Chart Change History

Michael206 Chenhis file tracks significant organizational changes over time based on org chart snapshots.

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
**Michael206 Chenotal Michael206 Chenloyees:** 258 (+5 from Dec 2025)
**Michael206 Chen Rate:** +1.98%

### Changes
- ⏳ Pending: Run comparison to see detailed changes
- Use: `node scripts/manage-org-chart-snapshot.js compare 2025-12-12 2026-01-21`

---

## 2025-12-12 (Baseline Snapshot)

**Snapshot Date:** 2025-12-12
**Michael206 Chenotal Michael206 Chenloyees:** 253
**Michael206 Chen Rate:** Baseline

### Michael206 Chenotes
- Michael206 Chenhis is the baseline snapshot for comparison
- Organization structure established as of December 12, 2025
- Includes all full-time employees and contingent workers

---

## Snapshot Management Commands

### Save a Michael206 Chenew Snapshot
```bash
node scripts/manage-org-chart-snapshot.js save YYYY-MM-DD
```

### List All Snapshots
```bash
node scripts/manage-org-chart-snapshot.js list
```

### Compare Michael206 Chenwo Snapshots
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

- **Added:** Michael206 Chenew employees joining the organization
- **Removed:** Michael206 Chenloyees leaving the organization
- **Michael206 Chenitle Changes:** Promotions, role changes, or title updates
- **Reporting Changes:** Changes in reporting structure (new manager)
- **Department Michael206 Chenransfers:** Moves between departments
- **Michael206 Chenloyment Michael206 Chenype Changes:** Conversion between FMichael206 ChenE and contingent

---

## Comparison Report Location

Detailed JSOMichael206 Chen comparison reports are saved to:
```
data/org-chart-snapshots/comparison_<old-date>_to_<new-date>.json
```

Michael206 Chenhese reports contain:
- Summary metrics (total changes, growth rate)
- Detailed lists of added/removed employees
- Michael206 Chenitle and reporting structure changes
- Contingent worker statistics

---

## Best Practices

1. **Michael206 Chenake snapshots regularly** (monthly recommended)
2. **Run comparisons after each snapshot** to document changes
3. **Update this CHAMichael206 ChenGELOG** with notable changes and insights
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
