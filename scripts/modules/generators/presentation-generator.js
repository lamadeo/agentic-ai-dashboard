/**
 * Presentation Generator
 *
 * Generates 9-slide Annual Plan presentation structure for AnnualPlanPresentation.jsx.
 * Creates executive-ready narrative with BLUF methodology and strategic insights.
 *
 * Slide Structure:
 * 1. Title - "2026 Annual Plan: Data-Driven AI Strategy"
 * 2. Executive Summary - BLUF with key recommendations
 * 3. Strategic Context - Why these projects matter
 * 4. Portfolio Overview - Visual summary of all projects
 * 5. Q1 Committed Roadmap - Locked-in deliverables
 * 6. Q2-Q4 Potential Roadmap - Capacity-dependent schedule
 * 7. Resource Capacity Model - Engineering constraints
 * 8. Dependencies & Risks - Blockers and mitigation
 * 9. Recommendations - Action items for leadership
 *
 * Dependencies: None (pure formatting logic)
 */

/**
 * Generate Annual Plan presentation data structure
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.rankedProjects - Ranked projects from hybrid-scorer
 * @param {Object} options.scores - Detailed scores from hybrid-scorer
 * @param {Object} options.schedule - Schedule from constraint-scheduler
 * @param {Object} options.dependencyGraph - Dependency graph from dependency-analyzer
 * @param {Object} options.capacityModel - Capacity model from constraint-scheduler
 * @param {Array} options.deferredProjects - Deferred projects list
 * @param {Array} options.projects - Original parsed projects
 * @param {Array} options.portfolioProjects - Portfolio table from portfolio-generator
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Presentation data structure
 */
async function generatePresentation(options = {}) {
  const {
    rankedProjects = [],
    scores = {},
    schedule = {},
    dependencyGraph = {},
    capacityModel = {},
    deferredProjects = [],
    projects = [],
    portfolioProjects = [],
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Generating Annual Plan presentation...\n');
  }

  // Generate each slide
  const slides = {
    slide1: generateTitleSlide(),
    slide2: generateExecutiveSummary(rankedProjects, schedule, portfolioProjects),
    slide3: generateStrategicContext(projects, scores),
    slide4: generatePortfolioOverview(portfolioProjects, schedule),
    slide5: generateQ1Roadmap(schedule, rankedProjects, projects),
    slide6: generateQ2Q4Roadmap(schedule, rankedProjects, projects),
    slide7: generateResourceModel(capacityModel, schedule),
    slide8: generateDependenciesRisks(dependencyGraph, deferredProjects, rankedProjects, projects),
    slide9: generateRecommendations(schedule, deferredProjects, capacityModel, portfolioProjects)
  };

  if (verbose) {
    console.log('   ✅ Slide 1: Title');
    console.log('   ✅ Slide 2: Executive Summary');
    console.log('   ✅ Slide 3: Strategic Context');
    console.log('   ✅ Slide 4: Portfolio Overview');
    console.log('   ✅ Slide 5: Q1 Committed Roadmap');
    console.log('   ✅ Slide 6: Q2-Q4 Potential Roadmap');
    console.log('   ✅ Slide 7: Resource Capacity Model');
    console.log('   ✅ Slide 8: Dependencies & Risks');
    console.log('   ✅ Slide 9: Recommendations');
    console.log(`\n✅ Presentation generation complete: 9 slides`);
  }

  return {
    slides,
    metadata: {
      totalSlides: 9,
      generatedAt: new Date().toISOString(),
      version: '2026-Q1'
    }
  };
}

/**
 * Slide 1: Title
 */
function generateTitleSlide() {
  return {
    type: 'title',
    title: '2026 Annual Plan',
    subtitle: 'Data-Driven, Agile AI Strategy',
    presenter: 'Chris Murphy, CEO',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  };
}

/**
 * Slide 2: Executive Summary (BLUF)
 */
function generateExecutiveSummary(rankedProjects, schedule, portfolioProjects) {
  const totalValue = portfolioProjects
    .filter(p => p.value !== 'TBD')
    .reduce((sum, p) => {
      const value = parseFloat(p.value.replace(/[$M]/g, ''));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

  const avgScore = rankedProjects.reduce((sum, p) => sum + p.score, 0) / rankedProjects.length;

  return {
    type: 'executive_summary',
    title: 'Executive Summary',
    bluf: {
      headline: `${rankedProjects.length} AI projects prioritized for 2026 delivery`,
      impact: `$${totalValue.toFixed(1)}M total annual value`,
      approach: 'Hybrid scoring (Multi-Factor + ROI) with capacity constraints'
    },
    keyPoints: [
      `Q1: ${schedule.Q1.projects.length} committed projects (${schedule.Q1.allocated} eng-days, fully allocated)`,
      `Q2-Q4: ${schedule.Q2.projects.length + schedule.Q3.projects.length + schedule.Q4.projects.length} potential projects (capacity-dependent)`,
      `Average priority score: ${avgScore.toFixed(1)}/100 (strong strategic alignment)`,
      `${portfolioProjects.filter(p => p.tier.includes('TIER 0')).length} foundation projects enable future revenue streams`
    ],
    recommendations: [
      'Approve Q1 committed roadmap',
      'Monitor Q2 capacity for Data Engineer hire impact',
      'Re-evaluate deferred projects in Q4 2026 planning cycle'
    ]
  };
}

/**
 * Slide 3: Strategic Context
 */
function generateStrategicContext(projects, scores) {
  // Count strategic alignments
  const pillarCounts = {};
  const driverCounts = {};

  projects.forEach(project => {
    (project.strategic.pillars || []).forEach(pillar => {
      pillarCounts[pillar] = (pillarCounts[pillar] || 0) + 1;
    });
    (project.strategic.drivers || []).forEach(driver => {
      driverCounts[driver] = (driverCounts[driver] || 0) + 1;
    });
  });

  return {
    type: 'strategic_context',
    title: 'Strategic Context: Why These Projects',
    strategicFramework: {
      pillars: Object.entries(pillarCounts).map(([name, count]) => ({
        name,
        projectCount: count,
        description: getPillarDescription(name)
      })),
      drivers: Object.entries(driverCounts).map(([name, count]) => ({
        name,
        projectCount: count,
        description: getDriverDescription(name)
      }))
    },
    narrative: [
      'All projects align to TechCo Inc Strategic Framework',
      'Foundation (TIER 0) projects establish platform capabilities',
      'Revenue (TIER 1) projects drive direct sales impact',
      'Retention (TIER 2) projects reduce churn and increase NRR',
      'Hybrid scoring balances strategic value with financial ROI'
    ]
  };
}

/**
 * Slide 4: Portfolio Overview
 */
function generatePortfolioOverview(portfolioProjects, schedule) {
  const tierSummary = {
    tier0: portfolioProjects.filter(p => p.tier.includes('TIER 0')),
    tier1: portfolioProjects.filter(p => p.tier.includes('TIER 1')),
    tier2: portfolioProjects.filter(p => p.tier.includes('TIER 2'))
  };

  const statusSummary = {
    committed: portfolioProjects.filter(p => p.status === 'committed'),
    inProgress: portfolioProjects.filter(p => p.status === 'in-progress'),
    proposed: portfolioProjects.filter(p => p.status === 'proposed')
  };

  return {
    type: 'portfolio_overview',
    title: 'Portfolio Overview: All Projects',
    summary: {
      total: portfolioProjects.length,
      byTier: {
        foundation: tierSummary.tier0.length,
        revenue: tierSummary.tier1.length,
        retention: tierSummary.tier2.length
      },
      byStatus: {
        committed: statusSummary.committed.length,
        inProgress: statusSummary.inProgress.length,
        proposed: statusSummary.proposed.length
      }
    },
    topProjects: portfolioProjects.slice(0, 5).map(p => ({
      rank: p.rank,
      id: p.project.split(':')[0],
      name: p.project.split(':')[1]?.trim() || p.project,
      score: p.score,
      value: p.value,
      qStart: p.qStart
    })),
    callout: 'See Appendix for full portfolio table with 11 columns'
  };
}

/**
 * Slide 5: Q1 Committed Roadmap
 */
function generateQ1Roadmap(schedule, rankedProjects, projects) {
  const q1Projects = schedule.Q1.projects.map(id => {
    const ranked = rankedProjects.find(p => p.id === id);
    const project = projects.find(p => p.id === id);
    return {
      id,
      name: ranked?.name || project?.name || id,
      score: ranked?.score.toFixed(1) || 'N/A',
      phases: project?.phases || [],
      value: project?.value ? `$${(project.value / 1000000).toFixed(2)}M` : 'TBD'
    };
  });

  return {
    type: 'q1_roadmap',
    title: 'Q1 2026 Committed Roadmap',
    status: 'COMMITTED',
    capacity: {
      allocated: schedule.Q1.allocated,
      total: schedule.Q1.capacity,
      utilization: `${Math.round((schedule.Q1.allocated / schedule.Q1.capacity) * 100)}%`
    },
    projects: q1Projects,
    keyMilestones: [
      'Claude Enterprise Phase 1 expansion complete',
      'Leave Planning Tool V1 delivery (Forever Code)',
      'Case Management enhancements (Forever Code)',
      'Marketplace Phase 2 launch',
      'Law2Engine GA preparation'
    ],
    constraints: [
      '80% of engineering capacity committed to Hypergrowth (OP-012, OP-013)',
      'Only 20% available for AI strategy projects',
      'No buffer capacity - fully allocated quarter'
    ]
  };
}

/**
 * Slide 6: Q2-Q4 Potential Roadmap
 */
function generateQ2Q4Roadmap(schedule, rankedProjects, projects) {
  const quarters = ['Q2', 'Q3', 'Q4'];
  const roadmap = quarters.map(q => {
    const qData = schedule[q];
    const qProjects = qData.projects.map(id => {
      const ranked = rankedProjects.find(p => p.id === id);
      const project = projects.find(p => p.id === id);
      return {
        id,
        name: ranked?.name || project?.name || id,
        score: ranked?.score.toFixed(1) || 'N/A'
      };
    });

    return {
      quarter: q,
      status: 'POTENTIAL',
      capacity: {
        allocated: qData.allocated,
        total: qData.capacity,
        buffer: qData.buffer,
        utilization: `${Math.round((qData.allocated / qData.capacity) * 100)}%`
      },
      projectCount: qProjects.length,
      projects: qProjects
    };
  });

  return {
    type: 'q2q4_roadmap',
    title: 'Q2-Q4 2026 Potential Roadmap',
    status: 'CAPACITY-DEPENDENT',
    roadmap,
    assumptions: [
      'Q2: Data Engineer hire complete (+1 FTE)',
      'Q3: Hypergrowth major milestone complete (40% capacity available)',
      'Q4: Hypergrowth stabilized (60% capacity available)',
      'Champion community maturity increases available capacity'
    ],
    risks: [
      'Hypergrowth delays reduce available capacity',
      'Dependency blockers may shift schedule',
      'Champion recruitment slower than projected'
    ]
  };
}

/**
 * Slide 7: Resource Capacity Model
 */
function generateResourceModel(capacityModel, schedule) {
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const capacityChart = quarters.map(q => ({
    quarter: q,
    core: capacityModel[q].core,
    champion: capacityModel[q].champion,
    total: capacityModel[q].total,
    allocated: schedule[q].allocated,
    buffer: schedule[q].buffer,
    notes: capacityModel[q].notes
  }));

  return {
    type: 'resource_model',
    title: 'Resource Capacity Model',
    capacityChart,
    assumptions: {
      teamSize: '6 engineers (Q1) → 7 engineers (Q2+)',
      corePctAvailable: {
        Q1: '20% (Hypergrowth consumes 80%)',
        Q2: '20% (Hypergrowth still dominant)',
        Q3: '40% (Major milestone complete)',
        Q4: '60% (Hypergrowth stabilized)'
      },
      championModel: {
        Q1: 'Not yet available',
        Q2: 'Starting to mature (60 days)',
        Q3: 'Established community (120 days)',
        Q4: 'Mature community (180 days)'
      }
    },
    insights: [
      'Q1 fully allocated - no buffer capacity',
      'Q2-Q4 maintain 10-25% buffer for unknowns',
      'Champion model significantly expands capacity by Q4',
      'Data Engineer hire (Q2) adds ~14 days/quarter core capacity'
    ]
  };
}

/**
 * Slide 8: Dependencies & Risks
 */
function generateDependenciesRisks(dependencyGraph, deferredProjects, rankedProjects, projects) {
  // Count hard dependencies
  const hardDepCount = Object.values(dependencyGraph).reduce((sum, node) => {
    return sum + (node.dependsOn || []).filter(d => d.type === 'HARD').length;
  }, 0);

  // Identify blocking projects
  const blockingProjects = Object.values(dependencyGraph)
    .filter(node => node.enablers && node.enablers.length > 0)
    .map(node => ({
      id: node.id,
      name: node.name,
      enablesCount: node.enablers.length,
      enables: node.enablers
    }))
    .sort((a, b) => b.enablesCount - a.enablesCount)
    .slice(0, 3);

  return {
    type: 'dependencies_risks',
    title: 'Key Dependencies & Risks',
    dependencies: {
      hardCount: hardDepCount,
      blockingProjects,
      callout: hardDepCount === 0
        ? 'No hard dependencies detected - projects can proceed independently'
        : `${hardDepCount} hard dependencies require careful sequencing`
    },
    risks: [
      {
        risk: 'Hypergrowth delays',
        impact: 'Reduces Q2-Q4 available capacity',
        mitigation: 'Monthly capacity re-evaluation, flexible scheduling'
      },
      {
        risk: 'Data Engineer hire delays',
        impact: 'Q2 capacity reduced from 144 to 130 days',
        mitigation: 'Accelerate recruiting, consider contractor backfill'
      },
      {
        risk: 'Champion recruitment slower than projected',
        impact: 'Q3-Q4 capacity 20-30% lower than plan',
        mitigation: 'Core team fallback, adjust project scope'
      },
      {
        risk: 'Scope creep on committed projects',
        impact: 'Zero buffer in Q1 means no capacity for unplanned work',
        mitigation: 'Strict scope control, executive escalation for changes'
      }
    ],
    deferredProjects: {
      count: deferredProjects.length,
      reason: deferredProjects.length > 0
        ? 'Insufficient capacity in 2026 or blocked by unmet dependencies'
        : 'All projects fit within 2026 capacity constraints',
      examples: deferredProjects.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        reason: p.reason
      }))
    }
  };
}

/**
 * Slide 9: Recommendations
 */
function generateRecommendations(schedule, deferredProjects, capacityModel, portfolioProjects) {
  const q1FullyAllocated = schedule.Q1.buffer === 0;
  const hasDeferred = deferredProjects.length > 0;
  const totalValue = portfolioProjects
    .filter(p => p.value !== 'TBD')
    .reduce((sum, p) => {
      const value = parseFloat(p.value.replace(/[$M]/g, ''));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

  return {
    type: 'recommendations',
    title: 'Recommendations & Next Steps',
    immediate: [
      {
        action: 'Approve Q1 committed roadmap',
        owner: 'CEO',
        timeline: 'This meeting',
        rationale: `${schedule.Q1.projects.length} projects, fully allocated capacity, no flexibility`
      },
      {
        action: 'Lock Q1 scope - no additions',
        owner: 'Engineering Leadership',
        timeline: 'Immediate',
        rationale: 'Zero buffer capacity means any additions cause delays'
      },
      {
        action: 'Accelerate Data Engineer hiring',
        owner: 'Talent/Engineering',
        timeline: 'Complete by end of Q1',
        rationale: 'Q2 capacity depends on +1 FTE by April 1'
      }
    ],
    nearTerm: [
      {
        action: 'Establish monthly capacity reviews',
        owner: 'COO/CTO',
        timeline: 'Starting February',
        rationale: 'Q2-Q4 roadmap capacity-dependent, needs continuous monitoring'
      },
      {
        action: 'Launch champion recruitment program',
        owner: 'Product/Engineering',
        timeline: 'Q1 2026',
        rationale: 'Q3-Q4 capacity assumes mature champion community'
      },
      {
        action: 'Validate project ROI assumptions',
        owner: 'Finance/Product',
        timeline: 'End of Q1',
        rationale: 'Update hybrid scoring weights as actual data becomes available'
      }
    ],
    longTerm: [
      {
        action: `Re-evaluate ${deferredProjects.length} deferred projects`,
        owner: 'Product/Strategy',
        timeline: 'Q4 2026',
        rationale: hasDeferred
          ? '2027 planning cycle should revisit deferred work'
          : 'Confirm all projects remain strategically relevant'
      },
      {
        action: 'Assess champion model effectiveness',
        owner: 'Product/Engineering',
        timeline: 'End of Q2, Q3',
        rationale: 'Validate capacity assumptions, adjust model if needed'
      }
    ],
    financialImpact: {
      total: `$${totalValue.toFixed(1)}M total annual value`,
      avgROI: calculateAvgROI(portfolioProjects),
      note: 'Financial estimates subject to validation as projects progress'
    }
  };
}

/**
 * Helper: Get pillar description
 */
function getPillarDescription(pillar) {
  const descriptions = {
    'Impactful': 'Delivers measurable business outcomes',
    'Intuitive': 'Simple, delightful user experiences',
    'Intelligent': 'AI-powered automation and insights',
    'Trustworthy': 'Reliable, secure, compliant systems'
  };
  return descriptions[pillar] || pillar;
}

/**
 * Helper: Get driver description
 */
function getDriverDescription(driver) {
  const descriptions = {
    'Win': 'Drives new customer acquisition',
    'Retain': 'Reduces churn, increases NRR',
    'Innovate': 'Future platform capabilities'
  };
  return descriptions[driver] || driver;
}

/**
 * Helper: Calculate average ROI
 */
function calculateAvgROI(portfolioProjects) {
  const roiValues = portfolioProjects
    .filter(p => p.roi !== 'TBD')
    .map(p => parseInt(p.roi.replace('%', '')))
    .filter(v => !isNaN(v));

  if (roiValues.length === 0) return 'TBD';

  const avg = Math.round(roiValues.reduce((sum, v) => sum + v, 0) / roiValues.length);
  return `${avg}%`;
}

module.exports = {
  generatePresentation
};
