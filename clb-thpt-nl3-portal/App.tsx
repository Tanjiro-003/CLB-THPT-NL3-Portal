import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import MyEvents from './pages/MyEvents';
import ChatWidget from './components/ChatWidget';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import EventManager from './pages/admin/EventManager';
import UserManager from './pages/admin/UserManager';
import CreateEvent from './pages/admin/CreateEvent';

import { User } from './types';
import { db } from './services/mockDatabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Initialize user from local storage
  useEffect(() => {
    const storedUser = db.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <HashRouter>
      <Routes>
        {/* Admin Routes - Separate Layout */}
        <Route path="/admin" element={<AdminLayout user={user} setUser={setUser} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events" element={<EventManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="create-event" element={<CreateEvent user={user} />} />
        </Route>

        {/* Public Routes - Main Layout */}
        <Route path="/" element={<Layout user={user} setUser={setUser}><Home user={user} setUser={setUser} /></Layout>} />
        <Route path="/my-events" element={<Layout user={user} setUser={setUser}><MyEvents user={user} setUser={setUser} /></Layout>} />
        <Route path="/login" element={<Layout user={user} setUser={setUser}><AuthPage setUser={setUser} /></Layout>} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Chat widget only on public pages, roughly handled by layout checks but good to keep global */}
      {!window.location.hash.includes('/admin') && <ChatWidget user={user} />}
    </HashRouter>
  );
};

export default App;