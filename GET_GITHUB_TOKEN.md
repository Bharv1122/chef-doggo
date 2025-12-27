# How to Get a GitHub Personal Access Token

## Quick Steps (2 Minutes)

### Step 1: Go to GitHub Token Settings

**Direct Link**: https://github.com/settings/tokens

OR manually navigate:
1. Log in to GitHub.com
2. Click your **profile picture** (top-right)
3. Click **Settings**
4. Scroll down the left sidebar
5. Click **Developer settings** (near the bottom)
6. Click **Personal access tokens**
7. Click **Tokens (classic)**

---

### Step 2: Generate New Token

1. Click the **"Generate new token"** button (top-right)
2. Select **"Generate new token (classic)"**
   - (Don't use fine-grained tokens for this)

---

### Step 3: Configure Token

You'll see a form with these fields:

#### **Note** (Required)
- Enter: `Chef Doggo Push Access`
- This is just a label so you remember what it's for

#### **Expiration** (Required)
- Choose: **90 days** (or longer if you prefer)
- You can always create a new token when it expires

#### **Select scopes** (MOST IMPORTANT)

**You MUST check this box:**
- ☑️ **`repo`** - Full control of private repositories
  - This automatically checks all sub-boxes:
    - ☑️ repo:status
    - ☑️ repo_deployment
    - ☑️ public_repo
    - ☑️ repo:invite
    - ☑️ security_events

**Leave these UNCHECKED** (you don't need them):
- ☐ workflow
- ☐ write:packages
- ☐ delete:packages
- ☐ admin:org
- ☐ admin:public_key
- ☐ admin:repo_hook
- ☐ gist
- ☐ notifications
- ☐ user
- ☐ delete_repo
- ☐ write:discussion
- ☐ admin:enterprise
- ☐ audit_log
- ☐ project

---

### Step 4: Generate Token

1. Scroll to the bottom
2. Click the green **"Generate token"** button

---

### Step 5: COPY THE TOKEN IMMEDIATELY

**CRITICAL**: You'll see a page with a long token starting with `ghp_`

Example: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**IMPORTANT**:
- ⚠️ **This is your ONLY chance to see this token!**
- ⚠️ **Copy it NOW** (click the copy icon or select + Ctrl/Cmd+C)
- ⚠️ **GitHub will NEVER show it again**
- ✅ Save it somewhere safe (password manager, notes app, etc.)

---

### Step 6: Use the Token to Push

Now go back to DeepAgent and run these commands:

```bash
cd /home/ubuntu/chef_doggo

# Remove old remote (if exists)
git remote remove origin 2>/dev/null || true

# Add remote with YOUR TOKEN
# Replace ghp_YOUR_TOKEN_HERE with the token you just copied
git remote add origin https://ghp_YOUR_TOKEN_HERE@github.com/Bharv1122/chef-doggo.git

# Push all your code!
git push -u origin master
```

**Example** (with fake token):
```bash
git remote add origin https://ghp_abc123xyz789def456ghi789jkl012mno345@github.com/Bharv1122/chef-doggo.git
git push -u origin master
```

You should see:
```
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Delta compression using up to 8 threads
Compressing objects: 100% (120/120), done.
Writing objects: 100% (150/150), 250.00 KiB | 5.00 MiB/s, done.
Total 150 (delta 80), reused 0 (delta 0)
To https://github.com/Bharv1122/chef-doggo.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.
```

✅ **Success!** Visit https://github.com/Bharv1122/chef-doggo

---

## Visual Guide

Here's what each page looks like:

### Page 1: Settings Menu
```
GitHub → [Profile Picture] → Settings

Left Sidebar:
- Profile
- Account
- Appearance
- ...
- Developer settings  ← Click here
```

### Page 2: Developer Settings
```
Developer settings

Left menu:
- GitHub Apps
- OAuth Apps  
- Personal access tokens  ← Click here
  - Fine-grained tokens
  - Tokens (classic)  ← Click here
```

### Page 3: Personal Access Tokens
```
[Generate new token ▼]  ← Click here
  - Generate new token (classic)  ← Select this
  - Generate new token (beta)
```

### Page 4: New Token Form
```
Note: [Chef Doggo Push Access]

Expiration: [90 days ▼]

Select scopes:
☑️ repo  ← CHECK THIS BOX
   ☑️ repo:status
   ☑️ repo_deployment  
   ☑️ public_repo
   ☑️ repo:invite
   ☑️ security_events
☐ workflow
☐ write:packages
...

[Generate token]  ← Click here
```

### Page 5: Token Generated
```
✅ Token successfully created

ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  [📋 Copy]
   ↑
   YOUR TOKEN - COPY IT NOW!

⚠️ Make sure to copy your personal access token now.
   You won't be able to see it again!
```

---

## Troubleshooting

### "I forgot to copy the token"
**Solution**: Delete the old token and create a new one
1. Go to https://github.com/settings/tokens
2. Find "Chef Doggo Push Access"
3. Click **Delete**
4. Create a new token (follow steps above)

### "I see 'Authentication failed'"
**Possible causes**:
1. Token wasn't copied correctly (extra spaces?)
2. Token expired
3. `repo` scope wasn't checked

**Solution**: Create a new token and try again

### "I don't see 'Developer settings'"
**Solution**: You might need to scroll down in the Settings sidebar
- It's near the bottom, below "Applications"
- Try using the direct link: https://github.com/settings/tokens

### "Remote already exists" error
```bash
# Just remove it first:
git remote remove origin

# Then add the new one:
git remote add origin https://YOUR_TOKEN@github.com/Bharv1122/chef-doggo.git
```

---

## Security Tips

✅ **DO**:
- Store token in password manager
- Use descriptive token names
- Set expiration dates
- Delete unused tokens
- Create separate tokens for different projects

❌ **DON'T**:
- Share tokens publicly
- Commit tokens to git repositories
- Use tokens in public URLs
- Give tokens more permissions than needed
- Reuse tokens across many projects

---

## Token Management

### View Your Tokens
https://github.com/settings/tokens

You'll see:
- Token name
- Last used date
- Created date
- Expiration date

### Revoke a Token
1. Go to https://github.com/settings/tokens
2. Find the token
3. Click **Delete**
4. Confirm deletion

### Regenerate Expired Token
1. Delete the old token
2. Create a new token (follow steps above)
3. Update your git remote with the new token

---

## Alternative: SSH Keys (Advanced)

If you prefer SSH instead of tokens:

1. Generate SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
2. Add to GitHub: https://github.com/settings/keys
3. Use SSH URL: `git@github.com:Bharv1122/chef-doggo.git`

But for quick one-time pushes, Personal Access Token is easier!

---

## Summary

1. ✅ Go to: https://github.com/settings/tokens
2. ✅ Click: "Generate new token (classic)"
3. ✅ Name: "Chef Doggo Push Access"
4. ✅ Check: ☑️ `repo` scope
5. ✅ Click: "Generate token"
6. ✅ **COPY THE TOKEN** (starts with `ghp_`)
7. ✅ Use in command:
   ```bash
   git remote add origin https://YOUR_TOKEN@github.com/Bharv1122/chef-doggo.git
   git push -u origin master
   ```

**That's it!** Your Chef Doggo code will be on GitHub! 🎉
