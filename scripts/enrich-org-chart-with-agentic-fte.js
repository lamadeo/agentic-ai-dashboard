#!/usr/bin/env node

/**
 * Enrich Org Chart with Agentic FTE Data
 *
 * This script enhances the organization chart JSON with per-employee Agentic FTE metrics:
 * - Individual agentic FTE contribution from AI tool usage
 * - Team rollup of agentic FTE (sum of all reports)
 * - Month-over-month change tracking (when historical data available)
 *
 * Usage:
 *   node scripts/enrich-org-chart-with-agentic-fte.js
 */

const fs = require('fs');
const path = require('path');

// File paths
const ORG_CHART_PATH = path.join(__dirname, '..', 'data', 'techco_org_chart.json');
const AI_TOOLS_DATA_PATH = path.join(__dirname, '..', 'app', 'ai-tools-data.json');
const ENRICHED_ORG_CHART_PATH = ORG_CHART_PATH; // Overwrite the original

console.log('\n🔄 Enriching Org Chart with Agentic FTE Data...\n');

// Load data files
const orgChart = JSON.parse(fs.readFileSync(ORG_CHART_PATH, 'utf8'));
const aiToolsData = JSON.parse(fs.readFileSync(AI_TOOLS_DATA_PATH, 'utf8'));

/**
 * Build email-to-employee mapping with monthly rate and MoM trends
 * Uses latest month's data for current FTE, compares with previous month for trend
 */
function buildUserAgenticFTEMap() {
  const userMap = new Map();

  // Helper function to calculate trend direction
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return 'new'; // New user this month
    const change = ((current - previous) / previous) * 100;
    if (change < -5) return 'down'; // Declined more than 5%
    if (change > 5) return 'up'; // Increased more than 5%
    return 'stable'; // Changed less than 5%
  };

  // Helper function to add/update user in map
  const addUserToMap = (email, name, tool, currentFTE, previousFTE) => {
    const trend = calculateTrend(currentFTE, previousFTE);

    const data = {
      claudeEnterprise: { current: 0, previous: 0, trend: 'stable' },
      m365Copilot: { current: 0, previous: 0, trend: 'stable' },
      claudeCode: { current: 0, previous: 0, trend: 'stable' },
      total: { current: 0, previous: 0, trend: 'stable' }
    };

    // Add by email if available
    if (email) {
      const emailKey = email.toLowerCase();
      const existing = userMap.get(emailKey) || JSON.parse(JSON.stringify(data));
      existing[tool].current = currentFTE;
      existing[tool].previous = previousFTE;
      existing[tool].trend = trend;

      // Update total
      existing.total.current = existing.claudeEnterprise.current + existing.m365Copilot.current + existing.claudeCode.current;
      existing.total.previous = existing.claudeEnterprise.previous + existing.m365Copilot.previous + existing.claudeCode.previous;
      existing.total.trend = calculateTrend(existing.total.current, existing.total.previous);

      userMap.set(emailKey, existing);
    }

    // ALSO add by name (for org charts without email fields)
    if (name) {
      const nameKey = name.toLowerCase();
      const existing = userMap.get(nameKey) || JSON.parse(JSON.stringify(data));
      existing[tool].current = currentFTE;
      existing[tool].previous = previousFTE;
      existing[tool].trend = trend;

      // Update total
      existing.total.current = existing.claudeEnterprise.current + existing.m365Copilot.current + existing.claudeCode.current;
      existing.total.previous = existing.claudeEnterprise.previous + existing.m365Copilot.previous + existing.claudeCode.previous;
      existing.total.trend = calculateTrend(existing.total.current, existing.total.previous);

      userMap.set(nameKey, existing);
    }
  };

  // Process Claude Code monthly trend data
  const claudeCodeMonthly = aiToolsData.claudeCode?.monthlyTrend || [];
  if (claudeCodeMonthly.length > 0) {
    const latestMonth = claudeCodeMonthly[claudeCodeMonthly.length - 1];
    const previousMonth = claudeCodeMonthly.length > 1 ? claudeCodeMonthly[claudeCodeMonthly.length - 2] : null;

    // Build maps for quick lookup
    const latestUserMap = new Map();
    const previousUserMap = new Map();

    if (latestMonth.userDetails) {
      latestMonth.userDetails.forEach(user => {
        latestUserMap.set(user.email.toLowerCase(), user.agenticFTE);
      });
    }

    if (previousMonth?.userDetails) {
      previousMonth.userDetails.forEach(user => {
        previousUserMap.set(user.email.toLowerCase(), user.agenticFTE);
      });
    }

    // Get user names from powerUsers and lowEngagementUsers
    const allCCUsers = [
      ...(aiToolsData.claudeCode?.powerUsers || []),
      ...(aiToolsData.claudeCode?.lowEngagementUsers || [])
    ];

    allCCUsers.forEach(user => {
      const email = user.email?.toLowerCase();
      if (!email) return;

      const currentFTE = latestUserMap.get(email) || 0;
      const previousFTE = previousUserMap.get(email) || 0;

      addUserToMap(email, user.name, 'claudeCode', currentFTE, previousFTE);
    });
  }

  // Process Claude Enterprise users (simplified - using existing agenticFTE from power users)
  const ceUsers = [
    ...(aiToolsData.claudeEnterprise?.powerUsers || []),
    ...(aiToolsData.claudeEnterprise?.lowEngagementUsers || [])
  ];
  ceUsers.forEach(user => {
    // For now, use current agenticFTE as both current and previous (no MoM tracking yet)
    addUserToMap(user.email, user.name, 'claudeEnterprise', user.agenticFTE || 0, user.agenticFTE || 0);
  });

  // Process M365 Copilot users (simplified - using existing agenticFTE from power users)
  const m365Users = [
    ...(aiToolsData.m365CopilotDeepDive?.powerUsers || [])
  ];
  m365Users.forEach(user => {
    // For now, use current agenticFTE as both current and previous (no MoM tracking yet)
    addUserToMap(user.email, user.name, 'm365Copilot', user.agenticFTE || 0, user.agenticFTE || 0);
  });

  return userMap;
}

/**
 * Match employee to agentic FTE data
 * Uses email or name-based matching
 */
function getEmployeeAgenticFTE(employee, userMap, department) {
  // Try email match first (most accurate)
  if (employee.email) {
    const emailKey = employee.email.toLowerCase();
    const agenticData = userMap.get(emailKey);
    if (agenticData) return agenticData;
  }

  // Fallback to name match
  const nameKey = employee.name.toLowerCase();
  const agenticData = userMap.get(nameKey);
  if (agenticData) return agenticData;

  // Default to zero if no match
  return {
    claudeEnterprise: { current: 0, previous: 0, trend: 'stable' },
    m365Copilot: { current: 0, previous: 0, trend: 'stable' },
    claudeCode: { current: 0, previous: 0, trend: 'stable' },
    total: { current: 0, previous: 0, trend: 'stable' }
  };
}

/**
 * Recursively enrich org chart nodes with agentic FTE data (monthly rate + MoM trends)
 * Also calculates team rollup (sum of employee + all reports)
 */
function enrichNode(node, userMap, department) {
  // Get employee's personal agentic FTE with trend data
  const agenticData = getEmployeeAgenticFTE(node, userMap, department);

  // Add individual agentic FTE (monthly rate)
  node.agenticFTE = {
    current: parseFloat(agenticData.total.current.toFixed(2)),
    previous: parseFloat(agenticData.total.previous.toFixed(2)),
    trend: agenticData.total.trend,
    breakdown: {
      claudeEnterprise: {
        current: parseFloat(agenticData.claudeEnterprise.current.toFixed(2)),
        trend: agenticData.claudeEnterprise.trend
      },
      m365Copilot: {
        current: parseFloat(agenticData.m365Copilot.current.toFixed(2)),
        trend: agenticData.m365Copilot.trend
      },
      claudeCode: {
        current: parseFloat(agenticData.claudeCode.current.toFixed(2)),
        trend: agenticData.claudeCode.trend
      }
    }
  };

  // Start team total with employee's own contribution
  let teamCurrentTotal = node.agenticFTE.current;
  let teamPreviousTotal = node.agenticFTE.previous;
  let teamBreakdown = {
    claudeEnterprise: node.agenticFTE.breakdown.claudeEnterprise.current,
    m365Copilot: node.agenticFTE.breakdown.m365Copilot.current,
    claudeCode: node.agenticFTE.breakdown.claudeCode.current
  };

  // Recursively enrich all direct reports and sum their team totals
  if (node.reports && node.reports.length > 0) {
    node.reports.forEach(report => {
      enrichNode(report, userMap, department || getDepartmentFromTitle(node.title));

      // Add report's team total to this node's team total
      if (report.teamAgenticFTE) {
        teamCurrentTotal += report.teamAgenticFTE.current;
        teamPreviousTotal += report.teamAgenticFTE.previous;
        teamBreakdown.claudeEnterprise += report.teamAgenticFTE.breakdown.claudeEnterprise.current;
        teamBreakdown.m365Copilot += report.teamAgenticFTE.breakdown.m365Copilot.current;
        teamBreakdown.claudeCode += report.teamAgenticFTE.breakdown.claudeCode.current;
      }
    });
  }

  // Calculate team trend
  const teamTrend = teamPreviousTotal === 0 ? 'new' :
    ((teamCurrentTotal - teamPreviousTotal) / teamPreviousTotal * 100) < -5 ? 'down' :
    ((teamCurrentTotal - teamPreviousTotal) / teamPreviousTotal * 100) > 5 ? 'up' : 'stable';

  // Add team rollup with trend
  node.teamAgenticFTE = {
    current: parseFloat(teamCurrentTotal.toFixed(2)),
    previous: parseFloat(teamPreviousTotal.toFixed(2)),
    trend: teamTrend,
    breakdown: {
      claudeEnterprise: {
        current: parseFloat(teamBreakdown.claudeEnterprise.toFixed(2))
      },
      m365Copilot: {
        current: parseFloat(teamBreakdown.m365Copilot.toFixed(2))
      },
      claudeCode: {
        current: parseFloat(teamBreakdown.claudeCode.toFixed(2))
      }
    }
  };

  return node;
}

/**
 * Helper to extract department from executive title
 */
function getDepartmentFromTitle(title) {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('marketing')) return 'Marketing';
  if (titleLower.includes('engineering') || titleLower.includes('software')) return 'Engineering';
  if (titleLower.includes('product')) return 'Product';
  if (titleLower.includes('sales')) return 'Sales';
  if (titleLower.includes('customer')) return 'Customer';
  if (titleLower.includes('finance')) return 'Finance';
  if (titleLower.includes('operations')) return 'Operations';
  if (titleLower.includes('hr') || titleLower.includes('human resources')) return 'Human Resources';
  return null;
}

/**
 * Main execution
 */
console.log('📊 Building user agentic FTE map...');
const userMap = buildUserAgenticFTEMap();
console.log(`   Found ${userMap.size - 1} users with agentic FTE data`); // -1 for _deptFTE_

console.log('\n🌳 Enriching org chart nodes...');
enrichNode(orgChart.organization.ceo, userMap, null);

// Add organization-wide summary
orgChart.organization.totalAgenticFTE = orgChart.organization.ceo.teamAgenticFTE.current;
orgChart.organization.agenticFTEBreakdown = orgChart.organization.ceo.teamAgenticFTE.breakdown;

console.log('\n✅ Organization-Wide Agentic FTE Summary (Monthly Rate):');
console.log(`   Total Agentic FTE: ${orgChart.organization.totalAgenticFTE.toFixed(1)} FTE/mo`);
console.log(`   Trend: ${orgChart.organization.ceo.teamAgenticFTE.trend}`);
console.log(`   Breakdown:`);
console.log(`     Claude Enterprise: ${orgChart.organization.agenticFTEBreakdown.claudeEnterprise.current.toFixed(1)} FTE/mo`);
console.log(`     M365 Copilot: ${orgChart.organization.agenticFTEBreakdown.m365Copilot.current.toFixed(1)} FTE/mo`);
console.log(`     Claude Code: ${orgChart.organization.agenticFTEBreakdown.claudeCode.current.toFixed(1)} FTE/mo`);
console.log(`\n   Total Organization Capacity (Monthly): ${orgChart.organization.totalEmployees} employees + ${orgChart.organization.totalAgenticFTE.toFixed(1)} agentic FTE/mo`);
console.log(`   = ${(orgChart.organization.totalEmployees + orgChart.organization.totalAgenticFTE).toFixed(1)} effective FTE capacity`);

// Write enriched org chart
console.log(`\n💾 Writing enriched org chart to: ${ENRICHED_ORG_CHART_PATH}`);
fs.writeFileSync(ENRICHED_ORG_CHART_PATH, JSON.stringify(orgChart, null, 2));

console.log('\n✅ Org chart enrichment complete!\n');
