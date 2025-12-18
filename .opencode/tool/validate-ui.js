#!/usr/bin/env node
/**
 * UI Prop Validator
 *
 * Validates shadcn/ui component usage to prevent prop hallucination.
 * This is a "Hard Tool" - deterministic validation against known component APIs.
 *
 * Usage:
 *   node validate-ui.js [directory]
 *   node validate-ui.js src/components/
 *
 * Output:
 *   JSON with validation results for shadcn/ui components
 */

const fs = require('fs');
const path = require('path');

// Known shadcn/ui components and their valid props
// This is a subset - in production, query the shadcn MCP server
const SHADCN_COMPONENTS = {
  Button: {
    validProps: ['variant', 'size', 'asChild', 'disabled', 'className', 'children', 'onClick', 'type'],
    variants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    sizes: ['default', 'sm', 'lg', 'icon']
  },
  Card: {
    validProps: ['className', 'children'],
    subComponents: ['CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter']
  },
  Input: {
    validProps: ['type', 'placeholder', 'disabled', 'className', 'value', 'onChange', 'name', 'id'],
    types: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time', 'datetime-local']
  },
  Dialog: {
    validProps: ['open', 'onOpenChange', 'modal', 'defaultOpen'],
    subComponents: ['DialogTrigger', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogDescription', 'DialogFooter', 'DialogClose']
  },
  Select: {
    validProps: ['value', 'onValueChange', 'defaultValue', 'open', 'onOpenChange', 'disabled', 'name'],
    subComponents: ['SelectTrigger', 'SelectValue', 'SelectContent', 'SelectItem', 'SelectGroup', 'SelectLabel']
  },
  Table: {
    validProps: ['className', 'children'],
    subComponents: ['TableHeader', 'TableBody', 'TableFooter', 'TableHead', 'TableRow', 'TableCell', 'TableCaption']
  },
  Form: {
    validProps: ['className', 'children', 'onSubmit'],
    subComponents: ['FormField', 'FormItem', 'FormLabel', 'FormControl', 'FormDescription', 'FormMessage']
  },
  Badge: {
    validProps: ['variant', 'className', 'children'],
    variants: ['default', 'secondary', 'destructive', 'outline']
  },
  Alert: {
    validProps: ['variant', 'className', 'children'],
    variants: ['default', 'destructive'],
    subComponents: ['AlertTitle', 'AlertDescription']
  },
  Avatar: {
    validProps: ['className', 'children'],
    subComponents: ['AvatarImage', 'AvatarFallback']
  }
};

// Common hallucinated props that don't exist
const HALLUCINATED_PROPS = [
  { prop: 'color', component: 'Button', note: 'Use variant instead' },
  { prop: 'primary', component: '*', note: 'Use variant="default"' },
  { prop: 'secondary', component: '*', note: 'Use variant="secondary"' },
  { prop: 'error', component: '*', note: 'Use variant="destructive"' },
  { prop: 'success', component: '*', note: 'Not a standard variant' },
  { prop: 'loading', component: 'Button', note: 'Implement with disabled + spinner' },
  { prop: 'icon', component: 'Button', note: 'Pass icon as children' },
  { prop: 'leftIcon', component: '*', note: 'Pass icon as children before text' },
  { prop: 'rightIcon', component: '*', note: 'Pass icon as children after text' },
  { prop: 'fullWidth', component: '*', note: 'Use className="w-full"' },
  { prop: 'rounded', component: '*', note: 'Use className with rounded-* utilities' }
];

const SCAN_EXTENSIONS = ['.tsx', '.jsx'];

function extractJsxComponents(content) {
  const components = [];

  // Match JSX component usage: <ComponentName prop="value" />
  const jsxRegex = /<([A-Z][a-zA-Z]*)\s*([^>]*?)(?:\/>|>)/g;
  let match;

  while ((match = jsxRegex.exec(content)) !== null) {
    const componentName = match[1];
    const propsString = match[2];

    // Extract props
    const props = [];
    const propRegex = /(\w+)(?:=(?:{[^}]*}|"[^"]*"|'[^']*'))?/g;
    let propMatch;

    while ((propMatch = propRegex.exec(propsString)) !== null) {
      props.push(propMatch[1]);
    }

    components.push({
      name: componentName,
      props,
      position: match.index
    });
  }

  return components;
}

function validateComponent(component, lineNumber, filePath) {
  const issues = [];
  const componentDef = SHADCN_COMPONENTS[component.name];

  // Check if it's a known shadcn component
  if (!componentDef) {
    // Not a shadcn component - skip validation
    return issues;
  }

  // Check each prop
  component.props.forEach(prop => {
    // Skip common React props
    if (['key', 'ref', 'className', 'style', 'children', 'id'].includes(prop)) {
      return;
    }

    // Check for hallucinated props
    const hallucinated = HALLUCINATED_PROPS.find(
      h => h.prop === prop && (h.component === '*' || h.component === component.name)
    );

    if (hallucinated) {
      issues.push({
        file: filePath,
        line: lineNumber,
        component: component.name,
        prop,
        severity: 'error',
        message: `Hallucinated prop "${prop}" on ${component.name}`,
        fix: hallucinated.note
      });
      return;
    }

    // Check if prop is valid for this component
    if (!componentDef.validProps.includes(prop)) {
      // Check if it's an event handler (onClick, onSubmit, etc)
      if (prop.startsWith('on') && prop[2] === prop[2].toUpperCase()) {
        return; // Event handlers are generally OK
      }

      issues.push({
        file: filePath,
        line: lineNumber,
        component: component.name,
        prop,
        severity: 'warning',
        message: `Unknown prop "${prop}" on ${component.name}`,
        fix: `Valid props: ${componentDef.validProps.join(', ')}`
      });
    }
  });

  return issues;
}

function scanFile(filePath) {
  const issues = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Simple line-by-line extraction
  lines.forEach((line, index) => {
    const components = extractJsxComponents(line);
    components.forEach(component => {
      issues.push(...validateComponent(component, index + 1, filePath));
    });
  });

  return issues;
}

function scanDirectory(dirPath) {
  const issues = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          walk(filePath);
        }
      } else if (SCAN_EXTENSIONS.some(ext => file.endsWith(ext))) {
        issues.push(...scanFile(filePath));
      }
    }
  }

  walk(dirPath);
  return issues;
}

function main() {
  const targetDir = process.argv[2] || 'src';
  const issues = scanDirectory(targetDir);

  const result = {
    scanned: targetDir,
    timestamp: new Date().toISOString(),
    total: issues.length,
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    issues,
    note: 'For comprehensive validation, use the shadcn MCP server to query real component APIs'
  };

  console.log(JSON.stringify(result, null, 2));

  // Exit with error if issues found
  if (result.errors > 0) {
    process.exit(1);
  }
}

main();
