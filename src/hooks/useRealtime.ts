import { useEffect, useRef } from 'react'
import { useNotifications } from '../contexts/NotificationContext'

const SSE_URL = 'https://imovelweb.onrender.com/api/events'
const RECONNECT_DELAY = 5000

export function useRealtime(token: string | null) {
  const { add } = useNotifications()
  const esRef = useRef<EventSource | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!token) return

    function connect() {
      const es = new EventSource(`${SSE_URL}?token=${encodeURIComponent(token!)}`)
      esRef.current = es

      es.addEventListener('lead:new', (e) => {
        const data = JSON.parse(e.data)
        add({
          type: 'NEW_LEAD',
          title: 'New lead',
          body: `${data.interestedName} is interested in "${data.propertyTitle || 'a property'}"`,
          link: '/leads',
        })
      })

      es.addEventListener('lead:updated', (e) => {
        const data = JSON.parse(e.data)
        add({
          type: 'STATUS_CHANGE',
          title: 'Lead updated',
          body: `"${data.propertyTitle || 'Lead'}" status → ${data.status}`,
          link: '/leads',
        })
      })

      es.addEventListener('property:created', (e) => {
        const data = JSON.parse(e.data)
        add({
          type: 'NEW_PROPERTY',
          title: 'Property added',
          body: `"${data.title}" added in ${data.city || 'your portfolio'}`,
          link: '/map',
        })
      })

      es.addEventListener('property:updated', (e) => {
        const data = JSON.parse(e.data)
        add({
          type: 'STATUS_CHANGE',
          title: 'Property updated',
          body: `"${data.title}" status → ${data.status}`,
          link: '/map',
        })
      })

      es.addEventListener('property:freed', (e) => {
        const data = JSON.parse(e.data)
        add({
          type: 'NEW_PROPERTY',
          title: 'Property available again',
          body: `"${data.title}"${data.city ? ` in ${data.city}` : ''} is back on the market`,
          link: '/map',
        })
      })

      es.onerror = () => {
        es.close()
        esRef.current = null
        timerRef.current = setTimeout(connect, RECONNECT_DELAY)
      }
    }

    connect()

    return () => {
      esRef.current?.close()
      esRef.current = null
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [token, add])
}
