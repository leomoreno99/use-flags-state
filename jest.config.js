/**
 * ============================================================================
 * CONFIGURACIÓN DE JEST PARA TESTING
 * ============================================================================
 * 
 * Este archivo configura Jest para ejecutar nuestros tests.
 * 
 * - testEnvironment: 'jsdom' - Simula un entorno de navegador para React
 * - preset: 'ts-jest' - Permite ejecutar archivos TypeScript directamente
 * - moduleNameMapper: Mapea imports para que funcionen correctamente
 * - collectCoverageFrom: Define qué archivos incluir en el reporte de cobertura
 */

module.exports = {
  // Entorno de testing: jsdom simula un navegador para React
  testEnvironment: 'jsdom',
  
  // Preset de ts-jest para ejecutar TypeScript directamente
  preset: 'ts-jest',
  
  // Archivos que Jest debe buscar para tests
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  
  // Extensiones de archivos que Jest debe procesar
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transformar archivos TypeScript y TSX
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react'
      }
    }]
  },
  
  // Directorios que Jest debe ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Configuración de módulos (para imports)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Archivos a incluir en el reporte de cobertura
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}'
  ],
  
  // Setup files: archivos que se ejecutan antes de los tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
}
