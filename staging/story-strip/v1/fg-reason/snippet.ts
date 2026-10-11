// fg-reason v1 — drop-in snippets. Paste each block into the named file.

// ── src/lib/sequenceArt.ts : imports (top of file) ──
import reason1Think from '../assets/story-strip/reason1-think.webp'
import reason2Ground from '../assets/story-strip/reason2-ground.webp'
import reason3Light from '../assets/story-strip/reason3-light.webp'
import reason4Stands from '../assets/story-strip/reason4-stands.webp'

// ── SEQUENCE_ART (add rows) ──
  'reason1-think': reason1Think,
  'reason2-ground': reason2Ground,
  'reason3-light': reason3Light,
  'reason4-stands': reason4Stands,

// ── CUTOUT_BACKDROP (add rows) ──
  'reason1-think': { sky: '#bfe3ff', horizon: '#fff3cf', ground: '#e2c58f' },
  'reason2-ground': { sky: '#bfe3ff', horizon: '#fff3cf', ground: '#9fc47a' },
  'reason3-light': { sky: '#ffe6a3', horizon: '#fffbe8', ground: '#f2d48a' },
  'reason4-stands': { sky: '#ffe9b8', horizon: '#fff8e6', ground: '#9fc47a' },

// ── SEQUENCE_FIGURE (add rows) ──
  'reason3-light': { cue: 'Jesus', x: '45%', y: '4%', ox: '45%', oy: '2%', scale: 1.8 },

// ── src/content/firstGate.ts : challenge id 'fg-reason' — REPLACE the items array ──
      items: [
        { id: 'a', art: 'reason1-think', text: 'You think, count, and ask why.', shortCaption: 'Think and\nask why', winCaption: 'You think\nand ask.', role: 'think' },
        { id: 'b', art: 'reason2-ground', text: 'Your mind needs solid ground.', shortCaption: 'Solid\nground', winCaption: 'Solid\nground.', role: 'ground' },
        { id: 'c', art: 'reason3-light', text: 'Jesus, the Word, is true light.', shortCaption: 'True\nlight', winCaption: 'Jesus is\nthe light.', role: 'light' },
        { id: 'd', art: 'reason4-stands', text: 'So your thinking stands on God.', easyText: 'God gives your mind light.', shortCaption: 'Stands\non God', easyShortCaption: 'God gives\nlight', winCaption: 'Your mind\nhas light.', role: 'God', easyRole: 'God' },
      ],

// ── src/lib/sequenceVerse.ts : SEQUENCE_VERSES['fg-reason'] — REPLACE entry (only easyLead is new) ──
  'fg-reason': {
    kicker: 'John wrote',
    text: 'The true light that enlightens every man was coming into the world.',
    easyLead: '“Enlightens” means gives light to. “Every man” means every person. The true light is Jesus.',
    ref: 'John 1:9',
  },

// ── src/lib/easyChrome.ts : EASY_STRIP_FACE (add rows; Easy follow-up / main-idea faces) ──
  'The mind you already trust needs a real ground.':
    'Your mind works because God gives it light.',
  'The mind needs a real ground.':
    'God gives your mind light.',
  'Reason is a free-floating trick with no ground.':
    'Thinking floats with nothing under it.',
  'Darkness is the last word about the world.':
    'The world is dark forever.',
