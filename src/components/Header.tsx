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
} from 'lucide-react';
import { PWAInstallButton } from './pwa/PWAInstallButton';
import { AppDatabase } from '../utils/storage';
import { TRIMESTRES } from '../types';

interface HeaderProps {
  db: AppDatabase;
  onUpdateDb: (db: AppDatabase) => void;
  onOpenConfig: () => void;
  onResetDemo: () => void;
  onOpenPortalPadres?: () => void;
  esModoPadre?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  db,
  onUpdateDb,
  onOpenConfig,
  onResetDemo,
  onOpenPortalPadres,
  esModoPadre = false,
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

      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and Titles */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#002244] to-[#004d99] border-2 border-[#FFC107] flex items-center justify-center shadow-inner shrink-0">
            <School className="w-6 h-6 text-[#FFC107]" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-xs tracking-wider uppercase text-amber-300 font-bold bg-[#002244]/80 px-2 py-0.5 rounded border border-amber-400/30">
                MEDUCA Panamá
              </span>
              <span className="text-[10px] text-blue-200 hidden sm:inline">
                RUE Primaria v2.4
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              {db.escuela.nombrePlantel}
            </h1>
            <p className="text-xs text-blue-200 hidden sm:block">
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
