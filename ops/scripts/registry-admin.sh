#!/bin/bash

REGISTRY_URL=${REGISTRY_URL:-"http://localhost:5001"}

case "$1" in
  list)
    echo "Repositories in registry:"
    curl -s "$REGISTRY_URL/v2/_catalog" | jq -r '.repositories[]' 2>/dev/null || echo "No repositories found"
    ;;
    
  tags)
    if [ -z "$2" ]; then
      echo "Usage: $0 tags <repository>"
      exit 1
    fi
    echo "Tags for $2:"
    curl -s "$REGISTRY_URL/v2/$2/tags/list" | jq -r '.tags[]' 2>/dev/null || echo "Repository not found"
    ;;
    
  delete)
    if [ -z "$2" ] || [ -z "$3" ]; then
      echo "Usage: $0 delete <repository> <tag>"
      exit 1
    fi
    DIGEST=$(curl -sI -H "Accept: application/vnd.docker.distribution.manifest.v2+json" \
      "$REGISTRY_URL/v2/$2/manifests/$3" | grep Docker-Content-Digest | awk '{print $2}' | tr -d '\r')
    if [ -z "$DIGEST" ]; then
      echo "Image $2:$3 not found"
      exit 1
    fi
    curl -X DELETE "$REGISTRY_URL/v2/$2/manifests/$DIGEST"
    echo "Deleted $2:$3"
    ;;
    
  size)
    if [ -z "$2" ]; then
      echo "Usage: $0 size <repository>"
      exit 1
    fi
    echo "Calculating size for $2..."
    # This is a simplified version - actual implementation would sum blob sizes
    docker exec hiko-registry du -sh /var/lib/registry/docker/registry/v2/repositories/$2 2>/dev/null || echo "Repository not found or registry not running"
    ;;
    
  health)
    if curl -s "$REGISTRY_URL/v2/_health" | jq '.' 2>/dev/null; then
      echo "Registry is healthy"
    else
      echo "Registry is not responding"
      exit 1
    fi
    ;;
    
  cleanup)
    echo "Running garbage collection..."
    docker exec hiko-registry registry garbage-collect /etc/docker/registry/config.yml
    ;;
    
  inspect)
    if [ -z "$2" ] || [ -z "$3" ]; then
      echo "Usage: $0 inspect <repository> <tag>"
      exit 1
    fi
    echo "Inspecting $2:$3..."
    curl -s "$REGISTRY_URL/v2/$2/manifests/$3" | jq '.'
    ;;
    
  stats)
    echo "Registry Statistics:"
    echo "==================="
    REPOS=$(curl -s "$REGISTRY_URL/v2/_catalog" | jq -r '.repositories[]' 2>/dev/null)
    if [ -z "$REPOS" ]; then
      echo "No repositories found"
    else
      TOTAL_REPOS=$(echo "$REPOS" | wc -l | tr -d ' ')
      echo "Total repositories: $TOTAL_REPOS"
      echo ""
      for repo in $REPOS; do
        TAGS=$(curl -s "$REGISTRY_URL/v2/$repo/tags/list" | jq -r '.tags[]' 2>/dev/null | wc -l | tr -d ' ')
        echo "  $repo: $TAGS tag(s)"
      done
    fi
    echo ""
    echo "Volume usage:"
    docker exec hiko-registry du -sh /var/lib/registry 2>/dev/null | awk '{print "  Total: " $1}'
    ;;
    
  *)
    echo "Usage: $0 {list|tags|delete|size|health|cleanup|inspect|stats} [args...]"
    echo ""
    echo "Commands:"
    echo "  list                    - List all repositories"
    echo "  tags <repo>            - List tags for a repository"
    echo "  delete <repo> <tag>    - Delete an image"
    echo "  size <repo>            - Show repository size"
    echo "  health                 - Check registry health"
    echo "  cleanup                - Run garbage collection"
    echo "  inspect <repo> <tag>   - Show image manifest"
    echo "  stats                  - Show registry statistics"
    echo ""
    echo "Environment variables:"
    echo "  REGISTRY_URL           - Registry URL (default: http://localhost:5000)"
    exit 1
    ;;
esac