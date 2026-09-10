/**
 * Dig deeper — hawk-filtered dossier.
 * Scripture / Aristotle / Aquinas / Ghazālī / Philoponus first.
 * Modern links are faithful Christians only, and only as secondary
 * (or when the evidence itself is modern: fine-tuning, manuscripts).
 * Never cite skeptic hubs, Wikipedia, or mainstream academics as the teaching voice.
 */

export type DeeperEra = 'scripture' | 'ancient' | 'classic' | 'modern'
export type DeeperSurface = 'hold' | 'journal' | 'map' | 'profile'

export interface DeeperLink {
  label: string
  href: string
  era: DeeperEra
  source: string
  /** Outside attestation (Tacitus / Josephus) — Journal only. */
  journalOnly?: boolean
}

function rsv(ref: string): DeeperLink {
  return {
    label: ref,
    href: `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref)}&version=RSV`,
    era: 'scripture',
    source: 'Holy Scripture · RSV',
  }
}

function father(label: string, href: string, source: string): DeeperLink {
  return { label, href, era: 'ancient', source }
}

function classic(label: string, href: string, source: string): DeeperLink {
  return { label, href, era: 'classic', source }
}

function modern(label: string, href: string, source: string): DeeperLink {
  return { label, href, era: 'modern', source }
}

const CREED: DeeperLink[] = [
  rsv('1 Corinthians 15:3–8'),
  father(
    'Ignatius, To the Smyrnaeans 1–3',
    'https://www.newadvent.org/fathers/0109.htm',
    'Ignatius of Antioch · New Advent',
  ),
  father(
    'Justin, First Apology',
    'https://www.newadvent.org/fathers/0126.htm',
    'Justin Martyr · New Advent',
  ),
  father(
    'Justin, Dialogue with Trypho',
    'https://www.newadvent.org/fathers/0128.htm',
    'Justin Martyr · New Advent',
  ),
  father(
    'Irenaeus, Against Heresies III',
    'https://www.newadvent.org/fathers/0103301.htm',
    'Irenaeus of Lyons · New Advent',
  ),
  modern(
    'Habermas on the early resurrection testimony',
    'https://www.garyhabermas.com/articles/dialog_rexperience/dialog_rexperiences.htm',
    'Gary Habermas · secondary dating aid',
  ),
  modern(
    'Licona, historicity of the resurrection',
    'https://www.risenjesus.com/',
    'Michael Licona · secondary dating aid',
  ),
]

const ISAIAH: DeeperLink[] = [
  rsv('Isaiah 52:13–53:12'),
  rsv('Acts 8:32–35'),
  rsv('1 Peter 2:22–25'),
  father(
    'Justin, Dialogue with Trypho',
    'https://www.newadvent.org/fathers/0128.htm',
    'Justin Martyr · New Advent',
  ),
  father(
    'Irenaeus, Against Heresies III',
    'https://www.newadvent.org/fathers/0103301.htm',
    'Irenaeus of Lyons · New Advent',
  ),
  father(
    'Augustine, City of God XVIII.29',
    'https://www.newadvent.org/fathers/120118.htm',
    'Augustine · Isaiah on Christ and the Church',
  ),
]

const LUKE10: DeeperLink[] = [
  rsv('Luke 10:25–37'),
  father(
    'Irenaeus on the Samaritan (AH III.17)',
    'https://www.newadvent.org/fathers/0103317.htm',
    'Irenaeus of Lyons · New Advent',
  ),
  classic(
    'Catena Aurea on Luke 10 — Origen, Ambrose, Augustine',
    'https://isidore.co/aquinas/CALuke.htm#10',
    'Aquinas compiling the Fathers · read the 10:36 flip carefully',
  ),
]

const PS19: DeeperLink[] = [
  rsv('Psalm 19:1–6'),
  rsv('Romans 1:19–20'),
  rsv('Wisdom 13:1–9'),
  father(
    'Athanasius, Contra Gentes 35–44',
    'https://www.newadvent.org/fathers/2801.htm',
    'Athanasius · Against the Heathen',
  ),
  father(
    'Augustine, Confessions X.6',
    'https://www.newadvent.org/fathers/110110.htm',
    'Augustine · the world as speech',
  ),
  father(
    'John of Damascus, Orthodox Faith I.3',
    'https://www.newadvent.org/fathers/33041.htm',
    'John of Damascus · that there is a God',
  ),
]

const FINE_TUNING: DeeperLink[] = [
  classic(
    'Aquinas, Fifth Way — ST I, q.2, a.3',
    'https://www.newadvent.org/summa/1002.htm#article3',
    'Thomas Aquinas · Summa Theologiae',
  ),
  rsv('Psalm 19:1–6'),
  rsv('Romans 1:19–20'),
  modern(
    'Robin Collins, The Fine-Tuning Design Argument',
    'https://rintintin.colorado.edu/~vancecd/phil201/Collins.pdf',
    'Robin Collins · believing philosopher',
  ),
]

const FIRST_WAY: DeeperLink[] = [
  father(
    'Aristotle, Physics VIII',
    'http://classics.mit.edu/Aristotle/physics.8.viii.html',
    'Aristotle · change and the first mover',
  ),
  father(
    'Aristotle, Metaphysics XII',
    'http://classics.mit.edu/Aristotle/metaphysics.12.xii.html',
    'Aristotle · thought thinking itself',
  ),
  classic(
    'Aquinas, First Way — ST I, q.2, a.3',
    'https://www.newadvent.org/summa/1002.htm#article3',
    'Thomas Aquinas · Summa Theologiae',
  ),
  classic(
    'Aquinas, Summa Contra Gentiles I',
    'https://isidore.co/aquinas/ContraGentiles1.htm',
    'Thomas Aquinas · SCG I',
  ),
  modern(
    'Feser, so you think you understand the cosmological argument',
    'https://edwardfeser.blogspot.com/2011/07/so-you-think-you-understand.html',
    'Edward Feser · secondary guide only',
  ),
]

const KALAM: DeeperLink[] = [
  rsv('Genesis 1:1'),
  father(
    'Philoponus against an eternal world',
    'https://archive.org/details/philoponusagains0000phil',
    'John Philoponus · Against Aristotle on the Eternity of the World',
  ),
  classic(
    'al-Ghazālī, The Incoherence of the Philosophers',
    'https://sourcebooks.fordham.edu/source/alghazali.asp',
    'al-Ghazālī · kalām against an eternal cosmos',
  ),
  modern(
    'Craig’s modern statement of the kalām syllogism',
    'https://www.reasonablefaith.org/writings/popular-writings/existence-nature-of-god/the-kalam-cosmological-argument',
    'William Lane Craig · under Ghazālī and Philoponus',
  ),
]

const WOMEN_HOLD: DeeperLink[] = [
  rsv('Luke 24:1–11'),
  rsv('John 20:1–18'),
  classic(
    'Catena Aurea on Luke 24',
    'https://isidore.co/aquinas/CALuke.htm#24',
    'Aquinas compiling the Fathers',
  ),
]

const WOMEN_OUTSIDE: DeeperLink[] = [
  {
    ...father(
      'Tacitus, Annals 15.44',
      'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0078%3Abook%3D15%3Achapter%3D44',
      'Tacitus · Christus under Pilate',
    ),
    journalOnly: true,
  },
  {
    ...father(
      'Josephus, Antiquities 18.63–64',
      'https://penelope.uchicago.edu/josephus/ant-18.html',
      'Josephus · Testimonium; later Christian touches disputed',
    ),
    journalOnly: true,
  },
]

const DOSSIERS: Record<string, DeeperLink[]> = {
  'wb-creed': CREED,
  'wb-early': CREED,
  'daily-creed': CREED,
  'daily-names': CREED,
  'j-wb-1': CREED,
  'j-wb-2': CREED,
  'daily-isaiah': ISAIAH,
  'ph-road': LUKE10,
  'daily-neighbor': LUKE10,
  'td-watch': LUKE10,
  'daily-stars': PS19,
  'ob-tuning': FINE_TUNING,
  'ob-design': FINE_TUNING,
  'j-ob-1': FINE_TUNING,
  'j-ob-2': FINE_TUNING,
  'fg-mover': FIRST_WAY,
  'j-fg-1': FIRST_WAY,
  'fg-kalam': KALAM,
  'j-fg-3': KALAM,
  'wb-women': [...WOMEN_HOLD, ...WOMEN_OUTSIDE],
  'j-wb-4': [...WOMEN_HOLD, ...WOMEN_OUTSIDE],
  'wb-method': [
    rsv('Luke 1:1–4'),
    rsv('1 Corinthians 15:3–8'),
    father(
      'Irenaeus, Against Heresies III.1–4',
      'https://www.newadvent.org/fathers/0103301.htm',
      'Irenaeus · apostolic handing-on',
    ),
  ],
  'j-wb-3': [
    rsv('Luke 1:1–4'),
    rsv('1 Corinthians 15:3–8'),
  ],
  'ph-father': [
    rsv('Luke 15:11–32'),
    classic(
      'Catena Aurea on Luke 15',
      'https://isidore.co/aquinas/CALuke.htm#15',
      'Aquinas compiling the Fathers',
    ),
  ],
  'ph-seeds': [
    rsv('Matthew 13:1–23'),
    rsv('Luke 15:1–7'),
    rsv('Matthew 25:14–30'),
  ],
  'ph-debt': [
    rsv('Matthew 18:21–35'),
    rsv('Matthew 6:12–15'),
  ],
  'ob-leibniz': [
    rsv('Genesis 1:1–3'),
    rsv('Exodus 3:14'),
    classic(
      'Aquinas, ST I, q.2, a.3',
      'https://www.newadvent.org/summa/1002.htm#article3',
      'Thomas Aquinas · why anything exists',
    ),
    father(
      'Athanasius, Contra Gentes 2–7',
      'https://www.newadvent.org/fathers/2801.htm',
      'Athanasius · the world is not its own explanation',
    ),
  ],
  'ob-life': [
    rsv('Genesis 1:1–27'),
    rsv('John 1:1–4'),
    classic(
      'Aquinas, ST I, q.2, a.3 — Fifth Way',
      'https://www.newadvent.org/summa/1002.htm#article3',
      'Thomas Aquinas · ordered things point to mind',
    ),
  ],
  'j-ob-3': [
    rsv('Genesis 1:1–3'),
    classic(
      'Aquinas, ST I, q.2, a.3',
      'https://www.newadvent.org/summa/1002.htm#article3',
      'Thomas Aquinas',
    ),
  ],
  'j-ob-4': [
    rsv('Genesis 1:1–27'),
    rsv('John 1:1–4'),
  ],
  'fg-contingent': [
    classic(
      'Aquinas, Third Way — ST I, q.2, a.3',
      'https://www.newadvent.org/summa/1002.htm#article3',
      'Thomas Aquinas · necessary being',
    ),
    father(
      'Aristotle, Metaphysics XII',
      'http://classics.mit.edu/Aristotle/metaphysics.12.xii.html',
      'Aristotle',
    ),
  ],
  'j-fg-2': [
    classic(
      'Aquinas, Third Way — ST I, q.2, a.3',
      'https://www.newadvent.org/summa/1002.htm#article3',
      'Thomas Aquinas',
    ),
  ],
  'fg-limits': [
    classic(
      'Aquinas, ST I, q.3 — after the Five Ways',
      'https://www.newadvent.org/summa/1003.htm',
      'Thomas Aquinas · attributes take further work',
    ),
    rsv('John 1:1–18'),
  ],
  'j-fg-4': [
    classic(
      'Aquinas, ST I, qq.2–3',
      'https://www.newadvent.org/summa/1002.htm',
      'Thomas Aquinas',
    ),
    rsv('John 1:1–18'),
  ],
  'hl-moral': [
    rsv('Romans 2:14–15'),
    classic(
      'Aquinas, ST I-II, q.91 — kinds of law',
      'https://www.newadvent.org/summa/2091.htm',
      'Thomas Aquinas',
    ),
    father(
      'Augustine, City of God XIX.4–13',
      'https://www.newadvent.org/fathers/120119.htm',
      'Augustine · peace and the good',
    ),
  ],
  'j-hl-1': [
    rsv('Romans 2:14–15'),
    classic(
      'Aquinas, ST I-II, q.91',
      'https://www.newadvent.org/summa/2091.htm',
      'Thomas Aquinas',
    ),
  ],
  'hl-mind': [
    rsv('John 1:1–4'),
    father(
      'Augustine, De Trinitate X',
      'https://www.newadvent.org/fathers/130110.htm',
      'Augustine · the mind knowing itself',
    ),
    father(
      'Aristotle, De Anima',
      'http://classics.mit.edu/Aristotle/soul.html',
      'Aristotle · soul as act',
    ),
  ],
  'j-hl-2': [
    rsv('John 1:1–4'),
    father(
      'Augustine, De Trinitate X',
      'https://www.newadvent.org/fathers/130110.htm',
      'Augustine',
    ),
  ],
  'hl-meaning': [
    rsv('Ecclesiastes 12:13'),
    rsv('Ecclesiastes 2:24–25'),
    father(
      'Boethius, Consolation of Philosophy',
      'https://www.ccel.org/ccel/boethius/consolation.html',
      'Boethius',
    ),
    father(
      'Augustine, Confessions I.1',
      'https://www.newadvent.org/fathers/110101.htm',
      'Augustine · restless until it rests in you',
    ),
  ],
  'j-hl-3': [
    rsv('Ecclesiastes 12:13'),
    father(
      'Augustine, Confessions I.1',
      'https://www.newadvent.org/fathers/110101.htm',
      'Augustine',
    ),
  ],
  'hl-beauty': [
    rsv('Psalm 19:1–4'),
    father(
      'Augustine, Confessions X.6',
      'https://www.newadvent.org/fathers/110110.htm',
      'Augustine · late have I loved you',
    ),
    classic(
      'Aquinas, ST I, q.5, a.4 — the good and the beautiful',
      'https://www.newadvent.org/summa/1005.htm#article4',
      'Thomas Aquinas',
    ),
  ],
  'j-hl-4': [
    rsv('Psalm 19:1–4'),
    father(
      'Augustine, Confessions X.6',
      'https://www.newadvent.org/fathers/110110.htm',
      'Augustine',
    ),
  ],
  'daily-lantern': [rsv('Matthew 5:14–16')],
  'daily-gems': [
    rsv('Matthew 5:14–16'),
    rsv('Mark 4:1–9'),
    rsv('Matthew 26:28'),
    rsv('Luke 22:20'),
  ],
  'daily-seed': [rsv('Mark 4:1–9')],
  'daily-life': [
    rsv('Acts 17:24–25'),
    rsv('Genesis 1:1–27'),
    rsv('Wisdom 13:1–9'),
  ],
  'daily-scroll': [
    rsv('Isaiah 40:8'),
    father(
      'Augustine, On Christian Doctrine II',
      'https://www.newadvent.org/fathers/12022.htm',
      'Augustine · signs and copies',
    ),
    modern(
      'Center for the Study of New Testament Manuscripts',
      'https://www.csntm.org/',
      'Dan Wallace · modern copies and dating methods',
    ),
  ],
  'daily-grace': [
    rsv('Ephesians 2:8–9'),
    father(
      'Augustine, On the Spirit and the Letter',
      'https://www.newadvent.org/fathers/1502.htm',
      'Augustine · grace first',
    ),
  ],
  'daily-rest': [rsv('Matthew 11:28–30')],
  'daily-empty': [
    rsv('Luke 24:1–12'),
    rsv('John 20:1–18'),
  ],
  'daily-cosmos': [
    rsv('Psalm 8:3–4'),
    rsv('Genesis 1:1'),
    classic(
      'Aquinas, ST I, q.2, a.3',
      'https://www.newadvent.org/summa/1002.htm#article3',
      'Thomas Aquinas',
    ),
  ],
  'daily-door': [
    rsv('John 10:7–11'),
    father(
      'Augustine, Tractates on John 45–47',
      'https://www.newadvent.org/fathers/1701045.htm',
      'Augustine · the door',
    ),
  ],
  'ln-street': [
    rsv('Luke 10:25–37'),
    rsv('1 Corinthians 15:3–8'),
    rsv('Matthew 5:14–16'),
  ],
  'j-trail-1': [rsv('Lamentations 3:22–23')],
  'j-trail-2': [rsv('Lamentations 3:22–23')],
  'j-trail-3': [rsv('Luke 15:20')],
  'j-trail-5': [rsv('Psalm 19:1–4')],
  'j-trail-7': [rsv('Psalm 119:105')],
  'trail-days-1': [rsv('Lamentations 3:22–23')],
  'trail-days-2': [rsv('Lamentations 3:22–23')],
  'trail-days-3': [rsv('Luke 15:20')],
  'trail-days-5': [rsv('Psalm 19:1–4')],
  'trail-days-7': [rsv('Psalm 119:105')],
}

const ALIAS: Record<string, string> = {
  'j-ph-1': 'ph-road',
  'j-ph-2': 'ph-father',
  'j-ph-3': 'ph-seeds',
  'j-ph-4': 'ph-debt',
}

export function deeperLinksFor(
  id: string,
  surface: DeeperSurface = 'hold',
): DeeperLink[] {
  const key = ALIAS[id] ?? id
  const rows = DOSSIERS[key] ?? []
  return rows.filter((link) => (surface === 'journal' ? true : !link.journalOnly))
}

export function eraLabel(era: DeeperEra): string {
  if (era === 'scripture') return 'Scripture'
  if (era === 'ancient') return 'Ancient'
  if (era === 'classic') return 'Pre-Reformation'
  return 'Modern · believing'
}
