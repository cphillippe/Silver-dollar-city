import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const stylesDir = join(root, 'src/styles')

/** index.css plus every src/styles/*.css — for asserts after CSS peels. */
export function readAppCss() {
  const parts = [readFileSync(join(root, 'src/index.css'), 'utf8')]
  try {
    for (const name of readdirSync(stylesDir).sort()) {
      if (name.endsWith('.css')) {
        parts.push(readFileSync(join(stylesDir, name), 'utf8'))
      }
    }
  } catch {
    // styles/ may be absent on a pre-peel tree
  }
  return parts.join('\n')
}
