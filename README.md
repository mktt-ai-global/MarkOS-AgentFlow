# MarkOS-AgentFlow Enterprise v2.2

> High-end multi-agent software delivery platform with a "Frosted Glass" UI.

## 🏗 Project Vision
MarkOS-AgentFlow is a production-grade orchestration platform that automates the engineering lifecycle (PM -> Dev -> QA) using specialized AI agents. It focuses on a strict state-machine for task execution, artifact handoffs, and real-time visualization.

## 🏗 Architecture
- **Backend**: FastAPI (Python 3.12+), SQLModel, PostgreSQL 16, Redis 7.
- **Frontend**: Next.js 16.2.1 (App Router), React 19.2.4, Tailwind CSS 4.2.2.
- **Orchestrator**: A specialized Python control loop for agent coordination and task state management.

## 📖 Table of Contents
1. [Quick Start](#-quick-start)
2. [Architecture](#-architecture)
3. [Documentation](#-documentation)
4. [Development Workflow](#-development-workflow)
5. [Deployment Guide](#-deployment-guide)
6. [Security Policy](#-security-policy)
7. [Troubleshooting](#-troubleshooting)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/mktt-ai-global/MarkOS-AgentFlow.git
cd MarkOS-AgentFlow
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL and Redis credentials
```

### 3. Start with Docker (Recommended)
```bash
docker-compose up --build
```
- **Dashboard**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📖 Documentation
Detailed technical guides are available in the `docs/` directory:
- [Architecture & Design](docs/ARCHITECTURE.md)
- [Database Schema Guide](docs/DATABASE_SCHEMA.md)
- [API v1 Specification](docs/API.md)
- [Environment Variable Guide](docs/ENV_GUIDE.md)
- [Release & Versioning Policy](docs/RELEASE_WORKFLOW.md)

## 🛠 Development Workflow
See the full [Development Guide](docs/DEVELOPMENT.md) for environment setup.

### Backend
```bash
cd backend
pip install -r requirements.txt -r requirements-dev.txt
pytest --cov
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Pre-commit Hooks
We use `pre-commit` to enforce standards.
```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files
```

## 🚢 Deployment Guide
See the full [Deployment Guide](docs/DEPLOYMENT.md) for production setups using Nginx and Docker.

## 🛡 Security Policy
See the full [Security Policy](SECURITY.md) for reporting vulnerabilities.

## ⚠️ Troubleshooting
Common issues and fixes are documented in the [Troubleshooting Guide](docs/TROUBLESHOOTING.md).

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
