import { packLesson } from '../content/packCatalog.ts'
import { evidenceFor } from '../content/evidence.ts'
import { easyChromeLine, easyWhoWhere } from './easy.ts'
import {
  BONUS_WORD_MAX,
  COMMON_BONUS_WORDS,
  isKidFriendlyBonusWord,
  isPreferredPlantWord,
} from './commonBonusWords.ts'
import {
  cellKey,
  emptyGrid,
  fillGrid,
  findStraightSpelling,
  gemHue,
  isAdjacent,
  isStraightPath,
  pathLetters,
  pathSpellings,
  plantCandidates,
  placeFallback,
  sameCell,
  scanBonusOnBoard,
  snapFingerPath,
  tryAddToPath,
  tryPlaceWord,
  letterWeightsFromWords,
  GRID_SIZE,
  MAX_BONUS_PLANT,
  MIN_BONUS_PLANT,
  STOP,
} from './gemSearchGrid.ts'

export {
  cellKey,
  findStraightSpelling,
  gemHue,
  isAdjacent,
  isStraightPath,
  letterWeightsFromWords,
  pathLetters,
  pathSpellings,
  plantCandidates,
  sameCell,
  snapFingerPath,
  tryAddToPath,
  MIN_BONUS_PLANT,
  MAX_BONUS_PLANT,
}

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

const MIN_LEN = 3
const MAX_LEN = 8
const MAX_WORDS = 4
const BONUS_MAX_LEN = BONUS_WORD_MAX
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

export function buildGemPuzzle(lineId: string, salt = 0): GemPuzzle {
  try {
    return buildGemPuzzleOnce(lineId, salt)
  } catch (err) {
    // Production-safe: one salt+1 rebuild rather than ship empty chip paths
    try {
      return buildGemPuzzleOnce(lineId, salt + 1)
    } catch {
      throw err
    }
  }
}

function buildGemPuzzleOnce(lineId: string, salt: number): GemPuzzle {
  const words = gemWordsFor(lineId)
  const bonusPool = bonusWordsFor(lineId)
  const size = GRID_SIZE
  const rand = rng(salt === 0 ? hashSeed(lineId) : hashSeed(`${lineId}:${salt}`))
  const grid = emptyGrid(size)
  const paths: Record<string, GemCoord[]> = {}
  const bonusPaths: Record<string, GemCoord[]> = {}
  const bonus: GemWord[] = []
  const starts: GemCoord[] = []
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) starts.push({ r, c })
  }

  // NEVER leave empty chip paths — plant before bonus + fill
  for (const word of words.slice().sort((a, b) => b.text.length - a.text.length)) {
    let placed = tryPlaceWord(grid, word.text, starts, rand) ?? placeFallback(grid, word.text)
    if (!placed || placed.length !== word.text.length) {
      placed = placeFallback(grid, word.text)
    }
    if (!placed || placed.length !== word.text.length) {
      throw new Error(`Match chip ${word.text} failed to plant on ${lineId}`)
    }
    paths[word.id] = placed
  }

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
  for (const hit of scanBonusOnBoard(letters, scanPool, taken, MIN_LEN, BONUS_MAX_LEN)) {
    const word = makeBonusWord(hit.text)
    bonus.push(word)
    bonusPaths[word.id] = hit.path
  }

  return { id: lineId, size, words, letters, paths, bonusPool, bonus, planted: plantedWords, bonusPaths }
}

function sameTrail(a: GemCoord[], b: GemCoord[]): boolean {
  if (a.length !== b.length) return false
  return a.every((cell, i) => sameCell(cell, b[i]!))
}

function trailMatches(placed: GemCoord[], path: GemCoord[]): boolean {
  if (sameTrail(placed, path)) return true
  return sameTrail([...placed].reverse(), path)
}

/** Non-chip extra: curated lesson pool or a common English word on the board.
 * Exact 3–6 letter dict swipe scores even when those letters sit inside a longer chip. */
export function isBonusSpelling(text: string, puzzle: GemPuzzle): boolean {
  if (!bonusBitOk(text)) return false
  if (puzzle.words.some((word) => word.text === text)) return false
  if (puzzle.bonusPool.includes(text)) return true
  return COMMON_BONUS.has(text) && isKidFriendlyBonusWord(text)
}

export function matchGemWord(path: GemCoord[], puzzle: GemPuzzle, found: string[]): GemWord | null {
  const line = snapFingerPath(path, puzzle.size, MAX_LEN)
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
  const line = snapFingerPath(path, puzzle.size, MAX_LEN)
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
