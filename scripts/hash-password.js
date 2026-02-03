#!/usr/bin/env node

/**
 * Utility script to hash a password for authentication
 * Usage: node scripts/hash-password.js
 *
 * This will read TEMP_PWD from .env and generate a bcrypt hash
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = process.env.TEMP_PWD;

  if (!password) {
    console.error('❌ Error: TEMP_PWD not found in .env file');
    process.exit(1);
  }

  console.log(`\n🔐 Hashing password from TEMP_PWD...`);

  // Generate salt and hash (10 rounds is standard)
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  console.log(`\n✅ Password hashed successfully!`);
  console.log(`\nBcrypt hash:\n${hash}`);

  console.log(`\n📝 Update your .env file:`);
  console.log(`TEMP_PWD_HASH=${hash}`);

  console.log(`\n🔒 Add to GitHub Secrets:`);
  console.log(`Secret name: TEMP_PWD_HASH`);
  console.log(`Secret value: ${hash}`);

  // Verify the hash works
  const isValid = await bcrypt.compare(password, hash);
  console.log(`\n✓ Hash verification: ${isValid ? 'PASSED' : 'FAILED'}`);
}

hashPassword().catch(console.error);
