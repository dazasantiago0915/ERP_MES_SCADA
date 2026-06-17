import React, { useState } from 'react';
import { useAuth } from './auth/useAuth';
import LoginPage from './auth/LoginPage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import LineaPage from './pages/LineaPage';
import PedidosPage from './pages/PedidosPage';
import AlarmasPage from './pages/AlarmasPage';

export default function App() {
  const { user, role, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedLine, setSelectedLine] = useState<'L1' | 'L2'>('L1');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center font-mono text-xs text-blue-400 gap-3">
        <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span>SINCRO PLC...</span>
      </div>
    );
  }

  // Si no está loggeado, obligar Login HMI
  if (!user) {
    return <LoginPage />;
  }

  // Renderizador condicional de páginas
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'lineas':
        return <LineaPage lineaId={selectedLine} />;
      case 'pedidos':
        return <PedidosPage />;
      case 'alarmas':
        return <AlarmasPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] flex overflow-hidden font-sans select-none text-gray-200">
      {/* Sidebar de Navegación e Identificadores */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        selectedLine={selectedLine}
        setSelectedLine={setSelectedLine}
      />

      {/* Cuerpo principal de Telemetría */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Cabecera Status */}
        <Header />

        {/* Contenido Dinámico de la Consola */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

