'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Search, Building2, Users, Sparkles, TrendingUp } from 'lucide-react';
import EmployeeNode from '../shared/EmployeeNode';
import {
  transformOrgChartToFlow,
  calculateOrgStats
} from '../../utils/orgChartTransformer';

/**
 * Agentic Org Chart Tab Component
 *
 * Interactive visualization showing organizational capacity with AI augmentation.
 * Displays 258 human employees + their agentic FTE contributions.
 */
export default function AgenticOrgChart({ aiToolsData }) {
  // Get org chart data
  const orgChart = aiToolsData?.orgChart || null;
  console.log('AgenticOrgChart: Received data', {
    hasAiToolsData: !!aiToolsData,
    hasOrgChart: !!orgChart,
    orgChartKeys: orgChart ? Object.keys(orgChart) : null
  });

  // Transform to React Flow format
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!orgChart) return { nodes: [], edges: [] };
    const result = transformOrgChartToFlow(orgChart);
    console.log('AgenticOrgChart: Transformed data', {
      nodeCount: result.nodes.length,
      edgeCount: result.edges.length,
      firstNode: result.nodes[0]
    });
    return result;
  }, [orgChart]);

  // Calculate organization statistics
  const orgStats = useMemo(() => {
    if (!orgChart) return null;
    const stats = calculateOrgStats(orgChart);
    console.log('AgenticOrgChart: Calculated stats', stats);
    return stats;
  }, [orgChart]);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [searchTerm, setSearchTerm] = useState('');

  // Adoption level filter state (all enabled by default)
  const [activeFilters, setActiveFilters] = useState({
    high: true,
    mediumHigh: true,
    medium: true,
    low: true,
    minimal: true,
    none: true
  });

  // Custom node types
  const nodeTypes = useMemo(() => ({
    employeeNode: EmployeeNode
  }), []);

  // Helper function to get adoption level from FTE value
  const getAdoptionLevel = useCallback((fte) => {
    if (fte >= 1.0) return 'high';
    if (fte >= 0.5) return 'mediumHigh';
    if (fte >= 0.3) return 'medium';
    if (fte >= 0.1) return 'low';
    if (fte > 0) return 'minimal';
    return 'none';
  }, []);

  // Toggle adoption level filter
  const toggleFilter = useCallback((level) => {
    setActiveFilters(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  }, []);

  // Handle expand/collapse of child nodes
  const handleToggleChildren = useCallback((nodeId, isExpanded) => {
    setNodes((nds) => {
      // Find all descendant node IDs
      const findDescendants = (currentNodeId) => {
        const descendants = [];
        const queue = [currentNodeId];

        while (queue.length > 0) {
          const id = queue.shift();
          // Find edges where source is current node
          const childEdges = edges.filter(edge => edge.source === id);
          childEdges.forEach(edge => {
            descendants.push(edge.target);
            queue.push(edge.target);
          });
        }

        return descendants;
      };

      const descendantIds = findDescendants(nodeId);

      // Update visibility of descendants
      return nds.map((node) => {
        if (descendantIds.includes(node.id)) {
          return {
            ...node,
            hidden: !isExpanded
          };
        }
        return node;
      });
    });
  }, [edges, setNodes]);

  // Add onToggleChildren callback to all nodes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onToggleChildren: handleToggleChildren
        }
      }))
    );
  }, [handleToggleChildren, setNodes]);

  // Apply adoption level filter to nodes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const fte = node.data.agenticFTE?.current || 0;
        const adoptionLevel = getAdoptionLevel(fte);
        const isFilteredOut = !activeFilters[adoptionLevel];

        // Don't hide nodes that were already hidden by expand/collapse
        // Only apply filter if node would normally be visible
        if (isFilteredOut) {
          return {
            ...node,
            style: {
              ...node.style,
              opacity: 0.2,
              pointerEvents: 'none'
            }
          };
        } else {
          return {
            ...node,
            style: {
              ...node.style,
              opacity: 1,
              pointerEvents: 'auto'
            }
          };
        }
      })
    );
  }, [activeFilters, getAdoptionLevel, setNodes]);

  // Handle search
  const handleSearch = useCallback((e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      // Reset all nodes
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          style: { ...node.style, opacity: 1 }
        }))
      );
      return;
    }

    // Highlight matching nodes
    setNodes((nds) =>
      nds.map((node) => {
        const matches =
          node.data.name.toLowerCase().includes(term) ||
          node.data.title.toLowerCase().includes(term);
        return {
          ...node,
          style: {
            ...node.style,
            opacity: matches ? 1 : 0.3
          }
        };
      })
    );
  }, [setNodes]);

  // If no data, show empty state
  if (!orgChart || !orgStats) {
    return (
      <div className="p-8 text-center">
        <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-600 mb-2">No Org Chart Data</h3>
        <p className="text-gray-500">
          Run data refresh to load organizational chart data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: 'calc(100vh - 160px)', minHeight: '600px' }}>
      {/* Summary Metrics Panel */}
      <div className="bg-white border-b border-gray-200 p-6 space-y-4 flex-shrink-0">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            Agentic Organization Chart
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Interactive view of organizational capacity including AI augmentation
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Employees */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700 uppercase">Employees</span>
            </div>
            <div className="text-3xl font-bold text-blue-900">{orgStats.totalEmployees}</div>
            <div className="text-xs text-blue-700 mt-1">Human workforce</div>
          </div>

          {/* Agentic FTE */}
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700 uppercase">Agentic FTE</span>
            </div>
            <div className="text-3xl font-bold text-emerald-900">
              +{orgStats.totalAgenticFTE}
            </div>
            <div className="text-xs text-emerald-700 mt-1">AI-augmented capacity</div>
          </div>

          {/* Effective Capacity */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-medium text-purple-700 uppercase">Total Capacity</span>
            </div>
            <div className="text-3xl font-bold text-purple-900">
              {orgStats.effectiveCapacity}
            </div>
            <div className="text-xs text-purple-700 mt-1">Effective FTE</div>
          </div>

          {/* Capacity Gain */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-xs font-medium text-orange-700 uppercase">Gain</span>
            </div>
            <div className="text-3xl font-bold text-orange-900">
              +{orgStats.capacityGain}%
            </div>
            <div className="text-xs text-orange-700 mt-1">Capacity multiplier</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees by name or title..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* React Flow Visualization */}
      <div className="flex-1 relative" style={{ minHeight: '400px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        >
          <Background color="#e5e7eb" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const fte = node.data.agenticFTE?.current || 0;
              if (fte >= 1.0) return '#10b981';
              if (fte >= 0.5) return '#34d399';
              if (fte >= 0.1) return '#6ee7b7';
              return '#d1d5db';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />

          {/* Legend Panel */}
          <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              AI Adoption Filter
            </h3>
            <p className="text-xs text-gray-500 mb-3">Click to toggle visibility</p>

            {/* Color scale - now interactive */}
            <div className="space-y-2 text-xs">
              <div
                className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors ${
                  !activeFilters.high ? 'opacity-40' : ''
                }`}
                onClick={() => toggleFilter('high')}
                title="Click to toggle"
              >
                <div className={`w-4 h-4 rounded bg-emerald-500 ${!activeFilters.high ? 'ring-2 ring-red-400' : ''}`}></div>
                <span className="text-gray-700">High (≥1.0 FTE)</span>
              </div>
              <div
                className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors ${
                  !activeFilters.mediumHigh ? 'opacity-40' : ''
                }`}
                onClick={() => toggleFilter('mediumHigh')}
                title="Click to toggle"
              >
                <div className={`w-4 h-4 rounded bg-emerald-400 ${!activeFilters.mediumHigh ? 'ring-2 ring-red-400' : ''}`}></div>
                <span className="text-gray-700">Medium-High (0.5-1.0 FTE)</span>
              </div>
              <div
                className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors ${
                  !activeFilters.medium ? 'opacity-40' : ''
                }`}
                onClick={() => toggleFilter('medium')}
                title="Click to toggle"
              >
                <div className={`w-4 h-4 rounded bg-emerald-300 ${!activeFilters.medium ? 'ring-2 ring-red-400' : ''}`}></div>
                <span className="text-gray-700">Medium (0.3-0.5 FTE)</span>
              </div>
              <div
                className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors ${
                  !activeFilters.low ? 'opacity-40' : ''
                }`}
                onClick={() => toggleFilter('low')}
                title="Click to toggle"
              >
                <div className={`w-4 h-4 rounded bg-emerald-200 ${!activeFilters.low ? 'ring-2 ring-red-400' : ''}`}></div>
                <span className="text-gray-700">Low (0.1-0.3 FTE)</span>
              </div>
              <div
                className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors ${
                  !activeFilters.minimal ? 'opacity-40' : ''
                }`}
                onClick={() => toggleFilter('minimal')}
                title="Click to toggle"
              >
                <div className={`w-4 h-4 rounded bg-emerald-100 ${!activeFilters.minimal ? 'ring-2 ring-red-400' : ''}`}></div>
                <span className="text-gray-700">Minimal (&lt;0.1 FTE)</span>
              </div>
              <div
                className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors ${
                  !activeFilters.none ? 'opacity-40' : ''
                }`}
                onClick={() => toggleFilter('none')}
                title="Click to toggle"
              >
                <div className={`w-4 h-4 rounded bg-gray-100 border border-gray-300 ${!activeFilters.none ? 'ring-2 ring-red-400' : ''}`}></div>
                <span className="text-gray-700">No AI usage</span>
              </div>
            </div>

            {/* Role badges */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-xs">
              <div className="font-medium text-gray-700 mb-2">Role Types:</div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full border bg-purple-100 text-purple-800 border-purple-300 text-xs">
                  Executive
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full border bg-blue-100 text-blue-800 border-blue-300 text-xs">
                  Manager
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full border bg-gray-100 text-gray-700 border-gray-300 text-xs">
                  IC
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
              <p className="mb-2 font-medium">Interaction:</p>
              <ul className="space-y-1 text-gray-500">
                <li>• Click legend items to filter</li>
                <li>• Drag to pan</li>
                <li>• Scroll to zoom</li>
                <li>• Hover nodes for details</li>
                <li>• Use search to find people</li>
              </ul>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
