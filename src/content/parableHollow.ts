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
      kind: 'multiple-choice',
      id: 'ph-father',
      title: 'The father’s run',
      prompt:
        'In Luke 15:20 the father “ran” to the returning son. In that world a patriarch running was undignified. What is the story pressing you to see?',
      context:
        'Luke 15:11–32. The younger son squanders his share “in reckless living,” rehearses a hired-hand speech, and is met before he finishes it.',
      choices: [
        {
          id: 'a',
          text: 'God’s welcome is not cool justice delayed, but eager mercy that absorbs shame.',
          correct: true,
          teach:
            'Yes. The run, the robe, the ring, and the feast (Luke 15:20–24) picture a restoration the son cannot earn. The older brother then reveals another way of being lost: near the house, far from the father’s joy.',
        },
        {
          id: 'b',
          text: 'The son had already earned restoration by composing a sincere apology.',
          correct: false,
          teach:
            'He does rehearse a confession (Luke 15:18–19), but the father interrupts it. Grace arrives before the speech is complete. The point is not a well-crafted apology as currency.',
        },
        {
          id: 'c',
          text: 'The older brother is the hero, because staying home is the whole of faithfulness.',
          correct: false,
          teach:
            'The older brother is dutiful — and furious at mercy (Luke 15:28–30). Jesus leaves him outside the feast, still addressed as “son.” Faithfulness without joy at another’s return is not the father’s heart.',
        },
        {
          id: 'd',
          text: 'The parable is mainly a lesson in prudent estate planning.',
          correct: false,
          teach:
            'The “share of the estate” (Luke 15:12) sets the plot, but the story is about lostness and homecoming — told after the lost sheep and lost coin (Luke 15:1–10), when Pharisees grumble that Jesus welcomes sinners.',
        },
      ],
      deeper:
        'Luke 15 is one movement in three stories. God is not only willing to receive. God seeks. The feast is the Father’s idea.',
    },
    {
      kind: 'match',
      id: 'ph-seeds',
      title: 'Pictures of the kingdom',
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
      kind: 'scenario',
      id: 'ph-debt',
      title: 'An unpayable account',
      scene:
        'In Matthew 18:21–35 Peter asks how often he must forgive. Jesus tells of a servant forgiven a debt of ten thousand talents — a figure so large it reads as “unpayable” — who then seizes a fellow servant over a hundred denarii. The king, hearing this, reinstates the first debt.',
      prompt: 'What inner logic is Jesus forcing?',
      choices: [
        {
          id: 'a',
          text: 'Receiving mercy creates a moral world in which refusing mercy is a kind of contradiction.',
          correct: true,
          teach:
            'Yes. The horror of the story is not arithmetic. It is ingratitude that treats grace as a private windfall instead of a new way of being toward others (see also Matt 6:12, 14–15).',
        },
        {
          id: 'b',
          text: 'God keeps a spreadsheet, and forgiveness is a limited coupon.',
          correct: false,
          teach:
            'Peter offered a generous number — seven. Jesus answers “seventy-seven” or “seventy times seven” (Matt 18:22), which breaks the coupon logic. The warning at the end is about a heart that will not live from mercy.',
        },
        {
          id: 'c',
          text: 'The first servant was right: small debts still deserve prison.',
          correct: false,
          teach:
            'The king calls him “wicked” precisely for that (Matt 18:32–33). Justice for the small debt is not the issue; the refusal to mirror mercy is.',
        },
        {
          id: 'd',
          text: 'Jesus is only discussing first-century banking reform.',
          correct: false,
          teach:
            'Talents and denarii make the contrast vivid, but the frame is Peter’s question about forgiving a brother. The economy is a window, not the subject.',
        },
      ],
      deeper:
        'Biblical faith does not treat mercy as softness. It treats it as the grain of God’s world — and then asks whether we will live against that grain.',
    },
  ],
}
