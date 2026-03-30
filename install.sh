#!/bin/bash

# MarkOS-AgentFlow One-Click Installer
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}     MarkOS-AgentFlow One-Click Installer         ${NC}"
echo -e "${BLUE}==================================================${NC}"

# 1. Check for Docker
if ! [ -x "$(command -v docker)" ]; then
  echo -e "${RED}Error: Docker is not installed.${NC}" >&2
  echo -e "Please install Docker first: https://docs.docker.com/get-docker/"
  exit 1
fi

if ! [ -x "$(command -v docker-compose)" ]; then
  echo -e "${BLUE}Note: docker-compose command not found. Checking for 'docker compose' plugin...${NC}"
  if ! docker compose version > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker Compose is not installed.${NC}" >&2
    exit 1
  fi
  DOCKER_COMPOSE="docker compose"
else
  DOCKER_COMPOSE="docker-compose"
fi

# 2. Setup Environment File
if [ ! -f .env ]; then
  echo -e "${BLUE}Configuring environment...${NC}"
  cp .env.example .env
  echo -e "${GREEN}Created .env from .env.example with default settings.${NC}"
else
  echo -e "${BLUE}.env file already exists. Skipping setup.${NC}"
fi

# 3. Pull and Start Containers
echo -e "${BLUE}Launching MarkOS-AgentFlow (this may take a few minutes)...${NC}"
$DOCKER_COMPOSE up -d --build

# 4. Success Message
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}     Successfully Deployed MarkOS-AgentFlow!      ${NC}"
echo -e "${GREEN}==================================================${NC}"
echo -e "Dashboard: ${BLUE}http://localhost:3000${NC}"
echo -e "API Docs:  ${BLUE}http://localhost:8000/docs${NC}"
echo -e "Health:    ${BLUE}http://localhost:8000/health${NC}"
echo -e ""
echo -e "To stop the system, run: ${BLUE}$DOCKER_COMPOSE down${NC}"
echo -e "To view logs, run:       ${BLUE}$DOCKER_COMPOSE logs -f${NC}"
echo -e "=================================================="
