import { Box, Flex, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

interface ActivityEntry {
  id: string
  type: 'CREATED' | 'STATUS_CHANGED' | 'UPDATED' | 'DELETED' | 'LEAD_RECEIVED'
  description: string
  actor: string
  timestamp: string
  meta?: Record<string, string>
}

function iconForType(type: ActivityEntry['type']) {
  switch (type) {
    case 'CREATED':        return '🏠'
    case 'STATUS_CHANGED': return '🔄'
    case 'UPDATED':        return '✏️'
    case 'DELETED':        return '🗑️'
    case 'LEAD_RECEIVED':  return '📋'
  }
}

function colorForType(type: ActivityEntry['type']) {
  switch (type) {
    case 'CREATED':        return '#2E9B6A'
    case 'STATUS_CHANGED': return '#F59E0B'
    case 'UPDATED':        return '#3B82F6'
    case 'DELETED':        return '#EF4444'
    case 'LEAD_RECEIVED':  return '#8B5CF6'
  }
}

const LS_KEY = 'ulmap_activity_log'

function loadLog(): ActivityEntry[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}

export function addActivityLog(entry: Omit<ActivityEntry, 'id' | 'timestamp'>) {
  const log = loadLog()
  const next = [{ ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() }, ...log].slice(0, 100)
  localStorage.setItem(LS_KEY, JSON.stringify(next))
}

interface Props { propertyId?: string; maxItems?: number }

export function ActivityLog({ propertyId, maxItems = 20 }: Props) {
  const [log, setLog] = useState<ActivityEntry[]>([])

  useEffect(() => {
    const all = loadLog()
    const filtered = propertyId ? all.filter((e) => e.meta?.propertyId === propertyId) : all
    setLog(filtered.slice(0, maxItems))
  }, [propertyId, maxItems])

  if (log.length === 0) {
    return (
      <Flex direction="column" align="center" py="32px" gap="8px">
        <Text fontSize="24px">📋</Text>
        <Text fontSize="13px" color="neutral.400">No activity recorded yet</Text>
        <Text fontSize="12px" color="neutral.300">Actions like creating, editing, and receiving leads will appear here</Text>
      </Flex>
    )
  }

  return (
    <Box>
      {log.map((entry, i) => (
        <Flex key={entry.id} gap="12px" pb={i < log.length - 1 ? '16px' : '0'} position="relative">
          {/* Timeline line */}
          {i < log.length - 1 && (
            <Box position="absolute" left="17px" top="36px" bottom="0" w="1px" bg="neutral.100" />
          )}

          {/* Icon */}
          <Box
            w="34px" h="34px" borderRadius="full" flexShrink={0}
            bg={colorForType(entry.type) + '15'} border="1px solid" borderColor={colorForType(entry.type) + '30'}
            display="flex" alignItems="center" justifyContent="center" fontSize="14px" zIndex={1}
          >
            {iconForType(entry.type)}
          </Box>

          {/* Content */}
          <Box flex={1} pt="6px">
            <Text fontSize="13px" color="neutral.800" fontWeight="500" lineHeight="1.4">{entry.description}</Text>
            <Flex align="center" gap="8px" mt="4px">
              <Text fontSize="11px" color="neutral.400">{entry.actor}</Text>
              <Box w="3px" h="3px" borderRadius="full" bg="neutral.300" />
              <Text fontSize="11px" color="neutral.300">
                {new Date(entry.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Flex>
          </Box>
        </Flex>
      ))}
    </Box>
  )
}
