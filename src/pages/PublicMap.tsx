import {
  Box, Flex, Text, Button, Spinner, Input, useDisclosure, IconButton,
} from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMap, Tooltip as LeafletTooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../utils/usePageTitle'
import { publicPropertiesApi } from '../api/properties'
import { PropertyDetailModal } from '../components/PropertyDetailModal'
import { MapFiltersPanel } from '../components/MapFiltersPanel'
import { ComparisonDrawer } from '../components/ComparisonDrawer'
import { useFavorites } from '../contexts/FavoritesContext'
import { useComparison } from '../contexts/ComparisonContext'
import type { PropertyWithCompany, PropertyStatus, MapFilters } from '../types'

const STATUS_COLOR: Record<PropertyStatus, string> = {
  AVAILABLE: '#2E9B6A', NEGOTIATING: '#E8A838', SOLD: '#D94F4F',
}
const STATUS_LABEL: Record<PropertyStatus, string> = {
  AVAILABLE: 'Available', NEGOTIATING: 'Negotiating', SOLD: 'Sold',
}
const PULSING: PropertyStatus[] = ['AVAILABLE', 'NEGOTIATING']

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function mkIcon(status: PropertyStatus, selected: boolean, fav: boolean) {
  const color = STATUS_COLOR[status]
  const W = selected ? 38 : 30
  const H = selected ? 50 : 40
  const sw = selected ? 2.5 : 2
  const pulse = PULSING.includes(status)
    ? `<div style="position:absolute;top:-6px;left:-6px;width:calc(100% + 12px);height:calc(100% + 12px);border-radius:50%;background:${color};opacity:0.35;animation:pinPulse 2.2s ease-out infinite;pointer-events:none;"></div>`
    : ''
  const heart = fav ? `<div style="position:absolute;top:-6px;right:-6px;font-size:11px;z-index:2;">❤️</div>` : ''
  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="sh${status}${selected?'s':''}"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity="0.22"/></filter></defs>
    <path d="M15 2C9.477 2 5 6.477 5 12C5 19.5 15 38 15 38C15 38 25 19.5 25 12C25 6.477 20.523 2 15 2Z" fill="${color}" stroke="white" stroke-width="${sw}" filter="url(#sh${status}${selected?'s':''})" stroke-linejoin="round"/>
    <circle cx="15" cy="12" r="7" fill="white" opacity="0.95"/>
    <g transform="translate(9.5 7)">
      <path d="M5.5 10V7.5H7.5V10H9.5V6.5L5.5 3.5L1.5 6.5V10H5.5Z" fill="${color}" stroke="${color}" stroke-width="0.3" stroke-linejoin="round"/>
      <path d="M1 7L5.5 3.5L10 7" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <rect x="4" y="7.5" width="3" height="2.5" rx="0.4" fill="white"/>
    </g>
  </svg>`
  return L.divIcon({
    className: '',
    html: `<div class="map-pin-wrap${selected ? ' selected' : ''}" style="width:${W}px;height:${H}px;position:relative;display:flex;align-items:flex-end;justify-content:center;">
      ${pulse}${heart}
      <div style="position:relative;z-index:1;">${svg}</div>
    </div>`,
    iconSize: [W, H],
    iconAnchor: [W / 2, H],
    popupAnchor: [0, -H],
  })
}

function RecenterBtn({ userPos }: { userPos: [number, number] | null }) {
  const map = useMap()
  return (
    <Box position="absolute" bottom="24px" right="14px" zIndex={900} display="flex" flexDirection="column" gap="8px">
      <Box as="button" w="36px" h="36px" bg="white" shadow="md" border="1px solid" borderColor="neutral.100" borderRadius="10px" display="flex" alignItems="center" justifyContent="center" cursor="pointer" _hover={{ bg: 'neutral.50' }}
        onClick={() => map.flyTo([39.5, -98.35], 4, { duration: 1.2 })} title="Center on US"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3" stroke="#6B6660" strokeWidth="1.5" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="#6B6660" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </Box>
      {userPos && (
        <Box as="button" w="36px" h="36px" bg="brand.600" shadow="md" borderRadius="10px" display="flex" alignItems="center" justifyContent="center" cursor="pointer" _hover={{ bg: 'brand.700' }}
          onClick={() => map.flyTo(userPos, 13, { duration: 1.2 })} title="My location"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" stroke="white" strokeWidth="1.5" fill="white" />
            <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5" />
          </svg>
        </Box>
      )}
    </Box>
  )
}

const DEFAULT_FILTERS: MapFilters = {
  status: 'ALL', listingType: 'ALL', propertyType: 'ALL',
  minPrice: null, maxPrice: null, minBeds: null, radiusKm: null, citySearch: '',
}

export function PublicMap() {
  const [properties, setProperties] = useState<PropertyWithCompany[]>([])
  const [selected, setSelected] = useState<PropertyWithCompany | null>(null)
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS)
  const [searchOpen, setSearchOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const detailModal = useDisclosure()
  const filtersDrawer = useDisclosure()
  const comparisonDrawer = useDisclosure()
  const { isFavorite } = useFavorites()
  const { items: compareItems } = useComparison()

  useEffect(() => {
    publicPropertiesApi.list()
      .then((res) => { if (res.success && res.data) setProperties(res.data) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  function locateMe() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude])
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 10000 }
    )
  }

  function handleMarkerClick(prop: PropertyWithCompany) {
    if (selected?.id === prop.id) { setSelected(null); detailModal.onClose() }
    else { setSelected(prop); detailModal.onOpen() }
  }

  const filtered = properties
    .map((p) => ({
      ...p,
      _distance: userPos ? haversineKm(userPos[0], userPos[1], p.latitude, p.longitude) : undefined,
    }))
    .filter((p) => {
      if (filters.status !== 'ALL' && p.status !== filters.status) return false
      if (filters.listingType !== 'ALL' && p.listingType !== filters.listingType) return false
      if (filters.propertyType !== 'ALL' && p.propertyType !== filters.propertyType) return false
      if (filters.minPrice != null && (p.price == null || p.price < filters.minPrice)) return false
      if (filters.maxPrice != null && (p.price == null || p.price > filters.maxPrice)) return false
      if (filters.minBeds != null && (p.bedrooms == null || p.bedrooms < filters.minBeds)) return false
      if (filters.radiusKm != null && userPos) {
        if ((p._distance ?? Infinity) > filters.radiusKm) return false
      }
      if (filters.citySearch.trim()) {
        const q = filters.citySearch.toLowerCase()
        if (!p.title.toLowerCase().includes(q) &&
            !(p.city ?? '').toLowerCase().includes(q) &&
            !(p.neighborhood ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
    .sort((a, b) => (a._distance ?? Infinity) - (b._distance ?? Infinity))

  const counts: Record<PropertyStatus, number> = {
    AVAILABLE:   properties.filter((p) => p.status === 'AVAILABLE').length,
    NEGOTIATING: properties.filter((p) => p.status === 'NEGOTIATING').length,
    SOLD:        properties.filter((p) => p.status === 'SOLD').length,
  }

  const activeFilters = [
    filters.status !== 'ALL', filters.listingType !== 'ALL', filters.propertyType !== 'ALL',
    filters.minPrice != null, filters.maxPrice != null, filters.minBeds != null, filters.radiusKm != null,
  ].filter(Boolean).length

  function clearSearch() { setFilters((f) => ({ ...f, citySearch: '' })); setSearchOpen(false) }

  usePageTitle('Explore Properties — Ulmap')

  return (
    <>
      <Box h="100vh" w="100vw" overflow="hidden" position="relative">
        {loading && (
          <Flex position="fixed" inset={0} bg="whiteAlpha.800" align="center" justify="center" zIndex={1200} backdropFilter="blur(2px)">
            <Flex direction="column" align="center" gap="10px">
              <Spinner size="lg" color="brand.600" thickness="3px" />
              <Text fontSize="13px" color="neutral.500">Loading properties…</Text>
            </Flex>
          </Flex>
        )}

        <MapContainer center={[39.5, -98.35]} zoom={4} style={{ width: '100%', height: '100%' }} zoomControl={false}>
          <TileLayer attribution='&copy; <a href="https://carto.com">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <RecenterBtn userPos={userPos} />

          {userPos && filters.radiusKm && (
            <Circle center={userPos} radius={filters.radiusKm * 1000} color="#2E9B6A" fillColor="#2E9B6A" fillOpacity={0.05} weight={1.5} />
          )}
          {userPos && (
            <Marker position={userPos} icon={L.divIcon({
              className: '',
              html: `<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.5);"></div>`,
              iconSize: [16, 16], iconAnchor: [8, 8],
            })} />
          )}

          {filtered.map((prop) => (
            <Marker
              key={prop.id}
              position={[prop.latitude, prop.longitude]}
              icon={mkIcon(prop.status, selected?.id === prop.id, isFavorite(prop.id))}
              eventHandlers={{ click: () => handleMarkerClick(prop) }}
            >
              <LeafletTooltip direction="top" offset={[0, -8]} opacity={1} className="map-hover-tip">
                <Box px="12px" py="10px" minW="160px" maxW="220px">
                  <Flex align="center" gap="6px" mb="4px">
                    <Box w="7px" h="7px" borderRadius="full" bg={STATUS_COLOR[prop.status]} flexShrink={0} />
                    <Text fontSize="11px" fontWeight="600" color="neutral.500">{STATUS_LABEL[prop.status]}</Text>
                  </Flex>
                  <Text fontSize="13px" fontWeight="700" color="neutral.800" noOfLines={1}>{prop.title}</Text>
                  {prop.city && <Text fontSize="11px" color="neutral.400" mt="2px">{prop.city}{prop.state ? `, ${prop.state}` : ''}</Text>}
                  {prop.price && (
                    <Text fontSize="14px" fontWeight="800" color="brand.700" mt="4px">
                      ${prop.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </Text>
                  )}
                </Box>
              </LeafletTooltip>
            </Marker>
          ))}
        </MapContainer>

        {/* ===== FLOATING TOP BAR ===== */}
        <Box
          position="fixed" top={{ base: '10px', md: '14px' }} left="50%" transform="translateX(-50%)"
          w={{ base: 'calc(100% - 20px)', md: '760px', lg: '920px' }}
          zIndex={1000} bg="white" borderRadius="14px"
          shadow="0 4px 24px rgba(0,0,0,0.13)" border="1px solid" borderColor="neutral.100"
          px={{ base: '12px', md: '16px' }} h="52px"
        >
          <Flex h="100%" align="center" gap={{ base: '8px', md: '12px' }}>
            {/* Logo */}
            <Flex as={Link} to="/" align="center" gap="7px" _hover={{ textDecoration: 'none' }} flexShrink={0}>
              <Box w="28px" h="28px" borderRadius="8px" bg="brand.600" display="flex" alignItems="center" justifyContent="center" shadow="0 2px 8px rgba(45,134,89,0.25)">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.49-2.01-4.5-4.5-4.5zm0 6.1a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2z" fill="white" />
                </svg>
              </Box>
              <Text fontWeight="800" fontSize="17px" color="neutral.800" letterSpacing="-0.4px" display={{ base: 'none', sm: 'block' }}>
                Ul<Text as="span" color="brand.600">map</Text>
              </Text>
            </Flex>

            <Box h="22px" w="1px" bg="neutral.150" flexShrink={0} display={{ base: 'none', sm: 'block' }} />

            {/* Search */}
            <Flex
              align="center" flex={searchOpen ? 1 : undefined} gap="6px"
              bg={searchOpen ? 'neutral.50' : 'transparent'} borderRadius="9px"
              px={searchOpen ? '10px' : '6px'} py={searchOpen ? '4px' : '0'}
              border={searchOpen ? '1px solid' : '1px solid transparent'}
              borderColor={searchOpen ? 'neutral.200' : 'transparent'}
              transition="all 0.18s" cursor={searchOpen ? 'text' : 'pointer'}
              onClick={() => !searchOpen && setSearchOpen(true)}
            >
              <Box flexShrink={0} color={filters.citySearch ? 'brand.600' : 'neutral.400'}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Box>
              {searchOpen ? (
                <Input ref={searchRef} variant="unstyled" placeholder="Search city or property…"
                  value={filters.citySearch} onChange={(e) => setFilters((f) => ({ ...f, citySearch: e.target.value }))}
                  fontSize="13px" color="neutral.800" _placeholder={{ color: 'neutral.400' }}
                  onKeyDown={(e) => e.key === 'Escape' && clearSearch()}
                />
              ) : (
                <Text fontSize="13px" color="neutral.400" display={{ base: 'none', md: 'block' }} whiteSpace="nowrap">Search city…</Text>
              )}
              {(searchOpen || filters.citySearch) && (
                <Box as="button" onClick={(e: React.MouseEvent) => { e.stopPropagation(); clearSearch() }} color="neutral.400" _hover={{ color: 'neutral.600' }} flexShrink={0} cursor="pointer">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </Box>
              )}
            </Flex>

            {/* Status pills */}
            <Flex align="center" gap="4px" display={{ base: 'none', lg: 'flex' }} flexShrink={0}>
              {(Object.keys(STATUS_COLOR) as PropertyStatus[]).map((status) => (
                <Flex key={status} as="button" align="center" gap="5px" px="9px" py="4px" borderRadius="7px"
                  bg={filters.status === status ? STATUS_COLOR[status] + '15' : 'transparent'}
                  border="1px solid" borderColor={filters.status === status ? STATUS_COLOR[status] + '40' : 'transparent'}
                  _hover={{ bg: STATUS_COLOR[status] + '12' }}
                  onClick={() => setFilters((f) => ({ ...f, status: f.status === status ? 'ALL' : status }))}
                  cursor="pointer" transition="all 0.12s"
                >
                  <Box w="8px" h="8px" borderRadius="full" bg={STATUS_COLOR[status]} flexShrink={0} />
                  <Text fontSize="11px" fontWeight="500" color="neutral.700" whiteSpace="nowrap">{STATUS_LABEL[status]}</Text>
                  <Text fontSize="11px" fontWeight="700" color={STATUS_COLOR[status]} bg={STATUS_COLOR[status] + '18'} px="5px" borderRadius="4px">
                    {counts[status]}
                  </Text>
                </Flex>
              ))}
            </Flex>

            <Box flex={searchOpen ? undefined : 1} />

            {/* Result count */}
            {(filters.status !== 'ALL' || filters.citySearch || activeFilters > 0) && (
              <Text fontSize="12px" color="neutral.400" whiteSpace="nowrap" display={{ base: 'none', md: 'block' }} flexShrink={0}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </Text>
            )}

            {/* Near Me */}
            <IconButton
              aria-label="Near me" size="sm" h="34px" px="10px" variant="ghost" borderRadius="9px"
              isLoading={locating}
              onClick={locateMe}
              title={userPos ? 'Location active' : 'Use my location'}
              color={userPos ? 'brand.600' : 'neutral.500'}
              icon={
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
              flexShrink={0}
            />

            {/* Filters */}
            <IconButton
              aria-label="Filters" size="sm" h="34px" px="10px" borderRadius="9px"
              variant={activeFilters > 0 ? 'solid' : 'ghost'}
              colorScheme={activeFilters > 0 ? 'green' : 'gray'}
              onClick={filtersDrawer.onOpen} flexShrink={0}
              icon={
                <Flex align="center" gap="4px">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {activeFilters > 0 && <Text fontSize="10px" fontWeight="700">{activeFilters}</Text>}
                </Flex>
              }
            />

            {/* Compare */}
            {compareItems.length > 0 && (
              <Button size="sm" h="34px" px="12px" variant="outline" fontSize="12px" borderRadius="9px" onClick={comparisonDrawer.onOpen} flexShrink={0}>
                ⚖️ {compareItems.length}
              </Button>
            )}

            {/* Sign In */}
            <Button as={Link} to="/login" size="sm" h="34px" px="16px" bg="brand.600" color="white" _hover={{ bg: 'brand.700' }} fontSize="13px" fontWeight="600" borderRadius="9px" flexShrink={0}>
              Sign In
            </Button>
          </Flex>
        </Box>

        {/* Mobile status pills */}
        <Flex
          position="fixed" top="72px" left="50%" transform="translateX(-50%)"
          w="calc(100% - 20px)" zIndex={900} align="center" gap="6px"
          display={{ base: 'flex', lg: 'none' }} overflowX="auto" pb="2px"
        >
          {(Object.keys(STATUS_COLOR) as PropertyStatus[]).map((status) => (
            <Flex key={status} as="button" align="center" gap="5px" px="10px" py="5px" borderRadius="8px"
              bg={filters.status === status ? 'white' : 'whiteAlpha.800'}
              shadow={filters.status === status ? 'sm' : 'none'}
              border="1px solid" borderColor={filters.status === status ? STATUS_COLOR[status] + '50' : 'whiteAlpha.600'}
              onClick={() => setFilters((f) => ({ ...f, status: f.status === status ? 'ALL' : status }))}
              cursor="pointer" flexShrink={0}
            >
              <Box w="8px" h="8px" borderRadius="full" bg={STATUS_COLOR[status]} />
              <Text fontSize="11px" fontWeight="500" color="neutral.700">{STATUS_LABEL[status]}</Text>
              <Text fontSize="11px" fontWeight="700" color={STATUS_COLOR[status]}>{counts[status]}</Text>
            </Flex>
          ))}
        </Flex>

        <PropertyDetailModal property={selected} isOpen={detailModal.isOpen} onClose={detailModal.onClose} readOnly />
        <MapFiltersPanel filters={filters} onChange={setFilters} isOpen={filtersDrawer.isOpen} onClose={filtersDrawer.onClose} totalResults={filtered.length} />
        <ComparisonDrawer isOpen={comparisonDrawer.isOpen} onClose={comparisonDrawer.onClose} />
      </Box>
    </>
  )
}
