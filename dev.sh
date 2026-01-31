#!/bin/bash

# 1. Ensure the Registry is up (Fast)
echo "📦 Checking Registry..."
./kube-registry.sh

# 2. Ensure Minikube is up (Slow)
echo "☸️  Checking Minikube..."

# Check if Minikube is running. If not, start it with our specific flags.
if ! minikube status | grep -q "Running"; then
    echo "🚀 Starting Minikube..."
    minikube start \
      --driver=docker \
      --cpus=2 \
      --memory=4096 \
      --insecure-registry "host.minikube.internal:14000"
else
    echo "✅ Minikube is already running."
fi

# 3. Print the Dashboard URL (Optional convenience)
echo "🎉 Dev Environment Ready!"