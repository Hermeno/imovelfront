import {
  Box, Flex, Text, Badge, Spinner, Avatar, Button, Select,
  useDisclosure, useToast, Tabs, TabList, Tab, TabPanels, TabPanel,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Navbar, NAVBAR_HEIGHT } from '../components/Navbar'
import { LeadDetailModal } from '../components/LeadDetailModal'
import { LeadKanban } from '../components/LeadKanban'
import { leadsApi } from '../api/leads'
import type { Lead, LeadStatus } from '../types'

const STATUS_CFG: Record<LeadStatus, { label: string; color: string; badge: string }> = {
  NEW:         { label: 'New',         color: '#3B82F6', badge: 'blue'   },
  IN_SERVICE:  { label: 'In Service',  color: '#8B5CF6', badge: 'purple' },
  NEGOTIATING: { label: 'Negotiating', color: '#F59E0B', badge: 'yellow' },
  FINISHED:    { label: 'Closed',      color: '#10B981', badge: 'green'  },
  LOST:        { label: 'Lost',        color: '#EF4444', badge: 'red'    },
}

const SOURCE_LABEL: Record<string, string> = {
  INTEREST: 'Map interest',
  WHATSAPP: 'WhatsApp',
  PHONE:    'Phone',
  CONTACT:  'Contact form',
}

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Lead | null>(null)
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  async function load() {
    setLoading(true)
    try {
      const res = await leadsApi.list({ status: statusFilter === 'ALL' ? undefined : statusFilter, limit: 100 })
      if (res.success && res.data) {
        setLeads(res.data.leads)
        setTotal(res.data.total)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  function openLead(lead: Lead) {
    setSelected(lead)
    onOpen()
  }

  async function handleStatusUpdate(id: string, status: LeadStatus) {
    try {
      const res = await leadsApi.update(id, { status })
      if (res.success && res.data) {
        setLeads((prev) => prev.map((l) => l.id === id ? res.data! : l))
        if (selected?.id === id) setSelected(res.data)
        toast({ title: 'Status updated', status: 'success', duration: 2000 })
      }
    } catch {
      toast({ title: 'Error updating status', status: 'error', duration: 3000 })
    }
  }

  const counts = Object.fromEntries(
    (Object.keys(STATUS_CFG) as LeadStatus[]).map((s) => [s, leads.filter((l) => l.status === s).length])
  ) as Record<LeadStatus, number>

  return (
    <Box minH="100vh" bg="#F8F7F4">
      <Navbar />
      <Box pt={NAVBAR_HEIGHT} px={{ base: '16px', md: '32px' }} py="28px" maxW="1400px" mx="auto">
        {/* Header */}
        <Flex align="flex-start" justify="space-between" mb="24px" flexWrap="wrap" gap="12px">
          <Box>
            <Text fontSize="22px" fontWeight="800" color="neutral.800" letterSpacing="-0.4px">Leads</Text>
            <Text fontSize="14px" color="neutral.400" mt="2px">{total} total leads</Text>
          </Box>
          <Select
            size="sm" w="180px" fontSize="13px" borderRadius="8px"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All statuses</option>
            {(Object.keys(STATUS_CFG) as LeadStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_CFG[s].label}</option>
            ))}
          </Select>
        </Flex>

        {/* Status summary pills */}
        <Flex gap="10px" mb="24px" flexWrap="wrap">
          {(Object.keys(STATUS_CFG) as LeadStatus[]).map((s) => (
            <Flex
              key={s} as="button"
              align="center" gap="6px" px="12px" py="6px" borderRadius="8px"
              bg={statusFilter === s ? STATUS_CFG[s].color + '18' : 'white'}
              border="1px solid" borderColor={statusFilter === s ? STATUS_CFG[s].color + '50' : 'neutral.100'}
              onClick={() => setStatusFilter(statusFilter === s ? 'ALL' : s)}
              cursor="pointer" transition="all 0.12s"
            >
              <Box w="8px" h="8px" borderRadius="full" bg={STATUS_CFG[s].color} />
              <Text fontSize="12px" fontWeight="500" color="neutral.700">{STATUS_CFG[s].label}</Text>
              <Text fontSize="12px" fontWeight="700" color={STATUS_CFG[s].color}>{counts[s]}</Text>
            </Flex>
          ))}
        </Flex>

        <Tabs variant="soft-rounded" colorScheme="green" size="sm">
          <TabList mb="20px">
            <Tab fontSize="13px">List</Tab>
            <Tab fontSize="13px">Kanban</Tab>
          </TabList>
          <TabPanels>
            {/* LIST VIEW */}
            <TabPanel p={0}>
              <Box bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100" overflow="hidden">
                {loading ? (
                  <Flex justify="center" py="48px"><Spinner color="brand.600" /></Flex>
                ) : leads.length === 0 ? (
                  <Flex direction="column" align="center" py="56px" gap="10px">
                    <Text fontSize="32px">📋</Text>
                    <Text fontSize="14px" color="neutral.400">No leads yet</Text>
                    <Text fontSize="13px" color="neutral.300">Leads appear when visitors contact you from the map</Text>
                  </Flex>
                ) : (
                  <Box overflowX="auto">
                    {leads.map((lead) => (
                      <Flex
                        key={lead.id}
                        align="center" px="20px" py="14px"
                        borderBottom="1px solid" borderColor="neutral.50"
                        _hover={{ bg: 'neutral.50' }}
                        cursor="pointer"
                        onClick={() => openLead(lead)}
                        gap="16px"
                      >
                        <Avatar name={lead.interestedName} size="sm" bg="brand.100" color="brand.700" flexShrink={0} />
                        <Box flex={1} minW={0}>
                          <Flex align="center" gap="8px" mb="2px">
                            <Text fontWeight="600" fontSize="14px" color="neutral.800" noOfLines={1}>
                              {lead.interestedName}
                            </Text>
                            {!lead.viewed && (
                              <Box w="6px" h="6px" borderRadius="full" bg="brand.500" flexShrink={0} />
                            )}
                          </Flex>
                          <Text fontSize="12px" color="neutral.400" noOfLines={1}>
                            {lead.propertyTitle || lead.property?.title || '—'}
                          </Text>
                        </Box>
                        <Box display={{ base: 'none', md: 'block' }} minW="120px">
                          <Text fontSize="12px" color="neutral.500">{lead.email}</Text>
                        </Box>
                        <Box display={{ base: 'none', lg: 'block' }} minW="100px">
                          <Text fontSize="12px" color="neutral.400">{SOURCE_LABEL[lead.source] ?? lead.source}</Text>
                        </Box>
                        <Badge colorScheme={STATUS_CFG[lead.status]?.badge} fontSize="11px" flexShrink={0}>
                          {STATUS_CFG[lead.status]?.label}
                        </Badge>
                        <Text fontSize="12px" color="neutral.300" flexShrink={0} display={{ base: 'none', md: 'block' }}>
                          {new Date(lead.createdAt).toLocaleDateString('en-US')}
                        </Text>
                        <Select
                          size="xs" w="130px" fontSize="11px" borderRadius="6px"
                          value={lead.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(lead.id, e.target.value as LeadStatus)
                          }}
                        >
                          {(Object.keys(STATUS_CFG) as LeadStatus[]).map((s) => (
                            <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                          ))}
                        </Select>
                      </Flex>
                    ))}
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* KANBAN VIEW */}
            <TabPanel p={0}>
              <LeadKanban leads={leads} onStatusChange={handleStatusUpdate} onOpen={openLead} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <LeadDetailModal
        lead={selected}
        isOpen={isOpen}
        onClose={onClose}
        onStatusChange={handleStatusUpdate}
      />
    </Box>
  )
}
