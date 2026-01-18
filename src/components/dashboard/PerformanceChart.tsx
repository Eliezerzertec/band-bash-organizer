import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

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
    <div className="card-elevated p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">Desempenho</h3>
          <p className="text-sm text-muted-foreground">Escalas e participações</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Escalas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Presenças</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">Substituições</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="escalas" 
              stroke="hsl(262, 80%, 55%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(262, 80%, 55%)', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="presencas" 
              stroke="hsl(152, 60%, 45%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(152, 60%, 45%)', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="substituicoes" 
              stroke="hsl(25, 95%, 60%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(25, 95%, 60%)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
