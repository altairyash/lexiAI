#!/usr/bin/env node

/**
 * Lexi AI CLI Tool
 * Usage: npx lexi-ai index --url <github-repo-url> --token <github-token>
 */

const { Command } = require('commander');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const http = require('http');

const program = new Command();

// Auto-detect API endpoint
async function detectApiEndpoint() {
  // Check for environment variable first
  if (process.env.LEXI_AI_API_URL) {
    return process.env.LEXI_AI_API_URL;
  }
  
  // Check for VERCEL_URL (if deployed on Vercel)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/scrape`;
  }
  
  // Try localhost:3000
  const localApi = 'http://localhost:3000/api/scrape';
  try {
    await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3000', (res) => {
        resolve();
      });
      req.on('error', reject);
      req.setTimeout(1000, () => reject(new Error('Timeout')));
    });
    return localApi;
  } catch (error) {
    // If localhost doesn't work, return it anyway (user might need to start server)
    return localApi;
  }
}

// Validate GitHub URL
function validateGitHubUrl(url) {
  const githubPattern = /^https?:\/\/(www\.)?github\.com\/[^\/]+\/[^\/]+/;
  if (!githubPattern.test(url)) {
    throw new Error('URL must be a GitHub repository URL (e.g., https://github.com/owner/repo)');
  }
  return true;
}

program
  .name('lexi-ai')
  .description('CLI tool to index GitHub documentation for Lexi AI')
  .version('1.0.0');

program
  .command('index')
  .description('Index documentation from a GitHub repository')
  .requiredOption('-u, --url <url>', 'GitHub repository URL (e.g., https://github.com/facebook/react)')
  .option('-t, --token <token>', 'GitHub token for authentication (or set GITHUB_TOKEN env var)')
  .option('-n, --namespace <namespace>', 'Namespace for the indexed content', 'default')
  .option('-a, --api <api>', 'API endpoint URL (auto-detected if not provided)')
  .action(async (options) => {
    const { url, namespace, token } = options;
    
    // Validate GitHub URL
    try {
      validateGitHubUrl(url);
    } catch (error) {
      console.error(chalk.red(`\n❌ ${error.message}\n`));
      process.exit(1);
    }
    
    // Get GitHub token
    const githubToken = token || process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error(chalk.red('\n❌ GitHub token is required!'));
      console.log(chalk.yellow('\nPlease provide a GitHub token:'));
      console.log(chalk.gray('  --token <your-github-token>'));
      console.log(chalk.gray('  or set GITHUB_TOKEN environment variable'));
      console.log(chalk.gray('\nGet a token from: https://github.com/settings/tokens\n'));
      process.exit(1);
    }
    
    // Auto-detect API endpoint
    const api = options.api || await detectApiEndpoint();
    
    console.log(chalk.blue('\n🚀 Lexi AI Indexer\n'));
    console.log(chalk.gray(`GitHub URL: ${url}`));
    console.log(chalk.gray(`Namespace: ${namespace}`));
    console.log(chalk.gray(`GitHub Token: ${githubToken.substring(0, 8)}...`));
    console.log(chalk.gray(`API Endpoint: ${api}\n`));

    const spinner = ora('Indexing documentation...').start();

    try {
      const payload = {
        url,
        namespace,
        githubToken
      };
      
      const response = await axios.post(api, payload, {
        timeout: 300000 // 5 minutes timeout
      });

      if (response.data.success) {
        spinner.succeed(chalk.green('✓ Documentation indexed successfully!'));
        console.log(chalk.gray(`\nYou can now query this documentation in the dashboard.\n`));
      } else {
        spinner.fail(chalk.red('✗ Failed to index documentation'));
        console.log(chalk.red(`Error: ${response.data.message || 'Unknown error'}\n`));
        process.exit(1);
      }
    } catch (error) {
      spinner.fail(chalk.red('✗ Failed to index documentation'));
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log(chalk.red('\n❌ Could not connect to the API server.'));
        console.log(chalk.yellow('\nPossible solutions:'));
        console.log(chalk.gray('1. Make sure your Next.js server is running:'));
        console.log(chalk.gray('   npm run dev'));
        console.log(chalk.gray('\n2. Or set the API endpoint explicitly:'));
        console.log(chalk.gray(`   --api ${api}`));
        console.log(chalk.gray('\n3. Or set LEXI_AI_API_URL environment variable:'));
        console.log(chalk.gray('   export LEXI_AI_API_URL=https://your-deployed-url.com/api/scrape\n'));
      } else if (error.response) {
        console.log(chalk.red(`\nError: ${error.response.data?.message || error.message}\n`));
        if (error.response.status === 404) {
          console.log(chalk.yellow('The API endpoint was not found. Check if the server is running.\n'));
        }
      } else {
        console.log(chalk.red(`\nError: ${error.message}\n`));
      }
      process.exit(1);
    }
  });

program.parse();

