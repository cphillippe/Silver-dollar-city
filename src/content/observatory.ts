import type { Area } from '../types'

export const observatory: Area = {
  id: 'observatory',
  order: 3,
  title: 'Sky Watch',
  shortTitle: 'Sky',
  subtitle: 'A sky that did not have to be this way',
  blurb:
    'Science maps how the world runs. It does not forbid the question why.',
  intro: [
    'Above the ridge a small observatory points at winter stars. The question here is not “Does a lab experiment prove God?” That would confuse the tools.',
    'The question is: what kind of universe is this? Why are its laws hospitable to life? Why is there a concrete world with laws at all?',
    'Fine-tuning, origins, and “something rather than nothing” begin from public facts and make a case for God. Hold the claim. Deploy it. The sky is not a shrug.',
  ],
  icon: 'star',
  accent: '#7f9ec7',
  challenges: [
    {
      kind: 'match',
      id: 'ob-tuning',
      title: 'Narrow ranges',
      idea: 'the universe is finely tuned for life — that fit points to a Designer',
      prompt:
        'Tap a picture, then the mark that belongs. Two choices at a time.',
      context:
        'The universe is finely tuned for life — that fit points to a Designer. Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not. Necessity, chance (often a multiverse — asserted to cancel the surprise — no evidence), or design: the fit still points to a Designer.',
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
          right:
            'The initial low-entropy state is extravagantly special — an initial condition, not another force dial',
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
        'Ask what breaks if the number moves. Those extravagantly narrow, habitable ranges are the mark of a Designer.',
      deeper:
        'Design predicts this cosmos: cosmological constant, nuclear binding, a low-entropy start, gravity against electromagnetism — extravagantly narrow, habitable. That fit points to a Designer.',
    },
    {
      kind: 'build-argument',
      id: 'ob-design',
      title: 'A habitable cosmos',
      idea: 'fine-tuning is best explained by a mind that intended a habitable world',
      prompt:
        'Place the next stone. Two choices. Leave the overclaims.',
      context:
        'Fine-tuning is best explained by a mind that intended a habitable world. Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not. Necessity, chance (often a multiverse — asserted to cancel the surprise — no evidence), or design: hold the Designer.',
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
          text: 'Several physical dials appear to have a life-permitting range that is extraordinarily narrow among conceivable values.',
        },
        {
          id: 'surprise',
          text: 'That narrowness is surprising if the dials are a brute accident with no further explanation.',
        },
        {
          id: 'expect',
          text: 'A mind that intended a habitable cosmos would lead us to expect such dials.',
        },
        {
          id: 'live',
          text: 'Therefore the best explanation is a Designer who intended a habitable cosmos.',
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
        'Leave the two overclaims. The narrow habitable fit lands a Designer, not which gospel.',
      deeper:
        'A Designer who wants observers predicts this habitable fit. The narrow ranges are the evidence. Hold the Designer.',
    },
    {
      kind: 'sort',
      id: 'ob-leibniz',
      title: 'Something rather than nothing',
      idea: 'physics maps how the world runs; it does not finish why',
      prompt: 'Keep the careful Leibniz reading. Toss the rest — a wrong toss bounces back.',
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
      idea: 'life’s specified information is a mark of mind',
      prompt: 'Keep the careful statement. Toss the gaps — a wrong toss bounces back.',
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
        'Life’s information looks like the work of mind. Wonder is rational. So is more work. Do not trade the mark for a shrug.',
    },
  ],
}
