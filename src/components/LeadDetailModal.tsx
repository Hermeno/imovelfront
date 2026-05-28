import {
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  Box, Flex, Text, Badge, Avatar, Select, Divider, Textarea, Button, useToast,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { leadsApi } from '../api/leads'
import type { Lead, LeadStatus } from '../types'

const STATUS_CFG: Record<LeadStatus, { label: string; badge: string; color: string }> = {
  NEW:         { label: 'New',         badge: 'blue',   color: '#3B82F6' },
  IN_SERVICE:  { label: 'In Service',  badge: 'purple', color: '#8B5CF6' },
  NEGOTIATING: { label: 'Negotiating', badge: 'yellow', color: '#F59E0B' },
  FINISHED:    { label: 'Closed',      badge: 'green',  color: '#10B981' },
  LOST:        { label: 'Lost',        badge: 'red',    color: '#EF4444' },
}

const SOURCE_LABEL: Record<string, string> = {
  INTEREST: 'Map interest', WHATSAPP: 'WhatsApp', PHONE: 'Phone', CONTACT: 'Contact form',
}

interface Props {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (id: string, status: LeadStatus) => void
}

export function LeadDetailModal({ lead, isOpen, onClose, onStatusChange }: Props) {
  const toast = useToast()
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [journey, setJourney] = useState<{
    totalViews: number; returnVisits: number; devices: string[]; referrers: string[]
    properties: { propertyId: string; title: string; city: string | null; returnVisit: boolean; viewedAt: string }[]
  } | null>(null)

  useEffect(() => {
    if (!lead || !isOpen) return
    markViewed()
    leadsApi.journey(lead.id).then((r) => { if (r.success && r.data) setJourney(r.data) }).catch(() => {})
  }, [lead?.id, isOpen])

  if (!lead) return null
  const cfg = STATUS_CFG[lead.status]

  async function markViewed() {
    if (!lead!.viewed) {
      await leadsApi.update(lead!.id, { viewed: true }).catch(() => {})
    }
  }

  function openWhatsApp() {
    const num = lead!.whatsapp?.replace(/\D/g, '')
    if (num) window.open(`https://wa.me/${num}?text=${encodeURIComponent(`Hi ${lead!.interestedName}! Following up on your interest in: ${lead!.propertyTitle || ''}`)}`, '_blank')
  }

  function callPhone() {
    if (lead!.phone) window.location.href = `tel:${lead!.phone}`
  }

  async function saveNotes() {
    setSavingNotes(true)
    await new Promise((r) => setTimeout(r, 400))
    setSavingNotes(false)
    const key = `ulmap_lead_notes_${lead!.id}`
    localStorage.setItem(key, notes)
    toast({ title: 'Notes saved', status: 'success', duration: 2000 })
  }

  const storedNotes = localStorage.getItem(`ulmap_lead_notes_${lead.id}`) || ''

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="16px" mx={{ base: '12px', md: '24px' }} my="48px">
        <ModalCloseButton top="12px" right="12px" />
        <ModalBody p="28px">
          {/* Header */}
          <Flex align="center" gap="14px" mb="20px">
            <Avatar name={lead.interestedName} size="lg" bg="brand.600" color="white" fontWeight="700" />
            <Box flex={1}>
              <Text fontSize="18px" fontWeight="800" color="neutral.800">{lead.interestedName}</Text>
              <Text fontSize="13px" color="neutral.400">{lead.email}</Text>
              {lead.phone && <Text fontSize="13px" color="neutral.400">{lead.phone}</Text>}
            </Box>
            <Flex direction="column" align="flex-end" gap="6px">
              <Badge colorScheme={cfg.badge} fontSize="12px" px="10px" py="4px">{cfg.label}</Badge>
              {lead.score != null && (
                <Box
                  px="8px" py="3px" borderRadius="6px" fontSize="11px" fontWeight="700"
                  bg={lead.score >= 7 ? '#dcfce7' : lead.score >= 4 ? '#fef9c3' : '#fee2e2'}
                  color={lead.score >= 7 ? '#166534' : lead.score >= 4 ? '#713f12' : '#991b1b'}
                >
                  Score {lead.score}/10
                </Box>
              )}
            </Flex>
          </Flex>

          <Divider mb="16px" />

          {/* Property */}
          {(lead.propertyTitle || lead.property) && (
            <Box bg="#F8F7F4" borderRadius="10px" p="14px" mb="16px">
              <Text fontSize="11px" fontWeight="600" color="neutral.400" textTransform="uppercase" letterSpacing="0.5px" mb="6px">
                Interested Property
              </Text>
              <Text fontWeight="600" fontSize="14px" color="neutral.800">
                {lead.propertyTitle || lead.property?.title}
              </Text>
              {lead.property?.city && (
                <Text fontSize="12px" color="neutral.400">
                  {[lead.property.neighborhood, lead.property.city, lead.property.state].filter(Boolean).join(', ')}
                </Text>
              )}
              {lead.property?.price && (
                <Text fontSize="13px" fontWeight="700" color="brand.600" mt="4px">
                  R$ {lead.property.price.toLocaleString('en-US')}
                </Text>
              )}
            </Box>
          )}

          {/* Message */}
          {lead.message && (
            <Box mb="16px">
              <Text fontSize="11px" fontWeight="600" color="neutral.400" textTransform="uppercase" letterSpacing="0.5px" mb="6px">
                Message
              </Text>
              <Box bg="neutral.50" borderRadius="8px" p="12px">
                <Text fontSize="13px" color="neutral.700" lineHeight="1.6">"{lead.message}"</Text>
              </Box>
            </Box>
          )}

          {/* Notes (local) */}
          <Box mb="16px">
            <Text fontSize="11px" fontWeight="600" color="neutral.400" textTransform="uppercase" letterSpacing="0.5px" mb="6px">
              Agent Notes
            </Text>
            <Textarea
              placeholder="Add internal notes about this lead…"
              fontSize="13px"
              rows={3}
              resize="none"
              defaultValue={storedNotes}
              onChange={(e) => setNotes(e.target.value)}
              borderRadius="8px"
            />
            <Flex justify="flex-end" mt="8px">
              <Button size="xs" variant="outline" onClick={saveNotes} isLoading={savingNotes} fontSize="12px">
                Save Notes
              </Button>
            </Flex>
          </Box>

          {/* Status + meta */}
          <Flex gap="12px" align="center" mb="20px" flexWrap="wrap">
            <Box flex={1} minW="160px">
              <Text fontSize="11px" fontWeight="600" color="neutral.400" textTransform="uppercase" letterSpacing="0.5px" mb="6px">
                Status
              </Text>
              <Select
                size="sm" fontSize="13px" borderRadius="8px" value={lead.status}
                onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
              >
                {(Object.keys(STATUS_CFG) as LeadStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                ))}
              </Select>
            </Box>
            <Box>
              <Text fontSize="11px" fontWeight="600" color="neutral.400" textTransform="uppercase" letterSpacing="0.5px" mb="6px">
                Source
              </Text>
              <Text fontSize="13px" color="neutral.600">{SOURCE_LABEL[lead.source] ?? lead.source}</Text>
            </Box>
            <Box>
              <Text fontSize="11px" fontWeight="600" color="neutral.400" textTransform="uppercase" letterSpacing="0.5px" mb="6px">
                Received
              </Text>
              <Text fontSize="13px" color="neutral.600">
                {new Date(lead.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </Box>
          </Flex>

          {/* Journey */}
          {journey && journey.totalViews > 0 && (
            <Box mb="20px" bg="#F0FDF4" borderRadius="10px" p="14px" border="1px solid" borderColor="#BBF7D0">
              <Text fontSize="11px" fontWeight="700" color="#166534" textTransform="uppercase" letterSpacing="0.5px" mb="10px">
                Lead Journey
              </Text>
              <Flex gap="16px" mb="10px" flexWrap="wrap">
                <Box>
                  <Text fontSize="18px" fontWeight="800" color="#15803D">{journey.totalViews}</Text>
                  <Text fontSize="10px" color="#166534">Property views</Text>
                </Box>
                {journey.returnVisits > 0 && (
                  <Box>
                    <Text fontSize="18px" fontWeight="800" color="#15803D">{journey.returnVisits}</Text>
                    <Text fontSize="10px" color="#166534">Return visits</Text>
                  </Box>
                )}
                {journey.devices.length > 0 && (
                  <Box>
                    <Text fontSize="13px" fontWeight="700" color="#15803D">{journey.devices.join(', ')}</Text>
                    <Text fontSize="10px" color="#166534">Device{journey.devices.length > 1 ? 's' : ''}</Text>
                  </Box>
                )}
                {journey.referrers.length > 0 && (
                  <Box maxW="160px">
                    <Text fontSize="11px" fontWeight="600" color="#15803D" noOfLines={1}>{journey.referrers[0]}</Text>
                    <Text fontSize="10px" color="#166534">Source</Text>
                  </Box>
                )}
              </Flex>
              {journey.properties.length > 1 && (
                <>
                  <Text fontSize="10px" fontWeight="600" color="#166534" textTransform="uppercase" letterSpacing="0.5px" mb="6px">
                    Also viewed
                  </Text>
                  {journey.properties.slice(0, 3).map((p) => (
                    <Flex key={p.propertyId} align="center" justify="space-between" py="3px">
                      <Text fontSize="12px" color="#166534" noOfLines={1} flex={1}>{p.title}</Text>
                      {p.returnVisit && <Text fontSize="10px" color="#15803D" ml="6px">↩ returned</Text>}
                    </Flex>
                  ))}
                </>
              )}
            </Box>
          )}

          {/* Actions */}
          <Flex gap="10px" flexWrap="wrap">
            {lead.whatsapp && (
              <Button
                flex={1} minW="120px" h="42px" bg="#25D366" color="white" _hover={{ bg: '#1fb855' }}
                fontSize="13px" fontWeight="600" borderRadius="9px" onClick={openWhatsApp}
              >
                WhatsApp
              </Button>
            )}
            {lead.phone && (
              <Button
                flex={1} minW="120px" h="42px" variant="outline"
                fontSize="13px" fontWeight="600" borderRadius="9px" onClick={callPhone}
              >
                Call
              </Button>
            )}
            <Button
              flex={1} minW="120px" h="42px" bg="brand.600" color="white" _hover={{ bg: 'brand.700' }}
              fontSize="13px" fontWeight="600" borderRadius="9px"
              onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
            >
              Send Email
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
