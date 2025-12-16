#!/usr/bin/env node
const { existsSync, unlinkSync } = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');

function removeIfExists(filename) {
  const target = path.join(root, filename);
  if (existsSync(target)) {
    unlinkSync(target);
    console.log(`Removed ${filename}`);
  }
}

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

removeIfExists('app.db-wal');
removeIfExists('app.db-shm');

run('npm run db:push');
run('node scripts/seed-admin.cjs');
