import React, { useState } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Plus, Minus, FilePlus2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const DEFAULT_EXERCISES = [
  { name: 'Pushups', sets: 3, reps: 10 },
  { name: 'Pullups', sets: 3, reps: 5 },
  { name: 'Dips', sets: 3, reps: 8 },
  { name: 'Squats', sets: 3, reps: 15 }
];

export function Logger() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState(DEFAULT_EXERCISES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const updateExercise = (index, field, delta, isAbsolute = false, absoluteValue = 0) => {
    const newExercises = [...exercises];
    if (isAbsolute) {
        newExercises[index][field] = Math.max(0, absoluteValue);
    } else {
        newExercises[index][field] = Math.max(0, newExercises[index][field] + delta);
    }
    setExercises(newExercises);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'workouts'), {
        userId: currentUser.uid,
        date: new Date(date).toISOString(),
        exercises: exercises.filter(ex => ex.sets > 0 && ex.reps > 0),
        createdAt: serverTimestamp()
      });
      showToast('Workout saved successfully!', 'success');
      setTimeout(() => {
        navigate('/history');
      }, 1200);
    } catch (error) {
      console.error("Error saving workout:", error);
      showToast('Failed to save workout. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto relative relative">
      
      {/* Toast Notification */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-xl border ${toast.type === 'success' ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold tracking-wide">{toast.message}</span>
        </div>
      </div>

      <header className="mt-2 text-center md:text-left">
        <h1 className="text-3xl font-bold flex items-center justify-center md:justify-start gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          <FilePlus2 className="text-primary drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]" /> Log Workout
        </h1>
        <p className="text-textMuted mt-1 font-medium tracking-wide">Record your daily calisthenics routine</p>
      </header>

      <Card>
        <div className="mb-6">
          <label className="block text-sm font-medium text-textMuted mb-2">Workout Date</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white/90 border-b border-white/10 pb-3">Exercises</h2>
          
          {exercises.map((ex, idx) => (
            <div key={ex.name} className="bg-white/5 p-5 rounded-[20px] border border-white/10 transition-all hover:border-primary/40 hover:shadow-glow group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <h3 className="font-bold text-primary mb-4 text-xl tracking-tight group-hover:drop-shadow-[0_0_8px_rgba(14,165,233,0.8)] transition-all flex items-center justify-between">
                {ex.name}
              </h3>
              
              {/* Responsive Flex Container prevents overlapping on extremely small screens */}
              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                
                <div className="flex flex-col items-center flex-1 bg-black/20 p-3 rounded-2xl border border-white/5">
                  <span className="text-xs text-textMuted mb-2 uppercase tracking-wider font-bold">Sets</span>
                  <div className="flex items-center space-x-2 sm:space-x-3 w-full justify-center">
                    <button type="button" onClick={() => updateExercise(idx, 'sets', -1)} className="p-3 bg-white/5 text-textMuted hover:text-white hover:bg-white/10 border border-white/10 transition-all rounded-xl active:scale-95 shadow-sm">
                      <Minus size={18} />
                    </button>
                    <input 
                      type="number" 
                      value={ex.sets}
                      onChange={(e) => updateExercise(idx, 'sets', 0, true, parseInt(e.target.value) || 0)}
                      className="w-12 sm:w-16 text-center bg-transparent border-none focus:outline-none focus:ring-0 font-bold text-2xl"
                    />
                    <button type="button" onClick={() => updateExercise(idx, 'sets', 1)} className="p-3 bg-white/5 text-textMuted hover:text-primary hover:bg-primary/20 border border-white/10 hover:border-primary/40 transition-all rounded-xl active:scale-95 shadow-sm hover:shadow-glow">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center flex-1 bg-black/20 p-3 rounded-2xl border border-white/5">
                  <span className="text-xs text-textMuted mb-2 uppercase tracking-wider font-bold">Reps</span>
                  <div className="flex items-center space-x-2 sm:space-x-3 w-full justify-center">
                    <button type="button" onClick={() => updateExercise(idx, 'reps', -1)} className="p-3 bg-white/5 text-textMuted hover:text-white hover:bg-white/10 border border-white/10 transition-all rounded-xl active:scale-95 shadow-sm">
                      <Minus size={18} />
                    </button>
                    <input 
                      type="number" 
                      value={ex.reps}
                      onChange={(e) => updateExercise(idx, 'reps', 0, true, parseInt(e.target.value) || 0)}
                      className="w-12 sm:w-16 text-center bg-transparent border-none focus:outline-none focus:ring-0 font-bold text-2xl"
                    />
                    <button type="button" onClick={() => updateExercise(idx, 'reps', 1)} className="p-3 bg-white/5 text-textMuted hover:text-accent hover:bg-accent/20 border border-white/10 hover:border-accent/40 transition-all rounded-xl active:scale-95 shadow-sm hover:shadow-glow-accent">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSubmitting} 
          className={`mt-8 shadow-glass transition-all duration-300 ${isSubmitting ? 'opacity-70 scale-95 pointer-events-none bg-primaryHover' : ''}`}
        >
          {isSubmitting ? 'Saving...' : 'Save Workout'}
        </Button>
      </Card>
    </div>
  );
}
