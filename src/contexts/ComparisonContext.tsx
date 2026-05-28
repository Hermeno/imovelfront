import { createContext, useContext, useState, useCallback } from 'react'
import type { Property } from '../types'

const MAX = 3

interface ComparisonContextType {
  items: Property[]
  add: (p: Property) => void
  remove: (id: string) => void
  toggle: (p: Property) => void
  isSelected: (id: string) => boolean
  clear: () => void
  canAdd: boolean
}

const Ctx = createContext<ComparisonContextType>({
  items: [],
  add: () => {},
  remove: () => {},
  toggle: () => {},
  isSelected: () => false,
  clear: () => {},
  canAdd: true,
})

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Property[]>([])

  const add = useCallback((p: Property) => {
    setItems((prev) => prev.length >= MAX ? prev : [...prev, p])
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const toggle = useCallback((p: Property) => {
    setItems((prev) => {
      if (prev.find((x) => x.id === p.id)) return prev.filter((x) => x.id !== p.id)
      if (prev.length >= MAX) return prev
      return [...prev, p]
    })
  }, [])

  const isSelected = useCallback((id: string) => items.some((p) => p.id === id), [items])
  const clear = useCallback(() => setItems([]), [])

  return (
    <Ctx.Provider value={{ items, add, remove, toggle, isSelected, clear, canAdd: items.length < MAX }}>
      {children}
    </Ctx.Provider>
  )
}

export const useComparison = () => useContext(Ctx)
