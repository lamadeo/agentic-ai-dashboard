import React from 'react';
import { LucideIcon, ArrowUp } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'red';
  onClick?: () => void;
  loading?: boolean;
  error?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = "blue",
  onClick,
  loading = false,
  error
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    indigo: "bg-indigo-50 text-indigo-600",
    red: "bg-red-50 text-red-600"
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-red-200">
        <div className="flex items-center text-red-600">
          <div className="p-3 rounded-lg bg-red-50">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1 mt-4">{title}</h3>
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border border-gray-100 transition-all hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <ArrowUp className={`h-4 w-4 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {changeLabel && <p className="text-xs text-gray-500">{changeLabel}</p>}
    </div>
  );
};
