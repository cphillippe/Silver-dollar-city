#!/usr/bin/env python3
"""nwsim v2: the 1.4.442 LIVE game loop (DefendScreen.tsx tick/fire/fireAtRaider + nightSkills/nightKits),
not just livePace.ts. Differences vs nwsim.pace_round (all read from repo @9f36884 via GitHub tools):
  * Skills: Still (freeze walkers+spawn+lamp clock 1.8s, cd 12s, from R1) and Mend (fill hearts + 4s leak shield,
    cd 14s, from R2). livePace never casts them.  -> skills='lead' casts when ready and (hearts<3 or boss up).
  * Lamps are free to plant (4 at R1 in live); sparks all go to steps. jump_lamps paid 15 for lamps 2-4.
  * Buy order: Strong-first across 4 lamps (policy 'strong_first') or an exact replayed buy log.
  * Boss tap: any non-soaked boss is tappable even when not the front walker (easyPointerTapGate).
  * Tap cadence: tap_every is a parameter (NW Lead's center-click loop, fitted below).
  * Walker kind: live base HP is 2 (swarm/mid) or 3 (tank, 1 of 6 kinds); modelled as 2 (+0..1 HP, negligible).
Extra (maze-v2 proposal, off by default): count_mul / hp_scale wave model and map features (see maze-v2/SPEC.md)."""
import math, json, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import nwsim as S

STILL_MS, STILL_CD, MEND_CD, MEND_SHIELD = 1.8, 12.0, 14.0, 4.0

def ranks0(n=4): return [{'far': 0, 'strong': 0} for _ in range(n)]

def strong_first(ranks, sparks, cap=3):
    """NW Lead's spender: at each clear buy Strong first (lowest-Strong lamp first, slot order), Far 1 once a lamp
    is at Strong>=2. Path lock: Strong 3 locks Far at 1. Bonus step 4 (15) only if cap>=4."""
    while True:
        opts = []
        for k, r in enumerate(ranks):
            if r['strong'] < min(cap, 3): opts.append((0, r['strong'], k, 'strong', S.TREE_STEP_COST[r['strong']]))
            elif cap >= 4 and r['strong'] == 3: opts.append((2, 3, k, 'strong', 15))
            if r['far'] < 1 and r['strong'] >= 2: opts.append((1, 0, k, 'far', 3))
        opts.sort()
        buy = next((o for o in opts if o[4] <= sparks), None)
        if not buy or (opts[0][0] == 0 and buy[0] != 0 and opts[0][4] > sparks and False): return sparks
        if buy is None: return sparks
        sparks -= buy[4]; ranks[buy[2]][buy[3]] += 1

def pace_round(i, ranks, hearts_in, paths, shares, seats, hp_mul, tap_every, skills=None, sk=None, feat=None):
    """One live round. Returns (result, hearts, taps, sparks_earned, boss_hp_left)."""
    rd = S.rnd(i); br = S.boss_round(i); feat = feat or {}
    cm = feat.get('count_mul', 1.0) if i >= 6 else feat.get('count_mul_early', 1.0)
    count = int(math.ceil(rd['count'] * cm - 1e-9))
    rd = dict(rd, count=count, tough=min(count, int(math.ceil(rd['tough'] * feat.get('tough_mul', 1.0)))), fast=min(count, int(math.ceil(rd['fast'] * cm))))
    total = rd['count'] + (1 if br else 0); bonus = rd['hp'] + S.late_push(i); plan = S.gait_plan(rd)
    lamps = []
    for k, seat in enumerate(seats):
        rank = ranks[k]; s = S.strike(rank); gap = min(S.clearance(seat, p) for p in paths)
        extra = feat.get('seat_bonus', lambda seat: 0)(seat)
        rng = S.lamp_reach(96 + S.FREE_LAMP_RANGE_BONUS + S.shot_reach(rank) + extra, gap)
        lamps.append(dict(x=seat[0], y=seat[1], s=s, range=rng, cool=0.0))
    R = []; spawned = 0; hearts = hearts_in; spawn_at = 0.0; spawn_now = False; tap_at = 0.0; time = 0.0
    clock = 0.0; grace = 0.0; lost_round = 0; boss_fate = 'up' if br else 'none'; dt = 1 / 60
    spawn_every = 3.8 * rd['spawn'] * feat.get('spawn_mul', 1.0); taps = 0; sparks = 0
    freeze_until = -1; shield_until = -1; sk = sk if sk is not None else {'still': 0.0, 'mend': 0.0}
    live_cap = feat.get('live_cap', 3)
    while time < 240:
        frozen = time < freeze_until
        if not frozen: spawn_at += dt; clock += dt
        tap_at += dt; leaked = 0; boss_through = False
        for r in R:
            if r['dead'] or frozen: continue
            mul = feat.get('speed_at', lambda r: 1.0)(r)
            r['t'] += 0.01 * rd['speed'] * r['pace'] * mul * dt
            if r['t'] >= 1:
                r['dead'] = True
                if r['boss']: boss_through = True
                else: leaked += 1
        if boss_through: return 'lost', 0, taps, sparks, None
        if leaked:
            if not (time < shield_until or clock * 1000 < grace or lost_round >= S.round_cap(i)):
                hearts -= 1; grace = clock * 1000 + S.EASY_LEAK_GRACE_MS; lost_round += 1
                if hearts <= 0: return 'lost', 0, taps, sparks, None
        live = [r for r in R if not r['dead']]
        # skills (live: castSkill during the wave when ready; NW Lead's loop: hearts<3 or boss on screen)
        if skills == 'lead':
            boss_up = any(r['boss'] for r in live)
            if i >= 1 and time >= sk['mend'] and hearts < 3:
                hearts = 3; shield_until = time + MEND_SHIELD; sk['mend'] = time + MEND_CD
            if time >= sk['still'] and (boss_up or hearts < 3) and live:
                freeze_until = time + STILL_MS; sk['still'] = time + STILL_CD
        pack_left = 0
        if not frozen and spawned < total and len(live) < live_cap and (spawn_now or spawn_at >= spawn_every or spawned == 0):
            spawn_now = False; spawn_at = 0; pack_left = feat.get('pack', 1)
        while pack_left > 0 and spawned < total and len([r for r in R if not r['dead']]) < live_cap:
            pack_left -= 1
            boss = br and spawned == rd['count']
            g = None if boss else (plan[spawned] if spawned < len(plan) else 'plain')
            hp = S.boss_hp(i) if boss else S.scaled(S.easy_walker_hp(2, bonus, g, i), hp_mul)
            if not boss and feat.get('bulk_ramp') and g != 'fast':
                ramp = feat['bulk_ramp']; j = i + 1 - S.TUNE['bulkFrom']      # e.g. [0.35, 0.7]: R11 +35%, R12 +70% of bulk
                if 0 <= j < len(ramp): hp = S.scaled(S.easy_walker_hp(2, bonus, g, i) - S.TUNE['bulk'] + int(S.TUNE['bulk'] * ramp[j]), hp_mul)
            if not boss and feat.get('hp_scale'): hp = max(1, int(math.floor(hp * feat['hp_scale'] + 0.5)))
            pc = S.BOSS_PACE if boss else S.pace(g)
            lane = S.path_pick(spawned, shares)
            R.append(dict(t=S.live_spawn_t(rd['speed'] * pc), hp=hp, dead=False, pace=pc, gait=g, boss=boss, chip=0,
                          road=paths[lane], lane=lane, spark=1 + (1 if g == 'tough' else 0), mx=hp,
                          split=feat.get('split', 0) if (not boss and g != 'fast' and i >= feat.get('split_from', 2)) else 0))
            spawned += 1
        def kill(r, by_lamp):
            nonlocal spawn_now, boss_fate, sparks
            r['dead'] = True; sparks += r['spark'] * feat.get('spark_mul', 1.0)
            if by_lamp: spawn_now = True
            if r['boss']: boss_fate = 'kill'
            if r.get('split'):   # feature: pops into N small walkers on the same road
                for q in range(r['split']):
                    R.append(dict(t=max(0, r['t'] - 0.02 * q), hp=max(2, int(r['mx'] * feat.get('split_frac', 0.2) + 0.5)), dead=False, pace=S.FAST_PACE * 0.8,
                                  gait='plain', boss=False, chip=0, road=r['road'], lane=r['lane'], spark=0, split=0, mx=2))
        if not frozen:
            for L in lamps:
                L['cool'] -= dt
                if L['cool'] > 0: continue
                live = [r for r in R if not r['dead']]
                pts = {id(r): math.hypot(L['x'] - p[0], L['y'] - p[1]) for r in live for p in [S.point_at(r['t'], r['road'])]}
                best = None; bd = L['range']
                for r in live:
                    if pts[id(r)] <= bd: best, bd = r, pts[id(r)]
                if best is None: continue
                L['cool'] = L['s']['cooldown']
                def hit(r, amt):
                    if r is None or r['dead'] or amt <= 0: return
                    r['hp'] -= min(r['hp'], amt)
                    if r['hp'] <= 0: kill(r, True)
                hit(best, L['s']['damage'])
                if L['s']['splash'] > 0:
                    pick = None; pd = L['range'] * L['s']['splashFrac']
                    for r in live:
                        if r is not best and not r['dead'] and pts[id(r)] <= pd: pick, pd = r, pts[id(r)]
                    hit(pick, L['s']['splash'])
                if L['s']['outer'] > 0:
                    pick = None; pd = L['range'] * (1 + L['s']['outerFrac'])
                    for r in live:
                        if r is not best and not r['dead'] and L['range'] < pts[id(r)] <= pd: pick, pd = r, pts[id(r)]
                    hit(pick, L['s']['outer'])
        live = [r for r in R if not r['dead']]
        if tap_at >= tap_every and live:
            tap_at = 0
            fog = feat.get('fog_at')
            def open_(c):
                arm = S.tap_armored(i, c['gait'], c['boss'])
                return (not arm or c['chip'] < S.TAP_SHRUG_CHIP) and not (fog and fog(c))
            cands = [c for c in live if open_(c)]
            boss = next((c for c in cands if c['boss']), None)
            front = max(cands, key=lambda c: c['t']) if cands else None
            c = boss or front            # center-aim: boss is always tappable; else the glowing front walker
            if c:
                c['chip'] += 1; c['hp'] -= 1; taps += 1
                if c['hp'] <= 0: kill(c, False)
        if spawned >= total and not any(not r['dead'] for r in R):
            if br and boss_fate != 'kill': return 'lost', hearts, taps, sparks, None
            return 'clear', hearts, taps, int(sparks) + (S.BOSS_CLEAR_SPARKS if br else 0), 0
        time += dt
    return 'timeout', hearts, taps, sparks, None

def campaign(paths, shares, seats, hp_mul, rules='maze-v1', buys='strong_first', cap=3, skills='lead', tap_every=0.15,
             rounds=25, feat=None, log=False):
    """buys: 'none' | 'strong_first' | dict{round: [(slot,'strong'|'far'), ...]} (replayed exactly).
    Returns (death_round or None, rows)."""
    S.use_rules(rules); ranks = ranks0(len(seats)); hearts = 3; bank = 0; rows = []
    for i in range(rounds):
        res, hearts, taps, sp, _ = pace_round(i, ranks, hearts, paths, shares, seats, hp_mul, tap_every, skills, None, feat)
        rows.append((i + 1, res, hearts, taps))
        if res != 'clear': return i + 1, rows
        hearts = S.clear_heart(hearts); bank += sp
        if buys == 'strong_first': bank = strong_first(ranks, bank, cap)
        elif isinstance(buys, dict):
            for slot, path in buys.get(i + 1, []): ranks[slot][path] += 1
    return None, rows
