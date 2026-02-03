import React from 'react';

/**
 * ClaudeCodeLowEngagementUsers - Displays Claude Code users with low engagement for enablement targeting
 * Used in Claude Code tab and potentially Enablement tab
 * @param {Object} props
 * @param {Array} props.lowEngagementUsers - Array of low engagement user objects with email, name, department, linesGenerated, sessions
 */
const ClaudeCodeLowEngagementUsers = ({ lowEngagementUsers }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Claude Code - Low Engagement Users (Enablement Targets)</h3>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Lines Generated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Agentic FTE/mo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Active Months</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lowEngagementUsers.map((user) => {
                const linesPerMonth = user.sessions > 0 ? user.linesGenerated / user.sessions : 0;
                const agenticFTE = (linesPerMonth * 0.08 / 173).toFixed(1);
                return (
                  <tr key={user.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.linesGenerated.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{agenticFTE}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.sessions}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClaudeCodeLowEngagementUsers;
