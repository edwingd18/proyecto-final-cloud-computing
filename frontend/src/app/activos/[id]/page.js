'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Stack,
  StackDivider,
  Badge,
  HStack,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { activosService } from '@/services/activosService';
import { mantenimientosService } from '@/services/mantenimientosService';

const estadoColors = {
  activo: 'green',
  inactivo: 'gray',
  en_reparacion: 'yellow',
  dado_de_baja: 'red',
};

const categoriaLabels = {
  electronico: 'Electrónico',
  maquinaria: 'Maquinaria',
  vehiculo: 'Vehículo',
  mobiliario: 'Mobiliario',
  equipo_computo: 'Equipo de Cómputo',
  herramienta: 'Herramienta',
  otro: 'Otro',
};

const tipoMantenimientoLabels = {
  preventivo: 'Preventivo',
  correctivo: 'Correctivo',
  predictivo: 'Predictivo',
  emergencia: 'Emergencia',
};

const estadoMantenimientoColors = {
  pendiente: 'orange',
  en_proceso: 'blue',
  completado: 'green',
  cancelado: 'red',
};

export default function DetalleActivoPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [activo, setActivo] = useState(null);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [params.id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos del activo
      const activoData = await activosService.getById(params.id);
      console.log('Datos del activo recibidos:', activoData);
      setActivo(activoData);

      // Cargar mantenimientos del activo
      const mantenimientosData = await mantenimientosService.getByActivo(params.id);
      console.log('Datos de mantenimientos recibidos:', mantenimientosData);
      console.log('¿Es array?', Array.isArray(mantenimientosData));

      // Asegurar que siempre sea un array
      const mantenimientosArray = Array.isArray(mantenimientosData)
        ? mantenimientosData
        : [];
      setMantenimientos(mantenimientosArray);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos del activo');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    try {
      setDeleting(true);
      await activosService.delete(params.id);

      toast({
        title: 'Activo eliminado',
        description: 'El activo se ha eliminado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push('/activos');
    } catch (err) {
      console.error('Error al eliminar:', err);
      toast({
        title: 'Error al eliminar',
        description: err.response?.data?.message || 'No se pudo eliminar el activo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setDeleting(false);
      onClose();
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text mt={4}>Cargando datos del activo...</Text>
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

  if (!activo) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          No se encontró el activo
        </Alert>
        <Button mt={4} onClick={() => router.push('/activos')}>
          Volver a la lista
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header con acciones */}
      <HStack justifyContent="space-between" mb={6}>
        <Heading size="lg">Detalles del Activo</Heading>
        <HStack>
          <Button
            colorScheme="blue"
            onClick={() => router.push(`/activos/${params.id}/editar`)}
          >
            Editar
          </Button>
          <Button colorScheme="red" onClick={onOpen}>
            Eliminar
          </Button>
          <Button variant="outline" onClick={() => router.push('/activos')}>
            Volver
          </Button>
        </HStack>
      </HStack>

      {/* Información del activo */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Información General</Heading>
        </CardHeader>
        <CardBody>
          <Stack divider={<StackDivider />} spacing={4}>
            <HStack>
              <Text fontWeight="bold" width="200px">
                Nombre:
              </Text>
              <Text>{activo.nombre}</Text>
            </HStack>

            <HStack>
              <Text fontWeight="bold" width="200px">
                Número de Serie:
              </Text>
              <Text>{activo.numero_serie}</Text>
            </HStack>

            <HStack>
              <Text fontWeight="bold" width="200px">
                Categoría:
              </Text>
              <Badge colorScheme="purple">
                {categoriaLabels[activo.categoria] || activo.categoria}
              </Badge>
            </HStack>

            <HStack>
              <Text fontWeight="bold" width="200px">
                Estado:
              </Text>
              <Badge colorScheme={estadoColors[activo.estado]}>
                {activo.estado ? activo.estado.replace('_', ' ').toUpperCase() : 'N/A'}
              </Badge>
            </HStack>

            <VStack align="start">
              <Text fontWeight="bold" width="200px">
                Descripción:
              </Text>
              <Text>{activo.descripcion || 'Sin descripción'}</Text>
            </VStack>

            <HStack>
              <Text fontWeight="bold" width="200px">
                Fecha de Adquisición:
              </Text>
              <Text>{new Date(activo.fecha_adquisicion).toLocaleDateString()}</Text>
            </HStack>

            <HStack>
              <Text fontWeight="bold" width="200px">
                Costo:
              </Text>
              <Text fontWeight="semibold" color="green.600">
                ${parseFloat(activo.costo).toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </HStack>

            <HStack>
              <Text fontWeight="bold" width="200px">
                Ubicación:
              </Text>
              <Text>{activo.ubicacion}</Text>
            </HStack>

            <HStack>
              <Text fontWeight="bold" width="200px">
                Fecha de Creación:
              </Text>
              <Text>
                {new Date(activo.created_at).toLocaleString()}
              </Text>
            </HStack>

            <HStack>
              <Text fontWeight="bold" width="200px">
                Última Actualización:
              </Text>
              <Text>
                {new Date(activo.updated_at).toLocaleString()}
              </Text>
            </HStack>
          </Stack>
        </CardBody>
      </Card>

      {/* Historial de mantenimientos */}
      <Card>
        <CardHeader>
          <HStack justifyContent="space-between">
            <Heading size="md">Historial de Mantenimientos</Heading>
            <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
              {mantenimientos.length} mantenimiento{mantenimientos.length !== 1 ? 's' : ''}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          {mantenimientos.length === 0 ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              Este activo no tiene mantenimientos registrados
            </Alert>
          ) : (
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Tipo</Th>
                    <Th>Descripción</Th>
                    <Th>Fecha Inicio</Th>
                    <Th>Fecha Fin</Th>
                    <Th>Estado</Th>
                    <Th>Prioridad</Th>
                    <Th>Costo</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mantenimientos.map((mantenimiento) => (
                    <Tr key={mantenimiento._id}>
                      <Td>
                        <Badge colorScheme="cyan">
                          {tipoMantenimientoLabels[mantenimiento.tipo]}
                        </Badge>
                      </Td>
                      <Td maxW="200px" isTruncated>
                        {mantenimiento.descripcion}
                      </Td>
                      <Td>
                        {new Date(mantenimiento.fecha_inicio).toLocaleDateString()}
                      </Td>
                      <Td>
                        {mantenimiento.fecha_fin
                          ? new Date(mantenimiento.fecha_fin).toLocaleDateString()
                          : '-'}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={estadoMantenimientoColors[mantenimiento.estado]}
                        >
                          {mantenimiento.estado ? mantenimiento.estado.replace('_', ' ').toUpperCase() : 'N/A'}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            mantenimiento.prioridad === 'critica'
                              ? 'red'
                              : mantenimiento.prioridad === 'alta'
                              ? 'orange'
                              : mantenimiento.prioridad === 'media'
                              ? 'yellow'
                              : 'gray'
                          }
                        >
                          {mantenimiento.prioridad.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td>
                        ${parseFloat(mantenimiento.costo).toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() =>
                            router.push(`/mantenimientos/${mantenimiento._id}`)
                          }
                        >
                          Ver
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </CardBody>
      </Card>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Activo
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro de eliminar el activo <strong>{activo.nombre}</strong>?
              Esta acción no se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onClose} disabled={deleting}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={handleEliminar}
                ml={3}
                isLoading={deleting}
                loadingText="Eliminando..."
              >
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}
