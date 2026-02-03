import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { FolderOpen, Users, TrendingUp, Star, FileText, Sparkles, AlertCircle } from 'lucide-react';

/**
 * ClaudeProjects Tab Component
 *
 * Displays Claude Enterprise Projects analytics including:
 * - Summary KPIs
 * - Top projects table
 * - Projects by department
 * - Creator leaderboard
 * - Category breakdown
 * - Featured projects showcase
 *
 * @param {Object} props - Component props
 * @param {Object} props.aiToolsData - Complete AI tools data from ai-tools-data.json
 * @returns {JSX.Element} ClaudeProjects tab content
 */
export default function ClaudeProjects({ aiToolsData }) {
  const projects = aiToolsData.claudeEnterprise?.projectsAnalytics || {};
  const summary = projects.summary || {};
  const topProjects = projects.topProjects || [];
  const byDepartment = projects.byDepartment || [];
  const byCreator = projects.byCreator || [];
  const byCategory = projects.byCategory || [];
  const monthlyTrend = projects.monthlyTrend || [];
  const featuredProjects = projects.featuredProjects || [];
  const insights = projects.insights || {};

  // Medal emojis for top 3
  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  // Badge styles for featured projects
  const getBadgeStyle = (badge) => {
    const styles = {
      'top-rated': 'bg-purple-100 text-purple-700',
      'knowledge-hub': 'bg-blue-100 text-blue-700',
      'power-user': 'bg-orange-100 text-orange-700',
      'hr-champion': 'bg-green-100 text-green-700'
    };
    return styles[badge] || 'bg-gray-100 text-gray-700';
  };

  // Category colors for pie chart
  const CATEGORY_COLORS = {
    content: '#8B5CF6',
    sales: '#3B82F6',
    technical: '#10B981',
    hr: '#F59E0B',
    analysis: '#EC4899',
    other: '#6B7280'
  };

  // Format category labels
  const formatCategory = (category) => {
    const labels = {
      content: 'Content',
      sales: 'Sales',
      technical: 'Technical',
      hr: 'HR',
      analysis: 'Analysis',
      other: 'Other'
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* Header with Summary KPIs */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-blue-600" />
          Claude Enterprise Projects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Total Projects */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Projects</p>
            <p className="text-3xl font-bold text-blue-600">
              {summary.totalProjects || 0}
            </p>
            <p className="text-xs text-gray-500">All time</p>
          </div>

          {/* Active Projects */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Active Projects</p>
            <p className="text-3xl font-bold text-green-600">
              {summary.activeProjects || 0}
            </p>
            <p className="text-xs text-gray-500">Updated in 30 days</p>
          </div>

          {/* Project Creators */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Project Creators</p>
            <p className="text-3xl font-bold text-purple-600">
              {summary.uniqueCreators || 0}
            </p>
            <p className="text-xs text-gray-500">Unique users</p>
          </div>

          {/* With Documents */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">With Documents</p>
            <p className="text-3xl font-bold text-indigo-600">
              {summary.withDocs || 0}
            </p>
            <p className="text-xs text-gray-500">Knowledge-enabled</p>
          </div>

          {/* With Prompt Templates */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">With Prompts</p>
            <p className="text-3xl font-bold text-orange-600">
              {summary.withPrompts || 0}
            </p>
            <p className="text-xs text-gray-500">Custom instructions</p>
          </div>

          {/* Avg Sophistication */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Avg Sophistication</p>
            <p className="text-3xl font-bold text-teal-600">
              {summary.avgSophistication || 0}
            </p>
            <p className="text-xs text-gray-500">Quality score (0-100)</p>
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Featured Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredProjects.map((project, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 truncate flex-1">{project.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getBadgeStyle(project.badge)}`}>
                    {project.reason}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">{project.creator}</span> | {project.department}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {project.docCount} docs
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {project.sophisticationScore} score
                  </span>
                  <span className="capitalize">{project.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Top Projects + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Projects Table */}
        {topProjects.length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Projects by Sophistication</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Creator</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dept</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Docs</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topProjects.slice(0, 15).map((project, index) => (
                    <tr key={project.rank} className={index < 3 ? 'bg-blue-50' : ''}>
                      <td className="px-3 py-2 text-sm">
                        {getMedal(project.rank)} {project.rank}
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 max-w-[200px] truncate">
                        {project.name}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600">{project.creator}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{project.department}</td>
                      <td className="px-3 py-2 text-sm text-right text-blue-600">{project.docCount}</td>
                      <td className="px-3 py-2 text-sm text-right">
                        <span className={`font-semibold ${
                          project.sophisticationScore >= 70 ? 'text-green-600' :
                          project.sophisticationScore >= 40 ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {project.sophisticationScore}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <span className="capitalize text-gray-600">{project.category}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Category Distribution */}
        {byCategory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Categories</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ label, percentage }) => `${formatCategory(label)} ${percentage}%`}
                    labelLine={false}
                  >
                    {byCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.category] || '#6B7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, formatCategory(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {byCategory.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#6B7280' }}
                    />
                    {cat.label || formatCategory(cat.category)}
                  </span>
                  <span className="text-gray-600">{cat.count} ({cat.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Department Chart + Creator Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Department */}
        {byDepartment.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects by Department</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={byDepartment.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="department" type="category" tick={{ fontSize: 12 }} width={95} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="projects" fill="#3B82F6" name="Total Projects" />
                  <Bar dataKey="activeProjects" fill="#10B981" name="Active" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Creator Leaderboard */}
        {byCreator.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Top Project Creators
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dept</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Projects</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Docs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {byCreator.slice(0, 12).map((creator, index) => (
                    <tr key={creator.email} className={index < 3 ? 'bg-yellow-50' : ''}>
                      <td className="px-3 py-2 text-sm">
                        {getMedal(creator.rank)} {creator.rank}
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">{creator.name}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{creator.department}</td>
                      <td className="px-3 py-2 text-sm text-right font-semibold text-blue-600">
                        {creator.projects}
                      </td>
                      <td className="px-3 py-2 text-sm text-right text-gray-600">
                        {creator.totalDocs}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      {monthlyTrend.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Creation Timeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="created"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#colorCreated)"
                  name="Projects Created"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {aiToolsData.insights?.projectsOverview && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-md p-6 border border-amber-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Key Insights
          </h3>
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {aiToolsData.insights.projectsOverview}
          </div>
        </div>
      )}

      {/* Methodology Note */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Sophistication Score:</span> Calculated based on documents attached (30 pts max),
            prompt template usage (30 pts max), description quality (15 pts), and recency (20 pts).
            Active projects are those updated within the last 30 days.
          </div>
        </div>
      </div>
    </div>
  );
}
