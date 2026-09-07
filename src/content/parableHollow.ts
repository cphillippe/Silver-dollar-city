import type { Area } from '../types'

export const parableHollow: Area = {
  id: 'parable-hollow',
  order: 1,
  title: 'Parable Hollow',
  shortTitle: 'Hollow',
  subtitle: 'Stories that walk around inside you',
  blurb:
    'The Teacher spoke in pictures — not to hide the truth, but to make it move.',
  intro: [
    'A creek path slips under oak and cedar. In this hollow the stories still have weight: a road, a table, a lost coin flashing in the dust.',
    'Jesus of Nazareth taught in parables. They are not riddles for insiders only. They are invitations — they ask what kind of neighbor, child, and steward you will be.',
    'Play the stories. Then sit with what they claim about God.',
  ],
  icon: 'oak',
  accent: '#6b8f71',
  challenges: [
    {
      kind: 'sequence',
      id: 'ph-road',
      title: 'The road to Jericho',
      idea: 'neighbor is the one who shows mercy',
      prompt: 'Place the Good Samaritan in the order Luke tells it.',
      context:
        'Luke 10:25–37. A lawyer asks, “Who is my neighbor?” Jesus answers with a story set on the Jerusalem–Jericho road — a real, dangerous descent.',
      items: [
        {
          id: 'a',
          text: 'A lawyer asks Jesus, “And who is my neighbor?”',
        },
        {
          id: 'b',
          text: 'A man is beaten and left half-dead on the road.',
        },
        {
          id: 'c',
          text: 'A priest and then a Levite see him and pass by.',
        },
        {
          id: 'd',
          text: 'A Samaritan binds the wounds, takes him to an inn, and pays.',
        },
        {
          id: 'e',
          text: 'Jesus: “Go and do likewise.”',
        },
      ],
      teachOnWrong:
        'Luke’s force depends on order: religious insiders fail first; the unexpected outsider becomes the measure of neighbor-love. Try again.',
      deeper:
        'Samaritans and Judeans were divided by worship and memory (see John 4:9). Jesus does not define “neighbor” as the person who looks like you. He makes the listener identify with the wounded man — and then with costly mercy.',
    },
    {
      kind: 'sort',
      id: 'ph-father',
      title: 'The father’s run',
      idea: 'the father runs before the apology is finished',
      prompt: 'Toss the weak readings. Keep what Luke 15 is actually pressing.',
      context:
        'Luke 15:11–32. In that world a patriarch running was undignified. The father runs before the son finishes his hired-hand speech.',
      keepLabel: 'Keep',
      discardLabel: 'Toss',
      tiles: [
        {
          id: 'a',
          text: 'Eager mercy that absorbs shame — not cool justice delayed.',
          bin: 'keep',
        },
        {
          id: 'b',
          text: 'The son earned the feast by writing a good apology.',
          bin: 'discard',
        },
        {
          id: 'c',
          text: 'The older brother is the hero simply for staying home.',
          bin: 'discard',
        },
        {
          id: 'd',
          text: 'The story is mainly about estate planning.',
          bin: 'discard',
        },
      ],
      teachOnWrong:
        'Grace arrives before the speech is done (Luke 15:20). The older brother is dutiful — and furious at mercy. Try the bins again.',
      deeper:
        'Luke 15 stacks three lost-and-found stories. God is not only willing to receive. God seeks. The feast is the Father’s idea.',
    },
    {
      kind: 'match',
      id: 'ph-seeds',
      title: 'Pictures of the kingdom',
      idea: 'the kingdom arrives in pictures, not slogans',
      prompt: 'Match each parable to the claim it is actually making.',
      context:
        'These are among the most-attested teachings in the Synoptic Gospels. A parable can have one main thrust — resist turning every detail into an allegory.',
      pairs: [
        {
          id: 'sower',
          left: 'The sower (Matt 13:1–23)',
          right: 'The same word meets very different hearts',
        },
        {
          id: 'sheep',
          left: 'The lost sheep (Luke 15:1–7)',
          right: 'The shepherd seeks the one, not only the ninety-nine',
        },
        {
          id: 'mustard',
          left: 'The mustard seed (Matt 13:31–32)',
          right: 'The kingdom begins small and becomes shelter',
        },
        {
          id: 'talents',
          left: 'The talents (Matt 25:14–30)',
          right: 'What is entrusted is meant to be used, not buried',
        },
      ],
      teachOnWrong:
        'Look again at the main action of each story — soil, search, growth, or stewardship — rather than a moral you already liked.',
      deeper:
        'Jesus’ stories assume a God who speaks, seeks, grows a kingdom, and will ask what we did with a trust. They are not proofs. They are a portrait — and a demand.',
    },
    {
      kind: 'sort',
      id: 'ph-debt',
      title: 'An unpayable account',
      idea: 'received mercy makes refusing mercy a contradiction',
      prompt: 'Sort the claims. Only one belongs in the keep bin.',
      context:
        'Matthew 18:21–35. A servant forgiven an unpayable debt then throttles a peer over a small sum. The king reinstates the first debt.',
      keepLabel: 'Keep',
      discardLabel: 'Toss',
      tiles: [
        {
          id: 'a',
          text: 'Received mercy makes refusing mercy a contradiction.',
          bin: 'keep',
        },
        {
          id: 'b',
          text: 'Forgiveness is a limited coupon on God’s spreadsheet.',
          bin: 'discard',
        },
        {
          id: 'c',
          text: 'The first servant was right to demand prison for a small debt.',
          bin: 'discard',
        },
        {
          id: 'd',
          text: 'Jesus is only reforming first-century banking.',
          bin: 'discard',
        },
      ],
      teachOnWrong:
        'Peter offered seven. Jesus breaks coupon-logic (Matt 18:22). The horror is ingratitude, not arithmetic.',
      deeper:
        'Mercy is not softness. It is the grain of God’s world — and then a question: will you live against that grain? See also Matt 6:12–15.',
    },
  ],
}
