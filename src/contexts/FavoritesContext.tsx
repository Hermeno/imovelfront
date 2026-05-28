import { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface FavoritesContextType {
  favorites: string[]
  toggle: (id: string) => void
  isFavorite: (id: string) => boolean
  count: number
}

const Ctx = createContext<FavoritesContextType>({
  favorites: [],
  toggle: () => {},
  isFavorite: () => false,
  count: 0,
})

const LS_KEY = 'ulmap_favorites'

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggle = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }, [])

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])

  return (
    <Ctx.Provider value={{ favorites, toggle, isFavorite, count: favorites.length }}>
      {children}
    </Ctx.Provider>
  )
}

export const useFavorites = () => useContext(Ctx)
