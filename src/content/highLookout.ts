import type { Area } from '../types'

export const highLookout: Area = {
  id: 'high-lookout',
  order: 5,
  title: 'The High Lookout',
  shortTitle: 'Lookout',
  subtitle: 'Mind, duty, meaning, and beauty',
  blurb:
    'The trail turns inward: why do we know good, and why does beauty wound us?',
  intro: [
    'The path ends — and does not end — on a lookout where the whole town lies below. Here the clues are closer than stars: conscience, consciousness, the ache for meaning, the strange authority of beauty.',
    'These are not laboratory instruments. They are the conditions under which any instrument is used. Ignore them, and the case for God is thinner than it should be. Inflate them, and you preach at a wound instead of thinking with it.',
    'Take each as a signpost. Signposts do not drag you. They tell you a country may be real.',
  ],
  icon: 'peak',
  accent: '#b86b8a',
  challenges: [
    {
      kind: 'build-argument',
      id: 'hl-moral',
      title: 'The grain of duty',
      prompt:
        'Build a modest moral argument: morality as evidence, not as a police report.',
      context:
        'Popular form (often associated with Kantian echoes and, in recent apologetics, with a crisp syllogism): if objective moral duties exist, their most fitting ground is a good God. Atheist moral realists (e.g. some followers of G. E. Moore or Russ Shafer-Landau) deny that the first link is required. Keep the disagreement visible.',
      slots: [
        {
          id: 'p1',
          role: 'premise',
          label: 'Premise 1',
          correctCardId: 'real',
        },
        {
          id: 'p2',
          role: 'premise',
          label: 'Premise 2',
          correctCardId: 'home',
        },
        {
          id: 'p3',
          role: 'premise',
          label: 'Premise 3',
          correctCardId: 'fit',
        },
        {
          id: 'c',
          role: 'conclusion',
          label: 'Conclusion',
          correctCardId: 'clue',
        },
      ],
      cards: [
        {
          id: 'real',
          text: 'We experience some duties as real — not mere taste. “Do not torture a child for fun” does not feel like a preference for tea.',
        },
        {
          id: 'home',
          text: 'A moral law that judges even our interests is more at home if the world’s ground is good than if the world’s ground is indifferent.',
        },
        {
          id: 'fit',
          text: 'A morally good God is a fitting ground for objective duty — though some atheists defend moral realism without God.',
        },
        {
          id: 'clue',
          text: 'Therefore the moral life is a clue toward God: evidence to be weighed, not a knockdown certificate.',
        },
        {
          id: 'police',
          text: 'Therefore everyone who disagrees is secretly a villain and need not be answered.',
          distractor: true,
        },
        {
          id: 'taste',
          text: 'Therefore morality is only herd instinct, and the premise of real duty was a joke.',
          distractor: true,
        },
      ],
      teachOnWrong:
        'The two discarded cards are temptations: contempt, or collapse. The valid chain honors the experience of duty, names a theistic ground as fitting, and still admits a real philosophical rival.',
      deeper:
        'Romans 2:14–15 speaks of a law “written on the heart.” That is not a sneer at people who doubt. It is a claim that moral knowledge is widely shared — which is why we can argue about it at all.',
    },
    {
      kind: 'match',
      id: 'hl-mind',
      title: 'The inside of mind',
      prompt: 'Match each feature of mind to what physical description still leaves standing.',
      context:
        'David Chalmers named the “hard problem of consciousness”: explaining why physical process is accompanied by inner experience. None of this “inserts God into a neuron.” It asks whether mind is at home in a story that begins and ends with the indifferent.',
      pairs: [
        {
          id: 'qualia',
          left: 'Qualia',
          right: 'The felt redness of red — not captured by a wavelength number',
        },
        {
          id: 'about',
          left: 'Intentionality',
          right: 'Thoughts being about things, not only colliding with them',
        },
        {
          id: 'hard',
          left: 'The hard problem',
          right: 'Why physical process is accompanied by inner experience at all',
        },
        {
          id: 'reason',
          left: 'Reason as norm',
          right: 'Following a standard of truth, not only a causal shove',
        },
      ],
      teachOnWrong:
        'Pair the everyday word with the leftover mystery. Wavelengths, brain scans, and causes are real — they are not yet the felt, the about, the why-it-is-like-something, or the ought-of-logic.',
      deeper:
        'Some materialists expect a future theory to close the gap. Some dualists and some theists argue that mind is fundamental — and that a living God is the most coherent place for mind to be fundamental. Again: a clue with rivals.',
    },
    {
      kind: 'multiple-choice',
      id: 'hl-meaning',
      title: 'Invented or found',
      prompt:
        'People can build local meaning without theism: love a child, finish a craft, keep a promise. What is the deeper question the lookout adds?',
      context:
        'Ecclesiastes gives voice to vanity under the sun — and still ends with fear of God and keeping his commandments (Eccl 12:13). The book refuses both cheap cheer and cheap despair.',
      choices: [
        {
          id: 'a',
          text: 'Whether meaning is only invented, or also discovered — whether the hunger for a final good has a real object.',
          correct: true,
          teach:
            'Yes. Constructed meaning is not fake at the human scale. The philosophical question is whether the universe is such that our deepest loves are at home, or whether they are a brief pattern on indifferent matter. Theism claims they are at home.',
        },
        {
          id: 'b',
          text: 'Whether we can force every doubter to feel meaning on command.',
          correct: false,
          teach:
            'Meaning is not a truncheon. A respectful case invites; it does not coerce an inner life.',
        },
        {
          id: 'c',
          text: 'Whether Ecclesiastes forbids ordinary work and love as pointless.',
          correct: false,
          teach:
            'Ecclesiastes also blesses eating, work, and companionship as gifts (e.g. Eccl 2:24; 9:7–10). The “vanity” is what those gifts become when they are asked to be God.',
        },
        {
          id: 'd',
          text: 'Whether science has located the meaning organ and closed the file.',
          correct: false,
          teach:
            'Neuroscience can study reward and narrative. It cannot, by measuring them, tell you whether the good you seek is real. That remains a philosophical — and for many, a religious — question.',
        },
      ],
      deeper:
        'If God is the good that created goods point toward, then ordinary loves are not canceled. They are promised a future. That is a different picture than “meaning is a private hobby.”',
    },
    {
      kind: 'scenario',
      id: 'hl-beauty',
      title: 'Homesick at the music',
      scene:
        'C. S. Lewis wrote of a desire that beauty wakes and does not satisfy — Sehnsucht, the inconsolable longing. In “The Weight of Glory” he describes the tramp of something we were born for, as if a memory of a country we have not visited. You hear a piece of music, or see evening on the ridge, and the ache is larger than the object.',
      prompt: 'What is the most careful use of this experience?',
      choices: [
        {
          id: 'a',
          text: 'It does not demonstrate God the way a theorem does. It is a signpost: if nothing in the world satisfies a hunger the world keeps waking, one rational possibility is that we were made for another country.',
          correct: true,
          teach:
            'Yes. Lewis offers an argument from desire, not a deduction. Hungers usually correspond to real objects (hunger / food, homesickness / home). The inference can be resisted — perhaps this hunger is a misfire. It cannot be honestly ignored as if beauty were only interior paint.',
        },
        {
          id: 'b',
          text: 'Beautiful feelings are already the beatific vision, so no further truth is needed.',
          correct: false,
          teach:
            'Lewis’s point is the opposite: the feeling is a messenger, not the city. Worshiping the messenger is how the ache turns sour.',
        },
        {
          id: 'c',
          text: 'Anyone unmoved by your favorite song is morally lost.',
          correct: false,
          teach:
            'Taste differs. The argument is not “share my playlist.” It is about a structure of longing that many people recognize under different objects.',
        },
        {
          id: 'd',
          text: 'Psalm 19 forbids looking at the sky except as a physics problem.',
          correct: false,
          teach:
            'Psalm 19:1 — “The heavens declare the glory of God” — is one of Scripture’s invitations to read the world as speech, not only as mechanism. Physics can be part of the reading.',
        },
      ],
      deeper:
        'Beauty does not replace the earlier areas. It keeps them from becoming only a brief. The case for God, if it is true, should be a home for the mind and for the heart that the mind cannot gag.',
    },
  ],
}
