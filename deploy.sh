#!/bin/bash

# Deploy script for Escritor IA
# This script helps with Docker build and deployment

set -e

echo "🚀 Starting deployment process for Escritor IA..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t escritor-ia:latest .

echo "✅ Docker image built successfully!"

# Optional: Run locally for testing
read -p "🤔 Do you want to run the container locally for testing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🏃 Running container locally on port 3000..."
    echo "📝 Note: Make sure to set your environment variables"
    echo "🌐 Access the app at: http://localhost:3000"
    echo "⏹️  Press Ctrl+C to stop the container"
    
    docker run -p 3000:3000 \
        -e NODE_ENV=production \
        --name escritor-ia-test \
        --rm \
        escritor-ia:latest
fi

echo "🎉 Deployment process completed!"
echo ""
echo "📋 Next steps for Render deployment:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to Render"
echo "3. Render will automatically detect the render.yaml file"
echo "4. Set up your environment variables in Render dashboard"
echo "5. Deploy! 🚀"
echo ""
echo "📚 For detailed instructions, check README-DOCKER.md"