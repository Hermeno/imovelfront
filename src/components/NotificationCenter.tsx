import {
  Box, Flex, Text, IconButton, Popover, PopoverTrigger, PopoverContent,
  PopoverHeader, PopoverBody, Button, Badge,
} from '@chakra-ui/react'
import { useNotifications } from '../contexts/NotificationContext'
import type { Notification } from '../types'

const TYPE_ICON: Record<Notification['type'], string> = {
  NEW_LEAD: '📋',
  STATUS_CHANGE: '🔄',
  NEW_PROPERTY: '🏠',
}

export function NotificationCenter() {
  const { notifications, unreadCount, markRead, markAllRead, clear } = useNotifications()

  return (
    <Popover placement="bottom-end" closeOnBlur>
      <PopoverTrigger>
        <Box position="relative">
          <IconButton
            aria-label="Notifications" size="sm" variant="ghost"
            borderRadius="8px"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#6B6660" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          {unreadCount > 0 && (
            <Box
              position="absolute" top="-2px" right="-2px"
              bg="rose.500" color="white"
              borderRadius="full" minW="16px" h="16px"
              display="flex" alignItems="center" justifyContent="center"
              fontSize="9px" fontWeight="700" px="3px"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Box>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent w="320px" shadow="xl" border="1px solid" borderColor="neutral.100" borderRadius="12px">
        <PopoverHeader borderBottom="1px solid" borderColor="neutral.100" px="16px" py="12px">
          <Flex align="center" justify="space-between">
            <Flex align="center" gap="8px">
              <Text fontWeight="700" fontSize="14px" color="neutral.800">Notifications</Text>
              {unreadCount > 0 && (
                <Badge colorScheme="green" fontSize="10px">{unreadCount} new</Badge>
              )}
            </Flex>
            <Flex gap="8px">
              {unreadCount > 0 && (
                <Button size="xs" variant="ghost" fontSize="11px" onClick={markAllRead}>Mark all read</Button>
              )}
              {notifications.length > 0 && (
                <Button size="xs" variant="ghost" fontSize="11px" color="neutral.400" onClick={clear}>Clear</Button>
              )}
            </Flex>
          </Flex>
        </PopoverHeader>
        <PopoverBody p={0} maxH="360px" overflowY="auto">
          {notifications.length === 0 ? (
            <Flex direction="column" align="center" py="32px" gap="8px">
              <Text fontSize="28px">🔔</Text>
              <Text fontSize="13px" color="neutral.400">No notifications yet</Text>
            </Flex>
          ) : (
            notifications.map((n) => (
              <Box
                key={n.id}
                px="16px" py="12px"
                borderBottom="1px solid" borderColor="neutral.50"
                bg={n.read ? 'transparent' : 'brand.50'}
                cursor="pointer"
                _hover={{ bg: 'neutral.50' }}
                onClick={() => markRead(n.id)}
              >
                <Flex align="flex-start" gap="10px">
                  <Text fontSize="18px" mt="1px">{TYPE_ICON[n.type]}</Text>
                  <Box flex={1} minW={0}>
                    <Flex align="center" justify="space-between" mb="2px">
                      <Text fontSize="13px" fontWeight={n.read ? '400' : '600'} color="neutral.800" noOfLines={1}>
                        {n.title}
                      </Text>
                      {!n.read && (
                        <Box w="6px" h="6px" borderRadius="full" bg="brand.500" flexShrink={0} ml="6px" />
                      )}
                    </Flex>
                    <Text fontSize="12px" color="neutral.500" noOfLines={2}>{n.body}</Text>
                    <Text fontSize="11px" color="neutral.300" mt="3px">
                      {new Date(n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            ))
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
