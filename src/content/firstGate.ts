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
      kind: 'sort',
      id: 'fg-kalam',
      title: 'Whatever begins',
      prompt: 'Keep the careful reading of the kalām form. Toss the flattenings.',
      context:
        'Whatever begins to exist has a cause; the universe began to exist; therefore it has a cause. Medieval kalām (al-Ghazālī); modern analytic form (Craig).',
      keepLabel: 'Keep',
      discardLabel: 'Toss',
      tiles: [
        {
          id: 'a',
          text: 'If both premises hold, you get a cause of the beginning — personhood and the gospel take further steps.',
          bin: 'keep',
        },
        {
          id: 'b',
          text: 'Mentioning the argument proves every line of the Nicene Creed.',
          bin: 'discard',
        },
        {
          id: 'c',
          text: 'Popular books saying “nothing” make premise 2 beyond dispute.',
          bin: 'discard',
        },
        {
          id: 'd',
          text: 'Aristotle already used this exact three-line kalām syllogism.',
          bin: 'discard',
        },
      ],
      teachOnWrong:
        'Name the steps. “Began” is debated. Aristotle’s unmoved mover is a different road. Do not collapse the traditions.',
      deeper:
        'Write the argument, then the best objection, then the reply. That is how these arguments have actually lived.',
    },
    {
      kind: 'sort',
      id: 'fg-limits',
      title: 'What the gate opens',
      prompt: 'If a cosmological argument succeeds, what do you actually have?',
      context:
        'Suppose there is a first cause or necessary being. One traveler says the whole creed is finished. Another says the argument was worthless because it did not preach the sermon on the mount.',
      keepLabel: 'Keep',
      discardLabel: 'Toss',
      tiles: [
        {
          id: 'a',
          text: 'A metaphysical destination. Intellect, goodness, and the gospel are further steps — not leaks.',
          bin: 'keep',
        },
        {
          id: 'b',
          text: 'Nothing useful, because only a full systematic theology counts.',
          bin: 'discard',
        },
        {
          id: 'c',
          text: 'A complete biography of God, including every future event.',
          bin: 'discard',
        },
        {
          id: 'd',
          text: 'Proof that inquiry should stop, because mystery is a vice.',
          bin: 'discard',
        },
      ],
      teachOnWrong:
        'Partial conclusions are how reasoning works. Aquinas does not stop at q.2. Layers are not leaks.',
      deeper:
        'Pascal’s warning about the God of the philosophers is a warning against stopping — not a command to skip the philosophers.',
    },
  ],
}
