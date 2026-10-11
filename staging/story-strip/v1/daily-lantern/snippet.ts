// daily-lantern v1 — drop-in snippets. Paste each block into the named file.

// ── src/lib/sequenceArt.ts : imports (top of file) ──
import lantern1Dark from '../assets/story-strip/lantern1-dark.webp'
import lantern2Lamp from '../assets/story-strip/lantern2-lamp.webp'
import lantern3Found from '../assets/story-strip/lantern3-found.webp'

// ── SEQUENCE_ART (add rows) ──
  'lantern1-dark': lantern1Dark,
  'lantern2-lamp': lantern2Lamp,
  'lantern3-found': lantern3Found,

// ── CUTOUT_BACKDROP (add rows) ──
  'lantern1-dark': { sky: '#2c3a6b', horizon: '#4b5a8f', ground: '#3d4a3a' },
  'lantern2-lamp': { sky: '#33427a', horizon: '#ffd98a', ground: '#4a5a3e' },
  'lantern3-found': { sky: '#3a4a86', horizon: '#ffe2a0', ground: '#6b7a4a' },

// ── SEQUENCE_CROP (add rows; 3-card Easy portrait) ──
  'lantern1-dark': { x: '28%', y: '0%' },
  'lantern2-lamp': { x: '22%', y: '0%' },
  'lantern3-found': { x: '45%', y: '0%' },

// ── src/content/daily.ts : challenge id 'daily-lantern' — REPLACE the items array ──
      items: [
        { id: 'a', gem: 'star', art: 'lantern1-dark', text: 'Night comes. The street is dark.', shortCaption: 'Dark\nstreet', winCaption: 'It is\ndark.', role: 'dark' },
        { id: 'b', gem: 'lamp', art: 'lantern2-lamp', text: 'Someone sets a lamp out.', shortCaption: 'Lamp\nset out', winCaption: 'A lamp\nis set out.', role: 'lamp' },
        { id: 'c', gem: 'heart', art: 'lantern3-found', text: 'A walker finds the way.', shortCaption: 'Finds\nthe way', winCaption: 'The way\nis seen.', role: 'walker' },
      ],

// ── src/lib/sequenceVerse.ts : SEQUENCE_VERSES['daily-lantern'] — REPLACE entry (only easyLead is new) ──
  'daily-lantern': {
    kicker: 'Jesus said',
    text: 'Let your light so shine before men, that they may see your good works and give glory to your Father who is in heaven.',
    easyLead: '“Before men” means where people can see. Give glory to your Father means praise God.',
    ref: 'Matthew 5:16',
  },

// ── src/lib/easyChrome.ts : EASY_STRIP_FACE (add rows; Easy follow-up / main-idea faces) ──
  'Light is only for insiders behind a door.':
    'Hide your light under a basket.',
