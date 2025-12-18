---
name: es-release
description: Bump version, validate, and create release commit
---

# Edge Stack Release

Prepare a new release with version bump, validation, and git tag.

## Usage

```
/es-release patch        Bump patch version (0.0.X)
/es-release minor        Bump minor version (0.X.0)
/es-release major        Bump major version (X.0.0)
/es-release --dry-run    Show what would happen without executing
```

## Arguments

$VERSION_TYPE - Type of version bump: patch, minor, or major

## Workflow

This command executes `bin/es-release.sh` which:

1. **Checks Prerequisites**
   - Clean working directory
   - On main branch
   - Up to date with remote

2. **Runs Full Validation**
   - Executes `/es-validate`
   - All checks must pass

3. **Bumps Version**
   - Updates package.json
   - Updates any version constants

4. **Generates Changelog**
   - Parses commits since last tag
   - Groups by type (feat, fix, etc.)

5. **Creates Release Commit**
   - Commit message: `chore(release): vX.Y.Z`
   - Creates git tag: `vX.Y.Z`

6. **Outputs Next Steps**
   - Push command
   - GitHub release creation

## Example

```
/es-release minor
```

Bumps from v1.2.3 to v1.3.0.

## Execute

```bash
./bin/es-release.sh $VERSION_TYPE
```
