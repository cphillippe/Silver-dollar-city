import type { Area } from '../types'

export const observatory: Area = {
  id: 'observatory',
  order: 3,
  title: 'The Observatory',
  shortTitle: 'Ridge',
  subtitle: 'A sky that did not have to be this way',
  blurb:
    'Science maps how the world runs. It does not forbid the question why.',
  intro: [
    'Above the ridge a small observatory points at winter stars. The question here is not “Does a lab experiment prove God?” That would confuse the tools.',
    'The question is: what kind of universe is this? Why are its laws hospitable to life? Why is there a concrete world with laws at all?',
    'Fine-tuning, origins, and “something rather than nothing” are live philosophical arguments that begin from public facts. Treat them as clues with rivals — not as slogans.',
  ],
  icon: 'star',
  accent: '#7f9ec7',
  challenges: [
    {
      kind: 'match',
      id: 'ob-tuning',
      title: 'Narrow ranges',
      idea: 'the cosmos looks strangely fitted for life',
      prompt:
        'Match each feature of the cosmos to the standard fine-tuning observation about it.',
      context:
        '“Fine-tuning” here means: small changes to certain numbers yield a sterile world. This is widely discussed in cosmology (e.g. work popularized by Martin Rees, Luke Barnes, and others). It is a claim about sensitivity — not yet a proof of a Designer.',
      pairs: [
        {
          id: 'lambda',
          gem: 'star',
          scene: 'expand',
          left: 'Cosmological constant',
          right: 'Much larger: expansion too fierce for galaxies; much more negative: recollapse',
        },
        {
          id: 'strong',
          gem: 'coin',
          scene: 'bind',
          left: 'Strong nuclear force',
          right: 'Slight shift: familiar chemistry of hydrogen and heavier elements fails',
        },
        {
          id: 'entropy',
          gem: 'seed',
          scene: 'tidy',
          left: 'Early-universe entropy',
          right: 'Penrose: the initial low-entropy state is extravagantly special',
        },
        {
          id: 'ratio',
          gem: 'lamp',
          scene: 'dial',
          left: 'Gravity vs. electromagnetism',
          right: 'Stars, long-lived structure, and chemistry sit in a delicate balance',
        },
      ],
      teachOnWrong:
        'Think “what breaks if the number moves,” not “which verse this matches.” Fine-tuning is a physical observation first.',
      deeper:
        'Proposed explanations include: the numbers had to be this way (necessity), a vast ensemble of worlds (chance / multiverse), or intention (design). Intellectual honesty means keeping all three on the table while asking which is an explanation and which is a postponement.',
    },
    {
      kind: 'build-argument',
      id: 'ob-design',
      title: 'A habitable cosmos',
      idea: 'fine-tuning makes design a live explanation',
      prompt:
        'Build a careful inference — not a slogan — from fine-tuning to design as a rational option.',
      context:
        'An argument can be reasonable without being irresistible. That is the standard in philosophy, not a weakness unique to theism.',
      slots: [
        {
          id: 'p1',
          role: 'premise',
          label: 'Premise 1',
          correctCardId: 'narrow',
        },
        {
          id: 'p2',
          role: 'premise',
          label: 'Premise 2',
          correctCardId: 'surprise',
        },
        {
          id: 'p3',
          role: 'premise',
          label: 'Premise 3',
          correctCardId: 'expect',
        },
        {
          id: 'c',
          role: 'conclusion',
          label: 'Conclusion',
          correctCardId: 'live',
        },
      ],
      cards: [
        {
          id: 'narrow',
          text: 'Several physical parameters appear to have a life-permitting range that is extraordinarily narrow among conceivable values.',
        },
        {
          id: 'surprise',
          text: 'That narrowness is surprising if the parameters are a brute accident with no further explanation.',
        },
        {
          id: 'expect',
          text: 'A mind that intended a habitable cosmos would lead us to expect such parameters.',
        },
        {
          id: 'live',
          text: 'Design is therefore a live, rational explanation of fine-tuning — alongside necessity and a multiverse.',
        },
        {
          id: 'lab',
          text: 'Therefore a laboratory has now measured God directly.',
          distractor: true,
        },
        {
          id: 'which',
          text: 'Therefore this proves which religious tradition is true in every detail.',
          distractor: true,
        },
      ],
      teachOnWrong:
        'Avoid the two cheap cards. Fine-tuning, if you grant the premises, supports design as a serious explanation. It does not by itself baptize a tradition or replace physics.',
      deeper:
        'Robin Collins and others develop this as a likelihood argument: theism predicts a life-permitting world more naturally than a single throw of indifferent chance. Critics reply with a multiverse or with “we can only observe a world like this.” Both replies can be examined — neither should be assumed as a trump.',
    },
    {
      kind: 'sort',
      id: 'ob-leibniz',
      title: 'Something rather than nothing',
      idea: 'physics maps how the world runs; it does not finish why',
      prompt: 'Keep the careful reading of Leibniz beside cosmology. Toss the rest.',
      context:
        'Leibniz: why is there something rather than nothing? The Big Bang describes an early hot state — not automatically absolute nothing.',
      keepLabel: 'Keep',
      discardLabel: 'Toss',
      tiles: [
        {
          id: 'a',
          text: 'Physics can map how this universe evolves; it does not by itself say why there is a concrete reality with laws.',
          bin: 'keep',
        },
        {
          id: 'b',
          text: 'The Big Bang is a video of God creating, timestamped in Genesis.',
          bin: 'discard',
        },
        {
          id: 'c',
          text: 'A wave function of the universe makes “why anything?” meaningless.',
          bin: 'discard',
        },
        {
          id: 'd',
          text: 'In physics papers, “nothing” already means absolute non-being — a free lunch.',
          bin: 'discard',
        },
      ],
      teachOnWrong:
        'A vacuum is already a structured something. Equations describe a world that is already there.',
      deeper:
        'Fine-tuning and “why anything?” are siblings, not twins. One asks why this world’s numbers permit us; the other asks why there is a world.',
    },
    {
      kind: 'sort',
      id: 'ob-life',
      title: 'The threshold of life',
      idea: 'an unfinished origin story is not a closed file',
      prompt: 'Keep the careful statement. Toss the gaps and the shrugs.',
      context:
        'Cells store specified information and run a coordinated metabolism. Abiogenesis is an open research program — not a closed chapter.',
      keepLabel: 'Keep',
      discardLabel: 'Toss',
      tiles: [
        {
          id: 'a',
          text: '“No complete naturalistic account yet” is not the same as “we demonstrated a miracle.”',
          bin: 'keep',
        },
        {
          id: 'b',
          text: 'Because we cannot assemble a cell in a storm, theism is proven and research is irreverent.',
          bin: 'discard',
        },
        {
          id: 'c',
          text: 'Because research continues, the chemical pathway is finished and the question is closed.',
          bin: 'discard',
        },
        {
          id: 'd',
          text: 'Genesis 1 forbids asking biological questions.',
          bin: 'discard',
        },
      ],
      teachOnWrong:
        'Wonder is rational here. So is more work. “God of the gaps” and “science of the gaps” both tempt us.',
      deeper:
        'A careful theist can say life’s information looks like the work of mind — a clue. A careful skeptic can say clues are not certificates.',
    },
  ],
}
