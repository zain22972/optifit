// OptiFit 2.0 User Dashboard Screen
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, CloudSun, Heart, Bookmark, Eye, Check, Flame, 
  HelpCircle, ChevronRight, UserCheck, TrendingUp, Info, X
} from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Dashboard = ({ weatherState }) => {
  const { user } = useAuth();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard stats
  const [stats, setStats] = useState({
    wardrobeCount: 0,
    savedCount: 0,
    styleScore: 88,
  });

  // Modal details state
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch recommendations whenever weather state changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch recommendations
        const recResponse = await api.get(`/recommendations?weather=${weatherState}`);
        setRecommendations(recResponse.data);
        
        // Fetch stats
        const [wardrobeRes, savedRes] = await Promise.all([
          api.get('/wardrobe'),
          api.get('/saved-outfits')
        ]);
        
        setStats({
          wardrobeCount: wardrobeRes.data.length,
          savedCount: savedRes.data.length,
          styleScore: wardrobeRes.data.length > 0 ? 80 + Math.min(18, wardrobeRes.data.length * 2) : 65
        });

      } catch (err) {
        setError('Could not load dashboard data. Ensure Flask backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [weatherState]);

  const handleLike = async (outfitId, e) => {
    if (e) e.stopPropagation();
    try {
      await api.post('/like', { outfit_id: outfitId });
      // Update local state to increment score or change colors
      setRecommendations(prev => 
        prev.map(item => item.id === outfitId ? { ...item, confidence_score: Math.min(1.0, item.confidence_score + 0.05), liked: true, disliked: false } : item)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDislike = async (outfitId, e) => {
    if (e) e.stopPropagation();
    try {
      await api.post('/dislike', { outfit_id: outfitId });
      // Remove or de-rank item
      setRecommendations(prev => prev.filter(item => item.id !== outfitId));
      if (selectedOutfit?.id === outfitId) setSelectedOutfit(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (outfitId, e) => {
    if (e) e.stopPropagation();
    try {
      await api.post('/save-outfit', { outfit_id: outfitId });
      setStats(prev => ({ ...prev, savedCount: prev.savedCount + 1 }));
      setRecommendations(prev => 
        prev.map(item => item.id === outfitId ? { ...item, saved: true } : item)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const ootd = recommendations.length > 0 ? recommendations[0] : null;

  // Weather descriptive summaries
  const weatherText = {
    "Hot": { temp: "32°C", desc: "Warm and Sunny. OptiFit recommends light colors and breathable cotton wear." },
    "Rainy": { temp: "22°C", desc: "Showery and Damp. OptiFit recommends waterproof layers and darker hues." },
    "Winter": { temp: "14°C", desc: "Cool Breeze. OptiFit recommends warm outerwear, hoodies, and soft layering." }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* --- Dashboard Welcome & Weather Banner --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome message & Weather status */}
        <div className="lg:col-span-2 gradient-bg rounded-3xl p-8 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 h-64 w-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 top-0 -translate-y-12 h-48 w-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-gold-400 border border-white/10 mb-4 animate-bounce">
              <Sparkles className="h-3.5 w-3.5" />
              OptiFit Style Advisor Active
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">What should I wear today?</h2>
            <p className="text-indigo-200 text-sm sm:text-base mt-2 max-w-md">Your smart assistant analyzed your preferences and local weather to curate matching looks.</p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 z-10 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/5 w-full sm:w-auto">
              <CloudSun className="h-8 w-8 text-gold-400 shrink-0" />
              <div>
                <div className="text-sm font-bold text-slate-300">Weather: {weatherState}</div>
                <div className="text-xs text-slate-400 font-medium">{weatherText[weatherState]?.desc}</div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center justify-center shrink-0 border border-white/10 self-stretch sm:self-auto text-center font-bold">
              <span className="text-2xl sm:text-3xl text-gold-400">{weatherText[weatherState]?.temp}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards in Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 flex flex-col justify-between shadow-sm scale-hover">
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Virtual Wardrobe Items</span>
              <h3 className="text-3xl font-extrabold mt-2 text-slate-900 dark:text-white">{stats.wardrobeCount}</h3>
            </div>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold mt-4">Personal clothes uploaded</p>
          </div>

          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 flex flex-col justify-between shadow-sm scale-hover">
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Style Calibration</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.styleScore}%</h3>
                <span className="text-xs font-bold text-emerald-500">Optimal</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full" style={{ width: `${stats.styleScore}%` }}></div>
            </div>
          </div>
        </div>

      </section>

      {/* --- Outfit of the Day (OOTD) --- */}
      {ootd && (
        <section className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm overflow-hidden relative">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[3/4] rounded-2xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-slate-800/30 shrink-0">
              {/* Image handles backend serving URLs */}
              <img 
                src={ootd.image_url.startsWith('http') ? ootd.image_url : `${API_BASE_URL}${ootd.image_url}`} 
                alt={ootd.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60" }}
              />
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-2">
              <div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">Outfit of the Day</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-700 dark:bg-gold-950/60 dark:text-gold-400">{Math.round(ootd.confidence_score * 100)}% Match</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-4">{ootd.name}</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Style</span>
                    <p className="text-sm font-semibold mt-1">{ootd.style}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Occasion</span>
                    <p className="text-sm font-semibold mt-1">{ootd.occasion}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ideal Weather</span>
                    <p className="text-sm font-semibold mt-1">{ootd.season}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Est. Budget</span>
                    <p className="text-sm font-semibold mt-1">${ootd.budget}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Components Included</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ootd.components.split(',').map((comp, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs font-medium bg-slate-50 dark:bg-slate-900/60">
                        {comp.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 italic border-l-2 border-indigo-500 pl-4">{ootd.style_explanation}</p>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={() => handleSave(ootd.id)}
                  disabled={ootd.saved}
                  className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                    ootd.saved 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-500'
                  }`}
                >
                  {ootd.saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {ootd.saved ? 'Saved' : 'Save Outfit'}
                </button>
                
                <button
                  onClick={() => handleLike(ootd.id)}
                  disabled={ootd.liked}
                  className={`px-4 py-3 rounded-2xl border transition-all ${
                    ootd.liked 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-500 hover:text-rose-500'
                  }`}
                  title="Like Outfit"
                >
                  <Heart className="h-5 w-5" fill={ootd.liked ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- AI Recommendations Grid --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Curated Recommendations</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Recommendations re-ranked based on your likes/dislikes</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="h-80 rounded-3xl bg-slate-200/50 dark:bg-slate-800/40 animate-pulse"></div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Info className="h-8 w-8 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500 font-semibold">No recommendations found matching preference constraints.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.slice(1).map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedOutfit(item)}
                className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm scale-hover cursor-pointer flex flex-col justify-between h-96 group relative"
              >
                <div>
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-850 overflow-hidden relative">
                    <img 
                      src={item.image_url.startsWith('http') ? item.image_url : `${API_BASE_URL}${item.image_url}`} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60" }}
                    />
                    {/* Score badge */}
                    <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-extrabold text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-800">
                      {Math.round(item.confidence_score * 100)}% Match
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md uppercase">{item.style}</span>
                      <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md uppercase">{item.occasion}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2.5 truncate">{item.name}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">{item.components}</p>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white">${item.budget}</span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={(e) => handleSave(item.id, e)}
                      className={`p-2 rounded-xl border transition-all ${
                        item.saved 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-500 hover:border-indigo-500'
                      }`}
                      title="Save outfit"
                    >
                      <Bookmark className="h-4 w-4" fill={item.saved ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={(e) => handleLike(item.id, e)}
                      className={`p-2 rounded-xl border transition-all ${
                        item.liked 
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:border-rose-500'
                      }`}
                      title="Like outfit"
                    >
                      <Heart className="h-4 w-4" fill={item.liked ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- Outfit Detail Modal --- */}
      <AnimatePresence>
        {selectedOutfit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col"
            >
              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-flex gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase">{selectedOutfit.style}</span>
                      <span className="px-2.5 py-1 rounded-lg bg-gold-50 dark:bg-gold-950/60 text-gold-600 dark:text-gold-400 text-xs font-bold uppercase">{selectedOutfit.occasion}</span>
                    </div>
                    <h3 className="text-2xl font-bold mt-3 text-slate-900 dark:text-white">{selectedOutfit.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedOutfit(null)} 
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="aspect-[4/3] rounded-2xl bg-slate-100 dark:bg-slate-850 overflow-hidden border border-slate-200 dark:border-slate-800">
                    <img 
                      src={selectedOutfit.image_url.startsWith('http') ? selectedOutfit.image_url : `${API_BASE_URL}${selectedOutfit.image_url}`} 
                      alt={selectedOutfit.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60" }}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Style Explanation</span>
                      <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">{selectedOutfit.style_explanation}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Color Tone</span>
                        <p className="text-sm font-semibold">{selectedOutfit.color}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget Est.</span>
                        <p className="text-sm font-semibold">${selectedOutfit.budget}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Match Confidence</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-extrabold text-indigo-500">{Math.round(selectedOutfit.confidence_score * 100)}%</span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full" style={{ width: `${selectedOutfit.confidence_score * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Components Detail</span>
                  <ul className="mt-2 space-y-2">
                    {selectedOutfit.components.split(',').map((comp, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/30">
                        <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                        {comp.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions panel */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between gap-4">
                <button
                  onClick={() => handleDislike(selectedOutfit.id)}
                  className="flex-1 px-4 py-3 rounded-2xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-sm"
                >
                  De-prioritize
                </button>
                
                <button
                  onClick={() => handleSave(selectedOutfit.id)}
                  disabled={selectedOutfit.saved}
                  className={`flex-1 px-4 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
                    selectedOutfit.saved
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      : 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500'
                  }`}
                >
                  {selectedOutfit.saved ? 'Saved in Wardrobe' : 'Save Outfit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
