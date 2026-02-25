# RevYou (Bottie.ai)

**AI-Powered Google Review Management Platform**

RevYou (also known as Bottie.ai) is a SaaS platform that automates responses to Google Business Profile reviews using AI. It helps businesses manage their online reputation by generating personalized, AI-powered replies to customer reviews with smart customization, sentiment analysis, and multi-language support.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

### AI-Powered Review Responses

- **Smart AI Generation**: Powered by Google Gemini for natural, context-aware replies with review classification.
- **Customizable Tone**: Choose from Professional, Friendly, Formal, or Humorous tones.
- **Multi-Language Support**: Full support for English and Hebrew with automatic language detection and RTL layouts.
- **Star-Rating Logic**: Define specific instructions for each rating level (e.g., "Apologize for 1-star", "Thank warmly for 5-stars").
- **Personalization**: Name transliteration, emoji customization, and custom signatures.
- **Approval Modes**:
  - **Manual Approval**: Review every response before posting.
  - **Auto-Publish**: Automatically post replies for specific star ratings.

### Google Business Profile Integration

- **OAuth 2.0 Authentication**: Secure connection to manage business profiles.
- **Real-Time Notifications**: Instant updates via Google Cloud Pub/Sub webhooks when a new review is posted.
- **Multi-Location Support**: Manage multiple business locations from a single dashboard.
- **Direct Posting**: Publish replies directly to Google Maps/Search.

### Analytics & Insights

- **Sentiment Analysis**: Analyze positive, neutral, and negative sentiment trends.
- **Weekly Email Summaries**: Automated weekly reports with performance stats, sentiment breakdown, and AI-driven recommendations.
- **Dashboard**: Comprehensive view of review volume, ratings, and response times.

### Subscription Management

- **Polar Integration**: Usage-based billing via Polar.
- **Free Tier**: 10 AI-generated replies per month.
- **Paid Plan**: Unlimited reviews at $0.20 per AI-generated reply.
- **Usage Tracking**: Monitor review quotas and limits.

## Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript 5.9
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/UI](https://ui.shadcn.com/)
- **State Management**: Zustand
- **Internationalization**: `next-intl` (English & Hebrew with RTL support)
- **Components**: Radix UI, Lucide React

### Backend

- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [Better Auth](https://www.better-auth.com/) (email/password + Google OAuth)
- **API**: Next.js Server Actions & API Routes
- **Validation**: Zod
- **Email**: [Resend](https://resend.com/) + [React Email](https://react.email/)

### Services

- **AI**: Google Generative AI (Gemini)
- **Payments**: [Polar](https://polar.sh/)
- **Cloud**: Google Cloud Platform (Pub/Sub)
- **Deployment**: Vercel (recommended)

## Project Structure

```
RevYou/
├── src/
│   ├── app/                        # Next.js App Router (Pages & API)
│   │   ├── [locale]/              # i18n routes (dashboard, landing, auth)
│   │   └── api/                   # API Routes (webhooks, cron, internal)
│   ├── components/                # UI Components (shadcn, feature-specific)
│   ├── hooks/                     # Custom React Hooks
│   ├── contexts/                  # React Contexts (Auth, Direction, SidebarData)
│   └── i18n/                      # Internationalization config
├── lib/                           # Core Business Logic
│   ├── actions/                   # Server actions (Next.js "use server")
│   ├── ai/                        # Gemini AI prompts, classification & summaries
│   ├── auth/                      # Auth middleware
│   ├── controllers/               # Business logic layer
│   ├── db/                        # Drizzle Schema & Data Access
│   ├── emails/                    # React Email templates
│   ├── google/                    # Google APIs (MyBusiness, OAuth, Pub/Sub)
│   ├── polar/                     # Polar SDK config
│   ├── security/                  # Token encryption
│   ├── subscriptions/             # Plan limits and billing logic
│   └── utils/                     # Helper functions
├── messages/                      # Translation files (en.json, he.json)
├── drizzle/                       # Database migrations
├── scripts/                       # Utility scripts (cron triggers, webhooks)
└── public/                        # Static assets
```

## Getting Started

### Prerequisites

- **Node.js** 22.13.0+ (LTS recommended)
- **Yarn** 1.22.22 (Package Manager)
- **Google Cloud Project** (with My Business & Pub/Sub APIs enabled)
- **Polar Account** (for billing)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd revyou
   ```

2. **Install dependencies:**

   ```bash
   yarn install
   ```

   _Note: This project uses Yarn. Please stick to it to respect the lockfile._

3. **Environment Setup:**
   Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

   Now, fill in the required variables in `.env.local`.

   **Critical Variables:**
   - `DATABASE_URL`: PostgreSQL connection string.
   - `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`: Auth configuration.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: OAuth credentials.
   - `GEMINI_API_KEY`: Google AI Studio key.
   - `POLAR_ACCESS_TOKEN` / `POLAR_WEBHOOK_SECRET` / `POLAR_PRODUCT_ID`: Polar billing config.
   - `RESEND_API_KEY` / `RESEND_FROM_EMAIL`: Email service config.

4. **Database Setup:**
   Push the schema to your PostgreSQL database:

   ```bash
   yarn db:push
   ```

   This will create the necessary tables in your Postgres database.

5. **Run the Development Server:**
   ```bash
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Development Workflows

### Database (Drizzle ORM)

- **Update Schema**: Modify files in `lib/db/schema/`.
- **Push Changes**: `yarn db:push` (syncs schema with DB).
- **View Data**: `yarn db:studio` (opens Drizzle Studio GUI).
- **Generate Migrations**: `yarn db:generate`.
- **Run Migrations**: `yarn db:migrate`.

### Email Templates

We use **React Email** for designing transactional emails.

- **Preview Emails**: `yarn email:dev`
  This starts a local server where you can interactively test templates.

### Webhooks & Scripts

The `scripts/` folder contains utilities for testing:

- **Trigger Review Webhook**: `yarn webhook:trigger` (simulates a Google review event).
- **Trigger Weekly Summary**: `yarn cron:trigger` (runs the weekly email summary logic).

### Testing

- **Run Tests**: `yarn test` (Vitest).
- **Watch Mode**: `yarn test:watch`.
- **Coverage**: `yarn test:coverage`.

## Deployment

### Vercel

1. Connect your repository to Vercel.
2. Add all environment variables from `.env.local` to Vercel Project Settings.
3. **Build Command**: `yarn build`
4. **Install Command**: `yarn install`
5. Deploy!

> **Note**: This project relies on Cron Jobs (defined in `vercel.json`) for sending weekly summaries. Vercel automatically picks this up.

## License

[MIT License](LICENSE)

---

**RevYou** — Turning Reviews into Relationships.
