import React, { useState } from 'react';
import {
  X,
  Settings,
  Building,
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle,
  Smartphone,
} from 'lucide-react';
import { PWAInstallButton } from './pwa/PWAInstallButton';
import { AppDatabase, reiniciarBaseDeDatos } from '../utils/storage';
import { EscuelaConfig } from '../types';

interface ConfiguracionModalProps {
  db: AppDatabase;
  onUpdateDb: (db: AppDatabase) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ConfiguracionModal: React.FC<ConfiguracionModalProps> = ({
  db,
  onUpdateDb,
  onClose,
  onShowToast,
}) => {
  const [escuela, setEscuela] = useState<EscuelaConfig>({ ...db.escuela });
  const [annoLectivo, setAnnoLectivo] = useState(db.annoLectivo);

  const guardarCambios = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDb({
      ...db,
      escuela,
      annoLectivo,
    });
    onShowToast('✅ Configuración del plantel actualizada');
    onClose();
  };

  const handleDescargarRespaldo = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Respaldo_RUE_${db.escuela.nombrePlantel.replace(/\s+/g, '_')}_${db.annoLectivo}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('💾 Respaldo JSON descargado con éxito');
  };

  const handleImportarRespaldo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.estudiantes && parsed.calificaciones) {
          onUpdateDb(parsed);
          onShowToast('✅ Respaldo restaurado correctamente');
          onClose();
        } else {
          onShowToast('⚠️ El archivo JSON no tiene la estructura válida de RUE Primaria');
        }
      } catch (err) {
        onShowToast('❌ Error al procesar el archivo JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleRestablecerDemo = () => {
    if (
      window.confirm(
        '¿Desea restablecer todos los datos a la demostración inicial de C.E.B.G. Alto Boquete? Se perderán las modificaciones no respaldadas.'
      )
    ) {
      const reset = reiniciarBaseDeDatos();
      onUpdateDb(reset);
      onShowToast('🔄 Datos de demostración restablecidos');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#003366] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#FFC107]" />
            <h3 className="font-bold text-sm">Configuración del Centro Educativo</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={guardarCambios} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre Oficial del Centro Educativo *
            </label>
            <input
              type="text"
              required
              value={escuela.nombrePlantel}
              onChange={(e) => setEscuela({ ...escuela, nombrePlantel: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white font-bold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Código SIACE MEDUCA
              </label>
              <input
                type="text"
                value={escuela.codigoSiace}
                onChange={(e) => setEscuela({ ...escuela, codigoSiace: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Año Lectivo Actual
              </label>
              <input
                type="text"
                value={annoLectivo}
                onChange={(e) => setAnnoLectivo(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Director(a) del Plantel
              </label>
              <input
                type="text"
                value={escuela.director}
                onChange={(e) => setEscuela({ ...escuela, director: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Región Educativa
              </label>
              <input
                type="text"
                value={escuela.regionEducativa}
                onChange={(e) => setEscuela({ ...escuela, regionEducativa: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Distrito / Corregimiento
              </label>
              <input
                type="text"
                value={escuela.distrito}
                onChange={(e) => setEscuela({ ...escuela, distrito: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Teléfono Institucional
              </label>
              <input
                type="text"
                value={escuela.telefono}
                onChange={(e) => setEscuela({ ...escuela, telefono: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-[#003366] hover:bg-[#002244] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4 text-[#FFC107]" />
              <span>Guardar Cambios del Plantel</span>
            </button>
          </div>
        </form>

        {/* Sección de Instalación PWA */}
        <div className="bg-blue-50/70 p-4 border-t border-blue-200 text-xs">
          <div className="flex items-center gap-2 text-[#003366] font-bold mb-1">
            <Smartphone className="w-4 h-4 text-[#003366]" />
            <span>Aplicación Web Progresiva (PWA) e Instalación</span>
          </div>
          <p className="text-slate-600 mb-2 leading-relaxed text-[11px]">
            Esta aplicación cumple con los estándares PWA de Google y Apple: se puede instalar en la pantalla de inicio de su teléfono celular, tablet o computadora, y funciona sin conexión a internet.
          </p>
          <PWAInstallButton variant="card" />
        </div>

        {/* Sección de Gestión de Datos y Copias de Seguridad */}
        <div className="bg-slate-50 p-5 border-t border-slate-200 space-y-3 text-xs">
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Copia de Seguridad y Restauración
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleDescargarRespaldo}
              className="bg-white hover:bg-slate-100 text-slate-700 p-2.5 rounded-xl border border-slate-200 font-semibold flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-[#003366]" />
              <span>Descargar Copia JSON</span>
            </button>

            <label className="bg-white hover:bg-slate-100 text-slate-700 p-2.5 rounded-xl border border-slate-200 font-semibold flex items-center justify-center gap-2 transition cursor-pointer text-center">
              <Upload className="w-4 h-4 text-[#003366]" />
              <span>Restaurar desde JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportarRespaldo}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <span className="text-[11px] text-slate-500">
              ¿Desea volver al estado inicial del sistema?
            </span>
            <button
              type="button"
              onClick={handleRestablecerDemo}
              className="text-rose-600 hover:text-rose-800 font-bold hover:underline flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Datos Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
