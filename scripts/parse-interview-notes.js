const fs = require('fs');
const path = require('path');
require('dotenv').config();

const INPUT_DIR = path.join(__dirname, '../data/interviews');
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
 * Get department for a name
 */
function getUserDepartment(name, hierarchyData) {
  if (!hierarchyData || !name) return 'Unknown';

  const employee = hierarchyData.find(emp =>
    emp.name?.toLowerCase() === name.toLowerCase()
  );

  return employee?.department || 'Unknown';
}

/**
 * Extract quotes from markdown interview notes
 */
function parseInterviewFile(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const quotes = [];

  // Extract metadata from front matter (if present)
  let interviewee = 'Unknown';
  let interviewDate = new Date();
  let interviewer = 'Unknown';

  const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (frontMatterMatch) {
    const frontMatter = frontMatterMatch[1];
    const intervieweeMatch = frontMatter.match(/interviewee:\s*(.+)/i);
    const dateMatch = frontMatter.match(/date:\s*(.+)/i);
    const interviewerMatch = frontMatter.match(/interviewer:\s*(.+)/i);

    if (intervieweeMatch) interviewee = intervieweeMatch[1].trim();
    if (dateMatch) interviewDate = new Date(dateMatch[1].trim());
    if (interviewerMatch) interviewer = interviewerMatch[1].trim();
  }

  // Extract quotes enclosed in quotes or special blocks
  const lines = content.split('\n');
  let currentQuote = '';
  let inQuoteBlock = false;

  lines.forEach((line, index) => {
    // Look for quote blocks (lines starting with >)
    if (line.trim().startsWith('>')) {
      inQuoteBlock = true;
      currentQuote += line.replace(/^>\s*/, '') + ' ';
    } else if (inQuoteBlock && line.trim() === '') {
      // End of quote block
      if (currentQuote.trim().length > 20) {
        quotes.push({
          quote: currentQuote.trim(),
          lineNumber: index - currentQuote.split('\n').length + 1
        });
      }
      currentQuote = '';
      inQuoteBlock = false;
    } else if (inQuoteBlock) {
      currentQuote += line + ' ';
    }

    // Also look for quoted text in regular lines
    const quoteMatches = line.match(/"([^"]{20,})"/g);
    if (quoteMatches) {
      quoteMatches.forEach(match => {
        const cleanQuote = match.replace(/^"|"$/g, '');
        if (cleanQuote.length > 20) {
          quotes.push({
            quote: cleanQuote,
            lineNumber: index + 1
          });
        }
      });
    }
  });

  // Add final quote if still in block
  if (inQuoteBlock && currentQuote.trim().length > 20) {
    quotes.push({
      quote: currentQuote.trim(),
      lineNumber: lines.length
    });
  }

  return quotes.map((q, index) => ({
    id: `interview-${fileName}-${index}`,
    text: q.quote,
    quote: q.quote,
    author: interviewee,
    interviewer: interviewer,
    date: interviewDate,
    source: 'interview',
    sourceFile: fileName,
    lineNumber: q.lineNumber
  }));
}

/**
 * Parse all interview markdown files
 */
function parseInterviewFiles() {
  console.log(`\n🎤 Parsing interview notes from ${INPUT_DIR}...`);

  if (!fs.existsSync(INPUT_DIR)) {
    console.warn(`⚠️  Interview directory not found: ${INPUT_DIR}`);
    console.log(`   Create directory and add interview markdown files to proceed`);
    return [];
  }

  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.warn(`⚠️  No markdown files found in ${INPUT_DIR}`);
    return [];
  }

  console.log(`   Found ${files.length} interview files`);

  const allQuotes = [];

  files.forEach(file => {
    const filePath = path.join(INPUT_DIR, file);
    const quotes = parseInterviewFile(filePath, file);

    console.log(`   ${file}: ${quotes.length} quotes extracted`);

    allQuotes.push(...quotes);
  });

  console.log(`   ✅ Extracted ${allQuotes.length} total quotes from interviews`);

  return allQuotes;
}

/**
 * Enrich quotes with department data
 */
function enrichWithDepartmentData(quotes, hierarchyData) {
  if (!hierarchyData) return quotes;

  return quotes.map(quote => ({
    ...quote,
    department: getUserDepartment(quote.author, hierarchyData)
  }));
}

/**
 * Save quotes to JSON file
 */
function saveQuotes(quotes, filename = 'interview-quotes.json') {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, JSON.stringify(quotes, null, 2));
  console.log(`\n💾 Saved ${quotes.length} interview quotes to ${outputPath}`);

  return outputPath;
}

/**
 * Main function
 */
function main() {
  try {
    console.log('🚀 Starting interview notes collection...\n');

    // Step 1: Parse interview files
    const quotes = parseInterviewFiles();

    if (quotes.length === 0) {
      console.log('\n✅ No interview quotes to process');
      console.log(`\nTo add interview data:`);
      console.log(`  1. Create directory: data/interviews/`);
      console.log(`  2. Add markdown files with interview notes`);
      console.log(`  3. Use front matter for metadata:`);
      console.log(`     ---`);
      console.log(`     interviewee: John Doe`);
      console.log(`     interviewer: Jane Smith`);
      console.log(`     date: 2024-12-01`);
      console.log(`     ---`);
      console.log(`  4. Use > for quote blocks or "quotes" in text`);
      console.log(`  5. Run this script again`);
      return;
    }

    // Step 2: Enrich with department data
    console.log(`\n👥 Enriching quotes with department data...`);
    const hierarchyData = loadHierarchyData();
    const enrichedQuotes = enrichWithDepartmentData(quotes, hierarchyData);

    // Step 3: Save to file
    saveQuotes(enrichedQuotes);

    console.log('\n✅ Interview notes collection complete!');
    console.log(`\nNext steps:`);
    console.log(`  1. Review: data/sentiment/interview-quotes.json`);
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
  parseInterviewFiles,
  parseInterviewFile,
  enrichWithDepartmentData,
  saveQuotes
};

// Run if called directly
if (require.main === module) {
  main();
}
