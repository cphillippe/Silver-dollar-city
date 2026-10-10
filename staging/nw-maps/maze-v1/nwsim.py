#!/usr/bin/env python3
"""Standalone port of the Easy Night Watch round sim (repo main @ 2f952d6, read via GitHub MCP).
Ported, minimal and line-for-line where it matters:
  src/nightWatch/livePace.ts   paceEasyLive(mode='road', map) + paceEasyMapCampaign
  src/nightWatch/walkers.ts    gaitPlan, walkerHp/easyWalkerHp, scaledWalkerHp, easyBossHp, easyLatePush,
                               easyJumpLoad (natural spender buy order), BOSS_PACE, paces
  src/nightWatch/upgradeTree.ts lampStrike, easyShotReach, TREE_STEP_COST
  src/nightWatch/towers/index.ts lampReach, FREE_LAMP_RANGE_BONUS
  src/lib/defend.ts            applyEasyPaceLeaks, applyBossExitLeak, easyClearHeart, easyRoundHeartCap,
                               easyTapArmored, easyGlowTapDamage, easyLiveSpawnT
  src/nightWatch/rounds.ts     EASY_ROUNDS
  src/lib/watchTools.ts        EASY_LAMP_COST=5, 4 tools
Extension (not in repo yet): several walker paths. Walker i takes path by `share` (deterministic weighted
round-robin); lamps measure distance to each walker on its own path. With one path it is the repo sim.
Usage: nwsim.py <map.json> [--seats N]   or import campaign()."""
import json, math, sys

ROUNDS = [  # count, speed, hp, spawn, fast, tough
 (4,1,0,1,0,0),(4,1.35,0,0.95,0,0),(5,1.8,1,0.9,0,0),(5,2.6,2,0.85,1,0),(7,6.4,6,0.68,2,3),(7,6.4,8,0.72,2,1),
 (9,6.2,24,0.74,2,4),(6,5.8,16,0.82,1,2),(9,6.3,28,0.7,2,4),(9,6.4,32,0.68,2,4),(9,6.5,36,0.68,2,4),(5,6.0,18,0.8,1,1),
 (7,6.5,28,0.68,2,3),(7,6.6,34,0.68,2,3),(8,6.6,42,0.66,2,3),(6,6.2,36,0.78,1,2),(8,6.6,42,0.66,2,3),(8,6.7,44,0.66,2,3),
 (9,6.7,44,0.66,2,4),(7,6.3,40,0.76,1,2),(8,6.7,44,0.66,2,3),(9,6.8,46,0.66,2,4),(9,6.8,46,0.66,2,4),(8,6.4,42,0.74,1,2),
 (9,6.8,46,0.66,2,4)]
FAST_PACE, FAST_HP, TOUGH_PACE, TOUGH_HP_BONUS, TOUGH_SPARK = 1.75, 2, 0.88, 16, 2
BOSS_PACE, BOSS_CLEAR_SPARKS, EASY_TOUGH_WINDOW, EASY_LATE_BULK = 0.7, 2, 20, 140
TREE_STEP_COST = [3, 6, 12]; EASY_LAMP_COST = 5; TOOLS = 4
FREE_LAMP_RANGE_BONUS, LAMP_ROAD_OVERLAP, FAR1_ROAD_REACH = 18, 24, 48
DEFEND_HEARTS, EASY_ROUND_HEART_CAP, EASY_LEAK_GRACE_MS, TAP_SHRUG_CHIP = 3, 2, 1800, 4
LIVE_TAP_EVERY = 0.28
NATURAL_PLAN = [(0,'strong',1),(0,'strong',2),(0,'strong',3),(0,'far',1),(1,'strong',1),(1,'strong',2),(2,'strong',1),
 (2,'far',1),(1,'strong',3),(1,'far',1),(2,'strong',2),(2,'strong',3),(3,'strong',1),(3,'strong',2),(3,'strong',3),(3,'far',1)]

def rnd(i): r = ROUNDS[min(len(ROUNDS)-1, max(0, int(i)))]; return dict(zip(('count','speed','hp','spawn','fast','tough'), r))
def boss_round(i): r = int(i)+1; return r > 0 and r % 5 == 0 and r <= 25
def boss_hp(i):
    r = int(i)+1
    return 12 if r <= 5 else 44 if r < 10 else 55 if r == 10 else 120 if r <= 15 else 180 if r <= 20 else 240
def late_push(i):
    r = int(i)+1
    if r < 13: return 0
    if r <= 14: return 12
    if r == 15: return 18
    if r == 16: return 10
    if r <= 19: return 18
    if r == 20: return 12
    return 20
def pace(g): return FAST_PACE if g == 'fast' else TOUGH_PACE if g == 'tough' else 1
def walker_hp(kind, bonus, g):
    kind = max(1, int(kind) or 1); bonus = max(0, int(bonus) or 0)
    if g == 'fast': return FAST_HP
    if g == 'tough': return kind + bonus + TOUGH_HP_BONUS
    return kind + bonus
TUNE = {"bulkFrom": 16, "bulk": EASY_LATE_BULK, "armorFrom": 7}   # repo values; per-map proposal: difficulty.lateBulkFrom / lateBulk
def easy_walker_hp(kind, bonus, g, i):
    r = int(i)+1
    if g == 'tough' and TUNE["armorFrom"] <= r <= min(15, TUNE["bulkFrom"]-1): return EASY_TOUGH_WINDOW
    hp = walker_hp(kind, bonus, g)
    return hp + TUNE["bulk"] if r >= TUNE["bulkFrom"] and g != 'fast' else hp
def scaled(hp, mul): return hp if not (mul > 0) or mul == 1 else max(1, round_half_up(hp*mul))
def round_half_up(x): return int(math.floor(x + 0.5))   # JS Math.round
def gait_plan(rd):
    count = max(0, rd['count']); plan = ['plain']*count
    def place(want, g, salt):
        left = max(0, min(count, want))
        if left == 0: return
        left = min(left, plan.count('plain')); stride = count/left; guard = step = 0
        while left > 0 and guard < count*3:
            slot = min(count-1, int(math.floor(salt + step*stride))) % count
            if plan[slot] == 'plain': plan[slot] = g; left -= 1
            step += 1; guard += 1
    place(rd['tough'], 'tough', 0); place(rd['fast'], 'fast', max(1, count//3))
    return plan
def spark_pay(rd): c = rd['count']; t = max(0, min(c, rd['tough'])); return c + t*(TOUGH_SPARK-1)
def jump_lamps(i):
    lamps = [{'far': 0, 'strong': 0}]; sparks = 0; step = 0
    for at in range(int(i)):
        sparks += spark_pay(rnd(at)) + (1 + BOSS_CLEAR_SPARKS if boss_round(at) else 0)
        guard = 0
        while guard < 40:
            guard += 1
            if step >= len(NATURAL_PLAN): break
            tool, path, rank = NATURAL_PLAN[step]; planted = False
            while len(lamps) <= tool and len(lamps) < TOOLS:
                if sparks < EASY_LAMP_COST: break
                sparks -= EASY_LAMP_COST; lamps.append({'far': 0, 'strong': 0}); planted = True
            if len(lamps) <= tool: break
            lamp = lamps[tool]
            if lamp[path] >= rank: step += 1; continue
            if lamp[path] != rank-1: break
            cost = TREE_STEP_COST[lamp[path]] if lamp[path] < 3 else 0
            if sparks < cost: break
            sparks -= cost; lamp[path] += 1; planted = True
            if lamp[path] >= rank: step += 1
            if not planted: break
    return lamps
def strike(p):
    far, strong = min(4, p['far']), min(4, p['strong'])
    dmg, rb, cd, splash, outer = 1, 0, 700, 0, 0
    if strong >= 1: splash = 1
    if strong >= 2: dmg, cd = 2, 450
    if strong >= 3: dmg, cd = 5, 280
    if strong >= 4: cd = 180
    if far >= 1: outer = 1
    if far >= 2: rb, dmg = 24, max(dmg, 2)
    if far >= 3: rb, dmg, cd = 40, max(dmg, 4), min(cd, 280)
    if far >= 4: rb = 48
    return dict(damage=dmg, rangeBonus=rb, cooldown=cd/1000, splash=splash, splashFrac=0.55, outer=outer, outerFrac=0.28)
def shot_reach(p):
    s = strike(p)
    if s['rangeBonus'] > 0: return s['rangeBonus']
    return FAR1_ROAD_REACH if p['far'] >= 1 else 0
def lamp_reach(base, gap):
    if not (base > 0): return 0
    if base < gap + LAMP_ROAD_OVERLAP: return min(base, max(0, gap-1))
    return base
def seg_dist(p, a, b):
    dx, dy = b[0]-a[0], b[1]-a[1]; l2 = dx*dx + dy*dy
    if l2 == 0: return math.hypot(p[0]-a[0], p[1]-a[1])
    t = max(0, min(1, ((p[0]-a[0])*dx + (p[1]-a[1])*dy)/l2))
    return math.hypot(p[0]-(a[0]+t*dx), p[1]-(a[1]+t*dy))
def clearance(p, path): return min(seg_dist(p, a, b) for a, b in zip(path, path[1:]))
def point_at(t, road):
    t = min(1, max(0, t)); s = t*(len(road)-1); i = min(len(road)-2, int(math.floor(s))); f = s - i
    a, b = road[i], road[i+1]; return (a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f)
def live_spawn_t(speed): s = max(0.2, speed or 1); return max(0, min(0.55, 0.55 - 5*0.01*s))
def round_cap(i): return DEFEND_HEARTS if i == 4 else EASY_ROUND_HEART_CAP
def clear_heart(h): h = max(0, int(h)); return min(h, 3) if h <= 0 or h >= 3 else h+1
def tap_armored(i, g, boss):
    r = int(i)+1
    return (boss and r >= 15) or (g == 'tough' and r >= TUNE["armorFrom"])

def path_pick(n, shares):
    """Deterministic weighted round-robin: walker n goes to the path furthest behind its share."""
    counts = [0]*len(shares); out = []
    for k in range(n+1):
        j = max(range(len(shares)), key=lambda q: (shares[q]*(k+1) - counts[q], -q)); counts[j] += 1; out.append(j)
    return out[n]

def pace_round(i, lamp_paths, hearts_in, paths, shares, seats, hp_mul, tap_every=LIVE_TAP_EVERY):
    rd = rnd(i); br = boss_round(i); total = rd['count'] + (1 if br else 0)
    bonus = rd['hp'] + late_push(i); plan = gait_plan(rd)
    lamps = []
    for k, seat in enumerate(seats):
        rank = lamp_paths[k] if k < len(lamp_paths) else {'far': 0, 'strong': 0}
        s = strike(rank); gap = min(clearance(seat, p) for p in paths)
        rng = lamp_reach(96 + FREE_LAMP_RANGE_BONUS + shot_reach(rank), gap)
        lamps.append(dict(x=seat[0], y=seat[1], s=s, range=rng, cool=0.0))
    raiders = []; spawned = 0; hearts = max(0, hearts_in); spawn_at = 0.0; spawn_now = False
    tap_at = 0.0; time = 0.0; grace = 0.0; lost_round = 0; boss_fate = 'up' if br else 'none'; dt = 1/60
    spawn_every = 3.8*rd['spawn']
    if hearts <= 0: return 'lost', hearts
    while time < 180:
        spawn_at += dt; tap_at += dt; leaked = 0; boss_through = False
        for r in raiders:
            if r['dead']: continue
            r['t'] += 0.01*rd['speed']*r['pace']*dt
            if r['t'] >= 1:
                r['dead'] = True
                if r['boss']: boss_fate = 'leak'; boss_through = True
                else: leaked += 1
        if boss_through: return 'lost', 0
        if leaked > 0:
            now = time*1000; cap = round_cap(i)
            if not (now < grace or lost_round >= cap):
                hearts = max(0, hearts-1); grace = now + EASY_LEAK_GRACE_MS; lost_round += 1
                if hearts <= 0: return 'lost', hearts
        live = [r for r in raiders if not r['dead']]
        if spawned < total and len(live) < 3 and (spawn_now or spawn_at >= spawn_every or spawned == 0):
            spawn_now = False; spawn_at = 0
            boss = br and spawned == rd['count']
            g = None if boss else (plan[spawned] if spawned < len(plan) else 'plain')
            hp = boss_hp(i) if boss else scaled(easy_walker_hp(2, bonus, g, i), hp_mul)
            pc = BOSS_PACE if boss else pace(g)
            raiders.append(dict(t=live_spawn_t(rd['speed']*pc), hp=hp, dead=False, pace=pc, gait=g, boss=boss, chip=0,
                                road=paths[path_pick(spawned, shares)]))
            spawned += 1
        for L in lamps:
            L['cool'] -= dt
            if L['cool'] > 0: continue
            live = [r for r in raiders if not r['dead']]
            best = None; bd = L['range']; pts = {}
            for r in live:
                p = point_at(r['t'], r['road']); d = math.hypot(L['x']-p[0], L['y']-p[1]); pts[id(r)] = d
                if d <= bd: best, bd = r, d
            if best is None: continue
            L['cool'] = L['s']['cooldown']
            def apply(r, amt):
                nonlocal spawn_now, boss_fate
                if r is None or r['dead'] or amt <= 0: return
                r['hp'] -= min(r['hp'], amt)
                if r['hp'] <= 0:
                    r['dead'] = True; spawn_now = True
                    if r['boss']: boss_fate = 'kill'
            apply(best, L['s']['damage'])
            if L['s']['splash'] > 0:
                pick = None; pd = L['range']*L['s']['splashFrac']
                for r in live:
                    if r is best or r['dead']: continue
                    if pts[id(r)] <= pd: pick, pd = r, pts[id(r)]
                apply(pick, L['s']['splash'])
            if L['s']['outer'] > 0:
                pick = None; pd = L['range']*(1+L['s']['outerFrac'])
                for r in live:
                    if r is best or r['dead']: continue
                    if L['range'] < pts[id(r)] <= pd: pick, pd = r, pts[id(r)]
                apply(pick, L['s']['outer'])
        live = [r for r in raiders if not r['dead']]
        if tap_at >= tap_every and live:
            tap_at = 0
            for c in sorted(live, key=lambda r: -r['t']):
                arm = tap_armored(i, c['gait'], c['boss'])
                if not arm or c['chip'] < 4:
                    dmg = 0 if (arm and c['chip'] >= TAP_SHRUG_CHIP) else min(max(0, int(c['hp'])), 1)
                    if dmg > 0:
                        c['chip'] += dmg; c['hp'] -= dmg
                        if c['hp'] <= 0:
                            c['dead'] = True
                            if c['boss']: boss_fate = 'kill'
                    break
        if spawned >= total and not any(not r['dead'] for r in raiders):
            if br and boss_fate != 'kill': return 'lost', hearts
            return ('clear' if hearts > 0 else 'lost'), hearts
        time += dt
    return 'timeout', hearts

RULESETS = {
  "a2": {"armorFrom": 7, "bulkFrom": 16, "bulk": 140, "r6tough": 1},          # repo today (A2, Far Hills 1.4.441)
  "maze-v1": {"armorFrom": 6, "bulkFrom": 11, "bulk": 100, "r6tough": 2},     # proposed for maze maps 2-6
}
_BASE_ROUNDS = list(ROUNDS)
def use_rules(name):
    global ROUNDS
    r = RULESETS[name]; TUNE.update(armorFrom=r["armorFrom"], bulkFrom=r["bulkFrom"], bulk=r["bulk"])
    R = list(_BASE_ROUNDS); c, sp, hp, spn, f, t = R[5]; R[5] = (c, sp, hp, spn, f, r["r6tough"]); ROUNDS = R

def fresh_leaks(kind, paths, shares, seats, hp_mul=1.0, rounds=25):
    """Continuous tie-breaker: hearts lost per round when every round starts fresh at 3 hearts (boss leak = 3)."""
    lost = 0
    for i in range(rounds):
        res, h = pace_round(i, lamps_for(kind, i), 3, paths, shares, seats[:4], hp_mul)
        lost += 3 - h if res == 'clear' else 3
    return lost

def lamps_for(kind, i):
    if kind == 'none': return [{'far': 0, 'strong': 0}]*4
    if kind == 'ceiling': return [{'far': 1, 'strong': 3}]*4
    if kind == 'tapper': return [{'far': 0, 'strong': 0}]
    l = jump_lamps(i)
    while len(l) < 4: l.append({'far': 0, 'strong': 0})
    return l

def campaign(kind, paths, shares, seats, hp_mul=1.0, rounds=25, tap_every=LIVE_TAP_EVERY):
    hearts = 3
    for i in range(rounds):
        res, hearts = pace_round(i, lamps_for(kind, i), hearts, paths, shares, seats[:4] if kind != 'tapper' else seats[:1], hp_mul, tap_every)
        if res != 'clear': return i+1
        hearts = clear_heart(hearts)
    return None

def load_map(path_or_dict, W=798, H=1134):
    m = json.load(open(path_or_dict)) if isinstance(path_or_dict, str) else path_or_dict
    paths = [[(x*W, y*H) for x, y in p['points']] for p in m['paths']]
    shares = [p.get('share', 1/len(paths)) for p in m['paths']]
    seats = [(s['x']*W, s['y']*H) for s in m['seats']]
    return m, paths, shares, seats

def reach_table(mapfile_or_dict, hp_mul=None, rules=None):
    m, paths, shares, seats = load_map(mapfile_or_dict)
    mul = hp_mul if hp_mul is not None else m.get('difficulty', {}).get('hpMul', 1.0)
    use_rules(rules or m.get('difficulty', {}).get('rules', 'a2'))
    sp = campaign('natural', paths, shares, seats, mul)
    none = campaign('none', paths, shares, seats, mul)
    tap = campaign('natural', paths, shares, seats, mul, rounds=6, tap_every=0.45)
    leaks = fresh_leaks('natural', paths, shares, seats, mul)
    return {'spender_dies': sp, 'no_upgrades_walls': none, 'tapper_R1_R6': tap is None, 'tapper_dies': tap,
            'spender_fresh_leaks': leaks, 'hpMul': mul, 'rules': rules or m.get('difficulty', {}).get('rules', 'a2')}

if __name__ == '__main__':
    print(json.dumps(reach_table(sys.argv[1]), indent=1))

def reach_robust(mapfile_or_dict, hp_mul=None, rules=None, orders=8, seed=1):
    """Same reach, but over several plausible seat orders: the greedy order plus random picks of 4 of the map's
    Good seats (a kid does not always plant the best 4). Reports median and range of the spender death."""
    import random, statistics
    m, paths, shares, seats = load_map(mapfile_or_dict)
    mul = hp_mul if hp_mul is not None else m.get('difficulty', {}).get('hpMul', 1.0)
    use_rules(rules or m.get('difficulty', {}).get('rules', 'a2'))
    rnd = random.Random(seed); good = [s for s, row in zip(seats, m['seats']) if row.get('_cover', 140) >= 140] or seats
    sets = [seats[:4]] + [rnd.sample(good, min(4, len(good))) for _ in range(orders - 1)]
    sp = [campaign('natural', paths, shares, s, mul) or 26 for s in sets]
    no = [campaign('none', paths, shares, s, mul) or 26 for s in sets]
    tp = [campaign('natural', paths, shares, s, mul, rounds=6, tap_every=0.45) is None for s in sets]
    return {'spender_median': statistics.median(sp), 'spender_range': [min(sp), max(sp)], 'spender_greedy': sp[0],
            'none_median': statistics.median(no), 'none_range': [min(no), max(no)], 'tapper_wins': f"{sum(tp)}/{len(tp)}",
            'hpMul': mul, 'rules': rules or m.get('difficulty', {}).get('rules', 'a2')}

def reach_score(mapfile_or_dict, hp_mul=None, rules=None, orders=12, seed=1):
    """reach_robust plus the mean spender death over the seat orders (a continuous number for ranking maps)."""
    import random, statistics
    m, paths, shares, seats = load_map(mapfile_or_dict)
    mul = hp_mul if hp_mul is not None else m.get('difficulty', {}).get('hpMul', 1.0)
    use_rules(rules or m.get('difficulty', {}).get('rules', 'a2'))
    rnd = random.Random(seed); good = [s for s, row in zip(seats, m['seats']) if row.get('_cover', 140) >= 140] or seats
    sets = [seats[:4]] + [rnd.sample(good, min(4, len(good))) for _ in range(orders - 1)]
    sp = [campaign('natural', paths, shares, s, mul) or 26 for s in sets]
    no = [campaign('none', paths, shares, s, mul) or 26 for s in sets]
    tp = [campaign('natural', paths, shares, s, mul, rounds=6, tap_every=0.45) is None for s in sets]
    return {'spender_greedy': sp[0], 'spender_median': statistics.median(sp), 'spender_mean': round(statistics.mean(sp), 2),
            'spender_range': [min(sp), max(sp)], 'none_median': statistics.median(no), 'none_range': [min(no), max(no)],
            'tapper_R1_R6': f"{sum(tp)}/{len(tp)}", 'fresh_leaks': fresh_leaks('natural', paths, shares, seats, mul),
            'hpMul': mul, 'rules': rules or m.get('difficulty', {}).get('rules', 'a2'), 'orders': orders}
