import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/toast-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KEM - Kauvery Emergency Medicine Learning & Assessment',
  description: 'Production-ready Emergency Medicine training, ACLS modules, proctored assessments, and certified residency evaluation platform for Kauvery Hospital.',
  keywords: [
    'Kauvery Hospital',
    'Emergency Medicine',
    'ACLS Certification',
    'Airway Management',
    'Medical Assessment',
    'Proctored Exams',
  ],
  openGraph: {
    title: 'KEM Webapp - Emergency Medicine Platform',
    description: 'Kauvery Hospital Emergency Medicine Learning & Assessment System',
    url: 'https://kem.kauvery.org',
    siteName: 'KEM Webapp',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white`}>
        <ThemeProvider defaultTheme="dark">
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
