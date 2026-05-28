import {
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  Box, Flex, Text, Button, Badge, Divider,
} from '@chakra-ui/react'
import { useComparison } from '../contexts/ComparisonContext'

function fmtPrice(n: number | null) {
  if (!n) return '—'
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}K`
  return `R$ ${n}`
}

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: 'green', NEGOTIATING: 'yellow', SOLD: 'red',
}

interface RowProps { label: string; values: (string | number | null | undefined)[] }
function Row({ label, values }: RowProps) {
  return (
    <Flex borderBottom="1px solid" borderColor="neutral.50">
      <Box w="100px" p="10px" flexShrink={0} bg="neutral.50">
        <Text fontSize="11px" fontWeight="600" color="neutral.500">{label}</Text>
      </Box>
      {values.map((v, i) => (
        <Box key={i} flex={1} p="10px" borderLeft="1px solid" borderColor="neutral.100">
          <Text fontSize="13px" color={v ? 'neutral.800' : 'neutral.300'}>{v ?? '—'}</Text>
        </Box>
      ))}
    </Flex>
  )
}

interface Props { isOpen: boolean; onClose: () => void }

export function ComparisonDrawer({ isOpen, onClose }: Props) {
  const { items, remove, clear } = useComparison()

  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent borderTopRadius="16px" maxH="70vh">
        <DrawerCloseButton />
        <DrawerHeader borderBottom="1px solid" borderColor="neutral.100" fontSize="15px" fontWeight="700">
          <Flex align="center" gap="10px">
            Compare Properties
            <Badge colorScheme="green" fontSize="11px">{items.length}/3</Badge>
          </Flex>
        </DrawerHeader>
        <DrawerBody p={0} overflowY="auto">
          {items.length === 0 ? (
            <Flex direction="column" align="center" py="40px" gap="10px">
              <Text fontSize="24px">⚖️</Text>
              <Text fontSize="14px" color="neutral.500">Click "Compare" on any property to add it here</Text>
              <Text fontSize="13px" color="neutral.400">Up to 3 properties at a time</Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              {/* Property headers */}
              <Flex>
                <Box w="100px" flexShrink={0} />
                {items.map((p) => (
                  <Box key={p.id} flex={1} p="12px" borderLeft="1px solid" borderColor="neutral.100">
                    {p.imageUrls?.[0] && (
                      <Box as="img" src={p.imageUrls[0]} w="100%" h="80px" objectFit="cover" borderRadius="8px" mb="8px" />
                    )}
                    <Text fontSize="12px" fontWeight="700" color="neutral.800" noOfLines={2} mb="4px">{p.title}</Text>
                    <Badge colorScheme={STATUS_COLOR[p.status]} fontSize="10px" mb="6px">{p.status}</Badge>
                    <Button size="xs" variant="ghost" color="rose.400" fontSize="11px" onClick={() => remove(p.id)}>
                      Remove
                    </Button>
                  </Box>
                ))}
              </Flex>
              <Divider />
              <Row label="Price"      values={items.map((p) => fmtPrice(p.price))} />
              <Row label="Type"       values={items.map((p) => p.propertyType)} />
              <Row label="Listing"    values={items.map((p) => p.listingType === 'rent' ? 'Rent' : p.listingType === 'sale' ? 'Sale' : null)} />
              <Row label="Bedrooms"   values={items.map((p) => p.bedrooms != null ? `${p.bedrooms} bd` : null)} />
              <Row label="Bathrooms"  values={items.map((p) => p.bathrooms != null ? `${p.bathrooms} ba` : null)} />
              <Row label="Parking"    values={items.map((p) => p.parkingSpots != null ? `${p.parkingSpots}` : null)} />
              <Row label="City"       values={items.map((p) => [p.city, p.state].filter(Boolean).join(', '))} />
              <Row label="Agent"      values={items.map((p) => p.agentName)} />
              <Row label="Listed"     values={items.map((p) => new Date(p.createdAt).toLocaleDateString('en-US'))} />
            </Box>
          )}
        </DrawerBody>
        {items.length > 0 && (
          <Box p="14px" borderTop="1px solid" borderColor="neutral.100">
            <Button size="sm" variant="ghost" onClick={clear} fontSize="13px" color="neutral.400">Clear all</Button>
          </Box>
        )}
      </DrawerContent>
    </Drawer>
  )
}
