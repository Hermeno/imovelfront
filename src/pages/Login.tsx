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
} from '@chakra-ui/react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#928D83" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="2" stroke="#928D83" strokeWidth="1.3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 1l14 14M6.5 6.6A2 2 0 0010 9.5M3 3.7C1.8 4.9 1 6.2 1 8c0 0 2.5 5 7 5 1.3 0 2.4-.4 3.3-.9" stroke="#928D83" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M13 13.2C14.2 12 15 10.7 15 8c0 0-2.5-5-7-5-.7 0-1.4.1-2 .3" stroke="#928D83" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  function validate() {
    const e = { email: '', password: '' }
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email'
    if (!password || password.length < 6) e.password = 'Minimum 6 characters'
    setErrors(e)
    return !e.email && !e.password
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      if (res.success && res.data) {
        login(res.data.token, res.data.company)
        navigate('/map')
      }
    } catch (err: any) {
      toast({
        title: err?.response?.data?.error?.message || 'Invalid credentials',
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

      {/* Content */}
      <Flex flex={1} align="center" justify="center" px="24px" py="40px">
        <Box w="100%" maxW="400px">
          <Flex gap="6px" mb="28px" justify="flex-start">
            {['brand.600', 'amber.500', 'rose.500'].map((c, i) => (
              <Box key={i} w="8px" h="8px" borderRadius="full" bg={c} />
            ))}
          </Flex>

          <Text fontSize="26px" fontWeight="800" color="neutral.800" letterSpacing="-0.5px" mb="4px">
            Welcome back
          </Text>
          <Text fontSize="14px" color="neutral.400" mb="32px">
            Sign in to your Ulmap account
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
              <FormControl isInvalid={!!errors.email}>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600" mb="6px">
                  Email
                </FormLabel>
                <Input
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
                  autoComplete="email"
                />
                <FormErrorMessage fontSize="12px">{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600" mb="6px">
                  Password
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                    autoComplete="current-password"
                  />
                  <InputRightElement>
                    <Box
                      as="button"
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      cursor="pointer"
                    >
                      <EyeIcon open={showPass} />
                    </Box>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage fontSize="12px">{errors.password}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                isLoading={loading}
                loadingText="Signing in..."
                w="100%"
                h="44px"
                mt="4px"
                fontSize="14px"
                fontWeight="600"
              >
                Sign In
              </Button>
            </VStack>
          </Box>

          <Text fontSize="14px" color="neutral.500" mt="24px" textAlign="center">
            Don't have an account?{' '}
            <ChakraLink
              as={Link}
              to="/register"
              color="brand.600"
              fontWeight="600"
              _hover={{ textDecoration: 'underline' }}
            >
              Register your company
            </ChakraLink>
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}
