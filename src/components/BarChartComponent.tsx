
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
    [key: string]: any;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  height?: number;
}

const BarChartComponent = ({ data, xAxisLabel, yAxisLabel, title, height = 300 }: BarChartProps) => {
  // Get unique keys for bars (excluding 'name' and internal props starting with _)
  const barKeys = Object.keys(data[0] || {}).filter(
    key => key !== 'name' && key !== 'color' && !key.startsWith('_')
  );

  return (
    <div className="w-full bg-card rounded-lg border p-4">
      {title && <h3 className="text-lg font-medium mb-4 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            label={{ 
              value: xAxisLabel, 
              position: 'insideBottom', 
              offset: -10 
            }} 
          />
          <YAxis 
            label={{ 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' } 
            }} 
          />
          <Tooltip />
          <Legend />
          {barKeys.length > 0 ? (
            barKeys.map((key) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={data.find(item => item[key] !== undefined)?.color || `#${Math.floor(Math.random()*16777215).toString(16)}`} 
              />
            ))
          ) : (
            <Bar 
              dataKey="value" 
              fill="#8884d8" 
              name="Value"
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
