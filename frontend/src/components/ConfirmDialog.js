'use client';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Text,
  VStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiAlertTriangle, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { useRef } from 'react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger', // 'danger', 'warning', 'info'
  isLoading = false,
  itemName = ''
}) {
  const cancelRef = useRef();

  const colorScheme = {
    danger: 'red',
    warning: 'orange',
    info: 'blue'
  }[type] || 'red';

  const icon = {
    danger: FiTrash2,
    warning: FiAlertTriangle,
    info: FiSave
  }[type] || FiAlertTriangle;

  const iconBg = useColorModeValue(
    `${colorScheme}.50`,
    `${colorScheme}.900`
  );
  const iconColor = `${colorScheme}.500`;

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
    >
      <AlertDialogOverlay backdropFilter="blur(4px)">
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            <VStack spacing={3} align="center" pt={2}>
              <Icon
                as={icon}
                boxSize={12}
                color={iconColor}
                bg={iconBg}
                p={3}
                rounded="full"
              />
              <Text>{title}</Text>
            </VStack>
          </AlertDialogHeader>

          <AlertDialogBody textAlign="center" pb={4}>
            <VStack spacing={2}>
              {description && (
                <Text color="gray.600">{description}</Text>
              )}
              {itemName && (
                <Text fontWeight="bold" color="gray.800">
                  "{itemName}"
                </Text>
              )}
              {type === 'danger' && (
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Esta acción no se puede deshacer.
                </Text>
              )}
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter justifyContent="center" gap={3}>
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="ghost"
              leftIcon={<FiX />}
            >
              {cancelText}
            </Button>
            <Button
              colorScheme={colorScheme}
              onClick={onConfirm}
              isLoading={isLoading}
              loadingText="Procesando..."
            >
              {confirmText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
