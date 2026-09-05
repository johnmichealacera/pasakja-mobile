# Pasakja Mobile

The Android mobile client for **Pasakja**, a community ride-booking platform (tricycle / habal-habal / bao-bao) for Socorro, Surigao del Norte. This app is a second, native client for the existing [Pasakja web application](../pasakja) — it talks to the same Next.js backend and PostgreSQL database, so booking rules, fares, payments, and driver/passenger data are always in sync between web and mobile. There is no separate mobile backend.

> Looking to run, build, or test this app? See **[NEXT_STEPS.md](./NEXT_STEPS.md)** for the full setup and testing walkthrough. This document is the "what is this and how is it put together" overview.

---

## What this app does

Pasakja Mobile covers all three roles from the web app, adapted for a phone rather than ported screen-for-screen:

- **Passenger** — register (with KYC document capture via camera/gallery), book a ride on a live map with fare estimates and nearby-driver markers, pay by cash or GCash, track the driver live during the trip, rate the driver, dispute a GCash charge, and send an SOS alert.
- **Driver** — register (license + vehicle documents), go online/offline with live GPS broadcast, see and accept incoming ride requests, walk a trip through pickup → in-progress → completion, and view earnings.
- **Admin** — a deliberately reduced, phone-appropriate subset of the web admin: dashboard stats, all-bookings oversight, driver KYC approval/suspension, and SOS alert + GCash dispute resolution. Fare/zone configuration, full analytics reports, and driver remittance management stay web-only — that's desk work, not phone work.

## Architecture

**The Next.js web app remains the single source of truth.** This app is a thin client:

- No booking rules, fare math, or payment logic are reimplemented — every screen calls the same backend API routes the web app uses (or a small number of additive ones, listed below).
- The two shared business-logic files (`lib/commission.ts`, `lib/vehicle-types.ts`, etc.) are copied — not reinvented — from the web app into `src/lib/`, clearly marked as mirrors of the source of truth.
- Fare, booking status, and payment state are always resolved server-side. Anything computed client-side (e.g. a fare preview before booking) is just a preview; the server recomputes and persists the authoritative value.

**Auth:** the web app uses NextAuth with cookie-based sessions, which doesn't work for a bare mobile HTTP client. Mobile gets its own login endpoint (`POST /api/mobile/session`) that runs the exact same credential check and issues a Bearer JWT instead of a cookie. A shared `lib/api-auth.ts` on the backend accepts either a Bearer token or the original NextAuth cookie session, so every route serves both clients from one implementation.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Expo (React Native) + Expo Router (file-based navigation) |
| Language | TypeScript (strict) |
| Maps | `react-native-maps` (Google Maps SDK on Android) |
| Location | `expo-location` (foreground only) |
| Push notifications | `expo-notifications` + Expo's push service |
| Secure storage | `expo-secure-store` (auth token) |
| Image capture | `expo-image-picker` (KYC docs, profile photo) |
| In-app browser | `expo-web-browser` (GCash checkout) |
| Deep linking | `expo-linking` (`pasakja://` scheme, GCash payment return) |
| Builds | EAS Build (cloud — no local Android SDK needed) |

## Project structure

```
app/                          Expo Router routes (file-based)
├── (auth)/                   login, register — no role guard
├── passenger/                Tabs: Home, Book, Trips, SOS, Profile (+ hidden Trip screen)
├── driver/                   Tabs: Home, Requests, Trip, Earnings, Profile
├── admin/                    Stack: Dashboard, Bookings, Drivers, SOS & Disputes, Profile
└── _layout.tsx                Root layout — wraps AuthProvider + push-notification gateway

src/
├── api/                      One typed module per backend resource (auth, bookings, drivers,
│                              maps, fares, sos, paymongo, admin, driverEarnings, ...) — thin
│                              wrappers around fetch, no business logic
├── auth/                     AuthContext (login/logout/session restore),
│                              DriverProfileContext (resolves a driver's own Driver.id —
│                              there's no "my profile" endpoint, so it matches by userId),
│                              tokenStorage (SecureStore wrapper)
├── components/                Shared UI: Button, TextField, Screen, BookingMap, TrackingMap,
│                              TripStatusTimeline, DestinationSearchModal, DocumentPickerField,
│                              ProfileScreenBody
├── hooks/                    useCurrentLocation, usePolling, useDriverAvailability,
│                              usePassengerLocationBroadcast
├── lib/                      Constants/logic copied verbatim from the web app's lib/ —
│                              commission math, vehicle types, Socorro place gazetteer,
│                              booking-guard constants, verification doc types
├── notifications/            Push registration, foreground handling, tap-to-navigate routing
├── config/                   Runtime config (API base URL)
├── constants/                Map center/region constants
├── theme.ts                  Shared color tokens
└── types/                    TypeScript mirrors of the Prisma schema's shapes
```

## Screens & navigation

Adapted for mobile rather than copying the web's sidebar layout — bottom tabs per role, with a couple of screens reachable by push/deep-link rather than shown as tabs:

- **Passenger tabs:** Home · Book · Trips · SOS · Profile. The live-tracking **Trip** screen is registered but hidden from the tab bar (`href: null`) — it's reached from Home's active-booking banner or automatically right after booking.
- **Driver tabs:** Home · Requests · Trip · Earnings · Profile.
- **Admin:** a single stack (no tabs) — Dashboard → Bookings / Drivers / SOS & Disputes / Profile.

## Backend changes (in `../pasakja`)

All additive — nothing about the existing web app's behavior changed. New/modified pieces, grouped by purpose:

**Auth bridge**
- `lib/api-auth.ts` — `getAuthUser()` accepts a mobile Bearer JWT or the web's NextAuth cookie session
- `POST /api/mobile/session` — mobile login, issues the Bearer token
- Bearer support added to every route the mobile app calls (bookings, drivers, location, SOS, profile, uploads, PayMongo, admin stats)

**Payments**
- `POST /api/paymongo/attach` — now accepts an optional `returnUrl`
- `GET /api/paymongo/mobile-bridge` — PayMongo requires an http(s) `return_url`, so this small route is what PayMongo actually redirects to; it immediately redirects on into the app's `pasakja://payment-return` deep link

**Notifications**
- `lib/notifications.ts` / `lib/push.ts` — wires up the `Notification` model (previously defined in the schema but never used anywhere) and delivers a real push via Expo's push service whenever a user has a registered token
- `POST /api/mobile/register-push-token` (+ `DELETE` on logout)
- Notification points: booking created (targeted driver, or all available drivers), accepted, completed, cancelled; SOS created/resolved; dispute submitted/approved/denied

**Admin**
- `GET /api/driver/earnings` — JSON counterpart to a page the web app renders server-side directly
- `GET /api/bookings` gained an admin-only `disputeStatus` filter (there was previously no way to list disputed bookings via API)

**Security fix found along the way:** several routes were including the full `User` row — bcrypt password hash included — in booking/SOS responses. Fixed with a shared `lib/safe-select.ts` (`{id, name, phone, profileImage}` only). This was a pre-existing issue in the web app, not something introduced for mobile.

## Database impact

One additive, nullable column: `User.pushToken String?` — stores a device's Expo push token. Nothing else changed; every other model is used exactly as the web app already defined it.

## Known limitations (by design)

- Foreground location only — no background GPS tracking (avoids Android's stricter background-location requirements for a capstone-scale app).
- KYC documents are photos only on mobile (no PDF upload, unlike the web app).
- Admin scope is intentionally reduced — see "What this app does" above.
- Routing/ETA (OSRM) uses the same public, rate-limited demo server the web app already relies on.
- GCash has a ₱20 minimum charge, enforced by PayMongo itself — the booking screen warns before attempting a smaller charge.

## Environment variables

See `.env.example`. In short: `GOOGLE_MAPS_API_KEY_ANDROID` (Android map rendering) and `API_BASE_URL` (must point at a backend the *phone* can reach — never `localhost` on a physical device). Full explanation of both, plus the Expo/EAS/Firebase setup push notifications need, is in [NEXT_STEPS.md](./NEXT_STEPS.md).
