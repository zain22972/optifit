import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Import Views
import { Login } from './views/Login';
import { Register } from './views/Register';
import { ForgotPassword } from './views/ForgotPassword';
import { Dashboard } from './views/Dashboard';
import { Wardrobe } from './views/Wardrobe';
import { OutfitGenerator } from './views/OutfitGenerator';
import { TrendCenter } from './views/TrendCenter';
import { AdminDashboard } from './views/AdminDashboard';
import { PreferencesOnboarding } from './views/PreferencesOnboarding';

function AppContent() {
  const [weatherState, setWeatherState] = useState('Hot');

  return (
    <Routes>
      {/* Unprotected Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Style Onboarding */}
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <PreferencesOnboarding />
          </ProtectedRoute>
        } 
      />

      {/* Protected Main Routes (with Layout) */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout weatherState={weatherState} setWeatherState={setWeatherState}>
              <Dashboard weatherState={weatherState} />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/wardrobe" 
        element={
          <ProtectedRoute>
            <Layout weatherState={weatherState} setWeatherState={setWeatherState}>
              <Wardrobe />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/generate" 
        element={
          <ProtectedRoute>
            <Layout weatherState={weatherState} setWeatherState={setWeatherState}>
              <OutfitGenerator />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trends" 
        element={
          <ProtectedRoute>
            <Layout weatherState={weatherState} setWeatherState={setWeatherState}>
              <TrendCenter />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <Layout weatherState={weatherState} setWeatherState={setWeatherState}>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
