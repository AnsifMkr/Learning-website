import React from 'react';
import './globals.css';
import Navbar from './components/Navbar';
import { ClerkProvider } from '@clerk/nextjs';
import ClerkReduxSync from './components/ClerkReduxSync';
import ClientProvider from './components/ClientProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ClientProvider>
            <ClerkReduxSync />
            <Navbar />
            {children}
          </ClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
