import api from './api';

const ACTIVOS_ENDPOINT = '/activos';

export const activosService = {
  // Obtener todos los activos No
  getAll: async (params = {}) => {
    const response = await api.get(ACTIVOS_ENDPOINT, { params });
    return response.data;
  },

  // Obtener un activo por ID
  getById: async (id) => {
    const response = await api.get(`${ACTIVOS_ENDPOINT}/${id}`);
    return response.data.data; // Extraer el objeto del wrapper
  },

  // Crear un nuevo activo
  create: async (data) => {
    const response = await api.post(ACTIVOS_ENDPOINT, data);
    return response.data;
  },

  // Actualizar un activo
  update: async (id, data) => {
    const response = await api.put(`${ACTIVOS_ENDPOINT}/${id}`, data);
    return response.data;
  },

  // Eliminar un activo
  delete: async (id) => {
    const response = await api.delete(`${ACTIVOS_ENDPOINT}/${id}`);
    return response.data;
  },

  // Buscar activos
  search: async (query) => {
    const response = await api.get(`${ACTIVOS_ENDPOINT}/search`, {
      params: { q: query }
    });
    return response.data;
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    const response = await api.get(`${ACTIVOS_ENDPOINT}/estadisticas`);
    return response.data;
  }
};
