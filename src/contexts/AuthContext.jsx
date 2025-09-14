import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  // ✅ Check if user is logged in
  const checkAuthStatus = async () => {
    try {
      const res = await api.get('/auth/me', { withCredentials: true })
      setUser(res.data.user)
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Login
  const login = async (email, password) => {
    const res = await api.post(
      '/auth/login',
      { email, password },
      { withCredentials: true }
    )
    setUser(res.data.user)
    return res.data
  }

  // ✅ Register
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData, {
      withCredentials: true,
    })
    setUser(res.data.user)
    return res.data
  }

  // ✅ Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
