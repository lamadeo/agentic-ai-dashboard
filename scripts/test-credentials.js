/**
 * Test Script: Verify Slack and Confluence Credentials
 *
 * Tests each credential separately to identify specific issues
 */

const { WebClient } = require('@slack/web-api');
const axios = require('axios');
require('dotenv').config();

async function testCredentials() {
  console.log('\n🔍 Testing Credentials\n');
  console.log('━'.repeat(70));

  // Test 1: Check if tokens are set
  console.log('\n1️⃣ Checking environment variables...\n');

  const slackToken = process.env.SLACK_USER_TOKEN;
  const confluenceToken = process.env.CONFLUENCE_API_TOKEN;
  const confluenceUrl = process.env.CONFLUENCE_BASE_URL;
  const confluenceEmail = process.env.CONFLUENCE_EMAIL;

  if (!slackToken) {
    console.log('❌ SLACK_USER_TOKEN not set');
  } else {
    const prefix = slackToken.substring(0, 5);
    console.log(`✅ SLACK_USER_TOKEN found: ${prefix}... (${slackToken.length} chars)`);
    if (!slackToken.startsWith('xoxp-')) {
      console.log('⚠️  Warning: Token should start with "xoxp-" for user tokens');
      console.log(`   Your token starts with: ${prefix}`);
    }
  }

  if (!confluenceToken) {
    console.log('❌ CONFLUENCE_API_TOKEN not set');
  } else {
    console.log(`✅ CONFLUENCE_API_TOKEN found (${confluenceToken.length} chars)`);
  }

  if (!confluenceUrl) {
    console.log('❌ CONFLUENCE_BASE_URL not set');
  } else {
    console.log(`✅ CONFLUENCE_BASE_URL: ${confluenceUrl}`);
    if (confluenceUrl.endsWith('/')) {
      console.log('⚠️  Warning: URL should not have trailing slash');
    }
  }

  if (!confluenceEmail) {
    console.log('❌ CONFLUENCE_EMAIL not set');
  } else {
    console.log(`✅ CONFLUENCE_EMAIL: ${confluenceEmail}`);
  }

  // Test 2: Test Slack Connection
  console.log('\n━'.repeat(70));
  console.log('\n2️⃣ Testing Slack connection...\n');

  if (slackToken) {
    const slack = new WebClient(slackToken);

    try {
      console.log('   Testing auth.test...');
      const auth = await slack.auth.test();
      console.log(`   ✅ Connected to Slack!`);
      console.log(`   - Team: ${auth.team}`);
      console.log(`   - User: ${auth.user}`);
      console.log(`   - User ID: ${auth.user_id}`);
      console.log(`   - Token type: ${auth.token_type || 'unknown'}`);

      // Try to list channels
      console.log('\n   Testing conversations.list...');
      const channels = await slack.conversations.list({
        types: 'public_channel',
        limit: 5,
        exclude_archived: true
      });
      console.log(`   ✅ Can list channels: ${channels.channels.length} found`);

    } catch (error) {
      console.log(`   ❌ Slack error: ${error.message}`);
      if (error.data) {
        console.log(`   - Error code: ${error.data.error}`);
        if (error.data.error === 'not_allowed_token_type') {
          console.log('\n   💡 Solution: Your token type is not allowed for this operation.');
          console.log('   Try one of these:');
          console.log('   1. Use a legacy user token from: https://api.slack.com/custom-integrations/legacy-tokens');
          console.log('   2. Or create a user token with proper scopes (see instructions above)');
        } else if (error.data.error === 'missing_scope') {
          console.log('\n   💡 Solution: Token is missing required permissions.');
          console.log('   Add these User Token Scopes:');
          console.log('   - channels:history');
          console.log('   - channels:read');
          console.log('   - users:read');
        }
      }
    }
  } else {
    console.log('   ⏭️  Skipped (no token)');
  }

  // Test 3: Test Confluence Connection
  console.log('\n━'.repeat(70));
  console.log('\n3️⃣ Testing Confluence connection...\n');

  if (confluenceToken && confluenceUrl && confluenceEmail) {
    try {
      const auth = Buffer.from(`${confluenceEmail}:${confluenceToken}`).toString('base64');

      console.log('   Testing basic auth and API access...');
      const response = await axios.get(
        `${confluenceUrl}/wiki/rest/api/space`,
        {
          params: { limit: 1 },
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
          }
        }
      );

      console.log(`   ✅ Connected to Confluence!`);
      console.log(`   - Spaces accessible: ${response.data.results?.length || 0}`);
      if (response.data.results?.[0]) {
        console.log(`   - Example space: ${response.data.results[0].name}`);
      }

    } catch (error) {
      console.log(`   ❌ Confluence error: ${error.message}`);
      if (error.response) {
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Status text: ${error.response.statusText}`);
        if (error.response.status === 401) {
          console.log('\n   💡 Solution: Authentication failed.');
          console.log('   Check:');
          console.log('   - Email is correct');
          console.log('   - API token is valid');
          console.log('   - Token was copied without extra spaces');
        } else if (error.response.status === 400) {
          console.log('\n   💡 Solution: Bad request.');
          console.log('   Check:');
          console.log(`   - Base URL format: ${confluenceUrl}`);
          console.log('   - Should be: https://techco.atlassian.net (no trailing slash)');
        } else if (error.response.status === 404) {
          console.log('\n   💡 Solution: URL not found.');
          console.log('   - Verify base URL is correct');
        }
      }
    }
  } else {
    console.log('   ⏭️  Skipped (missing credentials)');
  }

  console.log('\n━'.repeat(70));
  console.log('\n✅ Diagnostic complete!\n');
}

// Run
if (require.main === module) {
  testCredentials().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  });
}
