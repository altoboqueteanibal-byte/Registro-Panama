import React, { useState, useEffect } from 'react';
import {
  cargarBaseDeDatos,
  guardarBaseDeDatos,
  reiniciarBaseDeDatos,
  AppDatabase,
  obtenerSesionDocenteActiva,
  guardarSesionDocenteActiva,
  obtenerSesionAdminActiva,
  guardarSesionAdminActiva,
} from './utils/storage';
import { Header } from './components/Header';
import { ViewType } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { EstudiantesView } from './components/EstudiantesView';
import { DocentesView } from './components/DocentesView';
import { NotasView } from './components/NotasView';
import { AsistenciaView } from './components/AsistenciaView';
import { BoletinesView } from './components/BoletinesView';
import { ComunicadosAdminView } from './components/ComunicadosAdminView';
import { PeriodosTrimestralesView } from './components/PeriodosTrimestralesView';
import { AuditoriaNotasView } from './components/AuditoriaNotasView';
import { PortalTripartitoGateway } from './components/PortalTripartitoGateway';
import { PortalPadresView } from './components/portal-padres/PortalPadresView';
import { LoginPadresModal } from './components/portal-padres/LoginPadresModal';
import { LoginDocenteModal } from './components/portal-docentes/LoginDocenteModal';
import { DocenteSessionBanner } from './components/portal-docentes/DocenteSessionBanner';
import { AccionesRapidasModal } from './components/AccionesRapidasModal';
import { BoletinModal } from './components/BoletinModal';
import { CarnetModal } from './components/CarnetModal';
import { ConfiguracionModal } from './components/ConfiguracionModal';
import { AccesoDocenteRequerido } from './components/AccesoDocenteRequerido';
import { AcudienteUsuario, Docente, GrupoAsignado } from './types';

export default function App() {
  const [db, setDb] = useState<AppDatabase>(() => cargarBaseDeDatos());
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado del Menú Lateral Colapsable
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('rue_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);

  // Estado de Sesión de Dirección / Administrador
  const [esAdminActivo, setEsAdminActivo] = useState<boolean>(() => {
    return obtenerSesionAdminActiva();
  });

  // Estado del Portal de Padres
  const [acudienteActivo, setAcudienteActivo] = useState<AcudienteUsuario | null>(null);
  const [loginPadresAbierto, setLoginPadresAbierto] = useState<boolean>(false);

  // Estado de Sesión Oficial de Docentes (@meduca.edu.pa)
  const [docenteActivo, setDocenteActivo] = useState<Docente | null>(() => {
    return obtenerSesionDocenteActiva();
  });
  const [grupoActivoDocente, setGrupoActivoDocente] = useState<GrupoAsignado>(() => {
    const sesion = obtenerSesionDocenteActiva();
    if (sesion) {
      return sesion.tipo === 'consejero'
        ? { grado: sesion.gradoTutor || '3°', grupo: sesion.grupoTutor || 'A' }
        : sesion.gruposAsignados?.[0] || { grado: '1°', grupo: 'A' };
    }
    return {
      grado: '3°',
      grupo: 'A',
    };
  });
  const [loginDocenteAbierto, setLoginDocenteAbierto] = useState<boolean>(false);
  const [correoLoginDocente, setCorreoLoginDocente] = useState<string | null>(null);

  // Modales
  const [accionesRapidasAbierto, setAccionesRapidasAbierto] = useState<boolean>(false);
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

  const handleLoginAdmin = () => {
    setEsAdminActivo(true);
    guardarSesionAdminActiva(true);
    setDocenteActivo(null);
    guardarSesionDocenteActiva(null);
    setAcudienteActivo(null);
    setCurrentView('dashboard');
    showToast('🏛️ Sesión de Dirección del Plantel iniciada');
  };

  const handleLogoutAdmin = () => {
    setEsAdminActivo(false);
    guardarSesionAdminActiva(false);
    showToast('👋 Sesión de Dirección cerrada');
  };

  const handleSwitchToGateway = () => {
    setEsAdminActivo(false);
    guardarSesionAdminActiva(false);
    setDocenteActivo(null);
    guardarSesionDocenteActiva(null);
    setAcudienteActivo(null);
    showToast('🚪 Regresando al portal de selección de estamento');
  };

  const handleLoginDocente = (docente: Docente) => {
    setDocenteActivo(docente);
    guardarSesionDocenteActiva(docente);
    setEsAdminActivo(false);
    guardarSesionAdminActiva(false);
    setAcudienteActivo(null);
    const grupoInicial: GrupoAsignado =
      docente.tipo === 'consejero'
        ? { grado: docente.gradoTutor || '3°', grupo: docente.grupoTutor || 'A' }
        : docente.gruposAsignados?.[0] || { grado: '1°', grupo: 'A' };
    setGrupoActivoDocente(grupoInicial);
    setLoginDocenteAbierto(false);
    setCorreoLoginDocente(null);
    showToast(`👋 ¡Bienvenido(a), ${docente.nombre}! Aula virtual activa`);
    setCurrentView('notas');
  };

  const handleLogoutDocente = () => {
    setDocenteActivo(null);
    guardarSesionDocenteActiva(null);
    showToast('👋 Sesión docente cerrada');
  };

  const handleAbrirLoginDocenteConCorreo = (correo: string) => {
    setCorreoLoginDocente(correo);
    setLoginDocenteAbierto(true);
  };

  const handleToggleCollapse = () => {
    const nuevo = !isSidebarCollapsed;
    setIsSidebarCollapsed(nuevo);
    try {
      localStorage.setItem('rue_sidebar_collapsed', String(nuevo));
    } catch {}
  };

  const handleToggleSidebarHeader = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpenMobile((prev) => !prev);
    } else {
      handleToggleCollapse();
    }
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Determinación de sesión activa para control estricto de roles
  const estaAutenticado = esAdminActivo || docenteActivo !== null || acudienteActivo !== null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100">
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
        onOpenLoginDocente={() => setLoginDocenteAbierto(true)}
        docenteActivo={docenteActivo}
        esAdminActivo={esAdminActivo}
        onLogoutAdmin={handleLogoutAdmin}
        onSwitchToGateway={estaAutenticado ? handleSwitchToGateway : undefined}
        onOpenAccionesRapidas={() => setAccionesRapidasAbierto(true)}
        onToggleSidebar={estaAutenticado && !acudienteActivo ? handleToggleSidebarHeader : undefined}
        esModoPadre={!!acudienteActivo}
      />

      {/* Estructura con Menú Lateral Colapsable y Contenido */}
      <div className="flex-1 flex w-full relative">
        {/* Menú Lateral Colapsable (solo activo cuando hay sesión institucional de Dirección o Docente) */}
        {estaAutenticado && !acudienteActivo && (
          <Sidebar
            currentView={currentView}
            onSelectView={(v) => {
              setCurrentView(v);
              setIsSidebarOpenMobile(false);
            }}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            isOpenMobile={isSidebarOpenMobile}
            onCloseMobile={() => setIsSidebarOpenMobile(false)}
            onOpenPortalPadres={() => setLoginPadresAbierto(true)}
            onOpenLoginDocente={() => setLoginDocenteAbierto(true)}
            onLogoutDocente={handleLogoutDocente}
            docenteActivo={docenteActivo}
            onOpenAccionesRapidas={() => setAccionesRapidasAbierto(true)}
            onOpenConfig={() => setConfiguracionAbierta(true)}
            db={db}
            esAdminAutenticado={esAdminActivo}
            onLogoutAdmin={handleLogoutAdmin}
            onSwitchToGateway={handleSwitchToGateway}
          />
        )}

        {/* Área de Contenido Principal con espaciado dinámico según estado colapsado */}
        <div
          className={`flex-1 min-w-0 transition-all duration-300 ease-in-out pb-12 ${
            estaAutenticado && !acudienteActivo
              ? isSidebarCollapsed
                ? 'lg:pl-[76px]'
                : 'lg:pl-[268px]'
              : ''
          }`}
        >
          <main className="max-w-7xl w-full mx-auto p-3 sm:p-6 no-print">
            {/* PORTAL TRIPARTITO INICIAL (Cuando no hay sesión activa) */}
            {!estaAutenticado ? (
              <PortalTripartitoGateway
                db={db}
                onLoginAdmin={handleLoginAdmin}
                onOpenLoginDocente={() => setLoginDocenteAbierto(true)}
                onOpenPortalPadres={() => setLoginPadresAbierto(true)}
              />
            ) : acudienteActivo ? (
              /* VISTA PORTAL DE PADRES (Si hay acudiente autenticado) */
              <PortalPadresView
                db={db}
                acudiente={acudienteActivo}
                onLogout={() => {
                  setAcudienteActivo(null);
                  showToast('👋 Sesión de acudiente cerrada');
                }}
                onSwitchToAdmin={handleSwitchToGateway}
                onOpenBoletin={(id) => setBoletinEstudianteId(id)}
                onOpenCarnet={(id) => setCarnetEstudianteId(id)}
                onUpdateDb={updateDb}
                onShowToast={showToast}
              />
            ) : (
              /* VISTAS INSTITUCIONALES (DIRECCIÓN O DOCENTE OFICIAL) */
              <>
                {/* Banner de Sesión Docente si hay educador autenticado */}
                {docenteActivo && (
                  <DocenteSessionBanner
                    docente={docenteActivo}
                    grupoActivo={grupoActivoDocente}
                    onSelectGrupoActivo={setGrupoActivoDocente}
                    onLogoutDocente={handleLogoutDocente}
                  />
                )}

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
                    docenteActivo={docenteActivo}
                  />
                )}

                {currentView === 'docentes' && (
                  <DocentesView
                    db={db}
                    onUpdateDb={updateDb}
                    onShowToast={showToast}
                    docenteActivo={docenteActivo}
                    onLoginDocente={handleLoginDocente}
                    onOpenLoginDocenteConCorreo={handleAbrirLoginDocenteConCorreo}
                  />
                )}

                {currentView === 'notas' && (
                  docenteActivo ? (
                    <NotasView
                      db={db}
                      onUpdateDb={updateDb}
                      onShowToast={showToast}
                      docenteActivo={docenteActivo}
                      grupoActivoDocente={grupoActivoDocente}
                      onSelectGrupoActivoDocente={setGrupoActivoDocente}
                      onOpenLoginDocente={() => setLoginDocenteAbierto(true)}
                      onNavigate={setCurrentView}
                    />
                  ) : (
                    <AccesoDocenteRequerido
                      modulo="notas"
                      onOpenLoginDocente={() => setLoginDocenteAbierto(true)}
                      onOpenLoginDocenteConCorreo={handleAbrirLoginDocenteConCorreo}
                      onNavigate={setCurrentView}
                      db={db}
                      onLoginDirecto={handleLoginDocente}
                    />
                  )
                )}

                {currentView === 'asistencia' && (
                  docenteActivo ? (
                    <AsistenciaView
                      db={db}
                      onUpdateDb={updateDb}
                      onShowToast={showToast}
                      docenteActivo={docenteActivo}
                      grupoActivoDocente={grupoActivoDocente}
                      onSelectGrupoActivoDocente={setGrupoActivoDocente}
                      onOpenLoginDocente={() => setLoginDocenteAbierto(true)}
                      onNavigate={setCurrentView}
                    />
                  ) : (
                    <AccesoDocenteRequerido
                      modulo="asistencia"
                      onOpenLoginDocente={() => setLoginDocenteAbierto(true)}
                      onOpenLoginDocenteConCorreo={handleAbrirLoginDocenteConCorreo}
                      onNavigate={setCurrentView}
                      db={db}
                      onLoginDirecto={handleLoginDocente}
                    />
                  )
                )}

                {currentView === 'boletines' && (
                  <BoletinesView
                    db={db}
                    onOpenBoletin={(id) => setBoletinEstudianteId(id)}
                    onShowToast={showToast}
                    docenteActivo={docenteActivo}
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

                {currentView === 'periodos' && (
                  <PeriodosTrimestralesView
                    db={db}
                    onUpdateDb={updateDb}
                    onShowToast={showToast}
                  />
                )}

                {currentView === 'auditoria' && (
                  <AuditoriaNotasView
                    db={db}
                    onShowToast={showToast}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* MODAL DE CENTRO DE ACCIONES RÁPIDAS */}
      {accionesRapidasAbierto && (
        <AccionesRapidasModal
          db={db}
          onUpdateDb={updateDb}
          onClose={() => setAccionesRapidasAbierto(false)}
          onOpenNuevoEstudiante={() => {
            setCurrentView('estudiantes');
            showToast('Abriendo directorio de estudiantes');
          }}
          onOpenNuevoComunicado={() => {
            setCurrentView('comunicados');
            showToast('Abriendo gestión de comunicados');
          }}
          onOpenPortalPadres={() => setLoginPadresAbierto(true)}
          onOpenLoginDocente={() => setLoginDocenteAbierto(true)}
          onOpenConfig={() => setConfiguracionAbierta(true)}
          onNavigateToView={(v) => setCurrentView(v)}
          onShowToast={showToast}
          docenteActivo={docenteActivo}
        />
      )}

      {/* Modal de Inicio de Sesión para Padres */}
      {loginPadresAbierto && (
        <LoginPadresModal
          db={db}
          onSuccessLogin={(acudiente) => {
            setEsAdminActivo(false);
            guardarSesionAdminActiva(false);
            setDocenteActivo(null);
            guardarSesionDocenteActiva(null);
            setAcudienteActivo(acudiente);
            setLoginPadresAbierto(false);
          }}
          onClose={() => setLoginPadresAbierto(false)}
          onShowToast={showToast}
        />
      )}

      {/* Modal de Inicio de Sesión para Docentes Oficiales */}
      {loginDocenteAbierto && (
        <LoginDocenteModal
          db={db}
          correoInicial={correoLoginDocente || ''}
          onSuccessLogin={handleLoginDocente}
          onClose={() => {
            setLoginDocenteAbierto(false);
            setCorreoLoginDocente(null);
          }}
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 border border-slate-700 max-w-sm text-center">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
