import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Activity, Zap, Clock, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { WorkoutRecording } from '@/types';

interface HistoryDashboardProps {
    workouts: WorkoutRecording[];
    onDownloadTcx: (workout: WorkoutRecording) => void;
}

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({ workouts, onDownloadTcx }) => {

    // Calculate generic TSS/Stress proxy based on normalized-ish power and duration
    const pmcData = useMemo(() => {
        // Group workouts by date (YYYY-MM-DD)
        const dailyStress: Record<string, number> = {};

        // Sort oldest to newest
        const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedWorkouts.forEach(w => {
            const d = new Date(w.date);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            // Simple proxy for training stress: Duration (hrs) * Avg Power * Intensity Factor
            // Assuming FTP = 200 for generic baseline if not available
            const hrs = w.duration / 3600;
            const normalizedPowerProxy = w.avgPower * 1.05; // Faking NP
            const tssProxy = (hrs * normalizedPowerProxy * (normalizedPowerProxy / 200)) * 100;

            dailyStress[dateStr] = (dailyStress[dateStr] || 0) + (tssProxy / 100); // Scaled down for readability
        });

        return Object.entries(dailyStress).map(([date, stress]) => ({
            date,
            stress: Math.round(stress)
        })).slice(-14); // Last 14 days with activity
    }, [workouts]);

    // Calculate Power Peaks (Critical Power curve proxy)
    const powerPeaks = useMemo(() => {
        let peak5s = 0, peak1m = 0, peak5m = 0, peak20m = 0;

        workouts.forEach(w => {
            if (!w.rawData || w.rawData.length < 5) return;

            const p = w.rawData.map(d => d.power);

            // Helper to find rolling average max
            const findMaxRollingAvg = (arr: number[], windowSize: number) => {
                if (arr.length < windowSize) return 0;
                let maxAvg = 0;
                let sum = 0;
                // Init first window
                for (let i = 0; i < windowSize; i++) sum += arr[i];
                maxAvg = sum / windowSize;

                // Slide
                for (let i = windowSize; i < arr.length; i++) {
                    sum = sum - arr[i - windowSize] + arr[i];
                    const avg = sum / windowSize;
                    if (avg > maxAvg) maxAvg = avg;
                }
                return Math.round(maxAvg);
            };

            const p5s = findMaxRollingAvg(p, 5);
            const p1m = findMaxRollingAvg(p, 60);
            const p5m = findMaxRollingAvg(p, 300);
            const p20m = findMaxRollingAvg(p, 1200);

            if (p5s > peak5s) peak5s = p5s;
            if (p1m > peak1m) peak1m = p1m;
            if (p5m > peak5m) peak5m = p5m;
            if (p20m > peak20m) peak20m = p20m;
        });

        return [
            { label: '5s', watts: peak5s, name: 'Sprint' },
            { label: '1m', watts: peak1m, name: 'Anaerobic' },
            { label: '5m', watts: peak5m, name: 'VO2 Max' },
            { label: '20m', watts: peak20m, name: 'Threshold' },
        ];
    }, [workouts]);


    if (workouts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-black/20 rounded-3xl border border-white/5 h-64">
                <Activity className="w-12 h-12 text-gray-500 mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No History Yet</h3>
                <p className="text-sm text-gray-500 max-w-sm">Complete your first workout to start tracking your performance, power peaks, and download your TCX files.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {powerPeaks.map((peak, i) => (
                    <Card key={i} className="bg-gradient-to-br from-white/5 to-transparent border-white/10 overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-neon-cyan/10 rounded-full blur-xl"></div>
                        <CardContent className="p-4 relative z-10">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-neon-cyan" /> {peak.label} Peak
                            </div>
                            <div className="text-2xl font-black text-white">{peak.watts} <span className="text-sm font-normal text-gray-500">W</span></div>
                            <div className="text-xs text-neon-blue mt-1 border-t border-white/5 pt-1 uppercase tracking-widest">{peak.name}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* PMC Chart */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-neon-purple" />
                        Training Load (Estimated)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pmcData}>
                                <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="stress" fill="url(#colorStress)" radius={[4, 4, 0, 0]} name="Load Score" />
                                <defs>
                                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Workout List */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4 pl-1">Recent Workouts</h3>
                <div className="space-y-3">
                    {workouts.slice(0).reverse().map((workout, i) => (
                        <div key={workout.id || i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-white text-base">{workout.name}</span>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(workout.duration)}</span>
                                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-neon-cyan" /> {workout.avgPower}W Avg</span>
                                    <span>{new Date(workout.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => onDownloadTcx(workout)}
                                className="p-3 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan hover:text-black rounded-xl transition-all duration-300 shadow-lg shadow-neon-cyan/10 hover:shadow-neon-cyan/30"
                                title="Download TCX"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
