import React from 'react';
import {
  Users, MessageSquare, TrendingUp, Award, FileText, Target, DollarSign,
  Clock, BarChart as BarChartIcon, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import MetricCard from '../shared/MetricCard';
import MarkdownRenderer from '../shared/MarkdownRenderer';

/**
 * M365Copilot Tab Component
 *
 * Comprehensive view of Microsoft 365 Copilot usage, including power users,
 * app adoption, department performance, and AI agents analytics.
 *
 * @param {Object} props
 * @param {Object} props.aiToolsData - Complete AI tools data including m365CopilotDeepDive
 * @param {string} props.latestMonthLabel - Label for the latest month
 */
const M365Copilot = ({ aiToolsData, latestMonthLabel }) => {
  if (!aiToolsData.m365CopilotDeepDive) {
    return (
      <div className="p-6">
        <p className="text-gray-500">M365 Copilot data not available</p>
      </div>
    );
  }

  const { m365CopilotDeepDive, m365Copilot, insights } = aiToolsData;

  return (
    <div className="space-y-6">
      {/* Executive Summary KPIs */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">M365 Copilot Usage Overview (since August 2025)</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <MetricCard
            title="Total Active Users"
            value={m365CopilotDeepDive.summaryMetrics.totalActiveUsers}
            changeLabel="Past 180 days (6 months)"
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Avg Prompts/Day"
            value={m365CopilotDeepDive.summaryMetrics.avgPromptsPerDay.toFixed(1)}
            changeLabel="Per active day (when user was active)"
            icon={MessageSquare}
            color="green"
          />
          <MetricCard
            title="Active Days per Week"
            value={`${m365CopilotDeepDive.summaryMetrics.avgActiveDaysPerWeek} days/week`}
            changeLabel={`${m365CopilotDeepDive.summaryMetrics.avgActiveDays} days over 180 days`}
            icon={TrendingUp}
            color="purple"
          />
          <MetricCard
            title="Most Used App"
            value={m365CopilotDeepDive.summaryMetrics.mostUsedApp}
            changeLabel={`${m365CopilotDeepDive.appAdoption[0].percent}% adoption`}
            icon={Award}
            color="indigo"
          />
          <MetricCard
            title="Content Creation (Approx.)"
            value={m365Copilot.approximateArtifacts}
            changeLabel={`${latestMonthLabel} MTD (20% × ${m365Copilot.wordExcelPowerpointAdoptionFactor}% W/E/P adoption)`}
            icon={FileText}
            color="amber"
          />
        </div>
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Methodology:</strong> {m365Copilot.artifactsNote} Focuses exclusively on Word/Excel/PowerPoint document creation.
          </p>
        </div>
      </div>

      {/* Agentic FTE Impact - M365 Copilot */}
      {aiToolsData.agenticFTEs?.monthlyTrend && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                M365 Copilot Agentic FTE Impact
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Equivalent full-time employees added through M365 Copilot productivity
              </p>
            </div>
            {(() => {
              const latestMonthVFTE = aiToolsData.agenticFTEs.monthlyTrend[aiToolsData.agenticFTEs.monthlyTrend.length - 1];
              const previousMonthVFTE = aiToolsData.agenticFTEs.monthlyTrend.length > 1 ?
                aiToolsData.agenticFTEs.monthlyTrend[aiToolsData.agenticFTEs.monthlyTrend.length - 2] : null;
              const m365FTEs = latestMonthVFTE?.breakdown?.m365Copilot || 0;
              const prevM365FTEs = previousMonthVFTE?.breakdown?.m365Copilot || 0;
              const ftesChange = m365FTEs - prevM365FTEs;
              const percentChange = prevM365FTEs > 0 ? ((ftesChange / prevM365FTEs) * 100) : 0;

              return (
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">{latestMonthVFTE?.monthLabel || 'Current'}</p>
                  <div className="flex items-baseline gap-2 justify-end">
                    <p className="text-4xl font-bold text-purple-600">
                      {m365FTEs.toFixed(1)}
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
              <h4 className="text-sm font-semibold text-gray-700 mb-4">M365 Copilot Agentic FTEs Over Time</h4>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={aiToolsData.agenticFTEs.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorM365FTEs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
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
                    formatter={(value) => [`${Number(value).toFixed(1)} FTEs`, 'M365 Copilot']}
                    labelStyle={{ fontWeight: 600, color: '#111827' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="breakdown.m365Copilot"
                    stroke="#A855F7"
                    strokeWidth={2}
                    fill="url(#colorM365FTEs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Metrics Breakdown */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Productivity Metrics</h4>
              {(() => {
                const latestMonthVFTE = aiToolsData.agenticFTEs.monthlyTrend[aiToolsData.agenticFTEs.monthlyTrend.length - 1];
                const m365Data = latestMonthVFTE?.m365Copilot;
                const m365FTEs = latestMonthVFTE?.breakdown?.m365Copilot || 0;

                return (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Active Users</span>
                        <span className="text-lg font-bold text-purple-600">{m365Data?.users || 0}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Users actively using M365 Copilot this month
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Productive Hours Saved</span>
                        <span className="text-lg font-bold text-green-600">
                          {(m365Data?.hours || 0).toLocaleString()} hrs
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Total hours saved through AI productivity
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Agentic FTEs</span>
                        <span className="text-lg font-bold text-purple-600">{m365FTEs.toFixed(1)} FTEs</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Equivalent full-time employees (173 hrs/month per FTE)
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Efficiency Ratio</span>
                        <span className="text-lg font-bold text-indigo-600">
                          {m365Data?.users > 0 ? (m365FTEs / m365Data.users).toFixed(2) : '0.00'}x
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
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-700">
                <span className="font-semibold">Calculation:</span> Uses 14% time savings baseline (Australian Government Digital.gov.au trial).
                Total monthly FTEs distributed proportionally by user engagement (prompts per day).
                Higher intensity users contribute more Agentic FTE value. Each FTE = 173 hours/month.
              </div>
            </div>
          </div>

          {/* Key Insights - Agentic FTE Impact */}
          {aiToolsData.insights?.m365VirtualFteImpact && (
            <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2 text-amber-600" />
                Key Insights
              </h4>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <MarkdownRenderer text={aiToolsData.insights.m365VirtualFteImpact} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly Growth Trends */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Growth Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={m365Copilot.monthlyTrend.map(m => ({
              month: m.monthLabel,
              activeUsers: m.users,
              prompts: m.totalPrompts,
              artifacts: Math.round((m.contentAppPrompts || 0) * 0.20 * (m365Copilot.wordExcelPowerpointAdoptionFactor / 100))
            }))}>
              <defs>
                <linearGradient id="colorM365Users" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorM365Prompts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorM365Artifacts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" label={{ value: 'Users / Artifacts', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Prompts', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorM365Users)" name="Active Users" />
              <Area yAxisId="right" type="monotone" dataKey="prompts" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorM365Prompts)" name="Prompts" />
              <Area yAxisId="left" type="monotone" dataKey="artifacts" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorM365Artifacts)" name="Artifacts Generated" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      {insights?.m365PowerUsers && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-6 w-6 mr-2 text-blue-600" />
            Key Insights
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {/* Monthly Growth Trends - Full Width */}
            {insights?.m365MonthlyGrowthTrends && (
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Monthly Growth Trends Analysis</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{insights.m365MonthlyGrowthTrends}</p>
              </div>
            )}
            {/* AI Agents Adoption - Full Width */}
            {insights?.m365AgentsAdoption && (
              <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">AI Agents Adoption Analysis (December)</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{insights.m365AgentsAdoption}</p>
              </div>
            )}
            {/* Other Insights - 2x2 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Power Users</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{insights.m365PowerUsers}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">App Adoption</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{insights.m365AppAdoption}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Department Performance</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{insights.m365DepartmentPerformance}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Opportunities</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{insights.m365Opportunities}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Power Users Table */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Power User Champions (Top 20)</h3>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Prompts</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Agentic FTE</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Active Days</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prompts/Day</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Apps Used</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {m365CopilotDeepDive.powerUsers.map((user) => (
                  <tr key={user.email} className={user.rank <= 3 ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.rank === 1 && '🥇'} {user.rank === 2 && '🥈'} {user.rank === 3 && '🥉'} {user.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">{user.totalPrompts.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{user.agenticFTE?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.activeDays}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">{user.promptsPerDay}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.appsUsed.length}/7</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* App Utilization Chart */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">App-Specific Adoption Rates</h3>
        <div className="h-80 bg-white rounded-lg shadow-md p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={m365CopilotDeepDive.appAdoption} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="app" type="category" width={150} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="percent" fill="#3b82f6" label={{ position: 'right', formatter: (val) => `${val}% (${m365CopilotDeepDive.appAdoption.find(a => a.percent === val)?.users} users)` }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Usage Intensity Distribution */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Usage Intensity Distribution</h3>
        <div className="h-80 bg-white rounded-lg shadow-md p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={m365CopilotDeepDive.intensityDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" label={{ position: 'top' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Performance Table */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Department Performance Benchmarks</h3>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Agentic FTE</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Prompts</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prompts/Day</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement Level</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {m365CopilotDeepDive.departmentPerformance.map((dept) => (
                  <tr key={dept.department}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{dept.userCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{dept.agenticFTE?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{dept.avgPrompts.toFixed(0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">{dept.avgPromptsPerDay.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        dept.engagementLevel === 'High' ? 'bg-green-100 text-green-800' :
                        dept.engagementLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {dept.engagementLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Segmentation Pie Chart */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">User Segmentation by Engagement</h3>
        <div className="h-80 bg-white rounded-lg shadow-md p-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: `Power Users (${m365CopilotDeepDive.userSegments.powerUsers.threshold})`, value: m365CopilotDeepDive.userSegments.powerUsers.count },
                  { name: `Engaged Users (${m365CopilotDeepDive.userSegments.engagedUsers.threshold})`, value: m365CopilotDeepDive.userSegments.engagedUsers.count },
                  { name: `Regular Users (${m365CopilotDeepDive.userSegments.regularUsers.threshold})`, value: m365CopilotDeepDive.userSegments.regularUsers.count },
                  { name: `Light Users (${m365CopilotDeepDive.userSegments.lightUsers.threshold})`, value: m365CopilotDeepDive.userSegments.lightUsers.count }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {[0, 1, 2, 3].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Opportunity Analysis Cards */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Opportunities for Improvement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PowerPoint Adoption Gap */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-500" />
              PowerPoint Adoption Gap
            </h4>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">{m365CopilotDeepDive.opportunities.lowPowerPointUsage.gapUsers} users</p>
              <p className="text-sm text-gray-600">Currently: {m365CopilotDeepDive.opportunities.lowPowerPointUsage.currentUsers} users</p>
              <p className="text-sm text-gray-600">Target: {m365CopilotDeepDive.opportunities.lowPowerPointUsage.targetUsers} users (Word adoption)</p>
              <p className="text-sm text-green-600 font-medium mt-2">{m365CopilotDeepDive.opportunities.lowPowerPointUsage.potentialValue}</p>
            </div>
          </div>

          {/* Inactive Licenses */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-red-500" />
              Inactive Licenses
            </h4>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">{m365CopilotDeepDive.opportunities.inactiveUsers.count} users</p>
              <p className="text-sm text-gray-600">0 prompts in 180 days</p>
              <p className="text-sm text-gray-600">Reclaimable: {m365CopilotDeepDive.opportunities.inactiveUsers.reclaimableLicenses} licenses</p>
              <p className="text-sm text-green-600 font-medium mt-2">Save ${m365CopilotDeepDive.opportunities.inactiveUsers.monthlySavings}/month</p>
            </div>
          </div>

          {/* Low Engagement Users */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-yellow-500" />
              Low Engagement
            </h4>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">{m365CopilotDeepDive.opportunities.lowEngagementUsers.count} users</p>
              <p className="text-sm text-gray-600">&lt;10 total prompts</p>
              <p className="text-sm text-gray-600">Departments: {m365CopilotDeepDive.opportunities.lowEngagementUsers.departments.join(', ')}</p>
              <p className="text-sm text-green-600 font-medium mt-2">Training opportunity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Engagement Users Detail Table */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Low Engagement Users - Enablement Targets</h3>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Prompts</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Agentic FTE</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Active Days</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prompts/Day</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {m365CopilotDeepDive.opportunities.lowEngagementUsers.users.map((user) => (
                  <tr key={user.email}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.totalPrompts}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{user.agenticFTE?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.activeDays}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.promptsPerDay.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default M365Copilot;
