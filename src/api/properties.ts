import axios from 'axios'
import { client } from './client'
import type { ApiResponse, Property, PropertyStatus, PropertyStats, PropertyWithCompany, TourPhoto, PriceHistoryEntry, Agency } from '../types'

const PUBLIC_BASE = 'https://imovelweb.onrender.com/api'

export const agencyApi = {
  get: async (companyId: string): Promise<ApiResponse<Agency>> => {
    const res = await axios.get(`${PUBLIC_BASE}/public/agency/${companyId}`)
    return res.data
  },
}

export const publicPropertiesApi = {
  list: async (): Promise<ApiResponse<PropertyWithCompany[]>> => {
    const res = await axios.get(`${PUBLIC_BASE}/public/properties`)
    return res.data
  },

  getById: async (id: string): Promise<ApiResponse<PropertyWithCompany>> => {
    const res = await axios.get(`${PUBLIC_BASE}/public/properties/${id}`)
    return res.data
  },

  getPriceHistory: async (id: string): Promise<ApiResponse<PriceHistoryEntry[]>> => {
    const res = await axios.get(`${PUBLIC_BASE}/public/properties/${id}/price-history`)
    return res.data
  },

  getChangelog: async (id: string): Promise<ApiResponse<{ id: string; field: string; oldValue: string | null; newValue: string | null; createdAt: string }[]>> => {
    const res = await axios.get(`${PUBLIC_BASE}/public/properties/${id}/changelog`)
    return res.data
  },

  getTourPhotos: async (id: string): Promise<ApiResponse<TourPhoto[]>> => {
    const res = await axios.get(`${PUBLIC_BASE}/public/properties/${id}/tour-photos`)
    return res.data
  },

  trackView: async (id: string, sessionId: string, referrer?: string, device?: string): Promise<void> => {
    await axios.post(`${PUBLIC_BASE}/public/properties/${id}/view`, { sessionId, referrer, device }).catch(() => {})
  },
}

export const propertiesApi = {
  list: async (): Promise<ApiResponse<Property[]>> => {
    const res = await client.get('/properties')
    return res.data
  },

  getById: async (id: string): Promise<ApiResponse<Property>> => {
    const res = await client.get(`/properties/${id}`)
    return res.data
  },

  stats: async (): Promise<ApiResponse<PropertyStats>> => {
    const res = await client.get('/properties/stats')
    return res.data
  },

  create: async (data: {
    title: string
    description?: string
    latitude: number
    longitude: number
    status: PropertyStatus
    propertyType?: string
    listingType?: string
    price?: number
    bedrooms?: number
    bathrooms?: number
    parkingSpots?: number
    street?: string
    addressNumber?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    postalCode?: string
    agentId?: string
    agentName?: string
    contactPhone?: string
    contactWhatsApp?: string
  }): Promise<ApiResponse<Property>> => {
    const res = await client.post('/properties', data)
    return res.data
  },

  update: async (
    id: string,
    data: Partial<{
      title: string
      description: string
      status: PropertyStatus
      propertyType: string
      listingType: string
      price: number
      bedrooms: number
      bathrooms: number
      parkingSpots: number
      street: string
      addressNumber: string
      complement: string
      neighborhood: string
      city: string
      state: string
      postalCode: string
      agentId: string
      agentName: string
      contactPhone: string
      contactWhatsApp: string
    }>
  ): Promise<ApiResponse<Property>> => {
    const res = await client.patch(`/properties/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await client.delete(`/properties/${id}`)
    return res.data
  },

  uploadImages: async (id: string, files: File[]): Promise<ApiResponse<{ images: { id: string; url: string }[] }>> => {
    const form = new FormData()
    files.forEach((f) => form.append('images', f))
    const res = await client.post(`/properties/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  getImages: async (id: string): Promise<ApiResponse<{ id: string; url: string; alt: string | null; order: number }[]>> => {
    const res = await client.get(`/properties/${id}/images`)
    return res.data
  },

  deleteImage: async (propertyId: string, imageId: string): Promise<ApiResponse<null>> => {
    const res = await client.delete(`/properties/${propertyId}/images/${imageId}`)
    return res.data
  },

  reorderImages: async (propertyId: string, imageIds: string[]): Promise<ApiResponse<null>> => {
    const res = await client.put(`/properties/${propertyId}/images/reorder`, { imageIds })
    return res.data
  },

  getPriceHistory: async (id: string): Promise<ApiResponse<PriceHistoryEntry[]>> => {
    const res = await axios.get(`${PUBLIC_BASE}/public/properties/${id}/price-history`)
    return res.data
  },

  getChangelog: async (id: string): Promise<ApiResponse<{ id: string; field: string; oldValue: string | null; newValue: string | null; createdAt: string }[]>> => {
    const res = await axios.get(`${PUBLIC_BASE}/public/properties/${id}/changelog`)
    return res.data
  },

  trackView: async (id: string, sessionId: string, referrer?: string, device?: string): Promise<void> => {
    await axios.post(`${PUBLIC_BASE}/public/properties/${id}/view`, { sessionId, referrer, device }).catch(() => {})
  },

  getTourPhotos: async (id: string): Promise<ApiResponse<TourPhoto[]>> => {
    const res = await axios.get(`${PUBLIC_BASE}/public/properties/${id}/tour-photos`)
    return res.data
  },

  uploadTourPhotos: async (id: string, files: File[], room?: string): Promise<ApiResponse<TourPhoto[]>> => {
    const form = new FormData()
    files.forEach((f) => form.append('photos', f))
    if (room) form.append('room', room)
    const res = await client.post(`/properties/${id}/tour-photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  deleteTourPhoto: async (propertyId: string, photoId: string): Promise<ApiResponse<null>> => {
    const res = await client.delete(`/properties/${propertyId}/tour-photos/${photoId}`)
    return res.data
  },
}
