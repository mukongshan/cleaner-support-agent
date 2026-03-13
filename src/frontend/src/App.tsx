import React from 'react';
import { Toaster } from 'sonner';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppRoutes } from './routes';
import type { UserRole } from './types/app';

export type { UserRole };

export default function App() {
  return (
    <LanguageProvider>
      <Toaster
        position="top-center"
        richColors={false}
        duration={1000}
        icons={{ success: null, error: null, warning: null, info: null, loading: null }}
        style={{ zIndex: 99999 }}
        toastOptions={{
          unstyled: true,
          className: "z-[99999]",
          classNames: {
            toast: 'rounded-xl shadow-lg px-4 py-3 border min-w-[280px] bg-gray-50 border-gray-200 text-gray-700',
            title: 'text-center',
            description: 'text-center',
            error: 'bg-red-50 text-red-600 border-red-200/60 shadow-sm',
            success: 'bg-green-50 border-green-500 text-green-700',
            warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
            info: 'bg-gray-50 border-gray-200 text-gray-700',
          },
        }}
      />
      <AppRoutes />
    </LanguageProvider>
  );
}
