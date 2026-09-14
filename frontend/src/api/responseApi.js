import api from "./axiosInstance";

export const responseApi = {
  submitResponse: async (consultationId, answers) => {
    const res = await api.post(`/consultations/${consultationId}/responses`, {
      answers,
    });
    return res.data;
  },

  getResponses: async (consultationId, params = {}) => {
    const res = await api.get(`/consultations/${consultationId}/responses`, {
      params,
    });
    return res.data;
  },
};
