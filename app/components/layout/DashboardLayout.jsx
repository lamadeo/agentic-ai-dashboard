import React from 'react';
import SidebarNavigation from './SidebarNavigation';
import DashboardHeader from './DashboardHeader';

/**
 * DashboardLayout - Main layout wrapper with sidebar and header
 * Note: Currently not used - page.jsx renders SidebarNavigation directly
 * Kept for potential future refactoring
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Tab content to render
 * @param {boolean} props.sidebarCollapsed - Whether sidebar is collapsed
 * @param {Function} props.setSidebarCollapsed - Function to toggle sidebar
 * @param {string} props.activeTab - Current active tab
 * @param {Function} props.setActiveTab - Function to set active tab
 * @param {string|null} props.openDropdown - Currently open dropdown ID
 * @param {Function} props.setOpenDropdown - Function to set open dropdown
 * @param {Array} props.navigationStructure - Navigation structure array
 * @param {Array} props.breadcrumbs - Breadcrumb navigation array
 * @param {string} props.latestMonthLabel - Latest month label
 * @param {string|number} props.latestMonthYear - Latest month year
 */
const DashboardLayout = ({
  children,
  sidebarCollapsed,
  setSidebarCollapsed,
  activeTab,
  setActiveTab,
  openDropdown,
  setOpenDropdown,
  navigationStructure,
  breadcrumbs,
  latestMonthLabel,
  latestMonthYear
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <SidebarNavigation
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          navigationStructure={navigationStructure}
        />

        {/* Main Content Area */}
        <main
          className={`${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          } flex-1 transition-all duration-300 p-6`}
        >
          {/* Header with breadcrumbs */}
          <DashboardHeader
            latestMonthLabel={latestMonthLabel}
            latestMonthYear={latestMonthYear}
            breadcrumbs={breadcrumbs}
            setActiveTab={setActiveTab}
          />

          {/* Tab Content */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
