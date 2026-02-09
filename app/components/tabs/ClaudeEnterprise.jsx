import React from 'react';
import { ResponsiveContainer, AreaChart, BarChart, PieChart, Area, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Users, MessageSquare, TrendingUp, FileText, DollarSign, Code, Activity, Target, Clock, Award, ArrowUp, Lightbulb, AlertCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import MetricCard from '../shared/MetricCard';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import ReactMarkdown from 'react-markdown';
import ClaudeCodePowerUsersTable from '../shared/ClaudeCodePowerUsersTable';
import ClaudeCodeKeyInsights from '../shared/ClaudeCodeKeyInsights';
import ClaudeCodeLowEngagementUsers from '../shared/ClaudeCodeLowEngagementUsers';

/**
 * ClaudeEnterprise Tab Component
 *
 * Displays comprehensive Claude Enterprise analytics including key metrics,
 * ROI highlights, monthly growth trends, tool replacement value analysis,
 * MTD business value scorecard, productivity output, and department breakdowns.
 *
 * @param {Object} props - Component props
 * @param {Object} props.aiToolsData - Complete AI tools data from ai-tools-data.json
 * @returns {JSX.Element} ClaudeEnterprise tab content
 */
export default function ClaudeEnterprise({ aiToolsData }) {
  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

  // Extract needed data
  const { claudeEnterprise, m365Copilot, orgMetrics } = aiToolsData;

  // Calculate incremental metrics
  const { incrementalROI } = aiToolsData;
  const ghToClaudeCode = incrementalROI.githubToClaudeCode;
  const m365ToClaudeEnt = incrementalROI.m365ToClaudeEnterprise;
  const claudeCodeUsers = orgMetrics.premiumSeats;
  const claudeEnterpriseStandardUsers = orgMetrics.standardSeats;

  const incrementalMetrics = {
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
    portfolio: {
      totalIncrementalValue: ghToClaudeCode.incrementalValue + m365ToClaudeEnt.incrementalValue,
      totalIncrementalCost: ghToClaudeCode.additive.incrementalCost + m365ToClaudeEnt.additive.incrementalCost,
      totalIncrementalHours: ghToClaudeCode.incrementalHours + m365ToClaudeEnt.incrementalHours,
      blendedROI: ((ghToClaudeCode.incrementalValue + m365ToClaudeEnt.incrementalValue) /
                   (ghToClaudeCode.additive.incrementalCost + m365ToClaudeEnt.additive.incrementalCost)).toFixed(1),
      totalUsers: claudeCodeUsers + claudeEnterpriseStandardUsers
    }
  };

  // Monthly trends
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

  const monthlyOutputTrends = aiToolsData.claudeEnterprise.monthlyTrend.map(month => {
    const codeMonth = aiToolsData.claudeCode.monthlyTrend.find(m => m.monthLabel === month.monthLabel);
    return {
      month: month.monthLabel,
      artifacts: month.artifacts || 0,
      linesOfCode: codeMonth ? codeMonth.totalLines : 0
    };
  });

  const monthlyAdoptionTrends = aiToolsData.claudeEnterprise.monthlyTrend.map(month => ({
    month: month.monthLabel,
    activeUsers: month.users
  }));

  // Latest month data
  const monthlyTrend = claudeEnterprise.monthlyTrend || [];
  const latestMonth = monthlyTrend[monthlyTrend.length - 1] || {};
  const previousMonth = monthlyTrend[monthlyTrend.length - 2] || {};
  const latestMonthLabel = latestMonth.monthLabel || 'Current';

  // MTD metrics
  const mtdActiveUsers = latestMonth.users || claudeEnterprise.activeUsers;
  const claudeLicensedUsers = claudeEnterprise.licensedUsers;
  const mtdAdoptionRate = Math.round((mtdActiveUsers / claudeLicensedUsers) * 100);
  const mtdUserGrowth = previousMonth.users ? Math.round(((mtdActiveUsers - previousMonth.users) / previousMonth.users) * 100) : 0;
  const mtdEngagementRate = latestMonth.engagementRate || 0;
  const mtdEngagedUsers = latestMonth.engagedUsers || 0;

  const claudeCodeMonthlyTrend = aiToolsData.claudeCode?.monthlyTrend || [];
  const latestCodeMonth = claudeCodeMonthlyTrend[claudeCodeMonthlyTrend.length - 1] || {};
  const mtdLinesOfCode = latestCodeMonth.totalLines || 0;
  const mtdArtifacts = latestMonth.artifacts || 0;

  const businessValue = [
    { category: 'Adoption Rate', value: mtdAdoptionRate, color: '#3b82f6', description: `${mtdActiveUsers} active out of ${claudeLicensedUsers} licensed` },
    { category: 'User Growth', value: mtdUserGrowth, color: mtdUserGrowth >= 0 ? '#10b981' : '#ef4444', description: `${latestMonth.monthLabel} vs ${previousMonth.monthLabel}` },
    { category: 'Engagement', value: mtdEngagementRate, color: '#8b5cf6', description: `${mtdEngagedUsers} engaged users (≥3 prompts/day, ≥33% of days)` }
  ];

  // Summary metrics for adoption section
  const summaryMetrics = {
    avgConversationsPerUser: claudeEnterprise.conversationsPerUser || 0,
    claudeProjects: aiToolsData.claudeEnterprise.projects?.total || 0,
    claudeArtifacts: aiToolsData.claudeEnterprise.artifacts?.total || 0
  };

  // Editorial content for productivity highlights (placeholder - should come from AI insights)
  const editorialContent = {
    productivityMetrics: [],
    useCasesByCategory: [],
    departmentBreakdown: claudeEnterprise.departmentBreakdown || [],
    productivityHighlights: []
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Phase 1A - Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Licensed Users */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Licensed Users</p>
                        <p className="text-3xl font-bold text-blue-600">{claudeLicensedUsers}</p>
                        <p className="text-xs text-gray-500 mt-1">Total Claude Enterprise seats</p>
                      </div>
                      <Users className="w-12 h-12 text-blue-600 opacity-20" />
                    </div>
                  </div>

                  {/* Card 2: Active Users */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Active Users (MTD)</p>
                        <p className="text-3xl font-bold text-green-600">{mtdActiveUsers}</p>
                        <p className="text-xs text-gray-500 mt-1">Users active this month</p>
                      </div>
                      <Activity className="w-12 h-12 text-green-600 opacity-20" />
                    </div>
                  </div>

                  {/* Card 3: Adoption Rate */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Adoption Rate</p>
                        <p className="text-3xl font-bold text-purple-600">{mtdAdoptionRate}%</p>
                        <p className="text-xs text-gray-500 mt-1">{mtdActiveUsers} of {claudeLicensedUsers} users</p>
                      </div>
                      <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
                    </div>
                  </div>

                  {/* Card 4: Total Messages */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Messages</p>
                        <p className="text-3xl font-bold text-indigo-600">
                          {(latestMonth.messages || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Messages this month</p>
                      </div>
                      <MessageSquare className="w-12 h-12 text-indigo-600 opacity-20" />
                    </div>
                  </div>
                </div>

                {/* SECTION 1.5: Agentic FTE Impact - Claude Enterprise */}
                {aiToolsData.agenticFTEs?.monthlyTrend && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <Users className="w-6 h-6 text-blue-600" />
                          Claude Enterprise Agentic FTE Impact
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Equivalent full-time employees added through Claude Enterprise productivity
                        </p>
                      </div>
                      {(() => {
                        const latestMonthVFTE = aiToolsData.agenticFTEs.monthlyTrend[aiToolsData.agenticFTEs.monthlyTrend.length - 1];
                        const previousMonthVFTE = aiToolsData.agenticFTEs.monthlyTrend.length > 1 ?
                          aiToolsData.agenticFTEs.monthlyTrend[aiToolsData.agenticFTEs.monthlyTrend.length - 2] : null;
                        const ceFTEs = latestMonthVFTE?.breakdown?.claudeEnterprise || 0;
                        const prevCEFTEs = previousMonthVFTE?.breakdown?.claudeEnterprise || 0;
                        const ftesChange = ceFTEs - prevCEFTEs;
                        const percentChange = prevCEFTEs > 0 ? ((ftesChange / prevCEFTEs) * 100) : 0;

                        return (
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">{latestMonthVFTE?.monthLabel || 'Current'}</p>
                            <div className="flex items-baseline gap-2 justify-end">
                              <p className="text-4xl font-bold text-blue-600">
                                {ceFTEs.toFixed(1)}
                              </p>
                              <span className="text-lg text-gray-500">FTEs</span>
                            </div>
                            {previousMonthVFTE && (
                              <div className={`text-sm font-semibold mt-1 ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {percentChange >= 0 ? '↑' : '↓'} {Math.abs(ftesChange).toFixed(1)} FTEs ({Math.abs(percentChange).toFixed(1)}%) MoM
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Trend Chart */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Claude Enterprise Agentic FTEs Over Time</h4>
                        <ResponsiveContainer width="100%" height={240}>
                          <AreaChart data={aiToolsData.agenticFTEs.monthlyTrend}>
                            <defs>
                              <linearGradient id="colorCEFTEs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                              dataKey="monthLabel"
                              tick={{ fontSize: 12 }}
                              stroke="#6B7280"
                            />
                            <YAxis
                              tick={{ fontSize: 12 }}
                              stroke="#6B7280"
                              label={{ value: 'Agentic FTEs', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6B7280' } }}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                              formatter={(value) => [`${Number(value).toFixed(1)} FTEs`, 'Claude Enterprise']}
                              labelStyle={{ fontWeight: 600, color: '#111827' }}
                            />
                            <Area
                              type="monotone"
                              dataKey="breakdown.claudeEnterprise"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              fill="url(#colorCEFTEs)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Right: Metrics Breakdown */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Productivity Metrics</h4>
                        {(() => {
                          const latestMonthVFTE = aiToolsData.agenticFTEs.monthlyTrend[aiToolsData.agenticFTEs.monthlyTrend.length - 1];
                          const ceData = latestMonthVFTE?.claudeEnterprise;
                          const ceFTEs = latestMonthVFTE?.breakdown?.claudeEnterprise || 0;

                          return (
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-600">Active Users</span>
                                  <span className="text-lg font-bold text-blue-600">{ceData?.users || 0}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Users actively using Claude Enterprise this month
                                </div>
                              </div>

                              <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-600">Productive Hours Saved</span>
                                  <span className="text-lg font-bold text-green-600">
                                    {(ceData?.hours || 0).toLocaleString()} hrs
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Total hours saved through AI productivity
                                </div>
                              </div>

                              <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-600">Agentic FTEs</span>
                                  <span className="text-lg font-bold text-blue-600">{ceFTEs.toFixed(1)} FTEs</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Equivalent full-time employees (173 hrs/month per FTE)
                                </div>
                              </div>

                              <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-600">Efficiency Ratio</span>
                                  <span className="text-lg font-bold text-purple-600">
                                    {ceData?.users > 0 ? (ceFTEs / ceData.users).toFixed(2) : '0.00'}x
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Agentic FTEs per active user
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Methodology Note */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-700">
                          <span className="font-semibold">Calculation:</span> Uses 28% time savings baseline (Anthropic research + Australian Gov studies).
                          Total monthly FTEs distributed proportionally by user engagement: (artifacts × 2) + (messages / 100).
                          Power users contribute more Agentic FTE value based on actual output. Each FTE = 173 hours/month.
                        </div>
                      </div>
                    </div>

                    {/* Key Insights - Agentic FTE Impact */}
                    {aiToolsData.insights?.claudeEnterpriseVirtualFteImpact && (
                      <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <Target className="h-5 w-5 mr-2 text-amber-600" />
                          Key Insights
                        </h4>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="space-y-4 text-gray-700 leading-relaxed">
                            <MarkdownRenderer text={aiToolsData.insights.claudeEnterpriseVirtualFteImpact} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SECTION 2: Phase 1A - ROI Highlights */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <DollarSign className="h-8 w-8 mr-3" />
                    Claude Enterprise Business Value & ROI
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-blue-100 text-sm mb-2">Incremental Hours Gained</p>
                      <p className="text-3xl font-bold">{incrementalMetrics.portfolio.totalIncrementalHours.toLocaleString()} hrs</p>
                      <p className="text-sm text-blue-100 mt-1">vs GitHub Copilot + M365 Copilot</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm mb-2">Incremental Value Generated</p>
                      <p className="text-3xl font-bold">${incrementalMetrics.portfolio.totalIncrementalValue.toLocaleString()}</p>
                      <p className="text-sm text-blue-100 mt-1">Additional value from switching</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm mb-2">Incremental Cost (Tool Switch)</p>
                      <p className="text-3xl font-bold">${incrementalMetrics.portfolio.totalIncrementalCost.toLocaleString()}</p>
                      <p className="text-sm text-blue-100 mt-1">Extra cost vs baseline tools</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm mb-2">Blended Portfolio ROI</p>
                      <p className="text-3xl font-bold">{incrementalMetrics.portfolio.blendedROI}x</p>
                      <p className="text-sm text-blue-100 mt-1">Across {incrementalMetrics.portfolio.totalUsers} users</p>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Phase 1A - Key Insights - KPI Metrics */}
                {aiToolsData.insights && aiToolsData.insights.overviewKpiMetrics && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="h-6 w-6 mr-2 text-amber-600" />
                      Key Insights
                    </h3>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{aiToolsData.insights.overviewKpiMetrics}</p>
                    </div>
                  </div>
                )}

                {/* SECTION 4: Overview - Monthly Growth Trends */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Growth Trends</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyAdoption}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorLinesOfCode" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Area yAxisId="left" type="monotone" dataKey="claudeUsers" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" name="Active Users" />
                        <Area yAxisId="left" type="monotone" dataKey="conversations" stroke="#10b981" fillOpacity={1} fill="url(#colorConv)" name="Conversations" />
                        <Area yAxisId="right" type="monotone" dataKey="linesOfCode" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorLinesOfCode)" name="Lines of Code" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Key Insights - Monthly Growth Chart */}
                {aiToolsData.insights && aiToolsData.insights.monthlyGrowthChart && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="h-6 w-6 mr-2 text-amber-600" />
                      Key Insights
                    </h3>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{aiToolsData.insights.monthlyGrowthChart}</p>
                    </div>
                  </div>
                )}

                {/* SECTION 5: Overview - Tool Replacement Value Analysis */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Tool Replacement Value Analysis</h3>
                  <p className="text-sm text-gray-600 mb-6">Incremental value from switching to Claude tools vs. baseline alternatives</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Engineers: GitHub Copilot → Claude Code Premium */}
                    <div className="border border-blue-200 rounded-lg p-5 bg-gradient-to-br from-blue-50 to-white">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-900">Engineers ({incrementalMetrics.engineersGain.usersAffected} users)</h4>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">{incrementalMetrics.engineersGain.roi.toFixed(1)}x ROI</span>
                          {aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison?.deltaPercent !== null && aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison?.deltaPercent !== undefined && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison.deltaPercent >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison.deltaPercent >= 0 ? '+' : ''}{aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison.deltaPercent}% vs benchmark
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Baseline Tool:</span>
                          <span className="font-medium text-gray-900">{incrementalMetrics.engineersGain.baseline}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">New Tool:</span>
                          <span className="font-medium text-gray-900">{incrementalMetrics.engineersGain.current}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Incremental Hours:</span>
                            <span className="text-sm font-semibold text-gray-900">{incrementalMetrics.engineersGain.incrementalHours} hrs/mo</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Incremental Value:</span>
                            <span className="text-sm font-semibold text-green-600">${incrementalMetrics.engineersGain.incrementalValue.toLocaleString()}/mo</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Incremental Cost:</span>
                            <span className="text-sm font-semibold text-gray-900">${incrementalMetrics.engineersGain.incrementalCost.toLocaleString()}/mo</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-xs font-semibold text-gray-700">Net Gain:</span>
                            <span className="text-sm font-bold text-green-600">${(incrementalMetrics.engineersGain.incrementalValue - incrementalMetrics.engineersGain.incrementalCost).toLocaleString()}/mo</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Other Roles: M365 Copilot → Claude Enterprise Standard */}
                    <div className="border border-purple-200 rounded-lg p-5 bg-gradient-to-br from-purple-50 to-white">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-900">Other Roles ({incrementalMetrics.otherRolesGain.usersAffected} users)</h4>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">{incrementalMetrics.otherRolesGain.roi.toFixed(1)}x ROI</span>
                          {aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison?.deltaPercent !== null && aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison?.deltaPercent !== undefined && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison.deltaPercent >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison.deltaPercent >= 0 ? '+' : ''}{aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison.deltaPercent}% vs benchmark
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Baseline Tool:</span>
                          <span className="font-medium text-gray-900">{incrementalMetrics.otherRolesGain.baseline}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">New Tool:</span>
                          <span className="font-medium text-gray-900">{incrementalMetrics.otherRolesGain.current}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Incremental Hours:</span>
                            <span className="text-sm font-semibold text-gray-900">{incrementalMetrics.otherRolesGain.incrementalHours} hrs/mo</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Incremental Value:</span>
                            <span className="text-sm font-semibold text-green-600">${incrementalMetrics.otherRolesGain.incrementalValue.toLocaleString()}/mo</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Incremental Cost:</span>
                            <span className="text-sm font-semibold text-gray-900">${incrementalMetrics.otherRolesGain.incrementalCost.toLocaleString()}/mo</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-xs font-semibold text-gray-700">Net Gain:</span>
                            <span className="text-sm font-bold text-green-600">${(incrementalMetrics.otherRolesGain.incrementalValue - incrementalMetrics.otherRolesGain.incrementalCost).toLocaleString()}/mo</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Summary */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Portfolio-Wide Incremental ROI</p>
                        <p className="text-xs text-gray-600">Blended return across {incrementalMetrics.portfolio.totalUsers} users switching to Claude tools</p>
                        <p className="text-xs text-gray-500 mt-1">${incrementalMetrics.portfolio.totalIncrementalValue.toLocaleString()} value / ${incrementalMetrics.portfolio.totalIncrementalCost.toLocaleString()} extra cost</p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-green-600">{incrementalMetrics.portfolio.blendedROI}x</p>
                        <p className="text-xs text-gray-600 mt-1">Incremental ROI</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 6: Overview - MTD Business Value Scorecard */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">MTD Business Value Scorecard</h3>
                  <p className="text-sm text-gray-600 mb-4">Month-to-Date metrics for {latestMonth.monthLabel || 'current month'}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {businessValue.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">{item.category}</span>
                          <Target className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-3xl font-bold mb-1" style={{ color: item.color }}>
                          {item.value}%
                        </div>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 7: Overview - MTD Productivity Output */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">MTD Productivity Output</h3>
                  <p className="text-sm text-gray-600 mb-4">Combined output for {latestMonth.monthLabel || 'current month'}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-700">Lines of Code</span>
                        <Code className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="text-4xl font-bold text-purple-900 mb-1">
                        {(mtdLinesOfCode / 1000).toFixed(0)}K
                      </div>
                      <p className="text-xs text-purple-600">
                        Generated by {latestCodeMonth.users || 0} Claude Code users
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">Artifacts / Content Generated</span>
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="text-4xl font-bold text-blue-900 mb-1">
                        {mtdArtifacts}
                      </div>
                      <p className="text-xs text-blue-600">
                        Generated by {mtdActiveUsers} Claude Enterprise users
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 8: Adoption - Monthly Output & Adoption Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Output Trend */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Output Trend</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyOutputTrends}>
                          <defs>
                            <linearGradient id="colorArtifacts" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorLinesOfCode" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="artifacts"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorArtifacts)"
                            name="Artifacts"
                          />
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="linesOfCode"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorLinesOfCode)"
                            name="Lines of Code"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Monthly Adoption Trend */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Adoption Trend</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyAdoptionTrends}>
                          <defs>
                            <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="activeUsers"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorActiveUsers)"
                            name="Active Users"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* AI-Generated Combined Insight */}
                {aiToolsData.insights?.adoptionOutputTrends && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-900">
                      <strong className="text-lg">Adoption & Output Analysis:</strong> {aiToolsData.insights.adoptionOutputTrends}
                    </p>
                  </div>
                )}

                {/* SECTION 9: Adoption - Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Avg Conversations/User</h4>
                    <p className="text-3xl font-bold text-gray-900">{summaryMetrics.avgConversationsPerUser}</p>
                    <p className="text-xs text-gray-500 mt-1">Indicates deep engagement</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Projects Created</h4>
                    <p className="text-3xl font-bold text-gray-900">{summaryMetrics.claudeProjects}</p>
                    <p className="text-xs text-gray-500 mt-1">Structured workflows</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Artifacts Generated</h4>
                    <p className="text-3xl font-bold text-gray-900">{summaryMetrics.claudeArtifacts}</p>
                    <p className="text-xs text-gray-500 mt-1">Documents & code outputs</p>
                  </div>
                </div>

                {/* SECTION 10: Adoption - Claude Enterprise Power Users Table */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Claude Enterprise - Power User Champions (Top 15)</h3>
                  <p className="text-sm text-gray-600 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <strong>Power User Scoring:</strong> Ranked by composite score emphasizing outcomes over volume.
                    Score = Artifacts Generated (×50) + Files Integrated (×10) + Active Usage (×2) + Efficiency Bonuses (up to +300).
                    This identifies users producing deliverables and effectively integrating Claude into their workflow.
                  </p>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Agentic FTE</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Artifacts</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Convs</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Days Active</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {aiToolsData.claudeEnterprise.powerUsers.map((user, idx) => (
                            <tr key={user.email} className={idx < 3 ? 'bg-yellow-50' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {idx === 0 && '🥇'} {idx === 1 && '🥈'} {idx === 2 && '🥉'} {idx + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.department}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-bold">{user.powerUserScore.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{user.agenticFTE?.toFixed(2) || '0.00'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">{user.artifacts}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.filesUploaded}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.conversations}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.daysSinceLastActivity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* SECTION 11: Adoption - Claude Enterprise Low Engagement Users Table */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Claude Enterprise - Low Engagement Users (Enablement Targets)</h3>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Agentic FTE</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Conversations</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Days Since Active</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {aiToolsData.claudeEnterprise.lowEngagementUsers.map((user) => (
                            <tr key={user.email} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.department}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{user.agenticFTE?.toFixed(2) || '0.00'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.messages}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.conversations}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.daysSinceLastActivity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* SECTION 12: Adoption - Claude Enterprise Department Insights */}
                {aiToolsData.claudeEnterprise.departmentBreakdown && aiToolsData.claudeEnterprise.departmentBreakdown.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Insights: Claude Enterprise by Department</h3>

                    {/* AI-Generated Insight */}
                    {aiToolsData.insights?.claudeEnterpriseDepartmentPerformance && (
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200 mb-6">
                        <p className="text-sm text-gray-900">
                          <strong>Department Performance Analysis:</strong> {aiToolsData.insights.claudeEnterpriseDepartmentPerformance}
                        </p>
                      </div>
                    )}

                    {/* Department Breakdown Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Agentic FTE</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Conversations</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Artifacts</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Convs/User</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Msgs/User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top User</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {aiToolsData.claudeEnterprise.departmentBreakdown
                            .sort((a, b) => b.avgMessagesPerUser - a.avgMessagesPerUser)
                            .map((dept, idx) => (
                            <tr key={dept.department} className={idx === 0 ? 'bg-purple-50' : 'hover:bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.department}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{dept.users}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{dept.agenticFTE?.toFixed(2) || '0.00'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{dept.conversations.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{dept.messages.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{dept.artifacts}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">{dept.avgConversationsPerUser}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-semibold">{dept.avgMessagesPerUser}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{dept.topUser?.name || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SECTION 13: Adoption - Claude Code Power Users Table */}
                <ClaudeCodePowerUsersTable powerUsers={aiToolsData.claudeCode.powerUsers} />

                {/* SECTION 14: Adoption - Claude Code Key Insights */}
                <ClaudeCodeKeyInsights
                  departmentInsight={aiToolsData.insights?.claudeCodeDepartmentPerformance}
                  departmentBreakdown={aiToolsData.claudeCode.departmentBreakdown}
                  topThreeUsers={aiToolsData.claudeCode.powerUsers.slice(0, 3)}
                />

                {/* SECTION 15: Adoption - Claude Code Low Engagement Users Table */}
                <ClaudeCodeLowEngagementUsers lowEngagementUsers={aiToolsData.claudeCode.lowEngagementUsers} />

                {/* SECTION 17: Productivity - Quantified Time Savings */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="h-6 w-6 mr-2 text-green-600" />
                    Claude Enterprise: Quantified Time Savings
                  </h3>
                  <div className="space-y-4">
                    {editorialContent.productivityMetrics.map((item, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{item.metric}</h4>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {item.savings}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Before Claude</p>
                            <p className="font-medium text-gray-700">{item.before}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">With Claude</p>
                            <p className="font-medium text-gray-700">{item.after}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 italic">{item.source}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 18: Productivity - Use Cases by Category */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Use Cases by Category</h3>
                  <div className="space-y-3">
                    {editorialContent.useCasesByCategory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.category}</h4>
                          <p className="text-sm text-gray-500">{item.count} documented use cases</p>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.impact === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.impact} Impact
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 19: Productivity - Productivity Highlights */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Claude Enterprise Productivity Highlights</h3>
                  <ul className="space-y-2">
                    {editorialContent.productivityHighlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start">
                        <Award className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlight.text }} />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* SECTION 20: Departments - Department Adoption & Usage */}
                {(() => {
                  // Aggregate ALL-TIME department data from Claude Enterprise conversations and Claude Code lines
                  const deptMap = {};

                  // No normalization - keep Engineering and AI & Data separate
                  const normalizeDeptName = (name) => name;

                  // Aggregate Claude Enterprise conversations and Agentic FTE across ALL months
                  aiToolsData.claudeEnterprise.monthlyTrend.forEach(month => {
                    if (month?.byDept) {
                      month.byDept.forEach(dept => {
                        const deptName = normalizeDeptName(dept.department);
                        if (!deptMap[deptName]) {
                          deptMap[deptName] = { name: deptName, users: 0, conversations: 0, codeLines: 0, agenticFTE: 0 };
                        }
                        deptMap[deptName].users = Math.max(deptMap[deptName].users, dept.users || 0);
                        deptMap[deptName].conversations += dept.conversations || 0;
                      });
                    }
                  });

                  // Add Claude Enterprise Agentic FTE from latest month's department breakdown
                  if (aiToolsData.claudeEnterprise.departmentBreakdown) {
                    aiToolsData.claudeEnterprise.departmentBreakdown.forEach(dept => {
                      const deptName = normalizeDeptName(dept.department);
                      if (deptMap[deptName]) {
                        deptMap[deptName].agenticFTE += (dept.agenticFTE || 0);
                      }
                    });
                  }

                  // Aggregate Claude Code lines and Agentic FTE across ALL months
                  aiToolsData.claudeCode.monthlyTrend.forEach(month => {
                    if (month?.byDept) {
                      month.byDept.forEach(dept => {
                        const deptName = normalizeDeptName(dept.department);
                        if (!deptMap[deptName]) {
                          deptMap[deptName] = { name: deptName, users: 0, conversations: 0, codeLines: 0, agenticFTE: 0 };
                        }
                        deptMap[deptName].codeLines += dept.lines || 0;
                        deptMap[deptName].users = Math.max(deptMap[deptName].users, dept.users || 0);
                        deptMap[deptName].agenticFTE += (dept.agenticFTE || 0);
                      });
                    }
                  });

                  // Calculate engagement score for sorting
                  const getEngagementScore = (dept) => {
                    const avgConvPerUser = dept.users > 0 ? dept.conversations / dept.users : 0;
                    const avgLocPerUser = dept.users > 0 ? dept.codeLines / dept.users : 0;

                    // Assign numeric scores: High=3, Medium=2, Growing=1, None=0
                    const convScore = avgConvPerUser > 30 ? 3 : avgConvPerUser > 20 ? 2 : avgConvPerUser > 0 ? 1 : 0;
                    const locScore = avgLocPerUser > 20000 ? 3 : avgLocPerUser > 10000 ? 2 : avgLocPerUser > 0 ? 1 : 0;

                    // Combined score: conversations * 10 + code (prioritizes conversations first)
                    return convScore * 10 + locScore;
                  };

                  // Convert to array and add value for pie chart
                  const departmentUsageData = Object.values(deptMap)
                    .filter(dept => dept.users > 0) // Only departments with users
                    .sort((a, b) => {
                      const scoreA = getEngagementScore(a);
                      const scoreB = getEngagementScore(b);
                      // Sort by engagement score (High+High first, None+None last)
                      if (scoreB !== scoreA) return scoreB - scoreA;
                      // If same engagement, sort by user count
                      return b.users - a.users;
                    })
                    .map(dept => ({
                      ...dept,
                      value: dept.users // For pie chart
                    }));

                  return (
                  <>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Department Adoption & Usage</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={departmentUsageData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                              <YAxis yAxisId="left" />
                              <YAxis yAxisId="right" orientation="right" />
                              <Tooltip />
                              <Legend />
                              <Bar yAxisId="left" dataKey="conversations" fill="#10b981" name="Conversations (Claude Enterprise)" />
                              <Bar yAxisId="right" dataKey="codeLines" fill="#8b5cf6" name="Lines of Code (Claude Code)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={departmentUsageData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {departmentUsageData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Department Breakdown</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                              <th className="px-4 py-3">Department</th>
                              <th className="px-4 py-3">Active Users</th>
                              <th className="px-4 py-3 bg-blue-50">Agentic FTE<br/>(Combined)</th>
                              <th className="px-4 py-3 bg-green-50">Conversations<br/>(Claude Web/Desktop)</th>
                              <th className="px-4 py-3 bg-green-50">Avg Conv/User</th>
                              <th className="px-4 py-3 bg-green-50">Engagement Level<br/>(Claude Web/Desktop)</th>
                              <th className="px-4 py-3 bg-purple-50">LoC<br/>(Claude Code)</th>
                              <th className="px-4 py-3 bg-purple-50">Avg LoC/User</th>
                              <th className="px-4 py-3 bg-purple-50">Engagement Level<br/>(Claude Code)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {departmentUsageData.map((dept, idx) => {
                              const avgConvPerUser = dept.users > 0 ? (dept.conversations / dept.users).toFixed(1) : 0;
                              const avgLocPerUser = dept.users > 0 ? Math.round(dept.codeLines / dept.users) : 0;

                              // Engagement levels
                              const convEngagement = avgConvPerUser > 30 ? 'High' : avgConvPerUser > 20 ? 'Medium' : avgConvPerUser > 0 ? 'Growing' : 'None';
                              const convEngagementColor = avgConvPerUser > 30
                                ? 'bg-green-100 text-green-800'
                                : avgConvPerUser > 20
                                ? 'bg-yellow-100 text-yellow-800'
                                : avgConvPerUser > 0
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-gray-50 text-gray-500';

                              const locEngagement = avgLocPerUser > 20000 ? 'High' : avgLocPerUser > 10000 ? 'Medium' : avgLocPerUser > 0 ? 'Growing' : 'None';
                              const locEngagementColor = avgLocPerUser > 20000
                                ? 'bg-purple-100 text-purple-800'
                                : avgLocPerUser > 10000
                                ? 'bg-indigo-100 text-indigo-800'
                                : avgLocPerUser > 0
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-gray-50 text-gray-500';

                              return (
                                <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                  <td className="px-4 py-4 font-medium text-gray-900">{dept.name}</td>
                                  <td className="px-4 py-4 text-gray-900">{dept.users}</td>
                                  <td className="px-4 py-4 bg-blue-50 font-semibold text-green-600">{dept.agenticFTE?.toFixed(2) || '0.00'}</td>
                                  <td className="px-4 py-4 bg-green-50 text-gray-900">{dept.conversations.toLocaleString()}</td>
                                  <td className="px-4 py-4 bg-green-50 text-gray-900">{avgConvPerUser}</td>
                                  <td className="px-4 py-4 bg-green-50">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${convEngagementColor}`}>
                                      {convEngagement}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 bg-purple-50 text-gray-900">{dept.codeLines.toLocaleString()}</td>
                                  <td className="px-4 py-4 bg-purple-50 text-gray-900">{avgLocPerUser.toLocaleString()}</td>
                                  <td className="px-4 py-4 bg-purple-50">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${locEngagementColor}`}>
                                      {locEngagement}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Key Insights Section */}
                    {aiToolsData.insights?.departmentInsights && (
                      <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Insights</h3>
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                          <div className="space-y-4 text-gray-700 leading-relaxed">
                            {aiToolsData.insights.departmentInsights.split('\n\n').map((paragraph, idx) => (
                              <p key={idx} className="text-sm">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-purple-200">
                            <p className="text-xs text-gray-500 italic">
                              AI-generated insights based on current department adoption data and industry benchmarks
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
    </div>
  );
}
