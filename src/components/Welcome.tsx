import { useEffect } from 'react'
import { APP_VERSION } from '../config/app'
import { EASY } from '../lib/easy'
import { Avatar } from './Avatar'
import { dailyDoneToday, useProgress } from '../store/progress'
import { localDateKey } from '../lib/dates'
import type { View } from '../types'

interface WelcomeProps {
  onNavigate: (view: View) => void
}

export function Welcome({ onNavigate }: WelcomeProps) {
  const { progress, start, setEasyMode } = useProgress()
  const today = localDateKey()
  const returning = progress.started && dailyDoneToday(progress, today)

  // Welcome is Easy-only chrome. Hard stays in Settings — never a Welcome twin.
  useEffect(() => {
    setEasyMode(true)
  }, [setEasyMode])

  function begin() {
    setEasyMode(true)
    start()
    // Cold Start Easy lands Home map + coach before Match (Fixes #186).
    // Product reopen of 1.4.112 KEEP→link routing: Home-first wanted now.
    onNavigate({ name: 'hub' })
  }

  return (
    <main className="welcome is-onescreen is-alive is-easy-only">
      <div className="welcome-sky" aria-hidden />
      <div className="welcome-ridge" aria-hidden />
      <div className="welcome-hero">
        <p className="eyebrow">{EASY.welcomeEyebrow}</p>
        <h1>
          Silver City
          <span>{EASY.welcomeTag}</span>
        </h1>
        <p className="welcome-goal">{EASY.welcomeGoal}</p>
        <div className="welcome-cast">
          <figure>
            <Avatar who="river" size="lg" />
            <figcaption>YOU · RIVER</figcaption>
          </figure>
          <span className="welcome-lantern" aria-hidden />
          <figure>
            <Avatar who="juniper" size="lg" />
            <figcaption>GUIDE · JUNIPER</figcaption>
          </figure>
        </div>
        <div className="welcome-actions">
          <p className="quiet welcome-easy-note welcome-easy" role="note">
            {EASY.welcomeNote}
          </p>
          <p className="teach-chip" role="note">
            {EASY.claimTeach}
          </p>
          <button type="button" className="btn primary xl" onClick={begin}>
            {returning ? EASY.home : EASY.startEasy}
          </button>
          <p className="welcome-version">{APP_VERSION}</p>
        </div>
      </div>
    </main>
  )
}
