/**
 * Helper Script: Get Slack Channel IDs
 *
 * This script lists all public channels in your Slack workspace and shows
 * the channel IDs for the ones you need for sentiment analysis.
 *
 * Prerequisites:
 * - SLACK_BOT_TOKEN configured in .env file
 * - Bot installed to workspace
 *
 * Usage:
 *   node scripts/get-channel-ids.js
 */

const { WebClient } = require('@slack/web-api');
require('dotenv').config();

// Channels we need for sentiment analysis
const TARGET_CHANNELS = [
  'claude-code-dev',
  'claude-enterprise',
  'ai-collab',
  'techco-thrv',
  'as-ai-dev',
  'technology'
];

async function getChannelIds() {
  console.log('\n🔍 Fetching Slack channel IDs...\n');

  // Check if bot token is configured
  if (!process.env.SLACK_BOT_TOKEN) {
    console.error('❌ Error: SLACK_BOT_TOKEN not found in .env file');
    console.log('\n💡 To fix this:');
    console.log('   1. Get bot token from Slack admin (starts with xoxb-)');
    console.log('   2. Add to .env file: SLACK_BOT_TOKEN=xoxb-...');
    console.log('   3. Run this script again\n');
    process.exit(1);
  }

  if (process.env.SLACK_BOT_TOKEN.startsWith('xoxb-xxxxx')) {
    console.error('❌ Error: SLACK_BOT_TOKEN is still placeholder value');
    console.log('\n💡 Replace with actual bot token from Slack admin\n');
    process.exit(1);
  }

  // Initialize Slack client
  const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

  try {
    // Fetch all public channels
    console.log('📱 Fetching channels from workspace...\n');
    const result = await slack.conversations.list({
      types: 'public_channel',
      limit: 1000,
      exclude_archived: true
    });

    if (!result.channels || result.channels.length === 0) {
      console.log('⚠️  No channels found. This might mean:');
      console.log('   - Bot token is invalid');
      console.log('   - Bot lacks channels:read permission');
      console.log('   - Workspace has no public channels\n');
      process.exit(1);
    }

    console.log(`✅ Found ${result.channels.length} public channels in workspace\n`);

    // Find our target channels
    const foundChannels = [];
    const missingChannels = [];

    TARGET_CHANNELS.forEach(channelName => {
      const channel = result.channels.find(ch => ch.name === channelName);
      if (channel) {
        foundChannels.push({
          name: channel.name,
          id: channel.id,
          memberCount: channel.num_members || 0,
          isMember: channel.is_member || false
        });
      } else {
        missingChannels.push(channelName);
      }
    });

    // Display found channels
    if (foundChannels.length > 0) {
      console.log('━'.repeat(70));
      console.log('✅ FOUND CHANNELS - Copy these to your .env file:');
      console.log('━'.repeat(70));
      console.log('');

      foundChannels.forEach(ch => {
        const envVar = `SLACK_CHANNEL_${ch.name.toUpperCase().replace(/-/g, '_')}`;
        const botStatus = ch.isMember ? '✅ Bot is member' : '⚠️  Need to invite bot';
        console.log(`# ${ch.name} (${ch.memberCount} members) - ${botStatus}`);
        console.log(`${envVar}=${ch.id}`);
        console.log('');
      });

      console.log('━'.repeat(70));
    }

    // Display missing channels
    if (missingChannels.length > 0) {
      console.log('\n⚠️  MISSING CHANNELS:');
      console.log('━'.repeat(70));
      missingChannels.forEach(name => {
        console.log(`   ❌ #${name} - Channel not found in workspace`);
      });
      console.log('\n💡 Possible reasons:');
      console.log('   - Channel name is different (check spelling)');
      console.log('   - Channel is private (bot only sees public channels)');
      console.log('   - Channel doesn\'t exist yet (create it first)');
      console.log('');
    }

    // Check bot membership
    const notMember = foundChannels.filter(ch => !ch.isMember);
    if (notMember.length > 0) {
      console.log('\n⚠️  BOT NOT INVITED TO THESE CHANNELS:');
      console.log('━'.repeat(70));
      notMember.forEach(ch => {
        console.log(`   #${ch.name} - Type: /invite @AI Sentiment Bot`);
      });
      console.log('\n💡 Bot needs to be a member to read messages!');
      console.log('   Go to each channel and type: /invite @AI Sentiment Bot\n');
    }

    // Summary
    console.log('📊 Summary:');
    console.log(`   ✅ Found: ${foundChannels.length}/${TARGET_CHANNELS.length} channels`);
    console.log(`   ✅ Bot member: ${foundChannels.filter(ch => ch.isMember).length}/${foundChannels.length} channels`);

    if (missingChannels.length > 0) {
      console.log(`   ⚠️  Missing: ${missingChannels.length} channels`);
    }

    console.log('');

    // Next steps
    if (foundChannels.length === TARGET_CHANNELS.length && notMember.length === 0) {
      console.log('🎉 All channels found and bot is member!');
      console.log('   Next: Copy the channel IDs above to your .env file\n');
    } else {
      console.log('📋 Next steps:');
      if (notMember.length > 0) {
        console.log('   1. Invite bot to channels listed above');
      }
      if (missingChannels.length > 0) {
        console.log('   2. Check missing channel names or create them');
      }
      console.log('   3. Run this script again to verify');
      console.log('   4. Copy channel IDs to .env file\n');
    }

  } catch (error) {
    console.error('\n❌ Error fetching channels:', error.message);

    if (error.data?.error === 'invalid_auth') {
      console.log('\n💡 Invalid authentication:');
      console.log('   - Check SLACK_BOT_TOKEN is correct');
      console.log('   - Token should start with xoxb-');
      console.log('   - Verify bot is installed to workspace\n');
    } else if (error.data?.error === 'missing_scope') {
      console.log('\n💡 Missing permission:');
      console.log('   - Bot needs channels:read scope');
      console.log('   - Verify app manifest was applied correctly\n');
    } else {
      console.log('\n💡 Possible causes:');
      console.log('   - Network connection issue');
      console.log('   - Slack API temporarily unavailable');
      console.log('   - Bot token expired or revoked\n');
    }

    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  getChannelIds();
}

module.exports = { getChannelIds };
