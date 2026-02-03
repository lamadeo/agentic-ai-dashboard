import React from 'react';
import AnnualPlanPresentation from '../AnnualPlanPresentation';

/**
 * AnnualPlan Tab - 2026 Annual Plan presentation wrapper
 * @param {Object} props
 * @param {Object} props.aiToolsData - Full dashboard data for presentation
 * @param {Object} props.portfolioData - Generated portfolio data from annual plan pipeline
 */
const AnnualPlan = ({ aiToolsData, portfolioData }) => {
  return (
    <div className="h-[calc(100vh-12rem)]">
      <AnnualPlanPresentation aiToolsData={aiToolsData} portfolioData={portfolioData} />
    </div>
  );
};

export default AnnualPlan;
