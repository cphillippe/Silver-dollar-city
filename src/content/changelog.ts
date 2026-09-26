/** Player-facing notes for Settings → What’s new. Add a row per pack or app drop. */
export interface ChangeNote {
  version: string
  title: string
  when: string
  items: string[]
}

export const CHANGELOG: ChangeNote[] = [
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
