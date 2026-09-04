import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: {
    default: 'শিক্ষা — বাংলাদেশের সেরা অনলাইন শিক্ষা প্ল্যাটফর্ম',
    template: '%s | শিক্ষা',
  },
  description:
    'বিশেষজ্ঞ শিক্ষকদের সাথে ভর্তি পরীক্ষা, চাকরি প্রস্তুতি ও দক্ষতা উন্নয়নের কোর্স করুন। বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন শিক্ষা প্ল্যাটফর্ম।',
  keywords: ['বাংলা কোর্স', 'অনলাইন শিক্ষা', 'ভর্তি পরীক্ষা', 'চাকরির প্রস্তুতি', 'elearning bangladesh'],
  authors: [{ name: 'শিক্ষা টিম' }],
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    siteName: 'শিক্ষা',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-bangla bg-surface text-[#e6edf3] antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#161b22',
                  color: '#e6edf3',
                  border: '1px solid #30363d',
                  fontFamily: 'Hind Siliguri, Noto Sans Bengali, sans-serif',
                },
                success: { iconTheme: { primary: '#3fb950', secondary: '#161b22' } },
                error:   { iconTheme: { primary: '#f85149', secondary: '#161b22' } },
              }}
            />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
