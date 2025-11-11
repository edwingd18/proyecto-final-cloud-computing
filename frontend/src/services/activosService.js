import api from "./api";

const ACTIVOS_ENDPOINT = "/activos";

export const activosService = {
  // Obtener todos los activos
  getAll: async (params = {}) => {
    const response = await api.get(`${ACTIVOS_ENDPOINT}/lista`, { params });
    return response.data;
  },

  // Obtener un activo por ID
  getById: async (id) => {
    const response = await api.get(`${ACTIVOS_ENDPOINT}/ver/${id}`);
    return response.data.data;
  },

  // Crear un nuevo activo
  create: async (data) => {
    const response = await api.post(`${ACTIVOS_ENDPOINT}/crear`, data);
    return response.data;
  },

  // Actualizar un activo
  update: async (id, data) => {
    const response = await api.put(
      `${ACTIVOS_ENDPOINT}/actualizar/${id}`,
      data
    );
    return response.data;
  },

  // Eliminar un activo
  delete: async (id) => {
    const response = await api.delete(`${ACTIVOS_ENDPOINT}/eliminar/${id}`);
    return response.data;
  },

  // Buscar activos
  search: async (query) => {
    const response = await api.get(`${ACTIVOS_ENDPOINT}/buscar`, {
      params: { q: query },
    });
    return response.data;
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    const response = await api.get(`${ACTIVOS_ENDPOINT}/stats`);
    return response.data;
  },
};
