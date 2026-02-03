import React from 'react';

/**
 * ClaudeCodePowerUsersTable - Displays top Claude Code power users
 * Used in both Claude Enterprise and Claude Code tabs
 * @param {Object} props
 * @param {Array} props.powerUsers - Array of power user objects with email, name, department, linesGenerated, sessions, linesPerSession
 */
const ClaudeCodePowerUsersTable = ({ powerUsers }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Claude Code - Power User Champions (Top 12)</h3>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Lines Generated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Agentic FTE/mo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Active Months</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Lines/Month</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {powerUsers.map((user, idx) => {
                const agenticFTE = (user.linesPerSession * 0.08 / 173).toFixed(1);
                return (
                  <tr key={user.email} className={idx < 3 ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {idx === 0 && '🥇'} {idx === 1 && '🥈'} {idx === 2 && '🥉'} {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">{user.linesGenerated.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-bold">{agenticFTE}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{user.sessions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">{user.linesPerSession.toLocaleString()}</td>
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

export default ClaudeCodePowerUsersTable;
