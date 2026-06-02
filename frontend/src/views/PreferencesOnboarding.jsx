// OptiFit 2.0 Preferences Onboarding Screen
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Palette, Award, HelpCircle, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PreferencesOnboarding = () => {
  const { user, updatePreferences } = useAuth();
  const navigate = useNavigate();

  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [fit, setFit] = useState('Regular');
  const [budgetMin, setBudgetMin] = useState(10);
  const [budgetMax, setBudgetMax] = useState(300);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const colorsList = ["Black", "White", "Blue", "Green", "Red", "Yellow", "Brown"];
  const stylesList = [
    "Casual", "Formal", "Streetwear", "Traditional", 
    "Smart Casual", "Party Wear", "Business Casual"
  ];
  const fitsList = ["Slim", "Regular", "Oversized"];

  const handleColorToggle = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleStyleToggle = (style) => {
    setSelectedStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (selectedColors.length === 0) {
      setError('Please select at least one favorite color.');
      return;
    }
    if (selectedStyles.length === 0) {
      setError('Please select at least one favorite style.');
      return;
    }

    setSubmitting(true);
    const result = await updatePreferences({
      age: user.age,
      gender: user.gender,
      favorite_colors: selectedColors,
      favorite_styles: selectedStyles,
      preferred_fit: fit,
      budget_min: parseFloat(budgetMin),
      budget_max: parseFloat(budgetMax)
    });
    setSubmitting(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-fashion-dark p-6 transition-colors duration-300">
      
      {/* Blurred glow backdrops */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl glass-panel p-8 rounded-3xl shadow-glass-light dark:shadow-glass-dark relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 rounded-2xl gradient-gold flex items-center justify-center shadow-lg shadow-gold-500/20 mb-3">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Style Onboarding</h2>
          <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">Help OptiFit calibrate your personalized recommendation engine</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Colors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
              <Palette className="h-5 w-5 text-indigo-500" />
              <span>Which colors do you prefer?</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {colorsList.map(color => {
                const isSelected = selectedColors.includes(color);
                return (
                  <button
                    type="button"
                    key={color}
                    onClick={() => handleColorToggle(color)}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                        : 'bg-white dark:bg-slate-905 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-400'
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Styles */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
              <Award className="h-5 w-5 text-indigo-500" />
              <span>What is your style aesthetic?</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {stylesList.map(style => {
                const isSelected = selectedStyles.includes(style);
                return (
                  <button
                    type="button"
                    key={style}
                    onClick={() => handleStyleToggle(style)}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                        : 'bg-white dark:bg-slate-905 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-400'
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                    {style}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Fit & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                <HelpCircle className="h-5 w-5 text-indigo-500" />
                <span>Preferred Fit</span>
              </div>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 pr-4 h-[46px] font-medium"
              >
                {fitsList.map(f => (
                  <option key={f} value={f}>{f} Fit</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                <HelpCircle className="h-5 w-5 text-indigo-500" />
                <span>Budget Limit ($)</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 font-medium"
                  min="0"
                />
                <span className="text-slate-400 font-bold">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 font-medium"
                  min="1"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl py-3.5 font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
          >
            {submitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                Save & Continue to Dashboard
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
