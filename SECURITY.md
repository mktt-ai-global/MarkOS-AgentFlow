# Security Policy

## Supported Versions

Only the latest version of MarkOS-AgentFlow is supported for security updates.

| Version | Supported          |
| ------- | ------------------ |
| v0.2.x  | :white_check_mark: |
| < v0.2  | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an e-mail to mktt-ai-global@gmail.com. All security vulnerabilities will be promptly addressed.

Please include:
*   Description of the vulnerability.
*   Steps to reproduce the vulnerability.
*   Potential impact.

## Security Practices
- **Scanning**: We use GitHub Dependabot and CodeQL for automated scanning.
- **Dependency Policy**: All third-party dependencies must be pinned and updated monthly.
- **Secret Management**: All secrets (DB, API Keys) must be stored in `.env` and never committed to git.
- **SAST**: Regular static analysis is performed on both backend (Bandit) and frontend (ESLint Security).
