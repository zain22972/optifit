import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, CloudSun, Heart, Bookmark, Check, TrendingUp, Info, X,
  Shirt, PieChart, Activity, Sun, Wind
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api, { API_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

const chartColors = ['#8B5CF6', '#DCA83D', '#F43F5E', '#10B981', '#14B8A6', '#6366F1'];

export const Dashboard = ({ weatherState }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ wardrobeCount: 0, savedCount: 0, styleScore: 88 });
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const recResponse = await api.get(`/recommendations?weather=${weatherState}`);
        setRecommendations(recResponse.data);
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
      setRecommendations(prev => 
        prev.map(item => item.id === outfitId ? { ...item, confidence_score: Math.min(1.0, item.confidence_score + 0.05), liked: true, disliked: false } : item)
      );
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

  const weatherText = {
    "Hot": { temp: "32°C", desc: "Warm and Sunny. Light colors and breathable cotton wear." },
    "Rainy": { temp: "22°C", desc: "Showery and Damp. Waterproof layers and darker hues." },
    "Winter": { temp: "14°C", desc: "Cool Breeze. Warm outerwear, hoodies, and soft layering." }
  };

  const chartData = [
    { name: 'Casual', value: 35 },
    { name: 'Formal', value: 25 },
    { name: 'Party', value: 20 },
    { name: 'Street', value: 12 },
    { name: 'Trad.', value: 8 },
  ];

  const weeklyActivity = [
    { day: 'Mon', outfits: 3 },
    { day: 'Tue', outfits: 5 },
    { day: 'Wed', outfits: 2 },
    { day: 'Thu', outfits: 7 },
    { day: 'Fri', outfits: 4 },
    { day: 'Sat', outfits: 6 },
    { day: 'Sun', outfits: 8 },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Welcome Banner */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl p-8 text-white">
          <div className="absolute inset-0 gradient-fashion" />
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 h-64 w-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 top-0 -translate-y-12 h-48 w-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-gold-400 border border-white/10 mb-4"
            >
              <Sparkles className="h-3.5 w-3.5" />
              OptiFit Style Advisor Active
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">What should I wear today?</h2>
            <p className="text-indigo-200 text-sm sm:text-base mt-2 max-w-md">Your smart assistant analyzed your preferences and local weather to curate matching looks.</p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10 pt-6 border-t border-white/10">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/5 w-full sm:w-auto backdrop-blur-sm"
            >
              <CloudSun className="h-8 w-8 text-gold-400 shrink-0" />
              <div>
                <div className="text-sm font-bold text-slate-300">Weather: {weatherState}</div>
                <div className="text-xs text-slate-400 font-medium">{weatherText[weatherState]?.desc}</div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center justify-center shrink-0 border border-white/10 self-stretch sm:self-auto text-center font-bold"
            >
              <span className="text-2xl sm:text-3xl text-gold-400">{weatherText[weatherState]?.temp}</span>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:bg-indigo-500/10 transition-all duration-500" />
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Shirt className="h-3.5 w-3.5 text-indigo-500" />
                Virtual Wardrobe
              </span>
              <h3 className="text-3xl font-extrabold mt-2 text-slate-900 dark:text-white">{stats.wardrobeCount}</h3>
            </div>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold mt-4 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Items in collection
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:bg-emerald-500/10 transition-all duration-500" />
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                Style Score
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.styleScore}%</h3>
                <span className="text-xs font-bold text-emerald-500">Optimal</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.styleScore}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-indigo-500 via-violet-500 to-gold-500 h-full rounded-full relative overflow-hidden"
              >
                <div className="absolute inset-0 shimmer-bg opacity-30" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Charts Row */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-500" />
              Style Distribution
            </h3>
            <span className="text-xs text-slate-400">Last 30 days</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} width={50} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    backdropFilter: 'blur(8px)'
                  }}
                  formatter={(value) => [`${value}%`, 'Preference']}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-gold-500" />
              Weekly Activity
            </h3>
            <span className="text-xs text-slate-400">Outfits tried</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Bar dataKey="outfits" radius={[8, 8, 0, 0]} barSize={32}>
                  {weeklyActivity.map((_, index) => (
                    <Cell key={index} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.section>

      {/* Outfit of the Day */}
      {ootd && (
        <motion.section variants={itemVariants}>
          <div className="glass-card rounded-3xl p-6 overflow-hidden relative">
            <div className="flex flex-col lg:flex-row gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="w-full lg:w-1/3 aspect-[4/3] lg:aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/30 shrink-0 relative"
              >
                <img 
                  src={ootd.image_url.startsWith('http') ? ootd.image_url : `${API_BASE_URL}${ootd.image_url}`} 
                  alt={ootd.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-slate-800">OOTD</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gold-500/90 backdrop-blur-sm text-xs font-bold text-white">{Math.round(ootd.confidence_score * 100)}% Match</span>
                </div>
              </motion.div>
              
              <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{ootd.name}</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/30">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Style</span>
                      <p className="text-sm font-semibold mt-1 text-slate-800 dark:text-slate-200">{ootd.style}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/30">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Occasion</span>
                      <p className="text-sm font-semibold mt-1 text-slate-800 dark:text-slate-200">{ootd.occasion}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/30">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weather</span>
                      <p className="text-sm font-semibold mt-1 text-slate-800 dark:text-slate-200">{ootd.season}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/30">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Budget</span>
                      <p className="text-sm font-semibold mt-1 text-slate-800 dark:text-slate-200">${ootd.budget}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 italic border-l-2 border-indigo-500 pl-4">{ootd.style_explanation}</p>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSave(ootd.id)}
                    disabled={ootd.saved}
                    className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      ootd.saved 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-500/5'
                    }`}
                  >
                    {ootd.saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    {ootd.saved ? 'Saved' : 'Save Outfit'}
                  </motion.button>
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleLike(ootd.id, e)}
                    disabled={ootd.liked}
                    className={`px-4 py-3 rounded-2xl border transition-all ${
                      ootd.liked 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-500 hover:text-rose-500 hover:bg-rose-500/5'
                    }`}
                  >
                    <Heart className="h-5 w-5" fill={ootd.liked ? "currentColor" : "none"} />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* AI Recommendations */}
      <motion.section variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Curated Recommendations</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Personalized based on your style preferences</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="h-80 rounded-3xl bg-slate-200/50 dark:bg-slate-800/40 overflow-hidden relative">
                <div className="shimmer-bg absolute inset-0" />
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/30 dark:bg-transparent">
            <Info className="h-8 w-8 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500 font-semibold">No recommendations found matching preference constraints.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {recommendations.slice(1).map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setSelectedOutfit(item)}
                className="glass-card rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-between h-96 group relative"
              >
                <div>
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img 
                      src={item.image_url.startsWith('http') ? item.image_url : `${API_BASE_URL}${item.image_url}`} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-extrabold text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-800"
                    >
                      {Math.round(item.confidence_score * 100)}% Match
                    </motion.div>
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
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleSave(item.id, e)}
                      className={`p-2 rounded-xl border transition-all ${
                        item.saved 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-500 hover:border-indigo-500'
                      }`}
                    >
                      <Bookmark className="h-4 w-4" fill={item.saved ? "currentColor" : "none"} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleLike(item.id, e)}
                      className={`p-2 rounded-xl border transition-all ${
                        item.liked 
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:border-rose-500'
                      }`}
                    >
                      <Heart className="h-4 w-4" fill={item.liked ? "currentColor" : "none"} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* Outfit Detail Modal */}
      <AnimatePresence>
        {selectedOutfit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
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
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedOutfit(null)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <img 
                      src={selectedOutfit.image_url.startsWith('http') ? selectedOutfit.image_url : `${API_BASE_URL}${selectedOutfit.image_url}`} 
                      alt={selectedOutfit.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60" }}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/30">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Style Explanation</span>
                      <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">{selectedOutfit.style_explanation}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/30">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Color Tone</span>
                        <p className="text-sm font-semibold mt-1">{selectedOutfit.color}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/30">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget Est.</span>
                        <p className="text-sm font-semibold mt-1">${selectedOutfit.budget}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Match Confidence</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-extrabold text-indigo-500">{Math.round(selectedOutfit.confidence_score * 100)}%</span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedOutfit.confidence_score * 100}%` }}
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full"
                          />
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
                        <div className="h-2 w-2 rounded-full bg-gold-500" />
                        {comp.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSave(selectedOutfit.id)}
                  disabled={selectedOutfit.saved}
                  className={`flex-1 px-4 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
                    selectedOutfit.saved
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      : 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500'
                  }`}
                >
                  {selectedOutfit.saved ? 'Saved in Wardrobe' : 'Save Outfit'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
