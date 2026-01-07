import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Cap Outro - AI-Powered Investor Outreach',
  description: 'Transform your investor lists into sequenced, personalized outreach campaigns with real-time engagement tracking.',
  keywords: ['fundraising', 'investor outreach', 'capital raising', 'startup'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ClientProviders>
          <main id="main-content">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
