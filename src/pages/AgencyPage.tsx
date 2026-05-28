import {
  Box, Flex, Text, Avatar, Badge, Spinner, Button, SimpleGrid, Image,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { agencyApi } from '../api/properties'
import type { Agency, Property } from '../types'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: '#1a7a4a', NEGOTIATING: '#92600a', SOLD: '#9b1c1c',
}

function PropertyCard({ p }: { p: Property }) {
  const img = p.imageUrls?.[0]
  return (
    <Box
      as={Link} to={`/property/${p.id}`}
      bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100"
      overflow="hidden" shadow="sm" _hover={{ shadow: 'md', textDecoration: 'none' }}
      transition="box-shadow 0.15s"
    >
      <Box h="160px" bg="brand.50" overflow="hidden">
        {img ? (
          <Image src={img} alt={p.title} w="100%" h="100%" objectFit="cover" />
        ) : (
          <Flex h="100%" align="center" justify="center">
            <Text fontSize="36px">🏠</Text>
          </Flex>
        )}
      </Box>
      <Box p="14px">
        <Flex align="center" gap="6px" mb="6px">
          <Box
            px="8px" py="2px" borderRadius="4px" fontSize="10px" fontWeight="700"
            bg={STATUS_COLOR[p.status] + '18'} color={STATUS_COLOR[p.status]}
          >
            {p.status}
          </Box>
          {p.listingType && (
            <Badge colorScheme="gray" fontSize="9px">{p.listingType === 'rent' ? 'Rent' : 'Sale'}</Badge>
          )}
        </Flex>
        <Text fontWeight="700" fontSize="14px" color="neutral.800" noOfLines={1} mb="4px">{p.title}</Text>
        {p.city && (
          <Text fontSize="12px" color="neutral.400" noOfLines={1} mb="8px">
            {[p.neighborhood, p.city, p.state].filter(Boolean).join(', ')}
          </Text>
        )}
        {p.price && (
          <Text fontWeight="800" fontSize="15px" color="brand.700">{fmt(p.price)}</Text>
        )}
        <Flex gap="10px" mt="8px">
          {p.bedrooms != null && p.bedrooms > 0 && (
            <Text fontSize="11px" color="neutral.400">🛏 {p.bedrooms}</Text>
          )}
          {p.bathrooms != null && p.bathrooms > 0 && (
            <Text fontSize="11px" color="neutral.400">🚿 {p.bathrooms}</Text>
          )}
        </Flex>
      </Box>
    </Box>
  )
}

export function AgencyPage() {
  const { id } = useParams<{ id: string }>()
  const [agency, setAgency] = useState<Agency | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    agencyApi.get(id)
      .then((res) => { if (res.success && res.data) setAgency(res.data) })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center">
        <Spinner size="lg" color="brand.600" thickness="3px" />
      </Flex>
    )
  }

  if (!agency) {
    return (
      <Flex h="100vh" direction="column" align="center" justify="center" gap="16px">
        <Text fontSize="48px">🏢</Text>
        <Text fontSize="20px" fontWeight="700" color="neutral.800">Agency not found</Text>
        <Button as={Link} to="/mapa">Back to map</Button>
      </Flex>
    )
  }

  return (
    <Box minH="100vh" bg="#F8F7F4">
      {/* Nav */}
      <Flex
        align="center" px={{ base: '16px', md: '32px' }} py="14px"
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
      </Flex>

      {/* Hero */}
      {agency.brandImageUrl ? (
        <Box h={{ base: '160px', md: '240px' }} overflow="hidden">
          <Image src={agency.brandImageUrl} w="100%" h="100%" objectFit="cover" />
        </Box>
      ) : (
        <Box h={{ base: '80px', md: '120px' }} bg="brand.600" />
      )}

      <Box maxW="960px" mx="auto" px={{ base: '16px', md: '32px' }} pb="48px">
        {/* Agency header */}
        <Flex align="flex-end" gap="16px" mt="-32px" mb="32px">
          <Box
            w="80px" h="80px" borderRadius="16px" border="3px solid white"
            bg="white" shadow="md" overflow="hidden" flexShrink={0}
          >
            {agency.logoUrl ? (
              <Image src={agency.logoUrl} w="100%" h="100%" objectFit="contain" />
            ) : (
              <Flex w="100%" h="100%" align="center" justify="center" bg="brand.50">
                <Avatar name={agency.name} size="lg" bg="brand.600" color="white" />
              </Flex>
            )}
          </Box>
          <Box pb="4px">
            <Text fontWeight="800" fontSize={{ base: '20px', md: '26px' }} color="neutral.800" letterSpacing="-0.5px">
              {agency.name}
            </Text>
            {(agency.headquartersCity || agency.headquartersState) && (
              <Text fontSize="14px" color="neutral.400">
                {[agency.headquartersCity, agency.headquartersState].filter(Boolean).join(', ')}
              </Text>
            )}
          </Box>
        </Flex>

        {/* Stats row */}
        <Flex gap="16px" mb="32px" flexWrap="wrap">
          {[
            { label: 'Properties', value: agency._count.properties },
            { label: 'Active listings', value: agency.properties.length },
            { label: 'Agents', value: agency._count.users },
          ].map(({ label, value }) => (
            <Box
              key={label} bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100"
              px="20px" py="14px" minW="120px"
            >
              <Text fontSize="24px" fontWeight="800" color="brand.700">{value}</Text>
              <Text fontSize="12px" color="neutral.400">{label}</Text>
            </Box>
          ))}
          {agency.phone && (
            <Box bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100" px="20px" py="14px">
              <Text fontSize="13px" fontWeight="600" color="neutral.700">📞 {agency.phone}</Text>
            </Box>
          )}
          {agency.whatsapp && (
            <Box
              bg="#25D366" borderRadius="12px" px="20px" py="14px" cursor="pointer"
              onClick={() => window.open(`https://wa.me/${agency.whatsapp!.replace(/\D/g, '')}`, '_blank')}
            >
              <Text fontSize="13px" fontWeight="600" color="white">💬 WhatsApp</Text>
            </Box>
          )}
        </Flex>

        {/* Listings */}
        <Text fontWeight="700" fontSize="18px" color="neutral.800" mb="16px">
          Active Listings ({agency.properties.length})
        </Text>
        {agency.properties.length === 0 ? (
          <Flex direction="column" align="center" py="48px" gap="12px">
            <Text fontSize="40px">🏠</Text>
            <Text fontSize="15px" color="neutral.400">No active listings at the moment</Text>
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="16px">
            {agency.properties.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  )
}
