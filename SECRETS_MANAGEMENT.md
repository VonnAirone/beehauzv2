# Environment Variables & Secrets Management

## 🔒 Security Notice

All sensitive credentials have been moved to environment variables and are now properly gitignored. **Never commit secrets to version control.**

## 📋 Setup Instructions

### 1. Copy Environment Template
```bash
cp .env.example .env
```

### 2. Fill in Your Secrets

Edit the `.env` file with your actual credentials:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Admin Access Credentials
EXPO_PUBLIC_ADMIN_EMAIL=admin@beehauz.com
EXPO_PUBLIC_ADMIN_PASSWORD=your-secure-admin-password-here
```

### 3. Verify .env is Gitignored

The `.gitignore` already includes `.env` files, but verify with:
```bash
git check-ignore .env
# Should return: .env
```

## 🔑 Environment Variables Reference

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | String | ✅ | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | String | ✅ | Supabase anonymous key (for client-side use) |
| `EXPO_PUBLIC_ADMIN_EMAIL` | String | ✅ | Admin login email |
| `EXPO_PUBLIC_ADMIN_PASSWORD` | String | ✅ | Admin login password |

> **Note:** `EXPO_PUBLIC_*` prefix is required for Expo to expose these to the client-side code.

## ⚠️ Important Security Guidelines

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Always use `.env.example`** - Share this template with team members
3. **Use strong passwords** - Change default admin credentials immediately
4. **Rotate secrets regularly** - Especially if compromised
5. **Review git history** - Check if secrets were previously committed:
   ```bash
   git log --oneline -S "SUPABASE_URL" -- "*.ts" "*.tsx" "*.js" "*.json"
   ```

## 🚨 If Secrets Were Already Exposed

1. **Immediately rotate compromised credentials** in Supabase dashboard
2. **Force push to remove commits** (if not yet pushed):
   ```bash
   git reset --hard HEAD~1
   ```
3. **Use git-filter-repo to remove from history** (if already pushed):
   ```bash
   # Install: pip install git-filter-repo
   git filter-repo --invert-paths --path .env
   git push --force-with-lease
   ```
4. **Notify team members** about the compromise

## 🔍 Checking for Exposed Secrets

Run this to find potential exposed secrets in the codebase:
```bash
grep -r "eyJhbGciOi\|BetaAnalytics\|fqjmdvvbikaw" src/ --include="*.ts" --include="*.tsx"
```

Should return no results (only `.env` file).

## 📚 Learn More

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security/security-best-practices)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
