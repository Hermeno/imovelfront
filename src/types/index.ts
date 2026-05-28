export type PropertyStatus = 'AVAILABLE' | 'NEGOTIATING' | 'SOLD'
export type LeadStatus = 'NEW' | 'IN_SERVICE' | 'NEGOTIATING' | 'FINISHED' | 'LOST'
export type ListingType = 'sale' | 'rent'

export interface Company {
  id: string
  name: string
  email: string
  phone: string | null
  whatsapp: string | null
  logoUrl: string | null
  brandImageUrl: string | null
  createdAt: string
  updatedAt?: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  companyId: string
  createdAt: string
  updatedAt: string
}

export interface PropertyImage {
  id: string
  url: string
  alt: string | null
  order: number
}

export interface Property {
  id: string
  title: string
  description: string | null
  latitude: number
  longitude: number
  status: PropertyStatus
  propertyType: string | null
  listingType: string | null
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  parkingSpots: number | null
  street: string | null
  addressNumber: string | null
  buildingName: string | null
  apartmentNumber: string | null
  complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  agentId: string | null
  agentName: string | null
  contactPhone: string | null
  contactWhatsApp: string | null
  companyId: string
  images: string[] | PropertyImage[]
  imageUrls: string[]
  createdAt: string
  updatedAt: string
  // computed: distance from user in km (client-side only)
  _distance?: number
}

export interface PropertyWithCompany extends Property {
  company: {
    id: string
    name: string
    phone: string | null
    whatsapp: string | null
    logoUrl?: string | null
  }
}

export interface TourPhoto {
  id: string
  propertyId: string
  url: string
  room: string | null
  order: number
  createdAt: string
}

export interface PriceHistoryEntry {
  id: string
  price: number
  createdAt: string
}

export interface Agency {
  id: string
  name: string
  phone: string | null
  whatsapp: string | null
  logoUrl: string | null
  brandImageUrl: string | null
  headquartersCity: string | null
  headquartersState: string | null
  headquartersStreet: string | null
  headquartersNumber: string | null
  createdAt: string
  properties: Property[]
  _count: { properties: number; users: number }
}

export interface Lead {
  id: string
  propertyId: string
  propertyTitle: string | null
  interestedName: string
  email: string
  phone: string | null
  whatsapp: string
  source: string
  status: LeadStatus
  viewed: boolean
  message: string | null
  agentId: string | null
  agentName: string | null
  companyId: string
  score?: number
  createdAt: string
  updatedAt: string
  property?: {
    id: string
    title: string
    city: string | null
    state: string | null
    neighborhood: string | null
    price: number | null
  } | null
}

export interface LeadStats {
  total: number
  byStatus: { status: LeadStatus; count: number }[]
  byWeek: { week: string; count: number }[]
  bySource: { source: string; count: number }[]
}

export interface PropertyStats {
  total: number
  byStatus: { status: PropertyStatus; count: number }[]
  byType: { type: string; count: number }[]
  byWeek: { week: string; count: number }[]
}

export interface Notification {
  id: string
  type: 'NEW_LEAD' | 'STATUS_CHANGE' | 'NEW_PROPERTY'
  title: string
  body: string
  read: boolean
  createdAt: string
  link?: string
}

export interface VisitSlot {
  propertyId: string
  date: string
  time: string
  name: string
  email: string
  phone: string
  message?: string
}

export interface PaginatedUsers {
  users: User[]
  total: number
  limit: number
  offset: number
  pages: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: { message: string }
}

export interface LoginResponse {
  token: string
  company: Company
}

export interface AuthState {
  company: Company | null
  token: string | null
  isAuthenticated: boolean
}

export interface MapFilters {
  status: PropertyStatus | 'ALL'
  listingType: ListingType | 'ALL'
  propertyType: string | 'ALL'
  minPrice: number | null
  maxPrice: number | null
  minBeds: number | null
  radiusKm: number | null
  citySearch: string
}
