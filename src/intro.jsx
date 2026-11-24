import { useEffect, useState } from 'react'
import {
  DISCLAIMER,
  MISSIONS,
  PRS,
  convertUnits,
  todayKey,
  weightBounds,
} from './engine'
import { useLock } from './context'
import { BarbellMark, FinePrint } from './ui'

export function Boot({ onChoose }) {
  return (
    <div className="gate-screen" id="main">
      <p className="kicker">Free weight division</p>
      <BarbellMark />
      <h1 className="display">
        Locked
        <br />
        in
      </h1>
      <p className="deck">
        Daily orders for lifters running a hard bulk or a hard cut. Barbells, dumbbells,
        food, and sleep. No machine circuits. No soft reset every Monday.
      </p>
      <div className="choice-grid">
        {Object.values(MISSIONS).map((mission) => (
          <button key={mission.id} className="choice" onClick={() => onChoose(mission.id)}>
            <span className="kicker">{mission.kicker}</span>
            <strong>{mission.name}</strong>
            <span>{mission.line}</span>
            <ul>
              {mission.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      <FinePrint>{DISCLAIMER}</FinePrint>
    </div>
  )
}

export function Onboard({ initialMission, onExit, onDone }) {
  const [step, setStep] = useState(0)
  const [mission, setMission] = useState(initialMission || 'stack')
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('lb')
  const [weight, setWeight] = useState('')
  const [prs, setPrs] = useState({ squat: '', bench: '', deadlift: '', press: '' })
  const [oath, setOath] = useState(false)
  const [error, setError] = useState('')

  const bounds = weightBounds(unit)
  const selected = MISSIONS[mission]

  function nextFromBody(event) {
    event.preventDefault()
    const value = Number(weight)
    if (!name.trim()) {
      setError('Put a name on the log.')
      return
    }
    if (!weight || Number.isNaN(value) || value < bounds.min || value > bounds.max) {
      setError(`Bodyweight needs to land between ${bounds.min} and ${bounds.max} ${unit}.`)
      return
    }
    setError('')
    setStep(2)
  }

  function finish(event) {
    event.preventDefault()
    if (!oath) {
      setError('Read it. Then check it. That is the start.')
      return
    }
    onDone(
      {
        name: name.trim(),
        mission,
        unit,
        weight: Number(weight),
        bar: unit === 'kg' ? 20 : 45,
        startDate: todayKey(),
      },
      prs,
    )
  }

  return (
    <div className="gate-screen" id="main">
      <p className="kicker">Season contract · 0{step + 1} / 03</p>
      {step === 0 && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setStep(1)
          }}
        >
          <h1>Pick the season and stop browsing.</h1>
          <div className="choice-grid">
            {Object.values(MISSIONS).map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === mission ? 'choice on' : 'choice'}
                onClick={() => setMission(item.id)}
                aria-pressed={item.id === mission}
              >
                <span className="kicker">{item.kicker}</span>
                <strong>{item.name}</strong>
                <span>{item.line}</span>
              </button>
            ))}
          </div>
          <div className="action-row">
            <button type="button" className="btn-ghost" onClick={onExit}>
              Back
            </button>
            <button className="btn" type="submit">
              Continue
            </button>
          </div>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={nextFromBody}>
          <h1>Numbers you will not round in your favor.</h1>
          <p className="deck">
            {selected.name}. Top sets are the heaviest sets you actually own, not a number you touched once.
          </p>
          <label className="field">
            <span>Name</span>
            <input
              autoFocus
              maxLength={24}
              autoCapitalize="words"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="What the log should call you"
            />
          </label>
          <div className="seg" role="group" aria-label="Units">
            {['lb', 'kg'].map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={unit === option}
                className={unit === option ? 'on' : ''}
                onClick={() => setUnit(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <label className="field">
            <span>Bodyweight ({unit})</span>
            <input
              inputMode="decimal"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder={unit === 'kg' ? '82' : '180'}
            />
          </label>
          <div className="pr-grid">
            {PRS.map((lift) => (
              <label key={lift.id} className="field">
                <span>{lift.name} top set</span>
                <input
                  inputMode="decimal"
                  value={prs[lift.id]}
                  placeholder="Optional"
                  onChange={(event) => setPrs((current) => ({ ...current, [lift.id]: event.target.value }))}
                />
              </label>
            ))}
          </div>
          {error && <p className="error">{error}</p>}
          <div className="action-row">
            <button type="button" className="btn-ghost" onClick={() => setStep(0)}>
              Back
            </button>
            <button className="btn" type="submit">
              Continue
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={finish}>
          <h1>Sign it.</h1>
          <div className="summary hatch">
            <p className="kicker">{selected.kicker}</p>
            <p className="big-name">{name.trim()}</p>
            <p>
              {selected.name} · {weight} {unit}
            </p>
            <p className="muted">The block runs {selected.id === 'cut' ? '6–8 weeks' : '10–12 weeks'}, then you reassess. You can stop. You do not get to pretend you drifted here.</p>
          </div>
          <label className="oath">
            <input type="checkbox" checked={oath} onChange={(event) => setOath(event.target.checked)} />
            <span>
              I will run this season without shopping for a new personality every Monday. I will lift free weights, eat the number, and sleep. I can stop. I will not pretend I did not choose this.
            </span>
          </label>
          {error && <p className="error">{error}</p>}
          <div className="action-row">
            <button type="button" className="btn-ghost" onClick={() => { setError(''); setStep(1) }}>
              Back
            </button>
            <button className="btn" type="submit">
              Enter the block
            </button>
          </div>
          <FinePrint>{DISCLAIMER}</FinePrint>
        </form>
      )}
    </div>
  )
}

export function Settings({ onClose, onReset }) {
  const { state, update } = useLock()
  const profile = state.profile
  const [form, setForm] = useState({
    name: profile.name,
    mission: profile.mission,
    unit: profile.unit,
    weight: String(profile.weight),
    bar: String(profile.bar || (profile.unit === 'kg' ? 20 : 45)),
  })
  const [error, setError] = useState('')
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function switchUnit(next) {
    if (next === form.unit) return
    const current = Number(form.weight)
    const bar = Number(form.bar)
    const toNext = next === 'kg' ? (n) => n / 2.2046226218 : (n) => n * 2.2046226218
    const digits = next === 'kg' ? 100 : 10
    const round = (n) => Math.round(n * digits) / digits
    setForm((currentForm) => ({
      ...currentForm,
      unit: next,
      weight: Number.isNaN(current) ? '' : String(round(toNext(current))),
      bar: Number.isNaN(bar) ? '' : String(round(toNext(bar))),
    }))
  }

  function save(event) {
    event.preventDefault()
    const bounds = weightBounds(form.unit)
    const weight = Number(form.weight)
    const bar = Number(form.bar)
    if (!form.name.trim()) {
      setError('Name stays on the log.')
      return
    }
    if (Number.isNaN(weight) || weight < bounds.min || weight > bounds.max) {
      setError(`Bodyweight needs to land between ${bounds.min} and ${bounds.max} ${form.unit}.`)
      return
    }
    if (Number.isNaN(bar) || bar <= 0) {
      setError('Bar weight has to be a real number.')
      return
    }
    update((current) => {
      const unitChanged = form.unit !== current.profile.unit
      const next = unitChanged ? convertUnits(current, form.unit) : current
      const weightChanged = unitChanged || Number(form.weight) !== Number(current.profile.weight)
      const key = todayKey()
      const logs = weightChanged
        ? { ...next.logs, [key]: { ...(next.logs[key] || {}), weight } }
        : next.logs
      return {
        ...next,
        logs,
        profile: {
          ...next.profile,
          name: form.name.trim(),
          mission: form.mission,
          unit: form.unit,
          weight,
          bar,
        },
      }
    })
    onClose()
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-head">
          <h2 id="settings-title">Edit the block</h2>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <form onSubmit={save}>
          <label className="field">
            <span>Name</span>
            <input
              maxLength={24}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>
          <p className="label">Season</p>
          <div className="seg">
            {Object.values(MISSIONS).map((mission) => (
              <button
                key={mission.id}
                type="button"
                className={form.mission === mission.id ? 'on' : ''}
                aria-pressed={form.mission === mission.id}
                onClick={() => setForm({ ...form, mission: mission.id })}
              >
                {mission.name}
              </button>
            ))}
          </div>
          <p className="muted tight">Switching season keeps the log. It does not keep the excuses.</p>
          <p className="label">Units</p>
          <div className="seg">
            {['lb', 'kg'].map((option) => (
              <button
                key={option}
                type="button"
                className={form.unit === option ? 'on' : ''}
                aria-pressed={form.unit === option}
                onClick={() => switchUnit(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="pr-grid">
            <label className="field">
              <span>Bodyweight</span>
              <input
                inputMode="decimal"
                value={form.weight}
                onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Bar weight</span>
              <input
                inputMode="decimal"
                value={form.bar}
                onChange={(event) => setForm((current) => ({ ...current, bar: event.target.value }))}
              />
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-block" type="submit">
            Save
          </button>
        </form>
        <div className="danger-zone">
          <p>Saved on this device only. A wipe clears the log, the streak, and the top sets.</p>
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              if (!armed) {
                setArmed(true)
                return
              }
              onReset()
            }}
          >
            {armed ? 'Confirm wipe' : 'Wipe this device'}
          </button>
        </div>
      </div>
    </div>
  )
}
