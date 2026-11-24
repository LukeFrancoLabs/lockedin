export const LB_PER_KG = 2.2046226218

export const DISCLAIMER =
  'Not medical advice. These are short hard seasons for healthy adults, not a permanent way to eat. Stop and get a clinician involved if you feel faint, lose a normal cycle, get chest pain, or watch your strength fall off a cliff. Use a spotter and safeties on heavy free-weight sets.'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function ex(id, name, sets, reps, rest, note, pr = null) {
  return { id, name, sets, reps, rest, note, pr }
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatStamp(date) {
  return `${WEEKDAYS[date.getDay()]} ${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]}`
}

export function shortDate(key) {
  const date = parseKey(key)
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}

export function dayNumber(start, date) {
  const s = new Date(start)
  s.setHours(0, 0, 0, 0)
  const f = new Date(date)
  f.setHours(0, 0, 0, 0)
  return Math.floor((f - s) / 86400000) + 1
}

export function seasonDay(profile, date = new Date()) {
  const start = profile?.startDate ? parseKey(profile.startDate) : date
  return Math.max(1, dayNumber(start, date))
}

export function weekDays(date = new Date()) {
  const mondayOffset = (date.getDay() + 6) % 7
  const monday = new Date(date)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(date.getDate() - mondayOffset)
  return Array.from({ length: 7 }, (_, i) => {
    const next = new Date(monday)
    next.setDate(monday.getDate() + i)
    return next
  })
}

export function recentDates(count = 21, date = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const next = new Date(date)
    next.setHours(0, 0, 0, 0)
    next.setDate(date.getDate() - i)
    return next
  })
}

function pickDaily(list, salt, date) {
  const start = new Date(date.getFullYear(), 0, 0)
  const doy = Math.floor((date - start) / 86400000)
  const shift = salt.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return list[(doy + shift) % list.length]
}

const STACK_QUOTES = [
  'Eat like the bar is going up. Sleep like the growth depends on it. It does.',
  'Nobody accidental-builds a back. You either add load and food, or you stay the same size.',
  'The mirror is months late. The logbook is on time.',
  'A surplus without heavier sets is just a bigger shirt. Earn the meal.',
  'You do not need a new program. You need another honest week of this one.',
  'If you are hungry on a mass block, good. Then go eat. Hunger is a cue, not a personality.',
  'Leave a rep in the tank. Leave nothing in the pot.',
  'Soft days make soft lifters. Today is a work day.',
  'Mass is built after the gym closes, in the meal you did not feel like finishing.',
  'Progressive overload or progressive excuses. Pick before you touch the bar.',
  'The warm-up set feeling heavy is not a sign to leave. It is the start of the session.',
  'You chose the hard bulk. Stop shopping for a gentler version of it at dinner.',
]

const CUT_QUOTES = [
  'Hunger is data. It is not an emergency and it is not a vote.',
  'Keep the bar heavy. Let the calories drop. That is the whole cut.',
  'The last weeks are where people get cute. Do not get cute.',
  'You can be tired and still be precise. Sloppy reps are how cuts eat muscle.',
  'A walk is part of the session. Dessert is not the reward for showing up.',
  'The weekly average tells the truth. The morning after a salty dinner lies.',
  'Stay mean on the compounds. Stay quiet everywhere else.',
  'Short sleep will take more muscle than the deficit will.',
  'You do not need to suffer theatrically. You need to hit the number and lift.',
  'Abs are a side effect of not renegotiating the plan every afternoon.',
  'If the bar speed dies, fix sleep and food before you decide you got weak.',
  'This season ends. Your strength does not have to end with it.',
]

const STACK_ORDERS = [
  'Add a rep or add weight. Then eat like you mean the result.',
  'The surplus is for the session you did, not for a couch.',
  'Same program. Heavier bar. That is the trick. There is no other trick.',
  'Weigh the food the way you weigh the plates. Honestly.',
  'Do the main lift first, while you still have a spine and a brain.',
  'Growth day is a feeding day. It is not a dare to see how much junk fits.',
  'Phone down at the hour you picked. You do not grow while you scroll.',
  'If last week’s weight moves clean, it goes up today. No speeches.',
]

const CUT_ORDERS = [
  'Protein first. Measured starch. Then stop. The meal is over.',
  'Keep the first reps fast. Grinders are a warning, not a badge.',
  'Walk after dinner. The kitchen is closed when the walk starts.',
  'Do not “earn” back the session with food. The deficit is the point.',
  'Hit the calorie number. Do not try to win by eating almost nothing.',
  'Salt the food, drink the water, and judge the week, not the afternoon.',
  'Sleep is part of keeping the muscle. Protect it like a PR.',
  'You can want a bigger dinner. Plan it inside the calories or do not have it.',
]

export function dailyQuote(mission, date = new Date()) {
  return pickDaily(mission === 'cut' ? CUT_QUOTES : STACK_QUOTES, mission, date)
}

export function dailyOrder(mission, date = new Date()) {
  return pickDaily(mission === 'cut' ? CUT_ORDERS : STACK_ORDERS, `${mission}-order`, date)
}

export function dayShape(mission) {
  if (mission === 'cut') {
    return [
      ['Morning', 'Weigh in. Water. Protein at breakfast. Do not graze while the coffee brews.'],
      ['Midday', 'A real plate: lean meat, a measured starch, a pile of vegetables. Walk after.'],
      ['Session', 'Free weights. Own the reps. Leave the gym sharp, not destroyed.'],
      ['Evening', 'Dinner inside the number. Finish the steps. Then the kitchen closes.'],
      ['Night', 'Seven hours. A cut dies faster from short sleep than from one hard set.'],
    ]
  }
  return [
    ['Morning', 'Weigh in, then eat. A skipped breakfast is a vote for staying the same size.'],
    ['Midday', 'Second big meal. Rice, meat, some fat. Treat it like a work task.'],
    ['Session', 'Main lift first, while you are fresh. Write the weight down before you leave.'],
    ['Evening', 'The post-lift meal is mandatory. Dinner is where the set actually sticks.'],
    ['Night', 'In bed on time. Growth is a sleep habit wearing a lifting belt.'],
  ]
}

export function dutiesFor(mission) {
  if (mission === 'cut') {
    return [
      { id: 'lift', label: 'Main lift done with reps you owned' },
      { id: 'kcal', label: 'Calories at or under target' },
      { id: 'protein', label: 'Protein target hit' },
      { id: 'steps', label: '8,000 or more steps' },
      { id: 'sleep', label: 'Seven hours in bed' },
    ]
  }
  return [
    { id: 'lift', label: 'Main lift done, load or reps added' },
    { id: 'kcal', label: 'Calories at or over target' },
    { id: 'protein', label: 'Protein target hit' },
    { id: 'meals', label: 'No skipped meals' },
    { id: 'sleep', label: 'Seven hours in bed' },
  ]
}

export function mealsFor(mission) {
  if (mission === 'cut') {
    return [
      { id: 'breakfast', name: 'Breakfast', detail: 'Eggs or yogurt, fruit, and enough protein that lunch is not a rescue.' },
      { id: 'lunch', name: 'Lunch', detail: 'Lean meat, potatoes or rice you measured, and vegetables that actually fill the plate.' },
      { id: 'pre', name: 'Pre-lift', detail: 'Fruit or rice cakes plus a protein shake. Enough to lift. Not a second lunch.' },
      { id: 'dinner', name: 'Dinner', detail: 'Meat, vegetables, and the rest of your starch. This meal ends. No grazing tour of the kitchen.' },
      { id: 'topoff', name: 'Protein top-off', detail: 'Only if the gram target is short. Shake or cottage cheese. Not a reward meal.' },
    ]
  }
  return [
    { id: 'breakfast', name: 'Breakfast', detail: 'Eggs, oats, fruit, and whole milk or a shake. Eat it even when you are not hungry yet.' },
    { id: 'lunch', name: 'Lunch', detail: 'Rice, beef or another fatty-enough meat, olive oil, and something green so you stay human.' },
    { id: 'pre', name: 'Pre-lift', detail: 'Carb and protein, lower fat. You should arrive able to push, not stuffed and sorry.' },
    { id: 'post', name: 'Post-lift', detail: 'Same building blocks, bigger. This is the meal the session was for.' },
    { id: 'dinner', name: 'Dinner', detail: 'Potatoes, meat, a real vegetable. Add a splash of fat if the calories are still short.' },
    { id: 'night', name: 'Night feed', detail: 'Yogurt, cottage cheese, or a shake with honey. Growth day does not end at dinner.' },
  ]
}

export function weightBounds(unit) {
  return unit === 'kg' ? { min: 36, max: 320 } : { min: 80, max: 700 }
}

export function targets(weight, unit, mission) {
  const lb = unit === 'kg' ? Number(weight) * LB_PER_KG : Number(weight)
  const maintain = Math.round(lb * 15)
  const protein = Math.round(lb * (mission === 'cut' ? 1.1 : 1))
  let fat = Math.round(lb * (mission === 'cut' ? 0.32 : 0.4))
  let kcal
  let surplus = 0
  let deficit = 0
  let floored = false
  let tight = false

  if (mission === 'stack') {
    surplus = Math.round(Math.min(800, Math.max(350, maintain * 0.22)))
    kcal = maintain + surplus
  } else {
    const aggressive = Math.round(maintain * 0.75)
    const minDeficit = Math.min(250, Math.round(maintain * 0.1))
    const ceiling = maintain - minDeficit
    if (ceiling < 1500) {
      kcal = Math.max(1200, ceiling)
      tight = true
      floored = true
    } else {
      kcal = Math.min(Math.max(aggressive, 1500), ceiling)
      floored = kcal > aggressive + 20
    }
    deficit = maintain - kcal
  }

  const proteinCals = protein * 4
  if (proteinCals + fat * 9 > kcal - 60) {
    fat = Math.max(Math.round(lb * 0.25), Math.floor((kcal - proteinCals - 60) / 9))
  }
  const carbs = Math.max(0, Math.round((kcal - proteinCals - fat * 9) / 4))

  return {
    maintain,
    kcal,
    protein,
    fat,
    carbs,
    surplus,
    deficit,
    floored,
    tight,
    waterOz: Math.round(lb * 0.6),
    block: mission === 'cut' ? '6–8 weeks' : '10–12 weeks',
    rate: rateRange(lb, unit, mission),
  }
}

function rateRange(lb, unit, mission) {
  const low = lb * (mission === 'cut' ? 0.005 : 0.0025)
  const high = lb * (mission === 'cut' ? 0.01 : 0.005)
  const convert = (n) => (unit === 'kg' ? n / LB_PER_KG : n)
  const fmt = (n) => (Math.round(convert(n) * 10) / 10).toFixed(1)
  const label = unit === 'kg' ? 'kg' : 'lb'
  return `${fmt(low)}–${fmt(high)} ${label} a week`
}

export function waterLabel(ounces, unit) {
  if (unit === 'kg') return `${(ounces * 0.0295735).toFixed(1)} L`
  return `${ounces} oz`
}

export function prettyWeight(value, unit) {
  if (value == null || value === '' || Number.isNaN(Number(value))) return '—'
  const number = Math.round(Number(value) * 10) / 10
  const shown = Number.isInteger(number) ? String(number) : number.toFixed(1)
  return `${shown} ${unit === 'kg' ? 'kg' : 'lb'}`
}

export function formatCount(value) {
  return Math.round(value).toLocaleString('en-US')
}

export function isHit(log) {
  if (!log) return false
  if (log.pledge || log.trained || log.restHonored) return true
  return Boolean(log.duties && Object.values(log.duties).some(Boolean))
}

export function streak(logs, date = new Date()) {
  const cursor = new Date(date)
  cursor.setHours(0, 0, 0, 0)
  if (!isHit(logs[todayKey(cursor)])) cursor.setDate(cursor.getDate() - 1)
  let count = 0
  while (count < 5000 && isHit(logs[todayKey(cursor)])) {
    count += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return count
}

export function weightSeries(logs) {
  return Object.entries(logs)
    .filter(([, log]) => typeof log.weight === 'number' && !Number.isNaN(log.weight))
    .map(([date, log]) => ({ date, weight: log.weight }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function trendCall(points) {
  if (points.length < 8) {
    return {
      ready: false,
      text: 'The scale needs eight weigh-ins before it earns an opinion. The first week is mostly water.',
    }
  }
  const last = points.slice(-7)
  const prev = points.slice(-14, -7)
  if (prev.length < 4) {
    return {
      ready: false,
      text: 'Keep weighing in. A trend starts when this week can be compared with the one before it.',
    }
  }
  const avg = (rows) => rows.reduce((sum, row) => sum + row.weight, 0) / rows.length
  const delta = avg(last) - avg(prev)
  return { ready: true, delta }
}

export function endpoints(points) {
  if (!points.length) return null
  const first = points[0]
  const last = points[points.length - 1]
  return { first, last, delta: last.weight - first.weight }
}

export function sessionsThisWeek(logs, date = new Date()) {
  return weekDays(date).filter((day) => logs[todayKey(day)]?.trained).length
}

export function patchLog(state, date, partial) {
  const prev = state.logs[date] || {}
  const nextLog = { ...prev, ...partial }
  if (partial.duties) nextLog.duties = { ...(prev.duties || {}), ...partial.duties }
  if (partial.meals) nextLog.meals = { ...(prev.meals || {}), ...partial.meals }
  if (partial.loads) nextLog.loads = { ...(prev.loads || {}), ...partial.loads }
  if (partial.sets) nextLog.sets = { ...(prev.sets || {}), ...partial.sets }

  let profile = state.profile
  if (partial.weight != null && partial.weight !== '' && !Number.isNaN(Number(partial.weight))) {
    nextLog.weight = Number(partial.weight)
    if (profile) {
      const series = weightSeries({ ...state.logs, [date]: nextLog })
      const latest = series[series.length - 1]
      if (!latest || latest.date === date) profile = { ...profile, weight: nextLog.weight }
    }
  }

  return {
    ...state,
    profile,
    logs: { ...state.logs, [date]: nextLog },
  }
}

export function setProgress(session, log) {
  if (!session?.blocks?.length) return { done: 0, total: 0 }
  let total = 0
  let done = 0
  for (const block of session.blocks) {
    total += block.sets
    for (let i = 0; i < block.sets; i += 1) {
      if (log?.sets?.[`${block.id}:${i}`]) done += 1
    }
  }
  return { done, total }
}

export function lastLoad(logs, exerciseId, beforeKey) {
  const keys = Object.keys(logs)
    .filter((key) => key < beforeKey && logs[key].loads?.[exerciseId])
    .sort()
  if (!keys.length) return null
  const date = keys[keys.length - 1]
  return { date, load: logs[date].loads[exerciseId] }
}

export function platesFor(total, unit, barWeight) {
  const bar = Number(barWeight) || (unit === 'kg' ? 20 : 45)
  const sizes = unit === 'kg' ? [25, 20, 15, 10, 5, 2.5, 1.25] : [45, 35, 25, 10, 5, 2.5]
  const target = Number(total)
  if (!target || Number.isNaN(target)) return null
  let side = (target - bar) / 2
  if (side < -0.05) return { bar, plates: [], error: 'under-bar', remainder: 0 }
  const plates = []
  for (const size of sizes) {
    let count = 0
    while (side + 0.001 >= size && count < 12) {
      side -= size
      count += 1
    }
    if (count) plates.push({ size, count })
  }
  return { bar, plates, remainder: side > 0.2 ? Math.round(side * 100) / 100 : 0, error: null }
}

function convertNumber(value, fn, digits) {
  const number = Number(value)
  if (value == null || value === '' || Number.isNaN(number)) return value ?? ''
  const factor = 10 ** digits
  const next = Math.round(fn(number) * factor) / factor
  return Number.isInteger(next) ? String(next) : String(next)
}

export function convertUnits(state, nextUnit) {
  const from = state.profile?.unit || 'lb'
  if (from === nextUnit) return state
  const digits = nextUnit === 'kg' ? 2 : 1
  const fn = from === 'lb' ? (n) => n / LB_PER_KG : (n) => n * LB_PER_KG
  const logs = {}
  for (const [key, log] of Object.entries(state.logs)) {
    const loads = {}
    for (const [id, load] of Object.entries(log.loads || {})) {
      loads[id] = convertNumber(load, fn, digits)
    }
    logs[key] = {
      ...log,
      loads,
      weight:
        typeof log.weight === 'number'
          ? Number(convertNumber(log.weight, fn, digits))
          : log.weight,
    }
  }
  const prs = {}
  for (const [key, value] of Object.entries(state.prs || {})) {
    prs[key] = value === '' ? '' : convertNumber(value, fn, digits)
  }
  return {
    ...state,
    logs,
    prs,
    profile: {
      ...state.profile,
      unit: nextUnit,
      weight: Number(convertNumber(state.profile.weight, fn, digits)),
      bar: Number(convertNumber(state.profile.bar || (from === 'kg' ? 20 : 45), fn, digits)),
    },
  }
}

const STACK = [
  {
    id: 'stack-sun',
    dow: 'SUN',
    rest: true,
    name: 'Growth day',
    minutes: null,
    brief: 'You do not get bigger under the bar. You get bigger when you eat and sleep after the bar is done.',
    orders: [
      'Hit every meal, including the one you are bored of.',
      'Get 8,000 easy steps. A walk, not a secret conditioning test.',
      'In bed for a full night. Growth day is not a late-night day.',
      'No max-out because you felt guilty for resting.',
    ],
  },
  {
    id: 'stack-mon',
    dow: 'MON',
    rest: false,
    name: 'Bench heavy',
    minutes: 75,
    focus: 'Horizontal press',
    brief: 'Work up to a hard 5×5 and keep one rep in the tank on the last set. Empty-bar sets and ramp-ups do not count.',
    blocks: [
      ex('bench', 'Barbell bench press', 5, '5', '3:00', 'Pause the last rep. Hips stay on the bench.', 'bench'),
      ex('incline-db', 'Incline dumbbell press', 4, '8', '2:00', 'Set the bench around 30 degrees. Control the drop.'),
      ex('dip', 'Weighted dip', 3, '8', '2:00', 'A dumbbell between the feet or a plate on a belt. Lean slightly.'),
      ex('row-mon', 'Barbell row', 4, '8', '2:00', 'Torso fixed. Pull to the bottom of the ribs, not the neck.'),
      ex('skull', 'Dumbbell skull crusher', 3, '12', '1:30', 'Elbows quiet. Stop before the dumbbells own your face.'),
      ex('lateral-mon', 'Dumbbell lateral raise', 3, '15', '1:00', 'Lead with the elbows. Leave the ego at the lightest pair that burns.'),
    ],
  },
  {
    id: 'stack-tue',
    dow: 'TUE',
    rest: false,
    name: 'Deadlift and back',
    minutes: 75,
    focus: 'Hinge and pull',
    brief: 'The deadlift sets the day. Everything after is thickness. Strap up if your grip quits before your back does.',
    blocks: [
      ex('deadlift', 'Conventional deadlift', 4, '5', '3:30', 'Brace before the bar moves. No bounce off the floor.', 'deadlift'),
      ex('pullup-tue', 'Weighted pull-up', 4, '6', '2:30', 'Dead hang to chin over the bar. Add load only if every rep is clean.'),
      ex('db-row', 'One-arm dumbbell row', 3, '10 / side', '1:30', 'Do not rotate the torso to finish the rep.'),
      ex('curl', 'Barbell curl', 3, '8', '1:30', 'Stand on the wall of your own momentum. No swing.'),
      ex('hammer', 'Hammer curl', 3, '12', '1:15', 'Slow on the way down. Wrists neutral.'),
      ex('rear-delt', 'Dumbbell rear delt fly', 3, '15', '1:00', 'Hinge, soft elbows, move the weight out, not up.'),
    ],
  },
  {
    id: 'stack-wed',
    dow: 'WED',
    rest: false,
    name: 'Squat',
    minutes: 80,
    focus: 'Knees and hips',
    brief: 'Five real fives. If the fourth set looks ugly, stay at that weight and make the fifth set pretty.',
    blocks: [
      ex('squat', 'Back squat', 5, '5', '3:30', 'Full brace, own the hole, stand tall. No dive bomb.', 'squat'),
      ex('rdl', 'Romanian deadlift', 3, '8', '2:30', 'Bar close to the legs. Hamstrings, not a rounded lower back.'),
      ex('split', 'Bulgarian split squat', 3, '8 / leg', '2:00', 'Dumbbells at your sides. Front heel stays down.'),
      ex('lunge', 'Walking dumbbell lunge', 3, '10 / leg', '1:30', 'Short steps you can own. Knee tracks over the toes.'),
      ex('calf', 'Single-leg dumbbell calf raise', 4, '12 / side', '1:00', 'Pause at the top. Use a step if you have one.'),
      ex('hleg', 'Hanging leg raise', 3, '10', '1:00', 'Do not swing. Bend the knees if straight legs turn into a kip.'),
    ],
  },
  {
    id: 'stack-thu',
    dow: 'THU',
    rest: false,
    name: 'Press',
    minutes: 70,
    focus: 'Overhead',
    brief: 'Standing press is the main event. The push press is a tool for load, not an excuse to knee the bar up and call it strict.',
    blocks: [
      ex('press', 'Standing overhead press', 5, '5', '3:00', 'Ribs down, bar travels close, lock out over the traps.', 'press'),
      ex('push-press', 'Push press', 4, '3', '2:30', 'A sharp dip and drive. The arms still have to finish the lockout.'),
      ex('seated-db', 'Seated dumbbell press', 3, '10', '2:00', 'Back supported. Touch the shoulders and press, do not bounce.'),
      ex('lateral-thu', 'Dumbbell lateral raise', 4, '15', '1:00', 'Same rule as Monday. Burn, not heave.'),
      ex('shrug', 'Barbell shrug', 3, '10', '1:30', 'Hold the top. Do not roll the shoulders.'),
      ex('cgbp', 'Close-grip bench press', 3, '8', '2:00', 'Hands just outside the shoulders. Elbows tucked.'),
    ],
  },
  {
    id: 'stack-fri',
    dow: 'FRI',
    rest: false,
    name: 'Upper volume',
    minutes: 70,
    focus: 'More good reps',
    brief: 'Nothing here is a max. Use a weight you could do for two more reps than written, and do all of them clean.',
    blocks: [
      ex('bench', 'Barbell bench press', 4, '8', '2:30', 'Same setup as Monday. This is volume, so touch and go is fine if you own it.', 'bench'),
      ex('row-fri', 'Barbell row', 4, '10', '2:00', 'Leave the hips where they started.'),
      ex('incline-fri', 'Incline dumbbell press', 3, '12', '1:45', 'Full range. Do not turn it into a partial shrug.'),
      ex('pullup-fri', 'Pull-up', 3, 'Max', '2:00', 'Stop one short of a failed rep. Write the number down.'),
      ex('press', 'Standing overhead press', 3, '8', '2:00', 'If Thursday was ugly, take weight off and make these fast.', 'press'),
      ex('curl-fri', 'Barbell curl', 3, '10', '1:15', 'Squeeze the top. No English from the knees.'),
      ex('tri-ext', 'Overhead dumbbell extension', 3, '12', '1:15', 'One dumbbell, both hands. Elbows point forward and stay there.'),
    ],
  },
  {
    id: 'stack-sat',
    dow: 'SAT',
    rest: false,
    name: 'Arms and carry',
    minutes: 45,
    focus: 'Pump, then leave',
    brief: 'Saturday builds the parts you like looking at. It does not get to steal Monday. If your elbows are loud, skip this and eat.',
    blocks: [
      ex('bench-sat', 'Bench press, speed', 3, '12', '1:30', 'Light, crisp, paused one inch off the chest. Not a third heavy day.'),
      ex('curl-sat', 'Dumbbell curl', 4, '12', '1:00', 'Supinate as you curl. Lower for a full two seconds.'),
      ex('skull-sat', 'Dumbbell skull crusher', 4, '12', '1:00', 'Same elbows as Monday. Chase the burn, not a shoulder injury.'),
      ex('lateral-sat', 'Dumbbell lateral raise', 4, '20', '0:45', 'If you need body English, the dumbbells are too heavy.'),
      ex('pullup-sat', 'Pull-up', 3, 'Max', '1:30', 'Smooth reps. This is blood flow, not a test.'),
      ex('carry', 'Farmer carry', 6, '40 steps', '1:00', 'Heavy dumbbells. Tall posture. If you only have a trap bar, use it.'),
    ],
  },
]

const CUT = [
  {
    id: 'cut-sun',
    dow: 'SUN',
    rest: true,
    name: 'Hold the line',
    minutes: null,
    brief: 'Rest is part of keeping muscle while the food is low. A binge is not a reward. It is a second job for next week.',
    orders: [
      'Plan any bigger meal inside the calorie number, or skip the theater.',
      '10,000 easy steps across the day.',
      'Protein at every meal you do eat.',
      'Prep food so Monday does not start with a negotiation.',
      'In bed on time. No “I rested, so I can stay up.”',
    ],
  },
  {
    id: 'cut-mon',
    dow: 'MON',
    rest: false,
    name: 'Squat strength',
    minutes: 60,
    focus: 'Keep the squat',
    brief: 'Same standard as the off-season: bar speed and reps you own. Ugly grinding is how a cut turns into a shrinking total.',
    blocks: [
      ex('squat', 'Back squat', 5, '5', '3:00', 'Leave one clean rep. If speed dies, the next set stays at this weight or drops.', 'squat'),
      ex('rdl', 'Romanian deadlift', 3, '6', '2:30', 'Heavier than a pump, lighter than a PR attempt.'),
      ex('lunge', 'Walking dumbbell lunge', 3, '10 / leg', '1:30', 'Own the stride. This is not a lung-burner.'),
      ex('hleg', 'Hanging leg raise', 3, '8', '1:00', 'Strict. The abs do not need a metcon.'),
    ],
  },
  {
    id: 'cut-tue',
    dow: 'TUE',
    rest: false,
    name: 'Push',
    minutes: 60,
    focus: 'Bench and press',
    brief: 'Two compounds, then get out. Accessories stay short so you can recover on a deficit.',
    blocks: [
      ex('bench', 'Barbell bench press', 5, '5', '3:00', 'Same groove as the bulk. Do not suddenly add a pause-PR day.', 'bench'),
      ex('press', 'Standing overhead press', 4, '5', '2:30', 'Strict. Save the leg drive for Friday.', 'press'),
      ex('incline-db', 'Incline dumbbell press', 3, '8', '2:00', 'Stop with two reps left. Shoulders still have a week to finish.'),
      ex('dip', 'Dip', 3, 'As many as you own', '1:30', 'Stop one short of failure. Add load only if the reps stay honest.'),
      ex('lateral-tue', 'Dumbbell lateral raise', 3, '15', '1:00', 'Light. Blood, not ballistic misses.'),
    ],
  },
  {
    id: 'cut-wed',
    dow: 'WED',
    rest: false,
    name: 'Steps and carries',
    minutes: 30,
    focus: 'Burn without beating up the lifts',
    brief: 'This is not a secret max day. Keep the iron easy and get 12,000 steps before the night is over.',
    blocks: [
      ex('goblet', 'Goblet squat', 5, '10', '1:00', 'A dumbbell you could curl for reps. This is movement, not a third squat day.'),
      ex('carry', 'Farmer carry', 8, '40 steps', '1:00', 'Heavy enough to care, light enough to keep your grip and posture.'),
      ex('pushup', 'Push-up', 4, 'Max controlled', '1:00', 'Chest to the floor. Stop two reps before your hips sag.'),
      ex('db-row-wed', 'One-arm dumbbell row', 4, '12', '1:00', 'Smooth. You deadlift tomorrow.'),
    ],
  },
  {
    id: 'cut-thu',
    dow: 'THU',
    rest: false,
    name: 'Deadlift and pull',
    minutes: 60,
    focus: 'Hinge without heroics',
    brief: 'Three sets of five with a rep left. The cut does not need a fifth-rep story you tell later.',
    blocks: [
      ex('deadlift', 'Conventional deadlift', 3, '5', '3:00', 'Brace, pull, park the bar. No touch-and-go maxing.', 'deadlift'),
      ex('row-thu', 'Barbell row', 4, '8', '2:00', 'If the lower back is already done from the pull, use dumbbell rows.'),
      ex('pullup-thu', 'Pull-up', 4, 'Max', '2:00', 'Full hang. Write down the reps so next week has a target.'),
      ex('rear-delt', 'Dumbbell rear delt fly', 3, '15', '1:00', 'Small weights. The back of the shoulder gets the work.'),
      ex('curl', 'Barbell curl', 2, '12', '1:00', 'Two sets. Arms are not the priority this season.'),
    ],
  },
  {
    id: 'cut-fri',
    dow: 'FRI',
    rest: false,
    name: 'Full body',
    minutes: 55,
    focus: 'Practice the big patterns',
    brief: 'Touch every pattern, chase no record. Fast reps, then the farmer carry, then you leave.',
    blocks: [
      ex('front-squat', 'Front squat', 4, '5', '2:30', 'Elbows up. If the rack position folds you, hold a dumbbell goblet-style and keep the sets.'),
      ex('bench', 'Paused bench press', 4, '5', '2:30', 'One-second pause on the chest. Lighter than Tuesday.', 'bench'),
      ex('db-row-fri', 'One-arm dumbbell row', 4, '8', '1:30', 'Full stretch at the bottom.'),
      ex('push-press', 'Push press', 3, '5', '2:00', 'Use the legs. This is the only place they get to help the press.'),
      ex('carry', 'Farmer carry', 5, '40 steps', '1:00', 'Finish tall. Then go eat the dinner you already planned.'),
    ],
  },
  {
    id: 'cut-sat',
    dow: 'SAT',
    rest: true,
    name: 'Walk',
    minutes: null,
    brief: 'Optional light pump lives in the garage button. The actual order is steps, food, and not inventing a sixth heavy day.',
    orders: [
      '8,000 to 12,000 steps.',
      'Hit protein. Stay at or under the calories.',
      'If you train, keep it to the short pump. No barbell PRs.',
      'Shop and cook so the weekdays are boring on purpose.',
    ],
  },
]

export const GARAGE = {
  id: 'garage',
  dow: 'EXTRA',
  rest: false,
  name: 'Garage pump',
  minutes: 25,
  focus: 'Short and optional',
  brief: 'Twenty-five minutes. A pump, not a personality shift. If this runs long, you are hiding from the diet or the rest day.',
  blocks: [
    ex('curl-g', 'Dumbbell curl', 3, '15', '0:45', 'Burn, then stop.'),
    ex('tri-g', 'Overhead dumbbell extension', 3, '15', '0:45', 'Elbows stay pointed forward.'),
    ex('lateral-g', 'Dumbbell lateral raise', 3, '20', '0:40', 'Light weight, full control.'),
    ex('row-g', 'One-arm dumbbell row', 3, '12', '1:00', 'Squeeze the top.'),
    ex('carry', 'Farmer carry', 4, '40 steps', '1:00', 'Then you are done. Go eat what the day allows.'),
  ],
}

export function sessionFor(mission, date = new Date()) {
  const table = mission === 'cut' ? CUT : STACK
  return table[date.getDay()]
}

export function findSession(id) {
  if (!id) return null
  if (id === 'garage') return GARAGE
  for (const table of [STACK, CUT]) {
    const found = table.find((session) => session.id === id)
    if (found) return found
  }
  return null
}

export const PRS = [
  { id: 'squat', name: 'Squat' },
  { id: 'bench', name: 'Bench' },
  { id: 'deadlift', name: 'Deadlift' },
  { id: 'press', name: 'Press' },
]

export const MISSIONS = {
  stack: {
    id: 'stack',
    name: 'Stack mass',
    short: 'Stack',
    kicker: 'Aggressive bulk',
    line: 'A real surplus, heavy compounds six days, and meals you finish on purpose.',
    points: ['Surplus capped at 800 kcal', 'Free-weight compounds', '10–12 week season'],
  },
  cut: {
    id: 'cut',
    name: 'Crash cut',
    short: 'Cut',
    kicker: 'Short and mean',
    line: 'A hard deficit with a floor, four iron days, and the strength you refuse to donate.',
    points: ['About 25% under maintenance', 'Strength work stays', '6–8 week season'],
  },
}
