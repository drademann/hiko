# Hiko Deployment Guide for Raspberry Pi

This guide explains how to deploy the Hiko application to a Raspberry Pi using a local Docker registry.

## Architecture Overview

The deployment uses:

- A local Docker registry for storing multi-platform images
- Multi-architecture builds (amd64 and arm64) for compatibility
- Docker Compose for orchestration
- Nginx for frontend serving with API proxy

## Prerequisites

- Docker installed on both development machine and Raspberry Pi
- Docker Compose installed on Raspberry Pi
- Network connectivity between development machine and Raspberry Pi

## Setup Steps

### 1. Start Local Registry (on Development Machine or Raspberry Pi)

Choose where to run your registry (development machine or directly on the Pi):

```shell
cd ops/docker
docker-compose -f docker-compose.registry.yml up -d
```

This starts:

- Registry on port 5001 (CLI administration only)

### 2. Configure Docker for Insecure Registry

On both your development machine and Raspberry Pi, add the registry as insecure:

**On macOS (Docker Desktop):**

- Open Docker Desktop preferences
- Go to Docker Engine settings
- Add to the JSON configuration:

```json
{
  "insecure-registries": ["<registry-host>:5001"]
}
```

- Replace `<registry-host>` with the IP address or hostname of the registry machine
- Apply & Restart Docker

**On Raspberry Pi:**
Edit `/etc/docker/daemon.json`:

```shell
sudo nano /etc/docker/daemon.json
```

Add:

```json
{
  "insecure-registries": ["<registry-host>:5001"]
}
```

Restart Docker:

```shell
sudo systemctl restart docker
```

### 3. Build and Push Images (on Development Machine)

```shell
# From the project root
./ops/scripts/build-and-push.sh <registry-host>

# Or if registry is on localhost:
./ops/scripts/build-and-push.sh
```

This builds both frontend and backend images for amd64 and arm64 architectures.

### 4. Deploy on Raspberry Pi

Copy the production compose file to your Raspberry Pi:

```shell
scp docker-compose.prod.yml <user>@<raspberry-pi-ip>:~/
```

On the Raspberry Pi:

```shell
# Set the registry host environment variable
export REGISTRY_HOST=<registry-host>

# Pull and start the services
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Or in one command:
REGISTRY_HOST=<registry-host> docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables

Create a `.env` file on the Raspberry Pi for configuration:

```shell
# Registry configuration
REGISTRY_HOST=<registry-host>

# Application configuration
WALLBOX_HOST=<your-wallbox-ip>
LOG_LEVEL=info
```

## Accessing the Application

Once deployed:

- Frontend: `http://<raspberry-pi-ip>`
- Backend API: `http://<raspberry-pi-ip>/api`
- Registry API: `http://<raspberry-pi-ip>:5001/v2/`

## Updating the Application

To deploy updates:

1. On development machine:

```shell
./ops/scripts/build-and-push.sh <registry-host>
```

2. On Raspberry Pi:

From the home directory run the script

```shell
Hiko/update
```

After that restart the Kiosk mode again with

```shell
Hiko/start-kiosk
```

## Troubleshooting

### Check if images are in registry:

```shell
curl http://<registry-host>:5001/v2/_catalog
# Or use the admin script:
./ops/scripts/registry-admin.sh list
```

### View logs:

```shell
docker-compose -f docker-compose.prod.yml logs -f
```

### Registry connection issues:

- Ensure the registry host is accessible from the Pi
- Verify insecure-registries configuration
- Check firewall rules for port 5001

### ARM compatibility issues:

- Verify images were built with `--platform linux/arm64`
- Check Docker version supports buildx

## Maintenance

### Clean up old images in registry:

```shell
# List all repositories and tags
./ops/scripts/registry-admin.sh list
./ops/scripts/registry-admin.sh tags <repo-name>

# Delete specific image
./ops/scripts/registry-admin.sh delete <repo-name> <tag>

# Run garbage collection to free space
./ops/scripts/registry-admin.sh cleanup
```

### Registry CLI Administration:

The registry is configured for command-line administration only. Use the provided admin script:

```shell
# Show registry statistics
./ops/scripts/registry-admin.sh stats

# List all repositories
./ops/scripts/registry-admin.sh list

# List tags for a specific repository
./ops/scripts/registry-admin.sh tags hiko-frontend

# Delete a specific image tag
./ops/scripts/registry-admin.sh delete hiko-frontend v1.0.0

# Run garbage collection (after deletions)
./ops/scripts/registry-admin.sh cleanup

# Inspect image manifest
./ops/scripts/registry-admin.sh inspect hiko-frontend latest

# Check registry health
./ops/scripts/registry-admin.sh health
```

For direct API access:

```shell
# List all repositories
curl http://<registry-host>:5001/v2/_catalog | jq

# List tags for a repository
curl http://<registry-host>:5001/v2/hiko-frontend/tags/list | jq

# Get image manifest
curl -H "Accept: application/vnd.docker.distribution.manifest.v2+json" \
  http://<registry-host>:5001/v2/hiko-frontend/manifests/latest | jq
```

### Backup registry data:

The registry stores data in a Docker volume. To backup:

```shell
docker run --rm -v docker_registry-data:/data -v $(pwd):/backup alpine tar czf /backup/registry-backup.tar.gz /data
```

To restore from backup:

```shell
docker run --rm -v docker_registry-data:/data -v $(pwd):/backup alpine tar xzf /backup/registry-backup-YYYYMMDD.tar.gz -C /
```
