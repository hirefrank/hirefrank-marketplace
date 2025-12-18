#!/usr/bin/env node
/**
 * Feedback Codifier Tool
 *
 * The Learning Engine - validates and stores patterns in the knowledge base.
 * This is a "Hard Tool" that ensures only validated patterns are codified.
 *
 * Usage:
 *   node codify-feedback.js --pattern "Use DO for rate limiting"
 *   node codify-feedback.js --pattern "..." --category runtime
 *   node codify-feedback.js --list
 *   node codify-feedback.js --validate "pattern to check"
 *
 * Output:
 *   JSON with validation status and storage location
 */

const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knowledge');
const PATTERNS_FILE = path.join(KNOWLEDGE_DIR, 'cloudflare-patterns.md');
const GUIDELINES_FILE = path.join(KNOWLEDGE_DIR, 'guidelines.md');

// Categories for pattern organization
const CATEGORIES = {
  runtime: 'Runtime Compatibility',
  resource: 'Resource Selection',
  binding: 'Binding Patterns',
  edge: 'Edge Optimization',
  security: 'Security',
  ui: 'UI/Component Patterns'
};

// Invalid patterns that should never be codified
const REJECTION_PATTERNS = [
  { pattern: /next\.?js/i, reason: 'Use Tanstack Start instead' },
  { pattern: /express|fastify|koa|nestjs/i, reason: 'Use Hono instead' },
  { pattern: /langchain/i, reason: 'Use Vercel AI SDK instead' },
  { pattern: /cloudflare pages/i, reason: 'Use Workers with static assets' },
  { pattern: /process\.env/i, reason: 'Use env parameter' },
  { pattern: /require\s*\(/i, reason: 'Use ES modules import' },
  { pattern: /wrangler\.toml.*(add|modify|edit)/i, reason: 'Do not codify config modifications' }
];

function ensureKnowledgeDir() {
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
  }

  // Initialize patterns file if doesn't exist
  if (!fs.existsSync(PATTERNS_FILE)) {
    fs.writeFileSync(PATTERNS_FILE, `# Cloudflare Patterns Knowledge Base

This file contains validated patterns for Cloudflare Workers development.
Patterns are validated against official documentation before being added.

---

`);
  }

  // Initialize guidelines file if doesn't exist
  if (!fs.existsSync(GUIDELINES_FILE)) {
    fs.writeFileSync(GUIDELINES_FILE, `# Development Guidelines

Validated best practices for edge-first development.

---

`);
  }
}

function validatePattern(patternText) {
  const result = {
    valid: true,
    warnings: [],
    rejectionReason: null
  };

  // Check against rejection patterns
  for (const { pattern, reason } of REJECTION_PATTERNS) {
    if (pattern.test(patternText)) {
      result.valid = false;
      result.rejectionReason = reason;
      return result;
    }
  }

  // Add warnings for patterns that might need MCP validation
  const needsValidation = [
    { pattern: /kv|r2|d1|durable/i, note: 'Validate resource selection against Cloudflare docs' },
    { pattern: /shadcn|tailwind/i, note: 'Validate against shadcn MCP server' },
    { pattern: /security|secret|auth/i, note: 'Review security implications carefully' }
  ];

  for (const { pattern, note } of needsValidation) {
    if (pattern.test(patternText)) {
      result.warnings.push(note);
    }
  }

  return result;
}

function formatPattern(patternText, category, source) {
  const timestamp = new Date().toISOString().split('T')[0];
  const categoryName = CATEGORIES[category] || category;

  return `
## Pattern: ${patternText.slice(0, 50)}${patternText.length > 50 ? '...' : ''}

**Category**: ${categoryName}
**Added**: ${timestamp}
**Source**: ${source || 'User feedback'}

### Description
${patternText}

### Validation
- Status: Pending MCP validation
- Run: \`context7 search "${patternText.slice(0, 30)}"\` to verify

---
`;
}

function addPattern(patternText, category = 'runtime', source = 'feedback') {
  ensureKnowledgeDir();

  const validation = validatePattern(patternText);

  if (!validation.valid) {
    return {
      success: false,
      action: 'rejected',
      reason: validation.rejectionReason,
      pattern: patternText
    };
  }

  const formatted = formatPattern(patternText, category, source);
  fs.appendFileSync(PATTERNS_FILE, formatted);

  return {
    success: true,
    action: 'added',
    file: PATTERNS_FILE,
    category: CATEGORIES[category] || category,
    warnings: validation.warnings,
    note: validation.warnings.length > 0
      ? 'Pattern added with warnings - validate with MCP'
      : 'Pattern added successfully'
  };
}

function listPatterns() {
  ensureKnowledgeDir();

  if (!fs.existsSync(PATTERNS_FILE)) {
    return { patterns: [], count: 0 };
  }

  const content = fs.readFileSync(PATTERNS_FILE, 'utf-8');
  const patterns = [];

  // Extract pattern headers
  const patternRegex = /## Pattern: (.+)/g;
  let match;
  while ((match = patternRegex.exec(content)) !== null) {
    patterns.push(match[1]);
  }

  return {
    file: PATTERNS_FILE,
    count: patterns.length,
    patterns
  };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(JSON.stringify({
      usage: {
        add: 'node codify-feedback.js --pattern "pattern text" [--category runtime|resource|binding|edge|security|ui]',
        list: 'node codify-feedback.js --list',
        validate: 'node codify-feedback.js --validate "pattern to check"'
      },
      categories: CATEGORIES
    }, null, 2));
    return;
  }

  if (args.includes('--list')) {
    console.log(JSON.stringify(listPatterns(), null, 2));
    return;
  }

  if (args.includes('--validate')) {
    const validateIndex = args.indexOf('--validate');
    const pattern = args[validateIndex + 1];
    if (!pattern) {
      console.log(JSON.stringify({ error: 'Pattern text required after --validate' }, null, 2));
      process.exit(1);
    }
    console.log(JSON.stringify(validatePattern(pattern), null, 2));
    return;
  }

  if (args.includes('--pattern')) {
    const patternIndex = args.indexOf('--pattern');
    const pattern = args[patternIndex + 1];

    if (!pattern) {
      console.log(JSON.stringify({ error: 'Pattern text required after --pattern' }, null, 2));
      process.exit(1);
    }

    let category = 'runtime';
    if (args.includes('--category')) {
      const catIndex = args.indexOf('--category');
      category = args[catIndex + 1] || 'runtime';
    }

    const result = addPattern(pattern, category, 'CLI input');
    console.log(JSON.stringify(result, null, 2));

    if (!result.success) {
      process.exit(1);
    }
    return;
  }

  console.log(JSON.stringify({ error: 'Unknown command. Use --help for usage.' }, null, 2));
  process.exit(1);
}

main();
