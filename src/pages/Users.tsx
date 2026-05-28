import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  Badge,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  useDisclosure,
  useToast,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Navbar, NAVBAR_HEIGHT } from '../components/Navbar'
import { usersApi } from '../api/users'
import type { User } from '../types'

const ROLE_LABEL: Record<string, string> = {
  agent: 'Agent',
  manager: 'Manager',
  admin: 'Admin',
}

interface UserForm {
  name: string
  email: string
  phone: string
  role: string
}

const EMPTY_FORM: UserForm = { name: '', email: '', phone: '', role: 'agent' }

function UserModal({
  isOpen,
  onClose,
  editing,
  onSaved,
}: {
  isOpen: boolean
  onClose: () => void
  editing: User | null
  onSaved: (u: User) => void
}) {
  const [form, setForm] = useState<UserForm>(
    editing
      ? { name: editing.name, email: editing.email, phone: editing.phone || '', role: editing.role }
      : EMPTY_FORM
  )
  const [errors, setErrors] = useState<Partial<UserForm>>({})
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    setForm(
      editing
        ? { name: editing.name, email: editing.email, phone: editing.phone || '', role: editing.role }
        : EMPTY_FORM
    )
    setErrors({})
  }, [editing, isOpen])

  function set(k: keyof UserForm, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: '' }))
  }

  function validate() {
    const e: Partial<UserForm> = {}
    if (!form.name || form.name.length < 2) e.name = 'Minimum 2 characters'
    if (!editing && (!form.email || !/\S+@\S+\.\S+/.test(form.email))) e.email = 'Invalid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setLoading(true)
    try {
      let res
      if (editing) {
        res = await usersApi.update(editing.id, {
          name: form.name,
          phone: form.phone || undefined,
          role: form.role,
        })
      } else {
        res = await usersApi.create({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          role: form.role,
        })
      }
      if (res.success && res.data) {
        onSaved(res.data)
        onClose()
        toast({
          title: editing ? 'Member updated' : 'Member added',
          status: 'success',
          duration: 3000,
        })
      }
    } catch (err: any) {
      toast({
        title: err?.response?.data?.error?.message || 'Error saving member',
        status: 'error',
        duration: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="14px" shadow="2xl" mx="16px">
        <ModalHeader fontSize="16px" fontWeight="700">
          {editing ? 'Edit Member' : 'New Member'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing="14px" align="stretch">
            <FormControl isInvalid={!!errors.name}>
              <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Full Name *</FormLabel>
              <Input placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} />
              <FormErrorMessage fontSize="12px">{errors.name}</FormErrorMessage>
            </FormControl>

            {!editing && (
              <FormControl isInvalid={!!errors.email}>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Email *</FormLabel>
                <Input
                  type="email"
                  placeholder="agent@company.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
                <FormErrorMessage fontSize="12px">{errors.email}</FormErrorMessage>
              </FormControl>
            )}

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Phone</FormLabel>
              <Input placeholder="+1 555 000 0000" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Role</FormLabel>
              <Select value={form.role} onChange={(e) => set('role', e.target.value)} fontSize="14px">
                <option value="agent">Agent</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="ghost" onClick={onClose} fontSize="14px">Cancel</Button>
          <Button onClick={handleSave} isLoading={loading} fontSize="14px">
            {editing ? 'Save' : 'Add Member'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<User | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const LIMIT = 10

  async function load(offset = 0) {
    setLoading(true)
    try {
      const res = await usersApi.list(LIMIT, offset)
      if (res.success && res.data) {
        setUsers(res.data.users)
        setTotal(res.data.total)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page * LIMIT) }, [page])

  function openCreate() {
    setEditing(null)
    onOpen()
  }

  function openEdit(u: User) {
    setEditing(u)
    onOpen()
  }

  function handleSaved(u: User) {
    setUsers((prev) => {
      const idx = prev.findIndex((p) => p.id === u.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = u
        return next
      }
      return [u, ...prev]
    })
    if (!editing) setTotal((t) => t + 1)
  }

  async function handleDelete(u: User) {
    if (!confirm(`Remove ${u.name} from the team?`)) return
    setDeletingId(u.id)
    try {
      await usersApi.delete(u.id)
      setUsers((prev) => prev.filter((p) => p.id !== u.id))
      setTotal((t) => t - 1)
      toast({ title: 'Member removed', status: 'success', duration: 3000 })
    } catch {
      toast({ title: 'Error removing member', status: 'error', duration: 3000 })
    } finally {
      setDeletingId(null)
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <Box minH="100vh" bg="#F8F7F4">
      <Navbar />
      <Box pt={NAVBAR_HEIGHT} px={{ base: '16px', md: '32px' }} py="28px" maxW="1000px" mx="auto">
        <Flex align="center" justify="space-between" mb="24px" flexWrap="wrap" gap="12px">
          <Box>
            <Text fontSize="22px" fontWeight="800" color="neutral.800" letterSpacing="-0.4px">
              Team
            </Text>
            <Text fontSize="14px" color="neutral.400" mt="2px">
              {total} member{total !== 1 ? 's' : ''} in your company
            </Text>
          </Box>
          <Button onClick={openCreate} fontSize="13px" size="sm">
            + Add Member
          </Button>
        </Flex>

        <Box
          bg="white"
          borderRadius="12px"
          border="1px solid"
          borderColor="neutral.100"
          overflow="hidden"
        >
          {loading ? (
            <Flex justify="center" py="48px">
              <Spinner color="brand.600" />
            </Flex>
          ) : users.length === 0 ? (
            <Flex direction="column" align="center" py="56px" gap="10px">
              <Text fontSize="32px">👥</Text>
              <Text fontSize="14px" color="neutral.400">No team members yet</Text>
              <Button size="sm" onClick={openCreate}>Add first member</Button>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr bg="neutral.50">
                    <Th fontSize="11px" color="neutral.400" py="10px">NAME</Th>
                    <Th fontSize="11px" color="neutral.400">EMAIL</Th>
                    <Th fontSize="11px" color="neutral.400">ROLE</Th>
                    <Th fontSize="11px" color="neutral.400">PHONE</Th>
                    <Th fontSize="11px" color="neutral.400">JOINED</Th>
                    <Th fontSize="11px" color="neutral.400"></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((u) => (
                    <Tr key={u.id} _hover={{ bg: 'neutral.50' }}>
                      <Td py="12px">
                        <Flex align="center" gap="10px">
                          <Avatar name={u.name} size="xs" bg="brand.100" color="brand.700" />
                          <Text fontWeight="500" fontSize="13px">{u.name}</Text>
                        </Flex>
                      </Td>
                      <Td>
                        <Text fontSize="13px" color="neutral.600">{u.email}</Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={u.role === 'admin' ? 'purple' : u.role === 'manager' ? 'blue' : 'gray'}
                          fontSize="11px"
                        >
                          {ROLE_LABEL[u.role] || u.role}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="13px" color="neutral.400">{u.phone || '—'}</Text>
                      </Td>
                      <Td>
                        <Text fontSize="12px" color="neutral.400">
                          {new Date(u.createdAt).toLocaleDateString('en-US')}
                        </Text>
                      </Td>
                      <Td>
                        <Flex gap="4px">
                          <Tooltip label="Edit">
                            <IconButton
                              aria-label="Edit"
                              size="xs"
                              variant="ghost"
                              onClick={() => openEdit(u)}
                              icon={
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                  <path d="M9.5 1.5l3 3-8 8H1.5v-3l8-8z" stroke="#928D83" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              }
                            />
                          </Tooltip>
                          <Tooltip label="Remove">
                            <IconButton
                              aria-label="Remove"
                              size="xs"
                              variant="ghost"
                              color="rose.500"
                              isLoading={deletingId === u.id}
                              onClick={() => handleDelete(u)}
                              icon={
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                  <path d="M2 3h10M5 3V2h4v1M6 6v4M8 6v4M3 3l1 9h6l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              }
                            />
                          </Tooltip>
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          {totalPages > 1 && (
            <Flex justify="space-between" align="center" px="20px" py="12px" borderTop="1px solid" borderColor="neutral.100">
              <Text fontSize="13px" color="neutral.400">
                Page {page + 1} of {totalPages}
              </Text>
              <Flex gap="8px">
                <Button size="xs" variant="outline" isDisabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button size="xs" variant="outline" isDisabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </Flex>
            </Flex>
          )}
        </Box>
      </Box>

      <UserModal isOpen={isOpen} onClose={onClose} editing={editing} onSaved={handleSaved} />
    </Box>
  )
}
