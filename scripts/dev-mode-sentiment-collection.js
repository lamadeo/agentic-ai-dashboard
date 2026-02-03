/**
 * DEV MODE: Quick Sentiment Data Collection
 *
 * Uses personal/user credentials instead of bot tokens for immediate data collection.
 * This is a temporary workaround while waiting for Slack bot approval.
 *
 * Data Sources:
 * - Slack channels (via user token)
 * - Confluence wikis (via personal access token)
 *
 * Environment Variables (add to .env):
 * - SLACK_USER_TOKEN=xoxp-... (get from https://api.slack.com/tutorials/tracks/getting-a-token)
 * - CONFLUENCE_API_TOKEN=... (get from https://id.atlassian.com/manage-profile/security/api-tokens)
 * - CONFLUENCE_BASE_URL=https://yourcompany.atlassian.net
 * - CONFLUENCE_EMAIL=your-email@techco.com
 *
 * Usage:
 *   node scripts/dev-mode-sentiment-collection.js
 */

const { WebClient } = require('@slack/web-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const OUTPUT_DIR = path.join(__dirname, '../data/sentiment');

// Channels to monitor (same as production)
const SLACK_CHANNELS = [
  'claude-code-dev',
  'claude-enterprise',
  'ai-collab',
  'techco-thrv',
  'as-ai-dev',
  'technology'
];

// AI tool keywords to filter messages
const AI_TOOL_KEYWORDS = [
  'claude', 'copilot', 'github copilot', 'm365 copilot', 'chatgpt',
  'ai tool', 'ai assistant', 'llm', 'anthropic', 'openai'
];

// Confluence search queries for AI tool feedback
const CONFLUENCE_QUERIES = [
  'label = "ai-tools"',
  'label = "claude"',
  'label = "copilot"',
  'text ~ "AI tools" OR text ~ "Claude" OR text ~ "Copilot"'
];

/**
 * Fetch Slack messages using user token
 */
async function fetchSlackWithUserToken() {
  console.log('\n📱 Fetching Slack messages (USER TOKEN - Dev Mode)...\n');

  if (!process.env.SLACK_USER_TOKEN) {
    console.log('⚠️  SLACK_USER_TOKEN not set - skipping Slack');
    console.log('\n💡 To enable Slack:');
    console.log('   1. Go to: https://api.slack.com/tutorials/tracks/getting-a-token');
    console.log('   2. Create a user token with these scopes:');
    console.log('      - channels:history, channels:read, users:read');
    console.log('   3. Add to .env: SLACK_USER_TOKEN=xoxp-...\n');
    return [];
  }

  const slack = new WebClient(process.env.SLACK_USER_TOKEN);
  const daysBack = 30;
  const oldest = Math.floor(Date.now() / 1000) - (daysBack * 24 * 60 * 60);

  console.log(`📅 Fetching last ${daysBack} days of messages\n`);

  const allMessages = [];

  try {
    // Get list of channels
    const channelsList = await slack.conversations.list({
      types: 'public_channel',
      exclude_archived: true,
      limit: 1000
    });

    console.log(`✅ Found ${channelsList.channels.length} channels in workspace\n`);

    // Fetch messages from target channels
    for (const targetChannel of SLACK_CHANNELS) {
      const channel = channelsList.channels.find(ch => ch.name === targetChannel);

      if (!channel) {
        console.log(`   ⚠️  #${targetChannel} not found`);
        continue;
      }

      try {
        console.log(`   📱 Fetching #${targetChannel}...`);

        const history = await slack.conversations.history({
          channel: channel.id,
          oldest: oldest.toString(),
          limit: 1000
        });

        // Filter for AI tool mentions
        const relevant = history.messages
          .filter(msg => !msg.bot_id && msg.text)
          .filter(msg => AI_TOOL_KEYWORDS.some(kw => msg.text.toLowerCase().includes(kw)))
          .map(msg => ({
            text: msg.text,
            user: msg.user,
            timestamp: new Date(parseFloat(msg.ts) * 1000),
            channel: targetChannel,
            source: 'slack',
            reactions: msg.reactions || []
          }));

        allMessages.push(...relevant);
        console.log(`      ✅ ${relevant.length} relevant messages`);

        await sleep(100); // Rate limiting

      } catch (error) {
        console.log(`      ❌ Error: ${error.message}`);
      }
    }

    // Enrich with user info
    console.log(`\n👤 Enriching ${allMessages.length} messages with user data...`);

    const uniqueUsers = [...new Set(allMessages.map(m => m.user))];
    const userCache = {};

    for (const userId of uniqueUsers) {
      try {
        const userInfo = await slack.users.info({ user: userId });
        userCache[userId] = {
          name: userInfo.user.real_name || userInfo.user.name,
          email: userInfo.user.profile.email || null
        };
        await sleep(100);
      } catch (error) {
        userCache[userId] = { name: 'Unknown', email: null };
      }
    }

    // Add user info to messages
    allMessages.forEach(msg => {
      const user = userCache[msg.user] || { name: 'Unknown', email: null };
      msg.userName = user.name;
      msg.userEmail = user.email;
      msg.department = 'Unknown'; // Will be enriched with org chart later
    });

    console.log(`   ✅ Enriched all messages\n`);

    return allMessages;

  } catch (error) {
    console.error(`❌ Slack error: ${error.message}\n`);
    return [];
  }
}

/**
 * Fetch Confluence pages with AI tool feedback
 */
async function fetchConfluencePages() {
  console.log('\n📚 Fetching Confluence pages (Dev Mode)...\n');

  if (!process.env.CONFLUENCE_API_TOKEN || !process.env.CONFLUENCE_BASE_URL) {
    console.log('⚠️  Confluence not configured - skipping');
    console.log('\n💡 To enable Confluence:');
    console.log('   1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens');
    console.log('   2. Create API token');
    console.log('   3. Add to .env:');
    console.log('      CONFLUENCE_BASE_URL=https://yourcompany.atlassian.net');
    console.log('      CONFLUENCE_EMAIL=your-email@company.com');
    console.log('      CONFLUENCE_API_TOKEN=...\n');
    return [];
  }

  const baseURL = process.env.CONFLUENCE_BASE_URL;
  const auth = Buffer.from(
    `${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`
  ).toString('base64');

  const allContent = [];

  try {
    // Search for pages with AI tool mentions
    console.log('🔍 Searching for AI tool feedback pages...\n');

    const searchQuery = '(label=ai-tools OR label=claude OR label=copilot) AND type=page';

    const searchResponse = await axios.get(
      `${baseURL}/wiki/rest/api/content/search`,
      {
        params: {
          cql: searchQuery,
          limit: 50,
          expand: 'body.storage,version,space'
        },
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      }
    );

    const pages = searchResponse.data.results || [];
    console.log(`   ✅ Found ${pages.length} pages\n`);

    for (const page of pages) {
      console.log(`   📄 ${page.title}`);

      // Extract text content from HTML
      const body = page.body?.storage?.value || '';
      const textContent = body
        .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (textContent.length > 50) {
        allContent.push({
          text: textContent,
          title: page.title,
          author: page.version?.by?.displayName || 'Unknown',
          timestamp: new Date(page.version?.when || Date.now()),
          source: 'confluence',
          url: `${baseURL}/wiki${page._links.webui}`
        });
      }

      // Fetch comments
      try {
        const commentsResponse = await axios.get(
          `${baseURL}/wiki/rest/api/content/${page.id}/child/comment`,
          {
            params: { expand: 'body.storage,version' },
            headers: {
              'Authorization': `Basic ${auth}`,
              'Accept': 'application/json'
            }
          }
        );

        const comments = commentsResponse.data.results || [];
        console.log(`      💬 ${comments.length} comments`);

        comments.forEach(comment => {
          const commentText = (comment.body?.storage?.value || '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (commentText.length > 20) {
            allContent.push({
              text: commentText,
              title: `Comment on: ${page.title}`,
              author: comment.version?.by?.displayName || 'Unknown',
              timestamp: new Date(comment.version?.when || Date.now()),
              source: 'confluence',
              url: `${baseURL}/wiki${page._links.webui}`
            });
          }
        });

      } catch (error) {
        console.log(`      ⚠️  Could not fetch comments: ${error.message}`);
      }

      await sleep(200); // Rate limiting
    }

    console.log(`\n✅ Collected ${allContent.length} items from Confluence\n`);

    return allContent;

  } catch (error) {
    console.error(`❌ Confluence error: ${error.message}\n`);
    return [];
  }
}

/**
 * Save collected data
 */
function saveData(slackMessages, confluenceContent) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Save Slack messages
  const slackPath = path.join(OUTPUT_DIR, 'slack-messages.json');
  fs.writeFileSync(slackPath, JSON.stringify(slackMessages, null, 2));
  console.log(`💾 Saved Slack data: ${slackPath}`);

  // Save Confluence content
  const confluencePath = path.join(OUTPUT_DIR, 'confluence-items.json');
  fs.writeFileSync(confluencePath, JSON.stringify(confluenceContent, null, 2));
  console.log(`💾 Saved Confluence data: ${confluencePath}`);

  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Slack messages: ${slackMessages.length}`);
  console.log(`   Confluence items: ${confluenceContent.length}`);
  console.log(`   Total for analysis: ${slackMessages.length + confluenceContent.length}\n`);

  console.log('✅ Data collection complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Run: node scripts/aggregate-sentiment.js');
  console.log('   2. This will analyze sentiment with Claude API');
  console.log('   3. Generate perceived value scores');
  console.log('   4. Output: data/perceived-value.json\n');
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
  console.log('\n🚀 DEV MODE: Quick Sentiment Data Collection');
  console.log('━'.repeat(70));
  console.log('Using personal credentials for immediate data collection\n');

  const slackMessages = await fetchSlackWithUserToken();
  const confluenceContent = await fetchConfluencePages();

  if (slackMessages.length === 0 && confluenceContent.length === 0) {
    console.log('⚠️  No data collected. Check:');
    console.log('   - SLACK_USER_TOKEN is set');
    console.log('   - CONFLUENCE_API_TOKEN is set');
    console.log('   - Network connection is working\n');
    process.exit(1);
  }

  saveData(slackMessages, confluenceContent);
}

// Run
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = { fetchSlackWithUserToken, fetchConfluencePages };
