/**
 * Pipeline Orchestrator Module
 *
 * Coordinates the entire data processing pipeline from ingestion to aggregation.
 * Extracted from parse-copilot-data.js as part of Phase 5 modularization.
 *
 * Phase 5: January 10, 2026
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Clear parse-hierarchy cache to ensure updated EMAIL_ALIAS_MAP is loaded
// This is critical when EMAIL_ALIAS_MAP is updated via /setup-org-data workflow
const parseHierarchyPath = path.resolve(__dirname, '../parse-hierarchy.js');
if (require.cache[parseHierarchyPath]) {
  delete require.cache[parseHierarchyPath];
}

const { buildOrgMappingFromHierarchy, getDepartmentInfo, isCurrentEmployee, getDepartmentHeadcounts } = require('../parse-hierarchy');
const { ingestGitHubCopilot } = require('./ingestors/github-copilot-ingestor');
const { ingestLicenseConfig } = require('./ingestors/license-config-ingestor');
const { ingestClaudeCode } = require('./ingestors/claude-code-ingestor');
const { ingestOrgHierarchy } = require('./ingestors/org-hierarchy-ingestor');
const { ingestClaudeEnterprise } = require('./ingestors/claude-enterprise-ingestor');
const { ingestM365Copilot } = require('./ingestors/m365-copilot-ingestor');
const { ingestConnectors } = require('./ingestors/connectors-ingestor');

// Import processor modules
const { calculatePremiumScore, getDepartmentPremiumBaseline, recommendLicenseAllocation } = require('./processors/premium-allocation-processor');
const { calculateMonthlyAgenticFTEs } = require('./processors/productivity-calculator');
const { calculateROI, aggregateM365Benchmarks } = require('./processors/roi-calculator');
const { analyzeExpansionOpportunities, calculateExpansionPriorities } = require('./processors/expansion-analyzer');
const { calculateMoMGrowth, calculateTopDepartments, calculateRecentActivity } = require('./processors/adoption-scorer');
const { calculateClaudeEnterpriseAgenticFTE, calculateM365CopilotAgenticFTE, calculateClaudeCodeAgenticFTE, calculateClaudeCodeDepartmentAgenticFTE, applyAgenticFTEToArrays } = require('./agentic-fte-calculator');
const { processConnectorsData } = require('./processors/connectors-processor');
const { processProjectsData } = require('./processors/projects-processor');

// Import aggregator modules
const { aggregateOverviewData } = require('./aggregators/overview-aggregator');
const { aggregateAdoptionData } = require('./aggregators/adoption-aggregator');
const { aggregateCodeData } = require('./aggregators/code-aggregator');
const { aggregateEnablementData } = require('./aggregators/enablement-aggregator');
const { aggregateConnectorsData } = require('./aggregators/connectors-aggregator');
const { aggregateProjectsData } = require('./aggregators/projects-aggregator');

// Load ROI configuration
const roiConfig = require('../../data/roi_config.json');

// ============================================================================
// LICENSE CONFIGURATION
// Will be loaded inside async function using modular ingestor
// ============================================================================

/**
 * Parse Claude Enterprise users CSV to extract license tier information
 * @param {string} csvPath - Path to the Claude Enterprise users CSV file
 * @returns {Map<string, string>} Map of email to license tier ("Premium" or "Standard")
 */
/**
 * Parse Claude Enterprise seat data from JSON file
 * @param {string} jsonPath - Path to claude_enterprise_seats.json
 * @returns {Map<string, string>} Map of email -> seat tier (Premium/Standard)
 */
function parseLicenseTiers(jsonPath) {
  const licenseTiers = new Map();

  try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const seatData = JSON.parse(rawData);

    seatData.users.forEach(user => {
      const email = user.email?.toLowerCase().trim();
      const tier = user.seatTier?.trim();

      if (email && tier) {
        licenseTiers.set(email, tier);
      }
    });

    console.log(`✅ Parsed license tiers for ${licenseTiers.size} users`);
    const premiumCount = Array.from(licenseTiers.values()).filter(t => t === 'Premium').length;
    const standardCount = Array.from(licenseTiers.values()).filter(t => t === 'Standard').length;
    const unassignedCount = Array.from(licenseTiers.values()).filter(t => t === 'Unassigned').length;
    console.log(`   Premium: ${premiumCount}, Standard: ${standardCount}, Unassigned: ${unassignedCount}\n`);
  } catch (error) {
    console.warn(`⚠️  Could not parse license tiers: ${error.message}`);
  }

  return licenseTiers;
}

/**
 * Get license type for a user email
 * @param {string} email - User email address
 * @param {Map<string, string>} licenseTiers - Map of email to license tier
 * @returns {string} "premium" or "standard" (lowercase for consistency)
 */
function getLicenseType(email, licenseTiers) {
  const normalizedEmail = email.toLowerCase().trim();
  const tier = licenseTiers.get(normalizedEmail);
  return tier === 'Premium' ? 'premium' : 'standard';
}

// ============================================================================
// PROCESSOR FUNCTIONS NOW IMPORTED FROM MODULES
// ============================================================================
// Premium allocation: calculatePremiumScore, getDepartmentPremiumBaseline, recommendLicenseAllocation
// Productivity: calculateProductivityMetrics
// ROI: calculateROI, aggregateM365Benchmarks
// Expansion: analyzeExpansionOpportunities (imported), calculateExpansionPriorities (imported)
// Adoption: calculateMoMGrowth, calculateTopDepartments, calculateRecentActivity
//
// Note: calculateExpansionOpportunities (below) is a wrapper around analyzeExpansionOpportunities
// for backward compatibility with the existing positional parameter signature
// ============================================================================

/**
 * Calculate expansion opportunities by department (wrapper for processor module)
 * Maintains backward compatibility with existing call signature
 */
function calculateExpansionOpportunities(deptHeadcounts, deptUserActivities, currentAdoption, pricing, getDepartmentValueMetrics) {
  const opportunities = [];

  for (const [dept, totalEmployees] of Object.entries(deptHeadcounts)) {
    const current = currentAdoption[dept] || { users: 0, premium: 0, standard: 0 };
    const userActivities = deptUserActivities[dept] || [];

    // Get data-driven recommendation for Premium vs Standard allocation
    const recommendation = recommendLicenseAllocation(dept, userActivities, totalEmployees);

    const targetPremium = recommendation.recommendedPremium;
    const targetStandard = recommendation.recommendedStandard;

    // Get department-specific value metrics
    const valueMetrics = getDepartmentValueMetrics(dept);

    // Calculate gaps (how many more licenses needed)
    const standardGap = Math.max(0, targetStandard - current.standard);
    const premiumAdditionsNeeded = Math.max(0, targetPremium - current.premium);
    const excessStandard = Math.max(0, current.standard - targetStandard);
    const upgradesToPremium = Math.min(excessStandard, premiumAdditionsNeeded);
    const premiumGap = premiumAdditionsNeeded - upgradesToPremium;

    const newPremium = premiumGap;
    const newStandard = standardGap;

    // Calculate monthly costs
    const upgradeCost = upgradesToPremium * (pricing.premium - pricing.standard);
    const newPremiumCost = newPremium * pricing.premium;
    const newStandardCost = newStandard * pricing.standard;
    const totalAdditionalCost = upgradeCost + newPremiumCost + newStandardCost;

    // Calculate value
    const totalCurrent = current.standard + current.premium;
    const totalTarget = targetStandard + targetPremium;
    const newUsers = Math.max(0, totalTarget - totalCurrent);
    const newUsersValue = newUsers * valueMetrics.hoursPerUserPerMonth * valueMetrics.avgHourlyRate;
    const incrementalHoursPerUpgrade = 10;
    const upgradesValue = upgradesToPremium * incrementalHoursPerUpgrade * valueMetrics.avgHourlyRate;
    const monthlyOpportunityCost = newUsersValue + upgradesValue;

    // Calculate ROI
    const netBenefit = monthlyOpportunityCost - totalAdditionalCost;
    const roi = totalAdditionalCost > 0 ? monthlyOpportunityCost / totalAdditionalCost : 0;

    // Build detail string
    let detail = null;
    if (upgradesToPremium > 0 || (newPremium > 0 && newStandard > 0)) {
      const parts = [];
      if (newStandard > 0) parts.push(`${newStandard} new Std ($${newStandard * pricing.standard})`);
      if (upgradesToPremium > 0) parts.push(`${upgradesToPremium} Std→Prem upgrades ($${upgradeCost})`);
      if (newPremium > 0) parts.push(`${newPremium} new Premium ($${newPremiumCost})`);
      detail = parts.join(' + ') + ` = $${totalAdditionalCost.toLocaleString()}`;
    }

    opportunities.push({
      department: dept,
      totalEmployees,
      currentUsers: current.users,
      currentStandard: current.standard,
      currentPremium: current.premium,
      powerUsersNeeded: targetPremium,
      targetStandard,
      targetPremium,
      standardGap,
      premiumGap,
      upgradesNeeded: upgradesToPremium,
      newPremiumNeeded: newPremium,
      totalAdditionalCost,
      monthlyOpportunityCost,
      netBenefit,
      roi: parseFloat(roi.toFixed(1)),
      ...(detail && { detail }),
      _recommendationContext: {
        powerUsers: recommendation.powerUsers,
        activeUsers: recommendation.activeUsers,
        avgScore: Math.round(recommendation.averageScore)
      }
    });
  }

  return opportunities.sort((a, b) => b.roi - a.roi);
}

// ============================================================================

// Parse NDJSON file (newline-delimited JSON)
function parseNDJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));
}

// Parse CSV file with proper handling of quoted values
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  // Parse first line to get headers
  const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/﻿/g, ''));

  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i]?.trim() || '';
    });
    return obj;
  });
}

// Helper function to parse a single CSV line with quoted values
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

/**
 * Pipeline Orchestrator
 *
 * Coordinates the entire data processing pipeline from ingestion to output.
 *
 * @param {Object} options - Pipeline configuration options
 * @param {boolean} options.verbose - Enable verbose logging (default: true)
 * @returns {Promise<Object>} Dashboard data object
 */
async function runPipeline(options = {}) {
  const { verbose = true } = options;

// ============================================================================
// LICENSE CONFIGURATION INGESTION (Modularized)
// ============================================================================
const licenseConfigIngestResult = await ingestLicenseConfig({
  csvPath: path.join(__dirname, '../../data/license_config.csv'),
  verbose
});

// Destructure for compatibility with existing code (LICENSE_CONFIG constant)
const LICENSE_CONFIG = {
  m365Copilot: licenseConfigIngestResult.m365Copilot,
  claudeEnterprise: licenseConfigIngestResult.claudeEnterprise,
  claudeCode: licenseConfigIngestResult.claudeCode,
  githubCopilot: licenseConfigIngestResult.githubCopilot
};
// ============================================================================

// ============================================================================
// ORG HIERARCHY INGESTION (Modularized)
// ============================================================================
const orgHierarchyIngestResult = await ingestOrgHierarchy({
  jsonPath: path.join(__dirname, '../../data/techco_org_chart.json'),
  verbose: true
});

// Destructure for compatibility with existing code
const orgEmailMap = orgHierarchyIngestResult.orgEmailMap;
const deptHeadcounts = orgHierarchyIngestResult.deptHeadcounts;
const orgChartData = orgHierarchyIngestResult.orgChart;
// ============================================================================

// ============================================================================
// GITHUB COPILOT INGESTION (Modularized)
// ============================================================================
// Data directory path (used throughout script)
const dataDir = path.join(__dirname, '../../data');

// Use modular ingestor for GitHub Copilot data
const githubCopilotIngestResult = await ingestGitHubCopilot({
  dataDir,
  verbose: true
});

// Destructure for compatibility with existing code
const codeGenData = githubCopilotIngestResult.codeGenData;
const totalLines = githubCopilotIngestResult.metrics.totalLines;
const modelPreferences = githubCopilotIngestResult.metrics.modelPreferences;
const topUsers = githubCopilotIngestResult.metrics.topUsers;
const featureUsage = githubCopilotIngestResult.metrics.featureUsage;

// Convert userMetrics array back to Map for compatibility with existing code
const userMetrics = new Map(
  githubCopilotIngestResult.userMetrics.map(user => [user.username, user])
);
// ============================================================================

// ============================================================================
// CLAUDE CODE INGESTION (Modularized)
// ============================================================================
const claudeCodeIngestResult = await ingestClaudeCode({
  dataDir,
  verbose: true
});

// Destructure for compatibility with existing code
const allClaudeCodeData = claudeCodeIngestResult.userData;
const allClaudeCodeFiles = claudeCodeIngestResult.metadata.fileNames;
const allClaudeCodeFilePaths = claudeCodeIngestResult.metadata.filePaths; // Full paths for later processing
// ============================================================================

// ============================================================================
// STORE GITHUB COPILOT PRODUCTIVITY DATA
// Will be used later to calculate productivity multiplier vs Claude Code
// ============================================================================
const githubCopilotProductivityData = {
  linesPerUser: Math.round(totalLines / userMetrics.size),
  activeUsers: userMetrics.size,
  totalLines: totalLines
};

// Calculate weekly time-series for GitHub Copilot
const weeklyGithubCopilot = new Map(); // week -> { totalLines, users: Set, byDept: {} }

// Helper to get week start date (Monday)
function getWeekStart(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

codeGenData.forEach(entry => {
  const week = getWeekStart(entry.day);
  const username = entry.user_login;
  // GitHub Copilot users are all in Engineering (Ron Slosberg's org)
  const dept = 'Engineering';
  const lines = entry.loc_added_sum || 0;

  if (!weeklyGithubCopilot.has(week)) {
    weeklyGithubCopilot.set(week, { totalLines: 0, users: new Set(), byDept: {} });
  }

  const weekData = weeklyGithubCopilot.get(week);
  weekData.totalLines += lines;
  weekData.users.add(username);

  if (!weekData.byDept[dept]) {
    weekData.byDept[dept] = { lines: 0, users: new Set() };
  }
  weekData.byDept[dept].lines += lines;
  weekData.byDept[dept].users.add(username);
});

// Convert to array and calculate averages
const githubCopilotWeekly = Array.from(weeklyGithubCopilot.entries())
  .map(([week, data]) => ({
    week,
    totalLines: data.totalLines,
    users: data.users.size,
    linesPerUser: Math.round(data.totalLines / data.users.size),
    byDept: Object.entries(data.byDept).map(([dept, deptData]) => ({
      department: dept,
      lines: deptData.lines,
      users: deptData.users.size,
      linesPerUser: Math.round(deptData.lines / deptData.users.size)
    }))
  }))
  .sort((a, b) => a.week.localeCompare(b.week));

console.log(`\n   Weekly trend: ${githubCopilotWeekly.length} weeks of data`);

// Calculate monthly time-series for GitHub Copilot
const monthlyGithubCopilot = new Map(); // month -> { totalLines, users: Set }

codeGenData.forEach(entry => {
  const month = entry.day.substring(0, 7); // Extract YYYY-MM
  const username = entry.user_login;
  const lines = entry.loc_added_sum || 0;

  if (!monthlyGithubCopilot.has(month)) {
    monthlyGithubCopilot.set(month, { totalLines: 0, users: new Set() });
  }

  const monthData = monthlyGithubCopilot.get(month);
  monthData.totalLines += lines;
  monthData.users.add(username);
});

// Convert to array and calculate averages
const githubCopilotMonthly = Array.from(monthlyGithubCopilot.entries())
  .map(([month, data]) => {
    const [year, monthNum] = month.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return {
      month,
      monthLabel: monthNames[parseInt(monthNum) - 1],
      totalLines: data.totalLines,
      users: data.users.size,
      linesPerUser: Math.round(data.totalLines / data.users.size)
    };
  })
  .sort((a, b) => a.month.localeCompare(b.month));

console.log(`   Monthly trend: ${githubCopilotMonthly.length} months of data`);

// Calculate Claude Code metrics (ALL TIME - across all available data)
const claudeCodeUsers = new Map();

allClaudeCodeData.forEach(row => {
  const email = row.User;
  const lines = parseInt(row['Lines this Month']?.replace(/,/g, '') || 0);

  if (!claudeCodeUsers.has(email)) {
    const deptInfo = getDepartmentInfo(email, orgEmailMap);
    claudeCodeUsers.set(email, {
      email: email,
      name: deptInfo.name,
      department: deptInfo.department,
      linesGenerated: 0,
      sessions: 0 // We'll increment this for each CSV row (representing a reporting period)
    });
  }
  const userMetric = claudeCodeUsers.get(email);
  userMetric.linesGenerated += lines;
  if (lines > 0) {
    userMetric.sessions++; // Count months with activity
  }
});

const claudeCodeUsersArray = Array.from(claudeCodeUsers.values());
const claudeCodeActiveUsers = claudeCodeUsersArray.filter(u => u.linesGenerated > 0).length;
const claudeCodeTotalLines = claudeCodeUsersArray.reduce((sum, u) => sum + u.linesGenerated, 0);
const claudeCodeLinesPerUser = claudeCodeActiveUsers > 0 ? Math.round(claudeCodeTotalLines / claudeCodeActiveUsers) : 0;

// Calculate linesPerSession for each user
claudeCodeUsersArray.forEach(user => {
  user.linesPerSession = user.sessions > 0
    ? Math.round(user.linesGenerated / user.sessions)
    : 0;
});

// ============================================================================
// DYNAMIC PRODUCTIVITY MULTIPLIER CALCULATION
// Extract from actual Coding Tools data (Claude Code vs GitHub Copilot)
// ============================================================================
// Note: This needs to happen after GitHub Copilot data is processed (line 464)
// We'll calculate GitHub Copilot's linesPerUser later and then compute the multiplier
// For now, store Claude Code's value for later use
const claudeCodeProductivityData = {
  linesPerUser: claudeCodeLinesPerUser,
  activeUsers: claudeCodeActiveUsers,
  totalLines: claudeCodeTotalLines
};

// Calculate per-user Agentic FTE using modular calculator
const claudeCodeFTEMap = calculateClaudeCodeAgenticFTE(claudeCodeUsersArray);
applyAgenticFTEToArrays(claudeCodeFTEMap, claudeCodeUsersArray);

// Power Users: Top 12 by lines generated (basically the full leaderboard since we only have ~12 users)
const claudeCodePowerUsers = claudeCodeUsersArray
  .filter(u => u.linesGenerated > 0)
  .sort((a, b) => b.linesGenerated - a.linesGenerated)
  .slice(0, 12)
  .map(user => ({
    name: user.name,
    email: user.email,
    department: user.department,
    linesGenerated: user.linesGenerated,
    sessions: user.sessions,
    linesPerSession: user.linesPerSession,
    agenticFTE: user.agenticFTE || 0
  }));

// Low Engagement Users: Users with >0 but <5000 lines (light usage)
const claudeCodeLowEngagement = claudeCodeUsersArray
  .filter(u => u.linesGenerated > 0 && u.linesGenerated < 5000)
  .sort((a, b) => a.linesGenerated - b.linesGenerated)
  .slice(0, 10)
  .map(user => ({
    name: user.name,
    email: user.email,
    department: user.department,
    linesGenerated: user.linesGenerated,
    sessions: user.sessions,
    agenticFTE: user.agenticFTE || 0
  }));

console.log('\n✅ Claude Code Metrics (All Time):');
console.log(`   - Active users: ${claudeCodeActiveUsers}`);
console.log(`   - Total lines generated: ${claudeCodeTotalLines.toLocaleString()}`);
console.log(`   - Lines per user (avg): ${claudeCodeLinesPerUser.toLocaleString()}`);

// Calculate monthly time-series for Claude Code with department breakdown (DYNAMIC)
// Parse month/year from filename: claude_code_team_YYYY_MM_DD_to_YYYY_MM_DD.csv
const claudeCodeMonthly = allClaudeCodeFilePaths.map(({ file, fullPath }) => {
  const data = parseCSV(fullPath);

  // Extract month from filename (format: claude_code_team_YYYY_MM_DD_to_YYYY_MM_DD.csv)
  const match = file.match(/claude_code_team_(\d{4})_(\d{2})_/);
  const year = match ? match[1] : '2025';
  const monthNum = match ? match[2] : '01';
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthLabel = monthNames[parseInt(monthNum) - 1];

  const monthUsers = new Map();
  const deptData = {};

  data.forEach(row => {
    const email = row.User.toLowerCase().trim();
    const lines = parseInt(row['Lines this Month']?.replace(/,/g, '') || 0);
    const dept = getDepartmentInfo(email, orgEmailMap).department;

    if (lines > 0) {
      monthUsers.set(email, lines);

      if (!deptData[dept]) {
        deptData[dept] = { lines: 0, users: new Set() };
      }
      deptData[dept].lines += lines;
      deptData[dept].users.add(email);
    }
  });

  return {
    month: `${year}-${monthNum}`,
    monthLabel,
    totalLines: Array.from(monthUsers.values()).reduce((sum, lines) => sum + lines, 0),
    users: monthUsers.size,
    linesPerUser: monthUsers.size > 0 ? Math.round(Array.from(monthUsers.values()).reduce((sum, lines) => sum + lines, 0) / monthUsers.size) : 0,
    byDept: Object.entries(deptData).map(([dept, data]) => {
      const agenticFTE = calculateClaudeCodeDepartmentAgenticFTE(data.lines);

      return {
        department: dept,
        lines: data.lines,
        users: data.users.size,
        linesPerUser: Math.round(data.lines / data.users.size),
        agenticFTE
      };
    }),
    // Per-user monthly data for MoM trend calculations
    userDetails: Array.from(monthUsers.entries()).map(([email, lines]) => ({
      email,
      lines,
      agenticFTE: calculateClaudeCodeDepartmentAgenticFTE(lines)
    }))
  };
}).sort((a, b) => a.month.localeCompare(b.month));

console.log(`   Monthly trend: ${claudeCodeMonthly.length} months of data`);

console.log('\n📊 Parsing M365 Copilot data...\n');

// Dynamically find all M365 Copilot CSV files (check root and m365-copilot/ subfolder)
const findM365CsvFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(file => file.includes('365') && file.endsWith('.csv') && !file.includes('Agent'))
    .map(file => ({ file, fullPath: path.join(dir, file) }));
};

const m365RootDir = path.join(__dirname, '../../data');
const m365SubfolderDir = path.join(__dirname, '../../data/m365-copilot');
const m365FromRoot = findM365CsvFiles(m365RootDir);
const m365FromSubfolder = findM365CsvFiles(m365SubfolderDir);

// Combine and dedupe (prefer subfolder if same filename exists in both)
const m365FileMap = new Map();
m365FromRoot.forEach(f => m365FileMap.set(f.file, f.fullPath));
m365FromSubfolder.forEach(f => m365FileMap.set(f.file, f.fullPath));
const allM365Files = Array.from(m365FileMap.values());

console.log(`   Found ${allM365Files.length} M365 Copilot report files${m365FromSubfolder.length > 0 ? ` (${m365FromSubfolder.length} from m365-copilot/)` : ''}`);

// Parse each file to identify report periods
const fileMetadata = [];
allM365Files.forEach(filePath => {
  const data = parseCSV(filePath);
  if (data.length === 0) return;

  const reportPeriod = parseInt(data[0]['Report Period']) || 0;
  const reportRefreshDate = data[0]['Report Refresh Date'] || '';

  fileMetadata.push({
    path: filePath,
    filename: path.basename(filePath),
    reportPeriod,
    reportRefreshDate,
    rowCount: data.length,
    data // Keep data for later use
  });
});

// Separate snapshot files from overview files
// Monthly snapshots: 7-day, 30-day (used for sequential delta calculation)
// Quarterly snapshot: 90-day (used to backfill September data)
// Overview: 180-day (used for overall metrics only)
const monthlySnapshots = fileMetadata.filter(f =>
  (f.reportPeriod === 7 || f.reportPeriod === 30) && f.reportRefreshDate
);
const day90Files = fileMetadata.filter(f => f.reportPeriod === 90);
const day180Files = fileMetadata.filter(f => f.reportPeriod === 180);

console.log(`   Found ${monthlySnapshots.length} monthly snapshot files (7/30-day), ${day90Files.length} quarterly files (90-day), and ${day180Files.length} overview files (180-day)`);

// Sort snapshots chronologically by Report Refresh Date
monthlySnapshots.sort((a, b) => {
  // Parse dates (handle YYYY-MM-DD, M/D/YYYY, and M/D/YY formats)
  const parseDate = (dateStr) => {
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(dateStr);
    } else if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}/)) {
      const [month, day, year] = dateStr.split('/');
      const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
      return new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }
    return new Date(0);
  };
  return parseDate(a.reportRefreshDate) - parseDate(b.reportRefreshDate);
});

console.log('\n   Monthly snapshot timeline:');
monthlySnapshots.forEach((f, idx) => {
  console.log(`      ${idx + 1}. ${f.filename} (Refresh: ${f.reportRefreshDate}, Period: ${f.reportPeriod} days, Users: ${f.rowCount})`);
});

// M365 Monthly Snapshot Strategy:
// Monthly date range files (30-day) show prompts DURING that specific month period (not cumulative)
// 180-day overview file shows CUMULATIVE prompts over the entire 6-month period
// For monthly trends, we use each 30-day snapshot directly (no delta calculation)
console.log('\n   Calculating monthly data from snapshots...');

const userPromptHistory = new Map(); // email -> [{snapshot: date, prompts: number}]
const m365ByMonth = new Map(); // month -> { users: Map(email -> prompts), byDept: Map, appUsage: Map }
const m365MonthMetadata = new Map(); // month -> { isPartial: boolean, reportPeriod: number }

// Helper to determine which month to attribute a delta to
function getMonthFromSnapshot(refreshDate, reportPeriod = 30) {
  // Parse refresh date and get the month (use UTC to avoid timezone issues)
  let year, month, day;

  if (refreshDate.match(/^\d{4}-\d{2}-\d{2}/)) {
    // Format: YYYY-MM-DD
    [year, month, day] = refreshDate.split('-').map(Number);
  } else if (refreshDate.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}/)) {
    // Format: M/D/YYYY or MM/DD/YYYY or M/D/YY or MM/DD/YY
    const parts = refreshDate.split('/');
    month = parseInt(parts[0]);
    day = parseInt(parts[1]);
    year = parseInt(parts[2]);
    // Handle 2-digit year (assume 2000+)
    if (year < 100) {
      year = 2000 + year;
    }
  } else {
    console.warn(`Could not parse refresh date: ${refreshDate}`);
    return null;
  }

  // For 7-day reports: Use the refresh date's month directly (it's a partial month snapshot)
  // For 30-day reports refreshed on 1st-10th: Attribute to previous month
  // This is because a report run on Nov 1st contains October activity
  if (reportPeriod === 30 && day <= 10) {
    month = month - 1;
    if (month === 0) {
      month = 12;
      year = year - 1;
    }
  }

  return `${year}-${String(month).padStart(2, '0')}`; // YYYY-MM
}

// Track filtering statistics
let totalM365Users = 0;
let filteredOutUsers = 0;
const nonCurrentEmployees = new Set();

// Process each snapshot chronologically
monthlySnapshots.forEach((snapshot, snapshotIdx) => {
  console.log(`\n   Processing snapshot ${snapshotIdx + 1}/${monthlySnapshots.length}: ${snapshot.filename}`);

  const snapshotDate = snapshot.reportRefreshDate;
  const reportPeriod = snapshot.reportPeriod;
  const month = getMonthFromSnapshot(snapshotDate, reportPeriod);

  snapshot.data.forEach(row => {
    const userEmail = row['User Principal Name']?.toLowerCase().trim();
    if (!userEmail) return;

    totalM365Users++;

    // IMPORTANT: Only count current employees (filter out former employees and non-org-chart users)
    // This resolves email aliases automatically (e.g., seth@techco.com → sturner@techco.com)
    if (!isCurrentEmployee(userEmail, orgEmailMap)) {
      filteredOutUsers++;
      nonCurrentEmployees.add(userEmail);
      return; // Skip this user
    }

    const prompts = parseInt(row['Prompts submitted for All Apps']) || 0;
    const chatWorkPrompts = parseInt(row['Prompts submitted for Copilot Chat (work)']) || 0;
    const chatWebPrompts = parseInt(row['Prompts submitted for Copilot Chat (web)']) || 0;
    const chatPrompts = chatWorkPrompts + chatWebPrompts;
    const contentAppPrompts = prompts - chatPrompts; // Word/Excel/PowerPoint/Teams/Outlook/etc (excludes Chat)

    // Track user's cumulative prompts at this snapshot
    if (!userPromptHistory.has(userEmail)) {
      userPromptHistory.set(userEmail, []);
    }
    userPromptHistory.get(userEmail).push({
      snapshot: snapshotDate,
      prompts,
      chatPrompts,
      contentAppPrompts,
      month,
      reportPeriod,
      snapshotIndex: snapshotIdx,
      lastActivityDate: row['Last Activity Date'],
      row // Keep full row for app usage data
    });
  });
});

// Log filtering statistics
console.log(`\n   📊 M365 User Filtering:`);
console.log(`      Total user records processed: ${totalM365Users}`);
console.log(`      Filtered out (non-current employees): ${filteredOutUsers}`);
console.log(`      Remaining current employees: ${userPromptHistory.size}`);
console.log(`      Unique non-current employees excluded: ${nonCurrentEmployees.size}`);
if (nonCurrentEmployees.size > 0 && nonCurrentEmployees.size <= 10) {
  console.log(`      Examples: ${Array.from(nonCurrentEmployees).slice(0, 10).join(', ')}`);
} else if (nonCurrentEmployees.size > 10) {
  console.log(`      Examples (first 10): ${Array.from(nonCurrentEmployees).slice(0, 10).join(', ')}`);
}

// Now calculate deltas for each user between consecutive snapshots
console.log('\n   Calculating monthly deltas...');
userPromptHistory.forEach((history, userEmail) => {
  // Sort by snapshot date to ensure chronological order
  history.sort((a, b) => {
    const parseDate = (dateStr) => {
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) return new Date(dateStr);
      const [month, day, year] = dateStr.split('/');
      const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
      return new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    };
    return parseDate(a.snapshot) - parseDate(b.snapshot);
  });

  // Calculate delta for each snapshot
  const lastSnapshotIndex = monthlySnapshots.length - 1;

  for (let i = 0; i < history.length; i++) {
    const current = history[i];
    const previous = i > 0 ? history[i - 1] : null;
    const isLastSnapshot = current.snapshotIndex === lastSnapshotIndex;
    const isIncompleteMonth = isLastSnapshot && current.reportPeriod < 30;

    // Monthly snapshots show prompts DURING that specific period (not cumulative)
    // So we use the snapshot data directly without calculating deltas
    // Exception: 180-day overview file shows cumulative data (handled separately)
    let monthlyPrompts = current.prompts;
    let monthlyChatPrompts = current.chatPrompts;
    let monthlyContentAppPrompts = current.contentAppPrompts;

    const month = current.month;

    // Track month metadata
    if (!m365MonthMetadata.has(month)) {
      m365MonthMetadata.set(month, {
        isPartial: isIncompleteMonth,
        reportPeriod: current.reportPeriod
      });
    }

    // Initialize month data
    if (!m365ByMonth.has(month)) {
      m365ByMonth.set(month, {
        users: new Map(),
        chatPrompts: 0,
        contentAppPrompts: 0,
        byDept: new Map(),
        appUsage: {
          'Teams': new Set(),
          'Word': new Set(),
          'Excel': new Set(),
          'PowerPoint': new Set(),
          'Outlook': new Set(),
          'Copilot Chat': new Set()
        },
        appUsageByDept: new Map()
      });
    }

    const monthData = m365ByMonth.get(month);
    const dept = getDepartmentInfo(userEmail, orgEmailMap).department;

    // Add user's monthly prompts
    if (!monthData.users.has(userEmail)) {
      monthData.users.set(userEmail, 0);
    }
    monthData.users.set(userEmail, monthData.users.get(userEmail) + monthlyPrompts);

    // Track chat and content app prompts
    monthData.chatPrompts += monthlyChatPrompts;
    monthData.contentAppPrompts += monthlyContentAppPrompts;

    // Track department data (only for users with prompts > 0)
    if (monthlyPrompts > 0) {
      if (!monthData.byDept.has(dept)) {
        monthData.byDept.set(dept, { users: new Set(), prompts: 0 });
      }
      monthData.byDept.get(dept).users.add(userEmail);
      monthData.byDept.get(dept).prompts += monthlyPrompts;
    }

    // Track app usage (from current snapshot)
    if (!monthData.appUsageByDept.has(dept)) {
      monthData.appUsageByDept.set(dept, {
        'Teams': new Set(),
        'Word': new Set(),
        'Excel': new Set(),
        'PowerPoint': new Set(),
        'Outlook': new Set(),
        'Copilot Chat': new Set()
      });
    }

    // Check app-specific usage
    const row = current.row;
    const appFields = {
      'Teams': 'Last activity date of Teams Copilot (UTC)',
      'Word': 'Last activity date of Word Copilot (UTC)',
      'Excel': 'Last activity date of Excel Copilot (UTC)',
      'PowerPoint': 'Last activity date of PowerPoint Copilot (UTC)',
      'Outlook': 'Last activity date of Outlook Copilot (UTC)',
      'Copilot Chat': 'Last activity date of Copilot Chat (work) (UTC)'
    };

    Object.entries(appFields).forEach(([app, field]) => {
      if (row[field]) {
        monthData.appUsage[app].add(userEmail);
        monthData.appUsageByDept.get(dept)[app].add(userEmail);
      }
    });
  }
});

// Keep 180-day file for overall metrics
let overallM365Metrics = null;
if (day180Files.length > 0) {
  const latestOverview = day180Files.sort((a, b) =>
    b.reportRefreshDate.localeCompare(a.reportRefreshDate)
  )[0];

  console.log(`\n   Using 180-day overview for overall metrics: ${latestOverview.filename}`);

  // Calculate overall metrics from 180-day file
  const allUsers = new Set();
  let totalCumulativePrompts = 0;

  latestOverview.data.forEach(row => {
    const userEmail = row['User Principal Name']?.toLowerCase().trim();
    if (userEmail) {
      allUsers.add(userEmail);
      totalCumulativePrompts += parseInt(row['Prompts submitted for All Apps']) || 0;
    }
  });

  overallM365Metrics = {
    totalActiveUsers: allUsers.size,
    totalCumulativePrompts,
    avgPromptsPerUser: Math.round(totalCumulativePrompts / allUsers.size)
  };

  console.log(`      Total active users (180-day): ${overallM365Metrics.totalActiveUsers}`);
  console.log(`      Total cumulative prompts: ${overallM365Metrics.totalCumulativePrompts.toLocaleString()}`);
  console.log(`      Avg prompts per user: ${overallM365Metrics.avgPromptsPerUser}`);
}

// Use 90-day file to backfill September data
if (day90Files.length > 0) {
  const day90File = day90Files[0];
  console.log(`\n   Using 90-day file to estimate September: ${day90File.filename}`);

  // Build a map of Oct+Nov+Dec prompts per user from delta calculations
  const laterMonthsPrompts = new Map(); // email -> total prompts (Oct+Nov+Dec)

  ['2025-10', '2025-11', '2025-12'].forEach(month => {
    if (m365ByMonth.has(month)) {
      const monthData = m365ByMonth.get(month);
      monthData.users.forEach((prompts, email) => {
        if (!laterMonthsPrompts.has(email)) {
          laterMonthsPrompts.set(email, 0);
        }
        laterMonthsPrompts.set(email, laterMonthsPrompts.get(email) + prompts);
      });
    }
  });

  // Process 90-day file
  day90File.data.forEach(row => {
    const userEmail = row['User Principal Name']?.toLowerCase().trim();
    if (!userEmail) return;

    const total90DayPrompts = parseInt(row['Prompts submitted for All Apps']) || 0;
    const laterMonths = laterMonthsPrompts.get(userEmail) || 0;
    const septemberEstimate = Math.max(0, total90DayPrompts - laterMonths);

    if (septemberEstimate > 0) {
      const sept = '2025-09';

      // Initialize September if not exists
      if (!m365ByMonth.has(sept)) {
        m365ByMonth.set(sept, {
          users: new Map(),
          chatPrompts: 0,
          contentAppPrompts: 0,
          byDept: new Map(),
          appUsage: {
            'Teams': new Set(),
            'Word': new Set(),
            'Excel': new Set(),
            'PowerPoint': new Set(),
            'Outlook': new Set(),
            'Copilot Chat': new Set()
          },
          appUsageByDept: new Map()
        });
      }

      const septData = m365ByMonth.get(sept);
      const dept = getDepartmentInfo(userEmail, orgEmailMap).department;

      // Add user's September prompts
      septData.users.set(userEmail, septemberEstimate);

      // Track department data (only for users with prompts > 0)
      if (septemberEstimate > 0) {
        if (!septData.byDept.has(dept)) {
          septData.byDept.set(dept, { users: new Set(), prompts: 0 });
        }
        septData.byDept.get(dept).users.add(userEmail);
        septData.byDept.get(dept).prompts += septemberEstimate;
      }
    }
  });

  console.log(`      Estimated September prompts from 90-day delta`);
}

// Convert to array format with month labels
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];

const m365Monthly = Array.from(m365ByMonth.entries())
  .map(([month, data]) => {
    const [year, monthNum] = month.split('-');
    // Count only users with prompts > 0 for this specific month (active users)
    const users = Array.from(data.users.values()).filter(prompts => prompts > 0).length;
    const totalPrompts = Array.from(data.users.values()).reduce((sum, prompts) => sum + prompts, 0);
    const chatPrompts = data.chatPrompts || 0;
    const contentAppPrompts = data.contentAppPrompts || 0;
    const metadata = m365MonthMetadata.get(month) || { isPartial: false, reportPeriod: 30 };

    return {
      month,
      monthLabel: monthNames[parseInt(monthNum) - 1],
      users,
      totalPrompts,
      chatPrompts,
      contentAppPrompts,
      promptsPerUser: users > 0 ? Math.round(totalPrompts / users) : 0,
      isPartial: metadata.isPartial,
      reportPeriod: metadata.reportPeriod,
      appUsage: Object.entries(data.appUsage)
        .map(([app, userSet]) => ({ app, users: userSet.size }))
        .sort((a, b) => b.users - a.users),
      byDept: Array.from(data.byDept.entries()).map(([dept, deptData]) => ({
        department: dept,
        users: deptData.users.size,
        prompts: deptData.prompts,
        promptsPerUser: deptData.users.size > 0 ? Math.round(deptData.prompts / deptData.users.size) : 0
      })),
      appUsageByDept: Array.from(data.appUsageByDept.entries()).map(([dept, apps]) => ({
        department: dept,
        apps: Object.entries(apps).map(([app, userSet]) => ({
          app,
          users: userSet.size
        })).sort((a, b) => b.users - a.users)
      }))
    };
  })
  .sort((a, b) => a.month.localeCompare(b.month));

// Use the most recent month for overall metrics
const latestM365 = m365Monthly[m365Monthly.length - 1];

// For "past 30 days" active users count, use the last FULL month (not partial/7-day)
// This matches Microsoft's standard 30-day reporting period
const lastFullMonth = [...m365Monthly].reverse().find(m => !m.isPartial) || latestM365;
const m365ActiveUsers = lastFullMonth.users; // Use last full month for active users (past 30 days)
const totalPrompts = latestM365.totalPrompts;
const latestChatPrompts = latestM365.chatPrompts || 0;
const latestContentAppPrompts = latestM365.contentAppPrompts || 0;
const chatPercentage = totalPrompts > 0 ? ((latestChatPrompts / totalPrompts) * 100).toFixed(1) : 0;
const contentPercentage = totalPrompts > 0 ? ((latestContentAppPrompts / totalPrompts) * 100).toFixed(1) : 0;
const appUsageArray = latestM365.appUsage;

console.log('\n✅ M365 Copilot Metrics:');
console.log(`   - Active users (past 30 days from ${lastFullMonth.monthLabel}): ${m365ActiveUsers}`);
console.log(`   - Total prompts (latest month): ${totalPrompts.toLocaleString()}`);
console.log(`     ├─ Chat prompts (work + web): ${latestChatPrompts.toLocaleString()} (${chatPercentage}%)`);
console.log(`     └─ Content app prompts: ${latestContentAppPrompts.toLocaleString()} (${contentPercentage}%)`);
console.log(`   - Prompts per user (avg): ${Math.round(totalPrompts / m365ActiveUsers)}`);
console.log(`\n   App Usage (latest month):`);
appUsageArray.forEach(({ app, users }) => {
  console.log(`   - ${app}: ${users} users`);
});
console.log(`\n   Monthly trend: ${m365Monthly.length} months of data`);
m365Monthly.forEach(m => {
  const partialNote = m.isPartial ? ` (partial: ${m.reportPeriod}-day snapshot)` : '';
  const mChatPct = m.totalPrompts > 0 ? ((m.chatPrompts / m.totalPrompts) * 100).toFixed(0) : 0;
  console.log(`   - ${m.monthLabel} ${m.month}: ${m.users} users, ${m.totalPrompts.toLocaleString()} prompts (${mChatPct}% chat), ${m.promptsPerUser} per user${partialNote}`);
});

// ============================================================================
// M365 COPILOT DEEP DIVE (180-DAY ANALYSIS) - Modularized
// ============================================================================

// M365 COPILOT INGESTION (Modularized)
const m365IngestResult = await ingestM365Copilot({
  dataDir: path.join(__dirname, '../../data'),
  verbose: true
});

// Destructure for compatibility with existing code
const m365DeepDiveUsers = m365IngestResult.deepDiveUsers;

// Parse and calculate metrics for each user
const m365UserMetrics = [];
const APP_COLUMNS = {
  'Teams Copilot': 'Last activity date of Teams Copilot (UTC)',
  'Copilot Chat (work)': 'Last activity date of Copilot Chat (work) (UTC)',
  'Outlook Copilot': 'Last activity date of Outlook Copilot (UTC)',
  'Word Copilot': 'Last activity date of Word Copilot (UTC)',
  'Excel Copilot': 'Last activity date of Excel Copilot (UTC)',
  'PowerPoint Copilot': 'Last activity date of PowerPoint Copilot (UTC)',
  'M365 App': 'Last activity date of Microsoft 365 Copilot (app) (UTC)'
};

m365DeepDiveUsers.forEach(row => {
  const email = row['User Principal Name']?.toLowerCase().trim();
  if (!email) return;

  // Skip non-current employees
  if (!isCurrentEmployee(email, orgEmailMap)) return;

  const totalPrompts = parseInt(row['Prompts submitted for All Apps'] || 0);
  const activeDays = parseInt(row['Active Usage Days for All Apps'] || 0);
  const promptsPerDay = activeDays > 0 ? (totalPrompts / activeDays) : 0;

  // Calculate which apps the user has used (non-empty last activity date)
  const appsUsed = [];
  Object.entries(APP_COLUMNS).forEach(([appName, columnName]) => {
    if (row[columnName] && row[columnName].trim()) {
      appsUsed.push(appName);
    }
  });

  // Calculate last activity date (most recent across all apps)
  const allActivityDates = Object.values(APP_COLUMNS)
    .map(col => row[col])
    .filter(date => date && date.trim())
    .map(date => new Date(date))
    .filter(date => !isNaN(date.getTime()));

  const lastActivityDate = allActivityDates.length > 0
    ? allActivityDates.reduce((latest, current) => current > latest ? current : latest)
    : null;

  const daysSinceLastActivity = lastActivityDate
    ? Math.floor((new Date() - lastActivityDate) / (1000 * 60 * 60 * 24))
    : null;

  const deptInfo = getDepartmentInfo(email, orgEmailMap);

  m365UserMetrics.push({
    email,
    name: row['Display Name'] || email.split('@')[0],
    department: deptInfo.department,
    totalPrompts,
    activeDays,
    promptsPerDay: parseFloat(promptsPerDay.toFixed(2)),
    appsUsed,
    appUsageScore: parseFloat((appsUsed.length / Object.keys(APP_COLUMNS).length).toFixed(2)),
    lastActivityDate: lastActivityDate ? lastActivityDate.toISOString().split('T')[0] : null,
    daysSinceLastActivity
  });
});

console.log(`   Processed ${m365UserMetrics.length} current employees`);

// Calculate per-user Agentic FTE using modular calculator
const latestM365Month = m365Monthly[m365Monthly.length - 1];
const m365FTEMap = calculateM365CopilotAgenticFTE(m365UserMetrics, latestM365Month);
applyAgenticFTEToArrays(m365FTEMap, m365UserMetrics);

// 1. POWER USERS - Top 20 by total prompts
const powerUsers = m365UserMetrics
  .filter(u => u.totalPrompts > 0)
  .sort((a, b) => b.totalPrompts - a.totalPrompts)
  .slice(0, 20)
  .map((user, idx) => ({
    rank: idx + 1,
    name: user.name,
    email: user.email,
    department: user.department,
    totalPrompts: user.totalPrompts,
    activeDays: user.activeDays,
    promptsPerDay: user.promptsPerDay,
    appsUsed: user.appsUsed,
    appUsageScore: user.appUsageScore,
    agenticFTE: user.agenticFTE || 0
  }));

console.log(`   Top power user: ${powerUsers[0]?.name} (${powerUsers[0]?.totalPrompts} prompts, ${powerUsers[0]?.promptsPerDay} per day)`);

// 2. APP ADOPTION RATES
const appAdoption = {};
// Use ALL m365UserMetrics (all current employees in 180-day window) as the base for adoption rates
// This gives a true adoption percentage across the organization, not just among highly active users
const m365TotalEmployeesInWindow = m365UserMetrics.length;
const activeUsers = m365UserMetrics.filter(u => u.totalPrompts > 0);
const m365TotalActiveUsers = activeUsers.length;

Object.keys(APP_COLUMNS).forEach(appName => {
  const usersWithApp = m365UserMetrics.filter(u => u.appsUsed.includes(appName)).length;
  appAdoption[appName] = {
    app: appName,
    users: usersWithApp,
    percent: parseFloat(((usersWithApp / m365TotalEmployeesInWindow) * 100).toFixed(1))
  };
});

const appAdoptionArray = Object.values(appAdoption).sort((a, b) => b.percent - a.percent);

console.log(`   App adoption rates:`);
appAdoptionArray.forEach(app => {
  console.log(`   - ${app.app}: ${app.users} users (${app.percent}%)`);
});

// 3. USAGE INTENSITY DISTRIBUTION
const intensityBuckets = [
  { range: '0-1', min: 0, max: 1, label: 'Light Users', count: 0 },
  { range: '1-3', min: 1, max: 3, label: 'Regular Users', count: 0 },
  { range: '3-5', min: 3, max: 5, label: 'Engaged Users', count: 0 },
  { range: '5-10', min: 5, max: 10, label: 'Engaged Users', count: 0 },
  { range: '10-20', min: 10, max: 20, label: 'Power Users', count: 0 },
  { range: '20+', min: 20, max: Infinity, label: 'Power Users', count: 0 }
];

activeUsers.forEach(user => {
  for (let bucket of intensityBuckets) {
    if (user.promptsPerDay >= bucket.min && user.promptsPerDay < bucket.max) {
      bucket.count++;
      break;
    }
  }
});

console.log(`   Usage intensity distribution:`);
intensityBuckets.forEach(bucket => {
  console.log(`   - ${bucket.range} prompts/day: ${bucket.count} users`);
});

// 4. USER SEGMENTATION
const powerUserThreshold = 20;
const engagedUserThreshold = 5;
const regularUserThreshold = 1;

const userSegments = {
  powerUsers: {
    count: activeUsers.filter(u => u.promptsPerDay >= powerUserThreshold).length,
    threshold: `${powerUserThreshold}+ prompts/day`
  },
  engagedUsers: {
    count: activeUsers.filter(u => u.promptsPerDay >= engagedUserThreshold && u.promptsPerDay < powerUserThreshold).length,
    threshold: `${engagedUserThreshold}-${powerUserThreshold} prompts/day`
  },
  regularUsers: {
    count: activeUsers.filter(u => u.promptsPerDay >= regularUserThreshold && u.promptsPerDay < engagedUserThreshold).length,
    threshold: `${regularUserThreshold}-${engagedUserThreshold} prompts/day`
  },
  lightUsers: {
    count: activeUsers.filter(u => u.promptsPerDay < regularUserThreshold).length,
    threshold: `<${regularUserThreshold} prompt/day`
  }
};

// Calculate percentages
Object.keys(userSegments).forEach(segment => {
  userSegments[segment].percent = parseFloat(((userSegments[segment].count / m365TotalActiveUsers) * 100).toFixed(1));
});

console.log(`   User segmentation:`);
console.log(`   - Power users: ${userSegments.powerUsers.count} (${userSegments.powerUsers.percent}%)`);
console.log(`   - Engaged users: ${userSegments.engagedUsers.count} (${userSegments.engagedUsers.percent}%)`);
console.log(`   - Regular users: ${userSegments.regularUsers.count} (${userSegments.regularUsers.percent}%)`);
console.log(`   - Light users: ${userSegments.lightUsers.count} (${userSegments.lightUsers.percent}%)`);

// 5. DEPARTMENT PERFORMANCE
const deptPerformance = new Map();

activeUsers.forEach(user => {
  if (!deptPerformance.has(user.department)) {
    deptPerformance.set(user.department, {
      department: user.department,
      users: [],
      totalPrompts: 0,
      totalActiveDays: 0,
      totalAgenticFTE: 0
    });
  }

  const dept = deptPerformance.get(user.department);
  dept.users.push(user);
  dept.totalPrompts += user.totalPrompts;
  dept.totalActiveDays += user.activeDays;
  dept.totalAgenticFTE += (user.agenticFTE || 0);
});

const deptPerformanceArray = Array.from(deptPerformance.values()).map(dept => {
  const avgPrompts = dept.totalPrompts / dept.users.length;
  const avgActiveDays = dept.totalActiveDays / dept.users.length;
  const promptsPerDay = avgActiveDays > 0 ? (avgPrompts / avgActiveDays) : 0;

  // Determine engagement level
  let engagementLevel = 'Low';
  let color = 'red';
  if (promptsPerDay >= 8) {
    engagementLevel = 'High';
    color = 'green';
  } else if (promptsPerDay >= 5) {
    engagementLevel = 'Medium';
    color = 'yellow';
  }

  return {
    department: dept.department,
    userCount: dept.users.length,
    avgPrompts: parseFloat(avgPrompts.toFixed(1)),
    avgActiveDays: parseFloat(avgActiveDays.toFixed(1)),
    avgPromptsPerDay: parseFloat(promptsPerDay.toFixed(2)),
    agenticFTE: parseFloat(dept.totalAgenticFTE.toFixed(2)),
    engagementLevel,
    color
  };
}).sort((a, b) => b.avgPrompts - a.avgPrompts);

console.log(`   Department performance (top 5):`);
deptPerformanceArray.slice(0, 5).forEach(dept => {
  console.log(`   - ${dept.department}: ${dept.avgPrompts} avg prompts, ${dept.avgPromptsPerDay} prompts/day (${dept.engagementLevel})`);
});

// 6. OPPORTUNITIES
const inactiveUsers = m365UserMetrics.filter(u => u.totalPrompts === 0);
const lowEngagementUsers = m365UserMetrics
  .filter(u => u.totalPrompts > 0 && u.totalPrompts < 10)
  .sort((a, b) => a.totalPrompts - b.totalPrompts)
  .slice(0, 20)
  .map(user => ({
    name: user.name,
    email: user.email,
    department: user.department,
    totalPrompts: user.totalPrompts,
    activeDays: user.activeDays,
    promptsPerDay: user.promptsPerDay,
    lastActivity: user.lastActivityDate,
    daysSinceLastActivity: user.daysSinceLastActivity,
    agenticFTE: user.agenticFTE || 0
  }));

// PowerPoint adoption gap (vs Word as baseline)
const wordAdoption = appAdoption['Word Copilot']?.users || 0;
const powerpointAdoption = appAdoption['PowerPoint Copilot']?.users || 0;
const powerpointGap = wordAdoption - powerpointAdoption;

console.log(`   Opportunities identified:`);
console.log(`   - Inactive users: ${inactiveUsers.length} (0 prompts in 180 days)`);
console.log(`   - Low engagement: ${lowEngagementUsers.length} users (<10 prompts)`);
console.log(`   - PowerPoint gap: ${powerpointGap} users (vs Word adoption)`);

// 7. APP USAGE TIME SERIES (Monthly trends from existing m365Monthly data)
const appUsageTimeSeries = m365Monthly.map(month => {
  const monthData = m365ByMonth.get(month.month);
  if (!monthData) return null;

  return {
    month: month.month,
    monthLabel: month.monthLabel,
    teams: monthData.appUsage['Teams']?.size || 0,
    chat: monthData.appUsage['Copilot Chat']?.size || 0,
    outlook: monthData.appUsage['Outlook']?.size || 0,
    word: monthData.appUsage['Word']?.size || 0,
    excel: monthData.appUsage['Excel']?.size || 0,
    powerpoint: monthData.appUsage['PowerPoint']?.size || 0
  };
}).filter(m => m !== null);

// 8. SUMMARY METRICS
const avgPromptsPerDayAll = activeUsers.reduce((sum, u) => sum + u.promptsPerDay, 0) / m365TotalActiveUsers;
const avgActiveDaysAll = activeUsers.reduce((sum, u) => sum + u.activeDays, 0) / m365TotalActiveUsers;
const mostUsedApp = appAdoptionArray[0];

const summaryMetrics = {
  totalActiveUsers: activeUsers.length,
  powerUserCount: userSegments.powerUsers.count,
  powerUserPercent: userSegments.powerUsers.percent,
  avgPromptsPerDay: parseFloat(avgPromptsPerDayAll.toFixed(1)),
  avgActiveDays: parseFloat(avgActiveDaysAll.toFixed(1)),
  avgActiveDaysPercent: parseFloat(((avgActiveDaysAll / 180) * 100).toFixed(1)),
  avgActiveDaysPerWeek: parseFloat((avgActiveDaysAll / 180 * 7).toFixed(1)),
  mostUsedApp: mostUsedApp.app,
  mostUsedAppPercent: mostUsedApp.percent
};

console.log(`✅ M365 Deep Dive Summary:`);
console.log(`   - Power users: ${summaryMetrics.powerUserCount} (${summaryMetrics.powerUserPercent}%)`);
console.log(`   - Avg prompts/day: ${summaryMetrics.avgPromptsPerDay}`);
console.log(`   - Avg active days: ${summaryMetrics.avgActiveDays} (${summaryMetrics.avgActiveDaysPercent}% of 180)`);
console.log(`   - Most used app: ${summaryMetrics.mostUsedApp} (${summaryMetrics.mostUsedAppPercent}%)`);

console.log('\n📊 Parsing M365 Copilot AI Agents data...\n');

// Find M365 Copilot Agents CSV file (DeclarativeAgents)
// Check both root data/ and data/m365-copilot/ subfolder
// Prefer files with "_agents_" in name (per-agent detail format) over per-user summary format
const findAgentsFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(file => file.includes('DeclarativeAgents') && file.endsWith('.csv'))
    .map(file => ({ file, fullPath: path.join(dir, file), isDetailFormat: file.includes('_agents_') }));
};

const rootAgentsFiles = findAgentsFiles(path.join(__dirname, '../../data'));
const subfolderAgentsFiles = findAgentsFiles(path.join(__dirname, '../../data/m365-copilot'));
const allAgentsFiles = [...rootAgentsFiles, ...subfolderAgentsFiles];

// Prefer detail format files (with _agents_ in name), then sort by filename
const detailFormatFiles = allAgentsFiles.filter(f => f.isDetailFormat).sort((a, b) => a.file.localeCompare(b.file));
const summaryFormatFiles = allAgentsFiles.filter(f => !f.isDetailFormat).sort((a, b) => a.file.localeCompare(b.file));
const sortedAgentsFiles = detailFormatFiles.length > 0 ? detailFormatFiles : summaryFormatFiles;

let m365AgentsData = null;

if (sortedAgentsFiles.length > 0) {
  const latestAgentsFile = sortedAgentsFiles[sortedAgentsFiles.length - 1]; // Use most recent detail format file
  console.log(`   Found agents file: ${latestAgentsFile.file}`);

  const agentsFilePath = latestAgentsFile.fullPath;
  const agentsRawData = parseCSV(agentsFilePath);

  console.log(`   Total agent-user combinations: ${agentsRawData.length}`);

  // Parse and aggregate agents data
  const agentTotals = new Map();
  const agentDepartments = new Map();

  agentsRawData.forEach(row => {
    const agentName = row['Agent name'];
    const creatorType = row['Creator type'];
    const username = row['Username']?.toLowerCase();
    const responses = parseInt(row['Responses sent to users']) || 0;

    if (!agentName || !username) return;

    // Initialize agent totals
    if (!agentTotals.has(agentName)) {
      agentTotals.set(agentName, {
        agentName,
        creatorType,
        totalResponses: 0,
        totalUsers: 0,
        userEmails: new Set()
      });
    }

    const agent = agentTotals.get(agentName);
    agent.totalResponses += responses;
    agent.userEmails.add(username);
    agent.totalUsers = agent.userEmails.size;

    // Map to department
    const userEmail = username;
    const deptInfo = getDepartmentInfo(userEmail, orgEmailMap);
    const userDept = deptInfo.department;

    if (responses > 0 && userDept) {
      // Initialize department breakdown for this agent
      if (!agentDepartments.has(agentName)) {
        agentDepartments.set(agentName, new Map());
      }

      const deptMap = agentDepartments.get(agentName);
      if (!deptMap.has(userDept)) {
        deptMap.set(userDept, { responses: 0, users: new Set() });
      }

      const deptData = deptMap.get(userDept);
      deptData.responses += responses;
      deptData.users.add(username);
    }
  });

  // Convert to sorted arrays
  const topAgentsByUsage = Array.from(agentTotals.values())
    .filter(a => a.totalResponses > 0) // Only agents with activity
    .sort((a, b) => b.totalResponses - a.totalResponses)
    .slice(0, 10)
    .map(agent => ({
      agentName: agent.agentName,
      creatorType: agent.creatorType,
      totalResponses: agent.totalResponses,
      totalUsers: agent.totalUsers
    }));

  const topAgentsByDepartment = Array.from(agentTotals.values())
    .filter(a => a.totalResponses > 0) // Only agents with activity
    .sort((a, b) => b.totalResponses - a.totalResponses)
    .slice(0, 10)
    .map(agent => {
      const deptMap = agentDepartments.get(agent.agentName) || new Map();
      const departments = Array.from(deptMap.entries()).map(([dept, data]) => ({
        department: dept,
        responses: data.responses,
        users: data.users.size
      })).sort((a, b) => b.responses - a.responses);

      return {
        agentName: agent.agentName,
        creatorType: agent.creatorType,
        totalResponses: agent.totalResponses,
        totalUsers: agent.totalUsers,
        byDepartment: departments
      };
    });

  // Count creator types
  const creatorTypeBreakdown = {};
  agentsRawData.forEach(row => {
    const creatorType = row['Creator type'];
    if (creatorType) {
      creatorTypeBreakdown[creatorType] = (creatorTypeBreakdown[creatorType] || 0) + 1;
    }
  });

  m365AgentsData = {
    topAgentsByUsage,
    topAgentsByDepartment,
    creatorTypeBreakdown,
    totalAgentUserCombinations: agentsRawData.length,
    activeAgentUserCombinations: agentsRawData.filter(r => parseInt(r['Responses sent to users']) > 0).length
  };

  console.log(`   Active combinations (responses > 0): ${m365AgentsData.activeAgentUserCombinations}`);
  console.log(`   Top agent: ${topAgentsByUsage[0]?.agentName} (${topAgentsByUsage[0]?.totalResponses} responses, ${topAgentsByUsage[0]?.totalUsers} users)`);
  console.log(`   Creator types: ${Object.keys(creatorTypeBreakdown).length}`);
} else {
  console.log(`   ⚠️  No agents file found`);
}

// ============================================================================
// CLAUDE ENTERPRISE INGESTION (Modularized)
// ============================================================================
const claudeEnterpriseIngestResult = await ingestClaudeEnterprise({
  dataDir,
  tmpDir: path.join(__dirname, '../../data/claude-monthly-data'),
  verbose: true
});

// Destructure for compatibility with existing code
const monthlyConversations = claudeEnterpriseIngestResult.conversations;
const monthlyProjects = claudeEnterpriseIngestResult.projects;
const allUsers = claudeEnterpriseIngestResult.users;
const userEmailLookup = claudeEnterpriseIngestResult.userEmailLookup;
// ============================================================================

// ============================================================================
// CONNECTORS/INTEGRATIONS INGESTION & PROCESSING
// ============================================================================
let connectorsData = null;
try {
  const connectorsIngestResult = await ingestConnectors({
    dataDir,
    verbose: true
  });

  // Process connectors data with department enrichment
  const connectorsProcessed = await processConnectorsData({
    byUser: connectorsIngestResult.byUser,
    byIntegration: connectorsIngestResult.byIntegration,
    byTool: connectorsIngestResult.byTool,
    userEmailLookup: connectorsIngestResult.userEmailLookup,
    orgEmailMap,
    toolCalls: connectorsIngestResult.toolCalls,
    verbose: true
  });

  // Aggregate for dashboard
  connectorsData = await aggregateConnectorsData({
    byUser: connectorsProcessed.byUser,
    byIntegration: connectorsProcessed.byIntegration,
    byDepartment: connectorsProcessed.byDepartment,
    monthlyTrend: connectorsProcessed.monthlyTrend,
    metrics: connectorsIngestResult.metrics,
    verbose: true
  });
} catch (error) {
  console.warn(`⚠️  Connectors processing skipped: ${error.message}`);
  connectorsData = {
    summary: { totalCalls: 0, uniqueIntegrations: 0, usersWithUsage: 0, avgCallsPerUser: 0, topIntegration: 'N/A' },
    byIntegration: [],
    byDepartment: [],
    byUser: [],
    powerUsers: [],
    monthlyTrend: [],
    insights: {}
  };
}
// ============================================================================

// ============================================================================
// CLAUDE PROJECTS PROCESSING
// ============================================================================
let projectsData = null;
try {
  // Process enriched projects data
  const projectsProcessed = await processProjectsData({
    projectsEnriched: claudeEnterpriseIngestResult.projectsEnriched,
    creatorUUIDtoEmail: claudeEnterpriseIngestResult.creatorUUIDtoEmail,
    userEmailLookup: claudeEnterpriseIngestResult.userEmailLookup,
    orgEmailMap,
    verbose: true
  });

  // Aggregate for dashboard
  projectsData = await aggregateProjectsData({
    projects: projectsProcessed.projects,
    byDepartment: projectsProcessed.byDepartment,
    byCreator: projectsProcessed.byCreator,
    byCategory: projectsProcessed.byCategory,
    monthlyTrend: projectsProcessed.monthlyTrend,
    metadata: projectsProcessed.metadata,
    verbose: true
  });
} catch (error) {
  console.warn(`⚠️  Projects processing skipped: ${error.message}`);
  projectsData = {
    summary: { totalProjects: 0, activeProjects: 0, uniqueCreators: 0, withDocs: 0, withPrompts: 0, avgSophistication: 0 },
    topProjects: [],
    byDepartment: [],
    byCreator: [],
    byCategory: [],
    monthlyTrend: [],
    featuredProjects: [],
    insights: {}
  };
}
// ============================================================================

// Track overall metrics
const activeUserUUIDs = new Set();
const uniqueConversations = new Set();

// Count artifacts from conversations (only Claude-generated: sender === "assistant")
// Count files uploaded by humans (sender === "human")
let totalArtifacts = 0;
let totalFilesUploaded = 0;
monthlyConversations.forEach(conv => {
  if (conv.uuid) uniqueConversations.add(conv.uuid);
  if (conv.account?.uuid) activeUserUUIDs.add(conv.account.uuid);

  // Count artifacts generated by Claude (sender: "assistant")
  // Count files uploaded by humans (sender: "human")
  if (conv.chat_messages) {
    conv.chat_messages.forEach(msg => {
      // Count artifacts from Claude's responses
      if (msg.sender === 'assistant') {
        if (msg.attachments && msg.attachments.length > 0) {
          totalArtifacts += msg.attachments.length;
        }
        if (msg.files && msg.files.length > 0) {
          totalArtifacts += msg.files.length;
        }
      }
      // Count files uploaded by humans
      if (msg.sender === 'human') {
        if (msg.attachments && msg.attachments.length > 0) {
          totalFilesUploaded += msg.attachments.length;
        }
        if (msg.files && msg.files.length > 0) {
          totalFilesUploaded += msg.files.length;
        }
      }
    });
  }
});

// Count unique projects
const uniqueProjectUUIDs = new Set();
monthlyProjects.forEach(project => {
  if (project.uuid) uniqueProjectUUIDs.add(project.uuid);
});

// Note: activeUserUUIDs.size gives cumulative count across ALL months (87)
// We'll calculate actual active users from latest month after building monthly array
const claudeEnterpriseTotalConversations = uniqueConversations.size;
const claudeEnterpriseTotalProjects = uniqueProjectUUIDs.size;
const claudeEnterpriseTotalArtifacts = totalArtifacts;
const claudeEnterpriseTotalFilesUploaded = totalFilesUploaded;

// Calculate total messages (will be summed from user metrics after they're built)
let claudeEnterpriseTotalMessages = 0;

// Build user-level metrics for Claude Enterprise
const claudeEnterpriseUserMetrics = new Map();

monthlyConversations.forEach(conv => {
  const userUUID = conv.account?.uuid;
  if (!userUUID) return;

  const userEmail = userEmailLookup.get(userUUID);
  if (!userEmail) return;

  const deptInfo = getDepartmentInfo(userEmail, orgEmailMap);
  const department = deptInfo.department;
  const name = deptInfo.name;

  if (!claudeEnterpriseUserMetrics.has(userEmail)) {
    claudeEnterpriseUserMetrics.set(userEmail, {
      email: userEmail,
      name: name,
      department: department,
      conversations: 0,
      messages: 0,
      artifacts: 0,
      filesUploaded: 0,
      lastActivity: null
    });
  }

  const userMetric = claudeEnterpriseUserMetrics.get(userEmail);
  userMetric.conversations++;

  // Count messages
  const messageCount = conv.chat_messages ? conv.chat_messages.length : 0;
  userMetric.messages += messageCount;

  // Count artifacts generated by Claude AND files uploaded by user
  if (conv.chat_messages) {
    conv.chat_messages.forEach(msg => {
      if (msg.sender === 'assistant') {
        // Count Claude-generated artifacts
        if (msg.attachments && msg.attachments.length > 0) {
          userMetric.artifacts += msg.attachments.length;
        }
        if (msg.files && msg.files.length > 0) {
          userMetric.artifacts += msg.files.length;
        }
      } else if (msg.sender === 'human') {
        // Count user-uploaded files (data integration)
        if (msg.files && msg.files.length > 0) {
          userMetric.filesUploaded += msg.files.length;
        }
      }
    });
  }

  // Track last activity
  const timestamp = conv.created_at || conv.updated_at;
  if (timestamp) {
    if (!userMetric.lastActivity || timestamp > userMetric.lastActivity) {
      userMetric.lastActivity = timestamp;
    }
  }
});

// Calculate avgMessagesPerConv and composite power user score for each user
claudeEnterpriseUserMetrics.forEach((metric, email) => {
  metric.avgMessagesPerConv = metric.conversations > 0
    ? parseFloat((metric.messages / metric.conversations).toFixed(1))
    : 0;

  // Calculate days since last activity
  if (metric.lastActivity) {
    const lastActivityDate = new Date(metric.lastActivity);
    const today = new Date();
    metric.daysSinceLastActivity = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));
  } else {
    metric.daysSinceLastActivity = 999;
  }

  // Calculate composite power user score
  // Formula: (artifacts × 50) + (filesUploaded × 10) + (conversations × 2) + efficiencyBonus
  let baseScore = (metric.artifacts * 50) +
                  (metric.filesUploaded * 10) +
                  (metric.conversations * 2);

  // Efficiency bonuses (reward users who produce artifacts efficiently)
  let efficiencyBonus = 0;
  if (metric.artifacts > 0 && metric.avgMessagesPerConv < 8) {
    efficiencyBonus += 100; // Efficient prompting
  }
  if (metric.artifacts > 5 && metric.conversations < 20) {
    efficiencyBonus += 200; // Highly efficient
  }

  baseScore += efficiencyBonus;

  // Apply recency multiplier
  let recencyMultiplier = 1.0;
  if (metric.daysSinceLastActivity <= 7) {
    recencyMultiplier = 1.2; // 20% bonus - active
  } else if (metric.daysSinceLastActivity <= 30) {
    recencyMultiplier = 1.0; // neutral
  } else if (metric.daysSinceLastActivity <= 60) {
    recencyMultiplier = 0.8; // 20% penalty - declining
  } else {
    recencyMultiplier = 0.5; // 50% penalty - stale
  }

  metric.powerUserScore = Math.round(baseScore * recencyMultiplier);
});

// Convert to array for sorting/filtering
const claudeEnterpriseUsersArray = Array.from(claudeEnterpriseUserMetrics.values());

// Calculate total messages by summing all user messages
claudeEnterpriseUsersArray.forEach(user => {
  claudeEnterpriseTotalMessages += user.messages;
});

// Power Users: Top 15 by composite power user score
const claudeEnterprisePowerUsers = claudeEnterpriseUsersArray
  .filter(u => u.messages > 0)
  .sort((a, b) => b.powerUserScore - a.powerUserScore)
  .slice(0, 15)
  .map(user => ({
    name: user.name,
    email: user.email,
    department: user.department,
    conversations: user.conversations,
    messages: user.messages,
    artifacts: user.artifacts,
    filesUploaded: user.filesUploaded,
    avgMessagesPerConv: user.avgMessagesPerConv,
    daysSinceLastActivity: user.daysSinceLastActivity,
    powerUserScore: user.powerUserScore,
    agenticFTE: user.agenticFTE || 0
  }));

// Department Breakdown: Aggregate Claude Enterprise usage by department
const claudeEnterpriseDeptMap = new Map();
claudeEnterpriseUsersArray.forEach(user => {
  if (!user.department) return;

  if (!claudeEnterpriseDeptMap.has(user.department)) {
    claudeEnterpriseDeptMap.set(user.department, {
      department: user.department,
      users: 0,
      conversations: 0,
      messages: 0,
      artifacts: 0,
      filesUploaded: 0,
      agenticFTE: 0,
      topUser: null
    });
  }

  const dept = claudeEnterpriseDeptMap.get(user.department);
  dept.users++;
  dept.conversations += user.conversations;
  dept.messages += user.messages;
  dept.artifacts += user.artifacts;
  dept.filesUploaded += user.filesUploaded;
  dept.agenticFTE += (user.agenticFTE || 0);

  // Track top power user for this department
  if (!dept.topUser || user.powerUserScore > dept.topUser.powerUserScore) {
    dept.topUser = {
      name: user.name,
      powerUserScore: user.powerUserScore,
      conversations: user.conversations,
      messages: user.messages,
      artifacts: user.artifacts
    };
  }
});

const claudeEnterpriseDepartmentBreakdown = Array.from(claudeEnterpriseDeptMap.values())
  .map(dept => ({
    ...dept,
    avgConversationsPerUser: dept.users > 0 ? Math.round(dept.conversations / dept.users) : 0,
    avgMessagesPerUser: dept.users > 0 ? Math.round(dept.messages / dept.users) : 0,
    avgArtifactsPerUser: dept.users > 0 ? parseFloat((dept.artifacts / dept.users).toFixed(1)) : 0
  }))
  .sort((a, b) => b.messages - a.messages);

// Low Engagement Users: Users with >0 but <50 messages (enablement targets)
const claudeEnterpriseLowEngagement = claudeEnterpriseUsersArray
  .filter(u => u.messages > 0 && u.messages < 50)
  .sort((a, b) => a.messages - b.messages)
  .slice(0, 20)
  .map(user => ({
    name: user.name,
    email: user.email,
    department: user.department,
    conversations: user.conversations,
    messages: user.messages,
    daysSinceLastActivity: user.daysSinceLastActivity,
    agenticFTE: user.agenticFTE || 0
  }));

// ============================================================================
// EXPANSION ROI CALCULATION - Merge Claude Code data and build activity structure
// ============================================================================

// Step 1: Merge Claude Code lines into claudeEnterpriseUserMetrics
claudeCodeUsers.forEach((codeUser, email) => {
  if (claudeEnterpriseUserMetrics.has(email)) {
    // User exists in both systems - add Claude Code lines
    const metric = claudeEnterpriseUserMetrics.get(email);
    metric.claudeCodeLines = codeUser.linesGenerated;
  } else {
    // User only uses Claude Code - add new entry
    claudeEnterpriseUserMetrics.set(email, {
      email: codeUser.email,
      name: codeUser.name,
      department: codeUser.department,
      conversations: 0,
      messages: 0,
      artifacts: 0,
      filesUploaded: 0,
      claudeCodeLines: codeUser.linesGenerated,
      lastActivity: null
    });
  }
});

// Ensure all Claude Enterprise users have claudeCodeLines field
claudeEnterpriseUserMetrics.forEach((metric) => {
  if (!metric.claudeCodeLines) {
    metric.claudeCodeLines = 0;
  }
});

// Step 1.5: Merge M365 Copilot engagement data
// CRITICAL: M365 data is used as SIGNALS for Premium scoring, NOT for license counting
// M365-only users (no Claude license) are kept separate to avoid counting them as Claude users
console.log('\n📊 Merging M365 Copilot engagement data...');
let m365OnlyUsers = 0;
let enrichedClaudeUsers = 0;

// Create separate map for M365-only users (users without Claude Enterprise)
const m365OnlyUserMetrics = new Map();

m365UserMetrics.forEach(m365User => {
  const email = m365User.email;

  if (claudeEnterpriseUserMetrics.has(email)) {
    // Enrich existing Claude user with M365 engagement signals
    const metric = claudeEnterpriseUserMetrics.get(email);
    metric.m365PromptsPerDay = m365User.promptsPerDay;
    metric.m365ActiveDays = m365User.activeDays;
    metric.m365TotalPrompts = m365User.totalPrompts;
    metric.m365AppsUsed = m365User.appsUsed.length;
    enrichedClaudeUsers++;
  } else {
    // Store M365-only user separately (NOT in claudeEnterpriseUserMetrics)
    // These users don't have Claude licenses but their M365 engagement signals
    // help identify high-potential candidates who should get Claude Premium
    m365OnlyUserMetrics.set(email, {
      email: m365User.email,
      name: m365User.name,
      department: m365User.department,
      conversations: 0,
      messages: 0,
      artifacts: 0,
      filesUploaded: 0,
      claudeCodeLines: 0,
      m365PromptsPerDay: m365User.promptsPerDay,
      m365ActiveDays: m365User.activeDays,
      m365TotalPrompts: m365User.totalPrompts,
      m365AppsUsed: m365User.appsUsed.length,
      lastActivity: null,
      hasClaudeLicense: false // Flag to track these are M365-only
    });
    m365OnlyUsers++;
  }
});

console.log(`   ✅ Enriched ${enrichedClaudeUsers} Claude users with M365 data`);
console.log(`   ✅ Found ${m365OnlyUsers} M365-only users (potential Claude candidates)`);

// Ensure all Claude users have M365 fields (default to 0 if missing)
claudeEnterpriseUserMetrics.forEach((metric) => {
  if (!metric.m365PromptsPerDay) {
    metric.m365PromptsPerDay = 0;
    metric.m365ActiveDays = 0;
    metric.m365TotalPrompts = 0;
    metric.m365AppsUsed = 0;
  }
  metric.hasClaudeLicense = true; // Flag to track these have Claude
});

// Step 2: Group users by department to create deptUserActivities
// Include BOTH Claude users AND M365-only users for Premium scoring/recommendations
// M365-only users help identify high-potential candidates who should get Claude Premium
const deptUserActivities = {};

// Add Claude Enterprise users (these have actual licenses)
claudeEnterpriseUserMetrics.forEach((userMetric) => {
  const dept = userMetric.department;
  if (!dept || dept === 'Unknown') return;

  if (!deptUserActivities[dept]) {
    deptUserActivities[dept] = [];
  }

  deptUserActivities[dept].push({
    email: userMetric.email,
    name: userMetric.name,
    conversations: userMetric.conversations,
    artifacts: userMetric.artifacts,
    filesUploaded: userMetric.filesUploaded,
    claudeCodeLines: userMetric.claudeCodeLines,
    // M365 Copilot engagement metrics (for Premium scoring)
    m365PromptsPerDay: userMetric.m365PromptsPerDay || 0,
    m365ActiveDays: userMetric.m365ActiveDays || 0,
    m365TotalPrompts: userMetric.m365TotalPrompts || 0,
    m365AppsUsed: userMetric.m365AppsUsed || 0,
    hasClaudeLicense: true
  });
});

// Add M365-only users (these DON'T have Claude licenses yet, but are candidates)
m365OnlyUserMetrics.forEach((userMetric) => {
  const dept = userMetric.department;
  if (!dept || dept === 'Unknown') return;

  if (!deptUserActivities[dept]) {
    deptUserActivities[dept] = [];
  }

  deptUserActivities[dept].push({
    email: userMetric.email,
    name: userMetric.name,
    conversations: userMetric.conversations,
    artifacts: userMetric.artifacts,
    filesUploaded: userMetric.filesUploaded,
    claudeCodeLines: userMetric.claudeCodeLines,
    // M365 Copilot engagement metrics (for Premium scoring)
    m365PromptsPerDay: userMetric.m365PromptsPerDay || 0,
    m365ActiveDays: userMetric.m365ActiveDays || 0,
    m365TotalPrompts: userMetric.m365TotalPrompts || 0,
    m365AppsUsed: userMetric.m365AppsUsed || 0,
    hasClaudeLicense: false // These are M365-only users (no Claude yet)
  });
});

// Step 3: Get department headcounts from org hierarchy (now from ingestor above)

// Step 4: Calculate current adoption per department with license type breakdown
const licenseTiers = parseLicenseTiers(path.join(__dirname, '../../data/claude_enterprise_seats.json'));

// CRITICAL: Add all licensed users to claudeEnterpriseUserMetrics
// This ensures users with licenses but no activity are included in expansion analysis
console.log(`\n📋 Adding licensed users to metrics...`);
let addedUsersCount = 0;
licenseTiers.forEach((tier, email) => {
  // Skip Unassigned users - they don't have actual licenses
  if (tier === 'Unassigned') return;

  if (!claudeEnterpriseUserMetrics.has(email)) {
    // This is a licensed user with no activity yet - add them
    const deptInfo = getDepartmentInfo(email, orgEmailMap);
    claudeEnterpriseUserMetrics.set(email, {
      email: email,
      name: deptInfo.name,
      department: deptInfo.department,
      conversations: 0,
      messages: 0,
      artifacts: 0,
      filesUploaded: 0,
      claudeCodeLines: 0,
      lastActivity: null
    });
    addedUsersCount++;
  }
});
console.log(`   ✅ Added ${addedUsersCount} licensed users with no activity`);
console.log(`   📊 Total users in claudeEnterpriseUserMetrics: ${claudeEnterpriseUserMetrics.size}\n`);

const currentAdoption = {};
let unknownDeptCount = 0;
let knownDeptCount = 0;
let unlicensedCount = 0;
claudeEnterpriseUserMetrics.forEach((userMetric) => {
  // Filter 1: Exclude users without licenses (activity but no current license)
  if (!licenseTiers.has(userMetric.email) || licenseTiers.get(userMetric.email) === 'Unassigned') {
    unlicensedCount++;
    return;
  }

  // Filter 2: Exclude users without department mapping
  const dept = userMetric.department;
  if (!dept || dept === 'Unknown') {
    unknownDeptCount++;
    return;
  }
  knownDeptCount++;

  if (!currentAdoption[dept]) {
    currentAdoption[dept] = {
      users: 0,
      premium: 0,
      standard: 0
    };
  }

  currentAdoption[dept].users++;

  const licenseType = getLicenseType(userMetric.email, licenseTiers);
  if (licenseType === 'premium') {
    currentAdoption[dept].premium++;
  } else {
    currentAdoption[dept].standard++;
  }
});

console.log(`\n📊 Department Matching Summary:`);
console.log(`   Total users in metrics: ${claudeEnterpriseUserMetrics.size}`);
console.log(`   ❌ No license (filtered): ${unlicensedCount}`);
console.log(`   ❌ Unknown department (filtered): ${unknownDeptCount}`);
console.log(`   ✅ Matched & licensed: ${knownDeptCount}`);
console.log(`   Expected licensed users: 115 (41 Premium + 74 Standard)\n`);

/// Step 5: Define pricing (from roi_config.json)
const pricing = {
  premium: roiConfig.pricing.claudeCodePremium,
  standard: roiConfig.pricing.claudeEnterpriseStandard
};

// ============================================================================
// STEP 5.5: DYNAMIC VALUE METRICS CALCULATION
// Calculate department-specific value metrics using actual productivity data
// ============================================================================

// Calculate productivity multiplier from Coding Tools data
const productivityMultiplier = githubCopilotProductivityData.linesPerUser > 0
  ? claudeCodeProductivityData.linesPerUser / githubCopilotProductivityData.linesPerUser
  : 0;

console.log(`\n💡 Productivity Multiplier Calculation (Claude Code vs GitHub Copilot):`);
console.log(`   - GitHub Copilot: ${githubCopilotProductivityData.linesPerUser.toLocaleString()} lines/user`);
console.log(`   - Claude Code: ${claudeCodeProductivityData.linesPerUser.toLocaleString()} lines/user`);
console.log(`   - Multiplier: ${productivityMultiplier.toFixed(1)}x`);

// Engineering-specific value metrics (from roi_config.json + derived from productivity data)
// Formula: If Claude Code is Nx more productive (calculated from actual data), and a line
// of code represents time saved, then engineers save significantly more time with Claude Code
//
// Assumptions for Engineering (from roi_config.json):
// - Average engineer salary, working hours, hourly rate are configurable
// - Productivity multiplier calculated from actual Claude Code vs GitHub Copilot usage
// - Time saved calculated dynamically based on the productivity multiplier
//
// This is extracted dynamically based on the productivity multiplier, not hardcoded
const engineerAnnualSalary = roiConfig.engineeringMetrics.annualSalary;
const hoursPerYear = roiConfig.engineeringMetrics.hoursPerYear;
const engineerHourlyRate = roiConfig.engineeringMetrics.hourlyRate;

// ============================================================================
// SHARED TIME SAVINGS CONSTANTS (from roi_config.json + calculated)
// ============================================================================
// Baseline: configurable hours/month for non-coding productivity tools
// Claude Code: baseline × (productivityMultiplier / conservativeFactor) for engineering/coding
const BASELINE_HOURS_SAVED = roiConfig.assumptions.baselineHoursSaved; // Configurable baseline
const conservativeFactor = roiConfig.assumptions.productivityMultiplierConservativeFactor; // Conservative estimate (divide by 2)
const CLAUDE_CODE_HOURS_SAVED = Math.round(BASELINE_HOURS_SAVED * (productivityMultiplier / conservativeFactor));

console.log(`\n💰 Engineering Value Calculation:`);
console.log(`   - Baseline hours saved: ${BASELINE_HOURS_SAVED} hrs/user/month (non-engineering)`);
console.log(`   - Claude Code hours saved: ${CLAUDE_CODE_HOURS_SAVED} hrs/user/month (with ${productivityMultiplier.toFixed(1)}x multiplier)`);
console.log(`   - Engineer hourly rate: $${Math.round(engineerHourlyRate)}/hour`);
console.log(`   - Value per engineer per month: $${Math.round(CLAUDE_CODE_HOURS_SAVED * engineerHourlyRate).toLocaleString()}`);
console.log(`   - Annual value per engineer: $${Math.round(CLAUDE_CODE_HOURS_SAVED * engineerHourlyRate * 12).toLocaleString()}`);

// Create department-specific value metrics function (uses shared constants from roi_config.json)
function getDepartmentValueMetrics(department) {
  // Engineering departments get Claude Code productivity metrics
  if (department === 'Engineering' || department === 'Product' || department.includes('Engineering')) {
    return {
      hoursPerUserPerMonth: CLAUDE_CODE_HOURS_SAVED,
      avgHourlyRate: Math.round(engineerHourlyRate),
      productivityMultiplier: productivityMultiplier,
      dataSource: 'Derived from Claude Code vs GitHub Copilot productivity comparison'
    };
  }

  // Default for other departments (baseline from roi_config.json)
  return {
    hoursPerUserPerMonth: BASELINE_HOURS_SAVED,
    avgHourlyRate: roiConfig.generalMetrics.avgHourlyRate,
    productivityMultiplier: 1.0,
    dataSource: 'Baseline estimate for non-engineering departments'
  };
}

// ============================================================================
// CALCULATE INCREMENTAL ROI (GitHub Copilot → Claude Code, M365 → Claude Enterprise)
// ============================================================================
console.log('\n💰 Calculating Incremental ROI...\n');

/**
 * Calculate incremental ROI for GitHub Copilot → Claude Code Premium scenario
 */
function calculateGitHubToClaudeCodeIncrementalROI() {
  // GitHub Copilot baseline hours (derived from Claude Code hours and productivity multiplier)
  // Formula: CLAUDE_CODE_HOURS_SAVED / (multiplier / conservativeFactor)
  const githubCopilotBaselineHours = Math.round(CLAUDE_CODE_HOURS_SAVED / (productivityMultiplier / conservativeFactor));

  // Incremental metrics (data-driven) - shared values
  const incrementalHours = CLAUDE_CODE_HOURS_SAVED - githubCopilotBaselineHours;
  const incrementalValue = Math.round(incrementalHours * engineerHourlyRate);

  // REPLACEMENT SCENARIO: Cancel GitHub ($19), Add Claude Code ($200) = Net $181
  const replacementCost = roiConfig.pricing.claudeCodePremium - roiConfig.pricing.githubCopilot;
  const replacementROI = replacementCost > 0 ? parseFloat((incrementalValue / replacementCost).toFixed(1)) : 0;

  // ADDITIVE SCENARIO: Keep GitHub ($19) + Add Claude Code ($200) = $200 incremental cost
  const additiveCost = roiConfig.pricing.claudeCodePremium;
  const additiveROI = additiveCost > 0 ? parseFloat((incrementalValue / additiveCost).toFixed(1)) : 0;

  // Industry benchmark ROI (if available)
  const industryGHBenchmark = roiConfig.industryBenchmarks?.githubCopilot?.software_engineer;
  let benchmarkReplacementROI = null;
  let benchmarkAdditiveROI = null;
  let benchmarkIncrementalHours = null;
  let benchmarkIncrementalValue = null;

  if (industryGHBenchmark && industryGHBenchmark.hoursSavedPerMonth) {
    benchmarkIncrementalHours = CLAUDE_CODE_HOURS_SAVED - industryGHBenchmark.hoursSavedPerMonth;
    benchmarkIncrementalValue = Math.round(benchmarkIncrementalHours * engineerHourlyRate);
    benchmarkReplacementROI = replacementCost > 0 ? parseFloat((benchmarkIncrementalValue / replacementCost).toFixed(1)) : 0;
    benchmarkAdditiveROI = additiveCost > 0 ? parseFloat((benchmarkIncrementalValue / additiveCost).toFixed(1)) : 0;
  }

  // Calculate deltas
  const replacementDelta = benchmarkReplacementROI ? replacementROI - benchmarkReplacementROI : null;
  const replacementDeltaPercent = benchmarkReplacementROI && benchmarkReplacementROI > 0
    ? Math.round((replacementDelta / benchmarkReplacementROI) * 100)
    : null;

  const additiveDelta = benchmarkAdditiveROI ? additiveROI - benchmarkAdditiveROI : null;
  const additiveDeltaPercent = benchmarkAdditiveROI && benchmarkAdditiveROI > 0
    ? Math.round((additiveDelta / benchmarkAdditiveROI) * 100)
    : null;

  return {
    scenario: 'GitHub Copilot → Claude Code Premium',
    type: 'gh_to_premium',
    // Shared metrics
    baselineHours: githubCopilotBaselineHours,
    baselineCost: roiConfig.pricing.githubCopilot,
    currentHours: CLAUDE_CODE_HOURS_SAVED,
    currentCost: roiConfig.pricing.claudeCodePremium,
    incrementalHours,
    incrementalValue,
    hourlyRate: engineerHourlyRate,
    // REPLACEMENT SCENARIO: Replace GitHub with Claude Code
    replacement: {
      incrementalCost: replacementCost,
      incrementalROI: replacementROI,
      industryBenchmark: benchmarkReplacementROI ? {
        incrementalROI: benchmarkReplacementROI,
        incrementalHours: benchmarkIncrementalHours,
        incrementalValue: benchmarkIncrementalValue
      } : null,
      roiComparison: {
        delta: replacementDelta,
        deltaPercent: replacementDeltaPercent
      }
    },
    // ADDITIVE SCENARIO: Keep GitHub + Add Claude Code
    additive: {
      incrementalCost: additiveCost,
      incrementalROI: additiveROI,
      industryBenchmark: benchmarkAdditiveROI ? {
        incrementalROI: benchmarkAdditiveROI,
        incrementalHours: benchmarkIncrementalHours,
        incrementalValue: benchmarkIncrementalValue
      } : null,
      roiComparison: {
        delta: additiveDelta,
        deltaPercent: additiveDeltaPercent
      }
    },
    // Industry benchmark data
    industryBenchmark: benchmarkReplacementROI ? {
      baselineHours: industryGHBenchmark.hoursSavedPerMonth,
      baselineCost: roiConfig.pricing.githubCopilot,
      currentHours: CLAUDE_CODE_HOURS_SAVED,
      currentCost: roiConfig.pricing.claudeCodePremium,
      confidenceLevel: industryGHBenchmark.confidenceLevel,
      lowConfidence: industryGHBenchmark.lowConfidence,
      studyCount: industryGHBenchmark.studyCount,
      sources: industryGHBenchmark.sources || []
    } : null
  };
}

/**
 * Aggregate M365 Copilot benchmarks across all roles
 * Combines studies from all roles and calculates weighted statistics
 */
function aggregateM365Benchmarks() {
  const m365Benchmarks = roiConfig.industryBenchmarks?.m365Copilot;
  if (!m365Benchmarks) {
    return null;
  }

  // Collect all studies from all roles (excluding 'default')
  const allStudies = [];
  const allSources = [];
  const roles = ['software_engineer', 'sales', 'marketing', 'customer_success'];

  roles.forEach(role => {
    const roleBenchmark = m365Benchmarks[role];
    if (roleBenchmark && roleBenchmark.sources && roleBenchmark.sources.length > 0) {
      // For each source, reconstruct the study data for weighted calculation
      roleBenchmark.sources.forEach(source => {
        // Only include if we have a valid hoursSavedPerMonth value
        const hoursSaved = typeof source.findingHours === 'number'
          ? source.findingHours
          : (typeof source.findingHours === 'string' && source.findingHours.includes('~')
              ? parseFloat(source.findingHours.replace('~', '').split('-')[0])
              : null);

        if (hoursSaved && source.sampleSize) {
          allStudies.push({
            title: source.title,
            author: source.author,
            year: source.year,
            sampleSize: typeof source.sampleSize === 'number' ? source.sampleSize : parseInt(source.sampleSize),
            hoursSavedPerMonth: hoursSaved,
            url: source.url,
            role: role
          });
        }

        // Add to combined sources (for citation)
        allSources.push({
          ...source,
          role: role
        });
      });
    }
  });

  if (allStudies.length === 0) {
    return null;
  }

  // Calculate weighted mean across all studies
  const currentYear = new Date().getFullYear();
  const studiesWithWeights = allStudies.map(study => {
    // Recency factor: exponential decay with 2-year half-life
    const ageInYears = currentYear - study.year;
    const recencyFactor = Math.exp(-ageInYears / 2);

    // Credibility factor based on author
    let credibilityFactor = 0.5;
    const author = study.author.toLowerCase();
    if (author.includes('forrester') || author.includes('gartner')) {
      credibilityFactor = 1.2;
    } else if (author.includes('academic') || author.includes('university')) {
      credibilityFactor = 1.1;
    } else if (author.includes('microsoft') || author.includes('github') || author.includes('openai')) {
      credibilityFactor = 0.8; // Vendor studies - potential bias
    }

    // Sample size factor (normalize to 1000)
    const sampleSizeFactor = study.sampleSize / 1000;

    // Combined weight
    const weight = sampleSizeFactor * recencyFactor * credibilityFactor;

    return { ...study, weight };
  });

  // Calculate weighted mean
  const totalWeight = studiesWithWeights.reduce((sum, s) => sum + s.weight, 0);
  const weightedMean = studiesWithWeights.reduce((sum, s) =>
    sum + (s.hoursSavedPerMonth * s.weight), 0
  ) / totalWeight;

  // Calculate variance for confidence assessment
  const mean = allStudies.reduce((sum, s) => sum + s.hoursSavedPerMonth, 0) / allStudies.length;
  const variance = allStudies.reduce((sum, s) =>
    sum + Math.pow(s.hoursSavedPerMonth - mean, 2), 0
  ) / allStudies.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  // Calculate confidence interval
  const standardError = stdDev / Math.sqrt(allStudies.length);
  const marginOfError = 1.96 * standardError;
  const confidenceInterval = [
    Math.max(0, weightedMean - marginOfError),
    weightedMean + marginOfError
  ];

  // Determine confidence level
  let confidenceLevel = 'high';
  let lowConfidence = false;
  if (allStudies.length < 3 || cv > 0.6) {
    confidenceLevel = 'low';
    lowConfidence = true;
  } else if (allStudies.length < 5 || cv > 0.4) {
    confidenceLevel = 'medium';
  }

  const totalSampleSize = allStudies.reduce((sum, s) => sum + s.sampleSize, 0);

  return {
    hoursSavedPerMonth: Math.round(weightedMean * 10) / 10,
    confidenceInterval: [
      Math.round(confidenceInterval[0] * 10) / 10,
      Math.round(confidenceInterval[1] * 10) / 10
    ],
    confidenceLevel,
    lowConfidence,
    coefficientOfVariation: Math.round(cv * 100) / 100,
    studyCount: allStudies.length,
    totalSampleSize,
    aggregationMethod: 'weighted_mean_across_roles',
    sources: allSources
  };
}

/**
 * Calculate incremental ROI for M365 Copilot → Claude Enterprise Standard scenario
 */
function calculateM365ToClaudeEnterpriseIncrementalROI(m365MonthlyData) {
  // Calculate M365 baseline from monthly trend data (data-driven approach)
  // Use the latest month's promptsPerUser from the monthlyTrend array
  const latestM365Month = m365MonthlyData && m365MonthlyData.length > 0
    ? m365MonthlyData[m365MonthlyData.length - 1]
    : null;
  const m365PromptsPerUser = latestM365Month && latestM365Month.promptsPerUser
    ? latestM365Month.promptsPerUser
    : 0;

  const claudeMessagesPerUser = claudeEnterpriseMonthly.length > 0
    ? Math.round(claudeEnterpriseMonthly[claudeEnterpriseMonthly.length - 1].messages / claudeEnterpriseMonthly[claudeEnterpriseMonthly.length - 1].users)
    : 0;

  // Productivity ratio (prompt equivalency = 1, per roi_config.json)
  const productivityRatio = m365PromptsPerUser > 0 ? claudeMessagesPerUser / m365PromptsPerUser : 1.0;

  // M365 baseline hours (data-driven: conservative estimate)
  const m365BaselineHours = BASELINE_HOURS_SAVED;
  const claudeEnterpriseHours = Math.round(BASELINE_HOURS_SAVED * productivityRatio);

  // Incremental metrics (data-driven) - shared values
  const incrementalHours = claudeEnterpriseHours - m365BaselineHours;
  const incrementalValue = Math.round(incrementalHours * roiConfig.generalMetrics.avgHourlyRate);

  // REPLACEMENT SCENARIO: Cancel M365 ($30), Add Claude ($40) = Net $10
  const replacementCost = roiConfig.pricing.claudeEnterpriseStandard - roiConfig.pricing.m365Copilot;
  const replacementROI = replacementCost > 0 ? parseFloat((incrementalValue / replacementCost).toFixed(1)) : 0;

  // ADDITIVE SCENARIO: Keep M365 ($30) + Add Claude ($40) = $40 incremental cost
  const additiveCost = roiConfig.pricing.claudeEnterpriseStandard;
  const additiveROI = additiveCost > 0 ? parseFloat((incrementalValue / additiveCost).toFixed(1)) : 0;

  // Industry benchmark ROI (aggregate across all M365 roles)
  const industryM365Benchmark = aggregateM365Benchmarks();

  let benchmarkReplacementROI = null;
  let benchmarkAdditiveROI = null;
  let benchmarkIncrementalHours = null;
  let benchmarkIncrementalValue = null;

  if (industryM365Benchmark && industryM365Benchmark.hoursSavedPerMonth) {
    benchmarkIncrementalHours = claudeEnterpriseHours - industryM365Benchmark.hoursSavedPerMonth;
    benchmarkIncrementalValue = Math.round(benchmarkIncrementalHours * roiConfig.generalMetrics.avgHourlyRate);
    benchmarkReplacementROI = replacementCost > 0 ? parseFloat((benchmarkIncrementalValue / replacementCost).toFixed(1)) : 0;
    benchmarkAdditiveROI = additiveCost > 0 ? parseFloat((benchmarkIncrementalValue / additiveCost).toFixed(1)) : 0;
  }

  // Calculate deltas
  const replacementDelta = benchmarkReplacementROI ? replacementROI - benchmarkReplacementROI : null;
  const replacementDeltaPercent = benchmarkReplacementROI && benchmarkReplacementROI > 0
    ? Math.round((replacementDelta / benchmarkReplacementROI) * 100)
    : null;

  const additiveDelta = benchmarkAdditiveROI ? additiveROI - benchmarkAdditiveROI : null;
  const additiveDeltaPercent = benchmarkAdditiveROI && benchmarkAdditiveROI > 0
    ? Math.round((additiveDelta / benchmarkAdditiveROI) * 100)
    : null;

  // Collect Claude Enterprise sources from all roles for citation
  const claudeEnterpriseBenchmarks = roiConfig.industryBenchmarks?.claudeEnterprise;
  const claudeEnterpriseSources = [];
  if (claudeEnterpriseBenchmarks) {
    const roles = ['software_engineer', 'sales', 'marketing', 'customer_success'];
    roles.forEach(role => {
      const roleBenchmark = claudeEnterpriseBenchmarks[role];
      if (roleBenchmark && roleBenchmark.sources && roleBenchmark.sources.length > 0) {
        roleBenchmark.sources.forEach(source => {
          // Avoid duplicates by checking title
          if (!claudeEnterpriseSources.find(s => s.title === source.title)) {
            claudeEnterpriseSources.push({
              ...source,
              role: role
            });
          }
        });
      }
    });
  }

  return {
    scenario: 'M365 Copilot → Claude Enterprise Standard',
    type: 'm365_to_standard',
    // Shared metrics
    baselineHours: m365BaselineHours,
    baselineCost: roiConfig.pricing.m365Copilot,
    currentHours: claudeEnterpriseHours,
    currentCost: roiConfig.pricing.claudeEnterpriseStandard,
    incrementalHours,
    incrementalValue,
    productivityRatio: parseFloat(productivityRatio.toFixed(2)),
    m365PromptsPerUser,
    claudeMessagesPerUser,
    hourlyRate: roiConfig.generalMetrics.avgHourlyRate,
    // REPLACEMENT SCENARIO: Replace M365 with Claude
    replacement: {
      incrementalCost: replacementCost,
      incrementalROI: replacementROI,
      industryBenchmark: benchmarkReplacementROI ? {
        incrementalROI: benchmarkReplacementROI,
        incrementalHours: benchmarkIncrementalHours,
        incrementalValue: benchmarkIncrementalValue
      } : null,
      roiComparison: {
        delta: replacementDelta,
        deltaPercent: replacementDeltaPercent
      }
    },
    // ADDITIVE SCENARIO: Keep M365 + Add Claude
    additive: {
      incrementalCost: additiveCost,
      incrementalROI: additiveROI,
      industryBenchmark: benchmarkAdditiveROI ? {
        incrementalROI: benchmarkAdditiveROI,
        incrementalHours: benchmarkIncrementalHours,
        incrementalValue: benchmarkIncrementalValue
      } : null,
      roiComparison: {
        delta: additiveDelta,
        deltaPercent: additiveDeltaPercent
      }
    },
    // Industry benchmark data
    industryBenchmark: benchmarkReplacementROI ? {
      baselineHours: industryM365Benchmark.hoursSavedPerMonth,
      baselineCost: roiConfig.pricing.m365Copilot,
      currentHours: claudeEnterpriseHours,
      currentCost: roiConfig.pricing.claudeEnterpriseStandard,
      confidenceLevel: industryM365Benchmark.confidenceLevel,
      lowConfidence: industryM365Benchmark.lowConfidence,
      studyCount: industryM365Benchmark.studyCount,
      totalSampleSize: industryM365Benchmark.totalSampleSize,
      hoursSavedPerMonth: industryM365Benchmark.hoursSavedPerMonth,
      confidenceInterval: industryM365Benchmark.confidenceInterval,
      coefficientOfVariation: industryM365Benchmark.coefficientOfVariation,
      aggregationMethod: industryM365Benchmark.aggregationMethod,
      sources: industryM365Benchmark.sources || []
    } : null,
    claudeEnterpriseSources
  };
}

// Step 6: Calculate expansion opportunities
console.log('\n📊 Calculating Expansion ROI Opportunities...\n');
const expansionOpportunities = calculateExpansionOpportunities(
  deptHeadcounts,
  deptUserActivities,
  currentAdoption,
  pricing,
  getDepartmentValueMetrics
);

// Calculate total metrics
// Use org chart's totalEmployees (includes CEO) instead of summing deptHeadcounts (excludes CEO)
const expansionTotalEmployees = orgChartData?.organization?.totalEmployees ||
  Object.values(deptHeadcounts).reduce((sum, count) => sum + count, 0);
const totalCurrentUsers = Object.values(currentAdoption).reduce((sum, d) => sum + d.users, 0);
const totalCurrentPremium = Object.values(currentAdoption).reduce((sum, d) => sum + d.premium, 0);
const totalCurrentStandard = Object.values(currentAdoption).reduce((sum, d) => sum + d.standard, 0);

const totalNewStandard = expansionOpportunities.reduce((sum, opp) => sum + (opp.standardGap || 0), 0);
const totalNewPremium = expansionOpportunities.reduce((sum, opp) => sum + (opp.newPremiumNeeded || 0), 0);
const totalUpgrades = expansionOpportunities.reduce((sum, opp) => sum + (opp.upgradesNeeded || 0), 0);
const totalAdditionalCost = expansionOpportunities.reduce((sum, opp) => sum + opp.totalAdditionalCost, 0);
const totalOpportunityCost = expansionOpportunities.reduce((sum, opp) => sum + opp.monthlyOpportunityCost, 0);
const totalNetBenefit = expansionOpportunities.reduce((sum, opp) => sum + opp.netBenefit, 0);

console.log(`✅ Expansion opportunities calculated for ${expansionOpportunities.length} departments`);
console.log(`   Total employees: ${expansionTotalEmployees}`);
console.log(`   Current users: ${totalCurrentUsers} (${totalCurrentPremium} Premium, ${totalCurrentStandard} Standard)`);
console.log(`   Recommended additions: ${totalNewStandard + totalNewPremium + totalUpgrades} users`);
console.log(`   - New Standard: ${totalNewStandard}`);
console.log(`   - New Premium: ${totalNewPremium}`);
console.log(`   - Upgrades to Premium: ${totalUpgrades}`);
console.log(`   Total additional cost: $${totalAdditionalCost.toLocaleString()}/month`);
console.log(`   Total opportunity value: $${totalOpportunityCost.toLocaleString()}/month`);
console.log(`   Total net benefit: $${totalNetBenefit.toLocaleString()}/month`);
console.log(`   Overall ROI: ${totalAdditionalCost > 0 ? (totalOpportunityCost / totalAdditionalCost).toFixed(1) : 0}x\n`);

// ============================================================================
// CALCULATE CURRENT STATE ROI (for Overview tab)
// This calculates the value from CURRENT licensed users only (not expansion)
// ============================================================================
console.log('\n📊 Calculating Current State ROI...\n');

// Calculate current license costs
const currentPremiumCost = totalCurrentPremium * pricing.premium; // 13 × $200
const currentStandardCost = totalCurrentStandard * pricing.standard; // 74 × $40
const currentTotalCost = currentPremiumCost + currentStandardCost;

console.log(`💰 Current License Costs:`);
console.log(`   Premium: ${totalCurrentPremium} seats × $${pricing.premium}/mo = $${currentPremiumCost.toLocaleString()}/mo`);
console.log(`   Standard: ${totalCurrentStandard} seats × $${pricing.standard}/mo = $${currentStandardCost.toLocaleString()}/mo`);
console.log(`   Total: $${currentTotalCost.toLocaleString()}/month\n`);

// Calculate actual productivity value from current Claude users
// Method 1: Use department-specific value metrics for each current user
let currentStateValue = 0;
Object.entries(currentAdoption).forEach(([dept, adoption]) => {
  const deptMetrics = getDepartmentValueMetrics(dept);
  const deptValue = adoption.users * deptMetrics.hoursPerUserPerMonth * deptMetrics.avgHourlyRate;
  currentStateValue += deptValue;
  console.log(`   ${dept}: ${adoption.users} users × ${deptMetrics.hoursPerUserPerMonth} hrs × $${deptMetrics.avgHourlyRate}/hr = $${Math.round(deptValue).toLocaleString()}/mo`);
});

const currentNetBenefit = currentStateValue - currentTotalCost;
const currentROI = currentTotalCost > 0 ? (currentStateValue / currentTotalCost).toFixed(1) : 0;

console.log(`\n✅ Current State ROI Summary:`);
console.log(`   Current licensed users: ${totalCurrentUsers} (${totalCurrentPremium} Premium, ${totalCurrentStandard} Standard)`);
console.log(`   Current monthly cost: $${currentTotalCost.toLocaleString()}`);
console.log(`   Current monthly value: $${Math.round(currentStateValue).toLocaleString()}`);
console.log(`   Current net benefit: $${Math.round(currentNetBenefit).toLocaleString()}/month`);
console.log(`   Current ROI: ${currentROI}x\n`);

console.log('✅ Claude Enterprise Metrics (cumulative):');
console.log(`   - Total users (all-time): ${activeUserUUIDs.size}`);
console.log(`   - Total conversations: ${claudeEnterpriseTotalConversations.toLocaleString()}`);
console.log(`   - Total projects: ${claudeEnterpriseTotalProjects.toLocaleString()}`);
console.log(`   - Total artifacts generated (Claude): ${claudeEnterpriseTotalArtifacts.toLocaleString()}`);
console.log(`   - Total files uploaded (Human): ${claudeEnterpriseTotalFilesUploaded.toLocaleString()}`);

// Calculate weekly time-series for Claude Enterprise
const weeklyClaudeEnterprise = new Map();

monthlyConversations.forEach(conv => {
  const timestamp = conv.created_at;
  if (!timestamp) return;

  const date = timestamp.split('T')[0];
  const week = getWeekStart(date);

  // Get user email from UUID
  const userUUID = conv.account?.uuid;
  if (!userUUID) return;

  const userEmail = userEmailLookup.get(userUUID);
  if (!userEmail) return;

  const dept = getDepartmentInfo(userEmail, orgEmailMap).department;

  // Count messages in this conversation
  const messageCount = conv.chat_messages ? conv.chat_messages.length : 0;

  if (!weeklyClaudeEnterprise.has(week)) {
    weeklyClaudeEnterprise.set(week, { conversations: 0, messages: 0, users: new Set(), byDept: {} });
  }

  const weekData = weeklyClaudeEnterprise.get(week);
  weekData.conversations++;
  weekData.messages += messageCount;
  weekData.users.add(userEmail);

  if (!weekData.byDept[dept]) {
    weekData.byDept[dept] = { conversations: 0, messages: 0, users: new Set() };
  }
  weekData.byDept[dept].conversations++;
  weekData.byDept[dept].messages += messageCount;
  weekData.byDept[dept].users.add(userEmail);
});

// Convert to array
const claudeEnterpriseWeekly = Array.from(weeklyClaudeEnterprise.entries())
  .map(([week, data]) => ({
    week,
    conversations: data.conversations,
    messages: data.messages,
    users: data.users.size,
    conversationsPerUser: data.users.size > 0 ? Math.round(data.conversations / data.users.size) : 0,
    messagesPerUser: data.users.size > 0 ? Math.round(data.messages / data.users.size) : 0,
    byDept: Object.entries(data.byDept).map(([dept, deptData]) => ({
      department: dept,
      conversations: deptData.conversations,
      messages: deptData.messages,
      users: deptData.users.size,
      conversationsPerUser: deptData.users.size > 0 ? Math.round(deptData.conversations / deptData.users.size) : 0,
      messagesPerUser: deptData.users.size > 0 ? Math.round(deptData.messages / deptData.users.size) : 0
    }))
  }))
  .sort((a, b) => a.week.localeCompare(b.week));

console.log(`\n   Weekly trend: ${claudeEnterpriseWeekly.length} weeks of data`);

// Aggregate conversations by month
const monthlyClaudeMap = new Map();

monthlyConversations.forEach(conv => {
  const timestamp = conv.created_at;
  if (!timestamp) return;

  const date = timestamp.split('T')[0]; // YYYY-MM-DD
  const month = date.substring(0, 7); // Extract YYYY-MM

  const userUUID = conv.account?.uuid;
  if (!userUUID) return;

  const userEmail = userEmailLookup.get(userUUID);
  if (!userEmail) return;

  const dept = getDepartmentInfo(userEmail, orgEmailMap).department;

  // Count messages in this conversation
  const messageCount = conv.chat_messages ? conv.chat_messages.length : 0;

  if (!monthlyClaudeMap.has(month)) {
    monthlyClaudeMap.set(month, {
      conversations: 0,
      messages: 0,
      artifacts: 0, // Track artifacts generated by Claude (sender: "assistant")
      filesUploaded: 0, // Track files uploaded by humans (sender: "human")
      users: new Set(),
      byDept: {},
      // Track daily activity per user for engagement calculation
      userDailyActivity: new Map() // Map<userEmail, Map<date, messageCount>>
    });
  }

  const monthData = monthlyClaudeMap.get(month);
  monthData.conversations++;
  monthData.messages += messageCount;
  monthData.users.add(userEmail);

  // Count artifacts generated by Claude and files uploaded by humans
  if (conv.chat_messages) {
    conv.chat_messages.forEach(msg => {
      // Count artifacts from Claude's responses
      if (msg.sender === 'assistant') {
        if (msg.attachments && msg.attachments.length > 0) {
          monthData.artifacts += msg.attachments.length;
        }
        if (msg.files && msg.files.length > 0) {
          monthData.artifacts += msg.files.length;
        }
      }
      // Count files uploaded by humans
      if (msg.sender === 'human') {
        if (msg.attachments && msg.attachments.length > 0) {
          monthData.filesUploaded += msg.attachments.length;
        }
        if (msg.files && msg.files.length > 0) {
          monthData.filesUploaded += msg.files.length;
        }
      }
    });
  }

  // Track daily activity for this user
  if (!monthData.userDailyActivity.has(userEmail)) {
    monthData.userDailyActivity.set(userEmail, new Map());
  }
  const userDailyMap = monthData.userDailyActivity.get(userEmail);
  const currentCount = userDailyMap.get(date) || 0;
  userDailyMap.set(date, currentCount + messageCount);

  if (!monthData.byDept[dept]) {
    monthData.byDept[dept] = { conversations: 0, messages: 0, users: new Set() };
  }
  monthData.byDept[dept].conversations++;
  monthData.byDept[dept].messages += messageCount;
  monthData.byDept[dept].users.add(userEmail);
});

// Convert to array with proper month labels (using monthNames already defined)
const claudeEnterpriseMonthly = Array.from(monthlyClaudeMap.entries())
  .map(([month, data]) => {
    const [year, monthNum] = month.split('-');

    // Calculate engaged users for this month
    // Engaged user criteria: Active (≥3 prompts/day) for ≥33% of days in month
    const MESSAGES_PER_DAY_THRESHOLD = 3;
    const ENGAGEMENT_PERCENTAGE_THRESHOLD = 0.33; // 33% of days

    // Get all unique dates in this month to determine total days
    const allDatesInMonth = new Set();
    data.userDailyActivity.forEach(userDailyMap => {
      userDailyMap.forEach((msgCount, date) => {
        allDatesInMonth.add(date);
      });
    });
    const totalDaysInMonth = allDatesInMonth.size;
    const requiredActiveDays = Math.ceil(totalDaysInMonth * ENGAGEMENT_PERCENTAGE_THRESHOLD);

    // Count engaged users
    let engagedUsers = 0;
    data.userDailyActivity.forEach((userDailyMap, userEmail) => {
      // Count how many days this user had ≥5 messages
      let activeDaysCount = 0;
      userDailyMap.forEach((messageCount, date) => {
        if (messageCount >= MESSAGES_PER_DAY_THRESHOLD) {
          activeDaysCount++;
        }
      });

      // Check if user meets engagement threshold
      if (activeDaysCount >= requiredActiveDays) {
        engagedUsers++;
      }
    });

    const engagementRate = data.users.size > 0 ? Math.round((engagedUsers / data.users.size) * 100) : 0;

    return {
      month,
      monthLabel: monthNames[parseInt(monthNum) - 1],
      conversations: data.conversations,
      messages: data.messages,
      artifacts: data.artifacts, // Artifacts generated by Claude (sender: "assistant")
      filesUploaded: data.filesUploaded, // Files uploaded by humans (sender: "human")
      users: data.users.size,
      conversationsPerUser: data.users.size > 0 ? Math.round(data.conversations / data.users.size) : 0,
      messagesPerUser: data.users.size > 0 ? Math.round(data.messages / data.users.size) : 0,
      artifactsPerUser: data.users.size > 0 ? Math.round(data.artifacts / data.users.size) : 0,
      filesUploadedPerUser: data.users.size > 0 ? Math.round(data.filesUploaded / data.users.size) : 0,
      // Engagement metrics
      engagedUsers,
      engagementRate, // Percentage of active users who are engaged
      totalDaysInMonth,
      requiredActiveDays,
      byDept: Object.entries(data.byDept).map(([dept, deptData]) => ({
        department: dept,
        conversations: deptData.conversations,
        messages: deptData.messages,
        users: deptData.users.size,
        conversationsPerUser: deptData.users.size > 0 ? Math.round(deptData.conversations / deptData.users.size) : 0,
        messagesPerUser: deptData.users.size > 0 ? Math.round(deptData.messages / deptData.users.size) : 0
      }))
    };
  })
  .sort((a, b) => a.month.localeCompare(b.month));

console.log(`\n   Monthly trend: ${claudeEnterpriseMonthly.length} months of data`);
claudeEnterpriseMonthly.forEach(m => {
  console.log(`   - ${m.monthLabel}: ${m.users} users, ${m.conversations} conversations (${m.messages} messages), ${m.artifacts} artifacts generated`);
  console.log(`     Per user: ${m.messagesPerUser} messages/user, ${m.artifactsPerUser} artifacts/user`);
  console.log(`     Engagement: ${m.engagedUsers}/${m.users} users engaged (${m.engagementRate}%) - Active ≥3 prompts/day for ≥${m.requiredActiveDays}/${m.totalDaysInMonth} days (33% threshold)`);
});

// Calculate active users - use CUMULATIVE all-time count for top-level KPIs
const latestClaudeMonth = claudeEnterpriseMonthly[claudeEnterpriseMonthly.length - 1];
const claudeEnterpriseActiveUsers = activeUserUUIDs.size; // All-time cumulative (87)
const claudeEnterpriseConversationsPerUser = Math.round(claudeEnterpriseTotalConversations / claudeEnterpriseActiveUsers);

console.log(`\n   ✅ Using cumulative all-time active users: ${claudeEnterpriseActiveUsers} (latest month: ${latestClaudeMonth?.users})`);

// Calculate per-user Agentic FTE using modular calculator
const ceFTEMap = calculateClaudeEnterpriseAgenticFTE(claudeEnterpriseUsersArray, latestClaudeMonth);
applyAgenticFTEToArrays(ceFTEMap, claudeEnterpriseUsersArray, claudeEnterprisePowerUsers, claudeEnterpriseLowEngagement);

// Update department breakdown with Agentic FTE totals
claudeEnterpriseDepartmentBreakdown.forEach(dept => {
  dept.agenticFTE = claudeEnterpriseUsersArray
    .filter(u => u.department === dept.department)
    .reduce((sum, user) => sum + (user.agenticFTE || 0), 0);
  dept.agenticFTE = parseFloat(dept.agenticFTE.toFixed(2));
});

// Output data for dashboard
console.log('\n📝 Generating dashboard data...\n');

// ============================================================================
// ENGINEERING CODING TOOLS ADOPTION (NEW METRICS)
// ============================================================================

// Engineering + AI/Data employee counts from org hierarchy
// (Engineering: 77, AI & Data: 6, as shown in parse-hierarchy console output)
const totalEngineeringEmployees = 77 + 6; // 83

// GitHub Copilot adoption in Engineering+AI/Data
const githubCopilotEngAdoption = Math.round((userMetrics.size / totalEngineeringEmployees) * 100);

// Claude Code adoption in Engineering+AI/Data
const claudeCodeEngAdoption = Math.round((claudeCodeActiveUsers / totalEngineeringEmployees) * 100);

// Combined unique coding tool users (conservative: assume minimal overlap since different use cases)
// GitHub Copilot = IDE-based, Claude Code = terminal-based
const estimatedCombinedCodingUsers = userMetrics.size + claudeCodeActiveUsers; // Conservative estimate
const combinedCodingToolsAdoption = Math.round((estimatedCombinedCodingUsers / totalEngineeringEmployees) * 100);

console.log(`✨ Engineering Coding Tools Adoption:`);
console.log(`   - Total Engineering + AI/Data employees: ${totalEngineeringEmployees}`);
console.log(`   - GitHub Copilot: ${userMetrics.size} users (${githubCopilotEngAdoption}%)`);
console.log(`   - Claude Code: ${claudeCodeActiveUsers} users (${claudeCodeEngAdoption}%)`);
console.log(`   - Combined unique users (est.): ${estimatedCombinedCodingUsers} (${combinedCodingToolsAdoption}%)\n`);

// ============================================================================
// M365 COPILOT "ARTIFACTS" APPROXIMATION (NEW METRIC)
// ============================================================================

// Industry-backed approximation: Exclude Chat prompts, then apply conversion rate
// Microsoft research shows ~20% of M365 Copilot content app prompts result in saved artifacts
// METHODOLOGY CHANGE (Dec 31, 2024): Now excludes Copilot Chat (work) and Copilot Chat (web) prompts
// Rationale: Chat prompts are conversational and don't produce saved Word/Excel/PowerPoint artifacts
// Note: Content app prompts still include Teams, Outlook, OneNote, Loop (conservative estimate)
const PROMPT_TO_ARTIFACT_CONVERSION_RATE = 0.20; // 20% industry benchmark
const m365TotalPromptsLatestMonth = m365Monthly.length > 0 ? m365Monthly[m365Monthly.length - 1].totalPrompts : 0;
const m365ContentAppPromptsLatestMonth = m365Monthly.length > 0 ? (m365Monthly[m365Monthly.length - 1].contentAppPrompts || 0) : 0;
const m365ChatPromptsLatestMonth = m365Monthly.length > 0 ? (m365Monthly[m365Monthly.length - 1].chatPrompts || 0) : 0;

// First calculate artifacts from content app prompts (excludes Chat)
const m365ApproximateArtifactsBeforeFactor = Math.round(m365ContentAppPromptsLatestMonth * PROMPT_TO_ARTIFACT_CONVERSION_RATE);

// Calculate Word/Excel/PowerPoint adoption factor
// Use adoption rates as a proxy for what % of content app prompts come from W/E/P vs Teams/Outlook/etc
const m365WordUsers = appUsageArray.find(a => a.app === 'Word')?.users || 0;
const m365ExcelUsers = appUsageArray.find(a => a.app === 'Excel')?.users || 0;
const m365PowerPointUsers = appUsageArray.find(a => a.app === 'PowerPoint')?.users || 0;
const m365ContentAppUsers = m365WordUsers + m365ExcelUsers + m365PowerPointUsers;

// Calculate adoption percentages for Word/Excel/PowerPoint
const wordAdoptionRate = m365ActiveUsers > 0 ? (m365WordUsers / m365ActiveUsers) : 0;
const excelAdoptionRate = m365ActiveUsers > 0 ? (m365ExcelUsers / m365ActiveUsers) : 0;
const powerpointAdoptionRate = m365ActiveUsers > 0 ? (m365PowerPointUsers / m365ActiveUsers) : 0;

// Average adoption rate as a proxy for % of prompts from Word/Excel/PowerPoint
const wordExcelPowerpointAdoptionFactor = (wordAdoptionRate + excelAdoptionRate + powerpointAdoptionRate) / 3;

// Apply adoption factor to get final artifacts estimate
// This filters out the estimated Teams/Outlook/OneNote/Loop portion
const m365ApproximateArtifacts = Math.round(m365ApproximateArtifactsBeforeFactor * wordExcelPowerpointAdoptionFactor);

console.log(`✨ M365 Copilot Content Creation (Approximation):`);
console.log(`   - Total prompts (latest month): ${m365TotalPromptsLatestMonth.toLocaleString()}`);
console.log(`   - Chat prompts excluded: ${m365ChatPromptsLatestMonth.toLocaleString()} (${m365TotalPromptsLatestMonth > 0 ? ((m365ChatPromptsLatestMonth/m365TotalPromptsLatestMonth)*100).toFixed(1) : 0}%)`);
console.log(`   - Content app prompts: ${m365ContentAppPromptsLatestMonth.toLocaleString()} (${m365TotalPromptsLatestMonth > 0 ? ((m365ContentAppPromptsLatestMonth/m365TotalPromptsLatestMonth)*100).toFixed(1) : 0}%)`);
console.log(`   - Word/Excel/PowerPoint adoption factor: ${(wordExcelPowerpointAdoptionFactor * 100).toFixed(1)}%`);
console.log(`     • Word: ${(wordAdoptionRate * 100).toFixed(1)}% (${m365WordUsers} users)`);
console.log(`     • Excel: ${(excelAdoptionRate * 100).toFixed(1)}% (${m365ExcelUsers} users)`);
console.log(`     • PowerPoint: ${(powerpointAdoptionRate * 100).toFixed(1)}% (${m365PowerPointUsers} users)`);
console.log(`   - Conversion rate: ${(PROMPT_TO_ARTIFACT_CONVERSION_RATE * 100)}% (industry benchmark)`);
console.log(`   - Estimated artifacts (before adoption factor): ${m365ApproximateArtifactsBeforeFactor.toLocaleString()}`);
console.log(`   - Estimated artifacts (final, with adoption factor): ${m365ApproximateArtifacts.toLocaleString()}`);
console.log(`   - Note: Adoption factor filters out estimated Teams/Outlook prompts\n`);

// Update m365Monthly with calculated artifacts for each month
// Apply same methodology: contentAppPrompts * 0.20 * (W/E/P adoption factor)
m365Monthly.forEach(month => {
  const monthContentAppPrompts = month.contentAppPrompts || 0;
  month.artifacts = Math.round(monthContentAppPrompts * PROMPT_TO_ARTIFACT_CONVERSION_RATE * wordExcelPowerpointAdoptionFactor);
});

console.log(`✅ Updated monthly trend with calculated artifacts:`);
m365Monthly.forEach(month => {
  console.log(`   ${month.monthLabel}: ${month.artifacts} artifacts (from ${month.contentAppPrompts} content app prompts)`);
});
console.log('');

// Calculate both incremental ROI scenarios (after variables are defined)
const incrementalROI = {
  githubToClaudeCode: calculateGitHubToClaudeCodeIncrementalROI(),
  m365ToClaudeEnterprise: calculateM365ToClaudeEnterpriseIncrementalROI(m365Monthly)
};

// Log results
console.log('✅ GitHub Copilot → Claude Code Premium:');
console.log(`   Baseline: ${incrementalROI.githubToClaudeCode.baselineHours} hrs/mo @ $${incrementalROI.githubToClaudeCode.baselineCost}/mo`);
console.log(`   Claude Code: ${incrementalROI.githubToClaudeCode.currentHours} hrs/mo @ $${incrementalROI.githubToClaudeCode.currentCost}/mo`);
console.log(`   Incremental: +${incrementalROI.githubToClaudeCode.incrementalHours} hrs/mo, +$${incrementalROI.githubToClaudeCode.incrementalValue.toLocaleString()}/mo value`);
console.log(`   - ADDITIVE (Keep GitHub + Add Claude): $${incrementalROI.githubToClaudeCode.additive.incrementalCost}/mo → ${incrementalROI.githubToClaudeCode.additive.incrementalROI}x ROI`);
console.log(`   - REPLACEMENT (Replace GitHub with Claude): $${incrementalROI.githubToClaudeCode.replacement.incrementalCost}/mo → ${incrementalROI.githubToClaudeCode.replacement.incrementalROI}x ROI`);

console.log('\n✅ M365 Copilot → Claude Enterprise Standard:');
console.log(`   Baseline: ${incrementalROI.m365ToClaudeEnterprise.baselineHours} hrs/mo @ $${incrementalROI.m365ToClaudeEnterprise.baselineCost}/mo`);
console.log(`   Claude Enterprise: ${incrementalROI.m365ToClaudeEnterprise.currentHours} hrs/mo @ $${incrementalROI.m365ToClaudeEnterprise.currentCost}/mo`);
console.log(`   Incremental: +${incrementalROI.m365ToClaudeEnterprise.incrementalHours} hrs/mo, +$${incrementalROI.m365ToClaudeEnterprise.incrementalValue.toLocaleString()}/mo value`);
console.log(`   Productivity ratio: ${incrementalROI.m365ToClaudeEnterprise.productivityRatio}x (${incrementalROI.m365ToClaudeEnterprise.claudeMessagesPerUser} vs ${incrementalROI.m365ToClaudeEnterprise.m365PromptsPerUser} prompts/user)`);
console.log(`   - ADDITIVE (Keep M365 + Add Claude): $${incrementalROI.m365ToClaudeEnterprise.additive.incrementalCost}/mo → ${incrementalROI.m365ToClaudeEnterprise.additive.incrementalROI}x ROI`);
console.log(`   - REPLACEMENT (Replace M365 with Claude): $${incrementalROI.m365ToClaudeEnterprise.replacement.incrementalCost}/mo → ${incrementalROI.m365ToClaudeEnterprise.replacement.incrementalROI}x ROI`);

console.log('');

const dashboardData = {
  githubCopilot: {
    activeUsers: userMetrics.size,
    totalLines,
    linesPerUser: Math.round(totalLines / userMetrics.size),
    engineeringAdoptionRate: githubCopilotEngAdoption,
    totalEngineeringEmployees,
    modelPreferences,
    topUsers: topUsers.map(u => ({
      username: u.username,
      lines: u.totalLinesAdded
    })),
    featureUsage,
    weeklyTrend: githubCopilotWeekly,
    monthlyTrend: githubCopilotMonthly
  },
  claudeCode: {
    activeUsers: claudeCodeActiveUsers,
    licensedUsers: LICENSE_CONFIG.claudeCode.licensedUsers,
    totalLines: claudeCodeTotalLines,
    linesPerUser: claudeCodeLinesPerUser,
    engineeringAdoptionRate: claudeCodeEngAdoption,
    totalEngineeringEmployees,
    combinedCodingToolsUsers: estimatedCombinedCodingUsers,
    combinedCodingToolsAdoption,
    monthlyTrend: claudeCodeMonthly,
    powerUsers: claudeCodePowerUsers,
    lowEngagementUsers: claudeCodeLowEngagement
  },
  m365Copilot: {
    activeUsers: m365ActiveUsers,
    licensedUsers: LICENSE_CONFIG.m365Copilot.licensedUsers,
    totalPrompts,
    chatPrompts: latestChatPrompts,
    contentAppPrompts: latestContentAppPrompts,
    promptsPerUser: Math.round(totalPrompts / m365ActiveUsers),
    approximateArtifacts: m365ApproximateArtifacts,
    artifactsNote: `Refined methodology: ${(PROMPT_TO_ARTIFACT_CONVERSION_RATE * 100)}% of content app prompts (excludes Chat) × ${(wordExcelPowerpointAdoptionFactor * 100).toFixed(0)}% Word/Excel/PowerPoint adoption factor = Word/Excel/PowerPoint artifacts only`,
    wordExcelPowerpointAdoptionFactor: parseFloat((wordExcelPowerpointAdoptionFactor * 100).toFixed(1)),
    appUsage: appUsageArray,
    monthlyTrend: m365Monthly
  },
  claudeEnterprise: {
    activeUsers: claudeEnterpriseActiveUsers,
    licensedUsers: LICENSE_CONFIG.claudeEnterprise.licensedUsers,
    totalConversations: claudeEnterpriseTotalConversations,
    totalProjects: claudeEnterpriseTotalProjects,
    totalArtifacts: claudeEnterpriseTotalArtifacts,
    totalFilesUploaded: claudeEnterpriseTotalFilesUploaded,
    totalMessages: claudeEnterpriseTotalMessages,
    conversationsPerUser: claudeEnterpriseConversationsPerUser,
    // Calculate prompts per user from latest month's messages
    promptsPerUser: claudeEnterpriseMonthly.length > 0
      ? claudeEnterpriseMonthly[claudeEnterpriseMonthly.length - 1].messagesPerUser
      : 0,
    weeklyTrend: claudeEnterpriseWeekly,
    monthlyTrend: claudeEnterpriseMonthly,
    powerUsers: claudeEnterprisePowerUsers,
    lowEngagementUsers: claudeEnterpriseLowEngagement,
    departmentBreakdown: claudeEnterpriseDepartmentBreakdown,
    projectsAnalytics: projectsData
  },
  connectors: connectorsData,
  m365CopilotDeepDive: {
    summaryMetrics,
    powerUsers,
    appAdoption: appAdoptionArray,
    intensityDistribution: intensityBuckets,
    departmentPerformance: deptPerformanceArray,
    userSegments,
    appUsageTimeSeries,
    opportunities: {
      lowPowerPointUsage: {
        currentUsers: powerpointAdoption,
        targetUsers: wordAdoption,
        gapUsers: powerpointGap,
        potentialValue: `${Math.round(powerpointGap * 0.5)} presentations/month`
      },
      inactiveUsers: {
        count: inactiveUsers.length,
        reclaimableLicenses: inactiveUsers.length,
        monthlySavings: inactiveUsers.length * 19
      },
      lowEngagementUsers: {
        count: lowEngagementUsers.length,
        departments: [...new Set(lowEngagementUsers.map(u => u.department))],
        users: lowEngagementUsers
      }
    },
    agents: m365AgentsData
  },
  orgMetrics: {
    totalLicensedUsers: totalCurrentUsers,
    licensedSeats: totalCurrentUsers,  // Alias for UI compatibility
    premiumSeats: totalCurrentPremium,
    standardSeats: totalCurrentStandard,
    totalEmployees: expansionTotalEmployees,
    unlicensedEmployees: expansionTotalEmployees - totalCurrentUsers,
    penetrationRate: Math.round((totalCurrentUsers / expansionTotalEmployees) * 100)
  },
  currentStateROI: {
    licensedUsers: totalCurrentUsers,
    premiumSeats: totalCurrentPremium,
    standardSeats: totalCurrentStandard,
    costs: {
      premium: currentPremiumCost,
      standard: currentStandardCost,
      total: currentTotalCost
    },
    value: {
      monthlyValue: Math.round(currentStateValue),
      hoursSaved: Math.round(currentStateValue / 77), // Using avg rate of $77/hr
      netBenefit: Math.round(currentNetBenefit)
    },
    roi: parseFloat(currentROI),
    pricing: {
      premiumPerSeat: pricing.premium,
      standardPerSeat: pricing.standard
    }
  },
  expansion: {
    orgMetrics: {
      totalEmployees: expansionTotalEmployees,
      licensedSeats: totalCurrentUsers,
      activeUsers: totalCurrentUsers,
      inactiveSeats: 0, // All Claude Enterprise users are considered active
      penetrationRate: Math.round((totalCurrentUsers / expansionTotalEmployees) * 100),
      unlicensedEmployees: expansionTotalEmployees - totalCurrentUsers
    },
    currentCosts: {
      claudeEnterprise: currentTotalCost,  // From currentStateROI calculation
      m365Copilot: m365Monthly.length > 0 ? m365Monthly[m365Monthly.length - 1].users * 30 : 0,  // Latest month active users × $30
      githubCopilot: githubCopilotProductivityData.activeUsers * 19,  // Active users × $19
      total: currentTotalCost +
        (m365Monthly.length > 0 ? m365Monthly[m365Monthly.length - 1].users * 30 : 0) +
        (githubCopilotProductivityData.activeUsers * 19)
    },
    fullRolloutCosts: {
      claudeEnterprise: totalAdditionalCost + currentTotalCost,  // Future state after expansion
      m365Copilot: m365Monthly.length > 0 ? m365Monthly[m365Monthly.length - 1].users * 30 : 0,  // No change (already org-wide)
      total: (totalAdditionalCost + currentTotalCost) +
        (m365Monthly.length > 0 ? m365Monthly[m365Monthly.length - 1].users * 30 : 0)  // No GitHub Copilot after March 2026
    },
    paybackPeriod: totalNetBenefit > 0 ? Math.ceil(totalAdditionalCost / (totalNetBenefit / 12)) : null,  // Months to break even
    opportunities: expansionOpportunities,
    summary: {
      totalDepartments: expansionOpportunities.length,
      totalAdditionalCost,
      totalOpportunityCost,
      totalNetBenefit,
      overallROI: totalAdditionalCost > 0 ? parseFloat((totalOpportunityCost / totalAdditionalCost).toFixed(1)) : 0,
      recommendedAdditions: {
        newStandard: totalNewStandard,
        newPremium: totalNewPremium,
        upgradesToPremium: totalUpgrades,
        total: totalNewStandard + totalNewPremium + totalUpgrades
      }
    },
    pricing,
    valueMetrics: {
      hoursPerUserPerMonth: 11,
      avgHourlyRate: 77
    },
    productivityMetrics: {
      multiplier: productivityMultiplier,
      githubCopilotLinesPerUser: githubCopilotProductivityData.linesPerUser,
      claudeCodeLinesPerUser: claudeCodeProductivityData.linesPerUser,
      engineeringHourlyRate: Math.round(engineerHourlyRate),
      engineeringHoursSaved: CLAUDE_CODE_HOURS_SAVED,
      engineeringValuePerMonth: Math.round(CLAUDE_CODE_HOURS_SAVED * engineerHourlyRate)
    },
    // ========================================================================
    // HISTORICAL SNAPSHOTS & ROLLOUT TRACKING
    // ========================================================================
    snapshots: [],  // Will be populated with historical data
    rolloutTracking: (() => {
      // Calculate Phase 2 Engineering rollout progress
      const engineeringDept = expansionOpportunities.find(opp => opp.department === 'Engineering');
      const engineeringTarget = engineeringDept ? engineeringDept.totalEmployees : 77;
      const engineeringCurrent = engineeringDept ? engineeringDept.currentPremium : 0;
      const engineeringRemaining = Math.max(0, engineeringTarget - engineeringCurrent);
      const engineeringProgress = engineeringTarget > 0
        ? Math.round((engineeringCurrent / engineeringTarget) * 100)
        : 0;

      // Determine status
      let status = 'not-started';
      if (engineeringProgress === 100) {
        status = 'complete';
      } else if (engineeringProgress > 0) {
        // Check if on track (simplified - could be enhanced with date-based logic)
        const daysIntoQ1 = Math.max(0, Math.floor((new Date() - new Date('2026-01-01')) / (1000 * 60 * 60 * 24)));
        const totalDaysQ1 = 90; // Q1 = 90 days
        const expectedProgress = daysIntoQ1 > 0 ? Math.round((daysIntoQ1 / totalDaysQ1) * 100) : 0;

        if (engineeringProgress >= expectedProgress) {
          status = 'on-track';
        } else if (engineeringProgress >= expectedProgress - 10) {
          status = 'at-risk';
        } else {
          status = 'behind-schedule';
        }
      }

      return {
        phase2Engineering: {
          startDate: "2026-01-01",
          targetDate: "2026-03-31",
          target: engineeringTarget,
          current: engineeringCurrent,
          remaining: engineeringRemaining,
          progress: engineeringProgress,
          lastUpdate: new Date().toISOString().split('T')[0],
          weeklyGrowth: 0, // Will be calculated from snapshot deltas
          projectedCompletion: engineeringProgress < 100 ? "2026-03-31" : new Date().toISOString().split('T')[0],
          status: status,
          // Include breakdown for transparency
          breakdown: {
            totalEmployees: engineeringTarget,
            currentPremium: engineeringCurrent,
            currentStandard: engineeringDept ? engineeringDept.currentStandard : 0,
            premiumGap: engineeringDept ? engineeringDept.premiumGap : 0,
            upgradesNeeded: engineeringDept ? engineeringDept.upgradesNeeded : 0
          }
        }
      };
    })()
  },
  incrementalROI
};

// Calculate productivity multipliers
dashboardData.codingProductivityMultiplier = (
  dashboardData.claudeCode.linesPerUser / dashboardData.githubCopilot.linesPerUser
).toFixed(1);

// Use promptsPerUser (messages/user from latest month) for apples-to-apples comparison
// Claude Enterprise promptsPerUser = December messagesPerUser (370)
// M365 Copilot promptsPerUser = average prompts per user (44)
dashboardData.generalProductivityMultiplier = (
  dashboardData.claudeEnterprise.promptsPerUser / dashboardData.m365Copilot.promptsPerUser
).toFixed(1);

console.log(`✨ Claude Code vs GitHub Copilot Productivity: ${dashboardData.codingProductivityMultiplier}x\n`);
console.log(`✨ Claude Enterprise vs M365 Copilot Engagement: ${dashboardData.generalProductivityMultiplier}x\n`);

// ============================================================================
// DEPARTMENT ADOPTION HEATMAP - COMPOSITE SCORING
// ============================================================================

console.log('📊 Calculating Department Adoption Heatmap with composite scoring...\n');

// Use existing department headcounts from org chart (calculated at line 2333)
// This ensures consistency with expansion calculations and other metrics

// Aggregate department data from ALL tools (Claude Enterprise, M365 Copilot, Claude Code, GitHub Copilot)
const deptMap = {};

// Add Claude Enterprise data
dashboardData.claudeEnterprise.departmentBreakdown.forEach(dept => {
  if (!deptMap[dept.department]) {
    deptMap[dept.department] = { users: 0, activity: 0 };
  }
  deptMap[dept.department].users += dept.users;
  deptMap[dept.department].activity += dept.messages;
});

// Add M365 Copilot data (latest month)
const m365LatestMonth = dashboardData.m365Copilot.monthlyTrend[dashboardData.m365Copilot.monthlyTrend.length - 1];
if (m365LatestMonth && m365LatestMonth.byDept) {
  m365LatestMonth.byDept.forEach(dept => {
    if (!deptMap[dept.department]) {
      deptMap[dept.department] = { users: 0, activity: 0 };
    }
    deptMap[dept.department].users += dept.users;
    deptMap[dept.department].activity += dept.prompts;
  });
}

// Add Claude Code data (latest month)
const claudeCodeLatestMonth = dashboardData.claudeCode.monthlyTrend[dashboardData.claudeCode.monthlyTrend.length - 1];
if (claudeCodeLatestMonth && claudeCodeLatestMonth.byDept) {
  claudeCodeLatestMonth.byDept.forEach(dept => {
    if (!deptMap[dept.department]) {
      deptMap[dept.department] = { users: 0, activity: 0 };
    }
    deptMap[dept.department].users += dept.users;
    deptMap[dept.department].activity += dept.lines;
  });
}

// Add GitHub Copilot data (latest month)
const githubLatestMonth = dashboardData.githubCopilot.monthlyTrend[dashboardData.githubCopilot.monthlyTrend.length - 1];
if (githubLatestMonth && githubLatestMonth.byDept) {
  githubLatestMonth.byDept.forEach(dept => {
    if (!deptMap[dept.department]) {
      deptMap[dept.department] = { users: 0, activity: 0 };
    }
    deptMap[dept.department].users += dept.users;
    deptMap[dept.department].activity += dept.lines;
  });
}

// Calculate department metrics
const deptArray = Object.keys(deptMap).map(department => {
  const totalEmployees = deptHeadcounts[department] || 0;
  const seatsPerEmployee = totalEmployees > 0
    ? deptMap[department].users / totalEmployees
    : 0;
  const activityPerEmployee = totalEmployees > 0
    ? deptMap[department].activity / totalEmployees
    : 0;
  const activityPerSeat = deptMap[department].users > 0
    ? deptMap[department].activity / deptMap[department].users
    : 0;

  return {
    department,
    users: deptMap[department].users,
    employees: totalEmployees,
    seatsPerEmployee,
    activity: deptMap[department].activity,
    activityPerSeat,
    activityPerEmployee
  };
});

// Calculate percentiles for ranking
const activityPerSeatValues = deptArray.map(d => d.activityPerSeat).sort((a, b) => a - b);
const activityPerEmployeeValues = deptArray.map(d => d.activityPerEmployee).sort((a, b) => a - b);

const getPercentile = (value, sortedArray) => {
  const index = sortedArray.findIndex(v => v >= value);
  return index >= 0 ? index / sortedArray.length : 0;
};

// Calculate composite adoption score (0-100) for each department
const deptWithScores = deptArray.map(dept => {
  // Factor 1: Employee Coverage (0-30 points)
  const coverageScore = Math.min((dept.users / dept.employees) * 30, 30);

  // Factor 2: Multi-Tool Usage (0-25 points)
  const multiToolScore = Math.min(Math.max((dept.seatsPerEmployee - 0.5) * 16.67, 0), 25);

  // Factor 3: Activity Intensity (0-25 points)
  const percentileActivityPerSeat = getPercentile(dept.activityPerSeat, activityPerSeatValues);
  const intensityScore = percentileActivityPerSeat * 25;

  // Factor 4: Total Impact (0-20 points)
  const percentileActivityPerEmployee = getPercentile(dept.activityPerEmployee, activityPerEmployeeValues);
  const impactScore = percentileActivityPerEmployee * 20;

  const totalScore = coverageScore + multiToolScore + intensityScore + impactScore;

  return {
    ...dept,
    adoptionScore: Math.round(totalScore),
    tier: totalScore >= 80 ? 'Excellent' : totalScore >= 60 ? 'Good' : 'Low'
  };
});

// Sort by adoption score (high to low)
const sortedDepartments = deptWithScores.sort((a, b) => b.adoptionScore - a.adoptionScore);

dashboardData.departmentAdoptionHeatmap = sortedDepartments;

console.log(`✅ Department Adoption Heatmap calculated with composite scoring:`);
console.log(`   Top 3 departments:`);
sortedDepartments.slice(0, 3).forEach((d, i) => {
  console.log(`   ${i + 1}. ${d.department}: ${d.adoptionScore} points (${d.tier}) - ${d.users} seats, ${d.seatsPerEmployee.toFixed(2)} seats/emp`);
});
console.log();

// ============================================================================
// ADOPTION METRICS NOW IMPORTED FROM adoption-scorer MODULE
// ============================================================================
// Functions: calculateMoMGrowth, calculateTopDepartments, calculateRecentActivity
// ============================================================================
// calculateExpansionPriorities also imported from expansion-analyzer module
// ============================================================================
// OVERVIEW TAB DATA
// ============================================================================

dashboardData.overview = await aggregateOverviewData({
  claudeEnterpriseActiveUsers,
  m365ActiveUsers,
  claudeEnterpriseTotalConversations,
  licenseConfig: LICENSE_CONFIG,
  claudeEnterpriseMonthly,
  claudeEnterpriseWeekly,
  m365Monthly,
  verbose: true
});

// ============================================================================
// ADOPTION TAB DATA
// ============================================================================

dashboardData.adoption = await aggregateAdoptionData({
  claudeEnterpriseActiveUsers,
  claudeCodeActiveUsers,
  licenseConfig: LICENSE_CONFIG,
  claudeEnterpriseWeekly,
  claudeEnterpriseMonthly,
  verbose: true
});

// ============================================================================
// PRODUCTIVITY TAB DATA
// ============================================================================

console.log('\n📊 Calculating Productivity metrics...\n');

// ============================================================================
// INDUSTRY BENCHMARK TIME SAVINGS (uses shared constants from lines 2115-2121)
// ============================================================================
// Method 1: Cross-tool productivity calculations (uses SHARED CONSTANTS)
// - Claude Enterprise Premium (with Claude Code): CLAUDE_CODE_HOURS_SAVED (~112 hrs/month)
// - Claude Enterprise Standard (no Claude Code): BASELINE_HOURS_SAVED (11 hrs/month)
// - M365 Copilot / GitHub Copilot: BASELINE_HOURS_SAVED (11 hrs/month)
const TIME_SAVINGS_PER_USER = {
  claudeEnterprisePremium: CLAUDE_CODE_HOURS_SAVED,  // ~112 hrs/month (Premium users have Claude Code access)
  claudeEnterpriseStandard: BASELINE_HOURS_SAVED,    // 11 hrs/month (Standard users, no Claude Code)
  m365Copilot: BASELINE_HOURS_SAVED,                 // 11 hrs/month (baseline for general productivity)
  githubCopilot: BASELINE_HOURS_SAVED,               // 11 hrs/month (baseline for coding tools)
};

// Calculate time saved by tool
// NOTE: Claude Code users are included in Premium count, not counted separately
const claudeEnterprisePremiumSavings = totalCurrentPremium * TIME_SAVINGS_PER_USER.claudeEnterprisePremium;
const claudeEnterpriseStandardSavings = totalCurrentStandard * TIME_SAVINGS_PER_USER.claudeEnterpriseStandard;
const claudeEnterpriseSavings = claudeEnterprisePremiumSavings + claudeEnterpriseStandardSavings;
const m365CopilotSavings = dashboardData.m365Copilot.activeUsers * TIME_SAVINGS_PER_USER.m365Copilot;
const githubCopilotSavings = dashboardData.githubCopilot.activeUsers * TIME_SAVINGS_PER_USER.githubCopilot;

const totalTimeSavedAllTools = claudeEnterpriseSavings + m365CopilotSavings + githubCopilotSavings;

// For dashboard ROI calculations, use weighted average
const avgTimeSavingsPerUser = Math.round(totalTimeSavedAllTools / (totalCurrentPremium + totalCurrentStandard + dashboardData.m365Copilot.activeUsers + dashboardData.githubCopilot.activeUsers));

console.log(`\n💼 Method 1 - Cross-Tool Time Savings:`);
console.log(`   Claude Enterprise Premium: ${totalCurrentPremium} users × ${TIME_SAVINGS_PER_USER.claudeEnterprisePremium} hrs = ${claudeEnterprisePremiumSavings.toLocaleString()} hrs/month`);
console.log(`   Claude Enterprise Standard: ${totalCurrentStandard} users × ${TIME_SAVINGS_PER_USER.claudeEnterpriseStandard} hrs = ${claudeEnterpriseStandardSavings.toLocaleString()} hrs/month`);
console.log(`   M365 Copilot: ${dashboardData.m365Copilot.activeUsers} users × ${TIME_SAVINGS_PER_USER.m365Copilot} hrs = ${m365CopilotSavings.toLocaleString()} hrs/month`);
console.log(`   GitHub Copilot: ${dashboardData.githubCopilot.activeUsers} users × ${TIME_SAVINGS_PER_USER.githubCopilot} hrs = ${githubCopilotSavings.toLocaleString()} hrs/month`);
console.log(`   Total: ${totalTimeSavedAllTools.toLocaleString()} hrs/month`);
console.log(`   Average: ${avgTimeSavingsPerUser} hrs/user/month\n`);

dashboardData.productivity = {
  avgTimeSavingsPerUser,
  totalTimeSaved: totalTimeSavedAllTools,
  timeSavingsByTool: {
    claudeEnterprise: claudeEnterpriseSavings,
    claudeEnterprisePremium: claudeEnterprisePremiumSavings,
    claudeEnterpriseStandard: claudeEnterpriseStandardSavings,
    m365Copilot: m365CopilotSavings,
    githubCopilot: githubCopilotSavings,
  },
  roiExamples: [
    {
      useCase: 'Code Generation',
      timeSaved: '4 hours/week',
      tool: 'Claude Code',
      impact: `${dashboardData.codingProductivityMultiplier}x productivity gain`
    },
    {
      useCase: 'Document Analysis',
      timeSaved: '2 hours/week',
      tool: 'Claude Enterprise',
      impact: 'Faster insights from complex documents'
    },
    {
      useCase: 'Meeting Summaries',
      timeSaved: '30 min/day',
      tool: 'M365 Copilot',
      impact: 'Quick catch-up on Teams conversations'
    },
    {
      useCase: 'Code Review',
      timeSaved: '3 hours/week',
      tool: 'GitHub Copilot',
      impact: 'Faster debugging and quality checks'
    }
  ],
  topFeatures: [
    ...dashboardData.githubCopilot.featureUsage.slice(0, 3),
    { feature: 'Claude Projects', users: dashboardData.claudeEnterprise.totalProjects },
    { feature: 'Teams Copilot', users: appUsageArray.find(a => a.app === 'Teams')?.users || 0 }
  ].sort((a, b) => b.users - a.users).slice(0, 5)
};

// ============================================================================
// VIRTUAL FTE CALCULATION (MONTHLY)
// ============================================================================
// Calculate Agentic FTEs from productivity gains and coding output per month
// Shows how many "virtual employees" AI tools have added to the organization

console.log('\n👥 Calculating Agentic FTEs...\n');

// Calculate monthly Agentic FTEs using actual monthly data
dashboardData.agenticFTEsMonthly = calculateMonthlyAgenticFTEs({
  claudeEnterpriseMonthly: claudeEnterpriseMonthly,
  claudeCodeMonthly: claudeCodeMonthly,
  m365CopilotMonthly: m365Monthly,
  githubCopilotMonthly: githubCopilotMonthly,
  config: {
    monthlyFTEHours: 173,
    hoursPerLine: 0.08,
    timeSavings: {
      claudeEnterprise: 0.28,
      m365Copilot: 0.14
    }
  },
  verbose: true
});

// Calculate current month summary (for KPI cards)
const latestMonth = dashboardData.agenticFTEsMonthly[dashboardData.agenticFTEsMonthly.length - 1];
const previousMonth = dashboardData.agenticFTEsMonthly.length > 1 ?
                      dashboardData.agenticFTEsMonthly[dashboardData.agenticFTEsMonthly.length - 2] :
                      null;

// Calculate projection for current month if it's a partial month (MTD)
let projection = null;
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1; // 1-12
const currentDay = today.getDate();

// Check if latestMonth is the current month (partial/MTD)
const [latestYear, latestMonthNum] = latestMonth.month.split('-').map(Number);
if (latestYear === currentYear && latestMonthNum === currentMonth && currentDay < 28) {
  // Current month is partial - calculate projection
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate(); // Get days in current month
  const projectionMultiplier = daysInMonth / currentDay;

  projection = {
    totalAgenticFTEs: parseFloat((latestMonth.totalFTEs * projectionMultiplier).toFixed(1)),
    totalProductiveHours: Math.round(latestMonth.totalHours * projectionMultiplier),
    breakdown: {
      claudeEnterprise: parseFloat((latestMonth.breakdown.claudeEnterprise * projectionMultiplier).toFixed(1)),
      claudeCode: parseFloat((latestMonth.breakdown.claudeCode * projectionMultiplier).toFixed(1)),
      m365Copilot: parseFloat((latestMonth.breakdown.m365Copilot * projectionMultiplier).toFixed(1)),
      githubCopilot: parseFloat((latestMonth.breakdown.githubCopilot * projectionMultiplier).toFixed(1))
    },
    methodology: `Projected based on ${currentDay} days of data to ${daysInMonth} days (${projectionMultiplier.toFixed(2)}x multiplier)`
  };

  console.log(`\n📊 MTD Projection for ${latestMonth.monthLabel}:`);
  console.log(`   Current (${currentDay} days): ${latestMonth.totalFTEs.toFixed(1)} FTEs`);
  console.log(`   Projected (${daysInMonth} days): ${projection.totalAgenticFTEs} FTEs`);
  console.log(`   Projection multiplier: ${projectionMultiplier.toFixed(2)}x\n`);
}

dashboardData.agenticFTEs = {
  // Current month summary
  current: {
    totalAgenticFTEs: latestMonth.totalFTEs,
    totalProductiveHours: latestMonth.totalHours,
    month: latestMonth.month,
    monthLabel: latestMonth.monthLabel,
    breakdown: latestMonth.breakdown,
    isMTD: projection !== null, // Flag to indicate if this is partial month data
    daysOfData: projection !== null ? currentDay : null
  },

  // Month-over-month change
  monthOverMonth: previousMonth ? {
    ftesChange: parseFloat((latestMonth.totalFTEs - previousMonth.totalFTEs).toFixed(1)),
    percentChange: parseFloat((((latestMonth.totalFTEs - previousMonth.totalFTEs) / previousMonth.totalFTEs) * 100).toFixed(1))
  } : null,

  // Projection for current month (if MTD)
  projection: projection,

  // Monthly trend data (for charts)
  monthlyTrend: dashboardData.agenticFTEsMonthly,

  // Metadata
  metadata: {
    calculatedAt: new Date().toISOString(),
    version: '2.1.0',
    note: 'Using actual monthly data from all tools. Includes projection for partial months.',
    industryBenchmarks: {
      claudeEnterprise: {
        timeSavings: 0.28,
        source: 'Anthropic research + Australian Government studies'
      },
      m365Copilot: {
        timeSavings: 0.14,
        source: 'Australian Government Digital.gov.au trial'
      },
      codingTools: {
        hoursPerLine: 0.08,
        manualBaseline: '12.5 lines/hr',
        source: 'Code Complete and COCOMO model'
      }
    }
  }
};

console.log(`\n✅ Current Month Agentic FTEs: ${latestMonth.totalFTEs} FTEs`);
if (previousMonth) {
  console.log(`   Month-over-Month Change: ${dashboardData.agenticFTEs.monthOverMonth.ftesChange >= 0 ? '+' : ''}${dashboardData.agenticFTEs.monthOverMonth.ftesChange} FTEs (${dashboardData.agenticFTEs.monthOverMonth.percentChange >= 0 ? '+' : ''}${dashboardData.agenticFTEs.monthOverMonth.percentChange}%)`);
}
console.log('');

// ============================================================================
// CODE TAB DATA (CLAUDE CODE LEADERBOARD)
// ============================================================================

dashboardData.code = await aggregateCodeData({
  allClaudeCodeData,
  orgEmailMap,
  claudeCodeMonthly,
  getDepartmentInfo,
  verbose: true
});

// ============================================================================
// ENABLEMENT TAB DATA
// ============================================================================

dashboardData.enablement = await aggregateEnablementData({
  claudeEnterpriseActiveUsers,
  claudeEnterpriseMonthly,
  m365Monthly,
  orgEmailMap,
  verbose: true
});

// ============================================================================
// ORG CHART DATA (Phase 2: Agentic Org Chart Visualization)
// ============================================================================

dashboardData.orgChart = orgChartData;

console.log(`\n✅ Org Chart: ${orgChartData ? orgChartData.organization.totalEmployees : 0} employees loaded\n`);

// ============================================================================
// EXPANSION TAB DATA
// ============================================================================

// OLD EXPANSION CODE - COMMENTED OUT (replaced by Phase 3 data-driven expansion at line 2211)
/*
console.log('\n📊 Calculating Expansion metrics...\n');

// Pricing (monthly)
const PRICING = {
  claudeEnterprisePremium: 200,
  claudeEnterpriseStandard: 40,
  m365Copilot: 30, // Estimate
  githubCopilot: 19
};

// Current costs
const currentCosts = {
  claudeEnterprise: (LICENSE_CONFIG.claudeCode.licensedUsers * PRICING.claudeEnterprisePremium) +
                   ((LICENSE_CONFIG.claudeEnterprise.licensedUsers - LICENSE_CONFIG.claudeCode.licensedUsers) * PRICING.claudeEnterpriseStandard),
  claudeCode: LICENSE_CONFIG.claudeCode.licensedUsers * PRICING.claudeEnterprisePremium,
  m365Copilot: LICENSE_CONFIG.m365Copilot.licensedUsers * PRICING.m365Copilot,
  githubCopilot: dashboardData.githubCopilot.activeUsers * PRICING.githubCopilot,
  total: 0
};
currentCosts.total = currentCosts.claudeEnterprise + currentCosts.m365Copilot + currentCosts.githubCopilot;

// Full rollout costs (all employees get Standard, engineers get Premium)
const totalEmployees = orgEmailMap.size;
const engineeringCount = 70; // Approximate from org chart
const fullRolloutCosts = {
  claudeEnterprise: (engineeringCount * PRICING.claudeEnterprisePremium) +
                   ((totalEmployees - engineeringCount) * PRICING.claudeEnterpriseStandard),
  claudeCode: engineeringCount * PRICING.claudeEnterprisePremium,
  m365Copilot: currentCosts.m365Copilot, // Already org-wide
  githubCopilot: 0, // Would replace with Claude Code
  total: 0
};
fullRolloutCosts.total = fullRolloutCosts.claudeEnterprise + fullRolloutCosts.m365Copilot;

// ROI modeling - CURRENT VALUE (based on active Claude users)
// Using actual TechCo Inc Claude Code engineer salary data
const avgEngineerSalary = 123315; // Average salary of Claude Code users
const salaryStdDev = 52746; // Standard deviation
const fullyLoadedMultiplier = 1.3; // Benefits, taxes, overhead

// Calculate hourly rates with salary range (±1 standard deviation)
const avgSalaryLow = avgEngineerSalary - salaryStdDev; // $70,569
const avgSalaryHigh = avgEngineerSalary + salaryStdDev; // $176,061

const hourlyRateLow = (avgSalaryLow * fullyLoadedMultiplier) / 2080; // $44/hr
const hourlyRateAvg = (avgEngineerSalary * fullyLoadedMultiplier) / 2080; // $77/hr
const hourlyRateHigh = (avgSalaryHigh * fullyLoadedMultiplier) / 2080; // $110/hr

const claudeActiveUsers = dashboardData.claudeEnterprise.activeUsers; // 87 users

// Current monthly time savings (hours) for active Claude users only
const totalMonthlyHoursSaved = avgTimeSavingsPerUser * claudeActiveUsers;

// Current monthly value (dollars) - range based on salary distribution
const monthlyValueLow = Math.round(totalMonthlyHoursSaved * hourlyRateLow);
const monthlyValueAvg = Math.round(totalMonthlyHoursSaved * hourlyRateAvg);
const monthlyValueHigh = Math.round(totalMonthlyHoursSaved * hourlyRateHigh);

// Current net value (value minus current costs)
const netMonthlyValueLow = monthlyValueLow - currentCosts.total;
const netMonthlyValueAvg = monthlyValueAvg - currentCosts.total;
const netMonthlyValueHigh = monthlyValueHigh - currentCosts.total;

// Future state: If we rolled out to all employees
const potentialMonthlyValueLow = Math.round(avgTimeSavingsPerUser * totalEmployees * hourlyRateLow);
const potentialMonthlyValueAvg = Math.round(avgTimeSavingsPerUser * totalEmployees * hourlyRateAvg);
const potentialMonthlyValueHigh = Math.round(avgTimeSavingsPerUser * totalEmployees * hourlyRateHigh);
const potentialNetValue = potentialMonthlyValueAvg - fullRolloutCosts.total;
const paybackPeriod = potentialNetValue > 0 ? Math.ceil(fullRolloutCosts.total / potentialNetValue) : 0;

dashboardData.expansion = {
  currentCosts,
  fullRolloutCosts,
  paybackPeriod,
  // Salary data (actual TechCo Inc Claude Code engineers)
  avgEngineerSalary,
  salaryStdDev,
  fullyLoadedMultiplier,
  hourlyRateLow: Math.round(hourlyRateLow),
  hourlyRateAvg: Math.round(hourlyRateAvg),
  hourlyRateHigh: Math.round(hourlyRateHigh),
  // Current value metrics (87 Claude users)
  currentActiveUsers: claudeActiveUsers,
  monthlyHoursSavedPerUser: avgTimeSavingsPerUser,
  totalMonthlyHoursSaved: Math.round(totalMonthlyHoursSaved),
  // Monthly value ranges (low/avg/high based on salary distribution)
  totalMonthlyValueLow: monthlyValueLow,
  totalMonthlyValueAvg: monthlyValueAvg,
  totalMonthlyValueHigh: monthlyValueHigh,
  // Net monthly value ranges
  netMonthlyValueLow,
  netMonthlyValueAvg,
  netMonthlyValueHigh,
  // Potential value metrics (251 total employees)
  potentialMonthlyValueLow,
  potentialMonthlyValueAvg,
  potentialMonthlyValueHigh,
  potentialNetValue,
  recommendations: [
    {
      department: 'Engineering',
      action: `Expand Claude Code to all ${engineeringCount} engineers`,
      cost: engineeringCount * PRICING.claudeEnterprisePremium,
      roi: `${dashboardData.codingProductivityMultiplier}x productivity gain`
    },
    {
      department: 'Product & Marketing',
      action: 'Expand Claude Enterprise Standard to all team members',
      cost: 30 * PRICING.claudeEnterpriseStandard,
      roi: 'Faster content creation and document analysis'
    }
  ]
};

console.log(`✅ Expansion Metrics:`);
console.log(`   - Current monthly cost: $${currentCosts.total.toLocaleString()}`);
console.log(`   - Full rollout cost: $${fullRolloutCosts.total.toLocaleString()}`);
console.log(`   - Estimated payback: ${paybackPeriod} months`);
*/

// ============================================================================
// NOTABLE PERSONNEL CONTEXT (for AI insight generation)
// Dynamically built from top users across all tools + org chart titles
// ============================================================================

const notablePersonnel = [];

// Top Claude Enterprise users
if (dashboardData.claudeEnterprise?.powerUsers) {
  dashboardData.claudeEnterprise.powerUsers.slice(0, 5).forEach(user => {
    const email = user.email?.toLowerCase();
    if (email) {
      const info = getDepartmentInfo(email, orgEmailMap);
      if (info.name && info.name !== 'Unknown') {
        notablePersonnel.push({
          name: info.name,
          title: info.title || 'Team Member',
          department: info.department,
          context: `Top Claude Enterprise user (${user.totalPrompts || user.messages || 0} prompts)`
        });
      }
    }
  });
}

// Top Claude Code users
if (dashboardData.code?.leaderboard) {
  dashboardData.code.leaderboard.slice(0, 5).forEach(user => {
    const email = user.email?.toLowerCase();
    if (email) {
      const info = getDepartmentInfo(email, orgEmailMap);
      if (info.name && info.name !== 'Unknown' && !notablePersonnel.find(p => p.name === info.name)) {
        notablePersonnel.push({
          name: info.name,
          title: info.title || 'Team Member',
          department: info.department,
          context: `Top Claude Code user (${(user.totalLines || 0).toLocaleString()} lines generated)`
        });
      }
    }
  });
}

// Top Project creators
if (dashboardData.claudeEnterprise?.projectsAnalytics?.byCreator) {
  dashboardData.claudeEnterprise.projectsAnalytics.byCreator.slice(0, 3).forEach(creator => {
    const existing = notablePersonnel.find(p => p.name === creator.creator);
    if (existing) {
      existing.context += `, Top project creator (${creator.projectCount} projects)`;
    } else {
      notablePersonnel.push({
        name: creator.creator || 'Unknown',
        title: creator.title || creator.department || 'Team Member',
        department: creator.department || 'Unknown',
        context: `Top project creator (${creator.projectCount} projects)`
      });
    }
  });
}

// Top Connector/Integration power users
if (dashboardData.connectors?.powerUsers) {
  dashboardData.connectors.powerUsers.slice(0, 3).forEach(user => {
    const name = user.displayName || user.name || 'Unknown';
    const existing = notablePersonnel.find(p => p.name === name);
    if (existing) {
      existing.context += `, Integration power user (${(user.totalCalls || 0).toLocaleString()} calls)`;
    } else {
      notablePersonnel.push({
        name: name,
        title: user.title || user.department || 'Team Member',
        department: user.department || 'Unknown',
        context: `Integration power user (${(user.totalCalls || 0).toLocaleString()} calls)`
      });
    }
  });
}

dashboardData.notablePersonnel = notablePersonnel;
console.log(`\n✅ Notable Personnel: ${notablePersonnel.length} individuals identified for AI context\n`);

return dashboardData;
}

// Export the pipeline orchestrator
module.exports = {
  runPipeline
};
