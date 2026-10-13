import React, { useState, useEffect } from 'react';
import {
  cargarBaseDeDatos,
  guardarBaseDeDatos,
  reiniciarBaseDeDatos,
  AppDatabase,
} from './utils/storage';
import { Header } from './components/Header';
import { Navbar, ViewType } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { EstudiantesView } from './components/EstudiantesView';
import { DocentesView } from './components/DocentesView';
import { NotasView } from './components/NotasView';
import { AsistenciaView } from './components/AsistenciaView';
import { BoletinesView } from './components/BoletinesView';
import { ComunicadosAdminView } from './components/ComunicadosAdminView';
import { PortalPadresView } from './components/portal-padres/PortalPadresView';
import { LoginPadresModal } from './components/portal-padres/LoginPadresModal';
import { BoletinModal } from './components/BoletinModal';
import { CarnetModal } from './components/CarnetModal';
import { ConfiguracionModal } from './components/ConfiguracionModal';
import { AcudienteUsuario } from './types';

export default function App() {
  const [db, setDb] = useState<AppDatabase>(() => cargarBaseDeDatos());
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado del Portal de Padres
  const [acudienteActivo, setAcudienteActivo] = useState<AcudienteUsuario | null>(null);
  const [loginPadresAbierto, setLoginPadresAbierto] = useState<boolean>(false);

  // Modales
  const [boletinEstudianteId, setBoletinEstudianteId] = useState<string | null>(null);
  const [carnetEstudianteId, setCarnetEstudianteId] = useState<string | null>(null);
  const [configuracionAbierta, setConfiguracionAbierta] = useState<boolean>(false);

  // Sincronizar persistencia en localStorage
  const updateDb = (newDb: AppDatabase) => {
    setDb(newDb);
    guardarBaseDeDatos(newDb);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16 md:pb-8 selection:bg-blue-100">
      {/* Header Institucional MEDUCA */}
      <Header
        db={db}
        onUpdateDb={updateDb}
        onOpenConfig={() => setConfiguracionAbierta(true)}
        onResetDemo={() => {
          if (window.confirm('¿Restablecer datos del sistema escolar a la versión inicial?')) {
            const reset = reiniciarBaseDeDatos();
            updateDb(reset);
            showToast('🔄 Base de datos restablecida');
          }
        }}
        onOpenPortalPadres={() => setLoginPadresAbierto(true)}
        esModoPadre={!!acudienteActivo}
      />

      {/* Navegación administrativa solo visible si NO está en modo portal de padres */}
      {!acudienteActivo && (
        <Navbar
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenPortalPadres={() => setLoginPadresAbierto(true)}
        />
      )}

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 no-print">
        {/* VISTA PORTAL DE PADRES (Si hay acudiente autenticado) */}
        {acudienteActivo ? (
          <PortalPadresView
            db={db}
            acudiente={acudienteActivo}
            onLogout={() => {
              setAcudienteActivo(null);
              showToast('👋 Sesión de acudiente cerrada');
            }}
            onSwitchToAdmin={() => {
              setAcudienteActivo(null);
              setCurrentView('dashboard');
            }}
            onOpenBoletin={(id) => setBoletinEstudianteId(id)}
            onOpenCarnet={(id) => setCarnetEstudianteId(id)}
            onUpdateDb={updateDb}
            onShowToast={showToast}
          />
        ) : (
          /* VISTAS ADMINISTRATIVAS Y DOCENTES */
          <>
            {currentView === 'dashboard' && (
              <DashboardView
                db={db}
                onNavigate={setCurrentView}
                onSelectEstudianteParaBoletin={(id) => setBoletinEstudianteId(id)}
              />
            )}

            {currentView === 'estudiantes' && (
              <EstudiantesView
                db={db}
                onUpdateDb={updateDb}
                onOpenBoletin={(id) => setBoletinEstudianteId(id)}
                onOpenCarnet={(id) => setCarnetEstudianteId(id)}
                onShowToast={showToast}
              />
            )}

            {currentView === 'docentes' && (
              <DocentesView
                db={db}
                onUpdateDb={updateDb}
                onShowToast={showToast}
              />
            )}

            {currentView === 'notas' && (
              <NotasView
                db={db}
                onUpdateDb={updateDb}
                onShowToast={showToast}
              />
            )}

            {currentView === 'asistencia' && (
              <AsistenciaView
                db={db}
                onUpdateDb={updateDb}
                onShowToast={showToast}
              />
            )}

            {currentView === 'boletines' && (
              <BoletinesView
                db={db}
                onOpenBoletin={(id) => setBoletinEstudianteId(id)}
                onShowToast={showToast}
              />
            )}

            {currentView === 'comunicados' && (
              <ComunicadosAdminView
                db={db}
                onUpdateDb={updateDb}
                onShowToast={showToast}
                onOpenPortalPadres={() => setLoginPadresAbierto(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Modal de Inicio de Sesión para Padres */}
      {loginPadresAbierto && (
        <LoginPadresModal
          db={db}
          onSuccessLogin={(acudiente) => {
            setAcudienteActivo(acudiente);
            setLoginPadresAbierto(false);
          }}
          onClose={() => setLoginPadresAbierto(false)}
          onShowToast={showToast}
        />
      )}

      {/* Modales Compartidos */}
      {boletinEstudianteId && (
        <BoletinModal
          db={db}
          estudianteId={boletinEstudianteId}
          onClose={() => setBoletinEstudianteId(null)}
          onSelectEstudiante={(id) => setBoletinEstudianteId(id)}
        />
      )}

      {carnetEstudianteId && (
        <CarnetModal
          db={db}
          estudianteId={carnetEstudianteId}
          onClose={() => setCarnetEstudianteId(null)}
        />
      )}

      {configuracionAbierta && (
        <ConfiguracionModal
          db={db}
          onUpdateDb={updateDb}
          onClose={() => setConfiguracionAbierta(false)}
          onShowToast={showToast}
        />
      )}

      {/* Notificación Toast flotante */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 border border-slate-700 max-w-sm text-center">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
