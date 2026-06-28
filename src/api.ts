const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export interface ApiUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  isActive?: boolean
  reservations?: ApiReservation[]
}

export interface ApiHotel {
  id: number
  name: string
  city: string
  stars: number
  status: string
  rooms?: ApiRoom[]
}

export interface ApiRoom {
  id: number
  type: string
  pricePerNight: number
  available: boolean
  hotel: ApiHotel | { id: number; name: string; city: string; stars: number; status: string }
}

export interface CreateReservationDto {
  userId: number
  roomId: number
  arrivalDate: string
  departureDate: string
  adults?: number
  children?: number
}

export interface ApiReservation {
  id: number
  arrivalDate: string
  departureDate: string
  totalAmount: number
  status: string
  user: ApiUser
  room: ApiRoom
}

interface RequestOptions extends RequestInit {
  token?: string | null
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message = payload?.message
    throw new Error(Array.isArray(message) ? message.join(' ') : message || 'Erreur API')
  }

  return response.json() as Promise<T>
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ accessToken: string; user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  // Users
  users: (token: string) => request<ApiUser[]>('/users', { token }),
  user: (token: string, id: number | string) => request<ApiUser>(`/users/${id}`, { token }),
  updateUser: (token: string, id: number | string, data: Partial<ApiUser>) =>
    request<ApiUser>(`/users/${id}`, { method: 'PATCH', token, body: JSON.stringify(data) }),
  deleteUser: (token: string, id: number | string) =>
    request<void>(`/users/${id}`, { method: 'DELETE', token }),

  // Hotels
  hotels: () => request<ApiHotel[]>('/hotels'),
  hotel: (id: number | string) => request<ApiHotel>(`/hotels/${id}`),
  createHotel: (token: string, data: Partial<ApiHotel>) =>
    request<ApiHotel>('/hotels', { method: 'POST', token, body: JSON.stringify(data) }),
  updateHotel: (token: string, id: number | string, data: Partial<ApiHotel>) =>
    request<ApiHotel>(`/hotels/${id}`, { method: 'PATCH', token, body: JSON.stringify(data) }),
  deleteHotel: (token: string, id: number | string) =>
    request<void>(`/hotels/${id}`, { method: 'DELETE', token }),

  // Rooms
  rooms: () => request<ApiRoom[]>('/rooms'),
  room: (id: number | string) => request<ApiRoom>(`/rooms/${id}`),
  createRoom: (token: string, data: any) =>
    request<ApiRoom>('/rooms', { method: 'POST', token, body: JSON.stringify(data) }),
  updateRoom: (token: string, id: number | string, data: any) =>
    request<ApiRoom>(`/rooms/${id}`, { method: 'PATCH', token, body: JSON.stringify(data) }),
  deleteRoom: (token: string, id: number | string) =>
    request<void>(`/rooms/${id}`, { method: 'DELETE', token }),

  // Reservations
  reservations: (token: string) => request<ApiReservation[]>('/reservations', { token }),
  reservation: (token: string, id: number | string) =>
    request<ApiReservation>(`/reservations/${id}`, { token }),
  userReservations: (userId: string | number, token: string) =>
    request<ApiReservation[]>(`/reservations/user/${userId}`, { token }),
  createReservation: (
    token: string,
    payload: CreateReservationDto,
  ) =>
    request<ApiReservation>('/reservations', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),
  updateReservation: (token: string, id: number | string, data: any) =>
    request<ApiReservation>(`/reservations/${id}`, { method: 'PATCH', token, body: JSON.stringify(data) }),
  deleteReservation: (token: string, id: number | string) =>
    request<void>(`/reservations/${id}`, { method: 'DELETE', token }),
}
