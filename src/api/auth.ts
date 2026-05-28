import { client } from './client'
import type { ApiResponse, Company, LoginResponse } from '../types'

export const authApi = {
  register: async (data: {
    name: string
    email: string
    password: string
    phone?: string
  }): Promise<ApiResponse<Company>> => {
    const res = await client.post('/auth/register', data)
    return res.data
  },

  login: async (data: {
    email: string
    password: string
  }): Promise<ApiResponse<LoginResponse>> => {
    const res = await client.post('/auth/login', data)
    return res.data
  },

  health: async (): Promise<ApiResponse<null>> => {
    const res = await client.get('/health')
    return res.data
  },
}
