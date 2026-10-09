/** Player-facing notes for Settings → What’s new. Add a row per pack or app drop. */
export interface ChangeNote {
  version: string
  title: string
  when: string
  items: string[]
}

export const CHANGELOG: ChangeNote[] = [
  {
    version: '1.4.414',
    title: 'Story strip faces stay apart',
    when: '2026-10-09',
    items: [
      'On Easy, the small Samaritan and creed pictures name Jesus and the priest. The crop sits on Jesus’s hair and on the priest’s headpiece, so the two robes do not read as the same man.',
      'The Good Samaritan win lines sit in a shorter band, and the Luke line under the pictures is shorter too. The meaning stays: the one who shows mercy is the neighbor.',
    ],
  },
  {
    version: '1.4.413',
    title: 'Night Watch Easy flat taps',
    when: '2026-10-09',
    items: [
      'A tap on the glowing face is one flat hit. It does not grow when the lamp gets stronger. Fast and plain walkers still drop in a tap or two. Tough walkers soak those taps and need the lamps.',
      'Lamps alone still lose round 5. A light tapper with one harder-hitting lamp holds that round. Steady tapping without buying stops in the middle rounds. Buying each break reaches the later rounds.',
      '3× runs the same night faster. Lamps, walkers, spawns, and the leak grace share one clock.',
    ],
  },
  {
    version: '1.4.412',
    title: 'Night Watch Easy live prove',
    when: '2026-10-09',
    items: [
      'Rounds from 5 on send more walkers with thicker health, including tough ones. Lamps alone lose round 5. Tapping without upgrades walls around round 8. Buying lamps and steps reaches the later rounds.',
      'A glowing Fast walker keeps a blue rim and speed ticks, and a glowing Tough walker keeps an orange ring, so the type still reads. Pulling a lamp asks first and says how many sparks come back. On a tablet the map stays on the screen, and the Far Hills card sits in the middle.',
    ],
  },
  {
    version: '1.4.411',
    title: 'Night Watch Easy fast and tough walkers',
    when: '2026-10-09',
    items: [
      'From round 4, some walkers are fast: slim, leaning, with blue motion streaks, and a short health bar. A lamp that reaches farther catches them.',
      'From round 7, bulky dark walkers step a little slower and take many more hits. A stronger lamp brings them down, and turning one pays an extra spark.',
    ],
  },
  {
    version: '1.4.410',
    title: 'Night Watch Easy R5 tap value + R6–R7 curve',
    when: '2026-10-09',
    items: [
      'On Easy, a tap on the glowing face hits twice as hard. Round 5 walks faster, so lamps alone lose that round and taps can hold it.',
      'Each round you clear gives one heart back, up to three, with a small +1 ♥. One bad round does not empty the next.',
    ],
  },
  {
    version: '1.4.409',
    title: 'Night Watch Easy tap fairness + heart pacing',
    when: '2026-10-09',
    items: [
      'On Easy, only the glowing face takes a tap. Any other tap says Tap the glowing face. It does not spend a heart, let a walker through, or slow the lamps.',
      'A leak still costs one heart. The next short moment is free, and one round can spend at most two hearts, so one bad moment cannot empty the bar.',
    ],
  },
  {
    version: '1.4.408',
    title: 'Night Watch lamps hold the middle rounds',
    when: '2026-10-09',
    items: [
      'Tapping a lamp step buys it on the first tap. Continue waits if that tap is still landing.',
      'On Easy, a walker who finishes the road costs one heart. The night ends when the hearts are gone. You see One got through! and the heart drop, and the loss line shows the hearts left.',
      'Rounds 7 to 12 are a little softer, so the lamps do more of the killing and a spender can keep going through them.',
    ],
  },
  {
    version: '1.4.407',
    title: 'Night Watch round jump needs a playtest flag',
    when: '2026-10-09',
    items: [
      'A link opens Easy round 25 only when that same link says playtest=1, or when Night Watch debug freeze is on in Settings. Any other link starts at round 1.',
    ],
  },
  {
    version: '1.4.406',
    title: 'Night Watch opens the Far Hills',
    when: '2026-10-09',
    items: [
      'When Easy Night Watch holds through round 25, a new place is unlocked. The Far Hills show as a coming-soon card, and Home takes you back. Hard nights are unchanged.',
      'After that night, Home marks Night Watch with a small Far Hills badge.',
    ],
  },
  {
    version: '1.4.405',
    title: 'Night Watch lamps grow on two paths',
    when: '2026-10-09',
    items: [
      'Easy lamps have two paths, Far and Strong, with three steps each. Far reaches farther. Strong hits harder. One path can go to three. The other stops at one. Steps cost 3, then 6, then 12 sparks, so a lamp is not finished in the early rounds.',
      'Round 6 needs a second step on either path. Tap a planted lamp between rounds to buy a step. Hard still upgrades one step at a time.',
    ],
  },
  {
    version: '1.4.404',
    title: 'Night Watch Easy runs 25 rounds',
    when: '2026-10-09',
    items: [
      'Easy Night Watch runs 25 rounds. The first six are unchanged. Later rounds bring more walkers and more health, and the walk stays readable. Every fourth round eases off a little.',
      'From round 15, several Level III lamps and all four planted lamps are what hold the road. The map says Round 12 of 25. A miss tells you the round you reached. When round 25 holds, the night held.',
    ],
  },
  {
    version: '1.4.403',
    title: 'Story strip pictures grow',
    when: '2026-10-09',
    items: [
      'Easy order pictures take more of each card, in the slots, the tray, and the win. On the Samaritan road, the win words are easier to read, and the last picture is the inn, where the helper pays for the man’s care.',
    ],
  },
  {
    version: '1.4.402',
    title: 'Night Watch Easy runs six rounds',
    when: '2026-10-09',
    items: [
      'Easy Night Watch is six rounds. Each round brings a few more walkers, a little more speed, and a little more health. Rounds 1 to 4 stay winnable with Level I lamps. Round 5 is tight unless you tap. Round 6 needs a lamp at Level II.',
      'The map says Round 3 of 6. When the sixth round holds, the night held.',
    ],
  },
  {
    version: '1.4.401',
    title: 'Story strip pictures fill the card',
    when: '2026-10-09',
    items: [
      'Easy order pictures sit larger on the card, and every win caption keeps its period. The last win card is the same height as the others. The Samaritan road’s last picture is new, so the asking and the helping are easy to tell apart.',
    ],
  },
  {
    version: '1.4.400',
    title: 'Night Watch Easy sparks buy more',
    when: '2026-10-09',
    items: [
      'On Easy, a lamp costs 3 sparks to reach II and 6 to reach III. Every lamp pays the same price for the same step. Wave 1 cannot raise both free lamps to the top.',
      'After Begin, drag or tap another lamp onto open ground. That lamp costs 5 sparks. The ghost turns red on the road and houses, and the ring is the real reach. Lamps planted before Begin stay free.',
      'A dragged lamp lands under the finger. Too far from the road stays on the screen.',
    ],
  },
  {
    version: '1.4.399',
    title: 'Story strip words stay whole',
    when: '2026-10-09',
    items: [
      'Easy order captions keep each word whole, in the slots and on the win. The Samaritan road uses cut-out pictures like the other stories, so faces stay whole. The win strip is shorter so the Home button stays on the phone.',
    ],
  },
  {
    version: '1.4.397',
    title: 'Story strip hints wait for a miss',
    when: '2026-10-09',
    items: [
      'Easy order puzzles glow the next card only after two misses on that step, then the glow clears when you place it. Five-frame slots use a short line you can read. Tray cards stay picture-sized when only a few are left. Samaritan pictures fill the card the same way, with the role in bold.',
    ],
  },
  {
    version: '1.4.395',
    title: 'Story strip Easy is easier to see',
    when: '2026-10-09',
    items: [
      'Easy order puzzles glow the right card after two misses, with a gold ring and a lift. A wrong tap wiggles farther and flashes red. Picture faces stay whole in the tray and on the strip, and five-frame slots keep a short caption. The start button says Order the story. A playtest link can open one puzzle without unlocking the street.',
    ],
  },
  {
    version: '1.4.394',
    title: 'Order puzzles become picture panels',
    when: '2026-10-08',
    items: [
      'Easy order puzzles are a story strip. Numbered jigsaw slots sit on top. Every remaining picture waits in the tray, face up, with its caption. Tap the panel that comes next. A right panel snaps in. A wrong one wiggles back. After two misses the right card glows. On a win the strip stays, then a short RSV verse card. Hard adds one extra card and a Check order button.',
    ],
  },
  {
    version: '1.4.393',
    title: 'Night Watch walkers enter at the gate',
    when: '2026-10-08',
    items: [
      'Walkers step in at the gate. A level I lamp near the road can still pop a walker. A lamp set back says Reaches at Level II or Reaches at Level III when a stronger lamp would reach the road. Too far from the road shows only when even level III cannot reach. The lamp card says the same thing. Tapping a planted lamp while walkers are out does not count as a miss.',
    ],
  },
  {
    version: '1.4.392',
    title: 'Night Watch lamps show when they reach the road',
    when: '2026-10-08',
    items: [
      'Easy Night Watch paints the ring gold when a lamp can reach the yellow road, and lights that stretch of road. A lamp too far away turns the ring amber and says Too far from the road. You can still plant it. A level I lamp reaches a little farther, so one near the road can pop a walker. A gold dot marks the spot the lamp will land.',
    ],
  },
  {
    version: '1.4.391',
    title: 'Night Watch lamps drag onto the map',
    when: '2026-10-08',
    items: [
      'Easy Night Watch lets you drag Love, Logic, Reason, or Science onto open ground. The lamp and its ring follow your finger and turn red over the road, a house, or the cards. Letting go on red puts the lamp back and spends nothing. A short tap still picks a card, then a tap on open ground plants it. Begin stays pale until a lamp is planted, then turns solid gold.',
    ],
  },
  {
    version: '1.4.390',
    title: 'Night Watch lamps plant on open ground',
    when: '2026-10-08',
    items: [
      'Easy Night Watch lets you tap Love, Logic, Reason, or Science, then tap open ground to plant that lamp. The road, houses, trees, water, and the buttons stay blocked. A blocked tap shows a red lamp and does not plant. The ring you see is the ring that hits. Begin still stays pale until a lamp is planted, then turns solid gold.',
    ],
  },
  {
    version: '1.4.389',
    title: 'Night Watch Begin waits for a lamp',
    when: '2026-10-08',
    items: [
      'With no lamps planted, Begin the watch is pale and says Plant a lamp first. The lamp cards give a small nudge. After a lamp is planted, Begin is solid gold and starts the watch.',
    ],
  },
  {
    version: '1.4.388',
    title: 'Night Watch Upgrade waits for a spark',
    when: '2026-10-07',
    items: [
      'When you have no sparks, Upgrade is grey and says Need a spark. Love, Logic, Reason, and Science do not say Tap until you have a spark to spend.',
    ],
  },
  {
    version: '1.4.387',
    title: 'Night Watch hides the stuck diamond',
    when: '2026-10-07',
    items: [
      'Easy Night Watch no longer shows a diamond that stays at 0. Each lamp still shows its gold 1, and sparks still show on the star.',
    ],
  },
  {
    version: '1.4.386',
    title: 'Night Watch upgrades the lamp you opened',
    when: '2026-10-07',
    items: [
      'Between waves, Upgrade spends a spark on the lamp you just opened. After Love levels, opening Logic and tapping Upgrade levels Logic.',
    ],
  },
  {
    version: '1.4.385',
    title: 'Night Watch face taps hit',
    when: '2026-10-07',
    items: [
      'Easy Night Watch counts a tap on the glowing face. That walker takes the hit and can pop. Wrong shows only when the tap misses the face, and it fades.',
    ],
  },
  {
    version: '1.4.384',
    title: 'Night Watch can lose a heart',
    when: '2026-10-07',
    items: [
      'Easy Night Watch drops a heart when a walker finishes the road. When the hearts are gone, the night ends and you can try again. A lamp far from the yellow road, such as Witness Square, no longer pops the whole wave by itself.',
    ],
  },
  {
    version: '1.4.383',
    title: 'Night Watch Begin stays clear',
    when: '2026-10-07',
    items: [
      'Easy Night Watch keeps Begin the watch easy to read until the first lamp is planted. It fades after that plant. The Sparks count stays clear of the walker name.',
    ],
  },
  {
    version: '1.4.382',
    title: 'Night Watch porch paths are candy',
    when: '2026-10-07',
    items: [
      'Easy Night Watch shows thick candy paths from the cottage porches to the yellow road. Pink, lilac, and mint sweets sit on white icing so the paths are easy to see on a phone.',
    ],
  },
  {
    version: '1.4.381',
    title: 'Night Watch can run at 3×',
    when: '2026-10-07',
    items: [
      'Easy Night Watch adds a speed control. The night starts at normal speed. It shows Locked until wave 3. Then it shows 1× and Available. Tap it and it shows 3× Active. Tap again to go back to 1×.',
    ],
  },
  {
    version: '1.4.380',
    title: 'Night Watch skills recharge',
    when: '2026-10-07',
    items: [
      'Easy Night Watch skills open one at a time. Still freezes the walkers. Mend fills your hearts and holds the gate. Tap a skill when it says TAP. It recharges after you use it. The first time a skill opens, a short card tells you what it does.',
    ],
  },
  {
    version: '1.4.379',
    title: 'Night Watch phone map uses the screen',
    when: '2026-10-07',
    items: [
      'Easy Night Watch on a phone drops the purple frame so the map fills the screen. Walker names shrink to one small line. Love, Logic, Reason, and Science show as icons. The wave count sits on the map.',
    ],
  },
  {
    version: '1.4.378',
    title: 'Night Watch plants all four from the first wave',
    when: '2026-10-07',
    items: [
      'Easy Night Watch lets you plant Love, Logic, Reason, and Science from the first wave. Each type shows 1 until you set it on its own gold ring. Pull puts that 1 back when another ring is open. The glowing face is only for walkers.',
    ],
  },
  {
    version: '1.4.377',
    title: 'Night Watch towers are Love, Logic, Reason, and Science',
    when: '2026-10-07',
    items: [
      'Easy Night Watch plants the four sidebar types: Love, Logic, Reason, and Science. Each one has its own color and icon. Planting uses that type’s one slot. Pull puts the slot back. Sparks still raise it from I to II or III.',
    ],
  },
  {
    version: '1.4.376',
    title: 'Night Watch walkers spawn spaced',
    when: '2026-10-07',
    items: [
      'Easy Night Watch walkers enter spaced along the road. The first face stays ahead. Later faces come in behind it, so you can read each one.',
    ],
  },
  {
    version: '1.4.375',
    title: 'Night Watch lamp levels up',
    when: '2026-10-07',
    items: [
      'Upgrade on a planted lamp plays a short burst. The lamp grows brighter, the level steps from I to II or II to III, and the spark spend shows −1✦.',
    ],
  },
  {
    version: '1.4.374',
    title: 'Night Watch lamp card can pull',
    when: '2026-10-07',
    items: [
      'The lamp upgrade card has a small trash control. Pull takes that lamp off the road. The last lamp stays.',
    ],
  },
  {
    version: '1.4.373',
    title: 'Night Watch lamp upgrade card',
    when: '2026-10-06',
    items: [
      'Tap a planted lamp to open its upgrade card. The next level and spark cost sit above a gold Upgrade button. Range and damage go up. Pull is a small trash control.',
    ],
  },
  {
    version: '1.4.372',
    title: 'Night Watch shows the walker to tap',
    when: '2026-10-06',
    items: [
      'The walker to tap glows with a gold ring and a bouncing arrow. Other walkers stay quieter. Lamps still shoot with a beam, a flash, and a spark.',
    ],
  },
  {
    version: '1.4.371',
    title: 'Night Watch shots you can see',
    when: '2026-10-06',
    items: [
      'When a lamp shoots, its range circle turns solid, a bright beam reaches the walker, and the face flashes. The pop and spark stay.',
    ],
  },
  {
    version: '1.4.370',
    title: 'Night Watch lamps fight on their own',
    when: '2026-10-06',
    items: [
      'Planted lamps shoot walkers in range. A hit flashes, a pop shows when a walker falls, and a spark lands.',
    ],
  },
  {
    version: '1.4.369',
    title: 'Easy Keep/Toss keeps long words whole',
    when: '2026-10-06',
    items: [
      'Easy Keep/Toss sorted cards wrap on spaces. A long word like guaranteed stays in one piece.',
    ],
  },
  {
    version: '1.4.368',
    title: 'Easy story lines stay whole on a phone',
    when: '2026-10-06',
    items: [
      'Easy story lines stay whole on a phone. The short story wraps so you can read every line.',
    ],
  },
  {
    version: '1.4.367',
    title: 'Home top bar stays readable on a phone',
    when: '2026-10-06',
    items: [
      'Home top bar stays readable on a phone.',
    ],
  },
  {
    version: '1.4.366',
    title: 'Run fail hint is easier to read',
    when: '2026-10-06',
    items: [
      'Run fail hint is easier to read.',
    ],
  },
  {
    version: '1.4.365',
    title: 'Star lamps show up after you build',
    when: '2026-10-06',
    items: [
      'Star lamps show up after you build. The map lights the next lamps, and Build It says what changed.',
    ],
  },
  {
    version: '1.4.364',
    title: 'Phone checks the Easy walk',
    when: '2026-10-06',
    items: [
      'Phone checks keep the Easy walk honest.',
    ],
  },
  {
    version: '1.4.363',
    title: 'Quiet pause waits until Home',
    when: '2026-10-06',
    items: [
      'A quiet pause shows only after you finish and get Home.',
    ],
  },
  {
    version: '1.4.362',
    title: 'Easy Lock In keeps the line you locked',
    when: '2026-10-06',
    items: [
      'Easy Lock In: the right why shows LOCKED!, then Say this tomorrow for that line. A quiet pause waits until after that line.',
    ],
  },
  {
    version: '1.4.361',
    title: 'Easy Lock In stacks the locked cards',
    when: '2026-10-06',
    items: [
      'Easy Lock In: LOCKED! sits above the cards on a phone. The why you kept and the main idea stay readable. Nothing covers the words.',
    ],
  },
  {
    version: '1.4.360',
    title: 'Easy win screen shows the next step',
    when: '2026-10-06',
    items: [
      'Easy Match road: after Helped!, the win card shows the line you kept, and Lock In next is a label you can read.',
    ],
  },
  {
    version: '1.4.359',
    title: 'Easy maze stays under a fast thumb',
    when: '2026-10-06',
    items: [
      'Easy Match road: quick taps keep the blue walker on the path. The board stays still instead of jumping or sticking.',
    ],
  },
  {
    version: '1.4.358',
    title: 'Easy Match stays at the inn',
    when: '2026-10-06',
    items: [
      'Easy Match: stepping onto the inn shows Helped! and ends the road. The round does not jump back to Find the hurt man.',
    ],
  },
  {
    version: '1.4.357',
    title: 'Easy Home shows what to do next',
    when: '2026-10-05',
    items: [
      'Easy Home numbers the trail: 1 Read, then 2 Match, then 3 Lock In. The gold button is the one to tap. Read comes first when today’s story is still open. Lock In waits until Match is done.',
    ],
  },
  {
    version: '1.4.356',
    title: 'Easy Keep/Toss first miss stays honest',
    when: '2026-10-05',
    items: [
      'Easy Keep/Toss: the first miss, with Toss empty and a line still on the card, says that line is not sorted yet. “A line is in the wrong bin” shows only when a line is sitting in the wrong bin.',
    ],
  },
  {
    version: '1.4.355',
    title: 'Easy Lock In stays with the proof',
    when: '2026-10-05',
    items: [
      'Easy Lock In no longer opens the Hurt Man maze. Lock In shows the line you just kept — main idea, why, and from — or the next beat when that beat is not the mercy road. Match still starts the road when that story is the one to play.',
    ],
  },
  {
    version: '1.4.354',
    title: 'Easy Keep/Toss names an unfinished line',
    when: '2026-10-05',
    items: [
      'Easy Keep/Toss: when Toss is empty and a line is still on the card, the note says that line is not sorted yet. “Those bins still mix” shows only when a line is sitting in the wrong bin.',
    ],
  },
  {
    version: '1.4.353',
    title: 'Easy Lock In why choices stay still',
    when: '2026-10-05',
    items: [
      'Easy Lock In “Tap why this is true”: on a phone the why choices stay put so a thumb can hit them. Toss, lock, and press still play.',
    ],
  },
  {
    version: '1.4.352',
    title: 'Hold to run ignores the phone menu',
    when: '2026-10-05',
    items: [
      'Easy Father Dash: holding Hold to run starts the run. A long press no longer opens the browser menu or selects the words on the button.',
    ],
  },
  {
    version: '1.4.351',
    title: 'Easy Lock In matches the story hold',
    when: '2026-10-05',
    items: [
      'After a sort walk (seed and soil): Lock In main-idea choices and why-blast now rehearse the same claim and reason you learned on the story — not the shorter sort tile lines.',
    ],
  },
  {
    version: '1.4.350',
    title: 'Easy Match ends after HELPED!',
    when: '2026-10-05',
    items: [
      'Story Creek road Match: when you reach the inn and see HELPED!, the maze grid closes and the win takeaway and Lock In button show — no fresh “Find the hurt man” board under the stamp.',
    ],
  },
  {
    version: '1.4.349',
    title: 'Night Watch debug freeze for playtests',
    when: '2026-10-05',
    items: [
      'Settings → Developer: Night Watch debug freeze (playtests). When on, Easy Night Watch starts each wave paused so walkers hold still while you read the side cue and tap the glowing face. Resume walkers / Pause walkers on the board. Default off — kids never see it unless a playtester turns it on.',
    ],
  },
  {
    version: '1.4.348',
    title: 'Night Watch porch lamp reaches the road',
    when: '2026-10-03',
    items: [
      'Easy Night Watch counts lamp range from the East porch seat out to the yellow road, so a walker in front of that lamp can take Love taps again. Walkers still down at the gate stay out of reach — no map-wide Love shot.',
    ],
  },
  {
    version: '1.4.347',
    title: 'Night Watch lamps respect range',
    when: '2026-10-03',
    items: [
      'Easy Night Watch only damages walkers that are close enough to the lamp or power you use. A far walker on the road is out of reach until it walks into range. Bill: “They can be attacked from anywhere.” That is fixed here.',
    ],
  },
  {
    version: '1.4.346',
    title: 'Night Watch faces lose the chevron',
    when: '2026-10-03',
    items: [
      'Easy Night Watch no longer puts a yellow triangle on the walker you should tap. The left list and the small tap pop still show who to hit. Fixes #489.',
    ],
  },
  {
    version: '1.4.345',
    title: 'Night Watch walkers stay one size',
    when: '2026-10-03',
    items: [
      'Night Watch faces on the road stay the same size while they walk. They do not start tiny and pop big on a tall phone. Fixes #488.',
    ],
  },
  {
    version: '1.4.344',
    title: 'Night Watch skills look like choices',
    when: '2026-10-03',
    items: [
      'After a wave, Still and Mend show as two big skill buttons you can tap. Love on the right glows Tap when it can take a spark. Fixes #493.',
    ],
  },
  {
    version: '1.4.343',
    title: 'Night Watch towers can level up',
    when: '2026-10-03',
    items: [
      'After a wave, tap a planted lamp or Love on the right rail. Each spark raises it to II or III. Fixes #491.',
    ],
  },
  {
    version: '1.4.342',
    title: 'Night Watch lets you plant lamps',
    when: '2026-10-03',
    items: [
      'Easy Night Watch opens with a plant step: tap gold rings on the map to add lamps, then tap Begin the watch. Fixes #492.',
    ],
  },
  {
    version: '1.4.341',
    title: 'More candy on the Home map',
    when: '2026-10-02',
    items: [
      'Easy Home: Star lamps, Sky Watch, and Meaning Ridge get candy map pictures as they grow, like the other lots on the map.',
    ],
  },
  {
    version: '1.4.340',
    title: 'Win verse you can read',
    when: '2026-10-02',
    items: [
      'After Father hugs you or the road says HELPED!, the Yes line and Bible bit are dark ink on cream so you can read them on your phone. Fixes #480.',
    ],
  },
  {
    version: '1.4.339',
    title: 'Remove ads stays on Home',
    when: '2026-10-02',
    items: [
      'After Lock In or Match, the quiet pause’s Remove ads button no longer drops you on Settings. It closes the pause, keeps you on Home, and says Remove ads · Coming with stores. Continue the trail still works. Fixes #475.',
    ],
  },
  {
    version: '1.4.338',
    title: 'Walk before Build It',
    when: '2026-10-02',
    items: [
      'On Easy Home, gold Build this only shows when a raise is really ready. If you still need today’s story, the dock sends you to Read today’s story — you do not pay to build; you finish the walk first. Fixes #438.',
    ],
  },
  {
    version: '1.4.337',
    title: 'Build It actually builds',
    when: '2026-10-02',
    items: [
      'On Easy Home, Build this now raises the building you earned — the map shows the next look instead of sending you to Walk. Fixes #438.',
    ],
  },
  {
    version: '1.4.336',
    title: 'Easy trail gets its own home',
    when: '2026-10-02',
    items: [
      'The Easy trail now lives in its own home. It works the same as before: a new line starts with Match, Lock In helps you keep it, then you go back Home for the next line. Fixes #476.',
    ],
  },
  {
    version: '1.4.335',
    title: 'Lock In gets its own home',
    when: '2026-10-02',
    items: [
      'Lock In now lives in its own home. It works the same as before: after Match teaches a line, Lock In helps you keep it, then you go back Home. A new line still starts with Match. Fixes #476.',
    ],
  },
  {
    version: '1.4.334',
    title: 'Father run gets its own home',
    when: '2026-10-01',
    items: [
      'Father run now lives in its own home. It plays the same as before: hold to run, press the glow, hug before the speech is done. Father run is still a Match game. Fixes #476.',
    ],
  },
  {
    version: '1.4.333',
    title: 'Match games get one home',
    when: '2026-10-01',
    items: [
      'Every Easy Match game now sits on one list: gem Match, Father run, road maze, Creed merge, source dig, and story snap. Each one plays the same as before, and Father run is still a Match game. Fixes #476.',
    ],
  },
  {
    version: '1.4.332',
    title: 'Easy Trail frame',
    when: '2026-10-01',
    items: [
      'Easy Trail has a frame of empty shelves for Match, Father, and Lock In. The games play the same. Those homes come later. Fixes #476.',
    ],
  },
  {
    version: '1.4.331',
    title: 'Night Watch health bar stays thin',
    when: '2026-10-01',
    items: [
      'The health line under each Night Watch walker is a thin bar, so it does not ride along as a big sticker while they move. Fixes #472.',
    ],
  },
  {
    version: '1.4.330',
    title: 'Night Watch tap stays small',
    when: '2026-10-01',
    items: [
      'Tapping a Night Watch face plays a short pop and a turn toward heaven. The face on the road stays small. Fixes #469.',
    ],
  },
  {
    version: '1.4.329',
    title: 'Night Watch Still and Mend',
    when: '2026-10-01',
    items: [
      'After a Night Watch wave, spend a spark on Still or Mend. During the next wave, Still freezes the walkers for a moment and Mend gives one heart back, up to three. The last wave still needs a stronger tool. Fixes #463.',
    ],
  },
  {
    version: '1.4.328',
    title: 'Night Watch five waves',
    when: '2026-10-01',
    items: [
      'One night is five waves. Clear a wave, spend sparks, then tap Continue for the next. Wave 5 is faster and tougher, so Love I leaks until a tool is raised. Each new walker tells a short story once in the side list. Fixes #462. Fixes #464.',
    ],
  },
  {
    version: '1.4.327',
    title: 'Night Watch towers upgrade',
    when: '2026-10-01',
    items: [
      'Night Watch Love, Logic, Reason, and Science show I, II, or III on the rail. Turning a walker earns a spark. After the wave, tap an unlocked tool to spend a spark and raise it. II and III reach farther and hit harder. Sparks are for this night only. Fixes #461',
    ],
  },
  {
    version: '1.4.326',
    title: 'Night Watch side roster',
    when: '2026-10-01',
    items: [
      'Night Watch kind names and taunts sit in a list on the left, so the road stays clear and the faces stay easy to see. Tap the face still marks who to tap. Fixes #460',
    ],
  },
  {
    version: '1.4.325',
    title: 'Night Watch enemy varieties',
    when: '2026-10-01',
    items: [
      'Night Watch walks all six kinds in one wave: Accuser, Cold Heart, Mockery, Tempter, Despair, and Whisper. The kind name by each face is big enough to read on a phone. Fixes #452',
    ],
  },
  {
    version: '1.4.324',
    title: 'Night Watch enemies remaining',
    when: '2026-10-01',
    items: [
      'Night Watch shows how many enemies are still left in the wave. The count starts at the wave total and drops each time a walker turns toward heaven, down to none left. Easy reads TAP N left. Hard reads N left · TAP. Fixes #453',
    ],
  },
  {
    version: '1.4.323',
    title: 'Night Watch HP bar',
    when: '2026-10-01',
    items: [
      'Each Night Watch walker has a gold HP bar under the face. The bar shrinks on a matching hit and empties when the walker turns toward heaven. Easy and Hard both show it. Fixes #451',
    ],
  },
  {
    version: '1.4.322',
    title: 'Night Watch walker portraits',
    when: '2026-10-01',
    items: [
      'Night Watch bad guys wear their own faces again. Cold Heart, Accuser, Tempter, Despair, Whisper, and Mockery each show a different portrait, so Easy is not one shared dark blob. Tap the face still marks who to tap. Fixes #450',
    ],
  },
  {
    version: '1.4.321',
    title: 'Match board stays planted',
    when: '2026-10-01',
    items: [
      'After you find the first word on Match, the letter grid stays in the same place and the same size. Letters you have not found look the same as they did before. Only the trail you just found pops. The word dock keeps its height, so the board does not jump. Fixes #443',
    ],
  },
  {
    version: '1.4.320',
    title: 'Easy restart keeps Match and Dig',
    when: '2026-10-01',
    items: [
      'After Start over, Home offers the open line’s Match game first. Gem Match is the arcade, and when the trail reaches a dig line that same Match opens Source Dig. Lock In quizzes wait until that game is finished, and a fresh walk does not reuse lines already marked taught. Fixes #448',
    ],
  },
  {
    version: '1.4.319',
    title: 'Easy show-it — Who helped?',
    when: '2026-10-01',
    items: [
      'Easy Learn for the mercy road (ph-road) plays a short show-it clip, then asks who helped with three pictures: the hurt man, someone walking past, and the helper. The helper opens Match. A wrong picture shakes so you can try again. Other Easy lessons keep the short story card. Fixes #439',
    ],
  },
  {
    version: '1.4.318',
    title: 'Easy Match person and place variety',
    when: '2026-10-01',
    items: [
      'Easy Match boards rotate keepers and places so the person and the spot change from board to board. Lark Banner, Ruth Quill, Leah Lamp, and the other keepers each hold the line where that story lives — Quiet Stoop, Creed Bench, Lamp Lane, Seed Field, and the rest — while the lesson words stay true. Fixes #444',
    ],
  },
  {
    version: '1.4.316',
    title: 'Night Watch enemy HP',
    when: '2026-10-01',
    items: [
      'Night Watch walkers now take more than one matching hit before they turn toward heaven. Tiny gold pips under each face show how many hits are left. On Easy most walkers need 2 taps (Despair needs 3), and every tap still counts. On Hard, quick walkers need 2, middle ones 3, and Despair 4; a weak tool still only pushes a walker back. Map, road, and the Love / Logic / Reason / Science dock are unchanged.',
    ],
  },
  {
    version: '1.4.315',
    title: 'Night Watch whole locked A2 plate',
    when: '2026-09-30',
    items: [
      'Night Watch now shows the whole painted A2 map instead of a landscape slice of it: all five candy cottages, the full winding yellow road, the golden gate, and the money-balloon corner. Walkers come in through the painted gate and follow the yellow road up to the top cottage, and the lamp lots sit on open ground beside the road. The Love / Logic / Reason / Science dock still floats on the right. Fixes #418',
    ],
  },
  {
    version: '1.4.314',
    title: 'Night Watch C&C float over map',
    when: '2026-09-30',
    items: [
      'Night Watch hands the map the full width: the right Love / Logic / Reason / Science dock now floats as a see-through cutaway over the map’s right edge instead of reserving its own column, so the purple strip beside the map is gone. The four buttons stay tappable, the money balloon, coin read, corner docks, and whole-map fit stay as they were. Fixes #418',
    ],
  },
  {
    version: '1.4.313',
    title: 'Night Watch compact chrome — map gets the space',
    when: '2026-09-30',
    items: [
      'Night Watch gives the map the room: the helper sticker, miss toast, plant button, tips, and the try-again card now float small on the stage’s bottom-left corner instead of stacking under it, Easy drops the “Night Watch / Tap the dark face.” title (the HUD and the on-map “Tap the face.” cue already teach it) and the duplicate tip line, so the stage takes that height. Whole-map fit and the right Love / Logic / Reason / Science rail stay as they were. Fixes #418',
    ],
  },
  {
    version: '1.4.312',
    title: 'Night Watch whole plate visible — undo zoom crop',
    when: '2026-09-30',
    items: [
      'Night Watch shows the whole candy map again: the board keeps the full stage under the chrome HUD beside the right C&C rail, but the map now fits inside it (cottages, the full yellow road, and the gate all at once) instead of zooming in on one cottage. Purple edges fill any leftover stage; walkers, lamps, and tap cues use the same fit so they stay on the road. Fixes #418',
    ],
  },
  {
    version: '1.4.311',
    title: 'Night Watch playfield full-bleed under chrome',
    when: '2026-09-30',
    items: [
      'Night Watch playfield fills the phone: the board takes every px under the chrome HUD beside the right C&C rail (no more short letterbox and empty purple below), the candy map cover-crops edge-to-edge around the yellow road, and walkers, lamps, and tap cues ride the same crop so they stay on the road. Fixes #418',
    ],
  },
  {
    version: '1.4.310',
    title: 'Night Watch UiShell — right C&C + chrome HUD',
    when: '2026-09-30',
    items: [
      'Night Watch UiShell: Love / Logic / Reason / Science dock now stands as a compact right rail beside the board (no bottom 2×2), purple chrome HUD bar carries hearts, TAP count, and an insight coin, and a left star balloon reads your existing stars — map-first, no new economy. Fixes #418',
    ],
  },
  {
    version: '1.4.309',
    title: 'Night Watch Map+Path — walkers on the A2 yellow road',
    when: '2026-09-30',
    items: [
      'Night Watch: walkers follow the painted yellow road centerline on the A2 map plate (bottom-edge entry, S-curve, top-edge exit); the jagged neon road overlay is gone and lot seats sit beside the painted road (#418)',
    ],
  },
  {
    version: '1.4.308',
    title: 'Night Watch ENEMIES — dark path walkers',
    when: '2026-09-30',
    items: [
      'Easy Night Watch: dark-face walkers on the soft TD path via the enemies module (Parts face when registered), with RAID_CAST taunts on each walker; the tap cue stays on path walkers, not a lone HTML face-circle (#418)',
    ],
  },
  {
    version: '1.4.307',
    title: 'Night Watch tower lamps on pads',
    when: '2026-09-30',
    items: [
      'Night Watch planted lots show idle and firing lamp tower sprites on their pads — soft TD plant toys only. Fixes #418',
    ],
  },
  {
    version: '1.4.306',
    title: 'Night Watch PARTS — sprite registry',
    when: '2026-09-30',
    items: [
      'Night Watch PartsModule: lot, lamp (idle/firing), and dark walker face cutouts live in src/assets/defend/ with registry fallbacks — soft TD play unchanged (#418)',
    ],
  },
  {
    version: '1.4.305',
    title: 'Night Watch A2 yellow road path',
    when: '2026-09-30',
    items: [
      'Night Watch: walker polyline and lot seats follow the A2 candy plate road — sharp gate turn, upper-left finish clear of the bush (#418)',
    ],
  },
  {
    version: '1.4.304',
    title: 'Night Watch A2 map plate',
    when: '2026-09-30',
    items: [
      'Fixes #418: Night Watch Easy board — A2 candy playfield plate paints under the soft-TD road and towers (MAP hop)',
    ],
  },
  {
    version: '1.4.303',
    title: 'Night Watch frame',
    when: '2026-09-30',
    items: [
      'Night Watch plays the same on Easy: the board now runs through its own frame, map, road, parts, lamp, and walker modules so new art and walkers can land one at a time (#418)',
    ],
  },
  {
    version: '1.4.302',
    title: 'Easy Night Watch little wave on path',
    when: '2026-09-27',
    items: [
      'Easy Night Watch: 2–3 dark walkers on the soft TD path with faces and taunts; tap walkers on the road (TAP juice kept). Bill redirect / Fixes #418',
    ],
  },
  {
    version: '1.4.301',
    title: 'Night Watch Phase 2 hop 1 — Easy TAP juice',
    when: '2026-09-27',
    items: [
      'Easy Night Watch: successful TAP pops squash, heaven-lift spark, gold + flash, and Combo ×2 from the second hit (Fixes #418)',
    ],
  },
  {
    version: '1.4.300',
    title: 'Easy Night Watch TAP Phase 1 taunt',
    when: '2026-09-27',
    items: [
      'Easy Night Watch: mid-wave TAP face shows walker kind label and short taunt on the cue bubble, with tap teach kept below (Fixes #418 residual)',
    ],
  },
  {
    version: '1.4.299',
    title: 'Easy Night Watch unpark',
    when: '2026-09-27',
    items: [
      'Easy: Night Watch opens from Home again so Phase 1 prove can run on Easy (Fixes #418 residual)',
    ],
  },
  {
    version: '1.4.298',
    title: 'Night Watch Phase 1 fantasy reskin',
    when: '2026-09-27',
    items: [
      'Night Watch: prayer-watch chrome, dark fantasy walker faces and short taunts, quiet Guardian · Messenger sticker (Fixes #418)',
    ],
  },
  {
    version: '1.4.297',
    title: 'Easy Dig tap verse ref reveals RSV text',
    when: '2026-09-27',
    items: [
      'Easy Dig: tap a Bible reference to read the RSV words in-app on parchment, with a quiet RSV line and optional Open full to BibleGateway (Fixes #416)',
    ],
  },
  {
    version: '1.4.296',
    title: 'Easy Samaritan less-is-more + smash + route variety',
    when: '2026-09-27',
    items: [
      'Easy Samaritan: earthen road tiles, square cells, and contain faces so the hurt man is not crushed; traveler token until you help (Fixes #414, Fixes #412)',
      'Easy Samaritan: rotate three authored road layouts so the first step is not always right (Fixes #413)',
    ],
  },
  {
    version: '1.4.295',
    title: 'Father Dash HOLD TO RUN cream void fill',
    when: '2026-09-27',
    items: [
      'Easy Father Dash: end #382 bottom auto-margin on the HOLD dock and grow run-speech so HOLD TO RUN sits without a cream void below (Fixes #406)',
    ],
  },
  {
    version: '1.4.294',
    title: 'Easy Lock In miss-teach cream void residual',
    when: '2026-09-27',
    items: [
      'Easy Lock In: restore flex fill on the miss-teach journal → recall-gate chain after #380 collapse so Main idea · why-true · From · Try again fill the portrait instead of leaving a cream void below (Fixes #405)',
    ],
  },
  {
    version: '1.4.293',
    title: 'Easy Lock In miss-teach cream void fill',
    when: '2026-09-27',
    items: [
      'Easy Lock In: grow why-blast.is-miss-teach + center why-miss-teach so Main idea · why-true · From · Try again fill the portrait instead of leaving a cream void below (Fixes #405)',
    ],
  },
  {
    version: '1.4.292',
    title: 'Easy Lock In quiz cream void fill',
    when: '2026-09-27',
    items: [
      'Easy Lock In: grow live quiz why-blast + center why-arena so claim · chips fill the portrait instead of leaving a cream void below (Fixes #379)',
    ],
  },
  {
    version: '1.4.291',
    title: 'Easy Match teach-dock unclamp',
    when: '2026-09-27',
    items: [
      'Easy Match: drop the 72px teach-dock clamp on phone portrait so LociStamp claim + WHO/WHERE/IDEA/KEEP chips stack with a readable gap instead of overlapping the prompt (Fixes #404)',
    ],
  },
  {
    version: '1.4.290',
    title: 'Easy Story Snap pad arcade squish invent',
    when: '2026-09-27',
    items: [
      'Easy Story Snap: finger-down squish + soft gold glow on the live SNAP pad (scale 0.94, translateY 3px) — invent Fun/Clear · Shot wake',
    ],
  },
  {
    version: '1.4.289',
    title: 'Easy LociStamp arcade squish invent',
    when: '2026-09-27',
    items: [
      'Easy pressable loci stamps: finger-down squish (scale 0.92, rotate -3deg) + soft gold glow on press — invent Fun/Clear climb toward Shot wake',
    ],
  },
  {
    version: '1.4.288',
    title: 'Easy City streets button arcade press invent',
    when: '2026-09-27',
    items: [
      'Easy Home street list: street buttons squish on press (scale 0.94, translateY 2px, brightness dip) — invent Fun/Clear climb toward Shot wake',
    ],
  },
  {
    version: '1.4.287',
    title: 'Easy Learn story-dock arcade punch invent',
    when: '2026-09-27',
    items: [
      'Easy Learn Short story: unlock CTA squish on press (scale 0.94, translateY 3px, inset shadow, brightness bump) — invent Fun/Clear climb toward Shot wake',
    ],
  },
  {
    version: '1.4.286',
    title: 'Easy Sort bin gulp press invent',
    when: '2026-09-27',
    items: [
      'Easy Sort: Keep/Toss bins squish on press (scale 0.94, translateY 3px, brightness dip) — invent Fun/Clear climb toward Shot wake',
    ],
  },
  {
    version: '1.4.285',
    title: 'Easy Sort tile arcade squish invent',
    when: '2026-09-27',
    items: [
      'Easy Sort: live sort tiles squish on finger-down (scale 0.92, inset press shadow); gone tiles unchanged — invent Fun/Clear climb toward Shot wake',
    ],
  },
  {
    version: '1.4.284',
    title: 'Easy Lock In why-chip tactile press invent',
    when: '2026-09-27',
    items: [
      'Easy Lock In mid-quiz: why-chips squish on finger-down (scale 0.92, inset press shadow) with float animation paused while held; gone, toss, win, and miss-teach unchanged — invent Fun/Clear climb toward Shot wake',
    ],
  },
  {
    version: '1.4.283',
    title: 'Easy Samaritan maze road-tile arcade press invent',
    when: '2026-09-27',
    items: [
      'Easy Samaritan road maze: finger-down arcade squish on walkable road tiles only (scale 0.92, inset press shadow); rock cells unchanged — invent Fun/Clear climb toward Shot wake',
    ],
  },
  {
    version: '1.4.282',
    title: 'Easy Father Hold-to-Run arcade spring invent',
    when: '2026-09-27',
    items: [
      'Easy Father Dash: HOLD TO RUN pad presses deeper while held (scale 0.96, translateY 6px) with a soft brightness bump; glow window adds pink drop-shadow — invent Fun/Clear climb toward Shot wake',
    ],
  },
  {
    version: '1.4.281',
    title: 'Easy Match gem tactile press invent',
    when: '2026-09-27',
    items: [
      'Easy Match: finger-down arcade squish on gem cells (scale 0.92); selected (.is-sel) and match-burst (.is-burst) cells keep their existing pop and burst — invent Fun/Clear climb toward Shot wake',
    ],
  },
  {
    version: '1.4.280',
    title: 'Easy Father Dash: ≤720 close tall residual cream gap (Fixes #382)',
    when: '2026-09-27',
    items: [
      'Fixes #382: Easy Father Dash on ≤720 / phone portrait — pack the timing rail and HOLD TO RUN with a modest gap so the massive empty cream band between slider and CTA is gone, including layout viewports taller than the 920 cap (Shot 270 residual after cream floors 257/266; opaque cream floors stay; leftover cream may sit below the dock; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.279',
    title: 'Easy Samaritan HURT MAN/HELP pill contrast',
    when: '2026-09-27',
    items: [
      'Easy Samaritan mid-play: HURT MAN and HELP beat pills use dark ink on light yellow got/now chips so labels stay readable (Fixes #381)',
    ],
  },
  {
    version: '1.4.278',
    title: 'Easy Lock In miss-teach: HUD peel restores one LOCK IN label',
    when: '2026-09-27',
    items: [
      'Easy Lock In miss-teach on phone portrait: WhyBlast HUD peel had hidden both LOCK IN eyebrows — outer section label shows again (exactly one; inner duplicate stays hidden per 1.4.277) (Fixes #380; follow-up prove A)',
    ],
  },
  {
    version: '1.4.277',
    title: 'Easy Lock In miss-teach: ≤720 nested framing collapse',
    when: '2026-09-27',
    items: [
      'Easy Lock In miss-teach on phone portrait: one LOCK IN label, a single cream card without triple nested borders, and Try again sits right under the From line instead of across a giant empty gap (Fixes #380; cream floors from earlier peels stay)',
    ],
  },
  {
    version: '1.4.276',
    title: 'Easy Manage sheet: ≤720 smooth header fade',
    when: '2026-09-27',
    items: [
      'Easy Manage sheet on phone portrait: scrolling cards fade smoothly under the solid header instead of getting cut in half, with the hidden scrollbar and last TOOL padding kept (other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.275',
    title: 'Easy Manage sheet: ≤720 header scroll mask',
    when: '2026-09-27',
    items: [
      'Easy Manage sheet on phone portrait: scrolling cards fade behind a solid header plate so the title stays readable, and the hidden scrollbar plus last TOOL padding stay (other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.274',
    title: 'Easy Manage sheet: ≤720 hide scrollbar + fix clip',
    when: '2026-09-27',
    items: [
      'Easy Manage sheet on phone portrait: the card list hides the default web scrollbar and still swipes, and the last TOOL card can scroll fully into view (other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.273',
    title: 'Easy Star lamps Manage sheet: ≤720 kid-clear copy',
    when: '2026-09-26',
    items: [
      'Easy Star lamps Manage sheet on phone portrait: the job says more room here for ideas you kept, the next line says catch twelve stars or keep a night, PLACE shows Remember instead of repeating the title, and the subtitle is Juniper’s street light. The head-to-job gap tightens slightly (other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.272',
    title: 'Easy Lock In hub: ≤720 close empty purple void (Fixes #384)',
    when: '2026-09-26',
    items: [
      'Fixes #384: Easy Lock In hub on ≤720 / phone portrait — stored-lines list opens by default and the journal body fills with an opaque cream floor so claim, why, and from sit under the head instead of a collapsed row over a purple void, including layout viewports taller than the 920 cap (hub list only; the quiz path is unchanged; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.271',
    title: 'Easy Match: ≤720 close tall residual cream gap (Fixes #378)',
    when: '2026-09-26',
    items: [
      'Fixes #378: Easy Match gem-search letter grid and Mercy road board on ≤720 / phone portrait — pack the objective strip toward the tile grid (stage flex-start, no vertical centering of the content-sized board) so the dead cream band between the tabs and the grid shrinks, including layout viewports taller than the 920 cap (Shot 270 residual after Match cream-floor peel 1.4.262; cream floor stays under the grid; found counter stays readable; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.270',
    title: 'Easy one-more win-end dock: ≤720 arcade punch tall-phone juice (Shot wake)',
    when: '2026-09-26',
    items: [
      'Easy Match / Snap / Lock In win-end on ≤720 / phone portrait: extend win-end dock compress still at max-height 720px across max-height 920px and taller layout viewports, and punch the one-more / continue button arcade-loud — claim stays readable and the win stamp is not crowded (invent Fun/Clear · Shot wake version; Hold win continue stays on the 268 punch; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.269',
    title: 'Easy Story Snap: ≤720 residual juice tall-phone punch',
    when: '2026-09-26',
    items: [
      'Easy Story Snap on ≤720 / phone portrait: extend HUD peel 182 strip · chip compress across max-height 920px and taller layout viewports, and punch the snap CTA plus score · miss juice arcade-loud without crowding the snap board (invent Fun/Clear; continuation of Story Snap HUD 241; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.268',
    title: 'Easy Hold dock: ≤720 arcade punch tall-phone juice',
    when: '2026-09-26',
    items: [
      'Easy Hold (Story Creek HOLD) on ≤720 / phone portrait: extend HUD peel 156 dock compress across max-height 920px and taller layout viewports, and punch the Hold dock CTA plus timing juice (score · miss · LOCKED) arcade-loud on the cream plate — claim stays readable (invent Fun/Clear; continuation of Hold HUD 242; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.267',
    title: 'Easy Manage sheet: ≤720 close purple bar / misalign (Fixes #367)',
    when: '2026-09-26',
    items: [
      'Fixes #367: Easy Manage lot sheet on ≤720 / phone portrait — full-width sheet bottom (stretch · width 100% · square bottom edge · opaque plate · safe-area padding inside) and the leftover purple belt is removed so the bottom-right is the sheet, not a darker bar or cutout, including layout viewports taller than the 920 cap (Shot 260 residual after Manage black-void peel 1.4.258; map peek above stays; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.266',
    title: 'Easy Father Dash: ≤720 close tall residual purple void (Fixes #366)',
    when: '2026-09-26',
    items: [
      'Fixes #366: Easy Father Dash timing-rail chrome on ≤720 / phone portrait — opaque cream app-body + play shell + cream HOLD TO RUN dock (no purple-gold gradient · dark ink on caption and speech · rail stays readable · dock pinned to the cream floor) so leftover between the slider and HOLD TO RUN is intentional cream floor, including layout viewports taller than the 920 cap (Shot 260 residual after Father cream peel 1.4.257; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.265',
    title: 'Easy Samaritan: ≤720 close tall residual purple void (Fixes #365)',
    when: '2026-09-26',
    items: [
      'Fixes #365: Easy Samaritan / road maze chrome on ≤720 / phone portrait — opaque cream app-body + play shell + solid maze-stage and maze-board plate (no purple-gold gradient · match-score pinned to the cream floor) so leftover between the HUD, board, and footer is intentional cream floor, including layout viewports taller than the 920 cap (Shot 260 residual after Samaritan cream peel 1.4.256; road tiles and target chips stay readable; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.264',
    title: 'Easy Lock In feedback: ≤720 close tall residual purple void (Fixes #364)',
    when: '2026-09-26',
    items: [
      'Fixes #364: Easy Lock In miss-teach feedback chrome on ≤720 / phone portrait — opaque cream app-body + journal miss-teach shell + solid recall-gate feedback plate (no purple-gold gradient · dark ink on claim and reason · Try again pinned to the cream floor · horizontal overflow pin so content stays in viewport) so leftover below feedback is intentional cream floor, including layout viewports taller than the 920 cap (Shot 260 residual after Lock In feedback cream peel 1.4.255; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.263',
    title: 'Easy Lock In quiz: ≤720 close tall residual purple void (Fixes #363)',
    when: '2026-09-26',
    items: [
      'Fixes #363: Easy Lock In live quiz chrome on ≤720 / phone portrait — opaque cream app-body + journal rehearse shell + solid recall-gate quiz plate (no purple-gold gradient · dark ink on claim and gold-outline options) so leftover below the quiz card is intentional cream floor, including layout viewports taller than the 920 cap (Shot 260 residual after Lock In quiz cream peel 1.4.254; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.262',
    title: 'Easy Match: ≤720 close tall residual purple void (Fixes #362)',
    when: '2026-09-26',
    items: [
      'Fixes #362: Easy Match gem-search / Story Creek letter grid on ≤720 / phone portrait — opaque cream app-body + play shell + solid gem-scroll/stage (no purple-gold gradient · found-counter pinned to the cream floor) so leftover between the grid and the counter is intentional cream floor, including layout viewports taller than the 920 cap (Shot 260 residual after Match cream peel 1.4.253; letter tiles stay readable; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.261',
    title: 'Easy Learn: ≤720 close tall residual purple void (Fixes #361)',
    when: '2026-09-26',
    items: [
      'Fixes #361: Easy Learn Short Story / Story Creek teach chrome on ≤720 / phone portrait — full-bleed cream app-body + is-teach shell + solid recall-gate teach card (no purple-gold gradient · dark ink on claim / reason / source · Help-on-the-road dock pinned to the cream floor) so leftover below the lesson is intentional cream floor, including layout viewports taller than the 920 cap (Shot 260 residual after Learn cream peel 1.4.252; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.260',
    title: 'Easy Creed Claim merge: ≤720 HUD deepen tall-phone juice (Shot wake)',
    when: '2026-09-26',
    items: [
      'Easy Creed Claim merge (is-claim-merge) on ≤720 / phone portrait: deepen HUD peel 181 so score · next · mini · ladder dots · Drop chip compress thin on tall phones — bowl + Drop stay loud (invent Fun/Clear · Shot wake version; continuation of Creed HUD hide 233 + fill/dock 220; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.259',
    title: 'Easy panel-blast / SNAG: ≤720 board-first HUD + tall-phone SNAG juice',
    when: '2026-09-26',
    items: [
      'Easy panel-blast / SNAG bonus (GemSearch is-panel-blast) on ≤720 / phone portrait: extend board-first HUD peel so how + teach-say hide and teach-dock / LociStamp / chips / score compress thin, plus punch BONUS! +100 SNAG overlay arcade-loud on the cream board with gold bonus-pts — dock · board · SNAG · CTA stay clear on tall phones (invent Fun/Clear; continuation of panel-blast board-first HUD peel 168 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.258',
    title: 'Easy Manage sheet: ≤720 close tall-phone black void / bottom cutout (Fixes #350)',
    when: '2026-09-26',
    items: [
      'Fixes #350: Easy Manage lot sheet on ≤720 / tall phone portrait — opaque body:has floor + visual-viewport pin (100dvh · min-height 100svh) + bottom-only opaque ::after belt + opaque gold sheet plate (safe-area · slightly taller max-height) so the bottom of the portrait is intentional purple sheet chrome, not a dead black void / cutout under the sheet (Shot 250 residual after Manage width peel 1.4.230; map peek above stays; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.257',
    title: 'Easy Father Dash: ≤720 close tall-phone rail→CTA purple void residual (Fixes #349)',
    when: '2026-09-26',
    items: [
      'Fixes #349: Easy Father Dash timing-rail chrome on ≤720 / tall phone portrait — paint opaque cream app-body + .play.is-father-run shell + solid cream run plate (no purple-gold gradient bleed · warm run-scene · cream HOLD TO RUN dock pinned to cream floor) so leftover rail→CTA is intentional cream floor, not a dead purple band (Shot 250 residual after Father cream peel 1.4.250; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.256',
    title: 'Easy Samaritan: ≤720 close tall-phone purple voids + top clip residual (Fixes #348)',
    when: '2026-09-26',
    items: [
      'Fixes #348: Easy Samaritan / road maze chrome on ≤720 / tall phone portrait — paint opaque cream app-body + .play.is-road-maze shell + solid cream maze-stage / warm maze-board (no purple-gold gradient bleed · cream match-score / CTA dock pinned to cream floor · top pad so HUD stays in viewport) so leftover above/below the board is intentional cream floor, not dead purple voids or top clip (Shot 250 residual after Samaritan cream peel 1.4.249; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.255',
    title: 'Easy Lock In feedback: ≤720 close tall-phone purple void + left clip residual (Fixes #347)',
    when: '2026-09-26',
    items: [
      'Fixes #347: Easy Lock In miss-teach feedback chrome on ≤720 / tall phone portrait — paint opaque cream app-body + miss-teach shell + solid recall-gate plate (no purple-gold gradient · cream CTA dock pinned to cream floor · horizontal overflow pin so content stays in viewport) so leftover below feedback is intentional cream floor, not a dead purple band or left-edge clip (Shot 250 residual after Lock In feedback cream peel 1.4.248; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.254',
    title: 'Easy Lock In quiz: ≤720 close tall-phone purple void residual (Fixes #346)',
    when: '2026-09-26',
    items: [
      'Fixes #346: Easy Lock In live quiz chrome on ≤720 / tall phone portrait — paint opaque cream app-body + live-quiz shell + solid recall-gate plate (no purple-gold gradient · cream CTA dock pinned to cream floor) so leftover below the quiz is intentional cream floor, not a dead purple band under the stack (Shot 250 residual after Lock In quiz cream peel 1.4.247; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.253',
    title: 'Easy Match: ≤720 close tall-phone purple void residual (Fixes #345)',
    when: '2026-09-26',
    items: [
      'Fixes #345: Easy Match gemSearch / picture-deal chrome on ≤720 / tall phone portrait — paint opaque cream app-body + play shell + solid gem-scroll/stage plate (no purple-gold gradient bleed · warm board · cream match-score / CTA dock pinned to cream floor) so leftover below the grid is intentional cream floor, not a dead purple band under the stack (Shot 250 residual after Match cream peel 1.4.246; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.252',
    title: 'Easy Learn: ≤720 close tall-phone purple void residual (Fixes #344)',
    when: '2026-09-26',
    items: [
      'Fixes #344: Easy Learn Meaning Ridge cream-pill / teach-gate chrome on ≤720 / tall phone portrait — paint opaque cream app-body + is-teach shell + solid teach-gate plate (no recall-gate purple-gold gradient · cream Find-the-gems dock pinned to cream floor) so leftover below the lesson is intentional cream floor, not a dead purple band under the stack (Shot 250 residual after Learn cream peel 1.4.245; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.251',
    title: 'Easy Home: Learn / Lock In dock button contrast (Fixes #343)',
    when: '2026-09-26',
    items: [
      'Fixes #343: Easy Home dock Match · Learn · Lock In coach pills — force cream parchment labels + full opacity + clearer gold lip on dusk purple fill so Learn / Lock In are readable (Shot 250 Home fail: dark text on dark dock; Match is-now gold highlight stays; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.250',
    title: 'Easy Father Dash: ≤720 close tall-phone rail→CTA purple void residual (Fixes #336)',
    when: '2026-09-26',
    items: [
      'Fixes #336: Easy Father Dash timing-rail chrome on ≤720 / tall phone portrait — paint opaque cream parchment play plate + warm run-scene (dark ink · warm speech card · HOLD TO RUN dock pinned to cream floor) so leftover rail→CTA fill is intentional cream surface, not a dead purple band under the timing rail (Shot 240 residual after Father Dash tall-void peel 1.4.240; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.249',
    title: 'Easy Samaritan: ≤720 close tall-phone voids above/below board residual (Fixes #335)',
    when: '2026-09-26',
    items: [
      'Fixes #335: Easy Samaritan / Story Creek road maze on ≤720 / tall phone portrait — paint cream parchment maze-stage plate + warm maze-board plate (denser stretch · match-score / cta-dock pinned to cream floor) so leftover fill is intentional cream board stage, not purple voids above/below the board (Shot 240 residual after Samaritan tall-void peel 1.4.239; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.248',
    title: 'Easy Lock In feedback: ≤720 close tall-phone bottom-half purple void residual (Fixes #334)',
    when: '2026-09-26',
    items: [
      'Fixes #334: Easy Lock In miss-teach feedback on ≤720 / tall phone portrait — paint parchment cream recall-gate plate (transparent why-miss-teach · dark ink · denser stretch · Try-again dock pinned to cream floor) so leftover fill is cream-inside-card, not a dead purple band under the stack (Shot 240 residual after Lock In feedback tall-void peel 1.4.238; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.247',
    title: 'Easy Lock In quiz: ≤720 close tall-phone bottom-half purple void residual (Fixes #333)',
    when: '2026-09-26',
    items: [
      'Fixes #333: Easy Lock In live mid-question quiz on ≤720 / tall phone portrait — paint parchment cream recall-gate plate (dark ink · denser why-arena stretch · CTA dock pinned to cream floor) so leftover fill is cream-inside-card, not a dead purple band under the quiz (Shot 240 residual after Lock In quiz tall-void peel 1.4.237; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.246',
    title: 'Easy Match: ≤720 close tall-phone grid→footer purple void residual (Fixes #332)',
    when: '2026-09-26',
    items: [
      'Fixes #332: Easy Match gemSearch / picture-deal on ≤720 / tall phone portrait — paint cream parchment gem-scroll·stage · warm board plate · denser grid stretch (and match-grid cream plate on picture-deal) so leftover fill is intentional cream board stage, not a dead purple band between grid and footer (Shot 240 residual after Match tall-void peel 1.4.236; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.245',
    title: 'Easy Learn: ≤720 close tall-phone bottom purple void residual (Fixes #331)',
    when: '2026-09-26',
    items: [
      'Fixes #331: Easy Learn cream-pill on ≤720 / tall phone portrait — paint parchment teach-gate cream plate (dark ink · triad space-between + row pad · Find-the-gems dock pinned to cream floor) so leftover fill is cream-inside-card, not a dead purple band under the CTAs (Shot 240 residual after Learn tall-void peel 1.4.235; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.244',
    title: 'Easy Sort: ≤720 close board-first HUD on tall phone',
    when: '2026-09-26',
    items: [
      'Easy Sort on ≤720 / phone portrait: extend board-first HUD peel so how + hint hide and lead clamps thin — Keep·Toss · bank · bins stay clear on tall phones (invent Fun/Clear; continuation of Sort board-first HUD peel 183 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.243',
    title: 'Easy Sequence / Build: ≤720 close board-first HUD on tall phone',
    when: '2026-09-26',
    items: [
      'Easy Sequence / Build on ≤720 / phone portrait: extend board-first HUD peel so how + hint hide and lead clamps thin — board · slots · bank · CTA stay clear on tall phones (invent Fun/Clear; continuation of Sequence/Build board-first HUD peel 171 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.242',
    title: 'Easy Hold: ≤720 close HUD peel on tall phone',
    when: '2026-09-26',
    items: [
      'Easy Hold on ≤720 / phone portrait: extend HUD peel so outer eyebrow + quiet From hide and arena · next-tap · chips stay clear — no buried claim on tall phones (invent Fun/Clear; continuation of Hold arena-first HUD peel 170 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.241',
    title: 'Easy Story Snap: ≤720 close HUD peel on tall phone',
    when: '2026-09-26',
    items: [
      'Easy Story Snap on ≤720 / phone portrait: extend HUD peel so eyebrow + who·where hide and stage · strip · pad stay clear — no buried pad on tall phones (invent Fun/Clear; continuation of Story Snap HUD peel 182 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.240',
    title: 'Easy Father Dash: ≤720 close tall-phone rail→CTA purple void (Fixes #319)',
    when: '2026-09-26',
    items: [
      'Fixes #319: Easy Father Dash timing-rail on ≤720 / tall phone portrait — strengthen fill 229 (ancestor height 100% chain on app-body · puzzle page, play overflow hidden, run-scene flex 1 1 0 absorb leftover, speech→rail compress, cta-dock position static + margin-top 0 + clear sticky blur plate) so HOLD TO RUN packs tight to the rail without a massive purple band (Shot 230 residual after Father Dash peel 1.4.229; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.239',
    title: 'Easy Samaritan: ≤720 close tall-phone voids above/below board (Fixes #318)',
    when: '2026-09-26',
    items: [
      'Fixes #318: Easy Samaritan / Story Creek road maze on ≤720 / tall phone portrait — strengthen fill 228 (height 100% chain, maze-stage · maze-board flex 1 1 0 absorb leftover, drop aspect-ratio / max-height caps, cta-dock position static) so board fills portrait without large dead purple bands above/below (Shot 230 residual after Samaritan voids peel 1.4.228 + invent HUD 1.4.234; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.238',
    title: 'Easy Lock In feedback: ≤720 close tall-phone bottom-half purple void (Fixes #317)',
    when: '2026-09-26',
    items: [
      'Fixes #317: Easy Lock In miss-teach feedback on ≤720 / tall phone portrait — strengthen fill 227 (height 100% chain, why-miss-teach flex 1 1 0 absorb leftover, cta-dock position static + margin-top auto) so feedback card + Try again fill portrait without a large dead purple band under the stack (Shot 230 residual after Lock In feedback bottom-half peel 1.4.227; live quiz / win-end / other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.237',
    title: 'Easy Lock In quiz: ≤720 close tall-phone bottom-half purple void (Fixes #316)',
    when: '2026-09-26',
    items: [
      'Fixes #316: Easy Lock In live mid-question quiz on ≤720 / tall phone portrait — strengthen fill 226 (height 100% chain, why-arena flex 1 1 0 absorb leftover, cta-dock position static + margin-top auto) so quiz card + choices fill portrait without a large dead purple band under the card (Shot 230 residual after Lock In quiz bottom-half peel 1.4.226; miss-teach / win-end / other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.236',
    title: 'Easy Match: ≤720 close tall-phone bottom-half purple void (Fixes #315)',
    when: '2026-09-26',
    items: [
      'Fixes #315: Easy Match on ≤720 / tall phone portrait — strengthen fill 232 picture-deal + fill 225 gemSearch (height 100% chain, match-grid / gem-scroll·stage·board flex 1 1 0 absorb leftover, status follows grid, cta-dock position static + margin-top auto) so Match board + status fill portrait without a large dead purple band under the UI (Shot 230 residual after Match bottom-third peel 1.4.225 + invent picture-deal 1.4.232; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.235',
    title: 'Easy Learn: ≤720 close tall-phone bottom-half purple void (Fixes #314)',
    when: '2026-09-26',
    items: [
      'Fixes #314: Easy Learn cream-pill on ≤720 / tall phone portrait — strengthen fill 224 (height 100% chain, held-triad space-evenly intentional spacing, Find-the-gems dock position static + margin-top auto) so Learn content + CTAs fill portrait without a large dead purple band under the stack (Shot 230 residual after Learn bottom-half peel 1.4.224; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.234',
    title: 'Easy Story Creek: ≤720 close maze HUD peel on tall phone',
    when: '2026-09-26',
    items: [
      'Easy Story Creek road maze on ≤720 / phone portrait: extend HUD peel so who·where kicker · thumbs · caption hide and maze-beats + board stay clear — no buried board on tall phones (invent Fun/Clear; continuation of Story Creek maze HUD peel 175 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.233',
    title: 'Easy Creed: ≤720 close Claim merge HUD peel on tall phone',
    when: '2026-09-26',
    items: [
      'Easy Creed Claim merge on ≤720 / phone portrait: extend HUD peel so who·where kicker + ladder rung names hide and bowl · Drop stay clear — no buried bowl on tall phones (invent Fun/Clear; continuation of Creed merge HUD peel 181 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.232',
    title: 'Easy Match: ≤720 close fill + score→CTA purple void on tall phone',
    when: '2026-09-26',
    items: [
      'Easy Match (picture · main idea deal) on ≤720 / phone portrait: extend fill + score→CTA so match-grid absorbs free space and score · Next CTA pack tight — no large purple void under the score / before the dock on tall phones (invent Fun/Clear; continuation of Match fill 184 / score→CTA 207 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.231',
    title: 'Easy Lock In win-end: ≤720 close fill + triad→Home purple void on tall phone',
    when: '2026-09-26',
    items: [
      'Easy Lock In win-end (StoredLine · SAY THIS TOMORROW · TownReturn Home) on ≤720 / phone portrait: extend fill + triad→Home so after-win shell / stored-line absorb free space and claim·reason·source · Home pack tight — no large purple void under the triad / before Home on tall phones (invent Fun/Clear; continuation of Lock In win-end fill 185 / triad→Home 208 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.230',
    title: 'Easy Manage sheet: ≤720 close width cutout / exposed purple (Fixes #302)',
    when: '2026-09-26',
    items: [
      'Fixes #302: Easy Manage lot sheet on ≤720 / phone portrait — edge-to-edge width (stretch align · 100vw · max-width none · zero side margin) so the gold sheet spans the viewport without awkward cutout / exposed purple bars beside it (Shot 220 residual after Manage peek / hub chrome peels; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.229',
    title: 'Easy Father Dash: ≤720 close timing-rail→CTA purple void (Fixes #301)',
    when: '2026-09-26',
    items: [
      'Fixes #301: Easy Father Dash timing-rail on ≤720 / phone portrait — strengthen fill so play overflow hidden · run-scene flex 1 1 0 absorbs free space and cta-dock is position static with margin-top 0 — no massive purple void between the timing rail and HOLD TO RUN / LET GO on tall phones (Shot 220 residual after Father Dash peel 1.4.216; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.228',
    title: 'Easy Samaritan: ≤720 close voids above/below board (Fixes #300)',
    when: '2026-09-26',
    items: [
      'Fixes #300: Easy Samaritan (Story Creek road maze) on ≤720 / phone portrait — extend fill 191 + board→CTA 201 across max-height 920px so maze-stage · maze-board absorb free space and cta-dock does not steal it — no large purple voids above/below the board on tall phones (Shot 220 residual after Story Creek fill 1.4.191; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.227',
    title: 'Easy Lock In feedback: ≤720 close bottom-half purple void (Fixes #299)',
    when: '2026-09-26',
    items: [
      'Fixes #299: Easy Lock In feedback on ≤720 / phone portrait — extend miss-teach shell fill 195 + pad-zero 213 across max-height 920px so app-body · journal · rehearse-anchor · recall-gate · why-miss-teach absorb free space, zero residual phone-safe padding, and pin Try again — no massive purple void across the bottom half of the card on tall phones (Shot 220 residual after Lock In feedback peel 1.4.213; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.226',
    title: 'Easy Lock In quiz: ≤720 close bottom-half purple void (Fixes #298)',
    when: '2026-09-26',
    items: [
      'Fixes #298: Easy Lock In quiz on ≤720 / phone portrait — extend quiz shell fill 194 + pad-zero 212 across max-height 920px so app-body · journal · rehearse-anchor · recall-gate absorb free space and zero residual phone-safe padding — no massive purple void across the bottom half of the card on tall phones (Shot 220 residual after Lock In quiz peel 1.4.212; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.225',
    title: 'Easy Match: ≤720 close bottom-third purple void (Fixes #297)',
    when: '2026-09-26',
    items: [
      'Fixes #297: Easy Match gemSearchGrid on ≤720 / phone portrait — extend leftover-height fill 211 + grid→footer fill 193 across max-height 920px so gem-scroll · stage · board absorb free space and status follows the grid — no massive purple void across the bottom third of the card on tall phones (Shot 220 residual after Match leftover-height peel 1.4.211; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.224',
    title: 'Easy Learn: ≤720 close bottom-half purple void (Fixes #296)',
    when: '2026-09-26',
    items: [
      'Fixes #296: Easy Learn cream-pill on ≤720 / phone portrait — tighten fill 215 (zero app-body / teach-gate bottom pad, flex 1 1 0 on page · card · held-triad, EasyBack pin, dock margin-top auto) so Learn content + CTAs fill portrait without a large dead purple band under the stack (Shot 220 residual after Learn CTA void peel 1.4.215; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.223',
    title: 'Easy Story Snap: ≤720 close fill + pad→CTA purple void on tall phone',
    when: '2026-09-25',
    items: [
      'Easy Story Snap on ≤720 / phone portrait: extend fill + pad→CTA so snap-stage absorbs free space and snap pad · CTA pack tight — no large purple void under the pad on tall phones (invent Fun/Clear; continuation of Story Snap fill 197 / pad→CTA 209 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.222',
    title: 'Easy Sequence: ≤720 close fill + stones→result purple void on tall phone',
    when: '2026-09-25',
    items: [
      'Easy Sequence order on ≤720 / phone portrait: extend fill + stones→result so order bank / stone tiles absorb free space and pack tight to ResultPanel — no large purple void under the stones on tall phones (invent Fun/Clear; continuation of Sequence fill 186 / stones→result 205 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.221',
    title: 'Easy Build: ≤720 close fill purple void on tall phone',
    when: '2026-09-25',
    items: [
      'Easy Build Argument on ≤720 / phone portrait: extend deal + free-place fill so slots · bank · Check lock absorb free space — no large purple void under the lock / bank on tall phones (invent Fun/Clear; continuation of Build deal fill 187 / free-place 203 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.220',
    title: 'Easy Creed: ≤720 close fill + bowl→CTA purple void on tall phone (Shot wake)',
    when: '2026-09-25',
    items: [
      'Easy Creed merge on ≤720 / phone portrait: extend fill + dock-margin so score · ladder · bowl absorb free space and pack tight to the CTA — no large purple void under the bowl on tall phones (invent Fun/Clear · Shot wake hop — CoS wakes Shot after merge; continuation of Creed fill 192 / dock 200 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.219',
    title: 'Easy Link: ≤720 close fill + choices→CTA purple void on tall phone',
    when: '2026-09-25',
    items: [
      'Easy Link on ≤720 / phone portrait: extend fill + dock-margin so clue · picture choices absorb free space and pack tight to the CTA — no large purple void under the choice column on tall phones (invent Fun/Clear; continuation of Link fill 188 / dock 199 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.218',
    title: 'Easy Sort: ≤720 close fill purple void on tall phone',
    when: '2026-09-25',
    items: [
      'Easy Sort Keep·Toss on ≤720 / phone portrait: extend fill so play + bank seats / bins absorb free space — no large purple void under the bins on tall phones (invent Fun/Clear; continuation of Sort fill 198 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.217',
    title: 'Easy Hold: ≤720 close hud→arena purple void',
    when: '2026-09-25',
    items: [
      'Easy Hold (WhyBlast Lock In live) on ≤720 / phone portrait: extend fill + dock-margin + hud→arena gap tighten so next-tap · claim · chips · CTA pack tight — no large purple void between hud and arena on tall phones (invent Fun/Clear; continuation of Hold fill 190 / dock 202 / hud 210 ≤720 family; other Easy / Shot peels untouched)',
    ],
  },
  {
    version: '1.4.216',
    title: 'Easy Father Dash: ≤720 close timing-rail→CTA purple void',
    when: '2026-09-25',
    items: [
      'Easy Father Dash timing-rail on ≤720 / phone portrait: extend speech→rail + pad compress so the timing rail and LET GO CTA pack tight — no large purple void between them (Fixes #283; continuation of Father Dash fill/dock / Creek HOLD 214 phone-portrait family; do not touch other Shot 210 issues)',
    ],
  },
  {
    version: '1.4.215',
    title: 'Easy Learn: ≤720 close CTA purple void beneath cream-pill',
    when: '2026-09-25',
    items: [
      'Easy Learn cream-pill (Short story · LociStamp · HeldTriad · CTAs) on ≤720 / phone portrait: extend fill so is-teach + easy-story-card grow and held-triad absorbs free space — no large purple void beneath the CTAs (Fixes #280; continuation of Learn held-clear fill 206; do not touch other Shot 210 issues)',
    ],
  },
  {
    version: '1.4.214',
    title: 'Easy Story Creek speech: ≤720 close slider→HOLD purple void',
    when: '2026-09-25',
    items: [
      'Easy Story Creek speech / hold on ≤720 phone portrait: extend fill + dock-margin so the timing slider and HOLD TO RUN pack tight — no large purple void between them (Fixes #272; continuation of the earlier speech-hold dock peel; do not touch other Shot 200 issues)',
    ],
  },
  {
    version: '1.4.213',
    title: 'Easy Lock In feedback: ≤720 close bottom purple void',
    when: '2026-09-25',
    items: [
      'Easy Lock In feedback / miss teach on ≤720px tall: pack the residual phone-safe bottom padding so Main idea · Why this is true · From · Try again reach the lower portrait edge without a dead purple band (Fixes #275; continuation of the earlier feedback shell peel; do not touch other Shot 200 issues)',
    ],
  },
  {
    version: '1.4.212',
    title: 'Easy Lock In quiz: ≤720 close lower-third purple void',
    when: '2026-09-25',
    items: [
      'Easy Lock In mid-question quiz on ≤720px tall: pack the residual phone-safe bottom padding so the quiz card and choices reach the lower portrait edge without a dead purple band (Fixes #274; continuation of the earlier quiz shell peel; do not touch other Shot 200 issues)',
    ],
  },
  {
    version: '1.4.211',
    title: 'Easy Match: ≤720 close grid→status purple void',
    when: '2026-09-25',
    items: [
      'Easy Match letter grid on ≤720px tall: restore the board fill after the later art-tight square override so the grid and bottom status counter pack tight — no large purple void (Fixes #273; continuation of Match grid→footer #250 / 1.4.193; do not touch other Shot 200 issues)',
    ],
  },
  {
    version: '1.4.210',
    title: 'Easy Hold: ≤720 close hud→arena purple gap',
    when: '2026-09-25',
    items: [
      'Easy Hold (WhyBlast Lock In live) on ≤720px tall: tighten why-blast + why-arena + hud gaps so next-tap · claim · chips pack tight — no purple band between the hud and the arena (Snap/Match dock-margin family · invent Fun/Clear; Shot wake version; after Hold fill 1.4.190 / dock 1.4.202; Snap2 209 / StoredLine 208 / Match 207 / Learn 206 / Sequence 205 / Father 204 / Build 203 / Story Creek 201 / Creed 200 / Link 199 / Sort 198 peels untouched)',
    ],
  },
  {
    version: '1.4.209',
    title: 'Easy Story Snap: ≤720 close pad→CTA purple gap',
    when: '2026-09-25',
    items: [
      'Easy Story Snap on ≤720px tall: zero cta-dock margin-top + tighten play gap so Hold pad · score · next-tap dock pack tight — no purple band between the pad and the dock (Link/Creed/Creek/Hold/Match dock-margin family · invent Fun/Clear; after grow-play peel 1.4.197; StoredLine 208 / Match 207 / Learn 206 / Sequence 205 / Father 204 / Build 203 / Hold 202 / Story Creek 201 / Creed 200 / Link 199 / Sort 198 peels untouched)',
    ],
  },
  {
    version: '1.4.208',
    title: 'Easy Lock In win-end: ≤720 close triad→Home purple gap',
    when: '2026-09-25',
    items: [
      'Easy Lock In win-end (StoredLine · TownReturn) on ≤720px tall: tighten after-win + held-triad gaps so Main idea · Why · From · Home CTA pack tight — no purple band between the triad and Home (Father/Hold dock-margin family · invent Fun/Clear; after win-end fill 1.4.185; Match 207 / Learn 206 / Sequence 205 / Father 204 / Build 203 / Hold 202 / Story Creek 201 / Creed 200 / Link 199 / Sort 198 / Story Snap 197 / letter-grid 193 peels untouched)',
    ],
  },
  {
    version: '1.4.207',
    title: 'Easy Match: ≤720 close score→CTA purple gap',
    when: '2026-09-25',
    items: [
      'Easy Match (picture · main idea deal) on ≤720px tall: zero cta-dock margin-top so match-score · Next CTA pack tight — no purple band between the score and the gold dock (Link/Creed/Creek/Hold dock-margin family · invent Fun/Clear; after Match fill 1.4.184; Learn 206 / Sequence 205 / Father 204 / Build 203 / Hold 202 / Story Creek 201 / Creed 200 / Link 199 / Sort 198 / Story Snap 197 / Match letter-grid 193 / Lock In 194·195 peels untouched)',
    ],
  },
  {
    version: '1.4.206',
    title: 'Easy Learn: ≤720 fill held-clear purple void',
    when: '2026-09-25',
    items: [
      'Easy Learn (Short story · HeldTriad Main idea · Why · From) on ≤720px tall: grow is-teach + easy-story-card, stretch held-triad, zero dock margin so claim·reason·source + Match CTA fill the portrait — no empty purple under the dock (Lock In win-end / Father dock-margin family · invent Fun/Clear; after Learn compress 1.4.162 / stamp 177; Sequence 205 / Father 204 / Build 203 / Hold 202 / Story Creek 201 / Creed 200 / Link 199 / Sort 198 / Story Snap 197 / Match 193 / Lock In 194·195 peels untouched)',
    ],
  },
  {
    version: '1.4.205',
    title: 'Easy Sequence: ≤720 close stones→result purple gap',
    when: '2026-09-25',
    items: [
      'Easy Sequence (Samaritan order) on ≤720px tall: tighten play gap + zero ResultPanel margin/compact teach padding so stone bank · miss teach pack tight — no purple band between the stones and the result card (Father/Hold dock-margin family · invent Fun/Clear; after Sequence fill 1.4.186; Father 204 / Build 203 / Hold 202 / Story Creek 201 / Creed 200 / Link 199 / Sort 198 / Story Snap 197 / Match 193 / Lock In 194·195 peels untouched)',
    ],
  },
  {
    version: '1.4.204',
    title: 'Easy Father: ≤720 close speech→rail purple gap',
    when: '2026-09-25',
    items: [
      'Easy Father Dash on ≤720px tall: zero run-speech / run-rail margins + tighten gap/padding so scene · speech · rail · pad pack tight — no thin purple band between the speech card and the timing rail (Father dock-margin family · invent Fun/Clear; after fill 1.4.189 / dock 1.4.196; Build 203 / Hold 202 / Story Creek 201 / Creed 200 / Link 199 / Sort 198 / Story Snap 197 / Match 193 / Lock In 194·195 / Samaritan peels untouched)',
    ],
  },
  {
    version: '1.4.203',
    title: 'Easy Build: ≤720 fill free-place purple void',
    when: '2026-09-25',
    items: [
      'Easy Build Argument free-place (non-deal) on ≤720px tall: grow play shell + stretch slot-list / bank tiles + zero build-lock margin so slots · bank · Check lock fill the gold card — no empty purple void under the lock (Match 1.4.184 / Sort 1.4.198 / Sequence 1.4.186 fill family · invent Fun/Clear; deal fill 1.4.187 untouched; Hold 202 / Story Creek 201 / Creed 200 / Link 199 / Sort 198 / Story Snap 197 / Match 193 / Lock In 194·195 / Father 196 / Samaritan peels untouched)',
    ],
  },
  {
    version: '1.4.202',
    title: 'Easy Hold: ≤720 close chips→CTA purple gap',
    when: '2026-09-25',
    items: [
      'Easy Hold (Lock In WhyBlast live arena) on ≤720px tall: zero cta-dock margin-top so why-arena flex fill absorbs the portrait — no empty purple void between the chips and the next-tap dock (Father 1.4.196 / Link 1.4.199 / Creed 1.4.200 / Story Creek 1.4.201 dock-margin family · invent Fun/Clear; after Hold fill 1.4.190 left 4px/8px margin; quiz 194 / miss 195 / Story Creek 201 / Creed 200 / Link 199 / Sort 198 / Story Snap 197 / Match 193 / Father 196 / Build / Samaritan peels untouched)',
    ],
  },
  {
    version: '1.4.201',
    title: 'Easy Story Creek: ≤720 close board→CTA purple gap',
    when: '2026-09-25',
    items: [
      'Easy Story Creek (Samaritan road maze) on ≤720px tall: zero cta-dock margin-top so maze-board flex fill absorbs the portrait — no empty purple void between the board · score and the Hold / Again dock (Father 1.4.196 / Link 1.4.199 / Creed 1.4.200 dock-margin family · invent Fun/Clear; after Story Creek fill 1.4.191 left auto margin stealing free space; Creed 200 / Link 199 / Sort 198 / Story Snap 197 / Match 193 / Lock In 194·195 / Hold / Build / Samaritan peels untouched)',
    ],
  },
  {
    version: '1.4.200',
    title: 'Easy Creed: ≤720 close bowl→CTA purple gap',
    when: '2026-09-25',
    items: [
      'Easy Creed merge on ≤720px tall: zero cta-dock margin-top so merge-bowl flex fill absorbs the portrait — no empty purple void between the bowl · ladder and the Hold / One more dock (Father 1.4.196 / Link 1.4.199 dock-margin family · invent Fun/Clear · Shot wake version; after Creed fill 1.4.192 left auto margin stealing free space; Sort 198 / Story Snap 197 / Link 199 / Match 193 / Lock In 194·195 / Hold / Story Creek / Build / Samaritan peels untouched)',
    ],
  },
  {
    version: '1.4.199',
    title: 'Easy Link: ≤720 close choices→CTA purple gap',
    when: '2026-09-25',
    items: [
      'Easy Link on ≤720px tall: zero link-dock margin-top so link-col flex fill absorbs the portrait — no empty purple void between the picture choices and the bottom dock (Father 1.4.196 dock-margin family · invent Fun/Clear; after Link fill 1.4.188 left auto margin stealing free space; Sort 198 / Story Snap 197 / Match 193 / Lock In 194·195 / Hold / Creed / Story Creek / Build / Samaritan peels untouched)',
    ],
  },
  {
    version: '1.4.198',
    title: 'Easy Sort: ≤720 fill purple void',
    when: '2026-09-25',
    items: [
      'Easy Sort on ≤720px tall: grow play shell + stretch bank seats / bins so Keep·Toss fill the gold card — no empty purple void under the bins (Match 1.4.184 / Story Snap 1.4.197 / Creed 1.4.192 fill family · invent Fun/Clear; board-first 1.4.183 untouched; Story Snap 197 / Match 193 / Lock In 194·195 / Father 196 / Hold / Creed / Story Creek / Build / Link / Samaritan peels untouched)',
    ],
  },
  {
    version: '1.4.197',
    title: 'Easy Story Snap: ≤720 fill purple void',
    when: '2026-09-25',
    items: [
      'Easy Story Snap on ≤720px tall: grow play shell + stretch snap-stage so strip · stage · pad fill the gold card — no empty purple void under the Hold pad (Match 1.4.184 / Creed 1.4.192 / Story Creek 1.4.191 fill family · invent Fun/Clear; HUD peel 1.4.182 / compress 1.4.152 / teach-omit 1.4.163 untouched; Match 193 / Lock In 194·195 / Father 196 / Hold / Creed / Story Creek / Sort / Build / Link / Samaritan peels untouched)',
    ],
  },
  {
    version: '1.4.196',
    title: 'Easy Father: ≤720 close slider→CTA purple gap',
    when: '2026-09-25',
    items: [
      'Easy Father timing on ≤720px tall: zero cta-dock margin-top so run-scene flex fill absorbs the portrait — no large empty purple void between the timing slider and the Hold pad (Fixes #253 · Shot 1.4.190 / 07-father; after Father fill 1.4.189 left auto margin stealing free space; do not pack #250 / #251 / #252; HUD peel 173 / speech thin 154 / Match 193 / Lock In 194·195 / Creed / Story Creek / Hold / Link / Build / Samaritan / Sort / Snap peels untouched)',
    ],
  },
  {
    version: '1.4.195',
    title: 'Easy Lock In feedback: ≤720 fill purple void',
    when: '2026-09-25',
    items: [
      'Easy Lock In feedback / miss teach on ≤720px tall: grow journal rehearse shell + stretch why-miss-teach so Main idea · why-true · From · Try again fill the portrait — no massive empty purple void across the bottom third (Fixes #252 · Shot 1.4.190 / 05-easy-lockin-miss; still fail after win-end StoredLine #239 / 1.4.185; do not pack #250 / #251 / #253; quiz 1.4.194 / Hold arena 1.4.190 / Match 1.4.193 / Creed / Story Creek / Samaritan / Sort / Snap / Build / Link / Dash peels untouched)',
    ],
  },
  {
    version: '1.4.194',
    title: 'Easy Lock In quiz: ≤720 fill purple void',
    when: '2026-09-25',
    items: [
      'Easy Lock In quiz (WhyBlast mid-question) on ≤720px tall: grow journal rehearse shell + stretch recall-gate quiz card so claim · chips fill the portrait — no massive empty purple void across the bottom third (Fixes #251 · Shot 1.4.190 / 04-easy-lockin; after Hold arena stretch 1.4.190 / chrome 1.4.170·156; do not pack #252 / #253; win-end 1.4.185 / Match 1.4.193 / Creed / Story Creek / Samaritan / Sort / Snap / Build / Link / Dash peels untouched)',
    ],
  },
  {
    version: '1.4.193',
    title: 'Easy Match: ≤720 fill grid→footer purple void',
    when: '2026-09-25',
    items: [
      'Easy Match (letter grid) on ≤720px tall: grow play shell + stretch gem-scroll / gem-stage / gem-board so dock · grid · score fill the portrait — no empty purple void between letter grid and footer (Fixes #250 · Shot 1.4.190 / 03-easy-match; still fail after picture-deal #238 / 1.4.184; how/say peel 1.4.168 untouched; do not pack #251 Lock In / #252 Lock In miss / #253 Father; Creed 192 / Story Creek 191 / Hold / Link / Build / Samaritan / Sort / Snap peels untouched)',
    ],
  },
  {
    version: '1.4.192',
    title: 'Easy Creed merge: ≤720 fill purple void',
    when: '2026-09-25',
    items: [
      'Easy Creed merge on ≤720px tall: grow play shell + stretch merge-bowl so score · ladder · bowl fill the gold card — no empty purple void under the bowl (Match 1.4.184 / Story Creek 1.4.191 fill family · invent Fun/Clear; HUD peel 1.4.181 / bowl-first 1.4.159 untouched; Match / Lock In / Samaritan / Sort / Snap / Story Creek / Hold / Build Argument / Link / Father Dash peels untouched)',
    ],
  },
  {
    version: '1.4.191',
    title: 'Easy Story Creek: ≤720 fill purple void',
    when: '2026-09-25',
    items: [
      'Easy Story Creek (Samaritan road maze) on ≤720px tall: grow play shell + stretch maze-stage / maze-board so beats · board fill the gold card — no empty purple void under the board (Match 1.4.184 / Hold 1.4.190 fill family · invent Fun/Clear; HUD peel 1.4.175 untouched; Match / Lock In / Samaritan Sequence / Sort / Snap / Creed / Hold / Build Argument / Link / Father Dash peels untouched)',
    ],
  },
  {
    version: '1.4.190',

    title: 'Easy Hold: ≤720 fill purple void',
    when: '2026-09-25',
    items: [
      'Easy Hold (Lock In WhyBlast) on ≤720px tall: grow why-blast shell + stretch arena chip rows so claim · chips fill the gold card — no empty purple void under the CTA (Match 1.4.184 / Father Dash 1.4.189 fill family · invent Fun/Clear; arena-first 1.4.170 / win-end 1.4.185 untouched; Match / Samaritan / Sort / Snap / Creed / Build Argument / Link / Father Dash peels untouched)',
    ],
  },
  {
    version: '1.4.189',
    title: 'Easy Father Dash: ≤720 fill purple void',
    when: '2026-09-25',
    items: [
      'Easy Father Dash on ≤720px tall: grow play shell + stretch run-scene so scene · speech · Hold pad fill the gold card — no empty purple void under the pad (Match 1.4.184 / Link 1.4.188 fill family · invent Fun/Clear; HUD peel 1.4.173 untouched; Match / Lock In / Samaritan / Sort / Snap / Creed / Build Argument / Link peels untouched)',
    ],
  },
  {
    version: '1.4.188',
    title: 'Easy Link: ≤720 fill purple void',
    when: '2026-09-25',
    items: [
      'Easy Link (Connections) on ≤720px tall: grow play shell + stretch wizard picture seats so clue · choices fill the gold card — no empty purple void under the deal (Match 1.4.184 / Build Argument 1.4.187 fill family · invent Fun/Clear; Match / Lock In / Samaritan / Sort / Snap / Creed / Build Argument peels untouched)',
    ],
  },
  {
    version: '1.4.187',
    title: 'Easy Build Argument: ≤720 fill purple void',
    when: '2026-09-25',
    items: [
      'Easy Build Argument on ≤720px tall: grow play shell + stretch slot seats / two-choice bank so the gold card fills — no empty purple void under the deal (Sequence order 1.4.186 fill family · invent Fun/Clear; Sequence how-peel 1.4.171 untouched)',
    ],
  },
  {
    version: '1.4.186',
    title: 'Easy Samaritan: ≤720 fill top-cluster purple void',
    when: '2026-09-25',
    items: [
      'Easy Samaritan / Sequence order on ≤720px tall: grow play shell + stretch order stones so the gold card fills — no bottom-half empty purple void (Fixes #240; Shot 1.4.180 · invent Fun/Clear; Sequence how-peel 1.4.171 untouched)',
    ],
  },
  {
    version: '1.4.185',
    title: 'Easy Lock In: ≤720 fill win-end purple void',
    when: '2026-09-25',
    items: [
      'Easy Lock In win-end / feedback on ≤720px tall: grow SAY THIS TOMORROW card + after-win shell so Home CTA fills the portrait — no bottom-third empty purple void (Fixes #239; Shot 1.4.180 · invent Fun/Clear; miss teach 1.4.161 / arena 1.4.170 untouched)',
    ],
  },
  {
    version: '1.4.184',
    title: 'Easy Match: ≤720 fill empty purple card',
    when: '2026-09-25',
    items: [
      'Easy Match (picture · main idea) on ≤720px tall: grow deal grid + stretch cards so the play shell fills — no half-empty purple void (Fixes #238; Shot 1.4.180 · invent Fun/Clear; gem crossword 1.4.168 untouched)',
    ],
  },
  {
    version: '1.4.183',
    title: 'Easy Sort: ≤720 board-first',
    when: '2026-09-25',
    items: [
      'Easy Sort on ≤720px tall: hide how + hint chrome; clamp lead so Keep·Toss + bins stay above fold (Sequence/Build 1.4.171 / Match 1.4.168 ≤720 family; invent Fun/Clear)',
    ],
  },
  {
    version: '1.4.182',
    title: 'Easy Story Snap: ≤720 HUD peel',
    when: '2026-09-25',
    items: [
      'Easy Story Snap on ≤720px tall: hide title eyebrow + who·where so stage · strip · pad stay above fold (complements 1.4.152 compress + 1.4.163 teach-omit; Father 1.4.173 / maze 1.4.175 / Creed 1.4.181 hide-kicker family; invent Fun/Clear)',
    ],
  },
  {
    version: '1.4.181',
    title: 'Easy Creed merge: ≤720 HUD peel',
    when: '2026-09-25',
    items: [
      'Easy Creed merge on ≤720px tall: hide who·where kicker + ladder rung names; tiny score so candy bowl + Drop chip stay above fold (complements 1.4.159 bowl-first; Father 1.4.173 / maze 1.4.175 hide-kicker family; invent Fun/Clear)',
    ],
  },
  {
    version: '1.4.180',
    title: 'Easy Manage: empty-lot header + compact sheet',
    when: '2026-09-25',
    items: [
      'Easy Manage empty lot: keep AppShell header (1.4.167 is-manage-open over-hid); compact Place·Person·Tool row + Build this sheet so map stays readable (Fixes #232; map framing remains Map-owned)',
    ],
  },
  {
    version: '1.4.179',
    title: 'Easy Home: map fills the phone',
    when: '2026-09-26',
    items: [
      'Easy Home on a tall phone: the valley fills the screen (sky above, meadow below) so the whole map stays visible without dark purple letterbox bands (Fixes #217)',
    ],
  },
  {
    version: '1.4.178',
    title: 'Witness Square candy hall',
    when: '2026-09-26',
    items: [
      'Easy Home: Witness Square uses Pack A candy webp art for the construction frame, finished hall, and evening glow — geometric SVG hall stays only when the image is missing (Fixes #213)',
    ],
  },
  {
    version: '1.4.177',
    title: 'Easy Learn: claim pill contrast',
    when: '2026-09-25',
    items: [
      'Easy Learn LociStamp / claim pill: dark ink on cream stamp + wrap full main-idea (no white-on-cream truncate mid-sentence; Samaritan “shows mercy” intact; Fixes #231)',
    ],
  },
  {
    version: '1.4.175',
    title: 'Easy Story Creek maze: ≤720 HUD peel',
    when: '2026-09-25',
    items: [
      'Easy Story Creek (Samaritan road) on ≤720px tall: hide kicker · story-beat thumbs · caption HUD; keep Hurt/Help/Inn beats; tiny score so board stays above fold (complements 1.4.153 compress + 1.4.143 how-dedupe; Father 1.4.173 / Match/Hold/Sequence ≤720 family; invent Fun/Clear)',
    ],
  },
  {
    version: '1.4.173',
    title: 'Easy Father Dash: ≤720 HUD peel',
    when: '2026-09-25',
    items: [
      'Easy Father Dash on ≤720px tall: hide kicker · story-beat thumbs · caption HUD; tiny score so scene + speech + Hold pad stay above fold (complements 1.4.154 speech thin; Match/Hold/Sequence ≤720 family; invent Fun/Clear)',
    ],
  },
  {
    version: '1.4.171',
    title: 'Easy Sequence: ≤720 board-first',
    when: '2026-09-25',
    items: [
      'Easy Sequence / BuildArgument on ≤720px tall: hide how + hint chrome; clamp lead so stone board + primary CTA stay above fold (Match 1.4.168 / Hold 1.4.170 ≤720 family; invent Fun/Clear)',
    ],
  },
  {
    version: '1.4.170',
    title: 'Easy Lock In: ≤720 arena-first',
    when: '2026-09-25',
    items: [
      'Easy Lock In (WhyBlast) on ≤720px tall: hide outer Saved eyebrow + quiet From under claim so chips · Main idea · next-tap stay above fold (complements 1.4.156 thin + 1.4.161 miss PlainTalk; invent Fun/Clear)',
    ],
  },
  {
    version: '1.4.168',
    title: 'Easy Match: ≤720 board-first',
    when: '2026-09-25',
    items: [
      'Easy Match gem/crossword on ≤720px tall: hide how + teach-say chrome; tiny LociStamp/chips so letter board + Lock In CTA stay above fold (Hub/Snap/Father/Learn ≤720 family; invent Fun/Clear)',
    ],
  },
  {
    version: '1.4.167',
    title: 'Easy Manage: Hub chrome compress when open',
    when: '2026-09-25',
    items: [
      'Easy Manage open: hub gets is-manage-open — hide topbar + Easy Home dock so map+sheet read as one overlay (not Hub header · void · map · sheet; Fixes #220; letterbox stays #217; Witness candy Map 1.4.166)',
    ],
  },
  {
    version: '1.4.165',
    title: 'Easy Manage: peek sheet + portrait dedupe',
    when: '2026-09-25',
    items: [
      'Easy Manage bottom sheet: ~42dvh peek so map stays readable; one Mercy portrait (PERSON tile); drop Manage-vs-Walk eyebrow clash + density wall (Fixes #220)',
    ],
  },
  {
    version: '1.4.164',
    title: 'Easy Home: Build It gift wrap',
    when: '2026-09-25',
    items: [
      'Easy Home Build It gift: allow 2-line wrap — drop nowrap + ellipsis so ready gift shows “Tap it, then Build this.” beside the gold button (Fixes #214)',
    ],
  },
  {
    version: '1.4.163',
    title: 'Story Snap: drop Learn-lead teach reprint',
    when: '2026-09-25',
    items: [
      'Easy Story Snap play: omit STORY_SNAP_TEACH Learn-lead reprint on all heights — pad · strip · gate teach the mechanic; quiet who·place stays; ≤720 peel from #189 kept (Fixes #209)',
    ],
  },
  {
    version: '1.4.162',
    title: 'Learn: short-story ≤720 peel',
    when: '2026-09-25',
    items: [
      'Easy Learn short-story on ≤720px tall: tiny LociStamp · hide GemMark · clamp teach-reason · thin HeldTriad so gold Match CTA stays above fold (Hub/Snap/Father ≤720 family; 1.4.160 already omitted who/where; Fixes #208)',
    ],
  },
  {
    version: '1.4.161',
    title: 'Lock In: miss teach drop PlainTalk stack',
    when: '2026-09-25',
    items: [
      'Easy Lock In miss teach: badge + Main idea · Why · From + Try again only — omit PlainTalk teach stack so short phones are not a scroll wall (Clear density; Fixes #207)',
    ],
  },
  {
    version: '1.4.160',
    title: 'Easy Learn: one who·where surface',
    when: '2026-09-25',
    items: [
      'Easy Learn: LociStamp hero alone carries place · person · idea — omit .easy-who-where row so Clear teach does not echo who/where twice before HeldTriad (Fixes #206)',
    ],
  },
  {
    version: '1.4.159',
    title: 'Creed merge: short-phone bowl-first',
    when: '2026-09-25',
    items: [
      'Easy Creed merge on ≤720px tall: thin story-kicker · merge-hud · merge-ladder so the candy bowl owns the phone — Drop chip stays readable (Story Snap / maze ≤720 family; Fixes #205)',
    ],
  },
  {
    version: '1.4.158',
    title: 'Easy Source Dig: one how line',
    when: '2026-09-25',
    items: [
      'Easy Source Dig: omit digHunt .sort-how — Scrub tablets · timer · SOURCE_DIG_HINT already teach scrub (Clear family with Maze 1.4.143 / Father 1.4.144 / Creed merge 1.4.147; Fixes #204)',
    ],
  },
  {
    version: '1.4.157',
    title: 'Easy Home: snap/merge/dig whisper short',
    when: '2026-09-25',
    items: [
      'Easy Home dock whisper: snapHome / mergeHome / digHome are short next-step (“One more snap/merge/dig”) — no full snapHunt/mergeHunt/digHunt how reprint (completes maze/run #192 family; Fixes #203)',
    ],
  },
  {
    version: '1.4.156',
    title: 'Lock In: short-phone arena thin',
    when: '2026-09-25',
    items: [
      'Easy Lock In (WhyBlast) on ≤720px tall: thin HUD · chips · claim so the arena keeps the phone — miss teach stays readable (Story Snap ≤720 family; Fixes #193)',
    ],
  },
  {
    version: '1.4.155',
    title: 'Easy Home: short next-step whisper',
    when: '2026-09-25',
    items: [
      'Easy Home dock whisper: mazeHome / runHome are short next-step (“One more road/run”) — no full mazeHunt/runHunt how reprint on taller phones (play how-dedupe 1.4.143/144 stay; Fixes #192)',
    ],
  },
  {
    version: '1.4.154',
    title: 'Father run: short-phone speech thin',
    when: '2026-09-25',
    items: [
      'Easy Father run on ≤720px tall: compress hired-hand speech chrome (kicker · line · bar · count) so pad + timer stay readable without scrolling (keep timer; Fixes #191)',
    ],
  },
  {
    version: '1.4.153',
    title: 'Samaritan road: default board-first',
    when: '2026-09-25',
    items: [
      'Easy Samaritan road default Find/walk: peel help-phase chrome compress onto default play — thumbs · caption · beats thin so the board keeps the phone (board-first after how-dedupe 1.4.143; Fixes #190)',
    ],
  },
  {
    version: '1.4.152',
    title: 'Story Snap: short-phone teach thin',
    when: '2026-09-25',
    items: [
      'Easy Story Snap on ≤720px tall: pad owns how (quiet Tap-when hint off); snap-teach stays a thin strip so the lane keeps the phone (maze help-phase family; Fixes #189)',
    ],
  },
  {
    version: '1.4.151',
    title: 'BuildArgument: one how line on Easy',
    when: '2026-09-25',
    items: [
      'Easy BuildArgument: skip redundant premise .sort-how when PuzzleHint/lead already teach — one–two chrome lines (Clear family with Sort how 1.4.138 / lead≈hint 1.4.145; Fixes #188)',
    ],
  },
  {
    version: '1.4.150',
    title: 'Easy Home: Match-first coach',
    when: '2026-09-25',
    items: [
      'Easy Home cold coach: Match → Learn → Lock In — “now” highlights Match (real next play); Learn stays a re-read, not a false first step (Fixes #187)',
    ],
  },
  {
    version: '1.4.149',
    title: 'Cold Start Easy: Home before Match',
    when: '2026-09-25',
    items: [
      'Cold Start Easy: Welcome → Easy Home (palace map + Learn→Match→Lock In coach) before Match — reopen of 1.4.112 KEEP→link routing (Fixes #186)',
    ],
  },
  {
    version: '1.4.148',
    title: 'Challenge: one title line on Easy',
    when: '2026-09-25',
    items: [
      'Easy ChallengeScreen (area Sort·Sequence): hide puzzle-title — match LinkScreen Easy null title so only PuzzleLead shows on short phones (Clear family with Link Easy title; Fixes #185)',
    ],
  },
  {
    version: '1.4.147',
    title: 'Creed merge: one how line',
    when: '2026-09-25',
    items: [
      'Easy creed merge: omit redundant Drop/Smash .sort-how — Drop chip · smash hint · ladder already teach the bowl (Clear family with Samaritan maze 1.4.143 / Father run 1.4.144; Fixes #184)',
    ],
  },
  {
    version: '1.4.146',
    title: 'Sequence: one lead line on Easy',
    when: '2026-09-25',
    items: [
      'Easy Sequence: skip PuzzleHint when it near-dupes PuzzleLead Keep/Toss (fg-reason / fg-ground) — one task line above tap-the-next-stone steps (Clear family with Sort lead≈hint 1.4.145)',
    ],
  },
  {
    version: '1.4.145',
    title: 'Sort: one lead line on Easy',
    when: '2026-09-25',
    items: [
      'Easy Sort: skip PuzzleHint when it near-dupes PuzzleLead Keep/Toss (fg-order / fg-ought) — one task line; .sort-how still off when hint text exists (Clear family with Match/Sort how dedupe 1.4.137/138)',
    ],
  },
  {
    version: '1.4.144',
    title: 'Father run: one how line',
    when: '2026-09-25',
    items: [
      'Easy Father run: omit redundant Hold/glow .sort-how — run-pad, miss toast, and story-caption already teach the dash (Clear family with Samaritan maze 1.4.143 / Match·Sort how dedupe)',
    ],
  },
  {
    version: '1.4.143',
    title: 'Samaritan road: one how line',
    when: '2026-09-25',
    items: [
      'Easy Samaritan road: omit redundant mazeHunt .sort-how — maze-beats · story-caption · score already teach Find · Help · Inn (Clear family with Match/Sort how dedupe 1.4.137/138)',
    ],
  },
  {
    version: '1.4.142',
    title: 'Lock In: one claim-pick cue',
    when: '2026-09-25',
    items: [
      'Easy Lock In claim-pick: drop stacked Main idea teach-chip above next-tap — one action cue (“Tap the main idea you kept”) after Learn triad 1.4.140 + Lock In Main idea labels 1.4.139/141',
    ],
  },
  {
    version: '1.4.141',
    title: 'Lock In: live Main idea label',
    when: '2026-09-25',
    items: [
      'Easy Lock In why-blast: label the live arena claim Main idea (same Clear family as miss teach 1.4.139 + Learn HeldTriad 1.4.140) so play reads Main idea · tap why — not a bare claim card until you miss',
    ],
  },
  {
    version: '1.4.140',
    title: 'Learn: one Main idea · why · From triad',
    when: '2026-09-25',
    items: [
      'Easy Learn: drop orphan “The main idea you will keep” claim above HeldTriad — one full triad Main idea · Why this is true · From (Clear family with Lock In miss 1.4.139)',
    ],
  },
  {
    version: '1.4.139',
    title: 'Lock In: miss teach Main idea · why · From',
    when: '2026-09-25',
    items: [
      'Easy Lock In miss teach: one miss badge (sheet only — no HUD dup); claim line labeled Main idea so teach reads Main idea · Why this is true · From (Clear family with Match/Sort how dedupe)',
    ],
  },
  {
    version: '1.4.138',
    title: 'Sort: one how line on Easy',
    when: '2026-09-25',
    items: [
      'Easy Sort: keep PuzzleHint teach line; skip redundant Keep/Toss .sort-how when the easy hint shows (one how line — Clear family with Match 1.4.137)',
    ],
  },
  {
    version: '1.4.137',
    title: 'Match: one how line on Easy',
    when: '2026-09-25',
    items: [
      'Easy Match: dedupe PuzzleHint when it repeats EASY.matchHow — keep a single .sort-how line (daily-gems, daily-lantern, daily-door, ph-seeds)',
    ],
  },
  {
    version: '1.4.136',
    title: 'Home map: plant Easy folk + soften candy roads',
    when: '2026-09-25',
    items: [
      'Easy Home: folk lift/nudge onto Pack A candy seats (East porch, gate, lookout) — portraits lowered, purple seat ovals hidden on Easy',
      'Easy Home: hide SVG street/creek overlays when candy map-bg already paints valley paths; hard trail keeps whisper-tan connectors',
    ],
  },
  {
    version: '1.4.135',
    title: 'Home map plate fix: candy image fill + folk portraits',
    when: '2026-09-25',
    items: [
      'Pack A candy plots: stylesheet fill:none !important on .city-plot-img so SVG image viewports no longer paint light plates through cutout alpha (Pages, East porch)',
      'TownFolk and welcome folk: replaced foreignObject HTML Avatar with clipped SVG portrait images (walker pattern) — no rectangular chrome behind circular faces',
    ],
  },
  {
    version: '1.4.134',
    title: 'Flatten memory-palace map bg under plot seats',
    when: '2026-09-25',
    items: [
      'Home map background replaced with flattened candy valley plate — continuous grass under hollow, gate, and porch seats (0% brown dirt cake at anchors)',
      'Pack A plot cutouts and 1.4.133 CSS cascade fix unchanged; streets, creek, plots, and HeavenCity stay SVG overlays',
    ],
  },
  {
    version: '1.4.133',
    title: 'Clean candy cascade fix: no plates, no gold rings',
    when: '2026-09-25',
    items: [
      'Home map: candy plot killers moved after is-built/is-lit/is-next stage rules so fill/stroke/filter no longer paint white plates through cutout alpha',
      'Pack A (porch, gate, journal, hollow): hit circles and ready rings no longer inherit gold stroke; next halo softens on easy Pack A lots',
      'PlotImageArt belt-and-suspenders fill="none" stroke="none" on candy raster images',
    ],
  },
  {
    version: '1.4.132',
    title: 'Clean candy Home: Pack A cutouts + memory-palace bg',
    when: '2026-09-25',
    items: [
      'Easy-trail Pack A (porch, gate, journal, hollow) plot webps replaced with clean candy cutouts — building only, no dirt cake or floating grass pads (Bill lock)',
      'Home map background: geometric SVG hills/sky replaced with candy memory-palace valley plate; streets, creek, plots, and HeavenCity stay SVG overlays',
      'Candy plot glow rings removed — bg owns ground, lit/next selection no longer paints cheap yellow halos on raster plots',
    ],
  },
  {
    version: '1.4.131',
    title: 'Pack A true alpha + map overlay fix',
    when: '2026-09-25',
    items: [
      'Easy-trail Pack A plot webps replaced with true RGBA alpha cutouts — no white plates behind porch, gate, journal, or hollow',
      'Home map: grey/dark mid-map overlay blob fixed — group fill/stroke/filter no longer paints on candy raster plots',
      'Lit/next glow scoped to the plot image instead of the SVG group bounding box',
    ],
  },
  {
    version: '1.4.130',
    title: 'Home map candy plot images',
    when: '2026-09-25',
    items: [
      'Easy-trail Pack A: porch, gate, journal, and hollow use slight-iso candy webp art on the Home map — phone-big landmarks',
      'SVG side-elevation fallback kept for bench, lamps, observatory, lookout, and empty/staked lots',
      'Hit circles, tags, sparks, and TownFolk unchanged',
    ],
  },
  {
    version: '1.4.129',
    title: 'Samaritan HELP contain',
    when: '2026-09-25',
    items: [
      'HELP phase: hurt + Help pill stay inside the cell — no gold-arena clip; one affordance (skip duplicate you face on help cue)',
      'HELP phase chrome compress — beat row + thumbs shrink so the board fills the phone',
      'Caption uses maze teach line (“Stop. Help the hurt man.”) during HELP, not walk-past panel text',
    ],
  },
  {
    version: '1.4.128',
    title: 'Cursor hop guardrails / peel map',
    when: '2026-09-25',
    items: [
      '`.cursor/rules/cursor-hop-efficiency.mdc` — agents open peeled modules first (CityPlotArt, gemSearchGrid, cityModel, scoped CSS)',
      'No gameplay change — Dig/Hard/NW/Town/stores/Match/Lock In parked',
    ],
  },
  {
    version: '1.4.127',
    title: 'TS peels for cheap hops',
    when: '2026-09-25',
    items: [
      'Peel CityMap plot/SVG art → city/CityPlotArt.tsx; shell (camera, beats, mind-map) stays in CityMap (~726 LOC)',
      'Peel gemSearch grid placement/fill/snap → gemSearchGrid.ts; puzzle orchestration + MATCH_CHIPS stay in gemSearch.ts',
      'Peel city model math → cityModel.ts; city.ts keeps storage re-exports — Dig/Hard/NW/Town/stores/Match/Lock In parked',
    ],
  },
  {
    version: '1.4.126',
    title: 'CSS peels + scoped tests',
    when: '2026-09-24',
    items: [
      'Peel match/city/defend/maze/gem/sortHold/welcome/win sheets from tip index.css — Keep Manage denser (1.4.122–124) + Samaritan road flush (1.4.125)',
      'Scoped npm test / test:* via run-checks + readAppCss so peeled CSS stays visible to asserts',
      'Infra only — Dig/Hard/NW/Town/stores/Match/Lock In parked',
    ],
  },
  {
    version: '1.4.125',
    title: 'Samaritan road flush on phone',
    when: '2026-09-24',
    items: [
      'Easy Samaritan road / Mercy · Story Creek: maze board fills ~390px play width (kill dvh width-cap gutters); bigger tiles + actors',
      'Bigger HURT MAN / HELP / INN beat faces; compress how/kicker/thumbs/caption chrome so the board gets the space',
      'Gold/purple Easy chrome + walk/Help/hurt-man path from 1.4.110/116 kept — Dig/Hard/NW/Town/stores/Home Manage/Match/Lock In parked',
    ],
  },
  {
    version: '1.4.124',
    title: 'Manage sheet keeps map visible',
    when: '2026-09-24',
    items: [
      'Easy Manage: bottom sheet (~half phone) so the Home candy map stays visible above — no opaque wall over the lot',
      'Light scrim only; skip the one-shot zoom pulse while Manage is open so the map does not move under a hidden card',
      'PLACE·PERSON·MAIN IDEA stay compact from 1.4.122; Dig/Hard/NW/Town/stores/Match/Lock In/Road maze parked',
    ],
  },
  {
    version: '1.4.123',
    title: 'Lock In miss recovery',
    when: '2026-09-24',
    items: [
      'Easy Lock In miss: wrong why-chip opens a compact teach sheet (claim · why-true · From source) with Try again — chip stays gone, one-more juice on retry; Dig/Hard/NW/Town/stores/Home/Match parked',
      'Easy RecallGate teach after two misses: Try again returns to the reason ask instead of ending the Hold cold',
      'Phone ~390: compress empty Easy Hold / why-arena chrome so miss teach fits without sparse gaps',
    ],
  },
  {
    version: '1.4.122',
    title: 'Manage tight + whole map visible',
    when: '2026-09-24',
    items: [
      'Easy Manage lot sheet: compress empty padding so PLACE·PERSON·MAIN IDEA hug content (side-by-side Place+Person); Walk CTA stays big — Dig/Match/Home layout parked',
      'Easy Home full-viewport map: show the entire map (preserveAspectRatio meet / contain letterbox) instead of cover-slice crop that hid edges',
      'Map zoom juice: Build this / tap lot / upgrade briefly zooms toward that place, then settles back to the full map — not a sticky crop',
    ],
  },
  {
    version: '1.4.121',
    title: 'Home map fills the phone',
    when: '2026-09-24',
    items: [
      'Easy Home: map is the whole-screen surface under the purple/gold menu; Build It + Match/Lock In sit in a thin bottom dock overlay — no mid-page card, no stacked button columns shrinking the map; Dig/Hard/stores stay parked',
    ],
  },
  {
    version: '1.4.120',
    title: 'Home Build It · big map',
    when: '2026-09-24',
    items: [
      'Easy Home: Build It is a real card (gift + Build this opens the next lot); map is the hero (~62vh); Match/Lock In/Learn stay compact; Extra streets packs stay parked off Easy Home; map overlays quieter',
    ],
  },
  {
    version: '1.4.119',
    title: 'Match flush grid',
    when: '2026-09-24',
    items: [
      'Easy Match letter board: tiles stay flush in straight columns and rows on phone width — no overlap or jagged gaps between candy cells',
    ],
  },
  {
    version: '1.4.118',
    title: 'Easy menu consistent',
    when: '2026-09-24',
    items: [
      'Easy chrome: Home · Lock In · Settings top menu everywhere after Welcome; ← Home always lands on Home; compact matching header on Home/Settings/Learn/Match/Lock In; Reset this Easy walk plainly named in Settings',
    ],
  },
  {
    version: '1.4.117',
    title: 'Lock In win stays',
    when: '2026-09-24',
    items: [
      'After the correct why-chip: LOCKED! and the gold chip stay visible, Keep scrolls into view, and the Hold beat continues on its own — no hunting for a vanished win',
    ],
  },
  {
    version: '1.4.116',
    title: 'Hurt man works',
    when: '2026-09-24',
    items: [
      'Samaritan road: tap the hurt man walks one step toward him (no full teleport); after find, a Help label sits on his cell so the mercy beat completes',
    ],
  },
  {
    version: '1.4.115',
    title: 'Easy Match phone polish',
    when: '2026-09-24',
    items: [
      'Easy Match on a short phone: the teach dock stays a thin strip so the candy board keeps the swipe, the loci sheet hands the next finger back to the letters, find / BONUS / +1000 each land as one punch, and after Matched! Lock In next is the loud button',
    ],
  },
  {
    version: '1.4.114',
    title: 'Match crossword perfect',
    when: '2026-09-23',
    items: [
      'Easy Match: short-phone teach dock keeps the board swipe plane; loci sheet dismiss hands the next finger to the board; find / BONUS / dock +1000 each get one punch; teach chips plant before fill; after Matched! Lock In next is the loud CTA',
    ],
  },
  {
    version: '1.4.113',
    title: 'Welcome Easy-only',
    when: '2026-09-23',
    items: [
      'Welcome hides Hard and Easy/Hard twin toggles — one Start Easy message (reasons to believe); Hard stays in Settings only',
    ],
  },
  {
    version: '1.4.112',
    title: 'Start Easy · Learn → Match → Lock In',
    when: '2026-09-23',
    items: [
      'New-user Easy trail: Welcome primary CTA is Start Easy (Hard stays quiet); Easy Home shows a Learn → Match → Lock In coach strip under the map until Match ready and the line is held',
    ],
  },
  {
    version: '1.4.111',
    title: 'Home is a memory palace',
    when: '2026-09-23',
    items: [
      'Easy Home: town map is the primary visual (person · place · idea); Match / Lock In / Learn sit under the map — Night Watch and Hard town chrome stay parked',
    ],
  },
  {
    version: '1.4.110',
    title: 'Real Samaritan road maze',
    when: '2026-09-23',
    items: [
      'Samaritan road: tap/swipe/arrows move one open-road step at a time — no far-tap auto-walk; walls matter; Hurt → Help → Inn stays the mercy walk',
    ],
  },
  {
    version: '1.4.109',
    title: 'Perfect Match · Easy teach chips',
    when: '2026-09-22',
    items: [
      'Match teach: every Easy shelf lesson has authored who/where/idea/keep MATCH_CHIPS + a kid say sentence — Perfect Match teaching unit, not claim-token scrape; Why Gate keep/sky scenes stay (no creek filler off Story Creek)',
    ],
  },
  {
    version: '1.4.108',
    title: 'Freemium chrome polish',
    when: '2026-09-22',
    items: [
      'Freemium chrome polish: Support, Shop, and soft pause copy keep the earn path clear while stores stay parked',
    ],
  },
]

/** Resolve What’s new copy for a version (falls back to newest). */
export function latestChange(version: string): ChangeNote {
  const note = CHANGELOG.find((item) => item.version === version) ?? CHANGELOG[0]
  if (!note) {
    return { version, title: 'Easy core trail', when: '', items: [] }
  }
  return note
}
