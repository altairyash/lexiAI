#!/bin/bash

# Quick script to publish with OTP code
# Usage: ./publish-with-otp.sh <6-digit-otp-code>

if [ -z "$1" ]; then
    echo "Usage: ./publish-with-otp.sh <6-digit-otp-code>"
    echo "Example: ./publish-with-otp.sh 123456"
    exit 1
fi

OTP_CODE=$1

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
    if [ "$CURRENT_VERSION" == "$PUBLISHED_VERSION" ]; then
        echo "⚠️  Version $CURRENT_VERSION already published. Bumping patch version..."
        npm version patch --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        echo "✅ Bumped to version $NEW_VERSION"
    fi
fi

echo "📤 Publishing to npm with OTP..."
npm publish --access public --otp=$OTP_CODE

echo "✅ Published successfully!"
cd ..
rm -rf $TEMP_DIR

