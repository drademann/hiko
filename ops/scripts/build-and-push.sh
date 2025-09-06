#!/bin/bash

# Build and push Docker images to local registry
# Usage: build-and-push.sh [registry-host]

set -e

# Configuration
REGISTRY_HOST=${1:-localhost}
REGISTRY_PORT=5001
REGISTRY_URL="${REGISTRY_HOST}:${REGISTRY_PORT}"
IMAGE_TAG="latest"

# colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting build and push to ${REGISTRY_URL}${NC}"

# check if docker is available
if ! docker version &> /dev/null; then
    echo -e "${RED}Error: Docker is not available. Please ensure Docker is installed and running.${NC}"
    exit 1
fi

# build and push backend
echo -e "${YELLOW}Building backend...${NC}"
docker build \
    -t "${REGISTRY_URL}/hiko-backend:${IMAGE_TAG}" \
    -f ops/docker/Dockerfile.backend \
    .

echo -e "${YELLOW}Pushing backend image...${NC}"
docker push "${REGISTRY_URL}/hiko-backend:${IMAGE_TAG}"
echo -e "${GREEN}Backend image pushed to ${REGISTRY_URL}/hiko-backend:${IMAGE_TAG}${NC}"

# Build and push frontend
echo -e "${YELLOW}Building frontend...${NC}"
docker build \
    -t "${REGISTRY_URL}/hiko-frontend:${IMAGE_TAG}" \
    -f ops/docker/Dockerfile.frontend \
    .

echo -e "${YELLOW}Pushing frontend image...${NC}"
docker push "${REGISTRY_URL}/hiko-frontend:${IMAGE_TAG}"
echo -e "${GREEN}Frontend image pushed to ${REGISTRY_URL}/hiko-frontend:${IMAGE_TAG}${NC}"

echo -e "${GREEN}Build and push completed successfully!${NC}"
echo -e "${YELLOW}Images available at:${NC}"
echo -e "   - ${REGISTRY_URL}/hiko-backend:${IMAGE_TAG}"
echo -e "   - ${REGISTRY_URL}/hiko-frontend:${IMAGE_TAG}"

# Show registry contents using CLI
echo -e "${YELLOW}Registry contents:${NC}"
if command -v jq &> /dev/null; then
    curl -s "http://${REGISTRY_URL}/v2/_catalog" | jq -r '.repositories[]' 2>/dev/null | while read repo; do
        TAGS=$(curl -s "http://${REGISTRY_URL}/v2/${repo}/tags/list" | jq -r '.tags | join(", ")' 2>/dev/null)
        echo "  - ${repo}: ${TAGS}"
    done
else
    echo "Install jq for better output formatting"
    curl -s "http://${REGISTRY_URL}/v2/_catalog"
fi

echo -e "${GREEN}To manage the registry, use:${NC}"
echo "  ./ops/scripts/registry-admin.sh stats"