import {
  DISCLAIMER,
  dutiesFor,
  formatCount,
  mealsFor,
  patchLog,
  targets,
  todayKey,
  waterLabel,
} from './engine'
import { useLock } from './context'
import { FinePrint } from './ui'

export function Fuel() {
  const { state, update } = useLock()
  const key = todayKey()
  const { profile } = state
  const log = state.logs[key] || {}
  const plan = targets(profile.weight, profile.unit, profile.mission)
  const meals = mealsFor(profile.mission)
  const eaten = meals.filter((meal) => log.meals?.[meal.id]).length
  const mission = profile.mission
  const proteinCals = plan.protein * 4
  const carbCals = plan.carbs * 4
  const fatCals = plan.fat * 9

  return (
    <section>
      <p className="kicker">{mission === 'cut' ? 'Crash cut kitchen' : 'Mass kitchen'}</p>
      <h1 className="kcal-hero">
        {formatCount(plan.kcal)}
        <span>kcal</span>
      </h1>
      <p className="deck">
        {mission === 'cut'
          ? `${formatCount(plan.deficit)} under a field maintenance of ${formatCount(plan.maintain)}.`
          : `${formatCount(plan.surplus)} over a field maintenance of ${formatCount(plan.maintain)}.`}
        {' '}Block length {plan.block}. Aim {plan.rate}.
      </p>
      <div
        className="split"
        aria-hidden="true"
      >
        <span className="p" style={{ flex: proteinCals }} />
        <span className="c" style={{ flex: Math.max(carbCals, 1) }} />
        <span className="f" style={{ flex: fatCals }} />
      </div>
      <div className="stat-row three">
        <Macro k="Protein" v={`${plan.protein}g`} />
        <Macro k="Carbs" v={`${plan.carbs}g`} />
        <Macro k="Fat" v={`${plan.fat}g`} />
      </div>
      <p className="muted">Water {waterLabel(plan.waterOz, profile.unit)}. Maintenance here is bodyweight × 15, a field estimate for someone who lifts. If the weekly average is not moving after 14 honest days, change food by 250 kcal and keep the bar honest.</p>
      {plan.floored && (
        <p className="banner">
          {plan.tight
            ? 'There is not much room under maintenance at this bodyweight, so the cut stays mild instead of reckless.'
            : 'The aggressive number hit the floor. The target stays at or above 1,500 kcal so this stays a cut, not a crash into the floor.'}
        </p>
      )}
      <article className="callout">
        {mission === 'cut' ? (
          <>
            Run it 6–8 weeks, then eat at maintenance at least as long as the cut. If strength drops hard and you feel wrecked, add 250 kcal back. Faster than {plan.rate} is usually muscle leaving with the fat.
          </>
        ) : (
          <>
            Run it 10–12 weeks. If your waist is jumping and the bar is flat, you are just getting fatter. Pull 300 kcal and keep the progressive sets. Faster than the weekly range for two weeks straight is a sign to stop adding food.
          </>
        )}
      </article>
      <h2>
        Meals {eaten}/{meals.length}
      </h2>
      <p className="muted">Tick a meal when you have eaten it inside the target. The tick is accountability, not permission to add a snack later.</p>
      <div className="stack-list">
        {meals.map((meal) => {
          const on = Boolean(log.meals?.[meal.id])
          return (
            <button
              key={meal.id}
              type="button"
              className={on ? 'meal on' : 'meal'}
              aria-pressed={on}
              onClick={() => update((current) => patchLog(current, key, { meals: { [meal.id]: !on } }))}
            >
              <span className="meal-top">
                <strong>{meal.name}</strong>
                <span>{on ? 'Eaten' : 'Open'}</span>
              </span>
              <span>{meal.detail}</span>
            </button>
          )
        })}
      </div>
      <button
        className="btn"
        onClick={() => update((current) => patchLog(current, key, { duties: { kcal: true, protein: true } }))}
      >
        Mark calories and protein hit
      </button>
      <p className="muted tight">That checks today’s {dutiesFor(mission).find((duty) => duty.id === 'kcal')?.label.toLowerCase()} and protein boxes.</p>
      <FinePrint>{DISCLAIMER}</FinePrint>
    </section>
  )
}

function Macro({ k, v }) {
  return (
    <div className="stat">
      <span>{k}</span>
      <strong className="num">{v}</strong>
    </div>
  )
}
