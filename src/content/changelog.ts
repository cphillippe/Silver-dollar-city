/** Player-facing notes for Settings → What’s new. Add a row per pack or app drop. */
export interface ChangeNote {
  version: string
  title: string
  when: string
  items: string[]
}

export const CHANGELOG: ChangeNote[] = [
  {
    version: '1.4.98',
    title: 'Dig Reveal timed scrub · Easy core trail',
    when: '2026-09-21',
    items: [
      'Dig: scrub dirt off three tablets against a clock (Easy 20s / Hard 12s). Clock starts on first scrub. Three reveals → DUG!; timeout soft Buried! then One more dig reset. No glow-order',
    ],
  },
]
