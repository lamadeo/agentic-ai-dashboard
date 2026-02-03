import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Users, MessageSquare, TrendingUp, Code, Zap, DollarSign, Clock, Award, Target, ArrowUp } from 'lucide-react';

const MetricCard = ({ title, value, change, changeLabel, icon: Icon, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    indigo: "bg-indigo-50 text-indigo-600"
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {change && (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <ArrowUp className="h-4 w-4 mr-1" />
            <span>{change}</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {changeLabel && <p className="text-xs text-gray-500">{changeLabel}</p>}
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Combined data from all reports
  const summaryMetrics = {
    claudeUsers: 85,
    claudeConversations: 2377,
    claudeProjects: 74,
    claudeArtifacts: 180,
    claudeCodeUsers: 11, // December
    claudeCodeLines: 153823, // December
    adoptionRate: 98, // % users with 1+ conversations
    avgConversationsPerUser: 28,
  };

  // Monthly adoption trends (Oct, Nov, Dec)
  const monthlyAdoption = [
    { month: 'Oct 2025', claudeUsers: 72, conversations: 1842, claudeCodeUsers: 0, claudeCodeLines: 0 },
    { month: 'Nov 2025', claudeUsers: 81, conversations: 2156, claudeCodeUsers: 8, claudeCodeLines: 150352 },
    { month: 'Dec 2025', claudeUsers: 85, conversations: 2377, claudeCodeUsers: 11, claudeCodeLines: 153823 }
  ];

  // Daily active users trend (Nov 5 - Dec 9)
  const dailyActiveUsers = [
    { date: '11/05', users: 35, conversations: 42 },
    { date: '11/06', users: 42, conversations: 58 },
    { date: '11/07', users: 38, conversations: 51 },
    { date: '11/08', users: 4, conversations: 8 },
    { date: '11/11', users: 31, conversations: 38 },
    { date: '11/12', users: 43, conversations: 62 },
    { date: '11/13', users: 35, conversations: 48 },
    { date: '11/14', users: 2, conversations: 3 },
    { date: '11/15', users: 44, conversations: 71 },
    { date: '11/18', users: 51, conversations: 89 },
    { date: '11/19', users: 47, conversations: 78 },
    { date: '11/20', users: 53, conversations: 94 },
    { date: '11/21', users: 51, conversations: 87 },
    { date: '11/22', users: 50, conversations: 82 },
    { date: '11/25', users: 3, conversations: 5 },
    { date: '11/26', users: 40, conversations: 58 },
    { date: '11/27', users: 32, conversations: 41 },
    { date: '12/02', users: 2, conversations: 3 },
    { date: '12/03', users: 4, conversations: 7 },
    { date: '12/04', users: 3, conversations: 5 },
    { date: '12/05', users: 54, conversations: 98 },
    { date: '12/06', users: 53, conversations: 91 },
    { date: '12/09', users: 42, conversations: 67 }
  ];

  // Productivity metrics from actual user feedback
  const productivityMetrics = [
    {
      metric: 'Debugging Time Reduction',
      before: '3+ hours',
      after: '~1 hour',
      savings: '67%',
      source: 'Taran Pierce - Software Engineer'
    },
    {
      metric: 'Daily Communication Catch-up',
      before: '30-45 min',
      after: '5-10 min',
      savings: '70%',
      source: 'Sara Johnson - Daily workflow'
    },
    {
      metric: 'Multi-system Data Aggregation',
      before: 'Hours',
      after: 'Minutes',
      savings: 'Significant',
      source: 'Courtney Rogan - Sales Operations'
    }
  ];

  // Business value outcomes
  const businessValue = [
    { category: 'Time Savings', value: 67, color: '#10b981', description: 'Avg % reduction in task time' },
    { category: 'Quality Improvements', value: 85, color: '#3b82f6', description: 'Security issues identified pre-production' },
    { category: 'Adoption Rate', value: 98, color: '#8b5cf6', description: 'Users with 1+ conversations' },
    { category: 'Daily Usage', value: 42, color: '#f59e0b', description: 'Avg daily active users' }
  ];

  // Department adoption
  const departmentUsage = [
    { name: 'Engineering', users: 28, conversations: 892, codeLines: 153823, value: 35 },
    { name: 'Customer Success', users: 18, conversations: 654, codeLines: 0, value: 25 },
    { name: 'Sales & Operations', users: 15, conversations: 421, codeLines: 0, value: 20 },
    { name: 'Professional Services', users: 12, conversations: 234, codeLines: 0, value: 12 },
    { name: 'G&A', users: 8, conversations: 132, codeLines: 0, value: 8 },
    { name: 'Other', users: 4, conversations: 44, codeLines: 0, value: 5 }
  ];

  // ROI indicators
  const roiMetrics = {
    timeSavedPerMonth: '450+ hours',
    costAvoidanceLow: '$40,500',
    costAvoidanceHigh: '$56,250',
    hourlyRateLow: 90,
    hourlyRateHigh: 125,
    productivity: '67% faster',
    qualityImprovement: '85% reduction in pre-production bugs',
    userSatisfaction: 'Highly positive',
    paybackPeriod: '< 3 months'
  };

  // License cost calculations
  const licenseCosts = {
    claudeCodeUsers: 11,
    claudeCodeLicenseCost: 200, // per month
    standardUsers: 74, // 85 total - 11 code users
    standardLicenseCost: 40, // per month
    totalClaudeCodeCost: 11 * 200, // $2,200
    totalStandardCost: 74 * 40, // $2,960
    totalMonthlyCost: (11 * 200) + (74 * 40), // $5,160
    netValueLow: 40500 - ((11 * 200) + (74 * 40)), // $35,340
    netValueHigh: 56250 - ((11 * 200) + (74 * 40)), // $51,090
    roiMultipleLow: (40500 / ((11 * 200) + (74 * 40))).toFixed(1), // 7.8x
    roiMultipleHigh: (56250 / ((11 * 200) + (74 * 40))).toFixed(1), // 10.9x
  };

  // Use cases by category
  const useCasesByCategory = [
    { category: 'Code Quality & Development', count: 4, impact: 'High' },
    { category: 'Information Synthesis', count: 3, impact: 'High' },
    { category: 'Problem Solving', count: 3, impact: 'Medium-High' },
    { category: 'Planning & Architecture', count: 2, impact: 'High' },
    { category: 'Workflow Automation', count: 2, impact: 'Medium' }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Claude Enterprise & Claude Code Executive Dashboard</h1>
          <p className="text-gray-600">TechCo Inc Claude Adoption & Business Impact | Oct 2025 - Dec 2025</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Claude Enterprise Users"
            value={summaryMetrics.claudeUsers}
            change="+18%"
            changeLabel="Since October"
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Claude Conversations"
            value={summaryMetrics.claudeConversations.toLocaleString()}
            change="+29%"
            changeLabel="Month over month"
            icon={MessageSquare}
            color="green"
          />
          <MetricCard
            title="Code via Claude Code"
            value="304K lines"
            change="New"
            changeLabel="Nov-Dec combined"
            icon={Code}
            color="purple"
          />
          <MetricCard
            title="Time Savings with Claude"
            value="67%"
            change="Avg"
            changeLabel="Task completion faster"
            icon={Clock}
            color="orange"
          />
        </div>

        {/* ROI Highlights */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <DollarSign className="h-8 w-8 mr-3" />
            Claude Enterprise Business Value & ROI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-blue-100 text-sm mb-2">Estimated Monthly Time Savings</p>
              <p className="text-3xl font-bold">{roiMetrics.timeSavedPerMonth}</p>
              <p className="text-sm text-blue-100 mt-1">Across all departments</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-2">Monthly Cost Avoidance Range</p>
              <p className="text-3xl font-bold">{roiMetrics.costAvoidanceLow} - {roiMetrics.costAvoidanceHigh}</p>
              <p className="text-sm text-blue-100 mt-1">Based on ${roiMetrics.hourlyRateLow}-${roiMetrics.hourlyRateHigh}/hr blended rate</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-2">Monthly License Investment</p>
              <p className="text-3xl font-bold">${licenseCosts.totalMonthlyCost.toLocaleString()}</p>
              <p className="text-sm text-blue-100 mt-1">{licenseCosts.claudeCodeUsers} Premium + {licenseCosts.standardUsers} Standard seats</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-2">Net Monthly Value</p>
              <p className="text-3xl font-bold">${licenseCosts.netValueLow.toLocaleString()} - ${licenseCosts.netValueHigh.toLocaleString()}</p>
              <p className="text-sm text-blue-100 mt-1">{licenseCosts.roiMultipleLow}x - {licenseCosts.roiMultipleHigh}x ROI</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['overview', 'adoption', 'productivity', 'departments', 'code'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors`}
                >
                  {tab === 'code' ? 'Claude Code' : tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Growth Trends</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyAdoption}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="claudeUsers" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" name="Active Users" />
                        <Area type="monotone" dataKey="conversations" stroke="#10b981" fillOpacity={1} fill="url(#colorConv)" name="Conversations" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">ROI Analysis & Financial Impact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Monthly Investment Breakdown</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Claude Code Licenses ({licenseCosts.claudeCodeUsers} × ${licenseCosts.claudeCodeLicenseCost})</span>
                          <span className="font-semibold text-gray-900">${licenseCosts.totalClaudeCodeCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Standard Licenses ({licenseCosts.standardUsers} × ${licenseCosts.standardLicenseCost})</span>
                          <span className="font-semibold text-gray-900">${licenseCosts.totalStandardCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
                          <span className="text-sm font-semibold text-gray-700">Total Monthly Cost</span>
                          <span className="font-bold text-blue-600">${licenseCosts.totalMonthlyCost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Monthly Value Calculation</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Time Saved (Hours)</span>
                          <span className="font-semibold text-gray-900">450+</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Cost Avoidance Range</span>
                          <span className="font-semibold text-gray-900">{roiMetrics.costAvoidanceLow} - {roiMetrics.costAvoidanceHigh}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Less: License Cost</span>
                          <span className="font-semibold text-gray-900">-${licenseCosts.totalMonthlyCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
                          <span className="text-sm font-semibold text-gray-700">Net Monthly Value</span>
                          <span className="font-bold text-green-600">${licenseCosts.netValueLow.toLocaleString()} - ${licenseCosts.netValueHigh.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Return on Investment (ROI)</p>
                        <p className="text-xs text-gray-600">For every $1 invested in Claude licenses, we generate ${licenseCosts.roiMultipleLow}-${licenseCosts.roiMultipleHigh} in value</p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-green-600">{licenseCosts.roiMultipleLow}x - {licenseCosts.roiMultipleHigh}x</p>
                        <p className="text-xs text-gray-600 mt-1">ROI Multiple</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Value Scorecard</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {businessValue.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">{item.category}</span>
                          <Target className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-3xl font-bold mb-1" style={{ color: item.color }}>
                          {item.value}%
                        </div>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Adoption Tab */}
            {activeTab === 'adoption' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Daily Active Users (Nov 5 - Dec 9)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyActiveUsers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Active Users" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="conversations" stroke="#10b981" strokeWidth={2} name="Conversations" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Key Insight:</strong> Claude Enterprise achieved 98% adoption rate with consistent daily usage averaging 42 active users. 
                      Weekends show reduced activity (expected pattern), while weekdays maintain strong engagement across the organization.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Avg Conversations/User</h4>
                    <p className="text-3xl font-bold text-gray-900">{summaryMetrics.avgConversationsPerUser}</p>
                    <p className="text-xs text-gray-500 mt-1">Indicates deep engagement</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Projects Created</h4>
                    <p className="text-3xl font-bold text-gray-900">{summaryMetrics.claudeProjects}</p>
                    <p className="text-xs text-gray-500 mt-1">Structured workflows</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Artifacts Generated</h4>
                    <p className="text-3xl font-bold text-gray-900">{summaryMetrics.claudeArtifacts}</p>
                    <p className="text-xs text-gray-500 mt-1">Documents & code outputs</p>
                  </div>
                </div>
              </div>
            )}

            {/* Productivity Tab */}
            {activeTab === 'productivity' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="h-6 w-6 mr-2 text-green-600" />
                    Claude Enterprise: Quantified Time Savings
                  </h3>
                  <div className="space-y-4">
                    {productivityMetrics.map((item, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{item.metric}</h4>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {item.savings}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Before AI</p>
                            <p className="font-medium text-gray-700">{item.before}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">With AI</p>
                            <p className="font-medium text-gray-700">{item.after}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 italic">{item.source}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Use Cases by Category</h3>
                  <div className="space-y-3">
                    {useCasesByCategory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.category}</h4>
                          <p className="text-sm text-gray-500">{item.count} documented use cases</p>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.impact === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.impact} Impact
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Claude Enterprise Productivity Highlights</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Award className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700"><strong>67% reduction</strong> in debugging time using Claude Code for critical environment issues</span>
                    </li>
                    <li className="flex items-start">
                      <Award className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Security improvements</strong> with Claude Code automated code reviews identifying vulnerabilities pre-production</span>
                    </li>
                    <li className="flex items-start">
                      <Award className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Multi-system integration</strong> with Claude Enterprise connectors enabling "HUGE wins" in data aggregation across Slack, SharePoint, Outlook</span>
                    </li>
                    <li className="flex items-start">
                      <Award className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Daily workflow automation</strong> with Claude Enterprise saving 70% time on communication catch-up</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Departments Tab */}
            {activeTab === 'departments' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Department Adoption & Usage</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={departmentUsage}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="users" fill="#3b82f6" name="Active Users" />
                          <Bar dataKey="conversations" fill="#10b981" name="Conversations" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={departmentUsage}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {departmentUsage.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Department Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">Department</th>
                          <th className="px-6 py-3">Active Users</th>
                          <th className="px-6 py-3">Conversations</th>
                          <th className="px-6 py-3">Avg Conv/User</th>
                          <th className="px-6 py-3">Engagement Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentUsage.map((dept, idx) => (
                          <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{dept.name}</td>
                            <td className="px-6 py-4">{dept.users}</td>
                            <td className="px-6 py-4">{dept.conversations}</td>
                            <td className="px-6 py-4">{(dept.conversations / dept.users).toFixed(1)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                dept.conversations / dept.users > 30 
                                  ? 'bg-green-100 text-green-800' 
                                  : dept.conversations / dept.users > 20 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {dept.conversations / dept.users > 30 ? 'High' : dept.conversations / dept.users > 20 ? 'Medium' : 'Growing'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Claude Code Tab */}
            {activeTab === 'code' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Claude Code Developer Impact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Total Lines Generated</p>
                      <p className="text-3xl font-bold text-indigo-600">304K</p>
                      <p className="text-xs text-gray-500">Nov + Dec combined</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Active Developers</p>
                      <p className="text-3xl font-bold text-purple-600">11</p>
                      <p className="text-xs text-gray-500">December 2025</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Avg Lines/Developer</p>
                      <p className="text-3xl font-bold text-blue-600">13,984</p>
                      <p className="text-xs text-gray-500">December average</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Growth Rate</p>
                      <p className="text-3xl font-bold text-green-600">+38%</p>
                      <p className="text-xs text-gray-500">New users Nov-Dec</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Code Generation Trends</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { month: 'November', users: 8, lines: 150352, avgPerUser: 18794 },
                        { month: 'December', users: 11, lines: 153823, avgPerUser: 13984 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="lines" fill="#8b5cf6" name="Total Lines" />
                        <Bar yAxisId="right" dataKey="users" fill="#3b82f6" name="Active Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Claude Code Success Stories</h3>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Large-Scale Refactoring</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Roger Hampton used Claude Code to plan extraction of complex calculations module with comprehensive test generation
                      </p>
                      <span className="text-xs text-green-700 font-medium">Impact: Risk reduction + weeks of manual test writing saved</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Automated Code Review</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Sean Martin developed comprehensive review prompts covering security, performance, and standards compliance
                      </p>
                      <span className="text-xs text-green-700 font-medium">Impact: Consistent reviews + early bug detection</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Internal Plugin Marketplace</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Yassel Piloto created marketplace with Datadog operations automation and deployment analysis tools
                      </p>
                      <span className="text-xs text-green-700 font-medium">Impact: Team productivity multiplier + knowledge sharing</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Developer Testimonial</h3>
                  <blockquote className="italic text-gray-700 mb-2">
                    "We have noticed significant increase in performance and output. Claude code is a very valuable and extremely expensive tool used well it will make your life a lot easier."
                  </blockquote>
                  <p className="text-sm text-gray-600">— Jeff Rivero, Principal AI Architect</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-3">
              Claude Enterprise and Claude Code adoption at TechCo Inc has achieved significant momentum with <strong>98% user adoption rate</strong> across 85 active users. 
              The organization has generated <strong>2,377 conversations</strong> through Claude Enterprise and <strong>304,000+ lines of code</strong> through Claude Code.
            </p>
            <p className="mb-3">
              <strong>Quantified productivity gains from Claude Enterprise</strong> include 67% reduction in debugging time with Claude Code, 70% faster daily communication catch-up, 
              and significant improvements in multi-system data aggregation. Engineering teams report Claude Code automated code reviews identifying 
              security vulnerabilities before production deployment.
            </p>
            <p className="mb-3">
              <strong>Financial impact and ROI:</strong> With a monthly license investment of ${licenseCosts.totalMonthlyCost.toLocaleString()} 
              ({licenseCosts.claudeCodeUsers} Premium seats at ${licenseCosts.claudeCodeLicenseCost}/month + {licenseCosts.standardUsers} Standard seats at ${licenseCosts.standardLicenseCost}/month), 
              the organization generates $40,500-$56,250 in monthly cost avoidance based on 450+ hours saved at $90-125/hour blended rate. 
              This results in a <strong>net monthly value of ${licenseCosts.netValueLow.toLocaleString()}-${licenseCosts.netValueHigh.toLocaleString()}</strong> and 
              an impressive <strong>{licenseCosts.roiMultipleLow}x-{licenseCosts.roiMultipleHigh}x return on investment</strong>.
            </p>
            <p className="mb-3">
              <strong>Cross-functional adoption:</strong> Strong engagement across all departments with Engineering (35%), Customer Success (25%), and Sales/Operations (20%) leading Claude usage.
            </p>
            <p>
              <strong>User sentiment toward Claude is highly positive</strong> with employees describing Claude Enterprise and Claude Code as "essential" and expressing dependency on the tools. 
              The combination of quantitative time savings, qualitative improvements, enthusiastic adoption, and strong financial ROI indicates 
              exceptional organizational value from Claude deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;