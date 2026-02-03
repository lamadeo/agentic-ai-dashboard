import React from 'react';
import DynamicAnnualPlanPresentation from '../DynamicAnnualPlanPresentation';

/**
 * DynamicAnnualPlan Tab - AI-generated dynamic annual plan presentation wrapper (Beta)
 * @param {Object} props
 * @param {Object} props.aiToolsData - Full dashboard data (passed but not used - presentation loads from JSON)
 */
const DynamicAnnualPlan = ({ aiToolsData }) => {
  return (
    <div className="h-[calc(100vh-12rem)]">
      <DynamicAnnualPlanPresentation />
    </div>
  );
};

export default DynamicAnnualPlan;
