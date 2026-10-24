import React, { useState, useEffect } from 'react';
import {
  School,
  Settings,
  Wifi,
  WifiOff,
  Calendar,
  Layers,
  RotateCcw,
  Download,
  Menu,
  Zap,
  GraduationCap,
  LogOut,
} from 'lucide-react';
import { PWAInstallButton } from './pwa/PWAInstallButton';
import { AppDatabase } from '../utils/storage';
import { TRIMESTRES, Docente } from '../types';

interface HeaderProps {
  db: AppDatabase;
  onUpdateDb: (db: AppDatabase) => void;
  onOpenConfig: () => void;
  onResetDemo: () => void;
  onOpenPortalPadres?: () => void;
  onOpenLoginDocente?: () => void;
  docenteActivo?: Docente | null;
  onOpenAccionesRapidas?: () => void;
  onToggleSidebar?: () => void;
  esModoPadre?: boolean;
  esAdminActivo?: boolean;
  onLogoutAdmin?: () => void;
  onSwitchToGateway?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  db,
  onUpdateDb,
  onOpenConfig,
  onResetDemo,
  onOpenPortalPadres,
  onOpenLoginDocente,
  docenteActivo = null,
  onOpenAccionesRapidas,
  onToggleSidebar,
  esModoPadre = false,
  esAdminActivo = false,
  onLogoutAdmin,
  onSwitchToGateway,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTrimestreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoTrimestre = parseInt(e.target.value, 10);
    onUpdateDb({
      ...db,
      trimestreActual: nuevoTrimestre,
    });
  };

  const handleAnnoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateDb({
      ...db,
      annoLectivo: e.target.value,
    });
  };

  return (
    <header className="bg-[#003366] text-white shadow-md sticky top-0 z-40 no-print">
      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>
            Modo Sin Conexión — Los cambios se guardan localmente y estarán disponibles sin internet.
          </span>
        </div>
      )}

      <div className="w-full px-4 py-2.5 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Toggle Button + Logo and Titles */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center border border-white/10 shrink-0"
              title="Alternar Menú Lateral Colapsable"
            >
              <Menu className="w-5 h-5 text-amber-300" />
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#002244] to-[#004d99] border-2 border-[#FFC107] flex items-center justify-center shadow-inner shrink-0">
            <School className="w-5 h-5 text-[#FFC107]" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-wider uppercase text-amber-300 font-extrabold bg-[#002244]/80 px-2 py-0.5 rounded border border-amber-400/30">
                MEDUCA Panamá
              </span>
              <span className="text-[10px] text-blue-200 hidden sm:inline">
                RUE Primaria v2.4
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white truncate mt-0.5">
              {db.escuela.nombrePlantel}
            </h1>
            <p className="text-[11px] text-blue-200 hidden sm:block truncate">
              {db.escuela.regionEducativa} &bull; Código SIACE: {db.escuela.codigoSiace}
            </p>
          </div>
        </div>

        {/* Controls: Año, Trimestre, Online status, Settings */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 w-full md:w-auto justify-end text-xs">
          {/* Año Lectivo */}
          <div className="flex items-center gap-1.5 bg-[#002244] px-2.5 py-1.5 rounded-lg border border-blue-400/20">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-blue-300 hidden sm:inline">Año:</span>
            <input
              type="text"
              value={db.annoLectivo}
              onChange={handleAnnoChange}
              className="bg-transparent text-white font-bold w-12 text-center outline-none focus:ring-1 focus:ring-amber-400 rounded"
              title="Año Lectivo"
            />
          </div>

          {/* Trimestre Activo */}
          <div className="flex items-center gap-1.5 bg-[#002244] px-2.5 py-1.5 rounded-lg border border-blue-400/20">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-blue-300 hidden sm:inline">Trimestre:</span>
            <select
              value={db.trimestreActual}
              onChange={handleTrimestreChange}
              className="bg-transparent text-amber-300 font-bold outline-none cursor-pointer"
            >
              {TRIMESTRES.map((t) => (
                <option key={t} value={t} className="bg-[#003366] text-white">
                  {t}° Trimestre
                </option>
              ))}
            </select>
          </div>

          {/* Status Indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium ${
              isOnline
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>En línea</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span>Local</span>
              </>
            )}
          </div>

          {/* Acciones Rápidas Modal button */}
          {onOpenAccionesRapidas && !esModoPadre && (
            <button
              onClick={onOpenAccionesRapidas}
              className="flex items-center gap-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 px-2.5 py-1.5 rounded-lg transition font-bold"
              title="Abrir Centro de Acciones Rápidas (Modal)"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span className="hidden sm:inline">Acciones</span>
            </button>
          )}

          {/* Acceso Docente Oficial button */}
          {onOpenLoginDocente && !esModoPadre && (
            <button
              onClick={onOpenLoginDocente}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-xs text-xs ${
                docenteActivo
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
              title={
                docenteActivo
                  ? `Sesión activa: ${docenteActivo.nombre} (${docenteActivo.correo})`
                  : 'Ingreso oficial para Educadores con correo @meduca.edu.pa'
              }
            >
              <GraduationCap className={`w-3.5 h-3.5 ${docenteActivo ? 'text-slate-950' : 'text-amber-300'}`} />
              <span className="hidden sm:inline">
                {docenteActivo ? docenteActivo.nombre.split(' ')[0] : 'Docentes'}
              </span>
            </button>
          )}

          {/* Portal de Padres button */}
          {onOpenPortalPadres && !esModoPadre && (
            <button
              onClick={onOpenPortalPadres}
              className="flex items-center gap-1.5 bg-[#FFC107] hover:bg-amber-400 text-slate-950 px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-xs"
              title="Acceder al Portal Familiar para Padres de Familia"
            >
              <span>👨‍👩‍👧 Padres</span>
            </button>
          )}

          {/* Indicador de Dirección del Plantel */}
          {esAdminActivo && (
            <span className="hidden md:inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-lg text-xs shadow-xs">
              <School className="w-3.5 h-3.5 text-slate-950" />
              <span>Dirección</span>
            </span>
          )}

          {/* Botón de Cambiar de Estamento / Salir */}
          {onSwitchToGateway && (
            <button
              onClick={onSwitchToGateway}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 border border-white/20 text-xs font-bold transition"
              title="Cambiar de Estamento (Volver al Portal Tripartito)"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Portal</span>
            </button>
          )}

          {/* Botón de instalación PWA */}
          <PWAInstallButton />

          {/* Actions */}
          <button
            onClick={onOpenConfig}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg transition border border-white/10 font-medium"
            title="Configuración del Plantel y Respaldos"
          >
            <Settings className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Ajustes</span>
          </button>
        </div>
      </div>
    </header>
  );
};
