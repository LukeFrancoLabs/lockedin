import { createContext, useContext } from 'react'

export const LockContext = createContext(null)

export function useLock() {
  const value = useContext(LockContext)
  if (!value) throw new Error('useLock must be used inside LockContext')
  return value
}
