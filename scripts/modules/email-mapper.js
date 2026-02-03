/**
 * Email Mapper Module
 *
 * Provides reusable email matching and validation logic for mapping real employee
 * emails to org chart generated emails. Core functionality for ensuring 100%
 * department coverage in expansion analysis.
 *
 * Used by:
 * - scripts/setup-org-email-mapping.js (interactive CLI)
 * - scripts/modules/pipeline-orchestrator.js (validation during refresh)
 * - scripts/modules/ingestors/org-hierarchy-ingestor.js (email generation)
 */

const fs = require('fs');

/**
 * Generate all possible email variants for a given name
 * Mirrors the logic in EmailGenerator class from parse-hierarchy.js
 *
 * @param {string} name - Full name (e.g., "Luis Amadeo")
 * @returns {Array<string>} Array of possible email variants
 *
 * @example
 * generateEmailVariants("Luis Amadeo")
 * // Returns: [
 * //   "lamadeo@techco.com",           // Primary: {f}{lastname}
 * //   "luis.amadeo@techco.com",       // Duplicate 1: {first}.{last}
 * //   "luis@techco.com",              // First name only
 * //   "amadeo@techco.com"             // Last name only
 * // ]
 */
function generateEmailVariants(name) {
  const parts = name.trim().split(/\s+/);

  if (parts.length < 2) {
    return [];
  }

  const firstName = parts[0].toLowerCase();
  const lastName = parts[parts.length - 1].toLowerCase().replace(/[^a-z]/g, '');
  const middleName = parts.length === 3 ? parts[1].toLowerCase() : null;
  const firstInitial = firstName.charAt(0);

  const variants = [
    // Primary pattern: {firstInitial}{lastname}
    `${firstInitial}${lastName}@techco.com`,

    // Duplicate pattern 1: {firstname}.{lastname}
    `${firstName}.${lastName}@techco.com`,

    // Middle initial pattern: {f}{m}{lastname}
    middleName ? `${firstInitial}${middleName.charAt(0)}${lastName}@techco.com` : null,

    // First name only (common for unique first names)
    `${firstName}@techco.com`,

    // Last name only (rare but exists)
    `${lastName}@techco.com`
  ].filter(Boolean);

  return variants;
}

/**
 * Calculate name similarity score using Levenshtein distance
 *
 * @param {string} name1 - First name to compare
 * @param {string} name2 - Second name to compare
 * @returns {number} Similarity score (0-100, higher is more similar)
 *
 * @example
 * calculateNameSimilarity("Luis Amadeo", "Luis Amadeo") // 100
 * calculateNameSimilarity("Bob Smith", "Robert Smith")  // ~85
 * calculateNameSimilarity("John Doe", "Jane Smith")     // ~30
 */
function calculateNameSimilarity(name1, name2) {
  const normalize = (str) => str.toLowerCase().trim().replace(/[^a-z\s]/g, '');

  const n1 = normalize(name1);
  const n2 = normalize(name2);

  // Exact match
  if (n1 === n2) return 100;

  // Check if one name contains the other (handles nicknames)
  if (n1.includes(n2) || n2.includes(n1)) return 90;

  // Check first and last name separately for better matching
  const parts1 = n1.split(/\s+/);
  const parts2 = n2.split(/\s+/);

  if (parts1.length >= 2 && parts2.length >= 2) {
    const firstName1 = parts1[0];
    const lastName1 = parts1[parts1.length - 1];
    const firstName2 = parts2[0];
    const lastName2 = parts2[parts2.length - 1];

    // Same last name is strong signal
    if (lastName1 === lastName2) {
      // Exact first name match
      if (firstName1 === firstName2) return 95;
      // First name similarity
      const firstNameSim = levenshteinSimilarity(firstName1, firstName2);
      return Math.max(80, firstNameSim);
    }

    // Check first initial + last name (common pattern)
    if (firstName1.charAt(0) === firstName2.charAt(0) && lastName1 === lastName2) {
      return 85;
    }
  }

  // Fall back to full string Levenshtein distance
  return levenshteinSimilarity(n1, n2);
}

/**
 * Calculate Levenshtein similarity as percentage
 * @private
 */
function levenshteinSimilarity(str1, str2) {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 100;
  return Math.round((1 - distance / maxLength) * 100);
}

/**
 * Calculate Levenshtein distance between two strings
 * @private
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Match real emails to org chart employees using name similarity and email patterns
 *
 * @param {Array<Object>} realUsers - Users with real emails [{name, email, seatTier, status}]
 * @param {Array<Object>} orgEmployees - Org chart employees [{name, email (generated), department}]
 * @param {number} [similarityThreshold=80] - Minimum similarity score to auto-match (0-100)
 * @returns {Object} Matching results
 *
 * @example
 * const results = matchEmailsByName(claudeUsers, orgChartEmployees, 80);
 * // {
 * //   autoMatched: [{realEmail, orgEmail, name, similarity, method}],
 * //   needsResolution: [{realEmail, name, potentialMatches: [{orgEmail, name, similarity}]}],
 * //   stats: {total, matched, unmatched, coverage}
 * // }
 */
function matchEmailsByName(realUsers, orgEmployees, similarityThreshold = 80) {
  const autoMatched = [];
  const needsResolution = [];

  // Build lookup maps
  const orgByEmail = new Map();
  const orgByName = new Map();

  orgEmployees.forEach(emp => {
    orgByEmail.set(emp.email.toLowerCase(), emp);

    const normalizedName = emp.name.toLowerCase().trim();
    if (!orgByName.has(normalizedName)) {
      orgByName.set(normalizedName, []);
    }
    orgByName.get(normalizedName).push(emp);
  });

  realUsers.forEach(user => {
    const realEmail = user.email.toLowerCase();

    // Method 1: Direct email match (user already has correct generated email)
    if (orgByEmail.has(realEmail)) {
      autoMatched.push({
        realEmail: user.email,
        orgEmail: realEmail,
        name: user.name,
        similarity: 100,
        method: 'exact_email',
        seatTier: user.seatTier,
        status: user.status
      });
      return;
    }

    // Method 2: Try all generated email variants for this name
    const variants = generateEmailVariants(user.name);
    let variantMatch = null;

    for (const variant of variants) {
      if (orgByEmail.has(variant)) {
        variantMatch = {
          realEmail: user.email,
          orgEmail: variant,
          name: user.name,
          similarity: 95,
          method: 'email_variant',
          seatTier: user.seatTier,
          status: user.status
        };
        break;
      }
    }

    if (variantMatch) {
      autoMatched.push(variantMatch);
      return;
    }

    // Method 3: Name similarity matching
    const potentialMatches = [];

    orgEmployees.forEach(orgEmp => {
      const similarity = calculateNameSimilarity(user.name, orgEmp.name);

      if (similarity >= 50) { // Low threshold for potential matches list
        potentialMatches.push({
          orgEmail: orgEmp.email,
          orgName: orgEmp.name,
          department: orgEmp.department,
          similarity
        });
      }
    });

    // Sort by similarity (highest first)
    potentialMatches.sort((a, b) => b.similarity - a.similarity);

    // Auto-match if top match is above threshold and significantly better than second
    if (potentialMatches.length > 0) {
      const topMatch = potentialMatches[0];
      const secondMatch = potentialMatches[1];

      const isConfident = topMatch.similarity >= similarityThreshold &&
                         (!secondMatch || topMatch.similarity - secondMatch.similarity >= 10);

      if (isConfident) {
        autoMatched.push({
          realEmail: user.email,
          orgEmail: topMatch.orgEmail,
          name: user.name,
          similarity: topMatch.similarity,
          method: 'name_similarity',
          seatTier: user.seatTier,
          status: user.status
        });
      } else {
        // Needs manual resolution
        needsResolution.push({
          realEmail: user.email,
          realName: user.name,
          seatTier: user.seatTier,
          status: user.status,
          potentialMatches: potentialMatches.slice(0, 5) // Top 5 candidates
        });
      }
    } else {
      // No potential matches found
      needsResolution.push({
        realEmail: user.email,
        realName: user.name,
        seatTier: user.seatTier,
        status: user.status,
        potentialMatches: []
      });
    }
  });

  return {
    autoMatched,
    needsResolution,
    stats: {
      total: realUsers.length,
      matched: autoMatched.length,
      unmatched: needsResolution.length,
      coverage: Math.round((autoMatched.length / realUsers.length) * 100)
    }
  };
}

/**
 * Validate email coverage - check how many Claude Enterprise users are matched
 *
 * @param {Array<Object>} claudeUsers - Claude Enterprise users
 * @param {Map} orgEmailMap - Org chart email map (from buildOrgMappingFromHierarchy)
 * @param {Object} aliasMap - EMAIL_ALIAS_MAP object
 * @returns {Object} Validation results
 */
function validateEmailCoverage(claudeUsers, orgEmailMap, aliasMap) {
  const matched = [];
  const unmatched = [];

  claudeUsers.forEach(user => {
    const email = user.email.toLowerCase();

    // Try direct match
    if (orgEmailMap.has(email)) {
      matched.push({ ...user, matchType: 'direct' });
      return;
    }

    // Try alias resolution
    const resolvedEmail = aliasMap[email] || email;
    if (resolvedEmail !== email && orgEmailMap.has(resolvedEmail)) {
      matched.push({ ...user, matchType: 'alias', resolvedTo: resolvedEmail });
      return;
    }

    // Unmatched
    unmatched.push(user);
  });

  return {
    matched,
    unmatched,
    stats: {
      total: claudeUsers.length,
      matched: matched.length,
      unmatched: unmatched.length,
      coverage: Math.round((matched.length / claudeUsers.length) * 100)
    }
  };
}

/**
 * Generate EMAIL_ALIAS_MAP code block for scripts/parse-hierarchy.js
 *
 * @param {Array<Object>} aliases - Array of alias mappings [{realEmail, orgEmail, name, method}]
 * @param {Object} existingAliasMap - Current EMAIL_ALIAS_MAP to preserve manual entries
 * @returns {string} JavaScript code block for EMAIL_ALIAS_MAP
 */
function generateAliasMapCode(aliases, existingAliasMap = {}) {
  const allAliases = { ...existingAliasMap };

  // Add new aliases
  aliases.forEach(alias => {
    if (alias.realEmail !== alias.orgEmail) {
      allAliases[alias.realEmail.toLowerCase()] = alias.orgEmail.toLowerCase();
    }
  });

  // Group by category
  const autoGenerated = [];
  const manualExisting = [];

  Object.entries(allAliases).forEach(([real, org]) => {
    const alias = aliases.find(a => a.realEmail.toLowerCase() === real);
    if (alias) {
      autoGenerated.push({ real, org, name: alias.name, method: alias.method });
    } else {
      manualExisting.push({ real, org });
    }
  });

  // Sort alphabetically
  autoGenerated.sort((a, b) => a.real.localeCompare(b.real));
  manualExisting.sort((a, b) => a.real.localeCompare(b.real));

  // Generate code
  let code = 'const EMAIL_ALIAS_MAP = {\n';

  if (autoGenerated.length > 0) {
    code += '  // Auto-generated mappings from /setup-org-data workflow\n';
    autoGenerated.forEach(({ real, org, name, method }) => {
      code += `  '${real}': '${org}',  // ${name} (${method})\n`;
    });
    code += '\n';
  }

  if (manualExisting.length > 0) {
    code += '  // Manual/existing mappings\n';
    manualExisting.forEach(({ real, org }) => {
      code += `  '${real}': '${org}',\n`;
    });
  }

  code += '};\n';

  return code;
}

/**
 * Update EMAIL_ALIAS_MAP in scripts/parse-hierarchy.js
 *
 * @param {string} filePath - Path to parse-hierarchy.js
 * @param {string} newAliasMapCode - New EMAIL_ALIAS_MAP code block
 * @returns {boolean} Success status
 */
function updateAliasMapInFile(filePath, newAliasMapCode) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Find EMAIL_ALIAS_MAP block
    const mapRegex = /const EMAIL_ALIAS_MAP = \{[\s\S]*?\n\};/;

    if (!mapRegex.test(content)) {
      throw new Error('Could not find EMAIL_ALIAS_MAP in file');
    }

    // Replace
    content = content.replace(mapRegex, newAliasMapCode.trim());

    // Write back
    fs.writeFileSync(filePath, content, 'utf-8');

    return true;
  } catch (error) {
    console.error('Error updating EMAIL_ALIAS_MAP:', error.message);
    return false;
  }
}

module.exports = {
  generateEmailVariants,
  calculateNameSimilarity,
  matchEmailsByName,
  validateEmailCoverage,
  generateAliasMapCode,
  updateAliasMapInFile
};
