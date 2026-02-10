# 🚀 Quick Fix Guide - Updated Commands

## What Changed?

EAS has updated their command syntax:
- ❌ OLD: `eas secret:create` (deprecated)
- ✅ NEW: `eas env:create` (current)

## Your Two Issues

### 1. **Slug Mismatch Warning** (Non-Critical)

   **Quick Fix:** See [FIX_EAS_SLUG_MISMATCH.md](./FIX_EAS_SLUG_MISMATCH.md)

   **TL;DR:** You can ignore it or change your app.json slug from "beehauz" to "my-new-app"

### 2. **Credentials in Git History** (CRITICAL)

   **Must Fix:** Follow [REMOVE_CREDENTIALS_FROM_GIT.md](./REMOVE_CREDENTIALS_FROM_GIT.md)

---

## ⚡ Quick Commands (Updated Syntax)

### **Step 1: Remove credentials from git history**

```bash
cd /Users/aironevonnvillasor/beehauzv2

git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch eas.json" \
  --prune-empty --tag-name-filter cat -- --all

rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

git push origin --force --all
git push origin --force --tags
```

### **Step 2: Rotate credentials**

1. **Supabase Dashboard** → Settings → API → Regenerate anon key
2. **Supabase Dashboard** → Authentication → Users → Reset admin password
3. Generate new access code: `openssl rand -base64 12`

### **Step 3: Set up environment variables (NEW COMMANDS)**

```bash
# For PRODUCTION
eas env:create EXPO_PUBLIC_SUPABASE_URL \
  --value "https://fqjmdvvbikawuacolpyu.supabase.co" \
  --environment production

eas env:create EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "YOUR_NEW_ANON_KEY" \
  --environment production

eas env:create EXPO_PUBLIC_ADMIN_EMAIL \
  --value "admin@beehauz.com" \
  --environment production

eas env:create EXPO_PUBLIC_ADMIN_PASSWORD \
  --value "YOUR_NEW_PASSWORD" \
  --environment production

eas env:create EXPO_PUBLIC_ADMIN_USERNAME \
  --value "beehauz_admin" \
  --environment production

eas env:create EXPO_PUBLIC_ADMIN_ACCESS_CODE \
  --value "YOUR_NEW_CODE" \
  --environment production

# Repeat same commands with --environment preview
```

### **Step 4: Verify**

```bash
eas env:list
```

### **Step 5: Update local .env**

```bash
nano .env
```

Paste your NEW credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://fqjmdvvbikawuacolpyu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<new_anon_key>
EXPO_PUBLIC_ADMIN_EMAIL=admin@beehauz.com
EXPO_PUBLIC_ADMIN_PASSWORD=<new_password>
EXPO_PUBLIC_ADMIN_USERNAME=beehauz_admin
EXPO_PUBLIC_ADMIN_ACCESS_CODE=<new_code>
```

---

## 📋 Checklist

- [ ] Upgraded EAS CLI: `npm install -g eas-cli@latest` ✅ (Already done!)
- [ ] Removed eas.json from git history
- [ ] Force pushed to remote
- [ ] Rotated Supabase anon key
- [ ] Changed admin password
- [ ] Generated new access code
- [ ] Created all env vars with `eas env:create`
- [ ] Updated local `.env` file
- [ ] Tested local development works
- [ ] Ran `eas env:list` to verify

---

## 🔐 Additional Security Note

I also noticed your **Google Maps API key** is exposed in `app.json` (line 49):

```json
"googleMaps": {
  "apiKey": "AIzaSyAXn-flhdb__4Fqa-4pbPJsXk9DzF2ScPo"
}
```

**Recommendation:**
1. Add API key restrictions in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Restrict to your app's package name: `com.aironevonn.beehauz`
3. Restrict to specific APIs (Maps SDK for Android/iOS)

This is **less critical** than the Supabase keys since it's an Android/iOS API key (not a JavaScript Web API key), but still good practice to restrict it.

---

## 📚 Full Documentation

- [REMOVE_CREDENTIALS_FROM_GIT.md](./REMOVE_CREDENTIALS_FROM_GIT.md) - Detailed tutorial
- [EAS_SECRETS_SETUP.md](./EAS_SECRETS_SETUP.md) - Environment variable setup
- [FIX_EAS_SLUG_MISMATCH.md](./FIX_EAS_SLUG_MISMATCH.md) - Fix the slug warning
- [SECURITY_FIXES_REQUIRED.md](./SECURITY_FIXES_REQUIRED.md) - Complete security audit

---

**Questions?** Check the troubleshooting sections in the detailed guides!
