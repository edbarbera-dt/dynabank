# DynaBank 🏦

A fully functional demo banking app built with React Native + Expo SDK 55 for demonstrating Dynatrace mobile monitoring capabilities.

## Features

- **Authentication** — Email/password sign up & login via Supabase Auth
- **Onboarding** — Account type selection, country, phone, PIN creation
- **Home Dashboard** — Account balance, quick actions, recent transactions
- **Transactions** — Full history with category filters, date grouping, detail view
- **Payments** — Send money, top up, currency exchange, beneficiary management
- **Cards** — Virtual card creation, freeze/unfreeze, spending limits
- **Profile** — Edit profile, change PIN, security settings

## Tech Stack

- **Framework**: React Native + Expo SDK 55
- **Routing**: expo-router (file-based)
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Styling**: NativeWind v4 + Tailwind CSS
- **Forms**: react-hook-form + zod
- **Currency**: GBP (£)

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- [Supabase](https://supabase.com) account (free tier works)
- iOS Simulator / Android Emulator / Expo Go (not working at the moment - waiting for SDK 55 support)

### 1. Clone & Install

```bash
cd bank-app-demo
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run in the SQL Editor
3. This creates all tables, RLS policies, functions, triggers, and seed exchange rates

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find these in: Supabase Dashboard → Settings → API

### 4. Seed Demo Data

```bash
npm run seed
```

This creates a demo user with:

- Email
- Password
- PIN
- 2 accounts (Current £4,250.80 + Savings £12,500.00)
- 35+ realistic transactions over 60 days
- 2 virtual cards
- 5 beneficiaries

### 5. Start Development

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android emulator.

## Database Schema

| Table            | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `profiles`       | User profiles (name, phone, country, PIN hash)          |
| `accounts`       | Bank accounts (balance, currency, account number)       |
| `transactions`   | Transaction history (amount, category, counterparty)    |
| `cards`          | Virtual/physical cards (number, expiry, status, limits) |
| `beneficiaries`  | Saved payment recipients                                |
| `exchange_rates` | Currency exchange rates (GBP ↔ EUR ↔ USD)               |

All tables have Row Level Security (RLS) enabled — users can only access their own data.

## Adding Dynatrace Mobile Monitoring

This app is designed to be instrumented with Dynatrace OneAgent for mobile. Follow the [Dynatrace documentation](https://docs.dynatrace.com/docs/setup-and-configuration/setup-on-mobile-platforms) to add:

- Crash reporting
- User session tracking
- Network request monitoring
- Custom user actions
- Performance metrics

## License

Demo project for Dynatrace monitoring demonstrations.

