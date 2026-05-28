import {
  Box,
  Text,
  Badge,
  Flex,
  Button,
  IconButton,
  Divider,
} from '@chakra-ui/react'
import type { Property } from '../types'

const STATUS_MAP = {
  AVAILABLE:   { label: 'Available',   color: 'green' },
  NEGOTIATING: { label: 'Negotiating', color: 'yellow' },
  SOLD:        { label: 'Sold',        color: 'red' },
}

interface Props {
  property: Property
  onClose: () => void
  onEdit?: (p: Property) => void
}

export function PropertyPopup({ property, onClose, onEdit }: Props) {
  const status = STATUS_MAP[property.status]

  function openWhatsApp() {
    const num = property.contactWhatsApp?.replace(/\D/g, '')
    if (num) window.open(`https://wa.me/${num}`, '_blank')
  }

  function callPhone() {
    if (property.contactPhone) window.location.href = `tel:${property.contactPhone}`
  }

  return (
    <Box
      bg="white"
      borderRadius="12px"
      shadow="0 8px 32px rgba(0,0,0,0.12)"
      border="1px solid"
      borderColor="neutral.100"
      w="280px"
      overflow="hidden"
    >
      {/* Header strip by status */}
      <Box
        h="4px"
        bg={
          property.status === 'AVAILABLE'
            ? 'brand.500'
            : property.status === 'NEGOTIATING'
            ? 'amber.500'
            : 'rose.500'
        }
      />

      <Box p="14px">
        {/* Top row */}
        <Flex justify="space-between" align="flex-start" mb="8px">
          <Badge colorScheme={status.color} fontSize="11px" px="8px" py="2px">
            {status.label}
          </Badge>
          <IconButton
            aria-label="Close"
            size="xs"
            variant="ghost"
            onClick={onClose}
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="#928D83" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
          />
        </Flex>

        {/* Title */}
        <Text fontWeight="700" fontSize="15px" color="neutral.800" lineHeight="1.3" mb="4px">
          {property.title}
        </Text>

        {(property.neighborhood || property.city) && (
          <Text fontSize="12px" color="neutral.400" mb="6px">
            📍 {[property.neighborhood, property.city, property.state].filter(Boolean).join(', ')}
          </Text>
        )}

        {property.price && (
          <Text fontSize="16px" fontWeight="800" color="neutral.800" mb="10px">
            R$ {property.price.toLocaleString('en-US')}
          </Text>
        )}

        <Divider borderColor="neutral.100" mb="10px" />

        {/* Contact */}
        <Text fontSize="11px" fontWeight="600" color="neutral.400" textTransform="uppercase" letterSpacing="0.5px" mb="8px">
          Contact
        </Text>

        <Flex direction="column" gap="6px">
          {property.contactPhone && (
            <Flex align="center" gap="8px">
              <Box color="neutral.400">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M12.7 9.8l-2.1-.3a1 1 0 00-.83.3l-1.5 1.5a10.5 10.5 0 01-4.6-4.6l1.5-1.5a1 1 0 00.3-.83l-.3-2.1A1 1 0 004.2 1H2.3A1 1 0 001.3 2c.2 6.3 5.4 11.5 11.7 11.7a1 1 0 001-.97v-1.9a1 1 0 00-.3-.03z" fill="currentColor" />
                </svg>
              </Box>
              <Text fontSize="13px" color="neutral.700">{property.contactPhone}</Text>
            </Flex>
          )}
          {property.contactWhatsApp && (
            <Flex align="center" gap="8px">
              <Box color="brand.500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </Box>
              <Text fontSize="13px" color="neutral.700">{property.contactWhatsApp}</Text>
            </Flex>
          )}
        </Flex>

        {/* Actions */}
        <Flex gap="8px" mt="12px">
          {property.contactWhatsApp && (
            <Button
              size="sm"
              flex={1}
              bg="brand.600"
              color="white"
              fontSize="13px"
              _hover={{ bg: 'brand.700' }}
              onClick={openWhatsApp}
            >
              WhatsApp
            </Button>
          )}
          {property.contactPhone && (
            <Button size="sm" flex={1} variant="outline" fontSize="13px" onClick={callPhone}>
              Call
            </Button>
          )}
          {onEdit && (
            <IconButton
              aria-label="Edit"
              size="sm"
              variant="ghost"
              onClick={() => onEdit(property)}
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9.5 1.5l3 3-8 8H1.5v-3l8-8z" stroke="#928D83" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          )}
        </Flex>
      </Box>
    </Box>
  )
}
