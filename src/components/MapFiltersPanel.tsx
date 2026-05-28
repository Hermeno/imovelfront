import {
  Box, Flex, Text, Button,
  Select, NumberInput, NumberInputField,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, Badge,
} from '@chakra-ui/react'
import type { MapFilters } from '../types'

interface Props {
  filters: MapFilters
  onChange: (f: MapFilters) => void
  isOpen: boolean
  onClose: () => void
  totalResults: number
}

const RADIUS_OPTIONS = [1, 2, 5, 10, 25, 50]

export function MapFiltersPanel({ filters, onChange, isOpen, onClose, totalResults }: Props) {
  function set(k: keyof MapFilters, v: any) {
    onChange({ ...filters, [k]: v })
  }

  function reset() {
    onChange({
      status: 'ALL', listingType: 'ALL', propertyType: 'ALL',
      minPrice: null, maxPrice: null, minBeds: null, radiusKm: null, citySearch: '',
    })
  }

  const activeCount = [
    filters.status !== 'ALL',
    filters.listingType !== 'ALL',
    filters.propertyType !== 'ALL',
    filters.minPrice != null,
    filters.maxPrice != null,
    filters.minBeds != null,
    filters.radiusKm != null,
  ].filter(Boolean).length

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
      <DrawerOverlay bg="blackAlpha.200" />
      <DrawerContent shadow="2xl">
        <DrawerCloseButton />
        <DrawerHeader fontSize="16px" fontWeight="700" borderBottom="1px solid" borderColor="neutral.100">
          <Flex align="center" gap="10px">
            Filters
            {activeCount > 0 && (
              <Badge colorScheme="green" fontSize="11px">{activeCount} active</Badge>
            )}
          </Flex>
        </DrawerHeader>
        <DrawerBody pt="20px">
          <Flex direction="column" gap="20px">
            {/* Status */}
            <Box>
              <Text fontSize="12px" fontWeight="600" color="neutral.500" textTransform="uppercase" letterSpacing="0.5px" mb="8px">Status</Text>
              <Flex gap="6px" flexWrap="wrap">
                {(['ALL', 'AVAILABLE', 'NEGOTIATING', 'SOLD'] as const).map((s) => (
                  <Button
                    key={s} size="xs" fontSize="11px"
                    variant={filters.status === s ? 'solid' : 'outline'}
                    colorScheme={s === 'AVAILABLE' ? 'green' : s === 'NEGOTIATING' ? 'yellow' : s === 'SOLD' ? 'red' : 'gray'}
                    onClick={() => set('status', s)}
                  >
                    {s === 'ALL' ? 'All' : s === 'AVAILABLE' ? 'Available' : s === 'NEGOTIATING' ? 'Negotiating' : 'Sold'}
                  </Button>
                ))}
              </Flex>
            </Box>

            {/* Listing type */}
            <Box>
              <Text fontSize="12px" fontWeight="600" color="neutral.500" textTransform="uppercase" letterSpacing="0.5px" mb="8px">Listing Type</Text>
              <Flex gap="6px">
                {(['ALL', 'sale', 'rent'] as const).map((t) => (
                  <Button key={t} size="xs" fontSize="11px"
                    variant={filters.listingType === t ? 'solid' : 'outline'}
                    colorScheme="brand"
                    onClick={() => set('listingType', t)}
                  >
                    {t === 'ALL' ? 'All' : t === 'sale' ? 'For Sale' : 'For Rent'}
                  </Button>
                ))}
              </Flex>
            </Box>

            {/* Property type */}
            <Box>
              <Text fontSize="12px" fontWeight="600" color="neutral.500" textTransform="uppercase" letterSpacing="0.5px" mb="8px">Property Type</Text>
              <Select size="sm" fontSize="13px" value={filters.propertyType} onChange={(e) => set('propertyType', e.target.value)} borderRadius="8px">
                <option value="ALL">All types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="penthouse">Penthouse</option>
                <option value="condo">Condo</option>
                <option value="land">Land</option>
              </Select>
            </Box>

            {/* Price range */}
            <Box>
              <Text fontSize="12px" fontWeight="600" color="neutral.500" textTransform="uppercase" letterSpacing="0.5px" mb="8px">Price Range</Text>
              <Flex gap="8px">
                <NumberInput
                  size="sm" min={0} value={filters.minPrice ?? ''}
                  onChange={(v) => set('minPrice', v ? parseInt(v) : null)}
                >
                  <NumberInputField placeholder="Min" fontSize="13px" borderRadius="8px" />
                </NumberInput>
                <NumberInput
                  size="sm" min={0} value={filters.maxPrice ?? ''}
                  onChange={(v) => set('maxPrice', v ? parseInt(v) : null)}
                >
                  <NumberInputField placeholder="Max" fontSize="13px" borderRadius="8px" />
                </NumberInput>
              </Flex>
            </Box>

            {/* Min bedrooms */}
            <Box>
              <Text fontSize="12px" fontWeight="600" color="neutral.500" textTransform="uppercase" letterSpacing="0.5px" mb="8px">Min. Bedrooms</Text>
              <Flex gap="6px">
                {[null, 1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={String(n)} size="xs" fontSize="11px"
                    variant={filters.minBeds === n ? 'solid' : 'outline'}
                    colorScheme="brand"
                    onClick={() => set('minBeds', n)}
                  >
                    {n === null ? 'Any' : `${n}+`}
                  </Button>
                ))}
              </Flex>
            </Box>

            {/* Radius */}
            <Box>
              <Text fontSize="12px" fontWeight="600" color="neutral.500" textTransform="uppercase" letterSpacing="0.5px" mb="8px">
                Radius (requires location)
              </Text>
              <Flex gap="6px" flexWrap="wrap">
                <Button size="xs" fontSize="11px"
                  variant={filters.radiusKm === null ? 'solid' : 'outline'}
                  colorScheme="brand"
                  onClick={() => set('radiusKm', null)}
                >
                  Any
                </Button>
                {RADIUS_OPTIONS.map((r) => (
                  <Button key={r} size="xs" fontSize="11px"
                    variant={filters.radiusKm === r ? 'solid' : 'outline'}
                    colorScheme="brand"
                    onClick={() => set('radiusKm', r)}
                  >
                    {r}km
                  </Button>
                ))}
              </Flex>
            </Box>

            <Box pt="8px" borderTop="1px solid" borderColor="neutral.100">
              <Flex justify="space-between" align="center">
                <Text fontSize="13px" color="neutral.500">{totalResults} result{totalResults !== 1 ? 's' : ''}</Text>
                <Button size="sm" variant="ghost" fontSize="13px" onClick={reset} isDisabled={activeCount === 0}>
                  Clear all
                </Button>
              </Flex>
            </Box>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
