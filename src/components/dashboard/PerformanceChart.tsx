import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { AnimatedIcon } from '@/components/ui/animated-icon';
import { BarChart3 } from 'lucide-react';

const performanceData = [
  { month: 'Jan', escalas: 12, presencas: 11, substituicoes: 2 },
  { month: 'Fev', escalas: 14, presencas: 13, substituicoes: 3 },
  { month: 'Mar', escalas: 16, presencas: 14, substituicoes: 4 },
  { month: 'Abr', escalas: 15, presencas: 15, substituicoes: 1 },
  { month: 'Mai', escalas: 18, presencas: 16, substituicoes: 3 },
  { month: 'Jun', escalas: 20, presencas: 19, substituicoes: 2 },
];

export function PerformanceChart() {
  return (
    <div className="card-elevated p-4 md:p-5 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <AnimatedIcon color="purple" animation="glow" size="md" className="hidden sm:flex">
            <BarChart3 className="w-5 h-5" />
          </AnimatedIcon>
          <div>
            <h3 className="font-semibold text-foreground">Desempenho</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Escalas e participações</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Escalas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Presenças</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">Substituições</span>
          </div>
        </div>
      </div>

      <div className="h-56 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px 12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="escalas" 
              stroke="hsl(200, 80%, 50%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(200, 80%, 50%)', strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="presencas" 
              stroke="hsl(160, 65%, 45%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(160, 65%, 45%)', strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="substituicoes" 
              stroke="hsl(28, 95%, 55%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(28, 95%, 55%)', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
