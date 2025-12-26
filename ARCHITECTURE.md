# Chef Doggo - Technical Architecture

This document describes the technical architecture of Chef Doggo for development continuity.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │  Home   │  │ MyDogs  │  │Generate │  │ Recipes │            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
│       │            │            │            │                  │
│       └────────────┴─────┬──────┴────────────┘                  │
│                          │                                      │
│                    ┌─────▼─────┐                                │
│                    │   tRPC    │                                │
│                    │  Client   │                                │
│                    └─────┬─────┘                                │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTP
┌──────────────────────────┼──────────────────────────────────────┐
│                    ┌─────▼─────┐           SERVER (Express)     │
│                    │   tRPC    │                                │
│                    │  Router   │                                │
│                    └─────┬─────┘                                │
│       ┌──────────────────┼──────────────────┐                   │
│       │                  │                  │                   │
│  ┌────▼────┐       ┌─────▼─────┐      ┌─────▼─────┐            │
│  │  Auth   │       │   Dogs    │      │  Recipes  │            │
│  │ Router  │       │  Router   │      │  Router   │            │
│  └────┬────┘       └─────┬─────┘      └─────┬─────┘            │
│       │                  │                  │                   │
│       └──────────────────┼──────────────────┘                   │
│                          │                                      │
│                    ┌─────▼─────┐                                │
│                    │   db.ts   │                                │
│                    │  Queries  │                                │
│                    └─────┬─────┘                                │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   MySQL     │
                    │   (TiDB)    │
                    └─────────────┘
```

---

## Directory Structure

```
/home/ubuntu/chef-doggo/
│
├── client/                      # Frontend React application
│   ├── index.html               # HTML entry point (fonts loaded here)
│   ├── public/                  # Static assets
│   │   ├── chef-doggo-logo.png  # Main logo
│   │   └── videos/
│   │       └── dog-cooking.mp4  # Demo video
│   └── src/
│       ├── main.tsx             # React entry point
│       ├── App.tsx              # Routes & providers
│       ├── index.css            # Global styles & design tokens
│       ├── const.ts             # Frontend constants
│       ├── _core/               # Core utilities (auth hooks)
│       ├── components/          # Reusable UI components
│       │   └── ui/              # shadcn/ui components
│       ├── contexts/            # React contexts
│       ├── hooks/               # Custom hooks
│       ├── lib/
│       │   └── trpc.ts          # tRPC client setup
│       └── pages/               # Page components
│           ├── Home.tsx         # Landing page
│           ├── MyDogs.tsx       # Dog profile management
│           ├── Generate.tsx     # Recipe generation flow
│           ├── Recipes.tsx      # Saved recipes list
│           ├── Recipe.tsx       # Single recipe view
│           ├── Disclaimer.tsx   # Legal disclaimer
│           └── NotFound.tsx     # 404 page
│
├── server/                      # Backend Express/tRPC
│   ├── _core/                   # Core server utilities
│   │   ├── index.ts             # Server entry point
│   │   ├── context.ts           # tRPC context
│   │   ├── trpc.ts              # tRPC setup
│   │   ├── oauth.ts             # Manus OAuth
│   │   ├── llm.ts               # OpenAI integration
│   │   ├── env.ts               # Environment variables
│   │   └── notification.ts      # Owner notifications
│   ├── routers.ts               # tRPC route definitions
│   ├── db.ts                    # Database query functions
│   ├── recipeApi.ts             # Recipe generation endpoints
│   ├── storage.ts               # S3 file storage
│   └── *.test.ts                # Vitest test files
│
├── drizzle/                     # Database
│   ├── schema.ts                # Table definitions
│   └── *.sql                    # Migration files
│
├── shared/                      # Shared types/constants
│   └── const.ts
│
└── [Documentation Files]
    ├── PROJECT_STATUS.md
    ├── ARCHITECTURE.md
    ├── DESIGN_SYSTEM.md
    ├── SESSION_STARTER.md
    ├── todo.md
    ├── CANINE_NUTRITION_KNOWLEDGE_BASE.md
    └── RECIPE_CUSTOMIZATION_FEATURE_SPEC.md
```

---

## Data Flow

### Recipe Generation Flow

```
1. User uploads kibble label image
   └─> POST /api/analyze-kibble
       └─> GPT-4 Vision extracts ingredients
           └─> Returns ingredient list

2. User selects dog profile
   └─> trpc.dogs.get({ id })
       └─> Returns dog profile with allergies, weight, etc.

3. User clicks "Generate Recipe"
   └─> POST /api/generate-recipe
       └─> Builds prompt with:
           - Extracted ingredients
           - Dog profile (allergies, weight, age)
           - Canine nutrition guidelines
           - Toxic food exclusions
       └─> GPT-4 generates recipe JSON
           └─> Returns structured recipe

4. User saves recipe
   └─> trpc.recipes.create({ ... })
       └─> Stores in saved_recipes table
```

### Authentication Flow

```
1. User clicks "Get Started"
   └─> Redirect to Manus OAuth portal

2. User authenticates
   └─> Callback to /api/oauth/callback
       └─> Creates/updates user in database
       └─> Sets session cookie

3. Subsequent requests
   └─> Cookie sent with request
       └─> context.ts extracts user from JWT
       └─> ctx.user available in procedures
```

---

## Key Components

### Frontend

| Component | File | Purpose |
|-----------|------|---------|
| Home | `pages/Home.tsx` | Landing page with hero, features, video |
| MyDogs | `pages/MyDogs.tsx` | CRUD for dog profiles |
| Generate | `pages/Generate.tsx` | Upload kibble, select dog, generate recipe |
| Recipes | `pages/Recipes.tsx` | List saved recipes |
| Recipe | `pages/Recipe.tsx` | View single recipe with print |
| Disclaimer | `pages/Disclaimer.tsx` | Legal veterinary disclaimer |

### Backend Procedures (tRPC)

| Procedure | Type | Purpose |
|-----------|------|---------|
| `auth.me` | Query | Get current user |
| `auth.logout` | Mutation | Clear session |
| `dogs.list` | Query | Get user's dogs |
| `dogs.get` | Query | Get single dog |
| `dogs.create` | Mutation | Create dog profile |
| `dogs.update` | Mutation | Update dog profile |
| `dogs.delete` | Mutation | Delete dog profile |
| `recipes.list` | Query | Get user's recipes |
| `recipes.get` | Query | Get single recipe |
| `recipes.create` | Mutation | Save recipe |
| `recipes.delete` | Mutation | Delete recipe |
| `recipes.toggleFavorite` | Mutation | Toggle favorite status |

### API Endpoints (Express)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze-kibble` | POST | Extract ingredients from image |
| `/api/generate-recipe` | POST | Generate recipe from ingredients + dog |

---

## Database Schema

### users
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  lastSignedIn TIMESTAMP DEFAULT NOW()
);
```

### dog_profiles
```sql
CREATE TABLE dog_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  weightLbs DECIMAL(5,1),
  ageYears INT,
  ageMonths INT,
  sizeCategory ENUM('toy', 'small', 'medium', 'large', 'giant'),
  lifeStage ENUM('puppy', 'adult', 'senior'),
  activityLevel ENUM('sedentary', 'moderate', 'active', 'very_active'),
  allergies TEXT,           -- JSON array
  dietaryRestrictions TEXT, -- JSON array
  healthConditions TEXT,    -- JSON array
  dailyCalories INT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### saved_recipes
```sql
CREATE TABLE saved_recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  dogProfileId INT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  ingredients TEXT NOT NULL,    -- JSON array
  instructions TEXT NOT NULL,   -- JSON array
  nutritionInfo TEXT,           -- JSON object
  supplements TEXT,             -- JSON array
  transitionGuide TEXT,
  isFavorite BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (dogProfileId) REFERENCES dog_profiles(id)
);
```

---

## Environment Variables

These are automatically injected by the Manus platform:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Session cookie signing |
| `VITE_APP_ID` | Manus OAuth app ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal |
| `BUILT_IN_FORGE_API_URL` | LLM API endpoint |
| `BUILT_IN_FORGE_API_KEY` | LLM API key |

---

## Testing

Run tests with:
```bash
cd /home/ubuntu/chef-doggo && pnpm test
```

Test files:
- `server/auth.logout.test.ts` - Auth logout tests
- `server/dogs.test.ts` - Dog profile & recipe CRUD tests

---

## Common Commands

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Push database changes
pnpm db:push

# Type check
pnpm check

# Build for production
pnpm build
```

---

## Adding New Features

### Adding a New Page

1. Create `client/src/pages/NewPage.tsx`
2. Add route in `client/src/App.tsx`
3. Add navigation link if needed

### Adding a New tRPC Procedure

1. Add query function in `server/db.ts`
2. Add procedure in `server/routers.ts`
3. Call from frontend with `trpc.procedureName.useQuery()` or `.useMutation()`

### Adding a New Database Table

1. Define table in `drizzle/schema.ts`
2. Run `pnpm db:push` to migrate
3. Add query functions in `server/db.ts`

---

## External Integrations

| Service | Purpose | Config Location |
|---------|---------|-----------------|
| OpenAI GPT-4 | Recipe generation, image analysis | `server/_core/llm.ts` |
| Manus OAuth | User authentication | `server/_core/oauth.ts` |
| S3 | File storage | `server/storage.ts` |
| Chewy | Affiliate links | Hardcoded in recipe display |
