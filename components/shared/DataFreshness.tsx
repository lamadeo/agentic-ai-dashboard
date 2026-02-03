import React from 'react';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';

export interface DataFreshnessProps {
  lastUpdated: Date | string;
  isLive?: boolean;
  dataSource?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  error?: string;
}

export const DataFreshness: React.FC<DataFreshnessProps> = ({
  lastUpdated,
  isLive = false,
  dataSource,
  onRefresh,
  refreshing = false,
  error
}) => {
  const formatTimestamp = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span className="font-medium">Last updated:</span>
          <span className="ml-1">{formatTimestamp(lastUpdated)}</span>
        </div>

        {isLive && (
          <div className="flex items-center">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        )}

        {dataSource && (
          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
            Source: {dataSource}
          </span>
        )}

        {error && (
          <div className="flex items-center text-xs text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className={`flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      )}
    </div>
  );
};
