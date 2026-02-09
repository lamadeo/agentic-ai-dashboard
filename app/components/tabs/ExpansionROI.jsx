import React from 'react';
import { ResponsiveContainer, AreaChart, BarChart, PieChart, Area, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Users, MessageSquare, TrendingUp, FileText, DollarSign, Code, Activity, Target, Clock, Award, ArrowUp, Lightbulb, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import MetricCard from '../shared/MetricCard';
import { parseMarkdown } from '../shared/MarkdownRenderer';

/**
 * ExpansionROI Tab Component
 *
 * Displays expansion opportunities analysis including behavioral scoring,
 * Premium seat allocation recommendations, ROI projections, and department-level
 * expansion planning with hybrid Premium allocation strategy.
 *
 * @param {Object} props - Component props
 * @param {Object} props.aiToolsData - Complete AI tools data from ai-tools-data.json
 * @returns {JSX.Element} ExpansionROI tab content
 */
export default function ExpansionROI({ aiToolsData }) {
  // Extract needed data
  const expansionOpportunities = aiToolsData.expansion.opportunities;
  const orgMetrics = aiToolsData.orgMetrics;
  const expansion = aiToolsData.expansion;

  return (
    <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Claude Ent Organization Coverage Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Total Organization</p>
                      <p className="text-3xl font-bold text-gray-900">{orgMetrics.totalEmployees}</p>
                      <p className="text-xs text-gray-500">Employees</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Current Licensed</p>
                      <p className="text-3xl font-bold text-blue-600">{orgMetrics.licensedSeats}</p>
                      <p className="text-xs text-gray-500">{orgMetrics.penetrationRate}% coverage</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Unlicensed</p>
                      <p className="text-3xl font-bold text-orange-600">{orgMetrics.unlicensedEmployees}</p>
                      <p className="text-xs text-gray-500">Opportunity gap</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Unrealized Value</p>
                      <p className="text-3xl font-bold text-red-600">${Math.round(expansion.summary.totalOpportunityCost / 1000)}K</p>
                      <p className="text-xs text-gray-500">Per month</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Claude Ent Expansion Opportunities by Department (Ranked by Net Annual Value & ROI)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Additive Cost:</strong> INCREMENTAL monthly license cost for new seats + upgrades × 12 (Premium $200/mo = $2,400/year, Standard $40/mo = $480/year).
                    <strong className="ml-2">Additive Value:</strong> INCREMENTAL productivity gains from new licenses + upgrades × 12 months.
                    <strong className="ml-2">Additive Net:</strong> Additive Value - Additive Cost = INCREMENTAL net benefit to organization.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-4 py-3">Rank</th>
                          <th className="px-4 py-3">Department</th>
                          <th className="px-4 py-3">Total Employees</th>
                          <th className="px-4 py-3">Current Std Seats</th>
                          <th className="px-4 py-3">Current Prem Seats</th>
                          <th className="px-4 py-3">New Std Seats</th>
                          <th className="px-4 py-3">New Prem Seats</th>
                          <th className="px-4 py-3">Std→Prem Upgrades</th>
                          <th className="px-4 py-3">Monthly Cost (Additive)</th>
                          <th className="px-4 py-3">Annual Cost (Additive)</th>
                          <th className="px-4 py-3">Annual Value (Additive)</th>
                          <th className="px-4 py-3">Annual Net (Additive)</th>
                          <th className="px-4 py-3">ROI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expansionOpportunities
                          .sort((a, b) => (b.netBenefit * 12) - (a.netBenefit * 12) || b.roi - a.roi)
                          .map((dept, idx) => (
                            <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{idx + 1}</td>
                              <td className="px-4 py-3 font-medium text-gray-900">{dept.department}</td>
                              <td className="px-4 py-3 text-gray-900">{dept.totalEmployees}</td>
                              <td className="px-4 py-3 text-blue-600">{dept.currentStandard}</td>
                              <td className="px-4 py-3 text-purple-600">{dept.currentPremium}</td>
                              <td className="px-4 py-3 text-blue-600">{dept.standardGap}</td>
                              <td className="px-4 py-3 text-purple-600">{dept.premiumGap}</td>
                              <td className="px-4 py-3 text-amber-600 font-medium">{dept.upgradesNeeded}</td>
                              <td className="px-4 py-3 font-semibold text-gray-900">${dept.totalAdditionalCost.toLocaleString()}</td>
                              <td className="px-4 py-3 font-semibold text-blue-600">${(dept.totalAdditionalCost * 12).toLocaleString()}</td>
                              <td className="px-4 py-3 text-orange-600 font-medium">${(dept.monthlyOpportunityCost * 12).toLocaleString()}</td>
                              <td className="px-4 py-3 text-green-600 font-semibold">${(dept.netBenefit * 12).toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  dept.roi > 15
                                    ? 'bg-green-100 text-green-800'
                                    : dept.roi > 8
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {dept.roi.toFixed(1)}x
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot className="bg-gray-100 font-semibold">
                        <tr>
                          <td colSpan="3" className="px-4 py-3 text-gray-900">TOTAL EXPANSION</td>
                          <td className="px-4 py-3 text-blue-600">{expansionOpportunities.reduce((sum, d) => sum + d.currentStandard, 0)}</td>
                          <td className="px-4 py-3 text-purple-600">{expansionOpportunities.reduce((sum, d) => sum + d.currentPremium, 0)}</td>
                          <td className="px-4 py-3 text-blue-600">{expansionOpportunities.reduce((sum, d) => sum + d.standardGap, 0)}</td>
                          <td className="px-4 py-3 text-purple-600">{expansionOpportunities.reduce((sum, d) => sum + d.premiumGap, 0)}</td>
                          <td className="px-4 py-3 text-amber-600 font-bold">{expansionOpportunities.reduce((sum, d) => sum + d.upgradesNeeded, 0)}</td>
                          <td className="px-4 py-3">${expansionOpportunities.reduce((sum, d) => sum + d.totalAdditionalCost, 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-blue-600 font-bold">${(expansionOpportunities.reduce((sum, d) => sum + d.totalAdditionalCost, 0) * 12).toLocaleString()}</td>
                          <td className="px-4 py-3 text-orange-600 font-bold">${(expansionOpportunities.reduce((sum, d) => sum + d.monthlyOpportunityCost, 0) * 12).toLocaleString()}</td>
                          <td className="px-4 py-3 text-green-600 font-bold">${(expansionOpportunities.reduce((sum, d) => sum + d.netBenefit, 0) * 12).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                              {(expansionOpportunities.reduce((sum, d) => sum + d.monthlyOpportunityCost, 0) / 
                                expansionOpportunities.reduce((sum, d) => sum + d.totalAdditionalCost, 0)).toFixed(1)}x
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>License Strategy (Behavioral Scoring):</strong> Premium allocation based on power user behavioral scoring (≥40 points across code writing, engagement, documents, complex work).
                      Standard seats for typical usage patterns. Premium Gap includes both new Premium licenses and upgrades from Standard to Premium. <strong>Annual costs</strong> shown reflect Anthropic's annual billing model.
                    </p>
                  </div>

                  {/* AI-Powered Explanation: Expansion Opportunities */}
                  {aiToolsData.insights?.expansionOpportunitiesExplanation && (
                    <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-indigo-600" />
                        Explanation of Recommendations
                      </h4>
                      <div className="prose prose-sm max-w-none text-gray-700">
                        {parseMarkdown(aiToolsData.insights.expansionOpportunitiesExplanation).map((paragraph) => (
                          <p key={paragraph.idx} className="mb-3 leading-relaxed">
                            {paragraph.parts.map((part, partIdx) =>
                              part.type === 'bold'
                                ? <strong key={partIdx}>{part.content}</strong>
                                : <span key={partIdx}>{part.content}</span>
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="mb-4 bg-gradient-to-r from-indigo-100 to-purple-100 p-3 rounded-lg border-2 border-indigo-300">
                      <h3 className="text-sm font-bold text-indigo-900 mb-1">📋 PROPOSED BY LUIS AMADEO (CHIEF AGENTIC OFFICER)</h3>
                      <p className="text-xs text-indigo-700">Engineering-first approach with 100% Premium coverage</p>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Phased Rollout Strategy - 2026 Quarterly Plan</h3>
                    <div className="mb-3 bg-purple-50 p-3 rounded-lg border border-purple-300 text-xs text-purple-900">
                      <strong>2026 Quarterly:</strong> Q1-Engineering Premium ($118K), Q2-Service/GTM ($40K), Q3-Complete ($2K).
                      <strong>Total 2026: $226K | 2027+ run rate: $270K/year</strong>
                    </div>
                    <div className="space-y-4">
                      <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">Phase 1: Early Adopters & Champions</h4>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">✓ COMPLETE</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">82 users across all departments | 13 Premium + 72 Standard</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-gray-700 font-semibold">Annual Run Rate: $65,760</span>
                          <span className="text-green-600 font-semibold">ROI: 7.4x-10.3x</span>
                        </div>
                      </div>
                      
                      <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">Phase 2: All Engineering with Claude Code</h4>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">→ Q1 2026 (JAN-MAR)</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">70 engineers | Upgrade 9 Std→Prem + 49 new Premium | Deploy ~Feb 15</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-purple-700 font-semibold">2026 Pro-rated: $118,020</span>
                          <span className="text-purple-600">Annual Run Rate: $134,880</span>
                          <span className="text-purple-600">2026 Value: $579K</span>
                          <span className="text-purple-600 font-semibold">ROI: 4.9x</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">10.5 months in 2026</p>
                      </div>

                      {/* Phase 2 Rollout Tracker Card */}
                      {aiToolsData.expansion?.rolloutTracking?.phase2Engineering && (() => {
                        const tracker = aiToolsData.expansion.rolloutTracking.phase2Engineering;
                        const statusColors = {
                          'complete': 'bg-green-100 text-green-800 border-green-300',
                          'on-track': 'bg-blue-100 text-blue-800 border-blue-300',
                          'at-risk': 'bg-yellow-100 text-yellow-800 border-yellow-300',
                          'behind-schedule': 'bg-red-100 text-red-800 border-red-300',
                          'not-started': 'bg-gray-100 text-gray-800 border-gray-300'
                        };
                        const statusColor = statusColors[tracker.status] || statusColors['not-started'];

                        return (
                          <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-300">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-gray-900 text-sm flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                                Phase 2 Rollout Tracker
                              </h5>
                              <span className={`px-2 py-1 rounded text-xs font-bold border ${statusColor}`}>
                                {tracker.status.toUpperCase().replace('-', ' ')}
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-gray-700">Engineering Premium Seats</span>
                                <span className="text-xs font-bold text-purple-700">{tracker.current}/{tracker.target} ({tracker.progress}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${tracker.progress}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="bg-white p-2 rounded border border-purple-200">
                                <p className="text-xs text-gray-600">Remaining</p>
                                <p className="text-lg font-bold text-purple-700">{tracker.remaining}</p>
                                <p className="text-xs text-gray-500">seats</p>
                              </div>
                              <div className="bg-white p-2 rounded border border-indigo-200">
                                <p className="text-xs text-gray-600">Upgrades Needed</p>
                                <p className="text-lg font-bold text-indigo-700">{tracker.breakdown.upgradesNeeded}</p>
                                <p className="text-xs text-gray-500">Std→Prem</p>
                              </div>
                              <div className="bg-white p-2 rounded border border-blue-200">
                                <p className="text-xs text-gray-600">New Seats</p>
                                <p className="text-lg font-bold text-blue-700">{tracker.breakdown.premiumGap}</p>
                                <p className="text-xs text-gray-500">Premium</p>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Last updated: {tracker.lastUpdate}</span>
                              <span className="text-gray-600">Target: {tracker.targetDate}</span>
                            </div>
                          </div>
                        );
                      })()}
                      
                      <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">Phase 3: Service Teams & GTM Complete</h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">→ Q2 2026 (APR-JUN)</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">CS, Prof Services, Support, Sales, Marketing, Product, BizDev | 88 users | Deploy ~May 15</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-blue-700 font-semibold">2026 Pro-rated: $40,200</span>
                          <span className="text-blue-600">Annual Run Rate: $64,320</span>
                          <span className="text-blue-600">2026 Value: $396K</span>
                          <span className="text-blue-600 font-semibold">ROI: 9.9x</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">7.5 months in 2026 | 14 Prem upgrades + 1 new Prem + 73 Std</p>
                      </div>
                      
                      <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">Phase 4: Complete Coverage</h4>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-bold">→ Q3 2026 (JUL-SEP)</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">Final 5 support users | Deploy ~Aug 15</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-orange-700 font-semibold">2026 Pro-rated: $1,980</span>
                          <span className="text-orange-600">Annual Run Rate: $5,280</span>
                          <span className="text-orange-600">2026 Value: $14K</span>
                          <span className="text-orange-600 font-semibold">ROI: 6.8x</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">4.5 months in 2026</p>
                      </div>

                      <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">2026 Budget Summary</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded border-2 border-purple-400">
                            <p className="text-xs text-gray-700 mb-1 font-semibold">2026 Pro-rated</p>
                            <p className="text-2xl font-bold text-purple-700">$226K</p>
                          </div>
                          <div className="bg-white p-3 rounded border-2 border-blue-400">
                            <p className="text-xs text-gray-700 mb-1 font-semibold">2027+ Run Rate</p>
                            <p className="text-2xl font-bold text-blue-700">$270K</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg border-2 border-green-300">
                      <h3 className="text-sm font-bold text-green-900 mb-1">📊 DATA-DRIVEN VALUE-BASED APPROACH</h3>
                      <p className="text-xs text-green-700">Behavioral scoring with Premium only for power users</p>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Value & ROI-Optimized Rollout Strategy</h3>
                    <div className="mb-3 bg-green-50 p-3 rounded-lg border border-green-300 text-xs text-green-900">
                      <strong>Additive deployment by Net Annual Value ranking:</strong> Building on existing {orgMetrics.licensedSeats} licenses. Deploy new seats to departments with highest net dollar value first to maximize financial impact.
                      <strong className="block mt-1">Additional Investment: ${(expansion.summary.totalAdditionalCost * 12).toLocaleString()}/year | Value: ${(expansion.summary.totalOpportunityCost * 12).toLocaleString()}/year | ROI: {expansion.summary.overallROI.toFixed(1)}x</strong>
                    </div>
                    <div className="space-y-4">
                      {/* Phase 1: Current Baseline (Complete) */}
                      <div className="border-l-4 border-gray-400 pl-4 py-2 bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">Phase 1: Early Adopters (COMPLETE)</h4>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-bold">✓ Deployed</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">Existing baseline across all departments | {orgMetrics.licensedSeats} users</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-gray-700">{orgMetrics.licensedSeats - 13} Standard + {13} Premium seats</span>
                          <span className="text-gray-600 font-semibold">Current state</span>
                        </div>
                      </div>

                      {(() => {
                        // Sort departments by Annual Net Value first, then ROI (highest first)
                        const sortedDepts = [...expansionOpportunities].sort((a, b) => (b.netBenefit * 12) - (a.netBenefit * 12) || b.roi - a.roi);

                        // Group into phases based on sorted ranking (highest net value first)
                        const totalDepts = sortedDepts.length;
                        const deptsPerPhase = Math.ceil(totalDepts / 4); // Divide into ~4 phases

                        const phase1Depts = sortedDepts.slice(0, deptsPerPhase);
                        const phase2Depts = sortedDepts.slice(deptsPerPhase, deptsPerPhase * 2);
                        const phase3Depts = sortedDepts.slice(deptsPerPhase * 2, deptsPerPhase * 3);
                        const phase4Depts = sortedDepts.slice(deptsPerPhase * 3);

                        const phases = [
                          { name: "Phase 2: Highest Value Departments", depts: phase1Depts, color: "green", bgColor: "green-50", borderColor: "green-500", quarter: "Q1 2026" },
                          { name: "Phase 3: High Value Departments", depts: phase2Depts, color: "blue", bgColor: "blue-50", borderColor: "blue-500", quarter: "Q2 2026" },
                          { name: "Phase 4: Medium Value Departments", depts: phase3Depts, color: "indigo", bgColor: "indigo-50", borderColor: "indigo-500", quarter: "Q3 2026" },
                          { name: "Phase 5: Remaining Departments", depts: phase4Depts, color: "purple", bgColor: "purple-50", borderColor: "purple-500", quarter: "Q4 2026" }
                        ].filter(phase => phase.depts.length > 0); // Only include phases with departments

                        // Calculate cumulative seats for each phase
                        let cumulativeSeats = orgMetrics.licensedSeats; // Start with current baseline

                        return phases.map((phase, idx) => {
                          const totalNewUsers = phase.depts.reduce((sum, d) => sum + d.standardGap + d.premiumGap, 0);
                          const totalUpgrades = phase.depts.reduce((sum, d) => sum + (d.upgradesNeeded || 0), 0);
                          const totalCost = phase.depts.reduce((sum, d) => sum + d.totalAdditionalCost, 0);
                          const totalValue = phase.depts.reduce((sum, d) => sum + d.monthlyOpportunityCost, 0);
                          const avgROI = totalCost > 0 ? (totalValue / totalCost) : 0;
                          const deptNames = phase.depts.map(d => d.department).join(", ");

                          // Add new seats to cumulative total
                          cumulativeSeats += totalNewUsers;
                          const orgCoverage = ((cumulativeSeats / orgMetrics.totalEmployees) * 100).toFixed(1);

                          return (
                            <div key={idx} className={`border-l-4 border-${phase.borderColor} pl-4 py-2 bg-${phase.bgColor}`}>
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900 text-sm">{phase.name}</h4>
                                <span className={`px-2 py-1 bg-${phase.color}-100 text-${phase.color}-800 rounded text-xs font-bold`}>→ {phase.quarter}</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{deptNames} | +{totalNewUsers} new users{totalUpgrades > 0 ? ` + ${totalUpgrades} upgrades` : ''}</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <span className="text-gray-700">Annual Cost: ${(totalCost * 12).toLocaleString()}</span>
                                <span className={`text-${phase.color}-600`}>Annual Value: ${(totalValue * 12).toLocaleString()}</span>
                                <span className="text-gray-700">Monthly: ${totalCost.toLocaleString()}</span>
                                <span className={`text-${phase.color}-600 font-semibold`}>ROI: {avgROI.toFixed(1)}x</span>
                                <span className="text-purple-700 font-bold">Org Coverage: {orgCoverage}%</span>
                                <span className="text-gray-600">{cumulativeSeats} of {orgMetrics.totalEmployees} employees</span>
                              </div>
                            </div>
                          );
                        });
                      })()}

                      {(() => {
                        // Calculate 2026 pro-rated costs based on quarterly deployment
                        const sortedDepts = [...expansionOpportunities].sort((a, b) => (b.netBenefit * 12) - (a.netBenefit * 12) || b.roi - a.roi);
                        const totalDepts = sortedDepts.length;
                        const deptsPerPhase = Math.ceil(totalDepts / 4);

                        const phase1Depts = sortedDepts.slice(0, deptsPerPhase);
                        const phase2Depts = sortedDepts.slice(deptsPerPhase, deptsPerPhase * 2);
                        const phase3Depts = sortedDepts.slice(deptsPerPhase * 2, deptsPerPhase * 3);
                        const phase4Depts = sortedDepts.slice(deptsPerPhase * 3);

                        // Pro-rated months in 2026 (mid-quarter deployment)
                        // Q1 (mid-Feb): 10.5 months, Q2 (mid-May): 7.5 months, Q3 (mid-Aug): 4.5 months, Q4 (mid-Nov): 1.5 months
                        const q1Cost = phase1Depts.reduce((sum, d) => sum + d.totalAdditionalCost, 0) * 10.5;
                        const q2Cost = phase2Depts.reduce((sum, d) => sum + d.totalAdditionalCost, 0) * 7.5;
                        const q3Cost = phase3Depts.reduce((sum, d) => sum + d.totalAdditionalCost, 0) * 4.5;
                        const q4Cost = phase4Depts.reduce((sum, d) => sum + d.totalAdditionalCost, 0) * 1.5;

                        const proRated2026 = q1Cost + q2Cost + q3Cost + q4Cost;
                        const runRate2027 = expansion.summary.totalAdditionalCost * 12;

                        return (
                          <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm">2026 Budget Summary</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white p-3 rounded border-2 border-green-400">
                                <p className="text-xs text-gray-700 mb-1 font-semibold">2026 Pro-rated</p>
                                <p className="text-2xl font-bold text-green-700">${Math.round(proRated2026 / 1000)}K</p>
                                <p className="text-xs text-gray-500 mt-1">Phased quarterly deployment</p>
                              </div>
                              <div className="bg-white p-3 rounded border-2 border-emerald-400">
                                <p className="text-xs text-gray-700 mb-1 font-semibold">2027+ Run Rate</p>
                                <p className="text-2xl font-bold text-emerald-700">${Math.round(runRate2027 / 1000)}K</p>
                                <p className="text-xs text-gray-500 mt-1">Full year after Phase 4</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* AI-Powered Explanation: Rollout Strategy */}
                {aiToolsData.insights?.rolloutStrategyExplanation && (
                  <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-green-600" />
                      Explanation of Recommendations - Rollout Strategy
                    </h4>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {parseMarkdown(aiToolsData.insights.rolloutStrategyExplanation).map((paragraph) => (
                        <p key={paragraph.idx} className="mb-3 leading-relaxed">
                          {paragraph.parts.map((part, partIdx) =>
                            part.type === 'bold'
                              ? <strong key={partIdx}>{part.content}</strong>
                              : <span key={partIdx}>{part.content}</span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-yellow-600" />
                    Claude Ent Cost of Inaction
                  </h3>
                  <p className="text-gray-700 mb-4">
                    By maintaining current {orgMetrics.penetrationRate}% coverage ({orgMetrics.licensedSeats} of {orgMetrics.totalEmployees} employees), TechCo Inc is leaving significant productivity gains unrealized from {orgMetrics.unlicensedEmployees} unlicensed employees.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded border border-orange-200">
                      <p className="text-xs text-gray-600 mb-1">Monthly Unrealized Value</p>
                      <p className="text-xl font-bold text-red-600">${expansion.summary.totalOpportunityCost.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-3 rounded border-2 border-red-300">
                      <p className="text-xs text-gray-700 mb-1 font-semibold">Annual Unrealized Value</p>
                      <p className="text-xl font-bold text-red-700">${((expansion.summary.totalOpportunityCost * 12) / 1000000).toFixed(2)}M</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Annual Cost to Capture</p>
                      <p className="text-xl font-bold text-blue-600">${(expansion.summary.totalAdditionalCost * 12).toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-3 rounded border-2 border-green-300">
                      <p className="text-xs text-gray-700 mb-1 font-semibold">Annual Net Benefit</p>
                      <p className="text-xl font-bold text-green-700">${((expansion.summary.totalNetBenefit * 12) / 1000000).toFixed(2)}M</p>
                      <p className="text-xs text-gray-500 mt-1">{expansion.summary.overallROI.toFixed(1)}x ROI</p>
                    </div>
                  </div>
                </div>

                {/* Incremental ROI Analysis Section */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-200">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                      <TrendingUp className="h-6 w-6 mr-2 text-indigo-600" />
                      Claude Ent Incremental ROI Analysis vs Industry Benchmarks
                    </h3>
                    <p className="text-sm text-gray-700">
                      Comparing TechCo Inc's data-driven performance against published industry research for GitHub Copilot and M365 Copilot productivity benchmarks.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* GitHub → Claude Code Card */}
                    <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        GitHub Copilot → Claude Code Premium
                      </h4>

                      {/* Shared Metrics */}
                      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-gray-600 mb-1">Incremental Hours/Mo</p>
                          <p className="text-lg font-bold text-gray-900">{aiToolsData.incrementalROI.githubToClaudeCode.incrementalHours}</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-gray-600 mb-1">Incremental Value/Mo</p>
                          <p className="text-lg font-bold text-green-600">${aiToolsData.incrementalROI.githubToClaudeCode.incrementalValue.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-gray-600 mb-1">Baseline Hours</p>
                          <p className="text-lg font-bold text-gray-700">{aiToolsData.incrementalROI.githubToClaudeCode.baselineHours} hrs</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-gray-600 mb-1">Claude Code Hours</p>
                          <p className="text-lg font-bold text-blue-600">{aiToolsData.incrementalROI.githubToClaudeCode.currentHours} hrs</p>
                        </div>
                      </div>

                      {/* Two Scenarios Side-by-Side */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* ADDITIVE SCENARIO */}
                        <div className="border border-green-300 rounded-lg p-4 bg-green-50">
                          <h5 className="text-sm font-bold text-green-900 mb-2 flex items-center justify-between">
                            <span>Keep GitHub + Add Claude</span>
                            {aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison.deltaPercent !== null && (
                              <span className={`px-2 py-0.5 text-xs font-bold rounded ${aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison.deltaPercent >= 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                {aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison.deltaPercent >= 0 ? '+' : ''}{aiToolsData.incrementalROI.githubToClaudeCode.additive.roiComparison.deltaPercent}%
                              </span>
                            )}
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
                              <span className="text-xs font-medium text-gray-700">Incremental Cost</span>
                              <span className="text-lg font-bold text-orange-600">${aiToolsData.incrementalROI.githubToClaudeCode.additive.incrementalCost}/mo</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
                              <span className="text-xs font-medium text-gray-700">Data-Driven ROI</span>
                              <span className="text-lg font-bold text-green-700">{aiToolsData.incrementalROI.githubToClaudeCode.additive.incrementalROI.toFixed(1)}x</span>
                            </div>
                            {aiToolsData.incrementalROI.githubToClaudeCode.additive.industryBenchmark && (
                              <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                                <span className="text-gray-600">Industry Benchmark</span>
                                <span className="font-bold text-gray-700">{aiToolsData.incrementalROI.githubToClaudeCode.additive.industryBenchmark.incrementalROI.toFixed(1)}x</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* REPLACEMENT SCENARIO */}
                        <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
                          <h5 className="text-sm font-bold text-blue-900 mb-2 flex items-center justify-between">
                            <span>Replace GitHub with Claude</span>
                            {aiToolsData.incrementalROI.githubToClaudeCode.replacement.roiComparison.deltaPercent !== null && (
                              <span className={`px-2 py-0.5 text-xs font-bold rounded ${aiToolsData.incrementalROI.githubToClaudeCode.replacement.roiComparison.deltaPercent >= 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                {aiToolsData.incrementalROI.githubToClaudeCode.replacement.roiComparison.deltaPercent >= 0 ? '+' : ''}{aiToolsData.incrementalROI.githubToClaudeCode.replacement.roiComparison.deltaPercent}%
                              </span>
                            )}
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-white rounded border border-blue-200">
                              <span className="text-xs font-medium text-gray-700">Incremental Cost</span>
                              <span className="text-lg font-bold text-orange-600">${aiToolsData.incrementalROI.githubToClaudeCode.replacement.incrementalCost}/mo</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white rounded border border-blue-200">
                              <span className="text-xs font-medium text-gray-700">Data-Driven ROI</span>
                              <span className="text-lg font-bold text-blue-700">{aiToolsData.incrementalROI.githubToClaudeCode.replacement.incrementalROI.toFixed(1)}x</span>
                            </div>
                            {aiToolsData.incrementalROI.githubToClaudeCode.replacement.industryBenchmark && (
                              <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                                <span className="text-gray-600">Industry Benchmark</span>
                                <span className="font-bold text-gray-700">{aiToolsData.incrementalROI.githubToClaudeCode.replacement.industryBenchmark.incrementalROI.toFixed(1)}x</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sources */}
                      {aiToolsData.incrementalROI.githubToClaudeCode.industryBenchmark?.sources && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="text-xs font-semibold text-gray-700 mb-2">Industry Research Sources:</h5>
                          <div className="space-y-2">
                            {aiToolsData.incrementalROI.githubToClaudeCode.industryBenchmark.sources.map((source, idx) => (
                              <div key={idx} className="text-xs">
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                                >
                                  {source.title}
                                </a>
                                <p className="text-gray-600 mt-0.5">
                                  {source.author} ({source.year}) | n={source.sampleSize.toLocaleString()} | {source.findingHours} hrs/mo
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* M365 → Claude Enterprise Card */}
                    <div className="bg-white rounded-lg p-6 border-2 border-purple-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        M365 Copilot → Claude Enterprise
                      </h4>

                      {/* Shared Metrics */}
                      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                        <div className="p-2 bg-purple-50 rounded">
                          <p className="text-gray-600 mb-1">Incremental Hours/Mo</p>
                          <p className="text-lg font-bold text-gray-900">{aiToolsData.incrementalROI.m365ToClaudeEnterprise.incrementalHours}</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded">
                          <p className="text-gray-600 mb-1">Incremental Value/Mo</p>
                          <p className="text-lg font-bold text-green-600">${aiToolsData.incrementalROI.m365ToClaudeEnterprise.incrementalValue.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded">
                          <p className="text-gray-600 mb-1">Productivity Ratio</p>
                          <p className="text-lg font-bold text-indigo-600">{aiToolsData.incrementalROI.m365ToClaudeEnterprise.productivityRatio.toFixed(1)}x</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded">
                          <p className="text-gray-600 mb-1">Claude Messages/User</p>
                          <p className="text-lg font-bold text-purple-600">{aiToolsData.incrementalROI.m365ToClaudeEnterprise.claudeMessagesPerUser} vs {aiToolsData.incrementalROI.m365ToClaudeEnterprise.m365PromptsPerUser}</p>
                        </div>
                      </div>

                      {/* Two Scenarios Side-by-Side */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* ADDITIVE SCENARIO */}
                        <div className="border border-green-300 rounded-lg p-4 bg-green-50">
                          <h5 className="text-sm font-bold text-green-900 mb-2 flex items-center justify-between">
                            <span>Keep M365 + Add Claude</span>
                            {aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison.deltaPercent !== null && (
                              <span className={`px-2 py-0.5 text-xs font-bold rounded ${aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison.deltaPercent >= 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                {aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison.deltaPercent >= 0 ? '+' : ''}{aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.roiComparison.deltaPercent}%
                              </span>
                            )}
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
                              <span className="text-xs font-medium text-gray-700">Incremental Cost</span>
                              <span className="text-lg font-bold text-orange-600">${aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.incrementalCost}/mo</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
                              <span className="text-xs font-medium text-gray-700">Data-Driven ROI</span>
                              <span className="text-lg font-bold text-green-700">{aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.incrementalROI.toFixed(1)}x</span>
                            </div>
                            {aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.industryBenchmark && (
                              <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                                <span className="text-gray-600">Industry Benchmark</span>
                                <span className="font-bold text-gray-700">{aiToolsData.incrementalROI.m365ToClaudeEnterprise.additive.industryBenchmark.incrementalROI.toFixed(1)}x</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* REPLACEMENT SCENARIO */}
                        <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
                          <h5 className="text-sm font-bold text-blue-900 mb-2 flex items-center justify-between">
                            <span>Replace M365 with Claude</span>
                            {aiToolsData.incrementalROI.m365ToClaudeEnterprise.replacement.roiComparison.deltaPercent !== null && (
                              <span className={`px-2 py-0.5 text-xs font-bold rounded ${aiToolsData.incrementalROI.m365ToClaudeEnterprise.replacement.roiComparison.deltaPercent >= 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                {aiToolsData.incrementalROI.m365ToClaudeEnterprise.replacement.roiComparison.deltaPercent >= 0 ? '+' : ''}{aiToolsData.incrementalROI.m365ToClaudeEnterprise.replacement.roiComparison.deltaPercent}%
                              </span>
                            )}
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-white rounded border border-blue-200">
                              <span className="text-xs font-medium text-gray-700">Incremental Cost</span>
                              <span className="text-lg font-bold text-orange-600">${aiToolsData.incrementalROI.m365ToClaudeEnterprise.replacement.incrementalCost}/mo</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white rounded border border-blue-200">
                              <span className="text-xs font-medium text-gray-700">Data-Driven ROI</span>
                              <span className="text-lg font-bold text-blue-700">{aiToolsData.incrementalROI.m365ToClaudeEnterprise.replacement.incrementalROI.toFixed(1)}x</span>
                            </div>
                            {aiToolsData.incrementalROI.m365ToClaudeEnterprise.replacement.industryBenchmark && (
                              <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                                <span className="text-gray-600">Industry Benchmark</span>
                                <span className="font-bold text-gray-700">{aiToolsData.incrementalROI.m365ToClaudeEnterprise.replacement.industryBenchmark.incrementalROI.toFixed(1)}x</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sources or No Data Message */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-xs font-semibold text-gray-700 mb-2">
                          M365 Copilot Industry Research Sources ({aiToolsData.incrementalROI.m365ToClaudeEnterprise.industryBenchmark?.studyCount || 0} studies, {(aiToolsData.incrementalROI.m365ToClaudeEnterprise.industryBenchmark?.totalSampleSize || 0).toLocaleString()} total sample):
                        </h5>
                        {aiToolsData.incrementalROI.m365ToClaudeEnterprise.industryBenchmark?.sources && aiToolsData.incrementalROI.m365ToClaudeEnterprise.industryBenchmark.sources.length > 0 ? (
                          <div className="space-y-2">
                            {aiToolsData.incrementalROI.m365ToClaudeEnterprise.industryBenchmark.sources.map((source, idx) => (
                              <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-200 text-xs">
                                <p className="font-semibold text-gray-900">
                                  {source.url && source.url.startsWith('http') ? (
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                      {source.title}
                                    </a>
                                  ) : (
                                    source.title
                                  )}
                                </p>
                                <p className="text-gray-600 mt-1">
                                  {source.author} ({source.year}) • Sample: {typeof source.sampleSize === 'number' ? source.sampleSize.toLocaleString() : source.sampleSize} • {source.findingHours} hrs/mo
                                  {source.role && <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">{source.role.replace('_', ' ')}</span>}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-xs text-yellow-800 italic">
                              No M365 Copilot benchmark sources available. Using TechCo Inc internal data only.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Claude Enterprise Sources */}
                      {aiToolsData.incrementalROI.m365ToClaudeEnterprise.claudeEnterpriseSources && aiToolsData.incrementalROI.m365ToClaudeEnterprise.claudeEnterpriseSources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="text-xs font-semibold text-gray-700 mb-2">
                            Claude Enterprise Industry Research Sources ({aiToolsData.incrementalROI.m365ToClaudeEnterprise.claudeEnterpriseSources.length} studies):
                          </h5>
                          <div className="space-y-2">
                            {aiToolsData.incrementalROI.m365ToClaudeEnterprise.claudeEnterpriseSources.map((source, idx) => (
                              <div key={idx} className="p-2 bg-purple-50 rounded border border-purple-200 text-xs">
                                <p className="font-semibold text-gray-900">
                                  {source.url && source.url.startsWith('http') ? (
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                                      {source.title}
                                    </a>
                                  ) : (
                                    source.title
                                  )}
                                </p>
                                <p className="text-gray-600 mt-1">
                                  {source.author} ({source.year}) • Sample: {typeof source.sampleSize === 'number' ? source.sampleSize.toLocaleString() : source.sampleSize} • {source.findingHours} hrs/mo
                                  {source.role && <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{source.role.replace('_', ' ')}</span>}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-200">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      <strong>Methodology:</strong> Incremental ROI compares the additional productivity value gained minus the additional cost when upgrading from baseline tools (GitHub Copilot @ $19/mo, M365 Copilot @ $30/mo) to Claude tools. Industry benchmarks sourced from published research studies with weighted aggregation based on sample size, recency, and credibility. TechCo Inc's data-driven metrics calculated from actual usage patterns across {aiToolsData.claudeEnterprise.licensedUsers + aiToolsData.m365Copilot.licensedUsers + aiToolsData.claudeCode.licensedUsers} licensed users.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Claude Ent Department Penetration Analysis</h3>
                  <div style={{ height: `${Math.max(400, expansionOpportunities.length * 50)}px` }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={expansionOpportunities.sort((a, b) => b.totalEmployees - a.totalEmployees)} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="department" type="category" width={180} tick={{ fontSize: 11 }} interval={0} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="currentUsers" fill="#10b981" name="Current Users" stackId="a" />
                        <Bar dataKey="standardGap" fill="#3b82f6" name="Std Gap" stackId="a" />
                        <Bar dataKey="premiumGap" fill="#8b5cf6" name="Premium Gap" stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Claude Ent Engineering Expansion - Data-Driven Recommendation</h3>
                  {(() => {
                    // Find Engineering departments (Engineering + Agentic AI)
                    const engineeringDept = expansionOpportunities.find(d => d.department === 'Engineering') || {};
                    const agenticDept = expansionOpportunities.find(d => d.department === 'Agentic AI') || {};

                    const totalEng = (engineeringDept.totalEmployees || 0) + (agenticDept.totalEmployees || 0);
                    const currentEng = (engineeringDept.currentUsers || 0) + (agenticDept.currentUsers || 0);
                    const stdGap = (engineeringDept.standardGap || 0) + (agenticDept.standardGap || 0);
                    const premGap = (engineeringDept.premiumGap || 0) + (agenticDept.premiumGap || 0);
                    const upgrades = (engineeringDept.upgradesNeeded || 0) + (agenticDept.upgradesNeeded || 0);
                    const totalCost = (engineeringDept.totalAdditionalCost || 0) + (agenticDept.totalAdditionalCost || 0);
                    const totalValue = (engineeringDept.monthlyOpportunityCost || 0) + (agenticDept.monthlyOpportunityCost || 0);

                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Total Engineering Org</p>
                          <p className="text-2xl font-bold text-gray-900">{totalEng} people</p>
                          <p className="text-xs text-gray-500 mt-1">Ron's Engineering ({engineeringDept.totalEmployees || 0}) + Luis's Agentic AI ({agenticDept.totalEmployees || 0})</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Current Coverage</p>
                          <p className="text-2xl font-bold text-purple-600">{currentEng} users ({Math.round((currentEng / totalEng) * 100)}%)</p>
                          <p className="text-xs text-gray-500 mt-1">All Standard seats currently</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Recommended Add: Standard</p>
                          <p className="text-2xl font-bold text-blue-600">{stdGap} seats</p>
                          <p className="text-xs text-gray-500 mt-1">For typical usage patterns</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Recommended Add: Premium</p>
                          <p className="text-2xl font-bold text-purple-600">{premGap} seats</p>
                          <p className="text-xs text-gray-500 mt-1">{upgrades} upgrades from Standard based on power user scoring</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Monthly Investment</p>
                          <p className="text-2xl font-bold text-indigo-600">${totalCost.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">{stdGap} Std (${stdGap * 40}) + {upgrades} upgrades (${upgrades * 160})</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Annual Value Generated</p>
                          <p className="text-2xl font-bold text-green-700">${(totalValue * 12).toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">ROI: {totalCost > 0 ? (totalValue / totalCost).toFixed(1) : 0}x</p>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-xs text-gray-700">
                      <strong>Data-Driven Approach:</strong> Behavioral scoring (code writing, engagement, documents, complex work) identifies power users who truly need Premium. Most engineers can be highly productive with Standard seats.
                    </p>
                  </div>
                </div>
    </div>
  );
}
