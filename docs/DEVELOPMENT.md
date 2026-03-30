# Development Guide

## Environment Setup

### 1. Prerequisites
- Python 3.12+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

### 2. Local Setup
1. **Clone & Install**:
   ```bash
   git clone <repo_url>
   cd MarkOS-AgentFlow
   ```
2. **Backend**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt -r requirements-dev.txt
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   ```

## Coding Standards
- **Python**: PEP8, Black formatting, typed with mypy.
- **TypeScript**: Strict mode, ESLint, Prettier.
- **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/).

## Workflow
1. Create a feature branch.
2. Implement changes and add tests.
3. Run `pre-commit run --all-files`.
4. Submit PR.

## Versioning Strategy (Semantic Versioning)
We follow [SemVer 2.0.0](https://semver.org/):
- **Major (X.0.0)**: Breaking architectural changes or total UI redesigns.
- **Minor (0.X.0)**: New agent roles, major feature sets, or database schema changes.
- **Patch (0.0.X)**: Bug fixes, dependency updates, and minor UI polishes.

Every release should be accompanied by a manual or automated update to `CHANGELOG.md`.
