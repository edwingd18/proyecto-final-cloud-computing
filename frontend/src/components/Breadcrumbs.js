'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Box,
  Icon
} from '@chakra-ui/react';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Generar breadcrumbs desde la ruta actual
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Inicio', href: '/' }];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;

      // Traducir nombres de rutas
      const names = {
        'activos': 'Activos',
        'mantenimientos': 'Mantenimientos',
        'nuevo': 'Nuevo',
        'editar': 'Editar'
      };

      // Si es un ID (UUID o número), mostrar "Detalles"
      const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(path) || /^\d+$/.test(path);

      breadcrumbs.push({
        name: isId ? 'Detalles' : (names[path] || path),
        href: currentPath,
        isCurrentPage: index === paths.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // No mostrar breadcrumbs en la home
  if (pathname === '/') {
    return null;
  }

  return (
    <Box bg="white" borderBottom="1px" borderColor="gray.200" py={3} px={4}>
      <Breadcrumb
        spacing={2}
        separator={<Icon as={FiChevronRight} color="gray.400" boxSize={4} />}
        fontSize="sm"
      >
        {breadcrumbs.map((crumb, index) => (
          <BreadcrumbItem
            key={crumb.href}
            isCurrentPage={crumb.isCurrentPage}
          >
            {index === 0 ? (
              <Link href={crumb.href} passHref legacyBehavior>
                <BreadcrumbLink
                  display="flex"
                  alignItems="center"
                  gap={1}
                  color={crumb.isCurrentPage ? 'gray.700' : 'gray.500'}
                  _hover={{ color: 'brand.500', textDecoration: 'none' }}
                >
                  <Icon as={FiHome} boxSize={4} />
                  {crumb.name}
                </BreadcrumbLink>
              </Link>
            ) : crumb.isCurrentPage ? (
              <BreadcrumbLink
                fontWeight="medium"
                color="brand.600"
                cursor="default"
              >
                {crumb.name}
              </BreadcrumbLink>
            ) : (
              <Link href={crumb.href} passHref legacyBehavior>
                <BreadcrumbLink
                  color="gray.500"
                  _hover={{ color: 'brand.500', textDecoration: 'none' }}
                >
                  {crumb.name}
                </BreadcrumbLink>
              </Link>
            )}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    </Box>
  );
}
