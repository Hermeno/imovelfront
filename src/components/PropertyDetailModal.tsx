import {
  Box, Flex, Text, Button, Divider, Avatar, useToast, Select, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea, VStack, IconButton,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Property, PropertyStatus, PropertyWithCompany } from '../types'
import { propertiesApi } from '../api/properties'
import { leadsApi } from '../api/leads'
import { useAuth } from '../contexts/AuthContext'
import { useFavorites } from '../contexts/FavoritesContext'
import { useComparison } from '../contexts/ComparisonContext'
import { VisitScheduleModal } from './VisitScheduleModal'
import { NAVBAR_HEIGHT } from './Navbar'

const STATUS_CFG: Record<PropertyStatus, { label: string; color: string; bg: string }> = {
  AVAILABLE:   { label: 'Available',   color: '#1a7a4a', bg: '#e6f5ee' },
  NEGOTIATING: { label: 'Negotiating', color: '#92600a', bg: '#fef3c7' },
  SOLD:        { label: 'Sold',        color: '#9b1c1c', bg: '#fee2e2' },
}
const STATUS_DOT: Record<PropertyStatus, string> = {
  AVAILABLE: '#2E9B6A', NEGOTIATING: '#E8A838', SOLD: '#D94F4F',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function Chip({ icon, label }: { icon: string; label: string }) {
  return (
    <Flex align="center" gap="5px" bg="#F8F7F4" border="1px solid" borderColor="neutral.100" borderRadius="7px" px="10px" py="6px">
      <Text fontSize="14px">{icon}</Text>
      <Text fontSize="12px" fontWeight="500" color="neutral.700">{label}</Text>
    </Flex>
  )
}

interface Props {
  property: Property | PropertyWithCompany | null
  isOpen: boolean
  onClose: () => void
  onUpdated?: (p: Property) => void
  readOnly?: boolean
}

export function PropertyDetailModal({ property, isOpen, onClose, onUpdated, readOnly = false }: Props) {
  const { company: authCompany } = useAuth()
  const toast = useToast()
  const [status, setStatus] = useState<PropertyStatus>(property?.status ?? 'AVAILABLE')
  const [savingStatus, setSavingStatus] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const [contactLoading, setContactLoading] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', whatsapp: '', message: '' })
  const { isFavorite, toggle: toggleFav } = useFavorites()
  useComparison()
  const visitModal = useDisclosure()
  const contactModal = useDisclosure()

  useEffect(() => {
    if (property) { setStatus(property.status); setImgIdx(0) }
  }, [property?.id])

  if (!property) return null

  const cfg = STATUS_CFG[status]
  const images = property.imageUrls ?? []
  const fav = isFavorite(property.id)
  const companyName = readOnly ? (property as PropertyWithCompany).company?.name : authCompany?.name

  async function handleStatusChange(newStatus: PropertyStatus) {
    setStatus(newStatus)
    setSavingStatus(true)
    try {
      const res = await propertiesApi.update(property!.id, { status: newStatus })
      if (res.success && res.data && onUpdated) onUpdated(res.data)
      toast({ title: 'Status updated', status: 'success', duration: 2000 })
    } catch {
      toast({ title: 'Error updating status', status: 'error', duration: 3000 })
      setStatus(property!.status)
    } finally { setSavingStatus(false) }
  }

  async function handleContact() {
    if (!contactForm.name || !contactForm.email || !contactForm.whatsapp) {
      toast({ title: 'Name, email and WhatsApp are required', status: 'warning', duration: 3000 })
      return
    }
    setContactLoading(true)
    try {
      await leadsApi.createPublic({
        propertyId: property!.id, interestedName: contactForm.name,
        email: contactForm.email, phone: contactForm.phone || undefined,
        whatsapp: contactForm.whatsapp, message: contactForm.message, source: 'INTEREST',
      })
      contactModal.onClose()
      setContactForm({ name: '', email: '', phone: '', whatsapp: '', message: '' })
      toast({ title: 'Message sent!', status: 'success', duration: 4000 })
    } catch {
      toast({ title: 'Error sending message', status: 'error', duration: 3000 })
    } finally { setContactLoading(false) }
  }

  function openWhatsApp() {
    const num = property!.contactWhatsApp?.replace(/\D/g, '')
    if (num) window.open(`https://wa.me/${num}?text=${encodeURIComponent(`Hi! I'm interested in: ${property!.title}`)}`, '_blank')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Left side panel */}
      <Box
        position="fixed"
        top={`calc(${NAVBAR_HEIGHT} + 12px)`}
        left="16px"
        bottom="16px"
        w={{ base: 'calc(100vw - 32px)', sm: '360px' }}
        zIndex={950}
        bg="white"
        borderRadius="16px"
        shadow="0 8px 40px rgba(0,0,0,0.18)"
        border="1px solid"
        borderColor="neutral.100"
        overflow="hidden"
        display="flex"
        flexDirection="column"
        style={{ animation: 'panelSlideIn 0.22s cubic-bezier(0.34,1.26,0.64,1) both' }}
      >
        {/* Header accent + close */}
        <Box h="3px" bg={STATUS_DOT[status]} flexShrink={0} />
        <IconButton
          aria-label="Close"
          icon={<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="#6B6660" strokeWidth="1.8" strokeLinecap="round"/></svg>}
          size="xs" variant="ghost" position="absolute" top="10px" right="10px" zIndex={2}
          borderRadius="full" bg="white" shadow="sm" border="1px solid" borderColor="neutral.100"
          onClick={onClose}
        />

        {/* Status badge */}
        <Flex align="center" gap="8px" px="16px" pt="12px" pb="8px" flexShrink={0}>
          <Box w="8px" h="8px" borderRadius="full" bg={STATUS_DOT[status]} flexShrink={0} />
          <Text fontSize="11px" fontWeight="700" color="neutral.500" textTransform="uppercase" letterSpacing="0.5px">{cfg.label}</Text>
          {property.listingType && (
            <Box ml="auto" bg="neutral.50" color="neutral.500" px="8px" py="2px" borderRadius="5px" fontSize="10px" fontWeight="600">
              {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </Box>
          )}
        </Flex>

        {/* Image */}
        {images.length > 0 ? (
          <Box position="relative" flexShrink={0} mx="12px" borderRadius="10px" overflow="hidden" mb="12px">
            <Box as="img" src={images[imgIdx]} alt={property.title} w="100%" h="180px" objectFit="cover" display="block" />
            {/* overlay gradient */}
            {property.price && (
              <Box position="absolute" bottom={0} left={0} right={0} bgGradient="linear(to-t, blackAlpha.800, transparent)" px="12px" py="10px">
                <Text fontSize="20px" fontWeight="800" color="white" letterSpacing="-0.5px">
                  {fmt(property.price)}
                  {property.listingType === 'rent' && <Text as="span" fontSize="12px" fontWeight="400">/mo</Text>}
                </Text>
              </Box>
            )}
            {images.length > 1 && (
              <Flex position="absolute" top="8px" right="8px" gap="4px">
                {images.slice(0, 5).map((url, i) => (
                  <Box
                    key={i} w="28px" h="20px" borderRadius="4px" overflow="hidden"
                    border="1.5px solid" borderColor={i === imgIdx ? 'white' : 'whiteAlpha.400'}
                    cursor="pointer" onClick={() => setImgIdx(i)} flexShrink={0}
                  >
                    <Box as="img" src={url} w="100%" h="100%" objectFit="cover" />
                  </Box>
                ))}
              </Flex>
            )}
            {readOnly && (
              <Flex position="absolute" top="8px" left="8px" gap="4px">
                <Box as="button" bg="whiteAlpha.900" borderRadius="6px" px="6px" py="4px" fontSize="11px" fontWeight="600"
                  color={fav ? 'rose.500' : 'neutral.600'} cursor="pointer" onClick={() => toggleFav(property.id)}>
                  {fav ? '❤️' : '🤍'}
                </Box>
              </Flex>
            )}
          </Box>
        ) : (
          <Flex h="140px" bg="brand.50" mx="12px" borderRadius="10px" mb="12px" align="center" justify="center" flexShrink={0}>
            <Text fontSize="40px">🏠</Text>
          </Flex>
        )}

        {/* Scrollable content */}
        <Box flex={1} overflowY="auto" px="16px" pb="16px">
          <Text fontSize="16px" fontWeight="800" color="neutral.800" letterSpacing="-0.3px" mb="4px" lineHeight="1.2">
            {property.title}
          </Text>

          {(property.neighborhood || property.city) && (
            <Flex align="center" gap="4px" mb="12px">
              <Text fontSize="12px" color="neutral.400">📍</Text>
              <Text fontSize="12px" color="neutral.400">
                {[property.neighborhood, property.city, property.state].filter(Boolean).join(', ')}
              </Text>
            </Flex>
          )}

          {(property.bedrooms || property.bathrooms || property.parkingSpots || property.propertyType) && (
            <Flex gap="6px" flexWrap="wrap" mb="14px">
              {property.bedrooms != null && property.bedrooms > 0 && <Chip icon="🛏" label={`${property.bedrooms}bd`} />}
              {property.bathrooms != null && property.bathrooms > 0 && <Chip icon="🚿" label={`${property.bathrooms}ba`} />}
              {property.parkingSpots != null && property.parkingSpots > 0 && <Chip icon="🚗" label={`${property.parkingSpots}pk`} />}
              {property.propertyType && <Chip icon="🏠" label={property.propertyType} />}
            </Flex>
          )}

          {property.description && (
            <>
              <Divider borderColor="neutral.100" mb="12px" />
              <Text fontSize="12px" color="neutral.600" lineHeight="1.7" mb="14px">{property.description}</Text>
            </>
          )}

          {/* Status control */}
          {!readOnly && (
            <Box mb="14px">
              <Text fontSize="11px" fontWeight="600" color="neutral.400" textTransform="uppercase" letterSpacing="0.5px" mb="6px">Status</Text>
              <Select value={status} onChange={(e) => handleStatusChange(e.target.value as PropertyStatus)} isDisabled={savingStatus} fontSize="13px" borderRadius="8px" size="sm">
                <option value="AVAILABLE">🟢 Available</option>
                <option value="NEGOTIATING">🟡 Negotiating</option>
                <option value="SOLD">🔴 Sold</option>
              </Select>
            </Box>
          )}

          {/* Agency */}
          <Flex align="center" gap="10px" bg="#F8F7F4" borderRadius="10px" p="10px" mb="14px">
            <Avatar name={companyName} size="sm" bg="brand.600" color="white" fontSize="12px" fontWeight="700" />
            <Box flex={1} minW={0}>
              <Text fontWeight="700" fontSize="13px" color="neutral.800" noOfLines={1}>{companyName}</Text>
              <Text fontSize="11px" color="neutral.400">Verified Agency ✓</Text>
            </Box>
          </Flex>

          {/* CTA buttons */}
          <Flex gap="8px" flexWrap="wrap">
            {property.contactWhatsApp && (
              <Button flex={1} minW="100px" h="38px" bg="#25D366" color="white" _hover={{ bg: '#1fb855' }} fontSize="12px" fontWeight="600" borderRadius="9px" onClick={openWhatsApp}>
                💬 WhatsApp
              </Button>
            )}
            {property.contactPhone && (
              <Button flex={1} minW="100px" h="38px" variant="outline" fontSize="12px" fontWeight="600" borderRadius="9px"
                onClick={() => { if (property.contactPhone) window.location.href = `tel:${property.contactPhone}` }}>
                📞 Call
              </Button>
            )}
            {readOnly && (
              <Button flex={1} minW="100px" h="38px" bg="brand.600" color="white" _hover={{ bg: 'brand.700' }} fontSize="12px" fontWeight="600" borderRadius="9px" onClick={contactModal.onOpen}>
                ✉️ Message
              </Button>
            )}
            {readOnly && (
              <Button flex={1} minW="100px" h="38px" variant="outline" fontSize="12px" fontWeight="600" borderRadius="9px" onClick={visitModal.onOpen}>
                📅 Visit
              </Button>
            )}
          </Flex>

          {readOnly && (
            <Button as={Link} to={`/property/${property.id}`} variant="ghost" size="sm" w="100%" mt="10px" fontSize="12px" color="brand.600">
              View full page →
            </Button>
          )}

          <Flex justify="space-between" mt="14px" pt="12px" borderTop="1px solid" borderColor="neutral.50">
            <Text fontSize="10px" color="neutral.300">Listed {new Date(property.createdAt).toLocaleDateString('en-US')}</Text>
            <Text fontSize="10px" color="neutral.300">{property.id.slice(0, 8)}…</Text>
          </Flex>
        </Box>
      </Box>

      <VisitScheduleModal property={property} isOpen={visitModal.isOpen} onClose={visitModal.onClose} />

      <Modal isOpen={contactModal.isOpen} onClose={contactModal.onClose} size="md">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px" mx="16px" my="48px">
          <ModalCloseButton />
          <ModalBody p="28px">
            <Text fontSize="17px" fontWeight="700" color="neutral.800" mb="4px">Send a Message</Text>
            <Text fontSize="13px" color="neutral.400" mb="20px" noOfLines={1}>{property.title}</Text>
            <VStack spacing="14px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Name</FormLabel>
                <Input value={contactForm.name} onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))} fontSize="14px" />
              </FormControl>
              <Flex gap="12px">
                <FormControl isRequired flex={1}>
                  <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Email</FormLabel>
                  <Input type="email" value={contactForm.email} onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))} fontSize="14px" />
                </FormControl>
                <FormControl isRequired flex={1}>
                  <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">WhatsApp</FormLabel>
                  <Input value={contactForm.whatsapp} onChange={(e) => setContactForm((f) => ({ ...f, whatsapp: e.target.value }))} fontSize="14px" />
                </FormControl>
              </Flex>
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Message</FormLabel>
                <Textarea value={contactForm.message} onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))} fontSize="14px" rows={3} resize="none" />
              </FormControl>
              <Button onClick={handleContact} isLoading={contactLoading} loadingText="Sending…" h="44px" fontSize="14px" fontWeight="600">
                Send Message
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
