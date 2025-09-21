import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { PackingProvider } from './packing/PackingContext';
import ProtectedLayout from './layouts/ProtectedLayout';
import Login from './views/login';
import Home from './views/home';
import Cart from './views/cart';
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <PackingProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/carrinho" element={<Cart />} />
          </Route>
        </Routes>
      </PackingProvider>
    </AuthProvider>
  );
}
