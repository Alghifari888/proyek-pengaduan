import React, { createContext, useState, useContext } from 'react';

// Buat Context object
const AuthContext = createContext(null);

// Buat Provider component
export const AuthProvider = ({ children }) => {
  // State untuk menyimpan token. Ambil dari localStorage jika ada.
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Fungsi untuk login: simpan token ke state dan localStorage
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  // Fungsi untuk logout: hapus token dari state dan localStorage
  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  // Nilai yang akan dibagikan ke semua komponen di dalamnya
  const value = {
    token,
    isLoggedIn: !!token, // true jika ada token, false jika tidak
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Buat custom hook untuk mempermudah penggunaan context
export const useAuth = () => {
  return useContext(AuthContext);
};