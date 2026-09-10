import type { Challenge } from '../types.ts'
import { hashString } from '../lib/dates.ts'

export interface DailyPuzzle {
  id: string
  teaser: string
  districtFlavor: string
  /** First mornings prefer these — picture cards, short true lines. */
  early?: boolean
  challenge: Challenge
}

/**
 * Short morning walks (~60–90 seconds). Same local calendar day
 * always maps to the same puzzle (seeded by YYYY-MM-DD).
 */
export const DAILY_POOL: DailyPuzzle[] = [
  {
    id: 'trail-gems',
    early: true,
    teaser: 'Juniper set three gems on the east-porch rail.',
    districtFlavor: 'Parable Hollow · porch gems',
    challenge: {
      kind: 'match',
      id: 'daily-gems',
      title: 'Porch gems',
      idea: 'Jesus taught with pictures you can hold',
      prompt: 'Match each picture to the short claim.',
      context: 'The Teacher spoke in pictures so the truth could walk around inside you.',
      pairs: [
        { id: 'lamp', gem: 'lamp', left: 'Lamp', right: 'A light is meant to be seen' },
        { id: 'seed', gem: 'seed', left: 'Seed', right: 'The same word meets different hearts' },
        { id: 'cup', gem: 'cup', left: 'Cup', right: 'Poured for many — gift, not wage' },
      ],
      teachOnWrong: 'Each gem is a short true claim. Snap the picture to its sentence.',
      deeper:
        'Jesus taught with lamps, seed, and a cup. The cup of the new covenant is poured for many (Matthew 26:28; Luke 22:20) — gift, not wage.',
    },
  },
  {
    id: 'trail-lantern',
    early: true,
    teaser: 'A lantern is already lit on the east porch.',
    districtFlavor: 'Parable Hollow · a small lamp',
    challenge: {
      kind: 'sequence',
      id: 'daily-lantern',
      title: 'The porch lamp',
      idea: 'a city on a hill is meant to be seen',
      prompt: 'A neighbor leaves a lamp on the porch. Put the picture in order.',
      context: 'Matthew 5:14–16. Jesus used ordinary light to talk about a life that is seen.',
      items: [
        { id: 'a', gem: 'star', text: 'Evening comes. The street grows dim.' },
        { id: 'b', gem: 'lamp', text: 'Someone sets a lamp where it can be seen.' },
        { id: 'c', gem: 'heart', text: 'A walker finds the stoop.' },
      ],
      teachOnWrong:
        'The claim is not that we become the sun — only that we do not hide what we have received. Try the order again.',
      deeper:
        '“You are the light of the world. A city set on a hill cannot be hidden.” The picture is public without being proud.',
    },
  },
  {
    id: 'trail-seed',
    early: true,
    teaser: 'Someone has been turning soil behind the chapel.',
    districtFlavor: 'Parable Hollow · a handful of seed',
    challenge: {
      kind: 'sort',
      id: 'daily-seed',
      title: 'A handful of seed',
      idea: 'the same word meets very different hearts',
      prompt: 'Which lines belong with Jesus’ picture of seed and soil?',
      context: 'Mark 4:1–9. The parable does not flatter every listener. Some seed is lost.',
      keepLabel: 'Fits the parable',
      discardLabel: 'Set aside',
      tiles: [
        {
          id: 'a',
          gem: 'seed',
          text: 'Some seed is eaten before it roots.',
          bin: 'keep',
          why: 'The parable names loss — not every field is the same.',
        },
        {
          id: 'b',
          gem: 'tree',
          text: 'Good soil hears and holds the word.',
          bin: 'keep',
          why: 'Hearing that holds is the invitation — not a guaranteed harvest.',
        },
        { id: 'c', gem: 'coin', text: 'Every field is guaranteed a harvest.', bin: 'discard' },
        {
          id: 'd',
          gem: 'star',
          text: 'Shallow ground withers under heat.',
          bin: 'keep',
          why: 'Jesus names withering in the same breath as hearing.',
        },
      ],
      teachOnWrong:
        'Jesus names loss and hearing in the same breath. The invitation is still to hear — not a promise that every soil is the same.',
      deeper: '“He who has ears to hear, let him hear.” The story asks for a kind of soil, not a slogan.',
    },
  },
  {
    id: 'trail-names',
    teaser: 'The bench ledger has two new names in the margin.',
    districtFlavor: 'The Witness Bench · names that stay',
    challenge: {
      kind: 'match',
      id: 'daily-names',
      title: 'Names that stay',
      idea: 'the resurrection claim rests on named witnesses',
      prompt: 'Match the person to the kind of witness they left.',
      context:
        '1 Corinthians 15:5–6. The New Testament does not rest on one voice. It stacks named people.',
      pairs: [
        { id: 'cephas', gem: 'heart', scene: 'first', left: 'Cephas (Peter)', right: 'Named first in Paul’s list' },
        { id: 'twelve', gem: 'star', scene: 'twelve', left: 'The Twelve', right: 'The gathered apprentices' },
        { id: 'crowd', gem: 'tree', scene: 'crowd', left: 'More than five hundred', right: 'A crowd, many still living then' },
      ],
      teachOnWrong: 'Paul is listing appearances, not inventing titles. Look at who is named, then snap again.',
      deeper:
        'He appeared to Cephas, then to the twelve. Then he appeared to more than five hundred brothers at one time.',
    },
  },
  {
    id: 'trail-creed',
    teaser: 'A folded card from an old church bulletin sits on the rail.',
    districtFlavor: 'The Witness Bench · an early creed',
    challenge: {
      kind: 'sequence',
      id: 'daily-creed',
      title: 'Older than the letter',
      idea: 'the first church already said he died, was buried, and was raised',
      prompt: 'Scholars often date this creed earlier than the letter that quotes it. Order the steps.',
      context: '1 Corinthians 15:3–4. If the creed is early, the claim is close to the event it names.',
      items: [
        { id: 'a', text: 'Jesus is executed and buried.' },
        { id: 'b', text: 'The first believers pass a short creed.' },
        { id: 'c', text: 'Paul quotes that creed in a letter to Corinth.' },
      ],
      teachOnWrong:
        'Paul is handing on something he received. The creed sits between the event and the letter. Try the chain again.',
      deeper: 'Christ died… he was buried… he was raised on the third day. Burial and raising are both named.',
    },
  },
  {
    id: 'trail-stars',
    teaser: 'The observatory dome is cracked just enough for Orion.',
    districtFlavor: 'The Observatory · night air',
    challenge: {
      kind: 'sort',
      id: 'daily-stars',
      title: 'Night air',
      idea: 'the heavens already speak of a Maker',
      prompt: 'Which notes belong in a careful night of looking?',
      context: 'Psalm 19:1–4; Romans 1:20. Fine-tuning fits that voice.',
      keepLabel: 'Keep',
      discardLabel: 'Set aside',
      tiles: [
        {
          id: 'a',
          text: 'The heavens already speak of a Maker.',
          bin: 'keep',
          why: 'Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.',
        },
        {
          id: 'b',
          text: 'Fine-tuning fits the voice the heavens already speak.',
          bin: 'keep',
          why: 'A gift-shaped beauty is how the heavens declare a Giver — Psalm 19, not a shrug.',
        },
        { id: 'c', text: 'A psalm replaces a telescope.', bin: 'discard' },
        {
          id: 'd',
          text: 'The sky is worth looking at slowly.',
          bin: 'keep',
          why: 'Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.',
        },
      ],
      teachOnWrong:
        'Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain. Keep that voice; toss the false choice.',
      deeper: 'The heavens declare the glory of God, and the sky above proclaims his handiwork.',
    },
  },
  {
    id: 'trail-life',
    teaser: 'A biologist left a note under the eyepiece: “still not cheap.”',
    districtFlavor: 'The Observatory · living cells',
    challenge: {
      kind: 'match',
      id: 'daily-life',
      title: 'Not cheap',
      idea: 'living cells are not a cheap accident',
      prompt: 'Pair each observation with the honest next sentence.',
      context:
        'Chemistry is real work. “It just happened” is not the last word. Life, place, and mind look given.',
      pairs: [
        { id: 'cells', gem: 'seed', scene: 'cells', left: 'Cells copy information', right: 'Copying is not a small trick' },
        { id: 'band', gem: 'tree', scene: 'band', left: 'Earth sits in a habitable band', right: 'A narrow kindness of place' },
        { id: 'science', gem: 'lamp', scene: 'mindsky', left: 'We can do science at all', right: 'A mind that fits a cosmos' },
      ],
      teachOnWrong: 'Each pair names a mark of a Maker. Snap the observation to the sentence that holds.',
      deeper:
        'Acts 17:24–25: the God who made the world… gives to all mankind life and breath and everything.',
    },
  },
  {
    id: 'trail-scroll',
    teaser: 'The archive clerk set out one short Hebrew line.',
    districtFlavor: 'The First Gate · a copied line',
    challenge: {
      kind: 'sequence',
      id: 'daily-scroll',
      title: 'A copied line',
      idea: 'the Bible we hold arrived through a river of copies',
      prompt: 'How does a line travel from an ancient hand to yours?',
      context: 'We do not hold the first ink. We hold a river of copies.',
      items: [
        { id: 'a', text: 'A scribe copies a scroll by hand.' },
        { id: 'b', text: 'Later copies are compared when they differ.' },
        { id: 'c', text: 'A modern page prints a recovered text.' },
      ],
      teachOnWrong:
        'Transmission is a river, not a single page falling from the sky. Order the hands, then the comparison, then the print.',
      deeper: 'Isaiah 40:8: the grass withers, the flower fades, but the word of our God will stand forever.',
    },
  },
  {
    id: 'trail-isaiah',
    teaser: 'Someone underlined “with his wounds” in a visitor Bible.',
    districtFlavor: 'The First Gate · a hard poem',
    challenge: {
      kind: 'sort',
      id: 'daily-isaiah',
      title: 'A hard poem',
      idea: 'Isaiah 53’s Servant is the Jesus the church confesses',
      prompt: 'Which lines belong with Isaiah 53’s servant?',
      context:
        'Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.',
      keepLabel: 'In the poem',
      discardLabel: 'Not the claim',
      tiles: [
        {
          id: 'a',
          text: 'The servant suffers for others.',
          bin: 'keep',
          why: 'Isaiah 53’s servant is wounded for others — not a general on a horse.',
        },
        {
          id: 'b',
          text: 'The servant is silent like a lamb.',
          bin: 'keep',
          why: 'The poem’s servant does not answer back with a sword.',
        },
        { id: 'c', text: 'The servant conquers Rome by sword.', bin: 'discard' },
        {
          id: 'd',
          text: 'Many are counted righteous through him.',
          bin: 'keep',
          why: 'The poem says many are made right through his suffering.',
        },
      ],
      teachOnWrong: 'Isaiah 53 is a suffering servant, not a general on a horse. Keep the wounds; toss the sword.',
      deeper: 'He was pierced for our transgressions… and with his wounds we are healed.',
    },
  },
  {
    id: 'trail-grace',
    early: true,
    teaser: 'A pew card says only: “not a wage.”',
    districtFlavor: 'The High Lookout · unearned',
    challenge: {
      kind: 'match',
      id: 'daily-grace',
      title: 'Not a wage',
      idea: 'grace is a gift, not a wage',
      prompt: 'Match the word to the meaning this town uses.',
      context: 'Grace is not a prize for finishing the map. It is the claim that God moves first.',
      pairs: [
        { id: 'grace', gem: 'cup', left: 'Grace', right: 'Gift, not wage' },
        { id: 'faith', gem: 'heart', left: 'Faith', right: 'Trust that receives' },
        { id: 'boast', gem: 'coin', left: 'Boast', right: 'What the gift refuses' },
      ],
      teachOnWrong: 'Ephesians 2 treats grace as gift and faith as receiving. Boast is what the gift will not feed.',
      deeper:
        'By grace you have been saved through faith. And this is not your own doing; it is the gift of God.',
    },
  },
  {
    id: 'trail-rest',
    early: true,
    teaser: 'The lookout bench is empty on purpose.',
    districtFlavor: 'The High Lookout · come and rest',
    challenge: {
      kind: 'sequence',
      id: 'daily-rest',
      title: 'Come and rest',
      idea: 'rest is offered to tired people first',
      prompt: 'Jesus’ invitation has an order. Set the stones.',
      context: 'Matthew 11:28. Tired people are named first. The invitation is to a person, not a performance.',
      items: [
        { id: 'a', gem: 'heart', text: 'You are tired and carrying too much.' },
        { id: 'b', gem: 'door', text: 'Jesus says, “Come to me.”' },
        { id: 'c', gem: 'star', text: 'He promises rest — not a steeper hill.' },
      ],
      teachOnWrong: 'The weary are addressed before the command. Rest is the gift, not a prize for climbing harder.',
      deeper: 'Come to me, all who labor and are heavy laden, and I will give you rest.',
    },
  },
  {
    id: 'trail-neighbor',
    teaser: 'A child left chalk arrows toward the well.',
    districtFlavor: 'Parable Hollow · who is near',
    challenge: {
      kind: 'build-argument',
      id: 'daily-neighbor',
      title: 'Who is near',
      idea: 'neighbor is the one who shows mercy',
      prompt: 'Build the Samaritan’s answer from the stones provided.',
      context: 'Luke 10:36–37. The question “who is my neighbor?” is turned around. Mercy makes a neighbor.',
      slots: [
        { id: 'p1', role: 'premise', label: 'The scene', correctCardId: 'wounded' },
        { id: 'p2', role: 'premise', label: 'The action', correctCardId: 'helped' },
        { id: 'c', role: 'conclusion', label: 'The measure', correctCardId: 'mercy' },
      ],
      cards: [
        { id: 'wounded', text: 'A man is left wounded on the road' },
        { id: 'helped', text: 'An unlikely traveler stops and helps' },
        { id: 'mercy', text: 'Neighbor is the one who showed mercy' },
        { id: 'priest', text: 'The priest who passed by is the hero', distractor: true },
      ],
      teachOnWrong:
        'Jesus asks which man *proved* to be a neighbor. Mercy, not pedigree, is the measure. Leave the decoy in the bank.',
      deeper: 'He said, “The one who showed him mercy.” And Jesus said, “You go, and do likewise.”',
    },
  },
  {
    id: 'trail-empty',
    teaser: 'Dawn light on an unused grave cloth.',
    districtFlavor: 'The Witness Bench · morning',
    challenge: {
      kind: 'sort',
      id: 'daily-empty',
      title: 'Morning',
      idea: 'the first Easter reports are awkward on purpose',
      prompt: 'Which details belong in the first Easter reports?',
      context:
        'The first reports are not tidy. They include women, fear, and an empty place. The town does not sand that down.',
      keepLabel: 'In the reports',
      discardLabel: 'Later invention?',
      tiles: [
        {
          id: 'a',
          text: 'The tomb is found empty.',
          bin: 'keep',
          why: 'The first reports open with an empty place, not a tidy triumph.',
        },
        {
          id: 'b',
          text: 'Women are among the first witnesses.',
          bin: 'keep',
          why: 'Luke names women first — and that the men called it idle talk.',
        },
        { id: 'c', text: 'Rome instantly converts the senate.', bin: 'discard' },
        {
          id: 'd',
          text: 'Fear and wonder sit side by side.',
          bin: 'keep',
          why: 'The opening keeps fear; it is not sanded into instant victory.',
        },
      ],
      teachOnWrong:
        'Luke 24 begins with an empty place and a dismissed report. Keep the awkwardness; toss the tidy triumph.',
      deeper:
        'They found the stone rolled away from the tomb, but when they went in they did not find the body.',
    },
  },
  {
    id: 'trail-cosmos',
    teaser: 'The chalkboard still says “why anything at all?”',
    districtFlavor: 'The Observatory · a first question',
    challenge: {
      kind: 'build-argument',
      id: 'daily-cosmos',
      title: 'Why anything at all',
      idea: 'why there is anything at all points to a Source',
      prompt: 'Set the three stones of a cosmological question the psalms are willing to ask.',
      context:
        'The psalms ask why there is a world at all. That question points to a Source — not to a polite silence.',
      slots: [
        { id: 'p1', role: 'premise', label: 'Fact', correctCardId: 'exists' },
        { id: 'p2', role: 'premise', label: 'Surprise', correctCardId: 'contingent' },
        { id: 'c', role: 'conclusion', label: 'Question', correctCardId: 'ask' },
      ],
      cards: [
        { id: 'exists', text: 'The universe exists' },
        { id: 'contingent', text: 'It did not have to' },
        { id: 'ask', text: 'So a Source is worth naming' },
        { id: 'shrug', text: 'So questions are impolite', distractor: true },
      ],
      teachOnWrong: 'Existence plus contingency yields a question, not a scolding. Leave the shrug in the bank.',
      deeper: 'Psalm 8: when I look at your heavens… what is man that you are mindful of him?',
    },
  },
  {
    id: 'trail-door',
    teaser: 'Someone chalked a small door on the lookout wall.',
    districtFlavor: 'The High Lookout · a door, not a wall',
    challenge: {
      kind: 'match',
      id: 'daily-door',
      title: 'A door, not a wall',
      idea: 'Jesus claims to be a door in, not a wall',
      prompt: 'Match Jesus’ image to what it offers.',
      context:
        '“I am the door” is a claim about access — personal, particular. You may refuse it. The town will not lock you in a pew.',
      pairs: [
        { id: 'door', gem: 'door', scene: 'door', left: 'A door', right: 'A way in, not a dead end' },
        { id: 'pasture', gem: 'tree', scene: 'pasture', left: 'Pasture', right: 'Life on the other side' },
        { id: 'anyone', gem: 'heart', scene: 'welcome', left: 'Anyone', right: 'The invitation’s width' },
      ],
      teachOnWrong: 'John 10 is an invitation with a particular door and a wide “anyone.” Snap the image to the gift.',
      deeper:
        'I am the door. If anyone enters by me, he will be saved and will go in and out and find pasture.',
    },
  },
]

export function dailyForDate(
  dateKey: string,
  trailMorningsBeforeToday = 99,
): DailyPuzzle {
  const early = DAILY_POOL.filter((item) => item.early)
  const pool =
    trailMorningsBeforeToday < 2 && early.length > 0 ? early : DAILY_POOL
  const index = hashString(`silver-city-trail:${dateKey}`) % pool.length
  return pool[index]
}
