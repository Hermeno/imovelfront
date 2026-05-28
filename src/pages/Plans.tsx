import {
  Box, Flex, Text, Button, Badge, VStack, useToast,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    period: 'Free forever',
    description: 'Perfect for individual agents exploring the platform.',
    badge: null,
    cta: 'Current plan',
    features: [
      'Up to 5 properties',
      'Basic map view',
      'Lead capture',
      '1 user account',
      'Community support',
    ],
    excluded: ['Analytics dashboard', 'Image upload', 'Agent assignment', 'CSV export'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    period: '/month',
    description: 'For small agencies that need more power.',
    badge: 'Most Popular',
    cta: 'Upgrade to Pro',
    features: [
      'Up to 50 properties',
      'Full image gallery (20/property)',
      'Lead pipeline + Kanban',
      'Analytics & charts',
      'Up to 5 team members',
      'CSV export',
      'Agent assignment',
      'Address geocoding',
      'Email support',
    ],
    excluded: ['White-label', 'Priority support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    period: '/month',
    description: 'For large brokerages that need everything.',
    badge: null,
    cta: 'Contact Sales',
    features: [
      'Unlimited properties',
      'Unlimited team members',
      'Everything in Pro',
      'White-label options',
      'Custom domain',
      'Dedicated account manager',
      'Priority support',
      'Custom integrations',
      'SLA guarantee',
    ],
    excluded: [],
  },
]

export function Plans() {
  const { company } = useAuth()
  const toast = useToast()

  function handleUpgrade(planId: string) {
    if (planId === 'enterprise') {
      window.open('mailto:sales@ulmap.com?subject=Enterprise inquiry', '_blank')
      return
    }
    toast({
      title: 'Billing coming soon',
      description: 'Stripe integration is in progress. We\'ll notify you when it\'s ready.',
      status: 'info',
      duration: 5000,
    })
  }

  return (
    <Box minH="100vh" bg="#F8F7F4">
      {/* Top bar */}
      <Flex
        align="center" justify="space-between"
        px={{ base: '20px', md: '48px' }} py="18px"
        bg="white" borderBottom="1px solid" borderColor="neutral.100"
      >
        <Flex as={Link} to="/map" align="center" gap="8px" _hover={{ textDecoration: 'none' }}>
          <Box w="28px" h="28px" borderRadius="7px" bg="brand.600" display="flex" alignItems="center" justifyContent="center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.49-2.01-4.5-4.5-4.5zm0 6.1a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2z" fill="white" />
            </svg>
          </Box>
          <Text fontWeight="700" fontSize="16px" color="neutral.800">Ul<Text as="span" color="brand.600">map</Text></Text>
        </Flex>
        <Button as={Link} to="/map" size="sm" variant="ghost" fontSize="13px">← Back to app</Button>
      </Flex>

      <Box px={{ base: '16px', md: '32px' }} py="56px" maxW="1100px" mx="auto">
        <Box textAlign="center" mb="56px">
          <Badge bg="brand.50" color="brand.700" border="1px solid" borderColor="brand.100" px="14px" py="5px" borderRadius="full" fontSize="12px" fontWeight="600" mb="20px">
            Pricing
          </Badge>
          <Text fontSize={{ base: '32px', md: '44px' }} fontWeight="800" color="neutral.800" letterSpacing="-1px" mb="16px">
            Simple, transparent pricing
          </Text>
          <Text fontSize="16px" color="neutral.500" maxW="500px" mx="auto" lineHeight="1.7">
            Start free. Scale as you grow. No hidden fees.
          </Text>
        </Box>

        <Flex gap="20px" justify="center" flexWrap="wrap" align="flex-start">
          {PLANS.map((plan) => (
            <Box
              key={plan.id}
              w={{ base: '100%', md: '300px' }}
              bg="white"
              borderRadius="16px"
              border="2px solid"
              borderColor={plan.badge ? 'brand.400' : 'neutral.100'}
              p="28px"
              position="relative"
              shadow={plan.badge ? 'xl' : 'sm'}
            >
              {plan.badge && (
                <Badge
                  position="absolute" top="-12px" left="50%" transform="translateX(-50%)"
                  bg="brand.600" color="white" fontSize="11px" fontWeight="700"
                  px="14px" py="4px" borderRadius="full"
                >
                  {plan.badge}
                </Badge>
              )}

              <Text fontSize="18px" fontWeight="800" color="neutral.800" mb="4px">{plan.name}</Text>
              <Text fontSize="13px" color="neutral.400" mb="16px">{plan.description}</Text>

              <Flex align="baseline" gap="4px" mb="8px">
                <Text fontSize="36px" fontWeight="800" color="neutral.800">${plan.price}</Text>
                {plan.period && <Text fontSize="14px" color="neutral.400">{plan.period}</Text>}
              </Flex>

              <Button
                w="100%" h="42px" fontSize="13px" fontWeight="600" borderRadius="10px" mb="24px"
                bg={plan.badge ? 'brand.600' : 'transparent'}
                color={plan.badge ? 'white' : 'neutral.700'}
                border={plan.badge ? 'none' : '1px solid'}
                borderColor="neutral.200"
                _hover={{ bg: plan.badge ? 'brand.700' : 'neutral.50' }}
                onClick={() => handleUpgrade(plan.id)}
                isDisabled={plan.id === 'starter'}
              >
                {plan.cta}
              </Button>

              <VStack align="stretch" spacing="8px">
                {plan.features.map((f) => (
                  <Flex key={f} align="center" gap="8px">
                    <Box w="16px" h="16px" borderRadius="full" bg="brand.100" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5.5L4 8l4.5-6" stroke="#2E9B6A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Box>
                    <Text fontSize="13px" color="neutral.700">{f}</Text>
                  </Flex>
                ))}
                {plan.excluded.map((f) => (
                  <Flex key={f} align="center" gap="8px" opacity={0.4}>
                    <Box w="16px" h="16px" borderRadius="full" bg="neutral.100" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2l6 6M8 2L2 8" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </Box>
                    <Text fontSize="13px" color="neutral.500" textDecoration="line-through">{f}</Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          ))}
        </Flex>

        <Box textAlign="center" mt="48px">
          <Text fontSize="14px" color="neutral.400">
            All plans include 14-day money-back guarantee · Cancel anytime
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
