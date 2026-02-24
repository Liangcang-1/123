import './globals.css';
import { ReactNode } from 'react';
import { Providers } from '../components/providers';
import { AppShell } from '../components/AppShell';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
