const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Axios for HTTP requests (will be installed via npm install axios)
let axios;
try {
  axios = require('axios');
} catch (error) {
  console.warn('⚠️  axios not installed. Run: npm install axios');
  axios = null;
}

// Configuration
const CONFLUENCE_CONFIG = {
  baseUrl: process.env.CONFLUENCE_BASE_URL || '',
  username: process.env.CONFLUENCE_USERNAME || '',
  apiToken: process.env.CONFLUENCE_API_TOKEN || '',
  searchQueries: [
    'label = "ai-tools"',
    'label = "claude"',
    'label = "copilot"',
    'label = "retrospective" AND (text ~ "claude" OR text ~ "copilot")',
    'space = "ENG" AND (title ~ "AI" OR text ~ "claude" OR text ~ "copilot")',
    'space = "TECH" AND (title ~ "AI" OR text ~ "claude" OR text ~ "copilot")'
  ],
  daysBack: 90
};

const OUTPUT_DIR = path.join(__dirname, '../data/sentiment');
const CACHE_FILE = path.join(OUTPUT_DIR, '.confluence-cache.json');

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
 * Create Confluence API client
 */
function createConfluenceClient() {
  if (!axios) {
    throw new Error('axios package not installed');
  }

  const auth = Buffer.from(`${CONFLUENCE_CONFIG.username}:${CONFLUENCE_CONFIG.apiToken}`).toString('base64');

  return axios.create({
    baseURL: `${CONFLUENCE_CONFIG.baseUrl}/wiki/rest/api`,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Strip HTML tags from Confluence content
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract action items from page content
 */
function extractActionItems(content) {
  if (!content) return [];

  const actionItems = [];
  const lines = content.split('\n');

  lines.forEach(line => {
    // Match common action item patterns
    if (
      line.match(/^\s*[-*]\s*\[?\s*(TODO|ACTION|NEXT STEPS?)\s*:?\]?\s*/i) ||
      line.match(/^\s*[-*]\s*@\w+\s+to\s+/i) ||
      line.match(/^\s*\d+\.\s*(TODO|ACTION|NEXT STEPS?)\s*:?\s*/i)
    ) {
      actionItems.push(line.trim());
    }
  });

  return actionItems;
}

/**
 * Load cache to avoid re-fetching old pages
 */
function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) {
    return { lastFetchTimestamp: null, processedPageIds: [] };
  }
  return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
}

/**
 * Save cache with last fetch timestamp
 */
function saveCache(cache) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

/**
 * Fetch pages from Confluence
 */
async function fetchConfluencePages(daysBack = 90) {
  if (!axios) {
    throw new Error('axios package not installed');
  }

  if (!CONFLUENCE_CONFIG.baseUrl || !CONFLUENCE_CONFIG.username || !CONFLUENCE_CONFIG.apiToken) {
    throw new Error('Confluence configuration missing in environment variables');
  }

  const client = createConfluenceClient();
  const cache = loadCache();

  // Calculate date threshold
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysBack);
  const dateStr = dateThreshold.toISOString().split('T')[0];

  console.log(`\n📚 Fetching Confluence pages...`);
  console.log(`   Base URL: ${CONFLUENCE_CONFIG.baseUrl}`);
  console.log(`   Date threshold: ${dateStr}`);

  const allPages = [];
  let totalFetched = 0;
  let totalFiltered = 0;

  // Search using each CQL query
  for (const query of CONFLUENCE_CONFIG.searchQueries) {
    try {
      console.log(`\n   Searching with CQL: ${query}`);

      const cqlWithDate = `${query} AND lastModified >= "${dateStr}"`;

      const response = await client.get('/content/search', {
        params: {
          cql: cqlWithDate,
          limit: 100,
          expand: 'body.storage,version,space,history.lastUpdated'
        }
      });

      totalFetched += response.data.results.length;

      // Filter pages
      const filteredPages = response.data.results.filter(page => {
        // Skip already processed pages
        return !cache.processedPageIds.includes(page.id);
      });

      totalFiltered += filteredPages.length;

      // Parse pages
      for (const page of filteredPages) {
        const content = stripHtml(page.body?.storage?.value || '');

        allPages.push({
          id: page.id,
          title: page.title,
          content: content,
          spaceKey: page.space?.key || 'Unknown',
          spaceName: page.space?.name || 'Unknown',
          url: `${CONFLUENCE_CONFIG.baseUrl}${page._links.webui}`,
          author: page.history?.lastUpdated?.by?.displayName || page.history?.createdBy?.displayName || 'Unknown',
          authorEmail: page.history?.lastUpdated?.by?.email || page.history?.createdBy?.email || '',
          lastModified: new Date(page.history?.lastUpdated?.when || page.version?.when),
          labels: page.metadata?.labels?.results?.map(l => l.name) || [],
          actionItems: extractActionItems(content),
          source: 'confluence',
          type: 'page'
        });
      }

      console.log(`      ✅ ${filteredPages.length} new pages (${response.data.results.length} total)`);

    } catch (error) {
      console.error(`   ❌ Error searching with query "${query}": ${error.message}`);
    }
  }

  // Fetch comments for each page
  console.log(`\n   Fetching comments for ${allPages.length} pages...`);
  const pagesWithComments = [];

  for (const page of allPages) {
    try {
      const commentsResponse = await client.get(`/content/${page.id}/child/comment`, {
        params: {
          expand: 'body.storage,version,history.lastUpdated',
          limit: 100
        }
      });

      const comments = commentsResponse.data.results.map(comment => ({
        id: comment.id,
        pageId: page.id,
        pageTitle: page.title,
        text: stripHtml(comment.body?.storage?.value || ''),
        author: comment.history?.lastUpdated?.by?.displayName || comment.history?.createdBy?.displayName || 'Unknown',
        authorEmail: comment.history?.lastUpdated?.by?.email || comment.history?.createdBy?.email || '',
        timestamp: new Date(comment.history?.lastUpdated?.when || comment.version?.when),
        source: 'confluence',
        type: 'comment'
      }));

      pagesWithComments.push({
        ...page,
        comments: comments,
        commentCount: comments.length
      });

      if (comments.length > 0) {
        console.log(`      ✅ ${comments.length} comments on "${page.title}"`);
      }

    } catch (error) {
      console.warn(`   ⚠️  Could not fetch comments for page ${page.id}: ${error.message}`);
      pagesWithComments.push({
        ...page,
        comments: [],
        commentCount: 0
      });
    }
  }

  console.log(`\n✅ Confluence fetch complete: ${allPages.length} pages, ${pagesWithComments.reduce((sum, p) => sum + p.commentCount, 0)} comments`);

  // Update cache
  cache.lastFetchTimestamp = Date.now();
  cache.processedPageIds.push(...allPages.map(p => p.id));
  // Keep only last 1,000 IDs to prevent unbounded growth
  if (cache.processedPageIds.length > 1000) {
    cache.processedPageIds = cache.processedPageIds.slice(-1000);
  }
  saveCache(cache);

  return pagesWithComments;
}

/**
 * Enrich pages/comments with department data
 */
function enrichWithDepartmentData(pages, hierarchyData) {
  if (!hierarchyData) return pages;

  return pages.map(page => ({
    ...page,
    department: getUserDepartment(page.authorEmail, hierarchyData),
    comments: page.comments?.map(comment => ({
      ...comment,
      department: getUserDepartment(comment.authorEmail, hierarchyData)
    })) || []
  }));
}

/**
 * Flatten pages and comments into single array for sentiment analysis
 */
function flattenForAnalysis(pages) {
  const items = [];

  pages.forEach(page => {
    // Add page content
    items.push({
      id: `page-${page.id}`,
      text: page.content,
      quote: page.content.substring(0, 500), // First 500 chars for quote
      author: page.author,
      department: page.department,
      date: page.lastModified,
      source: 'confluence',
      sourceType: 'page',
      sourceUrl: page.url,
      sourceTitle: page.title,
      spaceKey: page.spaceKey,
      spaceName: page.spaceName,
      labels: page.labels,
      actionItems: page.actionItems
    });

    // Add comments
    page.comments?.forEach(comment => {
      if (comment.text && comment.text.length > 10) {
        items.push({
          id: `comment-${comment.id}`,
          text: comment.text,
          quote: comment.text,
          author: comment.author,
          department: comment.department,
          date: comment.timestamp,
          source: 'confluence',
          sourceType: 'comment',
          sourceUrl: page.url,
          sourceTitle: page.title,
          pageTitle: page.title,
          spaceKey: page.spaceKey,
          spaceName: page.spaceName
        });
      }
    });
  });

  return items;
}

/**
 * Save pages to JSON file
 */
function savePages(pages, filename = 'confluence-pages.json') {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, JSON.stringify(pages, null, 2));
  console.log(`\n💾 Saved ${pages.length} pages to ${outputPath}`);

  return outputPath;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting Confluence sentiment data collection...\n');

    // Check for required dependencies
    if (!axios) {
      console.error('❌ Error: axios package not installed');
      console.log('\nTo install: npm install axios');
      process.exit(1);
    }

    // Check for environment variables
    if (!CONFLUENCE_CONFIG.baseUrl || !CONFLUENCE_CONFIG.username || !CONFLUENCE_CONFIG.apiToken) {
      console.error('❌ Error: Confluence configuration not found in .env file');
      console.log('\nPlease add to your .env file:');
      console.log('  CONFLUENCE_BASE_URL=https://your-domain.atlassian.net');
      console.log('  CONFLUENCE_USERNAME=your-email@company.com');
      console.log('  CONFLUENCE_API_TOKEN=your-api-token');
      process.exit(1);
    }

    // Step 1: Fetch pages from Confluence
    const daysBack = parseInt(process.env.CONFLUENCE_DAYS_BACK || '90');
    const pages = await fetchConfluencePages(daysBack);

    if (pages.length === 0) {
      console.log('\n✅ No new pages to process');
      return;
    }

    // Step 2: Enrich with department data
    console.log(`\n👥 Enriching pages with department data...`);
    const hierarchyData = loadHierarchyData();
    const enrichedPages = enrichWithDepartmentData(pages, hierarchyData);

    // Step 3: Flatten for analysis
    const flattenedItems = flattenForAnalysis(enrichedPages);
    console.log(`   Flattened ${enrichedPages.length} pages into ${flattenedItems.length} items for analysis`);

    // Step 4: Save to file
    savePages(enrichedPages);

    // Save flattened version for sentiment analysis
    const flattenedPath = path.join(OUTPUT_DIR, 'confluence-items.json');
    fs.writeFileSync(flattenedPath, JSON.stringify(flattenedItems, null, 2));
    console.log(`💾 Saved ${flattenedItems.length} flattened items to ${flattenedPath}`);

    console.log('\n✅ Confluence sentiment data collection complete!');
    console.log(`\nNext steps:`);
    console.log(`  1. Review: data/sentiment/confluence-pages.json`);
    console.log(`  2. Review: data/sentiment/confluence-items.json`);
    console.log(`  3. Run: node scripts/analyze-sentiment.js (to analyze with Claude API)`);
    console.log(`  4. Run: node scripts/aggregate-sentiment.js (to calculate metrics)`);

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
  fetchConfluencePages,
  enrichWithDepartmentData,
  flattenForAnalysis,
  savePages
};

// Run if called directly
if (require.main === module) {
  main();
}
