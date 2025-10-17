import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BumaView - 면접 준비의 새로운 기준',
  description: '체계적이고 효율적인 면접 준비를 위한 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}