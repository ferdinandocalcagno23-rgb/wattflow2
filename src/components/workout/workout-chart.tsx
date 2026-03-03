'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  TooltipProps,
} from 'recharts';
import type { WorkoutBlock } from '@/types';
import { POWER_ZONES } from '@/lib/constants';

interface WorkoutChartProps {
  blocks: WorkoutBlock[];
  currentBlockIndex?: number;
  timeInBlock?: number;
}

interface ChartData {
  name: string;
  duration: number;
  targetPower: number;
  fill: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border rounded-md shadow-lg">
        <p className="font-bold" style={{ color: data.fill }}>{data.name}</p>
        <p>Duration: {data.duration} min</p>
        <p>Target: {data.targetPower} W</p>
      </div>
    );
  }
  return null;
};

export function WorkoutChart({ blocks, currentBlockIndex, timeInBlock }: WorkoutChartProps) {
  let accumulatedTime = 0;
  const chartData = blocks.map((block) => {
    const dataPoint = {
      name: block.zone,
      duration: block.duration / 60,
      targetPower: block.targetPower,
      fill: POWER_ZONES[block.zone].color,
      startTime: accumulatedTime,
      endTime: accumulatedTime + block.duration,
    };
    accumulatedTime += block.duration;
    return dataPoint;
  });

  const maxPower = Math.max(...chartData.map((d) => d.targetPower), 100);

  let progressLineX: number | undefined;
  if (currentBlockIndex !== undefined && timeInBlock !== undefined) {
    const currentBlockStartTime = currentBlockIndex > 0 ? chartData[currentBlockIndex - 1].endTime : 0;
    progressLineX = (currentBlockStartTime + timeInBlock) / 60;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barCategoryGap={0} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis
            dataKey="duration"
            type="number"
            domain={[0, accumulatedTime / 60]}
            axisLine={false}
            tickLine={false}
            unit="m"
          />
          <YAxis domain={[0, maxPower * 1.2]} unit="W" width={40} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--foreground) / 0.1)' }} />
          <Bar dataKey="targetPower" isAnimationActive={false}>
            {chartData.map((entry, index) => (
              <Bar key={`cell-${index}`} dataKey="targetPower" fill={entry.fill} />
            ))}
          </Bar>
          {progressLineX !== undefined && (
            <ReferenceArea
              x1={0}
              x2={progressLineX}
              fill="hsl(var(--primary) / 0.2)"
              stroke="hsl(var(--primary))"
              strokeOpacity={0.6}
              ifOverflow="visible"
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
