#!/bin/bash

# 1. Define where to store images
REGISTRY_DIR="$HOME/.docker-registry-data"
mkdir -p "$REGISTRY_DIR"

# 2. Check if running
if [ "$(docker ps -q -f name=local-registry)" ]; then
    echo "✅ Local Registry is already running on port 14000"
    exit 0
fi

# 3. Check if stopped
if [ "$(docker ps -aq -f name=local-registry)" ]; then
    echo "🔄 waking up existing registry..."
    docker start local-registry
    exit 0
fi

# 4. Fresh Start
echo "🚀 Starting new registry container..."
# FIX: Map Host Port 14000 -> Container Port 5000
docker run -d \
  -p 14000:5000 \
  --restart=always \
  --name local-registry \
  -v "$REGISTRY_DIR":/var/lib/registry \
  registry:2

echo "✅ Registry started at localhost:14000"