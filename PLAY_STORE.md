# Publishing Pasakja to the Google Play Store

Status as of this writing: **app created in Play Console, not yet submitted.** Here's what's done, what's left, and what's just Play Console data-entry (not code).

## Already fixed (code side)

- **App icon, adaptive icon, and splash screen** replaced — the project used to ship the literal default Expo template icon (a generic blue arrow with design guides baked into the image). Now a real branded mark: a teal→emerald gradient with a bold white "P" monogram, wired into `app.json` (`icon`, `android.adaptiveIcon.`*, and the `expo-splash-screen` plugin).
- `eas.json` **production profile has** `autoIncrement: true` — without this, your first build gets `versionCode` 1 and every later build fails to submit with "version code already used."
- **Privacy Policy drafted** at `pasakja/app/privacy/page.tsx` (the web app, not this repo) — covers what's actually collected (account info, KYC documents, foreground-only location, SOS alerts, push tokens) and the real third parties involved (PayMongo, OSRM/Nominatim/CartoDB, Expo, Cloudinary). **Needs one decision from you: a real contact/support email** — it currently has a placeholder (`support@pasakja.app`, a domain you don't own) that needs to be swapped for an address you actually control before this goes live. After that, redeploy `pasakja` to Vercel and the policy is live at `https://pasakja.vercel.app/privacy` — that's the URL to paste into Play Console's App Content → Privacy Policy field.
- **Store assets generated**: 512×512 hi-res icon and 1024×500 feature graphic, both in `store-assets/` in this repo, matching the app's brand gradient.



## Worth knowing, not blockers

- Location permissions are foreground-only (no `ACCESS_BACKGROUND_LOCATION`) — this avoids Google's much stricter background-location review and a separate declaration form.
- No `google-services.json` needed — push notifications go through Expo's push relay, not a direct Firebase SDK integration.
- GCash payment happens in an external browser/checkout, not Google Play Billing — same model as Grab/Uber/DoorDash, so Play Billing policy doesn't apply here.
- PayMongo stays in test mode (as required) — fine for closed/internal testing; just be deliberate that real strangers on a future public Production listing wouldn't be able to actually pay for a real ride until that's switched to live keys.



## Step-by-step checklist

**1. Create the app** — ✅ done

- [x] Play Console → Home → Create app
- [x] App name: `Pasakja`
- [x] Package name: `com.pasakja.mobile`
- [x] App or game: App · Free or paid: Free
- [x] Declarations accepted, app created

**2. Build the release artifact** — you are here

- [ ] `eas build --platform android --profile production` — produces an `.aab` (already configured for App Bundle output + `autoIncrement` in `eas.json`; production `API_BASE_URL` is already set correctly in EAS env vars)
- [ ] Download the `.aab` from the EAS build page when it finishes

**3. App content** (Play Console → App content, left sidebar)

- [ ] Privacy Policy URL — `https://pasakja.vercel.app/privacy` (only after you've swapped the placeholder email and redeployed)
- [ ] Data Safety form — declare: precise location (used for app functionality, not shared), name/email/phone (account creation), photos (KYC docs/profile, shared with Cloudinary)
- [ ] Content rating questionnaire
- [ ] Target audience & content — not primarily directed at children
- [ ] Ads declaration — **No ads**
- [ ] Government apps / News apps declarations — **No** (not applicable)

**4. Store listing** (Play Console → Store presence → Main store listing)

- [ ] Short description (≤80 chars) and full description (≤4000 chars) — describe the tricycle/habal-habal/bao-bao booking service for Socorro
- [ ] App icon (512×512) — **ready**: `store-assets/icon-512.png`
- [ ] Feature graphic (1024×500) — **ready**: `store-assets/feature-graphic-1024x500.png`
- [ ] Phone screenshots — need at least 2 (e.g. Book screen with map, active trip tracking screen, driver requests list)
- [ ] Category: **Maps & Navigation** or **Travel & Local**
- [ ] Contact details (email/phone/website) for the public listing page

**5. Testing track** (Play Console → Testing → Internal testing)

- [ ] Create a new release, upload the `.aab` from step 2
- [ ] Add release notes (e.g. "Initial internal testing release")
- [ ] Add testers — either individual emails or a Google Group, then share the opt-in URL Play Console generates
- [ ] Save → Review release → Start rollout to Internal testing
- [ ] Send the opt-in link + Play Store app link to your students — no more "unknown sources"/Play Protect warnings once they install through it

**6. Submit for review**

- [ ] Once App content + Store listing are both green-checked, the Internal testing release can usually go out without a full review (internal testing is lightweight). A public Production release later would need full review — not needed yet for a capstone demo.