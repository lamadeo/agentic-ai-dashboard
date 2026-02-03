# Coding Tools Comparison Tab - Add to Dashboard

## Summary for Luis

**Add this as a new tab between "Code" and "Enablement"**

**Key Executive Metric to add to Overview (5th metric card):**
- Title: "Claude Code Advantage"
- Value: "7.5x"
- Change: "vs Copilot"
- ChangeLabel: "More productive per engineer"
- Icon: TrendingUp
- Color: "indigo"

**Calculation:** Claude Code 27,650 lines/user ÷ GitHub Copilot 3,700 lines/user = 7.5x

---

## Tab Content (Compact Version for Dashboard)

### Section 1: Tool Comparison Overview
```jsx
<div className="grid grid-cols-2 gap-6 mb-6">
  <div className="bg-white border-2 border-purple-300 rounded-lg p-6">
    <h3 className="text-lg font-semibold mb-4 text-purple-700">Claude Code</h3>
    <div className="space-y-3">
      <div><span className="text-gray-600">Active Users:</span> <span className="font-bold">11 engineers</span></div>
      <div><span className="text-gray-600">Code Generated:</span> <span className="font-bold">304K lines</span></div>
      <div><span className="text-gray-600">Per User:</span> <span className="font-bold text-purple-700">27,650 lines</span></div>
      <div><span className="text-gray-600">Cost:</span> <span className="font-bold">Included in Premium</span></div>
      <div className="pt-3 border-t"><span className="text-gray-600">Productivity:</span> <span className="font-bold text-green-600">7.5x vs Copilot</span></div>
    </div>
  </div>
  
  <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
    <h3 className="text-lg font-semibold mb-4 text-gray-700">GitHub Copilot</h3>
    <div className="space-y-3">
      <div><span className="text-gray-600">Active Users:</span> <span className="font-bold">46 engineers</span></div>
      <div><span className="text-gray-600">Code Generated:</span> <span className="font-bold">170K lines</span></div>
      <div><span className="text-gray-600">Per User:</span> <span className="font-bold">3,700 lines</span></div>
      <div><span className="text-gray-600">Cost:</span> <span className="font-bold">$1,794/mo ($21.5K/yr)</span></div>
      <div className="pt-3 border-t bg-red-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
        <span className="text-red-700 font-semibold">→ Sunset March 2026</span>
      </div>
    </div>
  </div>
</div>
```

### Section 2: Claude Model Dominance in Copilot
```jsx
<div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200 mb-6">
  <h3 className="text-xl font-semibold mb-4">Critical Finding: Engineers Choose Claude 72% of Time</h3>
  <div className="grid grid-cols-2 gap-6">
    <div>
      <p className="text-sm text-gray-700 mb-4">When using GitHub Copilot with multi-model choice, engineers select Claude models for 72% of code generation:</p>
      <ul className="text-sm space-y-1">
        <li>• <strong>Claude 4.5 Sonnet:</strong> 81K lines (48%)</li>
        <li>• <strong>Claude 4.0 Sonnet:</strong> 42K lines (25%)</li>
        <li>• <strong>All other models:</strong> 47K lines (28%)</li>
      </ul>
    </div>
    <div className="bg-white p-4 rounded border border-purple-300">
      <p className="text-xs text-gray-600 mb-2">Model Preference</p>
      <div className="text-4xl font-bold text-purple-600 mb-2">72%</div>
      <p className="text-sm text-gray-700">Engineers choose Claude models even when GPT, Gemini available</p>
    </div>
  </div>
</div>
```

### Section 3: Engineer Quotes
```jsx
<div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
  <h3 className="text-lg font-semibold mb-4">What Engineers Say</h3>
  <div className="space-y-4">
    <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
      <p className="text-sm text-gray-800 italic mb-2">"Claude has got to be at least <strong>10 times faster with better quality</strong> [than Copilot]"</p>
      <p className="text-xs text-gray-600">— Devin Wagner, Engineering</p>
    </div>
    <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
      <p className="text-sm text-gray-800 italic mb-2">"<strong>60 minutes with Copilot → 5 minutes with Claude Code</strong> for release risk assessments. I prefer Claude."</p>
      <p className="text-xs text-gray-600">— Roger Hampton, Engineering</p>
    </div>
    <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50">
      <p className="text-sm text-gray-800 italic mb-2">"Spent <strong>3 hours stuck</strong> debugging. Got Claude Code, <strong>fixed in 1 hour</strong>. Seriously saved me so much time."</p>
      <p className="text-xs text-gray-600">— Taran Pierce, Engineering</p>
    </div>
  </div>
</div>
```

### Section 4: March 2026 Consolidation Plan
```jsx
<div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-400 mb-6">
  <h3 className="text-lg font-semibold mb-4">GitHub Copilot Sunset - March 2026</h3>
  <div className="grid grid-cols-3 gap-4 mb-4">
    <div className="bg-white p-4 rounded">
      <p className="text-xs text-gray-600 mb-1">Current Copilot Cost</p>
      <p className="text-2xl font-bold text-red-600">$21.5K/yr</p>
      <p className="text-xs text-gray-500 mt-1">46 users × $39/mo</p>
    </div>
    <div className="bg-white p-4 rounded">
      <p className="text-xs text-gray-600 mb-1">Contract Renewal</p>
      <p className="text-2xl font-bold text-orange-600">March 2026</p>
      <p className="text-xs text-gray-500 mt-1">DO NOT RENEW</p>
    </div>
    <div className="bg-white p-4 rounded border-2 border-green-400">
      <p className="text-xs text-gray-700 mb-1 font-semibold">Annual Savings</p>
      <p className="text-2xl font-bold text-green-600">$21.5K</p>
      <p className="text-xs text-gray-600 mt-1">Reinvest in Premium</p>
    </div>
  </div>
  <div className="bg-blue-50 p-4 rounded border border-blue-300">
    <p className="text-sm text-blue-900">
      <strong>Rationale:</strong> Phase 2 (Q1 2026) gives all 70 engineers Claude Code Premium. 
      Engineers already prefer Claude models (72% of Copilot usage). Copilot contract renews March 2026 - 
      do not renew, save $21.5K/year, standardize on superior tool.
    </p>
  </div>
</div>
```

### Section 5: Migration Timeline
```jsx
<div className="space-y-3">
  <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50">
    <h4 className="font-semibold text-sm">Q1 2026 (Jan-Mar): Full Rollout</h4>
    <p className="text-xs text-gray-600">All 70 engineers get Claude Code Premium. Copilot remains active during transition.</p>
  </div>
  <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50">
    <h4 className="font-semibold text-sm">March 2026: Copilot Sunset</h4>
    <p className="text-xs text-gray-600">Contract renewal date - DO NOT RENEW. All engineers using Claude Code.</p>
  </div>
  <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
    <h4 className="font-semibold text-sm">Post-March: Standardized</h4>
    <p className="text-xs text-gray-600">Single coding tool (Claude Code), $21.5K annual savings, 7.5x productivity advantage.</p>
  </div>
</div>
```

---

## Data Points for Dashboard

**GitHub Copilot (Nov 12 - Dec 9, 2025):**
- Active users: 46
- Total lines: 170,390
- Lines per user: 3,700
- Cost: $1,794/month ($21,528/year)
- Claude model usage: 72% (123,526 lines)
- Top user: dmccom (25,400 lines)

**Claude Code (Nov-Dec 2025):**
- Active users: 11
- Total lines: 304,175
- Lines per user: 27,650
- Cost: Included in Premium ($200/mo)
- Claude model usage: 100%
- Top user: gtaborga (52,347 lines in Dec alone)

**Key Metric:** 27,650 ÷ 3,700 = 7.47x more productive

---

## Implementation Notes

Due to dashboard file size constraints (~67KB max), keep this tab MINIMAL:
- 2-column comparison cards
- 1 pie/bar chart for model usage
- 3 engineer quotes
- Sunset timeline (3 phases)
- Total addition: ~5KB

Avoid:
- Detailed tables
- Too many charts
- Verbose explanations
- Redundant data already in Code tab
