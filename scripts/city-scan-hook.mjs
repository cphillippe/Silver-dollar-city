/** Sends check-city's assert import to the scan counter. */
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'node:assert/strict' || specifier === 'assert/strict') {
    return {
      shortCircuit: true,
      url: new URL('./city-scan-assert.mjs', import.meta.url).href,
    }
  }
  return nextResolve(specifier, context)
}
