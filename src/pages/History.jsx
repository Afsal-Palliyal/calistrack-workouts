import React, { useEffect, useState } from 'react';
import { Card } from '../components/UI/Card';
import { Clock, Dumbbell, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function History() {
  const { currentUser } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    setLoading(true);
    const q = query(
      collection(db, 'workouts'), 
      where('userId', '==', currentUser.uid),
      orderBy('date', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWorkouts(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching history:", error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [currentUser]);

  const handleDelete = async (docId) => {
    if (window.confirm("Are you sure you want to delete this workout entry?")) {
      // Optimistic UI Update: instantly remove from screen
      setWorkouts(currentWorkouts => currentWorkouts.filter(w => w.id !== docId));
      
      try {
        await deleteDoc(doc(db, 'workouts', docId));
        toast.error('Workout deleted', { icon: '🗑️' });
      } catch (error) {
        console.error("Error deleting workout:", error);
        toast.error("Failed to delete workout.");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mt-2 text-center md:text-left">
        <h1 className="text-3xl font-bold flex items-center justify-center md:justify-start gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          <Clock className="text-primary drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]" /> Workout History
        </h1>
        <p className="text-textMuted mt-1 font-medium tracking-wide">Your past accomplishments</p>
      </header>

      <div className="space-y-4">
        {loading ? (
          <>
            <Card className="animate-pulse bg-white/5 border-white/5">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <div className="h-6 w-32 bg-white/10 rounded-md"></div>
                <div className="flex gap-3">
                  <div className="h-6 w-24 bg-white/10 rounded-full"></div>
                  <div className="h-6 w-6 bg-white/10 rounded-md"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-black/10">
                  <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                  <div className="h-5 w-24 bg-white/10 rounded-md"></div>
                </div>
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-black/10">
                  <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                  <div className="h-5 w-24 bg-white/10 rounded-md"></div>
                </div>
              </div>
            </Card>
            <Card className="animate-pulse bg-white/5 border-white/5">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <div className="h-6 w-32 bg-white/10 rounded-md"></div>
                <div className="flex gap-3">
                  <div className="h-6 w-24 bg-white/10 rounded-full"></div>
                  <div className="h-6 w-6 bg-white/10 rounded-md"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-black/10">
                  <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                  <div className="h-5 w-24 bg-white/10 rounded-md"></div>
                </div>
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-black/10">
                  <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                  <div className="h-5 w-24 bg-white/10 rounded-md"></div>
                </div>
              </div>
            </Card>
            <Card className="animate-pulse bg-white/5 border-white/5">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <div className="h-6 w-32 bg-white/10 rounded-md"></div>
                <div className="flex gap-3">
                  <div className="h-6 w-24 bg-white/10 rounded-full"></div>
                  <div className="h-6 w-6 bg-white/10 rounded-md"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-black/10">
                  <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                  <div className="h-5 w-24 bg-white/10 rounded-md"></div>
                </div>
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-black/10">
                  <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                  <div className="h-5 w-24 bg-white/10 rounded-md"></div>
                </div>
              </div>
            </Card>
          </>
        ) : workouts.length === 0 ? (
          <Card className="text-center py-10 border-dashed border-2 border-white/10 bg-white/5">
            <Dumbbell className="mx-auto text-textMuted mb-4 opacity-50 drop-shadow-md" size={48} />
            <h3 className="text-lg font-bold text-white/90">No workouts yet</h3>
            <p className="text-textMuted text-sm mt-2">Log your first workout to see it here!</p>
          </Card>
        ) : (
          workouts.map(workout => (
            <Card key={workout.id} className="hover:border-primary/40 hover:shadow-glow transition-all duration-300 group">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                <span className="font-bold text-lg text-white/95 group-hover:text-primary transition-colors">{format(new Date(workout.date), 'MMM dd, yyyy')}</span>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-inner border border-primary/30 group-hover:bg-primary/30 transition-colors">
                    {workout.exercises?.reduce((acc, ex) => acc + (ex.sets * ex.reps), 0) || 0} Total Reps
                  </div>
                  <button 
                    onClick={() => handleDelete(workout.id)}
                    className="text-textMuted hover:text-red-500 hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all p-1.5 rounded-md hover:bg-white/5 active:scale-95"
                    title="Delete workout"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {workout.exercises && workout.exercises.map(ex => (
                  <div key={ex.name} className="flex justify-between items-center text-sm bg-black/20 p-3.5 rounded-xl border border-white/5 hover:border-primary/20 transition-colors">
                    <span className="font-bold text-white/80">{ex.name}</span>
                    <span className="text-primary font-mono bg-primary/10 px-2.5 py-1 rounded-md text-xs border border-primary/20 shadow-inner">{ex.sets} sets × {ex.reps} reps</span>
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
