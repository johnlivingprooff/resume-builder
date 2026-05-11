import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function generateResume(formData) {
  const res = await axios.post(`${API_URL}/generate-resume`, formData, {
    responseType: 'blob',
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
