#!/usr/bin/env node

/**
 * Research Industry Benchmarks Script
 *
 * Researches and aggregates productivity benchmarks from industry sources
 * for GitHub Copilot and M365 Copilot across different roles.
 *
 * Features:
 * - 30-day caching (skip research if cache is fresh)
 * - Claude API integration for research
 * - Statistical aggregation (weighted mean/median)
 * - Confidence interval calculation
 * - Low-confidence flagging
 *
 * Usage:
 *   node scripts/research-industry-benchmarks.js [--force]
 *
 * Options:
 *   --force  Force research even if cache is valid
 */

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const CONFIG_PATH = path.join(__dirname, '../data/roi_config.json');
const CACHE_TTL_DAYS = 30;

// Initialize Claude API client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Check if cache has expired
 */
function isCacheExpired(config) {
  if (!config.industryBenchmarks.cacheExpiry) {
    return true; // No cache exists
  }

  const expiryDate = new Date(config.industryBenchmarks.cacheExpiry);
  const now = new Date();

  return now >= expiryDate;
}

/**
 * Research productivity benchmarks using Claude API
 */
async function researchProductivityBenchmarks(tool, role) {
  console.log(`\n🔍 Researching ${tool} benchmarks for ${role}...`);

  const prompt = `Research productivity benchmarks for ${tool} used by ${role} professionals.

Please search for and analyze published research studies, reports, and whitepapers from credible sources including:
- Forrester Research
- Gartner
- Anthropic (for Claude-related tools)
- Microsoft (for M365 Copilot)
- GitHub/OpenAI (for GitHub Copilot)
- Google (for Workspace AI)
- Academic peer-reviewed studies

For each study you find, extract:
1. Hours saved per month (or convert from other time units)
2. Sample size (number of participants)
3. Publication year
4. Author/organization
5. Study methodology (survey, controlled experiment, observational, etc.)
6. Statistical significance indicators (p-value, confidence level)

Return your findings as a JSON array with this structure:
[
  {
    "title": "Study Title",
    "author": "Organization Name",
    "year": 2024,
    "sampleSize": 1200,
    "hoursSavedPerMonth": 15.2,
    "methodology": "Controlled experiment",
    "pValue": 0.01,
    "confidenceLevel": 0.95,
    "url": "https://...",
    "notes": "Any relevant context"
  }
]

Focus on recent studies (2023-2025) but include older landmark studies if they have large sample sizes.
If you find no studies, return an empty array [].`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract JSON from response
    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      console.warn(`   ⚠️  No structured data found in response`);
      return [];
    }

    const studies = JSON.parse(jsonMatch[0]);
    console.log(`   ✅ Found ${studies.length} studies`);

    return studies;
  } catch (error) {
    console.error(`   ❌ Research error: ${error.message}`);
    return [];
  }
}

/**
 * Calculate weighted statistics from study data
 */
function calculateWeightedStats(studies) {
  if (studies.length === 0) {
    return {
      hoursSavedPerMonth: null,
      confidenceInterval: null,
      confidenceLevel: 'none',
      lowConfidence: true,
      coefficientOfVariation: null,
      studyCount: 0,
      totalSampleSize: 0,
      aggregationMethod: null,
      sources: []
    };
  }

  // Calculate weights for each study
  const currentYear = new Date().getFullYear();
  const studiesWithWeights = studies.map(study => {
    // Recency factor: exponential decay with 2-year half-life
    const ageInYears = currentYear - study.year;
    const recencyFactor = Math.exp(-ageInYears / 2);

    // Credibility factor based on author
    let credibilityFactor = 0.5; // Unknown
    const author = study.author.toLowerCase();
    if (author.includes('forrester') || author.includes('gartner')) {
      credibilityFactor = 1.2;
    } else if (author.includes('academic') || author.includes('university')) {
      credibilityFactor = 1.1;
    } else if (author.includes('microsoft') || author.includes('github') ||
               author.includes('anthropic') || author.includes('openai')) {
      credibilityFactor = 0.8; // Vendor studies - potential bias
    }

    // Sample size factor (normalize to 1000)
    const sampleSizeFactor = study.sampleSize / 1000;

    // Combined weight
    const weight = sampleSizeFactor * recencyFactor * credibilityFactor;

    return { ...study, weight };
  });

  // Calculate weighted mean
  const totalWeight = studiesWithWeights.reduce((sum, s) => sum + s.weight, 0);
  const weightedMean = studiesWithWeights.reduce((sum, s) =>
    sum + (s.hoursSavedPerMonth * s.weight), 0
  ) / totalWeight;

  // Calculate median (outlier-resistant)
  const sortedHours = studies
    .map(s => s.hoursSavedPerMonth)
    .sort((a, b) => a - b);
  const median = sortedHours.length % 2 === 0
    ? (sortedHours[sortedHours.length / 2 - 1] + sortedHours[sortedHours.length / 2]) / 2
    : sortedHours[Math.floor(sortedHours.length / 2)];

  // Calculate coefficient of variation (CV)
  const mean = studies.reduce((sum, s) => sum + s.hoursSavedPerMonth, 0) / studies.length;
  const variance = studies.reduce((sum, s) =>
    sum + Math.pow(s.hoursSavedPerMonth - mean, 2), 0
  ) / studies.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  // Choose aggregation method based on CV
  const aggregationMethod = cv > 0.5 ? 'median' : 'weighted_mean';
  const finalValue = aggregationMethod === 'median' ? median : weightedMean;

  // Calculate 95% confidence interval (simplified)
  const standardError = stdDev / Math.sqrt(studies.length);
  const marginOfError = 1.96 * standardError; // 95% CI z-score
  const confidenceInterval = [
    Math.max(0, finalValue - marginOfError),
    finalValue + marginOfError
  ];

  // Determine confidence level
  let confidenceLevel = 'high';
  let lowConfidence = false;
  if (studies.length < 3 || cv > 0.6) {
    confidenceLevel = 'low';
    lowConfidence = true;
  } else if (studies.length < 5 || cv > 0.4) {
    confidenceLevel = 'medium';
  }

  // Calculate total sample size
  const totalSampleSize = studies.reduce((sum, s) => sum + s.sampleSize, 0);

  // Format sources for output
  const sources = studiesWithWeights.map(s => ({
    title: s.title,
    author: s.author,
    year: s.year,
    sampleSize: s.sampleSize,
    findingHours: s.hoursSavedPerMonth,
    weight: Math.round(s.weight * 100) / 100,
    url: s.url || null
  }));

  return {
    hoursSavedPerMonth: Math.round(finalValue * 10) / 10,
    confidenceInterval: [
      Math.round(confidenceInterval[0] * 10) / 10,
      Math.round(confidenceInterval[1] * 10) / 10
    ],
    confidenceLevel,
    lowConfidence,
    coefficientOfVariation: Math.round(cv * 100) / 100,
    studyCount: studies.length,
    totalSampleSize,
    aggregationMethod,
    sources
  };
}

/**
 * Research all benchmarks
 */
async function researchAllBenchmarks() {
  const benchmarks = {};

  // Research GitHub Copilot benchmarks
  console.log('\n📊 Researching GitHub Copilot Benchmarks...');
  const ghCopilotStudies = await researchProductivityBenchmarks('GitHub Copilot', 'software engineer');
  benchmarks.githubCopilot = {
    software_engineer: calculateWeightedStats(ghCopilotStudies)
  };

  // Research M365 Copilot benchmarks for different roles
  console.log('\n📊 Researching M365 Copilot Benchmarks...');

  const roles = ['software_engineer', 'sales', 'marketing', 'customer_success'];
  benchmarks.m365Copilot = {};

  for (const role of roles) {
    const roleDisplay = role.replace('_', ' ');
    const m365Studies = await researchProductivityBenchmarks('Microsoft 365 Copilot', roleDisplay);
    benchmarks.m365Copilot[role] = calculateWeightedStats(m365Studies);
  }

  // Add default fallback with low confidence
  benchmarks.m365Copilot.default = {
    hoursSavedPerMonth: null,
    confidenceInterval: null,
    confidenceLevel: 'low',
    lowConfidence: true,
    coefficientOfVariation: null,
    studyCount: 0,
    totalSampleSize: 0,
    aggregationMethod: null,
    sources: []
  };

  // Research Claude Code Premium benchmarks
  console.log('\n📊 Researching Claude Code Benchmarks...');
  const claudeCodeStudies = await researchProductivityBenchmarks('Claude Code Premium', 'software engineer');
  benchmarks.claudeCode = {
    software_engineer: calculateWeightedStats(claudeCodeStudies)
  };

  // Research Claude Enterprise benchmarks for different roles
  console.log('\n📊 Researching Claude Enterprise Benchmarks...');
  benchmarks.claudeEnterprise = {};

  for (const role of roles) {
    const roleDisplay = role.replace('_', ' ');
    const claudeEnterpriseStudies = await researchProductivityBenchmarks('Claude Enterprise', roleDisplay);
    benchmarks.claudeEnterprise[role] = calculateWeightedStats(claudeEnterpriseStudies);
  }

  // Add default fallback with low confidence
  benchmarks.claudeEnterprise.default = {
    hoursSavedPerMonth: null,
    confidenceInterval: null,
    confidenceLevel: 'low',
    lowConfidence: true,
    coefficientOfVariation: null,
    studyCount: 0,
    totalSampleSize: 0,
    aggregationMethod: null,
    sources: []
  };

  return benchmarks;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔬 Industry Benchmark Research Script');
  console.log('=====================================\n');

  // Check for --force flag
  const forceResearch = process.argv.includes('--force');

  // Load current config
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('❌ Error: roi_config.json not found');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

  // Check cache
  if (!forceResearch && !isCacheExpired(config)) {
    const expiryDate = new Date(config.industryBenchmarks.cacheExpiry);
    const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

    console.log(`✅ Cache is valid (${daysRemaining} days remaining)`);
    console.log('   Use --force flag to refresh anyway\n');
    return;
  }

  console.log('🔄 Cache expired or missing, starting research...\n');

  // Perform research
  const benchmarks = await researchAllBenchmarks();

  // Update config with new benchmarks
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setDate(expiryDate.getDate() + CACHE_TTL_DAYS);

  config.industryBenchmarks = {
    ...benchmarks,
    cacheExpiry: expiryDate.toISOString(),
    lastUpdated: now.toISOString()
  };

  // Write updated config
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

  console.log('\n✅ Research complete!');
  console.log(`   Updated: ${CONFIG_PATH}`);
  console.log(`   Cache expires: ${expiryDate.toLocaleDateString()}\n`);

  // Summary
  console.log('📊 Summary:');
  console.log(`   GitHub Copilot (software_engineer): ${benchmarks.githubCopilot.software_engineer.studyCount} studies, ${benchmarks.githubCopilot.software_engineer.hoursSavedPerMonth || 'N/A'} hrs/mo`);
  Object.keys(benchmarks.m365Copilot).forEach(role => {
    if (role !== 'default') {
      const data = benchmarks.m365Copilot[role];
      console.log(`   M365 Copilot (${role}): ${data.studyCount} studies, ${data.hoursSavedPerMonth || 'N/A'} hrs/mo`);
    }
  });
  console.log(`   Claude Code (software_engineer): ${benchmarks.claudeCode.software_engineer.studyCount} studies, ${benchmarks.claudeCode.software_engineer.hoursSavedPerMonth || 'N/A'} hrs/mo`);
  Object.keys(benchmarks.claudeEnterprise).forEach(role => {
    if (role !== 'default') {
      const data = benchmarks.claudeEnterprise[role];
      console.log(`   Claude Enterprise (${role}): ${data.studyCount} studies, ${data.hoursSavedPerMonth || 'N/A'} hrs/mo`);
    }
  });
  console.log();
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
