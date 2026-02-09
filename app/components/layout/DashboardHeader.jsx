'use client';

import React, { useState } from 'react';
import { Clock, Github, ChevronRight, LogOut, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * DashboardHeader - Main header with logo, title, last updated, and breadcrumbs
 * @param {Object} props
 * @param {string} props.lastRefreshed - Formatted last refresh date (e.g., "February 4, 2026")
 * @param {Array} props.breadcrumbs - Breadcrumb navigation array
 * @param {Function} props.setActiveTab - Function to set active tab
 */
const DashboardHeader = ({ lastRefreshed, breadcrumbs, setActiveTab }) => {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Main Header */}
      <div className="mb-8 flex items-center justify-between max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center">
            <div className="mr-3 p-1.5 bg-gradient-to-br from-blue-600 via-purple-600 to-amber-500 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            Agentic AI Dashboard
          </h1>
          <p className="text-gray-600">Analytics & Optimization Insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>Last updated: {lastRefreshed}</span>
          </div>
          <a
            href="https://github.com/lamadeo/agentic-ai-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors group"
            title="View on GitHub"
          >
            <Github className="h-4 w-4 mr-1" />
            <span className="group-hover:underline">GitHub</span>
          </a>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sign out"
          >
            <LogOut className="h-4 w-4 mr-1" />
            <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6 max-w-7xl">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                )}
                {crumb.tab || crumb.onClick ? (
                  <button
                    onClick={() => crumb.onClick ? crumb.onClick() : setActiveTab(crumb.tab)}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-gray-500">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default DashboardHeader;
