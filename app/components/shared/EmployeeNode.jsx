import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { User, Users, Sparkles, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import {
  getAgenticFTEColor,
  getAgenticFTEBorderColor,
  getRoleBadgeColor,
  formatAgenticFTE
} from '../../utils/orgChartTransformer';

/**
 * Helper function to render trend indicator
 */
const TrendIndicator = ({ trend }) => {
  if (!trend || trend === 'stable') {
    return <Minus className="w-3 h-3 text-yellow-500" title="Stable (within ±5%)" />;
  }
  if (trend === 'up') {
    return <TrendingUp className="w-3 h-3 text-green-600" title="Increasing (>5%)" />;
  }
  if (trend === 'down') {
    return <TrendingDown className="w-3 h-3 text-red-600" title="Declining (>5%)" />;
  }
  if (trend === 'new') {
    return <Sparkles className="w-3 h-3 text-blue-500" title="New this month" />;
  }
  return null;
};

/**
 * Custom Employee Node for React Flow Org Chart
 *
 * Displays employee information with agentic FTE indicators
 */
const EmployeeNode = memo(({ data, id }) => {
  const {
    name,
    title,
    directReports,
    agenticFTE,
    teamAgenticFTE,
    nodeType,
    employmentType,
    hasChildren,
    onToggleChildren
  } = data;

  const [showTooltip, setShowTooltip] = useState(false);
  // Only level 0 (CEO) should be expanded by default since only top 2 layers are visible
  const [isExpanded, setIsExpanded] = useState(data.level < 1);

  const personalFTE = agenticFTE?.current || 0;
  const personalTrend = agenticFTE?.trend || 'stable';
  const teamFTE = teamAgenticFTE?.current || 0;
  const teamTrend = teamAgenticFTE?.trend || 'stable';
  const isManager = directReports > 0;

  // Get color based on personal agentic FTE
  const bgColorClass = getAgenticFTEColor(personalFTE);
  const borderColorClass = getAgenticFTEBorderColor(personalFTE);
  const roleBadgeColor = getRoleBadgeColor(nodeType);

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    if (onToggleChildren) {
      onToggleChildren(id, !isExpanded);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />

      {/* Node card */}
      <div
        className={`
          w-[260px] rounded-lg border-4 shadow-md
          transition-all duration-200 hover:shadow-lg hover:scale-105
          ${bgColorClass} bg-opacity-10
          ${borderColorClass}
        `}
      >
        {/* Header with role badge */}
        <div className="px-3 py-2 bg-white bg-opacity-90 rounded-t-md border-b border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              {nodeType === 'executive' && <User className="w-4 h-4 text-purple-600" />}
              {nodeType === 'manager' && <Users className="w-4 h-4 text-blue-600" />}
              {nodeType === 'ic' && <User className="w-4 h-4 text-gray-500" />}
              <span
                className={`
                  text-xs font-medium px-2 py-0.5 rounded-full border
                  ${roleBadgeColor}
                `}
              >
                {nodeType === 'executive' ? 'Executive' : nodeType === 'manager' ? 'Manager' : 'IC'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {employmentType === 'contingent' && (
                <span className="text-xs text-gray-500 italic">Contingent</span>
              )}
              {hasChildren && (
                <button
                  onClick={handleToggleExpand}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title={isExpanded ? 'Collapse reports' : 'Expand reports'}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Employee name */}
          <h3 className="font-bold text-sm text-gray-900 truncate" title={name}>
            {name}
          </h3>

          {/* Title */}
          <p className="text-xs text-gray-600 truncate" title={title}>
            {title}
          </p>
        </div>

        {/* Agentic FTE metrics */}
        <div className="px-3 py-2 bg-white bg-opacity-70 rounded-b-md space-y-1.5">
          {/* Personal agentic FTE */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-gray-700">Personal AI:</span>
            </div>
            <div className="flex items-center gap-1">
              {personalFTE > 0 && <TrendIndicator trend={personalTrend} />}
              <span
                className={`
                  text-xs font-bold px-2 py-0.5 rounded
                  ${personalFTE > 0 ? 'text-emerald-700 bg-emerald-100' : 'text-gray-500 bg-gray-100'}
                `}
              >
                {formatAgenticFTE(personalFTE)}
              </span>
            </div>
          </div>

          {/* Team agentic FTE (for managers) */}
          {isManager && (
            <div className="flex items-center justify-between pt-1 border-t border-gray-200">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">
                  Team ({directReports}):
                </span>
              </div>
              <div className="flex items-center gap-1">
                {teamFTE > 0 && <TrendIndicator trend={teamTrend} />}
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  {formatAgenticFTE(teamFTE)}
                </span>
              </div>
            </div>
          )}

          {/* Tool breakdown tooltip indicator */}
          {personalFTE > 0 && (
            <div className="pt-1 border-t border-gray-200">
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Hover for breakdown</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tooltip (appears on hover) */}
      {showTooltip && personalFTE > 0 && (
        <div className="absolute left-full ml-2 top-0 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 min-w-[200px]">
            <div className="font-bold mb-2">{name}</div>

          {/* Personal breakdown */}
          {personalFTE > 0 && (
            <>
              <div className="text-gray-300 font-medium mb-1">Personal AI Capacity (monthly rate):</div>
              {agenticFTE.breakdown && (
                <div className="space-y-1 mb-2">
                  {(agenticFTE.breakdown.claudeEnterprise?.current || agenticFTE.breakdown.claudeEnterprise) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>Claude Enterprise:</span>
                      <span className="font-mono">
                        {(agenticFTE.breakdown.claudeEnterprise?.current || agenticFTE.breakdown.claudeEnterprise).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {(agenticFTE.breakdown.m365Copilot?.current || agenticFTE.breakdown.m365Copilot) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>M365 Copilot:</span>
                      <span className="font-mono">
                        {(agenticFTE.breakdown.m365Copilot?.current || agenticFTE.breakdown.m365Copilot).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {(agenticFTE.breakdown.claudeCode?.current || agenticFTE.breakdown.claudeCode) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>Claude Code:</span>
                      <span className="font-mono">
                        {(agenticFTE.breakdown.claudeCode?.current || agenticFTE.breakdown.claudeCode).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Team breakdown (for managers) */}
          {isManager && teamFTE > 0 && (
            <>
              <div className="text-gray-300 font-medium mb-1 pt-2 border-t border-gray-700">
                Team AI Capacity ({directReports} reports, monthly rate):
              </div>
              {teamAgenticFTE.breakdown && (
                <div className="space-y-1">
                  {(teamAgenticFTE.breakdown.claudeEnterprise?.current || teamAgenticFTE.breakdown.claudeEnterprise) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>Claude Enterprise:</span>
                      <span className="font-mono">
                        {(teamAgenticFTE.breakdown.claudeEnterprise?.current || teamAgenticFTE.breakdown.claudeEnterprise).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {(teamAgenticFTE.breakdown.m365Copilot?.current || teamAgenticFTE.breakdown.m365Copilot) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>M365 Copilot:</span>
                      <span className="font-mono">
                        {(teamAgenticFTE.breakdown.m365Copilot?.current || teamAgenticFTE.breakdown.m365Copilot).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {(teamAgenticFTE.breakdown.claudeCode?.current || teamAgenticFTE.breakdown.claudeCode) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>Claude Code:</span>
                      <span className="font-mono">
                        {(teamAgenticFTE.breakdown.claudeCode?.current || teamAgenticFTE.breakdown.claudeCode).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        </div>
      )}
    </div>
  );
});

EmployeeNode.displayName = 'EmployeeNode';

export default EmployeeNode;
