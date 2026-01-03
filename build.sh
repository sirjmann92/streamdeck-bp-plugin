#!/bin/bash

# Clean previous build
rm -rf com.jase.steambp.sdPlugin com.jase.steambp.streamDeckPlugin

# Create .sdPlugin directory structure
mkdir -p com.jase.steambp.sdPlugin
cp -r bin propertyinspector images manifest.json com.jase.steambp.sdPlugin/

# Pack with Stream Deck CLI
streamdeck pack com.jase.steambp.sdPlugin

# Clean up temporary directory
rm -rf com.jase.steambp.sdPlugin

echo "✅ Build complete: com.jase.steambp.streamDeckPlugin"
