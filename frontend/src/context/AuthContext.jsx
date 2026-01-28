import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.data.user)
    } catch (error) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data
        localStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
        return { success: true }
      } else {
        return {
          success: false,
          message: response.data.message || 'Login failed'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed. Please check your connection.'
      }
    }
  }

  const register = async (name, email, password, role) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role
      })
      const { token, user } = response.data.data
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('token')
      if (api.defaults.headers.common['Authorization']) {
        delete api.defaults.headers.common['Authorization']
      }
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Force clear even if there's an error
      localStorage.clear()
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
