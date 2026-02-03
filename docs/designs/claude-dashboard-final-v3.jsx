import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Users, MessageSquare, TrendingUp, Code, Zap, DollarSign, Clock, Award, Target, ArrowUp } from 'lucide-react';

const MetricCard = ({ title, value, change, changeLabel, icon: Icon, color = "blue" }) => {
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
    claudeUsers: 78, // Active users (85 licensed, 7 inactive)
    claudeConversations: 2377,
    claudeProjects: 74,
    claudeArtifacts: 180,
    claudeCodeUsers: 11,
    claudeCodeLines: 153823,
    adoptionRate: 92, // 78 of 85 licensed actually using it
    avgConversationsPerUser: 30, // 2377/78
  };

  // Monthly adoption trends (Oct, Nov, Dec)
  const monthlyAdoption = [
    { month: 'Oct 2025', claudeUsers: 72, conversations: 1842, claudeCodeUsers: 0, claudeCodeLines: 0 },
    { month: 'Nov 2025', claudeUsers: 81, conversations: 2156, claudeCodeUsers: 8, claudeCodeLines: 150352 },
    { month: 'Dec 2025', claudeUsers: 85, conversations: 2377, claudeCodeUsers: 11, claudeCodeLines: 153823 }
  ];

  // Daily active users trend
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

  // Department adoption - CORRECTED with actual usage data
  const departmentUsage = [
    { name: 'Engineering + AI/Data', users: 18, conversations: 892, codeLines: 304175, value: 23 },
    { name: 'Product', users: 13, conversations: 520, codeLines: 0, value: 17 },
    { name: 'Marketing', users: 12, conversations: 360, codeLines: 0, value: 15 },
    { name: 'Sales (All)', users: 10, conversations: 315, codeLines: 0, value: 13 },
    { name: 'Operations/IT', users: 5, conversations: 180, codeLines: 0, value: 6 },
    { name: 'G&A/Finance/Exec', users: 5, conversations: 150, codeLines: 0, value: 6 },
    { name: 'Professional Services', users: 4, conversations: 120, codeLines: 0, value: 5 },
    { name: 'Customer Support', users: 4, conversations: 110, codeLines: 0, value: 5 },
    { name: 'Revenue Ops', users: 3, conversations: 250, codeLines: 0, value: 4 },
    { name: 'Customer Success', users: 2, conversations: 90, codeLines: 0, value: 3 },
    { name: 'Business Development', users: 2, conversations: 110, codeLines: 0, value: 3 }
  ];

  // ROI indicators
  const roiMetrics = {
    timeSavedPerMonth: '450+ hours',
    costAvoidanceLow: '$40,500',
    costAvoidanceHigh: '$56,250',
    hourlyRateLow: 90,
    hourlyRateHigh: 125,
  };

  // License cost calculations - CORRECTED for 78 active users
  const licenseCosts = {
    claudeCodeUsers: 11,
    claudeCodeLicenseCost: 200,
    standardUsers: 67, // 78 total - 11 Premium
    standardLicenseCost: 40,
    totalClaudeCodeCost: 11 * 200, // $2,200
    totalStandardCost: 67 * 40, // $2,680
    totalMonthlyCost: (11 * 200) + (67 * 40), // $4,880
    netValueLow: 40500 - 4880,
    netValueHigh: 56250 - 4880,
    roiMultipleLow: (40500 / 4880).toFixed(1),
    roiMultipleHigh: (56250 / 4880).toFixed(1),
  };

  // Use cases by category
  const useCasesByCategory = [
    { category: 'Code Quality & Development', count: 4, impact: 'High' },
    { category: 'Information Synthesis', count: 3, impact: 'High' },
    { category: 'Problem Solving', count: 3, impact: 'Medium-High' },
    { category: 'Planning & Architecture', count: 2, impact: 'High' },
    { category: 'Workflow Automation', count: 2, impact: 'Medium' }
  ];

  // Organization overview - CORRECTED: 78 active users, 85 licensed (7 inactive)
  const orgMetrics = {
    totalEmployees: 254,
    licensedSeats: 85,
    activeUsers: 78,
    inactiveSeats: 7,
    penetrationRate: 31, // 78 active of 254 total
    unlicensedEmployees: 176 // 254 - 78 active
  };

  // Opportunity cost analysis - CORRECTED WITH ACCURATE HEADCOUNT
  // Engineering = 70 (Ron ~65 + Luis 5), includes 10% power users for non-eng depts
  const expansionOpportunities = [
    {
      department: 'Enterprise Sales',
      totalEmployees: 9,
      currentUsers: 3,
      powerUsersNeeded: 1,
      standardGap: 5,
      premiumGap: 1,
      totalAdditionalCost: 400,
      monthlyOpportunityCost: 9000,
      netBenefit: 8600,
      roi: 22.5
    },
    {
      department: 'Product',
      totalEmployees: 16,
      currentUsers: 8,
      powerUsersNeeded: 2,
      standardGap: 6,
      premiumGap: 2,
      totalAdditionalCost: 640,
      monthlyOpportunityCost: 12360,
      netBenefit: 11720,
      roi: 19.3
    },
    {
      department: 'Professional Services',
      totalEmployees: 34,
      currentUsers: 12,
      powerUsersNeeded: 4,
      standardGap: 18,
      premiumGap: 4,
      totalAdditionalCost: 1520,
      monthlyOpportunityCost: 26350,
      netBenefit: 24830,
      roi: 17.3
    },
    {
      department: 'Customer Support',
      totalEmployees: 19,
      currentUsers: 3,
      powerUsersNeeded: 2,
      standardGap: 14,
      premiumGap: 2,
      totalAdditionalCost: 960,
      monthlyOpportunityCost: 12160,
      netBenefit: 11200,
      roi: 12.7
    },
    {
      department: 'Large Market Sales',
      totalEmployees: 9,
      currentUsers: 2,
      powerUsersNeeded: 1,
      standardGap: 6,
      premiumGap: 1,
      totalAdditionalCost: 440,
      monthlyOpportunityCost: 5400,
      netBenefit: 4960,
      roi: 12.3
    },
    {
      department: 'Marketing',
      totalEmployees: 21,
      currentUsers: 12,
      powerUsersNeeded: 3,
      standardGap: 6,
      premiumGap: 3,
      totalAdditionalCost: 720,
      monthlyOpportunityCost: 6750,
      netBenefit: 6030,
      roi: 9.4
    },
    {
      department: 'Business Development',
      totalEmployees: 8,
      currentUsers: 0,
      powerUsersNeeded: 1,
      standardGap: 7,
      premiumGap: 1,
      totalAdditionalCost: 480,
      monthlyOpportunityCost: 4800,
      netBenefit: 4320,
      roi: 10.0
    },
    {
      department: 'Other Support Functions',
      totalEmployees: 18,
      currentUsers: 7,
      powerUsersNeeded: 2,
      standardGap: 9,
      premiumGap: 2,
      totalAdditionalCost: 760,
      monthlyOpportunityCost: 7200,
      netBenefit: 6440,
      roi: 9.5
    },
    {
      department: 'Customer Success',
      totalEmployees: 19,
      currentUsers: 18,
      powerUsersNeeded: 2,
      standardGap: 1,
      premiumGap: 2,
      totalAdditionalCost: 360,
      monthlyOpportunityCost: 3800,
      netBenefit: 3440,
      roi: 10.6,
      detail: '1 new Std ($40) + 2 Std→Prem upgrades ($320)'
    },
    {
      department: 'Engineering (Ron + Luis)',
      totalEmployees: 70,
      currentUsers: 28,
      currentStandard: 17,
      currentPremium: 11,
      powerUsersNeeded: 70,
      standardGap: 0,
      premiumGap: 59,
      upgradesNeeded: 17,
      newPremiumNeeded: 42,
      totalAdditionalCost: 11120,
      monthlyOpportunityCost: 55125,
      netBenefit: 44005,
      roi: 5.0,
      detail: 'Upgrade 17 Std→Prem ($2,720) + 42 new Premium ($8,400) = $11,120'
    }
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
              {['overview', 'adoption', 'productivity', 'departments', 'code', 'enablement', 'expansion'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors`}
                >
                  {tab === 'code' ? 'Claude Code' : tab === 'expansion' ? 'Expansion ROI' : tab}
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
                            <p className="text-xs text-gray-500 mb-1">Before Claude</p>
                            <p className="font-medium text-gray-700">{item.before}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">With Claude</p>
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
                      <p className="text-sm text-gray-600 mb-1">Engineering Coverage</p>
                      <p className="text-3xl font-bold text-green-600">40%</p>
                      <p className="text-xs text-gray-500">28 of 70 engineers</p>
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

            {/* Enablement Tab */}
            {activeTab === 'enablement' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-semibold mb-4">AI Enablement Program - $375K Annual Investment</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded shadow-sm border-2 border-purple-300">
                      <p className="text-sm text-gray-600 mb-1">Enablement Lead</p>
                      <p className="text-2xl font-bold text-purple-700">$150K</p>
                      <p className="text-xs text-gray-500 mt-1">Training, adoption, metrics</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow-sm border-2 border-blue-300">
                      <p className="text-sm text-gray-600 mb-1">Integration Engineer</p>
                      <p className="text-2xl font-bold text-blue-700">$175K</p>
                      <p className="text-xs text-gray-500 mt-1">Connectors, marketplace, projects</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow-sm border-2 border-green-300">
                      <p className="text-sm text-gray-600 mb-1">Training Budget</p>
                      <p className="text-2xl font-bold text-green-700">$50K</p>
                      <p className="text-xs text-gray-500 mt-1">External vendor contingency</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold mb-3">Key Deliverables</h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>• Train 170+ new users (Phases 2-4)</li>
                      <li>• Build critical connectors: Salesforce, Gong, Rippling</li>
                      <li>• Evolve Yassel's plug-in marketplace</li>
                      <li>• Custom skills library (15-20 skills)</li>
                      <li>• Enable org self-service MCP development</li>
                      <li>• Support 2026 transformational projects</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold mb-3">Expected Impact</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="text-xs text-gray-600">Daily Active Rate</p>
                        <p className="text-xl font-bold text-blue-600">53% → 75%</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded">
                        <p className="text-xs text-gray-600">Annual Value</p>
                        <p className="text-xl font-bold text-green-600">$400-500K</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded border border-purple-300">
                        <p className="text-xs text-gray-600">Program ROI</p>
                        <p className="text-xl font-bold text-purple-600">1.1-1.3x</p>
                        <p className="text-xs text-gray-500 mt-1">Year 1 | 2.0x+ ongoing</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded border border-yellow-300">
                  <p className="text-sm text-yellow-900">
                    <strong>Foundation:</strong> Yassel's marketplace + 10 existing connectors (GitHub, Jira, Linear, Asana, M365, Slack, HubSpot, Canva, Figma, Vercel). 
                    FTEs use Claude Premium to build everything (connectors, skills, analytics) - no vendor costs.
                  </p>
                </div>
              </div>
            )}

            {/* Expansion Opportunity Tab */}
            {activeTab === 'expansion' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Organization Coverage Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Total Organization</p>
                      <p className="text-3xl font-bold text-gray-900">{orgMetrics.totalEmployees}</p>
                      <p className="text-xs text-gray-500">Employees</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Current Licensed</p>
                      <p className="text-3xl font-bold text-blue-600">{orgMetrics.currentLicensedUsers}</p>
                      <p className="text-xs text-gray-500">{orgMetrics.penetrationRate}% coverage</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Unlicensed</p>
                      <p className="text-3xl font-bold text-orange-600">{orgMetrics.unlicensedEmployees}</p>
                      <p className="text-xs text-gray-500">Opportunity gap</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Unrealized Value</p>
                      <p className="text-3xl font-bold text-red-600">$146K</p>
                      <p className="text-xs text-gray-500">Per month</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Expansion Opportunities by Department (Ranked by ROI)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-4 py-3">Rank</th>
                          <th className="px-4 py-3">Department</th>
                          <th className="px-4 py-3">Total</th>
                          <th className="px-4 py-3">Current</th>
                          <th className="px-4 py-3">Std Gap</th>
                          <th className="px-4 py-3">Prem Gap</th>
                          <th className="px-4 py-3">Monthly Cost</th>
                          <th className="px-4 py-3">Annual Cost</th>
                          <th className="px-4 py-3">Annual Value</th>
                          <th className="px-4 py-3">Annual Net</th>
                          <th className="px-4 py-3">ROI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expansionOpportunities
                          .sort((a, b) => b.roi - a.roi)
                          .map((dept, idx) => (
                            <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{idx + 1}</td>
                              <td className="px-4 py-3 font-medium text-gray-900">{dept.department}</td>
                              <td className="px-4 py-3">{dept.totalEmployees}</td>
                              <td className="px-4 py-3">{dept.currentUsers}</td>
                              <td className="px-4 py-3 text-blue-600">{dept.standardGap}</td>
                              <td className="px-4 py-3 text-purple-600">{dept.premiumGap}</td>
                              <td className="px-4 py-3 font-semibold">${dept.totalAdditionalCost.toLocaleString()}</td>
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
                          <td className="px-4 py-3">{expansionOpportunities.reduce((sum, d) => sum + d.currentUsers, 0)}</td>
                          <td className="px-4 py-3 text-blue-600">{expansionOpportunities.reduce((sum, d) => sum + d.standardGap, 0)}</td>
                          <td className="px-4 py-3 text-purple-600">{expansionOpportunities.reduce((sum, d) => sum + d.premiumGap, 0)}</td>
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
                      <strong>License Strategy:</strong> Engineering receives 100% Premium (Claude Code). Other departments receive 90% Standard + 10% Premium for power users (rounded up).
                      Premium Gap includes both new Premium licenses and upgrades from Standard to Premium. <strong>Annual costs</strong> shown reflect Anthropic's annual billing model.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Phased Rollout Strategy</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Phase 1: High-ROI Quick Wins</h4>
                        <p className="text-xs text-gray-600 mb-2">Enterprise Sales (5 Std + 1 Prem) + Product (6 Std + 2 Prem)</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-gray-600">Monthly: $1,000</span>
                          <span className="text-gray-700 font-semibold">Annual: $12,000</span>
                          <span className="text-green-600">Annual Value: $256K</span>
                          <span className="text-green-600 font-semibold">ROI: 21.3x</span>
                        </div>
                      </div>
                      
                      <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Phase 2: Customer-Facing Teams</h4>
                        <p className="text-xs text-gray-600 mb-2">Prof Services (18 Std + 4 Prem) + Support (14 Std + 2 Prem) + CS Power (2 Prem)</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-gray-600">Monthly: $2,840</span>
                          <span className="text-gray-700 font-semibold">Annual: $34,080</span>
                          <span className="text-blue-600">Annual Value: $506K</span>
                          <span className="text-blue-600 font-semibold">ROI: 14.8x</span>
                        </div>
                      </div>
                      
                      <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Phase 3: Go-to-Market Expansion</h4>
                        <p className="text-xs text-gray-600 mb-2">Marketing (6 Std + 3 Prem upgr) + Large Market (6 Std + 1 Prem upgr) + BizDev (7 Std + 1 new Prem)</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-gray-600">Monthly: $1,600</span>
                          <span className="text-gray-700 font-semibold">Annual: $19,200</span>
                          <span className="text-orange-600">Annual Value: $541K</span>
                          <span className="text-orange-600 font-semibold">ROI: 28.2x</span>
                        </div>
                      </div>
                      
                      <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Phase 4: Engineering Complete Coverage</h4>
                        <p className="text-xs text-gray-600 mb-2">All 70 Engineers: Upgrade 17 Std→Prem + 42 new Premium</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-gray-600">Monthly: $11,120</span>
                          <span className="text-gray-700 font-semibold">Annual: $133,440</span>
                          <span className="text-purple-600">Annual Value: $662K</span>
                          <span className="text-purple-600 font-semibold">ROI: 5.0x</span>
                        </div>
                      </div>
                      
                      <div className="border-l-4 border-gray-500 pl-4 py-2 bg-gray-50">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Phase 5: Complete Coverage</h4>
                        <p className="text-xs text-gray-600 mb-2">Support functions (9 Std + 2 Prem)</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-gray-600">Monthly: $680</span>
                          <span className="text-gray-700 font-semibold">Annual: $8,160</span>
                          <span className="text-gray-600">Annual Value: $86K</span>
                          <span className="text-gray-600 font-semibold">ROI: 10.6x</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Deployment Financial Analysis</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-gray-600 mb-2">Monthly Investment</p>
                          <p className="text-2xl font-bold text-blue-600">$22,560</p>
                          <p className="text-xs text-gray-500 mt-1">86 Premium + 168 Standard</p>
                        </div>
                        <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
                          <p className="text-sm text-gray-700 mb-2 font-semibold">Annual Investment</p>
                          <p className="text-2xl font-bold text-blue-700">$270,720</p>
                          <p className="text-xs text-gray-600 mt-1">Anthropic annual billing</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Monthly Value Generated</p>
                          <p className="text-2xl font-bold text-green-600">$268K - $373K</p>
                          <p className="text-xs text-gray-500 mt-1">2,980 hours saved @ $90-125/hr</p>
                        </div>
                        <div className="p-4 bg-green-100 rounded-lg border-2 border-green-300">
                          <p className="text-sm text-gray-700 mb-2 font-semibold">Annual Value Generated</p>
                          <p className="text-2xl font-bold text-green-700">$3.2M - $4.5M</p>
                          <p className="text-xs text-gray-600 mt-1">35,760 hours saved annually</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                          <p className="text-sm text-gray-700 mb-2">Net Monthly Value</p>
                          <p className="text-2xl font-bold text-green-600">$245K - $350K</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-400">
                          <p className="text-sm text-gray-800 mb-2 font-semibold">Net Annual Value</p>
                          <p className="text-3xl font-bold text-green-700">$2.9M - $4.2M</p>
                          <p className="text-xs text-gray-600 mt-1">ROI: 11.9x - 16.6x</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-yellow-600" />
                    Cost of Inaction
                  </h3>
                  <p className="text-gray-700 mb-4">
                    By maintaining current 33% coverage (85 of 254 employees), TechCo Inc is leaving significant productivity gains unrealized from 169 unlicensed employees.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded border border-orange-200">
                      <p className="text-xs text-gray-600 mb-1">Monthly Unrealized Value</p>
                      <p className="text-xl font-bold text-red-600">$146,485</p>
                    </div>
                    <div className="bg-white p-3 rounded border-2 border-red-300">
                      <p className="text-xs text-gray-700 mb-1 font-semibold">Annual Unrealized Value</p>
                      <p className="text-xl font-bold text-red-700">$1.76M</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Annual Cost to Capture</p>
                      <p className="text-xl font-bold text-blue-600">$208,800</p>
                    </div>
                    <div className="bg-white p-3 rounded border-2 border-green-300">
                      <p className="text-xs text-gray-700 mb-1 font-semibold">Annual Net Benefit</p>
                      <p className="text-xl font-bold text-green-700">$1.55M</p>
                      <p className="text-xs text-gray-500 mt-1">8.4x ROI</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Department Penetration Analysis</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={expansionOpportunities.sort((a, b) => b.totalEmployees - a.totalEmployees)} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="department" type="category" width={180} tick={{ fontSize: 11 }} />
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Engineering Claude Code Expansion Detail</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Total Engineering Org</p>
                      <p className="text-2xl font-bold text-gray-900">70 people</p>
                      <p className="text-xs text-gray-500 mt-1">Ron Slosberg (~65) + Luis Amadeo (5)</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Current Claude Code Coverage</p>
                      <p className="text-2xl font-bold text-purple-600">11 users (16%)</p>
                      <p className="text-xs text-gray-500 mt-1">Premium licenses only</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Standard Seats to Convert</p>
                      <p className="text-2xl font-bold text-blue-600">17 engineers</p>
                      <p className="text-xs text-gray-500 mt-1">Upgrade to Claude Code</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Net New Premium Needed</p>
                      <p className="text-2xl font-bold text-purple-600">42 licenses</p>
                      <p className="text-xs text-gray-500 mt-1">Unlicensed engineers</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Investment Required</p>
                      <p className="text-2xl font-bold text-indigo-600">$11,120/mo</p>
                      <p className="text-xs text-gray-500 mt-1">$2,720 upgrades + $8,400 new</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Annual Investment</p>
                      <p className="text-2xl font-bold text-indigo-700">$133,440</p>
                      <p className="text-xs text-gray-500 mt-1">Generates $662K annual value</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
                    <p className="text-xs text-gray-700">
                      <strong>Goal:</strong> 100% Claude Code (Premium) coverage for all 70 engineering staff to maximize developer productivity and code generation capabilities.
                    </p>
                  </div>
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
              <strong>Claude deployment success:</strong> 96% activation rate (82 of 85 licenses), 95% adoption (78 users engaged), generating 
              <strong>2,377 conversations, 74 projects, 180 artifacts, and 304,000+ lines of code</strong>. Current investment of <strong>$66K/year</strong> 
              (13 Premium, 72 Standard) delivers <strong>$420K-$609K annual value at 7.4x-10.3x ROI</strong>.
            </p>
            <p className="mb-3">
              <strong>Quantified productivity wins:</strong> 67% debugging time reduction (3+ hours → 1 hour), 70% faster communication workflows (30-45min → 5-10min), 
              85% pre-production security issues identified, hours-to-minutes multi-system data aggregation. Users describe Claude as "essential" with strong dependency on the tool.
            </p>
            <p className="mb-3">
              <strong>Critical coverage gaps - opportunity cost:</strong> Only 32% organizational coverage (82 of 254 employees) leaves <strong>172 employees unlicensed</strong>. 
              Customer Success (11% covered), Professional Services (12%), and Customer Support (21%) are severely underserved, creating service quality risk. 
              Engineering has only 17% Claude Code Premium coverage. <strong>Unrealized value: $1.87M annually</strong> from unlicensed employees.
            </p>
            <p className="mb-3">
              <strong>2026 expansion plan - quarterly rollout:</strong> Q1 - All Engineering with Claude Code Premium ($118K pro-rated, $135K run rate). 
              Q2 - Service & GTM teams complete ($40K pro-rated, $64K run rate). Q3 - Final coverage ($2K pro-rated, $5K run rate). 
              <strong>Total 2026 license budget: $226K pro-rated</strong> ($66K current + $160K expansion). <strong>2027+ run rate: $270K/year</strong> 
              for all 254 employees. Full deployment generates <strong>$2.7M-$3.9M net annual value at 10.5x-14.8x ROI</strong>.
            </p>
            <p>
              <strong>Recommendation:</strong> Execute quarterly license expansion to all 254 employees ($226K 2026 budget, $270K ongoing). 
              This addresses critical service team gaps and Engineering Premium coverage, unlocking $1.87M unrealized value. 
              <strong>Optional enhancement:</strong> AI Enablement Program ($375K: 2 FTEs + training) to increase daily active usage from 53% to 75% and support 
              2026 transformational initiatives in Sales, Customer Success, and other departments requiring Claude-powered integrations (Salesforce, Gong, Rippling connectors). 
              See Enablement tab for details. Enablement adds $400-500K additional value (1.1-1.3x ROI) by accelerating adoption and enabling business transformation projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
