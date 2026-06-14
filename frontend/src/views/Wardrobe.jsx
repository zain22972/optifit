import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Trash2, Edit2, CloudUpload, Info, Camera, Filter, X, Check,
  Shirt, Palette, Sun, Wind, MoveVertical
} from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';
import { CameraScanner } from '../components/CameraScanner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

const SkeletonCard = () => (
  <div className="rounded-3xl overflow-hidden bg-slate-200/50 dark:bg-slate-800/40 relative h-72">
    <div className="shimmer-bg absolute inset-0" />
  </div>
);

export const Wardrobe = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [filterStyle, setFilterStyle] = useState('');
  const [filterSeason, setFilterSeason] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["Tops", "Bottoms", "Footwear", "Accessories"];
  const subcategories = ["Shirt", "T-Shirt", "Jeans", "Jacket", "Kurta", "Dress", "Shoes", "Blazer", "Hoodie"];
  const colors = ["Black", "White", "Blue", "Green", "Red", "Yellow", "Brown"];
  const styles = ["Casual", "Formal", "Party", "Traditional", "Streetwear"];
  const seasons = ["Summer", "Winter", "Rainy"];

  useEffect(() => {
    fetchWardrobe();
  }, [filterCategory, filterColor, filterStyle, filterSeason]);

  const fetchWardrobe = async () => {
    setLoading(true);
    try {
      let url = '/wardrobe?';
      if (filterCategory) url += `category=${filterCategory}&`;
      if (filterColor) url += `color=${filterColor}&`;
      if (filterStyle) url += `style=${filterStyle}&`;
      if (filterSeason) url += `season=${filterSeason}&`;
      if (searchTerm) url += `search=${searchTerm}&`;
      const response = await api.get(url);
      setItems(response.data);
    } catch (err) {
      setError('Failed to fetch wardrobe items.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWardrobe();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setUploadProgress('Uploading image...');
    setError('');
    try {
      setUploadProgress('Running AI analysis...');
      await api.post('/wardrobe/analyze-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchWardrobe();
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading garment. Verify Gemini API key.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleCameraCapture = async (base64Image) => {
    setShowCamera(false);
    setUploading(true);
    setUploadProgress('Running AI analysis on photo...');
    setError('');
    try {
      await api.post('/wardrobe/analyze-photo', { image: base64Image });
      fetchWardrobe();
    } catch (err) {
      setError(err.response?.data?.message || 'Error running AI analysis.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await api.put(`/wardrobe/${editingItem.id}`, {
        category: editingItem.category,
        subcategory: editingItem.subcategory,
        color: editingItem.color,
        style: editingItem.style,
        season: editingItem.season
      });
      setEditingItem(null);
      fetchWardrobe();
    } catch (err) {
      setError('Failed to update item details.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this garment from your virtual wardrobe?')) return;
    try {
      await api.delete(`/wardrobe/${id}`);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError('Failed to delete garment.');
    }
  };

  const getColorDot = (color) => {
    const colorMap = { Black: '#000', White: '#fff', Blue: '#3B82F6', Green: '#10B981', Red: '#EF4444', Yellow: '#EAB308', Brown: '#92400E' };
    return colorMap[color] || '#94A3B8';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Virtual Wardrobe</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Manage and digitize your clothing collection using AI vision</p>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="glass-card rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex w-full lg:w-auto flex-1 gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search garments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 bg-slate-50 dark:bg-slate-950 text-sm py-2.5"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-colors shadow-md shadow-indigo-600/10"
            >
              Search
            </motion.button>
          </form>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                showFilters
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {(filterCategory || filterColor || filterStyle || filterSeason) && (
                <span className="h-2 w-2 rounded-full bg-gold-500" />
              )}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 text-xs py-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-800">
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterColor} onChange={(e) => setFilterColor(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 text-xs py-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-800">
                  <option value="">All Colors</option>
                  {colors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterStyle} onChange={(e) => setFilterStyle(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 text-xs py-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-800">
                  <option value="">All Styles</option>
                  {styles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 text-xs py-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-800">
                  <option value="">All Seasons</option>
                  {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Upload Panel */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5 text-indigo-500" />
              Add Clothes
            </h3>
            
            {uploading ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-500/20 bg-indigo-500/5 rounded-2xl p-8 text-center h-48">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-3" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{uploadProgress}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCamera(true)}
                  className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 rounded-2xl p-5 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/20 group"
                >
                  <Camera className="h-7 w-7 text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">Scan with Camera</span>
                </motion.button>

                <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 rounded-2xl p-5 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/20 group">
                  <CloudUpload className="h-7 w-7 text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">Upload image file</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            )}
            <div className="mt-4 flex items-start gap-2.5 p-3 rounded-2xl bg-indigo-500/5 text-indigo-500 text-[10px] leading-relaxed">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>AI vision automatically detects color, category, style, and season.</span>
            </div>
          </div>
        </motion.div>

        {/* Masonry Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(idx => (
                <SkeletonCard key={idx} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/30 dark:bg-transparent">
              <Shirt className="h-10 w-10 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-500 font-semibold">Your wardrobe is empty.</p>
              <p className="text-xs text-slate-400 mt-1">Upload a garment to get started.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-3 gap-5"
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  layout
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="glass-card rounded-3xl overflow-hidden flex flex-col group relative"
                >
                  <div className="aspect-[4/3] overflow-hidden relative bg-slate-100 dark:bg-slate-800/50">
                    <motion.img
                      whileHover={{ scale: 1.08 }}
                      src={`${API_BASE_URL}${item.image_url}`}
                      alt={item.subcategory}
                      className="w-full h-full object-cover transition-transform duration-700"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60" }}
                    />
                    
                    {/* Hover Overlay with Slide-up Details */}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4"
                        >
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-800 uppercase">{item.style}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-800 uppercase">{item.season}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white text-xs">
                            <Palette className="h-3 w-3" />
                            <span className="font-medium capitalize">{item.color}</span>
                            <span className="mx-1 opacity-40">|</span>
                            <span className="font-medium capitalize">{item.category}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Color dot indicator */}
                    <div
                      className="absolute top-3 left-3 h-4 w-4 rounded-full border-2 border-white/80 shadow-md"
                      style={{ backgroundColor: getColorDot(item.color) }}
                    />

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditingItem(item)}
                        className="p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-500 hover:scale-105 transition-all shadow-sm"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:scale-105 transition-all shadow-sm"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate capitalize">{item.color} {item.subcategory || 'Garment'}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-1">{item.category}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      <span className="text-[9px] font-bold border border-slate-200 dark:border-slate-800/60 px-2 py-0.5 rounded text-slate-400 dark:text-slate-500">{item.style}</span>
                      <span className="text-[9px] font-bold border border-slate-200 dark:border-slate-800/60 px-2 py-0.5 rounded text-slate-400 dark:text-slate-500">{item.season}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Edit Garment Details</h3>
              
              <form onSubmit={handleUpdateItem} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category Group</label>
                  <select value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full text-xs font-semibold py-2 mt-1">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Clothing Category</label>
                  <select value={editingItem.subcategory} onChange={(e) => setEditingItem({ ...editingItem, subcategory: e.target.value })}
                    className="w-full text-xs font-semibold py-2 mt-1">
                    {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Color Tone</label>
                  <select value={editingItem.color} onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                    className="w-full text-xs font-semibold py-2 mt-1">
                    {colors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Style Aesthetic</label>
                  <select value={editingItem.style} onChange={(e) => setEditingItem({ ...editingItem, style: e.target.value })}
                    className="w-full text-xs font-semibold py-2 mt-1">
                    {styles.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Season Wear</label>
                  <select value={editingItem.season} onChange={(e) => setEditingItem({ ...editingItem, season: e.target.value })}
                    className="w-full text-xs font-semibold py-2 mt-1">
                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button" onClick={() => setEditingItem(null)}
                    className="px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
                  >
                    <Check className="h-3.5 w-3.5 inline mr-1" />
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showCamera && (
        <CameraScanner 
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </motion.div>
  );
};
