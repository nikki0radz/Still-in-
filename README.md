# Still In? · Drip edition

A simple, private Android period tracker. Red Velvet styling, Nicole's supplied Drip artwork, wear-time timelines, quick reports, and a continuous calendar story.

## Version 0.3

- Black / oxblood interface with serif headings and a delicate gothic arch.
- Original supplied Drip sheets displayed through individually clipped SVG viewports. Image pixels are preserved; no substitute or regenerated drawings.
- Start time on the left, removal/change deadline on the right, and a fill meter marking the current position. Overdue time stays tied to the original deadline.
- Drip relaxes during the first hour, then switches hourly to the corresponding product-filling scenes. Tampons and pads have six scenes; cups and discs have twelve. Scenes represent **elapsed wear time**, never measured fullness or inferred blood loss.
- Product-specific confirmation artwork after inserting, changing or reinserting.
- New timer defaults: tampon 6 hours, cup/disc 12 hours, pad/liner 4 hours, period pants 8 hours. Adjustable in settings; follow the actual brand's shorter instructions and change earlier when needed. Tampon reminders cannot exceed 8 hours.
- Existing active deadlines and explicit reminder preferences survive updates. Fresh replacements use the current default; empty/reinsert retains that session's chosen interval.
- Quick timestamped reports: cramps (six severity levels), leaks, waking dry, blood on bedding, bleeding starting, heavy bleeding, no blood right now, and notes.
- Reporting no blood records that moment; it does not clear other reports, photos, or an entire day's history.
- Calendar switches between Month and Timeline. Timeline connects dates and chronological reports / insertions / removals, with product-wear bars across a 24-hour axis. Overnight use is split across local days. Empty dates are explicitly unlogged, never assumed clear.
- Current flow updates get timestamped for today; past-day flow entries remain date-only summaries. No invented timestamps for older day notes.
- Saturation, optional cup/disc ml, leakage and private photos remain available on removal. The receipts include reports too.

## Install and privacy

Install `dist/still-in-0.3.apk` over a previous Still In installation. It uses the same package ID and signing key, preserving app data. Enable notifications and precise alarms in Settings → Phone reminders, then try the 10-second test on the actual phone before relying on delivery.

The APK bundles the UI and artwork and works offline, with no Internet or shared-storage permission. Log state is private SharedPreferences, photos are private WebView IndexedDB, and temporary built-in camera captures use private cache. No login, analytics, AI calls, or server-held health records. Android backups are disabled. Photos reach shared storage only through a user-requested JSON export. Clearing app data or uninstalling removes logs and photos. Browser-preview and Android records are separate.

Ongoing notifications show a countdown/overdue chronometer, with a separate 30-minute warning, due alarm and repeated 15-minute overdue reminders. Android 14+ can allow swiping away the ongoing notification while unlocked; that does not cancel the scheduled alarm. Actual sound, lock-screen delivery, Do Not Disturb, battery restrictions, force-stop and power-off behavior need device testing.

## Build

Requires JDK, ECJ and SDK platform 35 / Android build tools. Set `STILL_ANDROID_SDK` to a directory containing `android-35/android.jar`, `android-15/` build tools and `ecj.jar`. `STILL_ANDROID_BUILD` is optional.

```sh
STILL_KEYSTORE=/private/path/still-in-signing.p12 \
STILL_STORE_PASSWORD="$(cat /private/path/password.txt)" \
./scripts/build-android.sh
```

The signing key is excluded from this public repo. Nicole's private backup is `still-in-signing-backup.zip`. Reuse that key (alias `still-in`) for every update; never commit it or its password.

## Checks

```sh
node --test tests/model.test.cjs
node --check dist/app.js
node --check dist/drip-art.js
```

The model suite covers migration, original deadlines, reports, validation, Drip stages, chronological reinsertion and cross-midnight wear. Compile `tests/ScheduleTest.java` with `android/src/com/nicole/stillin/Schedule.java` to verify alarm timing on a JVM. The APK compiles and verifies v2/v3 signatures. Browser interaction checks cover artwork, reporting, product confirmations and calendar views. No Android emulator or physical phone is available in this workspace; device alarm delivery, camera orientation and reboot restoration remain acceptance checks.

## Browser preview

Serve `dist/` as static files, no dependencies or build step. The preview supports local records, photos and export, but not closed-browser phone alarms. Sites deployment identity is preserved in `.openai/hosting.json`.

The original supplied artwork is in `dist/art/`; sprite metadata is in `dist/drip-art.js`. The API contains no user records or test fixtures. Test activity in a developer preview is browser-local and is never shipped in the APK.

Guidance: [FDA tampon safety](https://www.fda.gov/consumers/consumer-updates/facts-tampons-and-tampon-safety), [CDC menstrual hygiene](https://www.cdc.gov/hygiene/about/menstrual-hygiene.html), [Pixie Cup instructions](https://itspixie.com/pages/faqs), [Android alarms](https://developer.android.com/develop/background-work/services/alarms).
