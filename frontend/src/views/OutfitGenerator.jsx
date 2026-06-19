import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Shirt, ThermometerSun, CloudRain, 
  Snowflake, Check, Bookmark, ArrowRight, RefreshCw, AlertCircle, Info,
  ChevronLeft, ChevronRight, Star, Eye
} from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ShimmerButton = ({ onClick, disabled, loading, loadingText, children, className = '' }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={`relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl py-3.5 font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${className} ${
      disabled ? 'opacity-70 cursor-not-allowed' : ''
    }`}
  >
    {loading ? (
      <>
        <RefreshCw className="h-5 w-5 animate-spin" />
        {loadingText}
      </>
    ) : (
      children
    )}
    {!loading && (
      <div className="absolute inset-0 shimmer-bg opacity-20" />
    )}
  </motion.button>
);

export const OutfitGenerator = () => {
  const [activeTab, setActiveTab] = useState('synthesizer');
  const [occasion, setOccasion] = useState('Casual Hangout');
  const [weather, setWeather] = useState('Hot');
  const [budget, setBudget] = useState(150);
  const [color, setColor] = useState('');
  const [style, setStyle] = useState('Casual');
  const [generating, setGenerating] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [wardrobeOccasion, setWardrobeOccasion] = useState('Casual Hangout');
  const [wardrobeWeather, setWardrobeWeather] = useState('Hot');
  const [matching, setMatching] = useState(false);
  const [wardrobeCombos, setWardrobeCombos] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentComboIdx, setCurrentComboIdx] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const occasions = ["Interview", "Wedding", "Casual Hangout", "Business Meeting", "Party", "Sport"];
  const styles = ["Casual", "Formal", "Party", "Traditional", "Streetwear", "Smart Casual", "Business Casual"];
  const colors = ["Black", "White", "Blue", "Green", "Red", "Yellow", "Brown"];
  
  const weatherIcons = {
    "Hot": <ThermometerSun className="h-4 w-4 text-amber-500" />,
    "Rainy": <CloudRain className="h-4 w-4 text-blue-500" />,
    "Winter": <Snowflake className="h-4 w-4 text-indigo-400" />
  };

  const handleSynthesize = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    setGeneratedOutfit(null);
    setSuccessMsg('');
    try {
      const response = await api.post('/generate-outfit', {
        occasion, weather, budget: parseFloat(budget), color: color || null, style
      });
      setGeneratedOutfit(response.data);
    } catch (err) {
      setError('Could not generate outfit combination. Verify backend connection.');
    } finally {
      setGenerating(false);
    }
  };

  const handleMatchWardrobe = async (e) => {
    e.preventDefault();
    setMatching(true);
    setError('');
    setWardrobeCombos([]);
    setSuccessMsg('');
    try {
      const response = await api.get(`/wardrobe-outfits?occasion=${wardrobeOccasion}&weather=${wardrobeWeather}`);
      setWardrobeCombos(response.data);
      setCurrentComboIdx(0);
    } catch (err) {
      setError('Error compiling outfits from your wardrobe.');
    } finally {
      setMatching(false);
    }
  };

  const handleSaveOutfit = async (outfitId) => {
    try {
      await api.post('/save-outfit', { outfit_id: outfitId });
      setSuccessMsg('Outfit saved successfully!');
      if (generatedOutfit) {
        setGeneratedOutfit({ ...generatedOutfit, saved: true });
      }
    } catch (err) {
      setError('Failed to save outfit.');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">AI Outfit Architect</h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Generate complete lookbook combinations automatically or coordinate your personal wardrobe</p>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div variants={itemVariants} className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl w-full sm:w-max border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
        {['synthesizer', 'wardrobe-builder'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setError(''); setSuccessMsg(''); }}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 w-1/2 sm:w-auto ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 shadow-md text-slate-900 dark:text-white'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'synthesizer' ? (
              <Sparkles className="h-4 w-4 text-gold-500" />
            ) : (
              <Shirt className="h-4 w-4 text-indigo-500" />
            )}
            {tab === 'synthesizer' ? 'AI Synthesizer' : 'Smart Wardrobe Matcher'}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm flex items-center gap-2"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm flex items-center gap-2"
          >
            <Check className="h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab 1: AI Synthesizer */}
      {activeTab === 'synthesizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Design Constraints</h3>
              
              <form onSubmit={handleSynthesize} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occasion</label>
                  <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="w-full text-sm font-semibold h-11 py-1 mt-1">
                    {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weather Conditions</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {["Hot", "Rainy", "Winter"].map(w => (
                      <motion.button
                        key={w}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setWeather(w)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          weather === w
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-500/50'
                        }`}
                      >
                        {weatherIcons[w]}
                        {w}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Max Budget</span>
                    <span className="text-indigo-500 font-extrabold text-sm">${budget}</span>
                  </div>
                  <input type="range" min="20" max="500" step="10" value={budget} onChange={(e) => setBudget(e.target.value)} 
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Color Accent (Optional)</label>
                  <select value={color} onChange={(e) => setColor(e.target.value)} className="w-full text-sm font-semibold h-11 py-1 mt-1">
                    <option value="">Any Color</option>
                    {colors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Style Profile</label>
                  <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full text-sm font-semibold h-11 py-1 mt-1">
                    {styles.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <ShimmerButton
                  type="submit"
                  disabled={generating}
                  loading={generating}
                  loadingText="Synthesizing..."
                  className="w-full mt-4"
                >
                  Synthesize Combination
                  <ArrowRight className="h-5 w-5" />
                </ShimmerButton>
              </form>
            </div>
          </motion.div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {generating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-96 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900/40"
              >
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-indigo-500 animate-pulse" />
                </div>
                <p className="text-slate-500 font-bold">Querying OptiFit recommendation networks...</p>
                <p className="text-xs text-slate-400 mt-1">Sourcing categories, weather parameters, and color weights</p>
              </motion.div>
            ) : generatedOutfit ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-6 space-y-6 relative overflow-hidden"
              >
                {/* Dynamic background blur based on image */}
                <div
                  className="absolute inset-0 opacity-30 dark:opacity-20 transition-all duration-700"
                  style={{
                    backgroundImage: `url(${generatedOutfit.image_url.startsWith('http') ? generatedOutfit.image_url : `${API_BASE_URL}${generatedOutfit.image_url}`})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(60px)',
                  }}
                />
                
                <div className="relative z-10 flex flex-col sm:flex-row gap-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-full sm:w-2/5 aspect-[4/3] sm:aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 relative"
                  >
                    <img 
                      src={generatedOutfit.image_url.startsWith('http') ? generatedOutfit.image_url : `${API_BASE_URL}${generatedOutfit.image_url}`} 
                      alt={generatedOutfit.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=60" }}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/90 text-white backdrop-blur-sm">Synthesis Result</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-500/90 text-white backdrop-blur-sm">85% Match</span>
                    </div>
                  </motion.div>
                  
                  <div className="flex-1 flex flex-col justify-between relative z-10">
                    <div>
                      <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{generatedOutfit.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">{generatedOutfit.style_explanation}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/30">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Style</span>
                          <p className="text-sm font-semibold mt-1 text-slate-800 dark:text-slate-200">{generatedOutfit.style}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/30">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Budget</span>
                          <p className="text-sm font-semibold mt-1 text-slate-800 dark:text-slate-200">${generatedOutfit.budget}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      {generatedOutfit.is_system !== 0 && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSaveOutfit(generatedOutfit.id)}
                          disabled={generatedOutfit.saved}
                          className={`px-6 py-3 rounded-2xl font-bold text-sm border flex items-center gap-2 transition-all ${
                            generatedOutfit.saved
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                              : 'bg-indigo-600 border-indigo-600 text-white shadow-md hover:bg-indigo-500'
                          }`}
                        >
                          {generatedOutfit.saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                          {generatedOutfit.saved ? 'Saved' : 'Save Outfit'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Components Blueprint</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {generatedOutfit.components.split(',').map((comp, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-slate-800/30 text-xs font-semibold"
                      >
                        <div className="h-2 w-2 rounded-full bg-gold-500" />
                        {comp.trim()}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-96 border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-slate-50/20 dark:bg-slate-900/10"
              >
                <div className="relative mb-4">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-slate-400" />
                  </div>
                </div>
                <p className="text-slate-500 font-semibold">Enter your styling constraints and hit "Synthesize" to create custom outfits.</p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Smart Wardrobe Matcher */}
      {activeTab === 'wardrobe-builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Wardrobe Context</h3>
              
              <form onSubmit={handleMatchWardrobe} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Occasion</label>
                  <select value={wardrobeOccasion} onChange={(e) => setWardrobeOccasion(e.target.value)} className="w-full text-sm font-semibold h-11 py-1 mt-1">
                    {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Weather</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {["Hot", "Rainy", "Winter"].map(w => (
                      <motion.button
                        key={w}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setWardrobeWeather(w)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          wardrobeWeather === w
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {weatherIcons[w]}
                        {w}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <ShimmerButton
                  type="submit"
                  disabled={matching}
                  loading={matching}
                  loadingText="Matching wardrobe..."
                  className="w-full mt-4"
                >
                  Match My Wardrobe
                  <ArrowRight className="h-5 w-5" />
                </ShimmerButton>
              </form>
              <div className="mt-4 flex items-start gap-2 p-3 rounded-2xl bg-indigo-500/5 text-indigo-500 text-[10px] leading-relaxed">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Searches your wardrobe items and computes style-compatibility matrices.</span>
              </div>
            </div>
          </motion.div>

          {/* Results Carousel */}
          <div className="lg:col-span-2">
            {matching ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-96 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900/40"
              >
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                  <Shirt className="absolute inset-0 m-auto h-6 w-6 text-indigo-500 animate-pulse" />
                </div>
                <p className="text-slate-500 font-bold">Matching colors, styles, and weather alignments...</p>
              </motion.div>
            ) : wardrobeCombos.length > 0 ? (
              <div className="space-y-4">
                {/* Carousel Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold">
                      {currentComboIdx + 1} / {wardrobeCombos.length}
                    </span>
                    <span className="text-xs text-slate-400">Outfit Options</span>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentComboIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentComboIdx === 0}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentComboIdx(prev => Math.min(wardrobeCombos.length - 1, prev + 1))}
                      disabled={currentComboIdx >= wardrobeCombos.length - 1}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentComboIdx}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="glass-card rounded-3xl p-6 space-y-6"
                  >
                    {(() => {
                      const combo = wardrobeCombos[currentComboIdx];
                      return (
                        <>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-extrabold uppercase">Option #{currentComboIdx + 1}</span>
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                                Suitability: <span className="text-slate-700 dark:text-slate-300 font-extrabold">{combo.occasion_suitability}</span>
                              </span>
                            </div>
                            <div className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-xl text-xs font-extrabold border border-indigo-200/30 dark:border-indigo-800/30">
                              <Star className="h-3 w-3 inline mr-1" />
                              {combo.matching_score}% Match
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {["top", "bottom", "footwear", "accessory"].map((pos) => {
                              const item = combo.items[pos];
                              if (!item) return null;
                              return (
                                <motion.div
                                  key={pos}
                                  whileHover={{ y: -4 }}
                                  className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50"
                                >
                                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative">
                                    <img 
                                      src={item.image_url.startsWith('http') || item.image_url.startsWith('/assets') ? item.image_url : `${API_BASE_URL}${item.image_url}`} 
                                      alt={item.subcategory}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&auto=format&fit=crop&q=60" }}
                                    />
                                    <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">
                                      {pos}
                                    </div>
                                  </div>
                                  <div className="text-[10px]">
                                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate capitalize">{item.color} {item.subcategory}</p>
                                    <p className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold uppercase">{item.style}</p>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-96 border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-slate-50/20 dark:bg-slate-900/10"
              >
                <Shirt className="h-8 w-8 text-slate-400 mb-3" />
                <p className="text-slate-500 font-semibold">Hit "Match My Wardrobe" to compile outfits from your clothes.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Need at least one 'Tops' and one 'Bottoms' item in your wardrobe.</p>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
