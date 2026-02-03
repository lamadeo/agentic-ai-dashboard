#!/usr/bin/env node

/**
 * Replace company references in code
 * TechCo Inc → TechCo Inc
 * techco → techco
 */

const fs = require('fs');
const path = require('path');

const DIRS_TO_PROCESS = ['app', 'scripts', 'docs', '.claude', 'public', '__tests__', 'backups'];
const EXTENSIONS = ['.js', '.jsx', '.json', '.md', '.txt', '.ts', '.tsx', '.css', '.html'];

let filesProcessed = 0;
let filesModified = 0;
let totalReplacements = 0;

function* walkDirectory(dir) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        if (!['node_modules', '.git', '.next', 'dist', 'build', 'data'].includes(file.name)) {
          yield* walkDirectory(fullPath);
        }
      } else {
        yield fullPath;
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
}

function replaceInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileReplacements = 0;

    // Perform replacements
    const replacements = [
      { from: 'TechCo Inc', to: 'TechCo Inc' },
      { from: 'TechCo Inc', to: 'TechCo Inc' },
      { from: 'techco', to: 'techco' },
      { from: 'TECHCO', to: 'TECHCO' },
    ];

    for (const { from, to } of replacements) {
      const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = (newContent.match(regex) || []).length;
      if (matches > 0) {
        newContent = newContent.replace(regex, to);
        fileReplacements += matches;
      }
    }

    if (fileReplacements > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      filesModified++;
      totalReplacements += fileReplacements;
    }

    filesProcessed++;
    if (filesProcessed % 50 === 0) {
      process.stdout.write(`\r   Processed ${filesProcessed} files...`);
    }

    return fileReplacements;
  } catch (error) {
    // Skip files we can't process
    return 0;
  }
}

console.log('🔄 Replacing company references in code...\n');

for (const dir of DIRS_TO_PROCESS) {
  const fullDir = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullDir)) continue;

  for (const filePath of walkDirectory(fullDir)) {
    const ext = path.extname(filePath);
    if (EXTENSIONS.includes(ext)) {
      replaceInFile(filePath);
    }
  }
}

console.log(`\r   Processed ${filesProcessed} files ✓\n`);
console.log('✅ Replacement complete!\n');
console.log(`📊 Statistics:`);
console.log(`   - Files processed: ${filesProcessed}`);
console.log(`   - Files modified: ${filesModified}`);
console.log(`   - Total replacements: ${totalReplacements}\n`);
