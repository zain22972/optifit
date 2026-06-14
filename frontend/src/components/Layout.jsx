import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Shirt, Sparkles, TrendingUp, LogOut, 
  Sun, Moon, Menu, X, ShieldAlert, Cloud, CloudRain, Snowflake, ThermometerSun,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Layout = ({ children, weatherState, setWeatherState }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

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

  const weatherIcons = {
    "Hot": <ThermometerSun className="h-4 w-4 text-amber-500" />,
    "Rainy": <CloudRain className="h-4 w-4 text-blue-500" />,
    "Winter": <Snowflake className="h-4 w-4 text-indigo-400" />
  };

  const activeIndex = navItems.findIndex(item => item.path === location.pathname);

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-fashion-dark text-slate-800 dark:text-slate-200">
      
      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 py-6 z-20 relative overflow-hidden"
      >
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-6'} mb-10 relative`}>
          <motion.div
            whileHover={{ scale: 1.05, rotate: -5 }}
            className="h-10 w-10 min-w-[40px] rounded-xl gradient-gold flex items-center justify-center shadow-lg shadow-gold-500/20"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">OptiFit <span className="text-gold-500 font-extrabold">2.0</span></h1>
                <p className="text-xs text-slate-400 dark:text-slate-500">AI Fashion Assistant</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 relative px-3">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`relative flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all duration-200 my-1 group ${
                  isActive 
                    ? 'text-white' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-600/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="shrink-0"
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'group-hover:text-indigo-600 dark:group-hover:text-white'} transition-colors`} />
                  </motion.div>
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-1/2 z-30 h-8 w-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* User Card */}
        <div className={`pt-6 border-t border-slate-200/50 dark:border-slate-800/50 ${sidebarCollapsed ? 'px-3' : 'px-6'}`}>
          <div className={`flex ${sidebarCollapsed ? 'flex-col items-center' : 'items-center gap-3'}`}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="h-10 w-10 min-w-[40px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center border-2 border-white/20 shadow-lg shrink-0"
            >
              <span className="font-bold text-white">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden"
                >
                  <h4 className="text-sm font-semibold truncate text-slate-900 dark:text-white">{user?.name}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate capitalize">{user?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={handleLogout}
            className={`flex items-center ${sidebarCollapsed ? 'justify-center mt-4' : 'gap-3 w-full'} mt-4 px-4 py-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all font-medium text-sm group`}
          >
            <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Drawer */}
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
              className="fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-900 z-40 p-6 flex flex-col md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl gradient-gold flex items-center justify-center shadow-lg shadow-gold-500/20">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">OptiFit <span className="text-gold-500">2.0</span></h1>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20' 
                          : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <span className="font-bold text-white">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
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

      {/* Main Screen Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar with Glass Effect */}
        <header className="h-16 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
            <div className="hidden md:flex flex-col">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Welcome Back</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            
            {/* Global Weather Context Selector */}
            <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/30 dark:border-slate-800/30 shadow-inner backdrop-blur-sm">
              {["Hot", "Rainy", "Winter"].map((w) => (
                <button
                  key={w}
                  onClick={() => setWeatherState(w)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    weatherState === w
                      ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white scale-105'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title={`Weather: ${w}`}
                >
                  {weatherIcons[w]}
                  <span className="hidden sm:inline">{w}</span>
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all scale-hover relative overflow-hidden"
              aria-label="Toggle Theme"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5 text-gold-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
              </motion.div>
            </motion.button>
          </div>
        </header>

        {/* View container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-fashion-dark/50">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>

    </div>
  );
};
