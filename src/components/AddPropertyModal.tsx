import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Button, FormControl, FormLabel, FormErrorMessage, Input, Textarea, Select,
  VStack, Text, SimpleGrid, Divider, useToast,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { propertiesApi } from '../api/properties'
import { usersApi } from '../api/users'
import { AddressAutocomplete } from './AddressAutocomplete'
import type { Property, PropertyStatus, User } from '../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  coords?: { lat: number; lng: number }
  onCreated: (p: Property) => void
}

const INIT = {
  title: '', description: '', latitude: '', longitude: '',
  status: 'AVAILABLE' as PropertyStatus, propertyType: '', listingType: '',
  price: '', bedrooms: '', bathrooms: '', parkingSpots: '',
  street: '', addressNumber: '', complement: '', neighborhood: '', city: '', state: '', postalCode: '',
  agentId: '', agentName: '', contactPhone: '', contactWhatsApp: '',
}

export function AddPropertyModal({ isOpen, onClose, coords, onCreated }: Props) {
  const [form, setForm] = useState({ ...INIT, ...(coords ? { latitude: String(coords.lat), longitude: String(coords.lng) } : {}) })
  const [errors, setErrors] = useState<Partial<typeof INIT>>({})
  const [loading, setLoading] = useState(false)
  const [agents, setAgents] = useState<User[]>([])
  const toast = useToast()

  useEffect(() => {
    if (coords) setForm((f) => ({ ...f, latitude: String(coords.lat), longitude: String(coords.lng) }))
  }, [coords])

  useEffect(() => {
    if (isOpen) {
      usersApi.list(50, 0).then((res) => { if (res.success && res.data) setAgents(res.data.users) }).catch(() => {})
    }
  }, [isOpen])

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })) }

  function handleAgentChange(userId: string) {
    const agent = agents.find((a) => a.id === userId)
    set('agentId', userId)
    set('agentName', agent?.name ?? '')
  }

  function handleAddress(addr: any) {
    setForm((f) => ({
      ...f,
      street: addr.street, addressNumber: addr.addressNumber,
      neighborhood: addr.neighborhood, city: addr.city,
      state: addr.state, postalCode: addr.postalCode,
      latitude: String(addr.latitude), longitude: String(addr.longitude),
    }))
  }

  function validate() {
    const e: any = {}
    if (!form.title.trim() || form.title.length < 3) e.title = 'Minimum 3 characters'
    const lat = parseFloat(form.latitude)
    const lng = parseFloat(form.longitude)
    if (isNaN(lat) || lat < -90 || lat > 90) e.latitude = 'Invalid latitude'
    if (isNaN(lng) || lng < -180 || lng > 180) e.longitude = 'Invalid longitude'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await propertiesApi.create({
        title: form.title,
        description: form.description || undefined,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        status: form.status,
        propertyType: form.propertyType || undefined,
        listingType: form.listingType || undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
        parkingSpots: form.parkingSpots ? parseInt(form.parkingSpots) : undefined,
        street: form.street || undefined,
        addressNumber: form.addressNumber || undefined,
        complement: form.complement || undefined,
        neighborhood: form.neighborhood || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        postalCode: form.postalCode || undefined,
        agentId: form.agentId || undefined,
        agentName: form.agentName || undefined,
        contactPhone: form.contactPhone || undefined,
        contactWhatsApp: form.contactWhatsApp || undefined,
      })
      if (res.success && res.data) {
        onCreated(res.data)
        onClose()
        setForm(INIT)
        toast({ title: 'Property added!', status: 'success', duration: 3000 })
      }
    } catch (err: any) {
      toast({ title: err?.response?.data?.error?.message || 'Error creating property', status: 'error', duration: 4000 })
    } finally { setLoading(false) }
  }

  function handleClose() { onClose(); setForm(INIT); setErrors({}) }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="14px" shadow="2xl" mx="16px" my="24px">
        <ModalHeader fontSize="17px" fontWeight="700" color="neutral.800" pb="0">Add Property</ModalHeader>
        <Text px="24px" pb="16px" fontSize="13px" color="neutral.400">Fill in the details to place the property on the map</Text>
        <ModalCloseButton top="16px" />
        <ModalBody pt="0">
          <VStack spacing="14px" align="stretch">
            {/* Address autocomplete */}
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Search Address</FormLabel>
              <AddressAutocomplete onSelect={handleAddress} placeholder="Start typing an address to auto-fill…" />
              <Text fontSize="11px" color="neutral.400" mt="4px">Selecting fills coordinates and address fields automatically</Text>
            </FormControl>

            <Divider />

            <FormControl isInvalid={!!errors.title}>
              <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Title *</FormLabel>
              <Input placeholder="e.g. 3-Bedroom Apartment in Copacabana" value={form.title} onChange={(e) => set('title', e.target.value)} fontSize="14px" />
              <FormErrorMessage fontSize="12px">{errors.title}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Description</FormLabel>
              <Textarea placeholder="Property details…" value={form.description} onChange={(e) => set('description', e.target.value)} fontSize="14px" rows={3} resize="none" />
            </FormControl>

            <SimpleGrid columns={2} gap="10px">
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Status *</FormLabel>
                <Select value={form.status} onChange={(e) => set('status', e.target.value)} fontSize="14px">
                  <option value="AVAILABLE">Available</option>
                  <option value="NEGOTIATING">Negotiating</option>
                  <option value="SOLD">Sold</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Listing Type</FormLabel>
                <Select value={form.listingType} onChange={(e) => set('listingType', e.target.value)} fontSize="14px">
                  <option value="">—</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={3} gap="10px">
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Type</FormLabel>
                <Select value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)} fontSize="14px">
                  <option value="">—</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="condo">Condo</option>
                  <option value="land">Land</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Price</FormLabel>
                <Input value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="0" type="number" fontSize="14px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Bedrooms</FormLabel>
                <Input value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} type="number" min="0" fontSize="14px" />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={2} gap="10px">
              <FormControl isInvalid={!!errors.latitude}>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Latitude *</FormLabel>
                <Input value={form.latitude} onChange={(e) => set('latitude', e.target.value)} placeholder="-22.9068" fontSize="14px" />
                <FormErrorMessage fontSize="11px">{errors.latitude}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.longitude}>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Longitude *</FormLabel>
                <Input value={form.longitude} onChange={(e) => set('longitude', e.target.value)} placeholder="-43.1729" fontSize="14px" />
                <FormErrorMessage fontSize="11px">{errors.longitude}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            {/* Agent */}
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Assign Agent</FormLabel>
              <Select value={form.agentId} onChange={(e) => handleAgentChange(e.target.value)} fontSize="14px">
                <option value="">No agent assigned</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.role})</option>)}
              </Select>
            </FormControl>

            <SimpleGrid columns={2} gap="10px">
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Phone</FormLabel>
                <Input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} placeholder="+1 555 000 0000" fontSize="14px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">WhatsApp</FormLabel>
                <Input value={form.contactWhatsApp} onChange={(e) => set('contactWhatsApp', e.target.value)} placeholder="+1 555 000 0000" fontSize="14px" />
              </FormControl>
            </SimpleGrid>
          </VStack>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="ghost" onClick={handleClose} fontSize="14px">Cancel</Button>
          <Button onClick={handleSubmit} isLoading={loading} fontSize="14px">Add Property</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
