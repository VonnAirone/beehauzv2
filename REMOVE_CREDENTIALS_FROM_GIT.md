# 🔐 Step-by-Step Guide: Removing Credentials from Git History

## What's the Problem?

Your `eas.json` file contains **hardcoded credentials** that were committed to git history. Even though we've now removed them from the file, they still exist in previous commits. Anyone with access to your repository can retrieve them.

## What You'll Learn

This guide teaches you how to:
1. Remove sensitive files from ALL commits in git history
2. Rotate compromised credentials
3. Use EAS secrets properly going forward

---

## 📋 Prerequisites

Before starting, make sure:
- ✅ You have a backup of your repository (we created one at `~/beehauzv2-backup`)
- ✅ All team members are notified (this rewrites git history)
- ✅ You have admin access to your Supabase project
- ✅ You have an EAS account and are logged in

---

## 🛠️ Step 1: Remove eas.json from Git History

### Understanding the Command

We'll use `git filter-branch` to rewrite git history. This command:
- Goes through EVERY commit in your repository
- Removes `eas.json` from each commit
- Rebuilds the commit history without the file

### The Commands

```bash
cd /Users/aironevonnvillasor/beehauzv2

# This command removes eas.json from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch eas.json" \
  --prune-empty --tag-name-filter cat -- --all
```

**What each part does:**
- `--force`: Overwrite existing backups if filter-branch was run before
- `--index-filter`: Run the command on the git index (faster than checking out files)
- `git rm --cached --ignore-unmatch eas.json`: Remove eas.json from the index
- `--prune-empty`: Remove commits that become empty after filtering
- `--tag-name-filter cat`: Update all tags to point to rewritten commits
- `-- --all`: Apply to all branches and tags

### Run It

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch eas.json" \
  --prune-empty --tag-name-filter cat -- --all
```

**Expected output:**
```
Rewrite e0e9fe0a... (1/5) (0 seconds passed, remaining 0 predicted)
Rewrite 0154966a... (2/5) (0 seconds passed, remaining 0 predicted)
...
Ref 'refs/heads/main' was rewritten
```

---

## 🧹 Step 2: Clean Up Git History

After filtering, we need to clean up references to old commits:

```bash
# Remove backup references created by filter-branch
rm -rf .git/refs/original/

# Expire all reflog entries immediately
git reflog expire --expire=now --all

# Run garbage collection to remove old objects
git gc --prune=now --aggressive
```

**What these do:**
- `rm -rf .git/refs/original/`: Removes backup refs from filter-branch
- `git reflog expire`: Expires old reflog entries (git's undo log)
- `git gc --prune=now`: Permanently deletes unreachable objects from git database
- `--aggressive`: More thorough garbage collection

---

## ✅ Step 3: Verify eas.json is Gone

Check that eas.json no longer appears in git history:

```bash
# Search for eas.json in all commits
git log --all --full-history --oneline -- eas.json

# This should return NOTHING. If you see commits, something went wrong.
```

Also verify your working directory still has the file (we want it locally, just not in history):

```bash
ls -la eas.json
# Should show: -rw-r--r--  ... eas.json
```

---

## 🚀 Step 4: Force Push to Remote Repository

**⚠️ WARNING: This step is DANGEROUS and IRREVERSIBLE**

Force pushing rewrites the remote repository's history. Make sure:
1. All team members are aware
2. No one is currently working on the repository
3. You have a backup (we created one earlier)

```bash
# Force push to origin (GitHub/GitLab/etc)
git push origin --force --all

# Also force push tags
git push origin --force --tags
```

**Expected output:**
```
+ e0e9fe0...a1b2c3d main -> main (forced update)
```

---

## 🔄 Step 5: Rotate ALL Compromised Credentials

Now that we've removed the old credentials from git, we MUST rotate them because they were exposed.

### A. Rotate Supabase Anon Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `fqjmdvvbikawuacolpyu`
3. Go to **Settings > API**
4. Find the `anon` / `public` key
5. Click **"Regenerate"** or **"Rotate"**
6. **Copy the new key** - you'll need it in the next steps

### B. Change Admin Password

1. In Supabase Dashboard, go to **Authentication > Users**
2. Find the user with email: `admin@beehauz.com`
3. Click the menu (three dots) next to the user
4. Select **"Reset Password"**
5. Set a NEW strong password:
   - Minimum 16 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Example: `Bh@2026!Secure#Admin$Pass`
6. **Save this password** - you'll need it in the next steps

### C. Generate New Access Code

Create a new random access code:

```bash
# Generate a random code (Mac/Linux)
openssl rand -base64 12

# Example output: kR8mN2pQ5tL9vX3w
```

Or create your own memorable but secure code (e.g., `BETA_DASH_2026_SECURE`)

---

## 🔐 Step 6: Set Up EAS Secrets

**Install EAS CLI** (if not already installed):

```bash
npm install -g eas-cli
```

**Login to EAS:**

```bash
eas login
```

**Create environment variables** with your NEW credentials:

```bash
# Navigate to your project
cd /Users/aironevonnvillasor/beehauzv2

# Create each environment variable for PRODUCTION (replace YOUR_NEW_... with actual values)
eas env:create EXPO_PUBLIC_SUPABASE_URL \
  --value "https://fqjmdvvbikawuacolpyu.supabase.co" \
  --environment production

eas env:create EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "YOUR_NEW_ROTATED_ANON_KEY_FROM_STEP_5A" \
  --environment production

eas env:create EXPO_PUBLIC_ADMIN_EMAIL \
  --value "admin@beehauz.com" \
  --environment production

eas env:create EXPO_PUBLIC_ADMIN_PASSWORD \
  --value "YOUR_NEW_PASSWORD_FROM_STEP_5B" \
  --environment production

eas env:create EXPO_PUBLIC_ADMIN_USERNAME \
  --value "beehauz_admin" \
  --environment production

eas env:create EXPO_PUBLIC_ADMIN_ACCESS_CODE \
  --value "YOUR_NEW_CODE_FROM_STEP_5C" \
  --environment production

# Repeat for PREVIEW environment
eas env:create EXPO_PUBLIC_SUPABASE_URL \
  --value "https://fqjmdvvbikawuacolpyu.supabase.co" \
  --environment preview

eas env:create EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "YOUR_NEW_ROTATED_ANON_KEY_FROM_STEP_5A" \
  --environment preview

eas env:create EXPO_PUBLIC_ADMIN_EMAIL \
  --value "admin@beehauz.com" \
  --environment preview

eas env:create EXPO_PUBLIC_ADMIN_PASSWORD \
  --value "YOUR_NEW_PASSWORD_FROM_STEP_5B" \
  --environment preview

eas env:create EXPO_PUBLIC_ADMIN_USERNAME \
  --value "beehauz_admin" \
  --environment preview

eas env:create EXPO_PUBLIC_ADMIN_ACCESS_CODE \
  --value "YOUR_NEW_CODE_FROM_STEP_5C" \
  --environment preview
```

**Note:** The old `eas secret:create` command is deprecated. Always use `eas env:create` as shown above.

**Verify environment variables were created:**

```bash
eas env:list
```

Expected output:
```
Environment variables for @aironevonn/my-new-app

┌────────────────────────────────┬──────────────┬──────────┐
│ Name                           │ Environments │ Updated  │
├────────────────────────────────┼──────────────┼──────────┤
│ EXPO_PUBLIC_SUPABASE_URL       │ production   │ Just now │
│                                │ preview      │          │
│ EXPO_PUBLIC_SUPABASE_ANON_KEY  │ production   │ Just now │
│                                │ preview      │          │
│ EXPO_PUBLIC_ADMIN_EMAIL        │ production   │ Just now │
│                                │ preview      │          │
│ EXPO_PUBLIC_ADMIN_PASSWORD     │ production   │ Just now │
│                                │ preview      │          │
│ EXPO_PUBLIC_ADMIN_USERNAME     │ production   │ Just now │
│                                │ preview      │          │
│ EXPO_PUBLIC_ADMIN_ACCESS_CODE  │ production   │ Just now │
│                                │ preview      │          │
└────────────────────────────────┴──────────────┴──────────┘
```

---

## 📝 Step 7: Update Local .env File

Update your local `.env` file with the NEW credentials:

```bash
# Edit .env
nano .env
```

Update with NEW values:
```
EXPO_PUBLIC_SUPABASE_URL=https://fqjmdvvbikawuacolpyu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key_from_step_5A
EXPO_PUBLIC_ADMIN_EMAIL=admin@beehauz.com
EXPO_PUBLIC_ADMIN_PASSWORD=your_new_password_from_step_5B
EXPO_PUBLIC_ADMIN_USERNAME=beehauz_admin
EXPO_PUBLIC_ADMIN_ACCESS_CODE=your_new_code_from_step_5C
```

**Verify .env is NOT tracked by git:**

```bash
git check-ignore .env
# Should output: .env

git status
# Should NOT show .env as a changed file
```

---

## 🧪 Step 8: Test Everything Works

### Test Local Development

```bash
# Clear cache and restart
rm -rf node_modules/.cache
npm start
```

Try logging in with the NEW admin credentials.

### Test EAS Build

```bash
# Build for Android (preview)
eas build --platform android --profile preview

# Build for iOS (preview)
eas build --platform ios --profile preview
```

Verify the builds use the correct environment variables.

---

## 👥 Step 9: Notify Team Members

If you work with a team, they need to re-clone the repository:

**Send this message to your team:**

```
🚨 Git history has been rewritten to remove sensitive credentials.

Please:
1. Commit and push any local changes NOW
2. Delete your local repository
3. Re-clone from the remote:
   git clone <repository-url>

Do NOT try to pull or merge - this will cause conflicts!
```

---

## ✅ Final Verification Checklist

Go through this checklist to ensure everything is secure:

- [ ] Ran `git log --all --full-history -- eas.json` and got no results
- [ ] Force pushed to remote repository
- [ ] Rotated Supabase anon key
- [ ] Changed admin password
- [ ] Generated new access code
- [ ] Created all EAS secrets
- [ ] Updated local `.env` with new credentials
- [ ] Verified `.env` is in `.gitignore`
- [ ] Tested local development with new credentials
- [ ] Tested EAS build works
- [ ] Team members notified (if applicable)
- [ ] Deleted backup repository: `rm -rf ~/beehauzv2-backup`

---

## 🆘 Troubleshooting

### "WARNING: git-filter-branch has a glut of gotchas"

This warning is normal. Git recommends using `git-filter-repo` instead, but `filter-branch` works fine for our use case.

### "Cannot rewrite branch(es) with a dirty index"

You have uncommitted changes. Commit or stash them first:
```bash
git stash
# Then run filter-branch again
git stash pop
```

### Team member gets "non-fast-forward" error

They need to re-clone the repository, not pull:
```bash
cd ~
rm -rf beehauzv2
git clone <repository-url>
```

### Builds fail with "missing environment variable"

Make sure all EAS secrets are created:
```bash
eas secret:list
```

If any are missing, create them:
```bash
eas secret:create --scope project --name MISSING_VAR --value "value" --type string
```

---

## 📚 What You Learned

- ✅ How to remove sensitive files from git history using `git filter-branch`
- ✅ How to clean up git references and garbage collect
- ✅ How to force push safely
- ✅ How to rotate compromised credentials
- ✅ How to use EAS secrets instead of hardcoding values
- ✅ Best practices for handling secrets in mobile app development

---

## 🎓 Key Takeaways

1. **Never commit secrets** - Always use `.gitignore` for `.env` files
2. **Use secret management** - EAS Secrets, GitHub Secrets, etc.
3. **Rotate immediately** - If credentials are exposed, rotate them ASAP
4. **Force push is dangerous** - Only use when necessary, coordinate with team
5. **History is forever** - Once in git history, assume it's compromised

---

**Next Steps:**
1. Follow this guide step-by-step
2. Check each item on the verification checklist
3. Read [EAS_SECRETS_SETUP.md](./EAS_SECRETS_SETUP.md) for ongoing secret management

---

Created: 2026-02-10
Last Updated: 2026-02-10
