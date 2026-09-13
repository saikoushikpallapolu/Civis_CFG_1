import api from "./axiosInstance";

export const analyticsApi = {
  getAnalytics: async (consultationId) => {
    const res = await api.get(`/consultations/${consultationId}/analytics`);
    return res.data;
  },

  regenerateAnalytics: async (consultationId) => {
    const res = await api.post(`/consultations/${consultationId}/analytics/regenerate`);
    return res.data;
  },
};
