# daily-creed — Story Strip pack v1

Built 2026-10-09 PT on Gemini (gemini-3.1-flash-image). 3 frames, 512×512 RGBA (real alpha, transparent corners, no white plate), webp + png.
Contact sheet: `daily-creed-v1-contact.png`. Data: `manifest.json` (repo shapes) and `snippet.ts` (paste blocks).

## Every string

| frame | art key | text (tray, Hard too) | easyText | slot (shortCaption / easy) | win caption | bold role |
|---|---|---|---|---|---|---|
| 1 | dcreed1-rose | Jesus dies, is buried, and is raised. | Jesus died, was buried, rose. | Died, buried, / raised · Easy: Died, buried, / rose | Died, buried, / rose. | raised · Easy: rose |
| 2 | dcreed2-tell | Believers pass the news on. | (same) | News / passed on | Passed / on. | Believers |
| 3 | dcreed3-letter | Paul writes it in a letter. | (same) | Paul / writes | Paul / writes it. | Paul |

## Win screen
- Label: **Paul wrote**
- Plain line (easyLead, NEW): “Delivered” means handed on. “Of first importance” means most important.
- Quote (exact RSV): “For I delivered to you as of first importance what I also received, that Christ died for our sins…”
- Reference: 1 Corinthians 15:3
- Note: Quote + ref + kicker UNCHANGED from live (exact RSV, cut with …). Only easyLead is new.

## Takeaway + “Tap the main idea you kept”
- Takeaway (Easy face): **Christians said “died, buried, raised” before Paul wrote.**
- Easy FACE only, via EASY_STRIP_FACE. Pack claim stays “The churches named Christ died, buried, and raised before Paul wrote.” (check-packs asserts /Christ/).
- Right answer: Christians said “died, buried, raised” before Paul wrote.
- Wrong: Paul makes up the list as he writes.
- Wrong: Being buried does not matter.

## Plain-word glosses
- Delivered = handed on
- Of first importance = most important

## Review notes
- Frame 2 man in brown is Peter (same design as wb-creed creed4). No name chip (SequenceFigure cue is only Jesus | Priest). Frame 1: empty cross with cloth + open empty tomb + risen Jesus (two small extra crosses drawn behind; Luke 23:33).
- Objects never have power by themselves; no figure other than Jesus carries a JESUS SAID label.
