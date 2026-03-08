import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

// Users
export const loginUser = (data) => api.post('/api/users/login', data)
export const getUserRooms = (userId) => api.get(`/api/users/${userId}/rooms`)

// Rooms
export const createRoom = (data) => api.post('/api/rooms/', data)
export const getRoom = (code) => api.get(`/api/rooms/${code}`)
export const getRoomResults = (code) => api.get(`/api/rooms/${code}/results`)
export const closeRoom = (code) => api.post(`/api/rooms/${code}/close`)
export const kickUser = (code, userId) => api.post(`/api/rooms/${code}/kick/${userId}`)
export const getParticipants = (code) => api.get(`/api/rooms/${code}/participants`)

// Votes
export const submitVote = (data) => api.post('/api/votes/', data)
export const joinRoom = (data) => api.post('/api/votes/join', data)
export const exportResults = (code) => `${API_URL}/api/votes/export/${code}`
