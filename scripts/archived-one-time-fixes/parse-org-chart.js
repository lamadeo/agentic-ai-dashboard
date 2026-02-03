const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

/**
 * Parses the org chart PDF to extract employee hierarchy and generate email mappings
 *
 * Email pattern: {first_letter}{lastname}@techco.com
 * Duplicates: {first_letter}{lastname}2@techco.com, {first_letter}{lastname}3@techco.com, etc.
 */

// CEO name to identify department heads
const CEO_NAME = 'Jess Keeney';

/**
 * Parse employee data from org chart text
 * Format: Each employee spans multiple lines:
 * - Line 1: Name (may have initials prefix like "PM Paul Marvin")
 * - Line 2: Title
 * - Line 3: Tenure
 * - Line 4: Location (usually "Remote")
 * - Line 5: Department
 */
function parseOrgChartText(text) {
  const lines = text.split('\n').map(l => l.trim());
  const employees = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines, headers, and page numbers
    if (!line || line === 'TechCo Inc, LLC' || line.match(/^\d+\|\d+$/)) continue;

    // Check if this line looks like a name (2-3 capitalized words, possibly with initials)
    // Match patterns like:
    // - "Jess Keeney"
    // - "Luis Amadeo"
    // - "PM Paul Marvin" (with initials)
    // - "GL Guy Lever"
    const nameMatch = line.match(/^(?:[A-Z]{1,3}\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})$/);

    if (nameMatch && i + 4 < lines.length) {
      const name = nameMatch[1]; // Extract name without initials

      // Next lines should be: title, tenure, location, department
      const title = lines[i + 1];
      const tenure = lines[i + 2];
      const location = lines[i + 3];
      const departmentLine = lines[i + 4];

      // Validate this is an employee entry
      // - Title should not be empty and shouldn't be "Remote"
      // - Tenure should match pattern like "4 months", "2 years", etc.
      // - Location should be "Remote" or similar
      const tenureMatch = tenure.match(/^\d+\s+(year|month|day)s?/);

      if (title && title !== 'Remote' && tenureMatch && location === 'Remote') {
        // Department line may have page numbers like "Engineering 	  	3|79"
        // Extract just the department name
        const department = departmentLine.replace(/\s*\t.*$/, '').trim();

        if (department) {
          employees.push({
            name: name.trim(),
            title: title.trim(),
            tenure: tenure.trim(),
            department: department
          });

          // Skip the lines we just processed
          i += 4;
        }
      }
    }
  }

  return employees;
}

/**
 * Generate email address from name
 */
function generateEmail(firstName, lastName) {
  const firstInitial = firstName.charAt(0).toLowerCase();
  const lastNameLower = lastName.toLowerCase().replace(/[^a-z]/g, '');
  return `${firstInitial}${lastNameLower}@techco.com`;
}

/**
 * Parse name into first, middle, and last name
 */
function parseName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 2) {
    return { firstName: parts[0], middleName: null, lastName: parts[1] };
  } else if (parts.length === 3) {
    // Assume: First Middle Last
    return { firstName: parts[0], middleName: parts[1], lastName: parts[2] };
  } else if (parts.length > 3) {
    // Multiple names - take first, second as middle, last as last
    return { firstName: parts[0], middleName: parts[1], lastName: parts[parts.length - 1] };
  }
  return { firstName: parts[0] || '', middleName: null, lastName: '' };
}

/**
 * Find department head based on title
 */
function getDepartmentFromTitle(title) {
  const titleLower = title.toLowerCase();

  // VP and C-level titles indicate department heads
  if (titleLower.includes('vp,') || titleLower.includes('chief')) {
    // Extract department from title
    if (titleLower.includes('engineering')) return 'Engineering';
    if (titleLower.includes('marketing')) return 'Marketing';
    if (titleLower.includes('sales') && titleLower.includes('enterprise')) return 'Sales - Enterprise';
    if (titleLower.includes('sales') && titleLower.includes('large market')) return 'Sales - Large Market';
    if (titleLower.includes('operations')) return 'Operations';
    if (titleLower.includes('professional services')) return 'Professional Services';
    if (titleLower.includes('customer')) return 'Customer Success';
    if (titleLower.includes('partnership')) return 'Partnerships';
    if (titleLower.includes('agentic') || titleLower.includes('ai')) return 'Agentic AI';
  }

  // Directors can also be department heads
  if (titleLower.includes('director')) {
    if (titleLower.includes('product')) return 'Product';
    if (titleLower.includes('human resources')) return 'Human Resources';
    if (titleLower.includes('legal')) return 'Legal';
    if (titleLower.includes('revenue operations')) return 'Revenue Operations';
    if (titleLower.includes('financial planning')) return 'Finance';
  }

  // Controller
  if (titleLower.includes('controller')) return 'Finance';

  return null;
}

/**
 * Normalize department name from org chart department field
 */
function normalizeDepartment(deptString) {
  // Map org chart department strings to clean department names
  const mapping = {
    'Engineering': 'Engineering',
    'Product': 'Product',
    'Marketing': 'Marketing',
    'Marketing Administration': 'Marketing',
    'Enterprise': 'Sales - Enterprise',
    'Large Market': 'Sales - Large Market',
    'Customer Success': 'Customer Success',
    'Customer Support': 'Customer Support',
    'Professional Services': 'Professional Services',
    'Operations': 'Operations',
    'Operations Administration': 'Operations',
    'AI Administration': 'Agentic AI',
    'AI & Data': 'Agentic AI',
    'Human Resources': 'Human Resources',
    'Finance': 'Finance',
    'Financial Planning & Analysis': 'Finance',
    'Accounting': 'Finance',
    'Legal': 'Legal',
    'Revenue Operations': 'Revenue Operations',
    'Partnerships & Channel Sales': 'Partnerships',
    'Information Technology': 'IT',
    'Business Development': 'Business Development',
    'Industry Solutions': 'Sales',
    'Customer Administration': 'Customer Success',
    'Executive Administration': 'Executive',
    'Platform Experience': 'Customer Support',
    'Compliance': 'Compliance'
  };

  // Try exact match first
  if (mapping[deptString]) {
    return mapping[deptString];
  }

  // Try partial match
  for (const [key, value] of Object.entries(mapping)) {
    if (deptString.includes(key)) {
      return value;
    }
  }

  return deptString;
}

/**
 * Build email to department/team mapping
 */
async function buildOrgMapping(pdfPath) {
  console.log('📋 Parsing org chart PDF...\n');

  // Read and parse PDF (using pdf-parse v2 API)
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: dataBuffer });
  const result = await parser.getText();

  // Parse employees from text
  const employees = parseOrgChartText(result.text);
  console.log(`✅ Extracted ${employees.length} employees from org chart\n`);

  // Build email mapping
  const emailMap = new Map(); // email -> { name, title, department, team }
  const emailCounts = new Map(); // base email -> count (for handling duplicates)

  // Identify department heads
  const departmentHeads = new Map(); // department -> head name

  employees.forEach(emp => {
    const deptFromTitle = getDepartmentFromTitle(emp.title);
    if (deptFromTitle && emp.name !== CEO_NAME) {
      departmentHeads.set(deptFromTitle, emp.name);
    }
  });

  console.log('📊 Identified department heads:');
  departmentHeads.forEach((head, dept) => {
    console.log(`   ${dept}: ${head}`);
  });
  console.log();

  // Process each employee
  employees.forEach(emp => {
    const { firstName, middleName, lastName } = parseName(emp.name);
    if (!firstName || !lastName) return;

    const baseEmail = generateEmail(firstName, lastName);

    // Handle duplicates with TechCo Inc email pattern:
    // 1st person: {f}{lastname}@techco.com
    // 2nd person: {firstname}.{lastname}@techco.com
    // 3rd person (with middle): {f}{m}{lastname}@techco.com
    let email = baseEmail;
    let emailVariants = [baseEmail]; // Track all possible emails for this person

    const duplicateCount = emailCounts.get(baseEmail) || 0;

    if (duplicateCount === 0) {
      // First person with this name - use standard format
      email = baseEmail;
    } else if (duplicateCount === 1) {
      // Second person - use firstname.lastname format
      const firstNameLower = firstName.toLowerCase();
      const lastNameLower = lastName.toLowerCase().replace(/[^a-z]/g, '');
      email = `${firstNameLower}.${lastNameLower}@techco.com`;
      emailVariants.push(email);
    } else if (duplicateCount === 2 && middleName) {
      // Third person with middle name - use {f}{m}{lastname} format
      const firstInitial = firstName.charAt(0).toLowerCase();
      const middleInitial = middleName.charAt(0).toLowerCase();
      const lastNameLower = lastName.toLowerCase().replace(/[^a-z]/g, '');
      email = `${firstInitial}${middleInitial}${lastNameLower}@techco.com`;
      emailVariants.push(email);
    } else {
      // Fallback for 4th+ person or no middle name - use number suffix
      email = baseEmail.replace('@', `${duplicateCount + 1}@`);
      emailVariants.push(email);
    }

    emailCounts.set(baseEmail, duplicateCount + 1);

    // Determine department and team
    let department = normalizeDepartment(emp.department);
    let team = null;

    // If this person is a department head, they define the department
    const isDeptHead = Array.from(departmentHeads.values()).includes(emp.name);
    if (isDeptHead) {
      // Find which department they head
      for (const [dept, head] of departmentHeads.entries()) {
        if (head === emp.name) {
          department = dept;
          break;
        }
      }
    }

    // Check if they're a team leader (Director or Manager not at department head level)
    const titleLower = emp.title.toLowerCase();
    if ((titleLower.includes('director') || titleLower.includes('manager')) && !isDeptHead) {
      team = emp.title;
    }

    // Store the mapping for all email variants
    emailVariants.forEach(emailVariant => {
      emailMap.set(emailVariant, {
        name: emp.name,
        title: emp.title,
        department,
        team,
        isDeptHead,
        baseEmail,
        primaryEmail: email
      });
    });
  });

  console.log(`✅ Generated ${emailMap.size} email mappings\n`);

  // Group by department for summary
  const deptCounts = new Map();
  emailMap.forEach(info => {
    deptCounts.set(info.department, (deptCounts.get(info.department) || 0) + 1);
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
 * Match email from usage data to org chart email (handling duplicates)
 */
function matchEmail(usageEmail, emailMap, allUsageEmails) {
  // Normalize email
  const normalizedEmail = usageEmail.toLowerCase().trim();

  // Try exact match first
  if (emailMap.has(normalizedEmail)) {
    return normalizedEmail;
  }

  // If no exact match, try to parse name from email and generate variants
  const parts = normalizedEmail.split('@');
  if (parts.length === 2 && parts[1] === 'techco.com') {
    const localPart = parts[0];

    // Check if it's a firstname.lastname format
    if (localPart.includes('.')) {
      const [firstName, lastName] = localPart.split('.');
      // Try base format {f}{lastname}
      const baseEmail = `${firstName.charAt(0)}${lastName}@techco.com`;
      if (emailMap.has(baseEmail)) {
        return baseEmail;
      }
    } else {
      // Try firstname.lastname format (for {f}{lastname} input)
      // This requires guessing, so we'll search through emailMap for matches
      for (const [email, info] of emailMap.entries()) {
        if (info.baseEmail === normalizedEmail) {
          return email;
        }
      }
    }
  }

  return null; // No match found
}

/**
 * Get department and team for a user email
 */
function getDepartmentInfo(email, emailMap) {
  const matched = matchEmail(email, emailMap, []);
  if (matched) {
    const info = emailMap.get(matched);
    return {
      department: info.department,
      team: info.team,
      title: info.title,
      name: info.name
    };
  }

  return {
    department: 'Unknown',
    team: null,
    title: null,
    name: null
  };
}

module.exports = {
  buildOrgMapping,
  getDepartmentInfo,
  matchEmail
};
