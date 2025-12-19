# Bottie - AI-Powered Google Review Management

## Project Overview

Bottie is a Next.js 15 application that helps businesses manage Google reviews with AI-generated responses. The app connects to Google Business Profile accounts, monitors reviews via webhooks, and generates contextual AI replies using Google's Gemini API.

## Tech Stack

- **Framework**: Next.js 16.1.0 with App Router, React 19, TypeScript
- **Database**: PostgreSQL via Supabase with Drizzle ORM
- **Auth**: Supabase Auth with Google OAuth
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
- **`accounts`**: Google OAuth accounts with refresh tokens
- **`user_accounts`**: Links Supabase users to accounts
- **`reviews`**: Reviews stored once per location (linked via `locationId`)
- **`review_responses`**: AI-generated and posted replies
- **`subscriptions`**: Stripe subscription data

### Key Relationships

```
users (Supabase auth.users)
  └── user_accounts (many-to-many)
        └── accounts (Google OAuth)
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
yarn analyze          # Analyze bundle size (opens browser)
yarn db:generate      # Generate Drizzle migrations
yarn db:push          # Push schema to database
yarn db:studio        # Open Drizzle Studio
yarn lint:check       # ESLint check
yarn format:write     # Prettier format
```

## Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
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

- All database access goes through repositories (RLS enabled)
- Server actions handle auth verification
- Reviews are stored once per `location`, not per account
- Multiple users can connect to the same physical location
- AI settings (tone, language, star configs) are shared per location

## SEO Optimizations

### Redirect Chain (www → non-www)

**File**: `vercel.json`

The app uses a single redirect chain to canonicalize all traffic to the non-www domain:
- `www.bottie.ai` → `bottie.ai` (infrastructure-level redirect)
- Eliminates duplicate redirect chains for better SEO

**Configuration**:
```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "www.bottie.ai" }],
      "destination": "https://bottie.ai/:path*",
      "permanent": true
    }
  ]
}
```

### Locale Detection & Root Redirect

**Files**: `middleware.ts`, `src/app/layout.tsx`

- Root path (`/`) redirects to localized path (`/en` or `/he`) via middleware
- Locale detection uses: user preferences → locale cookie → Accept-Language header → default (`en`)
- **No `src/app/page.tsx` exists** - middleware handles the redirect before page rendering

**Why this works**:
- Next.js 16 doesn't require a page.tsx at every level when middleware redirects
- Deleting the root page ensures middleware redirect executes cleanly
- Root layout still provides HTML structure

### Performance Optimizations

#### Lazy Loading

**Landing Page** (`src/app/[locale]/(landing)/page.tsx`):
- Critical above-fold: `Hero`, `Pricing` (loaded immediately)
- Below-fold: `Statistics`, `HowItWorks`, `Testimonials`, `FAQ`, `FinalCTA` (lazy loaded with SSR)
- **Impact**: ~150KB reduction in initial bundle

**Dashboard Charts** (`src/components/dashboard/insights/InsightsCharts.tsx`):
- `TrendsChart` dynamically imported (ssr: false)
- Recharts library (~180KB) only loads when insights page is accessed

#### Bundle Analysis

```bash
yarn add -D @next/bundle-analyzer
yarn analyze  # Opens bundle visualization
```

**Configuration** (`next.config.ts`):
```typescript
experimental: {
  optimizePackageImports: [
    "lucide-react",
    "@radix-ui/react-icons",
    "recharts",
    "date-fns"
  ]
}
```

### Private Page Metadata

**File**: `lib/seo/private-metadata.ts`

All private pages (dashboard, auth, checkout, onboarding) have `noindex` metadata:
```typescript
export function generatePrivatePageMetadata(title?: string): Metadata {
  return {
    title: title || "Dashboard",
    robots: {
      index: false,
      follow: false,
      nocache: true,
      nosnippet: true,
      noimageindex: true,
    },
  };
}
```

**Applied to**:
- 6 dashboard pages
- 3 auth/checkout pages
- 5 onboarding pages

### robots.txt Configuration

**File**: `src/app/robots.ts`

Locale-aware paths and AI crawler blocking:
```typescript
rules: [
  {
    userAgent: "*",
    allow: "/",
    disallow: [
      "/api/", "/auth/", "/dashboard/", "/onboarding/", "/checkout/",
      "/_next/",
      "/*/dashboard/",      // Locale-aware
      "/*/onboarding/",     // Locale-aware
      "/*/checkout/",       // Locale-aware
      "/*/auth-code-error/",
    ],
  },
  {
    userAgent: "GPTBot",
    disallow: "/",
  },
]
```

## Next.js 16 Layout Architecture

### Root Layout Structure

**File**: `src/app/layout.tsx`

The root layout provides required `<html>` and `<body>` tags (Next.js 16 requirement):

```typescript
export default function RootLayout({ children }: Props) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

**Key points**:
- `suppressHydrationWarning` suppresses warnings from browser extensions
- Minimal structure - delegates to locale layout for actual content

### Locale Layout Structure

**File**: `src/app/[locale]/layout.tsx`

The locale-specific layout handles:
- Internationalization (next-intl)
- Font loading (Rubik for Hebrew, Nunito for Latin)
- Providers (Auth, Direction, NextIntl)
- Google Analytics scripts

**Important**: Does NOT provide `<html>` or `<body>` tags (root layout handles this)

**Pattern for setting HTML attributes**:

Since the root layout provides `<html>`, we use a client component to set locale-specific attributes:

**File**: `src/components/layout/HtmlAttributesSetter.tsx`

```typescript
"use client";

export function HtmlAttributesSetter({ lang, dir, className }) {
  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = dir;
    html.className = className;
  }, [lang, dir, className]);

  return null;
}
```

**Usage in locale layout**:
```typescript
return (
  <>
    <HtmlAttributesSetter
      lang={locale}
      dir={dir}
      className={`${rubik.variable} ${nunito.variable} font-sans antialiased`}
    />
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* ... rest of layout */}
    </NextIntlClientProvider>
  </>
);
```

### Why No Root Page?

**Missing**: `src/app/page.tsx` does not exist

**Reason**:
- The middleware handles root path (`/`) redirects to localized routes (`/en`, `/he`)
- Having a page.tsx would interfere with the middleware redirect
- Next.js 16 doesn't require a page at every level when using middleware redirects
- The root layout still provides HTML structure for nested pages

**Flow**:
```
User visits: bottie.ai
    ↓
Middleware intercepts (matcher: ["/", ...])
    ↓
Resolves locale (user pref → cookie → Accept-Language → "en")
    ↓
Redirects to: bottie.ai/en
    ↓
Locale layout renders with full providers
```
