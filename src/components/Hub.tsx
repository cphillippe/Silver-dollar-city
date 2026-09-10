import { useEffect, useState } from 'react'
import { areas, findPlayable } from '../content'
import { STORY, townVoice } from '../content/story'
import { formatDeviceLocalDate, localDateKey } from '../lib/dates'
import { CITY_PLOTS, nextPlotId, type CityPlotId } from '../lib/city'
import { EASY, isEasy, scrapbookLabel } from '../lib/easy'
import { Avatar } from './Avatar'
import { DeviceDay } from './DeviceDay'
import { ShareInvite } from './ShareInvite'
import { AdSlot } from './AdSlot'
import { CityMap } from './CityMap'
import { AbilityMark } from './GemMark'
import { unlockedWatchAbilities } from '../lib/defend'
import { TIER_MARK, toolTier, WATCH_TOOLS } from '../lib/watchTools'
import {
  dailyDoneToday,
  dueCount,
  getNextGoal,
  isAreaComplete,
  isAreaUnlocked,
  morningReview,
  nextWalkView,
  rehearseGo,
  useProgress,
} from '../store/progress'
import type { View } from '../types'

interface HubProps {
  onNavigate: (view: View) => void
  openPlot?: string
}

export function Hub({ onNavigate, openPlot }: HubProps) {
  const { progress } = useProgress()
  const today = localDateKey()
  const doneToday = dailyDoneToday(progress, today)
  const due = morningReview(progress, today)
  const duePlay = due ? findPlayable(due.id) : undefined
  const waiting = dueCount(progress, today)
  const sameDay = Boolean(due && doneToday)
  const dustOff = sameDay
  const goal = getNextGoal(progress, today)
  const nextId = nextPlotId(progress, doneToday)
  const watchOpen = unlockedWatchAbilities(progress)
  const easy = isEasy(progress)
  const streetDone = progress.completed.includes('ln-street')
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

  const nextCta = dustOff
    ? 'Dust this one off'
    : goal.kind === 'daily'
      ? 'Walk today’s trail'
      : goal.kind === 'vista'
        ? 'Stand at the lookout'
        : goal.kind === 'challenge'
          ? 'Open this walk'
          : 'Do this next'

  function goNext() {
    if (dustOff) {
      onNavigate(sameDay ? rehearseGo(progress) : { name: 'daily' })
      return
    }
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

  const nextTitle = dustOff
    ? sameDay
      ? 'Dust off today’s line'
      : 'Time to dust off this one'
    : goal.title
  const nextDetail = dustOff
    ? sameDay
      ? 'You stored it this morning. Map the claim again — not a checkbox.'
      : duePlay
        ? `${duePlay.challenge.title} · an older walk.`
        : 'An older page is waiting to be rebuilt.'
    : easy
      ? goal.detail.replace(/\bparable\b/gi, EASY.parable).replace(/\bcreed\b/gi, EASY.creed)
      : goal.detail

  return (
    <main className="hub is-town is-inhabited" aria-label="The town">
      <section className="next-card do-next" aria-label="Do this next">
        <p className="eyebrow">Do this next</p>
        {dustOff ? <DeviceDay /> : null}
        <h2>{nextTitle}</h2>
        <p className="do-next-detail">{nextDetail}</p>
        {dustOff ? (
          <p className="quiet">
            {waiting > 1
              ? `${waiting} pages due · about a minute`
              : sameDay
                ? 'Same-day dust-off · mapping + recall'
                : 'A spaced recall · about a minute'}
            {dustOff ? ` · ${formatDeviceLocalDate()}` : ''}
          </p>
        ) : null}
        <button type="button" className="btn primary xl" onClick={goNext}>
          {nextCta}
        </button>
      </section>

      {!streetDone && (doneToday || progress.completed.length > 0) ? (
        <section className="street-link" aria-label="Link the street">
          <div className="card-lead">
            <Avatar who="mercy" size="sm" />
            <div>
              <p className="eyebrow">Match idea · place · person.</p>
              <h2>Link the street</h2>
              <p className="quiet">{easy ? EASY.linkDemo : 'Idea · place · person'}</p>
              <p className="town-line">
                {easy
                  ? 'Match each idea to its place and person. Then it lives in your scrapbook of links.'
                  : 'Snap a claim to its lot and keeper. Lit nodes reopen from the town map.'}
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

      <nav className="town-tools" aria-label="Town actions">
        <button type="button" className="btn tiny" onClick={() => setPlot(nextId)}>
          {scrapbookLabel(easy)}
        </button>
        <button
          type="button"
          className="btn tiny gold"
          onClick={() => onNavigate({ name: 'link' })}
        >
          Link the street
        </button>
        <button
          type="button"
          className="btn tiny"
          onClick={() => onNavigate({ name: 'profile' })}
        >
          Profile
        </button>
      </nav>

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
          className="btn gold"
          onClick={() => onNavigate({ name: 'defend' })}
        >
          Hold the night
        </button>
      </section>

      <AdSlot slot="hub-banner" />

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
                  {current ? <span className="street-next">Next</span> : null}
                </div>
              </div>
              <button
                type="button"
                className="btn tiny"
                onClick={() => setPlot(plot.id)}
              >
                {easy ? EASY.mindMapShort : 'Mind map'}
              </button>
              <button
                type="button"
                className={`btn tiny ${complete && unlocked ? 'street-rehearse' : ''} ${current && unlocked && !complete ? 'gold' : ''}`}
                disabled={!unlocked}
                aria-label={complete && unlocked ? STORY.takeaway : undefined}
                onClick={() => {
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
                  ? plot.areaId === 'witness-bench'
                    ? 'Two Hollow walks'
                    : 'Gated'
                  : complete
                    ? 'Hold the line'
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

      <AdSlot slot="between-districts" />

      {goal.kind === 'vista' ? (
        <button
          type="button"
          className="btn gold"
          onClick={() => onNavigate({ name: 'vista' })}
        >
          Stand at the lookout
        </button>
      ) : null}
    </main>
  )
}
