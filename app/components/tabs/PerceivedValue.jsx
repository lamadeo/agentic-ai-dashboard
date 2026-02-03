import React from 'react';
import { Heart, ThumbsUp, ThumbsDown, TrendingUp, Tag, Quote, AlertCircle } from 'lucide-react';

/**
 * PerceivedValue Tab Component
 *
 * Displays employee sentiment analysis and perceived value metrics for AI tools.
 * Data collected from Slack, Confluence, surveys, and interviews analyzed with Claude API.
 *
 * @param {Object} props
 * @param {Object} props.perceivedValueData - Complete perceived value data
 * @param {Object} props.perceivedValueData.perceivedValue - Tool-specific perceived value data
 * @param {Object} props.perceivedValueData.summary - Summary stats and metadata
 * @param {string} props.perceivedValueData.lastUpdated - ISO timestamp of last update
 */
const PerceivedValue = ({ perceivedValueData }) => {
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBg = (score) => {
    if (score >= 85) return 'bg-green-50';
    if (score >= 70) return 'bg-blue-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-orange-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Perceived Value & Sentiment Analysis</h2>
        <p className="text-gray-600 mb-6">Employee feedback from Slack, Confluence, surveys, and interviews analyzed with Claude API</p>
      </div>

      {/* Overview Cards for All Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries(perceivedValueData.perceivedValue).map(([toolName, data]) => (
          <div key={toolName} className={`${getScoreBg(data.score)} rounded-lg shadow-md p-6 border border-gray-200`}>
            <div className="flex items-center justify-between mb-4">
              <Heart className={`h-6 w-6 ${getScoreColor(data.score)}`} />
              <span className={`text-sm font-medium ${getScoreColor(data.score)}`}>
                {data.totalFeedback} responses
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{toolName}</h3>
            <div className={`text-4xl font-bold ${getScoreColor(data.score)} mb-2`}>
              {data.score}
            </div>
            <p className="text-xs text-gray-500">Perceived Value Score</p>
            <div className="mt-4 flex gap-2 text-xs">
              <span className="flex items-center gap-1 text-green-600">
                <ThumbsUp className="h-3 w-3" /> {data.sentimentBreakdown.positive}
              </span>
              <span className="flex items-center gap-1 text-orange-600">
                <ThumbsDown className="h-3 w-3" /> {data.sentimentBreakdown.negative}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tool-by-Tool Deep Dive */}
      {Object.entries(perceivedValueData.perceivedValue).map(([toolName, toolData]) => (
        <div key={toolName} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-blue-600" />
            {toolName} - Detailed Sentiment Analysis
          </h3>

          {/* Sentiment Breakdown */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Sentiment Distribution</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-3xl font-bold text-green-600">{toolData.sentimentBreakdown.positive}</div>
                <div className="text-sm text-gray-600 mt-1">Positive</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-3xl font-bold text-gray-600">{toolData.sentimentBreakdown.neutral}</div>
                <div className="text-sm text-gray-600 mt-1">Neutral</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="text-3xl font-bold text-orange-600">{toolData.sentimentBreakdown.negative}</div>
                <div className="text-sm text-gray-600 mt-1">Negative</div>
              </div>
            </div>
          </div>

          {/* Top Impacts */}
          {toolData.topImpacts && toolData.topImpacts.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Quantified Impact
              </h4>
              <div className="space-y-3">
                {toolData.topImpacts.map((impact, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-semibold text-gray-900 capitalize">{impact.task.replace(/_/g, ' ')}</span>
                        <span className="text-sm text-gray-600 ml-2">by {impact.source}</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{impact.reduction}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Themes */}
          {toolData.themes && toolData.themes.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" />
                Top Themes
              </h4>
              <div className="flex flex-wrap gap-2">
                {toolData.themes.slice(0, 10).map((theme, idx) => (
                  <span key={idx} className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium capitalize">
                    {theme.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Representative Quotes */}
          {toolData.quotes && toolData.quotes.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Quote className="h-5 w-5 text-blue-600" />
                Representative Quotes
              </h4>
              <div className="space-y-4">
                {toolData.quotes.map((quote, idx) => {
                  const isChallenge = quote.type === 'challenge';
                  const borderColor = isChallenge ? 'border-orange-500 bg-orange-50' : 'border-blue-500 bg-blue-50';

                  return (
                    <div key={idx} className={`border-l-4 ${borderColor} rounded-lg p-4`}>
                      <p className="text-gray-900 italic mb-3">"{quote.text}"</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">{quote.author}</span>
                          <span className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200 capitalize">
                            {quote.context ? quote.context.replace(/_/g, ' ') : 'feedback'}
                          </span>
                          {quote.impact && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              {quote.impact.reduction} time saved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Challenges */}
          {toolData.challenges && toolData.challenges.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Challenges & Areas for Improvement
              </h4>
              <div className="space-y-3">
                {toolData.challenges.map((challenge, idx) => (
                  <div key={idx} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <p className="text-sm text-gray-700">{challenge}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Department Sentiment Breakdown */}
          {toolData.departmentSentiment && toolData.departmentSentiment.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Sentiment by Department</h4>
              <div className="space-y-3">
                {toolData.departmentSentiment.map((dept, idx) => {
                  const scorePercent = ((dept.score + 1) / 2) * 100;
                  const scoreColor = dept.score > 0.6 ? 'bg-green-500' : dept.score > 0.3 ? 'bg-blue-500' : dept.score > 0 ? 'bg-yellow-500' : 'bg-red-500';

                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-40 text-sm font-medium text-gray-700">{dept.department}</div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-6 relative">
                          <div className={`h-6 rounded-full ${scoreColor} flex items-center justify-end pr-2`} style={{ width: `${scorePercent}%` }}>
                            <span className="text-xs font-medium text-white">{dept.score.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-20 text-right text-sm text-gray-500">{dept.count} responses</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Unique Messages</p>
            <p className="text-3xl font-bold text-blue-600">{perceivedValueData.summary.uniqueMessages || perceivedValueData.summary.sourceBreakdown.slack}</p>
            <p className="text-xs text-gray-500 mt-1">Original feedback items</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Tool-Specific Feedback</p>
            <p className="text-3xl font-bold text-blue-600">{perceivedValueData.summary.totalFeedbackAnalyzed}</p>
            <p className="text-xs text-gray-500 mt-1">After multi-tool analysis</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Multi-Tool Messages</p>
            <p className="text-3xl font-bold text-indigo-600">{perceivedValueData.summary.multiToolMessages || (perceivedValueData.summary.totalFeedbackAnalyzed - perceivedValueData.summary.sourceBreakdown.slack)}</p>
            <p className="text-xs text-gray-500 mt-1">Comparative statements</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Confluence Surveys</p>
            <p className="text-3xl font-bold text-blue-600">{perceivedValueData.summary.sourceBreakdown.confluence}</p>
            <p className="text-xs text-gray-500 mt-1">Engineering teams</p>
          </div>
        </div>
        {perceivedValueData.summary.explanation && (
          <div className="mt-4 p-3 bg-white rounded border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium text-blue-600">Note:</span> {perceivedValueData.summary.explanation}
            </p>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-4">
          Last updated: {new Date(perceivedValueData.lastUpdated).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default PerceivedValue;
