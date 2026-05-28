import { client } from './client'
import axios from 'axios'
import type { ApiResponse, Lead, LeadStatus, LeadStats } from '../types'

const PUBLIC_BASE = 'https://imovelweb.onrender.com/api'

interface LeadsPage {
  leads: Lead[]
  total: number
  page: number
  limit: number
}

export const leadsApi = {
  list: async (params?: { status?: LeadStatus; page?: number; limit?: number }): Promise<ApiResponse<LeadsPage>> => {
    const res = await client.get('/leads', { params })
    return res.data
  },

  stats: async (): Promise<ApiResponse<LeadStats>> => {
    const res = await client.get('/leads/stats')
    return res.data
  },

  update: async (
    id: string,
    data: { status?: LeadStatus; viewed?: boolean; agentId?: string; agentName?: string },
  ): Promise<ApiResponse<Lead>> => {
    const res = await client.patch(`/leads/${id}`, data)
    return res.data
  },

  journey: async (id: string): Promise<ApiResponse<{
    totalViews: number
    returnVisits: number
    devices: string[]
    referrers: string[]
    properties: { propertyId: string; title: string; city: string | null; price: number | null; returnVisit: boolean; viewedAt: string }[]
  }>> => {
    const res = await client.get(`/leads/${id}/journey`)
    return res.data
  },

  createPublic: async (data: {
    propertyId: string
    interestedName: string
    email: string
    phone?: string
    whatsapp: string
    message?: string
    source?: string
    sessionId?: string
  }): Promise<ApiResponse<Lead>> => {
    const res = await axios.post(`${PUBLIC_BASE}/leads`, data)
    return res.data
  },
}
