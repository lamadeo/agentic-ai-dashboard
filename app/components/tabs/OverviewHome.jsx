import React from 'react';
import { ResponsiveContainer, AreaChart, BarChart, PieChart, ComposedChart, Area, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ReferenceLine } from 'recharts';
import { Users, MessageSquare, TrendingUp, FileText, DollarSign, Code, Activity, Target, Clock, Award, ArrowUp, Lightbulb, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import MetricCard from '../shared/MetricCard';
import ReactMarkdown from 'react-markdown';

/**
 * OverviewHome Tab Component
 *
 * Displays executive dashboard overview including key performance indicators,
 * blended adoption rates, tool comparisons, productivity/coding tool breakdowns,
 * adoption trends, department heatmaps, and AI-powered insights.
 *
 * @param {Object} props - Component props
 * @param {Object} props.aiToolsData - Complete AI tools data from ai-tools-data.json
 * @returns {JSX.Element} OverviewHome tab content
 */
export default function OverviewHome({ aiToolsData, setActiveTab }) {
  // Extract needed data
  const { overview, expansion, claudeEnterprise, m365Copilot, orgMetrics } = aiToolsData;

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

  // Get latest month data
  const monthlyTrend = claudeEnterprise.monthlyTrend || [];
  const latestMonth = monthlyTrend[monthlyTrend.length - 1] || {};
  const latestMonthLabel = latestMonth.monthLabel || 'Current';
  const latestMonthYear = latestMonth.month ? latestMonth.month.split('-')[0] : new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Section 1: Hero - 5 KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Card 1: AI Licenses per Employee */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">AI Licenses / Employee</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {(() => {
                          // Claude Code licenses are Premium CE users (subset of CE total)
                          const cePremium = aiToolsData.claudeCode.licensedUsers; // 11
                          // Claude Enterprise Standard = Total CE - Premium (those with Code)
                          const ceStandard = aiToolsData.claudeEnterprise.licensedUsers - cePremium; // 87 - 11 = 76
                          // M365 and GitHub
                          const m365 = aiToolsData.m365Copilot.licensedUsers;
                          const github = aiToolsData.githubCopilot.activeUsers; // 46 actual licenses

                          const totalLicenses = ceStandard + cePremium + m365 + github;
                          const totalEmployees = aiToolsData.orgMetrics.totalEmployees;
                          const ratio = totalLicenses / totalEmployees;

                          return ratio.toFixed(1);
                        })()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(() => {
                          const cePremium = aiToolsData.claudeCode.licensedUsers;
                          const ceStandard = aiToolsData.claudeEnterprise.licensedUsers - cePremium;
                          const m365 = aiToolsData.m365Copilot.licensedUsers;
                          const github = aiToolsData.githubCopilot.activeUsers;
                          const totalLicenses = ceStandard + cePremium + m365 + github;
                          return `${totalLicenses} total licenses across all tools`;
                        })()}
                      </p>
                    </div>
                    <Users className="w-12 h-12 text-blue-600 opacity-20" />
                  </div>
                </div>

                {/* Card 2: Adoption */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-full">
                      <p className="text-sm text-gray-600 mb-1">Adoption</p>
                      {(() => {
                        // Calculate blended adoption across all tools - use latest and previous months
                        const ceLatest = aiToolsData.claudeEnterprise.monthlyTrend?.[aiToolsData.claudeEnterprise.monthlyTrend.length - 1];
                        const m365Latest = aiToolsData.m365Copilot.monthlyTrend?.[aiToolsData.m365Copilot.monthlyTrend.length - 1];
                        const ghLatest = aiToolsData.githubCopilot.monthlyTrend?.[aiToolsData.githubCopilot.monthlyTrend.length - 1];
                        const ccLatest = aiToolsData.claudeCode.monthlyTrend?.[aiToolsData.claudeCode.monthlyTrend.length - 1];

                        const cePrevious = aiToolsData.claudeEnterprise.monthlyTrend?.[aiToolsData.claudeEnterprise.monthlyTrend.length - 2];
                        const m365Previous = aiToolsData.m365Copilot.monthlyTrend?.[aiToolsData.m365Copilot.monthlyTrend.length - 2];
                        const ghPrevious = aiToolsData.githubCopilot.monthlyTrend?.[aiToolsData.githubCopilot.monthlyTrend.length - 2];
                        const ccPrevious = aiToolsData.claudeCode.monthlyTrend?.[aiToolsData.claudeCode.monthlyTrend.length - 2];

                        // Active users per tool (latest month)
                        const ceActiveUsers = ceLatest?.users || 0;
                        const m365ActiveUsers = m365Latest?.users || 0;
                        const ghActiveUsers = ghLatest?.users || 0;
                        const ccActiveUsers = ccLatest?.users || 0;

                        // Previous month active users
                        const ceActiveNov = cePrevious?.users || 0;
                        const m365ActiveNov = m365Previous?.users || 0;
                        const ghActiveNov = ghPrevious?.users || 0;
                        const ccActiveNov = ccPrevious?.users || 0;

                        // Licensed users per tool
                        const ceLicenses = aiToolsData.claudeEnterprise.licensedUsers;
                        const m365Licenses = aiToolsData.m365Copilot.licensedUsers;
                        const ghLicenses = aiToolsData.githubCopilot.activeUsers; // GitHub active users = licenses
                        const ccLicenses = aiToolsData.claudeCode.licensedUsers;

                        // Total active and total licenses
                        const totalActiveUsers = ceActiveUsers + m365ActiveUsers + ghActiveUsers + ccActiveUsers;
                        const totalLicenses = ceLicenses + m365Licenses + ghLicenses + ccLicenses;
                        const blendedAdoption = Math.round((totalActiveUsers / totalLicenses) * 100);

                        // MoM change for blended adoption
                        const totalActiveNov = ceActiveNov + m365ActiveNov + ghActiveNov + ccActiveNov;
                        const adoptionNov = Math.round((totalActiveNov / totalLicenses) * 100);
                        const adoptionChange = blendedAdoption - adoptionNov;

                        // Per-tool adoption rates
                        const ceAdoption = Math.round((ceActiveUsers / ceLicenses) * 100);
                        const m365Adoption = Math.round((m365ActiveUsers / m365Licenses) * 100);
                        const ghAdoption = Math.round((ghActiveUsers / ghLicenses) * 100);
                        const ccAdoption = Math.round((ccActiveUsers / ccLicenses) * 100);

                        return (
                          <>
                            <div className="flex items-baseline gap-2 mb-3">
                              <p className="text-3xl font-bold text-purple-600">{blendedAdoption}%</p>
                              <span className={`text-sm font-semibold ${adoptionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {adoptionChange >= 0 ? '↑' : '↓'} {Math.abs(adoptionChange)}%
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">Claude Enterprise:</span>
                                <span className="font-semibold text-blue-600">{ceAdoption}%</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">M365 Copilot:</span>
                                <span className="font-semibold text-purple-600">{m365Adoption}%</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">GitHub Copilot:</span>
                                <span className="font-semibold text-green-600">{ghAdoption}%</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">Claude Code:</span>
                                <span className="font-semibold text-orange-600">{ccAdoption}%</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
                  </div>
                </div>

                {/* Card 3a: Prompts/Messages */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Prompts/Messages</p>
                      {(() => {
                        const ceLatest = aiToolsData.claudeEnterprise.monthlyTrend?.[aiToolsData.claudeEnterprise.monthlyTrend.length - 1];
                        const m365Latest = aiToolsData.m365Copilot.monthlyTrend?.[aiToolsData.m365Copilot.monthlyTrend.length - 1];
                        const cePrevious = aiToolsData.claudeEnterprise.monthlyTrend?.[aiToolsData.claudeEnterprise.monthlyTrend.length - 2];
                        const m365Previous = aiToolsData.m365Copilot.monthlyTrend?.[aiToolsData.m365Copilot.monthlyTrend.length - 2];

                        const latestTotal = (ceLatest?.messages || 0) + (m365Latest?.totalPrompts || 0);
                        const previousTotal = (cePrevious?.messages || 0) + (m365Previous?.totalPrompts || 0);
                        const percentChange = previousTotal > 0 ? ((latestTotal - previousTotal) / previousTotal) * 100 : 0;
                        const isPositive = percentChange >= 0;

                        return (
                          <>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-green-600">
                                {Math.round(latestTotal / 1000)}k
                              </p>
                              {previousTotal > 0 && (
                                <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                  {isPositive ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              CE + M365 Copilot messages (MoM)
                            </p>
                          </>
                        );
                      })()}
                    </div>
                    <MessageSquare className="w-12 h-12 text-green-600 opacity-20" />
                  </div>
                </div>

                {/* Card 3b: Lines of Code */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Lines of Code</p>
                      {(() => {
                        const ghLatest = aiToolsData.githubCopilot.monthlyTrend?.[aiToolsData.githubCopilot.monthlyTrend.length - 1];
                        const ccLatest = aiToolsData.claudeCode.monthlyTrend?.[aiToolsData.claudeCode.monthlyTrend.length - 1];
                        const ghPrevious = aiToolsData.githubCopilot.monthlyTrend?.[aiToolsData.githubCopilot.monthlyTrend.length - 2];
                        const ccPrevious = aiToolsData.claudeCode.monthlyTrend?.[aiToolsData.claudeCode.monthlyTrend.length - 2];

                        const latestLines = (ghLatest?.totalLines || 0) + (ccLatest?.totalLines || 0);
                        const previousLines = (ghPrevious?.totalLines || 0) + (ccPrevious?.totalLines || 0);
                        const percentChange = previousLines > 0 ? ((latestLines - previousLines) / previousLines) * 100 : 0;
                        const isPositive = percentChange >= 0;

                        return (
                          <>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-indigo-600">
                                {Math.round(latestLines / 1000)}k
                              </p>
                              {previousLines > 0 && (
                                <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                  {isPositive ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              GitHub + Claude Code generated (MoM)
                            </p>
                          </>
                        );
                      })()}
                    </div>
                    <Code className="w-12 h-12 text-indigo-600 opacity-20" />
                  </div>
                </div>

                {/* Card 4: Portfolio ROI - Incremental */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-full">
                      <p className="text-sm text-gray-600 mb-1">Portfolio ROI</p>
                      <p className="text-3xl font-bold text-orange-600 mb-3">{incrementalMetrics.portfolio.blendedROI}x</p>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">GitHub → Claude Code:</span>
                          <span className="font-semibold text-blue-600">
                            {incrementalMetrics.engineersGain.roi.toFixed(1)}x
                            {aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison?.deltaPercent !== null && aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison?.deltaPercent !== undefined && (
                              <span className={`ml-1 ${aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison.deltaPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ({aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison.deltaPercent >= 0 ? '+' : ''}{aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison.deltaPercent}%)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">M365 → Claude Ent:</span>
                          <span className="font-semibold text-purple-600">
                            {incrementalMetrics.otherRolesGain.roi.toFixed(1)}x
                            {aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison?.deltaPercent !== null && aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison?.deltaPercent !== undefined && (
                              <span className={`ml-1 ${aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison.deltaPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ({aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison.deltaPercent >= 0 ? '+' : ''}{aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison.deltaPercent}%)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 italic">% comparisons are from industry benchmarks</p>
                    </div>
                    <DollarSign className="w-12 h-12 text-orange-600 opacity-20" />
                  </div>
                </div>
              </div>

              {/* Section 1.5: Agentic FTE Impact */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-6 h-6 text-blue-600" />
                      Agentic FTE Impact
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Equivalent full-time employees added through AI productivity
                    </p>
                  </div>
                  {aiToolsData.agenticFTEs?.current && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">{aiToolsData.agenticFTEs.current.monthLabel} {aiToolsData.agenticFTEs.current.month.split('-')[0]}</p>
                      <div className="flex items-baseline gap-2 justify-end">
                        <p className="text-4xl font-bold text-blue-600">
                          {aiToolsData.agenticFTEs.current.totalAgenticFTEs.toFixed(1)}
                        </p>
                        <span className="text-lg text-gray-500">FTEs</span>
                      </div>
                      {aiToolsData.agenticFTEs.monthOverMonth && (
                        <div className={`text-sm font-semibold mt-1 ${aiToolsData.agenticFTEs.monthOverMonth.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {aiToolsData.agenticFTEs.monthOverMonth.percentChange >= 0 ? '↑' : '↓'} {Math.abs(aiToolsData.agenticFTEs.monthOverMonth.ftesChange).toFixed(1)} FTEs ({Math.abs(aiToolsData.agenticFTEs.monthOverMonth.percentChange).toFixed(1)}%) MoM
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Trend Chart */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-700">Agentic FTEs Over Time</h4>
                      {aiToolsData.agenticFTEs?.current?.isMTD && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          MTD ({aiToolsData.agenticFTEs.current.daysOfData} days)
                        </span>
                      )}
                    </div>
                    {aiToolsData.agenticFTEs?.monthlyTrend && aiToolsData.agenticFTEs.monthlyTrend.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={240}>
                          <ComposedChart data={(() => {
                            // Build chart data with actual and projected segments
                            const chartData = [...aiToolsData.agenticFTEs.monthlyTrend];

                            if (aiToolsData.agenticFTEs.projection) {
                              // Get last actual data point (MTD)
                              const lastActual = chartData[chartData.length - 1];
                              const lastActualFTEs = lastActual?.totalFTEs || 0;

                              // Update last actual point to start the projection line
                              lastActual.projectedFTEs = lastActualFTEs;

                              // Add end-of-month projection point
                              chartData.push({
                                monthLabel: `${aiToolsData.agenticFTEs.current.monthLabel} (EOM)`,
                                month: aiToolsData.agenticFTEs.current.month,
                                totalFTEs: null, // Actual line stops at MTD
                                projectedFTEs: aiToolsData.agenticFTEs.projection.totalAgenticFTEs, // Projection line to EOM
                                isProjection: true
                              });
                            }
                            return chartData;
                          })()}>
                            <defs>
                              <linearGradient id="colorFTEs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorFTEsProjected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                              dataKey="monthLabel"
                              tick={{ fontSize: 11 }}
                              stroke="#6B7280"
                              angle={-15}
                              textAnchor="end"
                              height={50}
                            />
                            <YAxis
                              tick={{ fontSize: 12 }}
                              stroke="#6B7280"
                              label={{ value: 'Agentic FTEs', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6B7280' } }}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                              formatter={(value, name) => {
                                if (value == null) return null;
                                if (name === 'Actual (MTD)') return [`${Number(value).toFixed(1)} FTEs`, 'Actual (MTD)'];
                                if (name === 'Projected (EOM)') return [`${Number(value).toFixed(1)} FTEs`, 'Projected (EOM)'];
                                return [`${Number(value).toFixed(1)} FTEs`, name];
                              }}
                              labelStyle={{ fontWeight: 600, color: '#111827' }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: '12px' }}
                              iconType="line"
                            />
                            <Area
                              type="monotone"
                              dataKey="totalFTEs"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              fill="url(#colorFTEs)"
                              name="Actual (MTD)"
                              connectNulls={false}
                            />
                            {aiToolsData.agenticFTEs.projection && (
                              <>
                                {/* Projection line from MTD to EOM */}
                                <Area
                                  type="monotone"
                                  dataKey="projectedFTEs"
                                  stroke="#F59E0B"
                                  strokeWidth={2}
                                  strokeDasharray="5 5"
                                  fill="url(#colorFTEsProjected)"
                                  name="Projected (EOM)"
                                  dot={{ fill: '#F59E0B', r: 5, strokeWidth: 2, stroke: '#FFF' }}
                                  connectNulls={true}
                                />
                              </>
                            )}
                          </ComposedChart>
                        </ResponsiveContainer>
                        {aiToolsData.agenticFTEs.projection && (
                          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-gray-700">
                            <span className="font-semibold">Projection (amber/orange dashed line):</span> Based on {aiToolsData.agenticFTEs.current.daysOfData} days of data,
                            projected end-of-month: <span className="font-bold text-amber-600">{aiToolsData.agenticFTEs.projection.totalAgenticFTEs} FTEs</span>
                            <span className="text-gray-600 ml-1">(amber gradient shows projected growth from MTD to EOM)</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-240 flex items-center justify-center text-gray-400">
                        <p>No trend data available</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Tool Breakdown */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Breakdown by Tool ({aiToolsData.agenticFTEs?.current?.monthLabel || 'Current'})</h4>
                    {aiToolsData.agenticFTEs?.current?.breakdown ? (
                      <div className="space-y-3">
                        {/* Claude Enterprise */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-700 font-medium">Claude Enterprise</span>
                            <span className="text-sm font-bold text-blue-600">
                              {aiToolsData.agenticFTEs.current.breakdown.claudeEnterprise.toFixed(1)} FTEs
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${(aiToolsData.agenticFTEs.current.breakdown.claudeEnterprise / aiToolsData.agenticFTEs.current.totalAgenticFTEs * 100).toFixed(1)}%`
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {((aiToolsData.agenticFTEs.current.breakdown.claudeEnterprise / aiToolsData.agenticFTEs.current.totalAgenticFTEs) * 100).toFixed(1)}% of total
                          </div>
                        </div>

                        {/* Claude Code */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-700 font-medium">Claude Code</span>
                            <span className="text-sm font-bold text-orange-600">
                              {aiToolsData.agenticFTEs.current.breakdown.claudeCode.toFixed(1)} FTEs
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${(aiToolsData.agenticFTEs.current.breakdown.claudeCode / aiToolsData.agenticFTEs.current.totalAgenticFTEs * 100).toFixed(1)}%`
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {((aiToolsData.agenticFTEs.current.breakdown.claudeCode / aiToolsData.agenticFTEs.current.totalAgenticFTEs) * 100).toFixed(1)}% of total
                          </div>
                        </div>

                        {/* M365 Copilot */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-700 font-medium">M365 Copilot</span>
                            <span className="text-sm font-bold text-purple-600">
                              {aiToolsData.agenticFTEs.current.breakdown.m365Copilot.toFixed(1)} FTEs
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${(aiToolsData.agenticFTEs.current.breakdown.m365Copilot / aiToolsData.agenticFTEs.current.totalAgenticFTEs * 100).toFixed(1)}%`
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {((aiToolsData.agenticFTEs.current.breakdown.m365Copilot / aiToolsData.agenticFTEs.current.totalAgenticFTEs) * 100).toFixed(1)}% of total
                          </div>
                        </div>

                        {/* GitHub Copilot */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-700 font-medium">GitHub Copilot</span>
                            <span className="text-sm font-bold text-green-600">
                              {aiToolsData.agenticFTEs.current.breakdown.githubCopilot.toFixed(1)} FTEs
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${(aiToolsData.agenticFTEs.current.breakdown.githubCopilot / aiToolsData.agenticFTEs.current.totalAgenticFTEs * 100).toFixed(1)}%`
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {((aiToolsData.agenticFTEs.current.breakdown.githubCopilot / aiToolsData.agenticFTEs.current.totalAgenticFTEs) * 100).toFixed(1)}% of total
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="pt-3 mt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-900">Total Productive Hours</span>
                            <span className="text-sm font-bold text-gray-900">
                              {aiToolsData.agenticFTEs.current.totalProductiveHours.toLocaleString()} hrs
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Equivalent to {(aiToolsData.agenticFTEs.current.totalProductiveHours / 173).toFixed(1)} FTEs × 173 hrs/month
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        <p>No breakdown data available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Industry Benchmarks & Methodology */}
                <div className="mt-4 space-y-3">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Industry Benchmarks Used in Calculations</h5>
                        <div className="space-y-2 text-xs text-gray-700">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Productivity Tools */}
                            <div className="bg-white rounded p-3 border border-blue-100">
                              <div className="font-semibold text-blue-900 mb-2">Productivity Tools</div>
                              <div className="space-y-1.5">
                                <div>
                                  <span className="font-medium">Claude Enterprise:</span> 28% time savings
                                  <div className="text-gray-500 ml-2">Source: Anthropic research + Australian Government studies</div>
                                </div>
                                <div>
                                  <span className="font-medium">M365 Copilot:</span> 14% time savings
                                  <div className="text-gray-500 ml-2">Source: Australian Government Digital.gov.au trial</div>
                                </div>
                              </div>
                            </div>

                            {/* Coding Tools */}
                            <div className="bg-white rounded p-3 border border-blue-100">
                              <div className="font-semibold text-blue-900 mb-2">Coding Tools</div>
                              <div className="space-y-1.5">
                                <div>
                                  <span className="font-medium">Hours per line:</span> 0.08 hours (5 minutes)
                                  <div className="text-gray-500 ml-2">Based on 12.5 lines/hr manual coding baseline</div>
                                </div>
                                <div>
                                  <span className="font-medium">Manual baseline:</span> 12.5 lines/hour
                                  <div className="text-gray-500 ml-2">Source: "Code Complete" (McConnell) and COCOMO model</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-gray-700">
                        <span className="font-semibold">Calculation methodology:</span> Agentic FTEs represent equivalent full-time employees added through AI productivity.
                        Productivity tools formula: <span className="font-mono bg-white px-1 rounded">Agentic FTEs = Active Users × Time Savings %</span>.
                        Coding tools formula: <span className="font-mono bg-white px-1 rounded">Agentic FTEs = Lines Generated × 0.08 hrs/line / 173 hrs per FTE</span>.
                        One FTE = 173 hours/month (40 hrs/week × 52 weeks / 12 months).
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2A: Productivity Tools */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Tools</h3>
                <p className="text-xs text-gray-500 mb-4">{latestMonthLabel} {latestMonthYear}: Adoption rates, activity & artifacts</p>
                <div className="space-y-6">
                  {(() => {
                    // M365 Copilot - using September data (latest available)
                    const m365Trend = aiToolsData.m365Copilot.monthlyTrend;
                    const m365Latest = m365Trend[m365Trend.length - 1]; // September
                    const m365Previous = m365Trend.length > 1 ? m365Trend[m365Trend.length - 2] : null;
                    const m365AdoptionRate = (m365Latest.users / aiToolsData.m365Copilot.licensedUsers) * 100;
                    const m365PrevRate = m365Previous ? (m365Previous.users / aiToolsData.m365Copilot.licensedUsers) * 100 : null;
                    const m365Change = m365PrevRate ? m365AdoptionRate - m365PrevRate : null;
                    const m365Activity = m365Latest.totalPrompts; // Chat activity
                    const m365PrevActivity = m365Previous ? m365Previous.totalPrompts : null;
                    const m365ActivityChange = m365PrevActivity ? ((m365Activity - m365PrevActivity) / m365PrevActivity) * 100 : null;

                    // Use generated approximateArtifacts (20% × W/E/P adoption factor)
                    const m365Artifacts = aiToolsData.m365Copilot.approximateArtifacts;

                    // Calculate previous month artifacts using same methodology
                    const m365PrevArtifacts = m365Previous ? (() => {
                      // Get previous month's content app prompts
                      const prevContentAppPrompts = m365Previous.contentAppPrompts || 0;
                      // Apply same conversion rate and adoption factor
                      return Math.round(prevContentAppPrompts * 0.20 * (aiToolsData.m365Copilot.wordExcelPowerpointAdoptionFactor / 100));
                    })() : null;
                    const m365ArtifactsChange = m365PrevArtifacts ? ((m365Artifacts - m365PrevArtifacts) / m365PrevArtifacts) * 100 : null;

                    // Claude Enterprise - December
                    const ceTrend = aiToolsData.claudeEnterprise.monthlyTrend;
                    const ceLatest = ceTrend[ceTrend.length - 1]; // December
                    const cePrevious = ceTrend.length > 1 ? ceTrend[ceTrend.length - 2] : null;
                    const ceAdoptionRate = (ceLatest.users / aiToolsData.claudeEnterprise.licensedUsers) * 100;
                    const cePrevRate = cePrevious ? (cePrevious.users / aiToolsData.claudeEnterprise.licensedUsers) * 100 : null;
                    const ceChange = cePrevRate ? ceAdoptionRate - cePrevRate : null;
                    const ceActivity = ceLatest.messages; // Prompt activity (messages, not conversations)
                    const cePrevActivity = cePrevious ? cePrevious.messages : null;
                    const ceActivityChange = cePrevActivity ? ((ceActivity - cePrevActivity) / cePrevActivity) * 100 : null;
                    const ceArtifacts = ceLatest.artifacts; // Artifacts created
                    const cePrevArtifacts = cePrevious ? cePrevious.artifacts : null;
                    const ceArtifactsChange = cePrevArtifacts ? ((ceArtifacts - cePrevArtifacts) / cePrevArtifacts) * 100 : null;

                    // Calculate totals
                    const totalChats = m365Activity + ceActivity;
                    const totalArtifacts = m365Artifacts + ceArtifacts;

                    const totalEmployees = aiToolsData.orgMetrics.totalEmployees;

                    // Calculate total developers (Engineering + Product + Agentic AI) from department breakdown
                    const totalDevelopers = (() => {
                      const depts = aiToolsData.claudeEnterprise.departmentBreakdown || [];
                      const engineering = depts.find(d => d.department === 'Engineering');
                      const product = depts.find(d => d.department === 'Product');
                      const agenticAI = depts.find(d => d.department === 'Agentic AI');

                      // Return sum of employee counts (using users as proxy since we don't have explicit employee counts)
                      // Note: In production this should use actual employee counts from org hierarchy
                      return 100; // Engineering: 77 + Product: 17 + Agentic AI: 6 = 100
                    })();

                    const prodTools = [
                      {
                        tool: 'M365 Copilot',
                        adoptionRate: m365AdoptionRate,
                        activeUsers: m365Latest.users,
                        licensedUsers: aiToolsData.m365Copilot.licensedUsers,
                        monthLabel: m365Latest.monthLabel,
                        change: m365Change,
                        activity: m365Activity,
                        activityPercent: (m365Activity / totalChats) * 100,
                        activityChange: m365ActivityChange,
                        artifacts: m365Artifacts,
                        artifactsPercent: totalArtifacts > 0 ? (m365Artifacts / totalArtifacts) * 100 : 0,
                        artifactsChange: m365ArtifactsChange,
                        coverageRate: (aiToolsData.m365Copilot.licensedUsers / totalEmployees) * 100,
                        color: '#0078d4'
                      },
                      {
                        tool: 'Claude Enterprise',
                        adoptionRate: ceAdoptionRate,
                        activeUsers: ceLatest.users,
                        licensedUsers: aiToolsData.claudeEnterprise.licensedUsers,
                        monthLabel: ceLatest.monthLabel,
                        change: ceChange,
                        activity: ceActivity,
                        activityPercent: (ceActivity / totalChats) * 100,
                        activityChange: ceActivityChange,
                        artifacts: ceArtifacts,
                        artifactsPercent: totalArtifacts > 0 ? (ceArtifacts / totalArtifacts) * 100 : 0,
                        artifactsChange: ceArtifactsChange,
                        coverageRate: (aiToolsData.claudeEnterprise.licensedUsers / totalEmployees) * 100,
                        color: '#3b82f6'
                      }
                    ];

                    return prodTools.map(({ tool, adoptionRate, activeUsers, licensedUsers, monthLabel, change, activity, activityPercent, activityChange, artifacts, artifactsPercent, artifactsChange, coverageRate, color }) => (
                      <div key={tool} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">{tool}</span>
                        </div>

                        {/* Coverage Rate Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Coverage Rate</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">
                                {licensedUsers} / {totalEmployees} employees
                              </span>
                              <span>{monthLabel}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-5">
                            <div
                              className="h-5 rounded-full flex items-center justify-end pr-2 transition-all"
                              style={{
                                width: `${Math.min(coverageRate, 100)}%`,
                                backgroundColor: '#3b82f6',
                                minWidth: coverageRate > 0 ? '50px' : '0px'
                              }}
                            >
                              <span className="text-xs font-semibold text-white">
                                {coverageRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Adoption Rate Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Adoption Rate</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">{activeUsers} / {licensedUsers} users</span>
                              <span>{monthLabel}</span>
                              {change !== null && (
                                <span className={`text-xs font-semibold ${change > 0 ? 'text-green-600' : change === 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {change !== 0 && (change > 0 ? '↑ ' : '↓ ')}{Math.abs(change).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-5">
                            <div
                              className="h-5 rounded-full flex items-center justify-end pr-2 transition-all"
                              style={{
                                width: `${Math.min(adoptionRate, 100)}%`,
                                backgroundColor: adoptionRate >= 70 ? '#10b981' : adoptionRate >= 30 ? '#eab308' : '#ef4444',
                                minWidth: adoptionRate > 0 ? '50px' : '0px'
                              }}
                            >
                              <span className="text-xs font-semibold text-white">
                                {Math.round(adoptionRate)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Prompt Activity Distribution Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Prompt Activity Distribution</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">
                                {activity >= 1000 ? `${Math.round(activity / 1000)}k` : activity} prompts
                              </span>
                              <span>{monthLabel}</span>
                              {activityChange !== null && (
                                <span className={`text-xs font-semibold ${activityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {activityChange >= 0 ? '↑' : '↓'} {Math.abs(activityChange).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-5">
                            <div
                              className="h-5 rounded-full flex items-center justify-end pr-2 transition-all"
                              style={{
                                width: `${activityPercent}%`,
                                backgroundColor: activityPercent >= 70 ? '#10b981' : activityPercent >= 30 ? '#eab308' : '#ef4444',
                                opacity: 0.7,
                                minWidth: activityPercent > 0 ? '50px' : '0px'
                              }}
                            >
                              <span className="text-xs font-semibold text-white">
                                {activityPercent.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Artifacts / Content Generated Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Artifacts / Content Generated ({latestMonthLabel} MTD) {tool === 'M365 Copilot' && <span className="text-gray-400">(20% × {aiToolsData.m365Copilot.wordExcelPowerpointAdoptionFactor}% W/E/P adoption)</span>}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">
                                {artifacts} artifacts
                              </span>
                              <span>{monthLabel}</span>
                              {artifactsChange !== null && (
                                <span className={`text-xs font-semibold ${artifactsChange > 0 ? 'text-green-600' : artifactsChange === 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {artifactsChange !== 0 && (artifactsChange > 0 ? '↑ ' : '↓ ')}{Math.abs(artifactsChange).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-5">
                            <div
                              className="h-5 rounded-full flex items-center justify-end pr-2 transition-all"
                              style={{
                                width: `${artifactsPercent}%`,
                                backgroundColor: artifactsPercent >= 70 ? '#10b981' : artifactsPercent >= 30 ? '#eab308' : '#ef4444',
                                opacity: 0.7,
                                minWidth: artifactsPercent > 0 ? '50px' : '0px'
                              }}
                            >
                              <span className="text-xs font-semibold text-white">
                                {artifactsPercent.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Section 2B: Coding Tools */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Coding Tools</h3>
                <p className="text-xs text-gray-500 mb-4">{latestMonthLabel} {latestMonthYear}: Adoption rates & lines of code distribution</p>
                <div className="space-y-6">
                  {(() => {
                    // GitHub Copilot - December
                    const githubTrend = aiToolsData.githubCopilot.monthlyTrend;
                    const githubLatest = githubTrend[githubTrend.length - 1]; // December
                    const githubPrevious = githubTrend.length > 1 ? githubTrend[githubTrend.length - 2] : null;
                    const githubLicenses = 46;
                    const githubAdoptionRate = (githubLatest.users / githubLicenses) * 100;
                    const githubPrevRate = githubPrevious ? (githubPrevious.users / githubLicenses) * 100 : null;
                    const githubChange = githubPrevRate ? githubAdoptionRate - githubPrevRate : null;
                    const githubActivity = githubLatest.totalLines; // Code activity
                    const githubPrevActivity = githubPrevious ? githubPrevious.totalLines : null;
                    const githubActivityChange = githubPrevActivity ? ((githubActivity - githubPrevActivity) / githubPrevActivity) * 100 : null;

                    // Claude Code - December
                    const claudeCodeTrend = aiToolsData.claudeCode.monthlyTrend;
                    const claudeCodeLatest = claudeCodeTrend[claudeCodeTrend.length - 1]; // December
                    const claudeCodePrevious = claudeCodeTrend.length > 1 ? claudeCodeTrend[claudeCodeTrend.length - 2] : null;
                    const claudeCodeAdoptionRate = (claudeCodeLatest.users / aiToolsData.claudeCode.licensedUsers) * 100;
                    const claudeCodePrevRate = claudeCodePrevious ? (claudeCodePrevious.users / aiToolsData.claudeCode.licensedUsers) * 100 : null;
                    const claudeCodeChange = claudeCodePrevRate ? claudeCodeAdoptionRate - claudeCodePrevRate : null;
                    const claudeCodeActivity = claudeCodeLatest.totalLines; // Code activity
                    const claudeCodePrevActivity = claudeCodePrevious ? claudeCodePrevious.totalLines : null;
                    const claudeCodeActivityChange = claudeCodePrevActivity ? ((claudeCodeActivity - claudeCodePrevActivity) / claudeCodePrevActivity) * 100 : null;

                    // Calculate totals
                    const totalLines = githubActivity + claudeCodeActivity; // Code-based tools
                    const totalEmployees = aiToolsData.orgMetrics.totalEmployees;

                    // Calculate total developers (Engineering + Product + Agentic AI) from department breakdown
                    const totalDevelopers = (() => {
                      const depts = aiToolsData.claudeEnterprise.departmentBreakdown || [];
                      const engineering = depts.find(d => d.department === 'Engineering');
                      const product = depts.find(d => d.department === 'Product');
                      const agenticAI = depts.find(d => d.department === 'Agentic AI');

                      // Return sum of employee counts (using users as proxy since we don't have explicit employee counts)
                      // Note: In production this should use actual employee counts from org hierarchy
                      return 100; // Engineering: 77 + Product: 17 + Agentic AI: 6 = 100
                    })();

                    const codingTools = [
                      {
                        tool: 'GitHub Copilot',
                        adoptionRate: githubAdoptionRate,
                        activeUsers: githubLatest.users,
                        licensedUsers: githubLicenses,
                        monthLabel: githubLatest.monthLabel,
                        change: githubChange,
                        activity: githubActivity,
                        activityPercent: (githubActivity / totalLines) * 100,
                        activityChange: githubActivityChange,
                        coverageRate: (githubLicenses / totalDevelopers) * 100,
                        color: '#24292e'
                      },
                      {
                        tool: 'Claude Code',
                        adoptionRate: claudeCodeAdoptionRate,
                        activeUsers: claudeCodeLatest.users,
                        licensedUsers: aiToolsData.claudeCode.licensedUsers,
                        monthLabel: claudeCodeLatest.monthLabel,
                        change: claudeCodeChange,
                        activity: claudeCodeActivity,
                        activityPercent: (claudeCodeActivity / totalLines) * 100,
                        activityChange: claudeCodeActivityChange,
                        coverageRate: (aiToolsData.claudeCode.licensedUsers / totalDevelopers) * 100,
                        color: '#6366f1'
                      }
                    ];

                    return codingTools.map(({ tool, adoptionRate, activeUsers, licensedUsers, monthLabel, change, activity, activityPercent, activityChange, coverageRate, color }) => (
                      <div key={tool} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">{tool}</span>
                        </div>

                        {/* Coverage Rate Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Coverage Rate</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">
                                {licensedUsers} / {totalDevelopers} R&D Employees
                              </span>
                              <span>{monthLabel}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-5">
                            <div
                              className="h-5 rounded-full flex items-center justify-end pr-2 transition-all"
                              style={{
                                width: `${Math.min(coverageRate, 100)}%`,
                                backgroundColor: '#3b82f6',
                                minWidth: coverageRate > 0 ? '50px' : '0px'
                              }}
                            >
                              <span className="text-xs font-semibold text-white">
                                {coverageRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Adoption Rate Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Adoption Rate</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">{activeUsers} / {licensedUsers} users</span>
                              <span>{monthLabel}</span>
                              {change !== null && (
                                <span className={`text-xs font-semibold ${change > 0 ? 'text-green-600' : change === 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {change !== 0 && (change > 0 ? '↑ ' : '↓ ')}{Math.abs(change).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-5">
                            <div
                              className="h-5 rounded-full flex items-center justify-end pr-2 transition-all"
                              style={{
                                width: `${Math.min(adoptionRate, 100)}%`,
                                backgroundColor: adoptionRate >= 70 ? '#10b981' : adoptionRate >= 30 ? '#eab308' : '#ef4444',
                                minWidth: adoptionRate > 0 ? '50px' : '0px'
                              }}
                            >
                              <span className="text-xs font-semibold text-white">
                                {Math.round(adoptionRate)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Lines of Code Distribution Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Lines of Code Distribution</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">
                                {activity >= 1000 ? `${Math.round(activity / 1000)}k` : activity} lines
                              </span>
                              <span>{monthLabel}</span>
                              {activityChange !== null && (
                                <span className={`text-xs font-semibold ${activityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {activityChange >= 0 ? '↑' : '↓'} {Math.abs(activityChange).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-5">
                            <div
                              className="h-5 rounded-full flex items-center justify-end pr-2 transition-all"
                              style={{
                                width: `${activityPercent}%`,
                                backgroundColor: activityPercent >= 70 ? '#10b981' : activityPercent >= 30 ? '#eab308' : '#ef4444',
                                opacity: 0.7,
                                minWidth: activityPercent > 0 ? '50px' : '0px'
                              }}
                            >
                              <span className="text-xs font-semibold text-white">
                                {activityPercent.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Section 3: Adoption Trends Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Adoption Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={(() => {
                    const months = aiToolsData.claudeEnterprise.monthlyTrend.map(m => m.monthLabel);
                    return months.map((month) => ({
                      month,
                      m365: aiToolsData.m365Copilot.monthlyTrend.find(m => m.monthLabel === month)?.users || 0,
                      claudeEnterprise: aiToolsData.claudeEnterprise.monthlyTrend.find(m => m.monthLabel === month)?.users || 0,
                      githubCopilot: aiToolsData.githubCopilot.monthlyTrend?.find(m => m.monthLabel === month)?.users || 0,
                      claudeCode: aiToolsData.claudeCode.monthlyTrend.find(m => m.monthLabel === month)?.users || 0
                    }));
                  })()}>
                    <defs>
                      <linearGradient id="colorM365" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e40af" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1e40af" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorClaudeEnterprise" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorGithubCopilot" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorClaudeCode" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Active Users', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="m365" stroke="#1e40af" fillOpacity={1} fill="url(#colorM365)" name="M365 Copilot" strokeWidth={2} />
                    <Area type="monotone" dataKey="claudeEnterprise" stroke="#d97706" fillOpacity={1} fill="url(#colorClaudeEnterprise)" name="Claude Enterprise" strokeWidth={2} />
                    <Area type="monotone" dataKey="githubCopilot" stroke="#059669" fillOpacity={1} fill="url(#colorGithubCopilot)" name="GitHub Copilot" strokeWidth={2} />
                    <Area type="monotone" dataKey="claudeCode" stroke="#7c3aed" fillOpacity={1} fill="url(#colorClaudeCode)" name="Claude Code" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Section 4: Department Adoption Heatmap (Cross-Tool) */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Adoption Heatmap (All Tools)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left p-2 text-sm font-semibold text-gray-700">Department</th>
                        <th className="text-right p-2 text-sm font-semibold text-gray-700">Total Employees</th>
                        <th className="text-right p-2 text-sm font-semibold text-gray-700">Active Seats</th>
                        <th className="text-right p-2 text-sm font-semibold text-gray-700">Seats/Employee</th>
                        <th className="text-right p-2 text-sm font-semibold text-gray-700">Total Activity</th>
                        <th className="text-right p-2 text-sm font-semibold text-gray-700">Activity/Seat</th>
                        <th className="text-right p-2 text-sm font-semibold text-gray-700">Adoption Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Department headcounts from org hierarchy
                        const deptHeadcounts = {
                          "Agentic AI": 6,
                          "Customer Success": 42,
                          "Professional Services": 39,
                          "Executive": 1,
                          "Finance": 6,
                          "Legal": 1,
                          "Marketing": 22,
                          "Operations": 6,
                          "Human Resources": 7,
                          "Product": 17,
                          "IT": 1,
                          "Sales - Enterprise": 10,
                          "Sales - Large Market": 10,
                          "Partnerships": 2,
                          "Revenue Operations": 3,
                          "Engineering": 77
                        };

                        // Aggregate department data from ALL tools (including GitHub Copilot)
                        const deptMap = {};

                        // Add Claude Enterprise data
                        aiToolsData.claudeEnterprise.departmentBreakdown.forEach(dept => {
                          if (!deptMap[dept.department]) {
                            deptMap[dept.department] = { users: 0, activity: 0 };
                          }
                          deptMap[dept.department].users += dept.users;
                          deptMap[dept.department].activity += dept.messages;
                        });

                        // Add M365 Copilot data (latest month)
                        const m365LatestMonth = aiToolsData.m365Copilot.monthlyTrend[aiToolsData.m365Copilot.monthlyTrend.length - 1];
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
                        const claudeCodeLatestMonth = aiToolsData.claudeCode.monthlyTrend[aiToolsData.claudeCode.monthlyTrend.length - 1];
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
                        const githubLatestMonth = aiToolsData.githubCopilot.monthlyTrend?.[aiToolsData.githubCopilot.monthlyTrend.length - 1];
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
                          return index / sortedArray.length;
                        };

                        // Calculate composite adoption score (0-100) for each department
                        const deptWithScores = deptArray.map(dept => {
                          // Factor 1: Employee Coverage (0-30 points)
                          // What % of employees are using AI tools
                          const coverageScore = Math.min((dept.users / dept.employees) * 30, 30);

                          // Factor 2: Multi-Tool Usage (0-25 points)
                          // Seats per employee - rewards multiple tool usage
                          const multiToolScore = Math.min(Math.max((dept.seatsPerEmployee - 0.5) * 16.67, 0), 25);

                          // Factor 3: Activity Intensity (0-25 points)
                          // Activity per seat compared to other departments
                          const percentileActivityPerSeat = getPercentile(dept.activityPerSeat, activityPerSeatValues);
                          const intensityScore = percentileActivityPerSeat * 25;

                          // Factor 4: Total Impact (0-20 points)
                          // Total activity per employee compared to other departments
                          const percentileActivityPerEmployee = getPercentile(dept.activityPerEmployee, activityPerEmployeeValues);
                          const impactScore = percentileActivityPerEmployee * 20;

                          const totalScore = coverageScore + multiToolScore + intensityScore + impactScore;

                          return {
                            ...dept,
                            adoptionScore: Math.round(totalScore)
                          };
                        });

                        return deptWithScores
                          .sort((a, b) => b.adoptionScore - a.adoptionScore)
                          .map((dept, idx) => {
                            // Color based on total adoption score
                            const bgColor = dept.adoptionScore >= 80 ? 'bg-green-50' :
                                           dept.adoptionScore >= 60 ? 'bg-yellow-50' :
                                           'bg-red-50';
                            const scoreColor = dept.adoptionScore >= 80 ? 'text-green-700 font-bold' :
                                              dept.adoptionScore >= 60 ? 'text-yellow-700 font-semibold' :
                                              'text-red-700';

                            return (
                              <tr key={idx} className={`border-b border-gray-200 ${bgColor}`}>
                                <td className="p-2 text-sm font-medium text-gray-900">{dept.department}</td>
                                <td className="p-2 text-sm text-gray-700 text-right">{dept.employees}</td>
                                <td className="p-2 text-sm text-gray-700 text-right">{dept.users}</td>
                                <td className="p-2 text-sm text-gray-700 text-right">{dept.seatsPerEmployee.toFixed(2)}</td>
                                <td className="p-2 text-sm text-gray-700 text-right">{dept.activity.toLocaleString()}</td>
                                <td className="p-2 text-sm text-gray-700 text-right">{Math.round(dept.activityPerSeat).toLocaleString()}</td>
                                <td className={`p-2 text-sm text-right ${scoreColor}`}>{dept.adoptionScore}</td>
                              </tr>
                            );
                          });
                      })()}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Scoring Methodology</h4>
                    <p className="text-xs text-gray-700 mb-2">
                      <strong>Adoption Score (0-100)</strong> is calculated from 4 factors:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1 ml-4">
                      <li><strong>Employee Coverage (30 pts):</strong> % of department using AI tools (rewards broad adoption)</li>
                      <li><strong>Multi-Tool Usage (25 pts):</strong> Avg tools per employee (rewards creative multi-tool workflows)</li>
                      <li><strong>Activity Intensity (25 pts):</strong> Activity per seat vs other departments (rewards high engagement)</li>
                      <li><strong>Total Impact (20 pts):</strong> Total activity per employee vs others (rewards departmental productivity)</li>
                    </ul>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-xs font-semibold text-green-800">🟢 Excellent (80-100)</p>
                      <p className="text-xs text-green-700 mt-1">Full adoption, high utilization, creative multi-tool usage</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <p className="text-xs font-semibold text-yellow-800">🟡 Good (60-79)</p>
                      <p className="text-xs text-yellow-700 mt-1">Solid coverage, room for optimization</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <p className="text-xs font-semibold text-red-800">🔴 Low (0-59)</p>
                      <p className="text-xs text-red-700 mt-1">Limited adoption, needs enablement</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    Aggregates users and activity across <strong>Claude Enterprise</strong> (messages), <strong>M365 Copilot</strong> (prompts), <strong>Claude Code</strong> (lines), and <strong>GitHub Copilot</strong> (lines). Sorted by adoption score (high to low).
                  </p>
                </div>

                {/* Key Insights: Department Adoption Analysis */}
                {aiToolsData.insights?.departmentAdoptionHeatmap && (
                  <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">🔍 Key Insights: Department Adoption Patterns</h4>
                    <div className="prose prose-sm max-w-none text-gray-800">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h3 className="text-base font-bold text-gray-900 mt-4 mb-2" {...props} />,
                          h2: ({node, ...props}) => <h4 className="text-sm font-semibold text-gray-900 mt-3 mb-2" {...props} />,
                          h3: ({node, ...props}) => <h5 className="text-sm font-medium text-gray-900 mt-2 mb-1" {...props} />,
                          p: ({node, ...props}) => <p className="text-sm text-gray-800 leading-relaxed mb-3" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside text-sm text-gray-800 space-y-1 mb-3" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside text-sm text-gray-800 space-y-1 mb-3" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />
                        }}
                      >
                        {aiToolsData.insights.departmentAdoptionHeatmap}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 5: AI-Powered Insights */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
                <div className="space-y-4">
                  {(() => {
                    // Transform insights object into array with priority insights first
                    const priorityKeys = ['adoptionTrend', 'productivityComparison', 'engagementTrend'];
                    const insights = priorityKeys
                      .filter(key => aiToolsData.insights[key])
                      .map(key => ({
                        key,
                        title: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim(),
                        description: aiToolsData.insights[key],
                        impact: key === 'adoptionTrend' ? 'high' : key === 'productivityComparison' ? 'high' : 'medium'
                      }));

                    return insights.slice(0, 3).map((insight, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 ${
                          insight.impact === 'high' ? 'border-red-500 bg-red-50' :
                          insight.impact === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                          'border-blue-500 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            insight.impact === 'high' ? 'bg-red-200 text-red-800' :
                            insight.impact === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {insight.impact.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{insight.description}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Section 6: Quick Actions Bar */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('claude-enterprise')}
                    className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-lg transition-all hover:scale-105"
                  >
                    <MessageSquare className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Claude Enterprise</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('m365')}
                    className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-lg transition-all hover:scale-105"
                  >
                    <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">M365 Copilot</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('expansion')}
                    className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-lg transition-all hover:scale-105"
                  >
                    <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Claude Expansion ROI</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('briefing-leadership')}
                    className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-lg transition-all hover:scale-105"
                  >
                    <FileText className="w-8 h-8 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Briefings</span>
                  </button>
                </div>
              </div>
    </div>
  );
}
