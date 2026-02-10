# 🚨 CRITICAL SECURITY FIXES REQUIRED

**DO NOT DEPLOY TO PRODUCTION UNTIL THESE STEPS ARE COMPLETED**

This document contains step-by-step instructions to fix the critical security vulnerabilities identified in the codebase.

---

## ⚠️ IMMEDIATE ACTIONS REQUIRED

### 1. Remove .env from Git History (CRITICAL)

Your `.env` file with sensitive credentials has been committed to version control. Even though it's now in `.gitignore`, it exists in the git history and anyone with repository access can retrieve it.

#### Step 1: Remove .env from Git History

**Option A: Using BFG Repo-Cleaner (Recommended - Faster)**

```bash
# Install BFG (Mac with Homebrew)
brew install bfg

# Backup your repository first
cd /Users/aironevonnvillasor/beehauzv2
git clone --mirror . ../beehauzv2-backup.git

# Remove .env from history
bfg --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history)
git push origin --force --all
```

**Option B: Using git filter-branch (More Manual)**

```bash
# Backup your repository first
cd /Users/aironevonnvillasor/beehauzv2
git clone . ../beehauzv2-backup

# Remove .env from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history)
git push origin --force --all
git push origin --force --tags
```

**⚠️ WARNING:** Force pushing rewrites git history. Make sure:
- All team members are notified
- Everyone re-clones the repository after this operation
- Any open pull requests will need to be recreated

#### Step 2: Verify .env is Removed

```bash
# Search git history for .env
git log --all --full-history -- .env

# If nothing appears, the file has been successfully removed
```

---

### 2. Rotate All Credentials (CRITICAL)

All credentials in your `.env` file must be rotated immediately.

#### A. Rotate Supabase Credentials

1. **Log in to Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Navigate to your project: `fqjmdvvbikawuacolpyu`

2. **Rotate the Anonymous Key:**
   - Go to Settings > API
   - Click "Regenerate" next to the `anon` key
   - Copy the new key

3. **Update Your .env File:**
   ```bash
   # Create new .env file
   cp .env.example .env

   # Edit .env with new credentials
   nano .env
   ```

   Update with the NEW Supabase anon key:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://fqjmdvvbikawuacolpyu.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<YOUR_NEW_ANON_KEY>
   ```

4. **Verify .env is in .gitignore:**
   ```bash
   # Check if .env is ignored
   git check-ignore .env

   # Should output: .env
   ```

#### B. Change Admin Password

1. **Log in to Supabase:**
   - Go to Authentication > Users
   - Find the admin user (admin@beehauz.com)
   - Click "Reset Password"
   - Set a NEW strong password (minimum 16 characters, mix of uppercase, lowercase, numbers, symbols)

2. **Update .env File:**
   ```
   EXPO_PUBLIC_ADMIN_EMAIL=admin@beehauz.com
   EXPO_PUBLIC_ADMIN_PASSWORD=<YOUR_NEW_STRONG_PASSWORD>
   ```

   **Example of a strong password:**
   ```
   BetaAnalytics2026!Secure#PassW0rd$
   ```

3. **DO NOT commit this file to git**

---

### 3. Audit Supabase Row Level Security (RLS) Policies

Since your Supabase keys were exposed, you must verify your RLS policies are properly configured.

#### Step 1: Review RLS Policies

```sql
-- In Supabase SQL Editor, run:
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

#### Step 2: Ensure RLS is Enabled on All Tables

```sql
-- Check which tables have RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

#### Step 3: Enable RLS if Not Enabled

```sql
-- For each table without RLS (rowsecurity = false), run:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_ratings ENABLE ROW LEVEL SECURITY;
-- Add other tables as needed
```

#### Step 4: Create Secure RLS Policies

Example for profiles table:
```sql
-- Allow users to read only their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
```

---

### 4. Implement Server-Side Admin Authentication (CRITICAL)

Currently, admin authentication is done entirely on the client-side. This is **extremely insecure**.

#### Option A: Use Supabase Custom Claims (Recommended)

1. **Create a Database Function:**

```sql
-- In Supabase SQL Editor
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT user_type = 'admin'
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

2. **Update RLS Policies to Use This Function:**

```sql
-- Example: Only admins can delete users
CREATE POLICY "Only admins can delete users"
  ON profiles FOR DELETE
  TO authenticated
  USING (is_admin());
```

3. **Remove Client-Side Admin Checks:**
   - The current `AdminAccessManager` checks are client-side only
   - All admin operations should verify admin status via RLS policies
   - Never trust the client to determine authorization

#### Option B: Use Supabase Edge Functions

Create a Supabase Edge Function that validates admin status server-side:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize functions
supabase functions new verify-admin

# Deploy function
supabase functions deploy verify-admin
```

---

### 5. Set Up Environment Variables Properly

#### For Development:

1. **Never commit .env files**
   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep ".env"
   ```

2. **Use .env.example as template**
   ```bash
   # .env.example (safe to commit)
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   EXPO_PUBLIC_ADMIN_EMAIL=your_admin_email_here
   EXPO_PUBLIC_ADMIN_PASSWORD=your_secure_password_here
   ```

#### For Production:

1. **Use EAS Build Secrets (for Expo)**
   ```bash
   # Install EAS CLI
   npm install -g eas-cli

   # Set production secrets
   eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co" --type string
   eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your_prod_key" --type string
   ```

2. **Never use `EXPO_PUBLIC_` prefix for secrets**
   - `EXPO_PUBLIC_` makes variables available in client code
   - True secrets should only be in backend/edge functions
   - Consider using Supabase Edge Functions for sensitive operations

---

### 6. Security Checklist

Before deploying to production, verify:

- [ ] `.env` file removed from git history
- [ ] All credentials rotated (Supabase keys, admin password)
- [ ] RLS policies enabled and tested on all tables
- [ ] Admin authentication moved to server-side
- [ ] Environment variables set up in EAS Build secrets
- [ ] Run `npm audit` and fix all high/critical vulnerabilities
- [ ] Test password requirements (12+ characters, complexity)
- [ ] Test rate limiting on login (5 attempts, 15 min lockout)
- [ ] Verify encrypted storage is working for admin sessions
- [ ] All console.log statements with sensitive data removed
- [ ] Input validation working on all forms

---

### 7. Test Security Fixes

#### Test Rate Limiting:
```bash
# Try logging in with wrong password 6 times
# Should see "Too many login attempts" error
```

#### Test Password Requirements:
```bash
# Try signing up with weak password
# Should reject: "Password must be at least 12 characters"
```

#### Test Encrypted Storage:
```bash
# On device, check if admin session is encrypted
# Should NOT be readable in plain AsyncStorage
```

---

### 8. Additional Security Measures

#### Enable Two-Factor Authentication (2FA) in Supabase:

```bash
# Users can enable 2FA through Supabase Auth
# https://supabase.com/docs/guides/auth/auth-mfa
```

#### Set Up Security Monitoring:

1. **Enable Supabase Auth Logs:**
   - Go to Supabase Dashboard > Authentication > Logs
   - Monitor for suspicious login attempts

2. **Set Up Alerts:**
   - Configure alerts for multiple failed login attempts
   - Monitor for unusual access patterns

3. **Regular Security Audits:**
   - Run `npm audit` weekly
   - Review Supabase logs monthly
   - Update dependencies regularly

---

## 📞 Need Help?

If you encounter issues:

1. **Supabase Support:**
   - https://supabase.com/docs
   - Discord: https://discord.supabase.com

2. **Security Issues:**
   - DO NOT post sensitive information in public forums
   - Use Supabase support chat for credential-related issues

---

## ✅ Verification Steps

After completing all steps above:

1. **Test the Application:**
   ```bash
   npm start
   # Test all authentication flows
   # Verify admin access works with new credentials
   ```

2. **Verify Git History is Clean:**
   ```bash
   git log --all --full-history -- .env
   # Should return nothing
   ```

3. **Check for Other Secrets:**
   ```bash
   # Search for potential hardcoded secrets
   grep -r "password" --include="*.ts" --include="*.tsx" src/
   grep -r "api_key" --include="*.ts" --include="*.tsx" src/
   grep -r "secret" --include="*.ts" --include="*.tsx" src/
   ```

4. **Run Security Scan:**
   ```bash
   npm audit
   # Fix all HIGH and CRITICAL vulnerabilities
   npm audit fix
   ```

---

## 🎯 Summary

**What was fixed in the code:**
- ✅ Removed debug logging of sensitive user data
- ✅ Implemented rate limiting on authentication (5 attempts per 15 min)
- ✅ Increased password requirements to 12 characters with complexity
- ✅ Migrated admin sessions to encrypted storage (expo-secure-store)
- ✅ Added input validation with Zod

**What YOU must do manually:**
- ⚠️ Remove .env from git history
- ⚠️ Rotate Supabase anon key
- ⚠️ Change admin password
- ⚠️ Audit and fix RLS policies
- ⚠️ Implement server-side admin authentication
- ⚠️ Set up proper environment variable management

**Estimated Time:** 2-3 hours

**Priority:** CRITICAL - Do this before any production deployment

---

Last Updated: 2026-02-10
