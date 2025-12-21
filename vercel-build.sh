#!/bin/bash
# Vercel build script to ensure webpack is used
echo "Starting Vercel build with webpack..."
node --max-old-space-size=4096 node_modules/next/dist/bin/next build --webpack
