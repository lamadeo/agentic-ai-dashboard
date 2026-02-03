#!/usr/bin/env node

/**
 * Employee Mapping Generator
 *
 * Scans all data files to extract unique email addresses and generates
 * a master mapping of real employees → fictional TechCo Inc employees.
 *
 * Usage: node scripts/generate-employee-mapping.js
 * Output: scripts/employee-mapping.json
 */

const fs = require('fs');
const path = require('path');

// Diverse, realistic fictional employee names
const FICTIONAL_NAMES = [
  { first: 'Michael', last: 'Chen' },
  { first: 'Sarah', last: 'Johnson' },
  { first: 'Aisha', last: 'Patel' },
  { first: 'Robert', last: 'Kim' },
  { first: 'Maria', last: 'Garcia' },
  { first: 'James', last: 'Williams' },
  { first: 'Priya', last: 'Sharma' },
  { first: 'David', last: 'Lee' },
  { first: 'Emma', last: 'Brown' },
  { first: 'Carlos', last: 'Rodriguez' },
  { first: 'Fatima', last: 'Hassan' },
  { first: 'Thomas', last: 'Anderson' },
  { first: 'Lisa', last: 'Martinez' },
  { first: 'Kevin', last: 'Wong' },
  { first: 'Jennifer', last: 'Taylor' },
  { first: 'Mohammed', last: 'Ali' },
  { first: 'Amy', last: 'Jackson' },
  { first: 'Daniel', last: 'Cohen' },
  { first: 'Rachel', last: 'Thompson' },
  { first: 'Christopher', last: 'White' },
  { first: 'Sophia', last: 'Nguyen' },
  { first: 'Ryan', last: 'Harris' },
  { first: 'Emily', last: 'Martin' },
  { first: 'Brandon', last: 'Robinson' },
  { first: 'Olivia', last: 'Lewis' },
  { first: 'Andrew', last: 'Walker' },
  { first: 'Isabella', last: 'Hall' },
  { first: 'Matthew', last: 'Young' },
  { first: 'Ava', last: 'King' },
  { first: 'Joshua', last: 'Wright' },
  { first: 'Mia', last: 'Lopez' },
  { first: 'Justin', last: 'Scott' },
  { first: 'Charlotte', last: 'Green' },
  { first: 'Nathan', last: 'Adams' },
  { first: 'Amelia', last: 'Baker' },
  { first: 'Eric', last: 'Nelson' },
  { first: 'Harper', last: 'Carter' },
  { first: 'Tyler', last: 'Mitchell' },
  { first: 'Evelyn', last: 'Perez' },
  { first: 'Jacob', last: 'Roberts' },
  { first: 'Abigail', last: 'Turner' },
  { first: 'Aaron', last: 'Phillips' },
  { first: 'Elizabeth', last: 'Campbell' },
  { first: 'Alexander', last: 'Parker' },
  { first: 'Sofia', last: 'Evans' },
  { first: 'Samuel', last: 'Edwards' },
  { first: 'Avery', last: 'Collins' },
  { first: 'Benjamin', last: 'Stewart' },
  { first: 'Ella', last: 'Sanchez' },
  { first: 'Lucas', last: 'Morris' },
  { first: 'Scarlett', last: 'Rogers' },
  { first: 'Henry', last: 'Reed' },
  { first: 'Grace', last: 'Cook' },
  { first: 'Mason', last: 'Morgan' },
  { first: 'Chloe', last: 'Bell' },
  { first: 'Ethan', last: 'Murphy' },
  { first: 'Victoria', last: 'Bailey' },
  { first: 'Sebastian', last: 'Rivera' },
  { first: 'Aria', last: 'Cooper' },
  { first: 'Owen', last: 'Richardson' },
  { first: 'Lily', last: 'Cox' },
  { first: 'Jack', last: 'Howard' },
  { first: 'Zoe', last: 'Ward' },
  { first: 'Luke', last: 'Torres' },
  { first: 'Hannah', last: 'Peterson' },
  { first: 'Carter', last: 'Gray' },
  { first: 'Nora', last: 'Ramirez' },
  { first: 'Wyatt', last: 'James' },
  { first: 'Lillian', last: 'Watson' },
  { first: 'Julian', last: 'Brooks' },
  { first: 'Addison', last: 'Kelly' },
  { first: 'Grayson', last: 'Sanders' },
  { first: 'Ellie', last: 'Price' },
  { first: 'Levi', last: 'Bennett' },
  { first: 'Aubrey', last: 'Wood' },
  { first: 'Isaac', last: 'Barnes' },
  { first: 'Zoey', last: 'Ross' },
  { first: 'Lincoln', last: 'Henderson' },
  { first: 'Penelope', last: 'Coleman' },
  { first: 'Jaxon', last: 'Jenkins' },
  { first: 'Riley', last: 'Perry' },
  { first: 'Maverick', last: 'Powell' },
  { first: 'Layla', last: 'Long' },
  { first: 'Asher', last: 'Patterson' },
  { first: 'Natalie', last: 'Hughes' },
  { first: 'Easton', last: 'Flores' },
  { first: 'Aurora', last: 'Washington' },
  { first: 'Caleb', last: 'Butler' },
  { first: 'Savannah', last: 'Simmons' },
  { first: 'Josiah', last: 'Foster' },
  { first: 'Brooklyn', last: 'Gonzales' },
  { first: 'Cooper', last: 'Bryant' },
  { first: 'Bella', last: 'Alexander' },
  { first: 'Hudson', last: 'Russell' },
  { first: 'Claire', last: 'Griffin' },
  { first: 'Leo', last: 'Diaz' },
  { first: 'Hazel', last: 'Hayes' },
  { first: 'Adrian', last: 'Myers' },
  { first: 'Eleanor', last: 'Ford' },
  { first: 'Axel', last: 'Hamilton' },
  { first: 'Lucy', last: 'Graham' },
  { first: 'Ezra', last: 'Sullivan' },
  { first: 'Caroline', last: 'Wallace' },
];

// Email regex to find email addresses in JSON/CSV/MD files
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

// Track all unique emails found
const uniqueEmails = new Set();
const usedNames = new Set();

/**
 * Recursively scan directory for files
 */
function* walkDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      // Skip node_modules, .git, etc.
      if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file.name)) {
        yield* walkDirectory(fullPath);
      }
    } else {
      yield fullPath;
    }
  }
}

/**
 * Extract emails from a file
 */
function extractEmailsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(EMAIL_REGEX);

    if (matches) {
      matches.forEach(email => {
        // Only process techco emails and common personal domains
        if (email.includes('@techco.com') ||
            email.includes('@gmail.com') ||
            email.includes('@yahoo.com') ||
            email.includes('@hotmail.com')) {
          uniqueEmails.add(email.toLowerCase());
        }
      });
    }
  } catch (error) {
    // Skip binary files or unreadable files
    if (error.code !== 'EISDIR') {
      console.warn(`⚠️  Could not read ${filePath}: ${error.message}`);
    }
  }
}

/**
 * Get a unique fictional name that hasn't been used
 */
function getUniqueFictionalName() {
  let attempts = 0;
  while (attempts < FICTIONAL_NAMES.length * 2) {
    const name = FICTIONAL_NAMES[Math.floor(Math.random() * FICTIONAL_NAMES.length)];
    const nameKey = `${name.first} ${name.last}`;

    if (!usedNames.has(nameKey)) {
      usedNames.add(nameKey);
      return name;
    }
    attempts++;
  }

  // Fallback: append number if we run out of unique names
  const name = FICTIONAL_NAMES[0];
  const nameKey = `${name.first} ${name.last} ${attempts}`;
  usedNames.add(nameKey);
  return { first: `${name.first}${attempts}`, last: name.last };
}

/**
 * Generate email from name
 */
function generateEmail(firstName, lastName) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@techco.com`;
}

/**
 * Main function
 */
async function generateMapping() {
  console.log('🔍 Scanning data directory for email addresses...\n');

  const dataDir = path.join(__dirname, '..', 'data');

  // Scan all files
  let fileCount = 0;
  for (const filePath of walkDirectory(dataDir)) {
    const ext = path.extname(filePath).toLowerCase();

    // Process JSON, CSV, and MD files
    if (['.json', '.csv', '.md', '.txt'].includes(ext)) {
      extractEmailsFromFile(filePath);
      fileCount++;

      if (fileCount % 50 === 0) {
        process.stdout.write(`\r   Scanned ${fileCount} files...`);
      }
    }
  }

  console.log(`\r   Scanned ${fileCount} files ✓`);
  console.log(`\n📧 Found ${uniqueEmails.size} unique email addresses\n`);

  // Generate mapping
  console.log('🎭 Generating fictional employee mappings...\n');

  const mapping = {};
  const sortedEmails = Array.from(uniqueEmails).sort();

  sortedEmails.forEach((email, index) => {
    const fictionalName = getUniqueFictionalName();
    const fictionalEmail = generateEmail(fictionalName.first, fictionalName.last);

    mapping[email] = {
      email: fictionalEmail,
      name: `${fictionalName.first} ${fictionalName.last}`,
      firstName: fictionalName.first,
      lastName: fictionalName.last
    };

    // Show progress
    if ((index + 1) % 10 === 0 || index === sortedEmails.length - 1) {
      process.stdout.write(`\r   Generated ${index + 1}/${sortedEmails.size} mappings...`);
    }
  });

  console.log('\r   Generated all mappings ✓\n');

  // Save mapping to file
  const outputPath = path.join(__dirname, 'employee-mapping.json');
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));

  console.log(`✅ Employee mapping saved to: ${outputPath}\n`);
  console.log(`📊 Statistics:`);
  console.log(`   - Unique emails: ${uniqueEmails.size}`);
  console.log(`   - Unique names used: ${usedNames.size}`);
  console.log(`   - Files scanned: ${fileCount}`);
  console.log(`\n📝 Sample mappings (first 5):`);

  sortedEmails.slice(0, 5).forEach(email => {
    const fictional = mapping[email];
    console.log(`   ${email}`);
    console.log(`   → ${fictional.email} (${fictional.name})\n`);
  });

  console.log(`⚠️  IMPORTANT: employee-mapping.json contains real email addresses.`);
  console.log(`   This file is added to .gitignore and should NOT be committed.`);
  console.log(`   Delete it after running anonymize-all-data.js\n`);
}

// Run the generator
generateMapping().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
