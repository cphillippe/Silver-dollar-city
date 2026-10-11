import { createRequire } from 'node:module'

const raw = createRequire(import.meta.url)('node:assert/strict')

function record(args, err) {
  const message = [...args].reverse().find((item) => typeof item === 'string')
  const text = (message || String(err.message).split('\n')[0]).replace(/\s+/g, ' ').slice(0, 220)
  const bag = globalThis.__CITY_SCAN_FAILURES
  if (Array.isArray(bag)) bag.push(text)
}

function wrap(fn) {
  return (...args) => {
    try {
      return fn.apply(raw, args)
    } catch (err) {
      if (err && err.code === 'ERR_ASSERTION') {
        record(args, err)
        return undefined
      }
      throw err
    }
  }
}

const assert = wrap(raw)
for (const name of [
  'equal',
  'notEqual',
  'deepEqual',
  'notDeepEqual',
  'deepStrictEqual',
  'notDeepStrictEqual',
  'strictEqual',
  'notStrictEqual',
  'ok',
  'match',
  'doesNotMatch',
  'throws',
  'doesNotThrow',
  'rejects',
  'doesNotReject',
  'ifError',
  'fail',
]) {
  if (typeof raw[name] === 'function') assert[name] = wrap(raw[name])
}

export default assert
