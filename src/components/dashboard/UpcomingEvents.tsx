import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedIcon } from '@/components/ui/animated-icon';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  team: string;
  status: 'confirmed' | 'pending' | 'needs_subs';
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Culto de Domingo',
    date: '19 Jan',
    time: '19:00',
    location: 'Templo Principal',
    team: 'Equipe Alpha',
    status: 'confirmed'
  },
  {
    id: '2',
    title: 'Célula Jovem',
    date: '21 Jan',
    time: '20:00',
    location: 'Salão Social',
    team: 'Equipe Beta',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Culto de Quarta',
    date: '22 Jan',
    time: '19:30',
    location: 'Templo Principal',
    team: 'Equipe Gamma',
    status: 'needs_subs'
  },
  {
    id: '4',
    title: 'Ensaio Geral',
    date: '25 Jan',
    time: '15:00',
    location: 'Sala de Ensaio',
    team: 'Todas as Equipes',
    status: 'confirmed'
  },
];

const statusStyles = {
  confirmed: {
    bg: 'bg-success',
    text: 'text-success-foreground',
    label: 'Confirmado'
  },
  pending: {
    bg: 'bg-warning-light',
    text: 'text-warning',
    label: 'Pendente'
  },
  needs_subs: {
    bg: 'bg-destructive-light',
    text: 'text-destructive',
    label: 'Precisa Subs.'
  }
};

export function UpcomingEvents() {
  return (
    <div className="card-elevated p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <AnimatedIcon color="primary" animation="bounce" size="md">
            <Calendar className="w-5 h-5" />
          </AnimatedIcon>
          <div>
            <h3 className="font-semibold text-foreground">Próximos Eventos</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Agenda dos próximos cultos</p>
          </div>
        </div>
        <button className="text-sm text-primary font-medium hover:underline">
          Ver agenda completa
        </button>
      </div>

      <div className="space-y-3">
        {mockEvents.map((event) => {
          const status = statusStyles[event.status];
          
          return (
            <div 
              key={event.id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-all cursor-pointer group"
            >
              {/* Date Badge */}
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <span className="text-[10px] text-primary font-semibold uppercase tracking-wide">
                  {event.date.split(' ')[1]}
                </span>
                <span className="text-xl font-bold text-primary">
                  {event.date.split(' ')[0]}
                </span>
              </div>

              {/* Event Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    {event.team}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <span className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-transform group-hover:scale-105",
                status.bg, status.text
              )}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
