import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea, Select, VStack, Button, Text, useToast, Box, Flex,
} from '@chakra-ui/react'
import { useState } from 'react'
import type { Property } from '../types'

interface Props {
  property: Property | null
  isOpen: boolean
  onClose: () => void
}

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

export function VisitScheduleModal({ property, isOpen, onClose }: Props) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: '', message: '' })

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  async function handleSubmit() {
    if (!form.name || !form.email || !form.date || !form.time) {
      toast({ title: 'Please fill in all required fields', status: 'warning', duration: 3000 })
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    onClose()
    setForm({ name: '', email: '', phone: '', date: '', time: '', message: '' })
    toast({
      title: 'Visit scheduled!',
      description: `${form.date} at ${form.time}. We'll send a confirmation to ${form.email}`,
      status: 'success',
      duration: 5000,
    })
  }

  if (!property) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="16px" mx={{ base: '12px', md: '24px' }} my="48px">
        <ModalHeader fontSize="16px" fontWeight="700">Schedule a Visit</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box bg="#F8F7F4" borderRadius="10px" p="12px" mb="16px">
            <Text fontSize="13px" fontWeight="600" color="neutral.700" noOfLines={1}>{property.title}</Text>
            {property.city && (
              <Text fontSize="12px" color="neutral.400">{[property.neighborhood, property.city, property.state].filter(Boolean).join(', ')}</Text>
            )}
          </Box>
          <VStack spacing="14px" align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Your Name</FormLabel>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="John Smith" fontSize="14px" />
            </FormControl>
            <Flex gap="12px">
              <FormControl isRequired flex={1}>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Email</FormLabel>
                <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="john@email.com" fontSize="14px" />
              </FormControl>
              <FormControl flex={1}>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Phone</FormLabel>
                <Input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 0000" fontSize="14px" />
              </FormControl>
            </Flex>
            <Flex gap="12px">
              <FormControl isRequired flex={1}>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Date</FormLabel>
                <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} min={minDateStr} fontSize="14px" />
              </FormControl>
              <FormControl isRequired flex={1}>
                <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Time</FormLabel>
                <Select value={form.time} onChange={(e) => set('time', e.target.value)} fontSize="14px">
                  <option value="">Select time</option>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </FormControl>
            </Flex>
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="500" color="neutral.600">Message (optional)</FormLabel>
              <Textarea value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Any specific questions or requests…" fontSize="14px" rows={3} resize="none" />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter gap="10px">
          <Button variant="ghost" onClick={onClose} fontSize="14px">Cancel</Button>
          <Button onClick={handleSubmit} isLoading={loading} loadingText="Scheduling…" fontSize="14px">
            Confirm Visit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
