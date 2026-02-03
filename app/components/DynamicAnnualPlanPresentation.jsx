"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Loader } from 'lucide-react';

/**
 * Dynamic Annual Plan Presentation (Beta)
 * Loads AI-generated presentation structure from ai-projects-presentation-dynamic.json
 *
 * Features:
 * - Context-aware slide generation based on temporal analysis
 * - Adaptive narrative (NEW_PLAN, PROGRESS_UPDATE, PIVOT, etc.)
 * - Dynamic slide count and content based on current state
 */
const DynamicAnnualPlanPresentation = () => {
  const [presentationData, setPresentationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Load AI-generated presentation data
  useEffect(() => {
    fetch('/ai-projects-presentation-dynamic.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('Presentation data not found. Run npm run refresh-annual-plan with USE_AI_PRESENTER=true to generate.');
        }
        return res.json();
      })
      .then(data => {
        setPresentationData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dynamic presentation:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const nextSlide = () => {
    if (presentationData && currentSlide < presentationData.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const exportToPDF = () => {
    alert('PDF export will be implemented in a future update');
  };

  // Helper: Build project ID to name mapping from presentation data
  const getProjectNameMapping = (presentationData) => {
    const mapping = {};

    // Find portfolio_overview slide which contains all projects
    const portfolioSlide = presentationData?.slides?.find(s => s.type === 'portfolio_overview');
    if (portfolioSlide?.content?.projects) {
      portfolioSlide.content.projects.forEach(p => {
        // Extract ID from project string like "OP-000: Full Name"
        const match = p.project.match(/^(OP-\d+):/);
        if (match) {
          const projectId = match[1];
          mapping[projectId] = p.project; // "OP-000: Full Name"
        }
      });
    }

    return mapping;
  };

  // Helper: Enrich project ID with full name
  const enrichProjectId = (projectId, mapping) => {
    return mapping[projectId] || projectId;
  };

  // Helper: Enrich project IDs within text
  const enrichProjectIdsInText = (text, mapping) => {
    if (!text) return text;
    // Replace all OP-XXX patterns with full project names
    return text.replace(/\b(OP-\d+)\b/g, (match, projectId) => {
      return mapping[projectId] || match;
    });
  };

  // Helper: Render sparse content warning with dynamic error details
  const renderSparseContentWarning = (slideType, errorDetails) => {
    // If we have specific error details from metadata, show them
    if (errorDetails) {
      return (
        <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-6">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">AI Generation Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p className="font-semibold">Error Type: {errorDetails.type}</p>
                <p className="mt-1 bg-red-100 p-2 rounded font-mono text-xs break-words">{errorDetails.message}</p>
                <p className="mt-2 text-xs text-red-600">
                  Phase: {errorDetails.phase} | Time: {new Date(errorDetails.timestamp).toLocaleString()}
                </p>
                <p className="mt-3 font-semibold">To fix:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1 ml-2">
                  <li>Review the error message above to understand what failed</li>
                  <li>Run <code className="bg-red-100 px-1 rounded font-mono text-xs">npm run refresh-annual-plan</code> to retry generation</li>
                  <li>If issue persists, check logs or increase Node.js memory: <code className="bg-red-100 px-1 rounded font-mono text-xs">node --max-old-space-size=4096 scripts/generate-annual-plan.js</code></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Generic warning for sparse content (no specific error captured)
    return (
      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6">
        <div className="flex items-start">
          <svg className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Limited Content Available</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>This slide has minimal content. Run <code className="bg-yellow-100 px-1 rounded font-mono text-xs">npm run refresh-annual-plan</code> to regenerate with full AI analysis.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render slide content based on type
  const renderSlide = (slide, meta, projectNameMapping = {}) => {
    const content = slide.content || {};

    switch (slide.type) {
      case 'title':
        return (
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">{slide.title}</h1>
            {slide.subtitle && (
              <p className="text-2xl text-gray-600">{slide.subtitle}</p>
            )}
            {content.presenter && (
              <p className="text-xl text-gray-700 mt-8">{content.presenter}</p>
            )}
            {content.date && (
              <p className="text-lg text-gray-500">{new Date(content.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
            {content.organization && (
              <p className="text-lg text-gray-500">{content.organization}</p>
            )}
          </div>
        );

      case 'executive_summary':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{slide.title}</h2>

            {/* BLUF Section */}
            {content.bluf && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
                <h3 className="text-xl font-bold text-blue-900 mb-3">Bottom Line Up Front</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Headline</p>
                    <p className="text-lg text-gray-900">{content.bluf.headline}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Impact</p>
                    <p className="text-lg text-gray-900">{content.bluf.impact}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Approach</p>
                    <p className="text-lg text-gray-900">{content.bluf.approach}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Confidence</p>
                    <p className="text-lg text-gray-900">{content.bluf.confidence}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Key Points */}
            {content.keyPoints && content.keyPoints.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {content.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-600 mr-3 mt-1 text-xl">•</span>
                      <span className="text-lg text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {content.recommendations && content.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {content.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1 text-xl">→</span>
                      <span className="text-lg text-gray-700">{enrichProjectIdsInText(rec, projectNameMapping)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'strategic_context':
        const hasSparseContent = content.note && typeof content.note === 'string';
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{slide.title}</h2>
            {hasSparseContent && (
              <>
                <p className="text-lg text-gray-600 italic">{content.note}</p>
                {renderSparseContentWarning(slide.type, meta?.error)}
              </>
            )}
          </div>
        );

      case 'portfolio_overview':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{slide.title}</h2>

            {/* Summary Stats */}
            {content.projectCount && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-blue-700">Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{content.projectCount}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-green-700">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">{content.totalValue}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-purple-700">Avg ROI</p>
                  <p className="text-2xl font-bold text-gray-900">{content.avgROI}</p>
                </div>
              </div>
            )}

            {/* Projects Table */}
            {content.projects && content.projects.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">#</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Project</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase">Score</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase">Value</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase">ROI</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase">Quarter</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {content.projects.slice(0, 7).map((proj) => (
                      <tr key={proj.rank} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{proj.rank}</td>
                        <td className="px-3 py-2 text-sm text-gray-700">{proj.project}</td>
                        <td className="px-3 py-2 text-sm text-center font-semibold text-blue-600">{proj.score}</td>
                        <td className="px-3 py-2 text-sm text-center text-gray-700">{proj.value}</td>
                        <td className="px-3 py-2 text-sm text-center text-gray-700">{proj.roi}</td>
                        <td className="px-3 py-2 text-sm text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            proj.qStart === 'Q1' ? 'bg-red-100 text-red-700' :
                            proj.qStart === 'Q2' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {proj.qStart}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'quarterly_roadmap':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{slide.title}</h2>

            {content.schedule && (
              <div className="grid grid-cols-2 gap-6">
                {['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => {
                  const qData = content.schedule[quarter];
                  if (!qData) return null;

                  const utilizationPercent = qData.capacity > 0 ? Math.round((qData.allocated / qData.capacity) * 100) : 0;
                  const isOverAllocated = utilizationPercent > 90;
                  const isCurrentQuarter = quarter === content.currentQuarter;

                  return (
                    <div key={quarter} className={`border-2 rounded-lg p-4 ${
                      isCurrentQuarter ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{quarter}</h3>
                        {isCurrentQuarter && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">CURRENT</span>
                        )}
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-semibold">{qData.allocated}/{qData.capacity} days</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              isOverAllocated ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{utilizationPercent}% utilized</span>
                          <span>{qData.buffer} days buffer</span>
                        </div>
                      </div>

                      {qData.projects && qData.projects.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            {qData.committed ? 'Committed:' : 'Potential:'}
                          </p>
                          <ul className="space-y-1">
                            {qData.projects.map((proj, idx) => (
                              <li key={idx} className="text-sm text-gray-600">• {proj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'q1_committed':
        const hasQ1SparseContent = content.note && typeof content.note === 'string';
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{slide.title}</h2>
            {hasQ1SparseContent && (
              <>
                <p className="text-lg text-gray-600 italic">{content.note}</p>
                {renderSparseContentWarning(slide.type, meta?.error)}
              </>
            )}
          </div>
        );

      case 'resource_capacity':
        const hasResourceSparseContent = content.note && typeof content.note === 'string';
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{slide.title}</h2>
            {hasResourceSparseContent && (
              <>
                <p className="text-lg text-gray-600 italic">{content.note}</p>
                {renderSparseContentWarning(slide.type, meta?.error)}
              </>
            )}
          </div>
        );

      case 'dependencies_risks':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{slide.title}</h2>

            {/* Execution Gaps */}
            {content.gaps?.execution && content.gaps.execution.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-red-700 mb-3">⚠️ Execution Risks</h3>
                <div className="space-y-3">
                  {content.gaps.execution.map((gap, idx) => (
                    <div key={idx} className="bg-red-50 border-l-4 border-red-500 p-4">
                      <p className="font-semibold text-red-900">{enrichProjectId(gap.projectId, projectNameMapping)}</p>
                      <div className="text-sm text-red-700 mt-1">
                        <p>Progress: {gap.progress}% (Planned: {gap.plannedQuarter}, Current: {gap.currentQuarter})</p>
                        <p>Impact Score: {gap.impact.toFixed(1)}</p>
                        {gap.blockers && gap.blockers.length > 0 && (
                          <p>Blockers: {gap.blockers.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resource Gaps */}
            {content.gaps?.resource && content.gaps.resource.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-yellow-700 mb-3">⚠️ Resource Constraints</h3>
                <div className="space-y-3">
                  {content.gaps.resource.map((gap, idx) => (
                    <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                      <p className="font-semibold text-yellow-900">{gap.quarter}: {gap.issue}</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Allocated: {gap.allocated}/{gap.capacity} days (Buffer: {gap.buffer} days)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects at Risk */}
            {content.projectsAtRisk && content.projectsAtRisk.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-orange-700 mb-3">🚨 Projects At Risk</h3>
                <ul className="space-y-2">
                  {content.projectsAtRisk.map((proj, idx) => (
                    <li key={idx} className="text-gray-700">• {enrichProjectId(proj, projectNameMapping)}</li>
                  ))}
                </ul>
              </div>
            )}

            {(!content.gaps || (
              (!content.gaps.execution || content.gaps.execution.length === 0) &&
              (!content.gaps.resource || content.gaps.resource.length === 0)
            )) && (!content.projectsAtRisk || content.projectsAtRisk.length === 0) && (
              <div className="bg-green-50 border-l-4 border-green-500 p-6">
                <p className="text-green-800 font-semibold">✓ No significant risks or dependencies identified</p>
              </div>
            )}
          </div>
        );

      case 'next_steps':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{slide.title}</h2>

            {content.recommendations && content.recommendations.length > 0 && (
              <div className="space-y-4">
                {content.recommendations.map((rec, idx) => {
                  // Use full Tailwind class names for JIT compilation
                  const bgClass =
                    rec.priority === 'high' ? 'bg-red-50' :
                    rec.priority === 'medium' ? 'bg-yellow-50' : 'bg-blue-50';
                  const borderClass =
                    rec.priority === 'high' ? 'border-red-500' :
                    rec.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500';
                  const badgeBgClass =
                    rec.priority === 'high' ? 'bg-red-100' :
                    rec.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100';
                  const badgeTextClass =
                    rec.priority === 'high' ? 'text-red-800' :
                    rec.priority === 'medium' ? 'text-yellow-800' : 'text-blue-800';

                  return (
                    <div key={idx} className={`${bgClass} border-l-4 ${borderClass} p-5`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${badgeBgClass} ${badgeTextClass} mr-3`}>
                              {rec.priority} Priority
                            </span>
                            <span className="text-xs text-gray-600">{rec.type}</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-lg mb-2">{enrichProjectIdsInText(rec.action, projectNameMapping)}</p>
                          {rec.reason && (
                            <p className="text-sm text-gray-700 mb-2">
                              <span className="font-semibold">Why:</span> {enrichProjectIdsInText(rec.reason, projectNameMapping)}
                            </p>
                          )}
                          <div className="flex items-center text-sm text-gray-600 mt-2">
                            {rec.owner && (
                              <span className="mr-4">
                                <span className="font-semibold">Owner:</span> {rec.owner}
                              </span>
                            )}
                            {rec.timeline && (
                              <span>
                                <span className="font-semibold">Timeline:</span> {rec.timeline}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      default:
        // Fallback for unknown slide types
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">{slide.title}</h2>
            <div className="bg-gray-50 border-l-4 border-gray-400 p-6">
              <p className="text-gray-700 font-semibold mb-2">Unsupported slide type: {slide.type}</p>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">View raw data</summary>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-4 rounded mt-2 overflow-auto max-h-96">
                  {JSON.stringify(slide, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading AI-generated presentation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="max-w-2xl text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Presentation Not Available</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="bg-gray-50 p-4 rounded-lg text-left">
            <p className="text-sm font-semibold text-gray-900 mb-2">To generate the dynamic presentation:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Ensure <code className="bg-gray-200 px-1 rounded">USE_AI_PRESENTER=true</code> in your .env file</li>
              <li>Run <code className="bg-gray-200 px-1 rounded">npm run refresh-annual-plan</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!presentationData || !presentationData.slides || presentationData.slides.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">
        <div className="text-center">
          <p className="text-lg text-gray-600">No slides available</p>
        </div>
      </div>
    );
  }

  const currentSlideData = presentationData.slides[currentSlide];
  const metadata = presentationData.metadata || {};
  const projectNameMapping = getProjectNameMapping(presentationData);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with metadata */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dynamic Annual Plan (Beta)</h1>
            <p className="text-sm text-gray-600">
              AI-Generated • {metadata.narrativeType || 'Unknown'} • Generated: {metadata.generatedAt ? new Date(metadata.generatedAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl p-12">
          {/* Render slide based on type */}
          {renderSlide(currentSlideData, metadata, projectNameMapping)}
        </div>
      </div>

      {/* Footer with navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentSlide === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>

          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">
              Slide {currentSlide + 1} of {presentationData.slides.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">{currentSlideData.title}</p>
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === presentationData.slides.length - 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentSlide === presentationData.slides.length - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicAnnualPlanPresentation;
