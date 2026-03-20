import React from 'react';
import { HashRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { DataProvider } from './database';
import { ThemeProvider } from './theme';
import { NotificationProvider } from '../components/notification';
import { SidebarProvider } from './sidebar';

interface MainProps {
  children: React.ReactNode;
}

/**
 * Main wrapper component for Pipelines runtime applications.
 */
export const Main: React.FC<MainProps> = ({ children }) => {
  return (
    <HelmetProvider>
      <HashRouter>
        <DataProvider>
          <ThemeProvider>
            <SidebarProvider>
              <NotificationProvider position="top-right" richColors />
              {children}
            </SidebarProvider>
          </ThemeProvider>
        </DataProvider>
      </HashRouter>
    </HelmetProvider>
  );
};
