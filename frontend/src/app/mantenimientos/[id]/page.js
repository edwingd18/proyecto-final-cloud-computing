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
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { mantenimientosService } from '@/services/mantenimientosService';
import { activosService } from '@/services/activosService';

const tipoMantenimientoLabels = {
  preventivo: 'Preventivo',
  correctivo: 'Correctivo',
  predictivo: 'Predictivo',
  emergencia: 'Emergencia',
};

const estadoColors = {
  pendiente: 'orange',
  en_proceso: 'blue',
  completado: 'green',
  cancelado: 'red',
};

const prioridadColors = {
  baja: 'gray',
  media: 'yellow',
  alta: 'orange',
  critica: 'red',
};

export default function DetalleMantenimientoPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [mantenimiento, setMantenimiento] = useState(null);
  const [activo, setActivo] = useState(null);
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

      // Cargar datos del mantenimiento
      const mantenimientoData = await mantenimientosService.getById(params.id);
      setMantenimiento(mantenimientoData);

      // Cargar datos del activo asociado
      if (mantenimientoData.activoId) {
        try {
          const activoData = await activosService.getById(mantenimientoData.activoId);
          setActivo(activoData);
        } catch (err) {
          console.error('Error al cargar activo:', err);
          // No falla si no se puede cargar el activo
        }
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos del mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    try {
      setDeleting(true);
      await mantenimientosService.delete(params.id);

      toast({
        title: 'Mantenimiento eliminado',
        description: 'El mantenimiento se ha eliminado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push('/mantenimientos');
    } catch (err) {
      console.error('Error al eliminar:', err);
      toast({
        title: 'Error al eliminar',
        description: err.response?.data?.message || 'No se pudo eliminar el mantenimiento',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setDeleting(false);
      onClose();
    }
  };

  const calcularCostoTotal = () => {
    if (!mantenimiento) return 0;
    const costoPiezas = (mantenimiento.piezas || []).reduce(
      (total, pieza) => total + pieza.costo * pieza.cantidad,
      0
    );
    return parseFloat(mantenimiento.costo || 0) + costoPiezas;
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text mt={4}>Cargando datos del mantenimiento...</Text>
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

  if (!mantenimiento) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          No se encontró el mantenimiento
        </Alert>
        <Button mt={4} onClick={() => router.push('/mantenimientos')}>
          Volver a la lista
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header con acciones */}
      <HStack justifyContent="space-between" mb={6}>
        <Heading size="lg">Detalles del Mantenimiento</Heading>
        <HStack>
          <Button
            colorScheme="blue"
            onClick={() => router.push(`/mantenimientos/${params.id}/editar`)}
          >
            Editar
          </Button>
          <Button colorScheme="red" onClick={onOpen}>
            Eliminar
          </Button>
          <Button variant="outline" onClick={() => router.push('/mantenimientos')}>
            Volver
          </Button>
        </HStack>
      </HStack>

      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        {/* Columna principal */}
        <GridItem colSpan={{ base: 12, lg: 8 }}>
          {/* Información General */}
          <Card mb={6}>
            <CardHeader>
              <Heading size="md">Información General</Heading>
            </CardHeader>
            <CardBody>
              <Stack divider={<StackDivider />} spacing={4}>
                <HStack>
                  <Text fontWeight="bold" width="200px">
                    Tipo:
                  </Text>
                  <Badge colorScheme="cyan" fontSize="md">
                    {tipoMantenimientoLabels[mantenimiento.tipo]}
                  </Badge>
                </HStack>

                <HStack>
                  <Text fontWeight="bold" width="200px">
                    Estado:
                  </Text>
                  <Badge colorScheme={estadoColors[mantenimiento.estado]} fontSize="md">
                    {mantenimiento.estado ? mantenimiento.estado.replace('_', ' ').toUpperCase() : 'N/A'}
                  </Badge>
                </HStack>

                <HStack>
                  <Text fontWeight="bold" width="200px">
                    Prioridad:
                  </Text>
                  <Badge colorScheme={prioridadColors[mantenimiento.prioridad]} fontSize="md">
                    {mantenimiento.prioridad.toUpperCase()}
                  </Badge>
                </HStack>

                <VStack align="start">
                  <Text fontWeight="bold">Descripción:</Text>
                  <Text>{mantenimiento.descripcion}</Text>
                </VStack>

                <HStack>
                  <Text fontWeight="bold" width="200px">
                    Fecha de Inicio:
                  </Text>
                  <Text>{new Date(mantenimiento.fecha_inicio).toLocaleDateString()}</Text>
                </HStack>

                <HStack>
                  <Text fontWeight="bold" width="200px">
                    Fecha de Fin:
                  </Text>
                  <Text>
                    {mantenimiento.fecha_fin
                      ? new Date(mantenimiento.fecha_fin).toLocaleDateString()
                      : 'No establecida'}
                  </Text>
                </HStack>

                <HStack>
                  <Text fontWeight="bold" width="200px">
                    Duración Estimada:
                  </Text>
                  <Text>
                    {mantenimiento.duracion_estimada
                      ? `${mantenimiento.duracion_estimada} horas`
                      : 'No especificada'}
                  </Text>
                </HStack>

                <HStack>
                  <Text fontWeight="bold" width="200px">
                    Duración Real:
                  </Text>
                  <Text>
                    {mantenimiento.duracion_real
                      ? `${mantenimiento.duracion_real} horas`
                      : 'No registrada'}
                  </Text>
                </HStack>

                <Divider />

                <HStack>
                  <Text fontWeight="bold" width="200px">
                    Costo del Servicio:
                  </Text>
                  <Text fontWeight="semibold" color="green.600">
                    $
                    {parseFloat(mantenimiento.costo).toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </HStack>

                <HStack>
                  <Text fontWeight="bold" width="200px">
                    Costo Total:
                  </Text>
                  <Text fontWeight="bold" fontSize="lg" color="green.600">
                    $
                    {calcularCostoTotal().toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </HStack>

                <Divider />

                <HStack>
                  <Text fontWeight="bold" width="200px">
                    Creado:
                  </Text>
                  <Text>{new Date(mantenimiento.createdAt).toLocaleString()}</Text>
                </HStack>

                <HStack>
                  <Text fontWeight="bold" width="200px">
                    Última Actualización:
                  </Text>
                  <Text>{new Date(mantenimiento.updatedAt).toLocaleString()}</Text>
                </HStack>
              </Stack>
            </CardBody>
          </Card>

          {/* Tabs con información adicional */}
          <Card>
            <CardBody>
              <Tabs colorScheme="blue">
                <TabList>
                  <Tab>Piezas ({(mantenimiento.piezas || []).length})</Tab>
                  <Tab>Notas ({(mantenimiento.notas || []).length})</Tab>
                  <Tab>Historial ({(mantenimiento.historial || []).length})</Tab>
                </TabList>

                <TabPanels>
                  {/* Panel de Piezas */}
                  <TabPanel>
                    {!mantenimiento.piezas || mantenimiento.piezas.length === 0 ? (
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        No se han registrado piezas para este mantenimiento
                      </Alert>
                    ) : (
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Pieza</Th>
                              <Th isNumeric>Cantidad</Th>
                              <Th isNumeric>Costo Unitario</Th>
                              <Th isNumeric>Subtotal</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {mantenimiento.piezas.map((pieza, index) => (
                              <Tr key={index}>
                                <Td>{pieza.nombre}</Td>
                                <Td isNumeric>{pieza.cantidad}</Td>
                                <Td isNumeric>
                                  $
                                  {parseFloat(pieza.costo).toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </Td>
                                <Td isNumeric fontWeight="semibold">
                                  $
                                  {(pieza.costo * pieza.cantidad).toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    )}
                  </TabPanel>

                  {/* Panel de Notas */}
                  <TabPanel>
                    {!mantenimiento.notas || mantenimiento.notas.length === 0 ? (
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        No hay notas registradas para este mantenimiento
                      </Alert>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        {mantenimiento.notas.map((nota, index) => (
                          <Card key={nota._id || index} variant="outline">
                            <CardBody>
                              <HStack justifyContent="space-between" mb={2}>
                                <Text fontWeight="bold">{nota.autor}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  {new Date(nota.fecha).toLocaleString()}
                                </Text>
                              </HStack>
                              <Text>{nota.descripcion}</Text>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    )}
                  </TabPanel>

                  {/* Panel de Historial */}
                  <TabPanel>
                    {!mantenimiento.historial || mantenimiento.historial.length === 0 ? (
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        No hay cambios registrados en el historial
                      </Alert>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        {mantenimiento.historial.map((cambio, index) => (
                          <HStack
                            key={index}
                            p={3}
                            bg="gray.50"
                            borderRadius="md"
                            justifyContent="space-between"
                          >
                            <HStack flex={1}>
                              <Badge colorScheme="purple">{cambio.usuario}</Badge>
                              <Text>{cambio.cambio}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              {new Date(cambio.fecha).toLocaleString()}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </GridItem>

        {/* Columna lateral */}
        <GridItem colSpan={{ base: 12, lg: 4 }}>
          {/* Información del Técnico */}
          <Card mb={6}>
            <CardHeader>
              <Heading size="md">Técnico Asignado</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Nombre
                  </Text>
                  <Text fontWeight="semibold">{mantenimiento.tecnico?.nombre || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Contacto
                  </Text>
                  <Text>{mantenimiento.tecnico?.contacto || 'No especificado'}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Especialidad
                  </Text>
                  <Text>{mantenimiento.tecnico?.especialidad || 'No especificada'}</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Información del Activo */}
          <Card>
            <CardHeader>
              <Heading size="md">Activo</Heading>
            </CardHeader>
            <CardBody>
              {activo ? (
                <VStack align="start" spacing={3}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Nombre
                    </Text>
                    <Text fontWeight="semibold">{activo.nombre}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Número de Serie
                    </Text>
                    <Text>{activo.numero_serie}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Categoría
                    </Text>
                    <Badge colorScheme="purple">{activo.categoria}</Badge>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Ubicación
                    </Text>
                    <Text>{activo.ubicacion}</Text>
                  </Box>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    width="full"
                    onClick={() => router.push(`/activos/${activo.id}`)}
                  >
                    Ver Detalles del Activo
                  </Button>
                </VStack>
              ) : (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  No se pudo cargar la información del activo
                </Alert>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Mantenimiento
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro de eliminar este mantenimiento? Esta acción no se puede deshacer.
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
