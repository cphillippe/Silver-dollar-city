import type { Area } from '../types'

export const firstGate: Area = {
  id: 'first-gate',
  order: 4,
  title: 'Why Gate',
  shortTitle: 'Why',
  subtitle: 'Why is there a world at all?',
  blurb:
    'Aristotle walked this road; Aquinas drew the map; the question has not aged out.',
  intro: [
    'The oldest gate in Silver City has no lock — only a line in the stone: Why is there a world at all?',
    'Before the first-mover walk, Ansel names what you already trust: order, reason, and ought. Those are not free-floating. Finite nature cannot be their ground. The living God is.',
    'Cosmological arguments do not begin with a vision. They begin with ordinary facts: things change; things might not have been; this universe appears to have a beginning.',
    'If the steps hold, you do not yet have the whole creed. You have a destination with a name in classical theism: a first mover, a necessary being, a cause of what begins. Further attributes take further work. That honesty is strength.',
  ],
  icon: 'gate',
  accent: '#c46b4a',
  challenges: [
    {
      kind: 'sort',
      id: 'fg-order',
      title: 'We already trust order',
      idea: 'you already trust that the world holds together in Christ',
      prompt: 'Keep the lived trust that the world holds together. Toss the lucky pile that will not name Christ.',
      context:
        'Colossians 1:16–17: all things were created through Christ and in him they hold together. You already live this trust every time a clock, a road, or a promise still means something.',
      keepLabel: 'Keep',
      discardLabel: 'Toss',
      tiles: [
        {
          id: 'a',
          text: 'You already live like the world hangs together; Colossians names Christ as the One who holds all things.',
          bin: 'keep',
        },
        {
          id: 'b',
          text: 'The world is a lucky pile with no holder.',
          bin: 'discard',
        },
        {
          id: 'c',
          text: 'You should pretend you do not trust clocks, roads, or promises.',
          bin: 'discard',
        },
        {
          id: 'd',
          text: 'This card must not name Christ.',
          bin: 'discard',
        },
      ],
      teachOnWrong:
        'You already trust order in ordinary life. Colossians names Christ as the One through whom all things were made and in whom they hold together. Do not leave the holder unnamed.',
      deeper:
        'Augustine reads creation as given order (City of God XI). Aquinas treats God as the cause of the world’s being and order (ST I, q.44). The first foundation beat is this lived trust, with Christ named.',
    },
    {
      kind: 'sequence',
      id: 'fg-reason',
      title: 'Trust needs a ground',
      idea: 'the reason you already trust needs a real ground',
      prompt: 'Order the walk: lived trust in reason, then the need for a ground, then the Light Scripture names.',
      context:
        'John 1:1–9 names the Word as the true light. Romans 1:19–20 says what can be known of God is plain in what is made. Reason is not a trick hanging in midair.',
      items: [
        {
          id: 'a',
          text: 'You already trust your mind enough to argue, count, and ask why.',
        },
        {
          id: 'b',
          text: 'That trust is not a trick hanging in midair — it needs a ground.',
        },
        {
          id: 'c',
          text: 'John names the Word as the true light; Romans says the made world makes God knowable.',
        },
        {
          id: 'd',
          text: 'So reason already leans on a real ground — not a shrug.',
        },
      ],
      teachOnWrong:
        'Do not leave reason hanging in midair. John names the Word as true light. Romans says the made world makes God knowable. That is a ground, not a shrug.',
      deeper:
        'Augustine’s illumination (De Magistro; Confessions VII) treats our seeing of truth as participation in that Light. Aquinas: the intellect is measured by being, and being is from God.',
    },
    {
      kind: 'sort',
      id: 'fg-ought',
      title: 'Nature alone is not enough',
      idea: 'finite nature cannot ground the ought you already trust',
      prompt: 'Keep the line that finite nature cannot ground ought. Toss rocks-as-law and ought-as-mood.',
      context:
        'Romans 2:14–15: the nations show the work of the law written on their hearts. This is Ansel’s gate step — not Hope’s later ridge that duty is more than taste. Nature as a pile of facts is not enough.',
      keepLabel: 'Keep',
      discardLabel: 'Toss',
      tiles: [
        {
          id: 'a',
          text: 'Finite nature cannot write the ought you already trust; Romans says the law is on the heart.',
          bin: 'keep',
        },
        {
          id: 'b',
          text: 'Rocks and weather invent real right and wrong.',
          bin: 'discard',
        },
        {
          id: 'c',
          text: 'Drop every ought — it was only a taste.',
          bin: 'discard',
        },
        {
          id: 'd',
          text: 'A changing, limited world is already enough of a ground.',
          bin: 'discard',
        },
      ],
      teachOnWrong:
        'You already trust ought. A limited world cannot write that law. Romans says it is already on the heart. Nature as a pile of facts is not enough.',
      deeper:
        'Augustine locates the eternal law in God. Aquinas calls natural law the rational creature’s share in the eternal law (ST I-II, q.91). Finite nature cannot be the source of that share.',
    },
    {
      kind: 'sequence',
      id: 'fg-ground',
      title: 'God as living foundation',
      idea: 'the living God is the foundation of order, reason, and ought',
      prompt: 'Order the walk to the living God: trusts, nature’s limit, then Acts 17’s foundation.',
      context:
        'Acts 17:24–28: the God who made the world gives life and breath; in him we live and move and have our being. This is not a dead first brick, and it is not the later first-mover or kalām walk.',
      items: [
        {
          id: 'a',
          text: 'Order, reason, and ought are not free-floating.',
        },
        {
          id: 'b',
          text: 'Finite nature cannot be their ground.',
        },
        {
          id: 'c',
          text: 'Paul at Athens names the God who made the world and gives life.',
        },
        {
          id: 'd',
          text: 'In him we live and move and have our being — the living foundation.',
        },
      ],
      teachOnWrong:
        'Do not stop at a dead first brick. Paul names the living God in whom we live and move and have our being. That is the foundation of order, reason, and ought.',
      deeper:
        'Augustine: our heart is restless until it rests in God. Aquinas: God is ipsum esse subsistens — not a first brick in the pile, the living source of being.',
    },
    {
      kind: 'sequence',
      id: 'fg-mover',
      title: 'The unmoved mover',
      idea: 'change here and now still asks for a first changer',
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
      idea: 'what might not have been needs a ground',
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
      idea: 'whatever begins still asks for a cause',
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
      idea: 'a first cause is not yet the whole creed',
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
