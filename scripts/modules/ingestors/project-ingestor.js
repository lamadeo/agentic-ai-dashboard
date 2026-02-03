/**
 * Project Ingestor
 *
 * Discovers and parses all OP-XXX markdown files from /data/ai-projects/
 * Handles multiple files per project (e.g., OP-011 has 6 files)
 * Extracts structured data for annual plan generation
 *
 * Key Features:
 * - Auto-discovery of all project markdown files
 * - Groups files by project ID (OP-000, OP-001, etc.)
 * - Parses and aggregates content from multiple files
 * - Extracts: value, ROI, dependencies, KPIs, phases, risks
 *
 * Dependencies: None (file system only)
 */

const fs = require('fs');
const path = require('path');

/**
 * Ingest and parse all project markdown files
 *
 * @param {Object} options - Configuration options
 * @param {string} options.projectsDir - Path to ai-projects directory
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Parsed projects with metadata
 */
async function ingestProjects(options = {}) {
  const {
    projectsDir = path.join(__dirname, '../../../data/ai-projects'),
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Ingesting project files...\n');
  }

  // Step 1: Discover all OP-XXX markdown files
  const files = fs.readdirSync(projectsDir)
    .filter(file => file.match(/^OP-\d+.*\.md$/))
    .map(file => path.join(projectsDir, file));

  if (verbose) {
    console.log(`   Found ${files.length} project files`);
  }

  // Step 2: Group files by project ID
  const projectGroups = {};
  files.forEach(file => {
    const filename = path.basename(file);
    const match = filename.match(/^(OP-\d+)/);
    if (match) {
      const projectId = match[1];
      if (!projectGroups[projectId]) {
        projectGroups[projectId] = [];
      }
      projectGroups[projectId].push(file);
    }
  });

  if (verbose) {
    console.log(`   Grouped into ${Object.keys(projectGroups).length} projects:`);
    Object.entries(projectGroups).forEach(([id, files]) => {
      console.log(`      ${id}: ${files.length} file(s)`);
    });
  }

  // Step 3: Parse each project (aggregate multiple files)
  const projects = [];
  const parseErrors = [];

  for (const [projectId, projectFiles] of Object.entries(projectGroups)) {
    try {
      const project = await parseProject(projectId, projectFiles, verbose);
      projects.push(project);
    } catch (error) {
      parseErrors.push({
        projectId,
        error: error.message
      });
      if (verbose) {
        console.warn(`   ⚠️  Error parsing ${projectId}: ${error.message}`);
      }
    }
  }

  if (verbose) {
    console.log(`\n✅ Project Ingestion Summary:`);
    console.log(`   - Projects parsed: ${projects.length}`);
    console.log(`   - Parse errors: ${parseErrors.length}`);
  }

  return {
    projects,
    metadata: {
      totalProjects: projects.length,
      totalFiles: files.length,
      parseErrors,
      projectsDir
    }
  };
}

/**
 * Parse a single project (may aggregate multiple files)
 *
 * @param {string} projectId - Project ID (e.g., "OP-000")
 * @param {Array<string>} files - Array of file paths for this project
 * @param {boolean} verbose - Enable logging
 * @returns {Promise<Object>} Parsed project data
 */
async function parseProject(projectId, files, verbose = false) {
  // Read all files for this project
  const contents = files.map(file => ({
    file: path.basename(file),
    content: fs.readFileSync(file, 'utf8')
  }));

  // Aggregate content from all files
  const aggregated = aggregateContent(contents);

  // Extract structured data
  const parsed = {
    id: projectId,
    name: extractName(aggregated, projectId),
    files: files.map(f => path.basename(f)),

    // Financial data
    value: extractValue(aggregated),
    cost: extractCost(aggregated),
    roi: extractROI(aggregated),

    // Project structure
    effort: extractEffort(aggregated),
    quarters: extractQuarters(aggregated),
    dependencies: extractDependencies(aggregated),

    // Strategic alignment
    strategic: {
      pillars: extractPillars(aggregated),
      drivers: extractDrivers(aggregated),
      tier: extractTier(aggregated)
    },

    // Metadata
    kpis: extractKPIs(aggregated),
    phases: extractPhases(aggregated),
    risks: extractRisks(aggregated),
    status: extractStatus(aggregated),

    // Raw content (for progress tracking and AI analysis)
    summary: extractSummary(aggregated, 500),
    content: aggregated  // Full content for Tier 1 progress tracking
  };

  return parsed;
}

/**
 * Aggregate content from multiple files for the same project
 */
function aggregateContent(contents) {
  // Combine all file contents with file markers
  return contents.map(c => `\n--- FILE: ${c.file} ---\n${c.content}`).join('\n\n');
}

/**
 * Extract project name from content
 */
function extractName(content, projectId) {
  // Try various patterns (support both \n and \r\n line endings)
  const patterns = [
    /# (.+?)(?:\r?\n|$)/,
    /## (.+?)(?:\r?\n|$)/,
    /\*\*Project:\*\* (.+?)(?:\r?\n|$)/i,
    /\*\*Name:\*\* (.+?)(?:\r?\n|$)/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // Fallback: Use project ID
  return projectId;
}

/**
 * Extract annual value
 */
function extractValue(content) {
  const patterns = [
    /\*\*Annual Value:\*\* \$?([\d,.]+[MmKk]?)/i,
    /\*\*Value:\*\* \$?([\d,.]+[MmKk]?)/i,
    /Annual Value.*?\$?([\d,.]+[MmKk]?)/i,
    /Total Value.*?\$?([\d,.]+[MmKk]?)/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return parseFinancial(match[1]);
    }
  }

  return null;
}

/**
 * Extract annual cost
 */
function extractCost(content) {
  const patterns = [
    /\*\*Annual Cost:\*\* \$?([\d,.]+[MmKk]?)/i,
    /\*\*Cost:\*\* \$?([\d,.]+[MmKk]?)/i,
    /Total Cost.*?\$?([\d,.]+[MmKk]?)/i,
    /Implementation Cost.*?\$?([\d,.]+[MmKk]?)/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return parseFinancial(match[1]);
    }
  }

  return null;
}

/**
 * Extract ROI percentage
 */
function extractROI(content) {
  const patterns = [
    /\*\*ROI:\*\* ([\d,.]+)%/i,
    /ROI.*?([\d,.]+)%/i,
    /([\d,.]+)% ROI/i,
    /Return on Investment.*?([\d,.]+)%/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
  }

  return null;
}

/**
 * Extract effort in engineering days
 */
function extractEffort(content) {
  const patterns = [
    /\*\*Effort:\*\* ([\d]+) (?:eng-)?days?/i,
    /([\d]+) engineering days/i,
    /([\d]+) days? effort/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }

  return null;
}

/**
 * Extract target quarters
 */
function extractQuarters(content) {
  const quarters = [];
  if (content.match(/Q1[ -]20\d\d/i)) quarters.push('Q1');
  if (content.match(/Q2[ -]20\d\d/i)) quarters.push('Q2');
  if (content.match(/Q3[ -]20\d\d/i)) quarters.push('Q3');
  if (content.match(/Q4[ -]20\d\d/i)) quarters.push('Q4');

  return quarters.length > 0 ? quarters : ['TBD'];
}

/**
 * Extract dependencies
 */
function extractDependencies(content) {
  const dependencies = [];

  // Find dependency section
  const depSection = content.match(/## Dependencies.*?\n([\s\S]*?)(?=\n##|$)/i);
  if (!depSection) return dependencies;

  const section = depSection[1];

  // Extract OP-XXX references
  const opRefs = section.match(/OP-\d+/g) || [];
  opRefs.forEach(ref => {
    // Determine type based on keywords
    const context = section.substring(
      Math.max(0, section.indexOf(ref) - 50),
      Math.min(section.length, section.indexOf(ref) + 100)
    );

    const isHard = /requires?|prerequisite|must have|blocked/i.test(context);
    const type = isHard ? 'HARD' : 'SOFT';

    dependencies.push({
      project: ref,
      type
    });
  });

  return dependencies;
}

/**
 * Extract strategic pillars
 */
function extractPillars(content) {
  const pillars = [];
  if (/impactful/i.test(content)) pillars.push('Impactful');
  if (/intuitive/i.test(content)) pillars.push('Intuitive');
  if (/intelligent/i.test(content)) pillars.push('Intelligent');
  if (/trustworthy/i.test(content)) pillars.push('Trustworthy');
  return pillars;
}

/**
 * Extract strategic drivers
 */
function extractDrivers(content) {
  const drivers = [];
  if (/win|sales|revenue/i.test(content)) drivers.push('Win');
  if (/retain|churn|satisfaction/i.test(content)) drivers.push('Retain');
  if (/innovate|future|competitive/i.test(content)) drivers.push('Innovate');
  return drivers;
}

/**
 * Extract tier classification
 */
function extractTier(content) {
  if (/TIER 0|FOUNDATION/i.test(content)) return 'TIER 0: FOUNDATION';
  if (/TIER 1|REVENUE/i.test(content)) return 'TIER 1: REVENUE';
  if (/TIER 2|RETENTION/i.test(content)) return 'TIER 2: RETENTION';
  return 'TBD';
}

/**
 * Extract KPIs
 */
function extractKPIs(content) {
  const kpis = [];

  // Find KPI section
  const kpiSection = content.match(/## (?:KPIs|Key Performance Indicators|Success Metrics).*?\n([\s\S]*?)(?=\n##|$)/i);
  if (!kpiSection) return kpis;

  // Extract bullet points or numbered list
  const lines = kpiSection[1].split('\n');
  lines.forEach(line => {
    line = line.trim();
    if (line.match(/^[-*\d.]+\s+(.+)/)) {
      const kpi = line.replace(/^[-*\d.]+\s+/, '').trim();
      if (kpi) kpis.push(kpi);
    }
  });

  return kpis;
}

/**
 * Extract project phases
 */
function extractPhases(content) {
  const phases = [];

  // Find phases section
  const phaseSection = content.match(/## (?:Phases|Implementation Plan|Timeline).*?\n([\s\S]*?)(?=\n##|$)/i);
  if (!phaseSection) return phases;

  // Extract phase descriptions
  const lines = phaseSection[1].split('\n');
  let currentPhase = null;

  lines.forEach(line => {
    line = line.trim();
    // Phase header (###, **, or numbered)
    if (line.match(/^###\s+(.+)/) || line.match(/^\*\*Phase \d+:(.+)\*\*/) || line.match(/^\d+\.\s+\*\*(.+)\*\*/)) {
      if (currentPhase) phases.push(currentPhase);
      currentPhase = { name: line.replace(/[#*\d.]+/g, '').trim(), description: '' };
    } else if (currentPhase && line) {
      currentPhase.description += line + ' ';
    }
  });

  if (currentPhase) phases.push(currentPhase);

  return phases;
}

/**
 * Extract risks
 */
function extractRisks(content) {
  const risks = [];

  // Find risks section
  const riskSection = content.match(/## (?:Risks|Risk Assessment|Challenges).*?\n([\s\S]*?)(?=\n##|$)/i);
  if (!riskSection) return risks;

  // Extract bullet points or numbered list
  const lines = riskSection[1].split('\n');
  lines.forEach(line => {
    line = line.trim();
    if (line.match(/^[-*\d.]+\s+(.+)/)) {
      const risk = line.replace(/^[-*\d.]+\s+/, '').trim();
      if (risk) risks.push(risk);
    }
  });

  return risks;
}

/**
 * Extract status
 */
function extractStatus(content) {
  if (/status.*?proposed/i.test(content)) return 'proposed';
  if (/status.*?in[- ]progress/i.test(content)) return 'in-progress';
  if (/status.*?complete/i.test(content)) return 'completed';
  if (/status.*?on[- ]hold/i.test(content)) return 'on-hold';
  return 'proposed';
}

/**
 * Extract executive summary (first N characters)
 */
function extractSummary(content, maxLength = 500) {
  // Find summary or introduction section
  const summarySection = content.match(/## (?:Executive Summary|Summary|Overview).*?\n([\s\S]*?)(?=\n##|$)/i);
  if (summarySection) {
    const summary = summarySection[1].trim();
    return summary.length > maxLength ? summary.substring(0, maxLength) + '...' : summary;
  }

  // Fallback: Use first paragraph after first heading
  const firstPara = content.match(/# .*?\n\n([\s\S]*?)(?=\n\n|$)/);
  if (firstPara) {
    const para = firstPara[1].trim();
    return para.length > maxLength ? para.substring(0, maxLength) + '...' : para;
  }

  return 'No summary available';
}

/**
 * Parse financial string to number (handles K, M suffixes)
 */
function parseFinancial(str) {
  if (!str) return null;

  str = str.trim().toUpperCase();
  let multiplier = 1;

  if (str.endsWith('K')) {
    multiplier = 1000;
    str = str.slice(0, -1);
  } else if (str.endsWith('M')) {
    multiplier = 1000000;
    str = str.slice(0, -1);
  }

  const num = parseFloat(str.replace(/,/g, ''));
  return isNaN(num) ? null : num * multiplier;
}

module.exports = {
  ingestProjects
};
