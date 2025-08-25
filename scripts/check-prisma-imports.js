#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Simple script to check for Prisma imports in client components
// Run with: node scripts/check-prisma-imports.js

const checkPrismaImports = () => {
  const files = glob.sync('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**', 'scripts/**'],
    cwd: process.cwd()
  });

  let hasErrors = false;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if it's a client component
    if (content.includes('"use client"') || content.includes("'use client'")) {
      // Check for Prisma imports
      if (content.includes('@/lib/db') || 
          content.includes('@prisma/client') || 
          content.includes('prisma')) {
        
        console.error(`❌ Error: Client component "${file}" imports Prisma!`);
        console.error('   Client components cannot directly access the database.');
        console.error('   Use API routes or Server Actions instead.\n');
        hasErrors = true;
      }
    }
  });

  if (!hasErrors) {
    console.log('✅ No Prisma imports found in client components!');
  } else {
    process.exit(1);
  }
};

// Check if glob is installed
try {
  require.resolve('glob');
  checkPrismaImports();
} catch (e) {
  console.log('Installing glob for file matching...');
  require('child_process').execSync('npm install --no-save glob', { stdio: 'inherit' });
  checkPrismaImports();
}