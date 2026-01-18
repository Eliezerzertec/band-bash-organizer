import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AnimatedIcon } from '@/components/ui/animated-icon';
import { Users } from 'lucide-react';

const skillsData = [
  { name: 'Vocal', value: 12, color: 'hsl(200, 80%, 50%)' },
  { name: 'Violão', value: 8, color: 'hsl(160, 65%, 45%)' },
  { name: 'Teclado', value: 6, color: 'hsl(330, 75%, 55%)' },
  { name: 'Bateria', value: 4, color: 'hsl(28, 95%, 55%)' },
  { name: 'Baixo', value: 3, color: 'hsl(270, 70%, 55%)' },
];

export function MembersChart() {
  return (
    <div className="card-elevated p-4 md:p-5 animate-slide-up">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <AnimatedIcon color="success" animation="pulse" size="md" className="hidden sm:flex">
            <Users className="w-5 h-5" />
          </AnimatedIcon>
          <div>
            <h3 className="font-semibold text-foreground">Membros por Habilidade</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Distribuição musical</p>
          </div>
        </div>
        <select className="text-sm bg-muted/60 rounded-xl px-2 md:px-3 py-1.5 md:py-2 border-0 focus:ring-2 focus:ring-primary/20 cursor-pointer">
          <option>Todos</option>
          <option>Ativos</option>
          <option>Inativos</option>
        </select>
      </div>

      <div className="h-52 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={skillsData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={5}
              dataKey="value"
              strokeWidth={0}
            >
              {skillsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px 12px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className="text-xs md:text-sm text-foreground ml-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
