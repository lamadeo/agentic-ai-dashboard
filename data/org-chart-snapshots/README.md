# Org Chart Snapshots

This directory contains historical snapshots of the organization chart for tracking changes over time.

## 📁 Directory Structure

```
org-chart-snapshots/
├── README.md                                      # This file
├── CHANGELOG.md                                   # Human-readable change history
├── techco_org_chart_YYYY-MM-DD.json         # Snapshot files
└── comparison_<date1>_to_<date2>.json            # Comparison reports
```

## 🎯 Purpose

- **Track organizational growth** over time
- **Document structural changes** (new hires, departures, promotions, transfers)
- **Analyze trends** (department growth, attrition rates, role evolution)
- **Support data-driven decisions** with historical context
- **Maintain compliance** with recordkeeping requirements

## 🔧 Management Tools

### Snapshot Management Script

Central tool for managing snapshots:

```bash
# Save current org chart as a snapshot
node scripts/manage-org-chart-snapshot.js save 2026-01-21

# List all snapshots
node scripts/manage-org-chart-snapshot.js list

# Show latest snapshot info
node scripts/manage-org-chart-snapshot.js latest

# Compare two snapshots
node scripts/manage-org-chart-snapshot.js compare 2025-12-12 2026-01-21

# Show help
node scripts/manage-org-chart-snapshot.js help
```

### Direct Comparison Script

For detailed comparisons:

```bash
# Generate detailed comparison report
node scripts/compare-org-charts.js 2025-12-12 2026-01-21
```

## 📊 Comparison Reports

Comparison reports include:

### Summary Metrics
- Total employee count (old vs new)
- Net change (+/- employees)
- Growth rate (%)
- Contingent worker statistics

### Detailed Changes
- **Added Employees**: New hires with titles and managers
- **Removed Employees**: Departures with previous roles
- **Title Changes**: Promotions and role changes
- **Reporting Changes**: Manager/department transfers

### Output Formats
- **Console**: Formatted text report
- **JSON**: Machine-readable detailed data at `comparison_<old>_to_<new>.json`

## 📝 Workflow

### Monthly Snapshot Process

1. **Generate/Update Org Chart**
   ```bash
   # Use the slash command
   /generate-org-chart

   # Or manually update data/techco_org_chart.json
   ```

2. **Save Snapshot**
   ```bash
   node scripts/manage-org-chart-snapshot.js save $(date +%Y-%m-%d)
   ```

3. **Compare with Previous Month**
   ```bash
   # List snapshots to find previous date
   node scripts/manage-org-chart-snapshot.js list

   # Run comparison
   node scripts/manage-org-chart-snapshot.js compare <prev-date> <curr-date>
   ```

4. **Document Changes**
   - Review comparison report
   - Update `CHANGELOG.md` with notable changes
   - Share insights with leadership if significant

### Ad-Hoc Snapshot

For significant organizational events:

```bash
# Major restructuring
node scripts/manage-org-chart-snapshot.js save 2026-03-15

# Acquisition/merger
node scripts/manage-org-chart-snapshot.js save 2026-06-30

# Fiscal year end
node scripts/manage-org-chart-snapshot.js save 2026-12-31
```

## 📈 Use Cases

### 1. Monthly Executive Reports
```bash
# Compare last month to this month
node scripts/manage-org-chart-snapshot.js compare 2026-01-21 2026-02-21
```

### 2. Quarterly Business Reviews
```bash
# Compare Q1 end to Q2 end
node scripts/manage-org-chart-snapshot.js compare 2026-03-31 2026-06-30
```

### 3. Annual Planning
```bash
# Year-over-year comparison
node scripts/manage-org-chart-snapshot.js compare 2025-12-31 2026-12-31
```

### 4. Department Analysis
```bash
# Extract department-specific data from comparison JSONs
jq '.details.added[] | select(.title | contains("Engineering"))' \
  org-chart-snapshots/comparison_2025-12-12_to_2026-01-21.json
```

## 🔍 Snapshot File Format

Each snapshot follows the standard org chart schema:

```json
{
  "organization": {
    "name": "TechCo Inc, LLC",
    "totalEmployees": 258,
    "lastUpdated": "2026-01-21",
    "ceo": {
      "id": "ceo-id",
      "name": "CEO Name",
      "title": "Chief Executive Officer",
      "directReports": 15,
      "totalTeamSize": 257,
      "reports": [ /* nested hierarchy */ ]
    }
  }
}
```

## 🔒 Best Practices

### Frequency
- **Minimum**: Monthly snapshots
- **Recommended**: Monthly + after major events
- **Maximum**: Weekly (if high turnover)

### Retention
- **Keep**: At least 24 months of history
- **Archive**: Older snapshots to cold storage
- **Never Delete**: Year-end snapshots

### Naming Convention
- **Format**: `techco_org_chart_YYYY-MM-DD.json`
- **Date**: Use the "as of" date (not generation date)
- **Consistency**: Always use ISO 8601 format (YYYY-MM-DD)

### Documentation
- **Update CHANGELOG.md** after each comparison
- **Document context** for unusual changes
- **Track trends** quarterly
- **Review annually** for strategic planning

## 🚀 Integration

### With Data Refresh Process

Integrate snapshot creation into monthly data refresh:

```bash
# In your refresh workflow
npm run refresh                                    # Update dashboard data
/generate-org-chart                                # Update org chart if needed
node scripts/manage-org-chart-snapshot.js save $(date +%Y-%m-%d)
node scripts/manage-org-chart-snapshot.js compare <prev> <curr>
```

### With Dashboard

Future enhancements could include:
- Dashboard tab showing org chart trends
- Visualization of growth patterns
- Department-level analytics
- Attrition rate calculations
- Headcount forecasting

## 📚 Related Documentation

- `/docs/guides/DATA_REFRESH.md` - Dashboard data refresh process
- `/.claude/commands/generate-org-chart.md` - Org chart generation slash command
- `/scripts/parse-hierarchy.js` - Existing org chart parser
- `/data/techco_org_chart.json` - Current org chart (live)

## 🆘 Troubleshooting

### "No snapshots found"
- Run `node scripts/manage-org-chart-snapshot.js save <date>` to create first snapshot

### "Comparison shows no changes but employee count differs"
- The comparison detects individual employee changes
- Total count change without individual changes means data sync issue
- Regenerate org chart from source data

### "Script fails with permission error"
- Ensure scripts are executable: `chmod +x scripts/*.js`
- Check directory write permissions

### "JSON parse error"
- Validate JSON syntax: `jq . org-chart-snapshots/file.json`
- Check for trailing commas or malformed structure
- Regenerate from source if corrupted

## 💡 Tips

1. **Automate snapshots** with cron jobs or scheduled tasks
2. **Version control** snapshots in git for full audit trail
3. **Export reports** to PDF/CSV for distribution
4. **Track metrics** over time (not just snapshots)
5. **Set reminders** for monthly snapshot creation

---

**Last Updated**: January 21, 2026
**Version**: 1.0.0
**Status**: Production-ready
