const fs = require('fs');
const path = require('path');

// Project mappings with file paths
const PROJECT_MAPPINGS = {
  'OP-000': {
    name: 'Claude Enterprise & Code Expansion',
    files: ['OP-000 - Claude_Enterprise_Expansion_Project_Analysis.md']
  },
  'OP-001': {
    name: 'Sales Deal Agentic Intelligence',
    files: [
      'OP-001 - Executive_Summary_Unified_Deal_Intelligence_Platform.md',
      'OP-001 - Updated_Deal_Intelligence_Platform_Solution_Nov_2025.md'
    ]
  },
  'OP-005': {
    name: 'Lead Generation Agentic Intelligence',
    files: [
      'OP-005 - BDR_Intelligence_Platform_FINAL_Analysis.md',
      'OP-005 - BDR_Intelligence_Platform_Project_Summary.md'
    ]
  },
  'OP-011': {
    name: 'Claude Code Marketplace',
    files: [
      'OP-011 - Marketplace_AI_Project_Analysis.md',
      'OP-011 - MARKETPLACE_EXECUTIVE_SUMMARY.md'
    ]
  },
  'OP-014': {
    name: 'Open Observability Vault',
    files: ['OP-014 - Operational_Data_Foundation_Project_V2_README.md']
  }
};

// Helper function to extract text between markdown headings
function extractSection(content, headingPattern, endPatterns = []) {
  const regex = new RegExp(`^#{1,3}\\s+${headingPattern}\\s*$`, 'im');
  const match = content.match(regex);

  if (!match) return null;

  const startIndex = match.index + match[0].length;
  let endIndex = content.length;

  // Find the next heading of same or higher level
  const nextHeadingRegex = /^#{1,3}\s+/gm;
  nextHeadingRegex.lastIndex = startIndex;
  const nextMatch = nextHeadingRegex.exec(content);

  if (nextMatch) {
    endIndex = nextMatch.index;
  }

  // Check for custom end patterns
  for (const endPattern of endPatterns) {
    const endRegex = new RegExp(endPattern, 'gm');
    endRegex.lastIndex = startIndex;
    const endMatch = endRegex.exec(content);
    if (endMatch && endMatch.index < endIndex) {
      endIndex = endMatch.index;
    }
  }

  return content.substring(startIndex, endIndex).trim();
}

// Helper function to parse phases from content
function parsePhases(content) {
  const phases = [];
  const phasePattern = /(?:Phase\s+\d+|PHASE\s+\d+)[:\s\-]*([^\n]+)/gi;
  let match;

  while ((match = phasePattern.exec(content)) !== null) {
    const phaseName = match[0].trim();
    const phaseStartIndex = match.index;

    // Find the description (text after the phase name until next phase or section)
    let descriptionEndIndex = content.length;
    const nextPhaseRegex = /(?:Phase\s+\d+|PHASE\s+\d+|^#{1,3}\s+)/gm;
    nextPhaseRegex.lastIndex = phaseStartIndex + match[0].length;
    const nextMatch = nextPhaseRegex.exec(content);

    if (nextMatch) {
      descriptionEndIndex = nextMatch.index;
    }

    const description = content.substring(phaseStartIndex + match[0].length, descriptionEndIndex)
      .trim()
      .split('\n')[0]
      .replace(/^\*\*|\*\*$/g, '')
      .replace(/^\-\s*/, '')
      .substring(0, 200);

    phases.push({
      name: phaseName,
      description: description || 'Implementation phase',
      timeline: 'Q1-Q4 2026',
      deliverables: []
    });
  }

  return phases.length > 0 ? phases : [{
    name: 'Phase 1: Implementation',
    description: 'Project implementation and deployment',
    timeline: 'Q1-Q4 2026',
    deliverables: []
  }];
}

// Helper function to parse KPIs
function parseKPIs(content) {
  const kpis = [];
  const kpiPattern = /(?:\*\*)?([A-Z][a-z\s]+(?:Rate|Time|Value|ROI|Adoption|Savings|Revenue|Users|Score|Percentage|Capacity))(?:\*\*)?\s*[:=]\s*([^\n]+)/gi;
  let match;

  let count = 0;
  while ((match = kpiPattern.exec(content)) !== null && count < 6) {
    const metric = match[1].trim();
    const value = match[2].trim().replace(/\*\*/g, '');

    kpis.push({
      metric,
      description: value.substring(0, 100),
      baseline: '',
      target: value,
      targetFormatted: value
    });
    count++;
  }

  return kpis.length > 0 ? kpis : [{
    metric: 'Value Delivery',
    description: 'Projected annual value from implementation',
    baseline: 'Current state',
    target: 'Target state',
    targetFormatted: 'TBD'
  }];
}

// Helper function to parse risks
function parseRisks(content) {
  const risks = [];
  const riskSections = content.match(/(?:Risk|Challenge|Concern)[^\n]*:([^\n]+)/gi);

  if (riskSections) {
    riskSections.slice(0, 5).forEach(risk => {
      risks.push(risk.trim().replace(/\*\*/g, ''));
    });
  }

  return risks.length > 0 ? risks : [
    'Implementation complexity and timeline management',
    'Resource availability and capacity constraints',
    'Technical dependencies and integration challenges'
  ];
}

// Parse a single project
function parseProject(projectId, projectInfo, dataDir) {
  console.log(`\nParsing ${projectId}: ${projectInfo.name}...`);

  let combinedContent = '';

  // Read and combine all files for this project
  for (const fileName of projectInfo.files) {
    const filePath = path.join(dataDir, fileName);
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        combinedContent += '\n\n' + content;
        console.log(`  ✓ Read ${fileName}`);
      } else {
        console.log(`  ⚠ File not found: ${fileName}`);
      }
    } catch (error) {
      console.log(`  ✗ Error reading ${fileName}: ${error.message}`);
    }
  }

  if (!combinedContent.trim()) {
    console.log(`  ✗ No content found for ${projectId}`);
    return null;
  }

  // Extract executive summary - get more content
  let executiveSummary = extractSection(combinedContent, '(?:Executive Summary|EXECUTIVE SUMMARY|Summary)');
  if (!executiveSummary) {
    // Try to get first several paragraphs (more content)
    const paragraphs = combinedContent.split('\n\n').filter(p => p.trim() && !p.startsWith('#') && p.length > 50);
    executiveSummary = paragraphs.slice(0, 4).join('\n\n').substring(0, 1500);
  }
  // If still short, get more paragraphs
  if (executiveSummary.length < 400) {
    const paragraphs = combinedContent.split('\n\n').filter(p => p.trim() && !p.startsWith('#') && p.length > 30);
    executiveSummary = paragraphs.slice(0, 5).join('\n\n').substring(0, 1500);
  }

  // Extract goal - get more comprehensive description
  let goal = extractSection(combinedContent, '(?:Goal|Objective|Purpose|Problem Statement|Vision)');
  if (!goal) {
    goal = extractSection(combinedContent, '(?:What|Why)');
  }
  if (!goal) {
    // Try to extract from Recommendation or Problem sections
    goal = extractSection(combinedContent, '(?:Recommendation|Problem|Challenge|Opportunity)');
  }
  if (!goal || goal.length < 100) {
    // Get a meaningful paragraph from the content
    const meaningfulParagraphs = combinedContent.split('\n\n').filter(p =>
      p.trim() &&
      !p.startsWith('#') &&
      p.length > 100 &&
      (p.toLowerCase().includes('goal') ||
       p.toLowerCase().includes('objective') ||
       p.toLowerCase().includes('deliver') ||
       p.toLowerCase().includes('enable'))
    );
    if (meaningfulParagraphs.length > 0) {
      goal = meaningfulParagraphs[0].substring(0, 500);
    } else {
      goal = 'Deliver value through AI-powered capabilities and operational improvements';
    }
  } else {
    goal = goal.split('\n\n')[0].substring(0, 500);
  }

  // Parse phases
  const phasesSection = extractSection(combinedContent, '(?:Phases|Implementation|Timeline|Rollout)');
  const phases = parsePhases(phasesSection || combinedContent);

  // Parse KPIs
  const kpisSection = extractSection(combinedContent, '(?:KPI|Metrics|Success Criteria|Targets)');
  const kpis = parseKPIs(kpisSection || combinedContent);

  // Parse risks
  const risksSection = extractSection(combinedContent, '(?:Risk|Challenge|Concern)');
  const risks = parseRisks(risksSection || combinedContent);

  // Extract value and ROI (try to find in content)
  let value = 'TBD';
  let roi = 'TBD';

  // Try multiple patterns for value extraction
  const valuePatterns = [
    /Expected Annual Value\*\*\s*\|\s*\$?([\d,]+K)/i, // Table format: | **Expected Annual Value** | $1,846K |
    /Projected annual value[:\s]+\*\*?\$?([\d.]+M)\*\*?/i,
    /Annual Value[:\s]+\*\*?\$?([\d,]+)\s*\(~?\$?([\d.]+M)\)/i,
    /Total Additional Value[:\s]+\*\*?\$?([\d,]+)\s*annually\s*\(~?\$?([\d.]+M)\)/i,
    /\$[\d,]+[MK]?\s*(?:annual\s*)?(?:value|benefit)/i
  ];

  for (const pattern of valuePatterns) {
    const match = combinedContent.match(pattern);
    if (match) {
      if (match[2]) {
        // Pattern with parentheses like "$5,058,204 (~$5.06M)"
        value = '$' + match[2];
        break;
      } else if (match[1]) {
        // Pattern with just the value
        value = match[1].startsWith('$') ? match[1] : '$' + match[1];
        break;
      } else {
        const extracted = match[0].match(/\$[\d,.]+[MK]?/);
        if (extracted) {
          value = extracted[0];
          break;
        }
      }
    }
  }

  // Try multiple patterns for ROI extraction
  const roiPatterns = [
    /12-Month ROI\*\*\s*\|\s*(\d+%)/i, // Table format: | **12-Month ROI** | 156% |
    /Overall expansion ROI[:\s]+\*\*?([\d.]+x)\*\*?/i,
    /Overall ROI[:\s]+\*\*?([\d.]+x)\*\*?/i,
    /([\d.]+x)\s*ROI/i,
    /(\d+[,\d]*%)\s*ROI/i
  ];

  for (const pattern of roiPatterns) {
    const match = combinedContent.match(pattern);
    if (match) {
      roi = match[1];
      break;
    }
  }

  console.log(`  ✓ Parsed: ${phases.length} phases, ${kpis.length} KPIs, ${risks.length} risks`);

  return {
    projectId,
    projectName: projectInfo.name,
    executiveSummary: executiveSummary.substring(0, 800),
    goal: goal,
    phases: phases.slice(0, 4), // Max 4 phases
    kpis: kpis.slice(0, 6), // Max 6 KPIs
    value,
    roi,
    risks: risks.slice(0, 5), // Max 5 risks
    tier: 'TIER 0: FOUNDATION',
    status: 'Proposed'
  };
}

// Main execution
function main() {
  const dataDir = path.join(__dirname, '../data/ai-projects');
  const outputPath = path.join(__dirname, '../app/ai-projects-details.json');

  console.log('Starting project details extraction...');
  console.log(`Data directory: ${dataDir}`);
  console.log(`Output path: ${outputPath}`);

  const projectDetails = {};

  // Parse each project
  for (const [projectId, projectInfo] of Object.entries(PROJECT_MAPPINGS)) {
    const result = parseProject(projectId, projectInfo, dataDir);
    if (result) {
      projectDetails[projectId] = result;
    }
  }

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(projectDetails, null, 2));
  console.log(`\n✓ Successfully generated ${outputPath}`);
  console.log(`✓ Parsed ${Object.keys(projectDetails).length} projects`);
}

// Run the script
main();
