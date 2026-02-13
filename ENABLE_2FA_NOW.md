# Enable 2FA on npm - Step by Step

You're still getting the 2FA error because **2FA is not enabled on your npm account yet**.

## Quick Steps:

### 1. Go to npm Security Settings
Open this URL in your browser (replace `your-username` with your actual npm username):
```
https://www.npmjs.com/settings/your-username/security
```

Or:
1. Go to https://www.npmjs.com
2. Click your profile icon (top right)
3. Click "Account Settings"
4. Click "Security" in the left sidebar

### 2. Enable 2FA
1. Scroll to "Two-Factor Authentication" section
2. Click **"Enable 2FA"** button
3. Choose **"Authenticator App"** (recommended)
4. Scan the QR code with:
   - Google Authenticator
   - Authy
   - Microsoft Authenticator
   - Or any TOTP app
5. Enter the 6-digit code from your app to verify
6. Save your recovery codes (important!)

### 3. Logout and Login Again
After enabling 2FA, you need to re-authenticate:

```bash
npm logout
npm login
```

When you run `npm login`:
- It will open a browser
- You'll need to enter your 2FA code
- The CLI will then be authenticated

### 4. Publish
```bash
./publish-cli.sh
```

## Alternative: Use Access Token (No 2FA Required)

If you don't want to enable 2FA, create a granular access token:

1. Go to: https://www.npmjs.com/settings/your-username/tokens
2. Click "Generate New Token"
3. Select "Granular Access Token"
4. Name: `lexi-ai-publish`
5. Expiration: Choose or "No expiration"
6. Under "Publish": Select "All packages"
7. **Enable "Bypass 2FA"** ✅
8. Click "Generate Token"
9. **Copy the token immediately** (you won't see it again!)

Then use it:

```bash
npm logout
npm login --auth-type=legacy
# When asked for password, paste your token instead
```

Then publish:
```bash
./publish-cli.sh
```

## Check if 2FA is Enabled

You can check your npm account security status:
```bash
npm profile get
```

Or visit: https://www.npmjs.com/settings/your-username/security

---

**The error will persist until you either:**
1. ✅ Enable 2FA on your npm account, OR
2. ✅ Use a granular access token with "Bypass 2FA" enabled

