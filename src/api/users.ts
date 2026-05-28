import { client } from './client'
import type { ApiResponse, PaginatedUsers, User } from '../types'

export const usersApi = {
  list: async (limit = 10, offset = 0): Promise<ApiResponse<PaginatedUsers>> => {
    const res = await client.get(`/users?limit=${limit}&offset=${offset}`)
    return res.data
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const res = await client.get(`/users/${id}`)
    return res.data
  },

  create: async (data: {
    name: string
    email: string
    phone?: string
    role?: string
  }): Promise<ApiResponse<User>> => {
    const res = await client.post('/users', data)
    return res.data
  },

  update: async (
    id: string,
    data: Partial<{ name: string; phone: string; role: string }>
  ): Promise<ApiResponse<User>> => {
    const res = await client.patch(`/users/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await client.delete(`/users/${id}`)
    return res.data
  },
}
