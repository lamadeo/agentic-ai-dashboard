/**
 * Org Hierarchy Data Ingestor
 *
 * Ingests organizational hierarchy from JSON file.
 *
 * Input:  techco_org_chart.json in /data/
 *
 * Output: Normalized org hierarchy structure with:
 *         - Email to department/team mappings
 *         - Department information
 *         - Employee status (current/non-current)
 *
 * Dependencies: parse-hierarchy module (reuses existing logic)
 */

const path = require('path');
const fs = require('fs');
const { buildOrgMappingFromHierarchy, getDepartmentHeadcounts } = require('../../parse-hierarchy');

/**
 * Ingest org hierarchy data
 * @param {Object} options - Configuration options
 * @param {string} options.jsonPath - Path to org chart JSON (default: '../../../data/techco_org_chart.json')
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Promise<Object>} Normalized org hierarchy structure
 * @throws {Error} If JSON file not found or parsing fails
 */
async function ingestOrgHierarchy(options = {}) {
  const {
    jsonPath = path.join(__dirname, '../../../data/techco_org_chart.json'),
    verbose = true
  } = options;

  if (verbose) console.log('📊 Parsing role/department mappings from org hierarchy...\n');

  try {
    // Use existing parse-hierarchy module
    const orgEmailMap = buildOrgMappingFromHierarchy(jsonPath);
    const deptHeadcountsMap = getDepartmentHeadcounts(jsonPath);

    // Convert Map to Object for compatibility with rest of pipeline
    const deptHeadcounts = Object.fromEntries(deptHeadcountsMap);

    // Load full org chart JSON for visualization
    const orgChartData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // Return normalized structure
    return {
      // Email mappings for processors
      orgEmailMap,

      // Department headcounts
      deptHeadcounts,

      // Full org chart structure for visualization
      orgChart: orgChartData,

      // Metadata
      metadata: {
        jsonPath,
        totalEmployees: orgEmailMap.size,
        departmentCount: Object.keys(deptHeadcounts).length,
        ingestedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    if (verbose) {
      console.error('❌ Error parsing org hierarchy:', error.message);
      console.log('⚠️  Falling back to Unknown department for all users\n');
    }

    // Return empty mappings as fallback
    return {
      orgEmailMap: new Map(),
      deptHeadcounts: {},
      orgChart: null,
      metadata: {
        jsonPath,
        totalEmployees: 0,
        departmentCount: 0,
        ingestedAt: new Date().toISOString(),
        fallback: true,
        error: error.message
      }
    };
  }
}

module.exports = { ingestOrgHierarchy };
