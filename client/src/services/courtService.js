import api from './api';

export const courtService = {
  // Create a new court (Owner only)
  createCourt: async (courtData) => {
    try {
      const response = await api.post('/courts', courtData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create court' 
      };
    }
  },

  // Get all courts for an owner
  getOwnerCourts: async () => {
    try {
      const response = await api.get('/courts/owner/my-courts');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch courts' 
      };
    }
  },

  // Get all courts (public)
  getAllCourts: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await api.get(`/courts?${queryString}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch courts' 
      };
    }
  },

  // Get court by ID
  getCourtById: async (courtId) => {
    try {
      const response = await api.get(`/courts/${courtId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch court details' 
      };
    }
  },

  // Update court (Owner only)
  updateCourt: async (courtId, courtData) => {
    try {
      const response = await api.put(`/courts/${courtId}`, courtData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update court' 
      };
    }
  },

  // Delete court (Owner only)
  deleteCourt: async (courtId) => {
    try {
      const response = await api.delete(`/courts/${courtId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete court' 
      };
    }
  },

  // Toggle court status (Owner only)
  toggleCourtStatus: async (courtId) => {
    try {
      const response = await api.patch(`/courts/${courtId}/toggle-status`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to toggle court status' 
      };
    }
  }
};

export default courtService;