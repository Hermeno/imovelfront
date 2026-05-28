import {
  Box,
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
  Link as ChakraLink,
  Progress,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'

function passwordStrength(p: string): { score: number; label: string; color: string } {
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'rose.500', 'amber.500', 'brand.400', 'brand.600']
  return { score, label: labels[score] || '', color: colors[score] || '' }
}

export function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const strength = passwordStrength(form.password)

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name || form.name.length < 2) e.name = 'Minimum 2 characters'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const regRes = await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      })
      if (regRes.success) {
        const loginRes = await authApi.login({ email: form.email, password: form.password })
        if (loginRes.success && loginRes.data) {
          login(loginRes.data.token, loginRes.data.company)
          toast({ title: 'Company registered successfully!', status: 'success', duration: 3000 })
          navigate('/map')
        }
      }
    } catch (err: any) {
      toast({
        title: err?.response?.data?.error?.message || 'Registration error',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="#F8F7F4" display="flex" flexDirection="column">
      {/* Minimal top bar */}
      <Flex
        align="center"
        px={{ base: '20px', md: '48px' }}
        py="18px"
        bg="white"
        borderBottom="1px solid"
        borderColor="neutral.100"
      >
        <Flex as={Link} to="/" align="center" gap="8px" _hover={{ textDecoration: 'none' }}>
          <Box
            w="30px"
            h="30px"
            borderRadius="8px"
            bg="brand.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.49-2.01-4.5-4.5-4.5zm0 6.1a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2z" fill="white" />
            </svg>
          </Box>
          <Text fontWeight="700" fontSize="16px" color="neutral.800">
            Ul<Text as="span" color="brand.600">map</Text>
          </Text>
        </Flex>
      </Flex>

      <Flex flex={1} align="center" justify="center" px="24px" py="40px">
        <Box w="100%" maxW="440px">
          <Flex gap="6px" mb="28px">
            {['brand.600', 'amber.500', 'rose.500'].map((c, i) => (
              <Box key={i} w="8px" h="8px" borderRadius="full" bg={c} />
            ))}
          </Flex>

          <Text fontSize="26px" fontWeight="800" color="neutral.800" letterSpacing="-0.5px" mb="4px">
            Create account
          </Text>
          <Text fontSize="14px" color="neutral.400" mb="32px">
            Register your company on Ulmap
          </Text>

          <Box
            as="form"
            onSubmit={handleSubmit}
            bg="white"
            borderRadius="14px"
            border="1px solid"
            borderColor="neutral.100"
            p="28px"
            shadow="sm"
          >
            <VStack spacing="16px" align="stretch">
              <FormControl isInvalid={!!errors.name}>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600" mb="6px">
                  Company Name *
                </FormLabel>
                <Input
                  placeholder="Acme Realty LLC"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  autoComplete="organization"
                />
                <FormErrorMessage fontSize="12px">{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600" mb="6px">
                  Email *
                </FormLabel>
                <Input
                  type="email"
                  placeholder="admin@company.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  autoComplete="email"
                />
                <FormErrorMessage fontSize="12px">{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600" mb="6px">
                  Phone
                </FormLabel>
                <Input
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  autoComplete="tel"
                />
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600" mb="6px">
                  Password *
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    autoComplete="new-password"
                  />
                  <InputRightElement>
                    <Box
                      as="button"
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      cursor="pointer"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#928D83" strokeWidth="1.3" />
                        <circle cx="8" cy="8" r="2" stroke="#928D83" strokeWidth="1.3" />
                      </svg>
                    </Box>
                  </InputRightElement>
                </InputGroup>
                {form.password && (
                  <Box mt="8px">
                    <Progress
                      value={(strength.score / 4) * 100}
                      size="xs"
                      borderRadius="full"
                      colorScheme={
                        strength.score <= 1 ? 'red' : strength.score === 2 ? 'yellow' : 'green'
                      }
                    />
                    <Text fontSize="11px" color={strength.color} mt="3px">
                      {strength.label}
                    </Text>
                  </Box>
                )}
                <FormErrorMessage fontSize="12px">{errors.password}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                isLoading={loading}
                loadingText="Creating account..."
                w="100%"
                h="44px"
                mt="4px"
                fontSize="14px"
                fontWeight="600"
              >
                Create account
              </Button>
            </VStack>
          </Box>

          <Text fontSize="14px" color="neutral.500" mt="24px" textAlign="center">
            Already have an account?{' '}
            <ChakraLink
              as={Link}
              to="/login"
              color="brand.600"
              fontWeight="600"
              _hover={{ textDecoration: 'underline' }}
            >
              Sign in
            </ChakraLink>
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}
