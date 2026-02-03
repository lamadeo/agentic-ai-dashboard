/**
 * Projects Processor
 *
 * Processes enriched projects data from the ingestor:
 * - Maps creators to departments via org hierarchy
 * - Calculates sophistication scores
 * - Categorizes projects by inferred purpose
 * - Aggregates by department and creator
 *
 * Dependencies: parse-hierarchy (getDepartmentInfo)
 */

const { getDepartmentInfo } = require('../../parse-hierarchy');

/**
 * Calculate sophistication score for a project
 * Based on: docs, prompts, description, recency
 * @param {Object} project - Enriched project object
 * @returns {number} Score 0-100
 * @private
 */
function calculateSophisticationScore(project) {
  let score = 0;

  // Has documents attached (up to 30 points)
  score += Math.min(project.docCount * 10, 30);

  // Has prompt template (20 points)
  if (project.hasPromptTemplate) {
    score += 20;
    // Extra points for longer templates (up to 10 points)
    score += Math.min(Math.floor(project.promptTemplateLength / 200), 10);
  }

  // Has description (15 points)
  if (project.description && project.description.length > 10) {
    score += 15;
  }

  // Is not a starter/template project (5 points)
  if (!project.isStarterProject) {
    score += 5;
  }

  // Recency bonus (up to 20 points for projects updated in last 30 days)
  if (project.updatedAt) {
    const daysSinceUpdate = (Date.now() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) score += 20;
    else if (daysSinceUpdate < 14) score += 15;
    else if (daysSinceUpdate < 30) score += 10;
    else if (daysSinceUpdate < 60) score += 5;
  }

  return Math.min(score, 100);
}

/**
 * Infer project category from name and description
 * @param {Object} project - Enriched project object
 * @returns {string} Category: content, sales, technical, hr, analysis, other
 * @private
 */
function categorizeProject(project) {
  const text = `${project.name} ${project.description}`.toLowerCase();

  // Content creation
  if (/blog|article|content|writing|copy|marketing|social|email|newsletter/.test(text)) {
    return 'content';
  }

  // Sales & outreach
  if (/sales|proposal|pitch|outreach|customer|client|deal|contract|rfp/.test(text)) {
    return 'sales';
  }

  // Technical & development
  if (/code|dev|api|engineer|debug|test|deploy|infrastructure|database|architecture/.test(text)) {
    return 'technical';
  }

  // HR & people
  if (/hr|hiring|recruit|onboard|employee|policy|handbook|training|abby|interview/.test(text)) {
    return 'hr';
  }

  // Analysis & research
  if (/analysis|research|report|data|insight|metrics|dashboard|review|summary/.test(text)) {
    return 'analysis';
  }

  return 'other';
}

/**
 * Determine if project is active (updated in last 30 days)
 * @param {Object} project - Enriched project object
 * @returns {boolean} True if active
 * @private
 */
function isActiveProject(project) {
  if (!project.updatedAt) return false;
  const daysSinceUpdate = (Date.now() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate < 30;
}

/**
 * Process projects data with department enrichment and scoring
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.projectsEnriched - Enriched projects from ingestor
 * @param {Map} options.creatorUUIDtoEmail - Creator UUID to email mapping
 * @param {Map} options.userEmailLookup - UUID to email mapping
 * @param {Map} options.orgEmailMap - Org hierarchy email map
 * @param {boolean} options.verbose - Enable detailed logging
 * @returns {Promise<Object>} Processed projects data
 */
async function processProjectsData(options = {}) {
  const {
    projectsEnriched = [],
    creatorUUIDtoEmail,
    userEmailLookup,
    orgEmailMap,
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Processing Projects data...\n');
  }

  // 1. Process each project with department info, scores, and categories
  const processedProjects = projectsEnriched.map(project => {
    // Get creator email
    let creatorEmail = '';
    if (project.creator?.uuid) {
      creatorEmail = creatorUUIDtoEmail?.get(project.creator.uuid) ||
                     userEmailLookup?.get(project.creator.uuid) ||
                     '';
    }

    // Get department info
    const deptInfo = orgEmailMap && creatorEmail
      ? getDepartmentInfo(creatorEmail, orgEmailMap)
      : null;
    const department = deptInfo?.department || 'Unknown';

    // Calculate sophistication score
    const sophisticationScore = calculateSophisticationScore(project);

    // Categorize project
    const category = categorizeProject(project);

    // Check if active
    const active = isActiveProject(project);

    return {
      ...project,
      creatorEmail,
      department,
      sophisticationScore,
      category,
      isActive: active
    };
  });

  // Sort by sophistication score
  processedProjects.sort((a, b) => b.sophisticationScore - a.sophisticationScore);

  // 2. Aggregate by department
  const byDepartment = {};
  processedProjects.forEach(project => {
    if (!byDepartment[project.department]) {
      byDepartment[project.department] = {
        count: 0,
        activeCount: 0,
        uniqueCreators: new Set(),
        totalSophistication: 0,
        withDocs: 0,
        withPrompts: 0,
        categories: {}
      };
    }

    const deptStats = byDepartment[project.department];
    deptStats.count++;
    if (project.isActive) deptStats.activeCount++;
    if (project.creatorEmail) deptStats.uniqueCreators.add(project.creatorEmail);
    deptStats.totalSophistication += project.sophisticationScore;
    if (project.docCount > 0) deptStats.withDocs++;
    if (project.hasPromptTemplate) deptStats.withPrompts++;

    // Track categories
    deptStats.categories[project.category] = (deptStats.categories[project.category] || 0) + 1;
  });

  // Convert department data
  const byDepartmentArray = Object.entries(byDepartment).map(([department, stats]) => ({
    department,
    count: stats.count,
    activeCount: stats.activeCount,
    uniqueCreators: stats.uniqueCreators.size,
    avgSophistication: stats.count > 0
      ? Math.round(stats.totalSophistication / stats.count)
      : 0,
    withDocs: stats.withDocs,
    withPrompts: stats.withPrompts,
    categories: stats.categories
  })).sort((a, b) => b.count - a.count);

  // 3. Aggregate by creator
  const byCreator = {};
  processedProjects.forEach(project => {
    if (!project.creatorEmail) return;

    if (!byCreator[project.creatorEmail]) {
      byCreator[project.creatorEmail] = {
        email: project.creatorEmail,
        name: project.creator?.fullName || project.creatorEmail.split('@')[0],
        department: project.department,
        count: 0,
        totalSophistication: 0,
        totalDocs: 0,
        categories: new Set()
      };
    }

    const creatorStats = byCreator[project.creatorEmail];
    creatorStats.count++;
    creatorStats.totalSophistication += project.sophisticationScore;
    creatorStats.totalDocs += project.docCount;
    creatorStats.categories.add(project.category);
  });

  // Convert creator data
  const byCreatorArray = Object.values(byCreator).map(stats => ({
    email: stats.email,
    name: stats.name,
    department: stats.department,
    count: stats.count,
    avgSophistication: stats.count > 0
      ? Math.round(stats.totalSophistication / stats.count)
      : 0,
    totalDocs: stats.totalDocs,
    categoryDiversity: stats.categories.size
  })).sort((a, b) => b.count - a.count);

  // 4. Aggregate by category
  const byCategory = {};
  processedProjects.forEach(project => {
    byCategory[project.category] = (byCategory[project.category] || 0) + 1;
  });

  const totalProjects = processedProjects.length;
  const byCategoryArray = Object.entries(byCategory)
    .map(([category, count]) => ({
      category,
      count,
      percentage: totalProjects > 0
        ? Math.round((count / totalProjects) * 100)
        : 0
    }))
    .sort((a, b) => b.count - a.count);

  // 5. Calculate monthly trend
  const monthlyTrend = calculateMonthlyTrend(processedProjects);

  if (verbose) {
    console.log(`   Processed ${processedProjects.length} projects`);
    console.log(`   Active projects: ${processedProjects.filter(p => p.isActive).length}`);
    console.log(`   Unique creators: ${byCreatorArray.length}`);
    console.log(`   Departments: ${byDepartmentArray.length}`);
    console.log(`   Categories: ${byCategoryArray.map(c => `${c.category}(${c.count})`).join(', ')}`);
  }

  return {
    projects: processedProjects,
    byDepartment: byDepartmentArray,
    byCreator: byCreatorArray,
    byCategory: byCategoryArray,
    monthlyTrend,
    metadata: {
      processedAt: new Date().toISOString(),
      totalProjects: processedProjects.length,
      activeProjects: processedProjects.filter(p => p.isActive).length,
      uniqueCreators: byCreatorArray.length,
      avgSophistication: processedProjects.length > 0
        ? Math.round(processedProjects.reduce((sum, p) => sum + p.sophisticationScore, 0) / processedProjects.length)
        : 0
    }
  };
}

/**
 * Calculate monthly trend from project creation dates
 * @param {Array} projects - Processed projects
 * @returns {Array} Monthly trend data
 * @private
 */
function calculateMonthlyTrend(projects) {
  const monthlyData = new Map();

  projects.forEach(project => {
    if (!project.createdAt) return;

    try {
      const date = new Date(project.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          created: 0,
          totalSophistication: 0
        });
      }

      const monthStats = monthlyData.get(monthKey);
      monthStats.created++;
      monthStats.totalSophistication += project.sophisticationScore;
    } catch (e) {
      // Skip invalid dates
    }
  });

  // Convert to array and format
  return Array.from(monthlyData.values())
    .map(m => ({
      month: m.month,
      monthLabel: formatMonthLabel(m.month),
      created: m.created,
      avgSophistication: m.created > 0
        ? Math.round(m.totalSophistication / m.created)
        : 0
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Format month key to display label
 * @param {string} monthKey - Month key in YYYY-MM format
 * @returns {string} Formatted label like "Jan 2026"
 * @private
 */
function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

module.exports = {
  processProjectsData,
  calculateSophisticationScore,
  categorizeProject
};
