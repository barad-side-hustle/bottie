# Bottie - AI-Powered Google Review Management

## Project Overview

Bottie is a Next.js 15 application that helps businesses manage Google reviews with AI-generated responses. The app connects to Google Business Profile accounts, monitors reviews via webhooks, and generates contextual AI replies using Google's Gemini API.

## Tech Stack

- **Framework**: Next.js 15 with App Router, React 19, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth (email/password + Google OAuth)
- **AI**: Google Gemini API for reply generation
- **Payments**: Stripe for subscriptions
- **Email**: Resend with React Email templates
- **i18n**: next-intl (Hebrew/English)
- **Styling**: Tailwind CSS 4, Radix UI components

## Requirements

- **Node.js**: 22.13.0 or higher (LTS recommended)
- **Package Manager**: Yarn 1.22.22

Use `nvm` to manage Node.js versions:

```bash
nvm install 22.13.0
nvm use 22.13.0
```

## Database Architecture

### Core Tables

- **`locations`**: Shared Google Business location data + AI settings (keyed by `googleLocationId`)
- **`account_locations`**: Join table linking Google accounts to locations (many-to-many)
- **`google_accounts`**: Google OAuth accounts with refresh tokens
- **`user_accounts`**: Links users to Google accounts
- **`reviews`**: Reviews stored once per location (linked via `locationId`)
- **`review_responses`**: AI-generated and posted replies
- **`subscriptions`**: Stripe subscription data

### Key Relationships

```
users (Better Auth user table)
  └── user_accounts (many-to-many)
        └── google_accounts (Google OAuth)
              └── account_locations (many-to-many)
                    └── locations (shared business data)
                          └── reviews
                                └── review_responses
```

## Directory Structure

```
lib/
├── actions/          # Server actions (Next.js "use server")
├── controllers/      # Business logic layer
├── db/
│   ├── schema/       # Drizzle table definitions
│   └── repositories/ # Data access layer
├── google/           # Google API integrations
├── emails/           # React Email templates
├── subscriptions/    # Plan limits and features
└── types/            # TypeScript type definitions

src/
├── app/
│   ├── [locale]/     # i18n routes
│   │   ├── dashboard/
│   │   │   └── accounts/[accountId]/locations/[locationId]/
│   │   └── onboarding/
│   └── api/
│       ├── webhooks/google-reviews/  # Pub/Sub webhook
│       ├── internal/process-review/  # AI generation endpoint
│       └── cron/                     # Scheduled jobs
├── components/
│   ├── dashboard/
│   │   ├── locations/  # Location settings components
│   │   ├── reviews/    # Review cards and lists
│   │   └── insights/   # Analytics charts
│   └── onboarding/     # Setup flow components
└── i18n/               # Translations (en.json, he.json)
```

## Key Flows

### Review Processing

1. Google Pub/Sub webhook → `/api/webhooks/google-reviews`
2. Webhook triggers → `/api/internal/process-review`
3. AI generates reply using location's tone/language settings
4. Reply stored with `status: 'pending'`
5. User can edit/approve/publish from dashboard

### Onboarding

1. `/onboarding/connect-account` - Google OAuth
2. `/onboarding/choose-location` - Select business
3. `/onboarding/location-details` - Business info
4. `/onboarding/ai-settings` - Tone, language, emojis
5. `/onboarding/star-ratings` - Per-rating auto-reply config

## Common Commands

```bash
yarn dev              # Start dev server (Turbopack)
yarn build            # Production build
yarn test             # Run Vitest tests
yarn db:generate      # Generate Drizzle migrations
yarn db:push          # Push schema to database
yarn db:studio        # Open Drizzle Studio
yarn lint:check       # ESLint check
yarn format:write     # Prettier format
```

## Environment Variables

Required in `.env.local`:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_AI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `INTERNAL_API_SECRET`

## Testing

- Unit tests with Vitest
- Test files co-located: `*.test.ts`
- Mocking: `vi.mock()` for external dependencies
- Run: `yarn test` or `yarn test:watch`

## Important Notes

- All database access goes through repositories (service_role-only RLS, auth enforced at app level)
- Server actions handle auth verification
- Reviews are stored once per `location`, not per account
- Multiple users can connect to the same physical location
- AI settings (tone, language, star configs) are shared per location
