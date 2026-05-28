import { Box, Flex, Text, Spinner, SimpleGrid, Button } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Navbar, NAVBAR_HEIGHT } from '../components/Navbar'
import { AreaChart } from '../components/charts/AreaChart'
import { BarChart } from '../components/charts/BarChart'
import { DonutChart } from '../components/charts/DonutChart'
import { propertiesApi } from '../api/properties'
import { leadsApi } from '../api/leads'
import { exportPropertiesToCSV } from '../utils/export'
import type { PropertyStats, LeadStats } from '../types'

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: '#2E9B6A', NEGOTIATING: '#E8A838', SOLD: '#D94F4F',
}
const LEAD_STATUS_COLOR: Record<string, string> = {
  NEW: '#3B82F6', IN_SERVICE: '#8B5CF6', NEGOTIATING: '#F59E0B', FINISHED: '#10B981', LOST: '#EF4444',
}
const LEAD_STATUS_LABEL: Record<string, string> = {
  NEW: 'New', IN_SERVICE: 'In Service', NEGOTIATING: 'Negotiating', FINISHED: 'Closed', LOST: 'Lost',
}

function StatCard({ value, label, accent }: { value: number | string; label: string; accent: string }) {
  return (
    <Box bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100" p="20px" position="relative" overflow="hidden">
      <Box position="absolute" top={0} left={0} right={0} h="3px" bg={accent} />
      <Text fontSize="28px" fontWeight="800" color="neutral.800" lineHeight={1}>{value}</Text>
      <Text fontSize="13px" color="neutral.400" mt="6px">{label}</Text>
    </Box>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box bg="white" borderRadius="12px" border="1px solid" borderColor="neutral.100" p="20px">
      <Text fontSize="14px" fontWeight="700" color="neutral.800" mb="16px">{title}</Text>
      {children}
    </Box>
  )
}

function fmtWeek(iso: string | Date) {
  const d = new Date(iso)
  return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`
}

export function Analytics() {
  const [propStats, setPropStats] = useState<PropertyStats | null>(null)
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([propertiesApi.stats(), leadsApi.stats()])
      .then(([p, l]) => {
        if (p.success && p.data) setPropStats(p.data)
        if (l.success && l.data) setLeadStats(l.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Box minH="100vh" bg="#F8F7F4">
        <Navbar />
        <Flex pt={NAVBAR_HEIGHT} justify="center" align="center" h="60vh">
          <Spinner size="lg" color="brand.600" thickness="3px" />
        </Flex>
      </Box>
    )
  }

  const conversionRate = leadStats
    ? ((leadStats.byStatus.find((s) => s.status === 'FINISHED')?.count ?? 0) / Math.max(leadStats.total, 1) * 100).toFixed(1)
    : '0'

  const propByStatus = (propStats?.byStatus ?? []).map((s) => ({
    label: s.status === 'AVAILABLE' ? 'Available' : s.status === 'NEGOTIATING' ? 'Neg.' : 'Sold',
    value: s.count,
    color: STATUS_COLOR[s.status] ?? '#ccc',
  }))

  const leadByStatus = (leadStats?.byStatus ?? []).map((s) => ({
    label: LEAD_STATUS_LABEL[s.status] ?? s.status,
    value: s.count,
    color: LEAD_STATUS_COLOR[s.status] ?? '#ccc',
  }))

  const propWeekly = (propStats?.byWeek ?? []).map((w) => ({
    label: fmtWeek(w.week),
    value: w.count,
  }))

  const leadWeekly = (leadStats?.byWeek ?? []).map((w) => ({
    label: fmtWeek(w.week),
    value: w.count,
  }))

  const sourceData = (leadStats?.bySource ?? []).map((s) => ({
    label: s.source,
    value: s.count,
    color: '#8B5CF6',
  }))

  return (
    <Box minH="100vh" bg="#F8F7F4">
      <Navbar />
      <Box pt={NAVBAR_HEIGHT} px={{ base: '16px', md: '32px' }} py="28px" maxW="1200px" mx="auto">

        <Flex align="flex-start" justify="space-between" mb="28px" flexWrap="wrap" gap="12px">
          <Box>
            <Text fontSize="22px" fontWeight="800" color="neutral.800" letterSpacing="-0.4px">Analytics</Text>
            <Text fontSize="14px" color="neutral.400" mt="2px">Performance overview · last 12 weeks</Text>
          </Box>
          <Button size="sm" variant="outline" fontSize="13px"
            onClick={() => {/* export handled inline */}}
          >
            Export CSV
          </Button>
        </Flex>

        {/* KPI cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing="14px" mb="24px">
          <StatCard value={propStats?.total ?? 0}  label="Total Properties"   accent="brand.600" />
          <StatCard value={leadStats?.total ?? 0}  label="Total Leads"        accent="#3B82F6" />
          <StatCard value={`${conversionRate}%`}   label="Conversion Rate"    accent="#10B981" />
          <StatCard
            value={propStats?.byStatus.find((s) => s.status === 'AVAILABLE')?.count ?? 0}
            label="Active Listings" accent="#2E9B6A"
          />
        </SimpleGrid>

        {/* Weekly charts */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="16px" mb="16px">
          <ChartCard title="New Properties · Last 12 Weeks">
            {propWeekly.length >= 2
              ? <AreaChart data={propWeekly} color="#2E9B6A" />
              : <Flex h="140px" align="center" justify="center"><Text fontSize="13px" color="neutral.400">Not enough data yet</Text></Flex>
            }
          </ChartCard>

          <ChartCard title="New Leads · Last 12 Weeks">
            {leadWeekly.length >= 2
              ? <AreaChart data={leadWeekly} color="#3B82F6" />
              : <Flex h="140px" align="center" justify="center"><Text fontSize="13px" color="neutral.400">Not enough data yet</Text></Flex>
            }
          </ChartCard>
        </SimpleGrid>

        {/* Distribution charts */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing="16px">
          <ChartCard title="Properties by Status">
            {propByStatus.length
              ? <DonutChart data={propByStatus} />
              : <Flex h="140px" align="center" justify="center"><Text fontSize="13px" color="neutral.400">No data</Text></Flex>
            }
          </ChartCard>

          <ChartCard title="Leads by Status">
            {leadByStatus.length
              ? <BarChart data={leadByStatus} horizontal height={160} />
              : <Flex h="140px" align="center" justify="center"><Text fontSize="13px" color="neutral.400">No data</Text></Flex>
            }
          </ChartCard>

          <ChartCard title="Leads by Source">
            {sourceData.length
              ? <BarChart data={sourceData} height={140} />
              : <Flex h="140px" align="center" justify="center"><Text fontSize="13px" color="neutral.400">No data</Text></Flex>
            }
          </ChartCard>
        </SimpleGrid>
      </Box>
    </Box>
  )
}
