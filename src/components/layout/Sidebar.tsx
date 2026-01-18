import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
  Settings,
  LogOut,
  ChevronLeft,
  User
} from 'lucide-react';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Church, label: 'Igrejas', path: '/churches', adminOnly: true },
  { icon: Music, label: 'Ministérios', path: '/ministries', adminOnly: true },
  { icon: Users, label: 'Membros', path: '/members', adminOnly: true },
  { icon: UsersRound, label: 'Equipes', path: '/teams', adminOnly: true },
  { icon: Calendar, label: 'Escalas', path: '/schedules' },
  { icon: ArrowLeftRight, label: 'Substituições', path: '/substitutions' },
  { icon: MessageSquare, label: 'Mensagens', path: '/messages' },
  { icon: BarChart3, label: 'Relatórios', path: '/reports', adminOnly: true },
];

export function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isAdmin = hasRole('admin');

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full sidebar-gradient flex flex-col transition-all duration-300 z-50 shadow-2xl",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sidebar-primary flex items-center justify-center shadow-lg">
              <Music className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground text-lg tracking-tight">Louvor</h1>
              <p className="text-xs text-sidebar-foreground/50">Gestão de Ministério</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-11 h-11 rounded-2xl bg-sidebar-primary flex items-center justify-center mx-auto shadow-lg">
            <Music className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-2 rounded-xl hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground/50 hover:text-sidebar-foreground",
            isCollapsed && "mx-auto mt-4"
          )}
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform", isCollapsed && "rotate-180")} />
        </button>
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
                  isCollapsed && "justify-center px-3"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer - User */}
      <div className="p-4 border-t border-sidebar-border/30">
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "flex-col"
        )}>
          <div className="w-10 h-10 rounded-xl bg-sidebar-accent overflow-hidden flex-shrink-0 shadow-md">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-5 h-5 text-sidebar-foreground/60" />
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/50 capitalize">{user?.role === 'admin' ? 'Administrador' : 'Membro'}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="p-2 rounded-xl hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground/50 hover:text-sidebar-foreground"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
