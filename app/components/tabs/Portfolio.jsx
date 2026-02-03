import React from 'react';
import { Target, DollarSign, TrendingUp, Activity, Presentation } from 'lucide-react';
import PortfolioTable from '../PortfolioTable';
import ProjectDetail from '../ProjectDetail';

/**
 * Portfolio Tab Component
 *
 * Displays the AI Projects Portfolio with priority scoring, project details,
 * and strategic context. Shows 11 AI projects ranked by hybrid scoring algorithm.
 *
 * @param {Object} props
 * @param {Object} props.portfolioData - Portfolio data including projects and methodology
 * @param {Array} props.portfolioData.projects - Array of project objects
 * @param {Object} props.portfolioData.methodology - Scoring methodology details
 * @param {Object} props.projectDetailsData - Detailed project information keyed by projectId
 * @param {string|null} props.selectedProject - Currently selected project ID (null for portfolio view)
 * @param {Function} props.onProjectSelect - Callback when a project is selected/deselected
 * @param {Function} props.onNavigateToAnnualPlan - Callback to navigate to Annual Plan tab
 */
const Portfolio = ({
  portfolioData,
  projectDetailsData,
  selectedProject,
  onProjectSelect,
  onNavigateToAnnualPlan
}) => {
  return (
    <div className="space-y-6">
      {selectedProject ? (
        // RENDER PROJECT DETAIL VIEW
        <ProjectDetail project={projectDetailsData[selectedProject]} />
      ) : (
        // RENDER PORTFOLIO TABLE (existing content)
        <>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Projects Portfolio - Priority & Scoring</h2>
            <p className="text-gray-600 mb-6">
              11 AI projects ranked by hybrid scoring algorithm (70% Multi-Factor + 30% ROI).
              Data-driven prioritization based on financial impact, strategic alignment, execution feasibility, and time to value.
            </p>
          </div>

          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Total Projects</span>
              </div>
              <div className="text-4xl font-bold text-blue-900 mb-1">11</div>
              <p className="text-xs text-blue-700">6 Foundation • 3 Revenue • 2 Retention</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <span className="text-sm font-medium text-green-700">Total Value</span>
              </div>
              <div className="text-4xl font-bold text-green-900 mb-1">$22.4M</div>
              <p className="text-xs text-green-700">Annual value potential</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-md p-6 border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Portfolio ROI</span>
              </div>
              <div className="text-4xl font-bold text-indigo-900 mb-1">428%</div>
              <p className="text-xs text-indigo-700">Blended 3-year ROI</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-8 w-8 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Q1 Committed</span>
              </div>
              <div className="text-4xl font-bold text-orange-900 mb-1">6</div>
              <p className="text-xs text-orange-700">Foundation projects launching Q1</p>
            </div>
          </div>

          {/* Portfolio Table */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200" style={{height: '600px'}}>
            <div className="p-6 h-full">
              <PortfolioTable
                projects={portfolioData.projects}
                methodology={portfolioData.methodology}
                showMethodology={true}
                showLegend={true}
                onProjectClick={(projectId) => onProjectSelect(projectId)}
              />
            </div>
          </div>

          {/* Strategic Context */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Strategic Context & Quarterly Reviews</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Scoring Methodology</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Projects scored using adaptive hybrid formula: 70% Multi-Factor (Financial Impact, Strategic Alignment,
                  Execution Feasibility, Time to Value) + 30% ROI for Q1-Q2. Weight shifts to 60/40 in Q3-Q4 as ROI data improves.
                </p>
                <p className="text-xs text-gray-600">
                  <strong>Source:</strong> /docs/strategic-planning/working-data/PROJECT_SCORES.md
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Quarterly Review Gates</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Q1 Review (Mar 31):</strong> Re-prioritize Q2-Q4 based on Q1 results</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">→</span>
                    <span><strong>Q2 Review (Jun 30):</strong> Adjust Q3-Q4 plan, validate champion model</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">→</span>
                    <span><strong>Q3 Review (Sep 30):</strong> Finalize Q4 commitments, assess ROI accuracy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Link to Full Presentation */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2026 Annual Plan Presentation</h3>
                <p className="text-sm text-gray-600">
                  View the complete strategic plan with quarterly roadmap, resource requirements, and KPIs
                </p>
              </div>
              <button
                onClick={onNavigateToAnnualPlan}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Presentation className="h-5 w-5" />
                View Full Plan
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Portfolio;
