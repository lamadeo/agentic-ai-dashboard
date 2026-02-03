import React from 'react';
import { Download } from 'lucide-react';

/**
 * BriefingOrg Tab - Organization-wide summary for All Hands meetings
 * @param {Object} props
 * @param {Object} props.insights - AI-generated insights with allHandsMessage
 * @param {Object} props.agenticFTEs - Agentic FTE metrics data
 * @param {Object} props.departmentBreakdown - Claude Enterprise department breakdown with Agentic FTE
 * @param {Object} props.m365DepartmentPerformance - M365 department performance with Agentic FTE
 */
const BriefingOrg = ({ insights, agenticFTEs, departmentBreakdown, m365DepartmentPerformance }) => {
  const handleDownload = () => {
    if (!insights?.allHandsMessage) return;

    const content = insights.allHandsMessage;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'company-wide-summary.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Company-wide Summary</h3>
            <p className="text-xs text-gray-500 mt-1 italic">For Monthly All Hands Meetings and All Company internal communications (3 slides max)</p>
          </div>
          {insights?.allHandsMessage && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              Download as Markdown
            </button>
          )}
        </div>
        <div className="prose prose-lg max-w-none">
          {insights?.allHandsMessage ? (
            (() => {
              // Parse the slide deck format manually for better control
              const message = insights.allHandsMessage;
              const slides = message.split(/(?=SLIDE \d+:)/g).filter(s => s.trim());

              return slides.map((slide, slideIdx) => {
                const lines = slide.split('\n');
                let currentSection = null;
                const sections = {};

                lines.forEach(line => {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('SLIDE')) {
                    sections.slideNumber = trimmed;
                  } else if (trimmed.startsWith('TITLE:')) {
                    currentSection = 'title';
                    sections.title = trimmed.replace('TITLE:', '').trim();
                  } else if (trimmed.startsWith('SUBTITLE:')) {
                    currentSection = 'subtitle';
                    sections.subtitle = trimmed.replace('SUBTITLE:', '').trim();
                  } else if (trimmed.startsWith('CONTENT:')) {
                    currentSection = 'content';
                    sections.content = [];
                  } else if (trimmed.startsWith('PRESENTER NOTES:')) {
                    currentSection = 'notes';
                    sections.notes = trimmed.replace('PRESENTER NOTES:', '').trim();
                  } else if (trimmed && currentSection === 'content') {
                    sections.content.push(trimmed);
                  } else if (trimmed && currentSection === 'notes') {
                    sections.notes += ' ' + trimmed;
                  }
                });

                return (
                  <div key={slideIdx} className={slideIdx > 0 ? "mt-12 pt-8 border-t-4 border-blue-500" : ""}>
                    {/* Slide Number */}
                    {sections.slideNumber && (
                      <h2 className="text-3xl font-bold text-blue-900 mb-4">{sections.slideNumber}</h2>
                    )}

                    {/* Title */}
                    {sections.title && (
                      <div className="mb-4">
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">TITLE</h4>
                        <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-lg">
                          {sections.title}
                        </h3>
                      </div>
                    )}

                    {/* Subtitle */}
                    {sections.subtitle && (
                      <div className="mb-4">
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">SUBTITLE</h4>
                        <p className="text-lg text-gray-700 italic pl-4 border-l-4 border-blue-400">
                          {sections.subtitle}
                        </p>
                      </div>
                    )}

                    {/* Content */}
                    {sections.content && sections.content.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">CONTENT</h4>
                        <ul className="list-none space-y-3 bg-white p-4 rounded-lg border-l-4 border-blue-400">
                          {sections.content.map((item, idx) => (
                            <li key={idx} className="flex items-start text-gray-800">
                              <span className="text-blue-500 mr-3 text-xl flex-shrink-0">•</span>
                              <span className="text-base">{item.replace(/^[•·-]\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Presenter Notes */}
                    {sections.notes && (
                      <div className="mb-4">
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">PRESENTER NOTES</h4>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-700 leading-relaxed italic">
                            {sections.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              });
            })()
          ) : (
            <p className="text-gray-500 italic">All Hands message will be generated when data is parsed.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BriefingOrg;
