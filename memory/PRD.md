# COSMIC HORA — Product Requirements Document

## Original Problem Statement
Build a modern, production-ready AI Vedic astrology platform (COSMIC HORA). Users
enter birth details, make a payment, and instantly receive an AI-generated Vedic
astrology PDF report. Report types include Complete Horoscope, Marriage
Compatibility, Career, Finance, Business, Education, Health, Foreign Settlement,
Love, Child Birth, Muhurta, Yearly Predictions, Monthly Predictions, Numerology,
Custom Reports. Includes user dashboard, full admin CMS, blog, testimonials,
FAQ, contact, appointment scheduling, and legal pages.

Constraint from the user: **frontend-only intent** — do not implement astrology
calculation logic; use external `/api/calculate` and `/api/report` (placeholders
today, real URLs to be plugged in later).

## User Choices (2026-02-07)
- Hybrid architecture: React + FastAPI + MongoDB (Emergent template requires
  this; Next.js / Flask / Postgres unavailable).
- Simple email/password auth (JWT).
- Razorpay flow is **mocked**.
- Backend PDF generation via ReportLab; **email delivery is mocked** (logged).
- Design: distinctive luxurious cosmic aesthetic with **beige / neutral colors**
  (avoid the purple-blue cosmic cliché). Design agent chose a Vogue-meets-Cosmos
  editorial palette — Bone White / Warm Beige / Espresso / Antique Brass, using
  Cormorant Garamond + Manrope typography.

## Architecture
- Backend: FastAPI + Motor (MongoDB) on port 8001, all routes prefixed `/api`
- Frontend: React (CRA + Tailwind) on port 3000
- Auth: JWT via httpOnly cookies + Bearer header fallback (localStorage)
- PDF: ReportLab (server-side) with editorial Times layout
- External astrology API: injectable via `EXTERNAL_CALCULATE_API` and
  `EXTERNAL_REPORT_API` env vars — fallback to a curated mock report body

## Personas
1. **Seeker** — end user buying astrology reports; needs a soft, respectful,
   fast experience with clear pricing and instant delivery.
2. **Studio Admin** — small internal team managing content: report types, prices,
   coupons, blog posts, testimonials, FAQ, contacts, appointments, and settings
   (prompts, email templates, API keys, website copy).

## Core Requirements (Static)
- 15 report types, admin-editable (no code changes required)
- Auth (register, login, logout, me)
- Order lifecycle: create → pay (mock) → generate → PDF download
- User dashboard with re-download links
- Admin dashboard: users, orders, report types, coupons, blog, testimonials,
  FAQs, contacts, appointments, analytics/revenue charts, settings CMS
- Pages: Home, About, Services, Pricing, Reports, Blog + detail, Contact,
  Appointment, FAQ, Privacy, Terms, Refund
- Coupon system with discount %
- Contact + Appointment intake

## Implemented (2026-02-07 — MVP)
- Full backend (~1000 LOC) with all 40+ endpoints
- Full frontend (24 pages incl. 11 admin routes) with editorial theme
- Auth (JWT + httpOnly cookie), admin seed on startup
- 15 report types + COSMIC20 coupon + sample blog/FAQ/testimonials seeded
- Analytics dashboard with Recharts (revenue line + orders bar)
- PDF generation via ReportLab
- Mocked payment + mocked email (logged in db.email_log)
- Testing: **29/29 backend tests pass**; full Playwright user + admin journeys pass

## What's Deferred (P1/P2 Backlog)
- P1: Real Razorpay integration (test keys + webhook signature verify)
- P1: Real email delivery via Resend/SendGrid (needs API key)
- P1: External astrology API wiring once URLs available (env vars ready)
- P1: Background workers (Celery / FastAPI BackgroundTasks) for report generation
- P1: Rate limiting + brute-force protection on auth
- P2: OTP via email (currently only password login)
- P2: Google OAuth via Emergent-managed auth
- P2: Multi-language, multi-currency
- P2: WhatsApp report delivery + affiliate/referral program
- P2: Structured schema/JSON-LD, sitemap.xml, robots.txt
- P2: Live astrologer video booking with Stripe/Razorpay subscriptions

## Credentials
- Admin: `admin@cosmichora.com` / `Admin@Cosmic2026`
- Env vars in `/app/backend/.env`: `MONGO_URL`, `DB_NAME`, `JWT_SECRET`,
  `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `EXTERNAL_CALCULATE_API`,
  `EXTERNAL_REPORT_API` (last two intentionally blank).

## Next Tasks
1. Provide external astrology API URLs → set env vars, restart backend.
2. Provide Razorpay test keys → swap mock pay for real Razorpay checkout.
3. Provide Resend/SendGrid API key → wire real email in `_generate_and_store_report`.
