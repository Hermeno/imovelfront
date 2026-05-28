import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Notification } from '../types'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  add: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markAllRead: () => void
  markRead: (id: string) => void
  clear: () => void
}

const Ctx = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  add: () => {},
  markAllRead: () => {},
  markRead: () => {},
  clear: () => {},
})

const LS_KEY = 'ulmap_notifications'

function load(): Notification[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(load)

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(notifications.slice(0, 50)))
  }, [notifications])

  const add = useCallback((n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const item: Notification = {
      ...n,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
    }
    setNotifications((prev) => [item, ...prev].slice(0, 50))
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clear = useCallback(() => setNotifications([]), [])

  return (
    <Ctx.Provider value={{
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      add,
      markRead,
      markAllRead,
      clear,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useNotifications = () => useContext(Ctx)
