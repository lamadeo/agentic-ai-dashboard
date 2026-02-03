const fs = require('fs');
const path = require('path');

/**
 * Parse the org hierarchy JSON to build department/team mappings
 *
 * This uses the actual reporting structure from Rippling rather than
 * inferring departments from titles.
 */

/**
 * Generate email address from name
 */
function generateEmail(name) {
  const parts = name.trim().split(/\s+/);

  if (parts.length < 2) {
    return null;
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const middleName = parts.length === 3 ? parts[1] : null;

  const firstInitial = firstName.charAt(0).toLowerCase();
  const lastNameLower = lastName.toLowerCase().replace(/[^a-z]/g, '');

  return {
    baseEmail: `${firstInitial}${lastNameLower}@techco.com`,
    firstName,
    lastName,
    middleName
  };
}

/**
 * Track email duplicates and generate appropriate variant
 */
class EmailGenerator {
  constructor() {
    this.emailCounts = new Map();
    this.emailMap = new Map();
  }

  generateUniqueEmail(name) {
    const emailInfo = generateEmail(name);
    if (!emailInfo) return null;

    const { baseEmail, firstName, lastName, middleName } = emailInfo;
    const duplicateCount = this.emailCounts.get(baseEmail) || 0;

    let finalEmail;

    if (duplicateCount === 0) {
      // First person: standard format
      finalEmail = baseEmail;
    } else if (duplicateCount === 1) {
      // Second person: firstname.lastname
      finalEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}@techco.com`;
    } else if (duplicateCount === 2 && middleName) {
      // Third person with middle name: {f}{m}{lastname}
      const middleInitial = middleName.charAt(0).toLowerCase();
      const firstInitial = firstName.charAt(0).toLowerCase();
      const lastNameLower = lastName.toLowerCase().replace(/[^a-z]/g, '');
      finalEmail = `${firstInitial}${middleInitial}${lastNameLower}@techco.com`;
    } else {
      // Fallback: number suffix
      finalEmail = baseEmail.replace('@', `${duplicateCount + 1}@`);
    }

    this.emailCounts.set(baseEmail, duplicateCount + 1);
    this.emailMap.set(finalEmail, { name, baseEmail });

    return finalEmail;
  }
}

/**
 * Map department head names to functional department names
 */
const DEPARTMENT_NAME_MAPPING = {
  'Luis Amadeo': 'Agentic AI',
  'Kelly Wells': 'Customer Success',
  'Erika McKibben': 'Professional Services',
  'Ron Slosberg': 'Engineering',
  'Kathryn Hilton': 'Marketing',
  'Laura Jackson': 'Product',
  'Geoffrey Simpson': 'Sales - Enterprise',
  'Michael Schwartz': 'Sales - Large Market',
  'Ben Suslowicz': 'Operations',
  'Nicole Perkins': 'Human Resources',
  'Peter Evans': 'Legal',
  'Ally Cannon': 'Revenue Operations',
  'Ginny Drinker': 'Partnerships',
  'Paul Marvin': 'Finance',
  'Kellene Sahl': 'Finance',  // Reports to Paul Marvin but in hierarchy shows as dept head
  'Andrew Gordon': 'Finance',
  'Seth Turner': 'Executive',
  'Guy Lever': 'Customer Success',
  'Chris Murphy': 'IT'
};

/**
 * Recursively traverse the hierarchy to extract all employees
 * and determine their department/team based on reporting structure
 */
function traverseHierarchy(node, departmentHead, teamLeader, emailGen, results) {
  const email = emailGen.generateUniqueEmail(node.name);

  if (!email) {
    console.warn(`Could not generate email for: ${node.name}`);
    return;
  }

  // Determine role
  const isDepartmentHead = !departmentHead; // Direct report to CEO
  const isTeamLeader = node.directReports > 0 && departmentHead;

  // Department is determined by the top-level leader (CEO's direct report)
  const deptHeadName = departmentHead ? departmentHead.name : node.name;
  const department = DEPARTMENT_NAME_MAPPING[deptHeadName] || deptHeadName;

  // Team is determined by the mid-level leader (if exists)
  const team = teamLeader ? teamLeader.name : (isTeamLeader ? node.name : null);

  results.push({
    name: node.name,
    title: node.title,
    email,
    department,
    departmentHead: departmentHead ? departmentHead.name : node.name,
    team,
    teamLeader: teamLeader ? teamLeader.name : (isTeamLeader ? node.name : null),
    isDepartmentHead,
    isTeamLeader,
    directReports: node.directReports,
    totalTeamSize: node.totalTeamSize
  });

  // Recursively process reports
  if (node.reports && node.reports.length > 0) {
    // If this person is a department head, they become the department context
    const nextDeptHead = isDepartmentHead ? node : departmentHead;

    // If this person is a team leader, they become the team context
    const nextTeamLeader = isTeamLeader ? node : teamLeader;

    node.reports.forEach(report => {
      traverseHierarchy(report, nextDeptHead, nextTeamLeader, emailGen, results);
    });
  }
}

/**
 * Build org mapping from hierarchy JSON
 */
function buildOrgMappingFromHierarchy(hierarchyPath) {
  console.log('📋 Parsing org hierarchy from JSON...\n');

  const hierarchyData = JSON.parse(fs.readFileSync(hierarchyPath, 'utf8'));
  const emailGen = new EmailGenerator();
  const employees = [];

  // Process CEO
  const ceo = hierarchyData.organization.ceo;
  const ceoEmail = emailGen.generateUniqueEmail(ceo.name);

  employees.push({
    name: ceo.name,
    title: ceo.title,
    email: ceoEmail,
    department: 'Executive',
    departmentHead: ceo.name,
    team: null,
    teamLeader: null,
    isDepartmentHead: false,
    isTeamLeader: false,
    isCEO: true,
    directReports: ceo.directReports,
    totalTeamSize: ceo.totalTeamSize
  });

  // Process all reports
  ceo.reports.forEach(deptHead => {
    traverseHierarchy(deptHead, null, null, emailGen, employees);
  });

  console.log(`✅ Extracted ${employees.length} employees from hierarchy\n`);

  // Build email mapping
  const emailMap = new Map();
  employees.forEach(emp => {
    emailMap.set(emp.email, {
      name: emp.name,
      title: emp.title,
      department: emp.department,
      team: emp.team,
      departmentHead: emp.departmentHead,
      teamLeader: emp.teamLeader,
      isDeptHead: emp.isDepartmentHead,
      isTeamLeader: emp.isTeamLeader,
      primaryEmail: emp.email
    });
  });

  // Show department heads
  console.log('📊 Identified department heads:');
  const deptHeads = employees.filter(e => e.isDepartmentHead);
  deptHeads.forEach(head => {
    console.log(`   ${head.department}: ${head.name} (${head.directReports} direct reports, ${head.totalTeamSize} total team)`);
  });
  console.log();

  // Show team leaders
  console.log('👥 Identified team leaders:');
  const teamLeaders = employees.filter(e => e.isTeamLeader && !e.isDepartmentHead);
  teamLeaders.forEach(leader => {
    console.log(`   ${leader.name} (${leader.title}) - ${leader.department}`);
    console.log(`      ${leader.directReports} direct reports`);
  });
  console.log();

  // Show employee count by department
  const deptCounts = new Map();
  employees.forEach(emp => {
    if (!emp.isCEO) {
      deptCounts.set(emp.department, (deptCounts.get(emp.department) || 0) + 1);
    }
  });

  console.log('📊 Employee count by department:');
  Array.from(deptCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([dept, count]) => {
      console.log(`   ${dept}: ${count}`);
    });
  console.log();

  return emailMap;
}

/**
 * Email alias mapping - maps alternative email addresses to canonical org chart emails
 * This handles cases where people use different email formats or first-name aliases
 */
const EMAIL_ALIAS_MAP = {
  // Auto-generated mappings from /setup-org-data workflow
  'braftery@techco.com': 'braferty@techco.com',  // Brendan (name_similarity)
  'm.d.campbell@techco.com': 'mcampbell@techco.com',  // Melissa Campbell (email_variant)
  'madison@techco.com': 'mvoshell@techco.com',  // Madison Voshell (email_variant)
  'missy@techco.com': 'mmyers@techco.com',  // Missy (name_similarity)
  'msmithclary@techco.com': 'mclary@techco.com',  // Melanie (name_similarity)
  'rmazza@techco.com': 'bmazza@techco.com',  // bob (name_similarity)
  'sfthomas@techco.com': 'sthomas@techco.com',  // Sarah (manual_selection)
  'ypiloto@techco.com': 'pmorejon@techco.com',  // Yassel Piloto (manual_entry)

  // Manual/existing mappings
  'lisa@techco.com': 'lmueller@techco.com',
  'lobrien-schwarz@techco.com': 'lobrienschwarz@techco.com',
  'mkessler@techco.com': 'mkesslerkiproff@techco.com',
  'mlsilva@techco.com': 'msilva@techco.com',
  'seth@techco.com': 'sturner@techco.com',
  'ymakovsky@techco.com': 'emakovsky@techco.com',
  'zfeng@techco.com': 'jfeng@techco.com',
};

/**
 * Resolve email alias to canonical org chart email
 */
function resolveEmailAlias(email) {
  const normalizedEmail = email.toLowerCase().trim();
  return EMAIL_ALIAS_MAP[normalizedEmail] || normalizedEmail;
}

/**
 * Check if an email belongs to a current employee in the org chart
 */
function isCurrentEmployee(email, emailMap) {
  const resolvedEmail = resolveEmailAlias(email);
  return emailMap.has(resolvedEmail);
}

/**
 * Get department and team for a user email
 * Automatically resolves email aliases to canonical org chart emails
 */
function getDepartmentInfo(email, emailMap) {
  const resolvedEmail = resolveEmailAlias(email);

  if (emailMap.has(resolvedEmail)) {
    const info = emailMap.get(resolvedEmail);
    return {
      department: info.department,
      team: info.team,
      title: info.title,
      name: info.name,
      departmentHead: info.departmentHead,
      teamLeader: info.teamLeader,
      isCurrentEmployee: true
    };
  }

  return {
    department: 'Unknown',
    team: null,
    title: null,
    name: null,
    departmentHead: null,
    teamLeader: null,
    isCurrentEmployee: false
  };
}

/**
 * Calculate total employee count by department from org hierarchy
 * This is used for expansion opportunity calculations
 *
 * @param {string} hierarchyPath - Path to the org hierarchy JSON file
 * @returns {Map<string, number>} Map of department name to employee count
 */
function getDepartmentHeadcounts(hierarchyPath) {
  const hierarchyData = JSON.parse(fs.readFileSync(hierarchyPath, 'utf8'));
  const emailGen = new EmailGenerator();
  const employees = [];

  // Process CEO
  const ceo = hierarchyData.organization.ceo;
  const ceoEmail = emailGen.generateUniqueEmail(ceo.name);

  employees.push({
    name: ceo.name,
    title: ceo.title,
    email: ceoEmail,
    department: 'Executive',
    isCEO: true
  });

  // Process all reports
  ceo.reports.forEach(deptHead => {
    traverseHierarchy(deptHead, null, null, emailGen, employees);
  });

  // Count employees by department (excluding CEO)
  const deptCounts = new Map();
  employees.forEach(emp => {
    if (!emp.isCEO) {
      deptCounts.set(emp.department, (deptCounts.get(emp.department) || 0) + 1);
    }
  });

  return deptCounts;
}

module.exports = {
  buildOrgMappingFromHierarchy,
  getDepartmentInfo,
  isCurrentEmployee,
  resolveEmailAlias,
  getDepartmentHeadcounts
};
