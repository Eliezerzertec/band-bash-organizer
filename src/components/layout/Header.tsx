import { Bell, Search, User, Settings, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="header-gradient px-4 md:px-8 py-4 md:py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMenuClick}
              className="text-header-foreground/70 hover:text-header-foreground hover:bg-white/10 rounded-xl flex-shrink-0"
            >
              <Menu className="w-6 h-6" />
            </Button>
          )}
          
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-semibold text-header-foreground truncate">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-header-foreground/60 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {/* Search - Hidden on mobile */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-header-foreground/40" />
            <Input 
              placeholder="Search anything here..." 
              className="pl-11 w-72 bg-white/10 border-white/10 text-header-foreground placeholder:text-header-foreground/40 rounded-xl focus:bg-white/15 focus:border-white/20"
            />
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-header-foreground/70 hover:text-header-foreground hover:bg-white/10 rounded-xl">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-warning text-warning-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-xl">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium text-sm">Nova escala disponível</span>
                <span className="text-xs text-muted-foreground">Você foi escalado para domingo, 19h</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium text-sm">Pedido de substituição</span>
                <span className="text-xs text-muted-foreground">Carlos solicitou substituição</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium text-sm">Mensagem do líder</span>
                <span className="text-xs text-muted-foreground">Ensaio confirmado para sábado</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings - Hidden on mobile */}
          <Button variant="ghost" size="icon" className="text-header-foreground/70 hover:text-header-foreground hover:bg-white/10 rounded-xl hidden md:flex">
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 md:gap-3 hover:bg-white/10 rounded-xl px-2 md:pl-3 md:pr-4">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-white/15 overflow-hidden shadow-md">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4 md:w-5 md:h-5 text-header-foreground/70" />
                    </div>
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium text-header-foreground">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
