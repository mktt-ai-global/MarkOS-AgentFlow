# AgentFlow Enterprise (v2.0) Automation
.PHONY: bootstrap dev build deploy logs stop clean db-migrate

# --- Configuration ---
ENV_FILE = .env.enterprise
DOCKER_COMPOSE = docker-compose

# --- Commands ---

# 1. Project Initialization
# Sets up local environment, installs dependencies, and prepares .env
bootstrap:
	@echo "🚀 Bootstrapping AgentFlow Enterprise..."
	@if [ ! -f $(ENV_FILE) ]; then \
		cp .env.enterprise.example $(ENV_FILE); \
		echo "✅ Created $(ENV_FILE) from example."; \
	else \
		echo "⚠️  $(ENV_FILE) already exists, skipping copy."; \
	fi
	@pnpm install
	@echo "✅ Dependencies installed."
	@echo "🎉 Bootstrap complete. Run 'make dev' to start local infrastructure."

# 2. Development Environment
# Starts the core infrastructure (DB, Redis) for local development
dev:
	@echo "🛠️ Starting development infrastructure (DB, Redis)..."
	$(DOCKER_COMPOSE) up -d db redis
	@echo "✅ Infrastructure services are up."
	@echo "💡 Run services manually or use 'make deploy' for full stack."

# 3. Build Orchestration
# Compiles all multi-stage Dockerfiles
build:
	@echo "🏗️ Building AgentFlow Enterprise production images..."
	$(DOCKER_COMPOSE) build --no-cache
	@echo "✅ Build completed."

# 4. Deployment
# Launches the full stack in detached mode
deploy:
	@echo "🚢 Deploying AgentFlow Enterprise stack..."
	$(DOCKER_COMPOSE) up -d
	@echo "✨ Stack is running!"
	@echo "🌍 Dashboard: http://localhost:3000"
	@echo "📡 API Gateway: http://localhost:8000/docs"

# 5. Monitoring
# Tail logs for all services
logs:
	$(DOCKER_COMPOSE) logs -f

# 6. Maintenance
# Stop all services
stop:
	@echo "🛑 Stopping services..."
	$(DOCKER_COMPOSE) stop

# 7. Cleanup
# Remove containers, networks, and volumes
clean:
	@echo "🧹 Cleaning up infrastructure..."
	$(DOCKER_COMPOSE) down -v
	@echo "✅ Cleaned up all containers and volumes."

# 8. Database Management
# Run alembic migrations inside the API container
db-migrate:
	@echo "🗄️ Running database migrations..."
	$(DOCKER_COMPOSE) exec api-gateway alembic upgrade head
