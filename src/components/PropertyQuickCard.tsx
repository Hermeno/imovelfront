import { Box, Flex, Text, Button, IconButton } from '@chakra-ui/react'
import type { Property, PropertyStatus } from '../types'

function fmtPrice(n: number) {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}K`
  return `R$ ${n.toLocaleString()}`
}

const STATUS_CFG: Record<PropertyStatus, { label: string; dot: string }> = {
  AVAILABLE:   { label: 'Available',   dot: '#2E9B6A' },
  NEGOTIATING: { label: 'Negotiating', dot: '#E8A838' },
  SOLD:        { label: 'Sold',        dot: '#D94F4F' },
}

interface Props {
  property: Property & { company?: { name: string; phone?: string | null; whatsapp?: string | null } }
  onClose: () => void
  onDetails: () => void
}

export function PropertyQuickCard({ property, onClose, onDetails }: Props) {
  const cfg = STATUS_CFG[property.status]
  const companyName = property.company?.name

  function openWhatsApp() {
    const num = (property.contactWhatsApp || property.company?.whatsapp)?.replace(/\D/g, '')
    if (num) window.open(`https://wa.me/${num}?text=${encodeURIComponent(`Hi! I'm interested in: ${property.title}`)}`, '_blank')
  }

  const hasWhatsApp = !!(property.contactWhatsApp || property.company?.whatsapp)

  return (
    <Box
      position="fixed"
      bottom={{ base: '16px', md: '24px' }}
      left="50%"
      transform="translateX(-50%)"
      zIndex={950}
      w={{ base: 'calc(100vw - 32px)', sm: '360px' }}
      bg="white"
      borderRadius="14px"
      shadow="0 8px 32px rgba(0,0,0,0.16)"
      border="1px solid"
      borderColor="neutral.100"
      overflow="hidden"
      style={{ animation: 'cardSlideUp 0.2s ease-out both' }}
    >
      {/* Top accent line */}
      <Box h="3px" bg={cfg.dot} />

      <Box p="14px">
        {/* Row 1: status + close */}
        <Flex justify="space-between" align="center" mb="6px">
          <Flex align="center" gap="6px">
            <Box w="8px" h="8px" borderRadius="full" bg={cfg.dot} flexShrink={0} />
            <Text fontSize="11px" fontWeight="600" color="neutral.500" textTransform="uppercase" letterSpacing="0.5px">
              {cfg.label}
            </Text>
          </Flex>
          <IconButton
            aria-label="Close"
            size="xs"
            variant="ghost"
            borderRadius="full"
            h="22px"
            minW="22px"
            onClick={onClose}
            icon={
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="#928D83" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
          />
        </Flex>

        {/* Row 2: title */}
        <Text
          fontSize="15px"
          fontWeight="700"
          color="neutral.800"
          lineHeight="1.25"
          noOfLines={1}
          mb="4px"
        >
          {property.title}
        </Text>

        {/* Row 3: location */}
        {(property.neighborhood || property.city) && (
          <Text fontSize="12px" color="neutral.400" mb="8px" noOfLines={1}>
            📍 {[property.neighborhood, property.city].filter(Boolean).join(', ')}
          </Text>
        )}

        {/* Row 4: price + details */}
        <Flex align="center" justify="space-between" mb="10px">
          {property.price ? (
            <Text fontSize="18px" fontWeight="800" color="neutral.800" letterSpacing="-0.5px">
              {fmtPrice(property.price)}
            </Text>
          ) : (
            <Box />
          )}
          <Flex gap="10px">
            {property.bedrooms != null && property.bedrooms > 0 && (
              <Flex align="center" gap="3px">
                <Text fontSize="12px">🛏</Text>
                <Text fontSize="12px" color="neutral.600" fontWeight="500">{property.bedrooms}bd</Text>
              </Flex>
            )}
            {property.bathrooms != null && property.bathrooms > 0 && (
              <Flex align="center" gap="3px">
                <Text fontSize="12px">🚿</Text>
                <Text fontSize="12px" color="neutral.600" fontWeight="500">{property.bathrooms}ba</Text>
              </Flex>
            )}
            {property.parkingSpots != null && property.parkingSpots > 0 && (
              <Flex align="center" gap="3px">
                <Text fontSize="12px">🚗</Text>
                <Text fontSize="12px" color="neutral.600" fontWeight="500">{property.parkingSpots}</Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Row 5: company */}
        {companyName && (
          <Flex
            align="center"
            gap="6px"
            mb="10px"
            px="10px"
            py="6px"
            bg="neutral.50"
            borderRadius="8px"
          >
            <Box
              w="20px"
              h="20px"
              borderRadius="5px"
              bg="brand.600"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Text fontSize="9px" color="white" fontWeight="700">
                {companyName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
              </Text>
            </Box>
            <Text fontSize="12px" color="neutral.600" fontWeight="500" noOfLines={1}>{companyName}</Text>
          </Flex>
        )}

        {/* Row 6: actions */}
        <Flex gap="8px">
          {hasWhatsApp && (
            <Button
              flex={1}
              h="36px"
              bg="#25D366"
              color="white"
              _hover={{ bg: '#1fb855' }}
              fontSize="12px"
              fontWeight="600"
              borderRadius="9px"
              onClick={openWhatsApp}
              leftIcon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              }
            >
              WhatsApp
            </Button>
          )}
          <Button
            flex={1}
            h="36px"
            bg="brand.600"
            color="white"
            _hover={{ bg: 'brand.700' }}
            fontSize="12px"
            fontWeight="600"
            borderRadius="9px"
            onClick={onDetails}
          >
            View details →
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
