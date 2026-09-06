# Pasakja Mobile — Next Steps

Everything through Phase 8 of the mobile plan is built and verified against the live backend from this machine (curl-level testing). What's left is entirely on your side: running it, filling in a few accounts you need to create yourself, building an installable APK, and testing it on an actual phone. This doc walks through all of that, in order.

---

## 0. What you'll do, in one paragraph

You'll run the existing `pasakja` web app as the backend (nothing changes about how you already run it), point the mobile app at that backend, run the mobile app through Expo on your phone for fast iteration, then produce a real installable APK via EAS Build once you're happy, and install that on your Android phone for full end-to-end testing — including push notifications, which only work in a real build, never in plain Expo Go.

---

## 1. One-time tool installs

On the computer you'll develop from (not the phone):

```bash
# Expo's CLI is invoked via npx, nothing to globally install for that.
# EAS CLI (for cloud builds) — install once, globally:
npm install -g eas-cli

# Confirm it installed:
eas --version
```

You do **not** need Android Studio or a local Android SDK for anything in this guide — EAS Build compiles the APK in the cloud. (If you ever want to run a local Android emulator instead, that's a separate, heavier setup and isn't covered here.)

On your phone:
- Install **Expo Go** from the Play Store (for Step 4 only — fast iteration without a custom build).
- In **Settings → Security**, enable **"Install unknown apps"** for whichever app you'll use to open the APK file (Files, Chrome, etc.) — Android blocks sideloaded installs by default.

---

## 2. Missing configuration — things only you can supply

These are the accounts/keys/values that were out of reach for me to set up, since they require your own logins. Everything else (API wiring, code) is already done.

### 2a. Expo/EAS account + project link (required for push notifications)

Push notifications need a real Expo project ID to mint device tokens. Without this, every other feature still works — pushes just silently no-op.

```bash
cd pasakja-mobile
eas login          # creates a free Expo account if you don't have one
eas init            # links this project to a new EAS project, writes the projectId into app config
```

After `eas init`, `npx expo config --json | grep -A2 '"eas"'` should show a `projectId`. That's it for this step — no code changes needed, `src/notifications/setup.ts` already reads it automatically.

### 2b. Firebase project + FCM credentials (required for push notifications on Android)

Google retired the old "legacy FCM" API, so Android push now requires you to supply your own Firebase service account key:

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** (any name, e.g. "pasakja").
2. In the new project: **Project settings (gear icon) → Service accounts → Generate new private key**. This downloads a JSON file — keep it safe, it's a credential.
3. Upload it to your EAS project:
   ```bash
   eas credentials
   ```
   Choose **Android** → **Push Notifications: Manage your FCM V1 credentials** → **Upload a new service account key** → point it at the JSON file you downloaded.

Do this once. If you skip it, the app still runs fine — you just won't receive push notifications on a device until this is done.

### 2c. `API_BASE_URL` — point the app at your backend

This is the one setting almost guaranteed to trip you up if skipped: **`.env`'s `API_BASE_URL` currently says `http://localhost:3000`, which only works in a simulator running on the same machine as the backend.** A physical phone's "localhost" is the phone itself, not your computer.

You have two options for where the backend lives:

- **Deploy `pasakja` to a real host (Vercel, Render, etc.)** and point `API_BASE_URL` at that HTTPS URL. Recommended — sidesteps the whole "same Wi-Fi network" constraint, is closer to how the capstone would actually run, and makes GCash/PayMongo redirects behave more predictably.
- **Or use your computer's LAN IP** while running `pasakja` locally (same Wi-Fi network the phone will be on):
  ```bash
  # macOS
  ipconfig getifaddr en0
  # Linux
  hostname -I | awk '{print $1}'
  # Windows (PowerShell)
  ipconfig | findstr IPv4
  ```
  Then `API_BASE_URL=http://192.168.1.23:3000` (your actual LAN IP, port 3000). Android cleartext HTTP to this address is already allowed — the `expo-build-properties` plugin config handles that, see Step 9.

**Whichever you pick, set it in *two* places, not just `.env`:**

1. **`pasakja-mobile/.env`** — for `npx expo start` / Expo Go / local dev-client runs.
2. **As an EAS environment variable** — for any `eas build`. This is the part that's easy to miss: **EAS Build clones your repo fresh in the cloud. `.env` is (correctly) gitignored, so it never reaches that build — your app silently falls back to the hardcoded `localhost` default baked into `app.json`, and that gets compiled straight into the APK.** A built app pointing at `localhost` almost always means this step was skipped.

```bash
cd pasakja-mobile
eas env:set --scope project --name API_BASE_URL \
  --value "https://pasakja.vercel.app" \
  --visibility plaintext \
  --environment production

# repeat with --environment preview, and --environment development,
# so it's set no matter which build profile you use
```

Confirm what's actually registered any time with:
```bash
eas env:list --environment production
eas env:list --environment preview
eas env:list --environment development
```

Changing an EAS environment variable only takes effect on your **next** `eas build` — it doesn't retroactively update an APK you already built.

### 2d. An admin account (mobile can't self-register one)

Public registration only creates PASSENGER or DRIVER accounts, by design (same as the web app). To get an admin account for testing the Admin screens:

```bash
cd pasakja
npm run db:seed
```

This is safe to run anytime (it upserts, never duplicates) and creates:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `demo123` |
| Driver | `driver@demo.com` | `demo123` |
| Passenger | `passenger@demo.com` | `demo123` |

Use `admin@demo.com` to log into the Admin app. You'll also want the seeded driver/passenger, or just register fresh ones from the app — either works.

### 2e. Maps — no API key needed at all

The app uses **MapLibre** rendering the same free CartoDB Voyager tiles the web app already falls back to when no Mapbox token is set — no Google Cloud project, no billing account, no API key, ever. This was a deliberate choice after running into Google Cloud's billing-account setup being unreliable (the `OR_BACR2` error family) — rather than fight that, or trade it for a different signup/token system with Mapbox, the app now depends on nothing but a public tile server. Nothing to configure here.

One consequence worth knowing: MapLibre isn't bundled in plain Expo Go, so the map screens (Book, Trip tracking) only render on a **custom dev-client or built APK** (Step 5) — same requirement push notifications already have, so if you're testing both together this changes nothing about your workflow.

### 2f. PayMongo — already fine, one thing to know

`pasakja/.env` already has `sk_test_...`/`pk_test_...` keys — test mode, exactly as it should stay for the capstone. When you reach the GCash step in testing, PayMongo's **test-mode checkout page doesn't need a real GCash account** — it shows big "Authorize Test Payment" / "Fail Test Payment" buttons. Just click Authorize.

---

## 3. Run the backend

```bash
cd pasakja
npm run dev
```

Leave this running. Confirm it's reachable from your phone's browser by visiting `http://<your-LAN-IP>:3000` (the same URL you put in `API_BASE_URL`) on the phone — if that doesn't load, the phone and computer aren't on the same network, or a firewall is blocking port 3000, and nothing else in this guide will work until that's fixed.

---

## 4. Fast iteration with Expo Go (no build needed)

Good for UI/logic changes, **not** for push notifications (Expo Go dropped push support entirely as of the SDK this app uses — you'll need Step 5 for that).

```bash
cd pasakja-mobile
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (Android: use Expo Go's built-in scanner; the app's camera app also works). The app loads over your Wi-Fi network — same network requirement as Step 2c.

Everything works here except: push notifications, and Google/Apple Maps tiles may render with a "development build" watermark in some Expo Go versions (cosmetic only — this goes away in a real build).

---

## 5. Build an installable APK (EAS Build)

This is the real test — a standalone app, installed like any other Android app, with push notifications fully working (once Step 2a/2b are done).

```bash
cd pasakja-mobile
eas build --platform android --profile preview
```

- First run will ask to generate a new Android signing keystore — say yes, let EAS manage it (simplest option; it remembers this for future builds automatically).
- This runs in Expo's cloud — takes roughly 10–20 minutes. You'll get a terminal link to a build page on expo.dev where you can watch progress.
- When it finishes, the same page has a **Download** button (and a QR code that opens the download link directly on your phone).

Two build profiles are already configured in `eas.json`:
- **`preview`** — a standalone APK, no dev tools attached. Use this for the actual capstone demo and for anyone testing without your laptop nearby.
- **`development`** — a "dev client" APK meant to be paired with `npx expo start --dev-client` for live-reloading during active development (faster than rebuilding for every code change). Use this while you're still iterating.

```bash
# Dev-client build, if you want live-reload without repeated full builds:
eas build --platform android --profile development
# then, once installed on the phone:
npx expo start --dev-client
```

---

## 6. Install the APK on your phone

- **Easiest:** open the EAS build page's QR code directly on the phone's camera → tap the link → it downloads the `.apk` → tap the downloaded file → **Install**.
- **Alternative:** download the `.apk` to your computer, transfer it to the phone (USB cable, email, cloud drive — anything), open it on the phone, tap **Install**.
- Android will warn about installing from an unknown source the first time — that's expected for a sideloaded app; allow it (this is exactly what Step 1's "Install unknown apps" setting is for).

---

## 7. End-to-end testing checklist

Work through these in order — later ones depend on earlier ones existing. Use two accounts (a passenger and a driver) — either the seeded demo accounts (Step 2d) or freshly registered ones.

**Auth**
- [ ] Register a new Passenger account (with KYC photo capture via camera and/or gallery).
- [ ] Register a new Driver account (license + vehicle registration photos, vehicle type/plate/model).
- [ ] Log out, log back in with each.

**Driver approval (Admin)**
- [ ] Log in as `admin@demo.com`.
- [ ] Admin → Drivers → find your new driver (status "PENDING") → **Approve**.

**Passenger booking (Cash)**
- [ ] Log in as the passenger → Book tab → confirm the map loads with your location.
- [ ] Set a dropoff (search a place or tap the map) → confirm a fare estimate appears.
- [ ] Confirm booking with **Cash** → should land on the live Trip screen showing "Requested."

**Driver accepts + completes**
- [ ] Log in as the driver (or switch accounts) → go **Online** on the Home tab.
- [ ] Requests tab → see the new request → **Accept**.
- [ ] Trip tab → walk it through **Confirm Pickup → Start Trip → Complete Trip**.
- [ ] Back on the passenger side, confirm the Trip screen updated live and the driver's marker moved on the map.

**Rating**
- [ ] Passenger → Trips (history) → rate the completed trip.

**GCash payment**
- [ ] Book again, choose **GCash** this time.
- [ ] Confirm a browser tab opens to PayMongo's test checkout → tap **Authorize Test Payment**.
- [ ] Confirm it returns to the app automatically (not the web browser) and lands on the Trip screen with a "Payment received" message.

**SOS**
- [ ] Passenger → SOS tab → send an alert.
- [ ] Admin → SOS & Disputes → confirm the alert appears (with location) → **Mark Resolved**.

**Push notifications** (only if Steps 2a/2b are done, and you're on a **built APK**, not Expo Go)
- [ ] With the app backgrounded, have the other role trigger an event (e.g. driver accepts a booking) → confirm a system notification appears on the phone.
- [ ] Tap the notification → confirm it opens the app to the relevant screen.

**Admin overview**
- [ ] Admin → Dashboard → stats look sane.
- [ ] Admin → Bookings → filter by status.

---

## 8. Known limitations (by design, not bugs)

These are intentional scope decisions from the mobile plan — don't spend time debugging them, they're expected:
- **No background location** — GPS only broadcasts while the app is open/foregrounded (avoids Android's heavy background-location permission requirements for a capstone).
- **Admin is deliberately reduced** — fare/zone rate editing, full analytics reports, and driver remittance management are web-only; the mobile Admin app covers Dashboard, Bookings, Drivers (KYC), and SOS/Disputes only.
- **KYC documents are photos only** — no PDF upload on mobile (the web app allows PDFs too); a clear photo of the physical document is enough.
- **OSRM (routing) uses a public, rate-limited demo server** — same as the web app already does; if maps/fare estimates start failing under heavy testing, that's this shared public service being rate-limited, not your setup.
- **GCash minimum charge is ₱20** — a very short/cheap trip quote may be rejected by PayMongo itself if it estimates under that; the app already warns you and suggests cash instead.

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| App loads but every screen shows a network error | `API_BASE_URL` wrong, or phone/computer not on the same Wi-Fi | Re-check Step 2c; test the URL in the phone's browser first |
| **A built APK (not Expo Go) is hitting `localhost:3000`** instead of your real backend | `API_BASE_URL` was only set in local `.env`, not as an EAS environment variable — EAS Build never sees `.env` since it's gitignored, so it silently falls back to the hardcoded default | Register it via `eas env:set` (Step 2c) for every profile you build with, then **rebuild** — an existing APK won't update itself |
| Map screen is blank/grey | You're in plain Expo Go — MapLibre needs a custom dev-client/built APK, same as push notifications | Test map screens on a built APK (Step 5), not Expo Go |
| Map tiles load slowly or fail intermittently | The free CartoDB tile server is a shared public service with no SLA | Expected occasionally under heavy testing; not something to debug in the app itself |
| "Network request failed" specifically on API calls, only on a built APK (not Expo Go) | Cleartext HTTP blocked | Already fixed via `expo-build-properties` in `app.json` — if it still happens, confirm you rebuilt *after* that config was added |
| Push notifications never arrive, only on a built APK | Steps 2a/2b not done yet | Run `eas init` and upload FCM credentials via `eas credentials` |
| Push notifications never arrive, in **Expo Go** | Expected — Expo Go doesn't support push at all on this SDK | Test push only on a built APK (Step 5) |
| GCash browser tab doesn't return to the app | Deep link scheme issue | Confirm you're testing a **built APK**, not Expo Go — Expo Go can't register the app's own `pasakja://` scheme the same way |
| "You already have an active ride" when trying to book | A previous test booking is still open | Passenger → Trips → find the open one → cancel it (only works pre-pickup), or use `npx prisma studio` in `pasakja` to inspect/clean up test data directly |

---

## 10. Publishing to the Google Play Store

Status as of this writing: **not submitted yet**. Here's what's done, what's left, and what's just Play Console data-entry (not code).

### Already fixed
- **App icon, adaptive icon, and splash screen** replaced — the project used to ship the literal default Expo template icon (a generic blue arrow with design guides baked into the image). Now a real branded mark: a teal→emerald gradient with a bold white "P" monogram, wired into `app.json` (`icon`, `android.adaptiveIcon.*`, and the `expo-splash-screen` plugin).
- **`eas.json` production profile has `autoIncrement: true`** — without this, your first build gets `versionCode` 1 and every later build fails to submit with "version code already used."
- **Privacy Policy drafted** at `pasakja/app/privacy/page.tsx` (the web app, not this repo) — covers what's actually collected (account info, KYC documents, foreground-only location, SOS alerts, push tokens) and the real third parties involved (PayMongo, OSRM/Nominatim/CartoDB, Expo, Cloudinary). **Needs one decision from you: a real contact/support email** — it currently has a placeholder (`support@pasakja.app`, a domain you don't own) that needs to be swapped for an address you actually control before this goes live. After that, redeploy `pasakja` to Vercel and the policy is live at `https://pasakja.vercel.app/privacy` — that's the URL to paste into Play Console's App Content → Privacy Policy field.

### Still needed — Play Console setup (not code, can't be done from here)
- **App Content declarations**: Privacy Policy URL (above), Data Safety form (declare that you collect precise location, name/email/phone, photos, and that location/photos are shared with the third parties listed in the policy), Content Rating questionnaire, Target Audience & Content, Ads declaration (none, if you're not running ads).
- **Store listing**: app title, short description, full description, at least 2 screenshots (phone), a 512×512 hi-res icon (already have the source — `assets/icon.png` — just needs exporting/uploading in Console), and a 1024×500 feature graphic.
- **Closed/Internal testing track** (your chosen path): create the track in Play Console, add tester emails or a Google Group, share the opt-in link. Google may still require completing the App Content section above even for internal/closed tracks.
- **Google Play Developer account**: the one-time $25 registration, done on your end.

### Worth knowing, not blockers
- Location permissions are foreground-only (no `ACCESS_BACKGROUND_LOCATION`) — this avoids Google's much stricter background-location review and a separate declaration form.
- No `google-services.json` needed — push notifications go through Expo's push relay, not a direct Firebase SDK integration.
- GCash payment happens in an external browser/checkout, not Google Play Billing — same model as Grab/Uber/DoorDash, so Play Billing policy doesn't apply here.
- PayMongo stays in test mode (as required) — fine for closed/internal testing; just be deliberate that real strangers on a future public Production listing wouldn't be able to actually pay for a real ride until that's switched to live keys.
