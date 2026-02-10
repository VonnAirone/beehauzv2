# Fix EAS Project Slug Mismatch

## The Warning You're Seeing

```
Project config: Slug for project identified by "extra.eas.projectId" (my-new-app)
does not match the "slug" field (beehauz).
```

## What This Means

- Your EAS project name: `my-new-app`
- Your app.json slug: `beehauz`

This mismatch happens when the EAS project was created before the app slug was finalized. It's **not critical** but creates confusing warnings.

## How to Fix It

### **Option 1: Update app.json Slug to Match EAS Project** (Recommended - Easiest)

Update your app.json to match the EAS project name:

```json
{
  "expo": {
    "name": "Beehauz",
    "slug": "my-new-app",  // Changed from "beehauz" to "my-new-app"
    // ... rest of config
  }
}
```

**Pros:**
- Quick and easy
- No need to recreate EAS project
- Keeps existing EAS project ID

**Cons:**
- URLs will have "my-new-app" instead of "beehauz"
- Package/bundle names won't change (they're already set)

### **Option 2: Keep "beehauz" Slug and Ignore the Warning**

Do nothing - the warning is non-critical and won't affect builds.

**Pros:**
- No changes needed
- Keeps consistent "beehauz" branding

**Cons:**
- You'll see the warning every time you run EAS commands

### **Option 3: Create a New EAS Project with "beehauz" Slug** (Advanced)

1. Create a new EAS project:
```bash
eas init
```

2. When prompted, select "Create a new project"
3. This will update `extra.eas.projectId` in app.json

**Pros:**
- Everything matches perfectly

**Cons:**
- Requires reconfiguring everything
- Loses existing EAS build history

## My Recommendation

**Use Option 1** - Update the slug in app.json to "my-new-app". The slug is mainly for internal URLs and doesn't affect your app's display name or package identifiers, which are already set.

## After You Choose

Whichever option you pick, the environment variable commands will work the same:

```bash
eas env:create EXPO_PUBLIC_SUPABASE_URL --value "..." --environment production
# etc.
```

## Note About Display Name

The app **display name** shown to users is controlled by the `"name"` field, not `"slug"`:

```json
{
  "expo": {
    "name": "Beehauz",  // This is what users see
    "slug": "my-new-app",  // This is for URLs/internal use
  }
}
```

So users will still see "Beehauz" even if the slug is "my-new-app".
