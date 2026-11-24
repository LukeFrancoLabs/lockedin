import { useState } from 'react'
import {
  GARAGE,
  formatStamp,
  lastLoad,
  patchLog,
  platesFor,
  sessionFor,
  setProgress,
  shortDate,
  todayKey,
} from './engine'
import { useLock } from './context'
import { NumberField } from './ui'

export function Lift() {
  const { state, update } = useLock()
  const [garage, setGarage] = useState(false)
  const [ask, setAsk] = useState(false)
  const [banner, setBanner] = useState('')
  const date = new Date()
  const key = todayKey(date)
  const { profile } = state
  const log = state.logs[key] || {}
  const base = sessionFor(profile.mission, date)
  const session = garage ? GARAGE : base
  const progress = setProgress(session, log)
  const unit = profile.unit
  const closed = log.sessionId === session.id && (session.rest ? log.restHonored : log.trained)

  function toggleSet(exercise, index) {
    const id = `${exercise.id}:${index}`
    update((current) =>
      patchLog(current, key, {
        sets: { [id]: !current.logs[key]?.sets?.[id] },
        sessionId: session.id,
      }),
    )
  }

  function markAll(exercise) {
    const sets = {}
    for (let index = 0; index < exercise.sets; index += 1) {
      sets[`${exercise.id}:${index}`] = true
    }
    update((current) => patchLog(current, key, { sets, sessionId: session.id }))
  }

  function saveLoad(exercise, value) {
    if (exercise.pr && value !== '') {
      const previous = Number(state.prs[exercise.pr])
      const incoming = Number(value)
      if (!Number.isNaN(incoming) && previous && incoming > previous) {
        setBanner(`${exercise.name} is now ${incoming} ${unit}. That is the top set.`)
      }
    }
    update((current) => {
      let next = patchLog(current, key, {
        loads: { [exercise.id]: value },
        sessionId: session.id,
      })
      if (exercise.pr && value !== '') {
        const previous = Number(current.prs[exercise.pr])
        const incoming = Number(value)
        if (!Number.isNaN(incoming) && (!previous || incoming > previous)) {
          next = { ...next, prs: { ...next.prs, [exercise.pr]: String(incoming) } }
        }
      }
      return next
    })
  }

  function closeSession() {
    if (!session.rest && progress.done < progress.total && !ask) {
      setAsk(true)
      return
    }
    update((current) =>
      patchLog(current, key, {
        trained: !session.rest,
        restHonored: Boolean(session.rest),
        pledge: true,
        pledgedAt: current.logs[key]?.pledgedAt || new Date().toISOString(),
        sessionId: session.id,
        ...(session.rest || session.id === 'garage' ? {} : { duties: { lift: true } }),
      }),
    )
    setAsk(false)
  }

  return (
    <section>
      <p className="kicker">
        {formatStamp(date)} · {session.rest ? 'Rest' : `${progress.done}/${progress.total} sets`}
      </p>
      <h1>{session.name}</h1>
      <p className="deck">{session.brief}</p>
      <p className="muted">
        {session.minutes ? `About ${session.minutes} min · ` : ''}
        Barbell, dumbbell, pull-up bar. Ramp-up sets do not get a checkbox.
      </p>
      {banner && <p className="banner stamp-banner">{banner}</p>}
      {session.rest && !garage && (
        <>
          <ol className="timeline">
            {session.orders.map((item) => (
              <li key={item}>
                <p>{item}</p>
              </li>
            ))}
          </ol>
          <div className="action-row">
            <button className="btn" onClick={closeSession} disabled={log.restHonored && !garage}>
              {log.restHonored ? 'Line held' : 'I held the line'}
            </button>
            <button className="btn-ghost" onClick={() => setGarage(true)}>
              Garage pump
            </button>
          </div>
        </>
      )}
      {!!session.blocks && (
        <div className="stack-list">
          {session.blocks.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              index={index}
              exercise={exercise}
              log={log}
              unit={unit}
              bar={profile.bar}
              previous={lastLoad(state.logs, exercise.id, key)}
              pr={exercise.pr ? state.prs[exercise.pr] : ''}
              onToggle={(setIndex) => toggleSet(exercise, setIndex)}
              onAll={() => markAll(exercise)}
              onLoad={(value) => saveLoad(exercise, value)}
            />
          ))}
          <button
            className={progress.done === progress.total && progress.total > 0 ? 'btn ready' : 'btn'}
            onClick={closeSession}
            disabled={closed}
          >
            {ask ? 'Close it anyway' : closed ? 'Session closed' : 'Close the session'}
          </button>
          {garage && (
            <button className="btn-ghost" onClick={() => { setGarage(false); setAsk(false) }}>
              Back to the order
            </button>
          )}
          {profile.mission === 'cut' && !session.rest && (
            <p className="callout">
              If this weight felt easy last month and terrible today, check sleep and the size of the deficit before you decide you got weak.
            </p>
          )}
          {profile.mission === 'stack' && !session.rest && (
            <p className="callout">
              Miss the last rep? Stop the set. Rest longer, keep the next set at the same weight, and make the reps clean.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

function ExerciseCard({ exercise, index, log, unit, bar, previous, pr, onToggle, onAll, onLoad }) {
  const load = log.loads?.[exercise.id] || ''
  const plates = platesFor(load, unit, bar)
  const current = Number(load)
  const prior = Number(previous?.load)
  let delta = ''
  if (load && previous && !Number.isNaN(current) && !Number.isNaN(prior)) {
    const diff = Math.round((current - prior) * 10) / 10
    if (diff > 0) delta = `Up ${diff} from ${shortDate(previous.date)}`
    else if (diff < 0) delta = `${Math.abs(diff)} under ${shortDate(previous.date)}`
    else delta = `Matched ${shortDate(previous.date)}`
  } else if (previous) {
    delta = `Last ${previous.load} ${unit} on ${shortDate(previous.date)}`
  }

  return (
    <article className="ex">
      <header>
        <span className="idx">{String(index + 1).padStart(2, '0')}</span>
        <div>
          <h2>{exercise.name}</h2>
          <p className="muted">
            {exercise.sets} × {exercise.reps} · rest {exercise.rest}
          </p>
        </div>
        <button type="button" className="texty" onClick={onAll}>
          All
        </button>
      </header>
      <div className="load-row">
        <NumberField
          aria-label={`${exercise.name} load`}
          placeholder={pr ? `Top set ${pr}` : 'Load'}
          value={load}
          onCommit={onLoad}
        />
        <span className="unit-tag">{unit}</span>
        {pr && !load && (
          <button type="button" className="texty" onClick={() => onLoad(String(pr))}>
            Use {pr}
          </button>
        )}
      </div>
      {delta && <p className="delta">{delta}</p>}
      {plates && !plates.error && plates.plates.length > 0 && (
        <PlateRow plates={plates} unit={unit} />
      )}
      {plates?.error === 'under-bar' && <p className="muted">Under bar weight. Check the bar setting.</p>}
      <div className="sets">
        {Array.from({ length: exercise.sets }, (_, setIndex) => {
          const on = Boolean(log.sets?.[`${exercise.id}:${setIndex}`])
          return (
            <button
              key={setIndex}
              type="button"
              className={on ? 'set on' : 'set'}
              aria-pressed={on}
              onClick={() => onToggle(setIndex)}
            >
              {setIndex + 1}
            </button>
          )
        })}
      </div>
      <p className="note">{exercise.note}</p>
    </article>
  )
}

function PlateRow({ plates, unit }) {
  const side = plates.plates.flatMap((plate) => Array.from({ length: plate.count }, () => plate.size))
  return (
    <div className="barbell" aria-label={`Per side: ${side.join(', ')} ${unit}`}>
      <div className="plate-row">
        {[...side].reverse().map((size, index) => (
          <span key={`l-${size}-${index}`} className={size >= (unit === 'kg' ? 15 : 25) ? 'plate heavy' : 'plate'}>
            {size}
          </span>
        ))}
      </div>
      <div className="bar" />
      <div className="plate-row">
        {side.map((size, index) => (
          <span key={`r-${size}-${index}`} className={size >= (unit === 'kg' ? 15 : 25) ? 'plate heavy' : 'plate'}>
            {size}
          </span>
        ))}
      </div>
      {plates.remainder > 0 && <span className="remainder">+{plates.remainder} extra / side</span>}
    </div>
  )
}
