import axios from 'axios'
import { API_CONFIG } from '@/config/api'

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const sendMessage = async (message: string) => {
  // Placeholder for API call
  console.log('Sending message:', message)
  // Implement actual API call here
}

export default apiClient
