import type { Area } from '../types'

export const firstGate: Area = {
  id: 'first-gate',
  order: 4,
  title: 'The First Gate',
  shortTitle: 'Gate',
  subtitle: 'Why is there a world at all?',
  blurb:
    'Aristotle walked this road; Aquinas drew the map; the question has not aged out.',
  intro: [
    'The oldest gate in Silver City has no lock — only a line in the stone: Why is there a world at all?',
    'Cosmological arguments do not begin with a vision. They begin with ordinary facts: things change; things might not have been; this universe appears to have a beginning.',
    'If the steps hold, you do not yet have the whole creed. You have a destination with a name in classical theism: a first mover, a necessary being, a cause of what begins. Further attributes take further work. That honesty is strength.',
  ],
  icon: 'gate',
  accent: '#c46b4a',
  challenges: [
    {
      kind: 'sequence',
      id: 'fg-mover',
      title: 'The unmoved mover',
      prompt:
        'Order Aquinas’s First Way as a chain of explanation — not as a timeline of yesterday’s events.',
      context:
        'Thomas Aquinas, Summa Theologiae I, q.2, a.3, drawing on Aristotle’s account of change (Physics VIII; Metaphysics XII). “First” here is explanatory. It is not automatically “a moment long ago.”',
      items: [
        {
          id: 'a',
          text: 'We observe things actually changing — moving from potential to actual.',
        },
        {
          id: 'b',
          text: 'Nothing reduces itself from potential to actual; it is changed by another.',
        },
        {
          id: 'c',
          text: 'A regress of changers cannot, by itself, explain change here and now.',
        },
        {
          id: 'd',
          text: 'There is a first changer not itself changed — the unmoved mover.',
        },
      ],
      teachOnWrong:
        'Do not turn this into “dominoes starting at the Big Bang.” Aquinas is asking what accounts for change in the present. Infinite backlog is not an explanation if every member is still a receiver of change.',
      deeper:
        'Critics ask whether quantum events or a past-eternal cosmos break the chain. Defenders reply that contingent, changing states still need a cause of their actuality. The argument’s nerve is explanation, not a stopwatch.',
    },
    {
      kind: 'build-argument',
      id: 'fg-contingent',
      title: 'What might not have been',
      prompt: 'Assemble a contingency argument in a valid order.',
      context:
        'Related to Aquinas’s Third Way (ST I, q.2, a.3) and Leibniz’s principle of sufficient reason. Contingent means: it exists, but it could have failed to exist.',
      slots: [
        {
          id: 'p1',
          role: 'premise',
          label: 'Premise 1',
          correctCardId: 'exist',
        },
        {
          id: 'p2',
          role: 'premise',
          label: 'Premise 2',
          correctCardId: 'depend',
        },
        {
          id: 'p3',
          role: 'premise',
          label: 'Premise 3',
          correctCardId: 'need',
        },
        {
          id: 'c',
          role: 'conclusion',
          label: 'Conclusion',
          correctCardId: 'ground',
        },
      ],
      cards: [
        {
          id: 'exist',
          text: 'Contingent things exist — they are real, and they might not have been.',
        },
        {
          id: 'depend',
          text: 'A contingent thing exists because of another; it does not contain the reason for its existence in itself.',
        },
        {
          id: 'need',
          text: 'A series of only contingent things never explains why anything exists rather than nothing.',
        },
        {
          id: 'ground',
          text: 'Therefore there is a necessary reality whose existence is not derived — the world’s ground, which classical theism names God.',
        },
        {
          id: 'weather',
          text: 'Everything is obviously necessary, including last Tuesday’s weather.',
          distractor: true,
        },
        {
          id: 'trinity',
          text: 'Contingency, by itself, proves the doctrine of the Trinity.',
          distractor: true,
        },
      ],
      teachOnWrong:
        'Leave the joke cards in the bank. The valid chain moves from contingent beings, through the failure of a purely contingent series, to a necessary ground — not to every later Christian doctrine at once.',
      deeper:
        'Atheist replies include: the universe itself is necessary; or “brute fact” is acceptable; or quantum vacua suffice. Each reply relocates necessity or else gives up explanation. That is a real debate — not a slogan fight.',
    },
    {
      kind: 'multiple-choice',
      id: 'fg-kalam',
      title: 'Whatever begins',
      prompt:
        'The kalām cosmological argument is often put: whatever begins to exist has a cause; the universe began to exist; therefore the universe has a cause. What is the most careful reading?',
      context:
        'The form is associated with medieval Islamic kalām (notably al-Ghazālī) and, in modern analytic philosophy, with William Lane Craig. Premise 2 is argued both philosophically (against an infinite past) and scientifically (Big Bang cosmology).',
      choices: [
        {
          id: 'a',
          text: 'If both premises are true, you get a cause of the universe’s beginning. Whether that cause is personal, good, or the God of Abraham takes further argument — and “began” is itself debated.',
          correct: true,
          teach:
            'Yes. Craig argues the cause is personal because only an agent could freely originate a temporal world. That is an extra step, not smuggled inside “has a cause.” Meanwhile, Big Bang cosmology describes the beginning of this spacetime; it is not automatically “from metaphysical nothing.” Opponents challenge both the causal premise and the beginning premise. Name the steps. Do not flatten them.',
        },
        {
          id: 'b',
          text: 'The argument, if mentioned, automatically proves every line of the Nicene Creed.',
          correct: false,
          teach:
            'No cosmological argument, however sound, is already the Trinity, the incarnation, or the empty tomb. Those are further claims with their own warrants — some of which you met on the Witness Bench.',
        },
        {
          id: 'c',
          text: 'Because some popular books say “nothing,” the second premise is beyond dispute.',
          correct: false,
          teach:
            'Popular wording outruns the physics. A beginning of this universe is a serious position. It is not a fact no competent physicist may question. A careful case does not need that exaggeration.',
        },
        {
          id: 'd',
          text: 'Aristotle already used this exact three-line kalām syllogism in the Physics.',
          correct: false,
          teach:
            'Aristotle argued for an unmoved mover and, in some readings, an eternal cosmos. The kalām “whatever begins to exist” form is later. Honor the genealogy; do not collapse the traditions.',
        },
      ],
      deeper:
        'Useful practice: write the argument, then write the best objection you know, then write the reply. That is how these arguments have actually lived — from Athens to Paris to the present.',
    },
    {
      kind: 'scenario',
      id: 'fg-limits',
      title: 'What the gate opens',
      scene:
        'Suppose, for the sake of the exercise, that a cosmological argument succeeds: there is a first cause or a necessary being. A traveler at the gate says, “Then I already know the whole of Christian faith.” Another says, “Then the argument was worthless, because it did not preach the sermon on the mount.”',
      prompt: 'What does a successful cosmological argument actually give you?',
      choices: [
        {
          id: 'a',
          text: 'A metaphysical destination — a first cause or necessary ground. Intellect, will, goodness, and the gospel are further steps, not failures of the first one.',
          correct: true,
          teach:
            'Yes. Aquinas himself does not stop at q.2. He argues onward about simplicity, goodness, intellect, and will. The New Testament claims are historical as well as philosophical. Layers are not leaks.',
        },
        {
          id: 'b',
          text: 'Nothing useful, because only a full systematic theology counts as an argument.',
          correct: false,
          teach:
            'That all-or-nothing habit sinks both belief and unbelief. Partial conclusions are how reasoning works. “There is a necessary ground” would already be an enormous thing to know.',
        },
        {
          id: 'c',
          text: 'A complete biography of God, including every future event.',
          correct: false,
          teach:
            'No classical proponent claims that. The arguments are about existence and certain attributes, not about omniscient travel brochures.',
        },
        {
          id: 'd',
          text: 'Proof that inquiry should now stop, because mystery is a vice.',
          correct: false,
          teach:
            'In Christian thought, God is not less mysterious after the arguments — God is the reason the world is intelligible at all. The gate opens onto a longer trail.',
        },
      ],
      deeper:
        'Pascal wrote of the God of Abraham, not “the God of the philosophers,” as a warning against a thin deity. The warning only works if the philosophers’ question is real. Silver City holds both: the gate and the lookout.',
    },
  ],
}
