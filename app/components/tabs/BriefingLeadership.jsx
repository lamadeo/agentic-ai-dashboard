import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Download } from 'lucide-react';

/**
 * BriefingLeadership Tab - Executive leadership summary
 * @param {Object} props
 * @param {Object} props.insights - AI-generated insights object with executiveSummary
 * @param {Object} props.agenticFTEs - Agentic FTE metrics data
 * @param {Object} props.departmentBreakdown - Claude Enterprise department breakdown with Agentic FTE
 * @param {Object} props.claudeCodeDepartmentBreakdown - Claude Code department breakdown with Agentic FTE
 * @param {Object} props.m365DepartmentPerformance - M365 department performance with Agentic FTE
 */
const BriefingLeadership = ({ insights, agenticFTEs, departmentBreakdown, claudeCodeDepartmentBreakdown, m365DepartmentPerformance }) => {
  const handleDownload = () => {
    if (!insights?.executiveSummary) return;

    const content = insights.executiveSummary;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'executive-leadership-summary.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate top departments by Agentic FTE (combine CE + CC for Claude Enterprise)
  const topCEDepartments = departmentBreakdown
    ? (() => {
        // Create a map to combine CE + CC Agentic FTEs by department
        const deptMap = {};

        // Add Claude Enterprise Agentic FTEs
        departmentBreakdown.forEach(dept => {
          deptMap[dept.department] = {
            department: dept.department,
            agenticFTE: dept.agenticFTE || 0,
            ceAgenticFTE: dept.agenticFTE || 0,
            ccAgenticFTE: 0
          };
        });

        // Add Claude Code Agentic FTEs to corresponding departments
        if (claudeCodeDepartmentBreakdown) {
          claudeCodeDepartmentBreakdown.forEach(dept => {
            if (deptMap[dept.department]) {
              deptMap[dept.department].ccAgenticFTE = dept.agenticFTE || 0;
              deptMap[dept.department].agenticFTE += dept.agenticFTE || 0;
            } else {
              // Department has CC usage but not CE
              deptMap[dept.department] = {
                department: dept.department,
                agenticFTE: dept.agenticFTE || 0,
                ceAgenticFTE: 0,
                ccAgenticFTE: dept.agenticFTE || 0
              };
            }
          });
        }

        // Convert to array, sort, and take top 3
        return Object.values(deptMap)
          .sort((a, b) => b.agenticFTE - a.agenticFTE)
          .slice(0, 3);
      })()
    : [];

  const topM365Departments = m365DepartmentPerformance
    ? [...m365DepartmentPerformance].sort((a, b) => (b.agenticFTE || 0) - (a.agenticFTE || 0)).slice(0, 3)
    : [];

  return (
    <div className="space-y-6">
      {/* Agentic FTE Summary Cards */}
      {agenticFTEs && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Agentic FTE Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Total Agentic FTE</h4>
            <div className="text-3xl font-bold text-green-700 mb-1">
              {agenticFTEs.current?.totalAgenticFTEs?.toFixed(1) || '0.0'}
            </div>
            <p className="text-xs text-gray-600">
              Equivalent of {agenticFTEs.current?.totalAgenticFTEs?.toFixed(0) || '0'} full-time employees added
            </p>
            {agenticFTEs.monthOverMonth && (
              <div className={`text-xs mt-2 font-semibold ${agenticFTEs.monthOverMonth.ftesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {agenticFTEs.monthOverMonth.ftesChange >= 0 ? '+' : ''}{agenticFTEs.monthOverMonth.ftesChange.toFixed(1)} FTEs ({agenticFTEs.monthOverMonth.percentChange >= 0 ? '+' : ''}{agenticFTEs.monthOverMonth.percentChange}%) vs last month
              </div>
            )}
          </div>

          {/* Productive Hours Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Productive Hours</h4>
            <div className="text-3xl font-bold text-blue-700 mb-1">
              {agenticFTEs.current?.totalProductiveHours?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-gray-600">
              Hours saved through AI productivity gains
            </p>
            {agenticFTEs.current?.isMTD && (
              <div className="text-xs mt-2 text-blue-600 font-semibold">
                MTD ({agenticFTEs.current.daysOfData} days)
              </div>
            )}
          </div>

          {/* Tool Breakdown Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">By Tool</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Claude Enterprise:</span>
                <span className="font-semibold text-gray-900">{agenticFTEs.current?.breakdown?.claudeEnterprise?.toFixed(1) || '0.0'} FTEs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Claude Code:</span>
                <span className="font-semibold text-gray-900">{agenticFTEs.current?.breakdown?.claudeCode?.toFixed(1) || '0.0'} FTEs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">M365 Copilot:</span>
                <span className="font-semibold text-gray-900">{agenticFTEs.current?.breakdown?.m365Copilot?.toFixed(1) || '0.0'} FTEs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GitHub Copilot:</span>
                <span className="font-semibold text-gray-900">{agenticFTEs.current?.breakdown?.githubCopilot?.toFixed(1) || '0.0'} FTEs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Departments by Agentic FTE */}
      {(topCEDepartments.length > 0 || topM365Departments.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Claude Enterprise Departments */}
          {topCEDepartments.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Top Departments - Claude Enterprise Agentic FTE</h4>
              <div className="space-y-3">
                {topCEDepartments.map((dept, idx) => (
                  <div key={dept.department} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-orange-600'}`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{dept.department}</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{dept.agenticFTE?.toFixed(2)} FTEs</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top M365 Departments */}
          {topM365Departments.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Top Departments - M365 Copilot Agentic FTE</h4>
              <div className="space-y-3">
                {topM365Departments.map((dept, idx) => (
                  <div key={dept.department} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-orange-600'}`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{dept.department}</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{dept.agenticFTE?.toFixed(2)} FTEs</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Executive Leadership Summary</h3>
            <p className="text-xs text-gray-500 mt-1 italic">For Executive Leadership Team & Board of Directors</p>
          </div>
          {insights?.executiveSummary && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              Download as Markdown
            </button>
          )}
        </div>
        <div className="prose prose-lg max-w-none">
          {insights?.executiveSummary ? (
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-blue-500" {...props} />,
                h2: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3" {...props} />,
                h3: ({node, ...props}) => <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-base text-gray-700 leading-relaxed mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 text-base text-gray-700 space-y-2 mb-4" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 text-base text-gray-700 space-y-2 mb-4" {...props} />,
                li: ({node, ...props}) => <li className="pl-2" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-gray-900 bg-yellow-50 px-1" {...props} />,
                em: ({node, ...props}) => <em className="italic text-gray-600" {...props} />,
                code: ({node, ...props}) => <code className="bg-gray-100 text-blue-600 px-2 py-0.5 rounded text-sm font-mono" {...props} />
              }}
            >
              {insights.executiveSummary}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-500 italic">Executive summary will be generated when data is parsed.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BriefingLeadership;
