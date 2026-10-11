// daily-creed v1 — drop-in snippets. Paste each block into the named file.

// ── src/lib/sequenceArt.ts : imports (top of file) ──
import dcreed1Rose from '../assets/story-strip/dcreed1-rose.webp'
import dcreed2Tell from '../assets/story-strip/dcreed2-tell.webp'
import dcreed3Letter from '../assets/story-strip/dcreed3-letter.webp'

// ── SEQUENCE_ART (add rows) ──
  'dcreed1-rose': dcreed1Rose,
  'dcreed2-tell': dcreed2Tell,
  'dcreed3-letter': dcreed3Letter,

// ── CUTOUT_BACKDROP (add rows) ──
  'dcreed1-rose': { sky: '#ffd59a', horizon: '#fff6e0', ground: '#8fbf6a' },
  'dcreed2-tell': { sky: '#f3d7a1', horizon: '#fff0c8', ground: '#7fba68' },
  'dcreed3-letter': { sky: '#e9d6b5', horizon: '#fff3dc', ground: '#b89a72' },

// ── SEQUENCE_CROP (add rows; 3-card Easy portrait) ──
  'dcreed1-rose': { x: '50%', y: '0%' },
  'dcreed2-tell': { x: '30%', y: '0%' },
  'dcreed3-letter': { x: '45%', y: '0%' },

// ── src/content/daily.ts : challenge id 'daily-creed' — REPLACE the items array ──
      items: [
        { id: 'a', art: 'dcreed1-rose', text: 'Jesus dies, is buried, and is raised.', easyText: 'Jesus died, was buried, rose.', shortCaption: 'Died, buried,\nraised', easyShortCaption: 'Died, buried,\nrose', winCaption: 'Died, buried,\nrose.', role: 'raised', easyRole: 'rose' },
        { id: 'b', art: 'dcreed2-tell', text: 'Believers pass the news on.', shortCaption: 'News\npassed on', winCaption: 'Passed\non.', role: 'Believers' },
        { id: 'c', art: 'dcreed3-letter', text: 'Paul writes it in a letter.', shortCaption: 'Paul\nwrites', winCaption: 'Paul\nwrites it.', role: 'Paul' },
      ],

// ── src/lib/sequenceVerse.ts : SEQUENCE_VERSES['daily-creed'] — REPLACE entry (only easyLead is new) ──
  'daily-creed': {
    kicker: 'Paul wrote',
    text: 'For I delivered to you as of first importance what I also received, that Christ died for our sins…',
    easyLead: '“Delivered” means handed on. “Of first importance” means most important.',
    ref: '1 Corinthians 15:3',
  },

// ── src/lib/easyChrome.ts : EASY_STRIP_FACE (add rows; Easy follow-up / main-idea faces) ──
  'The churches named Christ died, buried, and raised before Paul wrote.':
    'Christians said “died, buried, raised” before Paul wrote.',
  'Burial is skipped because it does not matter.':
    'Being buried does not matter.',
