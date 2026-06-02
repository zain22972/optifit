// OptiFit 2.0 Admin Dashboard Screen
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, Shirt, ShieldAlert, Sparkles, TrendingUp, RefreshCw, 
  Trash2, Edit2, Plus, Check, X, AlertCircle, Info 
} from 'lucide-react';
import api from '../services/api';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [retraining, setRetraining] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'outfits', 'trends'

  // CRUD Data Lists
  const [userList, setUserList] = useState([]);
  const [outfitList, setOutfitList] = useState([]);
  const [trendList, setTrendList] = useState([]);

  // Modal / Form States
  const [showUserModal, setShowUserModal] = useState(false);
  const [showOutfitModal, setShowOutfitModal] = useState(false);
  const [showTrendModal, setShowTrendModal] = useState(false);

  const [currentUserForm, setCurrentUserForm] = useState({ name: '', email: '', password: '', role: 'user', age: '', gender: 'Unisex' });
  const [currentOutfitForm, setCurrentOutfitForm] = useState({ name: '', category: 'Casual Wear', style: 'Casual', color: 'Black', occasion: 'Casual Hangout', gender: 'Unisex', budget: '', season: 'All-Season', components: '', style_explanation: '' });
  const [currentTrendForm, setCurrentTrendForm] = useState({ name: '', type: 'style', value: '', score: '1.15' });

  const [editId, setEditId] = useState(null); // Keeps track if we are updating or creating

  // Lists of options
  const colors = ["Black", "White", "Blue", "Green", "Red", "Yellow", "Brown"];
  const styles = ["Casual", "Formal", "Party", "Traditional", "Streetwear", "Smart Casual", "Business Casual"];
  const occasions = ["Interview", "Wedding", "Casual Hangout", "Business Meeting", "Party", "Sport"];
  const seasons = ["Summer", "Winter", "Rainy", "All-Season"];

  useEffect(() => {
    fetchAnalytics();
    fetchTabList();
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTabList = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'users') {
        const response = await api.get('/admin/users');
        setUserList(response.data);
      } else if (activeTab === 'outfits') {
        const response = await api.get('/admin/outfits');
        setOutfitList(response.data);
      } else if (activeTab === 'trends') {
        const response = await api.get('/admin/trends');
        setTrendList(response.data);
      }
    } catch (err) {
      setError(`Failed to fetch ${activeTab} records.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setSuccessMsg('');
    setError('');
    try {
      const response = await api.post('/admin/retrain-models');
      setSuccessMsg(response.data.message);
    } catch (err) {
      setError('Model retraining failed.');
    } finally {
      setRetraining(false);
    }
  };

  // --- User CRUD handlers ---
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        // Update user
        await api.put(`/admin/users/${editId}`, currentUserForm);
        setSuccessMsg('User record updated successfully.');
      } else {
        // Create user
        await api.post('/admin/users', currentUserForm);
        setSuccessMsg('User created successfully.');
      }
      setShowUserModal(false);
      fetchTabList();
    } catch (err) {
      setError(err.response?.data?.message || 'Error executing user operation.');
    }
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm('Delete this user? This will delete all their wardrobe data.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUserList(prev => prev.filter(u => u.id !== id));
      setSuccessMsg('User deleted successfully.');
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  const openUserCreate = () => {
    setCurrentUserForm({ name: '', email: '', password: '', role: 'user', age: '', gender: 'Unisex' });
    setEditId(null);
    setShowUserModal(true);
  };

  const openUserEdit = (user) => {
    setCurrentUserForm({ name: user.name, email: user.email, password: '', role: user.role, age: user.age || '', gender: user.gender || 'Unisex' });
    setEditId(user.id);
    setShowUserModal(true);
  };

  // --- Outfit CRUD handlers ---
  const handleOutfitSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formattedForm = {
        ...currentOutfitForm,
        budget: parseFloat(currentOutfitForm.budget)
      };
      if (editId) {
        await api.put(`/admin/outfits/${editId}`, formattedForm);
        setSuccessMsg('Outfit updated successfully.');
      } else {
        await api.post('/admin/outfits', formattedForm);
        setSuccessMsg('Outfit added to database.');
      }
      setShowOutfitModal(false);
      fetchTabList();
    } catch (err) {
      setError('Error saving outfit.');
    }
  };

  const handleOutfitDelete = async (id) => {
    if (!window.confirm('Remove this outfit from system database?')) return;
    try {
      await api.delete(`/admin/outfits/${id}`);
      setOutfitList(prev => prev.filter(o => o.id !== id));
      setSuccessMsg('Outfit removed.');
    } catch (err) {
      setError('Failed to delete outfit.');
    }
  };

  const openOutfitCreate = () => {
    setCurrentOutfitForm({ name: '', category: 'Casual Wear', style: 'Casual', color: 'Black', occasion: 'Casual Hangout', gender: 'Unisex', budget: '', season: 'All-Season', components: '', style_explanation: '' });
    setEditId(null);
    setShowOutfitModal(true);
  };

  const openOutfitEdit = (outfit) => {
    setCurrentOutfitForm({ ...outfit });
    setEditId(outfit.id);
    setShowOutfitModal(true);
  };

  // --- Trend CRUD handlers ---
  const handleTrendSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formattedForm = {
        ...currentTrendForm,
        score: parseFloat(currentTrendForm.score)
      };
      if (editId) {
        await api.put(`/admin/trends/${editId}`, formattedForm);
        setSuccessMsg('Trend updated successfully.');
      } else {
        await api.post('/admin/trends', formattedForm);
        setSuccessMsg('Trend created.');
      }
      setShowTrendModal(false);
      fetchTabList();
    } catch (err) {
      setError('Error saving trend.');
    }
  };

  const handleTrendToggleActive = async (trend) => {
    try {
      await api.put(`/admin/trends/${trend.id}`, { is_active: trend.is_active === 1 ? 0 : 1 });
      fetchTabList();
    } catch (err) {
      setError('Failed to toggle trend status.');
    }
  };

  const handleTrendDelete = async (id) => {
    if (!window.confirm('Delete trend?')) return;
    try {
      await api.delete(`/admin/trends/${id}`);
      setTrendList(prev => prev.filter(t => t.id !== id));
      setSuccessMsg('Trend removed.');
    } catch (err) {
      setError('Failed to delete trend.');
    }
  };

  const openTrendCreate = () => {
    setCurrentTrendForm({ name: '', type: 'style', value: '', score: '1.15' });
    setEditId(null);
    setShowTrendModal(true);
  };

  // Process data for analytics charts
  const barData = analytics?.most_saved_outfits?.map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    Saves: item.saves
  })) || [];

  const PIE_COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#e0e7ff', '#c7d2fe'];
  const pieData = analytics?.popular_styles?.map(item => ({
    name: item.style,
    value: item.count
  })) || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-rose-500" />
            Admin Panel
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Global platform telemetry and full database CRUD interfaces</p>
        </div>

        {/* Retrain Classifier button */}
        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${retraining ? 'animate-spin' : ''}`} />
          {retraining ? 'Retraining ML Models...' : 'Retrain CV Classifier'}
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

      {/* --- Analytics overview --- */}
      {analytics && (
        <section className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Total Users</span>
              <h3 className="text-3xl font-extrabold mt-1 text-slate-900 dark:text-white">{analytics.total_users}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">System Outfits</span>
              <h3 className="text-3xl font-extrabold mt-1 text-slate-900 dark:text-white">{analytics.total_outfits}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Wardrobe Uploads</span>
              <h3 className="text-3xl font-extrabold mt-1 text-slate-900 dark:text-white">{analytics.total_uploads}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">CV Recommendation Precision</span>
              <h3 className="text-3xl font-extrabold mt-1 text-emerald-500">{analytics.recommendation_accuracy}%</h3>
            </div>
          </div>

          {/* Analytics Visualized */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top saved outfits bar chart */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-6">Top Saved Outfits by Users</h4>
              <div className="h-64 text-xs font-bold">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="name" stroke="#888888" tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="Saves" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">No outfit save records yet.</div>
                )}
              </div>
            </div>

            {/* Popular style categories pie chart */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-6">Popular Wardrobe Aesthetics</h4>
              <div className="h-64 flex items-center justify-center text-xs font-bold">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#888884"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">No wardrobe uploads recorded.</div>
                )}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* --- CRUD Control tabs --- */}
      <section className="space-y-6">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {['users', 'outfits', 'trends'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-6 py-3 font-bold text-sm border-b-2 capitalize transition-all ${
                activeTab === t
                  ? 'border-indigo-600 text-indigo-600 dark:text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t} Manager
            </button>
          ))}
        </div>

        {/* Tab Controls toolbar */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-4 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Database Tables ({activeTab})</span>
          <button
            onClick={activeTab === 'users' ? openUserCreate : (activeTab === 'outfits' ? openOutfitCreate : openTrendCreate)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add {activeTab === 'users' ? 'User' : (activeTab === 'outfits' ? 'Outfit' : 'Trend')}
          </button>
        </div>

        {/* CRUD Table Data */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold">Querying record tables...</div>
          ) : (
            <div className="overflow-x-auto">
              
              {/* Users CRUD Table */}
              {activeTab === 'users' && (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100/50 dark:bg-slate-900 border-b border-slate-250 dark:border-slate-800">
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">ID</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">Name</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">Email</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">Role</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">Age / Gender</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map(u => (
                      <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="p-4 font-mono font-bold text-slate-400">{u.id}</td>
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{u.name}</td>
                        <td className="p-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 text-slate-400'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-semibold">{u.age || '—'} yrs / {u.gender || 'Unisex'}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => openUserEdit(u)} className="p-2 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-500 hover:text-indigo-500">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleUserDelete(u.id)} className="p-2 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-500 hover:text-rose-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Outfits CRUD Table */}
              {activeTab === 'outfits' && (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100/50 dark:bg-slate-900 border-b border-slate-250 dark:border-slate-800">
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">ID</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">Name</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">Attributes</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">Budget</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">Components</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outfitList.map(o => (
                      <tr key={o.id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="p-4 font-mono font-bold text-slate-400">{o.id}</td>
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{o.name}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 uppercase">{o.style}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 uppercase">{o.occasion}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 uppercase">{o.season}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold">${o.budget}</td>
                        <td className="p-4 text-xs text-slate-400 max-w-xs truncate">{o.components}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => openOutfitEdit(o)} className="p-2 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-500 hover:text-indigo-500">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleOutfitDelete(o.id)} className="p-2 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-500 hover:text-rose-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Trends CRUD Table */}
              {activeTab === 'trends' && (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100/50 dark:bg-slate-900 border-b border-slate-250 dark:border-slate-800">
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">ID</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">Trend Name</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">Scope Type</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">Match Value</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">Boost Multiplier</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400">Status</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendList.map(t => (
                      <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="p-4 font-mono font-bold text-slate-400">{t.id}</td>
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{t.name}</td>
                        <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{t.type}</td>
                        <td className="p-4 font-semibold capitalize">{t.value}</td>
                        <td className="p-4 font-bold font-mono text-indigo-500">+{Math.round((t.score - 1.0) * 100)}% ({t.score}x)</td>
                        <td className="p-4">
                          <button 
                            onClick={() => handleTrendToggleActive(t)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                              t.is_active === 1 
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' 
                                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {t.is_active === 1 ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleTrendDelete(t.id)} className="p-2 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-500 hover:text-rose-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          )}
        </div>
      </section>

      {/* --- User Modal --- */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{editId ? 'Edit User details' : 'Create New User'}</h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">User Name</label>
                <input type="text" value={currentUserForm.name} onChange={(e) => setCurrentUserForm({ ...currentUserForm, name: e.target.value })} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                <input type="email" value={currentUserForm.email} onChange={(e) => setCurrentUserForm({ ...currentUserForm, email: e.target.value })} required />
              </div>
              {!editId && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
                  <input type="password" value={currentUserForm.password} onChange={(e) => setCurrentUserForm({ ...currentUserForm, password: e.target.value })} required />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Age</label>
                  <input type="number" value={currentUserForm.age} onChange={(e) => setCurrentUserForm({ ...currentUserForm, age: e.target.value })} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                  <select value={currentUserForm.gender} onChange={(e) => setCurrentUserForm({ ...currentUserForm, gender: e.target.value })} className="h-[46px] text-xs font-semibold py-1.5" required>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">System Role</label>
                <select value={currentUserForm.role} onChange={(e) => setCurrentUserForm({ ...currentUserForm, role: e.target.value })} className="h-[46px] text-xs font-semibold py-1.5">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold transition-all shadow-md">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Outfit Modal --- */}
      {showOutfitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{editId ? 'Edit Outfit details' : 'Add Custom Outfit'}</h3>
            <form onSubmit={handleOutfitSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Outfit Name</label>
                <input type="text" placeholder="e.g. Executive Blue Blazer Suit" value={currentOutfitForm.name} onChange={(e) => setCurrentOutfitForm({ ...currentOutfitForm, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category Tag</label>
                  <input type="text" placeholder="e.g. Business Formal" value={currentOutfitForm.category} onChange={(e) => setCurrentOutfitForm({ ...currentOutfitForm, category: e.target.value })} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Style Aesthetic</label>
                  <select value={currentOutfitForm.style} onChange={(e) => setCurrentOutfitForm({ ...currentOutfitForm, style: e.target.value })} className="h-[46px] text-xs font-semibold py-1.5">
                    {styles.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Dominant Color</label>
                  <select value={currentOutfitForm.color} onChange={(e) => setCurrentOutfitForm({ ...currentOutfitForm, color: e.target.value })} className="h-[46px] text-xs font-semibold py-1.5">
                    {colors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Occasion</label>
                  <select value={currentOutfitForm.occasion} onChange={(e) => setCurrentOutfitForm({ ...currentOutfitForm, occasion: e.target.value })} className="h-[46px] text-xs font-semibold py-1.5">
                    {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                  <select value={currentOutfitForm.gender} onChange={(e) => setCurrentOutfitForm({ ...currentOutfitForm, gender: e.target.value })} className="h-[46px] text-xs font-semibold py-1.5">
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Est. Budget ($)</label>
                  <input type="number" placeholder="250" value={currentOutfitForm.budget} onChange={(e) => setCurrentOutfitForm({ ...currentOutfitForm, budget: e.target.value })} required />
                </div>
                <div className="flex flex-col gap-1 col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Season Wear</label>
                  <select value={currentOutfitForm.season} onChange={(e) => setCurrentOutfitForm({ ...currentOutfitForm, season: e.target.value })} className="h-[46px] text-xs font-semibold py-1.5">
                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Components (comma separated list)</label>
                <input type="text" placeholder="Navy Blue Blazer, White Dress Shirt, Black Derby Shoes" value={currentOutfitForm.components} onChange={(e) => setCurrentOutfitForm({ ...currentOutfitForm, components: e.target.value })} required />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Style Rationale Explanation</label>
                <textarea rows="3" placeholder="Explain the matching structure of these visual components..." value={currentOutfitForm.style_explanation} onChange={(e) => setCurrentOutfitForm({ ...currentOutfitForm, style_explanation: e.target.value })} className="w-full text-xs p-3" required />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button type="button" onClick={() => setShowOutfitModal(false)} className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold transition-all shadow-md">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Trend Modal --- */}
      {showTrendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Custom Market Trend</h3>
            <form onSubmit={handleTrendSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Trend Display Name</label>
                <input type="text" placeholder="e.g. Winter Cargo Aesthetics" value={currentTrendForm.name} onChange={(e) => setCurrentTrendForm({ ...currentTrendForm, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Scope Match Type</label>
                  <select value={currentTrendForm.type} onChange={(e) => setCurrentTrendForm({ ...currentTrendForm, type: e.target.value })} className="h-[46px] text-xs font-semibold py-1.5">
                    <option value="style">Style Match</option>
                    <option value="color">Color Match</option>
                    <option value="category">Category Match</option>
                    <option value="season">Season Match</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Match Value</label>
                  <input type="text" placeholder="e.g. Streetwear" value={currentTrendForm.value} onChange={(e) => setCurrentTrendForm({ ...currentTrendForm, value: e.target.value })} required />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Recommendation Boost Multiplier</label>
                <input type="number" min="1.0" max="2.0" step="0.05" value={currentTrendForm.score} onChange={(e) => setCurrentTrendForm({ ...currentTrendForm, score: e.target.value })} required />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button type="button" onClick={() => setShowTrendModal(false)} className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold transition-all shadow-md">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
