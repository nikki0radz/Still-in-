#!/usr/bin/env bash
set -euo pipefail
STILL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STILL_SDK="${STILL_ANDROID_SDK:-/workspace/packed-android-sdk}"
STILL_BUILD="${STILL_ANDROID_BUILD:-$STILL_ROOT/.build/android}"
: "${STILL_KEYSTORE:?Set STILL_KEYSTORE to your private signing keystore}"
: "${STILL_STORE_PASSWORD:?Set STILL_STORE_PASSWORD}"
rm -rf "$STILL_BUILD"
mkdir -p "$STILL_BUILD"/{res,classes,generated,assets/www,dex}
cp "$STILL_ROOT/dist/"{index.html,app.js,model.js,style.css,icon.svg,drip-art.js} "$STILL_BUILD/assets/www/"
cp -R "$STILL_ROOT/dist/art" "$STILL_BUILD/assets/www/"
"$STILL_SDK/android-15/aapt2" compile --dir "$STILL_ROOT/android/res" -o "$STILL_BUILD/compiled-res.zip"
"$STILL_SDK/android-15/aapt2" link -o "$STILL_BUILD/base.apk" -I "$STILL_SDK/android-35/android.jar" --manifest "$STILL_ROOT/android/AndroidManifest.xml" --java "$STILL_BUILD/generated" -R "$STILL_BUILD/compiled-res.zip" -A "$STILL_BUILD/assets" --auto-add-overlay
find "$STILL_ROOT/android/src" "$STILL_BUILD/generated" -name '*.java' > "$STILL_BUILD/sources.txt"
java -cp "$STILL_SDK/ecj.jar" org.eclipse.jdt.internal.compiler.batch.Main -8 -nowarn -proc:none -classpath "$STILL_SDK/android-35/android.jar" -d "$STILL_BUILD/classes" @"$STILL_BUILD/sources.txt"
(cd "$STILL_BUILD/classes" && zip -qr "$STILL_BUILD/classes.jar" .)
"$STILL_SDK/android-15/d8" --min-api 26 --lib "$STILL_SDK/android-35/android.jar" --output "$STILL_BUILD/dex" "$STILL_BUILD/classes.jar"
cp "$STILL_BUILD/base.apk" "$STILL_BUILD/unsigned.apk"
(cd "$STILL_BUILD/dex" && zip -q "$STILL_BUILD/unsigned.apk" classes.dex)
"$STILL_SDK/android-15/zipalign" -f 4 "$STILL_BUILD/unsigned.apk" "$STILL_BUILD/aligned.apk"
"$STILL_SDK/android-15/apksigner" sign --ks "$STILL_KEYSTORE" --ks-pass env:STILL_STORE_PASSWORD --key-pass env:STILL_STORE_PASSWORD --ks-key-alias still-in --out "$STILL_ROOT/dist/still-in-0.3.apk" "$STILL_BUILD/aligned.apk"
"$STILL_SDK/android-15/apksigner" verify --verbose "$STILL_ROOT/dist/still-in-0.3.apk"
