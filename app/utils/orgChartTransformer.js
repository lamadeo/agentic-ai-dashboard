/**
 * Org Chart to React Flow Transformer
 *
 * Converts hierarchical org chart structure to React Flow nodes and edges format.
 * Calculates positions using a left-to-right tree layout algorithm.
 */

// Layout configuration
const LAYOUT_CONFIG = {
  nodeWidth: 280,
  nodeHeight: 140,
  horizontalSpacing: 80, // Spacing between nodes horizontally (for top-down section)
  verticalSpacing: 40, // Spacing between nodes vertically (for left-right section)
  levelSpacing: 180, // Spacing between levels (for top-down section)
  direction: 'HYBRID' // Hybrid: Top-down for levels 0-1, Left-right for levels 2+
};

/**
 * Transform org chart tree to React Flow nodes and edges
 * @param {Object} orgChart - Hierarchical org chart data
 * @returns {Object} { nodes, edges }
 */
export function transformOrgChartToFlow(orgChart) {
  if (!orgChart?.organization?.ceo) {
    return { nodes: [], edges: [] };
  }

  const nodes = [];
  const edges = [];
  const ceo = orgChart.organization.ceo;

  // Track vertical position for each level (for left-right section)
  const levelYPositions = new Map();

  /**
   * Calculate Y position for a node at given level (used for levels 2+)
   * @param {number} level - Tree depth level
   * @returns {number} Y position
   */
  function getYPositionForLevel(level) {
    if (!levelYPositions.has(level)) {
      levelYPositions.set(level, 0);
    }
    const currentY = levelYPositions.get(level);
    levelYPositions.set(level, currentY + LAYOUT_CONFIG.nodeHeight + LAYOUT_CONFIG.verticalSpacing);
    return currentY;
  }

  /**
   * Count total nodes at a given level
   * @param {Object} node - Employee node
   * @param {number} targetLevel - Level to count
   * @param {number} currentLevel - Current level in traversal
   * @returns {number} Node count
   */
  function countNodesAtLevel(node, targetLevel, currentLevel = 0) {
    let count = currentLevel === targetLevel ? 1 : 0;
    if (node.reports) {
      node.reports.forEach(r => {
        count += countNodesAtLevel(r, targetLevel, currentLevel + 1);
      });
    }
    return count;
  }

  // Pre-calculate node counts for level 1 (for horizontal distribution)
  const level1Count = countNodesAtLevel(ceo, 1);

  // Track sibling index and column position for each level 1 node
  let level1Index = 0;
  const columnYPositions = new Map(); // Track Y position for each column

  /**
   * Get next Y position for a column
   * @param {number} columnIndex - Column index
   * @returns {number} Y position
   */
  function getColumnYPosition(columnIndex) {
    if (!columnYPositions.has(columnIndex)) {
      columnYPositions.set(columnIndex, LAYOUT_CONFIG.levelSpacing * 2); // Start after level 1
    }
    const currentY = columnYPositions.get(columnIndex);
    columnYPositions.set(columnIndex, currentY + LAYOUT_CONFIG.nodeHeight + LAYOUT_CONFIG.verticalSpacing);
    return currentY;
  }

  /**
   * Recursively traverse tree and create nodes/edges
   * @param {Object} employee - Employee node from org chart
   * @param {number} level - Current depth in tree
   * @param {string|null} parentId - Parent employee ID
   * @param {number|null} columnIndex - Column index for vertical stacking (from level 1 parent)
   */
  function traverseTree(employee, level = 0, parentId = null, columnIndex = null) {
    const nodeId = employee.id;
    let x, y;

    // Hybrid layout: Level 0 centered, Level 1 horizontal, Levels 2+ vertical columns
    if (level === 0) {
      // CEO: Center at top
      x = (level1Count * (LAYOUT_CONFIG.nodeWidth + LAYOUT_CONFIG.horizontalSpacing)) / 2;
      y = 0;
    } else if (level === 1) {
      // Level 1: Distribute horizontally
      x = level1Index * (LAYOUT_CONFIG.nodeWidth + LAYOUT_CONFIG.horizontalSpacing);
      y = LAYOUT_CONFIG.levelSpacing;
      columnIndex = level1Index; // Set column for descendants
      level1Index++;
    } else {
      // Levels 2+: Stack vertically in parent's column
      x = columnIndex * (LAYOUT_CONFIG.nodeWidth + LAYOUT_CONFIG.horizontalSpacing);
      y = getColumnYPosition(columnIndex);
    }

    // Determine node styling based on role
    const nodeType = getNodeType(employee);

    // Show top 2 layers by default (levels 0, 1) - CEO and direct reports
    const isHiddenByDefault = level > 1;

    // Create node
    nodes.push({
      id: nodeId,
      type: 'employeeNode', // Custom node type
      position: { x, y },
      data: {
        name: employee.name,
        title: employee.title,
        email: employee.email || null,
        directReports: employee.directReports || 0,
        totalTeamSize: employee.totalTeamSize || 0,
        agenticFTE: employee.agenticFTE || {
          current: 0,
          breakdown: {}
        },
        teamAgenticFTE: employee.teamAgenticFTE || {
          current: 0,
          breakdown: {}
        },
        level,
        nodeType,
        employmentType: employee.employmentType || 'regular',
        hasChildren: employee.reports && employee.reports.length > 0
      },
      hidden: isHiddenByDefault
    });

    // Create edge from parent to this node
    if (parentId) {
      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 2 }
      });
    }

    // Recursively process reports
    if (employee.reports && employee.reports.length > 0) {
      employee.reports.forEach(report => {
        traverseTree(report, level + 1, nodeId, columnIndex);
      });
    }
  }

  /**
   * Determine node type based on employee properties
   * @param {Object} employee - Employee object
   * @returns {string} Node type: 'executive', 'manager', or 'ic'
   */
  function getNodeType(employee) {
    const title = (employee.title || '').toLowerCase();

    // Executive level
    if (title.includes('ceo') || title.includes('cto') || title.includes('cfo') ||
        title.includes('chief') || title.includes('president')) {
      return 'executive';
    }

    // Manager level (has direct reports)
    if (employee.directReports > 0) {
      return 'manager';
    }

    // Individual contributor
    return 'ic';
  }

  // Start traversal from CEO
  traverseTree(ceo, 0, null);

  return { nodes, edges };
}

/**
 * Get color intensity based on agentic FTE level
 * Higher agentic FTE = more intense color
 * @param {number} agenticFTE - Agentic FTE value
 * @returns {string} Tailwind color class
 */
export function getAgenticFTEColor(agenticFTE) {
  if (agenticFTE >= 1.0) return 'bg-emerald-500'; // High adoption
  if (agenticFTE >= 0.5) return 'bg-emerald-400';
  if (agenticFTE >= 0.3) return 'bg-emerald-300';
  if (agenticFTE >= 0.1) return 'bg-emerald-200';
  if (agenticFTE > 0) return 'bg-emerald-100';
  return 'bg-gray-100'; // No AI usage
}

/**
 * Get border color based on agentic FTE (darker than background for visibility)
 * @param {number} agenticFTE - Agentic FTE value
 * @returns {string} Tailwind border color class
 */
export function getAgenticFTEBorderColor(agenticFTE) {
  if (agenticFTE >= 1.0) return 'border-emerald-600'; // High adoption
  if (agenticFTE >= 0.5) return 'border-emerald-500';
  if (agenticFTE >= 0.3) return 'border-emerald-400';
  if (agenticFTE >= 0.1) return 'border-emerald-300';
  if (agenticFTE > 0) return 'border-emerald-200';
  return 'border-gray-300'; // No AI usage
}

/**
 * Get role badge color
 * @param {string} nodeType - Node type: executive, manager, ic
 * @returns {string} Tailwind color classes
 */
export function getRoleBadgeColor(nodeType) {
  switch (nodeType) {
    case 'executive':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'manager':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'ic':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-300';
  }
}

/**
 * Format agentic FTE for display
 * @param {number} fte - Agentic FTE value
 * @returns {string} Formatted string
 */
export function formatAgenticFTE(fte) {
  if (!fte || fte === 0) return '+0 FTE';
  return `+${fte.toFixed(2)} FTE`;
}

/**
 * Calculate organization-wide statistics
 * @param {Object} orgChart - Org chart data
 * @returns {Object} Statistics
 */
export function calculateOrgStats(orgChart) {
  if (!orgChart?.organization) {
    return {
      totalEmployees: 0,
      totalAgenticFTE: 0,
      effectiveCapacity: 0,
      capacityGain: 0
    };
  }

  const org = orgChart.organization;
  const totalEmployees = org.totalEmployees || 0;
  const totalAgenticFTE = org.totalAgenticFTE || 0;
  const effectiveCapacity = totalEmployees + totalAgenticFTE;
  const capacityGain = totalEmployees > 0 ? ((totalAgenticFTE / totalEmployees) * 100) : 0;

  return {
    totalEmployees,
    totalAgenticFTE: parseFloat(totalAgenticFTE.toFixed(1)),
    effectiveCapacity: parseFloat(effectiveCapacity.toFixed(1)),
    capacityGain: parseFloat(capacityGain.toFixed(1)),
    breakdown: org.agenticFTEBreakdown || {}
  };
}
