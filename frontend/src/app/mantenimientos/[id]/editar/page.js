'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Container,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  SimpleGrid,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Divider,
  Badge,
  Text,
} from '@chakra-ui/react';
import { MdAdd, MdDelete } from 'react-icons/md';
import { mantenimientosService } from '@/services/mantenimientosService';
import { activosService } from '@/services/activosService';

export default function EditarMantenimientoPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
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
    duracion_real: '',
    piezas: [],
  });
  const [nuevaPieza, setNuevaPieza] = useState({
    nombre: '',
    cantidad: '',
    costo: '',
  });

  useEffect(() => {
    cargarDatos();
  }, [params.id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar activos
      const activosData = await activosService.getAll();
      setActivos(activosData.data || []);

      // Cargar datos del mantenimiento
      const data = await mantenimientosService.getById(params.id);

      // Formatear fechas para input type="datetime-local"
      const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha);
        const año = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const dia = String(date.getDate()).padStart(2, '0');
        const horas = String(date.getHours()).padStart(2, '0');
        const minutos = String(date.getMinutes()).padStart(2, '0');
        return `${año}-${mes}-${dia}T${horas}:${minutos}`;
      };

      setFormData({
        activoId: data.activoId || '',
        tipo: data.tipo || 'preventivo',
        descripcion: data.descripcion || '',
        fecha_inicio: formatearFecha(data.fecha_inicio),
        fecha_fin: formatearFecha(data.fecha_fin),
        costo: data.costo || '',
        tecnico: {
          nombre: data.tecnico?.nombre || '',
          contacto: data.tecnico?.contacto || '',
          especialidad: data.tecnico?.especialidad || '',
        },
        estado: data.estado || 'pendiente',
        prioridad: data.prioridad || 'media',
        duracion_estimada: data.duracion_estimada || '',
        duracion_real: data.duracion_real || '',
        piezas: data.piezas || [],
      });
    } catch (err) {
      console.error('Error al cargar mantenimiento:', err);
      setError(err.response?.data?.message || 'Error al cargar el mantenimiento');
    } finally {
      setLoading(false);
    }
  };

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

  const handlePiezaChange = (e) => {
    setNuevaPieza({
      ...nuevaPieza,
      [e.target.name]: e.target.value,
    });
  };

  const agregarPieza = () => {
    if (!nuevaPieza.nombre || !nuevaPieza.cantidad || !nuevaPieza.costo) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor complete todos los campos de la pieza',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setFormData({
      ...formData,
      piezas: [
        ...formData.piezas,
        {
          nombre: nuevaPieza.nombre,
          cantidad: parseFloat(nuevaPieza.cantidad),
          costo: parseFloat(nuevaPieza.costo),
        },
      ],
    });

    setNuevaPieza({ nombre: '', cantidad: '', costo: '' });

    toast({
      title: 'Pieza agregada',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const eliminarPieza = (index) => {
    const nuevasPiezas = formData.piezas.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      piezas: nuevasPiezas,
    });

    toast({
      title: 'Pieza eliminada',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSend = {
        ...formData,
        costo: parseFloat(formData.costo),
        duracion_estimada: formData.duracion_estimada
          ? parseFloat(formData.duracion_estimada)
          : undefined,
        duracion_real: formData.duracion_real
          ? parseFloat(formData.duracion_real)
          : undefined,
        fecha_fin: formData.fecha_fin || undefined,
      };

      await mantenimientosService.update(params.id, dataToSend);
      toast({
        title: 'Mantenimiento actualizado',
        description: 'El mantenimiento se ha actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push(`/mantenimientos/${params.id}`);
    } catch (error) {
      console.error('Error al actualizar mantenimiento:', error);

      let errorMessage = 'No se pudo actualizar el mantenimiento';

      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map((err) => err.msg || err.message).join(', ');
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
      setSaving(false);
    }
  };

  const calcularCostoTotal = () => {
    const costoPiezas = formData.piezas.reduce(
      (total, pieza) => total + pieza.costo * pieza.cantidad,
      0
    );
    return parseFloat(formData.costo || 0) + costoPiezas;
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Box mt={4}>Cargando datos del mantenimiento...</Box>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} onClick={() => router.push('/mantenimientos')}>
          Volver a la lista
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box maxW="1000px" mx="auto">
        <HStack justifyContent="space-between" mb={6}>
          <Heading size="lg">Editar Mantenimiento</Heading>
          <Button
            variant="outline"
            onClick={() => router.push(`/mantenimientos/${params.id}`)}
          >
            Cancelar
          </Button>
        </HStack>

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
                    <Select name="tipo" value={formData.tipo} onChange={handleChange}>
                      <option value="preventivo">Preventivo</option>
                      <option value="correctivo">Correctivo</option>
                      <option value="predictivo">Predictivo</option>
                      <option value="emergencia">Emergencia</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Prioridad</FormLabel>
                    <Select name="prioridad" value={formData.prioridad} onChange={handleChange}>
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

                <Divider my={2} />
                <Heading size="sm">Información del Técnico</Heading>

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

                <Divider my={2} />
                <Heading size="sm">Costos y Duración</Heading>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Costo del Servicio</FormLabel>
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

                  <FormControl>
                    <FormLabel>Duración Real (horas)</FormLabel>
                    <Input
                      type="number"
                      step="0.5"
                      name="duracion_real"
                      value={formData.duracion_real}
                      onChange={handleChange}
                      placeholder="Horas reales"
                    />
                  </FormControl>
                </SimpleGrid>

                <Divider my={2} />
                <Heading size="sm">
                  Piezas Utilizadas{' '}
                  <Badge colorScheme="blue" ml={2}>
                    {formData.piezas.length} piezas
                  </Badge>
                </Heading>

                {/* Listado de piezas */}
                {formData.piezas.length > 0 && (
                  <TableContainer>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Pieza</Th>
                          <Th isNumeric>Cantidad</Th>
                          <Th isNumeric>Costo Unit.</Th>
                          <Th isNumeric>Subtotal</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {formData.piezas.map((pieza, index) => (
                          <Tr key={index}>
                            <Td>{pieza.nombre}</Td>
                            <Td isNumeric>{pieza.cantidad}</Td>
                            <Td isNumeric>${pieza.costo.toFixed(2)}</Td>
                            <Td isNumeric fontWeight="semibold">
                              ${(pieza.costo * pieza.cantidad).toFixed(2)}
                            </Td>
                            <Td>
                              <IconButton
                                size="sm"
                                colorScheme="red"
                                icon={<MdDelete />}
                                onClick={() => eliminarPieza(index)}
                                aria-label="Eliminar pieza"
                              />
                            </Td>
                          </Tr>
                        ))}
                        <Tr>
                          <Td colSpan={3} textAlign="right" fontWeight="bold">
                            Costo Total:
                          </Td>
                          <Td isNumeric fontWeight="bold" fontSize="lg" color="green.600">
                            ${calcularCostoTotal().toFixed(2)}
                          </Td>
                          <Td></Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}

                {/* Formulario para agregar pieza */}
                <Card variant="outline" bg="gray.50">
                  <CardBody>
                    <Heading size="xs" mb={3}>
                      Agregar Nueva Pieza
                    </Heading>
                    <HStack spacing={3}>
                      <FormControl>
                        <Input
                          name="nombre"
                          value={nuevaPieza.nombre}
                          onChange={handlePiezaChange}
                          placeholder="Nombre de la pieza"
                          bg="white"
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          type="number"
                          name="cantidad"
                          value={nuevaPieza.cantidad}
                          onChange={handlePiezaChange}
                          placeholder="Cant."
                          bg="white"
                          min="1"
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          name="costo"
                          value={nuevaPieza.costo}
                          onChange={handlePiezaChange}
                          placeholder="Costo"
                          bg="white"
                          min="0"
                        />
                      </FormControl>
                      <IconButton
                        colorScheme="green"
                        icon={<MdAdd />}
                        onClick={agregarPieza}
                        aria-label="Agregar pieza"
                      />
                    </HStack>
                  </CardBody>
                </Card>

                <Divider my={2} />

                <FormControl isRequired>
                  <FormLabel>Estado</FormLabel>
                  <Select name="estado" value={formData.estado} onChange={handleChange}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </Select>
                </FormControl>

                <HStack spacing={4} pt={4}>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={saving}
                    loadingText="Guardando..."
                    flex={1}
                  >
                    Guardar Cambios
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push(`/mantenimientos/${params.id}`)}
                    flex={1}
                  >
                    Cancelar
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>

        {/* Nota informativa */}
        <Alert status="info" mt={4} borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">
            Para agregar notas o ver el historial completo, guarda los cambios y accede a la
            página de detalles del mantenimiento.
          </Text>
        </Alert>
      </Box>
    </Container>
  );
}
