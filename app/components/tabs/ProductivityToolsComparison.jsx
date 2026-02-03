import React from 'react';
import { ResponsiveContainer, AreaChart, BarChart, PieChart, ComposedChart, Area, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Users, MessageSquare, TrendingUp, FileText, DollarSign, Code, Activity, Target, AlertCircle } from 'lucide-react';
import MetricCard from '../shared/MetricCard';
import MarkdownRenderer from '../shared/MarkdownRenderer';

/**
 * ProductivityToolsComparison Tab Component
 *
 * Displays comprehensive comparison between Microsoft 365 Copilot and Claude Enterprise,
 * including adoption rates, engagement metrics, prompts per user, content generation,
 * and application-level usage breakdowns.
 *
 * @param {Object} props - Component props
 * @param {Object} props.aiToolsData - Complete AI tools data from ai-tools-data.json
 * @returns {JSX.Element} ProductivityToolsComparison tab content
 */
export default function ProductivityToolsComparison({ aiToolsData }) {
  // Get latest month label
  const latestM365Month = aiToolsData.m365Copilot.monthlyTrend[aiToolsData.m365Copilot.monthlyTrend.length - 1];
  const latestMonthLabel = latestM365Month?.monthLabel || 'Current';

  return (
    <div className="space-y-6">
      <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Productivity Tools Comparison</h3>
                  <p className="text-gray-600">Microsoft 365 Copilot vs Claude Enterprise adoption and engagement analysis</p>
                </div>

                {/* Key Metrics Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <MetricCard
                    title="M365 Copilot Active Users % (MTD)"
                    value={(() => {
                      const latestMonth = aiToolsData.m365Copilot.monthlyTrend[aiToolsData.m365Copilot.monthlyTrend.length - 1];
                      const mtdUsers = latestMonth.users;
                      return `${Math.round((mtdUsers / aiToolsData.m365Copilot.licensedUsers) * 100)}%`;
                    })()}
                    icon={Users}
                    color="blue"
                    changeLabel={(() => {
                      const latestMonth = aiToolsData.m365Copilot.monthlyTrend[aiToolsData.m365Copilot.monthlyTrend.length - 1];
                      return `${latestMonth.users} active users in ${latestMonth.monthLabel}`;
                    })()}
                  />
                  <MetricCard
                    title="Claude Enterprise Active Users % (MTD)"
                    value={(() => {
                      const latestMonth = aiToolsData.claudeEnterprise.monthlyTrend[aiToolsData.claudeEnterprise.monthlyTrend.length - 1];
                      const mtdUsers = latestMonth.users;
                      return `${Math.round((mtdUsers / aiToolsData.claudeEnterprise.licensedUsers) * 100)}%`;
                    })()}
                    icon={Users}
                    color="purple"
                    changeLabel={(() => {
                      const latestMonth = aiToolsData.claudeEnterprise.monthlyTrend[aiToolsData.claudeEnterprise.monthlyTrend.length - 1];
                      return `${latestMonth.users} active users in ${latestMonth.monthLabel}`;
                    })()}
                  />
                  <MetricCard
                    title="M365 Prompts/User (MTD Average)"
                    value={(() => {
                      const latestMonth = aiToolsData.m365Copilot.monthlyTrend[aiToolsData.m365Copilot.monthlyTrend.length - 1];
                      return latestMonth.promptsPerUser;
                    })()}
                    icon={MessageSquare}
                    color="indigo"
                    changeLabel={(() => {
                      const latestMonth = aiToolsData.m365Copilot.monthlyTrend[aiToolsData.m365Copilot.monthlyTrend.length - 1];
                      return `${latestMonth.monthLabel} ${latestMonth.isPartial ? '(partial)' : ''}`;
                    })()}
                  />
                  <MetricCard
                    title="Claude Prompts/User (MTD Average)"
                    value={(() => {
                      const latestMonth = aiToolsData.claudeEnterprise.monthlyTrend[aiToolsData.claudeEnterprise.monthlyTrend.length - 1];
                      return latestMonth.messagesPerUser;
                    })()}
                    icon={MessageSquare}
                    color="purple"
                    changeLabel={(() => {
                      const latestMonth = aiToolsData.claudeEnterprise.monthlyTrend[aiToolsData.claudeEnterprise.monthlyTrend.length - 1];
                      return latestMonth.monthLabel;
                    })()}
                  />
                </div>

                {/* Agentic FTE Comparison */}
                {aiToolsData.agenticFTEs?.monthlyTrend && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md p-6 border border-blue-100">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Agentic FTE Impact Comparison</h4>
                      <p className="text-sm text-gray-600">
                        Equivalent full-time employees added through productivity tools (Claude Enterprise vs M365 Copilot)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Comparison Chart */}
                      <div className="lg:col-span-2 bg-white rounded-lg p-4 shadow-sm">
                        <h5 className="text-sm font-semibold text-gray-700 mb-4">Agentic FTEs Over Time</h5>
                        <ResponsiveContainer width="100%" height={300}>
                          <ComposedChart data={aiToolsData.agenticFTEs.monthlyTrend}>
                            <defs>
                              <linearGradient id="colorCECompare" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorM365Compare" x1="0" y1="0" x2="0" y2="1">
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
                              labelStyle={{ fontWeight: 600, color: '#111827' }}
                            />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="breakdown.claudeEnterprise"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              fill="url(#colorCECompare)"
                              name="Claude Enterprise"
                            />
                            <Area
                              type="monotone"
                              dataKey="breakdown.m365Copilot"
                              stroke="#A855F7"
                              strokeWidth={2}
                              fill="url(#colorM365Compare)"
                              name="M365 Copilot"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Current Month Comparison */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h5 className="text-sm font-semibold text-gray-700 mb-4">Current Month ({latestMonthLabel})</h5>
                        {(() => {
                          const latestMonth = aiToolsData.agenticFTEs.monthlyTrend[aiToolsData.agenticFTEs.monthlyTrend.length - 1];
                          const ceFTEs = latestMonth?.breakdown?.claudeEnterprise || 0;
                          const m365FTEs = latestMonth?.breakdown?.m365Copilot || 0;
                          const ceUsers = latestMonth?.claudeEnterprise?.users || 0;
                          const m365Users = latestMonth?.m365Copilot?.users || 0;

                          return (
                            <div className="space-y-4">
                              {/* Claude Enterprise */}
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-600">Claude Enterprise</span>
                                  <span className="text-lg font-bold text-blue-600">{ceFTEs.toFixed(1)} FTEs</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${(ceFTEs / (ceFTEs + m365FTEs) * 100).toFixed(1)}%`
                                    }}
                                  />
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {ceUsers} users • {(ceFTEs / ceUsers).toFixed(2)}x efficiency
                                </div>
                              </div>

                              {/* M365 Copilot */}
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-600">M365 Copilot</span>
                                  <span className="text-lg font-bold text-purple-600">{m365FTEs.toFixed(1)} FTEs</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${(m365FTEs / (ceFTEs + m365FTEs) * 100).toFixed(1)}%`
                                    }}
                                  />
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {m365Users} users • {(m365FTEs / m365Users).toFixed(2)}x efficiency
                                </div>
                              </div>

                              {/* Total */}
                              <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-gray-900">Combined Total</span>
                                  <span className="text-xl font-bold text-gray-900">
                                    {(ceFTEs + m365FTEs).toFixed(1)} FTEs
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Productivity tools contribution
                                </div>
                              </div>

                              {/* Efficiency Comparison */}
                              <div className="pt-4 border-t border-gray-200">
                                <div className="text-sm font-semibold text-gray-700 mb-2">Efficiency Ratio</div>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div>CE: {ceUsers > 0 ? (ceFTEs / ceUsers).toFixed(2) : '0.00'}x FTEs/user</div>
                                  <div>M365: {m365Users > 0 ? (m365FTEs / m365Users).toFixed(2) : '0.00'}x FTEs/user</div>
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
                          <span className="font-semibold">Calculation:</span> Agentic FTEs represent equivalent full-time employees
                          added through AI productivity. Claude Enterprise uses 28% time savings, M365 Copilot uses 14% time savings
                          (from research studies). One FTE = 173 hours/month.
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
                            <MarkdownRenderer text={aiToolsData.insights.virtualFteImpact} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Artifacts Comparison */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md border border-purple-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Content Creation: Artifacts Generated ({latestMonthLabel} MTD)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Claude Enterprise</p>
                          <p className="text-xs text-gray-500">Actual artifacts generated ({latestMonthLabel} MTD)</p>
                        </div>
                        <div className="text-3xl">📄</div>
                      </div>
                      <p className="text-4xl font-bold text-purple-600">{(() => {
                        const latestMonth = aiToolsData.claudeEnterprise.monthlyTrend[aiToolsData.claudeEnterprise.monthlyTrend.length - 1];
                        return latestMonth.artifacts.toLocaleString();
                      })()}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Artifacts created by AI (code, documents, etc.)
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">M365 Copilot</p>
                          <p className="text-xs text-gray-500">Approximate content creation ({latestMonthLabel} MTD)</p>
                        </div>
                        <div className="text-3xl">📊</div>
                      </div>
                      <p className="text-4xl font-bold text-blue-600">{aiToolsData.m365Copilot.approximateArtifacts.toLocaleString()}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        20% conversion × {aiToolsData.m365Copilot.wordExcelPowerpointAdoptionFactor}% W/E/P adoption (excludes Chat/Teams/Outlook)
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Methodology:</strong> {aiToolsData.m365Copilot.artifactsNote} Uses Word/Excel/PowerPoint adoption rates to filter out Teams and Outlook communication prompts.
                    </p>
                  </div>
                </div>

                {/* Total Messages/Prompts Over Time */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Total Messages/Prompts Over Time</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={(() => {
                        // Merge Claude Enterprise and M365 monthly data
                        const dataMap = new Map();

                        // Add M365 monthly data
                        aiToolsData.m365Copilot.monthlyTrend.forEach(m => {
                          dataMap.set(m.month, {
                            month: m.month,
                            monthLabel: m.monthLabel,
                            m365Prompts: m.totalPrompts,
                            claudeMessages: null
                          });
                        });

                        // Add/merge Claude Enterprise monthly data
                        aiToolsData.claudeEnterprise.monthlyTrend.forEach(m => {
                          if (dataMap.has(m.month)) {
                            dataMap.get(m.month).claudeMessages = m.messages;
                          } else {
                            dataMap.set(m.month, {
                              month: m.month,
                              monthLabel: m.monthLabel,
                              m365Prompts: null,
                              claudeMessages: m.messages
                            });
                          }
                        });

                        return Array.from(dataMap.values()).sort((a, b) => a.month.localeCompare(b.month));
                      })()}>
                        <defs>
                          <linearGradient id="colorClaudeMessages" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorM365Prompts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthLabel" />
                        <YAxis label={{ value: 'Messages/Prompts', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => value ? value.toLocaleString() : 'N/A'} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="claudeMessages"
                          stroke="#8b5cf6"
                          fillOpacity={1}
                          fill="url(#colorClaudeMessages)"
                          name="Claude Enterprise"
                          connectNulls={true}
                        />
                        <Area
                          type="monotone"
                          dataKey="m365Prompts"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorM365Prompts)"
                          name="M365 Copilot"
                          connectNulls={true}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>Key Insight:</strong> {aiToolsData.insights?.strategicPositioning || `Monitor the total engagement volume across both productivity tools to identify usage patterns and strategic positioning opportunities.`}
                    </p>
                  </div>
                </div>

                {/* Adoption Trend (Active Users) */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Adoption Trend: Active Users Over Time</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={(() => {
                        // Merge M365 and Claude data by month to avoid duplicate labels
                        const mergedData = new Map();

                        // Add M365 data
                        aiToolsData.m365Copilot.monthlyTrend.forEach(m => {
                          mergedData.set(m.month, {
                            month: m.month,
                            monthLabel: m.monthLabel,
                            m365Users: m.users,
                            claudeUsers: null
                          });
                        });

                        // Add/merge Claude data
                        aiToolsData.claudeEnterprise.monthlyTrend.forEach(m => {
                          if (mergedData.has(m.month)) {
                            mergedData.get(m.month).claudeUsers = m.users;
                          } else {
                            mergedData.set(m.month, {
                              month: m.month,
                              monthLabel: m.monthLabel,
                              m365Users: null,
                              claudeUsers: m.users
                            });
                          }
                        });

                        // Convert to array and sort by month
                        return Array.from(mergedData.values()).sort((a, b) => a.month.localeCompare(b.month));
                      })()}>
                        <defs>
                          <linearGradient id="colorM365Users" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorClaudeUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthLabel" />
                        <YAxis label={{ value: 'Active Users', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => value ? value.toLocaleString() : 'N/A'} />
                        <Legend />
                        <Area type="monotone" dataKey="m365Users" name="M365 Copilot" stroke="#3b82f6" fillOpacity={1} fill="url(#colorM365Users)" connectNulls />
                        <Area type="monotone" dataKey="claudeUsers" name="Claude Enterprise" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorClaudeUsers)" connectNulls />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Adoption Insight:</strong> {aiToolsData.insights?.adoptionTrend || `M365 Copilot has broader organizational reach (${aiToolsData.m365Copilot.activeUsers} active users with org-wide access), while Claude Enterprise has focused adoption (${aiToolsData.claudeEnterprise.activeUsers} licensed users).`}
                    </p>
                  </div>
                </div>

                {/* Engagement Trend (Prompts/Messages) */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trend: Prompts/Messages Per User Over Time</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={(() => {
                        // Merge M365 and Claude data by month to avoid duplicate labels
                        const mergedData = new Map();

                        // Add M365 data
                        aiToolsData.m365Copilot.monthlyTrend.forEach(m => {
                          mergedData.set(m.month, {
                            period: m.month,
                            periodLabel: m.monthLabel,
                            m365PromptsPerUser: m.promptsPerUser,
                            claudeMessagesPerUser: null
                          });
                        });

                        // Add/merge Claude data
                        aiToolsData.claudeEnterprise.monthlyTrend.forEach(m => {
                          if (mergedData.has(m.month)) {
                            mergedData.get(m.month).claudeMessagesPerUser = m.messagesPerUser;
                          } else {
                            mergedData.set(m.month, {
                              period: m.month,
                              periodLabel: m.monthLabel,
                              m365PromptsPerUser: null,
                              claudeMessagesPerUser: m.messagesPerUser
                            });
                          }
                        });

                        // Convert to array and sort by month
                        return Array.from(mergedData.values()).sort((a, b) => a.period.localeCompare(b.period));
                      })()}>
                        <defs>
                          <linearGradient id="colorM365PromptsPerUser" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorClaudeMessagesPerUser" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="periodLabel" />
                        <YAxis label={{ value: 'Messages/Prompts per User', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => value ? value.toLocaleString() : 'N/A'} />
                        <Legend />
                        <Area type="monotone" dataKey="m365PromptsPerUser" name="M365 Prompts/User" stroke="#3b82f6" fillOpacity={1} fill="url(#colorM365PromptsPerUser)" connectNulls />
                        <Area type="monotone" dataKey="claudeMessagesPerUser" name="Claude Messages/User" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorClaudeMessagesPerUser)" connectNulls />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>Engagement Insight:</strong> {aiToolsData.insights?.engagementTrend || `M365 Copilot shows lighter engagement (${aiToolsData.m365Copilot.promptsPerUser} prompts/user avg), while Claude Enterprise demonstrates deeper engagement (${aiToolsData.claudeEnterprise.messagesPerUser} messages/user avg).`}
                    </p>
                  </div>
                </div>

                {/* M365 Copilot App Usage */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">M365 Copilot: Application Usage</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={aiToolsData.m365Copilot.appUsage} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="app" type="category" width={120} />
                          <Tooltip />
                          <Bar dataKey="users" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {aiToolsData.m365Copilot.appUsage.map((app, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{app.app}</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{app.users}</div>
                            <div className="text-xs text-gray-500">{Math.round((app.users / aiToolsData.m365Copilot.activeUsers) * 100)}% of active users</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-sm text-indigo-800">
                      <strong>Key Insight:</strong> {aiToolsData.insights?.m365AppTrend || `M365 Copilot usage is concentrated in communication tools (Teams: ${aiToolsData.m365Copilot.appUsage[0].users} users, Copilot Chat: ${aiToolsData.m365Copilot.appUsage[1].users} users, Outlook: ${aiToolsData.m365Copilot.appUsage[2].users} users) with lighter adoption in document productivity apps.`}
                    </p>
                  </div>
                </div>

                {/* M365 App Usage Trends Over Time */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">M365 Copilot: App Usage Trends Over Time</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={aiToolsData.m365Copilot.monthlyTrend.map(m => {
                        const appData = {};
                        m.appUsage.forEach(app => {
                          appData[app.app] = app.users;
                        });
                        return {
                          month: m.monthLabel,
                          ...appData
                        };
                      })}>
                        <defs>
                          <linearGradient id="colorTeams" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorCopilotChat" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorOutlook" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorWord" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExcel" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorPowerPoint" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ca8a04" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis label={{ value: 'Active Users', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="Teams" stroke="#2563eb" fillOpacity={1} fill="url(#colorTeams)" />
                        <Area type="monotone" dataKey="Copilot Chat" stroke="#7c3aed" fillOpacity={1} fill="url(#colorCopilotChat)" />
                        <Area type="monotone" dataKey="Outlook" stroke="#059669" fillOpacity={1} fill="url(#colorOutlook)" />
                        <Area type="monotone" dataKey="Word" stroke="#dc2626" fillOpacity={1} fill="url(#colorWord)" />
                        <Area type="monotone" dataKey="Excel" stroke="#ea580c" fillOpacity={1} fill="url(#colorExcel)" />
                        <Area type="monotone" dataKey="PowerPoint" stroke="#ca8a04" fillOpacity={1} fill="url(#colorPowerPoint)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Trend Analysis:</strong> {aiToolsData.insights?.m365AppTrend || `Track which M365 Copilot applications are gaining or losing adoption over time. Communication tools (Teams, Outlook, Copilot Chat) tend to show higher and more stable usage compared to document productivity apps.`}
                    </p>
                  </div>
                </div>

                {/* M365 App Usage by Department - Latest Month Snapshot */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">M365 Copilot: App Usage by Department (Latest Month)</h4>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(() => {
                        // Get latest month data
                        const latestMonth = aiToolsData.m365Copilot.monthlyTrend[aiToolsData.m365Copilot.monthlyTrend.length - 1];

                        // Get top 5 departments by total prompts
                        const deptTotals = new Map();
                        aiToolsData.m365Copilot.monthlyTrend.forEach(m => {
                          m.byDept.forEach(d => {
                            if (d.department !== 'Unknown') {
                              deptTotals.set(d.department, (deptTotals.get(d.department) || 0) + d.prompts);
                            }
                          });
                        });

                        const topDepts = Array.from(deptTotals.entries())
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([dept]) => dept);

                        // Create data structure: one object per app with department values
                        const apps = ['Copilot Chat', 'Teams', 'Outlook', 'Excel', 'Word', 'PowerPoint'];
                        return apps.map(app => {
                          const dataPoint = { app };
                          topDepts.forEach(dept => {
                            const deptData = latestMonth.appUsageByDept.find(d => d.department === dept);
                            const appData = deptData?.apps.find(a => a.app === app);
                            dataPoint[dept] = appData?.users || 0;
                          });
                          return dataPoint;
                        });
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="app" angle={-15} textAnchor="end" height={80} />
                        <YAxis label={{ value: 'Active Users', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        {(() => {
                          // Get top 5 departments
                          const deptTotals = new Map();
                          aiToolsData.m365Copilot.monthlyTrend.forEach(m => {
                            m.byDept.forEach(d => {
                              if (d.department !== 'Unknown') {
                                deptTotals.set(d.department, (deptTotals.get(d.department) || 0) + d.prompts);
                              }
                            });
                          });

                          const topDepts = Array.from(deptTotals.entries())
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([dept]) => dept);

                          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

                          return topDepts.map((dept, i) => (
                            <Bar key={dept} dataKey={dept} name={dept} fill={colors[i]} />
                          ));
                        })()}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>App Usage Insight:</strong> Copilot Chat and Teams dominate M365 Copilot usage across departments, with Customer Support and Marketing showing the highest adoption. Communication-focused apps (Teams, Outlook) see broader usage than productivity apps (Word, Excel, PowerPoint).
                    </p>
                  </div>
                </div>

                {/* M365 App Usage Trend Over Time */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">M365 Copilot: App Adoption Trend (Top 4 Apps)</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={(() => {
                        // Get monthly totals for top 4 apps across all departments
                        return aiToolsData.m365Copilot.monthlyTrend
                          .filter(m => m.month >= '2025-09') // Only Sept onwards
                          .map(m => {
                            const dataPoint = {
                              month: m.month,
                              monthLabel: m.monthLabel
                            };

                            // Aggregate users across all departments for each app
                            const appTotals = {
                              'Copilot Chat': 0,
                              'Teams': 0,
                              'Outlook': 0,
                              'Excel': 0
                            };

                            m.appUsageByDept.forEach(dept => {
                              dept.apps.forEach(app => {
                                if (appTotals.hasOwnProperty(app.app)) {
                                  appTotals[app.app] += app.users;
                                }
                              });
                            });

                            Object.entries(appTotals).forEach(([app, users]) => {
                              dataPoint[app] = users;
                            });

                            return dataPoint;
                          });
                      })()}>
                        <defs>
                          <linearGradient id="colorCopilotChat" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorTeams" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorOutlook" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExcel" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthLabel" />
                        <YAxis label={{ value: 'Active Users', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="Copilot Chat" name="Copilot Chat" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCopilotChat)" />
                        <Area type="monotone" dataKey="Teams" name="Teams" stroke="#10b981" fillOpacity={1} fill="url(#colorTeams)" />
                        <Area type="monotone" dataKey="Outlook" name="Outlook" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOutlook)" />
                        <Area type="monotone" dataKey="Excel" name="Excel" stroke="#ef4444" fillOpacity={1} fill="url(#colorExcel)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Adoption Trend Insight:</strong> M365 Copilot adoption has grown significantly from September to December 2025. Copilot Chat and Teams show the steepest growth curves, indicating strong preference for conversational AI and real-time collaboration features. Excel adoption is growing steadily, suggesting increasing use for data analysis tasks.
                    </p>
                  </div>
                </div>

                {/* Claude Enterprise Features */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Claude Enterprise: Feature Usage</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <MessageSquare className="h-8 w-8 text-purple-600" />
                        <span className="text-3xl font-bold text-purple-900">{aiToolsData.claudeEnterprise.totalConversations.toLocaleString()}</span>
                      </div>
                      <h5 className="font-semibold text-purple-900">Conversations</h5>
                      <p className="text-sm text-purple-700 mt-1">{aiToolsData.claudeEnterprise.conversationsPerUser} per user avg</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Target className="h-8 w-8 text-indigo-600" />
                        <span className="text-3xl font-bold text-indigo-900">{aiToolsData.claudeEnterprise.totalProjects.toLocaleString()}</span>
                      </div>
                      <h5 className="font-semibold text-indigo-900">Projects</h5>
                      <p className="text-sm text-indigo-700 mt-1">Organized knowledge bases</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Code className="h-8 w-8 text-blue-600" />
                        <span className="text-3xl font-bold text-blue-900">{aiToolsData.claudeEnterprise.totalArtifacts.toLocaleString()}</span>
                      </div>
                      <h5 className="font-semibold text-blue-900">Artifacts/Documents</h5>
                      <p className="text-sm text-blue-700 mt-1">Generated content & code</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>Key Insight:</strong> {aiToolsData.insights?.claudeEnterpriseFeatures || `Claude Enterprise users leverage advanced features like Projects (${aiToolsData.claudeEnterprise.totalProjects}) and Artifacts (${aiToolsData.claudeEnterprise.totalArtifacts}) for complex, structured work beyond simple prompts.`}
                    </p>
                  </div>
                </div>

                {/* Claude Enterprise Active Users by Department Over Time */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Claude Enterprise: Active Users by Department Over Time</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={(() => {
                        // Get top 5 departments for Claude Enterprise by total users across all months
                        const deptUserTotals = new Map();
                        aiToolsData.claudeEnterprise.monthlyTrend.forEach(m => {
                          m.byDept.forEach(d => {
                            if (d.department !== 'Unknown') {
                              deptUserTotals.set(d.department, (deptUserTotals.get(d.department) || 0) + d.users);
                            }
                          });
                        });

                        const topDepts = Array.from(deptUserTotals.entries())
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([dept]) => dept);

                        // Create monthly data points with user counts for each top department
                        return aiToolsData.claudeEnterprise.monthlyTrend.map(m => {
                          const dataPoint = {
                            month: m.month,
                            monthLabel: m.monthLabel
                          };
                          topDepts.forEach(dept => {
                            const deptData = m.byDept.find(d => d.department === dept);
                            dataPoint[dept] = deptData?.users || 0;
                          });
                          return dataPoint;
                        });
                      })()}>
                        <defs>
                          <linearGradient id="colorClaudeUsersDept1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorClaudeUsersDept2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorClaudeUsersDept3" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorClaudeUsersDept4" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorClaudeUsersDept5" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthLabel" />
                        <YAxis label={{ value: 'Active Users', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => value.toLocaleString()} />
                        <Legend />
                        {(() => {
                          // Calculate top 5 departments again for rendering
                          const deptUserTotals = new Map();
                          aiToolsData.claudeEnterprise.monthlyTrend.forEach(m => {
                            m.byDept.forEach(d => {
                              if (d.department !== 'Unknown') {
                                deptUserTotals.set(d.department, (deptUserTotals.get(d.department) || 0) + d.users);
                              }
                            });
                          });

                          const topDepts = Array.from(deptUserTotals.entries())
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([dept]) => dept);

                          const colors = ['#8b5cf6', '#14b8a6', '#f97316', '#dc2626', '#7c3aed'];
                          const gradients = ['colorClaudeUsersDept1', 'colorClaudeUsersDept2', 'colorClaudeUsersDept3', 'colorClaudeUsersDept4', 'colorClaudeUsersDept5'];

                          return topDepts.map((dept, i) => (
                            <Area key={dept} type="monotone" dataKey={dept} name={dept} stroke={colors[i]} fillOpacity={1} fill={'url(#' + gradients[i] + ')'} />
                          ));
                        })()}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>Active Users Insight:</strong> Claude Enterprise shows steady growth in active users across top departments from September to December 2025. Marketing and Product departments lead in user adoption, with consistent month-over-month increases. This growing user base indicates successful change management and demonstrates strong organic adoption compared to M365 Copilot's org-wide availability. The trend suggests departments are finding value in Claude Enterprise's advanced features for content creation and technical work.
                    </p>
                  </div>
                </div>

                {/* Department Usage Comparison (M365 vs Claude Enterprise) - Side by Side */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Department Usage by AI Tool (Top 5 Departments)</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* M365 Copilot by Department */}
                    <div>
                      <h5 className="text-md font-semibold text-blue-900 mb-3">M365 Copilot - Prompts by Department</h5>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={(() => {
                            // Get top 5 departments for M365 (excluding Unknown)
                            const deptTotals = new Map();
                            aiToolsData.m365Copilot.monthlyTrend.forEach(m => {
                              m.byDept.forEach(d => {
                                if (d.department !== 'Unknown') {
                                  deptTotals.set(d.department, (deptTotals.get(d.department) || 0) + d.prompts);
                                }
                              });
                            });

                            const topDepts = Array.from(deptTotals.entries())
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 5)
                              .map(([dept]) => dept);

                            // Filter to months with actual data (September onwards)
                            return aiToolsData.m365Copilot.monthlyTrend
                              .filter(m => m.month >= '2025-09')
                              .map(m => {
                                const dataPoint = {
                                  month: m.month,
                                  monthLabel: m.monthLabel
                                };
                                topDepts.forEach(dept => {
                                  const deptData = m.byDept.find(d => d.department === dept);
                                  dataPoint[dept] = deptData?.prompts || 0;
                                });
                                return dataPoint;
                              });
                          })()}>
                            <defs>
                              <linearGradient id="colorM365Dept1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorM365Dept2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorM365Dept3" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorM365Dept4" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorM365Dept5" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="monthLabel" />
                            <YAxis label={{ value: 'Prompts', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(value) => value.toLocaleString()} />
                            <Legend />
                            {(() => {
                              const deptTotals = new Map();
                              aiToolsData.m365Copilot.monthlyTrend.forEach(m => {
                                m.byDept.forEach(d => {
                                  if (d.department !== 'Unknown') {
                                    deptTotals.set(d.department, (deptTotals.get(d.department) || 0) + d.prompts);
                                  }
                                });
                              });
                              const topDepts = Array.from(deptTotals.entries())
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([dept]) => dept);

                              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                              const gradients = ['colorM365Dept1', 'colorM365Dept2', 'colorM365Dept3', 'colorM365Dept4', 'colorM365Dept5'];

                              return topDepts.map((dept, i) => (
                                <Area key={dept} type="monotone" dataKey={dept} name={dept} stroke={colors[i]} fillOpacity={1} fill={'url(#' + gradients[i] + ')'} />
                              ));
                            })()}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Claude Enterprise by Department */}
                    <div>
                      <h5 className="text-md font-semibold text-purple-900 mb-3">Claude Enterprise - Messages by Department</h5>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={(() => {
                            // Get top 5 departments for Claude (excluding Unknown)
                            const deptTotals = new Map();
                            aiToolsData.claudeEnterprise.monthlyTrend.forEach(m => {
                              m.byDept.forEach(d => {
                                if (d.department !== 'Unknown') {
                                  deptTotals.set(d.department, (deptTotals.get(d.department) || 0) + d.messages);
                                }
                              });
                            });

                            const topDepts = Array.from(deptTotals.entries())
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 5)
                              .map(([dept]) => dept);

                            return aiToolsData.claudeEnterprise.monthlyTrend.map(m => {
                              const dataPoint = {
                                month: m.month,
                                monthLabel: m.monthLabel
                              };
                              topDepts.forEach(dept => {
                                const deptData = m.byDept.find(d => d.department === dept);
                                dataPoint[dept] = deptData?.messages || 0;
                              });
                              return dataPoint;
                            });
                          })()}>
                            <defs>
                              <linearGradient id="colorClaudeDept1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorClaudeDept2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorClaudeDept3" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorClaudeDept4" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorClaudeDept5" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="monthLabel" />
                            <YAxis label={{ value: 'Messages', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(value) => value.toLocaleString()} />
                            <Legend />
                            {(() => {
                              const deptTotals = new Map();
                              aiToolsData.claudeEnterprise.monthlyTrend.forEach(m => {
                                m.byDept.forEach(d => {
                                  if (d.department !== 'Unknown') {
                                    deptTotals.set(d.department, (deptTotals.get(d.department) || 0) + d.messages);
                                  }
                                });
                              });
                              const topDepts = Array.from(deptTotals.entries())
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([dept]) => dept);

                              const colors = ['#8b5cf6', '#14b8a6', '#f97316', '#dc2626', '#7c3aed'];
                              const gradients = ['colorClaudeDept1', 'colorClaudeDept2', 'colorClaudeDept3', 'colorClaudeDept4', 'colorClaudeDept5'];

                              return topDepts.map((dept, i) => (
                                <Area key={dept} type="monotone" dataKey={dept} name={dept} stroke={colors[i]} fillOpacity={1} fill={'url(#' + gradients[i] + ')'} />
                              ));
                            })()}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-sm text-indigo-800">
                      <strong>Department Insight:</strong> Customer Support leads M365 Copilot usage for communication needs, while Product teams dominate Claude Enterprise for content creation and technical work. Marketing shows strong adoption across both platforms. Engineering demonstrates higher engagement with Claude Enterprise artifacts and projects.
                    </p>
                  </div>
                </div>

                {/* AI Ecosystem Comparison: Projects & Agents */}
                {aiToolsData.claudeEnterprise?.projectsAnalytics?.summary && aiToolsData.connectors?.summary && aiToolsData.m365CopilotDeepDive?.agents && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md p-6 border border-blue-100">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Ecosystem Comparison: Projects & Agents</h4>
                      <p className="text-sm text-gray-600">
                        M365 Copilot AI Agents vs Claude Enterprise Projects & Integrations
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* M365 Copilot AI Agents */}
                      <div className="bg-white rounded-lg p-5 border border-blue-200">
                        <h5 className="text-md font-semibold text-blue-900 mb-4 flex items-center">
                          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                          M365 Copilot AI Agents
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Agent-User Combos</span>
                            <span className="text-lg font-bold text-blue-700">{aiToolsData.m365CopilotDeepDive.agents.totalAgentUserCombinations}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Active Combos (responses &gt; 0)</span>
                            <span className="text-lg font-bold text-blue-700">{aiToolsData.m365CopilotDeepDive.agents.activeAgentUserCombinations}</span>
                          </div>
                          <div className="border-t border-gray-100 pt-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Top Agents</p>
                            {aiToolsData.m365CopilotDeepDive.agents.topAgentsByUsage.slice(0, 3).map((agent, idx) => (
                              <div key={idx} className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-700 truncate mr-2">{agent.agentName}</span>
                                <span className="text-sm font-semibold text-blue-600 whitespace-nowrap">{agent.totalResponses} responses</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-gray-100 pt-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Creator Types</p>
                            {Object.entries(aiToolsData.m365CopilotDeepDive.agents.creatorTypeBreakdown).map(([type, count], idx) => (
                              <div key={idx} className="flex justify-between items-center py-0.5">
                                <span className="text-xs text-gray-600">{type}</span>
                                <span className="text-xs font-medium text-gray-800">{count} ({Math.round((count / aiToolsData.m365CopilotDeepDive.agents.totalAgentUserCombinations) * 100)}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Claude Enterprise Projects & Integrations */}
                      <div className="bg-white rounded-lg p-5 border border-purple-200">
                        <h5 className="text-md font-semibold text-purple-900 mb-4 flex items-center">
                          <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                          Claude Enterprise Projects & Integrations
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Projects</span>
                            <span className="text-lg font-bold text-purple-700">{aiToolsData.claudeEnterprise.projectsAnalytics.summary.totalProjects}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Active Projects (30d)</span>
                            <span className="text-lg font-bold text-purple-700">{aiToolsData.claudeEnterprise.projectsAnalytics.summary.activeProjects}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Unique Creators</span>
                            <span className="text-lg font-bold text-purple-700">{aiToolsData.claudeEnterprise.projectsAnalytics.summary.uniqueCreators}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Avg Sophistication</span>
                            <span className="text-lg font-bold text-purple-700">{aiToolsData.claudeEnterprise.projectsAnalytics.summary.avgSophistication}/100</span>
                          </div>
                          <div className="border-t border-gray-100 pt-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Top Integrations</p>
                            {(aiToolsData.connectors.byIntegration || []).slice(0, 3).map((integration, idx) => (
                              <div key={idx} className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-700 truncate mr-2">{integration.integration || integration.name}</span>
                                <span className="text-sm font-semibold text-purple-600 whitespace-nowrap">{(integration.totalCalls || integration.calls || 0).toLocaleString()} calls</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-gray-100 pt-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Project Features</p>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-xs text-gray-600">With Documents</span>
                              <span className="text-xs font-medium text-gray-800">{aiToolsData.claudeEnterprise.projectsAnalytics.summary.withDocs}</span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-xs text-gray-600">With Prompt Templates</span>
                              <span className="text-xs font-medium text-gray-800">{aiToolsData.claudeEnterprise.projectsAnalytics.summary.withPrompts}</span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-xs text-gray-600">Integration Users</span>
                              <span className="text-xs font-medium text-gray-800">{aiToolsData.connectors.summary.usersWithUsage}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI-generated Ecosystem Comparison Insight */}
                    {aiToolsData.insights?.ecosystemComparison && (
                      <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <Target className="h-5 w-5 mr-2 text-amber-600" />
                          Key Insight
                        </h4>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="space-y-4 text-gray-700 leading-relaxed">
                            <MarkdownRenderer text={aiToolsData.insights.ecosystemComparison} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Strategic Positioning */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Strategic Positioning Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-3">M365 Copilot Strengths</h5>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Org-wide availability (300 employees)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Integrated into daily workflow apps (Teams, Outlook, Word)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Broad adoption across {aiToolsData.m365Copilot.activeUsers} active users</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Low barrier to entry for quick tasks</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h5 className="font-semibold text-purple-900 mb-3">Claude Enterprise Strengths</h5>
                      <ul className="space-y-2 text-sm text-purple-800">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Higher engagement ({aiToolsData.claudeEnterprise.conversationsPerUser} conversations/user)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Advanced features (Projects, Artifacts, Analysis)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Superior reasoning for complex problem-solving</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Preferred by power users and technical teams</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Strategic Question:</strong> {aiToolsData.insights?.strategicPositioning || 'These tools appear complementary rather than competitive. M365 Copilot serves as the "broad access" tool for quick, integrated tasks, while Claude Enterprise serves as the "power user" tool for deep work, complex analysis, and structured knowledge management. Should we position them as a tiered strategy?'}
                    </p>
                  </div>
                </div>
    </div>
  );
}
