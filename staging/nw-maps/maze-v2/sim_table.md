# maze-v2 sim table

Model: `nwlive.py` (1.4.442 live loop, calibrated in SPEC.md section 1). The spender uses no skills (Manager: leave Mend alone, project against the no-skill spender), buys Strong first, plants 4 free lamps, and taps every 0.28 s. Runs are capped at 20 rounds.
"Best" comes from a full seat search: a pool of about 48 spread-out Good spots (live no-go rules: small decor is a house, border masses can be planted), plus the staged seats, NW Lead's seats and the hill. Greedy and 8 starts, then single-seat swap passes; about 1,500-1,900 campaigns per map. "Avg" is 12 random Good 4-sets at least 60 apart. No-upgrades and the steady tapper (4 Level-I lamps, Strong-first buys, 0.45 s taps, R1-R6) use the best seats.

| Map | Feature | maze-v2 knobs | Spender best (target) | Spender avg [range] | No-upgrades (target) | 4-lamp tapper R1-R6 | Taps/round R1-R6 | Taps/round R1-R10 |
|---|---|---|---|---|---|---|---|---|
| map02 | hill | hp x0.75, count x1.5 R1-6 / x2 R7+, bulk ramp 35/70% | alive R20 -> **R14** (14) | 8.4 [7-13] -> **11.0** [7-14] | R7 -> **R7** (6-7) | win -> **win** | 26.2 -> **35.5** | 35.7 -> **64.1** |
| map03 | sprint | hp x0.85, count x1.25 R1-6 / x2 R7+, bulk ramp 35/70% | alive R20 -> **R13** (13) | 9.9 [6-13] -> **5.6** [5-6] | R7 -> **R8** (7-8) | win -> **win** | 32.8 -> **27.2** | 61.2 -> **65.2** |
| map04 | sticky | hp x1.0, count x1.5 R1-6 / x2 R7+, bulk ramp 35/70% | R18 -> **R13** (12) | 8.8 [5-13] -> **6.3** [5-9] | R7 -> **R6** (6-7) | win -> **win** | 32.7 -> **41.7** | 50.7 -> **69.0** |
| map05 | fog | hp x0.8, count x1.5 R1-6 / x2 R7+, bulk ramp 35/70% | R14 -> **R12** (10-11) | 7.4 [6-10] -> **6.6** [5-8] | R7 -> **R7** (6-7) | win -> **win** | 28.7 -> **25.7** | 45.3 -> **55.8** |
| map06 | split | hp x0.7, count x1.0 R1-6 / x2 R7+, bulk ramp 35/70% | R13 -> **R9** (9) | 8.5 [6-12] -> **7.7** [7-8] | R7 -> **R8** (7-8) | win -> **win** | 29.5 -> **26.0** | 41.2 -> **52.7** |

Each cell reads today (1.4.442 data, no feature) -> maze-v2. Best seats for each map are in `mapXX/map.json` under `_simV2.bestSeats`, normalized 0..1.
