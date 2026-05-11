import axios from 'axios'

// In production (Vercel), backend is served at /api on the same domain.
// Locally, fall back to localhost:8000.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8000')

export async function generateResume(formData) {
  const res = await axios.post(`${API_URL}/generate-resume`, formData, {
    responseType: 'blob',
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
