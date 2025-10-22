'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Heading,
  VStack,
  useToast,
  Card,
  CardBody,
  SimpleGrid,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { mantenimientosService } from '@/services/mantenimientosService';
import { activosService } from '@/services/activosService';

export default function NuevoMantenimientoPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [activos, setActivos] = useState([]);
  const [formData, setFormData] = useState({
    activoId: '',
    tipo: 'preventivo',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    costo: '',
    tecnico: {
      nombre: '',
      contacto: '',
      especialidad: '',
    },
    estado: 'pendiente',
    prioridad: 'media',
    duracion_estimada: '',
  });

  useEffect(() => {
    const fetchActivos = async () => {
      try {
        const response = await activosService.getAll();
        setActivos(response.data || []);
      } catch (error) {
        console.error('Error al cargar activos:', error);
      }
    };
    fetchActivos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('tecnico.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        tecnico: {
          ...formData.tecnico,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        costo: parseFloat(formData.costo),
        duracion_estimada: formData.duracion_estimada ? parseFloat(formData.duracion_estimada) : undefined,
      };

      await mantenimientosService.create(dataToSend);
      toast({
        title: 'Éxito',
        description: 'Mantenimiento creado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/mantenimientos');
    } catch (error) {
      console.error('Error al crear mantenimiento:', error);

      // Mostrar errores de validación específicos
      let errorMessage = 'No se pudo crear el mantenimiento';

      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map(err => err.msg || err.message).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box maxW="900px" mx="auto">
        <Heading mb={6}>Nuevo Mantenimiento</Heading>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Activo</FormLabel>
                  <Select
                    name="activoId"
                    value={formData.activoId}
                    onChange={handleChange}
                    placeholder="Seleccione un activo"
                  >
                    {activos.map((activo) => (
                      <option key={activo.id} value={activo.id}>
                        {activo.nombre} - {activo.numero_serie}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                    >
                      <option value="preventivo">Preventivo</option>
                      <option value="correctivo">Correctivo</option>
                      <option value="predictivo">Predictivo</option>
                      <option value="emergencia">Emergencia</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Prioridad</FormLabel>
                    <Select
                      name="prioridad"
                      value={formData.prioridad}
                      onChange={handleChange}
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel>Descripción</FormLabel>
                  <Textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción detallada del mantenimiento (mínimo 10 caracteres)"
                    rows={4}
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <Input
                      type="datetime-local"
                      name="fecha_inicio"
                      value={formData.fecha_inicio}
                      onChange={handleChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Fecha de Fin (opcional)</FormLabel>
                    <Input
                      type="datetime-local"
                      name="fecha_fin"
                      value={formData.fecha_fin}
                      onChange={handleChange}
                    />
                  </FormControl>
                </SimpleGrid>

                <Heading size="sm" mt={4}>Información del Técnico</Heading>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Nombre del Técnico</FormLabel>
                    <Input
                      name="tecnico.nombre"
                      value={formData.tecnico.nombre}
                      onChange={handleChange}
                      placeholder="Nombre completo"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Contacto</FormLabel>
                    <Input
                      name="tecnico.contacto"
                      value={formData.tecnico.contacto}
                      onChange={handleChange}
                      placeholder="Teléfono o email"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Especialidad</FormLabel>
                  <Input
                    name="tecnico.especialidad"
                    value={formData.tecnico.especialidad}
                    onChange={handleChange}
                    placeholder="Especialidad del técnico"
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Costo</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      name="costo"
                      value={formData.costo}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Duración Estimada (horas)</FormLabel>
                    <Input
                      type="number"
                      step="0.5"
                      name="duracion_estimada"
                      value={formData.duracion_estimada}
                      onChange={handleChange}
                      placeholder="Horas estimadas"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={loading}
                  loadingText="Guardando..."
                >
                  Crear Mantenimiento
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => router.push('/mantenimientos')}
                >
                  Cancelar
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Box>
    </Layout>
  );
}
