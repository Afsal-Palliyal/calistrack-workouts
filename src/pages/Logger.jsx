import React, { useState } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Plus, Minus, FilePlus2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      await addDoc(collection(db, 'workouts'), {
        userId: currentUser.uid,
        date: new Date(date).toISOString(),
        exercises: exercises.filter(ex => ex.sets > 0 && ex.reps > 0),
        createdAt: new Date().toISOString()
      });
      navigate('/history');
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <header className="mt-2 text-center md:text-left">
        <h1 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
          <FilePlus2 className="text-primary" /> Log Workout
        </h1>
        <p className="text-textMuted text-sm mt-1">Record your daily calisthenics routine</p>
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
          <h2 className="text-lg font-semibold border-b border-border pb-2">Exercises</h2>
          
          {exercises.map((ex, idx) => (
            <div key={ex.name} className="bg-surface/50 p-4 rounded-xl border border-border/50 transition-all hover:border-primary/30">
              <h3 className="font-medium text-primary mb-3 text-lg">{ex.name}</h3>
              <div className="grid grid-cols-2 gap-4">
                
                <div className="flex flex-col items-center">
                  <span className="text-xs text-textMuted mb-2 uppercase tracking-wide">Sets</span>
                  <div className="flex items-center space-x-2 sm:space-x-3 bg-surface rounded-lg p-1 border border-border shadow-inner">
                    <button type="button" onClick={() => updateExercise(idx, 'sets', -1)} className="p-2 text-textMuted hover:text-white hover:bg-surfaceHover transition-colors rounded-md active:scale-95">
                      <Minus size={16} />
                    </button>
                    <input 
                      type="number" 
                      value={ex.sets}
                      onChange={(e) => updateExercise(idx, 'sets', 0, true, parseInt(e.target.value) || 0)}
                      className="w-10 sm:w-12 text-center bg-transparent border-none focus:outline-none focus:ring-0 font-semibold md:text-lg"
                    />
                    <button type="button" onClick={() => updateExercise(idx, 'sets', 1)} className="p-2 text-textMuted hover:text-white hover:bg-surfaceHover transition-colors rounded-md active:scale-95">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs text-textMuted mb-2 uppercase tracking-wide">Reps</span>
                  <div className="flex items-center space-x-2 sm:space-x-3 bg-surface rounded-lg p-1 border border-border shadow-inner">
                    <button type="button" onClick={() => updateExercise(idx, 'reps', -1)} className="p-2 text-textMuted hover:text-white hover:bg-surfaceHover transition-colors rounded-md active:scale-95">
                      <Minus size={16} />
                    </button>
                    <input 
                      type="number" 
                      value={ex.reps}
                      onChange={(e) => updateExercise(idx, 'reps', 0, true, parseInt(e.target.value) || 0)}
                      className="w-10 sm:w-12 text-center bg-transparent border-none focus:outline-none focus:ring-0 font-semibold md:text-lg"
                    />
                    <button type="button" onClick={() => updateExercise(idx, 'reps', 1)} className="p-2 text-textMuted hover:text-white hover:bg-surfaceHover transition-colors rounded-md active:scale-95">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={loading} className="mt-8 shadow-glass">
          {loading ? 'Saving...' : 'Save Workout'}
        </Button>
      </Card>
    </div>
  );
}
