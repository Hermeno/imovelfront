import {
  Box, Flex, Text, Button, Spinner, SimpleGrid, Table, Thead, Tbody, Tr, Th, Td,
  useToast, useDisclosure, Select,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { AddPropertyModal } from '../components/AddPropertyModal'
import { EditPropertyModal } from '../components/EditPropertyModal'
import { propertiesApi } from '../api/properties'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { exportPropertiesToCSV } from '../utils/export'
import type { Property, PropertyStatus } from '../types'


function StatCard({ value, label, accent }: { value: number | string; label: string; accent: string }) {
  return (
    <Box bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100" p="20px" position="relative" overflow="hidden">
      <Box position="absolute" top={0} left={0} right={0} h="3px" bg={accent} />
      <Text fontSize="28px" fontWeight="800" color="neutral.800" lineHeight={1}>{value}</Text>
      <Text fontSize="13px" color="neutral.400" mt="6px">{label}</Text>
    </Box>
  )
}

export function Dashboard() {
  const { company } = useAuth()
  const { add: addNotification } = useNotifications()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'ALL'>('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const { isOpen: isAddOpen, onOpen: openAdd, onClose: closeAdd } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: openEdit, onClose: closeEdit } = useDisclosure()
  const toast = useToast()

  async function load() {
    setLoading(true)
    try {
      const res = await propertiesApi.list()
      if (res.success && res.data) setProperties(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Remove "${title}" from the map?`)) return
    setDeletingId(id)
    try {
      await propertiesApi.delete(id)
      setProperties((prev) => prev.filter((p) => p.id !== id))
      toast({ title: 'Property removed', status: 'success', duration: 3000 })
    } catch {
      toast({ title: 'Error removing property', status: 'error', duration: 3000 })
    } finally { setDeletingId(null) }
  }

  async function handleStatusChange(id: string, status: PropertyStatus) {
    try {
      const res = await propertiesApi.update(id, { status })
      if (res.success && res.data) {
        setProperties((prev) => prev.map((p) => (p.id === id ? res.data! : p)))
        addNotification({ type: 'STATUS_CHANGE', title: 'Status updated', body: `Property status changed to ${status}` })
      }
    } catch {
      toast({ title: 'Error updating status', status: 'error', duration: 3000 })
    }
  }

  function handleCreated(p: Property) {
    setProperties((prev) => [p, ...prev])
    addNotification({ type: 'NEW_PROPERTY', title: 'New property added', body: p.title })
  }

  function handleUpdated(p: Property) {
    setProperties((prev) => prev.map((x) => x.id === p.id ? p : x))
    closeEdit()
  }

  function openEditFor(p: Property) {
    setEditingProperty(p)
    openEdit()
  }

  const filtered = statusFilter === 'ALL' ? properties : properties.filter((p) => p.status === statusFilter)

  const counts = {
    total: properties.length,
    available:   properties.filter((p) => p.status === 'AVAILABLE').length,
    negotiating: properties.filter((p) => p.status === 'NEGOTIATING').length,
    sold:        properties.filter((p) => p.status === 'SOLD').length,
  }

  return (
    <Box minH="100vh" bg="#F8F7F4">
      <Navbar />
      <Box pt="calc(56px + 28px)" pb="28px" px={{ base: '16px', md: '32px' }} maxW="1200px" mx="auto">
        {/* Header */}
        <Flex align="flex-start" justify="space-between" mb="28px" flexWrap="wrap" gap="12px">
          <Box>
            <Text fontSize="22px" fontWeight="800" color="neutral.800" letterSpacing="-0.4px">Dashboard</Text>
            <Text fontSize="14px" color="neutral.400" mt="2px">{company?.name} · Manage properties and team</Text>
          </Box>
          <Flex gap="10px" flexWrap="wrap">
            <Button as={Link} to="/analytics" variant="outline" fontSize="13px" size="sm">Analytics</Button>
            <Button as={Link} to="/map" variant="outline" fontSize="13px" size="sm">View Map</Button>
            <Button onClick={() => exportPropertiesToCSV(properties)} variant="outline" fontSize="13px" size="sm" isDisabled={properties.length === 0}>
              Export CSV
            </Button>
            <Button onClick={openAdd} fontSize="13px" size="sm">+ New Property</Button>
          </Flex>
        </Flex>

        {/* Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing="14px" mb="28px">
          <StatCard value={counts.total}       label="Total properties"  accent="brand.600" />
          <StatCard value={counts.available}   label="Available"         accent="#2E9B6A" />
          <StatCard value={counts.negotiating} label="Negotiating"       accent="#E8A838" />
          <StatCard value={counts.sold}        label="Sold"              accent="#D94F4F" />
        </SimpleGrid>

        {/* Table */}
        <Box bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100" overflow="hidden">
          <Flex align="center" justify="space-between" px="20px" py="14px" borderBottom="1px solid" borderColor="neutral.100" flexWrap="wrap" gap="10px">
            <Text fontWeight="600" fontSize="15px" color="neutral.800">Properties on Map</Text>
            <Select size="sm" w="180px" fontSize="13px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} borderRadius="8px">
              <option value="ALL">All statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="NEGOTIATING">Negotiating</option>
              <option value="SOLD">Sold</option>
            </Select>
          </Flex>

          {loading ? (
            <Flex justify="center" py="40px"><Spinner color="brand.600" /></Flex>
          ) : filtered.length === 0 ? (
            <Flex direction="column" align="center" py="48px" gap="10px">
              <Text fontSize="32px">🏠</Text>
              <Text fontSize="14px" color="neutral.400">No properties found</Text>
              <Button size="sm" onClick={openAdd}>Add first property</Button>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr bg="neutral.50">
                    <Th fontSize="11px" color="neutral.400" fontWeight="600" py="10px">TITLE</Th>
                    <Th fontSize="11px" color="neutral.400" fontWeight="600">STATUS</Th>
                    <Th fontSize="11px" color="neutral.400" fontWeight="600">LOCATION</Th>
                    <Th fontSize="11px" color="neutral.400" fontWeight="600">PRICE</Th>
                    <Th fontSize="11px" color="neutral.400" fontWeight="600">LISTED</Th>
                    <Th fontSize="11px" color="neutral.400" fontWeight="600">ACTIONS</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((prop) => (
                    <Tr key={prop.id} _hover={{ bg: 'neutral.50' }}>
                      <Td py="12px">
                        <Flex align="center" gap="10px">
                          {prop.imageUrls?.[0] && (
                            <Box as="img" src={prop.imageUrls[0]} w="36px" h="36px" objectFit="cover" borderRadius="6px" flexShrink={0} />
                          )}
                          <Box>
                            <Text fontWeight="500" fontSize="13px" color="neutral.800" noOfLines={1}>{prop.title}</Text>
                            {prop.propertyType && <Text fontSize="11px" color="neutral.400" textTransform="capitalize">{prop.propertyType}</Text>}
                          </Box>
                        </Flex>
                      </Td>
                      <Td>
                        <Select size="xs" w="130px" fontSize="12px" value={prop.status} onChange={(e) => handleStatusChange(prop.id, e.target.value as PropertyStatus)} borderRadius="6px">
                          <option value="AVAILABLE">Available</option>
                          <option value="NEGOTIATING">Negotiating</option>
                          <option value="SOLD">Sold</option>
                        </Select>
                      </Td>
                      <Td>
                        <Text fontSize="12px" color="neutral.600">
                          {prop.city ? `${prop.city}, ${prop.state}` : '—'}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="12px" color="neutral.700" fontWeight="600">
                          {prop.price ? `$${prop.price.toLocaleString('en-US')}` : '—'}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="12px" color="neutral.400">{new Date(prop.createdAt).toLocaleDateString('en-US')}</Text>
                      </Td>
                      <Td>
                        <Flex gap="4px">
                          <Button size="xs" variant="ghost" fontSize="12px" onClick={() => openEditFor(prop)}>Edit</Button>
                          <Button size="xs" variant="ghost" color="rose.500" _hover={{ bg: 'red.50' }} isLoading={deletingId === prop.id} onClick={() => handleDelete(prop.id, prop.title)}>
                            Remove
                          </Button>
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </Box>

      <AddPropertyModal isOpen={isAddOpen} onClose={closeAdd} onCreated={handleCreated} />
      <EditPropertyModal property={editingProperty} isOpen={isEditOpen} onClose={closeEdit} onUpdated={handleUpdated} />
    </Box>
  )
}
