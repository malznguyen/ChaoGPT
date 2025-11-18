// API Configuration for our third-party provider
export const API_CONFIG = {
  baseURL: 'https://v98store.com',
  apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
  model: 'gpt-3.5-turbo', // or whatever model you're using
}
