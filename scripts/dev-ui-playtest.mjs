/** Settings developer UI (jumps, debug, Quick review) only renders with ?playtest=1. */

/** Merge playtest=1 into a relative path or absolute URL. */
export function withPlaytest1(href) {
  const absolute = /^https?:\/\//i.test(href)
  const url = new URL(absolute ? href : `http://local${href.startsWith('/') ? href : `/${href}`}`)
  url.searchParams.set('playtest', '1')
  if (absolute) return url.toString()
  return `${url.pathname}${url.search}${url.hash}`
}

/** Merge playtest=1 into a query string (with or without leading ?). */
export function withPlaytestQuery(search) {
  const params = new URLSearchParams(String(search).replace(/^\?/, ''))
  params.set('playtest', '1')
  return `?${params.toString()}`
}

/** Relative app path with playtest=1 (optional extra query, e.g. nwCam=0). */
export function devUiAppPath(search = '', extra = '') {
  const params = new URLSearchParams(String(search).replace(/^\?/, ''))
  params.set('playtest', '1')
  if (extra) {
    const more = new URLSearchParams(String(extra).replace(/^\?/, '').replace(/^&/, ''))
    for (const [key, value] of more) params.set(key, value)
  }
  return `/?${params.toString()}`
}
