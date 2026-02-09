"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Users, MessageSquare, TrendingUp, Code, Zap, DollarSign, Clock, Award, Target, ArrowUp, FileText, Download, Lightbulb, Heart, ThumbsUp, ThumbsDown, AlertCircle, Tag, Quote, Home, ChevronDown, ChevronUp, ChevronRight, Activity, Presentation, Menu, X, BarChart2, GraduationCap, Github } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import aiToolsData from './ai-tools-data.json';
import editorialContent from './claude-editorial-content.json';
import enablementPlan from './claude-enablement-plan.json';
import projectDetailsData from './ai-projects-details.json';
import portfolioDataGenerated from './ai-projects-portfolio.json';
import presentationDataGenerated from './ai-projects-presentation.json';
import AnnualPlanPresentation from './components/AnnualPlanPresentation';
import PortfolioTable from './components/PortfolioTable';
import ProjectDetail from './components/ProjectDetail';

// Layout Components
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHeader from './components/layout/DashboardHeader';
import SidebarNavigation from './components/layout/SidebarNavigation';

// Shared Components
import MetricCard from './components/shared/MetricCard';
import { parseMarkdown } from './components/shared/MarkdownRenderer';
import ClaudeCodePowerUsersTable from './components/shared/ClaudeCodePowerUsersTable';
import ClaudeCodeKeyInsights from './components/shared/ClaudeCodeKeyInsights';
import ClaudeCodeLowEngagementUsers from './components/shared/ClaudeCodeLowEngagementUsers';
import CreditsModal from './components/shared/CreditsModal';

// Hooks
import useKonamiCode from './hooks/useKonamiCode';

// Tab Components - All 13 tabs fully modularized
import Enablement from './components/tabs/Enablement';
import AnnualPlan from './components/tabs/AnnualPlan';
import DynamicAnnualPlan from './components/tabs/DynamicAnnualPlan';
import BriefingLeadership from './components/tabs/BriefingLeadership';
import BriefingOrg from './components/tabs/BriefingOrg';
import Portfolio from './components/tabs/Portfolio';
import PerceivedValue from './components/tabs/PerceivedValue';
import M365Copilot from './components/tabs/M365Copilot';
import M365Agents from './components/tabs/M365Agents';
import OverviewHome from './components/tabs/OverviewHome';
import ClaudeEnterprise from './components/tabs/ClaudeEnterprise';
import ClaudeCode from './components/tabs/ClaudeCode';
import ClaudeProjects from './components/tabs/ClaudeProjects';
import ClaudeIntegrations from './components/tabs/ClaudeIntegrations';
import CodingToolsComparison from './components/tabs/CodingToolsComparison';
import ProductivityToolsComparison from './components/tabs/ProductivityToolsComparison';
import ExpansionROI from './components/tabs/ExpansionROI';
import AgenticOrgChart from './components/tabs/AgenticOrgChart';

// Use perceived value data from integrated pipeline (in ai-tools-data.json)
// Falls back to static data if not available
const perceivedValueData = aiToolsData.perceivedValue
  ? {
      perceivedValue: aiToolsData.perceivedValue,
      summary: aiToolsData.metadata?.sentimentAnalysis || {
        totalFeedbackAnalyzed: 0,
        sourceBreakdown: { slack: 0, confluence: 0, surveys: 0, interviews: 0 }
      },
      lastUpdated: aiToolsData.metadata?.sentimentAnalysis?.lastUpdated || new Date().toISOString()
    }
  : require('../data/perceived-value.json'); // Fallback to static file if not in main data

// ============================================================
// NOTE: Shared component definitions (MetricCard, parseMarkdown, ClaudeCode components)
// have been extracted to /app/components/shared/
// See imports at top of file for usage
// ============================================================

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview-home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Konami code easter egg
  const [showCredits, setShowCredits] = useState(false);

  const handleKonamiCode = useCallback(() => {
    setShowCredits(true);
  }, []);

  useKonamiCode(handleKonamiCode);

  // Extract data for Overview tab from ai-tools-data.json
  const { overview, expansion, claudeEnterprise, m365Copilot, orgMetrics, currentStateROI } = aiToolsData;

  // Load expansion ROI data from generated data (data-driven behavioral scoring)
  const expansionOpportunities = aiToolsData.expansion.opportunities;

  // Summary metrics from overview data for Key Metrics Grid
  const summaryMetrics = {
    claudeUsers: claudeEnterprise.activeUsers,
    claudeConversations: claudeEnterprise.totalConversations,
    claudeProjects: claudeEnterprise.totalProjects,
    claudeArtifacts: claudeEnterprise.totalArtifacts,
    claudeFilesUploaded: claudeEnterprise.totalFilesUploaded,
    claudeCodeUsers: aiToolsData.claudeCode.activeUsers,
    claudeCodeLines: aiToolsData.claudeCode.totalLines,
    adoptionRate: overview.overallAdoptionRate,
    avgConversationsPerUser: claudeEnterprise.conversationsPerUser,
  };

  // Transform monthly trends for overview chart (combine Claude + M365 data)
  const monthlyAdoption = claudeEnterprise.monthlyTrend.map((claudeMonth, idx) => {
    const m365Month = m365Copilot.monthlyTrend[idx];
    const codeMonth = aiToolsData.claudeCode.monthlyTrend.find(m => m.monthLabel === claudeMonth.monthLabel);
    return {
      month: claudeMonth.monthLabel,
      claudeUsers: claudeMonth.users,
      conversations: claudeMonth.conversations,
      linesOfCode: codeMonth ? codeMonth.totalLines : 0,
      m365Users: m365Month?.users || 0,
      m365Prompts: m365Month?.totalPrompts || 0
    };
  });

  // Monthly Output Trends - Artifacts and Lines of Code (Projects not tracked per month)
  const monthlyOutputTrends = aiToolsData.claudeEnterprise.monthlyTrend.map(month => {
    const codeMonth = aiToolsData.claudeCode.monthlyTrend.find(m => m.monthLabel === month.monthLabel);
    return {
      month: month.monthLabel,
      artifacts: month.artifacts || 0,
      linesOfCode: codeMonth ? codeMonth.totalLines : 0
    };
  });

  // Monthly Adoption Trends - Active Users only (no historical license data)
  const monthlyAdoptionTrends = aiToolsData.claudeEnterprise.monthlyTrend.map(month => ({
    month: month.monthLabel,
    activeUsers: month.users
  }));

  // MTD Business Value Scorecard - Using current month metrics only
  // Extract latest month and previous month from monthly trend data
  const monthlyTrend = claudeEnterprise.monthlyTrend || [];
  const latestMonth = monthlyTrend[monthlyTrend.length - 1] || {};
  const previousMonth = monthlyTrend[monthlyTrend.length - 2] || {};
  const latestMonthLabel = latestMonth.monthLabel || 'Current';
  const latestMonthYear = latestMonth.month ? latestMonth.month.split('-')[0] : new Date().getFullYear();

  // Format last refreshed date for display (e.g., "January 24, 2026")
  const lastRefreshedDate = aiToolsData.metadata?.lastRefreshed
    ? new Date(aiToolsData.metadata.lastRefreshed)
    : new Date();
  const lastRefreshedFormatted = lastRefreshedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // MTD Active Users from latest month
  const mtdActiveUsers = latestMonth.users || claudeEnterprise.activeUsers;
  const claudeLicensedUsers = claudeEnterprise.licensedUsers; // 87
  const mtdAdoptionRate = Math.round((mtdActiveUsers / claudeLicensedUsers) * 100); // 86%

  // MTD User Growth: month-over-month change (Dec 75 vs Nov 77 = -3%)
  const mtdUserGrowth = previousMonth.users
    ? Math.round(((mtdActiveUsers - previousMonth.users) / previousMonth.users) * 100)
    : 0;

  // MTD Engagement: % of active users who are "engaged" (≥3 prompts/day for ≥33% of days)
  const mtdEngagementRate = latestMonth.engagementRate || 0;
  const mtdEngagedUsers = latestMonth.engagedUsers || 0;

  // MTD Productivity Output - Lines of code + Artifacts
  const claudeCodeMonthlyTrend = aiToolsData.claudeCode?.monthlyTrend || [];
  const latestCodeMonth = claudeCodeMonthlyTrend[claudeCodeMonthlyTrend.length - 1] || {};
  const mtdLinesOfCode = latestCodeMonth.totalLines || 0;
  const mtdArtifacts = latestMonth.artifacts || 0;

  const businessValue = [
    { category: 'Adoption Rate', value: mtdAdoptionRate, color: '#3b82f6', description: `${mtdActiveUsers} active out of ${claudeLicensedUsers} licensed` },
    { category: 'User Growth', value: mtdUserGrowth, color: mtdUserGrowth >= 0 ? '#10b981' : '#ef4444', description: `${latestMonth.monthLabel} vs ${previousMonth.monthLabel}` },
    { category: 'Engagement', value: mtdEngagementRate, color: '#8b5cf6', description: `${mtdEngagedUsers} engaged users (≥3 prompts/day, ≥33% of days)` }
  ];

  // Department adoption - CORRECTED with actual usage data
  const departmentUsage = [
    { name: 'Engineering + Agentic AI', users: 18, conversations: 892, codeLines: 304175, value: 23 },
    { name: 'Product', users: 13, conversations: 520, codeLines: 0, value: 17 },
    { name: 'Marketing', users: 12, conversations: 360, codeLines: 0, value: 15 },
    { name: 'Sales (All)', users: 10, conversations: 315, codeLines: 0, value: 13 },
    { name: 'Operations/IT', users: 5, conversations: 180, codeLines: 0, value: 6 },
    { name: 'G&A/Finance/Exec', users: 5, conversations: 150, codeLines: 0, value: 6 },
    { name: 'Professional Services', users: 4, conversations: 120, codeLines: 0, value: 5 },
    { name: 'Customer Support', users: 4, conversations: 110, codeLines: 0, value: 5 },
    { name: 'Revenue Ops', users: 3, conversations: 250, codeLines: 0, value: 4 },
    { name: 'Customer Success', users: 2, conversations: 90, codeLines: 0, value: 3 },
    { name: 'Business Development', users: 2, conversations: 110, codeLines: 0, value: 3 }
  ];

  // Incremental ROI metrics - comparing Claude tools against baseline alternatives
  // Shows value of SWITCHING from GitHub Copilot/M365 Copilot to Claude tools
  const { incrementalROI } = aiToolsData;
  const ghToClaudeCode = incrementalROI.githubToClaudeCode;
  const m365ToClaudeEnt = incrementalROI.m365ToClaudeEnterprise;

  // User counts for each scenario
  const claudeCodeUsers = orgMetrics.premiumSeats; // Engineers with Claude Code Premium
  const claudeEnterpriseStandardUsers = orgMetrics.standardSeats; // Non-engineering roles

  // Incremental metrics for Overview tab (using ADDITIVE scenario - realistic cost)
  const incrementalMetrics = {
    // For Engineers (GitHub Copilot → Claude Code Premium)
    engineersGain: {
      incrementalHours: ghToClaudeCode.incrementalHours,
      incrementalValue: ghToClaudeCode.incrementalValue,
      incrementalCost: ghToClaudeCode.additive.incrementalCost,
      roi: ghToClaudeCode.additive.incrementalROI,
      usersAffected: claudeCodeUsers,
      baseline: 'GitHub Copilot ($19/mo)',
      current: 'Claude Code Premium ($200/mo)',
      hourlyRate: ghToClaudeCode.hourlyRate
    },

    // For Other Roles (M365 Copilot → Claude Enterprise Standard)
    otherRolesGain: {
      incrementalHours: m365ToClaudeEnt.incrementalHours,
      incrementalValue: m365ToClaudeEnt.incrementalValue,
      incrementalCost: m365ToClaudeEnt.additive.incrementalCost,
      roi: m365ToClaudeEnt.additive.incrementalROI,
      usersAffected: claudeEnterpriseStandardUsers,
      baseline: 'M365 Copilot ($30/mo)',
      current: 'Claude Enterprise Std ($40/mo)',
      industryROI: m365ToClaudeEnt.additive.industryBenchmark?.incrementalROI,
      roiDelta: m365ToClaudeEnt.additive.roiComparison?.deltaPercent,
      hourlyRate: m365ToClaudeEnt.hourlyRate
    },

    // Portfolio summary (blended across both scenarios - ADDITIVE)
    portfolio: {
      totalIncrementalValue: ghToClaudeCode.incrementalValue + m365ToClaudeEnt.incrementalValue,
      totalIncrementalCost: ghToClaudeCode.additive.incrementalCost + m365ToClaudeEnt.additive.incrementalCost,
      totalIncrementalHours: ghToClaudeCode.incrementalHours + m365ToClaudeEnt.incrementalHours,
      blendedROI: ((ghToClaudeCode.incrementalValue + m365ToClaudeEnt.incrementalValue) /
                   (ghToClaudeCode.additive.incrementalCost + m365ToClaudeEnt.additive.incrementalCost)).toFixed(1),
      totalUsers: claudeCodeUsers + claudeEnterpriseStandardUsers
    }
  };

  // AI Projects Portfolio data (from generated annual plan pipeline)
  // Transform generated data to add UI-required fields
  const portfolioData = {
    methodology: {
      formula: "Q1-Q2: (0.7 × Multi_Factor) + (0.3 × ROI)",
      components: ["Financial Impact (30%)", "Strategic Alignment (25%)", "Execution Feasibility (25%)", "Time to Value (20%)", "ROI Score (30% weight)"]
    },
    projects: portfolioDataGenerated.projects.map(proj => {
      // Extract project ID from project string (format: "OP-XXX: Name")
      const projectId = proj.project.split(':')[0].trim();

      // Derive tierCategory from tier string
      let tierCategory = 'foundation';
      if (proj.tier.includes('TIER 1')) tierCategory = 'revenue';
      else if (proj.tier.includes('TIER 2')) tierCategory = 'retention';

      // Derive statusCategory from status
      let statusCategory = proj.status.toLowerCase().replace(/\s+/g, '_');
      if (statusCategory === 'in-progress') statusCategory = 'in_progress';
      if (proj.status === 'committed') statusCategory = 'active';

      return {
        ...proj,
        projectId,
        tierCategory,
        statusCategory,
        targetKPIs: proj.targetKPIs || 'TBD'
      };
    })
  };


  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'];

  // Phase 1B: Navigation Structure - 6 strategic tabs with dropdowns
  const navigationStructure = [
    {
      id: 'overview',
      label: 'Overview',
      hasDropdown: false,
      tab: 'overview-home'
    },
    {
      id: 'tools',
      label: 'Tool Deep Dive',
      hasDropdown: true,
      items: [
        {
          id: 'claude-enterprise',
          label: 'Claude Enterprise',
          hasSubmenu: true,
          submenu: [
            { id: 'claude-enterprise-overview', label: 'Overview', tab: 'claude-enterprise' },
            { id: 'claude-projects', label: 'Projects', tab: 'claude-projects' },
            { id: 'claude-integrations', label: 'Integrations', tab: 'claude-integrations' },
            { id: 'claude-code', label: 'Code', tab: 'claude-code' }
          ]
        },
{
          id: 'm365-copilot',
          label: 'M365 Copilot',
          hasSubmenu: true,
          submenu: [
            { id: 'm365-overview', label: 'Overview', tab: 'm365' },
            { id: 'm365-agents', label: 'Agents', tab: 'm365-agents' }
          ]
        }
      ]
    },
    {
      id: 'compare',
      label: 'Compare Tools',
      hasDropdown: true,
      items: [
        { id: 'coding-tools', label: 'Coding Tools', tab: 'coding-tools' },
        { id: 'productivity-tools', label: 'Productivity Tools', tab: 'productivity-tools' }
      ]
    },
    {
      id: 'organization',
      label: 'Organization',
      hasDropdown: false,
      tab: 'agentic-org-chart'
    },
    {
      id: 'roi',
      label: 'ROI & Planning',
      hasDropdown: true,
      items: [
        { id: 'expansion-roi', label: 'Claude Expansion ROI', tab: 'expansion' },
        { id: 'perceived-value', label: 'Perceived Value', tab: 'perceived-value' },
        { id: 'portfolio', label: 'AI Projects Portfolio', tab: 'portfolio' }
      ]
    },
    {
      id: 'enablement',
      label: 'Enablement',
      hasDropdown: false,
      tab: 'enablement'
    },
    {
      id: 'annual-plan',
      label: 'Annual Plan',
      hasDropdown: true,
      items: [
        { id: '2026-plan', label: '2026 Annual Plan', tab: '2026-plan' },
        { id: '2026-plan-dynamic', label: 'Dynamic Plan', tab: '2026-plan-dynamic', badge: 'BETA' }
      ]
    },
    {
      id: 'briefings',
      label: 'Briefings',
      hasDropdown: true,
      items: [
        { id: 'briefing-leadership', label: 'Leadership Summary', tab: 'briefing-leadership' },
        { id: 'briefing-org', label: 'Organization-wide Summary', tab: 'briefing-org' }
      ]
    }
  ];

  // Phase 1C: Helper function to generate breadcrumbs based on active tab
  const getBreadcrumbs = (tab, projectId = null) => {
    const crumbs = [{ label: 'Home', tab: null }];

    // Handle project detail breadcrumbs
    if (projectId && tab === 'portfolio') {
      // Build path: Home > ROI & Planning > AI Projects Portfolio > Project Name
      for (const navItem of navigationStructure) {
        if (navItem.hasDropdown && navItem.items) {
          for (const item of navItem.items) {
            if (item.tab === 'portfolio') {
              crumbs.push({ label: navItem.label, tab: null });
              crumbs.push({
                label: item.label,
                tab: 'portfolio',
                onClick: () => setSelectedProject(null) // Clear selection on back
              });
              const project = projectDetailsData[projectId];
              crumbs.push({
                label: project?.projectName || projectId,
                tab: null
              });
              return crumbs;
            }
          }
        }
      }
    }

    // Find the navigation path for the current tab
    for (const navItem of navigationStructure) {
      if (navItem.tab === tab && !navItem.hasDropdown) {
        // Direct tab (e.g., ROI & Planning, Enablement)
        crumbs.push({ label: navItem.label, tab: navItem.tab });
        return crumbs;
      }

      if (navItem.hasDropdown && navItem.items) {
        for (const item of navItem.items) {
          if (item.hasSubmenu && item.submenu) {
            // Check submenu items
            for (const subItem of item.submenu) {
              if (subItem.tab === tab) {
                crumbs.push({ label: navItem.label, tab: null });
                crumbs.push({ label: item.label, tab: null });
                crumbs.push({ label: subItem.label, tab: subItem.tab });
                return crumbs;
              }
            }
          } else if (item.tab === tab) {
            // Regular dropdown item
            crumbs.push({ label: navItem.label, tab: null });
            crumbs.push({ label: item.label, tab: item.tab });
            return crumbs;
          }
        }
      }
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs(activeTab, selectedProject);

  return (
    <>
      {/* Konami Code Easter Egg Modal */}
      <CreditsModal
        isOpen={showCredits}
        onClose={() => setShowCredits(false)}
        triggeredBy="konami"
      />

    <div className="min-h-screen bg-gray-50">
        {/* Sidebar Navigation - Option B: Sidebar Layout */}
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <SidebarNavigation
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            navigationStructure={navigationStructure}
          />

          {/* Main Content Area */}
          <main
            className={`${
              sidebarCollapsed ? 'ml-16' : 'ml-64'
            } flex-1 transition-all duration-300 p-6`}
          >
            {/* Dashboard Header with breadcrumbs */}
            <DashboardHeader
              latestMonthLabel={latestMonthLabel}
              latestMonthYear={latestMonthYear}
              breadcrumbs={breadcrumbs}
              setActiveTab={setActiveTab}
            />

            {/* Tab Content Container */}
            <div className="bg-white rounded-lg shadow-md mb-6 max-w-7xl">
              <div className="p-6">

            {/* Claude Enterprise Tab - Comprehensive View */}
            {activeTab === 'claude-enterprise' && (
              <ClaudeEnterprise aiToolsData={aiToolsData} />
            )}

            {/* Claude Code Tab */}
            {activeTab === 'claude-code' && (
              <ClaudeCode aiToolsData={aiToolsData} />
            )}

            {/* Claude Projects Tab */}
            {activeTab === 'claude-projects' && (
              <ClaudeProjects aiToolsData={aiToolsData} />
            )}

            {/* Claude Integrations Tab */}
            {activeTab === 'claude-integrations' && (
              <ClaudeIntegrations aiToolsData={aiToolsData} />
            )}

            {/* Enablement Tab */}
            {/* POC: Extracted Tab Component */}
            {activeTab === 'enablement' && (
              <Enablement enablementPlan={enablementPlan} />
            )}

            {/* POC: Extracted Tab Component */}
            {activeTab === '2026-plan' && (
              <AnnualPlan aiToolsData={aiToolsData} portfolioData={portfolioData} />
            )}

            {/* Dynamic Annual Plan (Beta) */}
            {activeTab === '2026-plan-dynamic' && (
              <DynamicAnnualPlan aiToolsData={aiToolsData} />
            )}

            {/* Coding Tools Comparison Tab */}
            {activeTab === 'coding-tools' && (
              <CodingToolsComparison aiToolsData={aiToolsData} />
            )}
            {/* Productivity Tools Comparison Tab */}
            {activeTab === 'productivity-tools' && (
              <ProductivityToolsComparison aiToolsData={aiToolsData} />
            )}

            {/* Expansion Opportunity Tab */}
            {activeTab === 'expansion' && (
              <ExpansionROI aiToolsData={aiToolsData} />
            )}

            {/* M365 Copilot Deep Dive Tab */}
            {activeTab === 'm365' && aiToolsData.m365CopilotDeepDive && (
              <M365Copilot aiToolsData={aiToolsData} latestMonthLabel={latestMonthLabel} />
            )}

            {/* M365 Copilot AI Agents Tab */}
            {activeTab === 'm365-agents' && aiToolsData.m365CopilotDeepDive && (
              <M365Agents aiToolsData={aiToolsData} />
            )}

          {/* Overview Landing Page - Home Tab */}
          {activeTab === 'overview-home' && (
            <OverviewHome aiToolsData={aiToolsData} setActiveTab={setActiveTab} />
          )}

          {/* PHASE 1D: Briefing - Leadership Summary Tab */}
          {/* POC: Extracted Tab Component */}
          {activeTab === 'briefing-leadership' && (
            <BriefingLeadership
              insights={aiToolsData.insights}
              agenticFTEs={aiToolsData.agenticFTEs}
              departmentBreakdown={aiToolsData.claudeEnterprise?.departmentBreakdown}
              claudeCodeDepartmentBreakdown={aiToolsData.code?.departmentBreakdown}
              m365DepartmentPerformance={aiToolsData.m365CopilotDeepDive?.departmentPerformance}
            />
          )}

          {/* PHASE 1D: Briefing - Organization-wide Summary Tab */}
          {activeTab === 'briefing-org' && (
            <BriefingOrg
              insights={aiToolsData.insights}
              agenticFTEs={aiToolsData.agenticFTEs}
              departmentBreakdown={aiToolsData.claudeEnterprise?.departmentBreakdown}
              m365DepartmentPerformance={aiToolsData.m365CopilotDeepDive?.departmentPerformance}
            />
          )}

          {/* PHASE 2: Agentic Org Chart Tab */}
          {activeTab === 'agentic-org-chart' && (
            <AgenticOrgChart aiToolsData={aiToolsData} />
          )}

        {/* PHASE 1D: Perceived Value Tab - Moved from nested position */}
          {/* Perceived Value Tab */}
          {activeTab === 'perceived-value' && (
            <PerceivedValue perceivedValueData={perceivedValueData} />
          )}
          {activeTab === 'portfolio' && (
            <Portfolio
              portfolioData={portfolioData}
              projectDetailsData={projectDetailsData}
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
              onNavigateToAnnualPlan={() => setActiveTab('2026-plan')}
            />
          )}

              </div>
            </div>
          </main>
        </div>
    </div>
    </>
  );
};


export default Dashboard;
// Data refresh: Mon Feb  9 13:52:13 EST 2026
