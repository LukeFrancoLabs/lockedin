import { useEffect, useState } from 'react'

export function BarbellMark() {
  return (
    <svg className="mark" viewBox="0 0 120 28" aria-hidden="true">
      <rect x="18" y="12" width="84" height="4" fill="currentColor" />
      <rect x="8" y="4" width="8" height="20" fill="currentColor" />
      <rect x="104" y="4" width="8" height="20" fill="currentColor" />
      <rect x="18" y="7" width="5" height="14" fill="var(--accent)" />
      <rect x="97" y="7" width="5" height="14" fill="var(--accent)" />
    </svg>
  )
}

export function NumberField({ value, onCommit, className = '', ...props }) {
  const [text, setText] = useState(value ?? '')

  useEffect(() => {
    setText(value ?? '')
  }, [value])

  function commit() {
    const trimmed = text.trim()
    if (trimmed === '') {
      onCommit('')
      return
    }
    const number = Number(trimmed)
    if (Number.isNaN(number)) {
      setText(value ?? '')
      return
    }
    onCommit(String(number))
  }

  return (
    <input
      {...props}
      className={className}
      inputMode="decimal"
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
      }}
    />
  )
}

export function FinePrint({ children }) {
  return <p className="fine">{children}</p>
}
