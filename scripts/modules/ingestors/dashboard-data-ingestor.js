/**
 * Dashboard Data Ingestor
 *
 * Imports current dashboard metrics from ai-tools-data.json for use in annual plan generation.
 * Used primarily for dependency classification (HARD vs SOFT dependencies).
 *
 * Key Metrics Extracted:
 * - Adoption rates (Claude Enterprise, Claude Code, M365 Copilot)
 * - Productivity multipliers (Claude Code vs GitHub Copilot)
 * - Engagement multipliers (Claude Enterprise vs M365 Copilot)
 * - Perceived value scores
 * - Department headcounts and adoption
 *
 * Dependencies: None (reads JSON file)
 */

const fs = require('fs');
const path = require('path');

/**
 * Ingest dashboard metrics for annual plan analysis
 *
 * @param {Object} options - Configuration options
 * @param {string} options.dashboardDataPath - Path to ai-tools-data.json
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Dashboard metrics
 */
async function ingestDashboardData(options = {}) {
  const {
    dashboardDataPath = path.join(__dirname, '../../../app/ai-tools-data.json'),
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Ingesting dashboard data...\n');
  }

  // Read dashboard data
  const data = JSON.parse(fs.readFileSync(dashboardDataPath, 'utf8'));

  if (verbose) {
    console.log(`   Loaded dashboard data from: ${path.basename(dashboardDataPath)}`);
  }

  // Extract key metrics for dependency classification
  const metrics = {
    // Adoption rates
    adoption: {
      claudeEnterprise: data.adoption?.activationRate || 0,
      claudeCode: data.code?.leaderboard?.length > 0 ? 100 : 0,  // Active users indicator
      m365Copilot: data.m365Copilot?.adoptionRate || 0,
      githubCopilot: data.githubCopilot?.activeUsers || 0
    },

    // Productivity multipliers
    productivity: {
      claudeCodeMultiplier: parseFloat(data.codingProductivityMultiplier) || 0,  // vs GitHub Copilot
      engagementMultiplier: parseFloat(data.generalProductivityMultiplier) || 0  // vs M365 Copilot
    },

    // Perceived value
    perceivedValue: {
      claudeEnterprise: getPerceivedValue(data.perceivedValue, 'Claude Enterprise'),
      m365Copilot: getPerceivedValue(data.perceivedValue, 'M365 Copilot'),
      claudeCode: getPerceivedValue(data.perceivedValue, 'Claude Code'),
      githubCopilot: getPerceivedValue(data.perceivedValue, 'GitHub Copilot')
    },

    // Organization metrics
    orgMetrics: {
      totalEmployees: data.orgMetrics?.totalEmployees || 0,
      departments: data.orgMetrics?.departmentHeadcounts || {},
      departmentAdoption: extractDepartmentAdoption(data)
    },

    // License configuration
    licenses: {
      claudeEnterprise: {
        licensed: data.adoption?.licensedUsers || 0,
        active: data.adoption?.activatedUsers || 0
      },
      claudeCode: {
        licensed: data.adoption?.seatUtilization?.Premium?.licensed || 0,
        active: data.adoption?.seatUtilization?.Premium?.active || 0
      },
      m365Copilot: {
        licensed: data.m365Copilot?.licensedUsers || 0,
        active: data.m365Copilot?.activeUsers || 0
      }
    },

    // Current state ROI (for comparison)
    currentStateROI: data.currentStateROI || {},

    // Metadata
    metadata: {
      lastUpdated: data.metadata?.lastUpdated || new Date().toISOString(),
      version: data.metadata?.version || 'unknown'
    }
  };

  if (verbose) {
    console.log(`\n✅ Dashboard Data Summary:`);
    console.log(`   - Claude Enterprise adoption: ${metrics.adoption.claudeEnterprise}%`);
    console.log(`   - M365 Copilot adoption: ${metrics.adoption.m365Copilot}%`);
    console.log(`   - Claude Code productivity multiplier: ${metrics.productivity.claudeCodeMultiplier.toFixed(1)}x`);
    console.log(`   - Engagement multiplier: ${metrics.productivity.engagementMultiplier.toFixed(1)}x`);
    console.log(`   - Total employees: ${metrics.orgMetrics.totalEmployees}`);
  }

  return metrics;
}

/**
 * Extract perceived value score for a specific tool
 */
function getPerceivedValue(perceivedValueData, toolName) {
  if (!perceivedValueData || !perceivedValueData.tools) {
    return 0;
  }

  const tool = perceivedValueData.tools.find(t =>
    t.name && t.name.toLowerCase().includes(toolName.toLowerCase())
  );

  return tool ? tool.score : 0;
}

/**
 * Extract department adoption metrics
 */
function extractDepartmentAdoption(data) {
  const departmentAdoption = {};

  // Extract from department heatmap if available
  if (data.departmentAdoptionHeatmap?.departments) {
    data.departmentAdoptionHeatmap.departments.forEach(dept => {
      departmentAdoption[dept.department] = {
        employees: dept.totalEmployees || 0,
        seats: dept.seats || 0,
        adoptionRate: dept.adoptionScore || 0,
        engagementScore: dept.engagementScore || 0
      };
    });
  }

  return departmentAdoption;
}

/**
 * Helper: Get dependency classification criteria
 *
 * Returns thresholds used to determine HARD vs SOFT dependencies
 */
function getDependencyThresholds() {
  return {
    productivityMultiplier: 10,     // >10x = HARD dependency
    engagementMultiplier: 4,        // >4x = HARD dependency
    perceivedValueGap: 30,          // >30 points = HARD dependency
    adoptionRate: 80                // >80% = HARD dependency
  };
}

/**
 * Helper: Check if dependency should be HARD based on dashboard data
 *
 * @param {Object} metrics - Dashboard metrics
 * @param {string} dependencyProject - Project ID being evaluated
 * @returns {boolean} True if should be HARD dependency
 */
function shouldBeHardDependency(metrics, dependencyProject) {
  const thresholds = getDependencyThresholds();

  // Check productivity multiplier
  if (metrics.productivity.claudeCodeMultiplier > thresholds.productivityMultiplier) {
    return true;
  }

  // Check engagement multiplier
  if (metrics.productivity.engagementMultiplier > thresholds.engagementMultiplier) {
    return true;
  }

  // Check perceived value gap
  const claudeValue = metrics.perceivedValue.claudeEnterprise;
  const m365Value = metrics.perceivedValue.m365Copilot;
  if (Math.abs(claudeValue - m365Value) > thresholds.perceivedValueGap) {
    return true;
  }

  // Check adoption rate
  if (metrics.adoption.claudeEnterprise > thresholds.adoptionRate) {
    return true;
  }

  return false;
}

module.exports = {
  ingestDashboardData,
  getDependencyThresholds,
  shouldBeHardDependency
};
