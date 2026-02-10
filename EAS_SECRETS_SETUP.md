# EAS Secrets Setup Guide

## ⚠️ IMPORTANT: Never Hardcode Secrets in eas.json

Your credentials should be stored as **EAS Secrets**, not in the `eas.json` file.

## Setting Up EAS Secrets

### 1. Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

### 2. Login to EAS

```bash
eas login
```

### 3. Create Secrets for Your Project

Run these commands to create each secret:

```bash
# Supabase credentials
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://fqjmdvvbikawuacolpyu.supabase.co" --type string

eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_NEW_ROTATED_ANON_KEY_HERE" --type string

# Admin credentials (ROTATE THESE FIRST!)
eas secret:create --scope project --name EXPO_PUBLIC_ADMIN_EMAIL --value "admin@beehauz.com" --type string

eas secret:create --scope project --name EXPO_PUBLIC_ADMIN_PASSWORD --value "YOUR_NEW_STRONG_PASSWORD_HERE" --type string

eas secret:create --scope project --name EXPO_PUBLIC_ADMIN_USERNAME --value "beehauz_admin" --type string

eas secret:create --scope project --name EXPO_PUBLIC_ADMIN_ACCESS_CODE --value "YOUR_NEW_ACCESS_CODE_HERE" --type string
```

### 4. Verify Secrets Were Created

```bash
eas secret:list
```

### 5. Build Your App

Now when you run `eas build`, it will automatically use the secrets:

```bash
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

## Security Best Practices

1. **Never commit secrets to git**
2. **Rotate credentials immediately** after removing them from git history
3. **Use strong passwords** (16+ characters, mixed case, numbers, symbols)
4. **Limit access** to EAS secrets to trusted team members only
5. **Use different credentials** for development, preview, and production

## Credential Rotation Checklist

After removing credentials from git history, you must:

- [ ] Rotate Supabase anon key (Supabase Dashboard > Settings > API)
- [ ] Change admin password (Supabase Dashboard > Authentication > Users)
- [ ] Update admin access code to a new random value
- [ ] Set all new values as EAS secrets (commands above)
- [ ] Update your local `.env` file with new credentials
- [ ] Test that builds work with new secrets

## Local Development

For local development, continue using `.env` file (which is gitignored):

```bash
# .env (NOT committed to git)
EXPO_PUBLIC_SUPABASE_URL=https://fqjmdvvbikawuacolpyu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
EXPO_PUBLIC_ADMIN_EMAIL=admin@beehauz.com
EXPO_PUBLIC_ADMIN_PASSWORD=your_new_password
EXPO_PUBLIC_ADMIN_USERNAME=beehauz_admin
EXPO_PUBLIC_ADMIN_ACCESS_CODE=your_new_code
```

## Need Help?

- EAS Secrets docs: https://docs.expo.dev/build-reference/variables/
- Supabase API docs: https://supabase.com/docs/guides/api
