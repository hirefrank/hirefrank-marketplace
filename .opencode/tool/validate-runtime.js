#!/usr/bin/env node
/**
 * Workers Runtime Validator
 *
 * Scans source files for Node.js API usage that will fail in Workers.
 * This is a "Hard Tool" - deterministic grep-based detection that never misses.
 *
 * Usage:
 *   node validate-runtime.js [directory]
 *   node validate-runtime.js src/
 *
 * Output:
 *   JSON array of violations with file, line, violation type, and suggested fix
 */

const fs = require('fs');
const path = require('path');

// Forbidden patterns that will break in Workers
const FORBIDDEN_PATTERNS = [
  // Node.js built-in modules
  {
    pattern: /import\s+.*\s+from\s+['"]fs['"]/g,
    type: 'node-api',
    severity: 'critical',
    message: 'fs module not available in Workers',
    fix: 'Use R2 for file storage or KV for key-value data'
  },
  {
    pattern: /import\s+.*\s+from\s+['"]path['"]/g,
    type: 'node-api',
    severity: 'critical',
    message: 'path module not available in Workers',
    fix: 'Use URL API for path manipulation'
  },
  {
    pattern: /import\s+.*\s+from\s+['"]os['"]/g,
    type: 'node-api',
    severity: 'critical',
    message: 'os module not available in Workers',
    fix: 'Workers run in V8 isolates, not OS processes'
  },
  {
    pattern: /import\s+.*\s+from\s+['"]buffer['"]/g,
    type: 'node-api',
    severity: 'critical',
    message: 'Buffer not available in Workers',
    fix: 'Use Uint8Array or ArrayBuffer instead'
  },
  {
    pattern: /import\s+crypto\s+from\s+['"]crypto['"]/g,
    type: 'node-api',
    severity: 'critical',
    message: 'Node crypto module not available',
    fix: 'Use Web Crypto API: crypto.subtle'
  },

  // process.env usage
  {
    pattern: /process\.env\./g,
    type: 'env-access',
    severity: 'critical',
    message: 'process.env not available in Workers',
    fix: 'Use env parameter: env.VARIABLE_NAME'
  },
  {
    pattern: /process\.exit/g,
    type: 'process-api',
    severity: 'critical',
    message: 'process.exit not available in Workers',
    fix: 'Return Response with appropriate status code'
  },

  // CommonJS
  {
    pattern: /require\s*\(/g,
    type: 'commonjs',
    severity: 'critical',
    message: 'require() not supported in Workers',
    fix: 'Use ES modules: import { x } from "module"'
  },
  {
    pattern: /module\.exports/g,
    type: 'commonjs',
    severity: 'critical',
    message: 'module.exports not supported in Workers',
    fix: 'Use ES modules: export default'
  },

  // Buffer usage (even without import)
  {
    pattern: /Buffer\.from\(/g,
    type: 'node-api',
    severity: 'critical',
    message: 'Buffer.from() not available',
    fix: 'Use: new Uint8Array() or new TextEncoder().encode()'
  },
  {
    pattern: /Buffer\.alloc\(/g,
    type: 'node-api',
    severity: 'critical',
    message: 'Buffer.alloc() not available',
    fix: 'Use: new Uint8Array(size)'
  },

  // Synchronous operations (likely blocking)
  {
    pattern: /readFileSync|writeFileSync|existsSync/g,
    type: 'sync-io',
    severity: 'critical',
    message: 'Synchronous file operations not available',
    fix: 'Workers have no filesystem access - use KV/R2'
  },

  // Missing async
  {
    pattern: /\.get\([^)]*\)(?!\s*\.then|\s*;?\s*\/\/\s*async)/g,
    type: 'missing-async',
    severity: 'warning',
    message: 'KV/R2 operations require await',
    fix: 'Add await: const data = await env.KV.get(key)'
  }
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

function scanFile(filePath) {
  const violations = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    FORBIDDEN_PATTERNS.forEach(({ pattern, type, severity, message, fix }) => {
      const regex = new RegExp(pattern.source, pattern.flags);
      if (regex.test(line)) {
        violations.push({
          file: filePath,
          line: index + 1,
          code: line.trim(),
          type,
          severity,
          message,
          fix
        });
      }
    });
  });

  return violations;
}

function scanDirectory(dirPath) {
  const violations = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!file.startsWith('.') && file !== 'node_modules') {
          walk(filePath);
        }
      } else if (SCAN_EXTENSIONS.some(ext => file.endsWith(ext))) {
        violations.push(...scanFile(filePath));
      }
    }
  }

  walk(dirPath);
  return violations;
}

function main() {
  const targetDir = process.argv[2] || 'src';
  const violations = scanDirectory(targetDir);

  // Output as JSON for easy parsing
  const result = {
    scanned: targetDir,
    timestamp: new Date().toISOString(),
    total: violations.length,
    critical: violations.filter(v => v.severity === 'critical').length,
    warnings: violations.filter(v => v.severity === 'warning').length,
    violations
  };

  console.log(JSON.stringify(result, null, 2));

  // Exit with error code if critical violations found
  if (result.critical > 0) {
    process.exit(1);
  }
}

main();
