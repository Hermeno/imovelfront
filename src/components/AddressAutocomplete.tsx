import { Box, Input, Text, Flex, Spinner } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'

interface GeoResult {
  display_name: string
  lat: string
  lon: string
  address: {
    road?: string
    house_number?: string
    neighbourhood?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    state?: string
    postcode?: string
    country_code?: string
  }
}

interface FilledAddress {
  displayName: string
  latitude: number
  longitude: number
  street: string
  addressNumber: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
}

interface Props {
  onSelect: (addr: FilledAddress) => void
  placeholder?: string
}

export function AddressAutocomplete({ onSelect, placeholder = 'Search address…' }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout>>()
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function search(q: string) {
    clearTimeout(debounce.current)
    setQuery(q)
    if (q.length < 3) { setResults([]); setOpen(false); return }
    debounce.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q)}&countrycodes=us,br,pt,ca,gb`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data: GeoResult[] = await res.json()
        setResults(data)
        setOpen(data.length > 0)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }, 400)
  }

  function pick(r: GeoResult) {
    const a = r.address
    onSelect({
      displayName: r.display_name,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      street: a.road ?? '',
      addressNumber: a.house_number ?? '',
      neighborhood: a.neighbourhood ?? a.suburb ?? '',
      city: a.city ?? a.town ?? a.village ?? '',
      state: a.state ?? '',
      postalCode: a.postcode ?? '',
    })
    setQuery(r.display_name.split(',').slice(0, 2).join(','))
    setOpen(false)
  }

  return (
    <Box ref={wrapRef} position="relative">
      <Flex align="center">
        <Input
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder={placeholder}
          fontSize="14px"
          onFocus={() => results.length > 0 && setOpen(true)}
          pr="36px"
        />
        {loading && (
          <Box position="absolute" right="10px" top="50%" transform="translateY(-50%)">
            <Spinner size="xs" color="brand.500" />
          </Box>
        )}
      </Flex>
      {open && (
        <Box
          position="absolute" top="calc(100% + 4px)" left={0} right={0}
          bg="white" borderRadius="10px" border="1px solid" borderColor="neutral.100"
          shadow="lg" zIndex={2000} overflow="hidden"
        >
          {results.map((r, i) => (
            <Box
              key={i} px="14px" py="10px" cursor="pointer"
              _hover={{ bg: 'neutral.50' }} borderBottom="1px solid" borderColor="neutral.50"
              onClick={() => pick(r)}
            >
              <Text fontSize="13px" color="neutral.800" noOfLines={1}>{r.display_name.split(',').slice(0, 3).join(',')}</Text>
              <Text fontSize="11px" color="neutral.400" noOfLines={1}>{r.display_name.split(',').slice(3).join(',').trim()}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
