# How to Change Default Branch from 'main' to 'master'

## Current Situation
- ✅ Your code is on: **`master`** branch
- ❌ Default branch is: **`main`** branch (empty or old code)
- 🎯 Goal: Make **`master`** the default so people see your latest code

---

## Visual Step-by-Step Guide

### You're Already on the Right Page!

You're currently at:
```
github.com/Bharv1122/chef-doggo/settings/branches
```

This is EXACTLY where you need to be! ✅

---

### Step 1: Scroll to the TOP of the Page

**What you see now**: "Branch protection rules" section

**What you need to see**: Look at the very top, **above** "Branch protection rules"

You'll see a box that looks like this:

```
┌────────────────────────────────────────────────────────┐
│  Default branch                                        │
│  ──────────────────────────────────────────────────    │
│                                                        │
│  The default branch is considered the "base" branch   │
│  in your repository, against which all pull requests   │
│  and code commits are automatically made.              │
│                                                        │
│  [main ▼]  [⇄ icon or pencil icon]                   │
│     ↑                    ↑                             │
│  Current branch     Switch/Edit button                │
└────────────────────────────────────────────────────────┘
```

---

### Step 2: Click the Switch Button

You'll see one of these buttons next to "main":
- **Pencil icon (✏️)**
- **Switch arrows icon (⇄)**
- Or a **dropdown arrow (▼)** next to "main"

**Click it!**

---

### Step 3: Select 'master' Branch

A dropdown or modal will appear showing:
```
┌─────────────────────────┐
│ Switch default branch   │
├─────────────────────────┤
│ ○ main                  │
│ ◉ master  ← Click this! │
└─────────────────────────┘
```

Select **`master`**

---

### Step 4: Confirm the Change

GitHub will show a warning:
```
┌──────────────────────────────────────────────────────┐
│  ⚠️  This will change the default branch to master  │
│                                                      │
│  This may affect open pull requests and actions.    │
│                                                      │
│  [ Cancel ]  [ I understand, update default branch] │
└──────────────────────────────────────────────────────┘
```

Click **"I understand, update the default branch"**

---

### Step 5: Verify Success ✅

You should see:
```
✅ Default branch updated to master
```

Now the "Default branch" section will show:
```
[master ▼]  [⇄]
```

---

## Why This Matters

### Before Change (Current):
- Someone visits: https://github.com/Bharv1122/chef-doggo
- They see the **`main`** branch (might be empty or have old code)
- Your Phase 1A/1B/1C work is NOT visible 😞

### After Change:
- Someone visits: https://github.com/Bharv1122/chef-doggo
- They see the **`master`** branch with all your latest code
- All 13 commits, 197 files, documentation visible 🎉

---

## Alternative: Use GitHub CLI (If You Have It)

If you have GitHub CLI installed locally:
```bash
gh repo edit Bharv1122/chef-doggo --default-branch master
```

---

## Troubleshooting

### "I don't see the Default Branch section"
**Solution**: 
- Make sure you're on the "Branches" page (left sidebar)
- Scroll ALL THE WAY to the top
- It should be the FIRST thing on the page

### "The dropdown only shows 'main'"
**Solution**: 
- Refresh the page (F5 or Ctrl+R)
- Make sure the `master` branch exists (it does - we just pushed it!)
- You might need to wait 30 seconds for GitHub to update

### "I see 'Protected branch' warning"
**Solution**: 
- Click "I understand" - your code is safe
- This is just GitHub being cautious
- You can change it back anytime

---

## After Changing

### Test It Works
1. Go to: https://github.com/Bharv1122/chef-doggo
2. Look at the branch dropdown (top-left)
3. It should show **`master`** selected by default
4. You should see your README.md with Chef Doggo content
5. File list should show 197 files

### Delete the 'main' Branch (Optional)

Once `master` is the default, you can delete `main` if it's empty:

1. Go to: https://github.com/Bharv1122/chef-doggo/branches
2. Find the `main` branch
3. Click the trash icon 🗑️ next to it
4. Confirm deletion

This prevents confusion about which branch to use.

---

## Current Status

**Repository**: https://github.com/Bharv1122/chef-doggo

**Branches**:
- `main` - Currently default ❌ (change this!)
- `master` - Your code is here ✅ (make this default!)

**Commits on `master`**:
```
fd79d4e - Latest checkpoints
8cbae46 - Add detailed GitHub Personal Access Token guide  
3047ef1 - Add comprehensive GitHub push guide
5230998 - Phase 1C Complete: Holistic Medicine & Safety
089ccd9 - Add GitHub integration setup guide
deb55b4 - Fix TypeScript errors
2cb2576 - Phase 1C: TCVM/Ayurveda integration
8aa2786 - Phase 1B Complete: Advanced Features
... (13 total commits)
```

---

## Need Help?

If you're still stuck:

1. **Take a screenshot** of what you see at the top of the Branches page
2. Share it and I'll guide you through it
3. Or try the GitHub docs: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/changing-the-default-branch

---

## Summary

1. ✅ You're already on the right page: `.../settings/branches`
2. ⬆️ Scroll to the TOP of the page
3. 👁️ Look for "Default branch" section
4. 🖱️ Click the switch/edit button next to "main"
5. ✅ Select "master"
6. ✅ Click "I understand, update the default branch"
7. 🎉 Done! Your code is now visible to everyone!

**Current default**: `main` ❌  
**Should be**: `master` ✅  
**Where to change**: Top of the page you're already on!
