# EAS Environment Variables - Command Reference

## 🎯 Quick Command Format

```bash
eas env:create --name VARIABLE_NAME \
  --value "variable_value" \
  --environment production \
  --visibility plaintext
```

## 📋 Required Flags

| Flag | Description | Options |
|------|-------------|---------|
| `--name` | Variable name | Any valid env var name |
| `--value` | Variable value | The actual value (in quotes) |
| `--environment` | Which environment | `production`, `preview`, `development` |
| `--visibility` | How it's stored | `plaintext` or `secret` |

## 💡 Visibility Explained

- **`plaintext`**: Variable is embedded in your app bundle
  - Use for: `EXPO_PUBLIC_*` variables
  - These are readable by end users
  - Perfect for: API URLs, public keys

- **`secret`**: Variable is encrypted and only available at build time
  - Use for: Backend secrets, private keys
  - NOT accessible in the app after build
  - Perfect for: Build-time secrets

## ✅ For This Project (All Plaintext)

Since all your variables start with `EXPO_PUBLIC_`, they ALL use `--visibility plaintext`:

```bash
# Example for one variable
eas env:create --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://fqjmdvvbikawuacolpyu.supabase.co" \
  --environment production \
  --visibility plaintext
```

## 🚀 Using the Automated Script

**Easiest method:**

1. Edit `setup-eas-env.sh` and replace `YOUR_NEW_*` with actual values
2. Run: `./setup-eas-env.sh`
3. Verify: `eas env:list`

## 📝 Common Commands

```bash
# Create a variable
eas env:create --name VAR_NAME --value "value" --environment production --visibility plaintext

# List all variables
eas env:list

# List for specific environment
eas env:list --environment production

# Delete a variable
eas env:delete --name VAR_NAME --environment production

# Update a variable (delete then create)
eas env:delete --name VAR_NAME --environment production
eas env:create --name VAR_NAME --value "new_value" --environment production --visibility plaintext
```

## ⚠️ Important Notes

1. **EXPO_PUBLIC_* variables** are embedded in your app → anyone can read them
2. **Always use plaintext** for EXPO_PUBLIC_* variables
3. **Use secret** only for build-time secrets (not EXPO_PUBLIC_*)
4. Variables are **per-environment** (production, preview, development)
5. To change a value, you must **delete and recreate** the variable

## 🎓 Example: Complete Setup

```bash
# Production
eas env:create --name EXPO_PUBLIC_API_URL \
  --value "https://api.example.com" \
  --environment production \
  --visibility plaintext

# Preview (can use different value)
eas env:create --name EXPO_PUBLIC_API_URL \
  --value "https://preview-api.example.com" \
  --environment preview \
  --visibility plaintext

# Development (can use different value)
eas env:create --name EXPO_PUBLIC_API_URL \
  --value "http://localhost:3000" \
  --environment development \
  --visibility plaintext
```

## 🔍 Troubleshooting

**Error: "The --visibility flag must be set"**
→ Add `--visibility plaintext` to your command

**Error: "Variable name already exists"**
→ Delete it first: `eas env:delete --name VAR_NAME --environment production`

**Variables not working in build?**
→ Run `eas env:list` to verify they're set correctly
→ Make sure environment matches your build profile (preview/production)

---

**Pro Tip:** Use `setup-eas-env.sh` script to set up all variables at once!
