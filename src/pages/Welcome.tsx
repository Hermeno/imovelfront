import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  Badge,
} from '@chakra-ui/react'

import { Link } from 'react-router-dom'

function LogoMark() {
  return (
    <Flex align="center" gap="10px">
      <Box
        w="40px"
        h="40px"
        borderRadius="12px"
        bg="brand.600"
        display="flex"
        alignItems="center"
        justifyContent="center"
        shadow="0 4px 12px rgba(45,134,89,0.3)"
      >
        <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.49-2.01-4.5-4.5-4.5zm0 6.1a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2z"
            fill="white"
          />
        </svg>
      </Box>
      <Text fontWeight="800" fontSize="24px" color="neutral.800" letterSpacing="-0.5px">
        Ul<Text as="span" color="brand.600">map</Text>
      </Text>
    </Flex>
  )
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <Box
      px="20px"
      py="14px"
      bg="white"
      borderRadius="12px"
      border="1px solid"
      borderColor="neutral.100"
      textAlign="center"
      shadow="sm"
    >
      <Text fontWeight="800" fontSize="22px" color="brand.700">{value}</Text>
      <Text fontSize="12px" color="neutral.400" mt="2px">{label}</Text>
    </Box>
  )
}

export function Welcome() {
  return (
    <Box minH="100vh" bg="#F8F7F4">
      {/* Top bar */}
      <Flex
        as="header"
        align="center"
        justify="space-between"
        px={{ base: '20px', md: '48px' }}
        py="18px"
        bg="white"
        borderBottom="1px solid"
        borderColor="neutral.100"
      >
        <LogoMark />
        <HStack spacing="10px">
          <Button
            as={Link}
            to="/login"
            variant="ghost"
            fontSize="14px"
            color="neutral.600"
          >
            Sign In
          </Button>
          <Button
            as={Link}
            to="/register"
            fontSize="14px"
            bg="brand.600"
            color="white"
            _hover={{ bg: 'brand.700' }}
          >
            Get started free
          </Button>
        </HStack>
      </Flex>

      {/* Hero */}
      <Flex
        direction="column"
        align="center"
        pt={{ base: '60px', md: '90px' }}
        pb="80px"
        px="24px"
        textAlign="center"
      >
        <Badge
          bg="brand.50"
          color="brand.700"
          border="1px solid"
          borderColor="brand.100"
          px="14px"
          py="5px"
          borderRadius="full"
          fontSize="12px"
          fontWeight="600"
          mb="28px"
        >
          Real Estate Management Platform
        </Badge>

        <Text
          fontSize={{ base: '36px', md: '58px' }}
          fontWeight="800"
          color="neutral.800"
          lineHeight="1.1"
          letterSpacing="-1.5px"
          maxW="700px"
          mb="20px"
        >
          Find your{' '}
          <Text as="span" color="brand.600">
            ideal property
          </Text>{' '}
          on the map
        </Text>

        <Text
          fontSize={{ base: '16px', md: '18px' }}
          color="neutral.500"
          maxW="500px"
          lineHeight="1.65"
          mb="40px"
        >
          Explore apartments and houses directly on the map. Check availability,
          contact agencies, and schedule visits — hassle-free.
        </Text>

        <HStack spacing="12px" flexWrap="wrap" justify="center">
          <Button
            as={Link}
            to="/mapa"
            size="lg"
            bg="brand.600"
            color="white"
            _hover={{ bg: 'brand.700' }}
            fontSize="15px"
            px="32px"
            h="48px"
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.49-2.01-4.5-4.5-4.5zm0 6.1a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2z" fill="white" />
              </svg>
            }
          >
            Explore Properties
          </Button>
          <Button
            as={Link}
            to="/register"
            size="lg"
            variant="outline"
            fontSize="15px"
            px="32px"
            h="48px"
          >
            I'm an Agency →
          </Button>
        </HStack>

        {/* Stats row */}
        <HStack
          spacing="12px"
          mt="60px"
          flexWrap="wrap"
          justify="center"
        >
          <StatPill value="100%" label="Map-focused" />
          <StatPill value="3" label="Property statuses" />
          <StatPill value="1" label="Team per company" />
          <StatPill value="24/7" label="Available" />
        </HStack>
      </Flex>

      {/* Feature section */}
      <Box
        bg="white"
        borderTop="1px solid"
        borderColor="neutral.100"
        py="64px"
        px={{ base: '24px', md: '48px' }}
      >
        <Text
          textAlign="center"
          fontSize={{ base: '26px', md: '36px' }}
          fontWeight="800"
          color="neutral.800"
          letterSpacing="-0.8px"
          mb="48px"
        >
          Everything you need in one place
        </Text>

        <Flex
          gap="20px"
          justify="center"
          flexWrap="wrap"
          maxW="900px"
          mx="auto"
        >
          {[
            {
              icon: '🗺️',
              title: 'Interactive Map',
              desc: 'Visualize all your properties on a real-time map with color-coded status markers.',
            },
            {
              icon: '👥',
              title: 'Team Management',
              desc: 'Add agents to your company and manage access permissions easily.',
            },
            {
              icon: '📞',
              title: 'Direct Contact',
              desc: 'Each property has a phone and WhatsApp for quick client communication.',
            },
            {
              icon: '📊',
              title: 'Dashboard',
              desc: 'Track your company metrics, properties, and team all in one place.',
            },
          ].map((f) => (
            <Box
              key={f.title}
              w={{ base: '100%', sm: '280px' }}
              p="24px"
              bg="#F8F7F4"
              borderRadius="14px"
              border="1px solid"
              borderColor="neutral.100"
            >
              <Text fontSize="28px" mb="12px">{f.icon}</Text>
              <Text fontWeight="700" fontSize="16px" color="neutral.800" mb="6px">
                {f.title}
              </Text>
              <Text fontSize="14px" color="neutral.500" lineHeight="1.6">
                {f.desc}
              </Text>
            </Box>
          ))}
        </Flex>
      </Box>

      {/* CTA bottom */}
      <Flex
        direction="column"
        align="center"
        py="64px"
        px="24px"
        textAlign="center"
      >
        <Text
          fontSize={{ base: '24px', md: '34px' }}
          fontWeight="800"
          color="neutral.800"
          letterSpacing="-0.6px"
          mb="16px"
        >
          Ready to get started?
        </Text>
        <Text fontSize="16px" color="neutral.500" mb="32px">
          Browse properties for free or register your agency to sell on the map.
        </Text>
        <HStack spacing="12px">
          <Button
            as={Link}
            to="/mapa"
            size="lg"
            bg="brand.600"
            color="white"
            _hover={{ bg: 'brand.700' }}
            px="40px"
            h="50px"
            fontSize="15px"
          >
            Explore Properties
          </Button>
          <Button
            as={Link}
            to="/register"
            size="lg"
            variant="outline"
            px="32px"
            h="50px"
            fontSize="15px"
          >
            I'm an Agency
          </Button>
        </HStack>
      </Flex>

      {/* Footer */}
      <Box
        borderTop="1px solid"
        borderColor="neutral.100"
        py="24px"
        px="48px"
        bg="white"
      >
        <Flex justify="space-between" align="center" flexWrap="wrap" gap="10px">
          <LogoMark />
          <Text fontSize="13px" color="neutral.400">
            © {new Date().getFullYear()} Ulmap · All rights reserved
          </Text>
        </Flex>
      </Box>
    </Box>
  )
}
