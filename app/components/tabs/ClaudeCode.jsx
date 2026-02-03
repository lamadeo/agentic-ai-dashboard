import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { Users, Code, AlertCircle } from 'lucide-react';
import ClaudeCodePowerUsersTable from '../shared/ClaudeCodePowerUsersTable';
import ClaudeCodeKeyInsights from '../shared/ClaudeCodeKeyInsights';
import ClaudeCodeLowEngagementUsers from '../shared/ClaudeCodeLowEngagementUsers';

/**
 * ClaudeCode Tab Component
 *
 * Displays Claude Code usage analytics including code generation trends,
 * power user performance, department breakdowns, and success stories.
 *
 * @param {Object} props - Component props
 * @param {Object} props.aiToolsData - Complete AI tools data from ai-tools-data.json
 * @returns {JSX.Element} ClaudeCode tab content
 */
export default function ClaudeCode({ aiToolsData }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Claude Code Developer Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          {/* Licensed Users (Premium Seats) */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Licensed Users</p>
            <p className="text-3xl font-bold text-purple-600">{aiToolsData.claudeCode.licensedUsers}</p>
            <p className="text-xs text-gray-500">Premium seats</p>
          </div>

          {/* Active Users (MTD) */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Active Users</p>
            <p className="text-3xl font-bold text-blue-600">
              {(() => {
                const latestMonth = aiToolsData.claudeCode.monthlyTrend[aiToolsData.claudeCode.monthlyTrend.length - 1];
                return latestMonth ? latestMonth.users : 0;
              })()}
            </p>
            <p className="text-xs text-gray-500">
              {(() => {
                const latestMonth = aiToolsData.claudeCode.monthlyTrend[aiToolsData.claudeCode.monthlyTrend.length - 1];
                return latestMonth ? `MTD (${latestMonth.monthLabel})` : 'No data';
              })()}
            </p>
          </div>

          {/* Adoption Rate */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Adoption Rate</p>
            <p className="text-3xl font-bold text-green-600">
              {(() => {
                const latestMonth = aiToolsData.claudeCode.monthlyTrend[aiToolsData.claudeCode.monthlyTrend.length - 1];
                const activeUsers = latestMonth ? latestMonth.users : 0;
                const licensedUsers = aiToolsData.claudeCode.licensedUsers;
                return Math.round((activeUsers / licensedUsers) * 100);
              })()}%
            </p>
            <p className="text-xs text-gray-500">
              {(() => {
                const latestMonth = aiToolsData.claudeCode.monthlyTrend[aiToolsData.claudeCode.monthlyTrend.length - 1];
                return latestMonth ? `${latestMonth.users} / ${aiToolsData.claudeCode.licensedUsers}` : 'No data';
              })()}
            </p>
          </div>

          {/* Total Lines Generated */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Lines Generated</p>
            <p className="text-3xl font-bold text-indigo-600">{(aiToolsData.claudeCode.totalLines / 1000).toFixed(0)}K</p>
            <p className="text-xs text-gray-500">All time</p>
          </div>

          {/* Avg Lines/Developer */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Avg Lines/Developer</p>
            <p className="text-3xl font-bold text-orange-600">{aiToolsData.claudeCode.linesPerUser.toLocaleString()}</p>
            <p className="text-xs text-gray-500">All time average</p>
          </div>

          {/* Engineering Coverage */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Engineering Coverage</p>
            <p className="text-3xl font-bold text-teal-600">{Math.round((aiToolsData.claudeCode.licensedUsers / aiToolsData.claudeCode.totalEngineeringEmployees) * 100)}%</p>
            <p className="text-xs text-gray-500">{aiToolsData.claudeCode.licensedUsers} of {aiToolsData.claudeCode.totalEngineeringEmployees} engineers</p>
          </div>
        </div>
      </div>

      {/* Agentic FTE Impact - Claude Code */}
      {aiToolsData.agenticFTEs?.monthlyTrend && (
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg shadow-md p-6 border border-orange-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Code className="w-6 h-6 text-orange-600" />
                Claude Code Agentic FTE Impact
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Equivalent full-time employees added through Claude Code productivity
              </p>
            </div>
            {(() => {
              const latestMonthVFTE = aiToolsData.agenticFTEs.monthlyTrend[aiToolsData.agenticFTEs.monthlyTrend.length - 1];
              const previousMonthVFTE = aiToolsData.agenticFTEs.monthlyTrend.length > 1 ?
                aiToolsData.agenticFTEs.monthlyTrend[aiToolsData.agenticFTEs.monthlyTrend.length - 2] : null;
              const ccFTEs = latestMonthVFTE?.breakdown?.claudeCode || 0;
              const prevCCFTEs = previousMonthVFTE?.breakdown?.claudeCode || 0;
              const ftesChange = ccFTEs - prevCCFTEs;
              const percentChange = prevCCFTEs > 0 ? ((ftesChange / prevCCFTEs) * 100) : 0;

              return (
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">{latestMonthVFTE?.monthLabel || 'Current'}</p>
                  <div className="flex items-baseline gap-2 justify-end">
                    <p className="text-4xl font-bold text-orange-600">
                      {ccFTEs.toFixed(1)}
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
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Claude Code Agentic FTEs Over Time</h4>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={aiToolsData.agenticFTEs.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorCCFTEs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
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
                    formatter={(value) => [`${Number(value).toFixed(1)} FTEs`, 'Claude Code']}
                    labelStyle={{ fontWeight: 600, color: '#111827' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="breakdown.claudeCode"
                    stroke="#F97316"
                    strokeWidth={2}
                    fill="url(#colorCCFTEs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Metrics Breakdown */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Coding Productivity Metrics</h4>
              {(() => {
                const latestMonthVFTE = aiToolsData.agenticFTEs.monthlyTrend[aiToolsData.agenticFTEs.monthlyTrend.length - 1];
                const ccData = latestMonthVFTE?.claudeCode;
                const ccFTEs = latestMonthVFTE?.breakdown?.claudeCode || 0;

                return (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Active Developers</span>
                        <span className="text-lg font-bold text-orange-600">{ccData?.users || 0}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Developers using Claude Code this month
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Lines Generated</span>
                        <span className="text-lg font-bold text-indigo-600">
                          {(ccData?.lines || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Total lines of code generated this month
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Productive Hours Saved</span>
                        <span className="text-lg font-bold text-green-600">
                          {(ccData?.hours || 0).toLocaleString()} hrs
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Hours saved through code generation (0.08 hrs/line)
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Agentic FTEs</span>
                        <span className="text-lg font-bold text-orange-600">{ccFTEs.toFixed(1)} FTEs</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Equivalent full-time employees (173 hrs/month per FTE)
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Efficiency Ratio</span>
                        <span className="text-lg font-bold text-purple-600">
                          {ccData?.users > 0 ? (ccFTEs / ccData.users).toFixed(2) : '0.00'}x
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Agentic FTEs per active developer
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Methodology Note */}
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-700">
                <span className="font-semibold">Calculation:</span> Claude Code uses 0.08 hours per line (5 minutes saved per line
                based on 12.5 lines/hr manual coding baseline). Agentic FTEs = Lines Generated × 0.08 hrs / 173 hrs per FTE.
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Code Generation Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aiToolsData.claudeCode.monthlyTrend.map(m => ({
              month: m.monthLabel,
              users: m.users,
              lines: m.totalLines,
              avgPerUser: m.linesPerUser
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="lines" fill="#8b5cf6" name="Total Lines" />
              <Bar yAxisId="right" dataKey="users" fill="#3b82f6" name="Active Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Claude Code Power Users - Reusable Component */}
      <ClaudeCodePowerUsersTable powerUsers={aiToolsData.claudeCode.powerUsers} />

      {/* Claude Code Key Insights - Reusable Component */}
      <ClaudeCodeKeyInsights
        departmentInsight={aiToolsData.insights?.claudeCodeDepartmentPerformance}
        departmentBreakdown={aiToolsData.code?.departmentBreakdown}
        topThreeUsers={aiToolsData.claudeCode.powerUsers.slice(0, 3)}
      />

      {/* Claude Code Low Engagement Users - Reusable Component */}
      <ClaudeCodeLowEngagementUsers lowEngagementUsers={aiToolsData.claudeCode.lowEngagementUsers} />

      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Claude Code Success Stories</h3>
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Large-Scale Refactoring</h4>
            <p className="text-sm text-gray-700 mb-2">
              Roger Hampton used Claude Code to plan extraction of complex calculations module with comprehensive test generation
            </p>
            <span className="text-xs text-green-700 font-medium">Impact: Risk reduction + weeks of manual test writing saved</span>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Automated Code Review</h4>
            <p className="text-sm text-gray-700 mb-2">
              Sean Martin developed comprehensive review prompts covering security, performance, and standards compliance
            </p>
            <span className="text-xs text-green-700 font-medium">Impact: Consistent reviews + early bug detection</span>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Internal Plugin Marketplace</h4>
            <p className="text-sm text-gray-700 mb-2">
              Yassel Piloto created marketplace with Datadog operations automation and deployment analysis tools
            </p>
            <span className="text-xs text-green-700 font-medium">Impact: Team productivity multiplier + knowledge sharing</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Developer Testimonial</h3>
        <blockquote className="italic text-gray-700 mb-2">
          "We have noticed significant increase in performance and output. Claude code is a very valuable and extremely expensive tool used well it will make your life a lot easier."
        </blockquote>
        <p className="text-sm text-gray-600">— Jeff Rivero, Principal AI Architect</p>
      </div>
    </div>
  );
}
