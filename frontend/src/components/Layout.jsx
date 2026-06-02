// OptiFit 2.0 Responsive Layout Component
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Shirt, Sparkles, TrendingUp, User, LogOut, 
  Sun, Moon, Menu, X, ShieldAlert, Cloud, CloudRain, Snowflake, ThermometerSun 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Layout = ({ children, weatherState, setWeatherState }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Virtual Wardrobe', path: '/wardrobe', icon: Shirt },
    { name: 'AI Outfit Generator', path: '/generate', icon: Sparkles },
    { name: 'Trend Center', path: '/trends', icon: TrendingUp },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Dashboard', path: '/admin', icon: ShieldAlert });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Weather toggle icons
  const weatherIcons = {
    "Hot": <ThermometerSun className="h-4 w-4 text-amber-500 animate-pulse" />,
    "Rainy": <CloudRain className="h-4 w-4 text-blue-500" />,
    "Winter": <Snowflake className="h-4 w-4 text-indigo-400" />
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-fashion-dark text-slate-800 dark:text-slate-200">
      
      {/* --- Sidebar Desktop --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-800/50 p-6 z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-10 w-10 rounded-xl gradient-gold flex items-center justify-center shadow-lg shadow-gold-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">OptiFit <span className="text-gold-500 font-extrabold">2.0</span></h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">AI Fashion Assistant</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/40 hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card at Sidebar Bottom */}
        <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/30">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate text-slate-900 dark:text-white">{user?.name}</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate capitalize">{user?.role} Profile</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all font-medium text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- Mobile Sidebar Drawer --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-900 z-40 p-6 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl gradient-gold flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">OptiFit 2.0</h1>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-lg' 
                          : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <span className="font-bold text-indigo-600 dark:text-indigo-300">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate capitalize">{user?.role}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all font-medium text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- Main Screen Area --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex flex-col">
              <span className="text-xs text-slate-400 dark:text-slate-500">Welcome Back</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Global Weather Context Selector (Directly Toggles Recommendations) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/30 dark:border-slate-800/30 shadow-inner">
              {["Hot", "Rainy", "Winter"].map((w) => (
                <button
                  key={w}
                  onClick={() => setWeatherState(w)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    weatherState === w
                      ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title={`Trigger weather recommender: ${w}`}
                >
                  {weatherIcons[w]}
                  <span className="hidden sm:inline">{w}</span>
                </button>
              ))}
            </div>

            {/* Dark/Light Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all scale-hover"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-gold-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </button>
          </div>
        </header>

        {/* View container */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-fashion-dark/50">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

    </div>
  );
};
