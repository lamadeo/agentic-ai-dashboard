import React from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * MetricCard - Reusable KPI metric display component
 * @param {Object} props
 * @param {string} props.title - Metric title
 * @param {string|number} props.value - Metric value to display
 * @param {string} [props.change] - Optional change indicator (e.g., "+12%")
 * @param {string} [props.changeLabel] - Optional label for the change
 * @param {React.Component} props.icon - Lucide icon component
 * @param {string} [props.color="blue"] - Color theme (blue, green, purple, orange, indigo)
 */
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

export default MetricCard;
