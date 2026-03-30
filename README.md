# MarkOS-AgentFlow Enterprise v2.3

> 🚀 **一键启动，全流程 AI 软件交付平台** (PM -> Dev -> QA)
> 极简部署，企业级“磨砂玻璃”视觉面板。

---

## ⚡️ 小白快速开始 (Quick Start)

如果你是第一次使用，只需执行下面两行命令：

1. **克隆项目**
   ```bash
   git clone https://github.com/mktt-ai-global/MarkOS-AgentFlow.git
   cd MarkOS-AgentFlow
   ```

2. **一键部署**
   ```bash
   chmod +x install.sh && ./install.sh
   ```

🎉 **安装完成！** 
- **控制面板**: [http://localhost:3000](http://localhost:3000)
- **API 文档**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🏗 项目核心亮点
- **一键部署**：内置 `install.sh` 脚本，自动处理 Docker、环境变量与容器编排。
- **3-UI 风格配置面板**：可视化管理数据库、Redis、API 密钥与 Agent 设置。
- **企业级视觉**：采用 Next.js 16 + Tailwind 4 打造的极致“磨砂玻璃”通透感 UI。
- **多 Agent 协作**：完整的任务状态机（Pending -> Running -> Review -> Done）。

## 📖 详细指南
- [架构设计 (Architecture)](docs/ARCHITECTURE.md)
- [API 规范 (API v1)](docs/API.md)
- [开发指南 (Development)](docs/DEVELOPMENT.md)
- [部署指南 (Deployment)](docs/DEPLOYMENT.md)
- [故障排除 (Troubleshooting)](docs/TROUBLESHOOTING.md)

## 🚢 进阶部署
如果你需要自定义端口或外部数据库，请修改 `.env` 文件后重新运行 `./install.sh`。

## 🛡 安全与合规
详见 [SECURITY.md](SECURITY.md) 与 [COMPLIANCE.md](docs/COMPLIANCE.md)。

## 📄 开源协议
本项目采用 [MIT License](LICENSE)。
