# Claude Enterprise Seat Update Process

## Weekly Update Procedure

This document describes the repeatable process for updating Claude Enterprise seat data.

### Frequency
**Weekly** (or whenever seat assignments change)

---

## Step-by-Step Process

### 1. Export Seat Data from Claude Enterprise Admin

1. Log into Claude Enterprise admin console
2. Navigate to Settings → Users
3. Select all users in the table (Name, Email, Role, Seat Tier, Status columns)
4. Copy the entire selection to clipboard

### 2. Paste into Input File

```bash
# Open your text editor and paste the copied data
nano /tmp/claude-seats-raw.txt

# Or use echo (for small updates)
pbpaste > /tmp/claude-seats-raw.txt
```

### 3. Run the Parser Script

```bash
cd /Users/luisamadeo/repos/GitHub/as-ai-dashboard
node scripts/parse-claude-seats.js
```

**Expected Output:**
```
🔄 Parsing Claude Enterprise seat data...

✅ Parsing complete!

📊 Summary:
   Total Users: 88
   Premium Seats: 15
   Standard Seats: 73
   ...

💾 Output saved to: data/claude_enterprise_seats.json
```

### 4. Verify the Output

```bash
# Check Premium seat holders
cat data/claude_enterprise_seats.json | jq '.users | map(select(.seatTier == "Premium")) | .[].name'

# Check specific department (e.g., Agentic AI)
cat data/claude_enterprise_seats.json | jq '.users | map(select(.email | contains("lamadeo") or contains("jrivero") or contains("gtaborga") or contains("rfoster") or contains("kravariere") or contains("ypiloto")))'
```

### 5. Clean Up Sensitive Data

```bash
# Delete the raw text file (contains sensitive email addresses)
rm /tmp/claude-seats-raw.txt
```

### 6. Regenerate Dashboard Data

```bash
# Re-run the main data parser to incorporate new seat data
node scripts/parse-copilot-data.js
```

---

## Output File Schema

**File:** `data/claude_enterprise_seats.json`

```json
{
  "metadata": {
    "lastUpdated": "2025-12-21T23:40:41.757Z",
    "source": "Claude Enterprise Admin Console",
    "totalUsers": 88
  },
  "statistics": {
    "seatCounts": {
      "premium": 15,
      "standard": 73,
      "unassigned": 0
    },
    "statusCounts": {
      "active": 87,
      "pending": 1,
      "inactive": 0
    }
  },
  "users": [
    {
      "name": "Luis",
      "email": "lamadeo@techco.com",
      "role": "Primary owner",
      "seatTier": "Premium",
      "status": "Active"
    },
    ...
  ]
}
```

---

## Troubleshooting

### Parser Can't Find Input File

**Error:** `❌ Input file not found: /tmp/claude-seats-raw.txt`

**Solution:** Verify you created the file with the correct path:
```bash
ls -la /tmp/claude-seats-raw.txt
```

### Parsing Errors

**Error:** `⚠️ Skipping invalid entry at line X`

**Cause:** The text format doesn't match expected structure (Name, Email, Role, Seat Tier, Status in groups of 5 lines)

**Solution:** Re-copy the data from Claude Enterprise admin, ensuring you select ALL columns

### Missing Users

**Symptom:** Total user count is lower than expected

**Solution:** Ensure you copied the entire user list, not just the visible portion. Scroll down and select all users before copying.

---

## Integration with Dashboard

The generated `claude_enterprise_seats.json` file is used by:

1. **`parse-copilot-data.js`** - Main data aggregation pipeline
2. **Expansion ROI calculations** - To determine current seat distribution
3. **Department analytics** - To match seat tiers with org chart data
4. **License optimization** - To identify Premium vs Standard allocation

---

## Git Workflow

**DO NOT** commit the raw text file (`/tmp/claude-seats-raw.txt`) - it contains sensitive data.

**DO** commit the generated JSON file:
```bash
git add data/claude_enterprise_seats.json
git commit -m "Update Claude Enterprise seat data - $(date +%Y-%m-%d)"
```

---

## Automation Opportunities

Future enhancement: Create a script that uses Claude Enterprise API to automatically fetch seat data.

**Requirements:**
- Claude Enterprise API key
- Appropriate permissions
- Scheduled job (cron or GitHub Actions)
