// OptiFit 2.0 AI Outfit Generator Screen
import React, { useState } from 'react';
import { 
  Sparkles, Shirt, HelpCircle, ThermometerSun, CloudRain, 
  Snowflake, Check, Bookmark, ArrowRight, RefreshCw, AlertCircle, Info, Lock 
} from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';

export const OutfitGenerator = () => {
  const [activeTab, setActiveTab] = useState('synthesizer'); // 'synthesizer' or 'wardrobe-builder'
  
  // Tab 1: AI Outfit Synthesizer State
  const [occasion, setOccasion] = useState('Casual Hangout');
  const [weather, setWeather] = useState('Hot');
  const [budget, setBudget] = useState(150);
  const [color, setColor] = useState('');
  const [style, setStyle] = useState('Casual');
  const [generating, setGenerating] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  
  // Tab 2: Smart Wardrobe Builder State
  const [wardrobeOccasion, setWardrobeOccasion] = useState('Casual Hangout');
  const [wardrobeWeather, setWardrobeWeather] = useState('Hot');
  const [matching, setMatching] = useState(false);
  const [wardrobeCombos, setWardrobeCombos] = useState([]);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const occasions = ["Interview", "Wedding", "Casual Hangout", "Business Meeting", "Party", "Sport"];
  const styles = ["Casual", "Formal", "Party", "Traditional", "Streetwear", "Smart Casual", "Business Casual"];
  const colors = ["Black", "White", "Blue", "Green", "Red", "Yellow", "Brown"];
  
  const weatherIcons = {
    "Hot": <ThermometerSun className="h-4 w-4 text-amber-500" />,
    "Rainy": <CloudRain className="h-4 w-4 text-blue-500" />,
    "Winter": <Snowflake className="h-4 w-4 text-indigo-400" />
  };

  // Run AI Outfit Synthesizer
  const handleSynthesize = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    setGeneratedOutfit(null);
    setSuccessMsg('');

    try {
      const response = await api.post('/generate-outfit', {
        occasion,
        weather,
        budget: parseFloat(budget),
        color: color || null,
        style
      });
      setGeneratedOutfit(response.data);
    } catch (err) {
      setError('Could not generate outfit combination. Verify backend connection.');
    } finally {
      setGenerating(false);
    }
  };

  // Run Smart Wardrobe Builder
  const handleMatchWardrobe = async (e) => {
    e.preventDefault();
    setMatching(true);
    setError('');
    setWardrobeCombos([]);
    setSuccessMsg('');

    try {
      const response = await api.get(`/wardrobe-outfits?occasion=${wardrobeOccasion}&weather=${wardrobeWeather}`);
      setWardrobeCombos(response.data);
    } catch (err) {
      setError('Error compiling outfits from your wardrobe. Ensure you have Tops and Bottoms uploaded.');
    } finally {
      setMatching(false);
    }
  };

  const handleSaveOutfit = async (outfitId) => {
    try {
      await api.post('/save-outfit', { outfit_id: outfitId });
      setSuccessMsg('Outfit saved successfully! Added to your dashboard.');
      if (generatedOutfit) {
        setGeneratedOutfit({ ...generatedOutfit, saved: true });
      }
    } catch (err) {
      setError('Failed to save outfit.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">AI Outfit Architect</h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Generate complete lookbook combinations automatically or coordinate your personal wardrobe</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl w-full sm:w-max border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
        <button
          onClick={() => { setActiveTab('synthesizer'); setError(''); setSuccessMsg(''); }}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 w-1/2 sm:w-auto ${
            activeTab === 'synthesizer'
              ? 'bg-white dark:bg-slate-800 shadow-md text-slate-900 dark:text-white'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="h-4 w-4 text-gold-500" />
          AI Synthesizer
        </button>
        <button
          onClick={() => { setActiveTab('wardrobe-builder'); setError(''); setSuccessMsg(''); }}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 w-1/2 sm:w-auto ${
            activeTab === 'wardrobe-builder'
              ? 'bg-white dark:bg-slate-800 shadow-md text-slate-900 dark:text-white'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Shirt className="h-4 w-4 text-indigo-500" />
          Smart Wardrobe Matcher
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm flex items-center gap-2">
          <Check className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* --- Tab 1: AI Synthesizer View --- */}
      {activeTab === 'synthesizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Controls form */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Design Constraints</h3>
            
            <form onSubmit={handleSynthesize} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occasion</label>
                <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="w-full text-sm font-semibold h-11 py-1">
                  {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weather Conditions</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Hot", "Rainy", "Winter"].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeather(w)}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        weather === w
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {weatherIcons[w]}
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Max Budget</span>
                  <span className="text-indigo-500 font-extrabold text-sm">${budget}</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="500" 
                  step="10" 
                  value={budget} 
                  onChange={(e) => setBudget(e.target.value)} 
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Color Accent (Optional)</label>
                <select value={color} onChange={(e) => setColor(e.target.value)} className="w-full text-sm font-semibold h-11 py-1">
                  <option value="">Any Color</option>
                  {colors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Style Profile</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full text-sm font-semibold h-11 py-1">
                  {styles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl py-3.5 font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    Synthesize Combination
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Workspace */}
          <div className="lg:col-span-2 space-y-6">
            {generating ? (
              <div className="h-96 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900/40">
                <div className="h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold">Querying OptiFit combinatorial recommendation networks...</p>
                <p className="text-xs text-slate-400 mt-1">Sourcing categories, weather parameters, and color weights</p>
              </div>
            ) : generatedOutfit ? (
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-2/5 aspect-[4/3] rounded-2xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-850 shrink-0">
                    <img 
                      src={generatedOutfit.image_url.startsWith('http') ? generatedOutfit.image_url : `${API_BASE_URL}${generatedOutfit.image_url}`} 
                      alt={generatedOutfit.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60" }}
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">Synthesis Result</span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-700 dark:bg-gold-950/60 dark:text-gold-400">85% Compatibility</span>
                      </div>
                      <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-4">{generatedOutfit.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">{generatedOutfit.style_explanation}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Style Aesthetic</span>
                          <p className="text-sm font-semibold">{generatedOutfit.style}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Budget</span>
                          <p className="text-sm font-semibold">${generatedOutfit.budget}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                      {generatedOutfit.is_system !== 0 && (
                        <button
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
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Components Blueprint</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {generatedOutfit.components.split(',').map((comp, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-slate-800/30 text-xs font-semibold">
                        <div className="h-2 w-2 rounded-full bg-gold-500"></div>
                        {comp.trim()}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-96 border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-slate-50/20 dark:bg-slate-900/10">
                <Sparkles className="h-8 w-8 text-slate-400 mb-3" />
                <p className="text-slate-500 font-semibold">Enter your styling constraints and hit "Synthesize" to construct custom visual combinations.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Tab 2: Smart Wardrobe Matcher View --- */}
      {activeTab === 'wardrobe-builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Controls form */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Wardrobe Context</h3>
            
            <form onSubmit={handleMatchWardrobe} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Occasion</label>
                <select value={wardrobeOccasion} onChange={(e) => setWardrobeOccasion(e.target.value)} className="w-full text-sm font-semibold h-11 py-1">
                  {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Weather</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Hot", "Rainy", "Winter"].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWardrobeWeather(w)}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        wardrobeWeather === w
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {weatherIcons[w]}
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={matching}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl py-3.5 font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {matching ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Matching wardrobe...
                  </>
                ) : (
                  <>
                    Match My Wardrobe
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
            <div className="mt-4 flex items-start gap-2 p-3 rounded-2xl bg-indigo-500/5 text-indigo-500 text-[10px] leading-relaxed">
              <Info className="h-4.5 w-4.5 shrink-0" />
              <span>OptiFit searches your virtual wardrobe items (categorized under Tops, Bottoms, Footwear) and computes style-compatibility matrices.</span>
            </div>
          </div>

          {/* Wardrobe Matching Results Workspace */}
          <div className="lg:col-span-2 space-y-6">
            {matching ? (
              <div className="h-96 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900/40">
                <div className="h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold">Matching colors, styles, and weather alignments across your wardrobe...</p>
              </div>
            ) : wardrobeCombos.length > 0 ? (
              <div className="space-y-6">
                {wardrobeCombos.map((combo, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
                    
                    {/* Combination header */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-extrabold uppercase">Option #{idx + 1}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">Occasion suitability: <span className="text-slate-700 dark:text-slate-300 font-extrabold">{combo.occasion_suitability}</span></span>
                      </div>
                      <div className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-xl text-xs font-extrabold border border-indigo-200/30 dark:border-indigo-800/30">
                        {combo.matching_score}% Match Score
                      </div>
                    </div>

                    {/* Coordinate images */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {["top", "bottom", "footwear", "accessory"].map((pos) => {
                        const item = combo.items[pos];
                        if (!item) return null;
                        return (
                          <div key={pos} className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative">
                              <img 
                                src={item.image_url.startsWith('http') || item.image_url.startsWith('/assets') ? item.image_url : `${API_BASE_URL}${item.image_url}`} 
                                alt={item.subcategory}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&auto=format&fit=crop&q=60" }}
                              />
                              <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">
                                {pos}
                              </div>
                            </div>
                            <div className="text-[10px]">
                              <p className="font-bold text-slate-800 dark:text-slate-200 truncate capitalize">{item.color} {item.subcategory}</p>
                              <p className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold uppercase">{item.style}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="h-96 border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-slate-50/20 dark:bg-slate-900/10">
                <Shirt className="h-8 w-8 text-slate-400 mb-3" />
                <p className="text-slate-500 font-semibold">Select your filters and hit "Match My Wardrobe" to compile outfits from your clothes.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">You must upload at least one item under 'Tops' and one under 'Bottoms' in your virtual wardrobe first.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
