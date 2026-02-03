import React from 'react';
import { Bot, Users, Building2, Sparkles } from 'lucide-react';
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import MetricCard from '../shared/MetricCard';

/**
 * M365Agents Tab Component
 *
 * Displays M365 Copilot AI Agents analytics including:
 * - Top 10 AI Agents by Usage
 * - Top 10 AI Agents by Department
 * - Key Insights and metrics
 *
 * @param {Object} props
 * @param {Object} props.aiToolsData - Complete AI tools data including m365CopilotDeepDive.agents
 */
const M365Agents = ({ aiToolsData }) => {
  const { m365CopilotDeepDive, insights } = aiToolsData;
  const agents = m365CopilotDeepDive?.agents;

  if (!agents || agents.topAgentsByUsage?.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">AI Agents Data Not Available</h3>
          <p className="text-amber-700">
            M365 Copilot AI Agents usage data is not available. This requires the DeclarativeAgents CSV export
            from Microsoft 365 Admin Center with per-agent detail (file containing "_agents_" in the name).
          </p>
        </div>
      </div>
    );
  }

  // Calculate summary metrics
  const totalInteractions = agents.topAgentsByUsage.reduce((sum, a) => sum + a.totalResponses, 0);
  const activeAgents = agents.topAgentsByUsage.length;
  const userCreatedAgents = agents.creatorTypeBreakdown['User-created agent'] || 0;
  const totalCombinations = agents.totalAgentUserCombinations;

  // Department colors for stacked chart
  const departmentColors = {
    'Marketing': '#ec4899',
    'Engineering': '#3b82f6',
    'Sales - Enterprise': '#10b981',
    'Sales - Large Market': '#14b8a6',
    'Customer Success': '#8b5cf6',
    'Professional Services': '#f59e0b',
    'Product': '#6366f1',
    'Operations': '#ef4444',
    'Finance': '#84cc16',
    'Human Resources': '#06b6d4',
    'Agentic AI': '#a855f7',
    'Executive': '#64748b',
    'Legal': '#0ea5e9',
    'IT': '#f97316',
    'Revenue Operations': '#d946ef',
    'Partnerships': '#22c55e'
  };

  // Creator type colors
  const creatorTypeColors = {
    'User-created agent': '#9333ea',
    'Agent built by Microsoft': '#3b82f6',
    'Agent built by Microsoft partner': '#10b981',
    'Agent built by your org': '#f59e0b'
  };

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">M365 Copilot AI Agents Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Interactions"
            value={totalInteractions.toLocaleString()}
            changeLabel="Responses across all agents"
            icon={Sparkles}
            color="purple"
          />
          <MetricCard
            title="Active Agents"
            value={activeAgents}
            changeLabel="Agents with recorded usage"
            icon={Bot}
            color="blue"
          />
          <MetricCard
            title="User-Created Agents"
            value={userCreatedAgents}
            changeLabel={`of ${totalCombinations} total combinations`}
            icon={Users}
            color="green"
          />
          <MetricCard
            title="Top Agent"
            value={agents.topAgentsByUsage[0]?.agentName?.substring(0, 20) + (agents.topAgentsByUsage[0]?.agentName?.length > 20 ? '...' : '')}
            changeLabel={`${agents.topAgentsByUsage[0]?.totalResponses} responses`}
            icon={Building2}
            color="amber"
          />
        </div>
      </div>

      {/* AI-Generated Insight */}
      {insights?.m365AgentsAdoption && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">AI Agents Adoption Analysis</h4>
          <p className="text-sm text-gray-900 leading-relaxed">{insights.m365AgentsAdoption}</p>
        </div>
      )}

      {/* Chart 1: Top 10 AI Agents by Usage */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Top 10 AI Agents by Usage</h3>
        <p className="text-sm text-gray-600 mb-4">
          Total responses sent across all agents. Color-coded by creator type.
        </p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agents.topAgentsByUsage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="agentName" type="category" width={200} style={{ fontSize: '12px' }} />
              <Tooltip
                formatter={(value, name, props) => {
                  if (name === 'totalResponses') {
                    return [`${value} responses`, 'Responses'];
                  }
                  return value;
                }}
                labelFormatter={(label) => {
                  const agent = agents.topAgentsByUsage.find(a => a.agentName === label);
                  return agent ? `${label}\n${agent.totalUsers} users • ${agent.creatorType}` : label;
                }}
              />
              <Bar dataKey="totalResponses" label={{ position: 'right', formatter: (val) => `${val}`, fontSize: 11 }}>
                {agents.topAgentsByUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={creatorTypeColors[entry.creatorType] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
          {Object.entries(creatorTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: color }}></div>
              <span>{type.replace('Agent built by ', '').replace(' agent', '')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Top 10 AI Agents by Department */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Top 10 AI Agents by Department</h3>
        <p className="text-sm text-gray-600 mb-4">
          Which departments drive adoption of each agent. Stacked by department contribution.
        </p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={agents.topAgentsByDepartment.map(agent => {
                const deptData = {};
                agent.byDepartment.forEach(dept => {
                  deptData[dept.department] = dept.responses;
                });
                // Truncate long agent names
                const truncatedName = agent.agentName.length > 25
                  ? agent.agentName.substring(0, 25) + '...'
                  : agent.agentName;
                return {
                  agentName: truncatedName,
                  fullAgentName: agent.agentName,
                  ...deptData,
                  totalResponses: agent.totalResponses
                };
              })}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="agentName" type="category" width={200} style={{ fontSize: '12px' }} />
              <Tooltip
                formatter={(value, name) => [`${value} responses`, name]}
                labelFormatter={(label) => {
                  const chartData = agents.topAgentsByDepartment.map(agent => {
                    const truncated = agent.agentName.length > 25 ? agent.agentName.substring(0, 25) + '...' : agent.agentName;
                    return { truncated, full: agent.agentName, total: agent.totalResponses };
                  });
                  const match = chartData.find(d => d.truncated === label);
                  return match ? `${match.full} (${match.total} total responses)` : label;
                }}
              />
              <Legend />
              {(() => {
                // Get all unique departments across all agents
                const allDepartments = new Set();
                agents.topAgentsByDepartment.forEach(agent => {
                  agent.byDepartment.forEach(dept => allDepartments.add(dept.department));
                });

                return Array.from(allDepartments).map((dept, idx) => (
                  <Bar
                    key={dept}
                    dataKey={dept}
                    stackId="a"
                    fill={departmentColors[dept] || `hsl(${(idx * 360) / allDepartments.size}, 70%, 50%)`}
                  />
                ));
              })()}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Creator Type Breakdown */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Agent Creator Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(agents.creatorTypeBreakdown).map(([type, count]) => (
            <div
              key={type}
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: `${creatorTypeColors[type]}10`,
                borderColor: `${creatorTypeColors[type]}40`
              }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: creatorTypeColors[type] }}>
                {type.replace('Agent built by ', '').replace(' agent', '')}
              </p>
              <p className="text-2xl font-bold" style={{ color: creatorTypeColors[type] }}>
                {count}
              </p>
              <p className="text-xs text-gray-500">agent-user combinations</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default M365Agents;
