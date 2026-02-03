/**
 * Claude Enterprise Data Ingestor
 *
 * Ingests Claude Enterprise monthly export data from ZIP files.
 *
 * Input:  ZIP files matching pattern in /data/
 *         - claude-ent-data*.zip containing:
 *           - conversations.json
 *           - projects.json
 *           - users.json
 *
 * Output: Normalized data structure with:
 *         - Monthly conversations data
 *         - Projects data
 *         - User data with email mappings
 *
 * Dependencies: child_process (for unzip), fs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Extract ZIP file to temporary directory
 * @param {string} zipPath - Path to ZIP file
 * @param {string} extractPath - Path to extract to
 * @private
 */
function extractZipFile(zipPath, extractPath) {
  // Create extraction directory
  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath, { recursive: true });
  }

  // Extract ZIP file
  try {
    execSync(`unzip -q -o "${zipPath}" -d "${extractPath}"`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.warn(`   ⚠️  Failed to extract ${path.basename(zipPath)}:`, error.message);
    return false;
  }
}

/**
 * Read JSON file safely
 * @param {string} filePath - Path to JSON file
 * @returns {Array|null} Parsed JSON or null if error
 * @private
 */
function readJSONFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    console.warn(`   ⚠️  Failed to read ${path.basename(filePath)}:`, error.message);
  }
  return null;
}

/**
 * Enrich projects with additional metadata for analytics
 * @param {Array} projects - Raw projects array
 * @param {Map} userEmailLookup - UUID to email mapping
 * @returns {Object} { projectsEnriched, creatorUUIDtoEmail }
 * @private
 */
function enrichProjects(projects, userEmailLookup) {
  const creatorUUIDtoEmail = new Map();

  const projectsEnriched = projects.map(project => {
    // Extract creator info
    const creatorUuid = project.creator?.uuid;
    const creatorFullName = project.creator?.full_name || 'Unknown';

    // Map creator UUID to email if available
    if (creatorUuid && userEmailLookup.has(creatorUuid)) {
      creatorUUIDtoEmail.set(creatorUuid, userEmailLookup.get(creatorUuid));
    }

    // Count documents attached to project
    const docCount = project.docs?.length || 0;

    // Check for prompt template
    const hasPromptTemplate = !!project.prompt_template && project.prompt_template.trim().length > 0;
    const promptTemplateLength = hasPromptTemplate ? project.prompt_template.trim().length : 0;

    return {
      uuid: project.uuid,
      name: project.name || 'Untitled',
      description: project.description || '',
      isPrivate: project.is_private || false,
      isStarterProject: project.is_starter_project || false,
      hasPromptTemplate,
      promptTemplateLength,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      creator: {
        uuid: creatorUuid,
        fullName: creatorFullName
      },
      docCount,
      // Preserve original docs array for potential deeper analysis
      docs: project.docs || []
    };
  });

  return { projectsEnriched, creatorUUIDtoEmail };
}

/**
 * Ingest Claude Enterprise data
 * @param {Object} options - Configuration options
 * @param {string} options.dataDir - Data directory path (default: '../../../data')
 * @param {string} options.tmpDir - Temporary extraction directory (default: '../../../data/claude-monthly-data')
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Promise<Object>} Normalized Claude Enterprise data structure
 * @throws {Error} If required files not found or parsing fails
 */
async function ingestClaudeEnterprise(options = {}) {
  const {
    dataDir = path.join(__dirname, '../../../data'),
    tmpDir = path.join(__dirname, '../../../data/claude-monthly-data'),
    verbose = true
  } = options;

  if (verbose) console.log('\n📊 Parsing Claude Enterprise data...\n');

  try {
    // 1. Find all Claude Enterprise exports (ZIP files OR uncompressed folders)
    // Supports both formats: .zip files and folders starting with 'claude-ent-data'
    const findExports = (dir) => {
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir)
        .filter(entry => {
          if (!entry.startsWith('claude-ent-data')) return false;
          const fullPath = path.join(dir, entry);
          const stat = fs.statSync(fullPath);
          // Accept ZIP files or directories (uncompressed exports)
          return entry.endsWith('.zip') || stat.isDirectory();
        })
        .map(entry => {
          const fullPath = path.join(dir, entry);
          const isZip = entry.endsWith('.zip');
          return { file: entry, dir, isZip, fullPath };
        });
    };

    const subfolderDir = path.join(dataDir, 'claude-enterprise');
    const exportsFromRoot = findExports(dataDir);
    const exportsFromSubfolder = findExports(subfolderDir);

    // Combine and dedupe (prefer subfolder if same filename exists in both)
    // For deduping, use base name without .zip extension
    const fileMap = new Map();
    exportsFromRoot.forEach(f => {
      const baseName = f.file.replace('.zip', '');
      fileMap.set(baseName, f);
    });
    exportsFromSubfolder.forEach(f => {
      const baseName = f.file.replace('.zip', '');
      fileMap.set(baseName, f); // Subfolder overwrites root
    });

    const claudeExportsWithPaths = Array.from(fileMap.values()).sort((a, b) => a.file.localeCompare(b.file));
    const claudeExportNames = claudeExportsWithPaths.map(f => f.file);

    if (verbose) {
      const fromRoot = exportsFromRoot.length;
      const fromSub = exportsFromSubfolder.length;
      const zipCount = claudeExportsWithPaths.filter(e => e.isZip).length;
      const folderCount = claudeExportsWithPaths.filter(e => !e.isZip).length;
      console.log(`   Found ${claudeExportNames.length} Claude Enterprise exports (${zipCount} ZIPs, ${folderCount} folders)${fromSub > 0 ? ` from claude-enterprise/` : ''}`);
    }

    if (claudeExportNames.length === 0) {
      throw new Error('No Claude Enterprise exports found (ZIP files or folders)');
    }

    // 2. Create temporary directory for ZIP extraction
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // 3. Process exports and collect data
    const monthlyConversations = [];
    const monthlyProjects = [];
    let allUsers = [];

    claudeExportsWithPaths.forEach(({ file: exportName, dir: exportDir, isZip, fullPath }) => {
      let dataPath;

      if (isZip) {
        // ZIP file: extract first, then read from extracted folder
        const extractPath = path.join(tmpDir, exportName.replace('.zip', ''));
        const extracted = extractZipFile(fullPath, extractPath);
        if (!extracted) return;
        dataPath = extractPath;
      } else {
        // Folder: check for nested data-* subfolder (January 2026+ export format)
        dataPath = fullPath;

        // If conversations.json doesn't exist at top level, check for data-* subfolder
        if (!fs.existsSync(path.join(dataPath, 'conversations.json'))) {
          const entries = fs.readdirSync(fullPath, { withFileTypes: true });
          const dataSubfolder = entries.find(e => e.isDirectory() && e.name.startsWith('data-'));
          if (dataSubfolder) {
            dataPath = path.join(fullPath, dataSubfolder.name);
          }
        }
      }

      if (verbose) {
        console.log(`   Processing: ${exportName}${isZip ? '' : ' (folder)'}`);
      }

      // Read conversations.json
      const conversations = readJSONFile(path.join(dataPath, 'conversations.json'));
      if (conversations) {
        monthlyConversations.push(...conversations);
      }

      // Read projects.json - always overwrite with latest file's data
      // Later exports have the most complete project list
      const projects = readJSONFile(path.join(dataPath, 'projects.json'));
      if (projects) {
        monthlyProjects.length = 0; // Clear previous
        monthlyProjects.push(...projects);
      }

      // Read users.json - merge from all files to ensure complete user mapping
      // Later exports may have users who joined after earlier exports
      const users = readJSONFile(path.join(dataPath, 'users.json'));
      if (users) {
        // Merge: add any new users not already in allUsers
        const existingUUIDs = new Set(allUsers.map(u => u.uuid));
        const newUsers = users.filter(u => !existingUUIDs.has(u.uuid));
        allUsers.push(...newUsers);
      }
    });

    if (verbose) {
      console.log(`   Loaded ${monthlyConversations.length} conversations, ${monthlyProjects.length} projects, ${allUsers.length} users`);
    }

    // 4. Build user email lookup
    const userEmailLookup = new Map();
    allUsers.forEach(user => {
      if (user.uuid && user.email_address) {
        userEmailLookup.set(user.uuid, user.email_address.toLowerCase().trim());
      }
    });

    // 5. Enrich projects with additional metadata
    const { projectsEnriched, creatorUUIDtoEmail } = enrichProjects(monthlyProjects, userEmailLookup);

    if (verbose) {
      const withDocs = projectsEnriched.filter(p => p.docCount > 0).length;
      const withPrompts = projectsEnriched.filter(p => p.hasPromptTemplate).length;
      console.log(`   Projects enriched: ${withDocs} with docs, ${withPrompts} with prompt templates`);
    }

    // 6. Return normalized structure
    return {
      // Raw data for processors
      conversations: monthlyConversations,
      projects: monthlyProjects,
      users: allUsers,
      userEmailLookup,

      // Enriched projects data for projects analytics
      projectsEnriched,
      creatorUUIDtoEmail,

      // Metrics
      metrics: {
        totalConversations: monthlyConversations.length,
        totalProjects: monthlyProjects.length,
        totalUsers: allUsers.length,
        projectsWithDocs: projectsEnriched.filter(p => p.docCount > 0).length,
        projectsWithPrompts: projectsEnriched.filter(p => p.hasPromptTemplate).length
      },

      // Metadata
      metadata: {
        filesProcessed: claudeExportNames.length,
        fileNames: claudeExportNames,
        tmpDir,
        ingestedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`❌ Error ingesting Claude Enterprise data:`, error.message);
    throw error; // Let orchestrator handle fallback
  }
}

module.exports = { ingestClaudeEnterprise };
