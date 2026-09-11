import { evidenceFor } from './evidence.ts'

/** Grade ~6–8 glosses. Same truths as the held claim — simpler words around it. */
export interface PlainLine {
  /** Restates the claim in short speech. Does not replace the stored line. */
  gloss: string
  /** Teach-before-test paragraph. */
  teach: string
  /** One hard word, defined once. */
  word?: { term: string; sense: string }
  /** Short puzzle clue — not a lecture. */
  hint?: string
}

function line(
  gloss: string,
  teach: string,
  extra?: { term: string; sense: string; hint?: string },
): PlainLine {
  return {
    gloss,
    teach,
    word: extra ? { term: extra.term, sense: extra.sense } : undefined,
    hint: extra?.hint,
  }
}

const PLAIN: Record<string, PlainLine> = {
  'ph-road': line(
    'A neighbor is the person who shows mercy — not the person who looks like you.',
    'Jesus tells a story. A hurt man lies on the road. Religious men walk past. A Samaritan stops and helps. Then Jesus asks who *proved* to be a neighbor.',
    {
      term: 'Samaritan',
      sense: 'someone the listener did not expect to be the hero',
      hint: 'Mercy is the test — not the family name.',
    },
  ),
  'ph-father': line(
    'The father runs with mercy before the son finishes his speech.',
    'The son wasted the money. He starts a hired-hand speech. The father runs first. Honor is spent so the son can be hugged.',
    { term: 'Mercy', sense: 'kindness you did not earn', hint: 'The run comes before the apology is done.' },
  ),
  'ph-seeds': line(
    'The kingdom comes in Jesus stories you can hold — not slogans.',
    'Soil, a search, a tiny seed, and a trust. Each Jesus story asks what you will do with what you heard.',
    { term: 'Parable', sense: 'a Jesus story that asks you to decide', hint: 'Keep the right pictures. Remove wrong picks.' },
  ),
  'ph-debt': line(
    'If you were forgiven a huge debt, you cannot choke a neighbor over a small one.',
    'A king wipes an unpayable bill. That same servant then jails a peer for a tiny sum. Received mercy makes refusing mercy a contradiction.',
    { term: 'Debt', sense: 'what you owe and cannot pay', hint: 'Keep the mercy. Toss the throttle.' },
  ),
  'wb-creed': line(
    'Paul hands on an old shared belief: died, buried, raised, appeared.',
    'This is not Paul’s private dream. He says the churches were already saying it: Christ died, was buried, was raised, and was seen.',
    {
      term: 'Creed',
      sense: 'an old shared belief the churches already said out loud',
      hint: 'Death, burial, raising, appearances — in that order.',
    },
  ),
  'wb-early': line(
    'That old shared belief is early testimony, not a medieval insert.',
    'Paul wrote in the mid-first century. He says he received this core and passed it on. That is close to the events — not a monk’s later add-on.',
    { term: 'Testimony', sense: 'a report from people who claim to have seen', hint: 'Keep “received and delivered.” Toss lab-proof talk.' },
  ),
  'wb-method': line(
    'Historians weigh sources. They cannot rerun the past.',
    'Ask: how many reports? How awkward is the detail? How soon was it said? Does it fit that world? Those tools test a report. They are not a chemistry lab.',
    { term: 'Historian', sense: 'someone who weighs old reports, not a person who reruns last Tuesday', hint: 'Match each tool to what it tests.' },
  ),
  'wb-women': line(
    'Women as first witnesses is an awkward detail to invent.',
    'The tomb stories begin with women. Luke says the men called it idle talk. If you only wanted later respect, you would more likely lead with respected men.',
    { term: 'Witness', sense: 'someone who says what they saw', hint: 'Keep the costly opening. Toss overclaims.' },
  ),
  'ob-tuning': line(
    'The universe is finely tuned for life — that fit points to a Designer.',
    'Life needs very tight numbers: how fast space expands, how atoms stick, how tidy the start was. Design predicts a world we can live in. Blind chance does not.',
    {
      term: 'Fine-tuning',
      sense: 'life’s dials fit in a very narrow range',
      hint: 'Tap the picture, then the mark that belongs. Two choices.',
    },
  ),
  'ob-design': line(
    'Fine-tuning is best explained by a mind that intended a habitable world.',
    'The ranges are extravagantly narrow. A Designer who wants observers leads us to expect that fit. A world that does not care does not.',
    {
      term: 'Habitable',
      sense: 'a world where living things can exist',
      hint: 'Place the next stone. Two choices. Leave the overclaims.',
    },
  ),
  'ob-leibniz': line(
    'Physics maps how the world runs. It does not finish why there is a world.',
    'A hot early state is still something. Empty space in a lab is still something. The question remains: why is there anything at all?',
    { term: 'Nothing', sense: 'not a vacuum — not even empty space with laws', hint: 'Keep the careful reading. Toss “free lunch.”' },
  ),
  'ob-life': line(
    'Life’s specified information is a mark of mind.',
    'Cells store instructions and run a coordinated life. That looks like the work of mind. Wonder is rational. So is more lab work. Do not shrug it away.',
    { term: 'Specified information', sense: 'ordered instructions that do a real job — not random noise', hint: 'Keep the careful line. Toss both shrugs.' },
  ),
  'fg-mover': line(
    'Change here and now still asks for a first changer.',
    'Things go from “can be” to “is.” Nothing gives itself that step. A stack of receivers is not an answer. There is a first changer not itself changed.',
    { term: 'First mover', sense: 'the bottom of the explanation — not only the oldest date', hint: 'Order the chain of change. Two choices at a time.' },
  ),
  'fg-contingent': line(
    'What might not have been needs a ground.',
    'You exist, but you might not have. A world of only “might-not-have-beens” does not explain why anything is here. Classical theism names the necessary ground God.',
    {
      term: 'Might not have been',
      sense: 'it is real, but it could have failed to be',
      hint: 'Assemble the chain. Leave the joke cards.',
    },
  ),
  'fg-kalam': line(
    'Whatever begins still asks for a cause.',
    'If something begins, it has a cause. If this universe began, it has a cause. Naming Abraham’s God takes further historical steps.',
    {
      term: 'Kalām',
      sense: 'the beginning argument — what starts still asks for a cause',
      hint: 'Keep the beginning argument. Toss the flattenings.',
    },
  ),
  'fg-limits': line(
    'A first cause is not yet the whole Christian faith.',
    'If the argument works, you have a first cause. Intellect, goodness, and the gospel are further steps — not leaks.',
    { term: 'Creed', sense: 'the full Christian confession — more than “a first cause”', hint: 'Keep the honest limit. Toss “all done” and “worthless.”' },
  ),
  'hl-moral': line(
    'Duty feels real — not like a taste for tea.',
    'We treat some acts as truly wrong, not just disliked. A good God is a fitting home for that grain. Rivals exist. Keep the disagreement visible.',
    { term: 'Duty', sense: 'what you ought to do, even when you do not feel like it', hint: 'Build the modest chain. Leave contempt and collapse.' },
  ),
  'hl-mind': line(
    'Inner experience is not captured by a scan.',
    'Felt redness, thoughts about things, and the pull of truth are not just collisions. Mind is at home if the world’s ground is a living God.',
    {
      term: 'Felt life',
      sense: 'what it is like on the inside — not a scan number',
      hint: 'Match each leftover mystery. Two choices.',
    },
  ),
  'hl-meaning': line(
    'You can build a local meaning. The lookout asks if it is also received.',
    'Work and pleasure are gifts. They are not the final good. Ecclesiastes keeps both truths.',
    { term: 'Meaning', sense: 'a good that can be found — not only assembled', hint: 'Keep the hunger. Toss “only a mood.”' },
  ),
  'hl-beauty': line(
    'Beauty wakes a hunger it cannot feed — longing for a country the sunset cannot give.',
    'Psalm 19 treats the sky as speech. Hungers like that usually correspond to real countries.',
    { term: 'Beauty', sense: 'a glory that calls you — not only a nice feeling', hint: 'Keep the signpost. Toss “only taste.”' },
  ),
  'daily-lantern': line(
    'A lamp is meant to be seen.',
    'Jesus uses an ordinary lamp and a city on a hill. Public without being proud.',
    { term: 'Lamp', sense: 'a light others can actually see', hint: 'Keep the right pictures. Remove wrong picks.' },
  ),
  'daily-gems': line(
    'Jesus taught with pictures you can hold.',
    'A lamp is seen. Seed meets different hearts. The cup is poured for many — gift, not wage.',
    { term: 'Gift', sense: 'given, not earned as a wage', hint: 'Keep the right pictures. Remove wrong picks.' },
  ),
  'daily-seed': line(
    'The same word meets different soils. Some seed is lost.',
    'This Jesus story invites hearing. It does not flatter every field.',
    { term: 'Parable', sense: 'a Jesus story that asks you to decide', hint: 'Keep the honest field. Toss “every field wins.”' },
  ),
  'daily-names': line(
    'The resurrection claim stacks named witnesses, not one private voice.',
    'Paul lists Cephas, the Twelve, and more than five hundred — many still living then.',
    { term: 'Witness', sense: 'a named person who was said to have seen', hint: 'Keep the names. Toss the anonymous dream.' },
  ),
  'daily-creed': line(
    'The old shared belief sits between the event and Paul’s letter.',
    'If that short line is early, the claim is close to what it names: died, buried, raised.',
    { term: 'Creed', sense: 'an old shared belief the churches already said out loud', hint: 'Keep “received.” Toss “Paul invented it while writing.”' },
  ),
  'daily-stars': line(
    'The heavens already speak of a Maker. Fine-tuning fits that voice.',
    'Psalm 19 and Romans 1 treat the created order as speech. The tight fit of the cosmos lands in the same grain.',
    { term: 'Maker', sense: 'the One who intended this world', hint: 'Keep the sky as speech. Toss “silent decoration.”' },
  ),
  'daily-life': line(
    'Life, place, and mind are not cheap facts.',
    'Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.',
    { term: 'Given', sense: 'received, not cheap leftover', hint: 'Keep the marks. Toss “it just happened.”' },
  ),
  'daily-scroll': line(
    'We hold a river of copies, not the first ink.',
    'Scribes copy. Later hands compare. Then a page prints a recovered text. The word still stands.',
    { term: 'Copies', sense: 'later hands writing the same line — not cheating', hint: 'Keep the river of copies. Toss “we hold the first ink.”' },
  ),
  'daily-isaiah': line(
    'Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.',
    'The poem’s Servant suffers for others and does not answer with a sword. The church names that Servant as Jesus.',
    { term: 'Servant', sense: 'the wounded one in Isaiah 53 — not a general on a horse', hint: 'Keep the wounds. Toss the sword.' },
  ),
  'daily-grace': line(
    'Grace is gift, not wage. Faith receives. Boast starves.',
    'God moves first. You did not finish a map that earned this.',
    { term: 'Grace', sense: 'gift you did not earn', hint: 'Keep the gift. Toss the wage.' },
  ),
  'daily-rest': line(
    'Tired people are named first. Rest is the gift, not a steeper hill.',
    'The invitation is to a person — “Come to me” — not a performance.',
    { term: 'Rest', sense: 'gift for the weary, not a prize for climbing harder', hint: 'Keep the invitation. Toss the steeper program.' },
  ),
  'daily-neighbor': line(
    'Mercy makes a neighbor. Pedigree does not.',
    'Jesus asks who *proved* to be a neighbor — the one who showed mercy.',
    { term: 'Pedigree', sense: 'family name or in-group badge', hint: 'Keep mercy. Toss “already my people.”' },
  ),
  'daily-empty': line(
    'The first Easter reports include an empty place, women, fear, and wonder.',
    'The town does not sand that awkwardness into a tidy triumph.',
    { term: 'Empty', sense: 'the place was not occupied when they looked', hint: 'Keep the awkward opening. Toss the senate conversion.' },
  ),
  'daily-cosmos': line(
    'The universe exists and did not have to — so a Source is worth naming.',
    'The psalms ask the question out loud and expect a Giver, not a shrug.',
    { term: 'Source', sense: 'the One from whom this world comes', hint: 'Keep the question. Toss the shrug.' },
  ),
  'daily-door': line(
    'Jesus’ “door” is a particular way in with a wide anyone.',
    'You may refuse it. The town will not lock you in a pew.',
    { term: 'Door', sense: 'a real way in — not a wall', hint: 'Keep the right pictures. Remove wrong picks.' },
  ),
  'td-watch': line(
    'A true main idea can turn a cheap line.',
    'Love, logic, reason, and science you have kept can send a false step up the ridge.',
    { term: 'Use', sense: 'use a main idea you kept — not a new lecture', hint: 'Plant the true line. Turn the cheap one.' },
  ),
  'ln-street': line(
    'An idea lives at a place, with a person.',
    'Mercy tells Jesus stories at the creek — that is why the neighbor-line lives at Parable Hollow. Silas copies names on the square — that is why the old shared belief lives at the Witness Bench. Juniper’s lamp is on the porch so today’s line can be seen.',
    { term: 'Link', sense: 'connect the sentence to its place and person', hint: 'Connect sentence → place → person. One story at a time.' },
  ),
}

export function plainFor(id: string): PlainLine | undefined {
  if (PLAIN[id]) return PLAIN[id]
  const brief = evidenceFor(id)
  if (!brief) return undefined
  return {
    gloss: brief.claim,
    teach: brief.reason,
    hint: 'Read the line. Pick what matches it.',
  }
}
