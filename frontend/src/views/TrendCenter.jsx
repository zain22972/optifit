// OptiFit 2.0 Fashion Trend Center Screen
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { TrendingUp, Sparkles, Flame, Percent, AlertCircle, Info } from 'lucide-react';
import api from '../services/api';

export const TrendCenter = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      // Fetch trends from backend
      const response = await api.get('/trends');
      setTrends(response.data);
    } catch (err) {
      setError('Could not fetch active trends.');
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const activeTrends = trends.filter(t => t.is_active === 1) || [];

  // Group styles and colors for chart datasets
  const chartDataStyles = activeTrends
    .filter(t => t.type === 'style' || t.type === 'category')
    .map(t => ({
      name: t.name,
      Boost: Math.round((t.score - 1.0) * 100)
    }));

  const chartDataColors = activeTrends
    .filter(t => t.type === 'color')
    .map(t => ({
      name: t.name,
      Score: Math.round(t.score * 50)
    }));

  // Fallback static chart data if database is empty/loading
  const defaultStyleData = [
    { name: 'Oversized Fashion', Boost: 25 },
    { name: 'Smart Casual Blazers', Boost: 15 },
    { name: 'Minimalist Monochrome', Boost: 20 },
    { name: 'Classic White Style', Boost: 10 },
    { name: 'Rainy Season Outerwear', Boost: 30 },
  ];

  const defaultColorData = [
    { name: 'Black', Score: 60 },
    { name: 'White', Score: 55 },
    { name: 'Blue', Score: 45 },
    { name: 'Green', Score: 50 },
    { name: 'Red', Score: 30 },
  ];

  const stylesDataset = chartDataStyles.length > 0 ? chartDataStyles : defaultStyleData;
  const colorsDataset = chartDataColors.length > 0 ? chartDataColors : defaultColorData;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Fashion Trend Center</h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Real-time analytical visualization of active styles, popular colors, and seasonal boosts</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm">
          {error}
        </div>
      )}

      {/* --- Trend Analytics Charts --- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Style Boost Bar Chart */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Style Boost Factors (%)</h3>
          </div>
          <div className="h-72 w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stylesDataset}>
                <XAxis dataKey="name" stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" tickLine={false} axisLine={false} tickFormatter={(value) => `+${value}%`} />
                <Tooltip cursor={{ fill: 'rgba(226, 232, 240, 0.2)' }} />
                <Bar dataKey="Boost" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Color Popularity Area Chart */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="h-5 w-5 text-gold-500 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trending Color Indices</h3>
          </div>
          <div className="h-72 w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={colorsDataset}>
                <XAxis dataKey="name" stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" tickLine={false} axisLine={false} />
                <Tooltip />
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dcaa3d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#dcaa3d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="Score" stroke="#dcaa3d" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </section>

      {/* --- Trend Boost Catalog --- */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Current Trend Catalog</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Fashion items matching these criteria receive the associated recommendation boost modifiers</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(idx => (
              <div key={idx} className="h-28 rounded-3xl bg-slate-200/50 dark:bg-slate-800/40 animate-pulse"></div>
            ))}
          </div>
        ) : activeTrends.length === 0 ? (
          <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-3xl">
            <p className="text-slate-500 font-semibold text-sm">No active fashion trends at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {activeTrends.map((trend) => (
              <div 
                key={trend.id}
                className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 flex items-center justify-between shadow-sm scale-hover"
              >
                <div className="space-y-1">
                  <div className="inline-flex px-2 py-0.5 rounded text-[8px] font-bold bg-indigo-500/10 text-indigo-500 uppercase">
                    {trend.type}
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{trend.name}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Value matching: <span className="text-slate-600 dark:text-slate-350 font-bold capitalize">{trend.value}</span></p>
                </div>
                
                <div className="flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 shrink-0 font-bold">
                  <span className="text-xs text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Boost</span>
                  <span className="text-sm font-extrabold font-mono">+{Math.round((trend.score - 1.0) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Explanation banner */}
      <div className="p-5 rounded-3xl bg-indigo-500/5 text-indigo-500 flex items-start gap-3 border border-indigo-500/10">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed space-y-1">
          <p className="font-bold">How fashion trend intelligence works in OptiFit 2.0:</p>
          <p className="text-slate-500 dark:text-indigo-200/80">Administrators set active market trends in the admin panel. The recommendation engine applies these boost factor percentages as scalar multipliers during the Cosine Similarity ranking phase, promoting trendy styles or seasonal shades to the top of users' dashboards automatically.</p>
        </div>
      </div>

    </div>
  );
};
