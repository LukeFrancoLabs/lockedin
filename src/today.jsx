import {
  dayShape,
  dailyOrder,
  dailyQuote,
  dutiesFor,
  formatCount,
  formatStamp,
  isHit,
  patchLog,
  seasonDay,
  sessionFor,
  setProgress,
  streak,
  targets,
  todayKey,
  waterLabel,
  weekDays,
} from './engine'
import { useLock } from './context'

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function Today() {
  const { state, update, setTab } = useLock()
  const date = new Date()
  const key = todayKey(date)
  const log = state.logs[key] || {}
  const { profile } = state
  const mission = profile.mission
  const session = sessionFor(mission, date)
  const quote = dailyQuote(mission, date)
  const order = dailyOrder(mission, date)
  const plan = targets(profile.weight, profile.unit, mission)
  const run = streak(state.logs, date)
  const day = seasonDay(profile, date)
  const progress = setProgress(session, log)
  const yesterday = new Date(date)
  yesterday.setDate(date.getDate() - 1)
  const missed = day > 1 && !isHit(state.logs[todayKey(yesterday)])

  function pledge() {
    update((current) =>
      patchLog(current, key, {
        pledge: true,
        pledgedAt: new Date().toISOString(),
      }),
    )
  }

  if (!log.pledge) {
    return (
      <section className="gate">
        <p className="kicker">
          Day {String(day).padStart(2, '0')} · {formatStamp(date)}
        </p>
        <h1 className="display">
          {mission === 'cut' ? (
            <>
              Crash
              <br />
              cut
            </>
          ) : (
            <>
              Stack
              <br />
              mass
            </>
          )}
        </h1>
        <blockquote className="quote">{quote}</blockquote>
        <div className="order hatch">
          <p className="kicker">Today’s order</p>
          <p>{order}</p>
          <p className="session-name">{session.name}</p>
          <p className="muted">
            {formatCount(plan.kcal)} kcal · {plan.protein} g protein · streak {run}
          </p>
        </div>
        {missed && (
          <p className="banner">Yesterday was a miss. The streak is quiet. Today still counts if you do the work.</p>
        )}
        <button className="btn btn-block" onClick={pledge}>
          I’m locked in
        </button>
        <button className="btn-ghost btn-block" onClick={() => setTab('iron')}>
          Preview the iron
        </button>
      </section>
    )
  }

  const duties = dutiesFor(mission)
  const doneDuties = duties.filter((duty) => log.duties?.[duty.id]).length

  return (
    <section>
      <p className="kicker">
        Day {String(day).padStart(2, '0')} · {formatStamp(date)} · {profile.name}
      </p>
      <h1>{session.name}</h1>
      <p className="deck">{order}</p>
      <div className="stat-row">
        <Stat k="Calories" v={formatCount(plan.kcal)} />
        <Stat k="Protein" v={`${plan.protein}g`} />
        <Stat k="Streak" v={String(run)} />
      </div>
      <div className="week" aria-label="This week">
        {weekDays(date).map((item, index) => {
          const itemKey = todayKey(item)
          const hit = isHit(state.logs[itemKey])
          return (
            <div key={itemKey} className={hit ? 'week-dot on' : 'week-dot'} aria-current={itemKey === key ? 'date' : undefined}>
              <span>{WEEK[index]}</span>
              <i />
            </div>
          )
        })}
      </div>
      <article className="session-card">
        <p className="kicker">{session.rest ? 'No barbell required' : 'Iron'}</p>
        <h2>{session.rest ? 'Hold the standard' : 'Open the session'}</h2>
        <p>{session.brief}</p>
        {!session.rest && (
          <p className="muted">
            Working sets {progress.done}/{progress.total}
            {log.trained ? ' · session closed' : ''}
          </p>
        )}
        {log.sessionId === 'garage' && <p className="muted">Garage pump logged.</p>}
        <button className="btn" onClick={() => setTab('iron')}>
          {log.trained || log.restHonored ? 'Review it' : 'Go to iron'}
        </button>
      </article>
      <h2>Non-negotiables</h2>
      <p className="muted">
        {doneDuties}/{duties.length} checked. These are the day. The quote was just the door.
      </p>
      <div className="stack-list">
        {duties.map((duty) => {
          const on = Boolean(log.duties?.[duty.id])
          return (
            <button
              key={duty.id}
              type="button"
              className={on ? 'check on' : 'check'}
              aria-pressed={on}
              onClick={() =>
                update((current) => patchLog(current, key, { duties: { [duty.id]: !on } }))
              }
            >
              <span className="box" aria-hidden="true" />
              <span>{duty.label}</span>
            </button>
          )
        })}
      </div>
      <h2>The shape of the day</h2>
      <ol className="timeline">
        {dayShape(mission).map(([label, detail]) => (
          <li key={label}>
            <span className="kicker">{label}</span>
            <p>{detail}</p>
          </li>
        ))}
      </ol>
      <p className="muted">Water target {waterLabel(plan.waterOz, profile.unit)}. Weigh in from the log if you have not yet.</p>
    </section>
  )
}

function Stat({ k, v }) {
  return (
    <div className="stat">
      <span>{k}</span>
      <strong className="num">{v}</strong>
    </div>
  )
}

export function Side() {
  const { state } = useLock()
  const date = new Date()
  const profile = state.profile
  if (!profile) return null
  const plan = targets(profile.weight, profile.unit, profile.mission)
  const run = streak(state.logs, date)
  return (
    <div className="side-stack">
      <p className="kicker">{profile.mission === 'cut' ? 'Crash cut' : 'Stack mass'}</p>
      <blockquote className="quote">{dailyQuote(profile.mission, date)}</blockquote>
      <div className="stat">
        <span>Streak</span>
        <strong className="num">{run}</strong>
      </div>
      <div className="stat">
        <span>Calories</span>
        <strong className="num">{formatCount(plan.kcal)}</strong>
      </div>
      <div className="stat">
        <span>Protein</span>
        <strong className="num">{plan.protein}g</strong>
      </div>
      <p className="muted">Field maintenance {formatCount(plan.maintain)}. Block length {plan.block}.</p>
    </div>
  )
}
