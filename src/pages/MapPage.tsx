import {
  Box, Flex, Text, Button, Badge, Spinner, useDisclosure, IconButton, Tooltip,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap, Tooltip as LeafletTooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { usePageTitle } from '../utils/usePageTitle'
import { Navbar, NAVBAR_HEIGHT } from '../components/Navbar'
import { AddPropertyModal } from '../components/AddPropertyModal'
import { EditPropertyModal } from '../components/EditPropertyModal'
import { PropertyDetailModal } from '../components/PropertyDetailModal'
import { MapFiltersPanel } from '../components/MapFiltersPanel'
import { propertiesApi } from '../api/properties'
import { useNotifications } from '../contexts/NotificationContext'
import type { Property, PropertyStatus, MapFilters } from '../types'

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

function mkIcon(status: PropertyStatus, selected: boolean) {
  const color = STATUS_COLOR[status]
  const pulse = PULSING.includes(status)
    ? `<div style="position:absolute;top:-6px;left:-6px;width:calc(100% + 12px);height:calc(100% + 12px);border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;background:${color};opacity:0.35;animation:pinPulse 2.2s ease-out infinite;pointer-events:none;"></div>`
    : ''
  const sel = selected

  // Fixed-size SVG pin: 30×40 normal, 38×50 selected
  const W = sel ? 38 : 30
  const H = sel ? 50 : 40
  const sw = sel ? 2.5 : 2   // stroke width

  // All coordinates for a 30×40 viewBox pin (scale up proportionally for selected)
  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="sh${status}${sel?'s':''}">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity="0.22"/>
      </filter>
    </defs>
    <!-- Teardrop body -->
    <path d="M15 2C9.477 2 5 6.477 5 12C5 19.5 15 38 15 38C15 38 25 19.5 25 12C25 6.477 20.523 2 15 2Z"
      fill="${color}" stroke="white" stroke-width="${sw}" filter="url(#sh${status}${sel?'s':''})" stroke-linejoin="round"/>
    <!-- White inner circle -->
    <circle cx="15" cy="12" r="7" fill="white" opacity="0.95"/>
    <!-- House icon (Heroicons home, scaled to ~11x11 centered at 15,12) -->
    <g transform="translate(9.5 7)">
      <path d="M5.5 10V7.5H7.5V10H9.5V6.5L5.5 3.5L1.5 6.5V10H5.5Z" fill="${color}" stroke="${color}" stroke-width="0.3" stroke-linejoin="round"/>
      <path d="M1 7L5.5 3.5L10 7" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <rect x="4" y="7.5" width="3" height="2.5" rx="0.4" fill="white"/>
    </g>
  </svg>`

  return L.divIcon({
    className: '',
    html: `<div class="map-pin-wrap${sel ? ' selected' : ''}" style="width:${W}px;height:${H}px;position:relative;display:flex;align-items:flex-end;justify-content:center;">
      ${pulse}
      <div style="position:relative;z-index:1;">${svg}</div>
    </div>`,
    iconSize: [W, H],
    iconAnchor: [W / 2, H],
    popupAnchor: [0, -H],
  })
}

function ClickMarker({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng) } })
  return null
}

function RecenterBtn({ userPos, onLocate, locating }: { userPos: [number,number]|null; onLocate: () => void; locating: boolean }) {
  const map = useMap()
  return (
    <Box position="absolute" bottom="24px" right="14px" zIndex={900} display="flex" flexDirection="column" gap="8px">
      <Tooltip label="Center on US" placement="left">
        <IconButton aria-label="Center" bg="white" shadow="md" border="1px solid" borderColor="neutral.100" borderRadius="10px" size="md"
          onClick={() => map.flyTo([39.5, -98.35], 4, { duration: 1.2 })}
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="#6B6660" strokeWidth="1.5" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="#6B6660" strokeWidth="1.5" strokeLinecap="round" /></svg>}
        />
      </Tooltip>
      <Tooltip label={userPos ? 'Jump to my location' : 'Use my location'} placement="left">
        <IconButton
          aria-label="My location"
          bg={userPos ? 'brand.600' : 'white'} color={userPos ? 'white' : 'neutral.600'}
          shadow="md" border="1px solid" borderColor={userPos ? 'brand.600' : 'neutral.100'} borderRadius="10px" size="md"
          isLoading={locating} onClick={() => { onLocate(); if (userPos) map.flyTo(userPos, 13, { duration: 1.2 }) }}
          icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" /><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" /></svg>}
        />
      </Tooltip>
    </Box>
  )
}

function LegendBar({ filter, setFilter, counts, total }: { filter: PropertyStatus | 'ALL'; setFilter: (v: PropertyStatus | 'ALL') => void; counts: Record<PropertyStatus, number>; total: number }) {
  return (
    <Flex position="absolute" top="12px" left="50%" transform="translateX(-50%)" zIndex={900} align="center" gap="6px" bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100" shadow="0 2px 12px rgba(0,0,0,0.09)" px="12px" py="8px" flexWrap="wrap" justify="center">
      {(Object.entries(STATUS_COLOR) as [PropertyStatus, string][]).map(([status, color]) => (
        <Flex key={status} as="button" align="center" gap="6px" px="10px" py="5px" borderRadius="8px"
          bg={filter === status ? 'neutral.100' : 'transparent'} _hover={{ bg: 'neutral.50' }}
          onClick={() => setFilter(filter === status ? 'ALL' : status)} cursor="pointer" transition="all 0.15s"
        >
          <Box w="10px" h="10px" borderRadius="full" bg={color} flexShrink={0} boxShadow={status === 'AVAILABLE' ? `0 0 0 3px ${color}30` : undefined} />
          <Text fontSize="12px" fontWeight="500" color="neutral.700">{STATUS_LABEL[status]}</Text>
          <Badge bg={color + '18'} color={color} fontSize="11px" px="6px" py="1px" borderRadius="4px" fontWeight="700" border="1px solid" borderColor={color + '30'}>{counts[status]}</Badge>
        </Flex>
      ))}
      <Box h="18px" w="1px" bg="neutral.200" mx="2px" />
      <Text fontSize="12px" color="neutral.300" fontWeight="500">{total} total</Text>
    </Flex>
  )
}

const DEFAULT_FILTERS: MapFilters = {
  status: 'ALL', listingType: 'ALL', propertyType: 'ALL',
  minPrice: null, maxPrice: null, minBeds: null, radiusKm: null, citySearch: '',
}

export function MapPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selected, setSelected] = useState<Property | null>(null)
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(true)
  const [addCoords, setAddCoords] = useState<{ lat: number; lng: number } | undefined>()
  const [addMode, setAddMode] = useState(false)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const addModal = useDisclosure()
  const detailModal = useDisclosure()
  const editModal = useDisclosure()
  const filtersDrawer = useDisclosure()
  const { add: addNotification } = useNotifications()

  async function fetchProperties() {
    setLoading(true)
    try {
      const res = await propertiesApi.list()
      if (res.success && res.data) setProperties(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchProperties() }, [])

  function locateMe() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserPos([pos.coords.latitude, pos.coords.longitude]); setLocating(false) },
      () => setLocating(false),
      { timeout: 10000 }
    )
  }

  function handleMapClick(lat: number, lng: number) {
    if (addMode) { setAddCoords({ lat, lng }); addModal.onOpen(); setAddMode(false) }
  }

  function handleMarkerClick(prop: Property) {
    if (selected?.id === prop.id) { setSelected(null); detailModal.onClose() }
    else { setSelected(prop); detailModal.onOpen() }
  }

  function handlePropertyCreated(p: Property) {
    setProperties((prev) => [...prev, p])
    setAddCoords(undefined)
    addNotification({ type: 'NEW_PROPERTY', title: 'Property added', body: p.title })
  }

  function handlePropertyUpdated(p: Property) {
    setProperties((prev) => prev.map((x) => x.id === p.id ? p : x))
    setSelected(p)
    editModal.onClose()
  }

  const filtered = properties.filter((p) => {
    if (filters.status !== 'ALL' && p.status !== filters.status) return false
    if (filters.listingType !== 'ALL' && p.listingType !== filters.listingType) return false
    if (filters.propertyType !== 'ALL' && p.propertyType !== filters.propertyType) return false
    if (filters.minPrice != null && (p.price == null || p.price < filters.minPrice)) return false
    if (filters.maxPrice != null && (p.price == null || p.price > filters.maxPrice)) return false
    if (filters.minBeds != null && (p.bedrooms == null || p.bedrooms < filters.minBeds)) return false
    if (filters.radiusKm != null && userPos) {
      if (haversineKm(userPos[0], userPos[1], p.latitude, p.longitude) > filters.radiusKm) return false
    }
    return true
  })

  const counts: Record<PropertyStatus, number> = {
    AVAILABLE:   properties.filter((p) => p.status === 'AVAILABLE').length,
    NEGOTIATING: properties.filter((p) => p.status === 'NEGOTIATING').length,
    SOLD:        properties.filter((p) => p.status === 'SOLD').length,
  }

  const activeFilters = [filters.status !== 'ALL', filters.listingType !== 'ALL', filters.propertyType !== 'ALL', filters.minPrice != null, filters.maxPrice != null, filters.minBeds != null, filters.radiusKm != null].filter(Boolean).length

  usePageTitle('Property Map — Ulmap')

  return (
    <>
      <Box h="100vh" overflow="hidden">
        <Navbar />
        <Box position="fixed" top={NAVBAR_HEIGHT} left={0} right={0} bottom={0} cursor={addMode ? 'crosshair' : 'default'}>
          {loading && (
            <Flex position="absolute" inset={0} bg="whiteAlpha.700" align="center" justify="center" zIndex={800} backdropFilter="blur(2px)">
              <Flex direction="column" align="center" gap="12px">
                <Spinner size="lg" color="brand.600" thickness="3px" />
                <Text fontSize="13px" color="neutral.500">Loading properties…</Text>
              </Flex>
            </Flex>
          )}

          <MapContainer center={[39.5, -98.35]} zoom={4} style={{ width: '100%', height: '100%' }} zoomControl={false}>
            <TileLayer attribution='&copy; <a href="https://carto.com">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <ClickMarker onMapClick={handleMapClick} />
            <RecenterBtn userPos={userPos} onLocate={locateMe} locating={locating} />

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
              <Marker key={prop.id} position={[prop.latitude, prop.longitude]}
                icon={mkIcon(prop.status, selected?.id === prop.id)}
                eventHandlers={{ click: () => handleMarkerClick(prop) }}
              >
                <LeafletTooltip
                  direction="top" offset={[0, -8]} opacity={1}
                  className="map-hover-tip"
                >
                  <Box px="12px" py="10px" minW="160px" maxW="220px">
                    <Flex align="center" gap="6px" mb="4px">
                      <Box w="7px" h="7px" borderRadius="full" bg={STATUS_COLOR[prop.status]} flexShrink={0} />
                      <Text fontSize="11px" fontWeight="600" color="neutral.500">{prop.status}</Text>
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

          <LegendBar filter={filters.status} setFilter={(s) => setFilters((f) => ({ ...f, status: s }))} counts={counts} total={properties.length} />

          {/* Bottom left controls */}
          <Box position="absolute" bottom="24px" left="16px" zIndex={900}>
            <Flex gap="8px" align="center">
              {addMode ? (
                <>
                  <Box bg="brand.600" color="white" px="16px" py="10px" borderRadius="10px" fontSize="13px" fontWeight="600" shadow="lg">
                    📍 Click on the map to place the property
                  </Box>
                  <Button size="sm" variant="ghost" bg="white" shadow="md" fontSize="13px" onClick={() => setAddMode(false)}>Cancel</Button>
                </>
              ) : (
                <>
                  <Button bg="brand.600" color="white" _hover={{ bg: 'brand.700' }} shadow="lg" borderRadius="10px" fontSize="13px" fontWeight="600" onClick={() => setAddMode(true)}
                    leftIcon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
                  >
                    Add Property
                  </Button>
                  <Button variant="ghost" bg="white" shadow="md" borderRadius="10px" fontSize="13px" size="sm"
                    onClick={filtersDrawer.onOpen}
                    leftIcon={<Text fontSize="12px">⚙️</Text>}
                  >
                    Filters {activeFilters > 0 && `(${activeFilters})`}
                  </Button>
                </>
              )}
            </Flex>
          </Box>
        </Box>

        <AddPropertyModal isOpen={addModal.isOpen} onClose={addModal.onClose} coords={addCoords} onCreated={handlePropertyCreated} />
        <PropertyDetailModal
          property={selected} isOpen={detailModal.isOpen} onClose={detailModal.onClose}
          onUpdated={handlePropertyUpdated}
        />
        <EditPropertyModal
          property={editingProperty || selected}
          isOpen={editModal.isOpen} onClose={editModal.onClose}
          onUpdated={handlePropertyUpdated}
        />
        <MapFiltersPanel filters={filters} onChange={setFilters} isOpen={filtersDrawer.isOpen} onClose={filtersDrawer.onClose} totalResults={filtered.length} />
      </Box>
    </>
  )
}
