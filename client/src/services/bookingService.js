import api from './api';

export const bookingService = {
  // Create a new booking with time slot
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create booking' 
      };
    }
  },

  // Create booking with time slot ID
  createSlotBooking: async (timeSlotId, bookingData) => {
    try {
      const response = await api.post('/bookings/slot', {
        timeSlotId,
        ...bookingData
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create slot booking' 
      };
    }
  },

  // Get user's bookings (Player)
  getUserBookings: async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch bookings' 
      };
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch booking details' 
      };
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel booking' 
      };
    }
  },

  // Confirm payment
  confirmPayment: async (bookingId, paymentData) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/confirm-payment`, paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to confirm payment' 
      };
    }
  },

  // Get court bookings (Owner only)
  getCourtBookings: async (courtId) => {
    try {
      const response = await api.get(`/bookings/court/${courtId}/bookings`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch court bookings' 
      };
    }
  },

  // Mark booking as completed (Owner only)
  completeBooking: async (bookingId) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/complete`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to complete booking' 
      };
    }
  }
};

export default bookingService;