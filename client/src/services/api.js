import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for friendly error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'An unexpected network error occurred. Please try again.';
    return Promise.reject(new Error(customMessage));
  }
);

// Booking Endpoints
export const getAvailableSlots = async (date) => {
  const response = await api.get(`/available-slots?date=${date}`);
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export default api;
