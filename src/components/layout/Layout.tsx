import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LogoBanner } from './LogoBanner';
import { Footer } from './Footer';
interface LayoutProps {
  children: React.ReactNode;
  title: string;
}
export function Layout({ children, title }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-72">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />

        <LogoBanner />

        <main className="flex-1 p-4 lg:p-6">{children}</main>

        <Footer />
      </div>
    </div>);

}