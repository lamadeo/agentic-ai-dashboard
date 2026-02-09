import React, { useState } from 'react';
import {
  Home, Menu, X, BarChart2, Code, TrendingUp, DollarSign, GraduationCap,
  Presentation, MessageSquare, Users, Heart, Target, FileText, Building2,
  FolderOpen, Plug, LayoutDashboard, Info
} from 'lucide-react';
import CreditsModal from '../shared/CreditsModal';

/**
 * SidebarNavigation - Sidebar navigation component with always-visible menu items
 * @param {Object} props
 * @param {boolean} props.sidebarCollapsed - Whether sidebar is collapsed
 * @param {Function} props.setSidebarCollapsed - Function to toggle sidebar
 * @param {string} props.activeTab - Current active tab
 * @param {Function} props.setActiveTab - Function to set active tab
 * @param {Array} props.navigationStructure - Navigation structure array
 */
const SidebarNavigation = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  activeTab,
  setActiveTab,
  navigationStructure
}) => {
  const [showCredits, setShowCredits] = useState(false);

  return (
    <>
      <CreditsModal
        isOpen={showCredits}
        onClose={() => setShowCredits(false)}
        triggeredBy="click"
      />
    <aside
      className={`${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } bg-white border-r border-gray-200 fixed left-0 top-0 h-full flex flex-col transition-all duration-300 z-40`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="px-2 py-4 flex-1 overflow-y-auto">
        {navigationStructure.map((navGroup) => (
          <div key={navGroup.id} className="mb-4">
            {/* Group Header - Show for all groups when sidebar is expanded */}
            {!sidebarCollapsed && (
              <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {navGroup.label}
              </div>
            )}

            {/* Direct Tab (no dropdown) */}
            {!navGroup.hasDropdown && (
              <button
                onClick={() => setActiveTab(navGroup.tab)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === navGroup.tab
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={sidebarCollapsed ? navGroup.label : undefined}
              >
                {navGroup.id === 'overview' && <Home className="h-5 w-5 flex-shrink-0" />}
                {navGroup.id === 'organization' && <Building2 className="h-5 w-5 flex-shrink-0" />}
                {navGroup.id === 'enablement' && <GraduationCap className="h-5 w-5 flex-shrink-0" />}
                {!['overview', 'organization', 'enablement'].includes(navGroup.id) && <Home className="h-5 w-5 flex-shrink-0" />}
                {!sidebarCollapsed && <span>{navGroup.label}</span>}
              </button>
            )}

            {/* Group with items - Always show all items */}
            {navGroup.hasDropdown && navGroup.items && (
              <div className={sidebarCollapsed ? '' : 'space-y-1'}>
                {navGroup.items.map((item) => (
                  <div key={item.id}>
                    {item.hasSubmenu ? (
                      <>
                        {!sidebarCollapsed && (
                          <div className="px-3 py-2 text-xs font-semibold text-gray-600 flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>{item.label}</span>
                          </div>
                        )}
                        {item.submenu.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => setActiveTab(subItem.tab)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              activeTab === subItem.tab
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                            } ${sidebarCollapsed ? 'justify-center' : 'pl-6'}`}
                            title={sidebarCollapsed ? subItem.label : undefined}
                          >
                            {subItem.id === 'claude-enterprise-overview' && <LayoutDashboard className="h-4 w-4 flex-shrink-0" />}
                            {subItem.id === 'claude-projects' && <FolderOpen className="h-4 w-4 flex-shrink-0" />}
                            {subItem.id === 'claude-integrations' && <Plug className="h-4 w-4 flex-shrink-0" />}
                            {subItem.id === 'claude-code' && <Code className="h-4 w-4 flex-shrink-0" />}
                            {!['claude-enterprise-overview', 'claude-projects', 'claude-integrations', 'claude-code'].includes(subItem.id) && <FileText className="h-4 w-4 flex-shrink-0" />}
                            {!sidebarCollapsed && <span>{subItem.label}</span>}
                          </button>
                        ))}
                      </>
                    ) : (
                      <button
                        onClick={() => setActiveTab(item.tab)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === item.tab
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        {item.id === 'briefing-leadership' && <BarChart2 className="h-4 w-4 flex-shrink-0" />}
                        {item.id === 'briefing-org' && <BarChart2 className="h-4 w-4 flex-shrink-0" />}
                        {item.id === 'claude-enterprise' && <MessageSquare className="h-4 w-4 flex-shrink-0" />}
                        {item.id === 'claude-code' && <Code className="h-4 w-4 flex-shrink-0" />}
                        {item.id === 'm365' && <Users className="h-4 w-4 flex-shrink-0" />}
                        {item.id === 'coding-tools' && <Code className="h-4 w-4 flex-shrink-0" />}
                        {item.id === 'productivity-tools' && <MessageSquare className="h-4 w-4 flex-shrink-0" />}
                        {item.id === 'expansion-roi' && <DollarSign className="h-4 w-4 flex-shrink-0" />}
                        {item.id === 'perceived-value' && <Heart className="h-4 w-4 flex-shrink-0" />}
                        {item.id === 'portfolio' && <Target className="h-4 w-4 flex-shrink-0" />}
                        {item.id === 'enablement' && <GraduationCap className="h-4 w-4 flex-shrink-0" />}
                        {item.id === 'annual-plan' && <Presentation className="h-4 w-4 flex-shrink-0" />}
                        {item.id === '2026-plan' && <Presentation className="h-4 w-4 flex-shrink-0" />}
                        {item.id === '2026-plan-dynamic' && <Presentation className="h-4 w-4 flex-shrink-0" />}
                        {!sidebarCollapsed && (
                          <span className="flex items-center">
                            {item.label}
                            {item.badge && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded">
                                {item.badge}
                              </span>
                            )}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer with version - Easter egg trigger */}
      <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
        <button
          onClick={() => setShowCredits(true)}
          className={`w-full flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors ${
            sidebarCollapsed ? 'justify-center' : 'space-x-2'
          }`}
          title="About this dashboard"
        >
          <Info className="h-3.5 w-3.5 flex-shrink-0" />
          {!sidebarCollapsed && <span>v1.1.0</span>}
        </button>
      </div>
    </aside>
    </>
  );
};

export default SidebarNavigation;
