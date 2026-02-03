const fs = require('fs');
const path = require('path');
require('dotenv').config();

const INPUT_DIR = path.join(__dirname, '../data/surveys');
const OUTPUT_DIR = path.join(__dirname, '../data/sentiment');

/**
 * Load hierarchy data to enrich with department info
 */
function loadHierarchyData() {
  const hierarchyPath = path.join(__dirname, '../data/hierarchy.json');

  if (!fs.existsSync(hierarchyPath)) {
    console.warn('⚠️  hierarchy.json not found. Department data will be missing.');
    return null;
  }

  return JSON.parse(fs.readFileSync(hierarchyPath, 'utf8'));
}

/**
 * Get department for a user email
 */
function getUserDepartment(email, hierarchyData) {
  if (!hierarchyData || !email) return 'Unknown';

  const employee = hierarchyData.find(emp =>
    emp.email?.toLowerCase() === email.toLowerCase() ||
    emp.aliases?.some(alias => alias.toLowerCase() === email.toLowerCase())
  );

  return employee?.department || 'Unknown';
}

/**
 * Parse CSV file (simple parser, no external dependencies)
 */
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Parse survey CSV files and convert to sentiment format
 */
function parseSurveyFiles() {
  console.log(`\n📋 Parsing survey data from ${INPUT_DIR}...`);

  if (!fs.existsSync(INPUT_DIR)) {
    console.warn(`⚠️  Survey directory not found: ${INPUT_DIR}`);
    console.log(`   Create directory and add survey CSV files to proceed`);
    return [];
  }

  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.csv'));

  if (files.length === 0) {
    console.warn(`⚠️  No CSV files found in ${INPUT_DIR}`);
    return [];
  }

  console.log(`   Found ${files.length} survey files`);

  const allResponses = [];

  files.forEach(file => {
    const filePath = path.join(INPUT_DIR, file);
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const rows = parseCSV(csvContent);

    console.log(`   Processing ${file}: ${rows.length} responses`);

    rows.forEach(row => {
      // Extract common survey fields (adjust based on actual survey structure)
      const email = row.Email || row.email || row['Email Address'] || '';
      const name = row.Name || row.name || row['Full Name'] || 'Anonymous';
      const npsScore = parseInt(row.NPS || row['NPS Score'] || row['How likely are you to recommend'] || '0');
      const rating = parseInt(row.Rating || row['Overall Rating'] || row['Satisfaction'] || '0');
      const feedback = row.Feedback || row['Additional Comments'] || row.Comments || row['Open Feedback'] || '';
      const tool = row.Tool || row['AI Tool'] || row['Which tool'] || 'Unknown';
      const timestamp = row.Timestamp || row.Date || row['Submitted At'] || new Date().toISOString();

      // Only include responses with meaningful feedback
      if (feedback && feedback.length > 10) {
        allResponses.push({
          id: `survey-${file}-${allResponses.length}`,
          text: feedback,
          quote: feedback,
          author: name,
          email: email,
          date: new Date(timestamp),
          source: 'survey',
          sourceFile: file,
          npsScore: npsScore,
          rating: rating,
          tool: tool
        });
      }
    });
  });

  console.log(`   ✅ Extracted ${allResponses.length} survey responses with feedback`);

  return allResponses;
}

/**
 * Enrich responses with department data
 */
function enrichWithDepartmentData(responses, hierarchyData) {
  if (!hierarchyData) return responses;

  return responses.map(resp => ({
    ...resp,
    department: getUserDepartment(resp.email, hierarchyData)
  }));
}

/**
 * Save responses to JSON file
 */
function saveResponses(responses, filename = 'survey-responses.json') {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, JSON.stringify(responses, null, 2));
  console.log(`\n💾 Saved ${responses.length} survey responses to ${outputPath}`);

  return outputPath;
}

/**
 * Main function
 */
function main() {
  try {
    console.log('🚀 Starting survey data collection...\n');

    // Step 1: Parse survey files
    const responses = parseSurveyFiles();

    if (responses.length === 0) {
      console.log('\n✅ No survey responses to process');
      console.log(`\nTo add survey data:`);
      console.log(`  1. Create directory: data/surveys/`);
      console.log(`  2. Export surveys as CSV files`);
      console.log(`  3. Place CSV files in data/surveys/`);
      console.log(`  4. Run this script again`);
      return;
    }

    // Step 2: Enrich with department data
    console.log(`\n👥 Enriching responses with department data...`);
    const hierarchyData = loadHierarchyData();
    const enrichedResponses = enrichWithDepartmentData(responses, hierarchyData);

    // Step 3: Save to file
    saveResponses(enrichedResponses);

    console.log('\n✅ Survey data collection complete!');
    console.log(`\nNext steps:`);
    console.log(`  1. Review: data/sentiment/survey-responses.json`);
    console.log(`  2. Run: node scripts/analyze-sentiment.js (to analyze with Claude API)`);
    console.log(`  3. Run: node scripts/aggregate-sentiment.js (to calculate metrics)`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Export functions for use in other scripts
module.exports = {
  parseSurveyFiles,
  enrichWithDepartmentData,
  saveResponses
};

// Run if called directly
if (require.main === module) {
  main();
}
