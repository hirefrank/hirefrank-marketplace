---
name: es-blogs
description: Research Anthropic blog posts for new learnings and patterns
---

# Edge Stack Blog Research

Monitor Anthropic engineering blogs for new capabilities and best practices.

## Usage

```
/es-blogs                 Check for new blog posts
/es-blogs --since <date>  Check posts since specific date
/es-blogs --apply         Generate implementation plan for new learnings
```

## Arguments

$DATE - Optional date filter (YYYY-MM-DD format)

## Monitored Sources

### Primary
- **Anthropic Engineering Blog**: https://www.anthropic.com/engineering
- **Anthropic Research Blog**: https://www.anthropic.com/research

### Secondary
- **Claude Documentation**: https://docs.anthropic.com
- **Claude Code Updates**: Release notes and changelogs

## Research Focus

When checking blogs, looks for:

1. **New Claude Capabilities**
   - Extended thinking
   - Tool use improvements
   - Context window changes

2. **Best Practices**
   - Prompt engineering updates
   - Agent design patterns
   - Error handling strategies

3. **Security & Safety**
   - Prompt injection defenses
   - Output validation
   - Guardrails

4. **Performance**
   - Token optimization
   - Caching strategies
   - Batching patterns

## Output

Generates:
- Summary of new posts
- Relevance assessment for edge-stack
- Implementation recommendations
- Links to source material

## Workflow

This command executes `bin/es-research-blogs.sh` which:

1. Fetches latest blog posts via web search
2. Filters for engineering/technical content
3. Extracts key learnings
4. Assesses applicability to edge-stack
5. Generates implementation plan if requested

## Execute

```bash
./bin/es-research-blogs.sh $ARGUMENTS
```
