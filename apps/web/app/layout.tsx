import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Providers } from '../components/providers';

const links = [
  '/dashboard',
  '/projects',
  '/tools',
  '/generate/image',
  '/generate/video',
  '/assets',
  '/tasks',
  '/settings',
  '/billing',
  '/admin',
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <div className="min-h-screen">
            <header className="bg-slate-900 text-white p-4 flex gap-3 flex-wrap text-sm">
              {links.map((item) => (
                <Link key={item} href={item} className="hover:underline">
                  {item}
                </Link>
              ))}
            </header>
            <main className="p-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
