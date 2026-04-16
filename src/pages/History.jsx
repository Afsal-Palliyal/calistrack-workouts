import React, { useEffect, useState } from 'react';
import { Card } from '../components/UI/Card';
import { Clock, Dumbbell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

export function History() {
  const { currentUser } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'workouts'), 
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWorkouts(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
      setLoading(false);
    }
    fetchHistory();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <header className="mt-2 text-center md:text-left">
        <h1 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
          <Clock className="text-primary" /> Workout History
        </h1>
        <p className="text-textMuted text-sm mt-1">Your past accomplishments</p>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-textMuted py-8">Loading history...</div>
        ) : workouts.length === 0 ? (
          <Card className="text-center py-10 border-dashed border-2 border-border/50">
            <Dumbbell className="mx-auto text-textMuted mb-4 opacity-50" size={48} />
            <h3 className="text-lg font-semibold text-text">No workouts yet</h3>
            <p className="text-textMuted text-sm mt-2">Log your first workout to see it here!</p>
          </Card>
        ) : (
          workouts.map(workout => (
            <Card key={workout.id} className="hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-center mb-4 border-b border-border/50 pb-3">
                <span className="font-semibold text-lg">{format(new Date(workout.date), 'MMM dd, yyyy')}</span>
                <div className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full shadow-inner border border-primary/20">
                  {workout.exercises?.reduce((acc, ex) => acc + (ex.sets * ex.reps), 0) || 0} Total Reps
                </div>
              </div>
              
              <div className="space-y-3">
                {workout.exercises && workout.exercises.map(ex => (
                  <div key={ex.name} className="flex justify-between items-center text-sm bg-surface/30 p-3 rounded-lg border border-border/30">
                    <span className="font-medium text-text">{ex.name}</span>
                    <span className="text-textMuted bg-surface px-2 py-1 rounded text-xs font-mono">{ex.sets} sets × {ex.reps} reps</span>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
