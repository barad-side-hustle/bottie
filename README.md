# RevYou (Bottie.ai)

**AI-Powered Google Review Management Platform**

RevYou (also known as Bottie.ai) is a SaaS platform that automates responses to Google Business Profile reviews using AI. It helps businesses manage their online reputation by generating personalized, AI-powered replies to customer reviews with smart customization, sentiment analysis, and multi-language support.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Features

### 🤖 AI-Powered Review Responses

- **Smart AI Generation**: Powered by **Google Gemini 3.0 Flash Preview** for natural, context-aware replies.
- **Customizable Tone**: Choose from Professional, Friendly, Formal, or Humorous tones.
- **Multi-Language Support**: Full support for **English and Hebrew** with automatic language detection and RTL layouts.
- **Star-Rating Logic**: Define specific instructions for each rating level (e.g., "Apologize for 1-star", "Thank warmly for 5-stars").
- **Personalization**: Name transliteration, emoji customization, and custom signatures.
- **Approval Modes**:
  - **Manual Approval**: Review every response before posting.
  - **Auto-Publish**: Automatically post replies for specific star ratings.

### 📍 Google Business Profile Integration

- **OAuth 2.0 Authentication**: Secure connection to manage business profiles.
- **Real-Time Notifications**: Instant updates via **Google Cloud Pub/Sub** webhooks when a new review is posted.
- **Multi-Location Support**: Manage multiple business locations from a single dashboard.
- **Direct Posting**: Publish replies directly to Google Maps/Search.

### 📊 Analytics & Insights

- **Sentiment Analysis**: Analyze positive, neutral, and negative sentiment trends.
- **Weekly Email Summaries**: Automated weekly reports with performance stats, sentiment breakdown, and AI-driven recommendations.
- **Dashboard**: comprehensive view of review volume, ratings, and response times.

### 💳 Subscription Management

- **Stripe Integration**: Secure billing and subscription handling.
- **Tiered Plans**:
  - **Free**: Basic features for a single business.
  - **Basic/Pro**: tiered limits on reviews and businesses.
- **Usage Tracking**: Monitor review quotas and limits.

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript 5.9
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/)
- **State Management**: Zustand
- **Internationalization**: `next-intl` (Authored for English & Hebrew)
- **Components**: Radix UI, Framer Motion, Lucide React

### Backend

- **Database**: PostgreSQL (via Supabase) with [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: Supabase Auth (SSR)
- **API**: Next.js Server Actions & API Routes
- **Validation**: Zod
- **Email**: [Resend](https://resend.com/) + [React Email](https://react.email/)

### Services

- **AI**: Google Generative AI (Gemini)
- **Payments**: Stripe
- **Cloud**: Google Cloud Platform (Pub/Sub)
- **Deployment**: Vercel (recommended)

## 📂 Project Structure

```
RevYou/
├── src/
│   ├── app/                        # Next.js App Router (Pages & API)
│   │   ├── [locale]/              # i18n routes (dashboard, landing, auth)
│   │   └── api/                   # API Routes (webhooks, cron, internal)
│   ├── components/                # UI Components (Shadcn, Feature-specific)
│   ├── hooks/                     # Custom React Hooks
│   ├── contexts/                  # React Contexts (Auth, Direction)
│   └── i18n/                      # Internationalization config
├── lib/                           # Core Business Logic
│   ├── ai/                        # Gemini AI prompts & integration
│   ├── db/                        # Drizzle Schema & Data Access
│   ├── emails/                    # React Email templates
│   ├── google/                    # Google APIs (MyBusiness, PubSub)
│   ├── stripe/                    # Stripe helpers
│   ├── supabase/                  # Supabase Setup
│   └── utils/                     # Helper functions
├── messages/                      # Translation files (en.json, he.json)
├── drizzle/                       # Database migrations
├── scripts/                       # Utility scripts (cron triggers, webhooks)
└── public/                        # Static assets
```

## 🏁 Getting Started

### Prerequisites

- **Node.js** 20.9+
- **Yarn** (Package Manager)
- **Supabase Project** (Postgres DB & Auth)
- **Google Cloud Project** (With My Business & Pub/Sub APIs enabled)
- **Stripe Account** (For billing)

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
   - `DATABASE_URL`: Connection string from Supabase (Transaction Pooler - port 6543).
   - `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY`: From Supabase settings.
   - `GOOGLE_CLIENT_ID` / `SECRET`: OAuth credentials.
   - `GEMINI_API_KEY`: Google AI Studio key.
   - `STRIPE_SECRET_KEY` / `WEBHOOK_SECRET`: Stripe config.

4. **Database Setup:**
   Push the schema to your Supabase instance:

   ```bash
   yarn db:push
   ```

   This will create the necessary tables in your Postgres database.

5. **Run the Development Server:**
   ```bash
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 💻 Development Workflows

### Database (Drizzle ORM)

- **Update Schema**: Modify `lib/db/schema/index.ts`.
- **Push Changes**: `yarn db:push` (Syncs schema with DB).
- **View Data**: `yarn db:studio` (Opens Drizzle Studio GUI).
- **Generate Migrations**: `yarn db:generate`.

### Email Templates

We use **React Email** for designing transactional emails.

- **Preview Emails**: `yarn email:dev`
  This starts a local server at [http://localhost:3000](http://localhost:3000) (or 3001) where you can interactively test templates.

### Webhooks & Scripts

The `scripts/` folder contains utilities for testing:

- **Trigger Review Webhook**: `yarn webhook:trigger` (Simulates a Google review event).
- **Trigger Weekly Summary**: `yarn cron:trigger` (Runs the weekly email summary logic).

### Testing

- **Run Tests**: `yarn test` (Vitest).
- **Coverage**: `yarn test:coverage`.

## 🚢 Deployment

### Vercel

1. Connect your repository to Vercel.
2. Add all environment variables from `.env.local` to Vercel Project Settings.
3. **Build Command**: `yarn build`
4. **Install Command**: `yarn install`
5. Deploy!

> **Note**: This project relies on Cron Jobs (defined in `vercel.json`) for sending weekly summaries. Vercel automatically picks this up.

## 📄 License

[MIT License](LICENSE)

---

**RevYou** — Turning Reviews into Relationships.
