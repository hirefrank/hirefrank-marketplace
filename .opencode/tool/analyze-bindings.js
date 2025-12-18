#!/usr/bin/env node
/**
 * Binding Context Analyzer
 *
 * Parses wrangler.toml and generates TypeScript Env interface.
 * This is a "Hard Tool" - deterministic parsing that provides ground truth.
 *
 * Usage:
 *   node analyze-bindings.js [wrangler.toml path]
 *   node analyze-bindings.js ./wrangler.toml
 *
 * Output:
 *   JSON with bindings summary and generated TypeScript interface
 */

const fs = require('fs');
const path = require('path');

// Binding type mappings
const TYPE_MAP = {
  kv_namespaces: 'KVNamespace',
  r2_buckets: 'R2Bucket',
  d1_databases: 'D1Database',
  durable_objects: 'DurableObjectNamespace',
  services: 'Fetcher',
  queues: 'Queue',
  vectorize: 'VectorizeIndex',
  ai: 'Ai',
  analytics_engine: 'AnalyticsEngineDataset',
  hyperdrive: 'Hyperdrive'
};

function parseToml(content) {
  // Simple TOML parser for wrangler.toml
  // Handles the common patterns used in Cloudflare configs

  const bindings = {
    kv_namespaces: [],
    r2_buckets: [],
    d1_databases: [],
    durable_objects: [],
    services: [],
    queues_producers: [],
    queues_consumers: [],
    vectorize: [],
    ai: null,
    vars: {},
    secrets: []
  };

  const lines = content.split('\n');
  let currentSection = null;
  let currentItem = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip comments and empty lines
    if (line.startsWith('#') || line === '') continue;

    // Array section headers [[section]]
    const arrayMatch = line.match(/^\[\[([^\]]+)\]\]$/);
    if (arrayMatch) {
      // Save previous item if exists
      if (currentSection && Object.keys(currentItem).length > 0) {
        pushBinding(bindings, currentSection, currentItem);
      }
      currentSection = arrayMatch[1].replace(/\./g, '_');
      currentItem = {};
      continue;
    }

    // Table section headers [section]
    const tableMatch = line.match(/^\[([^\]]+)\]$/);
    if (tableMatch) {
      if (currentSection && Object.keys(currentItem).length > 0) {
        pushBinding(bindings, currentSection, currentItem);
      }
      currentSection = tableMatch[1].replace(/\./g, '_');
      currentItem = {};
      continue;
    }

    // Key-value pairs
    const kvMatch = line.match(/^(\w+)\s*=\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      let value = kvMatch[2].trim();

      // Remove quotes from strings
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Parse booleans
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      if (currentSection === 'vars') {
        bindings.vars[key] = value;
      } else {
        currentItem[key] = value;
      }
    }
  }

  // Don't forget the last item
  if (currentSection && Object.keys(currentItem).length > 0) {
    pushBinding(bindings, currentSection, currentItem);
  }

  return bindings;
}

function pushBinding(bindings, section, item) {
  if (section === 'kv_namespaces') {
    bindings.kv_namespaces.push(item);
  } else if (section === 'r2_buckets') {
    bindings.r2_buckets.push(item);
  } else if (section === 'd1_databases') {
    bindings.d1_databases.push(item);
  } else if (section === 'durable_objects_bindings') {
    bindings.durable_objects.push(item);
  } else if (section === 'services') {
    bindings.services.push(item);
  } else if (section === 'queues_producers') {
    bindings.queues_producers.push(item);
  } else if (section === 'queues_consumers') {
    bindings.queues_consumers.push(item);
  } else if (section === 'vectorize') {
    bindings.vectorize.push(item);
  } else if (section === 'ai') {
    bindings.ai = item;
  }
}

function generateEnvInterface(bindings) {
  const lines = ['interface Env {'];

  // KV Namespaces
  if (bindings.kv_namespaces.length > 0) {
    lines.push('  // KV Namespaces');
    bindings.kv_namespaces.forEach(kv => {
      lines.push(`  ${kv.binding}: KVNamespace;`);
    });
    lines.push('');
  }

  // R2 Buckets
  if (bindings.r2_buckets.length > 0) {
    lines.push('  // R2 Buckets');
    bindings.r2_buckets.forEach(r2 => {
      lines.push(`  ${r2.binding}: R2Bucket;`);
    });
    lines.push('');
  }

  // D1 Databases
  if (bindings.d1_databases.length > 0) {
    lines.push('  // D1 Databases');
    bindings.d1_databases.forEach(d1 => {
      lines.push(`  ${d1.binding}: D1Database;`);
    });
    lines.push('');
  }

  // Durable Objects
  if (bindings.durable_objects.length > 0) {
    lines.push('  // Durable Objects');
    bindings.durable_objects.forEach(dobj => {
      const name = dobj.name || dobj.binding;
      lines.push(`  ${name}: DurableObjectNamespace;`);
    });
    lines.push('');
  }

  // Service Bindings
  if (bindings.services.length > 0) {
    lines.push('  // Service Bindings');
    bindings.services.forEach(svc => {
      lines.push(`  ${svc.binding}: Fetcher;`);
    });
    lines.push('');
  }

  // Queues
  if (bindings.queues_producers.length > 0) {
    lines.push('  // Queue Producers');
    bindings.queues_producers.forEach(q => {
      lines.push(`  ${q.binding}: Queue;`);
    });
    lines.push('');
  }

  // Vectorize
  if (bindings.vectorize.length > 0) {
    lines.push('  // Vectorize Indexes');
    bindings.vectorize.forEach(v => {
      lines.push(`  ${v.binding}: VectorizeIndex;`);
    });
    lines.push('');
  }

  // AI
  if (bindings.ai) {
    lines.push('  // AI');
    lines.push(`  ${bindings.ai.binding || 'AI'}: Ai;`);
    lines.push('');
  }

  // Environment Variables
  if (Object.keys(bindings.vars).length > 0) {
    lines.push('  // Environment Variables');
    Object.keys(bindings.vars).forEach(key => {
      lines.push(`  ${key}: string;`);
    });
    lines.push('');
  }

  // Add common secrets placeholder
  lines.push('  // Secrets (add as needed)');
  lines.push('  // API_KEY?: string;');

  lines.push('}');
  return lines.join('\n');
}

function summarizeBindings(bindings) {
  const summary = [];

  if (bindings.kv_namespaces.length > 0) {
    summary.push(`KV Namespaces: ${bindings.kv_namespaces.map(b => b.binding).join(', ')}`);
  }
  if (bindings.r2_buckets.length > 0) {
    summary.push(`R2 Buckets: ${bindings.r2_buckets.map(b => b.binding).join(', ')}`);
  }
  if (bindings.d1_databases.length > 0) {
    summary.push(`D1 Databases: ${bindings.d1_databases.map(b => b.binding).join(', ')}`);
  }
  if (bindings.durable_objects.length > 0) {
    summary.push(`Durable Objects: ${bindings.durable_objects.map(b => b.name || b.binding).join(', ')}`);
  }
  if (bindings.services.length > 0) {
    summary.push(`Service Bindings: ${bindings.services.map(b => b.binding).join(', ')}`);
  }
  if (bindings.queues_producers.length > 0) {
    summary.push(`Queue Producers: ${bindings.queues_producers.map(b => b.binding).join(', ')}`);
  }
  if (bindings.vectorize.length > 0) {
    summary.push(`Vectorize: ${bindings.vectorize.map(b => b.binding).join(', ')}`);
  }
  if (bindings.ai) {
    summary.push(`AI: ${bindings.ai.binding || 'AI'}`);
  }

  return summary;
}

function main() {
  const wranglerPath = process.argv[2] || 'wrangler.toml';

  if (!fs.existsSync(wranglerPath)) {
    console.log(JSON.stringify({
      error: `wrangler.toml not found at ${wranglerPath}`,
      bindings: null,
      interface: null
    }, null, 2));
    process.exit(1);
  }

  const content = fs.readFileSync(wranglerPath, 'utf-8');
  const bindings = parseToml(content);
  const envInterface = generateEnvInterface(bindings);
  const summary = summarizeBindings(bindings);

  const result = {
    file: wranglerPath,
    timestamp: new Date().toISOString(),
    summary,
    bindings: {
      kv_namespaces: bindings.kv_namespaces,
      r2_buckets: bindings.r2_buckets,
      d1_databases: bindings.d1_databases,
      durable_objects: bindings.durable_objects,
      services: bindings.services,
      queues: bindings.queues_producers,
      vectorize: bindings.vectorize,
      ai: bindings.ai,
      vars: bindings.vars
    },
    typescript: envInterface
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
