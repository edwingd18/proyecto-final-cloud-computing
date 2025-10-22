'use client';

import { Box, VStack, Heading, Text, Button, Icon } from '@chakra-ui/react';
import { FiInbox } from 'react-icons/fi';

export default function EmptyState({
  title = 'No hay datos',
  description = 'Comienza creando tu primer registro',
  actionLabel,
  onAction,
  icon = FiInbox
}) {
  return (
    <Box
      py={16}
      px={4}
      textAlign="center"
      bg="white"
      rounded="lg"
      shadow="sm"
    >
      <VStack spacing={4}>
        {/* Ilustración SVG inline */}
        <Box position="relative" w="200px" h="200px" mx="auto">
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Fondo */}
            <circle cx="100" cy="100" r="80" fill="#EDF2F7" />

            {/* Icono */}
            <g transform="translate(70, 70)">
              <Icon
                as={icon}
                boxSize="60px"
                color="brand.300"
              />
            </g>

            {/* Decoración */}
            <circle cx="160" cy="60" r="8" fill="#CBD5E0" opacity="0.6" />
            <circle cx="40" cy="150" r="6" fill="#CBD5E0" opacity="0.6" />
            <circle cx="170" cy="140" r="5" fill="#CBD5E0" opacity="0.6" />
          </svg>
        </Box>

        <VStack spacing={2}>
          <Heading size="md" color="gray.700">
            {title}
          </Heading>
          <Text color="gray.500" maxW="md">
            {description}
          </Text>
        </VStack>

        {actionLabel && onAction && (
          <Button
            colorScheme="brand"
            size="md"
            mt={2}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
}
