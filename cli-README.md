# Lexi AI CLI

> AI-powered GitHub documentation indexing CLI tool

Index GitHub repository documentation and make it searchable with AI using Lexi AI.

## Installation

No installation needed! Use `npx`:

```bash
npx lexi-ai index --url https://github.com/owner/repo --token ghp_your_token
```

## Quick Start

```bash
# Index a GitHub repository
npx lexi-ai index \
  --url https://github.com/facebook/react \
  --token ghp_your_github_token \
  --namespace react
```

## Usage

### Basic Command

```bash
npx lexi-ai index [options]
```

### Options

| Option | Short | Required | Description |
|--------|-------|----------|-------------|
| `--url` | `-u` | ✅ Yes | GitHub repository URL (e.g., `https://github.com/owner/repo`) |
| `--token` | `-t` | ✅ Yes* | GitHub token for authentication |
| `--namespace` | `-n` | ❌ No | Namespace for indexed content (default: `"default"`) |
| `--api` | `-a` | ❌ No | API endpoint URL (auto-detected if not provided) |

*Token can be provided via `--token` flag or `GITHUB_TOKEN` environment variable.

## Examples

### Index React Documentation

```bash
npx lexi-ai index \
  --url https://github.com/facebook/react \
  --token ghp_your_token_here \
  --namespace react
```

### Index Next.js Documentation

```bash
npx lexi-ai index \
  --url https://github.com/vercel/next.js \
  --token ghp_your_token_here \
  --namespace nextjs
```

### Using Environment Variable

```bash
export GITHUB_TOKEN=ghp_your_token_here
npx lexi-ai index --url https://github.com/facebook/react
```

### Custom API Endpoint

```bash
npx lexi-ai index \
  --url https://github.com/facebook/react \
  --token ghp_your_token_here \
  --api https://your-api.com/api/scrape
```

## Getting a GitHub Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name (e.g., "Lexi AI CLI")
4. Select scopes:
   - `public_repo` (for public repositories)
   - `repo` (for private repositories)
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)

## API Endpoint

The CLI automatically detects the API endpoint in this order:

1. `--api` flag (if provided)
2. `LEXI_AI_API_URL` environment variable
3. `VERCEL_URL` environment variable (if deployed on Vercel)
4. `http://localhost:3000/api/scrape` (default for local development)

### For Local Development

Make sure your Lexi AI server is running:

```bash
npm run dev
```

The CLI will automatically connect to `http://localhost:3000/api/scrape`.

### For Deployed Instances

Set the API endpoint:

```bash
export LEXI_AI_API_URL=https://your-deployed-app.vercel.app/api/scrape
npx lexi-ai index --url https://github.com/owner/repo --token ghp_token
```

## Requirements

- **Node.js**: 18.0.0 or higher
- **GitHub Token**: Required for authentication
- **Lexi AI Server**: Your server must be running (local or deployed)

## How It Works

1. The CLI sends the GitHub repository URL to your Lexi AI server
2. The server scrapes all `.md` and `.mdx` files from the repository
3. Content is processed and stored in Pinecone vector database
4. You can then query the documentation in your Lexi AI dashboard

## Troubleshooting

### "Could not connect to the API server"

- Make sure your Lexi AI server is running
- Check if the API endpoint is correct
- For local: Run `npm run dev` in your Lexi AI project
- For deployed: Set `LEXI_AI_API_URL` environment variable

### "GitHub token is required"

- Provide token via `--token` flag, or
- Set `GITHUB_TOKEN` environment variable

### "URL must be a GitHub repository URL"

- Only GitHub repository URLs are supported
- Format: `https://github.com/owner/repo`

## Support

- **GitHub**: [https://github.com/altairyash/lexiAI](https://github.com/altairyash/lexiAI)
- **Issues**: Report issues on GitHub

## License

MIT

## Author

Yash

