import api from './api';

const MANTENIMIENTOS_ENDPOINT = '/mantenimientos';

export const mantenimientosService = {
  // Obtener todos los mantenimientos
  getAll: async (params = {}) => {
    const response = await api.get(MANTENIMIENTOS_ENDPOINT, { params });
    return response.data;
  },

  // Obtener un mantenimiento por ID
  getById: async (id) => {
    const response = await api.get(`${MANTENIMIENTOS_ENDPOINT}/${id}`);
    return response.data.data; // Extraer el objeto del wrapper
  },

  // Obtener mantenimientos por activo
  getByActivo: async (activoId) => {
    const response = await api.get(`${MANTENIMIENTOS_ENDPOINT}/activo/${activoId}`);
    return response.data.data; // Extraer el array del wrapper
  },

  // Crear un nuevo mantenimiento
  create: async (data) => {
    const response = await api.post(MANTENIMIENTOS_ENDPOINT, data);
    return response.data;
  },

  // Actualizar un mantenimiento
  update: async (id, data) => {
    const response = await api.put(`${MANTENIMIENTOS_ENDPOINT}/${id}`, data);
    return response.data;
  },

  // Eliminar un mantenimiento
  delete: async (id) => {
    const response = await api.delete(`${MANTENIMIENTOS_ENDPOINT}/${id}`);
    return response.data;
  },

  // Cambiar estado
  cambiarEstado: async (id, estado, usuario = 'Sistema') => {
    const response = await api.patch(`${MANTENIMIENTOS_ENDPOINT}/${id}/estado`, {
      estado,
      usuario
    });
    return response.data;
  },

  // Agregar nota
  agregarNota: async (id, descripcion, autor) => {
    const response = await api.post(`${MANTENIMIENTOS_ENDPOINT}/${id}/notas`, {
      descripcion,
      autor
    });
    return response.data;
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    const response = await api.get(`${MANTENIMIENTOS_ENDPOINT}/estadisticas`);
    return response.data;
  }
};
