import { packLesson } from '../content/packCatalog.ts'
import { evidenceFor } from '../content/evidence.ts'
import { easyChromeLine, easyWhoWhere } from './easy.ts'
import {
  BONUS_WORD_MAX,
  COMMON_BONUS_WORDS,
  isKidFriendlyBonusWord,
  isPlantableBonusWord,
  isPreferredPlantWord,
} from './commonBonusWords.ts'

export type GemKind = 'person' | 'place' | 'idea'

export interface GemWord {
  id: string
  text: string
  label: string
  kind: GemKind
  /** Mind-map slot for authored MATCH_CHIPS (who/where/idea/keep). */
  role?: 'who' | 'where' | 'idea' | 'keep'
}

export interface GemCoord {
  r: number
  c: number
}

export interface GemPuzzle {
  id: string
  size: number
  words: GemWord[]
  letters: string[][]
  paths: Record<string, GemCoord[]>
  /** Curated lesson words that are not required chips. */
  bonusPool: string[]
  /** Planted or discovered bonus words on this board. */
  bonus: GemWord[]
  /** Bonus words placed on purpose so extras are actually findable. */
  planted: GemWord[]
  bonusPaths: Record<string, GemCoord[]>
}

const STOP = new Set([
  'THE',
  'AND',
  'FOR',
  'THAT',
  'THIS',
  'WITH',
  'FROM',
  'WHO',
  'ONE',
  'WAS',
  'ARE',
  'NOT',
  'BUT',
  'HIS',
  'HER',
  'HIM',
  'YOU',
  'YOUR',
  'OUR',
  'ITS',
  'HAD',
  'HAS',
  'HAVE',
  'BEEN',
  'THEY',
  'THEM',
  'THEN',
  'THAN',
  'ALSO',
  'INTO',
  'ONLY',
  'JUST',
  'LIKE',
  'OVER',
  'AFTER',
  'BEFORE',
  'ABOUT',
  'WHEN',
  'WHAT',
  'WHICH',
  'WHILE',
  'WHERE',
  'THERE',
  'THEIR',
  'STILL',
  'DOES',
  'DID',
  'CAN',
  'MAY',
  'WILL',
  'WOULD',
  'COULD',
  'SHOULD',
  'BEING',
  'BECAUSE',
  'THEN',
  'THAN',
  'OFF',
  'OUT',
  'OWN',
  'HOW',
  'WHY',
  'ALL',
  'ANY',
  'EACH',
  'MORE',
  'MOST',
  'SOME',
  'SUCH',
  'VERY',
  'MUCH',
  'MANY',
  'TELLS',
  'TELL',
  'SAYS',
  'SAID',
  'ASKS',
  'ASK',
  'LIVES',
  'LIVE',
  'LINE',
  'MAIN',
  'IDEA',
  'TRUE',
  'SHORT',
])

const FILL = 'AEIOURSTLNCMDHPYGBKWFVJX'.split('')

const EASY_DIRS: GemCoord[] = [
  { r: 0, c: 1 },
  { r: 1, c: 0 },
  { r: 1, c: 1 },
]

const GRID = 8
const MIN_LEN = 3
const MAX_LEN = 8
const MAX_WORDS = 4
const BONUS_MAX_LEN = BONUS_WORD_MAX
export const MIN_BONUS_PLANT = 4
export const MAX_BONUS_PLANT = 6
const SHARED_BONUS = ['HELP', 'CARE', 'KIND', 'GIFT', 'ROAD', 'BED', 'GAP']

/**
 * Short English extras (3–6). Straight-line Set lookup.
 * Lesson chips stay required; planted extras shuffle from the dict and only score BONUS! +100.
 */
const COMMON_BONUS = COMMON_BONUS_WORDS

/** Authored extras plus common board words. Lesson text fills the rest. */
const LESSON_BONUS: Record<string, string[]> = {
  'ph-road': ['ROAD', 'HELP', 'HURT', 'CARE', 'OIL', 'INN', 'KIND', 'GAP'],
  'ph-father': ['GAP', 'SON', 'HUG', 'RUN', 'HOME', 'ARMS', 'RING'],
  'ph-debt': ['DEBT', 'KING', 'JAIL', 'SUM', 'PEER'],
  'wb-creed': ['CREED', 'DIED', 'ROSE', 'PAUL', 'NAMES'],
  'wb-women': ['TOMB', 'WOMEN', 'DAWN', 'TOLD'],
  'daily-lantern': ['LAMP', 'HILL', 'CITY', 'LIGHT'],
  'daily-stars': ['SKY', 'STARS', 'MAKER', 'SPEAK'],
  'daily-cosmos': ['WORLD', 'LIFE', 'FIT', 'GIVEN'],
  'hl-moral': ['DUTY', 'HEART', 'RIGHT', 'KNOW'],
  'fg-order': ['HOLD', 'WORLD', 'HINGE', 'TRUST'],
  'fg-reason': ['MIND', 'KNOW', 'WORD', 'TRUST'],
  'fg-ought': ['HEART', 'NATURE', 'TRUST', 'RIGHT'],
  'fg-ground': ['LIVE', 'MOVE', 'ACTS', 'FOUND'],
}

export function lettersOnly(text: string): string {
  return text.toUpperCase().replace(/[^A-Z]/g, '')
}

export function titleWord(text: string): string {
  const raw = text.trim()
  if (!raw) return raw
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}

function tokens(text: string): string[] {
  return text
    .split(/[^A-Za-z]+/)
    .map((part) => part.toUpperCase())
    .filter((part) => part.length >= MIN_LEN && part.length <= MAX_LEN && !STOP.has(part))
}

function hashSeed(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  }
  return h >>> 0
}

function rng(seed: number) {
  let s = seed || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

function shuffleSeed<T>(items: T[], rand: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    const current = copy[i]
    const swap = copy[j]
    if (current === undefined || swap === undefined) continue
    copy[i] = swap
    copy[j] = current
  }
  return copy
}

function addWord(list: GemWord[], text: string, kind: GemKind) {
  const letters = lettersOnly(text)
  if (letters.length < MIN_LEN || letters.length > MAX_LEN) return
  if (list.some((word) => word.text === letters)) return
  list.push({
    id: `${kind}-${letters.toLowerCase()}`,
    text: letters,
    label: titleWord(letters),
    kind,
  })
}


/** Authored Easy Match — one connected teaching unit per shelf id, not claim-token scrape. */
export interface MatchChipSet {
  words: [string, string, string, string]
  kinds: [GemKind, GemKind, GemKind, GemKind]
  roles: ['who', 'where', 'idea', 'keep']
  say: string
}

export const MATCH_CHIPS: Record<string, MatchChipSet> = {
  'ph-road': {
    words: ['MERCY', 'CREEK', 'NEIGHBOR', 'CARE'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Mercy at the Creek teaches that a real neighbor will care.',
  },
  'ph-father': {
    words: ['MERCY', 'CREEK', 'FATHER', 'GRACE'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Mercy at the Creek tells how the father runs with grace before the speech is done.',
  },
  'ph-debt': {
    words: ['MERCY', 'CREEK', 'DEBT', 'FORGIVE'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Mercy at the Creek warns that forgiven debt means we must forgive too.',
  },
  'fg-order': {
    words: ['ANSEL', 'ARCH', 'ORDER', 'CHRIST'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Ansel at the Arch saw that all order holds together in Christ.',
  },
  'fg-reason': {
    words: ['ANSEL', 'ARCH', 'REASON', 'LIGHT'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Ansel at the Arch saw that our reason comes from God\'s light.',
  },
  'fg-ought': {
    words: ['ANSEL', 'ARCH', 'OUGHT', 'LAW'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Ansel at the Arch saw that what we ought to do is God\'s law inside us.',
  },
  'fg-ground': {
    words: ['COSMO', 'ROCK', 'GROUND', 'GOD'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Cosmo at the Rock saw that the living God is the true ground of all things.',
  },
  'wb-creed': {
    words: ['SILAS', 'SQUARE', 'CREED', 'CHRIST'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Square shares an early creed: Christ died, was buried, and rose.',
  },
  'wb-women': {
    words: ['SILAS', 'SQUARE', 'WOMEN', 'RISEN'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Square remembers how the women were first to tell that Jesus is risen.',
  },
  'wb-early': {
    words: ['SILAS', 'SQUARE', 'EARLY', 'CHRIST'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Square reads early testimony showing that Christ truly rose.',
  },
  'wb-method': {
    words: ['SILAS', 'SQUARE', 'REPORTS', 'TRUTH'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Square weighs historical reports to know the truth about Jesus.',
  },
  'daily-names': {
    words: ['SILAS', 'SQUARE', 'WITNESS', 'CHRIST'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Square hears many a witness who saw the risen Christ.',
  },
  'daily-creed': {
    words: ['SILAS', 'SQUARE', 'CREED', 'GOSPEL'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Square speaks the early creed that declares the good news of the gospel.',
  },
  'daily-empty': {
    words: ['SILAS', 'SQUARE', 'EMPTY', 'WONDER'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Square stands at the empty tomb with holy wonder.',
  },
  'daily-lantern': {
    words: ['JUNIPER', 'PORCH', 'LAMP', 'SEEN'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Juniper at the Porch shows a lamp that is meant to be seen.',
  },
  'daily-stars': {
    words: ['NORA', 'SKY', 'MAKER', 'SPEAK'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Nora at the Sky hears the heavens speak of a Maker.',
  },
  'daily-cosmos': {
    words: ['ANSEL', 'ARCH', 'WORLD', 'GIVER'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Ansel at the Arch sees a world that did not have to be — a Giver gave it.',
  },
  'hl-moral': {
    words: ['HOPE', 'RIDGE', 'DUTY', 'GOD'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Hope at the Ridge knows duty is more than taste — it fits a good God.',
  },
  'ph-seeds': {
    words: ['MERCY', 'CREEK', 'PARABLE', 'KINGDOM'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Mercy at the Creek listens to each parable about the kingdom of God.',
  },
  'daily-gems': {
    words: ['JUNIPER', 'PORCH', 'PICTURE', 'JESUS'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Juniper at the Porch remembers every picture taught by Jesus.',
  },
  'daily-seed': {
    words: ['JUNIPER', 'PORCH', 'SEED', 'WORD'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Juniper at the Porch hears how the seed stands for God\'s word.',
  },
  'daily-neighbor': {
    words: ['JUNIPER', 'PORCH', 'NEIGHBOR', 'MERCY'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Juniper at the Porch shows that a true neighbor acts with mercy.',
  },
  'ob-tuning': {
    words: ['NORA', 'SKY', 'TUNING', 'DESIGNER'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Nora at the Sky sees fine tuning that points to a Designer.',
  },
  'ob-design': {
    words: ['NORA', 'SKY', 'MIND', 'MAKER'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Nora at the Sky watch sees that a caring Mind and Maker designed our world.',
  },
  'ob-leibniz': {
    words: ['NORA', 'SKY', 'NOTHING', 'CREATOR'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Nora at the Sky watch wonders why there is something instead of nothing, pointing to the Creator.',
  },
  'ob-life': {
    words: ['NORA', 'SKY', 'INFO', 'MAKER'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Nora at the Sky watch learns that living info comes from a Maker.',
  },
  'daily-life': {
    words: ['NORA', 'SKY', 'GIFT', 'MAKER'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Nora at the Sky watch thanks the Maker for life as a good gift.',
  },
  'fg-mover': {
    words: ['ANSEL', 'ARCH', 'MOTION', 'FIRST'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Ansel at the Arch saw that all motion starts with the First Mover.',
  },
  'fg-contingent': {
    words: ['COSMO', 'ROCK', 'DEPENDS', 'MAKER'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Cosmo at the Rock saw that what might not have been depends on a Maker.',
  },
  'fg-kalam': {
    words: ['ANSEL', 'ARCH', 'BEGAN', 'CAUSE'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Ansel at the Arch saw that whatever began to exist must have a First Cause.',
  },
  'fg-limits': {
    words: ['ANSEL', 'ARCH', 'LIMITS', 'RULES'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Ansel at the Arch saw that rules and limits in nature point beyond themselves.',
  },
  'daily-scroll': {
    words: ['ANSEL', 'ARCH', 'COPIES', 'WORD'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Ansel at the Arch studies early copies to trust God\'s standing Word.',
  },
  'daily-isaiah': {
    words: ['ANSEL', 'ARCH', 'SERVANT', 'JESUS'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Ansel at the Arch learns that the silent Servant who suffers for others is Jesus.',
  },
  'hl-mind': {
    words: ['HOPE', 'RIDGE', 'MIND', 'GOD'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Hope at the Ridge sees that your mind finds its true home in God.',
  },
  'hl-meaning': {
    words: ['HOPE', 'RIDGE', 'MEANING', 'GIFT'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Hope at the Ridge remembers that true meaning is received as a gift.',
  },
  'hl-beauty': {
    words: ['HOPE', 'RIDGE', 'BEAUTY', 'HUNGER'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Hope at the Ridge knows that beauty wakes a hunger for a real home.',
  },
  'daily-grace': {
    words: ['HOPE', 'RIDGE', 'GRACE', 'FAITH'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Hope at the Ridge trusts that grace is a gift received by faith.',
  },
  'daily-rest': {
    words: ['HOPE', 'RIDGE', 'REST', 'JESUS'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Hope at the Ridge hears Jesus offer true rest to tired hearts.',
  },
  'daily-door': {
    words: ['HOPE', 'RIDGE', 'DOOR', 'JESUS'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Hope at the Ridge finds that Jesus is the door open to anyone who comes.',
  },
  'sc-tacitus': {
    words: ['SILAS', 'COURT', 'TACITUS', 'CHRISTUS'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Court reads how Tacitus recorded the death of Christus.',
  },
  'sc-james': {
    words: ['SILAS', 'COURT', 'JOSEPHUS', 'CHRIST'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Court finds where Josephus named James the brother of Christ.',
  },
  'sc-pliny': {
    words: ['SILAS', 'COURT', 'PLINY', 'CHRIST'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Court reads Pliny showing early Christians sang praise to Christ.',
  },
  'ic-trajan': {
    words: ['SILAS', 'INK', 'TRAJAN', 'CHRIST'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Ink court reads Trajan writing about followers of Christ.',
  },
  'ic-suetonius': {
    words: ['SILAS', 'INK', 'NERO', 'CHRIST'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Ink court reads how Nero punished early believers in Christ.',
  },
  'ic-lucian': {
    words: ['SILAS', 'INK', 'LUCIAN', 'WORSHIP'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Ink Court reads how Lucian noted that Christians worship Jesus.',
  },
  'papr-p52': {
    words: ['SILAS', 'VAULT', 'PAPYRUS', 'GOSPEL'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Vault sees a papyrus fragment showing the early Gospel.',
  },
  'papr-p46': {
    words: ['SILAS', 'VAULT', 'LETTERS', 'CHRIST'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Vault studies old letters honoring Christ.',
  },
  'papr-p66': {
    words: ['SILAS', 'VAULT', 'PRESERVE', 'GOSPEL'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Vault sees how scribes helped preserve the Gospel.',
  },
  'aa-tacitus': {
    words: ['SILAS', 'ALLEY', 'TACITUS', 'PILATE'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Alley reads that Tacitus recorded Pilate executing Jesus.',
  },
  'aa-josephus': {
    words: ['SILAS', 'ALLEY', 'JOSEPHUS', 'JAMES'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Alley learns how Josephus wrote about James.',
  },
  'aa-suetonius': {
    words: ['SILAS', 'ALLEY', 'ROME', 'FAITH'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Alley learns how believers in Rome kept their faith.',
  },
  'psw-pilate': {
    words: ['SILAS', 'STONE', 'PILATE', 'TRUTH'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Stone sees Pilate named on rock, confirming Gospel truth.',
  },
  'psw-ossuary': {
    words: ['SILAS', 'STONE', 'OSSUARY', 'FAMILY'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Stone finds an ossuary naming the family of Jesus.',
  },
  'psw-nazareth': {
    words: ['SILAS', 'STONE', 'NAZARETH', 'HOUSES'],
    kinds: ['person', 'place', 'idea', 'idea'],
    roles: ['who', 'where', 'idea', 'keep'],
    say: 'Silas at the Stone learns about ancient houses in Nazareth where Jesus lived.',
  },
}

export function matchChipsFor(lineId: string): MatchChipSet | undefined {
  return MATCH_CHIPS[lineId]
}

export function matchChipRoleLabel(role: GemWord['role']): string {
  if (role === 'who') return 'who'
  if (role === 'where') return 'where'
  if (role === 'keep') return 'keep'
  return 'idea'
}

/** Claim, person, place, and short idea words — authored MATCH_CHIPS win for Easy shelf. */
export function gemWordsFor(lineId: string): GemWord[] {
  const authored = MATCH_CHIPS[lineId]
  if (authored) {
    const picked: GemWord[] = []
    authored.words.forEach((text, index) => {
      const letters = lettersOnly(text)
      if (letters.length < MIN_LEN || letters.length > MAX_LEN) return
      if (picked.some((word) => word.text === letters)) return
      const kind = authored.kinds[index]
      const role = authored.roles[index]
      picked.push({
        id: `${role}-${letters.toLowerCase()}`,
        text: letters,
        label: titleWord(letters),
        kind,
        role,
      })
    })
    return picked.slice(0, MAX_WORDS)
  }

  const lesson = packLesson(lineId)
  const home = easyWhoWhere(lineId)
  const claim = lesson?.claim || evidenceFor(lineId)?.claim || ''
  const picked: GemWord[] = []

  addWord(picked, home.who, 'person')
  const placeBits = home.place.split(/\s+/).filter(Boolean)
  addWord(picked, placeBits[placeBits.length - 1] ?? home.place, 'place')

  const claimBits = tokens(claim)
  const longClaim = claimBits.filter((bit) => bit.length >= 7).sort((a, b) => b.length - a.length)
  const shortClaim = claimBits.filter((bit) => bit.length <= 6).sort((a, b) => b.length - a.length)
  if (longClaim[0]) addWord(picked, longClaim[0], 'idea')
  for (const bit of shortClaim) {
    if (picked.length >= MAX_WORDS) break
    addWord(picked, bit, 'idea')
  }

  const term = lesson?.easy.word?.term
  const easyFace = easyChromeLine(claim)
  const extra = [
    ...tokens(easyFace),
    ...tokens(lesson?.easy.learn ?? ''),
    ...tokens(lesson?.easy.gloss ?? ''),
    ...tokens(term ?? ''),
  ].filter((bit) => bit.length <= 6)
  for (const bit of extra) {
    if (picked.length >= MAX_WORDS) break
    addWord(picked, bit, 'idea')
  }

  if (picked.length < 3) {
    addWord(picked, 'KEEP', 'idea')
    addWord(picked, 'TRUE', 'idea')
  }
  return picked.slice(0, MAX_WORDS)
}

function inBonusBand(bit: string): boolean {
  return bit.length >= MIN_LEN && bit.length <= BONUS_MAX_LEN
}

/** STOP is for required-chip tokens only — too-common 3-letter dict words still score. */
function plantBitOk(bit: string): boolean {
  return inBonusBand(bit) && !STOP.has(bit)
}

function bonusBitOk(bit: string): boolean {
  return inBonusBand(bit)
}

function collidesRequired(text: string, chips: Set<string>): boolean {
  if (chips.has(text)) return true
  for (const chip of chips) {
    if (chip.includes(text) || text.includes(chip)) return true
  }
  return false
}

/** Fresh extras for this board — shuffled dict, kid-friendly, not required chips. */
export function plantCandidates(chips: Set<string>, rand: () => number): string[] {
  const prefer: string[] = []
  const rest: string[] = []
  for (const text of COMMON_BONUS_WORDS) {
    if (!isPlantableBonusWord(text) || !plantBitOk(text) || collidesRequired(text, chips)) continue
    if (isPreferredPlantWord(text)) prefer.push(text)
    else rest.push(text)
  }
  return [...shuffleSeed(prefer, rand), ...shuffleSeed(rest, rand)]
}

/** Small curated pool — lesson words only, never required chips. */
export function bonusWordsFor(lineId: string): string[] {
  const lesson = packLesson(lineId)
  const targets = new Set(gemWordsFor(lineId).map((word) => word.text))
  const authored = LESSON_BONUS[lineId] ?? []
  const fromText = [
    ...tokens(lesson?.easy.learn ?? ''),
    ...tokens(lesson?.easy.gloss ?? ''),
    ...tokens(lesson?.easy.word?.term ?? ''),
    ...tokens(lesson?.easy.hint ?? ''),
    ...tokens(lesson?.claim ?? ''),
    ...tokens(easyChromeLine(lesson?.claim ?? '')),
    ...tokens(easyChromeLine(lesson?.plain ?? '')),
  ]
  const seen = new Set<string>()
  const pool: string[] = []
  for (const bit of [...authored, ...fromText, ...SHARED_BONUS]) {
    if (!plantBitOk(bit) || targets.has(bit) || seen.has(bit)) continue
    seen.add(bit)
    pool.push(bit)
  }
  return pool
}

function makeBonusWord(text: string): GemWord {
  return {
    id: `bonus-${text.toLowerCase()}`,
    text,
    label: titleWord(text),
    kind: 'idea',
  }
}

function emptyGrid(size: number): (string | '')[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ''))
}

function canPlace(
  grid: (string | '')[][],
  word: string,
  start: GemCoord,
  dir: GemCoord,
): boolean {
  const size = grid.length
  for (let i = 0; i < word.length; i += 1) {
    const r = start.r + dir.r * i
    const c = start.c + dir.c * i
    if (r < 0 || c < 0 || r >= size || c >= size) return false
    const cell = grid[r]?.[c]
    const letter = word[i]
    if (cell && cell !== letter) return false
  }
  return true
}

function writeWord(
  grid: (string | '')[][],
  word: string,
  start: GemCoord,
  dir: GemCoord,
): GemCoord[] {
  const path: GemCoord[] = []
  for (let i = 0; i < word.length; i += 1) {
    const r = start.r + dir.r * i
    const c = start.c + dir.c * i
    const row = grid[r]
    if (!row) continue
    row[c] = word[i] ?? ''
    path.push({ r, c })
  }
  return path
}

function placeFallback(grid: (string | '')[][], word: string): GemCoord[] | null {
  const dir = { r: 0, c: 1 }
  for (let row = 0; row < grid.length; row += 1) {
    const start = { r: row, c: 0 }
    if (!canPlace(grid, word, start, dir)) continue
    return writeWord(grid, word, start, dir)
  }
  for (let r = 0; r < grid.length; r += 1) {
    for (let c = 0; c < grid.length; c += 1) {
      const start = { r, c }
      if (!canPlace(grid, word, start, dir)) continue
      return writeWord(grid, word, start, dir)
    }
  }
  return null
}

export function gemHue(letter: string, r: number, c: number): number {
  return (letter.charCodeAt(0) + r * 3 + c * 5) % 6
}

function tryPlaceWord(
  grid: (string | '')[][],
  word: string,
  starts: GemCoord[],
  rand: () => number,
): GemCoord[] | null {
  const dirs = shuffleSeed(EASY_DIRS, rand)
  const spots = shuffleSeed(starts, rand)
  for (const dir of dirs) {
    for (const start of spots) {
      if (!canPlace(grid, word, start, dir)) continue
      return writeWord(grid, word, start, dir)
    }
  }
  return null
}

function scanBonusOnBoard(
  letters: string[][],
  pool: string[],
  taken: Set<string>,
): { word: GemWord; path: GemCoord[] }[] {
  const allow = new Set(pool)
  const found: { word: GemWord; path: GemCoord[] }[] = []
  const seen = new Set(taken)
  const size = letters.length
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      for (const dir of EASY_DIRS) {
        for (let len = MIN_LEN; len <= BONUS_MAX_LEN; len += 1) {
          const path: GemCoord[] = []
          let ok = true
          for (let i = 0; i < len; i += 1) {
            const rr = r + dir.r * i
            const cc = c + dir.c * i
            if (rr < 0 || cc < 0 || rr >= size || cc >= size) {
              ok = false
              break
            }
            path.push({ r: rr, c: cc })
          }
          if (!ok) continue
          const spelled = pathLetters(path, letters)
          if (!allow.has(spelled) || seen.has(spelled)) continue
          seen.add(spelled)
          found.push({ word: makeBonusWord(spelled), path })
        }
      }
    }
  }
  return found
}

/** Letters already written (chips + planted) — payoff bag for dense fill. */
export function letterWeightsFromWords(words: string[]): string[] {
  const bag: string[] = []
  for (const word of words) {
    for (const ch of word.toUpperCase()) {
      if (ch >= 'A' && ch <= 'Z') bag.push(ch)
    }
  }
  return bag
}

/** High-frequency letters from plantable / bonus-pool words (3–6). */
export function letterWeightsFromBonusPool(pool: Iterable<string>): string[] {
  const counts = new Map<string, number>()
  for (const raw of pool) {
    const word = raw.toUpperCase()
    if (word.length < 3 || word.length > BONUS_WORD_MAX) continue
    for (const ch of word) {
      if (ch < 'A' || ch > 'Z') continue
      counts.set(ch, (counts.get(ch) ?? 0) + 1)
    }
  }
  const bag: string[] = []
  for (const [ch, n] of counts) {
    const weight = Math.max(1, Math.ceil(n / 3))
    for (let i = 0; i < weight; i += 1) bag.push(ch)
  }
  return bag.length ? bag : FILL.slice(0, 12)
}

function lettersOnGrid(grid: (string | '')[][]): string[] {
  const bag: string[] = []
  for (const row of grid) {
    for (const cell of row) {
      if (cell) bag.push(cell)
    }
  }
  return bag
}

function pickLetter(bag: string[], rand: () => number): string {
  if (!bag.length) return FILL[Math.floor(rand() * FILL.length)] ?? 'A'
  return bag[Math.floor(rand() * bag.length)] ?? 'A'
}

/**
 * Payoff-biased fill — less dead/filler cells.
 * ~70% planted+chip letter bag, ~20% high-freq bonus-pool letters, ~10% FILL texture.
 * Never pure uniform FILL.
 */
export function fillGridDense(
  grid: (string | '')[][],
  rand: () => number,
  weightLetters: string[] = [],
): string[][] {
  const chipBag = weightLetters.length ? [...weightLetters] : lettersOnGrid(grid)
  const plantedBag = chipBag.length ? chipBag : FILL.slice(0, 12)
  const bonusBag = letterWeightsFromBonusPool(COMMON_BONUS_WORDS)
  const rareBag = FILL

  return grid.map((row) =>
    row.map((cell) => {
      if (cell) return cell
      const roll = rand()
      if (roll < 0.7) return pickLetter(plantedBag, rand)
      if (roll < 0.9) return pickLetter(bonusBag, rand)
      return pickLetter(rareBag, rand)
    }),
  )
}

/** Thin wrapper — callers stay stable; optional weightLetters from buildGemPuzzle. */
export function fillGrid(
  grid: (string | '')[][],
  rand: () => number,
  weightLetters: string[] = [],
): string[][] {
  return fillGridDense(grid, rand, weightLetters)
}

export function buildGemPuzzle(lineId: string, salt = 0): GemPuzzle {
  const words = gemWordsFor(lineId)
  const bonusPool = bonusWordsFor(lineId)
  const size = GRID
  const rand = rng(salt === 0 ? hashSeed(lineId) : hashSeed(`${lineId}:${salt}`))
  const grid = emptyGrid(size)
  const paths: Record<string, GemCoord[]> = {}
  const bonusPaths: Record<string, GemCoord[]> = {}
  const bonus: GemWord[] = []
  const starts: GemCoord[] = []
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) starts.push({ r, c })
  }

  words
    .slice()
    .sort((a, b) => b.text.length - a.text.length)
    .forEach((word) => {
      paths[word.id] = tryPlaceWord(grid, word.text, starts, rand) ?? placeFallback(grid, word.text) ?? []
    })

  const plantedWords: GemWord[] = []
  const planted = new Set<string>()
  const targets = new Set(words.map((word) => word.text))
  for (const text of plantCandidates(targets, rand)) {
    if (plantedWords.length >= MAX_BONUS_PLANT) break
    const placed = tryPlaceWord(grid, text, starts, rand) ?? placeFallback(grid, text)
    if (!placed) continue
    const word = makeBonusWord(text)
    plantedWords.push(word)
    bonus.push(word)
    bonusPaths[word.id] = placed
    planted.add(text)
  }

  // Dense bump: try 1–2 more short preferred plants into remaining gaps (cap MAX+2).
  const denserCap = MAX_BONUS_PLANT + 2
  for (const text of plantCandidates(targets, rand)) {
    if (plantedWords.length >= denserCap) break
    if (planted.has(text) || targets.has(text)) continue
    if (!isPreferredPlantWord(text) || text.length > 4) continue
    const placed = tryPlaceWord(grid, text, starts, rand) ?? placeFallback(grid, text)
    if (!placed) continue
    const word = makeBonusWord(text)
    plantedWords.push(word)
    bonus.push(word)
    bonusPaths[word.id] = placed
    planted.add(text)
  }

  const weightLetters = letterWeightsFromWords([
    ...words.map((word) => word.text),
    ...plantedWords.map((word) => word.text),
  ])
  const letters = fillGrid(grid, rand, weightLetters)

  const taken = new Set([...words.map((word) => word.text), ...planted])
  const scanPool = [
    ...new Set([
      ...bonusPool,
      ...[...COMMON_BONUS].filter((text) => isKidFriendlyBonusWord(text)),
    ]),
  ]
  for (const hit of scanBonusOnBoard(letters, scanPool, taken)) {
    bonus.push(hit.word)
    bonusPaths[hit.word.id] = hit.path
  }

  return { id: lineId, size, words, letters, paths, bonusPool, bonus, planted: plantedWords, bonusPaths }
}

export function sameCell(a: GemCoord, b: GemCoord) {
  return a.r === b.r && a.c === b.c
}

function sameTrail(a: GemCoord[], b: GemCoord[]): boolean {
  if (a.length !== b.length) return false
  return a.every((cell, i) => sameCell(cell, b[i]!))
}

function trailMatches(placed: GemCoord[], path: GemCoord[]): boolean {
  if (sameTrail(placed, path)) return true
  return sameTrail([...placed].reverse(), path)
}

export function cellKey(cell: GemCoord) {
  return `${cell.r}:${cell.c}`
}

export function isAdjacent(a: GemCoord, b: GemCoord) {
  const dr = b.r - a.r
  const dc = b.c - a.c
  return dr >= -1 && dr <= 1 && dc >= -1 && dc <= 1 && !(dr === 0 && dc === 0)
}

const SNAP_DIRS: GemCoord[] = [
  { r: 0, c: 1 },
  { r: 0, c: -1 },
  { r: 1, c: 0 },
  { r: -1, c: 0 },
  { r: 1, c: 1 },
  { r: 1, c: -1 },
  { r: -1, c: 1 },
  { r: -1, c: -1 },
]

function chebyshev(a: GemCoord, b: GemCoord): number {
  return Math.max(Math.abs(a.r - b.r), Math.abs(a.c - b.c))
}

function buildRay(start: GemCoord, dir: GemCoord, len: number, size: number): GemCoord[] | null {
  const path: GemCoord[] = []
  for (let i = 0; i < len; i += 1) {
    const r = start.r + dir.r * i
    const c = start.c + dir.c * i
    if (r < 0 || c < 0 || r >= size || c >= size) return null
    path.push({ r, c })
  }
  return path
}

/** Straight line of steps after the first cell — Easy word-search swipe. */
export function isStraightPath(path: GemCoord[]): boolean {
  if (path.length < 2) return false
  const first = path[0]
  const second = path[1]
  if (!first || !second) return false
  const dr = second.r - first.r
  const dc = second.c - first.c
  if (dr === 0 && dc === 0) return false
  if (Math.abs(dr) > 1 || Math.abs(dc) > 1) return false
  for (let i = 2; i < path.length; i += 1) {
    const prev = path[i - 1]
    const next = path[i]
    if (!prev || !next) return false
    if (next.r - prev.r !== dr || next.c - prev.c !== dc) return false
  }
  return true
}

/** Snap a wobbly finger trail to the nearest row, column, or diagonal. */
export function snapFingerPath(path: GemCoord[], size = GRID): GemCoord[] {
  if (path.length < 2 || size < 2) return path
  if (isStraightPath(path)) return path
  const start = path[0]
  if (!start) return path
  let best: GemCoord[] | null = null
  let bestScore = -Infinity
  for (const dir of SNAP_DIRS) {
    let hits = 0
    let maxT = 0
    const denom = dir.r * dir.r + dir.c * dir.c
    if (!denom) continue
    for (const cell of path) {
      const t = Math.round(((cell.r - start.r) * dir.r + (cell.c - start.c) * dir.c) / denom)
      if (t < 0) continue
      const on = { r: start.r + dir.r * t, c: start.c + dir.c * t }
      if (on.r < 0 || on.c < 0 || on.r >= size || on.c >= size) continue
      if (chebyshev(cell, on) > 1) continue
      hits += 1
      if (t > maxT) maxT = t
    }
    const len = Math.min(MAX_LEN, maxT + 1)
    if (len < 2) continue
    const line = buildRay(start, dir, len, size)
    if (!line) continue
    const last = path[path.length - 1]!
    const score = hits * 100 + len * 10 - chebyshev(last, line[line.length - 1]!)
    if (score > bestScore) {
      bestScore = score
      best = line
    }
  }
  return best ?? path
}

export function pathLetters(path: GemCoord[], letters: string[][]): string {
  return path.map((cell) => letters[cell.r]?.[cell.c] ?? '').join('')
}

function reverseLetters(text: string): string {
  return text.split('').reverse().join('')
}

export function pathSpellings(path: GemCoord[], letters: string[][]): string[] {
  const fwd = pathLetters(path, letters)
  const back = reverseLetters(fwd)
  return fwd === back ? [fwd] : [fwd, back]
}

/** First straight (or reverse) run of `word` on the letter grid. */
export function findStraightSpelling(letters: string[][], word: string): GemCoord[] | null {
  const size = letters.length
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      for (const dir of EASY_DIRS) {
        const path: GemCoord[] = []
        let ok = true
        for (let i = 0; i < word.length; i += 1) {
          const rr = r + dir.r * i
          const cc = c + dir.c * i
          if (rr < 0 || cc < 0 || rr >= size || cc >= size) {
            ok = false
            break
          }
          path.push({ r: rr, c: cc })
        }
        if (!ok) continue
        const spelled = pathLetters(path, letters)
        if (spelled === word) return path
        if (reverseLetters(spelled) === word) return [...path].reverse()
      }
    }
  }
  return null
}

/** Non-chip extra: curated lesson pool or a common English word on the board.
 * Exact 3–6 letter dict swipe scores even when those letters sit inside a longer chip. */
export function isBonusSpelling(text: string, puzzle: GemPuzzle): boolean {
  if (!bonusBitOk(text)) return false
  if (puzzle.words.some((word) => word.text === text)) return false
  if (puzzle.bonusPool.includes(text)) return true
  return COMMON_BONUS.has(text) && isKidFriendlyBonusWord(text)
}

export function tryAddToPath(path: GemCoord[], next: GemCoord, size = GRID): GemCoord[] {
  if (path.some((cell) => sameCell(cell, next))) {
    if (path.length >= 2 && sameCell(path[path.length - 2]!, next)) {
      return path.slice(0, -1)
    }
    return path
  }
  const last = path[path.length - 1]
  if (!last) return [next]
  if (chebyshev(last, next) > 2) return path
  return snapFingerPath([...path, next], size)
}

export function matchGemWord(path: GemCoord[], puzzle: GemPuzzle, found: string[]): GemWord | null {
  const line = snapFingerPath(path, puzzle.size)
  if (!isStraightPath(line)) return null
  const spells = pathSpellings(line, puzzle.letters)
  return (
    puzzle.words.find((word) => spells.includes(word.text) && !found.includes(word.id)) ?? null
  )
}

/**
 * Finger-up Miss after a swipe. No penalty if this gesture already scored
 * a chip or bonus, or if the snapped path is empty / a single cell.
 */
export function shouldMissAfterSwipe(scoredThisGesture: boolean, lineLength: number): boolean {
  if (scoredThisGesture) return false
  if (lineLength < 2) return false
  return true
}

/** Extra word on a straight line — not a required chip. Forward or reverse swipe. */
export function matchBonusWord(
  path: GemCoord[],
  puzzle: GemPuzzle,
  foundBonus: string[],
): GemWord | null {
  const line = snapFingerPath(path, puzzle.size)
  if (!isStraightPath(line)) return null
  const spells = pathSpellings(line, puzzle.letters)
  if (puzzle.words.some((word) => spells.includes(word.text))) return null
  const plantedHit = puzzle.planted.find((word) => {
    if (foundBonus.includes(word.id) || foundBonus.includes(word.text)) return false
    const placed = puzzle.bonusPaths[word.id]
    return Boolean(placed && trailMatches(placed, line))
  })
  if (plantedHit) return plantedHit
  const spelled = spells.find((text) => isBonusSpelling(text, puzzle))
  if (!spelled) return null
  const word = puzzle.bonus.find((item) => item.text === spelled) ?? makeBonusWord(spelled)
  if (foundBonus.includes(word.id) || foundBonus.includes(spelled)) return null
  return word
}


/** Cells still required by planted bonus words the player has not found yet. */
export function cellsNeededByOpenPlanted(puzzle: GemPuzzle, foundBonus: string[]): Set<string> {
  const need = new Set<string>()
  for (const word of puzzle.planted) {
    if (foundBonus.includes(word.id) || foundBonus.includes(word.text)) continue
    for (const cell of puzzle.bonusPaths[word.id] ?? []) need.add(cellKey(cell))
  }
  return need
}

export function cellsStillNeeded(puzzle: GemPuzzle, found: string[]): Set<string> {
  const need = new Set<string>()
  for (const word of puzzle.words) {
    if (found.includes(word.id)) continue
    for (const cell of puzzle.paths[word.id] ?? []) need.add(cellKey(cell))
  }
  return need
}
