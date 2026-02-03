import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Plug, Users, TrendingUp, Award, AlertCircle } from 'lucide-react';

/**
 * ClaudeIntegrations Tab Component
 *
 * Displays Claude Enterprise Connectors/Integrations analytics including:
 * - Summary KPIs
 * - Integration usage rankings
 * - Department heatmap
 * - Power users leaderboard
 * - Monthly trends
 * - AI-generated insights
 *
 * @param {Object} props - Component props
 * @param {Object} props.aiToolsData - Complete AI tools data from ai-tools-data.json
 * @returns {JSX.Element} ClaudeIntegrations tab content
 */
export default function ClaudeIntegrations({ aiToolsData }) {
  const connectors = aiToolsData.connectors || {};
  const summary = connectors.summary || {};
  const integrations = connectors.byIntegration || [];
  const departments = connectors.byDepartment || [];
  const powerUsers = connectors.powerUsers || [];
  const monthlyTrend = connectors.monthlyTrend || [];
  const insights = connectors.insights || {};

  // Medal emojis for top 3
  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  // Colors for charts
  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'];

  return (
    <div className="space-y-6">
      {/* Header with Summary KPIs */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plug className="w-6 h-6 text-purple-600" />
          Claude Enterprise Integrations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Integration Calls */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Integration Calls</p>
            <p className="text-3xl font-bold text-purple-600">
              {(summary.totalCalls || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">All time</p>
          </div>

          {/* Unique Integrations */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Unique Integrations</p>
            <p className="text-3xl font-bold text-blue-600">
              {summary.uniqueIntegrations || 0}
            </p>
            <p className="text-xs text-gray-500">Connected tools</p>
          </div>

          {/* Users with Usage */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Users with Usage</p>
            <p className="text-3xl font-bold text-green-600">
              {summary.usersWithUsage || 0}
            </p>
            <p className="text-xs text-gray-500">Active integration users</p>
          </div>

          {/* Top Integration */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Most Used Integration</p>
            <p className="text-xl font-bold text-orange-600 truncate">
              {summary.topIntegration || 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {(summary.topIntegrationCalls || 0).toLocaleString()} calls
            </p>
          </div>
        </div>
      </div>

      {/* Integration Usage Rankings */}
      {integrations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Usage Rankings</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={integrations.slice(0, 15)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={110}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'calls') return [value.toLocaleString(), 'Calls'];
                    if (name === 'users') return [value, 'Users'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="calls" fill="#8B5CF6" name="Calls" />
                <Bar dataKey="users" fill="#3B82F6" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Two Column Layout: Department Heatmap + Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Usage */}
        {departments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Usage by Department</h3>
            <div className="space-y-3">
              {departments.slice(0, 10).map((dept, index) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{dept.department}</span>
                      <span className="text-sm text-gray-500">{dept.totalCalls.toLocaleString()} calls</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          dept.engagementLevel === 'High' ? 'bg-green-500' :
                          dept.engagementLevel === 'Medium' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{
                          width: `${Math.min((dept.totalCalls / (departments[0]?.totalCalls || 1)) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{dept.users} users</span>
                      <span>{dept.integrations} integrations</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Trend */}
        {monthlyTrend.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Usage Over Time</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorIntCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => {
                      if (name === 'calls') return [value.toLocaleString(), 'Calls'];
                      if (name === 'users') return [value, 'Active Users'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="calls"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fill="url(#colorIntCalls)"
                    name="calls"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Power Users Leaderboard */}
      {powerUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Integration Power Users
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Calls</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Integrations</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Diversity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {powerUsers.slice(0, 15).map((user, index) => (
                  <tr key={user.email} className={index < 3 ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-3 text-sm">
                      {getMedal(user.rank)} {user.rank}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.department}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-purple-600">
                      {user.totalCalls.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600">
                      {user.uniqueIntegrations}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${user.diversityScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{user.diversityScore}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {aiToolsData.insights?.integrationsOverview && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-md p-6 border border-amber-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Key Insights
          </h3>
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {aiToolsData.insights.integrationsOverview}
          </div>
        </div>
      )}

      {/* Methodology Note */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Data Source:</span> Integration usage is extracted from Claude Enterprise
            conversation exports. A "call" represents a single tool invocation through an MCP integration.
            Power users are identified as having &gt;50 calls OR &gt;5 unique integrations.
          </div>
        </div>
      </div>
    </div>
  );
}
