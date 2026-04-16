import React, { useEffect, useState } from 'react';
import { Card } from '../components/UI/Card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Flame, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { format, subDays, isAfter, startOfWeek } from 'date-fns';

export function Dashboard() {
  const { currentUser } = useAuth();
  const [weeklyReps, setWeeklyReps] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkouts() {
      if (!currentUser) return;
      try {
        const workoutsRef = collection(db, 'workouts');
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
        const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();

        const q = query(
          workoutsRef, 
          where('userId', '==', currentUser.uid),
          where('date', '>=', thirtyDaysAgo),
          orderBy('date', 'asc')
        );

        const snapshot = await getDocs(q);
        let currentWeeklyReps = 0;
        const dailyTotals = {};

        snapshot.forEach(doc => {
          const data = doc.data();
          const docDate = data.date;
          
          let dayTotal = 0;
          if (data.exercises && Array.isArray(data.exercises)) {
             dayTotal = data.exercises.reduce((acc, ex) => acc + (parseInt(ex.reps) || 0) * (parseInt(ex.sets) || 1), 0);
          }

          if (isAfter(new Date(docDate), new Date(startOfCurrentWeek))) {
            currentWeeklyReps += dayTotal;
          }

          const formattedDate = format(new Date(docDate), 'MMM dd');
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
        
        if (finalChartData.length === 0) {
            finalChartData.push({ date: format(new Date(), 'MMM dd'), reps: 0 });
        }

        setChartData(finalChartData);
        setWeeklyReps(currentWeeklyReps);
      } catch (error) {
        console.error("Error fetching workouts:", error);
      }
      setLoading(false);
    }
    fetchWorkouts();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-textMuted text-sm">Welcome back</p>
        </div>
        <div className="bg-surface p-2 rounded-full border border-border shadow-glass">
          <Trophy className="text-accent" size={24} />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-surface to-surfaceHover border-primary/20 hover:border-primary/50 transition-colors">
          <Flame size={32} className="text-primary mb-2" />
          <span className="text-3xl font-bold">{loading ? '-' : weeklyReps}</span>
          <span className="text-xs text-textMuted uppercase tracking-wider mt-1 text-center">Weekly Reps</span>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 cursor-pointer hover:border-primary/50 transition-colors">
          <Trophy size={32} className="text-accent mb-2" />
          <span className="text-3xl font-bold">{loading ? '-' : chartData.length > 1 ? chartData.length : (chartData[0]?.reps === 0 ? 0 : 1)}</span>
          <span className="text-xs text-textMuted uppercase tracking-wider mt-1 text-center">Workouts (30D)</span>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-6">Progress (Last 30 Days)</h2>
        <div className="h-64 w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full text-textMuted">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171e2e', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }} 
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  cursor={{ stroke: '#222b40', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="reps" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
