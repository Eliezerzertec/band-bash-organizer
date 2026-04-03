import { ReactNode, useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleClose = useCallback(() => setSidebarOpen(false), []);
  const handleMenuClick = useCallback(() => setSidebarOpen(true), []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={handleClose} />
      <div className={cn(
        "min-h-screen flex flex-col transition-all duration-300",
        isMobile === false && "ml-72"
      )}>
        <Header 
          title={title} 
          subtitle={subtitle} 
          onMenuClick={handleMenuClick}
        />
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
