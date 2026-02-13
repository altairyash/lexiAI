#!/bin/bash

# Manual publish script - use this if you need to handle 2FA in browser
# This prepares everything and then you can publish manually

echo "🚀 Preparing Lexi AI CLI for npm publishing..."

TEMP_DIR=".cli-package"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

cp cli/index.js $TEMP_DIR/index.js
cp cli-README.md $TEMP_DIR/README.md
cp cli-package.json $TEMP_DIR/package.json

cd $TEMP_DIR
echo "📦 Installing dependencies..."
npm install --production

# Check and bump version if needed
CURRENT_VERSION=$(node -p "require('./package.json').version")
if npm view lexi-ai version &> /dev/null; then
    PUBLISHED_VERSION=$(npm view lexi-ai version)
    echo "📦 Current published version: $PUBLISHED_VERSION"
    echo "📦 Local version: $CURRENT_VERSION"
    
    if [ "$CURRENT_VERSION" == "$PUBLISHED_VERSION" ]; then
        echo "⚠️  Version $CURRENT_VERSION already published. Bumping patch version..."
        npm version patch --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        echo "✅ Bumped to version $NEW_VERSION"
    fi
fi

echo ""
echo "✅ Package is ready to publish!"
echo ""
echo "📤 To publish, run one of these commands:"
echo ""
echo "1. If npm opens browser for auth:"
echo "   npm publish --access public"
echo ""
echo "2. If you need to provide OTP code:"
echo "   npm publish --access public --otp=<your-6-digit-code>"
echo ""
echo "3. Or just run the command and follow the prompts:"
echo "   npm publish --access public"
echo ""
echo "Current directory: $(pwd)"
echo "Package version: $(node -p "require('./package.json').version")"
echo ""

