import axios from 'axios'
import type { ApiResponse } from '../types'

const PUBLIC_BASE = 'http://localhost:3000/api'

export interface AlertInput {
  email: string
  name: string
  latitude: number
  longitude: number
  radiusKm?: number
  maxPrice?: number
  minBeds?: number
  propertyType?: string
  listingType?: string
}

export const alertsApi = {
  create: async (data: AlertInput): Promise<ApiResponse<{ id: string; email: string }>> => {
    const res = await axios.post(`${PUBLIC_BASE}/public/alerts`, data)
    return res.data
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`${PUBLIC_BASE}/public/alerts/${id}`)
    return res.data
  },
}
