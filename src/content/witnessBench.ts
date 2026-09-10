import type { Area } from '../types'

export const witnessBench: Area = {
  id: 'witness-bench',
  order: 2,
  title: 'The Witness Bench',
  shortTitle: 'Bench',
  subtitle: 'What can we know about events we did not see?',
  blurb:
    'Historians cannot rerun the past. They weigh sources, time, and motive.',
  intro: [
    'The old courthouse still faces the square. On the bench, the question is not “Can I feel this?” but “What kind of testimony is this, and what would a fair historian do with it?”',
    'Christian faith is not only inward. It makes a public claim: Jesus of Nazareth died, was buried, and was reported alive by people who said they had seen him.',
    'These challenges teach method as much as conclusion. Early, multiple, and costly testimony is not a laboratory proof — it is the kind of evidence history actually has.',
  ],
  icon: 'scroll',
  accent: '#c4a35a',
  challenges: [
    {
      kind: 'sequence',
      id: 'wb-creed',
      title: 'What Paul received',
      idea: 'died, buried, raised, appeared — in that order',
      prompt:
        'Order the core of the tradition Paul says he “delivered” and “received.”',
      context:
        '1 Corinthians 15:3–5. Paul is writing to a church he founded, likely in the mid-50s AD. He presents this not as a new idea but as a received formula “of first importance.”',
      items: [
        {
          id: 'a',
          text: 'Christ died for our sins according to the Scriptures.',
        },
        {
          id: 'b',
          text: 'He was buried.',
        },
        {
          id: 'c',
          text: 'He was raised on the third day according to the Scriptures.',
        },
        {
          id: 'd',
          text: 'He appeared to Cephas, then to the Twelve.',
        },
      ],
      teachOnWrong:
        'Paul’s wording is tightly patterned: death, burial, raising, appearances (1 Cor 15:3–5). Burial underlines that death was real; appearances underlines that “raised” is not only a metaphor.',
      deeper:
        'Verses 6–8 widen the circle: more than five hundred, James, “all the apostles,” and last of all Paul. A creed is not a video. It is a public, early summary of what the churches were already saying.',
    },
    {
      kind: 'sort',
      id: 'wb-early',
      title: 'Why historians call it early',
      idea: 'the creed is early testimony, not a medieval insert',
      prompt: 'Keep the careful historical claim. Toss the overclaims.',
      context:
        '1 Corinthians 15:3–5. Paul “received” and “delivered” the early core — died, buried, raised, appeared.',
      keepLabel: 'Keep',
      discardLabel: 'Toss',
      tiles: [
        {
          id: 'a',
          text: 'Paul “received” and “delivered” the early core: died, buried, raised, appeared (1 Cor 15:3–5).',
          bin: 'keep',
        },
        {
          id: 'b',
          text: 'A medieval monk wrote the creed and copied it into Paul.',
          bin: 'discard',
        },
        {
          id: 'c',
          text: 'The creed is a lab result that proves the resurrection like a chemical reaction.',
          bin: 'discard',
        },
        {
          id: 'd',
          text: 'Paul invented the list in the second century after the Gospels.',
          bin: 'discard',
        },
      ],
      teachOnWrong:
        'The letter is mid-first-century. “I received / I delivered” is tradition language — weighty testimony, not a lab rerun.',
      deeper:
        'Compare Luke 1:1–4: a first-century writer claiming inquiry among eyewitnesses. That posture can be tested. It should not be sneered out of court in advance.',
    },
    {
      kind: 'match',
      id: 'wb-method',
      title: 'Tools of the ancient historian',
      idea: 'historians weigh sources; they cannot rerun the past',
      prompt: 'Match each criterion to what it is actually testing.',
      context:
        'Used in historical Jesus research (and ancient history more broadly). These tools show which reports are hard to dismiss as late invention — early public testimony, not a lab rerun.',
      pairs: [
        {
          id: 'multi',
          gem: 'star',
          scene: 'witnesses',
          left: 'Multiple attestation',
          right: 'Independent sources carrying the same core',
        },
        {
          id: 'emb',
          gem: 'coin',
          scene: 'reluctant',
          left: 'Embarrassment',
          right: 'Details early Christians would be unlikely to invent',
        },
        {
          id: 'early',
          gem: 'lamp',
          scene: 'clock',
          left: 'Early testimony',
          right: 'Closer in time, less room for legend to harden',
        },
        {
          id: 'context',
          gem: 'tree',
          scene: 'judea',
          left: 'Contextual credibility',
          right: 'Fits the known first-century Jewish and Roman world',
        },
      ],
      teachOnWrong:
        'Each tool answers a different question: how many streams, how awkward, how soon, how at-home in the period. Try pairing again.',
      deeper:
        'These criteria can be overused. They do not replace reading texts as wholes. They do resist a lazy story: “Someone, somewhere, made everything up much later.”',
    },
    {
      kind: 'sort',
      id: 'wb-women',
      title: 'Idle talk',
      idea: 'women as first witnesses is an awkward detail to invent',
      prompt: 'Keep the careful historical move. Toss the overclaims.',
      context:
        'Women are first at the tomb (Mark 16:1–8; Luke 24:1–11; John 20). Luke 24:11: the report sounded like “idle talk.”',
      keepLabel: 'Keep',
      discardLabel: 'Toss',
      tiles: [
        {
          id: 'a',
          text: 'An inventor hunting courtroom credibility would more likely lead with respected men.',
          bin: 'keep',
        },
        {
          id: 'b',
          text: 'Named women automatically make every detail certain.',
          bin: 'discard',
        },
        {
          id: 'c',
          text: 'Luke 24:11 means the evangelists wanted readers to distrust women.',
          bin: 'discard',
        },
        {
          id: 'd',
          text: 'Tacitus wrote the tomb story in Annals 15.44.',
          bin: 'discard',
        },
      ],
      teachOnWrong:
        'This is a costly detail that counts for the report’s honesty. Tacitus 15.44 notes the execution, not the tomb. Do not invent citations.',
      deeper:
        'Josephus, Antiquities 18.63–64, is partly disputed because of later Christian touches. Honesty about that dispute belongs in the dossier.',
    },
  ],
}
