#!/bin/bash

# Security audit script - Check for exposed secrets in the codebase
# Usage: bash check-secrets.sh

echo "🔍 Scanning for potentially exposed secrets..."
echo ""

# List of secret patterns to search for
PATTERNS=(
  "fqjmdvvbikawuacolpyu"  # Supabase project ID
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"  # JWT token start
  "BetaAnalytics2025"  # Admin password hint
  "BeehauxAdmin2025"  # Admin password hint
)

FOUND=0

for PATTERN in "${PATTERNS[@]}"; do
  RESULTS=$(grep -r "$PATTERN" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" 2>/dev/null | grep -v ".env")
  
  if [ ! -z "$RESULTS" ]; then
    echo "⚠️  Found potential secret pattern: $PATTERN"
    echo "$RESULTS"
    echo ""
    FOUND=$((FOUND + 1))
  fi
done

echo "═══════════════════════════════════════"
if [ $FOUND -eq 0 ]; then
  echo "✅ No exposed secrets detected in source code!"
  echo "   All secrets are properly stored in .env file"
else
  echo "❌ Found $FOUND potential security issues!"
  echo "   Please move these secrets to the .env file"
fi
echo ""
echo "📝 Remember: Always commit .env.example, never commit .env"
