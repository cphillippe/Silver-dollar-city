/** Exact RSV verse cards for Story Strip wins. Cuts use “…”. */
export interface SequenceVerse {
  kicker: string
  text: string
  /** Easy header reference. Hard keeps `ref`. */
  easyHeader?: string
  /** Easy line above the quote. Not spoken as the quote. */
  easyLead?: string
  /** Easy quote. Hard keeps `text`. */
  easyText?: string
  /** Easy citation. Hard keeps `ref`. */
  easyRef?: string
  ref: string
}

export const SEQUENCE_VERSES: Record<string, SequenceVerse> = {
  'daily-rest': {
    kicker: 'Jesus said',
    text: 'Come to me, all who labor and are heavy laden, and I will give you rest.',
    ref: 'Matthew 11:28',
  },
  'daily-lantern': {
    kicker: 'Jesus said',
    text: 'Let your light so shine before men, that they may see your good works and give glory to your Father who is in heaven.',
    ref: 'Matthew 5:16',
  },
  'daily-creed': {
    kicker: 'Paul wrote',
    text: 'For I delivered to you as of first importance what I also received, that Christ died for our sins…',
    ref: '1 Corinthians 15:3',
  },
  'daily-scroll': {
    kicker: 'Isaiah said',
    text: 'The grass withers, the flower fades; but the word of our God will stand for ever.',
    ref: 'Isaiah 40:8',
  },
  'wb-creed': {
    kicker: 'Paul wrote',
    text: '…that Christ died for our sins in accordance with the scriptures, that he was buried, that he was raised on the third day in accordance with the scriptures, and that he appeared to Cephas, then to the twelve.',
    easyLead: 'Peter is named first. It matches the old holy writings.',
    ref: '1 Corinthians 15:3–5',
  },
  'fg-reason': {
    kicker: 'John wrote',
    text: 'The true light that enlightens every man was coming into the world.',
    ref: 'John 1:9',
  },
  'fg-ground': {
    kicker: 'Paul said',
    text: 'In him we live and move and have our being.',
    ref: 'Acts 17:28',
  },
  'fg-mover': {
    kicker: 'The Lord said',
    text: 'For I the LORD do not change…',
    ref: 'Malachi 3:6',
  },
  'ph-road': {
    kicker: 'Jesus said',
    text: 'Which of these three, do you think, proved neighbor to the man who fell among the robbers? He said, “The one who showed mercy on him.” And Jesus said to him, “Go and do likewise.”',
    easyHeader: 'Luke 10:25–37',
    easyLead: 'The one who showed mercy was the neighbor.',
    easyText: 'Go and do likewise.',
    easyRef: 'Luke 10:37',
    ref: 'Luke 10:36–37',
  },
}

export function sequenceVerse(id: string): SequenceVerse | undefined {
  return SEQUENCE_VERSES[id]
}

/** One false panel on Hard. It does not belong in the strip. */
export const SEQUENCE_DECOY: Record<string, string> = {
  'daily-rest': 'Rest is a steeper hill.',
  'daily-lantern': 'Hide the lamp indoors.',
  'daily-creed': 'Paul invented the line.',
  'daily-scroll': 'The page fell from the sky.',
  'wb-creed': 'Buried is only decoration.',
  'fg-reason': 'Reason floats with no ground.',
  'fg-ground': 'The foundation is a dead brick.',
  'fg-mover': 'Things change all by themselves.',
  'ph-road': 'The priest is the hero.',
}
