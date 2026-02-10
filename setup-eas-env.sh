#!/bin/bash
# Setup EAS Environment Variables
# Usage: ./setup-eas-env.sh

# IMPORTANT: Replace YOUR_NEW_* with actual rotated credentials before running!

echo "Setting up PRODUCTION environment variables..."

eas env:create --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://fqjmdvvbikawuacolpyu.supabase.co" \
  --environment production \
  --visibility plaintext \
  --non-interactive

eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "YOUR_NEW_ROTATED_ANON_KEY" \
  --environment production \
  --visibility plaintext \
  --non-interactive

eas env:create --name EXPO_PUBLIC_ADMIN_EMAIL \
  --value "admin@beehauz.com" \
  --environment production \
  --visibility plaintext \
  --non-interactive

eas env:create --name EXPO_PUBLIC_ADMIN_PASSWORD \
  --value "YOUR_NEW_STRONG_PASSWORD" \
  --environment production \
  --visibility plaintext \
  --non-interactive

eas env:create --name EXPO_PUBLIC_ADMIN_USERNAME \
  --value "beehauz_admin" \
  --environment production \
  --visibility plaintext \
  --non-interactive

eas env:create --name EXPO_PUBLIC_ADMIN_ACCESS_CODE \
  --value "YOUR_NEW_ACCESS_CODE" \
  --environment production \
  --visibility plaintext \
  --non-interactive

echo ""
echo "Setting up PREVIEW environment variables..."

eas env:create --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://fqjmdvvbikawuacolpyu.supabase.co" \
  --environment preview \
  --visibility plaintext \
  --non-interactive

eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "YOUR_NEW_ROTATED_ANON_KEY" \
  --environment preview \
  --visibility plaintext \
  --non-interactive

eas env:create --name EXPO_PUBLIC_ADMIN_EMAIL \
  --value "admin@beehauz.com" \
  --environment preview \
  --visibility plaintext \
  --non-interactive

eas env:create --name EXPO_PUBLIC_ADMIN_PASSWORD \
  --value "YOUR_NEW_STRONG_PASSWORD" \
  --environment preview \
  --visibility plaintext \
  --non-interactive

eas env:create --name EXPO_PUBLIC_ADMIN_USERNAME \
  --value "beehauz_admin" \
  --environment preview \
  --visibility plaintext \
  --non-interactive

eas env:create --name EXPO_PUBLIC_ADMIN_ACCESS_CODE \
  --value "YOUR_NEW_ACCESS_CODE" \
  --environment preview \
  --visibility plaintext \
  --non-interactive

echo ""
echo "✅ Done! Verify with: eas env:list"
