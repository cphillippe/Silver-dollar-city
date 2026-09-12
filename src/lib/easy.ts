import type { ProgressState } from '../types.ts'
import type { CharacterId } from '../content/story.ts'
import { CAST } from '../content/story.ts'
import { evidenceFor } from '../content/evidence.ts'
import { CITY_PLOTS, type CityPlotId } from './city.ts'

export function isEasy(progress: Pick<ProgressState, 'easyMode'> | { easyMode?: boolean }): boolean {
  return Boolean(progress.easyMode)
}

/** Easy-mode chrome. Same truths — simpler labels. Teach hard words; don’t silently drop them. */
export const EASY = {
  creed: 'old shared belief',
  parable: 'Jesus story',
  mindMap: 'your scrapbook of matches',
  mindMapShort: 'Scrapbook',
  connectLink: 'Tap the sentence, then the place, then the person.',
  readStory: 'Read today’s story.',
  learnCta: 'Learn',
  readStoryFirst: 'Read the story first',
  learnThisFirst: 'Learn this first.',
  rememberSentence: 'Tap the line you kept.',
  tapWhy: 'Tap why this is true.',
  keepThis: 'Keep this',
  readAgain: 'Read this one again.',
  claimTeach: 'A claim is the main idea we hold to be true.',
  mainIdeaTeach: 'Main idea = the short true line we keep.',
  mainIdea: 'main idea',
  reasonTeach: 'A reason is why this is true.',
  reasonSense: 'why this is true',
  whyStands: 'Why this is true.',
  sourceSense: 'where this comes from',
  lockIn: 'Save your picks.',
  matchHow: 'Keep the right pictures. Remove wrong picks.',
  tapSentence: 'Tap a sentence',
  tapPlace: 'Tap a place',
  tapPerson: 'Tap a person',
  upgrade: 'Build this — raise the next look you earned by learning',
  manage: 'Manage',
  matchCta: 'Match',
  matchDone: 'Match done',
  matchWin: 'Matched!',
  holdNext: 'Hold next',
  nightDo: 'Night Watch',
  nightSoon: 'Night Watch (soon)',
  nightTap: 'Tap the face.',
  nightLead: 'Tap the face six times.',
  nightMiss: 'Wrong — tap the glowing face',
  home: 'Home',
  townSoon: 'Town (soon)',
  loveCue: 'Love — when compassion moves you, help like the Samaritan. Tap the glowing face.',
  deployTeach: 'Use a main idea you kept.',
  saved: 'Hold',
  savedSub: 'saved lines',
  connections: 'Connections',
  uses: 'Things you can use',
} as const

/** One short play cue — full tap-order sentence stays on the Start screen. */
export function easyLinkStep(step: 'idea' | 'place' | 'person'): string {
  if (step === 'idea') return EASY.tapSentence
  if (step === 'place') return EASY.tapPlace
  return EASY.tapPerson
}

/** One Easy miss line. Names the card to tap. */
export function easyWrongTap(card: string): string {
  const label = card.replace(/\.$/, '').trim()
  return `Wrong. Tap this one: ${label}.`
}

/** Hard Night Watch Love chrome — mechanic how-to, not a claim to hold. */
export const LOVE_HOW_HARD =
  'Love — tap the matching face. A true line turns a cheap claim toward heaven.'

const EASY_LINES: Record<string, string> = {
  'td-watch': EASY.loveCue,
}

export function loveHowTo(easy: boolean): string {
  return easy ? EASY.loveCue : LOVE_HOW_HARD
}

const EASY_CHROME: Record<string, string> = {
  'Received mercy makes refusing mercy a contradiction.':
    'Forgiven a huge debt — do not choke a neighbor.',
  'The servant forgiven an unpayable debt then throttles a peer over a small sum.':
    'He was forgiven much, then choked a neighbor.',
  'Jesus is only reforming first-century banking.':
    'Jesus is only talking about old money rules.',
  'Forgiveness is a limited coupon on God’s spreadsheet.':
    'Forgiveness is not a limited coupon.',
  'The first servant was right to demand prison for a small debt.':
    'Jail him over a tiny debt.',
  'The first servant was right to demand prison.': 'Jail him over a tiny debt.',
  'Peter’s “seven times” was already the full measure.': 'Seven times was already enough.',
  'Honor is spent so the son can be embraced; the older brother shows nearness without joy.':
    'The father hugs him first.',
  'The older brother is the hero for staying home.':
    'The older brother is the hero just for staying.',
  'Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.':
    'Jesus stands you with the hurt man, then the helper.',
  'The story is mainly a map of the Jericho road.': 'The story is only a road map.',
  'Mercy is optional once you have classified the victim.':
    'Mercy is optional after you sort people.',
  'The father waits until justice is complete.': 'The father waits until justice is done.',
  'Soil, search, a tiny seed, and a trust form a portrait — not a slogan.':
    'Pictures tell it — not a slogan.',
  'Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.':
    'Buried and seen — not only a spirit story.',
  'Appearances are admitted to be visions with no named people.':
    'The seen people are only nameless visions.',
  'Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.':
    'Paul names known people who saw it.',
  'Distance in time is the only historical question that matters.':
    'Only the date matters — names do not.',
  'Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”':
    'Many early, awkward reports beat a late tale.',
  'Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.':
    'The men first called the women wrong.',
  'Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.':
    'Life needs tight numbers — chance does not explain that.',
  'Life-permitting ranges are wide; blank chance predicts a habitable cosmos just as well.':
    'Life numbers are wide — chance is enough.',
  'Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.':
    'A Designer who wants people fits these numbers.',
  'Models describe a world already given; a physical “vacuum” is still something.':
    'A model still starts with something there.',
  'Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.':
    'Cells store info that looks like a mind’s work.',
  'Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.':
    'Nothing changes itself without a first mover.',
  'Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.':
    'Things that might not exist still need a ground.',
  'Brute fact is not a metaphysical move.': '“It just is” is not an answer.',
  'That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.':
    'A beginning has a Cause — more steps name God.',
  'Aquinas argues onward from the Ways; the New Testament adds a particular history.':
    'The first-cause walk is not yet the whole gospel.',
  'Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.':
    'We all know duty — strangers can still accuse.',
  'Theism is a reply in which mind is present at the beginning, not only an accident at the end.':
    'Mind is there at the start — not a late accident.',
  'A story without mind can still house the storyteller with no remainder.':
    'A no-mind story still has to house the teller.',
  'Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.':
    'Work and fun are gifts — not the last good.',
  'Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.':
    'The sunset wakes a hunger it cannot feed.',
  'Jesus uses an ordinary lamp and a city on a hill — public without being proud.':
    'A lamp and a hill city are meant to be seen.',
  'A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.':
    'Lamp, seed, and cup are gifts you can hold.',
  'The parable invites hearing; it does not flatter every field.':
    'Not every field is good soil.',
  'Paul lists Cephas, the Twelve, and more than five hundred — many still living then.':
    'Paul names many people who were still alive.',
  'If the formula is early, the claim is close to what it names: died, buried, raised.':
    'If the line is early, it is close to the event.',
  'Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.':
    'The sky speaks of a Maker — the numbers fit that.',
  'Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.':
    'Life, a livable world, and minds look given.',
  'Scribes copy, later hands compare, then a modern page prints a recovered text.':
    'Scribes copy, later hands compare, then we print it.',
  'The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.':
    'The Servant suffers for others — the church names Jesus.',
  'The claim is that God moves first — not that you finished the map.':
    'God moves first — you did not finish the map.',
  'The invitation is to a person — “Come to me” — not a performance.':
    'Come to me — rest is a gift, not a show.',
  'Jesus asks who *proved* to be a neighbor — the one who showed mercy.':
    'Jesus asks who showed mercy — that one is neighbor.',
  'The wounded man must first classify the helper.':
    'The hurt man must first sort the helper.',
  'The town does not sand that awkwardness into a tidy triumph.':
    'The first report stays awkward — not a tidy win.',
  'The psalms ask the question out loud and expect a Giver, not a shrug.':
    'The psalms ask why — and expect a Giver.',
  'You may refuse it; the town will not lock you in a pew.':
    'You may refuse — no one locks you in a pew.',
  'Love, logic, reason, and science you have kept can divert a false step up the ridge.':
    'Love, logic, reason, and science turn a false step.',
}

/** After the one teach, Easy never wallpapers the word claim. */
export function easyMainIdea(text: string): string {
  return text
    .replace(new RegExp('\\bcheap cla' + 'im\\b', 'gi'), 'unkind sentence')
    .replace(new RegExp('\\bcheap li' + 'ne\\b', 'gi'), 'unkind sentence')
    .replace(/\bmean lines\b/gi, 'unkind sentences')
    .replace(/\bmean line\b/gi, 'unkind sentence')
    .replace(/\bthe claims\b/gi, 'the main ideas')
    .replace(/\ba claim\b/gi, 'a main idea')
    .replace(/\bthe claim\b/gi, 'the main idea')
    .replace(/\bA claim\b/g, 'A main idea')
    .replace(/\bThe claim\b/g, 'The main idea')
    .replace(/\bsoils\b/gi, 'ground')
}

/** Easy buttons, tiles, and hints — plain words plus a short example. Hard copy stays. */
export function easyChromeLine(text: string): string {
  const direct = EASY_CHROME[text]
  if (direct) return direct
  return easyMainIdea(text)
    .replace(/first-century banking/gi, 'old money rules')
    .replace(/\bcontradiction\b/gi, "doesn't add up")
    .replace(/\bthrottles\b/gi, 'chokes')
    .replace(/\bthrottle\b/gi, 'choke')
}

const WHY_WORD_CAP = 12

/** Count words in an Easy why face. Em-dashes count as breaks, not words. */
export function easyWhyWordCount(text: string): number {
  return text
    .replace(/[—–]/g, ' ')
    .replace(/[“”"'‘’*,:;!?().]/g, '')
    .split(/\s+/)
    .filter(Boolean).length
}

/** One short Easy why chip — first sentence, ~8–12 words, no stacked theology. */
export function easyWhyLine(text: string): string {
  const face = easyChromeLine(text).trim()
  const first = face.split(/(?<=[.!?])\s+/)[0] ?? face
  const words = first.split(/\s+/).filter(Boolean)
  if (words.length <= WHY_WORD_CAP) return first
  return words.slice(0, WHY_WORD_CAP).join(' ')
}

function easyPictureWord(beat: string): string {
  const text = beat.toLowerCase()
  if (text.includes('neighbor')) return 'neighbor picture'
  if (text.includes('tomb') || text.includes('empty')) return 'empty-tomb picture'
  if (text.includes('star') || text.includes('sky') || text.includes('heaven')) return 'star picture'
  if (text.includes('bread') || text.includes('table') || text.includes('cup')) return 'shared-table picture'
  if (text.includes('seed') || text.includes('ground') || text.includes('soil')) return 'seed picture'
  if (text.includes('lamp') || text.includes('light')) return 'lamp picture'
  if (
    text.includes('unkind sentence') ||
    text.includes('mean line') ||
    text.includes('true one') ||
    text.includes('true line')
  ) {
    return 'true-line picture'
  }
  return 'story picture'
}

/** Easy Journal meta: who · where · picture · tool. No Anchored / deploys / after-quote. */
export function easyJournalMeta(learning: {
  anchor: string
  beat?: string
  tool?: string
}): string {
  const bits = learning.anchor.split(' · ').map((part) => part.trim())
  const who = bits[0] || 'Juniper'
  const where = (bits[1] ?? '').replace(/\s*after\s+.*/i, '').trim() || 'East porch'
  const picture = easyPictureWord(learning.beat ?? '')
  const parts = [who, where, picture]
  if (learning.tool) parts.push(`used as ${learning.tool}`)
  return parts.join(' · ')
}

export function easyFacingLine(id: string | undefined, text: string): string {
  if (id && EASY_LINES[id]) {
    const easy = EASY_LINES[id]
    if (text === easy || text === evidenceFor(id)?.claim) return easy
  }
  return easyMainIdea(text)
}

/** Hold review chips: one button per shown line. Keep the true answer; drop identical faces. */
export function uniqueHoldChoices(
  lines: readonly string[],
  face: (line: string) => string,
  keep: string,
): string[] {
  const seen = new Set<string>()
  const picked: string[] = []
  const queue = [keep, ...lines.filter((line) => line !== keep)]
  for (const line of queue) {
    const label = face(line).trim()
    if (!label || seen.has(label)) continue
    seen.add(label)
    picked.push(line)
  }
  const order = new Map<string, number>()
  lines.forEach((line, index) => {
    if (!order.has(line)) order.set(line, index)
  })
  if (!order.has(keep)) order.set(keep, -1)
  return picked.sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99))
}

/** Gold Town next tap — name what opens, not a bare “Tap this next.” */
export function easyTapNext(goal: { kind: string; areaId?: string }): string {
  if (goal.kind === 'daily') return 'Tap this next — short Jesus story'
  if (goal.kind === 'vista') return 'Tap this next — the lookout'
  if (goal.kind === 'welcome') return 'Tap this next — begin'
  if (goal.areaId === 'parable-hollow') return 'Tap this next — Mercy’s creek'
  if (goal.areaId === 'witness-bench') return 'Tap this next — public names'
  if (goal.areaId === 'observatory') return 'Tap this next — sky walk'
  if (goal.areaId === 'first-gate') return 'Tap this next — why a world'
  if (goal.areaId === 'high-lookout') return 'Tap this next — meaning walk'
  return 'Tap this next'
}

function firstSentence(text: string): string {
  const cut = text.trim().split(/(?<=[.!?])\s+/)[0] ?? text
  return cut.length > 160 ? `${cut.slice(0, 157)}…` : cut
}

/** One-or-two-line Easy story card — not the teach wall. */
export function easyStoryCard(text: string): string {
  return firstSentence(text)
}

/** Easy street lines in teach order — first is the mercy neighbor Match. */
export const EASY_LINE_ORDER = ['ph-road', 'wb-creed', 'daily-lantern'] as const
export const EASY_MATCH_LINE = EASY_LINE_ORDER[0]

const LINE_HOME: Record<string, { whoId: CharacterId; plotId: CityPlotId }> = {
  'ph-road': { whoId: 'mercy', plotId: 'hollow' },
  'wb-creed': { whoId: 'silas', plotId: 'bench' },
  'daily-lantern': { whoId: 'juniper', plotId: 'porch' },
}

function homeFor(id: string): { whoId: CharacterId; plotId: CityPlotId } {
  if (LINE_HOME[id]) return LINE_HOME[id]
  if (id.startsWith('ph-') || id === 'td-watch') return { whoId: 'mercy', plotId: 'hollow' }
  if (id.startsWith('wb-')) return { whoId: 'silas', plotId: 'bench' }
  if (id.startsWith('ob-')) return { whoId: 'nora', plotId: 'observatory' }
  if (id.startsWith('fg-')) return { whoId: 'ansel', plotId: 'gate' }
  if (id.startsWith('hl-')) return { whoId: 'hope', plotId: 'lookout' }
  return { whoId: 'juniper', plotId: 'porch' }
}

export interface EasyWhoWhere {
  who: string
  whoName: string
  whoId: CharacterId
  place: string
}

/** First Learn names who keeps the line and where it lives. */
export function easyWhoWhere(id: string): EasyWhoWhere {
  const home = homeFor(id)
  const keeper = CAST[home.whoId]
  const lot = CITY_PLOTS.find((plot) => plot.id === home.plotId)
  return {
    who: keeper.shortName,
    whoName: keeper.name,
    whoId: keeper.id,
    place: lot?.title ?? 'East porch',
  }
}

export function easyWhoWhereLine(id: string): string {
  const { whoName, place } = easyWhoWhere(id)
  return `This idea lives at ${place}, with ${whoName}.`
}

type TaughtProgress = Pick<ProgressState, 'taught' | 'completed' | 'held' | 'learnings'>

/** Story unlock, a finished walk, or a held line all count as learned. */
export function easyLineLearned(progress: TaughtProgress, id: string): boolean {
  if ((progress.taught ?? []).includes(id)) return true
  if ((progress.completed ?? []).includes(id)) return true
  if ((progress.held ?? []).includes(id)) return true
  return (progress.learnings ?? []).some((item) => item.id === id)
}

/** Next Easy story to teach — mercy neighbor first. */
export function easyLearnLine(progress: TaughtProgress): string {
  for (const id of EASY_LINE_ORDER) {
    if (!easyLineLearned(progress, id)) return id
  }
  return EASY_MATCH_LINE
}

/** Match stays locked until the line it asks (neighbor / Story Creek) is taught. */
export function easyMatchReady(progress: TaughtProgress): boolean {
  return easyLineLearned(progress, EASY_MATCH_LINE)
}

export function scrapbookLabel(easy: boolean, lit?: number) {
  if (!easy) {
    return lit === undefined ? 'Mind map' : `Mind map · ${lit} lit`
  }
  return lit === undefined ? EASY.connections : `${EASY.connections} · ${lit} lit`
}
