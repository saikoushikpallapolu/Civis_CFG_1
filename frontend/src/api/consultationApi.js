import api from "./axiosInstance";

export const consultationApi = {
  // AI Question Suggester
  generateQuestions: async (formData) => {
    const res = await api.post("/consultations/generate-questions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  // Consultation CRUD
  createConsultation: async (data) => {
    const res = await api.post("/consultations", data);
    return res.data;
  },

  getAllConsultations: async (params = {}) => {
    const res = await api.get("/consultations", { params });
    return res.data;
  },

  getConsultationById: async (id) => {
    const res = await api.get(`/consultations/${id}`);
    return res.data;
  },

  updateConsultation: async (id, data) => {
    const res = await api.patch(`/consultations/${id}`, data);
    return res.data;
  },

  deleteConsultation: async (id) => {
    const res = await api.delete(`/consultations/${id}`);
    return res.data;
  },

  translateConsultation: async (id, targetLang) => {
    const res = await api.post(`/consultations/${id}/translate`, { targetLang });
    return res.data;
  },

  translateDraft: async (data) => {
    const res = await api.post("/consultations/translate-draft", data);
    return res.data;
  },
};
