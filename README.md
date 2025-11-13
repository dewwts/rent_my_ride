<h1 align="center">Rent My Ride</h1>

## Project Overview

<p align="left">
 Rent My Ride is a modern web app for car rentals. Users can browse and filter cars by location, seats, and price; check availability for a date range; book and pay with Stripe; and leave reviews. Owners can manage listings and bookings through a dashboard. The app uses Supabase for authentication (SSR cookies), Postgres (with RLS recommended), and Next.js App Router for server actions and API routes.
</p>

## Features
<!-- Task create feature section do here -->
- 🔑 **Auth (Supabase + SSR cookies)** — session available in Client, Server, Route Handlers, and Middleware.
- 🔎 **Search & Filters** — location autocomplete, seat count, price ranges, and (optionally) include unavailable cars.
- 🗓️ **Availability by date range** — checks overlapping bookings to ensure only free cars are shown.
- 🚘 **Owner Dashboard** — add/edit cars, upload images, verify status, manage bookings & history.
- 🌟 **Reviews** — renters can submit ratings/comments after finishing a rental.
- 💳 **Stripe Payments** — checkout sessions, connect accounts (for owner payouts), and webhook handling.
- 📊 **Transactions** — transaction list + simple status summaries.
- 🎨 **UI** — Tailwind CSS + shadcn/ui components; Lucide icons.
- 🧪 **Testing** — Playwright for E2E, Jest for unit tests.
- 🐳 **Docker dev** — optional Docker Compose setup for the Next.js app; compatible with local Supabase network.
- Works across the entire [Next.js](https://nextjs.org) stack
  - App Router
  - Pages Router
  - Middleware
  - Client
  - Server
  - It just works!
- supabase-ssr. A package to configure Supabase Auth to use cookies
- Password-based authentication block installed via the [Supabase UI Library](https://supabase.com/ui/docs/nextjs/password-based-auth)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Components with [shadcn/ui](https://ui.shadcn.com/)
- Optional deployment with [Supabase Vercel Integration and Vercel deploy](#deploy-your-own)
  - Environment variables automatically assigned to Vercel project


## Prerequisites
Before begin the project, ensure you have installed these before on your machine.
- **Node.js** v18+ (includes npm)
- **Git**
- **Supabase CLI** (for local Postgres + auth) — optional but recommended for local DB
- **Stripe** account (test mode) — to exercise checkout/webhooks
- **Docker** — optional; used by `docker-compose.yml` for running the Next.js app attached to the local Supabase network

## Clone the project
Following these instruction

1. Use `git clone` Clone the project to your local machine 
 ```bash
 git clone https://github.com/dewwts/rent_my_ride.git
 ```

2. Use `cd` to change into the app's directory

 ```bash
 cd rent_my_ride
 ```

3. **Install the dependencies:**
    (This command reads the `package.json` file and installs all the required libraries)
 ```bash
 npm install
 ```

## Run Development Server
### To start the development server on client, use the following command:
1. 
```bash
npm run dev
```
The app will be available at http://localhost:3000

### To start the development server on docker, use the following command
1. 
```bash
npx supabase login
```
2. 
```bash
npx supabase link --project-ref <project-id>
# get project-id on supabase 
```
3. 
```bash
npx supabase db pull
```
4. 
```bash
npx supabase start
```
5. 
```bash
docker-compose up
```
Important Note: Any changes made to the database while running via `npx supabase start` are stored exclusively in the Local Docker Database, ensuring your development work is isolated from production data.
## Run E2E Test (Playwright)
Before running Playwright tests, make sure the development server is running.
To execute all end-to-end tests:
```bash
npx playwright test
```
If you want to run tests in headed mode (see the browser window while testing):
```bash
npx playwright test --headed
```
Or to run a specific test file, use:
```bash
npx playwright test tests/example.spec.ts
```
**Jest (unit tests):**
```bash
npm test
npm run test-coverage
```

---

## Lint & Format
```bash
npm run lint
# (If you use Prettier locally, run your formatter as well)
```

## Demo

You can view a fully working demo at [demo](https://rentmyride-mu.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Feedback and issues

- 🐞 [Report a bug](https://github.com/dewwts/rent_my_ride/issues/new?labels=bug)
- 💡 [Feature request](https://github.com/dewwts/rent_my_ride/issues/new?labels=enhancement)

---

## Acknowledgements
- [Next.js](https://nextjs.org) • [Supabase](https://supabase.com) • [Tailwind CSS](https://tailwindcss.com) • [shadcn/ui](https://ui.shadcn.com/) • [Stripe](https://stripe.com)
