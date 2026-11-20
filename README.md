# Still In?

What's in. When it's out. A simple, offline period tracker for Android, with a browser preview.

## First draft · 0.1

- Illustrated product picker: tampon, cup, disc, pad, liner, and period pants.
- An internal product plus external backup can run together. Prevents logging two internal products simultaneously.
- Timestamp-based countdowns, overdue time, 30-minute warnings, due alarms, and repeated 15-minute overdue reminders.
- Tampon timers capped at eight hours. Cup/disc defaults eight hours; selectable reminders up to twelve hours require following the brand's instructions. Reminder times are not guarantees of safe wear.
- Removal records with optional saturation, collected ml, leakage, and private photos.
- One-tap empty/reinsert or fresh product replacement.
- Calendar with explicit no-bleeding/spotting/light/medium/heavy entries and notes. Unlogged days remain unlogged; no predictions.
- “Nothing tonight” with optional cheeky banter.
- Private JSON export including photos. No account, analytics, AI usage, or server-held health records.

## Android

Install `dist/still-in-0.1.apk`. Open Settings → Phone reminders, allow notifications and precise alarms, and use the 10-second reminder test before relying on it. Device-specific sound, Do Not Disturb, battery restrictions, force stop, and power-off behavior require testing on the actual phone. On Android 14+, ongoing notifications can be swiped away while unlocked; dismissing the notification does not cancel the scheduled alarm.

The APK bundles the UI and works offline. The app requests no Internet or shared-storage permission. Log state is stored in private SharedPreferences; photos are held in private WebView IndexedDB. The built-in camera captures to private cache, strips metadata by decoding/recompressing, passes the resized image to the form, and deletes its temporary file. Photos reach shared storage only via an explicit export. Backups are disabled. Uninstalling or clearing app data removes logs and photos. Browser preview data is separate from Android app data.

The signing key is intentionally excluded from this public repository. Its private backup is saved as `still-in-signing-backup.zip` in Nicole's files. Always reuse that key for APK updates; changing keys would require uninstalling and losing private app data.

### Build

Requires JDK, Eclipse ECJ, Android SDK platform 35 and build tools (aapt2, d8, zipalign, apksigner). The script accepts `STILL_ANDROID_SDK` with `android-35/android.jar`, `android-15/` build tools and `ecj.jar`; optionally set `STILL_ANDROID_BUILD`.

```sh
STILL_KEYSTORE=/private/path/still-in-signing.p12 \
STILL_STORE_PASSWORD="$(cat /private/path/password.txt)" \
./scripts/build-android.sh
```

Alias: `still-in`. Never commit the keystore or password.

### Checks

```sh
node --test tests/model.test.cjs
node --check dist/app.js
```

Compile and run `tests/ScheduleTest.java` with `android/src/com/nicole/stillin/Schedule.java` to verify alarm timing on a JVM.

## Browser preview

Serve `dist/` as static files. No installation or build required. Browser mode supports logs, calendar, in-app camera capture, and export, but does not schedule closed-app phone alarms. The APK download is linked from the preview. Sites deployment configuration is in `.openai/hosting.json`.

## Verification limits

JavaScript model tests and JVM scheduling tests pass; the APK compiles and its v2/v3 signatures verify. Browser flows were tested interactively. No Android emulator or physical device is available in this workspace, so actual delivery with screen locked, Samsung power management, camera orientation, reboot restoration, and notification sounds remain device acceptance checks.

Guidance: [FDA tampon safety](https://www.fda.gov/consumers/consumer-updates/facts-tampons-and-tampon-safety), [Android exact alarms](https://developer.android.com/develop/background-work/services/alarms), [Android ongoing notification behavior](https://developer.android.com/about/versions/14/behavior-changes-all#non-dismissable-notifications).
