import React from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { AppDatabase } from '../utils/storage';
import { BoletinHojaA4 } from './BoletinHojaA4';

interface BoletinModalProps {
  db: AppDatabase;
  estudianteId: string;
  onClose: () => void;
  onSelectEstudiante: (estId: string) => void;
}

export const BoletinModal: React.FC<BoletinModalProps> = ({
  db,
  estudianteId,
  onClose,
  onSelectEstudiante,
}) => {
  const estudiante = db.estudiantes.find((e) => e.id === estudianteId);

  if (!estudiante) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col my-4 print:my-0 print:border-none print:shadow-none print:max-w-none">
        {/* Barra superior de herramientas (no imprimible) */}
        <div className="bg-[#003366] text-white p-3 sm:px-6 sm:py-3.5 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#FFC107]" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">Boletín Oficial de Calificaciones</h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Formato A4
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Formato Institucional MEDUCA Panamá &bull; Nivel Primaria (210 x 297 mm)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector de estudiante */}
            <select
              value={estudiante.id}
              onChange={(e) => onSelectEstudiante(e.target.value)}
              className="bg-[#002244] text-white text-xs py-1.5 px-3 rounded-lg border border-blue-400/30 outline-none max-w-[200px] truncate"
            >
              {db.estudiantes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} ({e.grado} &ldquo;{e.grupo}&rdquo;)
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Imprimir boletín en hoja A4 (ajustado a 1 sola página)"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir A4</span>
            </button>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL BOLETÍN (Imprimible en Hoja A4 Única) */}
        <BoletinHojaA4 db={db} estudiante={estudiante} esHojaUnica={true} />
      </div>
    </div>
  );
};
