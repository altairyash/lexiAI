# Fixing npm 2FA Error

The error you're seeing means npm requires Two-Factor Authentication (2FA) to publish packages.

## Solution: Enable 2FA on npm

### Step 1: Enable 2FA on npmjs.com

1. Go to https://www.npmjs.com/settings/[your-username]/security
2. Under "Two-Factor Authentication", click "Enable 2FA"
3. Choose one of these methods:
   - **Authenticator App** (Recommended - uses Google Authenticator, Authy, etc.)
   - **SMS** (Less secure)

### Step 2: Re-authenticate

After enabling 2FA, you'll need to log in again:

```bash
npm logout
npm login
```

When you run `npm login`, it will:
- Ask for your username
- Ask for your password
- Ask for your 2FA code (from your authenticator app or SMS)

### Step 3: Publish Again

Once 2FA is enabled and you're logged in, try publishing again:

```bash
./publish-cli.sh
```

## Alternative: Use Access Token (If you don't want 2FA)

If you prefer not to enable 2FA, you can use a granular access token:

1. Go to https://www.npmjs.com/settings/[your-username]/tokens
2. Click "Generate New Token"
3. Select "Granular Access Token"
4. Give it a name (e.g., "lexi-ai-publish")
5. Set expiration (or leave as "No expiration")
6. Under "Publish", select the package name or "All packages"
7. Make sure "Bypass 2FA" is enabled
8. Click "Generate Token"
9. Copy the token (you won't see it again!)

Then use it:

```bash
npm logout
npm login --auth-type=legacy
# When prompted for password, paste your token instead
```

Or set it as an environment variable:

```bash
export NPM_TOKEN=your_token_here
npm publish --access public
```

## Quick Fix Commands

```bash
# 1. Enable 2FA on npmjs.com (via web browser)
# 2. Then run:
npm logout
npm login
# 3. Enter username, password, and 2FA code when prompted
# 4. Publish:
./publish-cli.sh
```

