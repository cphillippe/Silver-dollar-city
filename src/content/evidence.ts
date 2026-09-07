import { journalEntries } from './journal'
import { hashString } from '../lib/dates'

export interface EvidenceBrief {
  id: string
  claim: string
  reason: string
  source: string
  claimChoices: [string, string, string]
  reasonChoices: [string, string, string]
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
    'Neighbor is the one who shows costly mercy.',
    'Jesus makes the listener identify with the wounded man, then with the Samaritan who stops.',
    'Luke 10:25–37',
    'Neighbor means the person who already looks like you.',
    'The priest is the hero because he kept the law.',
    'The story is mainly a map of the Jericho road.',
    'Mercy is optional once you have classified the victim.',
  ),
  'ph-father': brief(
    'ph-father',
    'The father runs with mercy before the speech is finished.',
    'Honor is spent so the son can be embraced; the older brother shows nearness without joy.',
    'Luke 15:11–32',
    'The son earned the feast by writing a good apology.',
    'The story is mainly about dividing an estate.',
    'The father waits until justice is complete.',
    'The older brother is the hero for staying home.',
  ),
  'ph-seeds': brief(
    'ph-seeds',
    'The parables sketch a God who speaks, seeks, grows, and entrusts.',
    'Soil, search, a tiny seed, and a trust form a portrait — not a slogan.',
    'Matthew 13; Luke 15; Matthew 25',
    'Every parable is an allegory of every detail.',
    'The kingdom is only for people who already understand.',
    'The sower proves every heart is the same.',
    'The talents story is about hiding gifts until heaven.',
  ),
  'ph-debt': brief(
    'ph-debt',
    'Received mercy makes refusing mercy a contradiction.',
    'The servant forgiven an unpayable debt then throttles a peer over a small sum.',
    'Matthew 18:21–35',
    'Forgiveness is a limited coupon on God’s spreadsheet.',
    'Jesus is only reforming first-century banking.',
    'Peter’s “seven times” was already the full measure.',
    'The first servant was right to demand prison.',
  ),
  'wb-creed': brief(
    'wb-creed',
    'Paul hands on an early public creed: died, buried, raised, appeared.',
    'Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.',
    '1 Corinthians 15:3–8',
    'The creed is Paul’s private dream from decades later.',
    'Paul invented the formula on the spot in Corinth.',
    '“Buried” is only poetic decoration.',
    'Appearances are admitted to be visions with no named people.',
  ),
  'wb-early': brief(
    'wb-early',
    'The resurrection claim sits close to the events, not as a late legend.',
    'Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.',
    '1 Corinthians 15:3–7; Luke 1:1–4',
    'Early is the same as laboratory proof.',
    'No first-century writer claims to have asked witnesses.',
    'Named people make a report less testable.',
    'Distance in time is the only historical question that matters.',
  ),
  'wb-method': brief(
    'wb-method',
    'Ordinary historical tools weigh testimony; they do not replace reading.',
    'Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”',
    'Standard historical method',
    'An early creed is already a laboratory proof.',
    'Every Christian report is automatically a late novel.',
    'Method is a way to skip the texts themselves.',
    'Embarrassment means a story must be false.',
  ),
  'wb-women': brief(
    'wb-women',
    'The first tomb reports begin with women — an awkward opening if invented for respectability.',
    'Luke records that the apostles dismissed them; Tacitus still notes Christus executed under Pilate.',
    'Luke 24:1–11; Tacitus, Annals 15.44',
    'The Gospels open with the Roman senate converting overnight.',
    'Women were the most legally impressive public witnesses.',
    'Luke sands away any dismissal of the first report.',
    'Outside writers never mention Christus or Pilate.',
  ),
  'ob-tuning': brief(
    'ob-tuning',
    'Several physical parameters appear delicately balanced for life.',
    'Necessity, chance (often a multiverse), or design are the live explanations — name them honestly.',
    'Fine-tuning discussions (Rees; Collins)',
    'Fine-tuning is a rumor with no name in science.',
    'Theism must pretend rival explanations do not exist.',
    'Naming the options ends the argument.',
    'A habitable cosmos needs no explanation at all.',
  ),
  'ob-design': brief(
    'ob-design',
    'Design is a live inference if life-permitting numbers are surprising on indifference.',
    'It is a likelihood argument, not a tantrum against physics — and it does not yet name which Scriptures are true.',
    'Philosophical fine-tuning literature',
    'Design is the only option once physics exists.',
    'Fine-tuning already proves a particular gospel.',
    'A mind wanting a habitable world would not expect life-permitting numbers.',
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
    'Life’s origin is an unfinished scientific story and a live philosophical clue.',
    'Cells require specified information; that is biology, not a command to stop the lab.',
    'Abiogenesis as an open program; Genesis 1 as theology',
    'A flask has already demonstrated a miracle.',
    'Cells require no coordinated information.',
    'The unfinished story means we should end research.',
    'Genesis 1 is a lab protocol.',
  ),
  'fg-mover': brief(
    'fg-mover',
    'Change here and now needs a first actuality that is not itself a receiver of change.',
    'Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.',
    'Aquinas, ST I, q.2, a.3 (First Way)',
    'This is only a story about dominoes at the Big Bang.',
    'Each changing thing explains itself.',
    '“First” here means the earliest date on a calendar.',
    'Infinite backlog automatically explains present change.',
  ),
  'fg-contingent': brief(
    'fg-contingent',
    'A world of might-not-have-beens still needs a necessary ground.',
    'Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.',
    'Aquinas’s Third Way; Leibniz on sufficient reason',
    'Contingent things contain the reason why there is anything.',
    'Rivals are unintelligible and need not be named.',
    'Necessary being is only a weather report.',
    'Brute fact is not a metaphysical move.',
  ),
  'fg-kalam': brief(
    'fg-kalam',
    'If what begins has a cause and the universe began, it has a cause.',
    'Clean is not uncontested; personhood and the God of Abraham are further questions.',
    'Kalām tradition; contemporary analytic statements',
    'A cause of the beginning is already the whole creed.',
    'The form never mentions a beginning.',
    'The second premise cannot be argued at all.',
    'A first cause automatically names Jesus.',
  ),
  'fg-limits': brief(
    'fg-limits',
    'A cosmological argument is already a great deal — and not yet the sermon on the mount.',
    'Aquinas argues onward from the Ways; the New Testament adds a particular history.',
    'Aquinas ST I; Pascal on philosophers and Abraham',
    'The Five Ways are already the whole gospel.',
    'Pascal commands you to skip the philosophers.',
    'Stopping at a first cause is required.',
    'History has nothing further to add.',
  ),
  'hl-moral': brief(
    'hl-moral',
    'Duty presents itself as more than taste — and theism is a natural home for that.',
    'Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.',
    'Romans 2:14–15',
    'Duty is only a preference we pretend is law.',
    'Atheist moral realism is impossible to name.',
    'Moral argument is a sneer at people who doubt.',
    'Strangers cannot expect injustice to mean anything.',
  ),
  'hl-mind': brief(
    'hl-mind',
    'A story of the world must find a home for mind — including the storyteller.',
    'Theism is a reply in which mind is present at the beginning, not only an accident at the end.',
    'The hard problem; classical theism on intellect',
    'Qualia and aboutness are parlor tricks.',
    'Theism is the only reply anyone has offered.',
    'A story without mind can still house the storyteller with no remainder.',
    'Mind is easy to treat as leftover steam.',
  ),
  'hl-meaning': brief(
    'hl-meaning',
    'Local meaning can be built — the lookout asks whether it is also received.',
    'Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.',
    'Ecclesiastes 2; 9; 12',
    'Work and pleasure are the final good.',
    'Ecclesiastes calls every gift worthless.',
    'The hunger for a final good has no question attached.',
    'You cannot build any local meaning without naming God.',
  ),
  'hl-beauty': brief(
    'hl-beauty',
    'Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.',
    'Lewis’s argument from desire does not deduct God from a sunset; Psalm 19 treats the sky as speech.',
    'Lewis, Weight of Glory; Psalm 19:1–4',
    'A sunset deducts God as a theorem.',
    'Hungers never correspond to real countries.',
    'Psalm 19 treats the sky as silent decoration.',
    'The lookout and the observatory cannot share a ridge.',
  ),
  'daily-lantern': brief(
    'daily-lantern',
    'A received light is meant to be seen, not hidden.',
    'Jesus uses an ordinary lamp and a city on a hill — public without being proud.',
    'Matthew 5:14–16',
    'We are told to become the sun.',
    'Light is only for insiders behind a door.',
    'The picture is a command to boast.',
    'A hidden lamp is the point of the saying.',
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
    'The resurrection claim stacks named witnesses, not one private voice.',
    'Paul lists Cephas, the Twelve, and more than five hundred — many still living then.',
    '1 Corinthians 15:5–6',
    'Paul refuses to name anyone.',
    'Only one anonymous dreamer is cited.',
    'A crowd appearance would have been hidden.',
    'Cephas is left off the list.',
  ),
  'daily-creed': brief(
    'daily-creed',
    'The creed sits between the event and Paul’s letter.',
    'If the formula is early, the claim is close to what it names: died, buried, raised.',
    '1 Corinthians 15:3–4',
    'Paul invents the creed as he writes.',
    'Burial is skipped because it does not matter.',
    'The letter is older than any tradition it quotes.',
    'Nothing was handed on; it was only felt.',
  ),
  'daily-stars': brief(
    'daily-stars',
    'Wonder and measurement can share a roof.',
    'Psalm 19 treats the sky as speech — not a lab report, and not a shrug.',
    'Psalm 19:1',
    'Psalm 19 is a shipping forecast.',
    'The psalm is about temple furniture.',
    'The line is a private diary, not a psalm.',
    'Source is a weather table with no speech.',
  ),
  'daily-life': brief(
    'daily-life',
    'Life, place, and mind are not cheap facts.',
    'Copying cells, a habitable band, and science itself each invite a next sentence — not a proof-stamp.',
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
    'Isaiah 53’s servant suffers for others, silent like a lamb.',
    'Christians read the poem as a portrait of Jesus — you may disagree, but you can see why they did.',
    'Isaiah 53:5',
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
    'The first Easter reports include an empty place, women, fear, and wonder.',
    'The town does not sand that awkwardness into a tidy triumph.',
    'Luke 24:2–3',
    'Rome instantly converts the senate.',
    'Women are absent from the first reports.',
    'The tomb is found occupied and explained.',
    'Fear is edited out of the opening.',
  ),
  'daily-cosmos': brief(
    'daily-cosmos',
    'The universe exists and did not have to — so its source is worth asking.',
    'That is a modest question, not a scolding of physicists.',
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
}

export function evidenceFor(id: string): EvidenceBrief | undefined {
  return EVIDENCE[id]
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
