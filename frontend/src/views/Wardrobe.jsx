// OptiFit 2.0 Virtual Wardrobe Screen
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Trash2, Edit2, Check, X, 
  Upload, CloudUpload, Info, CheckCircle2 
} from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';

export const Wardrobe = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [filterStyle, setFilterStyle] = useState('');
  const [filterSeason, setFilterSeason] = useState('');

  // Uploading State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [analyzedItem, setAnalyzedItem] = useState(null); // Holds CV-analyzed results for user confirmation

  // Editing State
  const [editingItem, setEditingItem] = useState(null);

  // Dropdown options
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

  // Handle image upload & invoke CV Analyzer
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setUploadProgress('Uploading image...');
    setError('');

    try {
      setUploadProgress('Running Computer Vision analysis...');
      const response = await api.post('/upload-clothing', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Load CV analysis
      setAnalyzedItem(response.data.item);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading garment. Please verify server and file.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  // Confirm and update item details
  const handleConfirmAnalyzed = async () => {
    if (!analyzedItem) return;
    
    try {
      // Save changes back to server
      await api.put(`/wardrobe/${analyzedItem.id}`, {
        category: analyzedItem.category,
        subcategory: analyzedItem.subcategory,
        color: analyzedItem.color,
        style: analyzedItem.style,
        season: analyzedItem.season
      });
      
      setAnalyzedItem(null);
      fetchWardrobe(); // Reload
    } catch (err) {
      setError('Failed to save analyzed item updates.');
    }
  };

  // Edit details of existing item
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
    if (!window.confirm('Are you sure you want to delete this garment from your virtual wardrobe?')) return;
    try {
      await api.delete(`/wardrobe/${id}`);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError('Failed to delete garment.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Virtual Wardrobe</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Manage and digitize your physical clothing collection using AI vision</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm">
          {error}
        </div>
      )}

      {/* --- Search & Filters Header --- */}
      <section className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex w-full md:w-auto flex-1 gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subcategory or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 bg-slate-50 dark:bg-slate-950 text-sm py-2"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-colors">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 text-xs py-2 pr-6 border border-slate-200 dark:border-slate-800 rounded-xl"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={filterColor} 
            onChange={(e) => setFilterColor(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 text-xs py-2 pr-6 border border-slate-200 dark:border-slate-800 rounded-xl"
          >
            <option value="">All Colors</option>
            {colors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={filterStyle} 
            onChange={(e) => setFilterStyle(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 text-xs py-2 pr-6 border border-slate-200 dark:border-slate-800 rounded-xl"
          >
            <option value="">All Styles</option>
            {styles.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            value={filterSeason} 
            onChange={(e) => setFilterSeason(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 text-xs py-2 pr-6 border border-slate-200 dark:border-slate-800 rounded-xl"
          >
            <option value="">All Seasons</option>
            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </section>

      {/* --- Main Gallery Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Upload panel (sticky left/top) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Clothes</h3>
            
            {uploading ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-500/20 bg-indigo-500/5 rounded-2xl p-8 text-center h-48">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-3"></div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{uploadProgress}</p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-850 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 rounded-2xl p-8 text-center cursor-pointer h-48 transition-all bg-slate-50/50 dark:bg-slate-900/20 group">
                <CloudUpload className="h-10 w-10 text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3">Upload clothing image</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Supports PNG, JPG, WEBP</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </label>
            )}
            <div className="mt-4 flex items-start gap-2.5 p-3 rounded-2xl bg-indigo-500/5 text-indigo-500 text-[10px] leading-relaxed">
              <Info className="h-4.5 w-4.5 shrink-0" />
              <span>OptiFit's Computer Vision system scans color, category, style, and season parameters automatically upon image upload.</span>
            </div>
          </div>
        </div>

        {/* Wardrobe Clothes list */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(idx => (
                <div key={idx} className="h-64 rounded-3xl bg-slate-200/50 dark:bg-slate-800/40 animate-pulse"></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <p className="text-slate-500 font-semibold">No clothes in your virtual wardrobe yet. Upload a picture above to start compiling outfits!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm scale-hover flex flex-col justify-between group h-80 relative"
                >
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-850 overflow-hidden relative">
                    <img 
                      src={`${API_BASE_URL}${item.image_url}`} 
                      alt={item.subcategory}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60" }}
                    />
                    
                    {/* Action Overlay */}
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-500 hover:scale-105 transition-all shadow-sm"
                        title="Edit Details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:scale-105 transition-all shadow-sm"
                        title="Delete Garment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate capitalize">{item.color} {item.subcategory || 'Garment'}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-1">{item.category}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      <span className="text-[9px] font-bold border border-slate-200 dark:border-slate-850 px-2 py-0.5 rounded text-slate-400 dark:text-slate-500">{item.style}</span>
                      <span className="text-[9px] font-bold border border-slate-200 dark:border-slate-850 px-2 py-0.5 rounded text-slate-400 dark:text-slate-500">{item.season}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* --- CV Confirmation On Upload Modal --- */}
      {analyzedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 className="h-5 w-5" />
                  CV Classification Results
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Please confirm or correct the tags parsed by the vision analyzer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="aspect-[4/3] rounded-2xl bg-slate-100 dark:bg-slate-850 overflow-hidden border border-slate-200 dark:border-slate-800">
                <img 
                  src={`${API_BASE_URL}${analyzedItem.image_url}`} 
                  alt="Garment Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category Group</label>
                  <select 
                    value={analyzedItem.category}
                    onChange={(e) => setAnalyzedItem({ ...analyzedItem, category: e.target.value })}
                    className="w-full text-xs font-semibold py-1.5"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Clothing Category</label>
                  <select 
                    value={analyzedItem.subcategory}
                    onChange={(e) => setAnalyzedItem({ ...analyzedItem, subcategory: e.target.value })}
                    className="w-full text-xs font-semibold py-1.5"
                  >
                    {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Color Tone</label>
                  <select 
                    value={analyzedItem.color}
                    onChange={(e) => setAnalyzedItem({ ...analyzedItem, color: e.target.value })}
                    className="w-full text-xs font-semibold py-1.5"
                  >
                    {colors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Style Aesthetic</label>
                  <select 
                    value={analyzedItem.style}
                    onChange={(e) => setAnalyzedItem({ ...analyzedItem, style: e.target.value })}
                    className="w-full text-xs font-semibold py-1.5"
                  >
                    {styles.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Season Wear</label>
                  <select 
                    value={analyzedItem.season}
                    onChange={(e) => setAnalyzedItem({ ...analyzedItem, season: e.target.value })}
                    className="w-full text-xs font-semibold py-1.5"
                  >
                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setAnalyzedItem(null)} 
                className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Discard
              </button>
              <button 
                onClick={handleConfirmAnalyzed} 
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
              >
                Confirm & Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Edit Metadata Modal (Existing item) --- */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Edit Garment Details</h3>
            
            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Category Group</label>
                <select 
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full text-xs font-semibold py-1.5"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Clothing Category</label>
                <select 
                  value={editingItem.subcategory}
                  onChange={(e) => setEditingItem({ ...editingItem, subcategory: e.target.value })}
                  className="w-full text-xs font-semibold py-1.5"
                >
                  {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Color Tone</label>
                <select 
                  value={editingItem.color}
                  onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                  className="w-full text-xs font-semibold py-1.5"
                >
                  {colors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Style Aesthetic</label>
                <select 
                  value={editingItem.style}
                  onChange={(e) => setEditingItem({ ...editingItem, style: e.target.value })}
                  className="w-full text-xs font-semibold py-1.5"
                >
                  {styles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Season Wear</label>
                <select 
                  value={editingItem.season}
                  onChange={(e) => setEditingItem({ ...editingItem, season: e.target.value })}
                  className="w-full text-xs font-semibold py-1.5"
                >
                  {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)} 
                  className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
