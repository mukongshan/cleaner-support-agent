import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppRoutes } from './routes';
import type { UserRole } from './types/app';

export type { UserRole };

export default function App() {
  return (
    <LanguageProvider>
      <AppRoutes />
    </LanguageProvider>
  );
}
