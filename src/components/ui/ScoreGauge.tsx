import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function ScoreGauge({ score, maxScore = 1000, size = 'md', label }: ScoreGaugeProps) {
  // Normalizar o score para 0-100
  const normalizedScore = Math.min((score / maxScore) * 100, 100);
  
  // Determinar cor baseado no score
  const getColor = (value: number) => {
    if (value >= 800) return '#10B981'; // Verde - Alto
    if (value >= 600) return '#3B82F6'; // Azul - Normal
    if (value >= 400) return '#F59E0B'; // Laranja - Abaixo da média
    return '#EF4444'; // Vermelho - Baixo
  };

  const color = getColor(score);

  // Dados para o gauge - 180 graus
  const data = [
    { name: 'used', value: normalizedScore },
    { name: 'unused', value: 100 - normalizedScore },
  ];

  const sizeMap = {
    sm: { height: 200, fontSize: 18 },
    md: { height: 280, fontSize: 28 },
    lg: { height: 320, fontSize: 32 },
  };

  const config = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height={config.height}>
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-col items-center -mt-20">
        <div style={{ fontSize: `${config.fontSize}px` }} className="font-bold text-foreground">
          {score}
        </div>
        <div className="text-xs text-muted-foreground">
          / {maxScore}
        </div>
        {label && (
          <div className="text-sm text-muted-foreground mt-2">
            {label}
          </div>
        )}
      </div>

      {/* Indicador de performance */}
      <div className="text-center mt-4">
        {score >= 800 && (
          <p className="text-sm font-medium text-success">🟢 Alto Desempenho</p>
        )}
        {score >= 600 && score < 800 && (
          <p className="text-sm font-medium text-primary">🔵 Desempenho Normal</p>
        )}
        {score >= 400 && score < 600 && (
          <p className="text-sm font-medium text-warning">🟠 Abaixo da Média</p>
        )}
        {score < 400 && (
          <p className="text-sm font-medium text-destructive">🔴 Baixo Desempenho</p>
        )}
      </div>
    </div>
  );
}
