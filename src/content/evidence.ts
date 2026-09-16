import { journalEntries } from './journal.ts'
import { hashString } from '../lib/dates.ts'
import { briefFromPack, packBrief, PACK_CATALOG } from './packCatalog.ts'
import { PAID_STREETS } from './paidStreets.ts'
import type { LessonTierId } from './packTypes.ts'

export interface EvidenceBrief {
  id: string
  claim: string
  reason: string
  source: string
  claimChoices: [string, string, string]
  reasonChoices: string[]
}

function brief(
  id: string,
  claim: string,
  reason: string,
  source: string,
  claimMissA: string,
  claimMissB: string,
  reasonMissA: string,
  reasonMissB: string,
): EvidenceBrief {
  return {
    id,
    claim,
    reason,
    source,
    claimChoices: [claim, claimMissA, claimMissB],
    reasonChoices: [reason, reasonMissA, reasonMissB],
  }
}

/** One-line claim + reason for every walk. Retrieval uses these, not the long teaching page. */
export const EVIDENCE: Record<string, EvidenceBrief> = {
  'ph-road': brief(
    'ph-road',
    'Neighbor is the one who shows mercy.',
    'Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.',
    'Luke 10:25–37',
    'Neighbor means the person who already looks like you.',
    'The priest is the hero because he kept the law.',
    'The story is mainly a map of the Jericho road.',
    'Mercy is optional once you have classified the victim.',
  ),
  'ph-father': brief(
    'ph-father',
    'The father runs with mercy before the speech is done.',
    'Honor is spent so the son can be embraced; the older brother shows nearness without joy.',
    'Luke 15:11–32',
    'The son earned the feast by writing a good apology.',
    'The story is mainly about dividing an estate.',
    'The father waits until justice is complete.',
    'The older brother is the hero for staying home.',
  ),
  'ph-seeds': brief(
    'ph-seeds',
    'The kingdom arrives in pictures, not slogans.',
    'Soil, search, a tiny seed, and a trust form a portrait — not a slogan.',
    'Matthew 13; Luke 15; Matthew 25',
    'Every parable is an allegory of every detail.',
    'The kingdom is only for people who already understand.',
    'The sower proves every heart is the same.',
    'The talents story is about hiding gifts until heaven.',
  ),
  'ph-debt': brief(
    'ph-debt',
    'Forgiven much, you cannot choke a neighbor over a little debt.',
    'He was forgiven much, then choked a neighbor.',
    'Matthew 18:21–35',
    'Forgiveness is a limited coupon on God’s spreadsheet.',
    'Jesus is only reforming first-century banking.',
    'Peter’s “seven times” was already the full measure.',
    'The first servant was right to demand prison.',
  ),
  'wb-creed': brief(
    'wb-creed',
    'Paul hands on an early public creed: died, buried, raised, appeared.',
    'Christ was buried and seen — not only a spirit story.',
    '1 Corinthians 15:3–8',
    'The creed is Paul’s private dream from decades later.',
    'Paul invented the formula on the spot in Corinth.',
    '“Buried” is only poetic decoration.',
    'Appearances are admitted to be visions with no named people.',
  ),
  'wb-early': brief(
    'wb-early',
    'The churches named the risen Christ close to the events.',
    'Paul names people who saw him; Luke asked witnesses.',
    '1 Corinthians 15:3–7; Luke 1:1–4',
    'Early is the same as laboratory proof.',
    'No first-century writer claims to have asked witnesses.',
    'Named people make a report less testable.',
    'Distance in time is the only historical question that matters.',
  ),
  'wb-method': brief(
    'wb-method',
    'We weigh named reports of Jesus; we still read them.',
    'Many early, awkward reports beat a late tale.',
    'Luke 1:1–4 · 1 Corinthians 15:5–6',
    'An early creed is already a laboratory proof.',
    'Every Christian report is automatically a late novel.',
    'Method is a way to skip the texts themselves.',
    'Embarrassment means a story must be false.',
  ),
  'wb-women': brief(
    'wb-women',
    'Women were first to report Jesus’ empty tomb.',
    'The apostles first called them wrong — Luke still wrote it.',
    'Luke 24:1–11',
    'The Gospels open with the Roman senate converting overnight.',
    'Women were the most legally impressive public witnesses.',
    'Luke sands away any dismissal of the first report.',
    'Outside writers never mention Christus or Pilate.',
  ),
  'ob-tuning': brief(
    'ob-tuning',
    'The universe is finely tuned for life — that fit points to a Designer.',
    'Life needs tight numbers — chance does not explain that.',
    'Psalm 19:1–4; Romans 1:20',
    'Fine-tuning is a rumor with no name in science.',
    'A habitable cosmos needs no explanation at all.',
    'Life-permitting ranges are wide; blank chance predicts a habitable cosmos just as well.',
    'The fittedness is only a rumor in the numbers.',
  ),
  'ob-design': brief(
    'ob-design',
    'Fine-tuning is best explained by a mind that intended a habitable world.',
    'A Designer who wants people fits these numbers.',
    'Romans 1:20; fine-tuning (Collins)',
    'A habitable cosmos needs no Designer.',
    'Fine-tuning already proves a particular gospel.',
    'A mind wanting observers would not expect life-permitting numbers.',
    'Likelihood arguments are automatically dishonest.',
  ),
  'ob-leibniz': brief(
    'ob-leibniz',
    'Why is there something rather than nothing remains after a cosmological model.',
    'Models describe a world already given; a physical “vacuum” is still something.',
    'Leibniz; the vacuum/nothing distinction',
    'A successful model retires the metaphysical question.',
    '“Nothing” in popular writing always means metaphysical nothing.',
    'Laws and vacua are not somethings.',
    'The question only applies to Tuesdays.',
  ),
  'ob-life': brief(
    'ob-life',
    'Life’s specified information is a mark of mind.',
    'Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.',
    'Genesis 1',
    'A flask has already demonstrated a miracle.',
    'Cells require no coordinated information.',
    'The unfinished story means we should end research.',
    'Genesis 1 is a lab protocol.',
  ),
  'fg-order': brief(
    'fg-order',
    'You already trust that the world holds together in Christ.',
    'All things were made through him and hold together in him.',
    'Colossians 1:16–17',
    'The world is a lucky pile with no holder.',
    'You do not actually trust order in ordinary life.',
    'Nothing holds the world together.',
    'Order is only a mood.',
  ),
  'fg-reason': brief(
    'fg-reason',
    'The mind you already trust needs a real ground.',
    'The Word is the true light that makes God knowable.',
    'John 1:1–9 · Romans 1:19–20',
    'Reason is a free-floating trick with no ground.',
    'Darkness is the last word about the world.',
    'Reason floats with no ground.',
    'The world is finally dark.',
  ),
  'fg-ought': brief(
    'fg-ought',
    'Rocks cannot write the law you already trust.',
    'A limited world cannot write the law on the heart.',
    'Romans 2:14–15',
    'Rocks and weather write the law on the heart.',
    'Ought is only a mood you can drop.',
    'Rocks write the law on the heart.',
    'Ought is only a mood.',
  ),
  'fg-ground': brief(
    'fg-ground',
    'The living God is the foundation of order, reason, and ought.',
    'In him we live and move and have our being.',
    'Acts 17:24–28',
    'The foundation is a dead first brick, not the living God.',
    'We live by accident, not in God.',
    'The foundation is a dead brick.',
    'We live by accident, not in God.',
  ),
  'fg-mover': brief(
    'fg-mover',
    'Change now needs a first mover that is not itself changing.',
    'Nothing changes itself without a first mover.',
    'Aquinas, ST I, q.2, a.3 (First Way)',
    'This is only a story about dominoes at the Big Bang.',
    'Each changing thing explains itself.',
    '“First” here means the earliest date on a calendar.',
    'Infinite backlog automatically explains present change.',
  ),
  'fg-contingent': brief(
    'fg-contingent',
    'Things that might not exist still need a necessary ground.',
    'Things that might not exist still need a ground.',
    'Aquinas’s Third Way; Leibniz on sufficient reason',
    'Contingent things contain the reason why there is anything.',
    'Rivals are unintelligible and need not be named.',
    'Necessary being is only a weather report.',
    'Brute fact is not a metaphysical move.',
  ),
  'fg-kalam': brief(
    'fg-kalam',
    'What begins has a cause — the universe began, so it has a Cause.',
    'A beginning has a Cause — more steps name God.',
    'Genesis 1:1; Kalām tradition',
    'A cause of the beginning is already the whole creed.',
    'The form never mentions a beginning.',
    'The second premise cannot be argued at all.',
    'A first cause automatically names Jesus.',
  ),
  'fg-limits': brief(
    'fg-limits',
    'A first cause is a great deal — not yet the whole gospel.',
    'The first-cause walk is not yet the whole gospel.',
    'Aquinas ST I; Pascal on philosophers and Abraham',
    'The Five Ways are already the whole gospel.',
    'Pascal commands you to skip the philosophers.',
    'Stopping at a first cause is required.',
    'History has nothing further to add.',
  ),
  'hl-moral': brief(
    'hl-moral',
    'Duty is more than taste — a good God fits that pull.',
    'We all know duty — strangers can still accuse.',
    'Romans 2:14–15',
    'Duty is only a preference we pretend is law.',
    'Atheist moral realism is impossible to name.',
    'Moral argument is a sneer at people who doubt.',
    'Strangers cannot expect injustice to mean anything.',
  ),
  'hl-mind': brief(
    'hl-mind',
    'A story of the world must find a home for mind — including the storyteller.',
    'Mind is there at the start — not a late accident.',
    'John 1:1–4; Acts 17:28',
    'Qualia and aboutness are parlor tricks.',
    'Theism is the only reply anyone has offered.',
    'A story without mind can still house the storyteller with no remainder.',
    'Mind is easy to treat as leftover steam.',
  ),
  'hl-meaning': brief(
    'hl-meaning',
    'Local meaning can be built — the lookout asks whether it is also received.',
    'Work and fun are gifts — not the last good.',
    'Ecclesiastes 2; 9; 12',
    'Work and pleasure are the final good.',
    'Ecclesiastes calls every gift worthless.',
    'The hunger for a final good has no question attached.',
    'You cannot build any local meaning without naming God.',
  ),
  'hl-beauty': brief(
    'hl-beauty',
    'Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.',
    'The sunset wakes a hunger it cannot feed.',
    'Lewis, Weight of Glory; Psalm 19:1–4',
    'A sunset deducts God as a theorem.',
    'Hungers never correspond to real countries.',
    'Psalm 19 treats the sky as silent decoration.',
    'The lookout and the observatory cannot share a ridge.',
  ),
  'daily-lantern': brief(
    'daily-lantern',
    'A lamp is meant to be seen.',
    'Jesus uses an ordinary lamp and a city on a hill — public without being proud.',
    'Matthew 5:14–16',
    'We are told to become the sun.',
    'Light is only for insiders behind a door.',
    'The picture is a command to boast.',
    'A hidden lamp is the point of the saying.',
  ),
  'daily-gems': brief(
    'daily-gems',
    'Jesus taught with pictures you can hold.',
    'A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.',
    'Matthew 5; Mark 4; Matthew 26:28; Luke 22:20',
    'Pictures are only decoration.',
    'Mercy is a wage you finish earning.',
    'Every heart is the same soil.',
    'A hidden lamp is the point.',
  ),
  'daily-seed': brief(
    'daily-seed',
    'The same word meets different soils; some seed is lost.',
    'The parable invites hearing; it does not flatter every field.',
    'Mark 4:1–9',
    'Every field is guaranteed a harvest.',
    'Lost seed means the sower failed.',
    'Good soil is a slogan, not a way of hearing.',
    'Jesus never names withering or birds.',
  ),
  'daily-names': brief(
    'daily-names',
    'Named people saw the risen Christ — not one private voice.',
    'Paul lists Cephas, the Twelve, and more than five hundred — many still living then.',
    '1 Corinthians 15:5–6',
    'Paul refuses to name anyone.',
    'Only one anonymous dreamer is cited.',
    'A crowd appearance would have been hidden.',
    'Cephas is left off the list.',
  ),
  'daily-creed': brief(
    'daily-creed',
    'The churches named Christ died, buried, and raised before Paul wrote.',
    'Paul received this line — he did not invent it.',
    '1 Corinthians 15:3–4',
    'Paul invents the creed as he writes.',
    'Burial is skipped because it does not matter.',
    'The letter is older than any tradition it quotes.',
    'Nothing was handed on; it was only felt.',
  ),
  'daily-stars': brief(
    'daily-stars',
    'The heavens already speak of a Maker; fine-tuning fits that voice.',
    'The sky speaks of a Maker — the numbers fit that.',
    'Psalm 19:1–4; Romans 1:20',
    'The heavens are silent about a Maker.',
    'Fine-tuning contradicts the psalm.',
    'Scripture treats the sky as decoration only.',
    'Design inference and “the heavens declare” cannot share a grain.',
  ),
  'daily-life': brief(
    'daily-life',
    'Life, place, and mind are not cheap facts.',
    'Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.',
    'Acts 17:24–25',
    'Chemistry is easy to dismiss.',
    '“It happened” is automatically the last word.',
    'A habitable band is an unremarkable accident with no question.',
    'Minds that do science need no home in the story.',
  ),
  'daily-scroll': brief(
    'daily-scroll',
    'We hold a river of copies, not the first ink.',
    'Scribes copy, later hands compare, then a modern page prints a recovered text.',
    'Isaiah 40:8',
    'We hold the first ink in a glass case.',
    'Comparison of copies is cheating.',
    'A line falls from the sky onto a printer.',
    'Transmission has no human hands.',
  ),
  'daily-isaiah': brief(
    'daily-isaiah',
    'Isaiah’s Servant is Jesus — wounded for others, silent like a lamb.',
    'The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.',
    'Isaiah 53:4–12',
    'The servant conquers Rome by sword.',
    'The poem is about estate planning.',
    'The servant never suffers for anyone.',
    'Wounds are unrelated to healing in the poem.',
  ),
  'daily-grace': brief(
    'daily-grace',
    'Grace is gift, not wage; faith receives; boast starves.',
    'The claim is that God moves first — not that you finished the map.',
    'Ephesians 2:8–9',
    'Grace is a prize for high scores.',
    'Faith is a wage God owes you.',
    'Boast is what the gift is for.',
    'Salvation is your own doing.',
  ),
  'daily-rest': brief(
    'daily-rest',
    'Tired people are named first; rest is the gift, not a steeper hill.',
    'The invitation is to a person — “Come to me” — not a performance.',
    'Matthew 11:28',
    'Rest is a prize for climbing harder.',
    'Jesus names the energetic first.',
    'The invitation is to a steeper program.',
    'Weariness disqualifies you.',
  ),
  'daily-neighbor': brief(
    'daily-neighbor',
    'Mercy makes a neighbor; pedigree does not.',
    'Jesus asks who *proved* to be a neighbor — the one who showed mercy.',
    'Luke 10:36–37',
    'The priest who passed by is the measure.',
    'Neighbor is settled before anyone crosses the road.',
    'Mercy is unrelated to the question.',
    'The wounded man must first classify the helper.',
  ),
  'daily-empty': brief(
    'daily-empty',
    'Jesus’ tomb was empty — women saw it first, with fear and wonder.',
    'They found the stone rolled away — they did not find the body.',
    'Luke 24:2–3',
    'Rome instantly converts the senate.',
    'Women are absent from the first reports.',
    'The tomb is found occupied and explained.',
    'Fear is edited out of the opening.',
  ),
  'daily-cosmos': brief(
    'daily-cosmos',
    'The world is here, and it did not have to be — the psalms name a Giver.',
    'The psalms ask the question out loud and expect a Giver, not a shrug.',
    'Psalm 8:3–4',
    'Questions about a source are impolite.',
    'Existence plus contingency yields no question.',
    'The universe had to exist just as it is.',
    'The psalms refuse to look at the heavens.',
  ),
  'daily-door': brief(
    'daily-door',
    'Jesus’ “door” is a particular way in with a wide anyone.',
    'You may refuse it; the town will not lock you in a pew.',
    'John 10:9',
    'The door is a dead end.',
    'Pasture is denied on the other side.',
    '“Anyone” is narrowed to insiders only.',
    'The image is a wall, not an entrance.',
  ),
  'j-trail-1': brief(
    'j-trail-1',
    'A morning walked is kept — not as a trophy, as a thank-you.',
    'If you are away, the trail waits; nothing already gathered is taken back.',
    'Daily Trail',
    'Missing a day erases the journal.',
    'The town keeps marks to shame you.',
    'Return is forbidden after a gap.',
    'A first morning does not count.',
  ),
  'j-trail-2': brief(
    'j-trail-2',
    'Two mornings are enough for the path to know your step.',
    'Nothing is owed; the bench is still free.',
    'Daily Trail',
    'Two mornings create a debt you must pay.',
    'The bench is reserved for perfect streaks.',
    'Return is a fine, not a kindness.',
    'The path refuses a second step.',
  ),
  'j-trail-3': brief(
    'j-trail-3',
    'Return is a kind of courage.',
    'Three distinct days are marked without scolding the ones you missed.',
    'Daily Trail',
    'Return is only for people who never left.',
    'The clerk erases pages after a gap.',
    'Courage means never resting.',
    'Three days unlock a punishment.',
  ),
  'j-trail-5': brief(
    'j-trail-5',
    'Five skies are saved; empty days are not scolded.',
    'The town only keeps a page for when you are here.',
    'Daily Trail',
    'Empty days delete five marks.',
    'The town scolds every quiet morning.',
    'Pages are only for perfect calendars.',
    'Weather reports are used to shame you.',
  ),
  'j-trail-7': brief(
    'j-trail-7',
    'Seven unique mornings still leave tomorrow free.',
    'If you miss, the trail waits; marks you made stay in the journal.',
    'Daily Trail',
    'A week means you may never rest.',
    'Missing tomorrow burns the journal.',
    'Seven days become a debt collector.',
    'The trail closes after a week.',
  ),
  'td-watch': brief(
    'td-watch',
    'Love — tap the matching face. A true line turns a cheap claim toward heaven.',
    'Love, logic, reason, and science you have kept can divert a false step up the ridge.',
    'Luke 10:25–37 · the night road',
    'A town holds because the streets are pretty.',
    'Defense is shouting until no one asks.',
    'The Samaritan story is only about travel safety.',
    'A lamp replaces the need for a claim.',
  ),
}

for (const lesson of PACK_CATALOG.lessons) {
  EVIDENCE[lesson.id] = briefFromPack(lesson, 'medium')
}
for (const street of PAID_STREETS) {
  EVIDENCE[street.id] = street.brief
}

export function evidenceFor(id: string): EvidenceBrief | undefined {
  return EVIDENCE[id]
}

export function evidenceForTier(
  id: string,
  tier: LessonTierId = 'medium',
): EvidenceBrief | undefined {
  return packBrief(id, tier) ?? EVIDENCE[id]
}

export interface TakeawayLine {
  claim: string
  reason: string
}

/** Encode: if several Keeps have a why, the player owns the pick. Else the brief’s one line. */
export function takeawayLines(
  brief: EvidenceBrief,
  keeps?: { text: string; why?: string }[],
): TakeawayLine[] {
  const owned = (keeps ?? [])
    .filter((item): item is { text: string; why: string } => Boolean(item.why))
    .map((item) => ({ claim: item.text, reason: item.why }))
  if (owned.length > 1) return owned
  return [{ claim: brief.claim, reason: brief.reason }]
}

export function evidenceForJournal(unlockAfter: string, journalId: string) {
  return EVIDENCE[unlockAfter] ?? EVIDENCE[journalId]
}

export function allEvidenceIds(): string[] {
  return Object.keys(EVIDENCE)
}

/** Older unlocked pages, seeded by date — a spaced re-ask, not a new lecture. */
export function pickSpacedEvidence(
  dateKey: string,
  knownIds: string[],
  excludeId?: string,
): EvidenceBrief | undefined {
  const pool = [...new Set(knownIds)]
    .filter((id) => id !== excludeId)
    .map((id) => EVIDENCE[id])
    .filter((item): item is EvidenceBrief => Boolean(item))
  if (pool.length === 0) return undefined
  const index = hashString(`silver-city-recall:${dateKey}`) % pool.length
  return pool[index]
}

export function knownEvidenceIds(input: {
  completed: string[]
  journal: string[]
  held: string[]
}): string[] {
  const fromJournal = input.journal
    .map((id) => journalEntries.find((entry) => entry.id === id)?.unlockAfter)
    .filter((id): id is string => Boolean(id))
  return [...new Set([...input.completed, ...input.held, ...fromJournal, ...input.journal])]
}
