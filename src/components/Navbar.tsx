import {
  Box, Flex, Text, Button, Avatar, Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  IconButton, useDisclosure, Drawer, DrawerBody, DrawerHeader, DrawerOverlay,
  DrawerContent, DrawerCloseButton, VStack,
} from '@chakra-ui/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { NotificationCenter } from './NotificationCenter'

const NAV_H = '56px'
export const NAVBAR_HEIGHT = NAV_H

function Logo() {
  return (
    <Flex align="center" gap="8px" as={Link} to="/map" _hover={{ textDecoration: 'none' }}>
      <Box w="30px" h="30px" borderRadius="8px" bg="brand.600" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.49-2.01-4.5-4.5-4.5zm0 6.1a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2z" fill="white" />
        </svg>
      </Box>
      <Text fontWeight="700" fontSize="16px" color="neutral.800" letterSpacing="-0.3px">
        Ul<Text as="span" color="brand.600">map</Text>
      </Text>
    </Flex>
  )
}

const links = [
  { to: '/map',       label: 'Map'       },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/leads',     label: 'Leads'     },
  { to: '/analytics', label: 'Analytics' },
  { to: '/users',     label: 'Team'      },
]

export function Navbar() {
  const { company, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()

  function handleLogout() { logout(); navigate('/login') }

  return (
    <>
      <Box position="fixed" top={0} left={0} right={0} h={NAV_H} bg="white" borderBottom="1px solid" borderColor="neutral.100" zIndex={1000} px={{ base: '16px', md: '24px' }}>
        <Flex h="100%" align="center" justify="space-between">
          <Logo />

          <Flex align="center" gap="2px" display={{ base: 'none', md: 'flex' }} ml="32px" flex={1}>
            {links.map((link) => {
              const active = location.pathname === link.to
              return (
                <Box key={link.to} as={Link} to={link.to} px="12px" py="6px" borderRadius="7px" fontSize="14px"
                  fontWeight={active ? '600' : '400'} color={active ? 'brand.700' : 'neutral.500'}
                  bg={active ? 'brand.50' : 'transparent'}
                  _hover={{ bg: 'neutral.50', color: 'neutral.800', textDecoration: 'none' }} transition="all 0.15s"
                >
                  {link.label}
                </Box>
              )
            })}
          </Flex>

          <Flex align="center" gap="8px">
            <Button as={Link} to="/plans" size="sm" variant="ghost" fontSize="12px" color="brand.600" display={{ base: 'none', md: 'flex' }}>
              Upgrade ↑
            </Button>

            <NotificationCenter />

            <Flex align="center" gap="8px" display={{ base: 'none', sm: 'flex' }} px="12px" py="5px" bg="neutral.50" borderRadius="8px" border="1px solid" borderColor="neutral.100">
              <Box w="8px" h="8px" borderRadius="full" bg="brand.500" />
              <Text fontSize="13px" color="neutral.600" fontWeight="500" maxW="140px" noOfLines={1}>{company?.name}</Text>
            </Flex>

            <Menu>
              <MenuButton>
                <Avatar name={company?.name} size="sm" bg="brand.600" color="white" fontSize="12px" fontWeight="700" cursor="pointer" _hover={{ opacity: 0.85 }} />
              </MenuButton>
              <MenuList fontSize="14px" shadow="lg" border="1px solid" borderColor="neutral.100" borderRadius="10px">
                <Box px="14px" py="10px" borderBottom="1px solid" borderColor="neutral.100">
                  <Text fontWeight="600" color="neutral.800">{company?.name}</Text>
                  <Text fontSize="12px" color="neutral.400">{company?.email}</Text>
                </Box>
                <MenuItem as={Link} to="/profile"  _hover={{ bg: 'neutral.50' }}>My Profile</MenuItem>
                <MenuItem as={Link} to="/settings" _hover={{ bg: 'neutral.50' }}>Settings</MenuItem>
                <MenuItem as={Link} to="/plans"    _hover={{ bg: 'neutral.50' }}>Plans & Billing</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout} color="rose.500" _hover={{ bg: 'red.50' }}>Sign Out</MenuItem>
              </MenuList>
            </Menu>

            <IconButton
              aria-label="Menu" display={{ base: 'flex', md: 'none' }} size="sm" variant="ghost"
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 4h14M2 9h14M2 14h14" stroke="#6B6660" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
              onClick={onOpen}
            />
          </Flex>
        </Flex>
      </Box>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid" borderColor="neutral.100"><Logo /></DrawerHeader>
          <DrawerBody pt="16px">
            <VStack align="stretch" spacing="2px">
              {[...links, { to: '/profile', label: 'My Profile' }, { to: '/settings', label: 'Settings' }, { to: '/plans', label: 'Plans & Billing' }].map((link) => {
                const active = location.pathname === link.to
                return (
                  <Box key={link.to} as={Link} to={link.to} px="14px" py="10px" borderRadius="8px" fontSize="15px"
                    fontWeight={active ? '600' : '400'} color={active ? 'brand.700' : 'neutral.600'}
                    bg={active ? 'brand.50' : 'transparent'} _hover={{ bg: 'neutral.50', textDecoration: 'none' }}
                    onClick={onClose}
                  >
                    {link.label}
                  </Box>
                )
              })}
            </VStack>
            <Button mt="24px" w="100%" variant="outline" onClick={handleLogout} color="rose.500">Sign Out</Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
