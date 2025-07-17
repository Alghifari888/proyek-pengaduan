import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    // 1. Bungkus seluruh aplikasi dengan <Router>
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Sistem Pengaduan Masyarakat</h1>
          {/* 2. Buat navigasi menggunakan komponen <Link> */}
          <nav>
            <Link to="/">Formulir Laporan</Link>
            <Link to="/dashboard">Dashboard Admin</Link>
          </nav>
        </header>
        <main>
          {/* 3. Tentukan rute-rute yang ada */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
