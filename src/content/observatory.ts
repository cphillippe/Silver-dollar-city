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
      prompt:
        'Match each feature of the cosmos to the standard fine-tuning observation about it.',
      context:
        '“Fine-tuning” here means: small changes to certain numbers yield a sterile world. This is widely discussed in cosmology (e.g. work popularized by Martin Rees, Luke Barnes, and others). It is a claim about sensitivity — not yet a proof of a Designer.',
      pairs: [
        {
          id: 'lambda',
          left: 'Cosmological constant',
          right: 'Much larger: expansion too fierce for galaxies; much more negative: recollapse',
        },
        {
          id: 'strong',
          left: 'Strong nuclear force',
          right: 'Slight shift: familiar chemistry of hydrogen and heavier elements fails',
        },
        {
          id: 'entropy',
          left: 'Early-universe entropy',
          right: 'Penrose: the initial low-entropy state is extravagantly special',
        },
        {
          id: 'ratio',
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
      kind: 'multiple-choice',
      id: 'ob-leibniz',
      title: 'Something rather than nothing',
      prompt:
        'Leibniz asked why there is something rather than nothing. What is the most careful way to locate that question beside modern cosmology?',
      context:
        'Gottfried Wilhelm Leibniz, “On the Ultimate Origination of Things” and related essays. The Big Bang model describes an early hot, dense state of this universe — it is not automatically a story about absolute nothing.',
      choices: [
        {
          id: 'a',
          text: 'Physics can describe how this universe evolves, and perhaps its earliest describable state; it does not by itself say why there is a concrete reality with laws at all.',
          correct: true,
          teach:
            'Yes. Cosmology is not metaphysics. “Nothing” in some physics papers means a quantum vacuum, which is already a structured something. Leibniz’s question survives every successful equation, because equations describe a world that is already there to be described.',
        },
        {
          id: 'b',
          text: 'The Big Bang is a video recording of God creating, timestamped in Genesis.',
          correct: false,
          teach:
            'That confuses a scientific model with a theophany. Many theists see the beginning of this spacetime as consonant with creation. Consonance is not the same as a frame-by-frame proof.',
        },
        {
          id: 'c',
          text: 'Once we write a wave function of the universe, the question “why anything?” becomes meaningless.',
          correct: false,
          teach:
            'A wave function still assumes formalism, laws, and a reality they apply to. Declaring the question meaningless is a philosophical move — and it needs an argument, not a sigh.',
        },
        {
          id: 'd',
          text: '“Nothing” in every physics paper already means absolute non-being, so the universe is explained as a free lunch.',
          correct: false,
          teach:
            'Popular books sometimes say this. In practice the “nothing” is usually a physical state (vacuum, quantum fields, laws). A free lunch still needs a kitchen.',
        },
      ],
      deeper:
        'The cosmological question and the fine-tuning question are siblings, not twins. One asks why there is a world; the other asks why this world’s numbers permit us to sit here and ask.',
    },
    {
      kind: 'scenario',
      id: 'ob-life',
      title: 'The threshold of life',
      scene:
        'Cells store specified information in nucleic acids, fold functional proteins, and run a coordinated metabolism. Abiogenesis — life from non-life — is an active research program, not a closed chapter. Some theists argue that information and functional complexity look like the work of mind. Many scientists expect a natural pathway that is not yet known.',
      prompt: 'Which statement is the most careful?',
      choices: [
        {
          id: 'a',
          text: 'We should distinguish “no complete naturalistic account yet” from “we have demonstrated a miracle.” The open problems are real; overclaiming in either direction is a mistake.',
          correct: true,
          teach:
            'Yes. Honesty is part of the case for God, not a concession that empties it. The origin of life is a place where wonder is rational. It is also a place where “God of the gaps” and “science of the gaps” both tempt us.',
        },
        {
          id: 'b',
          text: 'Because we cannot yet assemble a cell from scratch in a storm, theism is proven and further research is irreverent.',
          correct: false,
          teach:
            'That is a gaps argument dressed as piety. Christian history includes people who expected the world to be intelligible because it is created. Curiosity is not the enemy.',
        },
        {
          id: 'c',
          text: 'Because research continues, we already know a full chemical pathway and the philosophical question is closed.',
          correct: false,
          teach:
            'Continuing research is not the same as a finished explanation. Hypotheses about RNA worlds, metabolism-first models, and hydrothermal vents are serious — and still incomplete. Do not pretend otherwise.',
        },
        {
          id: 'd',
          text: 'Genesis 1 forbids asking biological questions at all.',
          correct: false,
          teach:
            'Genesis 1 is a theological account of God giving an ordered, good world. It is not a lab protocol, and it does not command ignorance of cells.',
        },
      ],
      deeper:
        'A careful theist can say: life’s informational structure is the sort of thing minds produce; that is a clue. A careful skeptic can say: clues are not certificates. The trail does not end here — it climbs toward cause itself.',
    },
  ],
}
