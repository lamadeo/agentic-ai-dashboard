"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Layers, BarChart3 } from 'lucide-react';

const ProjectDetail = ({ project }) => {
  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with project name and ID */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{project.projectName}</h2>
        <p className="text-sm text-gray-500">Project ID: {project.projectId}</p>
      </div>

      {/* Status & Metrics Cards (4-column grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="text-xs font-medium text-gray-600 mb-1">Status</div>
          <div className="text-lg font-bold text-gray-900">{project.status}</div>
        </div>

        {/* Value card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="text-xs font-medium text-gray-600 mb-1">Annual Value</div>
          <div className="text-lg font-bold text-green-600">{project.value}</div>
        </div>

        {/* ROI card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="text-xs font-medium text-gray-600 mb-1">ROI</div>
          <div className="text-lg font-bold text-green-600">{project.roi}</div>
        </div>

        {/* Tier card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="text-xs font-medium text-gray-600 mb-1">Tier</div>
          <div className="text-sm font-semibold text-blue-600">{project.tier}</div>
        </div>
      </div>

      {/* Executive Summary (blue background, prominent) */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Executive Summary
        </h3>
        <div className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-headings:text-blue-900 prose-strong:text-blue-900">
          <ReactMarkdown>{project.executiveSummary}</ReactMarkdown>
        </div>
      </div>

      {/* Goal (white card with shadow) */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Target className="h-5 w-5 mr-2 text-indigo-600" />
          Project Goal
        </h3>
        <div className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-headings:text-gray-900 prose-strong:text-indigo-900">
          <ReactMarkdown>{project.goal}</ReactMarkdown>
        </div>
      </div>

      {/* Implementation Phases (white card with timeline) */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Layers className="h-5 w-5 mr-2 text-indigo-600" />
          Implementation Phases
        </h3>
        <div className="space-y-4">
          {project.phases.map((phase, idx) => (
            <div key={idx} className="border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50 rounded-r">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">{phase.name}</h4>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {phase.timeline}
                </span>
              </div>
              <p className="text-sm text-gray-700">{phase.description}</p>
              {phase.deliverables && phase.deliverables.length > 0 && (
                <ul className="text-xs text-gray-600 space-y-1 ml-4 mt-2">
                  {phase.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-indigo-500 mr-2">▸</span>
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* KPIs & Target Metrics (white card with grid) */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
          Key Performance Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.kpis.map((kpi, idx) => (
            <div key={idx} className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="text-xs font-medium text-green-700 mb-1">{kpi.metric}</div>
              <div className="text-xl font-bold text-green-900 mb-1">{kpi.targetFormatted}</div>
              {kpi.description && (
                <div className="text-xs text-gray-600 mt-1 line-clamp-2">{kpi.description}</div>
              )}
            </div>
          ))}
        </div>

        {/* Value & ROI Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">Annual Value: </span>
            <span className="text-xl font-bold text-green-600">{project.value}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">ROI: </span>
            <span className="text-xl font-bold text-green-600">{project.roi}</span>
          </div>
        </div>
      </div>

      {/* Risks (orange background, conditional rendering) */}
      {project.risks && project.risks.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-600 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Risks & Mitigation
          </h3>
          <ul className="space-y-3">
            {project.risks.map((risk, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-700">
                <AlertTriangle className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
