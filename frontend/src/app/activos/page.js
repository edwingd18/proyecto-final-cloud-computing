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
  Input,
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
import Layout from '@/components/Layout';
import { activosService } from '@/services/activosService';

const estadoColors = {
  activo: 'green',
  inactivo: 'gray',
  en_reparacion: 'orange',
  dado_de_baja: 'red',
};

export default function ActivosPage() {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoria: '',
    estado: '',
    search: '',
  });
  const [activoToDelete, setActivoToDelete] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();
  const router = useRouter();

  const fetchActivos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.categoria) params.categoria = filters.categoria;
      if (filters.estado) params.estado = filters.estado;
      if (filters.search) params.search = filters.search;

      const response = await activosService.getAll(params);
      setActivos(response.data || []);
    } catch (error) {
      console.error('Error al cargar activos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los activos',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivos();
  }, [filters]);

  const handleDelete = async () => {
    if (!activoToDelete) return;

    try {
      await activosService.delete(activoToDelete.id);
      toast({
        title: 'Éxito',
        description: 'Activo eliminado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchActivos();
    } catch (error) {
      console.error('Error al eliminar activo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el activo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActivoToDelete(null);
      onClose();
    }
  };

  const confirmDelete = (activo) => {
    setActivoToDelete(activo);
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
          <Heading>Activos</Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={() => router.push('/activos/nuevo')}
          >
            Nuevo Activo
          </Button>
        </HStack>

        {/* Filtros */}
        <HStack spacing={4} mb={6}>
          <Input
            placeholder="Buscar..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            maxW="300px"
          />
          <Select
            placeholder="Todas las categorías"
            value={filters.categoria}
            onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
            maxW="200px"
          >
            <option value="electronico">Electrónico</option>
            <option value="maquinaria">Maquinaria</option>
            <option value="vehiculo">Vehículo</option>
            <option value="mobiliario">Mobiliario</option>
            <option value="equipo_computo">Equipo de Cómputo</option>
            <option value="herramienta">Herramienta</option>
            <option value="otro">Otro</option>
          </Select>
          <Select
            placeholder="Todos los estados"
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            maxW="200px"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="en_reparacion">En Reparación</option>
            <option value="dado_de_baja">Dado de Baja</option>
          </Select>
        </HStack>

        {/* Tabla */}
        <Box overflowX="auto" bg="white" rounded="lg" shadow="sm">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Número de Serie</Th>
                <Th>Categoría</Th>
                <Th>Ubicación</Th>
                <Th>Estado</Th>
                <Th>Costo</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {activos.map((activo) => (
                <Tr key={activo.id}>
                  <Td fontWeight="medium">{activo.nombre}</Td>
                  <Td>{activo.numero_serie}</Td>
                  <Td textTransform="capitalize">
                    {activo.categoria.replace('_', ' ')}
                  </Td>
                  <Td>{activo.ubicacion}</Td>
                  <Td>
                    <Badge colorScheme={estadoColors[activo.estado]}>
                      {activo.estado.replace('_', ' ')}
                    </Badge>
                  </Td>
                  <Td>${parseFloat(activo.costo).toFixed(2)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Ver"
                        icon={<FiEye />}
                        size="sm"
                        onClick={() => router.push(`/activos/${activo.id}`)}
                      />
                      <IconButton
                        aria-label="Editar"
                        icon={<FiEdit />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => router.push(`/activos/${activo.id}`)}
                      />
                      <IconButton
                        aria-label="Eliminar"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => confirmDelete(activo)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {activos.length === 0 && (
          <Center py={10}>
            <Box textAlign="center">
              <Heading size="md" color="gray.500">
                No se encontraron activos
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
                Eliminar Activo
              </AlertDialogHeader>

              <AlertDialogBody>
                ¿Estás seguro de eliminar el activo "{activoToDelete?.nombre}"?
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
