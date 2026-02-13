# How to Use Lexi AI CLI

Now that `lexi-ai` is published on npm, anyone can use it!

## Installation

No installation needed! Just use `npx`:

```bash
npx lexi-ai index --url https://github.com/owner/repo --token ghp_your_github_token
```

## Basic Usage

### Index a GitHub Repository

```bash
npx lexi-ai index \
  --url https://github.com/facebook/react \
  --token ghp_your_github_token_here
```

### With Custom Namespace

```bash
npx lexi-ai index \
  --url https://github.com/vercel/next.js \
  --token ghp_your_token \
  --namespace nextjs
```

### Using Environment Variable for Token

```bash
export GITHUB_TOKEN=ghp_your_github_token_here
npx lexi-ai index --url https://github.com/facebook/react
```

## Options

- `--url, -u` (Required): GitHub repository URL
- `--token, -t` (Required): GitHub token (or set `GITHUB_TOKEN` env var)
- `--namespace, -n` (Optional): Namespace for indexed content (default: "default")
- `--api, -a` (Optional): API endpoint URL (auto-detected)

## API Endpoint Auto-Detection

The CLI automatically detects the API endpoint in this order:
1. `--api` flag (if provided)
2. `LEXI_AI_API_URL` environment variable
3. `VERCEL_URL` environment variable (if deployed on Vercel)
4. `http://localhost:3000/api/scrape` (default for local development)

## Examples

### Example 1: Index React Documentation
```bash
npx lexi-ai index \
  --url https://github.com/facebook/react \
  --token ghp_xxxxxxxxxxxx \
  --namespace react
```

### Example 2: Index Next.js Documentation
```bash
npx lexi-ai index \
  --url https://github.com/vercel/next.js \
  --token ghp_xxxxxxxxxxxx \
  --namespace nextjs
```

### Example 3: Use with Deployed API
```bash
export LEXI_AI_API_URL=https://your-deployed-app.vercel.app/api/scrape
npx lexi-ai index \
  --url https://github.com/facebook/react \
  --token ghp_xxxxxxxxxxxx
```

### Example 4: Custom API Endpoint
```bash
npx lexi-ai index \
  --url https://github.com/facebook/react \
  --token ghp_xxxxxxxxxxxx \
  --api https://your-api.com/api/scrape
```

## Getting a GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name (e.g., "Lexi AI CLI")
4. Select scopes: `repo` (for private repos) or just `public_repo` (for public repos)
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)

## Requirements

- Node.js 18+ installed
- GitHub token
- Your Lexi AI server running (or deployed API endpoint)

## After Indexing

Once indexed, you can query the documentation in your Lexi AI dashboard!

## Help

Get help:
```bash
npx lexi-ai --help
npx lexi-ai index --help
```

