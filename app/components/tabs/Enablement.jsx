import React from 'react';

/**
 * Enablement Tab - Claude Enterprise and Code enablement program details
 * @param {Object} props
 * @param {Object} props.enablementPlan - Enablement plan data from JSON
 */
const Enablement = ({ enablementPlan }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-xl font-semibold mb-4">{enablementPlan.programTitle}</h3>
        <div className="grid grid-cols-3 gap-4">
          {enablementPlan.budgetBreakdown.map((item, idx) => (
            <div key={idx} className={`bg-white p-4 rounded shadow-sm border-2 ${item.borderColor}`}>
              <p className="text-sm text-gray-600 mb-1">{item.role}</p>
              <p className={`text-2xl font-bold ${item.textColor}`}>${(item.cost / 1000).toFixed(0)}K</p>
              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h4 className="font-semibold mb-3">Key Deliverables</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            {enablementPlan.keyDeliverables.map((deliverable, idx) => (
              <li key={idx}>• {deliverable}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h4 className="font-semibold mb-3">Expected Impact</h4>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-xs text-gray-600">{enablementPlan.expectedImpact.dailyActiveRate.label}</p>
              <p className="text-xl font-bold text-blue-600">{enablementPlan.expectedImpact.dailyActiveRate.current} → {enablementPlan.expectedImpact.dailyActiveRate.target}</p>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <p className="text-xs text-gray-600">{enablementPlan.expectedImpact.annualValue.label}</p>
              <p className="text-xl font-bold text-green-600">{enablementPlan.expectedImpact.annualValue.range}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded border border-purple-300">
              <p className="text-xs text-gray-600">{enablementPlan.expectedImpact.programROI.label}</p>
              <p className="text-xl font-bold text-purple-600">{enablementPlan.expectedImpact.programROI.yearOne}</p>
              <p className="text-xs text-gray-500 mt-1">Year 1 | {enablementPlan.expectedImpact.programROI.ongoing}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded border border-yellow-300">
        <p className="text-sm text-yellow-900">
          <strong>Foundation:</strong> {enablementPlan.foundationNote}
        </p>
      </div>
    </div>
  );
};

export default Enablement;
