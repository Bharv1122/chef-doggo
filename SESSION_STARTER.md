# Chef Doggo - Session Starter Guide

**Copy-paste this at the start of each new conversation/task.**

---

## Quick Start Message

```
Continue working on Chef Doggo app.

Project location: /home/ubuntu/chef-doggo
GitHub: https://github.com/Bharv1122/chef-doggo

Read these files for context:
1. PROJECT_STATUS.md - Current state and completed features
2. todo.md - Feature checklist and roadmap
3. ARCHITECTURE.md - Technical structure
4. DESIGN_SYSTEM.md - Visual standards

Today I want to: [YOUR SPECIFIC GOAL]
```

---

## Project Quick Facts

| Item | Value |
|------|-------|
| **Project Name** | Chef Doggo |
| **Tagline** | Turn Kibble into Cuisine |
| **Path** | `/home/ubuntu/chef-doggo` |
| **GitHub** | https://github.com/Bharv1122/chef-doggo |
| **Latest Checkpoint** | `454136ba` |
| **Tech Stack** | React 19, TypeScript, TailwindCSS 4, tRPC, Express, MySQL |

---

## Key Documentation Files

| File | Purpose |
|------|---------|
| `PROJECT_STATUS.md` | Current state, completed features, roadmap |
| `todo.md` | Feature checklist with checkboxes |
| `ARCHITECTURE.md` | Technical structure, data flow, API docs |
| `DESIGN_SYSTEM.md` | Colors, typography, component patterns |
| `CANINE_NUTRITION_KNOWLEDGE_BASE.md` | Veterinary nutrition research |
| `RECIPE_CUSTOMIZATION_FEATURE_SPEC.md` | Feature specifications |

---

## Common Commands

```bash
# Navigate to project
cd /home/ubuntu/chef-doggo

# Start dev server
pnpm dev

# Run tests
pnpm test

# Push database changes
pnpm db:push

# Push to GitHub
git add -A && git commit -m "Description" && git push github main
```

---

## Feature Request Template

When asking for a new feature, include:

```
Add [FEATURE NAME] to Chef Doggo.

Description: [What it should do]
Location: [Which page/component]
Priority: [High/Medium/Low]
Reference: [Any similar features or examples]
```

---

## Bug Report Template

When reporting a bug:

```
Bug in Chef Doggo: [SHORT DESCRIPTION]

Page/Component: [Where it happens]
Steps to reproduce:
1. [Step 1]
2. [Step 2]
Expected: [What should happen]
Actual: [What actually happens]
```

---

## Session End Checklist

Before ending a session, ensure:

- [ ] `todo.md` updated with completed items marked [x]
- [ ] `PROJECT_STATUS.md` updated with changes
- [ ] Checkpoint saved with `webdev_save_checkpoint`
- [ ] Code pushed to GitHub: `git push github main`
- [ ] Any new documentation files created

---

## Rollback Instructions

If something breaks:

```
Rollback Chef Doggo to checkpoint [VERSION_ID]

Available checkpoints:
- 454136ba - v1.1 with demo video and documentation
- 2c8a435d - v1.0 initial release
```

---

## Important Context

### What This App Does
1. User uploads photo of dog food (kibble) ingredient label
2. AI extracts ingredients from the image
3. User creates/selects a dog profile (breed, weight, age, allergies)
4. AI generates fresh homemade recipe tailored to the dog
5. Recipe includes supplements with purchase links
6. User can save, favorite, and print recipes

### Legal Requirements
- All recipes MUST display veterinary consultation warnings
- Supplement recommendations are required (calcium, multivitamin)
- Toxic foods (xylitol, chocolate, grapes, onions, garlic) auto-excluded
- Affiliate disclosures required for purchase links

### Design Philosophy
- "Playful Modernism" - fun but trustworthy
- Primary color: Orange (#FF8C42)
- Mascot: Red heeler puppy with chef hat
- Fonts: Fredoka (headings), Nunito (body)

---

## Suggested Session Goals

Pick one per session for best results:

1. **Test & Fix** - "Test the full recipe generation flow and fix any issues"
2. **Meal Planning** - "Add weekly meal planning feature"
3. **Shopping List** - "Generate shopping lists from recipes"
4. **More Retailers** - "Add Amazon and Petco affiliate links"
5. **Mobile Polish** - "Improve mobile navigation and touch targets"
6. **Recipe Photos** - "Add AI-generated images of finished meals"
7. **User Feedback** - "Add recipe rating and feedback system"
8. **Recipe History** - "Track recipe generation history"
