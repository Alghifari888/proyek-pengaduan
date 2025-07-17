import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage'; // Impor halaman login
import { AuthProvider, useAuth } from './context/AuthContext'; // Impor Auth
import ProtectedRoute from './components/ProtectedRoute'; // Impor penjaga

// Komponen baru untuk menampilkan tombol Login/Logout
const AuthButton = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return isLoggedIn ? (
    <button onClick={handleLogout} className="auth-button">Logout</button>
  ) : (
    <Link to="/login" className="auth-button">Login Admin</Link>
  );
};

function App() {
  return (
    // 1. Bungkus aplikasi dengan AuthProvider
    <AuthProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>Sistem Pengaduan Masyarakat</h1>
            <nav>
              <Link to="/">Formulir Laporan</Link>
              <Link to="/dashboard">Dashboard Admin</Link>
              <AuthButton />
            </nav>
          </header>
          <main>
            <Routes>
              {/* Rute publik */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Rute yang dilindungi */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;