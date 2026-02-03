"use client";

import React from 'react';

/**
 * PortfolioTable - Reusable AI Projects Portfolio Table Component
 * Used in both the 2026 Annual Plan presentation (Slide 9) and main dashboard tab
 */
const PortfolioTable = ({ projects, methodology, showMethodology = true, showLegend = true, onProjectClick = null }) => {
  // Helper function to get tier badge styling
  const getTierBadgeClass = (tierCategory) => {
    switch (tierCategory) {
      case 'foundation':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'revenue':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'retention':
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // Helper function to get status dot styling
  const getStatusDotClass = (statusCategory) => {
    switch (statusCategory) {
      case 'active':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'planning':
        return 'bg-blue-400';
      case 'proposed':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  // Helper function to get status text styling
  const getStatusTextClass = (statusCategory) => {
    switch (statusCategory) {
      case 'active':
        return 'text-green-700 font-semibold';
      case 'in_progress':
        return 'text-yellow-700 font-semibold';
      case 'planning':
        return 'text-blue-700';
      case 'proposed':
        return 'text-gray-700';
      default:
        return 'text-gray-600';
    }
  };

  // Helper function to get tier icon
  const getTierIcon = (tierCategory) => {
    switch (tierCategory) {
      case 'foundation':
        return '🔷';
      case 'revenue':
        return '💰';
      case 'retention':
        return '🔄';
      default:
        return '📋';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Methodology Note */}
      {showMethodology && methodology && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-3 mb-4 rounded-r-lg">
          <p className="text-xs text-blue-900">
            <strong>Formula:</strong> {methodology.formula}<br />
            <strong>Components:</strong> {methodology.components.join(' • ')}
          </p>
        </div>
      )}

      {/* Main Table - Scrollable */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0">
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
              <th className="px-2 py-2 text-center font-bold text-gray-900" style={{width: '4%'}}>Rank</th>
              <th className="px-2 py-2 text-left font-bold text-gray-900" style={{width: '16%'}}>Project</th>
              <th className="px-2 py-2 text-center font-bold text-gray-900" style={{width: '5%'}}>Score</th>
              <th className="px-2 py-2 text-center font-bold text-gray-900" style={{width: '8%'}}>Tier</th>
              <th className="px-2 py-2 text-center font-bold text-gray-900" style={{width: '8%'}}>Status</th>
              <th className="px-2 py-2 text-right font-bold text-gray-900" style={{width: '6%'}}>Value</th>
              <th className="px-2 py-2 text-right font-bold text-gray-900" style={{width: '6%'}}>ROI</th>
              <th className="px-2 py-2 text-left font-bold text-gray-900" style={{width: '18%'}}>Target KPIs</th>
              <th className="px-2 py-2 text-left font-bold text-gray-900" style={{width: '10%'}}>Dependencies</th>
              <th className="px-2 py-2 text-left font-bold text-gray-900" style={{width: '11%'}}>Q Start</th>
              <th className="px-2 py-2 text-left font-bold text-gray-900" style={{width: '8%'}}>Priority Reasoning</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                {/* Rank */}
                <td className="px-2 py-2 text-center">
                  <span className="font-bold text-gray-900 text-sm">#{project.rank}</span>
                </td>

                {/* Project */}
                <td className="px-2 py-2">
                  {onProjectClick ? (
                    <button
                      onClick={() => onProjectClick(project.projectId)}
                      className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left w-full"
                      title={`View details for ${project.project}`}
                    >
                      {project.project}
                    </button>
                  ) : (
                    <span className="font-semibold text-gray-900">{project.project}</span>
                  )}
                </td>

                {/* Score */}
                <td className="px-2 py-2 text-center">
                  <span className="font-bold text-indigo-600">{project.score}</span>
                </td>

                {/* Tier */}
                <td className="px-2 py-2 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getTierBadgeClass(project.tierCategory)}`}>
                    <span className="mr-1">{getTierIcon(project.tierCategory)}</span>
                    {project.tier}
                  </span>
                </td>

                {/* Status */}
                <td className="px-2 py-2 text-center">
                  <div className="flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full mr-1 ${getStatusDotClass(project.statusCategory)}`}></div>
                    <span className={`text-xs ${getStatusTextClass(project.statusCategory)}`}>{project.status}</span>
                  </div>
                </td>

                {/* Value */}
                <td className="px-2 py-2 text-right">
                  <span className="font-bold text-green-600">{project.value}</span>
                </td>

                {/* ROI */}
                <td className="px-2 py-2 text-right">
                  <span className="font-bold text-green-600">{project.roi}</span>
                </td>

                {/* Target KPIs */}
                <td className="px-2 py-2">
                  <span className="text-xs text-gray-700">{project.targetKPIs}</span>
                </td>

                {/* Dependencies */}
                <td className="px-2 py-2">
                  <span className="text-xs text-gray-700">{project.dependencies}</span>
                </td>

                {/* Q Start */}
                <td className="px-2 py-2">
                  <span className="text-xs text-gray-700">{project.qStartDetail}</span>
                </td>

                {/* Priority Reasoning */}
                <td className="px-2 py-2">
                  <span className="text-xs italic text-gray-600">{project.priorityReasoning}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
            <div className="text-xs font-semibold text-blue-900 mb-1">🔷 TIER 0: FOUNDATION (6)</div>
            <div className="text-xs text-blue-800">Must launch first - enables downstream projects</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2 border border-green-200">
            <div className="text-xs font-semibold text-green-900 mb-1">💰 TIER 1: REVENUE (3)</div>
            <div className="text-xs text-green-800">Revenue generation - after foundation ready</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
            <div className="text-xs font-semibold text-orange-900 mb-1">🔄 TIER 2: RETENTION (2)</div>
            <div className="text-xs text-orange-800">Customer retention - after product quality</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioTable;
