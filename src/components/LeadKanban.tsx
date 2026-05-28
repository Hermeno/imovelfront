import { Box, Flex, Text, Avatar } from '@chakra-ui/react'
import { useState, useRef } from 'react'
import type { Lead, LeadStatus } from '../types'

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'NEW',         label: 'New',         color: '#3B82F6' },
  { id: 'IN_SERVICE',  label: 'In Service',  color: '#8B5CF6' },
  { id: 'NEGOTIATING', label: 'Negotiating', color: '#F59E0B' },
  { id: 'FINISHED',    label: 'Closed',      color: '#10B981' },
  { id: 'LOST',        label: 'Lost',        color: '#EF4444' },
]

interface Props {
  leads: Lead[]
  onStatusChange: (id: string, status: LeadStatus) => void
  onOpen: (lead: Lead) => void
}

export function LeadKanban({ leads, onStatusChange, onOpen }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<LeadStatus | null>(null)
  const dragData = useRef<{ id: string; fromStatus: LeadStatus } | null>(null)

  function handleDragStart(lead: Lead) {
    setDraggingId(lead.id)
    dragData.current = { id: lead.id, fromStatus: lead.status }
  }

  function handleDragEnd() {
    setDraggingId(null)
    setOverCol(null)
    dragData.current = null
  }

  function handleDrop(toStatus: LeadStatus) {
    if (!dragData.current) return
    const { id, fromStatus } = dragData.current
    if (fromStatus !== toStatus) onStatusChange(id, toStatus)
    handleDragEnd()
  }

  return (
    <Flex gap="12px" overflowX="auto" pb="8px" align="flex-start">
      {COLUMNS.map((col) => {
        const colLeads = leads.filter((l) => l.status === col.id)
        const isOver = overCol === col.id

        return (
          <Box
            key={col.id}
            minW="210px" w="210px" flexShrink={0}
            onDragOver={(e) => { e.preventDefault(); setOverCol(col.id) }}
            onDragLeave={() => setOverCol(null)}
            onDrop={() => handleDrop(col.id)}
          >
            {/* Column header */}
            <Flex align="center" gap="8px" mb="10px" px="4px">
              <Box w="10px" h="10px" borderRadius="full" bg={col.color} />
              <Text fontSize="13px" fontWeight="600" color="neutral.700">{col.label}</Text>
              <Box
                ml="auto" bg={col.color + '18'} color={col.color}
                px="7px" py="1px" borderRadius="full" fontSize="11px" fontWeight="700"
              >
                {colLeads.length}
              </Box>
            </Flex>

            {/* Drop zone */}
            <Box
              minH="120px"
              bg={isOver ? col.color + '08' : 'transparent'}
              borderRadius="10px"
              border={isOver ? `2px dashed ${col.color}50` : '2px solid transparent'}
              p="4px"
              transition="all 0.15s"
            >
              {colLeads.map((lead) => {
                const isDragging = draggingId === lead.id
                return (
                  <Box
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead)}
                    onDragEnd={handleDragEnd}
                    bg="white"
                    borderRadius="10px"
                    border="1px solid"
                    borderColor={isDragging ? col.color + '60' : 'neutral.100'}
                    p="12px"
                    mb="8px"
                    shadow={isDragging ? 'lg' : 'sm'}
                    cursor="grab"
                    opacity={isDragging ? 0.5 : 1}
                    _active={{ cursor: 'grabbing' }}
                    onClick={() => onOpen(lead)}
                    transition="opacity 0.15s, box-shadow 0.15s"
                    _hover={{ shadow: 'md', borderColor: col.color + '40' }}
                  >
                    <Flex align="center" gap="8px" mb="6px">
                      <Avatar name={lead.interestedName} size="xs" bg="brand.100" color="brand.700" />
                      <Text fontSize="12px" fontWeight="600" color="neutral.800" noOfLines={1} flex={1}>
                        {lead.interestedName}
                      </Text>
                      {!lead.viewed && (
                        <Box w="5px" h="5px" borderRadius="full" bg="brand.500" flexShrink={0} />
                      )}
                    </Flex>
                    <Text fontSize="11px" color="neutral.400" noOfLines={1} mb="6px">
                      {lead.propertyTitle || '—'}
                    </Text>
                    <Flex align="center" justify="space-between">
                      <Text fontSize="11px" color="neutral.300">
                        {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                      {lead.score != null && (
                        <Box
                          px="6px" py="1px" borderRadius="4px" fontSize="10px" fontWeight="700"
                          bg={lead.score >= 7 ? '#dcfce7' : lead.score >= 4 ? '#fef9c3' : '#fee2e2'}
                          color={lead.score >= 7 ? '#166534' : lead.score >= 4 ? '#713f12' : '#991b1b'}
                        >
                          {lead.score}/10
                        </Box>
                      )}
                    </Flex>
                  </Box>
                )
              })}

              {colLeads.length === 0 && (
                <Box
                  border="1px dashed" borderColor={isOver ? col.color : col.color + '30'}
                  borderRadius="10px" p="20px" textAlign="center"
                  transition="border-color 0.15s"
                >
                  <Text fontSize="12px" color="neutral.300">Drop here</Text>
                </Box>
              )}
            </Box>
          </Box>
        )
      })}
    </Flex>
  )
}
