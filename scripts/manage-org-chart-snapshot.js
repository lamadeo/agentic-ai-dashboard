#!/usr/bin/env node

/**
 * Org Chart Snapshot Management
 *
 * Manages org chart snapshots for historical tracking and comparison.
 *
 * Commands:
 *   save <date>       Save current org chart as a snapshot
 *   list              List all available snapshots
 *   compare <old> <new>  Compare two snapshots
 *   latest            Show info about the latest snapshot
 *
 * Usage:
 *   node scripts/manage-org-chart-snapshot.js save 2026-01-21
 *   node scripts/manage-org-chart-snapshot.js list
 *   node scripts/manage-org-chart-snapshot.js compare 2025-12-12 2026-01-21
 *   node scripts/manage-org-chart-snapshot.js latest
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const snapshotDir = path.join(__dirname, '..', 'docs', 'data', 'org-chart-snapshots');
const currentOrgChartPath = path.join(__dirname, '..', 'docs', 'data', 'techco_org_chart.json');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Ensure snapshot directory exists
if (!fs.existsSync(snapshotDir)) {
  fs.mkdirSync(snapshotDir, { recursive: true });
  console.log(`✅ Created snapshots directory: ${snapshotDir}`);
}

/**
 * Save current org chart as a snapshot
 */
function saveSnapshot(date) {
  if (!date) {
    console.error('❌ Error: Date required for save command');
    console.error('Usage: node scripts/manage-org-chart-snapshot.js save YYYY-MM-DD');
    process.exit(1);
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error('❌ Error: Date must be in YYYY-MM-DD format');
    process.exit(1);
  }

  // Check if current org chart exists
  if (!fs.existsSync(currentOrgChartPath)) {
    console.error(`❌ Error: Current org chart not found at ${currentOrgChartPath}`);
    process.exit(1);
  }

  // Load and validate current org chart
  const orgChart = JSON.parse(fs.readFileSync(currentOrgChartPath, 'utf8'));
  const totalEmployees = orgChart.organization?.totalEmployees || 0;
  const orgName = orgChart.organization?.name || 'Unknown';

  // Create snapshot
  const snapshotPath = path.join(snapshotDir, `techco_org_chart_${date}.json`);

  if (fs.existsSync(snapshotPath)) {
    console.warn(`⚠️  Snapshot already exists for ${date}`);
    console.log(`   Overwriting: ${snapshotPath}`);
  }

  fs.copyFileSync(currentOrgChartPath, snapshotPath);

  console.log(`\n✅ Snapshot saved successfully!`);
  console.log(`   Date: ${date}`);
  console.log(`   Organization: ${orgName}`);
  console.log(`   Employees: ${totalEmployees}`);
  console.log(`   Location: ${snapshotPath}\n`);
}

/**
 * List all snapshots
 */
function listSnapshots() {
  const files = fs.readdirSync(snapshotDir)
    .filter(f => f.startsWith('techco_org_chart_') && f.endsWith('.json'))
    .filter(f => !f.includes('comparison_'))
    .sort();

  if (files.length === 0) {
    console.log('No snapshots found.');
    return;
  }

  console.log(`\n📊 Available Org Chart Snapshots (${files.length}):\n`);

  files.forEach(file => {
    const filePath = path.join(snapshotDir, file);
    const dateMatch = file.match(/techco_org_chart_(\d{4}-\d{2}-\d{2})\.json/);
    const date = dateMatch ? dateMatch[1] : 'Unknown';

    const orgChart = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const totalEmployees = orgChart.organization?.totalEmployees || 0;
    const orgName = orgChart.organization?.name || 'Unknown';
    const lastUpdated = orgChart.organization?.lastUpdated || 'Unknown';

    console.log(`   📅 ${date}`);
    console.log(`      Organization: ${orgName}`);
    console.log(`      Employees: ${totalEmployees}`);
    console.log(`      Last Updated: ${lastUpdated}`);
    console.log(`      File: ${file}\n`);
  });
}

/**
 * Compare two snapshots
 */
function compareSnapshots(oldDate, newDate) {
  if (!oldDate || !newDate) {
    console.error('❌ Error: Two dates required for compare command');
    console.error('Usage: node scripts/manage-org-chart-snapshot.js compare YYYY-MM-DD YYYY-MM-DD');
    process.exit(1);
  }

  console.log(`\n🔍 Comparing snapshots: ${oldDate} → ${newDate}\n`);

  // Run comparison script using spawnSync (safer than exec)
  const compareScript = path.join(__dirname, 'compare-org-charts.js');
  const result = spawnSync('node', [compareScript, oldDate, newDate], {
    stdio: 'inherit',
    encoding: 'utf8'
  });

  if (result.error) {
    console.error('❌ Error running comparison script:', result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error('❌ Comparison script failed');
    process.exit(result.status);
  }
}

/**
 * Show latest snapshot info
 */
function showLatest() {
  const files = fs.readdirSync(snapshotDir)
    .filter(f => f.startsWith('techco_org_chart_') && f.endsWith('.json'))
    .filter(f => !f.includes('comparison_'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log('No snapshots found.');
    return;
  }

  const latestFile = files[0];
  const filePath = path.join(snapshotDir, latestFile);
  const dateMatch = latestFile.match(/techco_org_chart_(\d{4}-\d{2}-\d{2})\.json/);
  const date = dateMatch ? dateMatch[1] : 'Unknown';

  const orgChart = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const totalEmployees = orgChart.organization?.totalEmployees || 0;
  const orgName = orgChart.organization?.name || 'Unknown';
  const lastUpdated = orgChart.organization?.lastUpdated || 'Unknown';

  console.log(`\n📊 Latest Org Chart Snapshot:\n`);
  console.log(`   Date: ${date}`);
  console.log(`   Organization: ${orgName}`);
  console.log(`   Employees: ${totalEmployees}`);
  console.log(`   Last Updated: ${lastUpdated}`);
  console.log(`   Location: ${filePath}\n`);

  // Check if there's a previous snapshot to compare
  if (files.length > 1) {
    const previousFile = files[1];
    const previousDateMatch = previousFile.match(/techco_org_chart_(\d{4}-\d{2}-\d{2})\.json/);
    const previousDate = previousDateMatch ? previousDateMatch[1] : null;

    if (previousDate) {
      console.log(`💡 Tip: Compare with previous snapshot:`);
      console.log(`   node scripts/manage-org-chart-snapshot.js compare ${previousDate} ${date}\n`);
    }
  }
}

// Command routing
switch (command) {
  case 'save':
    saveSnapshot(args[1]);
    break;

  case 'list':
    listSnapshots();
    break;

  case 'compare':
    compareSnapshots(args[1], args[2]);
    break;

  case 'latest':
    showLatest();
    break;

  case undefined:
  case 'help':
  case '--help':
  case '-h':
    console.log(`
Org Chart Snapshot Management

Commands:
  save <date>         Save current org chart as a snapshot
  list                List all available snapshots
  compare <old> <new> Compare two snapshots
  latest              Show info about the latest snapshot
  help                Show this help message

Examples:
  node scripts/manage-org-chart-snapshot.js save 2026-01-21
  node scripts/manage-org-chart-snapshot.js list
  node scripts/manage-org-chart-snapshot.js compare 2025-12-12 2026-01-21
  node scripts/manage-org-chart-snapshot.js latest
`);
    break;

  default:
    console.error(`❌ Unknown command: ${command}`);
    console.error('Run with "help" to see available commands');
    process.exit(1);
}
