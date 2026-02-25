import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerDashboard from './pages/WorkerDashboard';
import EngineerDashboard from './pages/EngineerDashboard';

// i18n
import './i18n';

const AppRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    return (
        <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'engineer' ? '/engineer' : '/worker'} />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/worker" />} />

            <Route path="/worker" element={
                <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerDashboard />
                </ProtectedRoute>
            } />

            <Route path="/engineer" element={
                <ProtectedRoute allowedRoles={['engineer']}>
                    <EngineerDashboard />
                </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <div className="mesh-bg" />
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
