# Bottie - AI-Powered Google Review Management

## Project Overview

Bottie is a Next.js 16 application that helps businesses manage Google reviews with AI-generated responses. The app connects to Google Business Profile accounts, monitors reviews via webhooks, and generates contextual AI replies using Google's Gemini API.

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth (email/password + Google OAuth)
- **AI**: Google Gemini API for reply generation and review classification
- **Payments**: Polar for usage-based billing
- **Email**: Resend with React Email templates
- **i18n**: next-intl (Hebrew/English)
- **Styling**: Tailwind CSS 4, shadcn/UI, Radix UI

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
- **`subscriptions`**: Polar subscription data (polarCustomerId, polarSubscriptionId)
- **`users_configs`**: User preferences
- **`weekly_summaries`**: Weekly email summary data

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
├── ai/              # Gemini AI (prompts, classification, summaries)
├── auth/            # Auth middleware
├── auth.ts          # Better Auth config with Polar plugin
├── controllers/     # Business logic layer
├── db/
│   ├── schema/      # Drizzle table definitions
│   └── repositories/# Data access layer
├── emails/          # React Email templates
├── env.ts           # Zod-validated environment variables
├── google/          # Google API integrations (MyBusiness, OAuth, Pub/Sub)
├── og/              # OpenGraph utilities
├── polar/           # Polar SDK config
├── security/        # Token encryption utilities
├── seo/             # SEO utilities
├── store/           # Zustand stores
├── subscriptions/   # Plan limits and billing logic
├── types/           # TypeScript type definitions
└── utils/           # Helpers (filters, breadcrumbs, email-service)

src/
├── app/
│   ├── [locale]/     # i18n routes
│   │   ├── (landing)/  # Public pages (privacy, terms)
│   │   ├── (auth)/     # Auth flows (login, sign-up, forgot/reset password)
│   │   ├── dashboard/
│   │   │   ├── home/   # Overview page
│   │   │   ├── settings/ # Account settings
│   │   │   ├── subscription/ # Billing
│   │   │   └── accounts/[accountId]/locations/[locationId]/
│   │   │       ├── reviews/     # Review list + detail
│   │   │       ├── insights/    # Analytics
│   │   │       └── settings/    # Location settings
│   │   └── onboarding/
│   └── api/
│       ├── auth/[...all]/           # Better Auth handler
│       ├── google/auth/             # Google OAuth initiation
│       ├── google/callback/         # Google OAuth callback
│       ├── webhooks/google-reviews/ # Pub/Sub webhook
│       ├── internal/process-review/ # AI generation endpoint
│       ├── import-reviews/          # Bulk review import
│       ├── user/settings/           # User settings
│       └── cron/weekly-summaries/   # Scheduled weekly emails
├── components/
│   ├── auth/          # Login, sign-up, password reset forms
│   ├── checkout/      # Checkout flow
│   ├── dashboard/
│   │   ├── overview/  # Stats, pending banner, location cards
│   │   ├── reviews/   # ReviewCard, ReviewsList, ReplyEditor, filters
│   │   ├── insights/  # Charts, trends, categories
│   │   ├── locations/ # Location settings forms
│   │   └── subscription/ # Billing components
│   ├── landing/       # Hero, HowItWorks, Pricing, FAQ, etc.
│   ├── layout/        # AppSidebar, DashboardTopBar, Breadcrumbs, etc.
│   ├── onboarding/    # Wizard, steps, progress bar
│   ├── skeletons/     # Loading skeletons
│   └── ui/            # shadcn/UI components
├── contexts/          # AuthContext, DirectionProvider, SidebarDataContext
├── hooks/             # use-current-location, use-navigation, use-subscription
└── i18n/              # Internationalization config
```

## Key Flows

### Review Processing

1. Google Pub/Sub webhook → `/api/webhooks/google-reviews`
2. Webhook triggers → `/api/internal/process-review`
3. AI generates reply using location's tone/language settings
4. Reply stored with `status: 'pending'`
5. User can edit/approve/publish from dashboard

### Onboarding

1. Connect - Google OAuth account connection
2. Choose Location - Select business location
3. Configure - Business details (name, description, phone)
4. Auto Reply - AI tone/language settings + per-star-rating auto-reply config

## Common Commands

```bash
yarn dev              # Start dev server (Turbopack)
yarn build            # Production build
yarn test             # Run Vitest tests
yarn db:generate      # Generate Drizzle migrations
yarn db:push          # Push schema to database
yarn db:migrate       # Run Drizzle migrations
yarn db:studio        # Open Drizzle Studio
yarn db:triggers      # Setup database triggers
yarn lint:check       # ESLint check
yarn format:write     # Prettier format
yarn knip             # Find unused exports/dependencies
yarn email:dev        # Preview React Email templates
```

## Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_APP_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY`
- `TOKEN_ENCRYPTION_SECRET`
- `INTERNAL_API_SECRET`
- `CRON_SECRET`
- `POLAR_ACCESS_TOKEN`
- `POLAR_WEBHOOK_SECRET`
- `POLAR_PRODUCT_ID`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

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
- Payments use Polar with usage-based billing (free tier: 10 reviews/month, paid: $0.20/reply)
