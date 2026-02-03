You are an expert at updating Claude Enterprise seat allocation data with proper historical tracking for this AI Dashboard project. Follow this workflow to update seat data from Claude Enterprise Admin Console exports.

---

## Workflow Steps

### Step 1: Gather CSV Export

Use the AskUserQuestion tool to ask the user:

1. **Do you have the Claude Enterprise users CSV export ready?**
   - If yes: Ask for the file path
   - If no: Provide instructions for exporting from Claude Enterprise Admin Console

2. **Instructions for exporting** (if needed):
   ```
   1. Go to Claude Enterprise Admin Console (claude.ai/admin)
   2. Navigate to "Members" or "Users" section
   3. Click "Export" or "Download CSV"
   4. Save the file (typically named "techco_users_current.csv")
   5. Note the file path for the next step
   ```

### Step 2: Validate CSV Format

Read the CSV file and verify it has the required columns:
- **Name**: Employee name
- **Email**: Email address
- **Role**: User role (User, Admin, Owner, Primary owner)
- **Seat Tier**: Premium, Standard, or Unassigned
- **Status**: Active, Pending, or Inactive

**Validation checks:**
- [ ] CSV has header row with expected columns
- [ ] All rows have valid email addresses
- [ ] Seat Tier is one of: Premium, Standard, Unassigned
- [ ] Status is one of: Active, Pending, Inactive
- [ ] No duplicate email addresses

If validation fails, report errors and ask user to correct the CSV.

### Step 3: Parse and Calculate Statistics

Extract the following from the CSV:

**Metadata:**
- Total users count
- Current date/time for snapshot
- Source: "Claude Enterprise Admin Console"

**Seat Counts:**
- Premium seats
- Standard seats
- Unassigned seats

**Status Counts:**
- Active users
- Pending users
- Inactive users

Display summary to user for confirmation before proceeding.

### Step 4: Compare with Previous Snapshot

Read the latest snapshot from `claude_enterprise_license_history.json` and calculate changes:

**Calculate deltas:**
- Total licenses: +/- count (percentage)
- Premium seats: +/- count (percentage)
- Standard seats: +/- count (percentage)
- Unassigned seats: +/- count
- Active users: +/- count (percentage)
- Pending users: +/- count

**Display comparison table:**
```
Metric              Previous    Current    Change
Total Licenses      112         118        +6 (+5%)
Premium Seats       45          42         -3 (-7%)
Standard Seats      67          74         +7 (+10%)
Unassigned          0           2          +2
Active Users        101         117        +16 (+16%)
Pending Users       11          1          -10 (-91%)
```

Ask user to confirm the changes look correct.

### Step 5: Update Current Seats File

Write updated data to `/data/claude_enterprise_seats.json`:

```json
{
  "metadata": {
    "lastUpdated": "YYYY-MM-DDTHH:mm:ss.sssZ",
    "source": "Claude Enterprise Admin Console",
    "totalUsers": <count>
  },
  "statistics": {
    "seatCounts": {
      "premium": <count>,
      "standard": <count>,
      "unassigned": <count>
    },
    "statusCounts": {
      "active": <count>,
      "pending": <count>,
      "inactive": <count>
    }
  },
  "users": [
    {
      "name": "...",
      "email": "...",
      "role": "...",
      "seatTier": "...",
      "status": "..."
    }
  ]
}
```

### Step 6: Update License Config (Temporary - Will Be Deprecated)

**⚠️ Technical Debt**: This step updates `license_config.csv` for backward compatibility.
In the future, the pipeline will be refactored to use `claude_enterprise_seats.json` directly.

Update the Claude Enterprise rows in `/data/license_config.csv`:

```csv
tool,licensed_users,premium_users,standard_users,last_updated,notes
claude_enterprise,<active_users>,<premium_count>,<standard_count>,YYYY-MM-DD,Claude Enterprise total licenses (Premium + Standard) - Active users only (excludes unassigned)
claude_code,<premium_count>,<premium_count>,0,YYYY-MM-DD,Claude Code licenses are the same as Premium licenses - Premium includes Claude Code access
```

**Calculation Rules:**
- `licensed_users` for Claude Enterprise = Total users - Unassigned seats (only count assigned seats)
- `premium_users` = Premium seat count from statistics
- `standard_users` = Standard seat count from statistics
- `claude_code` licensed_users = Premium count (Premium includes Claude Code access)
- `last_updated` = Current date (YYYY-MM-DD format)

**Example:**
If seats file shows: 118 total (42 Premium, 74 Standard, 2 Unassigned)
- Claude Enterprise row: `116,42,74` (118 - 2 unassigned)
- Claude Code row: `42,42,0`

### Step 7: Add Snapshot to History

Update `/data/claude_enterprise_license_history.json`:

1. **Read existing history**
2. **Create new snapshot entry:**
   ```json
   {
     "date": "YYYY-MM-DD",
     "snapshotDate": "YYYY-MM-DDTHH:mm:ss.sssZ",
     "totalLicenses": <count>,
     "seats": {
       "premium": <count>,
       "standard": <count>,
       "unassigned": <count>
     },
     "userStatus": {
       "active": <count>,
       "pending": <count>,
       "inactive": <count>
     },
     "changes": {
       "totalLicenses": "+6 (+5%)",
       "premiumSeats": "-3 (-7%)",
       "standardSeats": "+7 (+10%)",
       "activeUsers": "+16 (+16%)",
       "pendingUsers": "-10 (-91%)"
     },
     "notes": "Brief description of changes",
     "source": "CSV filename"
   }
   ```
3. **Update summary section** with total growth since first snapshot
4. **Update keyInsights** with notable trends

### Step 8: Save CSV Snapshot

Copy the source CSV to `/data/techco_users_snapshot_YYYY-MM-DD.csv` for archival purposes.

This preserves the raw export data alongside the processed JSON.

### Step 9: Run Data Refresh (Optional)

Ask user if they want to run the data refresh now to update the dashboard:

**Option 1: Run now**
```bash
npm run refresh
```

**Option 2: Manual later**
User can run `npm run refresh` or `/refresh-data` when ready.

### Step 10: Provide Summary

Display final summary:

```
✅ Claude Enterprise Seats Updated

📊 New Snapshot (YYYY-MM-DD):
   • Total Users: 118 (+6 from previous)
   • Premium: 42 (-3, -7%)
   • Standard: 74 (+7, +10%)
   • Unassigned: 2 (+2)
   • Active: 117 (+16, +16%)
   • Pending: 1 (-10, -91%)

📁 Files Updated:
   • data/claude_enterprise_seats.json (current data)
   • data/claude_enterprise_license_history.json (snapshot added)
   • data/license_config.csv (dashboard license counts - temporary)
   • data/techco_users_snapshot_YYYY-MM-DD.csv (raw backup)

📈 Historical Growth (since first snapshot):
   • Total licenses: +30 (+34%)
   • Premium seats: +27 (+180%)
   • Standard seats: +1 (+1%)

🎯 Next Steps:
   1. Refresh the dashboard (npm run refresh or /refresh-data)
   2. Review updated metrics in Overview and Claude Enterprise tabs
   3. Check Expansion ROI for updated opportunities
```

**Do NOT repeat the entire JSON content in the response - just confirm files were updated.**

---

## Key Insights to Track

When updating the summary.keyInsights array, look for:

1. **Growth trends**: Significant increases/decreases in total licenses
2. **Tier shifts**: Premium → Standard or Standard → Premium conversions
3. **Activation rates**: Pending → Active user trends
4. **Seat utilization**: Unassigned seats indicating unused licenses
5. **Adoption velocity**: Rate of change between snapshots

Example insights:
- "34% overall license growth since December baseline"
- "Premium optimization: -7% from previous month indicates cost management"
- "Strong activation: 99% active rate (117/118) with only 1 pending"
- "2 unassigned seats suggest opportunity for better license allocation"

---

## Error Handling

### Invalid CSV Format
If CSV doesn't match expected format:
1. Show the actual headers found
2. Show expected headers
3. Ask user to export again or provide correct file

### Missing History File
If `claude_enterprise_license_history.json` doesn't exist:
1. Create new history file with proper structure
2. Use current snapshot as first baseline
3. Warn user that historical comparison is limited

### Duplicate Emails
If duplicate emails found in CSV:
1. List the duplicate emails
2. Ask user to verify and provide corrected CSV
3. Do not proceed until resolved

---

## File Paths

**Always use these exact paths:**
- Current seats: `/data/claude_enterprise_seats.json`
- History: `/data/claude_enterprise_license_history.json`
- License config: `/data/license_config.csv` (⚠️ temporary - will be deprecated)
- CSV snapshot: `/data/techco_users_snapshot_YYYY-MM-DD.csv`

**Technical Debt Note**: The `license_config.csv` file is currently required for backward compatibility with the existing data pipeline. In the future, the pipeline will be refactored to read license data directly from `claude_enterprise_seats.json`, making `license_config.csv` obsolete.

---

## Special Cases

### First-Time Setup
If this is the first snapshot:
- Create history file from scratch
- Set summary.firstSnapshot to current date
- Use "Baseline snapshot" as notes
- keyInsights should note this is the starting point

### Major Changes (>20% growth or decline)
If any metric changes by more than 20%:
- Flag it in the summary
- Ask user if this is expected
- Add extra detail to notes field

### Unassigned Seats
If unassigned seats > 0:
- Note this in the summary
- Suggest reviewing seat allocation
- Include in keyInsights if count is significant (>5)

---

## Important Notes

1. **Date format**: Always use ISO 8601 format (YYYY-MM-DD) for dates
2. **Percentage calculations**: Round to nearest integer for readability
3. **Change indicators**: Use +/- prefix for positive/negative changes
4. **Validation first**: Always validate before writing files
5. **Backup**: CSV snapshot preserves original export data
6. **Idempotent**: Safe to re-run with same date (will replace snapshot)

This is a production tool for the AI Dashboard - accuracy and data integrity are critical.
