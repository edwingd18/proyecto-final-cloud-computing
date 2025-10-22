'use client';

import { useState } from 'react';
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
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { activosService } from '@/services/activosService';

export default function NuevoActivoPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await activosService.create(formData);
      toast({
        title: 'Éxito',
        description: 'Activo creado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/activos');
    } catch (error) {
      console.error('Error al crear activo:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear el activo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box maxW="800px" mx="auto">
        <Heading mb={6}>Nuevo Activo</Heading>

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

                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={loading}
                  loadingText="Guardando..."
                >
                  Crear Activo
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => router.push('/activos')}
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
