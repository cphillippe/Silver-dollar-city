#!/usr/bin/env bash
# Play AAB. Signs with PLAY_UPLOAD_* when all four are set. Otherwise uploads unsigned.
# Does not read ANDROID_KEYSTORE_*.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "${root}"

node --input-type=module <<'EOF'
import { readFileSync } from 'node:fs'
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const shell = JSON.parse(readFileSync('public/shell.json', 'utf8'))
const parts = String(pkg.version).split('.').map((part) => Number(part))
if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) {
  console.error('package.json version must be major.minor.patch')
  process.exit(1)
}
const code = parts[0] * 100000 + parts[1] * 1000 + parts[2]
if (!(code > shell.versionCode)) {
  console.error(`versionCode ${code} is not above shell.json ${shell.versionCode}`)
  process.exit(1)
}
console.log(`versionCode ${code} > shell.json ${shell.versionCode}`)
EOF

unset ANDROID_KEYSTORE_B64 ANDROID_KEYSTORE_PATH ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_ALIAS ANDROID_KEY_PASSWORD || true

export PLAY_AAB=1
export VITE_PLAY_BUILD=1
export VITE_PLAY_BILLING=1
unset VITE_PLAY_SHOP || true

if [[ -n "${PLAY_UPLOAD_KEYSTORE_B64:-}" && -n "${PLAY_UPLOAD_KEYSTORE_PASSWORD:-}" && -n "${PLAY_UPLOAD_KEY_ALIAS:-}" && -n "${PLAY_UPLOAD_KEY_PASSWORD:-}" ]]; then
  export PLAY_UPLOAD_KEYSTORE_PATH="${RUNNER_TEMP:-/tmp}/play-upload.keystore"
  printf '%s' "${PLAY_UPLOAD_KEYSTORE_B64}" | base64 -d > "${PLAY_UPLOAD_KEYSTORE_PATH}"
  test -s "${PLAY_UPLOAD_KEYSTORE_PATH}"
  echo "Play upload key present. The AAB will be signed."
else
  unset PLAY_UPLOAD_KEYSTORE_PATH || true
  echo "Play upload key absent. The AAB will be unsigned."
fi

npm run build
node scripts/android-play-shell.mjs --omit dist
node scripts/cap-sync.mjs android
node scripts/write-android-local-properties.mjs

shop="${VITE_PLAY_SHOP:-}"
shop_on=0
case "$(printf '%s' "${shop}" | tr '[:upper:]' '[:lower:]')" in
  1|true|yes|on) shop_on=1 ;;
esac

cd android
chmod +x ./gradlew
if [[ "${shop_on}" == 1 ]]; then
  ./gradlew bundleShopOnRelease --no-daemon
else
  ./gradlew bundleShopOffRelease --no-daemon
fi

aab="$(find app/build/outputs/bundle -name '*.aab' -print -quit)"
test -n "${aab}"
test -f "${aab}"
cp "${aab}" "${root}/silver-city.aab"

merged="$(find app/build/intermediates/merged_manifest -name 'AndroidManifest.xml' -print -quit)"
test -n "${merged}"
test -f "${merged}"
if [[ "${shop_on}" == 1 ]]; then
  if ! grep -q 'com.android.vending.BILLING' "${merged}"; then
    echo "Play shop is on. Merged manifest is missing com.android.vending.BILLING"
    exit 1
  fi
  echo "BILLING permission is in the shop-on Play manifest."
else
  if grep -q 'com.android.vending.BILLING' "${merged}"; then
    echo "Play shop is off. Merged manifest must not declare com.android.vending.BILLING"
    exit 1
  fi
  echo "Shop off. BILLING is not in the Play manifest."
fi
echo "AAB written to silver-city.aab"
