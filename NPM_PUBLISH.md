# How to Publish Lexi AI CLI to npm

This guide will help you publish the Lexi AI CLI to npm so users can run `npx lexi-ai`.

## Prerequisites

1. **npm account**: Create one at https://www.npmjs.com/signup
2. **Package name availability**: Check if `lexi-ai` is available on npm

## Step 1: Prepare for Publishing

The current `package.json` includes all Next.js dependencies. For the CLI package, we need a minimal version. You have two options:

### Option A: Create a Separate CLI Package (Recommended)

Create a new directory for the CLI-only package:

```bash
mkdir lexi-ai-cli
cd lexi-ai-cli
```

Copy the CLI file:
```bash
cp ../cli/index.js ./index.js
```

Create a minimal `package.json`:
```json
{
  "name": "lexi-ai",
  "version": "1.0.0",
  "description": "AI-powered GitHub documentation indexing CLI tool",
  "main": "index.js",
  "bin": {
    "lexi-ai": "./index.js"
  },
  "keywords": [
    "ai",
    "documentation",
    "github",
    "indexing",
    "cli",
    "vector-search"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "axios": "^1.8.3",
    "chalk": "^4.1.2",
    "commander": "^12.1.0",
    "ora": "^8.2.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Option B: Publish Current Package (Simpler but Larger)

If you want to publish the current package, make sure:
- `.npmignore` is set up correctly (already created)
- The package name is available

## Step 2: Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

## Step 3: Verify Package Name

Check if the package name is available:

```bash
npm view lexi-ai
```

If it returns 404, the name is available. If it shows package info, you'll need to:
- Use a different name (e.g., `@your-username/lexi-ai`)
- Or contact the owner if it's your package

## Step 4: Test Locally (Optional but Recommended)

Before publishing, test the package locally:

```bash
# In your CLI package directory
npm link

# In another terminal, test it
lexi-ai index --url https://github.com/facebook/react --token test_token
```

## Step 5: Publish to npm

### For Public Package:
```bash
npm publish --access public
```

### For Scoped Package (if name is taken):
If you need to use a scoped package name like `@your-username/lexi-ai`:

1. Update `package.json`:
```json
{
  "name": "@your-username/lexi-ai",
  ...
}
```

2. Publish:
```bash
npm publish --access public
```

Users would then run: `npx @your-username/lexi-ai`

## Step 6: Verify Publication

After publishing, verify it's available:

```bash
npm view lexi-ai
```

Or test it:
```bash
npx lexi-ai --version
```

## Step 7: Update Version for Future Releases

When you make changes, update the version:

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major
```

Then publish again:
```bash
npm publish --access public
```

## Troubleshooting

### "Package name already exists"
- Choose a different name
- Or use a scoped package: `@your-username/lexi-ai`

### "You do not have permission"
- Make sure you're logged in: `npm whoami`
- Check if the package name is taken by someone else

### "Package too large"
- Check `.npmignore` is excluding unnecessary files
- Consider creating a separate minimal CLI package

## After Publishing

Users can now run:
```bash
npx lexi-ai index --url https://github.com/owner/repo --token ghp_token
```

## Quick Publish Script

Create a `publish-cli.sh` script:

```bash
#!/bin/bash
# Make sure you're in the CLI package directory
npm version patch
npm publish --access public
```

Make it executable:
```bash
chmod +x publish-cli.sh
```

Then run:
```bash
./publish-cli.sh
```

