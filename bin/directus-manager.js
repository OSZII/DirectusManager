#!/usr/bin/env node

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = join(__dirname, '..');

// Resolve the electron binary from the package's own dependencies
const require = createRequire(import.meta.url);
const electronPath = require('electron');

const child = spawn(electronPath, [appRoot], {
  stdio: 'inherit',
  env: { ...process.env, ELECTRON_IS_DEV: '0' },
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
