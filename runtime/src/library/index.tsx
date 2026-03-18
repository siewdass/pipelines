import React from 'react';
import { DataProvider } from './database';
import { ThemeProvider } from './theme';
import { NotificationProvider } from '../components/notification';
import { SidebarProvider } from './sidebar';

interface MainProps {
  children: React.ReactNode;
}

/**
 * Main wrapper component for Pipelines runtime applications.
 * Consolidates all essential providers:
 * - DataProvider (React Query wrapper from database.tsx)
 * - ThemeProvider (Dark/Light mode)
 * - SidebarProvider (Desktop/Mobile navigation state)
 * - NotificationProvider (Notifications)
 */
export const Main: React.FC<MainProps> = ({ children }) => {
  return (
    <DataProvider>
      <ThemeProvider>
        <SidebarProvider>
          <NotificationProvider position="top-right" richColors />
          {children}
        </SidebarProvider>
      </ThemeProvider>
    </DataProvider>
  );
};
