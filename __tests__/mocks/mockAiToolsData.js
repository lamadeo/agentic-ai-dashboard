/**
 * Mock AI Tools Data for Testing
 * Simulates the structure of ai-tools-data.json
 */

export const mockAiToolsData = {
  claudeEnterprise: {
    licensedUsers: 106,
    activeUsers: 103,
    adoptionRate: 97,
    conversationsPerUser: 28,
    totalConversations: 5473,
    totalMessages: 58136,
    totalArtifacts: 484,
    totalProjects: 182,
    powerUsers: [
      {
        name: 'Alice Johnson',
        email: 'alice@techco.com',
        department: 'Engineering',
        conversations: 150,
        messages: 1200,
        artifacts: 45,
        filesUploaded: 200,
        powerUserScore: 2500,
        daysSinceLastActivity: 1,
        daysActive: 28
      }
    ],
    lowEngagementUsers: [
      {
        name: 'Bob Smith',
        email: 'bob@techco.com',
        department: 'Sales',
        conversations: 5,
        messages: 12,
        daysSinceLastActivity: 15,
        engagementScore: 25
      }
    ],
    departmentBreakdown: [
      {
        department: 'Engineering',
        users: 48,
        conversations: 1440,
        messages: 14400,
        artifacts: 200,
        avgConversationsPerUser: 30,
        avgMessagesPerUser: 300
      },
      {
        department: 'Product',
        users: 28,
        conversations: 784,
        messages: 7840,
        artifacts: 150,
        avgConversationsPerUser: 28,
        avgMessagesPerUser: 280
      }
    ],
    monthlyTrend: [
      {
        month: '2025-12',
        monthLabel: 'December 2025',
        users: 94,
        conversations: 2640,
        totalDaysInMonth: 31,
        messagesPerUser: 94,
        artifacts: 200,
        byDept: [
          { department: 'Engineering', users: 45, conversations: 1350 },
          { department: 'Product', users: 25, conversations: 700 },
        ]
      },
      {
        month: '2026-01',
        monthLabel: 'January 2026',
        users: 103,
        conversations: 2884,
        totalDaysInMonth: 7,
        messagesPerUser: 120,
        artifacts: 245,
        byDept: [
          { department: 'Engineering', users: 48, conversations: 1440 },
          { department: 'Product', users: 28, conversations: 784 },
        ]
      }
    ],
    artifacts: {
      total: 245,
      byType: [
        { type: 'Code', count: 120 },
        { type: 'Document', count: 85 },
        { type: 'Analysis', count: 40 }
      ]
    },
    projects: {
      total: 68,
      byDept: [
        { department: 'Engineering', count: 35 },
        { department: 'Product', count: 20 },
      ]
    }
  },

  claudeCode: {
    licensedUsers: 37,
    activeUsers: 22,
    adoptionRate: 59,
    totalLines: 763352,
    linesPerUser: 34698,
    monthlyTrend: [
      {
        month: '2025-12',
        monthLabel: 'December 2025',
        users: 18,
        linesGenerated: 625000,
        totalDaysInMonth: 31,
        byDept: [
          { department: 'Engineering', users: 15, linesGenerated: 500000 },
          { department: 'Product', users: 3, linesGenerated: 125000 }
        ]
      },
      {
        month: '2026-01',
        monthLabel: 'January 2026',
        users: 22,
        linesGenerated: 138352,
        totalDaysInMonth: 7,
        byDept: [
          { department: 'Engineering', users: 18, linesGenerated: 110000 },
          { department: 'Product', users: 4, linesGenerated: 28352 }
        ]
      }
    ],
    powerUsers: [
      {
        name: 'John Doe',
        email: 'jdoe@techco.com',
        linesGenerated: 45000,
        department: 'Engineering',
        sessions: 120,
        linesPerSession: 375
      },
      {
        name: 'Jane Smith',
        email: 'jsmith@techco.com',
        linesGenerated: 38000,
        department: 'Engineering',
        sessions: 100,
        linesPerSession: 380
      }
    ],
    departmentBreakdown: [
      {
        department: 'Engineering',
        users: 18,
        linesGenerated: 625000,
        totalLines: 625000,
        linesPerUser: 34722,
        topUser: { username: 'john_doe', lines: 45000 }
      },
      {
        department: 'Product',
        users: 4,
        linesGenerated: 138352,
        totalLines: 138352,
        linesPerUser: 34588,
        topUser: { username: 'jane_smith', lines: 38000 }
      }
    ],
    lowEngagementUsers: [
      {
        name: 'Bob Smith',
        email: 'bob@techco.com',
        department: 'Engineering',
        linesGenerated: 500,
        sessions: 5,
        lastActiveDate: '2026-01-01'
      }
    ]
  },

  m365Copilot: {
    licensedUsers: 251,
    activeUsers: 238,
    adoptionRate: 95,
    approximateArtifacts: 1500,
    monthlyTrend: [
      {
        month: '2025-12',
        monthLabel: 'December 2025',
        users: 235,
        prompts: 12500,
        totalDaysInMonth: 31,
        promptsPerUser: 53,
        isPartial: false,
        appUsage: [
          { app: 'Teams', users: 200, prompts: 8000 },
          { app: 'Outlook', users: 170, prompts: 4000 }
        ],
        appUsageByDept: [
          {
            department: 'Engineering',
            apps: [
              { app: 'Teams', users: 45, prompts: 2000 },
              { app: 'Outlook', users: 40, prompts: 1000 }
            ]
          }
        ],
        byDept: [
          { department: 'Engineering', users: 50, prompts: 4000 },
          { department: 'Product', users: 30, prompts: 2500 }
        ]
      },
      {
        month: '2026-01',
        monthLabel: 'January 2026',
        users: 238,
        prompts: 2800,
        totalDaysInMonth: 7,
        promptsPerUser: 12,
        isPartial: true,
        appUsage: [
          { app: 'Teams', users: 215, prompts: 1800 },
          { app: 'Outlook', users: 180, prompts: 1000 }
        ],
        appUsageByDept: [
          {
            department: 'Engineering',
            apps: [
              { app: 'Teams', users: 48, prompts: 500 },
              { app: 'Outlook', users: 45, prompts: 300 }
            ]
          }
        ],
        byDept: [
          { department: 'Engineering', users: 55, prompts: 900 },
          { department: 'Product', users: 32, prompts: 600 }
        ]
      }
    ],
    appUsage: [
      { app: 'Teams', users: 215, prompts: 8500 },
      { app: 'Outlook', users: 180, prompts: 5200 },
      { app: 'Word', users: 125, prompts: 3800 }
    ]
  },

  githubCopilot: {
    licensedUsers: 46,
    activeUsers: 46,
    adoptionRate: 100,
    totalSuggestions: 125000,
    acceptanceRate: 42,
    linesPerUser: 2500,
    modelPreferences: [
      { name: 'GPT-4', percentage: 60, lines: 75000 },
      { name: 'GPT-3.5', percentage: 40, lines: 50000 }
    ],
    monthlyTrend: [
      {
        month: '2025-12',
        monthLabel: 'December 2025',
        users: 46,
        totalDaysInMonth: 31
      },
      {
        month: '2026-01',
        monthLabel: 'January 2026',
        users: 46,
        totalDaysInMonth: 7
      }
    ]
  },

  orgMetrics: {
    premiumSeats: 37,
    standardSeats: 69,
    totalEmployees: 251,
    licensedSeats: 106,
    penetrationRate: 42,
    unlicensedEmployees: 145
  },

  overview: {
    blendedAdoption: 89,
    totalPrompts: 15384,
    totalConversations: 2884
  },

  expansion: {
    summary: {
      totalOpportunityCost: 50000,
      totalAdditionalCost: 3000,
      projectedAnnualValue: 500000,
      projectedROI: 10,
      overallROI: 16.7
    },
    opportunities: [
      {
        department: 'Engineering',
        currentSeats: 45,
        recommendedSeats: 60,
        potentialROI: 125000,
        premiumGap: 15,
        upgradesNeeded: 10,
        totalAdditionalCost: 3000,
        monthlyOpportunityCost: 2500,
        netBenefit: 10000,
        roi: 3.3
      }
    ],
    phase2: {
      engineering: {
        totalSeats: 77,
        assignedSeats: 19,
        percentComplete: 25
      }
    }
  },

  incrementalROI: {
    githubToClaudeCode: {
      incrementalHours: 2500,
      incrementalValue: 450000,
      additive: {
        incrementalCost: 25000,
        incrementalROI: 18,
        roiComparison: {
          deltaPercent: 42
        }
      },
      replacement: {
        incrementalCost: 15000,
        incrementalROI: 30,
        roiComparison: {
          deltaPercent: 58
        },
        industryBenchmark: {
          incrementalROI: 12
        }
      },
      hourlyRate: 180,
      productivityRatio: 2.8
    },
    m365ToClaudeEnterprise: {
      incrementalHours: 1800,
      incrementalValue: 324000,
      additive: {
        incrementalCost: 40000,
        incrementalROI: 8.1,
        roiComparison: {
          deltaPercent: 35
        }
      },
      replacement: {
        incrementalCost: 20000,
        incrementalROI: 16.2,
        roiComparison: {
          deltaPercent: 48
        },
        industryBenchmark: {
          incrementalROI: 10
        }
      },
      hourlyRate: 180,
      productivityRatio: 3.2
    }
  },

  insights: {
    overviewKpiMetrics: 'Claude Enterprise shows strong adoption at 97% with 103 active users.',
    claudeEnterpriseAdoption: 'Engineering leads adoption with 48 active users.',
    claudeCodeImpact: 'Power users are generating 40K+ lines of code per month.',
    departmentInsights: 'Engineering department shows highest engagement across all tools.',
    expansionOpportunities: 'Engineering department has capacity for 15 additional Premium seats.',
    strategicPositioning: 'Claude tools show strong value proposition vs alternatives.',
    executiveSummary: '# Executive Summary\n\n## Key Findings\n\n**Claude Enterprise deployment:**\n- Strong adoption at 97% with 103 active users\n- Leading departments: Engineering (48 users), Product (28 users)\n- Total investment: $8,560 monthly delivering 35.6x ROI\n\n**Productivity wins:**\n- Claude Code: 763,352 lines generated\n- Total time savings: 5,662 hours monthly\n- Artifacts created: 484 total\n\n**Recommendation:**\n- Expand deployment by $14,000 monthly\n- Expected outcomes: 35.6x ROI maintained, 1-month payback period'
  }
}

export const mockEnablementPlan = {
  programTitle: 'AI Enablement Program - $375K Annual Investment',
  budgetBreakdown: [
    {
      role: 'Enablement Lead',
      cost: 150000,
      description: 'Training, adoption, metrics',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-700'
    },
    {
      role: 'Integration Engineer',
      cost: 175000,
      description: 'Connectors, marketplace, projects',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-700'
    },
    {
      role: 'Training Budget',
      cost: 50000,
      description: 'External vendor contingency',
      borderColor: 'border-green-300',
      textColor: 'text-green-700'
    }
  ],
  keyDeliverables: [
    'Train 170+ new users (Phases 2-4)',
    'Build critical connectors: Salesforce, Gong, Rippling',
    'Evolve marketplace infrastructure',
    'Custom skills library (15-20 skills)'
  ],
  expectedImpact: {
    dailyActiveRate: {
      current: '53%',
      target: '75%',
      label: 'Daily Active Rate'
    },
    annualValue: {
      range: '$400-500K',
      label: 'Annual Value'
    },
    programROI: {
      yearOne: '1.1-1.3x',
      ongoing: '2.0x+ ongoing',
      label: 'Program ROI'
    }
  },
  foundationNote: 'Built on existing marketplace with 10 connectors. FTEs use Claude Premium to build everything.'
}

export const mockProjectDetailsData = [
  {
    id: 'proj-001',
    name: 'AI Assistant Integration',
    description: 'Integrate AI capabilities into core product',
    status: 'in-progress',
    priority: 'high',
    estimatedValue: 500000,
    estimatedROI: 5.2
  },
  {
    id: 'proj-002',
    name: 'Data Pipeline Optimization',
    description: 'Optimize data processing with AI',
    status: 'planning',
    priority: 'medium',
    estimatedValue: 250000,
    estimatedROI: 3.8
  }
]
