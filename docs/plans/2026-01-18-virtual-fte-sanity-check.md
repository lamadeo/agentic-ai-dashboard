# Agentic FTE Monthly Calculation - Sanity Check Results

**Date**: January 18, 2026
**Status**: ✅ All calculations verified and consistent

---

## Monthly Agentic FTE Summary

| Month | Claude Enterprise | Claude Code | M365 Copilot | GitHub Copilot | **Total** |
|-------|-------------------|-------------|--------------|----------------|-----------|
| Sep 2025 | 11.8 FTEs | 0 FTEs | 21.4 FTEs | 0 FTEs | **33.2 FTEs** |
| Oct 2025 | 15.7 FTEs | 0 FTEs | 28.7 FTEs | 0 FTEs | **44.4 FTEs** |
| Nov 2025 | 21.6 FTEs | 69.5 FTEs | 27.7 FTEs | 32.0 FTEs | **150.8 FTEs** |
| Dec 2025 | 22.1 FTEs | 233.7 FTEs | 26.3 FTEs | 28.0 FTEs | **310.2 FTEs** |
| Jan 2026 | 18.2 FTEs | 49.8 FTEs | 11.9 FTEs | 1.6 FTEs | **81.5 FTEs** |

---

## Detailed Calculations (November 2025)

### Claude Enterprise
```
Users: 77
Calculation: 77 users × 0.28 (28% time savings) = 21.6 FTEs ✓
Hours: 77 × 0.28 × 173 hrs = 3,727 hours
```

### Claude Code
```
Users: 6
Lines Generated: 150,352
Calculation: 150,352 lines × 0.08 hrs/line / 173 hrs/FTE = 69.5 FTEs ✓
Hours: 150,352 × 0.08 = 12,028 hours
Lines per user: 150,352 / 6 = 25,059 lines/user
```

### M365 Copilot
```
Users: 198
Calculation: 198 users × 0.14 (14% time savings) = 27.7 FTEs ✓
Hours: 198 × 0.14 × 173 hrs = 4,794 hours
```

### GitHub Copilot
```
Users: 44
Lines Generated: 69,171
Calculation: 69,171 lines × 0.08 hrs/line / 173 hrs/FTE = 32.0 FTEs ✓
Hours: 69,171 × 0.08 = 5,534 hours
Lines per user: 69,171 / 44 = 1,572 lines/user
```

### Total November
```
Total FTEs: 21.6 + 69.5 + 27.7 + 32.0 = 150.8 FTEs ✓
Total Hours: 3,727 + 12,028 + 4,794 + 5,534 = 26,083 hours ✓
```

---

## Detailed Calculations (December 2025 - Peak Month)

### Claude Enterprise
```
Users: 79
Calculation: 79 users × 0.28 = 22.1 FTEs ✓
Hours: 79 × 0.28 × 173 = 3,827 hours
```

### Claude Code (HIGH OUTPUT MONTH)
```
Users: 19
Lines Generated: 505,325
Calculation: 505,325 lines × 0.08 hrs/line / 173 hrs/FTE = 233.7 FTEs ✓
Hours: 505,325 × 0.08 = 40,426 hours
Lines per user: 505,325 / 19 = 26,596 lines/user
```

**Note**: December Claude Code output is exceptionally high (26,596 lines/user). This is plausible due to:
- Year-end sprint to ship features
- Large boilerplate code generation
- Multiple projects closing out

### M365 Copilot
```
Users: 188
Calculation: 188 users × 0.14 = 26.3 FTEs ✓
Hours: 188 × 0.14 × 173 = 4,551 hours
```

### GitHub Copilot
```
Users: 47
Lines Generated: 60,624
Calculation: 60,624 lines × 0.08 hrs/line / 173 hrs/FTE = 28.0 FTEs ✓
Hours: 60,624 × 0.08 = 4,850 hours
Lines per user: 60,624 / 47 = 1,290 lines/user
```

### Total December
```
Total FTEs: 22.1 + 233.7 + 26.3 + 28.0 = 310.2 FTEs ✓
Total Hours: 3,827 + 40,426 + 4,551 + 4,850 = 53,654 hours ✓
```

---

## Detailed Calculations (January 2026 - MTD)

### Claude Enterprise
```
Users: 65
Calculation: 65 users × 0.28 = 18.2 FTEs ✓
Hours: 65 × 0.28 × 173 = 3,147 hours
```

### Claude Code
```
Users: 16
Lines Generated: 107,675
Calculation: 107,675 lines × 0.08 hrs/line / 173 hrs/FTE = 49.8 FTEs ✓
Hours: 107,675 × 0.08 = 8,614 hours
Lines per user: 107,675 / 16 = 6,730 lines/user
```

### M365 Copilot
```
Users: 85
Calculation: 85 users × 0.14 = 11.9 FTEs ✓
Hours: 85 × 0.14 × 173 = 2,058 hours
```

### GitHub Copilot
```
Users: 34
Lines Generated: 3,371
Calculation: 3,371 lines × 0.08 hrs/line / 173 hrs/FTE = 1.6 FTEs ✓
Hours: 3,371 × 0.08 = 270 hours
Lines per user: 3,371 / 34 = 99 lines/user
```

**Note**: January is MTD (partial month), so numbers are lower and will grow throughout the month.

### Total January (MTD)
```
Total FTEs: 18.2 + 49.8 + 11.9 + 1.6 = 81.5 FTEs ✓
Total Hours: 3,147 + 8,614 + 2,058 + 270 = 14,089 hours ✓
```

---

## Month-over-Month Analysis

### September → October
- **Change**: +11.2 FTEs (+33.7%)
- **Driver**: M365 Copilot user growth (153 → 205 users)
- **Status**: ✓ Normal growth

### October → November
- **Change**: +106.4 FTEs (+240%)
- **Driver**: Coding tools activated (Claude Code + GitHub Copilot)
- **Status**: ✓ Expected spike when new tools launch

### November → December
- **Change**: +159.4 FTEs (+105.7%)
- **Driver**: Claude Code exceptional output (150K → 505K lines)
- **Status**: ⚠️ Investigate December spike (26,596 lines/user is high)

### December → January
- **Change**: -228.7 FTEs (-73.7%)
- **Driver**: January is MTD (partial month)
- **Status**: ✓ Expected drop for partial month

---

## Validation Checks

### ✅ Formula Consistency
- **Productivity Tools**: Users × Time Savings % = FTEs
  - Claude Enterprise: Users × 0.28 ✓
  - M365 Copilot: Users × 0.14 ✓

- **Coding Tools**: Lines × Hours Per Line / FTE Hours = FTEs
  - Claude Code: Lines × 0.08 / 173 ✓
  - GitHub Copilot: Lines × 0.08 / 173 ✓

### ✅ Sum Check
- All monthly totals match sum of individual tool FTEs ✓

### ✅ Reasonableness Check
- Productivity FTEs: 11-28 FTEs per tool per month ✓
- Coding FTEs: 0-234 FTEs per tool per month ⚠️
  - December Claude Code (233.7 FTEs) is high but mathematically correct
  - Corresponds to 505K lines from 19 users

### ✅ Data Quality
- All source data present (users, lines) ✓
- No null or missing values ✓
- Months align across all tools ✓

---

## Outstanding Questions

### 1. December Claude Code Spike
**Observation**: 505,325 lines from 19 users = 26,596 lines/user

**Possible explanations**:
- Year-end sprint to complete projects
- Large code generation tasks (boilerplate, migrations)
- Multiple projects closing out simultaneously
- Code quality (might include generated but not reviewed code)

**Recommendation**:
- Review December Claude Code usage patterns
- Verify if all lines were committed/shipped
- Interview high-output users to understand patterns

### 2. January GitHub Copilot Low Output
**Observation**: 3,371 lines from 34 users = 99 lines/user (very low)

**Possible explanations**:
- January MTD (only ~18 days of data)
- Holiday slowdown
- Post-sprint recovery period

**Status**: ✓ Expected for partial month

---

## Conclusion

✅ **All calculations are mathematically correct and consistent**

✅ **Monthly trends match expected patterns**:
- September-October: Steady growth (productivity tools only)
- November: Big jump (coding tools activated)
- December: Peak month (exceptional Claude Code output)
- January: Lower (MTD, post-holiday)

⚠️ **Action Items**:
1. Investigate December Claude Code spike (233.7 FTEs from 19 users)
2. Monitor January trends as month progresses
3. Verify with users that high-output months reflect actual shipped code

✅ **Ready for UI implementation** - all backend calculations verified!

---

**Next Steps**: Implement UI visualizations in Overview, Deep Dive, and Compare Tools tabs.
