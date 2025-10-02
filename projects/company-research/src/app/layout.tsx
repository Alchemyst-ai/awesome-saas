import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Company Research Agent',
  description: 'AI-powered company analysis tool',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}