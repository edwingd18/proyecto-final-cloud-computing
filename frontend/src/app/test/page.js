'use client';

import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { useState } from 'react';

export default function TestPage() {
  const [apiStatus, setApiStatus] = useState('No probado');

  const testAPI = async () => {
    try {
      const response = await fetch('http://localhost:3000/health');
      const data = await response.json();
      setApiStatus('✅ API funcionando: ' + JSON.stringify(data));
    } catch (error) {
      setApiStatus('❌ Error: ' + error.message);
    }
  };

  return (
    <Box p={8}>
      <VStack spacing={4} align="stretch">
        <Heading>Página de Prueba</Heading>
        <Text>Si ves esto, Next.js está funcionando correctamente.</Text>

        <Button onClick={testAPI} colorScheme="blue">
          Probar Conexión a API
        </Button>

        <Text>{apiStatus}</Text>
      </VStack>
    </Box>
  );
}
