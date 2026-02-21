# Lexi AI - AI-Powered Documentation Search & Indexing

## Overview

Lexi AI is a powerful AI-driven tool for indexing and searching GitHub repository documentation. It combines a CLI tool for indexing repositories with a web dashboard for interactive queries and exploration.

**Features:**
- 🚀 **CLI Indexing:** Index GitHub repositories and documentation directly from the command line
- 🔍 **AI-Powered Search:** Query your indexed documentation using natural language
- 📊 **Interactive Dashboard:** Browse, search, and explore indexed content through a beautiful web interface
- 🤖 **Semantic Understanding:** Leverages OpenAI embeddings for intelligent search results
- ⚡ **Vector Database:** Fast retrieval using Pinecone vector database
- 🎨 **Modern UI:** Beautiful, responsive interface with smooth animations

## Quick Start

### Using the CLI (Recommended)

No installation needed! Use `npx`:

```bash
npx lexi-ai index \
  --url https://github.com/facebook/react \
  --token ghp_your_github_token \
  --namespace react
```

See [USAGE.md](./USAGE.md) for detailed CLI documentation.

### Using the Web Dashboard

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo.git
   cd your-repo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX=your_pinecone_index
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes
- **Database:** Pinecone Vector Database
- **AI Integration:** OpenAI API
- **CLI:** Node.js with command-line tooling

## Project Structure

```
/
├── cli/                      # CLI tool entry point
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   ├── lib/                # Core utilities (agent, vector DB, etc.)
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
└── public/                  # Static assets
```

## Usage

### CLI - Index a Repository

```bash
# Basic usage
npx lexi-ai index --url https://github.com/owner/repo --token ghp_token

# With custom namespace
npx lexi-ai index \
  --url https://github.com/vercel/next.js \
  --token ghp_token \
  --namespace nextjs

# Using environment variable
export GITHUB_TOKEN=ghp_token
npx lexi-ai index --url https://github.com/owner/repo
```

### Web Dashboard

1. Navigate to the dashboard
2. Select or search for indexed namespaces
3. Ask questions about the documentation
4. Get AI-powered answers with source references

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for embeddings and completions | ✅ |
| `PINECONE_API_KEY` | Pinecone API key for vector database | ✅ |
| `PINECONE_INDEX` | Pinecone index name | ✅ |
| `GITHUB_TOKEN` | GitHub token for repository access (CLI) | For CLI usage |
| `LEXI_AI_API_URL` | API endpoint URL (auto-detected) | ❌ |

## API Endpoints

### POST `/api/scrape`
Scrape and index documentation from a URL

**Payload:**
```json
{
  "url": "https://example.com/docs",
  "namespace": "example"
}
```

### POST `/api/query`
Query the AI with natural language questions

**Payload:**
```json
{
  "question": "How do I get started?",
  "namespace": "example"
}
```

### GET `/api/namespaces`
Get list of all indexed namespaces

### POST `/api/classify-namespace`
Classify content into namespaces

## Documentation

- [CLI Usage Guide](./USAGE.md)
- [CLI Package Details](./cli-README.md)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run CLI locally
npm run cli -- index --url [URL] --token [TOKEN]
```

## License

This project is open-source under the MIT License.

