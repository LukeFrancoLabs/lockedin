import { useState } from 'react'
import {
  PRS,
  endpoints,
  findSession,
  formatStamp,
  patchLog,
  prettyWeight,
  recentDates,
  sessionsThisWeek,
  todayKey,
  trendCall,
  weightSeries,
} from './engine'
import { useLock } from './context'
import { NumberField } from './ui'

const SLEEP = [
  ['Short', 5],
  ['6h', 6],
  ['7h', 7],
  ['8h+', 8.5],
]

export function Book() {
  const { state, update } = useLock()
  const [selected, setSelected] = useState(todayKey())
  const { profile } = state
  const unit = profile.unit
  const points = weightSeries(state.logs)
  const ends = endpoints(points)
  const trend = trendCall(points)
  const log = state.logs[selected] || {}
  const session = findSession(log.sessionId)
  const days = recentDates(21)
  const weekSessions = sessionsThisWeek(state.logs)

  function setWeight(value) {
    update((current) => patchLog(current, selected, { weight: value === '' ? log.weight : Number(value) }))
  }

  return (
    <section>
      <p className="kicker">{points.length < 2 ? 'The book' : 'Since the first weigh-in'}</p>
      <h1>{points.length < 2 ? prettyWeight(log.weight ?? profile.weight, unit) : signed(ends.delta, unit)}</h1>
      <p className="deck">
        {profile.mission === 'cut'
          ? 'A cut wants this line falling without the lifts collapsing.'
          : 'A stack wants this line climbing because the bar is climbing too.'}
        {' '}Iron sessions this week: {weekSessions}.
      </p>
      {points.length >= 2 ? <Chart points={points} /> : <p className="callout">Log two weigh-ins and the line shows up.</p>}
      <p className="muted">
        {trend.ready
          ? `Weekly average ${signed(trend.delta, unit)} versus the prior week.`
          : trend.text}
      </p>
      <div className="day-row" role="listbox" aria-label="Recent days">
        {days.map((date) => {
          const key = todayKey(date)
          const hit = state.logs[key]
          return (
            <button
              key={key}
              type="button"
              className={key === selected ? 'day-chip on' : 'day-chip'}
              aria-selected={key === selected}
              onClick={() => setSelected(key)}
            >
              <span>{formatStamp(date).slice(0, 3)}</span>
              <strong>{date.getDate()}</strong>
              <i className={hit?.weight ? 'filled' : ''} />
            </button>
          )
        })}
      </div>
      <article className="editor">
        <header className="sheet-head">
          <h2>{formatStamp(parseLoose(selected))}</h2>
          <span className="muted">{session ? session.name : log.restHonored ? 'Line held' : 'No session'}</span>
        </header>
        <label className="field">
          <span>Bodyweight ({unit})</span>
          <NumberField
            value={log.weight ?? ''}
            onCommit={setWeight}
            aria-label="Bodyweight for this day"
          />
        </label>
        <p className="label">Sleep</p>
        <div className="seg">
          {SLEEP.map(([label, hours]) => (
            <button
              key={label}
              type="button"
              className={log.sleep === hours ? 'on' : ''}
              aria-pressed={log.sleep === hours}
              onClick={() => update((current) => patchLog(current, selected, { sleep: hours }))}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="field">
          <span>Steps</span>
          <NumberField
            value={log.steps ?? ''}
            onCommit={(value) =>
              update((current) => patchLog(current, selected, { steps: value === '' ? '' : Number(value) }))
            }
          />
        </label>
        <label className="field">
          <span>Note</span>
          <textarea
            maxLength={280}
            rows={3}
            value={log.note || ''}
            placeholder="What the bar actually did."
            onChange={(event) =>
              update((current) => patchLog(current, selected, { note: event.target.value }))
            }
          />
        </label>
      </article>
      <h2>Top sets</h2>
      <div className="pr-grid">
        {PRS.map((lift) => (
          <label key={lift.id} className="field">
            <span>{lift.name}</span>
            <NumberField
              value={state.prs[lift.id] || ''}
              onCommit={(value) =>
                update((current) => ({
                  ...current,
                  prs: { ...current.prs, [lift.id]: value },
                }))
              }
            />
          </label>
        ))}
      </div>
      {ends && (
        <p className="muted">
          First mark {prettyWeight(ends.first.weight, unit)} on {ends.first.date}. Latest {prettyWeight(ends.last.weight, unit)}.
        </p>
      )}
    </section>
  )
}

function signed(delta, unit) {
  const rounded = Math.round(delta * 10) / 10
  const abs = Math.abs(rounded)
  const shown = Number.isInteger(abs) ? String(abs) : abs.toFixed(1)
  const arrow = rounded > 0 ? '+' : rounded < 0 ? '−' : ''
  return `${arrow}${shown} ${unit}`
}

function parseLoose(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function Chart({ points }) {
  const width = 320
  const height = 120
  const values = points.map((point) => point.weight)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const coords = points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width
    const y = height - ((point.weight - min) / span) * (height - 8) - 4
    return [x, y]
  })
  const d = coords.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Bodyweight trend">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2.5" />
      {coords.map(([x, y], index) => (
        <circle key={points[index].date} cx={x} cy={y} r="3" />
      ))}
    </svg>
  )
}
