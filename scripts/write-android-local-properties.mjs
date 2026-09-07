import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sdk =
  process.env.ANDROID_SDK_ROOT ||
  process.env.ANDROID_HOME ||
  `${process.env.HOME ?? ''}/Android/Sdk`

const escaped = sdk.replaceAll('\\', '\\\\').replaceAll(':', '\\:')
writeFileSync(
  resolve('android/local.properties'),
  `sdk.dir=${escaped}\n`,
  'utf8',
)
console.log(`Wrote android/local.properties → ${sdk}`)
