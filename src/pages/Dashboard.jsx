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
        
        if (!dailyTotals[formattedDate]) {
          dailyTotals[formattedDate] = { Pushups: 0, Pullups: 0, Dips: 0, _total: 0 };
        }
        
        let dayTotal = 0;
        if (data.exercises && Array.isArray(data.exercises)) {
           data.exercises.forEach(ex => {
             const vol = (parseInt(ex.reps) || 0) * (parseInt(ex.sets) || 1);
             dayTotal += vol;
             
             // Track core movements for volume trend
             if (ex.name === 'Pushups') dailyTotals[formattedDate].Pushups += vol;
             if (ex.name === 'Pullups') dailyTotals[formattedDate].Pullups += vol;
             if (ex.name === 'Dips') dailyTotals[formattedDate].Dips += vol;
           });
        }
        
        dailyTotals[formattedDate]._total += dayTotal;

        // Add to weekly total if within the current week
        if (isAfter(new Date(docDate), new Date(startOfCurrentWeek)) || new Date(docDate).toISOString() === startOfCurrentWeek) {
          currentWeeklyReps += dayTotal;
        }
      });

      const finalChartData = Object.keys(dailyTotals).map(date => ({
        date,
        Pushups: dailyTotals[date].Pushups,
        Pullups: dailyTotals[date].Pullups,
        Dips: dailyTotals[date].Dips,
      }));
      
      // Ensure there's always a baseline to render empty charts gracefully
      if (finalChartData.length === 0) {
          finalChartData.push({ date: format(new Date(), 'MMM dd'), Pushups: 0, Pullups: 0, Dips: 0 });
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
        <div className="bg-[#1A1A1A] p-3 rounded-[20px] border border-white/10">
          <Trophy className="text-accent" size={28} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
          <Card className="flex flex-col items-center justify-center p-6 lg:p-8 bg-[#1A1A1A] border border-white/10 transition-all group cursor-default h-full">
            <Flame size={40} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
            {loading ? <div className="w-16 h-12 bg-white/10 animate-pulse rounded-xl mb-1" /> : <span className="text-5xl font-bold text-white">{weeklyReps}</span>}
            <span className="text-[12px] font-bold text-primary uppercase tracking-widest mt-3 text-center opacity-80">Weekly Reps</span>
          </Card>
          <Card className="flex flex-col items-center justify-center p-6 lg:p-8 bg-[#1A1A1A] border border-white/10 transition-all hover:bg-white/5 group cursor-pointer h-full">
            <Trophy size={40} className="text-accent mb-4 group-hover:scale-110 transition-transform" />
            {loading ? <div className="w-16 h-12 bg-white/10 animate-pulse rounded-xl mb-1" /> : <span className="text-5xl font-bold text-white">{totalWorkouts}</span>}
            <span className="text-[12px] font-bold text-accent uppercase tracking-widest mt-3 text-center opacity-80">Workouts (30D)</span>
          </Card>
        </div>

        {/* Right Column (Chart) */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col min-h-[350px]">
            <h2 className="text-xl font-bold mb-6 text-white/90">Volume Trend (Core Movements)</h2>
            <div className="flex-1 w-full relative min-h-[300px]">
              <div className="absolute inset-0 w-full h-full">
                {loading ? (
                  <div className="w-full h-full bg-white/5 animate-pulse rounded-[20px]" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} width={40} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }} 
                        itemStyle={{ fontWeight: 'bold' }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                      />
                      <Line 
                        name="Pushups"
                        type="monotone" 
                        dataKey="Pushups" 
                        stroke="#0ea5e9" 
                        strokeWidth={3} 
                        dot={{ fill: '#09090b', stroke: '#0ea5e9', strokeWidth: 2, r: 3 }} 
                        activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }} 
                        style={{ filter: "drop-shadow(0px 4px 8px rgba(14, 165, 233, 0.4))" }}
                      />
                      <Line 
                        name="Pullups"
                        type="monotone" 
                        dataKey="Pullups" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ fill: '#09090b', stroke: '#10b981', strokeWidth: 2, r: 3 }} 
                        activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} 
                        style={{ filter: "drop-shadow(0px 4px 8px rgba(16, 185, 129, 0.4))" }}
                      />
                      <Line 
                        name="Dips"
                        type="monotone" 
                        dataKey="Dips" 
                        stroke="#c026d3" 
                        strokeWidth={3} 
                        dot={{ fill: '#09090b', stroke: '#c026d3', strokeWidth: 2, r: 3 }} 
                        activeDot={{ r: 6, fill: '#c026d3', stroke: '#fff', strokeWidth: 2 }} 
                        style={{ filter: "drop-shadow(0px 4px 8px rgba(192, 38, 211, 0.4))" }}
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
