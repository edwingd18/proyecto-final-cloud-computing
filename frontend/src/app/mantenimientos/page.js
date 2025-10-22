'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  Spinner,
  Center,
  HStack,
  Select,
  Badge,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { FiEdit, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import { mantenimientosService } from '@/services/mantenimientosService';

const estadoColors = {
  pendiente: 'yellow',
  en_proceso: 'blue',
  completado: 'green',
  cancelado: 'red',
};

const prioridadColors = {
  baja: 'gray',
  media: 'blue',
  alta: 'orange',
  critica: 'red',
};

export default function MantenimientosPage() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    tipo: '',
    estado: '',
    prioridad: '',
  });
  const [mantenimientoToDelete, setMantenimientoToDelete] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();
  const router = useRouter();

  const fetchMantenimientos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.tipo) params.tipo = filters.tipo;
      if (filters.estado) params.estado = filters.estado;
      if (filters.prioridad) params.prioridad = filters.prioridad;

      const response = await mantenimientosService.getAll(params);
      setMantenimientos(response.data || []);
    } catch (error) {
      console.error('Error al cargar mantenimientos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los mantenimientos',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMantenimientos();
  }, [filters]);

  const handleDelete = async () => {
    if (!mantenimientoToDelete) return;

    try {
      await mantenimientosService.delete(mantenimientoToDelete._id);
      toast({
        title: 'Éxito',
        description: 'Mantenimiento eliminado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchMantenimientos();
    } catch (error) {
      console.error('Error al eliminar mantenimiento:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el mantenimiento',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setMantenimientoToDelete(null);
      onClose();
    }
  };

  const confirmDelete = (mantenimiento) => {
    setMantenimientoToDelete(mantenimiento);
    onOpen();
  };

  if (loading) {
    return (
      <Layout>
        <Center h="400px">
          <Spinner size="xl" color="brand.500" />
        </Center>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <HStack justify="space-between" mb={6}>
          <Heading>Mantenimientos</Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={() => router.push('/mantenimientos/nuevo')}
          >
            Nuevo Mantenimiento
          </Button>
        </HStack>

        {/* Filtros */}
        <HStack spacing={4} mb={6}>
          <Select
            placeholder="Todos los tipos"
            value={filters.tipo}
            onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
            maxW="200px"
          >
            <option value="preventivo">Preventivo</option>
            <option value="correctivo">Correctivo</option>
            <option value="predictivo">Predictivo</option>
            <option value="emergencia">Emergencia</option>
          </Select>
          <Select
            placeholder="Todos los estados"
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            maxW="200px"
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </Select>
          <Select
            placeholder="Todas las prioridades"
            value={filters.prioridad}
            onChange={(e) => setFilters({ ...filters, prioridad: e.target.value })}
            maxW="200px"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </Select>
        </HStack>

        {/* Tabla */}
        <Box overflowX="auto" bg="white" rounded="lg" shadow="sm">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Tipo</Th>
                <Th>Descripción</Th>
                <Th>Fecha Inicio</Th>
                <Th>Técnico</Th>
                <Th>Estado</Th>
                <Th>Prioridad</Th>
                <Th>Costo</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mantenimientos.map((mant) => (
                <Tr key={mant._id}>
                  <Td textTransform="capitalize">{mant.tipo}</Td>
                  <Td maxW="200px" isTruncated>{mant.descripcion}</Td>
                  <Td>{format(new Date(mant.fecha_inicio), 'dd/MM/yyyy')}</Td>
                  <Td>{mant.tecnico.nombre}</Td>
                  <Td>
                    <Badge colorScheme={estadoColors[mant.estado]}>
                      {mant.estado.replace('_', ' ')}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={prioridadColors[mant.prioridad]}>
                      {mant.prioridad}
                    </Badge>
                  </Td>
                  <Td>${parseFloat(mant.costo).toFixed(2)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Ver"
                        icon={<FiEye />}
                        size="sm"
                        onClick={() => router.push(`/mantenimientos/${mant._id}`)}
                      />
                      <IconButton
                        aria-label="Eliminar"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => confirmDelete(mant)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {mantenimientos.length === 0 && (
          <Center py={10}>
            <Box textAlign="center">
              <Heading size="md" color="gray.500">
                No se encontraron mantenimientos
              </Heading>
            </Box>
          </Center>
        )}

        {/* Dialog de confirmación */}
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Eliminar Mantenimiento
              </AlertDialogHeader>

              <AlertDialogBody>
                ¿Estás seguro de eliminar este mantenimiento?
                Esta acción no se puede deshacer.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancelar
                </Button>
                <Button colorScheme="red" onClick={handleDelete} ml={3}>
                  Eliminar
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </Layout>
  );
}
