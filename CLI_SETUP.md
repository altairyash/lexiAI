# Lexi AI CLI Setup Guide

## Overview
The Lexi AI CLI allows you to index GitHub repository documentation from the command line using `npx lexi-ai`.

**Note:** The CLI only works with GitHub repository URLs and requires a GitHub token.

## Installation & Usage

### Option 1: Use via npx (Recommended - After Publishing)
Once published to npm, users can run:
```bash
npx lexi-ai index --url https://github.com/facebook/react --token ghp_your_token_here
```

### Option 2: Local Development
For local development, you can use:
```bash
npm run cli index --url https://github.com/facebook/react --token ghp_your_token_here --namespace react
```

Or directly:
```bash
node cli/index.js index --url https://github.com/facebook/react --token ghp_your_token_here --namespace react
```

## Publishing to npm (To Enable npx)

1. **Update package.json** (already done):
   - `name`: `lexi-ai`
   - `bin`: Points to `./cli/index.js`
   - `version`: `1.0.0`

2. **Install CLI dependencies**:
   ```bash
   npm install commander chalk ora
   ```

3. **Test locally**:
   ```bash
   npm link
   # Then you can use: lexi-ai index --url <url>
   ```

4. **Publish to npm**:
   ```bash
   npm login
   npm publish --access public
   ```

5. **After publishing**, users can run:
   ```bash
   npx lexi-ai index --url https://react.dev --namespace react
   ```

## CLI Options

- `--url, -u`: (Required) GitHub repository URL (e.g., https://github.com/owner/repo)
- `--token, -t`: (Required) GitHub token for authentication (or set `GITHUB_TOKEN` env var)
- `--namespace, -n`: (Optional) Namespace for the indexed content (default: "default")
- `--api, -a`: (Optional) API endpoint URL (auto-detected if not provided)

### API Endpoint Auto-Detection

The CLI automatically detects the API endpoint in this order:
1. `--api` flag (if provided)
2. `LEXI_AI_API_URL` environment variable
3. `VERCEL_URL` environment variable (if deployed on Vercel)
4. `http://localhost:3000/api/scrape` (default for local development)

## Examples

```bash
# Index React documentation with token
npx lexi-ai index --url https://github.com/facebook/react --token ghp_your_token_here

# Index with custom namespace
npx lexi-ai index --url https://github.com/facebook/react --token ghp_your_token_here --namespace react

# Using environment variable for token
export GITHUB_TOKEN=ghp_your_token_here
npx lexi-ai index --url https://github.com/vercel/next.js --namespace nextjs

# Use custom API endpoint (for deployed instances)
export LEXI_AI_API_URL=https://your-deployed-url.com/api/scrape
npx lexi-ai index --url https://github.com/facebook/react --token ghp_your_token_here

# Or specify API endpoint directly
npx lexi-ai index --url https://github.com/facebook/react --token ghp_your_token_here --api https://your-api.com/api/scrape
```

## Requirements

- Node.js 18+ installed
- Next.js server running (for API endpoint) OR
- Environment variables set (OPENAI_API_KEY, PINECONE_API_KEY)

## Notes

- **GitHub Only**: The CLI only works with GitHub repository URLs
- **GitHub Token Required**: A GitHub token is required for authentication
  - Get a token from: https://github.com/settings/tokens
  - Use `--token` flag or set `GITHUB_TOKEN` environment variable
  - With a token, you get 5,000 requests/hour (vs 60 without)
- **API Endpoint**: The CLI auto-detects the API endpoint, but you can override it
  - For local development: Make sure your Next.js server is running (`npm run dev`)
  - For deployed instances: Set `LEXI_AI_API_URL` environment variable
- **Environment Variables**: Make sure your server's `.env.local` has:
  - `OPENAI_API_KEY`
  - `PINECONE_API_KEY`
  - `GITHUB_TOKEN` (optional, can be passed via CLI)
- The indexing process may take a few minutes for large documentation sites

