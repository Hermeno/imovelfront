import {
  Box, Flex, Text, Button, FormControl, FormLabel, Input, VStack, Avatar, Badge, Divider, useToast,
} from '@chakra-ui/react'
import { useState, useRef } from 'react'
import { Navbar, NAVBAR_HEIGHT } from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'

export function Profile() {
  const { company } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(company?.logoUrl ?? null)
  const logoRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: company?.name || '',
    email: company?.email || '',
    phone: company?.phone || '',
    whatsapp: company?.whatsapp || '',
  })

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast({ title: 'Logo must be under 2 MB', status: 'warning', duration: 3000 }); return }
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    toast({ title: 'Profile updated', status: 'success', duration: 3000 })
  }

  return (
    <Box minH="100vh" bg="#F8F7F4">
      <Navbar />
      <Box pt={NAVBAR_HEIGHT} px={{ base: '16px', md: '32px' }} py="28px" maxW="680px" mx="auto">
        <Text fontSize="22px" fontWeight="800" color="neutral.800" letterSpacing="-0.4px" mb="4px">Company Profile</Text>
        <Text fontSize="14px" color="neutral.400" mb="28px">Your organization's public information</Text>

        {/* Logo + avatar */}
        <Box bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100" p="24px" mb="16px">
          <Flex align="center" gap="20px" flexWrap="wrap">
            <Box position="relative">
              {logoPreview ? (
                <Box as="img" src={logoPreview} w="72px" h="72px" borderRadius="12px" objectFit="contain" border="1px solid" borderColor="neutral.100" bg="neutral.50" />
              ) : (
                <Avatar name={company?.name} size="xl" bg="brand.600" color="white" fontSize="24px" fontWeight="700" />
              )}
              <Box
                as="button" position="absolute" bottom="-6px" right="-6px"
                w="24px" h="24px" borderRadius="full" bg="brand.600" border="2px solid white"
                display="flex" alignItems="center" justifyContent="center" cursor="pointer"
                onClick={() => logoRef.current?.click()}
                title="Upload logo"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2v8M2 6h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Box>
              <input ref={logoRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
            </Box>
            <Box>
              <Text fontWeight="700" fontSize="18px" color="neutral.800">{company?.name}</Text>
              <Text fontSize="13px" color="neutral.400" mt="2px">{company?.email}</Text>
              <Badge mt="8px" colorScheme="green" fontSize="11px">Active account</Badge>
            </Box>
            {logoPreview && logoPreview !== company?.logoUrl && (
              <Button size="xs" variant="ghost" color="neutral.400" onClick={() => setLogoPreview(company?.logoUrl ?? null)} ml="auto">
                Reset
              </Button>
            )}
          </Flex>
          <Text fontSize="11px" color="neutral.400" mt="12px">
            Logo appears on map listings and the public property page. Recommended: square image under 2 MB.
          </Text>
        </Box>

        {/* Edit form */}
        <Box bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100" p="24px" mb="16px">
          <Text fontWeight="600" fontSize="15px" color="neutral.800" mb="16px">General information</Text>
          <VStack spacing="14px" align="stretch">
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Company Name</FormLabel>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} fontSize="14px" />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Email</FormLabel>
              <Input value={form.email} isReadOnly bg="neutral.50" color="neutral.400" fontSize="14px" cursor="not-allowed" />
            </FormControl>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap="12px">
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Phone</FormLabel>
                <Input placeholder="+1 555 000 0000" value={form.phone} onChange={(e) => set('phone', e.target.value)} fontSize="14px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">WhatsApp</FormLabel>
                <Input placeholder="+1 555 000 0000" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} fontSize="14px" />
              </FormControl>
            </Box>
          </VStack>
          <Flex justify="flex-end" mt="20px">
            <Button onClick={handleSave} isLoading={loading} fontSize="14px" size="sm">Save changes</Button>
          </Flex>
        </Box>

        {/* Account info */}
        <Box bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100" p="24px">
          <Text fontWeight="600" fontSize="15px" color="neutral.800" mb="16px">Account information</Text>
          <VStack align="stretch" spacing="12px" divider={<Divider borderColor="neutral.100" />}>
            {[
              { label: 'Company ID', value: company?.id?.slice(0, 20) + '...' },
              {
                label: 'Member since',
                value: company?.createdAt
                  ? new Date(company.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
                  : '—',
              },
            ].map((item) => (
              <Flex key={item.label} justify="space-between" align="center">
                <Text fontSize="13px" color="neutral.500">{item.label}</Text>
                <Text fontSize="13px" color="neutral.700" fontWeight="500">{item.value}</Text>
              </Flex>
            ))}
          </VStack>
        </Box>
      </Box>
    </Box>
  )
}
