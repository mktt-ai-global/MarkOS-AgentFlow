# Release Workflow

This document defines the release process for MarkOS-AgentFlow.

## Versioning Policy
We use [Semantic Versioning 2.0.0](https://semver.org/):
- **Major**: Architectural resets or breaking API changes.
- **Minor**: New agent roles, substantial feature additions.
- **Patch**: Bug fixes, security updates, dependency bumps.

## Release Steps
1. **Branching**: All work happens on feature branches. PRs merge into `main`.
2. **Quality Gate**:
    - Pre-commit hooks must pass.
    - Tests must pass (`pytest`, `vitest`).
    - Audit reports must be reviewed.
3. **Drafting**:
    - Update `CHANGELOG.md` with a summary of changes.
    - Increment the version in `package.json` and `backend/pyproject.toml`.
4. **Tagging**: Create a git tag for the version (e.g., `git tag v0.2.0`).
5. **Publishing**:
    - Build Docker images.
    - Push to container registry.
    - Create a GitHub Release with the tag.

## Tools
- `semantic-release` (for automated releases, if configured).
- `gh release create` (via GitHub CLI).
