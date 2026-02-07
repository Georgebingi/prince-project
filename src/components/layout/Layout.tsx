import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LogoBanner } from './LogoBanner';
import { Footer } from './Footer';
interface LayoutProps {
  children: React.ReactNode;
  title: string;
  /** When true, the logo banner is shown; when false, it is hidden. Default: true. */
  showLogoBanner?: boolean;
}
export function Layout({
  children,
  title,
  showLogoBanner = true,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 flex flex-col transition-[margin] duration-300 ${sidebarOpen ? 'lg:ml-72' : ''}`}>
        <Header title={title} onMenuClick={() => setSidebarOpen(prev => !prev)} />

        {showLogoBanner && <LogoBanner />}

        <main className="flex-1 p-4 lg:p-6">{children}</main>

        <Footer />
      </div>
    </div>;
}