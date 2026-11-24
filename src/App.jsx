import { useCallback, useEffect, useMemo, useState } from 'react'
import { LockContext } from './context'
import { EMPTY, load, save } from './storage'
import { MISSIONS, todayKey } from './engine'
import { Boot, Onboard, Settings } from './intro'
import { Side, Today } from './today'
import { Lift } from './lift'
import { Fuel } from './fuel'
import { Book } from './book'

const TABS = [
  ['today', 'Today'],
  ['iron', 'Iron'],
  ['fuel', 'Fuel'],
  ['book', 'Log'],
]

export default function App() {
  const [state, setState] = useState(load)
  const [view, setView] = useState(() => (load().profile ? 'app' : 'boot'))
  const [picked, setPicked] = useState('stack')
  const [tab, setTab] = useState('today')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const update = useCallback((fn) => {
    setState((prev) => fn(prev))
  }, [])

  useEffect(() => {
    save(state)
  }, [state])

  useEffect(() => {
    const mission = state.profile?.mission || picked || 'stack'
    document.documentElement.dataset.mission = mission
    document.title = state.profile
      ? `LOCKED IN · ${state.profile.mission === 'cut' ? 'CRASH CUT' : 'STACK MASS'}`
      : 'LOCKED IN | Bulk and Cut Plans for Free Weights'
  }, [state.profile, picked])

  const api = useMemo(
    () => ({
      state,
      update,
      tab,
      setTab,
      openSettings: () => setSettingsOpen(true),
    }),
    [state, update, tab],
  )

  if (view === 'boot') {
    return (
      <LockContext.Provider value={api}>
        <a className="skip" href="#main">Skip to start</a>
        <Boot
          onChoose={(mission) => {
            setPicked(mission)
            setView('onboard')
          }}
        />
      </LockContext.Provider>
    )
  }

  if (view === 'onboard') {
    return (
      <LockContext.Provider value={api}>
        <Onboard
          initialMission={picked}
          onExit={() => setView('boot')}
          onDone={(profile, prs) => {
            const key = todayKey()
            const cleanPrs = {}
            for (const [id, value] of Object.entries(prs)) {
              const number = Number(value)
              cleanPrs[id] = value && !Number.isNaN(number) ? String(number) : ''
            }
            update((current) => ({
              ...current,
              profile,
              prs: { ...current.prs, ...cleanPrs },
              logs: {
                ...current.logs,
                [key]: { ...(current.logs[key] || {}), weight: profile.weight },
              },
            }))
            setTab('today')
            setView('app')
          }}
        />
      </LockContext.Provider>
    )
  }

  const mission = MISSIONS[state.profile.mission]

  return (
    <LockContext.Provider value={api}>
      <a className="skip" href="#main">Skip to today</a>
      <div className="shell">
        <header className="rail">
          <div className="brand-block">
            <p className="brand-kicker">Free weights</p>
            <div className="brand">Locked in</div>
            <p className="who">
              {state.profile.name} · {mission.short}
            </p>
          </div>
          <button type="button" className="mobile-edit" onClick={() => setSettingsOpen(true)}>
            Edit
          </button>
          <nav className="rail-nav" aria-label="Primary">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className="nav-btn"
                aria-current={tab === id ? 'page' : undefined}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="rail-foot">
            <button type="button" className="btn-ghost" onClick={() => setSettingsOpen(true)}>
              Edit block
            </button>
            <p>Saved on this device</p>
          </div>
        </header>
        <main id="main" className="stage">
          {tab === 'today' && <Today />}
          {tab === 'iron' && <Lift />}
          {tab === 'fuel' && <Fuel />}
          {tab === 'book' && <Book />}
        </main>
        <aside className="side">
          <Side />
        </aside>
        <nav className="tabbar" aria-label="Primary">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="tab-btn"
              aria-current={tab === id ? 'page' : undefined}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
      {settingsOpen && (
        <Settings
          onClose={() => setSettingsOpen(false)}
          onReset={() => {
            setState(JSON.parse(JSON.stringify(EMPTY)))
            setSettingsOpen(false)
            setTab('today')
            setView('boot')
          }}
        />
      )}
    </LockContext.Provider>
  )
}
