# Chef Doggo 🐕👨‍🍳

**Turn Kibble into Cuisine** - Transform commercial dog kibble into personalized, homemade recipes backed by veterinary nutrition science.

## Overview

Chef Doggo is a comprehensive web platform that helps dog owners create AAFCO-compliant homemade meals tailored to their dog's specific needs. The platform integrates:

- **Veterinary Nutrition Science** (AAFCO standards)
- **Traditional Chinese Veterinary Medicine** (TCVM)
- **Ayurvedic Principles** for holistic pet care
- **Safety Validation System** to prevent toxic ingredients
- **Personalized Recipe Generation** based on dog profiles

## Features

### Phase 1A ✅ (Complete)
- User authentication and profile management
- Comprehensive dog profile system
- Recipe generation with AAFCO compliance
- Basic safety validation (toxic ingredient checking)
- 2-tier disclaimer system
- Saved recipe management
- Affiliate integration (Chewy & Amazon)
- Mobile-responsive design

### Phase 1B 🚧 (In Progress)
- AI vision for kibble label scanning (GPT-4 Vision)
- Enhanced 5-tier disclaimer system
- Medication tracking and interaction warnings
- AI-generated recipe photos
- Cost estimation

### Phase 1C 📋 (Planned)
- Full TCVM integration
- Ayurveda dosha matching
- Comprehensive P0 safety validation
- Advanced medication interaction checker
- Batch scaling and export features

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, NextAuth
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Abacus.AI LLM APIs (GPT-4 Vision)
- **Authentication**: NextAuth with JWT
- **Deployment**: Abacus.AI DeepAgent Platform

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Yarn package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd chef_doggo

# Install dependencies
cd nextjs_space
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Run database migrations
yarn prisma generate
yarn prisma db push

# Seed the database (optional)
yarn prisma db seed

# Start development server
yarn dev
```

The app will be available at `http://localhost:3000`

## Test Accounts

- Email: `test@example.com` / Password: `testpassword123`
- Email: `john@doe.com` / Password: `johndoe123`

## Database Schema

- `users` - User accounts
- `dog_profiles` - Dog information and health data
- `recipes` - Generated recipes with nutritional data
- `disclaimer_acknowledgments` - Legal compliance tracking

## Safety Features

### Toxic Ingredient Validation
The system blocks recipes containing:
- Xylitol
- Chocolate
- Grapes/Raisins
- Onions/Garlic
- Macadamia Nuts
- Avocado
- Alcohol

### Health Condition Accommodations
- Low-fat recipes for pancreatitis
- Low-phosphorus for kidney disease
- Grain-free options for allergies
- Custom dietary restrictions

## Contributing

This is a proprietary project. For questions or contributions, please contact the project owner.

## License

All rights reserved.

## Disclaimer

⚠️ **Important**: This platform provides educational information only. Always consult with a licensed veterinarian before making significant changes to your dog's diet. The recipes generated are intended to supplement professional veterinary advice, not replace it.
