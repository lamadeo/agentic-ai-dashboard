import React from 'react';
import { ResponsiveContainer, AreaChart, BarChart, PieChart, ComposedChart, Area, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Code, AlertCircle, Target } from 'lucide-react';
import MetricCard from '../shared/MetricCard';
import MarkdownRenderer from '../shared/MarkdownRenderer';

/**
 * CodingToolsComparison Tab Component
 *
 * Displays comprehensive comparison between GitHub Copilot and Claude Code,
 * including productivity metrics, adoption rates, model preferences, cost analysis,
 * and department-level code generation trends.
 *
 * @param {Object} props - Component props
 * @param {Object} props.aiToolsData - Complete AI tools data from ai-tools-data.json
 * @returns {JSX.Element} CodingToolsComparison tab content
 */
export default function CodingToolsComparison({ aiToolsData }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Coding Tools Comparison</h3>
        <p className="text-gray-600">GitHub Copilot vs Claude Code productivity and usage analysis</p>
      </div>

      {/* Key Metrics Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="GitHub Copilot Users"
          value={aiToolsData.githubCopilot.activeUsers}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Claude Code Users"
          value={aiToolsData.claudeCode.activeUsers}
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Productivity Advantage"
          value={`${aiToolsData.codingProductivityMultiplier}x`}
          icon={TrendingUp}
          color="green"
          changeLabel="Claude Code vs GitHub Copilot"
        />
      </div>

      {/* Agentic FTE Comparison */}
      {aiToolsData.agenticFTEs?.monthlyTrend && (
        <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-lg shadow-md p-6 border border-orange-100">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Code className="w-5 h-5 text-orange-600" />
              Agentic FTE Impact Comparison
            </h4>
            <p className="text-sm text-gray-600">
              Equivalent full-time employees added through coding tools (Claude Code vs GitHub Copilot)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Comparison Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg p-4 shadow-sm">
              <h5 className="text-sm font-semibold text-gray-700 mb-4">Agentic FTEs Over Time</h5>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={aiToolsData.agenticFTEs.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorCCCompare" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGHCompare" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
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
                    labelStyle={{ fontWeight: 600, color: '#111827' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="breakdown.claudeCode"
                    stroke="#F97316"
                    strokeWidth={2}
                    fill="url(#colorCCCompare)"
                    name="Claude Code"
                  />
                  <Area
                    type="monotone"
                    dataKey="breakdown.githubCopilot"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#colorGHCompare)"
                    name="GitHub Copilot"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Current Month Comparison */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h5 className="text-sm font-semibold text-gray-700 mb-4">
                Current Month ({aiToolsData.agenticFTEs.monthlyTrend[aiToolsData.agenticFTEs.monthlyTrend.length - 1]?.monthLabel || 'Current'})
              </h5>
              {(() => {
                const latestMonth = aiToolsData.agenticFTEs.monthlyTrend[aiToolsData.agenticFTEs.monthlyTrend.length - 1];
                const ccFTEs = latestMonth?.breakdown?.claudeCode || 0;
                const ghFTEs = latestMonth?.breakdown?.githubCopilot || 0;
                const ccData = latestMonth?.claudeCode;
                const ghData = latestMonth?.githubCopilot;

                return (
                  <div className="space-y-4">
                    {/* Claude Code */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Claude Code</span>
                        <span className="text-lg font-bold text-orange-600">{ccFTEs.toFixed(1)} FTEs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(ccFTEs / (ccFTEs + ghFTEs) * 100).toFixed(1)}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {ccData?.lines.toLocaleString()} lines • {ccData?.users || 0} users
                      </div>
                    </div>

                    {/* GitHub Copilot */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">GitHub Copilot</span>
                        <span className="text-lg font-bold text-green-600">{ghFTEs.toFixed(1)} FTEs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(ghFTEs / (ccFTEs + ghFTEs) * 100).toFixed(1)}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {ghData?.lines.toLocaleString()} lines • {ghData?.users || 0} users
                      </div>
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-900">Combined Total</span>
                        <span className="text-xl font-bold text-gray-900">
                          {(ccFTEs + ghFTEs).toFixed(1)} FTEs
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Coding tools contribution
                      </div>
                    </div>

                    {/* Efficiency Comparison */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Lines per Agentic FTE</div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>CC: {ccFTEs > 0 ? Math.round(ccData?.lines / ccFTEs).toLocaleString() : '0'} lines/FTE</div>
                        <div>GH: {ghFTEs > 0 ? Math.round(ghData?.lines / ghFTEs).toLocaleString() : '0'} lines/FTE</div>
                      </div>
                    </div>

                    {/* Productivity Multiplier */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Productivity Advantage</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-orange-600">
                          {ccFTEs > 0 && ghFTEs > 0 ? (ccFTEs / ghFTEs).toFixed(1) : '0.0'}x
                        </span>
                        <span className="text-xs text-gray-500">Claude Code vs GitHub</span>
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
                <span className="font-semibold">Calculation:</span> Agentic FTEs represent equivalent full-time employees
                added through AI coding tools. Calculation: Lines Generated × 0.08 hrs/line / 173 hrs per FTE.
                Based on 12.5 lines/hr manual coding baseline (5 minutes saved per AI-generated line).
              </div>
            </div>
          </div>

          {/* Key Insights - Agentic FTE Impact */}
          {aiToolsData.insights?.virtualFteImpact && (
            <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2 text-amber-600" />
                Key Insights
              </h4>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <MarkdownRenderer content={aiToolsData.insights.virtualFteImpact} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Engineering Adoption Metrics */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md border border-blue-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Engineering Organization Adoption</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">GitHub Copilot</p>
              <div className="text-2xl">👨‍💻</div>
            </div>
            <p className="text-3xl font-bold text-blue-600">{aiToolsData.githubCopilot.engineeringAdoptionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">{aiToolsData.githubCopilot.activeUsers} active of {aiToolsData.githubCopilot.totalEngineeringEmployees} total</p>
            <p className="text-[10px] text-gray-400">Engineering + Agentic AI</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Claude Code</p>
              <div className="text-2xl">🚀</div>
            </div>
            <p className="text-3xl font-bold text-purple-600">{aiToolsData.claudeCode.engineeringAdoptionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">{aiToolsData.claudeCode.activeUsers} active of {aiToolsData.claudeCode.totalEngineeringEmployees} total</p>
            <p className="text-[10px] text-gray-400">{aiToolsData.claudeCode.licensedUsers} licensed • Engineering + Agentic AI</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Combined Adoption</p>
              <div className="text-2xl">✨</div>
            </div>
            <p className="text-3xl font-bold text-green-600">{aiToolsData.claudeCode.combinedCodingToolsAdoption}%</p>
            <p className="text-xs text-gray-500 mt-1">{aiToolsData.claudeCode.combinedCodingToolsUsers} engineers using AI coding tools</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Combined adoption represents the percentage of Engineering + Agentic AI employees ({aiToolsData.claudeCode.totalEngineeringEmployees} total) using either GitHub Copilot, Claude Code, or both for AI-assisted coding. This shows {aiToolsData.claudeCode.combinedCodingToolsAdoption}% of engineers are actively leveraging AI coding assistants.
          </p>
        </div>
      </div>

      {/* Total Lines of Code Over Time */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Total Lines of Code Generated Over Time (Monthly)</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={(() => {
              // Merge GitHub Copilot and Claude Code monthly data
              const dataMap = new Map();

              // Add GitHub Copilot monthly data
              aiToolsData.githubCopilot.monthlyTrend.forEach(m => {
                dataMap.set(m.month, {
                  month: m.month,
                  monthLabel: m.monthLabel,
                  copilotLines: m.totalLines,
                  claudeCodeLines: null
                });
              });

              // Add Claude Code monthly data
              aiToolsData.claudeCode.monthlyTrend.forEach(m => {
                if (dataMap.has(m.month)) {
                  dataMap.get(m.month).claudeCodeLines = m.totalLines;
                } else {
                  dataMap.set(m.month, {
                    month: m.month,
                    monthLabel: m.monthLabel,
                    copilotLines: null,
                    claudeCodeLines: m.totalLines
                  });
                }
              });

              return Array.from(dataMap.values()).sort((a, b) => a.month.localeCompare(b.month));
            })()}>
              <defs>
                <linearGradient id="colorCopilotLines" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClaudeCodeLines" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis label={{ value: 'Lines of Code', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => value ? value.toLocaleString() : 'N/A'} />
              <Legend />
              <Area
                type="monotone"
                dataKey="copilotLines"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorCopilotLines)"
                name="GitHub Copilot"
                connectNulls={true}
              />
              <Area
                type="monotone"
                dataKey="claudeCodeLines"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorClaudeCodeLines)"
                name="Claude Code"
                connectNulls={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Key Insight:</strong> {aiToolsData.insights?.codingToolsBusinessQuestion || `Track the total code generation volume across both tools to understand overall productivity impact and adoption patterns.`}
          </p>
        </div>
      </div>

      {/* Lines of Code Comparison */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Lines of Code Generated Per User</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { tool: 'GitHub Copilot', linesPerUser: aiToolsData.githubCopilot.linesPerUser, fill: '#3b82f6' },
              { tool: 'Claude Code', linesPerUser: aiToolsData.claudeCode.linesPerUser, fill: '#8b5cf6' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tool" />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Bar dataKey="linesPerUser" fill="#8b5cf6">
                {[0, 1].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Key Insight:</strong> {aiToolsData.insights?.productivityComparison || `Claude Code users generate **${aiToolsData.codingProductivityMultiplier}x more lines of code** per user compared to GitHub Copilot (${aiToolsData.claudeCode.linesPerUser.toLocaleString()} vs ${aiToolsData.githubCopilot.linesPerUser.toLocaleString()} lines/user).`}
          </p>
        </div>
      </div>

      {/* Lines Per User Trend Over Time */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Lines Per User Trend Over Time (Monthly)</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={(() => {
              // Merge GitHub Copilot and Claude Code monthly data
              const dataMap = new Map();

              // Add GitHub Copilot monthly data
              aiToolsData.githubCopilot.monthlyTrend.forEach(m => {
                dataMap.set(m.month, {
                  month: m.month,
                  monthLabel: m.monthLabel,
                  githubCopilot: m.linesPerUser,
                  claudeCode: null
                });
              });

              // Add Claude Code monthly data
              aiToolsData.claudeCode.monthlyTrend.forEach(m => {
                if (dataMap.has(m.month)) {
                  dataMap.get(m.month).claudeCode = m.linesPerUser;
                } else {
                  dataMap.set(m.month, {
                    month: m.month,
                    monthLabel: m.monthLabel,
                    githubCopilot: null,
                    claudeCode: m.linesPerUser
                  });
                }
              });

              return Array.from(dataMap.values()).sort((a, b) => a.month.localeCompare(b.month));
            })()}>
              <defs>
                <linearGradient id="colorGithubCopilotLines" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClaudeCodeTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis label={{ value: 'Lines per User', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => value ? value.toLocaleString() : 'N/A'} />
              <Legend />
              <Area
                type="monotone"
                dataKey="githubCopilot"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorGithubCopilotLines)"
                name="GitHub Copilot"
                connectNulls={true}
              />
              <Area
                type="monotone"
                dataKey="claudeCode"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorClaudeCodeTrend)"
                name="Claude Code"
                connectNulls={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Trend Analysis:</strong> {aiToolsData.insights?.linesPerUserTrend || `Both tools show monthly productivity trends, with Claude Code maintaining consistently higher lines per user compared to GitHub Copilot across ${aiToolsData.claudeCode.monthlyTrend.length} months.`}
          </p>
        </div>
      </div>

      {/* Model Preferences in GitHub Copilot */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">GitHub Copilot: Model Preference Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aiToolsData.githubCopilot.modelPreferences}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({model, percentage}) => `${model} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {aiToolsData.githubCopilot.modelPreferences.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#8b5cf6', '#94a3b8', '#3b82f6', '#10b981'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {aiToolsData.githubCopilot.modelPreferences.map((pref, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{pref.model}</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{pref.percentage}%</div>
                  <div className="text-xs text-gray-500">{pref.lines.toLocaleString()} lines</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Key Insight:</strong> {aiToolsData.insights?.modelPreference || `Engineers choose Claude models **72% of the time** when using GitHub Copilot's multi-model choice feature, demonstrating a strong preference for Claude's code generation capabilities.`}
          </p>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Cost & ROI Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">GitHub Copilot</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Cost per user:</span>
                <span className="font-bold text-blue-900">$19/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Active users:</span>
                <span className="font-bold text-blue-900">{aiToolsData.githubCopilot.activeUsers}</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2">
                <span className="text-blue-700">Monthly cost:</span>
                <span className="font-bold text-blue-900">${(aiToolsData.githubCopilot.activeUsers * 19).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Annual cost:</span>
                <span className="font-bold text-blue-900">${(aiToolsData.githubCopilot.activeUsers * 19 * 12).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h5 className="font-semibold text-purple-900 mb-2">Claude Code Premium</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700">Cost per user:</span>
                <span className="font-bold text-purple-900">$200/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Active users:</span>
                <span className="font-bold text-purple-900">{aiToolsData.claudeCode.activeUsers}</span>
              </div>
              <div className="flex justify-between border-t border-purple-200 pt-2">
                <span className="text-purple-700">Monthly cost:</span>
                <span className="font-bold text-purple-900">${(aiToolsData.claudeCode.activeUsers * 200).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Annual cost:</span>
                <span className="font-bold text-purple-900">${(aiToolsData.claudeCode.activeUsers * 200 * 12).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Business Question:</strong> {aiToolsData.insights?.codingToolsBusinessQuestion || `With ${aiToolsData.codingProductivityMultiplier}x productivity advantage and 72% Claude preference in Copilot, should we consolidate to Claude Code? GitHub Copilot contract expires March 2026.`}
          </p>
        </div>
      </div>

      {/* Claude Code: Lines of Code by Department Over Time */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Claude Code: Lines of Code Generated by Department</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={(() => {
              // Get top 5 departments by total lines of code across all months
              const deptLineTotals = new Map();
              aiToolsData.claudeCode.monthlyTrend.forEach(m => {
                m.byDept.forEach(d => {
                  if (d.department !== 'Unknown') {
                    deptLineTotals.set(d.department, (deptLineTotals.get(d.department) || 0) + d.lines);
                  }
                });
              });

              const topDepts = Array.from(deptLineTotals.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([dept]) => dept);

              // Create monthly data points with line counts for each top department
              return aiToolsData.claudeCode.monthlyTrend.map(m => {
                const dataPoint = {
                  month: m.month,
                  monthLabel: m.monthLabel
                };
                topDepts.forEach(dept => {
                  const deptData = m.byDept.find(d => d.department === dept);
                  dataPoint[dept] = deptData?.lines || 0;
                });
                return dataPoint;
              });
            })()}>
              <defs>
                <linearGradient id="colorClaudeCodeDept1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClaudeCodeDept2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClaudeCodeDept3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClaudeCodeDept4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClaudeCodeDept5" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis label={{ value: 'Lines of Code', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              {(() => {
                // Calculate top 5 departments again for rendering
                const deptLineTotals = new Map();
                aiToolsData.claudeCode.monthlyTrend.forEach(m => {
                  m.byDept.forEach(d => {
                    if (d.department !== 'Unknown') {
                      deptLineTotals.set(d.department, (deptLineTotals.get(d.department) || 0) + d.lines);
                    }
                  });
                });

                const topDepts = Array.from(deptLineTotals.entries())
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([dept]) => dept);

                const colors = ['#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#06b6d4'];
                const gradients = ['colorClaudeCodeDept1', 'colorClaudeCodeDept2', 'colorClaudeCodeDept3', 'colorClaudeCodeDept4', 'colorClaudeCodeDept5'];

                return topDepts.map((dept, i) => (
                  <Area key={dept} type="monotone" dataKey={dept} name={dept} stroke={colors[i]} fillOpacity={1} fill={'url(#' + gradients[i] + ')'} />
                ));
              })()}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Department Code Generation Insight:</strong> AI & Data departments dominate Claude Code usage, generating over 126,000 lines of code in November 2025 alone. This concentrated adoption among technical teams demonstrates Claude Code's value for complex development work. The significant productivity (25,000+ lines per user) suggests these teams are using Claude Code for substantial feature development rather than simple code completion. Engineering teams show steady growth, indicating successful adoption beyond the early-adopter AI/Data teams.
          </p>
        </div>
      </div>
    </div>
  );
}
