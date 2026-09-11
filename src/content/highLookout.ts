import type { Area } from '../types'

export const highLookout: Area = {
  id: 'high-lookout',
  order: 5,
  title: 'Meaning Ridge',
  shortTitle: 'Meaning',
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
      idea: 'duty feels real, not like a taste for tea',
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
      idea: 'inner experience is not captured by a scan',
      prompt: 'Match each feature of mind to what physical description still leaves standing.',
      context:
        'Inner experience is not captured by a scan. The “hard problem” is why physical process is accompanied by felt life at all. Mind is at home if the world’s ground is a living God — not an indifferent process.',
      pairs: [
        {
          id: 'qualia',
          gem: 'heart',
          scene: 'redness',
          left: 'Felt redness',
          right: 'The felt redness of red — not captured by a wavelength number',
        },
        {
          id: 'about',
          gem: 'lamp',
          scene: 'aboutness',
          left: 'Thoughts about things',
          right: 'Thoughts being about things, not only colliding with them',
        },
        {
          id: 'hard',
          gem: 'door',
          scene: 'mindgap',
          left: 'Why it feels like something',
          right: 'Why physical process is accompanied by inner experience at all',
        },
        {
          id: 'reason',
          gem: 'star',
          scene: 'truenorth',
          left: 'Reason as norm',
          right: 'Following a standard of truth, not only a causal shove',
        },
      ],
      teachOnWrong:
        'Pair the everyday word with the leftover mystery. Wavelengths, brain scans, and causes are real — they are not yet the felt, the about, the why-it-is-like-something, or the ought-of-logic.',
      deeper:
        'A living God is the home of mind. Materialism hopes a future theory will close the gap. Hold the claim: inner life is not an accident at the end of indifference.',
    },
    {
      kind: 'sort',
      id: 'hl-meaning',
      title: 'Invented or found',
      idea: 'meaning is found, not only invented',
      prompt: 'Keep the lookout’s real question. Toss the decoys.',
      context:
        'Ecclesiastes refuses cheap cheer and cheap despair. The hunger for a final good has an object (Eccl 12:13).',
      keepLabel: 'Keep',
      discardLabel: 'Toss',
      tiles: [
        {
          id: 'a',
          text: 'Is meaning only invented — or also discovered? Does the hunger for a final good have an object?',
          bin: 'keep',
        },
        {
          id: 'b',
          text: 'Can we force every doubter to feel meaning on command?',
          bin: 'discard',
        },
        {
          id: 'c',
          text: 'Does Ecclesiastes forbid ordinary work and love as pointless?',
          bin: 'discard',
        },
        {
          id: 'd',
          text: 'Has science located the meaning organ and closed the file?',
          bin: 'discard',
        },
      ],
      teachOnWrong:
        'Constructed meaning can be real at human scale. The deeper question is whether our loves are at home in the universe.',
      deeper:
        'If God is the good that created goods point toward, ordinary loves are not canceled. They are promised a future.',
    },
    {
      kind: 'sort',
      id: 'hl-beauty',
      title: 'Homesick at the music',
      idea: 'beauty wakes a hunger it cannot feed',
      prompt: 'Keep Lewis’s careful use of longing. Toss the rest.',
      context:
        'Beauty wakes a hunger it cannot feed — Sehnsucht. Lewis: as if a memory of a country you have not visited.',
      keepLabel: 'Keep',
      discardLabel: 'Toss',
      tiles: [
        {
          id: 'a',
          text: 'A signpost, not a theorem: the hunger may mean we were made for another country.',
          bin: 'keep',
        },
        {
          id: 'b',
          text: 'Beautiful feelings already are the beatific vision.',
          bin: 'discard',
        },
        {
          id: 'c',
          text: 'Anyone unmoved by your favorite song is morally lost.',
          bin: 'discard',
        },
        {
          id: 'd',
          text: 'Psalm 19 forbids looking at the sky except as physics.',
          bin: 'discard',
        },
      ],
      teachOnWrong:
        'The feeling is a messenger, not the city. Taste differs. Psalm 19 treats the sky as speech — physics can be part of the reading.',
      deeper:
        'Beauty does not replace the earlier areas. It keeps them from becoming only a brief.',
    },
  ],
}
