# How to Publish Documentation for Lexi AI CLI

The documentation (README.md) will automatically appear on npmjs.com when you publish the package.

## Current Setup

✅ **README is already included!**

The `publish-cli.sh` script now:
1. Copies `cli-README.md` as `README.md` to the package
2. Includes it in the published package
3. npmjs.com will automatically display it

## Update Documentation

1. Edit `cli-README.md` in your project
2. Run the publish script:
   ```bash
   ./publish-cli.sh
   ```

The script will:
- Copy the updated README
- Bump the version (if needed)
- Publish to npm

## View Published Documentation

After publishing, your README will appear at:
```
https://www.npmjs.com/package/lexi-ai
```

## What's Included in the README

The `cli-README.md` includes:
- ✅ Installation instructions
- ✅ Quick start guide
- ✅ Usage examples
- ✅ Options documentation
- ✅ GitHub token setup
- ✅ API endpoint configuration
- ✅ Troubleshooting guide
- ✅ Links to GitHub repository

## Update Version

When you update the README and want to republish:

```bash
# The script will handle version bumping, or manually:
cd .cli-package
npm version patch  # or minor, or major
npm publish --access public
```

Or just run:
```bash
./publish-cli.sh
```

The README will be automatically included in the published package!

