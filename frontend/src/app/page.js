"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Spinner,
  Heading,
  Center,
  Text,
  Icon,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import {
  FiPackage,
  FiTool,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import Layout from "@/components/Layout";
import { activosService } from "@/services/activosService";
import { mantenimientosService } from "@/services/mantenimientosService";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [statsActivos, setStatsActivos] = useState(null);
  const [statsMantenimientos, setStatsMantenimientos] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activosData, mantenimientosData] = await Promise.all([
          activosService.getEstadisticas().catch((e) => ({
            data: { total: 0, porEstado: [], porCategoria: [] },
          })),
          mantenimientosService.getEstadisticas().catch((e) => ({
            data: { total: 0, porEstado: [], porTipo: [], porPrioridad: [] },
          })),
        ]);

        setStatsActivos(activosData.data);
        setStatsMantenimientos(mantenimientosData.data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        setStatsActivos({ total: 0, porEstado: [], porCategoria: [] });
        setStatsMantenimientos({
          total: 0,
          porEstado: [],
          porTipo: [],
          porPrioridad: [],
        });
        toast({
          title: "Advertencia",
          description:
            "Mostrando datos vacíos. Verifica que los servicios estén corriendo.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        {/* Banner destacado con gradiente descete */}
        <Box
          bgGradient="linear(to-r, teal.500, blue.500, purple.600)"
          p={8}
          borderRadius="xl"
          mb={6}
          boxShadow="2xl"
        >
          <Heading size="2xl" color="white" mb={3} textAlign="center">
            Prueba de deploy automatico
          </Heading>
          <Text
            fontSize="xl"
            color="white"
            textAlign="center"
            fontWeight="bold"
          >
            ✅ CI/CD Activo con Jenkins + Railway prueba push 1
          </Text>
          <Text fontSize="md" color="whiteAlpha.900" textAlign="center" mt={2}>
            Deploy automático desde rama develop
          </Text>
        </Box>

        {(!statsActivos || statsActivos.total === 0) &&
          (!statsMantenimientos || statsMantenimientos.total === 0) && (
            <Card
              mb={6}
              bg="gradient"
              bgGradient="linear(to-r, green.50, blue.50)"
            >
              <CardBody>
                <Heading size="md" mb={2} color="blue.700">
                  ¡Bienvenido al Sistema!
                </Heading>
                <Text color="gray.700">
                  No hay datos aún. Comienza creando activos y mantenimientos
                  usando el menú superior.
                </Text>
              </CardBody>
            </Card>
          )}

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Activos</StatLabel>
                <StatNumber display="flex" alignItems="center">
                  <Icon as={FiPackage} mr={2} color="brand.500" />
                  {statsActivos?.total || 0}
                </StatNumber>
                <StatHelpText>Registrados en el sistema</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Mantenimientos</StatLabel>
                <StatNumber display="flex" alignItems="center">
                  <Icon as={FiTool} mr={2} color="blue.500" />
                  {statsMantenimientos?.total || 0}
                </StatNumber>
                <StatHelpText>Historial completo</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Activos Activos</StatLabel>
                <StatNumber display="flex" alignItems="center">
                  <Icon as={FiCheckCircle} mr={2} color="green.500" />
                  {statsActivos?.porEstado?.find((e) => e.estado === "activo")
                    ?.count || 0}
                </StatNumber>
                <StatHelpText>En funcionamiento</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>En Reparación</StatLabel>
                <StatNumber display="flex" alignItems="center">
                  <Icon as={FiAlertCircle} mr={2} color="orange.500" />
                  {statsActivos?.porEstado?.find(
                    (e) => e.estado === "en_reparacion"
                  )?.count || 0}
                </StatNumber>
                <StatHelpText>Requieren atención</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
          {/* Estado de Activos */}
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Estado de Activos
              </Heading>
              {statsActivos?.porEstado?.map((item) => (
                <Box key={item.estado} mb={3}>
                  <Text fontWeight="bold" textTransform="capitalize">
                    {item.estado}: {item.count}
                  </Text>
                </Box>
              ))}
            </CardBody>
          </Card>

          {/* Categorías de Activos */}
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Categorías de Activos
              </Heading>
              {statsActivos?.porCategoria?.map((item) => (
                <Box key={item.categoria} mb={3}>
                  <Text fontWeight="bold" textTransform="capitalize">
                    {item.categoria.replace("_", " ")}: {item.count}
                  </Text>
                </Box>
              ))}
            </CardBody>
          </Card>

          {/* Estado de Mantenimientos */}
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Estado de Mantenimientos
              </Heading>
              {statsMantenimientos?.porEstado?.map((item) => (
                <Box key={item._id} mb={3}>
                  <Text fontWeight="bold" textTransform="capitalize">
                    {item._id}: {item.cantidad}
                  </Text>
                </Box>
              ))}
            </CardBody>
          </Card>

          {/* Tipos de Mantenimiento */}
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Tipos de Mantenimiento
              </Heading>
              {statsMantenimientos?.porTipo?.map((item) => (
                <Box key={item._id} mb={3}>
                  <Text fontWeight="bold" textTransform="capitalize">
                    {item._id}: {item.cantidad}
                  </Text>
                </Box>
              ))}
            </CardBody>
          </Card>
        </Grid>
      </Box>
    </Layout>
  );
}
