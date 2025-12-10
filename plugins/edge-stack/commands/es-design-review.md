---
description: Comprehensive frontend design review to prevent generic aesthetics and ensure distinctive, accessible, engaging interfaces using shadcn/ui and Tailwind CSS
---

# Design Review Command

<command_purpose> Perform comprehensive frontend design reviews focusing on typography, colors, animations, component customization, and accessibility. Prevents "distributional convergence" (Inter fonts, purple gradients, minimal animations) and guides toward distinctive, branded interfaces. </command_purpose>

## Introduction

<role>Senior Frontend Design Architect with expertise in shadcn/ui, Tailwind CSS, accessibility (WCAG 2.1 AA), and distinctive design patterns</role>

**Design Philosophy** (from Claude Skills Blog):
> "Think about frontend design the way a frontend engineer would. The more you can map aesthetic improvements to implementable frontend code, the better Claude can execute."

**Core Problem**: LLMs default to generic patterns (Inter fonts, purple gradients, minimal animations) due to distributional convergence. This command identifies and fixes these patterns.

## Prerequisites

<requirements>
- Tanstack Start project with Vue 3 components
- shadcn/ui component library installed
- Tailwind 4 CSS configured
- Vue files (`.react`) in `components/`, `pages/`, `layouts/`
- (Optional) shadcn/ui MCP server for accurate component guidance
</requirements>

## Security Considerations

⚠️ **Security Note**: When reviewing external design inspiration sites or scraping design patterns from untrusted sources using browser automation, be aware that malicious websites could attempt prompt injection attacks. Exercise caution when:
- Navigating to external design inspiration sites for pattern analysis
- Scraping design elements from untrusted third-party websites
- Extracting styles, colors, or typography from external sources
- Using browser automation to analyze competitor designs

**Best Practices**:
- Manually review design inspiration from trusted sources (Dribbble, Behance, official component libraries)
- Avoid automated scraping of untrusted websites for design patterns
- Reference established design systems (Material, shadcn/ui docs) instead of arbitrary sites
- When analyzing external sites, review extracted suggestions carefully before implementing

This command focuses on analyzing your *own* codebase for design improvements. If you extend it to analyze external sites, treat all extracted content as untrusted.

For more information, see [Anthropic's research on prompt injection defenses](https://www.anthropic.com/research/prompt-injection-defenses).

## Main Tasks

### 1. Project Analysis

<thinking>
First, I need to understand the project structure and identify all frontend files.
This enables targeted design review of components, pages, and configuration.
</thinking>

#### Immediate Actions:

<task_list>

- [ ] Scan for Vue components in `components/`, `pages/`, `layouts/`, `app.react`
- [ ] Check `tailwind.config.ts` or `tailwind.config.js` for custom theme configuration
- [ ] Check `app.config.ts` for shadcn/ui configuration
- [ ] Check `app.config.ts` for global UI customization
- [ ] Identify which components use shadcn/ui (`Button`, `Card`, etc.)
- [ ] Count total Vue files to determine review scope

</task_list>

#### Output Summary:

<summary_format>
📊 **Project Scope**:
- X Vue components found
- Y shadcn/ui components detected
- Tailwind config: Found/Not Found
- shadcn/ui config: Found/Not Found
- Review target: Components + Configuration
</summary_format>

### 2. Multi-Phase Design Review

<parallel_tasks>

Run design-focused analysis in 3 phases. Focus on preventing generic patterns and ensuring accessible, distinctive design.

**Phase 1: Autonomous Skills Validation (Parallel)**

These skills run autonomously to catch generic patterns:

1. ✅ **shadcn-ui-design-validator** (SKILL)
   - Detects Inter/Roboto fonts
   - Detects purple gradients
   - Detects missing animations
   - Validates typography hierarchy
   - Checks color contrast

2. ✅ **component-aesthetic-checker** (SKILL)
   - Validates component customization depth
   - Checks for default props only
   - Ensures consistent design system
   - Validates spacing patterns
   - Checks loading states

3. ✅ **animation-interaction-validator** (SKILL)
   - Ensures hover states on interactive elements
   - Validates loading states on async actions
   - Checks for smooth transitions
   - Validates focus states
   - Ensures micro-interactions

**Output**: List of generic patterns detected across all components

**Phase 2: Deep Agent Analysis (Parallel)**

Launch specialized agents for comprehensive review:

4. Task frontend-design-specialist(all Vue files, Tailwind config)
   - Identify generic patterns (fonts, colors, animations)
   - Map aesthetic improvements to code
   - Provide specific Tailwind/shadcn/ui recommendations
   - Prioritize by impact (P1/P2/P3)
   - Generate implementable code examples

5. Task shadcn-ui-architect(all Vue files with shadcn/ui components)
   - Validate component selection and usage
   - Check prop usage vs available (via MCP if available)
   - Validate `ui` prop customization depth
   - Ensure consistent patterns across components
   - Suggest deep customization strategies

6. Task accessibility-guardian(all Vue files)
   - Validate WCAG 2.1 AA compliance
   - Check color contrast ratios
   - Validate keyboard navigation
   - Check screen reader support
   - Validate form accessibility
   - Ensure animations respect reduced motion

**Phase 3: Configuration & Theme Review (Sequential)**

7. Review Tailwind Configuration
   - Check `tailwind.config.ts` for custom fonts (not Inter/Roboto)
   - Check for custom color palette (not default purple)
   - Check for custom animation presets
   - Validate extended spacing/sizing
   - Check for design tokens

8. Review shadcn/ui Configuration
   - Check `app.config.ts` for global UI customization
   - Check `app.config.ts` for shadcn/ui theme settings
   - Validate consistent design system approach

</parallel_tasks>

### 3. Findings Synthesis and Prioritization

<thinking>
After all agents complete, I need to consolidate findings, remove duplicates,
and prioritize by impact on brand distinctiveness and user experience.
</thinking>

#### Consolidation Process:

<consolidation_steps>

1. **Collect all findings** from skills and agents
2. **Remove duplicates** (same issue reported by multiple sources)
3. **Categorize by type**:
   - Typography (fonts, hierarchy, sizing)
   - Colors (palette, contrast, gradients)
   - Animations (transitions, micro-interactions, hover states)
   - Components (customization depth, consistency)
   - Accessibility (contrast, keyboard, screen readers)
   - Configuration (theme, design tokens)

4. **Prioritize by impact**:
   - **P1 - Critical**: Generic patterns that make site indistinguishable
     - Inter/Roboto fonts
     - Purple gradients
     - Default component props
     - Missing animations
     - Accessibility violations
   - **P2 - Important**: Missed opportunities for distinctiveness
     - Limited color palette
     - Inconsistent component patterns
     - Missing micro-interactions
     - Insufficient customization depth
   - **P3 - Polish**: Enhancements for excellence
     - Advanced animations
     - Dark mode refinements
     - Enhanced accessibility

5. **Generate implementation plan** with time estimates

</consolidation_steps>

#### Output Format:

<findings_format>

# 🎨 Frontend Design Review Report

## Executive Summary

**Scope**: X components reviewed, Y configuration files analyzed

**Findings**:
- **P1 (Critical)**: X issues - Must fix for brand distinctiveness
- **P2 (Important)**: Y issues - Should fix for enhanced UX
- **P3 (Polish)**: Z opportunities - Nice to have improvements

**Generic Patterns Detected**:
- ❌ Inter font used in X components
- ❌ Purple gradient in Y components
- ❌ Default props in Z shadcn/ui components
- ❌ Missing animations on W interactive elements
- ❌ A accessibility violations (WCAG 2.1 AA)

**Distinctiveness Score**: XX/100
- Typography: XX/25 (Custom fonts, hierarchy, sizing)
- Colors: XX/25 (Brand palette, contrast, distinctive gradients)
- Animations: XX/25 (Transitions, micro-interactions, engagement)
- Components: XX/25 (Customization depth, consistency)

---

## Critical Issues (P1)

### 1. Generic Typography: Inter Font Detected

**Severity**: P1 - High Impact
**Files Affected**: 15 components
**Impact**: Indistinguishable from 80%+ of modern websites

**Finding**: Using default Inter font system-wide

**Current State**:
```tsx
<!-- app/components/Hero.tsx:12 -->
<h1 class="text-4xl font-sans">Welcome</h1>

<!-- tailwind.config.ts -->
fontFamily: {
  sans: ['Inter', 'system-ui']  // ❌ Generic
}
```

**Recommendation**:
```tsx
<!-- Updated component -->
<h1 class="text-4xl font-heading tracking-tight">Welcome</h1>

<!-- tailwind.config.ts -->
fontFamily: {
  sans: ['Space Grotesk', 'system-ui', 'sans-serif'],      // Body
  heading: ['Archivo Black', 'system-ui', 'sans-serif'],   // Headings
  mono: ['JetBrains Mono', 'monospace']                     // Code
}
```

**Implementation**:
1. Update `tailwind.config.ts` with custom fonts (5 min)
2. Add font-heading class to all headings (10 min)
3. Verify font loading in `app.config.ts` (5 min)
**Total**: ~20 minutes

---

### 2. Purple Gradient Hero (Overused Pattern)

**Severity**: P1 - High Impact
**Files Affected**: `app/components/Hero.tsx:8`
**Impact**: "AI-generated" aesthetic, lacks brand identity

**Finding**: Hero section uses purple-500 to purple-600 gradient (appears in 60%+ of AI-generated sites)

**Current State**:
```tsx
<div class="bg-gradient-to-r from-purple-500 to-purple-600">
  <h1 class="text-white">Hero Title</h1>
</div>
```

**Recommendation**:
```tsx
<div class="relative overflow-hidden">
  <!-- Multi-layer atmospheric background -->
  <div class="absolute inset-0 bg-gradient-to-br from-brand-coral via-brand-ocean to-brand-sunset" />

  <!-- Animated gradient orbs -->
  <div class="absolute top-0 left-0 w-96 h-96 bg-brand-coral/30 rounded-full blur-3xl animate-pulse" />
  <div class="absolute bottom-0 right-0 w-96 h-96 bg-brand-ocean/30 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;" />

  <!-- Content -->
  <div class="relative z-10 py-24">
    <h1 class="text-white font-heading text-6xl tracking-tight">
      Hero Title
    </h1>
  </div>
</div>

<!-- tailwind.config.ts: Add custom colors -->
colors: {
  brand: {
    coral: '#FF6B6B',
    ocean: '#4ECDC4',
    sunset: '#FFE66D'
  }
}
```

**Implementation**:
1. Add brand colors to `tailwind.config.ts` (5 min)
2. Update Hero component with atmospheric background (15 min)
3. Test animations and responsiveness (5 min)
**Total**: ~25 minutes

---

### 3. Button Components with Default Props (23 instances)

**Severity**: P1 - High Impact
**Files Affected**: 8 components
**Impact**: Generic appearance, no brand identity

**Finding**: 23 Button instances using default props only (no customization)

**Current State**:
```tsx
<!-- app/components/CallToAction.tsx:34 -->
<Button onClick={handleClick">Click me</Button>
```

**Recommendation**:
```tsx
<Button
  color="primary"
  size="lg"
  :ui="{
    font: 'font-heading tracking-wide',
    rounded: 'rounded-full',
    padding: { lg: 'px-8 py-4' },
    shadow: 'shadow-lg hover:shadow-xl'
  }"
  class="
    transition-all duration-300 ease-out
    hover:scale-105 hover:-rotate-1
    active:scale-95 active:rotate-0
    focus:outline-none
    focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
  "
  onClick={handleClick"
>
  <span class="inline-flex items-center gap-2">
    Click me
    <Icon
      name="i-heroicons-sparkles"
      class="transition-transform duration-300 group-hover:rotate-12"
    />
  </span>
</Button>
```

**Better Approach: Create Reusable Variants**:
```tsx
<!-- composables/useDesignSystem.ts -->
export const useDesignSystem = () => {
  const button = {
    primary: {
      color: 'primary',
      size: 'lg',
      ui: {
        font: 'font-heading tracking-wide',
        rounded: 'rounded-full',
        padding: { lg: 'px-8 py-4' }
      },
      class: 'transition-all duration-300 hover:scale-105 hover:shadow-xl'
    }
  };

  return { button };
};

<!-- Usage in components -->
const { button } = useDesignSystem();

  <Button v-bind="button.primary" onClick={handleClick">
    Click me
  </Button>
```

**Implementation**:
1. Create `composables/useDesignSystem.ts` with button variants (15 min)
2. Update all 23 button instances to use variants (30 min)
3. Test all button interactions (10 min)
**Total**: ~55 minutes

---

## Important Issues (P2)

### 4. Missing Hover Animations (32 interactive elements)

**Severity**: P2 - Medium Impact
**Impact**: Flat UI, reduced engagement

**Finding**: 32 interactive elements (buttons, links, cards) without hover animations

**Recommendation**: Add transition utilities to all interactive elements
```tsx
<!-- Before -->
<Card>Content</Card>

<!-- After -->
<Card
  :ui="{ shadow: 'shadow-lg hover:shadow-2xl' }"
  class="transition-all duration-300 hover:-translate-y-1"
>
  Content
</Card>
```

[Continue with remaining P2 issues...]

---

## Accessibility Violations (WCAG 2.1 AA)

### 5. Insufficient Color Contrast (4 instances)

**Severity**: P1 - Blocker
**Standard**: WCAG 1.4.3 (4.5:1 for normal text, 3:1 for large text)

**Violations**:
1. `app/components/Footer.tsx:23` - Gray-400 on white (2.9:1) ❌
2. `app/routes/about.tsx:45` - Brand-coral on white (3.2:1) ❌
3. `app/components/Badge.tsx:12` - Yellow-300 on white (1.8:1) ❌
4. `layouts/default.tsx:67` - Blue-400 on gray-50 (2.4:1) ❌

**Fixes**: [Specific contrast-compliant color recommendations]

---

## Polish Opportunities (P3)

[List P3 improvements...]

---

## Implementation Roadmap

### Priority 1: Foundation (1-2 hours)
1. ✅ Update `tailwind.config.ts` with custom fonts and colors
2. ✅ Create `composables/useDesignSystem.ts` with reusable variants
3. ✅ Fix critical accessibility violations (contrast)

### Priority 2: Component Updates (2-3 hours)
4. ✅ Update all Button instances with design system variants
5. ✅ Add hover animations to interactive elements
6. ✅ Customize Card components with distinctive styling

### Priority 3: Polish (1-2 hours)
7. ✅ Enhance micro-interactions
8. ✅ Add staggered animations
9. ✅ Implement dark mode refinements

**Total Time Estimate**: 4-7 hours for complete implementation

---

## Next Steps

1. **Review Findings**: Team reviews this report
2. **Prioritize Work**: Decide which issues to address
3. **Use `/triage`**: Create todos for approved findings
4. **Implement Changes**: Follow code examples provided
5. **Re-run Review**: Verify improvements with `/es-design-review`

## Distinctiveness Score Projection

**Before**: 35/100 (Generic, AI-generated aesthetic)
**After P1 Fixes**: 75/100 (Distinctive, branded)
**After P1+P2 Fixes**: 90/100 (Excellent, highly polished)
**After P1+P2+P3**: 95/100 (Outstanding, delightful)

</findings_format>

### 4. Create Triage-Ready Todos (Optional)

<thinking>
If user wants to proceed with fixes, use /triage command to create actionable todos.
Each todo should be specific, implementable, and include code examples.
</thinking>

#### Generate Todos:

<todo_format>

For each P1 issue, create a todo in `.claude/todos/` with format:
- `001-pending-p1-update-typography.md`
- `002-pending-p1-fix-hero-gradient.md`
- `003-pending-p1-customize-buttons.md`
- etc.

Each todo includes:
- **Title**: Clear, actionable
- **Severity**: P1/P2/P3
- **Files**: Specific file paths
- **Current State**: Code before
- **Target State**: Code after
- **Implementation Steps**: Numbered checklist
- **Time Estimate**: Minutes/hours

</todo_format>

Ask user: "Would you like me to create todos for these findings? You can then use `/triage` to work through them systematically."

## Success Criteria

✅ Design review complete when:
- All Vue components analyzed
- All generic patterns identified
- All accessibility violations found
- Findings categorized and prioritized
- Implementation plan provided with time estimates
- Code examples are complete and implementable

✅ Project ready for distinctive brand identity when:
- 0% Inter/Roboto font usage
- 0% purple gradient usage
- 100% of shadcn/ui components deeply customized
- 100% of interactive elements have animations
- 100% WCAG 2.1 AA compliance
- Distinctiveness score ≥ 85/100

## Post-Review Actions

After implementing fixes:
1. **Re-run review**: `/es-design-review` to verify improvements
2. **Validate code**: `/validate` to ensure no build/lint errors
3. **Test manually**: Check hover states, animations, keyboard navigation
4. **Deploy preview**: Test on actual Cloudflare Workers environment

## Resources

- Claude Skills Blog: Improving Frontend Design Through Skills
- shadcn/ui Documentation: https://ui.shadcn.com
- Tailwind 4 Documentation: https://tailwindcss.com/docs/v4-beta
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

## Notes

- This command focuses on **frontend design**, not Cloudflare Workers runtime
- Use `/review` for comprehensive code review (includes runtime, security, performance)
- Use `/es-component` to scaffold new components with best practices
- Use `/es-theme` to generate custom design themes
