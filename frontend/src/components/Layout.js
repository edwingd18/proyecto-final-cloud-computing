'use client';

import { Box, Container, Flex, Heading, HStack, Link as ChakraLink, Icon } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiPackage, FiTool } from 'react-icons/fi';

const NavLink = ({ href, children, icon }) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link href={href} passHref legacyBehavior>
      <ChakraLink
        px={4}
        py={2}
        rounded="md"
        bg={isActive ? 'brand.500' : 'transparent'}
        color={isActive ? 'white' : 'gray.700'}
        _hover={{
          textDecoration: 'none',
          bg: isActive ? 'brand.600' : 'gray.100',
        }}
        fontWeight={isActive ? 'bold' : 'normal'}
      >
        <HStack spacing={2}>
          {icon && <Icon as={icon} />}
          <Box>{children}</Box>
        </HStack>
      </ChakraLink>
    </Link>
  );
};

export default function Layout({ children }) {
  return (
    <Box minH="100vh">
      {/* Navbar */}
      <Box bg="white" boxShadow="sm" position="sticky" top={0} zIndex={10}>
        <Container maxW="container.xl" py={4}>
          <Flex justify="space-between" align="center">
            <Heading size="md" color="brand.600">
              Sistema de Gestión
            </Heading>

            <HStack spacing={2}>
              <NavLink href="/" icon={FiHome}>
                Dashboard
              </NavLink>
              <NavLink href="/activos" icon={FiPackage}>
                Activos
              </NavLink>
              <NavLink href="/mantenimientos" icon={FiTool}>
                Mantenimientos
              </NavLink>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>

      {/* Footer */}
      <Box as="footer" bg="gray.100" mt={12} py={6}>
        <Container maxW="container.xl">
          <Flex justify="center" align="center">
            <Box color="gray.600" fontSize="sm">
              © 2024 Sistema de Gestión de Activos y Mantenimientos
            </Box>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
