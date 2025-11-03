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
} from '@chakra-ui/react';
import { activosService } from '@/services/activosService';

export default function EditarActivoPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    numero_serie: '',
    categoria: 'equipo_computo',
    fecha_adquisicion: '',
    costo: '',
    ubicacion: '',
    estado: 'activo',
  });

  useEffect(() => {
    cargarActivo();
  }, [params.id]);

  const cargarActivo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await activosService.getById(params.id);

      // Formatear fecha para input type="date"
      const fechaFormateada = new Date(data.fecha_adquisicion)
        .toISOString()
        .split('T')[0];

      setFormData({
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        numero_serie: data.numero_serie || '',
        categoria: data.categoria || 'equipo_computo',
        fecha_adquisicion: fechaFormateada,
        costo: data.costo || '',
        ubicacion: data.ubicacion || '',
        estado: data.estado || 'activo',
      });
    } catch (err) {
      console.error('Error al cargar activo:', err);
      setError(err.response?.data?.message || 'Error al cargar el activo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await activosService.update(params.id, formData);
      toast({
        title: 'Activo actualizado',
        description: 'El activo se ha actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push(`/activos/${params.id}`);
    } catch (error) {
      console.error('Error al actualizar activo:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el activo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Box mt={4}>Cargando datos del activo...</Box>
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
        <Button mt={4} onClick={() => router.push('/activos')}>
          Volver a la lista
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box maxW="800px" mx="auto">
        <HStack justifyContent="space-between" mb={6}>
          <Heading size="lg">Editar Activo</Heading>
          <Button
            variant="outline"
            onClick={() => router.push(`/activos/${params.id}`)}
          >
            Cancelar
          </Button>
        </HStack>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Nombre</FormLabel>
                  <Input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Nombre del activo"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Descripción</FormLabel>
                  <Textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción del activo"
                    rows={4}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Número de Serie</FormLabel>
                  <Input
                    name="numero_serie"
                    value={formData.numero_serie}
                    onChange={handleChange}
                    placeholder="Número de serie único"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                  >
                    <option value="electronico">Electrónico</option>
                    <option value="maquinaria">Maquinaria</option>
                    <option value="vehiculo">Vehículo</option>
                    <option value="mobiliario">Mobiliario</option>
                    <option value="equipo_computo">Equipo de Cómputo</option>
                    <option value="herramienta">Herramienta</option>
                    <option value="otro">Otro</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Fecha de Adquisición</FormLabel>
                  <Input
                    type="date"
                    name="fecha_adquisicion"
                    value={formData.fecha_adquisicion}
                    onChange={handleChange}
                  />
                </FormControl>

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

                <FormControl isRequired>
                  <FormLabel>Ubicación</FormLabel>
                  <Input
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    placeholder="Ubicación del activo"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="en_reparacion">En Reparación</option>
                    <option value="dado_de_baja">Dado de Baja</option>
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
                    onClick={() => router.push(`/activos/${params.id}`)}
                    flex={1}
                  >
                    Cancelar
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Box>
    </Container>
  );
}
