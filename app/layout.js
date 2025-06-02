import { generalMetadata } from '@/lib/MetaData';
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

import AppBody from './AppBody'; // Import the new AppBody component

export const metadata = generalMetadata;
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <AppBody>{children}</AppBody> {/* Wrap children with AppBody */}
        </AuthProvider>
      </body>
    </html>
  );
}