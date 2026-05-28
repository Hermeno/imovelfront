import {
  Box,
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Switch,
  Divider,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Badge,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar, NAVBAR_HEIGHT } from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box
      bg="white"
      borderRadius="12px"
      border="1px solid"
      borderColor="neutral.100"
      overflow="hidden"
      mb="16px"
    >
      <Box px="20px" py="14px" borderBottom="1px solid" borderColor="neutral.100">
        <Text fontWeight="600" fontSize="14px" color="neutral.700">
          {title}
        </Text>
      </Box>
      <Box px="20px" py="16px">
        {children}
      </Box>
    </Box>
  )
}

function Row({
  label,
  description,
  action,
}: {
  label: string
  description?: string
  action: React.ReactNode
}) {
  return (
    <Flex align="center" justify="space-between" py="10px">
      <Box flex={1} mr="16px">
        <Text fontSize="14px" fontWeight="500" color="neutral.800">{label}</Text>
        {description && (
          <Text fontSize="12px" color="neutral.400" mt="2px">{description}</Text>
        )}
      </Box>
      {action}
    </Flex>
  )
}

export function Settings() {
  const { company, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen: isPassOpen, onOpen: openPass, onClose: closePass } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: openDelete, onClose: closeDelete } = useDisclosure()

  const [notifEmail, setNotifEmail] = useState(true)
  const [notifStatus, setNotifStatus] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  async function handleChangePassword() {
    if (newPass !== confirmPass) {
      toast({ title: 'Passwords do not match', status: 'error', duration: 3000 })
      return
    }
    if (newPass.length < 6) {
      toast({ title: 'Minimum 6 characters', status: 'error', duration: 3000 })
      return
    }
    setPassLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setPassLoading(false)
    closePass()
    setCurrentPass('')
    setNewPass('')
    setConfirmPass('')
    toast({ title: 'Password updated', status: 'success', duration: 3000 })
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <Box minH="100vh" bg="#F8F7F4">
      <Navbar />
      <Box pt={NAVBAR_HEIGHT} px={{ base: '16px', md: '32px' }} py="28px" maxW="640px" mx="auto">
        <Text fontSize="22px" fontWeight="800" color="neutral.800" letterSpacing="-0.4px" mb="4px">
          Settings
        </Text>
        <Text fontSize="14px" color="neutral.400" mb="28px">
          Manage your account and preferences
        </Text>

        {/* Account */}
        <Section title="Account">
          <VStack align="stretch" spacing="0" divider={<Divider borderColor="neutral.50" />}>
            <Row
              label="Email"
              description={company?.email}
              action={<Badge colorScheme="green" fontSize="11px">Verified</Badge>}
            />
            <Row
              label="Password"
              description="Last update unknown"
              action={
                <Button size="xs" variant="outline" onClick={openPass} fontSize="12px">
                  Change
                </Button>
              }
            />
            <Row
              label="Active session"
              description="Token valid for 7 days"
              action={
                <Button size="xs" variant="ghost" color="rose.500" onClick={handleLogout} fontSize="12px">
                  Sign out
                </Button>
              }
            />
          </VStack>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <VStack align="stretch" spacing="0" divider={<Divider borderColor="neutral.50" />}>
            <Row
              label="Email notifications"
              description="Receive weekly property summary"
              action={
                <Switch
                  isChecked={notifEmail}
                  onChange={() => setNotifEmail(!notifEmail)}
                  colorScheme="green"
                  size="sm"
                />
              }
            />
            <Row
              label="Status alerts"
              description="Notify when a property status changes"
              action={
                <Switch
                  isChecked={notifStatus}
                  onChange={() => setNotifStatus(!notifStatus)}
                  colorScheme="green"
                  size="sm"
                />
              }
            />
          </VStack>
        </Section>

        {/* Map preferences */}
        <Section title="Map">
          <VStack align="stretch" spacing="0" divider={<Divider borderColor="neutral.50" />}>
            <Row
              label="Map style"
              description="CartoDB Light (default)"
              action={
                <Badge fontSize="11px" colorScheme="gray">Light</Badge>
              }
            />
            <Row
              label="Marker clustering"
              description="Group nearby markers together"
              action={
                <Switch colorScheme="green" size="sm" defaultChecked />
              }
            />
          </VStack>
        </Section>

        {/* Danger zone */}
        <Box
          bg="white"
          borderRadius="12px"
          border="1px solid"
          borderColor="red.100"
          overflow="hidden"
          mb="16px"
        >
          <Box px="20px" py="14px" borderBottom="1px solid" borderColor="red.100" bg="red.50">
            <Text fontWeight="600" fontSize="14px" color="rose.500">
              Danger Zone
            </Text>
          </Box>
          <Box px="20px" py="16px">
            <Row
              label="Delete account"
              description="Permanently deletes your company and all its data"
              action={
                <Button size="xs" colorScheme="red" variant="outline" onClick={openDelete} fontSize="12px">
                  Delete
                </Button>
              }
            />
          </Box>
        </Box>
      </Box>

      {/* Change password modal */}
      <Modal isOpen={isPassOpen} onClose={closePass} size="sm">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="14px" shadow="2xl" mx="16px">
          <ModalHeader fontSize="16px" fontWeight="700">Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="14px" align="stretch">
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Current password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    fontSize="14px"
                  />
                  <InputRightElement>
                    <Box as="button" type="button" onClick={() => setShowPass(!showPass)} cursor="pointer">
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#928D83" strokeWidth="1.3" />
                        <circle cx="8" cy="8" r="2" stroke="#928D83" strokeWidth="1.3" />
                      </svg>
                    </Box>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">New password</FormLabel>
                <Input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Minimum 6 characters"
                  fontSize="14px"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Confirm new password</FormLabel>
                <Input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Repeat password"
                  fontSize="14px"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap="10px">
            <Button variant="ghost" onClick={closePass} fontSize="14px">Cancel</Button>
            <Button onClick={handleChangePassword} isLoading={passLoading} fontSize="14px">
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete account modal */}
      <Modal isOpen={isDeleteOpen} onClose={closeDelete} size="sm">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="14px" shadow="2xl" mx="16px">
          <ModalHeader fontSize="16px" fontWeight="700" color="rose.500">Delete account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="14px" color="neutral.600" mb="16px">
              This action is irreversible. Type <b>{company?.name}</b> to confirm.
            </Text>
            <Input
              placeholder={company?.name}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              fontSize="14px"
            />
          </ModalBody>
          <ModalFooter gap="10px">
            <Button variant="ghost" onClick={closeDelete} fontSize="14px">Cancel</Button>
            <Button
              colorScheme="red"
              isDisabled={deleteConfirm !== company?.name}
              fontSize="14px"
              onClick={() => {
                logout()
                navigate('/')
              }}
            >
              Delete account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
