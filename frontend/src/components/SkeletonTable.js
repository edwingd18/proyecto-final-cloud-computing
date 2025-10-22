'use client';

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  Box
} from '@chakra-ui/react';

export default function SkeletonTable({
  rows = 5,
  columns = 6,
  headers = []
}) {
  return (
    <Box overflowX="auto" bg="white" rounded="lg" shadow="sm">
      <Table variant="simple">
        <Thead>
          <Tr>
            {headers.length > 0 ? (
              headers.map((header, index) => (
                <Th key={index}>{header}</Th>
              ))
            ) : (
              Array.from({ length: columns }).map((_, index) => (
                <Th key={index}>
                  <Skeleton height="16px" width="80px" />
                </Th>
              ))
            )}
          </Tr>
        </Thead>
        <Tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <Tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Td key={colIndex}>
                  <Skeleton
                    height="16px"
                    width={`${60 + Math.random() * 40}%`}
                    startColor="gray.100"
                    endColor="gray.200"
                  />
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
