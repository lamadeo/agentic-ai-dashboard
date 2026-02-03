import React from 'react';

/**
 * ClaudeCodeKeyInsights - Displays Claude Code performance insights and department breakdown
 * Used in both Claude Enterprise and Claude Code tabs
 * @param {Object} props
 * @param {string} props.departmentInsight - AI-generated department performance insight text
 * @param {Array} props.departmentBreakdown - Array of department objects with users, totalLines, linesPerUser, topUser
 * @param {Array} props.topThreeUsers - Array of top 3 power users for contributor cards
 */
const ClaudeCodeKeyInsights = ({ departmentInsight, departmentBreakdown, topThreeUsers }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Insights: Claude Code Performance</h3>

      {/* AI-Generated Department Performance Insight */}
      {departmentInsight && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-lg border border-violet-200 mb-6">
          <p className="text-sm text-gray-900">
            <strong>Department Performance:</strong> {departmentInsight}
          </p>
        </div>
      )}

      {/* Department Breakdown Table */}
      {departmentBreakdown && departmentBreakdown.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Team Performance by Department</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Lines</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Lines/User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Performer</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Top User Lines</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentBreakdown
                  .sort((a, b) => b.linesPerUser - a.linesPerUser)
                  .map((dept, idx) => (
                  <tr key={dept.department} className={idx === 0 ? 'bg-violet-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {idx === 0 && '🏆 '}{dept.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{dept.users}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{dept.totalLines.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-600 font-bold">{dept.linesPerUser.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{dept.topUser?.username || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">{dept.topUser?.lines ? dept.topUser.lines.toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Individual Contributors */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Top Individual Contributors</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThreeUsers.map((user, idx) => (
            <div key={user.email} className={`p-4 rounded-lg border-2 ${
              idx === 0 ? 'bg-yellow-50 border-yellow-300' :
              idx === 1 ? 'bg-gray-50 border-gray-300' :
              'bg-orange-50 border-orange-300'
            }`}>
              <div className="text-2xl mb-2">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
              <div className="text-lg font-bold text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-600 mb-2">{user.department}</div>
              <div className="text-2xl font-bold text-purple-600">{user.linesGenerated.toLocaleString()}</div>
              <div className="text-xs text-gray-500">lines generated</div>
              <div className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">{user.linesPerSession.toLocaleString()}</span> lines/month
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClaudeCodeKeyInsights;
