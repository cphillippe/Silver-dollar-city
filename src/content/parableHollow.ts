import type { Area } from '../types'

export const parableHollow: Area = {
  id: 'parable-hollow',
  order: 1,
  title: 'Story Creek',
  shortTitle: 'Creek',
  subtitle: 'Jesus stories that stick',
  blurb:
    'The Teacher spoke in pictures — not to hide the truth, but to make it move.',
  intro: [
    'A creek path, oaks, and pictures you can hold: a road, a table, a lost coin in the dust.',
    'Jesus taught in pictures. Play them. Then keep one true line.',
  ],
  icon: 'oak',
  accent: '#6b8f71',
  challenges: [
    {
      kind: 'sequence',
      id: 'ph-road',
      title: 'The Good Samaritan',
      idea: 'neighbor is the one who shows mercy',
      prompt: 'Place the Good Samaritan in the order Luke tells it.',
      context:
        'Luke 10:25–37. A lawyer asks, “Who is my neighbor?” Jesus answers with a story set on the Jerusalem–Jericho road — a real, dangerous descent.',
      items: [
        {
          id: 'a',
          gem: 'cup',
          text: 'A lawyer asks Jesus, “And who is my neighbor?”',
        },
        {
          id: 'b',
          gem: 'heart',
          text: 'A man is beaten and left half-dead on the road.',
        },
        {
          id: 'c',
          gem: 'door',
          text: 'A priest and then a Levite see him and pass by.',
        },
        {
          id: 'd',
          gem: 'lamp',
          text: 'Moved with compassion, a Samaritan binds the wounds, takes him to an inn, and pays.',
        },
        {
          id: 'e',
          gem: 'star',
          text: 'Jesus: “Go and do likewise.”',
        },
      ],
      teachOnWrong:
        'Luke’s force depends on order: religious insiders fail first; the unexpected outsider becomes the measure of neighbor-love. Try again.',
      deeper:
        'Samaritans and Judeans were divided by worship and memory (see John 4:9). Jesus flips the question (Luke 10:36): mercy proves who the neighbor is. He makes the listener identify with the wounded man — and then with costly mercy.',
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
          gem: 'heart',
          text: 'The father runs with mercy — before the speech is done.',
          bin: 'keep',
        },
        {
          id: 'b',
          gem: 'coin',
          text: 'The son earned the feast by writing a good apology.',
          bin: 'discard',
        },
        {
          id: 'c',
          gem: 'star',
          text: 'The older brother is the hero simply for staying home.',
          bin: 'discard',
        },
        {
          id: 'd',
          gem: 'door',
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
          gem: 'seed',
          left: 'The sower',
          right: 'Same word, different hearts',
        },
        {
          id: 'sheep',
          gem: 'heart',
          left: 'Lost sheep',
          right: 'The one is sought',
        },
        {
          id: 'mustard',
          gem: 'tree',
          left: 'Mustard seed',
          right: 'Small start, later shelter',
        },
        {
          id: 'talents',
          gem: 'coin',
          left: 'The talents',
          right: 'Use the trust; don’t bury it',
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
          gem: 'cup',
          text: 'Received mercy makes refusing mercy a contradiction.',
          bin: 'keep',
        },
        {
          id: 'b',
          gem: 'coin',
          text: 'Forgiveness is a limited coupon on God’s spreadsheet.',
          bin: 'discard',
        },
        {
          id: 'c',
          gem: 'door',
          text: 'The first servant was right to demand prison for a small debt.',
          bin: 'discard',
        },
        {
          id: 'd',
          gem: 'star',
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
