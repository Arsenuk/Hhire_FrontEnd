// services/authService.js
import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/auth'

export const register = async (email, password, name) => {
  const response = await axios.post(`${API_URL}/register`, {
    email,
    password,
    name
  })
  return response.data
}

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password
  })
  return response.data
}
