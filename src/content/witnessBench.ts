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
      kind: 'multiple-choice',
      id: 'wb-early',
      title: 'Why historians call it early',
      prompt:
        'Why do many historians treat 1 Corinthians 15:3–7 as very early tradition rather than a late legend?',
      context:
        'Dating is scholarly judgment, not a photograph. Still, several features cluster in the same direction.',
      choices: [
        {
          id: 'a',
          text: 'Paul (writing ~AD 53–55) says he “received” a formulaic tradition; many date that formula to the first years after the crucifixion.',
          correct: true,
          teach:
            'Yes — with honesty. The letter is mid-first-century. “I received / I delivered” (1 Cor 15:3) is the language of handing on tradition. Aramaic-flavored names (Cephas), the tight structure, and the fact that Paul can assume Corinth already knows it are why a wide range of scholars — not only conservative ones — treat the core as early. “Within a few years” is a common conclusion, not an inerrant timestamp.',
        },
        {
          id: 'b',
          text: 'The creed was composed by a medieval monk and later copied into Paul.',
          correct: false,
          teach:
            'Paul’s letters are among the earliest Christian documents we have. 1 Corinthians is not a medieval insertion. Whatever one concludes about the resurrection, the text itself is first-century.',
        },
        {
          id: 'c',
          text: 'It functions like a lab result: it proves the resurrection the way an experiment proves a chemical reaction.',
          correct: false,
          teach:
            'That overclaims. Early testimony is historically weighty. It is not a repeatable experiment. The honest move is: this is what the first Christians were already proclaiming, close to the events, including named witnesses.',
        },
        {
          id: 'd',
          text: 'Paul invented the list in the second century after the Gospels were finished.',
          correct: false,
          teach:
            'Standard dating places 1 Corinthians before the finished Gospels as we have them. Paul is not looking back from the 100s. He is arguing with a live congregation in the 50s.',
        },
      ],
      deeper:
        'Compare Luke’s preface (Luke 1:1–4): he claims inquiry among “eyewitnesses and servants of the word.” That is a historiographical posture, whether or not one accepts every report.',
    },
    {
      kind: 'match',
      id: 'wb-method',
      title: 'Tools of the ancient historian',
      prompt: 'Match each criterion to what it is actually testing.',
      context:
        'Used in historical Jesus research (and ancient history more broadly). None of these “prove God.” They help ask which reports are harder to dismiss as late invention.',
      pairs: [
        {
          id: 'multi',
          left: 'Multiple attestation',
          right: 'Independent sources carrying the same core',
        },
        {
          id: 'emb',
          left: 'Embarrassment',
          right: 'Details early Christians would be unlikely to invent',
        },
        {
          id: 'early',
          left: 'Early testimony',
          right: 'Closer in time, less room for legend to harden',
        },
        {
          id: 'context',
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
      kind: 'scenario',
      id: 'wb-women',
      title: 'Idle talk',
      scene:
        'The Gospels report that women were first at the empty tomb (Mark 16:1–8; Luke 24:1–11; John 20:1–18). Luke notes that to the apostles “these words seemed to them an idle tale, and they did not believe them” (Luke 24:11). In much of that culture, a woman’s testimony carried less public weight.',
      prompt:
        'Why do many historians treat the women’s discovery as unlikely to be a late, polished invention?',
      choices: [
        {
          id: 'a',
          text: 'An inventor seeking courtroom-style credibility would more likely lead with respected male witnesses.',
          correct: true,
          teach:
            'This is the criterion of embarrassment used carefully. It does not prove the tomb was empty. It raises the cost of the theory that the story was crafted late purely for persuasion. The churches preserved a beginning that, by their own telling, the male disciples dismissed.',
        },
        {
          id: 'b',
          text: 'Women’s names in the story automatically make every detail certain.',
          correct: false,
          teach:
            'Named women (Mary Magdalene and others) are historically interesting — they are not a magic stamp. The argument is about plausibility of invention, not about inerrancy sneaking in through the side door.',
        },
        {
          id: 'c',
          text: 'Luke 24:11 shows the evangelists wanted readers to distrust women.',
          correct: false,
          teach:
            'Luke reports the disciples’ disbelief — and then the narrative vindicates the women’s report. The “idle tale” line is frank about first reactions, not a program for silencing women.',
        },
        {
          id: 'd',
          text: 'Because Tacitus wrote the tomb story in Annals 15.44.',
          correct: false,
          teach:
            'Tacitus (Annals 15.44) mentions Christus executed under Pontius Pilate and a “mischief” that broke out again in Judea and Rome. That is valuable Roman notice of Jesus’ execution and of Christians in the 60s. It is not a tomb narrative. Do not invent citations.',
        },
      ],
      deeper:
        'Read also Josephus, Antiquities 18.63–64 (the Testimonium Flavianum): most scholars think it was later touched by Christian scribes, though many still find a Josephan core about Jesus as a teacher who was condemned under Pilate. Honesty about disputed lines is part of the case, not a threat to it.',
    },
  ],
}
