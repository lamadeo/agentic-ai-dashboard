const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Slack Web API (will be installed via npm install @slack/web-api)
let WebClient;
try {
  const slack = require('@slack/web-api');
  WebClient = slack.WebClient;
} catch (error) {
  console.warn('⚠️  @slack/web-api not installed. Run: npm install @slack/web-api');
  WebClient = null;
}

// Configuration
const SLACK_CHANNELS = {
  'claude-code-dev': process.env.SLACK_CHANNEL_CLAUDE_CODE_DEV || '',
  'claude-enterprise': process.env.SLACK_CHANNEL_CLAUDE_ENTERPRISE || '',
  'ai-collab': process.env.SLACK_CHANNEL_AI_COLLAB || '',
  'techco-thrv': process.env.SLACK_CHANNEL_TECHCO_THRV || '',
  'as-ai-dev': process.env.SLACK_CHANNEL_AS_AI_DEV || '',
  'technology': process.env.SLACK_CHANNEL_TECHNOLOGY || ''
};

const AI_TOOL_KEYWORDS = [
  'claude', 'copilot', 'github copilot', 'm365 copilot', 'chatgpt',
  'ai tool', 'ai assistant', 'llm', 'anthropic', 'openai',
  'coding assistant', 'code completion', 'ai productivity'
];

const OUTPUT_DIR = path.join(__dirname, '../data/sentiment');
const CACHE_FILE = path.join(OUTPUT_DIR, '.slack-cache.json');

/**
 * Load hierarchy data to enrich messages with department info
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
 * Check if message text contains AI tool keywords
 */
function containsAIToolKeyword(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return AI_TOOL_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Load cache to avoid re-fetching old messages
 */
function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) {
    return { lastFetchTimestamp: null, processedMessageIds: [] };
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
 * Fetch messages from Slack channels
 */
async function fetchSlackMessages(daysBack = 30) {
  if (!WebClient) {
    throw new Error('@slack/web-api package not installed');
  }

  if (!process.env.SLACK_BOT_TOKEN) {
    console.warn('⚠️  Tier 2 not configured - Sentiment analysis disabled');
    console.warn('   Set SLACK_BOT_TOKEN to enable real-time sentiment tracking');
    return { messages: [], channels: {} };  // Return empty results
  }

  const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
  const cache = loadCache();

  // Calculate timestamp for messages to fetch
  const now = Math.floor(Date.now() / 1000);
  const oldest = cache.lastFetchTimestamp || (now - (daysBack * 24 * 60 * 60));

  console.log(`\n📱 Fetching Slack messages from ${Object.keys(SLACK_CHANNELS).length} channels...`);
  if (cache.lastFetchTimestamp) {
    const hoursSinceLastFetch = Math.floor((now - cache.lastFetchTimestamp) / 3600);
    console.log(`   Last fetch: ${hoursSinceLastFetch} hours ago (delta mode)`);
  } else {
    console.log(`   Fetching last ${daysBack} days (first run)`);
  }

  const allMessages = [];
  let totalFetched = 0;
  let totalFiltered = 0;

  // Fetch from each channel
  for (const [channelName, channelId] of Object.entries(SLACK_CHANNELS)) {
    if (!channelId) {
      console.warn(`⚠️  Channel ID not configured for ${channelName}, skipping...`);
      continue;
    }

    try {
      console.log(`   Fetching from #${channelName} (${channelId})...`);

      const result = await slack.conversations.history({
        channel: channelId,
        oldest: oldest.toString(),
        limit: 1000
      });

      totalFetched += result.messages.length;

      // Filter messages
      const filteredMessages = result.messages.filter(msg => {
        // Skip bot messages
        if (msg.bot_id) return false;

        // Skip already processed messages
        if (cache.processedMessageIds.includes(msg.ts)) return false;

        // Only include messages mentioning AI tools
        if (!containsAIToolKeyword(msg.text)) return false;

        return true;
      });

      totalFiltered += filteredMessages.length;

      // Fetch user info for each message
      for (const msg of filteredMessages) {
        try {
          const userInfo = await slack.users.info({ user: msg.user });

          allMessages.push({
            id: msg.ts,
            text: msg.text,
            user: msg.user,
            userName: userInfo.user.real_name || userInfo.user.name,
            userEmail: userInfo.user.profile?.email || '',
            timestamp: new Date(parseFloat(msg.ts) * 1000),
            channel: channelName,
            channelId: channelId,
            source: 'slack',
            reactions: msg.reactions || [],
            threadTs: msg.thread_ts || null,
            replyCount: msg.reply_count || 0
          });
        } catch (error) {
          console.warn(`   ⚠️  Could not fetch user info for ${msg.user}: ${error.message}`);
        }
      }

      console.log(`      ✅ ${filteredMessages.length} relevant messages (${result.messages.length} total)`);

    } catch (error) {
      console.error(`   ❌ Error fetching from #${channelName}: ${error.message}`);
    }
  }

  console.log(`\n✅ Slack fetch complete: ${totalFiltered}/${totalFetched} messages (filtered by AI keywords)`);

  // Update cache
  cache.lastFetchTimestamp = now;
  cache.processedMessageIds.push(...allMessages.map(m => m.id));
  // Keep only last 10,000 IDs to prevent unbounded growth
  if (cache.processedMessageIds.length > 10000) {
    cache.processedMessageIds = cache.processedMessageIds.slice(-10000);
  }
  saveCache(cache);

  return allMessages;
}

/**
 * Enrich messages with department data from hierarchy
 */
function enrichWithDepartmentData(messages, hierarchyData) {
  if (!hierarchyData) return messages;

  return messages.map(msg => ({
    ...msg,
    department: getUserDepartment(msg.userEmail, hierarchyData)
  }));
}

/**
 * Save messages to JSON file
 */
function saveMessages(messages, filename = 'slack-messages.json') {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, JSON.stringify(messages, null, 2));
  console.log(`\n💾 Saved ${messages.length} messages to ${outputPath}`);

  return outputPath;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting Slack sentiment data collection...\n');

    // Check for required dependencies
    if (!WebClient) {
      console.error('❌ Error: @slack/web-api package not installed');
      console.log('\nTo install: npm install @slack/web-api');
      process.exit(1);
    }

    // Check for environment variables
    if (!process.env.SLACK_BOT_TOKEN) {
      console.warn('\n⚠️  Tier 2 not configured - Sentiment analysis disabled');
      console.warn('   Set SLACK_BOT_TOKEN in .env to enable real-time sentiment tracking');
      console.warn('   Dashboard will still work with Tier 1 (ANTHROPIC_API_KEY)\n');
      return;  // Skip gracefully
    }

    // Check if channel IDs are configured
    const configuredChannels = Object.values(SLACK_CHANNELS).filter(id => id).length;
    if (configuredChannels === 0) {
      console.error('❌ Error: No Slack channels configured');
      console.log('\nPlease add channel IDs to your .env file:');
      console.log('  SLACK_CHANNEL_CLAUDE_CODE_DEV=C...');
      console.log('  SLACK_CHANNEL_CLAUDE_ENTERPRISE=C...');
      console.log('  SLACK_CHANNEL_AI_COLLAB=C...');
      console.log('  SLACK_CHANNEL_TECHCO_THRV=C...');
      console.log('  SLACK_CHANNEL_AS_AI_DEV=C...');
      console.log('  SLACK_CHANNEL_TECHNOLOGY=C...');
      process.exit(1);
    }

    console.log(`📋 Configured channels: ${configuredChannels}/6`);

    // Step 1: Fetch messages from Slack
    const daysBack = parseInt(process.env.SLACK_DAYS_BACK || '30');
    const messages = await fetchSlackMessages(daysBack);

    if (messages.length === 0) {
      console.log('\n✅ No new messages to process');
      return;
    }

    // Step 2: Enrich with department data
    console.log(`\n👥 Enriching messages with department data...`);
    const hierarchyData = loadHierarchyData();
    const enrichedMessages = enrichWithDepartmentData(messages, hierarchyData);

    // Step 3: Save to file
    saveMessages(enrichedMessages);

    console.log('\n✅ Slack sentiment data collection complete!');
    console.log(`\nNext steps:`);
    console.log(`  1. Review: data/sentiment/slack-messages.json`);
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
  fetchSlackMessages,
  enrichWithDepartmentData,
  saveMessages,
  containsAIToolKeyword
};

// Run if called directly
if (require.main === module) {
  main();
}
