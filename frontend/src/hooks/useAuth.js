// src/hooks/useAuth.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/client'

const useAuth = create(persist(
  (set) => ({
    token: null,
    user: null,
    login: async (email, password) => {
      const { data } = await api.post('/auth/login', { email, password })
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      set({ token: data.token, user: data.user })
      return data
    },
    logout: () => {
      delete api.defaults.headers.common['Authorization']
      set({ token: null, user: null })
    },
  }),
  {
    name: 'codeeval-auth',
    onRehydrateStorage: () => (state) => {
      if (state?.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
      }
    },
  }
))

export { useAuth }
