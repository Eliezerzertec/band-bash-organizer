import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentProfile } from '@/hooks/useProfiles';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  LayoutDashboard,
  Church,
  Music,
  Users,
  UsersRound,
  Calendar,
  ArrowLeftRight,
  MessageSquare,
  BarChart3,
  LogOut,
  ChevronLeft,
  User,
  X,
  Star
} from 'lucide-react';
import { ValeLogoIcon } from '@/components/ui/ValeLogoIcon';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  adminOnly?: boolean;
  memberOnly?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', adminOnly: true },
  { icon: LayoutDashboard, label: 'Meu Dashboard', path: '/member-dashboard', memberOnly: true },
  { icon: Church, label: 'Igrejas', path: '/churches', adminOnly: true },
  { icon: Music, label: 'Ministérios', path: '/ministries', adminOnly: true },
  { icon: Users, label: 'Membros', path: '/members', adminOnly: true },
  { icon: UsersRound, label: 'Equipes', path: '/teams', adminOnly: true },
  { icon: Calendar, label: 'Escalas', path: '/schedules' },
  { icon: ArrowLeftRight, label: 'Substituições', path: '/substitutions' },
  { icon: Star, label: 'Avaliações', path: '/peer-evaluations' },
  { icon: MessageSquare, label: 'Mensagens', path: '/messages' },
  { icon: BarChart3, label: 'Relatórios', path: '/reports', adminOnly: true },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout, hasRole } = useAuth();
  const { data: currentProfile } = useCurrentProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isAdmin = hasRole('admin');

  const filteredNavItems = navItems.filter(item =>
    (!item.adminOnly || isAdmin) && (!item.memberOnly || !isAdmin)
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  // Close sidebar on route change for mobile (onClose excluído das deps para evitar
  // que seu re-render em MainLayout feche o menu imediatamente ao abrir)
  useEffect(() => {
    if (isMobile) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isMobile]);

  // Don't collapse on mobile
  const effectiveCollapsed = isMobile ? false : isCollapsed;

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside 
        className={cn(
          "fixed left-0 top-0 h-full sidebar-gradient flex flex-col transition-all duration-300 z-50 shadow-2xl",
          isMobile ? "w-72" : (effectiveCollapsed ? "w-20" : "w-72"),
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between">
          {!effectiveCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sidebar-primary flex items-center justify-center shadow-lg">
                <ValeLogoIcon className="w-7 h-7 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground text-lg tracking-tight">Vale Music Lavras</h1>
                <p className="text-xs text-sidebar-foreground/50">Gestão de Ministério</p>
              </div>
            </div>
          )}
          {effectiveCollapsed && !isMobile && (
            <div className="w-11 h-11 rounded-2xl bg-sidebar-primary flex items-center justify-center mx-auto shadow-lg">
              <ValeLogoIcon className="w-7 h-7 text-sidebar-primary-foreground" />
            </div>
          )}
          
          {isMobile ? (
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground/50 hover:text-sidebar-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "p-2 rounded-xl hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground/50 hover:text-sidebar-foreground",
                effectiveCollapsed && "mx-auto mt-4"
              )}
            >
              <ChevronLeft className={cn("w-5 h-5 transition-transform", effectiveCollapsed && "rotate-180")} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-1.5">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-lg shadow-sidebar-primary/30",
                    effectiveCollapsed && !isMobile && "justify-center px-3"
                  )}
                  title={effectiveCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {(!effectiveCollapsed || isMobile) && <span className="text-sm">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer - User */}
        <div className="p-4 border-t border-sidebar-border/30">
          <div className={cn(
            "flex items-center gap-3",
            effectiveCollapsed && !isMobile && "flex-col"
          )}>
            <div className="w-10 h-10 rounded-xl bg-sidebar-accent overflow-hidden flex-shrink-0 shadow-md">
              {currentProfile?.avatar_url ? (
                <img src={currentProfile.avatar_url} alt={currentProfile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-5 h-5 text-sidebar-foreground/60" />
                </div>
              )}
            </div>
            {(!effectiveCollapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{currentProfile?.name}</p>
                <p className="text-xs text-sidebar-foreground/50 capitalize">{user?.role === 'admin' ? 'Administrador' : 'Membro'}</p>
              </div>
            )}
            <button
              onClick={async () => {
                try {
                  await logout();
                  // Navegar para login após logout bem-sucedido
                  navigate('/login', { replace: true });
                } catch (error) {
                  console.error('Erro ao fazer logout:', error);
                }
              }}
              className="p-2 rounded-xl hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground/50 hover:text-sidebar-foreground"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
