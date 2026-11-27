import apiClient from './apiClient';

const bookingService = {
  getBookings: async (params = {}) => (await apiClient.get('/bookings', { params })).data,
  getMyBookings: async () => (await apiClient.get('/bookings/my')).data,
  getBookingById: async (id) => (await apiClient.get(`/bookings/${id}`)).data,

  reserve: async (payload) => (await apiClient.post('/bookings/reserve', payload)).data,
  updateBooking: async (id, payload) => (await apiClient.put(`/bookings/${id}`, payload)).data,

  confirmDeposit: async (id, deposit) =>
    (await apiClient.patch(`/bookings/${id}/confirm-deposit`, { Deposit: deposit })).data,
  checkIn: async (id, body = {}) => (await apiClient.post(`/bookings/${id}/check-in`, body)).data,
  cancelBooking: async (id) => (await apiClient.patch(`/bookings/${id}/cancel`)).data,

  updateRoomGuests: async (id, detailId, guests) =>
    (await apiClient.put(`/bookings/${id}/rooms/${detailId}/guests`, { Guests: guests })).data,

  createOnline: async (payload) => (await apiClient.post('/bookings/online', payload)).data,
};

export default bookingService;