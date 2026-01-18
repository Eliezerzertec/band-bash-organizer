import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const skillsData = [
  { name: 'Vocal', value: 12, color: 'hsl(262, 80%, 55%)' },
  { name: 'Violão', value: 8, color: 'hsl(152, 60%, 45%)' },
  { name: 'Teclado', value: 6, color: 'hsl(330, 70%, 55%)' },
  { name: 'Bateria', value: 4, color: 'hsl(25, 95%, 60%)' },
  { name: 'Baixo', value: 3, color: 'hsl(200, 80%, 50%)' },
];

export function MembersChart() {
  return (
    <div className="card-elevated p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">Membros por Habilidade</h3>
          <p className="text-sm text-muted-foreground">Distribuição musical</p>
        </div>
        <select className="text-sm bg-muted rounded-lg px-3 py-1.5 border-0 focus:ring-2 focus:ring-primary/20">
          <option>Todos</option>
          <option>Ativos</option>
          <option>Inativos</option>
        </select>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={skillsData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {skillsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
