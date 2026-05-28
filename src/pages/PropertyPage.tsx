import {
  Box, Flex, Text, Button, Badge, Spinner, Avatar, Divider, useDisclosure, useToast,
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea, VStack, NumberInput, NumberInputField, Select,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { publicPropertiesApi } from '../api/properties'
import { leadsApi } from '../api/leads'
import { alertsApi } from '../api/alerts'
import { useFavorites } from '../contexts/FavoritesContext'
import type { TourPhoto, PriceHistoryEntry } from '../types'

function getSessionId(): string {
  let sid = sessionStorage.getItem('ulmap_sid')
  if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem('ulmap_sid', sid) }
  return sid
}

function getDevice(): string {
  return /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
}
import { useComparison } from '../contexts/ComparisonContext'
import { VisitScheduleModal } from '../components/VisitScheduleModal'
import type { PropertyWithCompany } from '../types'

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE:   { label: 'Available',   color: '#1a7a4a', bg: '#e6f5ee' },
  NEGOTIATING: { label: 'Negotiating', color: '#92600a', bg: '#fef3c7' },
  SOLD:        { label: 'Sold',        color: '#9b1c1c', bg: '#fee2e2' },
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function PropertyPage() {
  const { id } = useParams<{ id: string }>()
  const [property, setProperty] = useState<PropertyWithCompany | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [contactLoading, setContactLoading] = useState(false)
  const { isFavorite, toggle } = useFavorites()
  const { toggle: toggleCompare, isSelected, canAdd } = useComparison()
  const { isOpen: isContactOpen, onOpen: openContact, onClose: closeContact } = useDisclosure()
  const { isOpen: isVisitOpen, onOpen: openVisit, onClose: closeVisit } = useDisclosure()
  const toast = useToast()
  const navigate = useNavigate()
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', whatsapp: '', message: '' })
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([])
  const [changelog, setChangelog] = useState<{ id: string; field: string; oldValue: string | null; newValue: string | null; createdAt: string }[]>([])
  const [tourPhotos, setTourPhotos] = useState<TourPhoto[]>([])
  const [tourIdx, setTourIdx] = useState(0)
  const { isOpen: isAlertOpen, onOpen: openAlert, onClose: closeAlert } = useDisclosure()
  const [alertForm, setAlertForm] = useState({ name: '', email: '', radiusKm: 10, maxPrice: '', listingType: '' })
  const [alertLoading, setAlertLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    publicPropertiesApi.getById(id)
      .then((res) => { if (res.success && res.data) setProperty(res.data) })
      .finally(() => setLoading(false))
    publicPropertiesApi.getPriceHistory(id)
      .then((res) => { if (res.success && res.data) setPriceHistory(res.data) })
      .catch(() => {})
    publicPropertiesApi.getChangelog(id)
      .then((res) => { if (res.success && res.data) setChangelog(res.data) })
      .catch(() => {})
    publicPropertiesApi.getTourPhotos(id)
      .then((res) => { if (res.success && res.data) setTourPhotos(res.data) })
      .catch(() => {})
    // Track view
    publicPropertiesApi.trackView(id, getSessionId(), document.referrer || undefined, getDevice())
  }, [id])

  async function handleAlertSubscribe() {
    if (!property || !alertForm.name || !alertForm.email) {
      toast({ title: 'Name and email are required', status: 'warning', duration: 3000 })
      return
    }
    setAlertLoading(true)
    try {
      await alertsApi.create({
        name: alertForm.name,
        email: alertForm.email,
        latitude: property.latitude,
        longitude: property.longitude,
        radiusKm: alertForm.radiusKm,
        maxPrice: alertForm.maxPrice ? parseFloat(alertForm.maxPrice) : undefined,
        listingType: alertForm.listingType || undefined,
      })
      closeAlert()
      toast({ title: 'Alert created!', description: 'You\'ll be notified of new properties nearby.', status: 'success', duration: 4000 })
    } catch {
      toast({ title: 'Error creating alert', status: 'error', duration: 3000 })
    } finally {
      setAlertLoading(false)
    }
  }

  async function handleContact() {
    if (!property) return
    if (!contactForm.name || !contactForm.email || !contactForm.whatsapp) {
      toast({ title: 'Name, email and WhatsApp are required', status: 'warning', duration: 3000 })
      return
    }
    setContactLoading(true)
    try {
      await leadsApi.createPublic({
        propertyId: property.id,
        interestedName: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone || undefined,
        whatsapp: contactForm.whatsapp,
        message: contactForm.message,
        source: 'CONTACT',
        sessionId: getSessionId(),
      })
      closeContact()
      toast({ title: 'Message sent!', description: 'The agency will contact you shortly.', status: 'success', duration: 4000 })
    } catch {
      toast({ title: 'Error sending message', status: 'error', duration: 3000 })
    } finally {
      setContactLoading(false)
    }
  }

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center">
        <Spinner size="lg" color="brand.600" thickness="3px" />
      </Flex>
    )
  }

  if (!property) {
    return (
      <Flex h="100vh" direction="column" align="center" justify="center" gap="16px">
        <Text fontSize="48px">🏠</Text>
        <Text fontSize="20px" fontWeight="700" color="neutral.800">Property not found</Text>
        <Button as={Link} to="/mapa">Back to map</Button>
      </Flex>
    )
  }

  const cfg = STATUS_CFG[property.status]
  const images = property.imageUrls || []
  const fav = isFavorite(property.id)
  const inComparison = isSelected(property.id)

  useEffect(() => {
    document.title = `${property.title} — Ulmap`
    return () => { document.title = 'Ulmap' }
  }, [property.title])

  return (
    <>
      <Box minH="100vh" bg="#F8F7F4">
        {/* Top bar */}
        <Flex
          align="center" justify="space-between"
          px={{ base: '16px', md: '32px' }} py="14px"
          bg="white" borderBottom="1px solid" borderColor="neutral.100"
          position="sticky" top={0} zIndex={100}
        >
          <Flex as={Link} to="/mapa" align="center" gap="8px" _hover={{ textDecoration: 'none' }}>
            <Box w="28px" h="28px" borderRadius="7px" bg="brand.600" display="flex" alignItems="center" justifyContent="center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.49-2.01-4.5-4.5-4.5zm0 6.1a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2z" fill="white" />
              </svg>
            </Box>
            <Text fontWeight="700" fontSize="15px" color="neutral.800">Ul<Text as="span" color="brand.600">map</Text></Text>
          </Flex>
          <Flex gap="8px">
            <Button
              size="sm" variant="outline" fontSize="13px"
              color={fav ? 'rose.500' : 'neutral.600'}
              borderColor={fav ? 'rose.300' : 'neutral.200'}
              onClick={() => toggle(property.id)}
              leftIcon={<Text fontSize="14px">{fav ? '❤️' : '🤍'}</Text>}
            >
              {fav ? 'Saved' : 'Save'}
            </Button>
            <Button
              size="sm" variant="outline" fontSize="13px"
              isDisabled={!inComparison && !canAdd}
              onClick={() => toggleCompare(property as any)}
              leftIcon={<Text fontSize="14px">⚖️</Text>}
            >
              {inComparison ? 'Remove' : 'Compare'}
            </Button>
            <Button size="sm" bg="brand.600" color="white" _hover={{ bg: 'brand.700' }} fontSize="13px" onClick={openContact}>
              Contact
            </Button>
          </Flex>
        </Flex>

        <Box maxW="960px" mx="auto" px={{ base: '16px', md: '32px' }} py="32px">
          {/* Image gallery */}
          {images.length > 0 ? (
            <Box borderRadius="16px" overflow="hidden" mb="28px">
              <Box
                as="img" src={images[imgIdx]} alt={property.title}
                w="100%" h={{ base: '240px', md: '440px' }} objectFit="cover"
              />
              {images.length > 1 && (
                <Flex gap="6px" mt="8px" overflowX="auto">
                  {images.map((url, i) => (
                    <Box
                      key={i} as="img" src={url}
                      w="64px" h="48px" objectFit="cover" borderRadius="6px"
                      cursor="pointer" border="2px solid"
                      borderColor={i === imgIdx ? 'brand.500' : 'transparent'}
                      onClick={() => setImgIdx(i)}
                      flexShrink={0}
                    />
                  ))}
                </Flex>
              )}
            </Box>
          ) : (
            <Box
              h={{ base: '200px', md: '360px' }} bg="brand.50" borderRadius="16px" mb="28px"
              display="flex" alignItems="center" justifyContent="center"
            >
              <Text fontSize="64px">🏠</Text>
            </Box>
          )}

          <Flex gap="24px" flexWrap="wrap" align="flex-start">
            {/* Main content */}
            <Box flex={2} minW={{ base: '100%', md: '400px' }}>
              <Flex align="center" gap="10px" mb="8px">
                <Box bg={cfg.bg} color={cfg.color} px="12px" py="4px" borderRadius="6px" fontSize="12px" fontWeight="700">
                  {cfg.label}
                </Box>
                {property.listingType && (
                  <Badge colorScheme="gray" fontSize="11px">
                    {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                  </Badge>
                )}
                {property.propertyType && (
                  <Badge colorScheme="gray" fontSize="11px" textTransform="capitalize">{property.propertyType}</Badge>
                )}
              </Flex>

              <Text fontSize={{ base: '22px', md: '28px' }} fontWeight="800" color="neutral.800" letterSpacing="-0.5px" mb="8px">
                {property.title}
              </Text>

              {property.city && (
                <Flex align="center" gap="5px" mb="16px">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.49-2.01-4.5-4.5-4.5zm0 6.1a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2z" fill="#928D83" />
                  </svg>
                  <Text fontSize="15px" color="neutral.500">
                    {[property.street && `${property.street}${property.addressNumber ? ` ${property.addressNumber}` : ''}`, property.neighborhood, property.city, property.state].filter(Boolean).join(', ')}
                  </Text>
                </Flex>
              )}

              {property.price && (
                <Text fontSize={{ base: '24px', md: '32px' }} fontWeight="800" color="brand.700" letterSpacing="-0.5px" mb="20px">
                  {fmt(property.price)}
                  {property.listingType === 'rent' && <Text as="span" fontSize="16px" fontWeight="400" color="neutral.400">/mo</Text>}
                </Text>
              )}

              {/* Property specs */}
              {(property.bedrooms || property.bathrooms || property.parkingSpots) && (
                <Flex gap="16px" mb="24px" flexWrap="wrap">
                  {property.bedrooms != null && property.bedrooms > 0 && (
                    <Flex align="center" gap="6px" bg="white" px="14px" py="10px" borderRadius="10px" border="1px solid" borderColor="neutral.100">
                      <Text fontSize="18px">🛏</Text>
                      <Box>
                        <Text fontSize="16px" fontWeight="700" color="neutral.800">{property.bedrooms}</Text>
                        <Text fontSize="11px" color="neutral.400">Bedroom{property.bedrooms > 1 ? 's' : ''}</Text>
                      </Box>
                    </Flex>
                  )}
                  {property.bathrooms != null && property.bathrooms > 0 && (
                    <Flex align="center" gap="6px" bg="white" px="14px" py="10px" borderRadius="10px" border="1px solid" borderColor="neutral.100">
                      <Text fontSize="18px">🚿</Text>
                      <Box>
                        <Text fontSize="16px" fontWeight="700" color="neutral.800">{property.bathrooms}</Text>
                        <Text fontSize="11px" color="neutral.400">Bathroom{property.bathrooms > 1 ? 's' : ''}</Text>
                      </Box>
                    </Flex>
                  )}
                  {property.parkingSpots != null && property.parkingSpots > 0 && (
                    <Flex align="center" gap="6px" bg="white" px="14px" py="10px" borderRadius="10px" border="1px solid" borderColor="neutral.100">
                      <Text fontSize="18px">🚗</Text>
                      <Box>
                        <Text fontSize="16px" fontWeight="700" color="neutral.800">{property.parkingSpots}</Text>
                        <Text fontSize="11px" color="neutral.400">Parking{property.parkingSpots > 1 ? ' spots' : ' spot'}</Text>
                      </Box>
                    </Flex>
                  )}
                </Flex>
              )}

              {property.description && (
                <Box mb="24px">
                  <Text fontSize="14px" fontWeight="700" color="neutral.700" mb="10px">About this property</Text>
                  <Text fontSize="15px" color="neutral.600" lineHeight="1.8">{property.description}</Text>
                </Box>
              )}

              {/* Tour photos */}
              {tourPhotos.length > 0 && (
                <Box mb="24px">
                  <Text fontSize="14px" fontWeight="700" color="neutral.700" mb="10px">Virtual Tour ({tourPhotos.length} photos)</Text>
                  <Box borderRadius="12px" overflow="hidden" mb="8px">
                    <Box
                      as="img" src={tourPhotos[tourIdx].url}
                      alt={tourPhotos[tourIdx].room || 'Tour photo'}
                      w="100%" h="280px" objectFit="cover"
                    />
                  </Box>
                  {tourPhotos[tourIdx].room && (
                    <Text fontSize="12px" color="neutral.400" textAlign="center" mb="8px">{tourPhotos[tourIdx].room}</Text>
                  )}
                  {tourPhotos.length > 1 && (
                    <Flex gap="6px" overflowX="auto">
                      {tourPhotos.map((p, i) => (
                        <Box
                          key={p.id} as="img" src={p.url} alt={p.room || ''}
                          w="56px" h="42px" objectFit="cover" borderRadius="5px"
                          cursor="pointer" border="2px solid"
                          borderColor={i === tourIdx ? 'brand.500' : 'transparent'}
                          onClick={() => setTourIdx(i)}
                          flexShrink={0}
                        />
                      ))}
                    </Flex>
                  )}
                </Box>
              )}

              {/* Price history */}
              {priceHistory.length > 1 && (
                <Box mb="24px" bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100" p="16px">
                  <Text fontSize="14px" fontWeight="700" color="neutral.700" mb="12px">Price History</Text>
                  {priceHistory.map((entry, i) => (
                    <Flex key={entry.id} align="center" justify="space-between" py="6px"
                      borderBottom={i < priceHistory.length - 1 ? '1px solid' : 'none'} borderColor="neutral.50">
                      <Text fontSize="12px" color="neutral.400">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                      <Flex align="center" gap="8px">
                        {i > 0 && (
                          <Text fontSize="11px" color={entry.price < priceHistory[i - 1].price ? '#1a7a4a' : '#9b1c1c'}>
                            {entry.price < priceHistory[i - 1].price ? '↓' : '↑'}
                            {Math.abs(Math.round(((entry.price - priceHistory[i - 1].price) / priceHistory[i - 1].price) * 100))}%
                          </Text>
                        )}
                        <Text fontSize="13px" fontWeight="700" color="neutral.800">{fmt(entry.price)}</Text>
                      </Flex>
                    </Flex>
                  ))}
                </Box>
              )}

              {/* Changelog */}
              {changelog.length > 0 && (
                <Box mb="24px" bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100" p="16px">
                  <Text fontSize="14px" fontWeight="700" color="neutral.700" mb="12px">Listing Updates</Text>
                  {changelog.map((entry) => (
                    <Flex key={entry.id} align="flex-start" gap="10px" py="6px"
                      borderBottom="1px solid" borderColor="neutral.50" _last={{ border: 'none' }}>
                      <Text fontSize="18px" mt="1px">
                        {entry.field === 'price' ? '💰' : entry.field === 'status' ? '🔄' : entry.field === 'title' ? '✏️' : '📝'}
                      </Text>
                      <Box flex={1} minW={0}>
                        <Text fontSize="12px" fontWeight="600" color="neutral.700" textTransform="capitalize">{entry.field} changed</Text>
                        {entry.oldValue && (
                          <Text fontSize="11px" color="neutral.400" noOfLines={1}>
                            {entry.oldValue} → <Text as="span" fontWeight="600" color="neutral.600">{entry.newValue || '—'}</Text>
                          </Text>
                        )}
                        <Text fontSize="10px" color="neutral.300" mt="1px">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      </Box>
                    </Flex>
                  ))}
                </Box>
              )}

              {property.agentName && (
                <Box bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100" p="16px" mb="16px">
                  <Text fontSize="12px" fontWeight="600" color="neutral.400" textTransform="uppercase" letterSpacing="0.5px" mb="10px">Listing Agent</Text>
                  <Flex align="center" gap="12px">
                    <Avatar name={property.agentName} size="md" bg="brand.100" color="brand.700" fontWeight="700" />
                    <Box>
                      <Text fontWeight="700" fontSize="15px" color="neutral.800">{property.agentName}</Text>
                      {property.company?.name && (
                        <Text fontSize="13px" color="neutral.400">{property.company.name}</Text>
                      )}
                    </Box>
                  </Flex>
                </Box>
              )}

              {/* Freed alert — only for SOLD/NEGOTIATING */}
              {(property.status === 'SOLD' || property.status === 'NEGOTIATING') && (
                <Box
                  bg="#fef9c3" borderRadius="12px" border="1px solid" borderColor="#fde047" p="16px" cursor="pointer"
                  _hover={{ bg: '#fef08a' }} transition="background 0.15s" onClick={openAlert}
                  mb="10px"
                >
                  <Text fontSize="13px" fontWeight="700" color="#713f12" mb="4px">
                    🔓 Notify me if this property becomes available
                  </Text>
                  <Text fontSize="12px" color="#92400e">Deal may fall through — get notified first</Text>
                </Box>
              )}

              {/* Alert subscription */}
              <Box
                bg="brand.50" borderRadius="12px" border="1px solid" borderColor="brand.100" p="16px" cursor="pointer"
                _hover={{ bg: 'brand.100' }} transition="background 0.15s" onClick={openAlert}
              >
                <Text fontSize="13px" fontWeight="700" color="brand.700" mb="4px">🔔 Get notified of similar properties</Text>
                <Text fontSize="12px" color="brand.500">Set up an alert for this area</Text>
              </Box>
            </Box>

            {/* Sidebar */}
            <Box
              flex={1} minW={{ base: '100%', md: '260px' }}
              bg="white" borderRadius="14px" border="1px solid" borderColor="neutral.100"
              p="20px" position={{ md: 'sticky' }} top="80px"
            >
              {property.company && (
                <Flex align="center" gap="10px" mb="16px">
                  {(property.company as any).logoUrl ? (
                    <Box as="img" src={(property.company as any).logoUrl} w="36px" h="36px" objectFit="contain" borderRadius="8px" />
                  ) : (
                    <Avatar name={property.company.name} size="sm" bg="brand.600" color="white" />
                  )}
                  <Box>
                    <Text fontWeight="700" fontSize="14px" color="neutral.800">{property.company.name}</Text>
                    <Text fontSize="12px" color="neutral.400">Verified Agency ✓</Text>
                  </Box>
                </Flex>
              )}
              <Divider mb="16px" />
              <Flex direction="column" gap="10px">
                {property.contactWhatsApp && (
                  <Button
                    h="42px" bg="#25D366" color="white" _hover={{ bg: '#1fb855' }}
                    fontSize="13px" fontWeight="600" borderRadius="10px"
                    onClick={() => {
                      const num = property.contactWhatsApp!.replace(/\D/g, '')
                      window.open(`https://wa.me/${num}?text=${encodeURIComponent(`Hi! I'm interested in: ${property.title}`)}`, '_blank')
                    }}
                    leftIcon={<Text>💬</Text>}
                  >
                    WhatsApp
                  </Button>
                )}
                {property.contactPhone && (
                  <Button
                    h="42px" variant="outline" fontSize="13px" fontWeight="600" borderRadius="10px"
                    onClick={() => { window.location.href = `tel:${property.contactPhone}` }}
                    leftIcon={<Text>📞</Text>}
                  >
                    {property.contactPhone}
                  </Button>
                )}
                <Button
                  h="42px" bg="brand.600" color="white" _hover={{ bg: 'brand.700' }}
                  fontSize="13px" fontWeight="600" borderRadius="10px" onClick={openContact}
                  leftIcon={<Text>✉️</Text>}
                >
                  Send Message
                </Button>
                <Button
                  h="42px" variant="outline" fontSize="13px" fontWeight="600" borderRadius="10px"
                  onClick={openVisit} leftIcon={<Text>📅</Text>}
                >
                  Schedule Visit
                </Button>
              </Flex>
              <Divider my="16px" />
              <Text fontSize="12px" color="neutral.400" textAlign="center">
                Listed {new Date(property.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
              {property.company && (
                <Button
                  as={Link} to={`/agency/${property.companyId}`}
                  size="sm" variant="ghost" w="100%" mt="8px" fontSize="12px" color="neutral.400"
                >
                  View agency page
                </Button>
              )}
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* Contact modal */}
      <Modal isOpen={isContactOpen} onClose={closeContact} size="md">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px" mx="16px" my="48px">
          <ModalCloseButton />
          <ModalBody p="28px">
            <Text fontSize="17px" fontWeight="700" color="neutral.800" mb="4px">Send a Message</Text>
            <Text fontSize="13px" color="neutral.400" mb="20px">{property.title}</Text>
            <VStack spacing="14px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Name</FormLabel>
                <Input value={contactForm.name} onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))} fontSize="14px" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Email</FormLabel>
                <Input type="email" value={contactForm.email} onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))} fontSize="14px" />
              </FormControl>
              <Flex gap="12px">
                <FormControl flex={1}>
                  <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Phone</FormLabel>
                  <Input value={contactForm.phone} onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))} fontSize="14px" />
                </FormControl>
                <FormControl flex={1} isRequired>
                  <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">WhatsApp</FormLabel>
                  <Input value={contactForm.whatsapp} onChange={(e) => setContactForm((f) => ({ ...f, whatsapp: e.target.value }))} fontSize="14px" />
                </FormControl>
              </Flex>
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Message</FormLabel>
                <Textarea value={contactForm.message} onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))} fontSize="14px" rows={3} resize="none" placeholder="I'm interested in this property…" />
              </FormControl>
              <Button onClick={handleContact} isLoading={contactLoading} loadingText="Sending…" h="44px" fontSize="14px" fontWeight="600">
                Send Message
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <VisitScheduleModal property={property} isOpen={isVisitOpen} onClose={closeVisit} />

      {/* Alert subscription modal */}
      <Modal isOpen={isAlertOpen} onClose={closeAlert} size="md">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px" mx="16px" my="48px">
          <ModalCloseButton />
          <ModalBody p="28px">
            <Text fontSize="17px" fontWeight="700" color="neutral.800" mb="4px">Property Alert</Text>
            <Text fontSize="13px" color="neutral.400" mb="20px">
              Get notified when new properties are listed near {property.city || 'this location'}
            </Text>
            <VStack spacing="14px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Your Name</FormLabel>
                <Input value={alertForm.name} onChange={(e) => setAlertForm((f) => ({ ...f, name: e.target.value }))} fontSize="14px" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Email</FormLabel>
                <Input type="email" value={alertForm.email} onChange={(e) => setAlertForm((f) => ({ ...f, email: e.target.value }))} fontSize="14px" />
              </FormControl>
              <Flex gap="12px">
                <FormControl flex={1}>
                  <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Radius (km)</FormLabel>
                  <NumberInput min={1} max={100} value={alertForm.radiusKm} onChange={(v) => setAlertForm((f) => ({ ...f, radiusKm: parseInt(v) || 10 }))}>
                    <NumberInputField fontSize="14px" />
                  </NumberInput>
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Max Price</FormLabel>
                  <Input type="number" placeholder="Any" value={alertForm.maxPrice} onChange={(e) => setAlertForm((f) => ({ ...f, maxPrice: e.target.value }))} fontSize="14px" />
                </FormControl>
              </Flex>
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Listing Type</FormLabel>
                <Select value={alertForm.listingType} onChange={(e) => setAlertForm((f) => ({ ...f, listingType: e.target.value }))} fontSize="14px">
                  <option value="">Any</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </Select>
              </FormControl>
              <Button onClick={handleAlertSubscribe} isLoading={alertLoading} loadingText="Creating…" h="44px" fontSize="14px" fontWeight="600">
                Create Alert
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
