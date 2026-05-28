import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Textarea, Select, VStack, Text, Box,
  SimpleGrid, Tabs, TabList, Tab, TabPanels, TabPanel, Divider, useToast,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { propertiesApi } from '../api/properties'
import { usersApi } from '../api/users'
import { AddressAutocomplete } from './AddressAutocomplete'
import { ImageUploader } from './ImageUploader'
import type { Property, PropertyStatus, User } from '../types'

interface Props {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onUpdated: (p: Property) => void
}

export function EditPropertyModal({ property, isOpen, onClose, onUpdated }: Props) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [agents, setAgents] = useState<User[]>([])
  const [form, setForm] = useState({
    title: '', description: '', status: 'AVAILABLE' as PropertyStatus,
    propertyType: '', listingType: '', price: '', bedrooms: '', bathrooms: '', parkingSpots: '',
    street: '', addressNumber: '', complement: '', neighborhood: '', city: '', state: '', postalCode: '',
    latitude: '', longitude: '', agentId: '', agentName: '', contactPhone: '', contactWhatsApp: '',
  })

  useEffect(() => {
    if (!property) return
    setForm({
      title: property.title,
      description: property.description ?? '',
      status: property.status,
      propertyType: property.propertyType ?? '',
      listingType: property.listingType ?? '',
      price: property.price ? String(property.price) : '',
      bedrooms: property.bedrooms ? String(property.bedrooms) : '',
      bathrooms: property.bathrooms ? String(property.bathrooms) : '',
      parkingSpots: property.parkingSpots ? String(property.parkingSpots) : '',
      street: property.street ?? '',
      addressNumber: property.addressNumber ?? '',
      complement: property.complement ?? '',
      neighborhood: property.neighborhood ?? '',
      city: property.city ?? '',
      state: property.state ?? '',
      postalCode: property.postalCode ?? '',
      latitude: String(property.latitude),
      longitude: String(property.longitude),
      agentId: property.agentId ?? '',
      agentName: property.agentName ?? '',
      contactPhone: property.contactPhone ?? '',
      contactWhatsApp: property.contactWhatsApp ?? '',
    })
  }, [property, isOpen])

  useEffect(() => {
    usersApi.list(50, 0).then((res) => {
      if (res.success && res.data) setAgents(res.data.users)
    }).catch(() => {})
  }, [])

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

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

  async function handleSave() {
    if (!property) return
    setLoading(true)
    try {
      const res = await propertiesApi.update(property.id, {
        title: form.title,
        description: form.description || undefined,
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
        onUpdated(res.data)
        onClose()
        toast({ title: 'Property updated', status: 'success', duration: 2000 })
      }
    } catch {
      toast({ title: 'Error updating property', status: 'error', duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  if (!property) return null

  const images = Array.isArray(property.images) && property.images.length > 0 && typeof property.images[0] === 'object'
    ? (property.images as any[])
    : (property.imageUrls || []).map((url, i) => ({ id: String(i), url, alt: null, order: i + 1 }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="16px" mx={{ base: '12px', md: '24px' }} my="24px">
        <ModalHeader fontSize="17px" fontWeight="700" color="neutral.800">Edit Property</ModalHeader>
        <ModalCloseButton top="16px" />
        <ModalBody pt="0">
          <Tabs variant="line" colorScheme="green" size="sm">
            <TabList mb="20px">
              <Tab fontSize="13px">Details</Tab>
              <Tab fontSize="13px">Address</Tab>
              <Tab fontSize="13px">Photos</Tab>
              <Tab fontSize="13px">Agent & Contact</Tab>
            </TabList>

            <TabPanels>
              {/* DETAILS */}
              <TabPanel p={0}>
                <VStack spacing="14px" align="stretch">
                  <FormControl>
                    <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Title *</FormLabel>
                    <Input value={form.title} onChange={(e) => set('title', e.target.value)} fontSize="14px" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Description</FormLabel>
                    <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} fontSize="14px" rows={4} resize="none" />
                  </FormControl>
                  <SimpleGrid columns={2} gap="12px">
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Status</FormLabel>
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
                  <SimpleGrid columns={2} gap="12px">
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Property Type</FormLabel>
                      <Select value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)} fontSize="14px">
                        <option value="">—</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="penthouse">Penthouse</option>
                        <option value="condo">Condo</option>
                        <option value="land">Land</option>
                        <option value="commercial">Commercial</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Price</FormLabel>
                      <Input value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="0" type="number" fontSize="14px" />
                    </FormControl>
                  </SimpleGrid>
                  <SimpleGrid columns={3} gap="12px">
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Bedrooms</FormLabel>
                      <Input value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} type="number" min="0" fontSize="14px" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Bathrooms</FormLabel>
                      <Input value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} type="number" min="0" fontSize="14px" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Parking</FormLabel>
                      <Input value={form.parkingSpots} onChange={(e) => set('parkingSpots', e.target.value)} type="number" min="0" fontSize="14px" />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* ADDRESS */}
              <TabPanel p={0}>
                <VStack spacing="14px" align="stretch">
                  <FormControl>
                    <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Search Address</FormLabel>
                    <AddressAutocomplete onSelect={handleAddress} placeholder="Start typing an address…" />
                    <Text fontSize="11px" color="neutral.400" mt="4px">Selecting an address auto-fills all fields below</Text>
                  </FormControl>
                  <Divider />
                  <SimpleGrid columns={2} gap="12px">
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Street</FormLabel>
                      <Input value={form.street} onChange={(e) => set('street', e.target.value)} fontSize="14px" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Number</FormLabel>
                      <Input value={form.addressNumber} onChange={(e) => set('addressNumber', e.target.value)} fontSize="14px" />
                    </FormControl>
                  </SimpleGrid>
                  <SimpleGrid columns={2} gap="12px">
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Complement</FormLabel>
                      <Input value={form.complement} onChange={(e) => set('complement', e.target.value)} placeholder="Apt, Suite…" fontSize="14px" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Neighborhood</FormLabel>
                      <Input value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} fontSize="14px" />
                    </FormControl>
                  </SimpleGrid>
                  <SimpleGrid columns={3} gap="12px">
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">City</FormLabel>
                      <Input value={form.city} onChange={(e) => set('city', e.target.value)} fontSize="14px" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">State</FormLabel>
                      <Input value={form.state} onChange={(e) => set('state', e.target.value)} fontSize="14px" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">ZIP</FormLabel>
                      <Input value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} fontSize="14px" />
                    </FormControl>
                  </SimpleGrid>
                  <SimpleGrid columns={2} gap="12px">
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Latitude</FormLabel>
                      <Input value={form.latitude} onChange={(e) => set('latitude', e.target.value)} fontSize="13px" fontFamily="mono" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Longitude</FormLabel>
                      <Input value={form.longitude} onChange={(e) => set('longitude', e.target.value)} fontSize="13px" fontFamily="mono" />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* PHOTOS */}
              <TabPanel p={0}>
                <Text fontSize="13px" color="neutral.500" mb="14px">
                  Drag photos to reorder. The first photo is the cover image.
                </Text>
                <ImageUploader propertyId={property.id} initialImages={images} />
              </TabPanel>

              {/* AGENT & CONTACT */}
              <TabPanel p={0}>
                <VStack spacing="14px" align="stretch">
                  <FormControl>
                    <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Assign Agent</FormLabel>
                    <Select value={form.agentId} onChange={(e) => handleAgentChange(e.target.value)} fontSize="14px">
                      <option value="">No agent assigned</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                      ))}
                    </Select>
                  </FormControl>
                  <SimpleGrid columns={2} gap="12px">
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Contact Phone</FormLabel>
                      <Input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} placeholder="+1 555 000 0000" fontSize="14px" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Contact WhatsApp</FormLabel>
                      <Input value={form.contactWhatsApp} onChange={(e) => set('contactWhatsApp', e.target.value)} placeholder="+1 555 000 0000" fontSize="14px" />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter gap="10px" borderTop="1px solid" borderColor="neutral.100">
          <Button variant="ghost" onClick={onClose} fontSize="14px">Cancel</Button>
          <Button onClick={handleSave} isLoading={loading} fontSize="14px">Save Changes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
