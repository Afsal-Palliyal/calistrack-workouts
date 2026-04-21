import React, { useEffect, useState } from 'react';
import { Card } from '../components/UI/Card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Flame, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { format, subDays, isAfter, startOfWeek } from 'date-fns';

export function Dashboard() {
  const { currentUser } = useAuth();
  const [weeklyReps, setWeeklyReps] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    setLoading(true);
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();

    const q = query(
      collection(db, 'workouts'), 
      where('userId', '==', currentUser.uid),
      where('date', '>=', thirtyDaysAgo),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let currentWeeklyReps = 0;
      const dailyTotals = {};
      let uniqueWorkoutDays = new Set();

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const docDate = data.date;
        
        // Count unique workout days over last 30d
        const formattedDate = format(new Date(docDate), 'MMM dd');
        uniqueWorkoutDays.add(formattedDate);
        
        let dayTotal = 0;
        if (data.exercises && Array.isArray(data.exercises)) {
           dayTotal = data.exercises.reduce((acc, ex) => acc + (parseInt(ex.reps) || 0) * (parseInt(ex.sets) || 1), 0);
        }

        // Add to weekly total if within the current week
        if (isAfter(new Date(docDate), new Date(startOfCurrentWeek)) || new Date(docDate).toISOString() === startOfCurrentWeek) {
          currentWeeklyReps += dayTotal;
        }

        // Aggregate per day for the chart
        if (dailyTotals[formattedDate]) {
           dailyTotals[formattedDate] += dayTotal;
        } else {
           dailyTotals[formattedDate] = dayTotal;
        }
      });

      const finalChartData = Object.keys(dailyTotals).map(date => ({
        date,
        reps: dailyTotals[date]
      }));
      
      // Ensure there's always a baseline to render empty charts gracefully
      if (finalChartData.length === 0) {
          finalChartData.push({ date: format(new Date(), 'MMM dd'), reps: 0 });
      }

      setChartData(finalChartData);
      setWeeklyReps(currentWeeklyReps);
      setTotalWorkouts(uniqueWorkoutDays.size);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching workouts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Dashboard</h1>
          <p className="text-textMuted font-medium tracking-wide mt-1">Welcome back</p>
        </div>
        <div className="bg-white/5 p-3 rounded-[20px] border border-white/10 shadow-glass backdrop-blur-md">
          <Trophy className="text-accent drop-shadow-[0_0_8px_rgba(192,38,211,0.8)]" size={28} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
          <Card className="flex flex-col items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-primary/20 via-white/5 to-transparent border-primary/30 hover:border-primary/50 transition-all hover:shadow-glow group cursor-default h-full">
            <Flame size={40} className="text-primary mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(14,165,233,0.8)]" />
            <span className="text-5xl font-bold text-white">{loading ? '-' : weeklyReps}</span>
            <span className="text-[12px] font-bold text-primary uppercase tracking-widest mt-3 text-center opacity-80">Weekly Reps</span>
          </Card>
          <Card className="flex flex-col items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-accent/20 via-white/5 to-transparent border-accent/30 hover:border-accent/50 transition-all hover:shadow-glow-accent group cursor-pointer h-full">
            <Trophy size={40} className="text-accent mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(192,38,211,0.8)]" />
            <span className="text-5xl font-bold text-white">{loading ? '-' : totalWorkouts}</span>
            <span className="text-[12px] font-bold text-accent uppercase tracking-widest mt-3 text-center opacity-80">Workouts (30D)</span>
          </Card>
        </div>

        {/* Right Column (Chart) */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col min-h-[350px]">
            <h2 className="text-xl font-bold mb-6 text-white/90">Progress (Last 30 Days)</h2>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-textMuted font-medium">Loading chart...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} width={40} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }} 
                        itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="reps" 
                        stroke="#0ea5e9" 
                        strokeWidth={4} 
                        dot={{ fill: '#09090b', stroke: '#0ea5e9', strokeWidth: 2, r: 4 }} 
                        activeDot={{ r: 7, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }} 
                        style={{ filter: "drop-shadow(0px 4px 8px rgba(14, 165, 233, 0.4))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
