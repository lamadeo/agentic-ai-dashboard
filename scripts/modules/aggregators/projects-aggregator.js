/**
 * Projects Aggregator
 *
 * Prepares dashboard-ready data structure from processed projects data.
 * Outputs format compatible with ai-tools-data.json schema.
 *
 * Key Features:
 * - Summary metrics for KPI cards
 * - Top projects rankings
 * - Department breakdown
 * - Creator leaderboard
 * - Category distribution
 * - Monthly trend data
 *
 * Dependencies: None (pure aggregation)
 */

/**
 * Aggregate projects data for dashboard display
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.projects - Processed projects with scores and categories
 * @param {Array} options.byDepartment - Department aggregations
 * @param {Array} options.byCreator - Creator aggregations
 * @param {Array} options.byCategory - Category aggregations
 * @param {Array} options.monthlyTrend - Monthly trend data
 * @param {Object} options.metadata - Processing metadata
 * @param {boolean} options.verbose - Enable detailed logging
 * @returns {Promise<Object>} Dashboard-ready projects data
 */
async function aggregateProjectsData(options = {}) {
  const {
    projects = [],
    byDepartment = [],
    byCreator = [],
    byCategory = [],
    monthlyTrend = [],
    metadata = {},
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Aggregating Projects data for dashboard...\n');
  }

  // 1. Calculate summary metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.isActive).length;
  const uniqueCreators = byCreator.length;
  const withDocs = projects.filter(p => p.docCount > 0).length;
  const withPrompts = projects.filter(p => p.hasPromptTemplate).length;
  const avgSophistication = totalProjects > 0
    ? Math.round(projects.reduce((sum, p) => sum + p.sophisticationScore, 0) / totalProjects)
    : 0;

  const summary = {
    totalProjects,
    activeProjects,
    uniqueCreators,
    withDocs,
    withPrompts,
    avgSophistication
  };

  // 2. Top projects (top 25 by sophistication score)
  const topProjects = projects.slice(0, 25).map((project, index) => ({
    rank: index + 1,
    name: project.name,
    creator: project.creator?.fullName || 'Unknown',
    creatorEmail: project.creatorEmail,
    department: project.department,
    docCount: project.docCount,
    sophisticationScore: project.sophisticationScore,
    category: project.category,
    hasPromptTemplate: project.hasPromptTemplate,
    updatedAt: project.updatedAt,
    isActive: project.isActive
  }));

  // 3. Department breakdown (formatted for charts)
  const departmentBreakdown = byDepartment.map(dept => ({
    department: dept.department,
    projects: dept.count,
    activeProjects: dept.activeCount,
    creators: dept.uniqueCreators,
    avgSophistication: dept.avgSophistication,
    withDocs: dept.withDocs,
    withPrompts: dept.withPrompts,
    topCategory: dept.categories
      ? Object.entries(dept.categories)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'other'
      : 'other'
  }));

  // 4. Creator leaderboard (top 25)
  const creatorLeaderboard = byCreator.slice(0, 25).map((creator, index) => ({
    rank: index + 1,
    name: creator.name,
    email: creator.email,
    department: creator.department,
    projects: creator.count,
    avgSophistication: creator.avgSophistication,
    totalDocs: creator.totalDocs,
    categoryDiversity: creator.categoryDiversity
  }));

  // 5. Category distribution
  const categoryDistribution = byCategory.map(cat => ({
    category: cat.category,
    count: cat.count,
    percentage: cat.percentage,
    label: formatCategoryLabel(cat.category)
  }));

  // 6. Featured projects (notable projects worth highlighting)
  const featuredProjects = identifyFeaturedProjects(projects);

  // 7. Insights for AI analysis
  const insights = generateProjectInsights(projects, byDepartment, byCreator, byCategory);

  if (verbose) {
    console.log(`   Summary: ${summary.totalProjects} projects, ${summary.activeProjects} active`);
    console.log(`   Top creator: ${creatorLeaderboard[0]?.name || 'N/A'} (${creatorLeaderboard[0]?.projects || 0} projects)`);
    console.log(`   Top department: ${departmentBreakdown[0]?.department || 'N/A'} (${departmentBreakdown[0]?.projects || 0} projects)`);
  }

  return {
    summary,
    topProjects,
    byDepartment: departmentBreakdown,
    byCreator: creatorLeaderboard,
    byCategory: categoryDistribution,
    monthlyTrend,
    featuredProjects,
    insights
  };
}

/**
 * Format category key to display label
 * @param {string} category - Category key
 * @returns {string} Formatted label
 * @private
 */
function formatCategoryLabel(category) {
  const labels = {
    content: 'Content Creation',
    sales: 'Sales & Outreach',
    technical: 'Technical & Dev',
    hr: 'HR & People',
    analysis: 'Analysis & Research',
    other: 'Other'
  };
  return labels[category] || category;
}

/**
 * Identify notable projects worth featuring
 * @param {Array} projects - All processed projects
 * @returns {Array} Featured projects (max 5)
 * @private
 */
function identifyFeaturedProjects(projects) {
  const featured = [];

  // 1. Highest sophistication score
  const mostSophisticated = projects[0];
  if (mostSophisticated && mostSophisticated.sophisticationScore >= 50) {
    featured.push({
      project: mostSophisticated,
      reason: 'Most sophisticated project',
      badge: 'top-rated'
    });
  }

  // 2. Most documents
  const mostDocs = [...projects].sort((a, b) => b.docCount - a.docCount)[0];
  if (mostDocs && mostDocs.docCount > 0 && mostDocs.uuid !== mostSophisticated?.uuid) {
    featured.push({
      project: mostDocs,
      reason: `Most knowledge-rich (${mostDocs.docCount} docs)`,
      badge: 'knowledge-hub'
    });
  }

  // 3. Most active creator's top project
  const activeCreators = new Map();
  projects.forEach(p => {
    if (p.isActive && p.creatorEmail) {
      activeCreators.set(p.creatorEmail, (activeCreators.get(p.creatorEmail) || 0) + 1);
    }
  });

  if (activeCreators.size > 0) {
    const [topCreatorEmail] = [...activeCreators.entries()].sort((a, b) => b[1] - a[1])[0];
    const topCreatorProject = projects.find(p =>
      p.creatorEmail === topCreatorEmail &&
      p.isActive &&
      !featured.some(f => f.project.uuid === p.uuid)
    );

    if (topCreatorProject) {
      featured.push({
        project: topCreatorProject,
        reason: 'Most active creator',
        badge: 'power-user'
      });
    }
  }

  // 4. HR/Abby project (if exists - special mention)
  const hrProject = projects.find(p =>
    p.category === 'hr' &&
    p.sophisticationScore >= 40 &&
    !featured.some(f => f.project.uuid === p.uuid)
  );

  if (hrProject) {
    featured.push({
      project: hrProject,
      reason: 'HR Innovation',
      badge: 'hr-champion'
    });
  }

  // Format featured projects for dashboard
  return featured.slice(0, 5).map(f => ({
    name: f.project.name,
    creator: f.project.creator?.fullName || 'Unknown',
    department: f.project.department,
    sophisticationScore: f.project.sophisticationScore,
    docCount: f.project.docCount,
    category: f.project.category,
    reason: f.reason,
    badge: f.badge
  }));
}

/**
 * Generate insights context for AI analysis
 * @param {Array} projects - All projects
 * @param {Array} byDepartment - Department data
 * @param {Array} byCreator - Creator data
 * @param {Array} byCategory - Category data
 * @returns {Object} Insights context
 * @private
 */
function generateProjectInsights(projects, byDepartment, byCreator, byCategory) {
  // Departments with no projects
  const departmentsWithProjects = byDepartment.map(d => d.department);

  // Single-project creators (adoption opportunity)
  const singleProjectCreators = byCreator.filter(c => c.count === 1).length;

  // Category concentration
  const topCategory = byCategory[0];
  const categoryConcentration = topCategory
    ? Math.round((topCategory.count / projects.length) * 100)
    : 0;

  // Average docs per project
  const avgDocs = projects.length > 0
    ? (projects.reduce((sum, p) => sum + p.docCount, 0) / projects.length).toFixed(1)
    : 0;

  // Prompt template adoption
  const promptTemplateAdoption = projects.length > 0
    ? Math.round((projects.filter(p => p.hasPromptTemplate).length / projects.length) * 100)
    : 0;

  // Power creators (3+ projects)
  const powerCreators = byCreator.filter(c => c.count >= 3);

  // Inactive projects
  const inactiveCount = projects.filter(p => !p.isActive).length;
  const inactiveRate = projects.length > 0
    ? Math.round((inactiveCount / projects.length) * 100)
    : 0;

  return {
    totalCreators: byCreator.length,
    singleProjectCreators,
    powerCreators: powerCreators.length,
    topCategory: topCategory?.category || 'N/A',
    categoryConcentration,
    avgDocs: parseFloat(avgDocs),
    promptTemplateAdoption,
    departmentsWithProjects: departmentsWithProjects.length,
    inactiveRate,
    recommendations: generateRecommendations(projects, byDepartment, byCreator, byCategory)
  };
}

/**
 * Generate actionable recommendations
 * @param {Array} projects - All projects
 * @param {Array} byDepartment - Department data
 * @param {Array} byCreator - Creator data
 * @param {Array} byCategory - Category data
 * @returns {Array} Recommendations
 * @private
 */
function generateRecommendations(projects, byDepartment, byCreator, byCategory) {
  const recommendations = [];

  // Low prompt template adoption
  const promptAdoption = projects.filter(p => p.hasPromptTemplate).length / projects.length;
  if (promptAdoption < 0.3) {
    recommendations.push({
      type: 'adoption',
      priority: 'high',
      message: 'Encourage prompt template usage - only ' +
        Math.round(promptAdoption * 100) +
        '% of projects use custom instructions'
    });
  }

  // Many single-project creators
  const singleCreators = byCreator.filter(c => c.count === 1);
  if (singleCreators.length > byCreator.length * 0.6) {
    recommendations.push({
      type: 'engagement',
      priority: 'medium',
      message: 'Many users have only one project - consider enablement to encourage deeper adoption'
    });
  }

  // Category imbalance
  const topCat = byCategory[0];
  if (topCat && topCat.percentage > 50) {
    recommendations.push({
      type: 'diversity',
      priority: 'low',
      message: `${formatCategoryLabel(topCat.category)} dominates (${topCat.percentage}%) - explore other use cases`
    });
  }

  return recommendations;
}

module.exports = {
  aggregateProjectsData
};
