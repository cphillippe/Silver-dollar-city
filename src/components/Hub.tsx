import { useEffect, useState } from 'react'
import { areas, findPlayable, journalForChallenge } from '../content'
import { STREET_TRIPLES, nextStreetWalk, streetIsComplete } from '../content/links'
import { STORY, townVoice } from '../content/story'
import { LOT_STORY } from '../content/lots'
import { localDateKey } from '../lib/dates'
import { CITY_PLOTS, nextGift, nextPlotId, type CityPlotId } from '../lib/city'
import { anyUpgradeReady, lotTapWhy, visualFills, visualSnapshot } from '../lib/cityBuild'
import { extraStreetPacks } from '../content/paidStreets'
import { PACK_LINE } from '../config/commerce'
import { packIsUnlocked } from '../lib/commerce'
import { EASY, EASY_MATCH_LINE, easyHomeFocus, easyHoldView, easyLineHeld, easyLoopLine, easyMatchReady, isEasy } from '../lib/easy'
import { storyPlayFor } from '../lib/storyPlay'
import { markLater, readLater, sessionDue } from '../lib/recall'
import { Avatar } from './Avatar'
import { ShareInvite } from './ShareInvite'
import { useCommerce } from './AdSlot'
import { CityMap } from './CityMap'
import { AbilityMark } from './GemMark'
import { unlockedWatchAbilities } from '../lib/defend'
import { TIER_MARK, toolTier, WATCH_TOOLS } from '../lib/watchTools'
import {
  areaGateCopy,
  dailyDoneToday,
  dueCount,
  getNextGoal,
  isAreaComplete,
  isAreaUnlocked,
  nextWalkView,
  rehearseGo,
  useProgress,
} from '../store/progress'
import type { View } from '../types'
import { RecallOffer } from './RecallOffer'
import { SupportToast } from './SupportToast'

interface HubProps {
  onNavigate: (view: View) => void
  openPlot?: string
}

export function Hub({ onNavigate, openPlot }: HubProps) {
  const { progress, snoozeReviews } = useProgress()
  const today = localDateKey()
  const doneToday = dailyDoneToday(progress, today)
  const waiting = dueCount(progress, today)
  const [later, setLater] = useState(() => readLater(today))
  const recallItems = sessionDue(progress, today, later)
  const goal = getNextGoal(progress, today)
  const nextId = nextPlotId(progress, doneToday)
  const watchOpen = unlockedWatchAbilities(progress)
  const easy = isEasy(progress)
  const commerce = useCommerce()
  const streetDone = streetIsComplete(progress)
  const streetLinked = progress.streetLinked ?? []
  const tonight = nextStreetWalk(streetLinked)
  const midStreet = !streetDone && streetLinked.length > 0
  const requested =
    openPlot && CITY_PLOTS.some((plot) => plot.id === openPlot)
      ? (openPlot as CityPlotId)
      : null
  const [mindPlot, setMindPlot] = useState<CityPlotId | null>(requested)

  useEffect(() => {
    setMindPlot(requested)
  }, [requested])

  function setPlot(id: CityPlotId | null) {
    setMindPlot(id)
    if (!id && openPlot) onNavigate({ name: 'hub' })
  }

  if (easy) {
    const matchReady = easyMatchReady(progress)
    const focus = easyHomeFocus(progress)
    const loopId = easyLoopLine(progress)
    const coldMercy = loopId === EASY_MATCH_LINE && !easyLineHeld(progress, EASY_MATCH_LINE)
    const easySnap = visualSnapshot(progress)
    const easyFills = visualFills(progress)
    const buildGift = anyUpgradeReady(progress)
      ? 'A building is ready. Tap it, then Build this.'
      : nextGift(nextId, easySnap[nextId], easyFills[nextId] ?? 0, true)
    return (
      <main className="hub is-easy-home" aria-label="Home">
        <header className="easy-home-head">
          <h1>{EASY.home}</h1>
          <p className="quiet">
            {focus === 'hold'
              ? 'The story is open. Lock in the line.'
              : storyPlayFor(loopId) === 'father-run'
                ? EASY.runHome
                : storyPlayFor(loopId) === 'road-maze'
                  ? EASY.mazeHome
                  : storyPlayFor(loopId) === 'claim-merge'
                    ? EASY.mergeHome
                    : storyPlayFor(loopId) === 'source-dig'
                      ? EASY.digHome
                      : storyPlayFor(loopId) === 'story-snap'
                        ? EASY.snapHome
                        : coldMercy
                      ? 'Find Mercy’s story at Story Creek.'
                      : 'Find the gems. The story opens as you play.'}
          </p>
        </header>
        <section className="easy-home-map" aria-label="Your map · person · place · idea">
          <CityMap
            onNavigate={onNavigate}
            mindPlot={mindPlot}
            onMindPlot={setPlot}
          />
        </section>
        <section className="easy-build-it" aria-label="Build It">
          <p className="eyebrow">Build It</p>
          <p className="easy-build-gift">{buildGift}</p>
          <button
            type="button"
            className="btn gold xl"
            onClick={() => setPlot(nextId)}
          >
            Build this
          </button>
        </section>
        {!matchReady || coldMercy ? (
          <ol className="easy-coach" aria-label="Your next steps">
            <li className={focus === 'learn' || !matchReady ? 'is-now' : ''}>
              <button type="button" className="easy-coach-step" onClick={() => onNavigate({ name: 'learn' })}>
                Learn
              </button>
            </li>
            <li className={focus === 'match' ? 'is-now' : ''}>
              <button type="button" className="easy-coach-step" onClick={() => onNavigate({ name: 'link' })}>
                Match
              </button>
            </li>
            <li className={focus === 'hold' ? 'is-now' : ''}>
              <button
                type="button"
                className="easy-coach-step"
                onClick={() => onNavigate(easyHoldView(progress))}
              >
                Lock In
              </button>
            </li>
          </ol>
        ) : null}

        <nav className="easy-core" aria-label="Play">
          <button
            type="button"
            className={`btn xl ${focus === 'match' ? 'primary' : ''}`}
            onClick={() => onNavigate({ name: 'link' })}
          >
            {storyPlayFor(loopId) === 'father-run'
              ? EASY.runMatch
              : storyPlayFor(loopId) === 'road-maze'
                ? EASY.mazeMatch
                : storyPlayFor(loopId) === 'claim-merge'
                  ? EASY.mergeMatch
                  : storyPlayFor(loopId) === 'source-dig'
                    ? EASY.digMatch
                    : storyPlayFor(loopId) === 'story-snap'
                      ? EASY.snapMatch
                      : EASY.matchCta}
          </button>
          <button
            type="button"
            className={`btn xl ${focus === 'hold' ? 'primary' : ''}`}
            onClick={() => onNavigate(easyHoldView(progress))}
          >
            {EASY.saved}
          </button>
          {matchReady ? null : (
            <p className="quiet easy-match-lock">{EASY.readStoryFirst}</p>
          )}
          <button
            type="button"
            className="text-link"
            onClick={() => onNavigate({ name: 'learn' })}
          >
            {EASY.readStory}
          </button>
        </nav>
        <section className="easy-extra-streets" aria-label="Extra streets">
          <p className="eyebrow">{EASY.packs}</p>
          <p className="quiet">{PACK_LINE}</p>
          {extraStreetPacks().map((pack) => {
            const open = packIsUnlocked(pack.id, commerce)
            return (
              <button
                key={pack.id}
                type="button"
                className="btn"
                onClick={() =>
                  onNavigate({ name: 'pack-street', packId: pack.id })
                }
              >
                {open ? pack.street : `Locked · ${pack.street} · ${pack.priceLabel}`}
              </button>
            )
          })}
        </section>
        <SupportToast />
      </main>
    )
  }

  const nextCta =
    goal.kind === 'daily'
      ? easy
        ? EASY.readStory
        : 'Walk today’s trail'
      : goal.kind === 'vista'
        ? 'Stand at the lookout'
        : goal.kind === 'challenge'
          ? 'Open this walk'
          : 'Do this next'

  function goNext() {
    if (goal.kind === 'daily') {
      onNavigate({ name: 'daily' })
      return
    }
    if (goal.kind === 'welcome') {
      onNavigate({ name: 'welcome' })
      return
    }
    if (goal.kind === 'vista') {
      onNavigate({ name: 'vista' })
      return
    }
    if (goal.challengeId && goal.areaId) {
      onNavigate({
        name: 'challenge',
        areaId: goal.areaId,
        challengeId: goal.challengeId,
      })
      return
    }
    if (goal.areaId) {
      onNavigate(nextWalkView(goal.areaId, progress.completed))
    }
  }

  const nextTitle = easy && goal.kind === 'daily' ? EASY.readStory : goal.title
  const nextDetail = easy
    ? goal.detail
        .replace(/\bparable\b/gi, EASY.parable)
        .replace(/\bcreed\b/gi, `creed (${EASY.creed})`)
    : goal.detail

  function openRecall(id: string) {
    onNavigate({
      name: 'journal',
      focusId: journalForChallenge(id)?.id ?? id,
      autoQuiz: true,
    })
  }

  function skipLater() {
    setLater(markLater(today, recallItems.map((item) => item.id), true))
  }

  function skipNotToday() {
    snoozeReviews(
      recallItems.map((item) => item.id),
      today,
    )
    setLater(markLater(today, recallItems.map((item) => item.id), true))
  }

  return (
    <main className="hub is-town is-inhabited" aria-label="The town">
      {easy ? null : midStreet ? (
      <section className="next-card do-next" aria-label="Do this next">
        <p className="eyebrow">Do this next</p>
        <h2>Tonight’s street</h2>
        <p className="do-next-detail">
          {streetLinked.length} of {STREET_TRIPLES.length} facts · {tonight?.placeTitle ?? 'next place'} tonight
        </p>
        <p className="quiet">
          {STREET_TRIPLES.length - streetLinked.length} facts still wait. One more round, then stop.
        </p>
        <button type="button" className="btn primary xl" onClick={() => onNavigate({ name: 'link' })}>
          {EASY.continueStreet}
        </button>
        <button type="button" className="btn xl" onClick={goNext}>
          {nextCta}
        </button>
      </section>
      ) : (
      <section className="next-card do-next" aria-label="Do this next">
        <p className="eyebrow">Do this next</p>
        <h2>{nextTitle}</h2>
        <p className="do-next-detail">{nextDetail}</p>
        {waiting > 0 ? (
          <p className="quiet">
            {waiting} pages due — offered below, not forced.
          </p>
        ) : null}
        <button type="button" className="btn primary xl" onClick={goNext}>
          {nextCta}
        </button>
      </section>
      )}

      {!easy && !streetDone && !midStreet ? (
        <section className="street-link" aria-label="Link the street">
          <div className="card-lead">
            <Avatar who="mercy" size="sm" />
            <div>
              <p className="eyebrow">Match idea · place · person.</p>
              <h2>Link the street</h2>
              <p className="quiet">Idea · place · person · one place per sitting</p>
              <p className="town-line">
                Snap a claim to its lot and keeper. A sitting is tonight’s street — not all 45 facts at once.
              </p>
              <p className="street-lot-why">
                Mercy’s pictures at the creek. Silas’s ledger at the square. Juniper’s lamp on the porch — meant to be seen.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn gold xl"
            onClick={() => onNavigate({ name: 'link' })}
          >
            Link the street
          </button>
        </section>
      ) : null}

      <CityMap
        onNavigate={onNavigate}
        mindPlot={mindPlot}
        onMindPlot={setPlot}
      />

      <RecallOffer
        items={recallItems.map((trace) => ({
          id: trace.id,
          title:
            journalForChallenge(trace.id)?.title ??
            findPlayable(trace.id)?.challenge.title ??
            (easy ? 'A sentence you kept' : 'A held line'),
        }))}
        onOpen={openRecall}
        onLater={skipLater}
        onNotToday={skipNotToday}
      />

      <nav className="town-tools" aria-label="Town actions">
        <button type="button" className="btn tiny" onClick={() => setPlot(nextId)}>
          {easy ? EASY.manage : 'Manage'}
        </button>
        <button
          type="button"
          className={`btn tiny ${easy ? '' : 'gold'}`}
          aria-label={easy ? EASY.connectLink : 'Link the street'}
          onClick={() => onNavigate({ name: 'link' })}
        >
          {easy ? EASY.matchCta : 'Link the street'}
        </button>
        {easy ? null : (
        <>
        <button
          type="button"
          className="btn tiny"
          onClick={() => onNavigate({ name: 'profile' })}
        >
          Profile
        </button>
        <button
          type="button"
          className="btn tiny"
          onClick={() => onNavigate({ name: 'settings' })}
        >
          Support the trail
        </button>
        </>
        )}
      </nav>

      {easy ? null : (
      <section
        className={`night-watch ${progress.defense.cleared ? 'is-held' : ''}`}
        aria-label="Night Watch"
      >
        <div className="night-watch-glow" aria-hidden />
        <div className="card-lead">
          <Avatar who="juniper" size="sm" />
          <div>
            <p className="eyebrow">{progress.defense.cleared ? 'Still watched' : 'Night Watch'}</p>
            <h2>Hold the night</h2>
            <p className="quiet">Learn · hold · deploy</p>
            <p className="town-line">
              Held lines turn the night toward heaven
              {progress.defense.cleared
                ? ` · ${progress.defense.cleared} night${progress.defense.cleared === 1 ? '' : 's'} held.`
                : '.'}
            </p>
            <p className="night-watch-gems" aria-label="Night abilities">
              {WATCH_TOOLS.map((tool) => (
                <span
                  key={tool.id}
                  className={watchOpen.includes(tool.id) ? 'is-ready' : 'is-locked'}
                  title={`${tool.label} ${TIER_MARK[toolTier(tool, progress)]}`}
                >
                  <AbilityMark ability={tool.id} size="sm" />
                </span>
              ))}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn gold xl"
          onClick={() => onNavigate({ name: 'defend' })}
        >
          Hold the night
        </button>
      </section>
      )}

      {easy ? null : (
      <details className="street-drawer">
        <summary>Homes on the street</summary>
        <ol className="city-streets">
        {CITY_PLOTS.filter((plot) => plot.areaId || plot.id === 'porch').map((plot) => {
          const area = plot.areaId
            ? areas.find((item) => item.id === plot.areaId)
            : undefined
          const unlocked = plot.id === 'porch'
            ? true
            : area
              ? isAreaUnlocked(area.id, progress.completed)
              : false
          const complete = area
            ? isAreaComplete(area, progress.completed)
            : doneToday
          const current = plot.id === nextId
          const streetVoice = townVoice(plot.id)

          return (
            <li
              key={plot.id}
              className={`${unlocked ? '' : 'is-locked'} ${current ? 'is-next' : ''}`}
            >
              <div className="street-name">
                <Avatar who={streetVoice.who} size="sm" />
                <div>
                  <strong>{plot.title}</strong>
                  <em className="lot-path">{LOT_STORY[plot.id].path}</em>
                  {current ? <span className="street-next">Next</span> : null}
                </div>
              </div>
              {unlocked ? null : (
                <p className="street-lock">
                  {lotTapWhy(
                    plot.id,
                    progress,
                    easy,
                    unlocked,
                    plot.areaId
                      ? areaGateCopy(plot.areaId, progress.completed, easy)
                      : '',
                    doneToday,
                  ) ??
                    (easy
                      ? 'This street is locked. Finish the walk before it first.'
                      : 'This gate is still closed.')}
                </p>
              )}
              <button
                type="button"
                className="btn tiny"
                onClick={() => setPlot(plot.id)}
              >
                {easy ? EASY.manage : 'Manage'}
              </button>
              <button
                type="button"
                className={`btn tiny ${complete && unlocked ? 'street-rehearse' : ''} ${current && unlocked && !complete ? 'gold' : ''}`}
                aria-label={complete && unlocked ? STORY.takeaway : undefined}
                onClick={() => {
                  if (!unlocked) {
                    setPlot(plot.id)
                    return
                  }
                  if (complete) {
                    onNavigate(
                      rehearseGo(
                        progress,
                        plot.id === 'porch' ? 'porch' : plot.areaId,
                      ),
                    )
                    return
                  }
                  onNavigate(
                    plot.id === 'porch'
                      ? { name: 'daily' }
                      : nextWalkView(plot.areaId ?? 'parable-hollow', progress.completed),
                  )
                }}
              >
                {!unlocked
                  ? 'Why locked'
                  : complete
                    ? 'Lock in the line'
                    : current
                      ? plot.id === 'porch'
                        ? 'Walk next'
                        : 'Build next'
                      : 'Enter'}
              </button>
            </li>
          )
        })}
      </ol>
        {(progress.completed.length > 0 || doneToday) && <ShareInvite compact />}
      </details>
      )}

      {easy || goal.kind !== 'vista' ? null : (
        <button
          type="button"
          className="btn gold"
          onClick={() => onNavigate({ name: 'vista' })}
        >
          Stand at the lookout
        </button>
      )}

      <SupportToast />
    </main>
  )
}
