#!/bin/bash

# Script to publish Lexi AI CLI to npm
# This creates a minimal CLI package and publishes it

set -e

echo "🚀 Preparing Lexi AI CLI for npm publishing..."

# Create temporary directory for CLI package
TEMP_DIR=".cli-package"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Copy CLI file
cp cli/index.js $TEMP_DIR/index.js

# Copy README for npm
cp cli-README.md $TEMP_DIR/README.md

# Copy minimal package.json
cp cli-package.json $TEMP_DIR/package.json

# Install dependencies
cd $TEMP_DIR
echo "📦 Installing dependencies..."
npm install --production

# Check if logged in to npm
if ! npm whoami &> /dev/null; then
    echo "❌ Not logged in to npm. Please run: npm login"
    exit 1
fi

# Check package name and get current version
echo "🔍 Checking package status..."
CURRENT_VERSION=$(node -p "require('./package.json').version")
if npm view lexi-ai version &> /dev/null; then
    PUBLISHED_VERSION=$(npm view lexi-ai version)
    echo "📦 Package exists on npm. Current published version: $PUBLISHED_VERSION"
    echo "📦 Local version: $CURRENT_VERSION"
    
    if [ "$CURRENT_VERSION" == "$PUBLISHED_VERSION" ]; then
        echo "⚠️  Version $CURRENT_VERSION already published. Bumping patch version..."
        npm version patch --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        echo "✅ Bumped to version $NEW_VERSION"
        # Update the package.json in temp dir
        node -e "const pkg = require('./package.json'); pkg.version = '$NEW_VERSION'; require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));"
    fi
else
    echo "✅ Package name is available!"
fi

# Publish
echo "📤 Publishing to npm..."
echo "💡 If 2FA is required, npm will open your browser for authentication."
echo ""

# Try to publish - npm will handle browser auth if needed
if npm publish --access public; then
    echo "✅ Published successfully!"
else
    echo ""
    echo "❌ Publishing failed."
    echo "💡 If you saw a browser window, please authenticate there and try again."
    echo "   Or if you need to provide an OTP code manually, run:"
    echo "   npm publish --access public --otp=<your-6-digit-code>"
    cd ..
    rm -rf $TEMP_DIR
    exit 1
fi

echo ""
echo "Users can now run:"
echo "  npx lexi-ai index --url https://github.com/owner/repo --token ghp_token"
echo ""
echo "To update, run this script again (it will bump the version automatically)"

cd ..
rm -rf $TEMP_DIR

