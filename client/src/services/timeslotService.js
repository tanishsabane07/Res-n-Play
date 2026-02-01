import api from './api';

export const timeslotService = {
  // Get available time slots for a court on a specific date
  getAvailableSlots: async (courtId, date) => {
    try {
      const response = await api.get(`/timeslots/court/${courtId}/available?date=${date}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch available time slots' 
      };
    }
  },

  // Generate time slots for a court (Owner only)
  generateSlots: async (courtId, startDate, endDate, slotDuration = 60) => {
    try {
      const payload = {
        startDate,
        endDate,
        slotDuration
      };
      
      console.log('Generating slots for court:', courtId);
      console.log('Payload being sent:', payload);
      console.log('API endpoint:', `/timeslots/court/${courtId}/generate`);
      
      const response = await api.post(`/timeslots/court/${courtId}/generate`, payload);
      
      console.log('Full API response:', response);
      console.log('Response data:', response.data);
      console.log('Generated slots count:', response.data?.generatedSlots || response.data?.data?.generatedSlots);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error generating slots:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to generate time slots' 
      };
    }
  },

  // Get all time slots for a court (with booking status)
  getCourtSlots: async (courtId, startDate, endDate) => {
    try {
      const response = await api.get(`/timeslots/court/${courtId}/manage?startDate=${startDate}&endDate=${endDate}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch time slots' 
      };
    }
  },

  // Delete available time slots (Owner only)
  deleteSlots: async (courtId, startDate, endDate) => {
    try {
      const response = await api.delete(`/timeslots/court/${courtId}/bulk-delete?startDate=${startDate}&endDate=${endDate}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete time slots' 
      };
    }
  },

  // Update time slot availability
  updateSlotAvailability: async (slotId, isAvailable) => {
    try {
      const response = await api.patch(`/timeslots/${slotId}`, { isAvailable });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update time slot' 
      };
    }
  }
};