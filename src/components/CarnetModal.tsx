import React from 'react';
import { X, Printer, IdCard, School, QrCode } from 'lucide-react';
import { AppDatabase } from '../utils/storage';

interface CarnetModalProps {
  db: AppDatabase;
  estudianteId: string;
  onClose: () => void;
}

export const CarnetModal: React.FC<CarnetModalProps> = ({
  db,
  estudianteId,
  onClose,
}) => {
  const estudiante = db.estudiantes.find((e) => e.id === estudianteId);

  if (!estudiante) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col print:border-none print:shadow-none">
        {/* Top bar */}
        <div className="bg-[#003366] text-white p-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <IdCard className="w-5 h-5 text-[#FFC107]" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Carnet Estudiantil Digital
              </h3>
              <p className="text-[10px] text-blue-200">Formato A4 para impresión y recorte</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Imprimir carnet en hoja A4 con marcas de corte"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir A4</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARNET PRINTABLE CONTAINER (Optimizado para A4 con guías de corte) */}
        <div className="p-6 flex flex-col items-center justify-center print:p-8 print:m-0 print:border-none">
          {/* Instrucción de corte en hoja A4 (visible solo al imprimir) */}
          <div className="hidden print:block text-center mb-4">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              REPÚBLICA DE PANAMÁ &bull; MINISTERIO DE EDUCACIÓN &bull; CARNET ESTUDIANTIL
            </p>
            <p className="text-[9px] text-slate-500">
              Impresión oficial en hoja A4 &bull; Recortar por la línea punteada para plastificar
            </p>
          </div>

          <div className="w-full max-w-[340px] bg-gradient-to-br from-white to-slate-50 border-2 border-[#003366] rounded-2xl p-4 shadow-md relative overflow-hidden text-slate-800 print:shadow-none print:border-2 print:border-[#003366]">
            {/* Top header on card */}
            <div className="bg-[#003366] text-white -mx-4 -mt-4 px-4 py-2.5 flex items-center gap-2 mb-3">
              <School className="w-5 h-5 text-[#FFC107] shrink-0" />
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-amber-300 font-extrabold block">
                  REPÚBLICA DE PANAMÁ &bull; MEDUCA
                </span>
                <p className="text-xs font-black truncate">{db.escuela.nombrePlantel}</p>
              </div>
            </div>

            {/* Photo & Details */}
            <div className="flex gap-3 items-center">
              <div className="w-20 h-24 rounded-xl bg-slate-200 border-2 border-slate-300 flex flex-col items-center justify-center shrink-0 text-slate-400 overflow-hidden relative">
                <span className="text-2xl font-black text-[#003366]">
                  {estudiante.nombre.charAt(0)}
                </span>
                <span className="text-[9px] uppercase text-slate-500 font-bold mt-1">
                  PRIMARIA
                </span>
              </div>

              <div className="min-w-0 space-y-1 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">
                    Estudiante
                  </span>
                  <p className="font-extrabold text-slate-900 leading-tight">
                    {estudiante.nombre}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">
                    Cédula / ID
                  </span>
                  <p className="font-mono font-bold text-[#003366]">
                    {estudiante.cedula}
                  </p>
                </div>
                <div className="flex gap-3">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">
                      Grado
                    </span>
                    <p className="font-bold text-slate-800">{estudiante.grado} &ldquo;{estudiante.grupo}&rdquo;</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">
                      Año
                    </span>
                    <p className="font-bold text-slate-800">{db.annoLectivo}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacto de Emergencia & QR */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px]">
              <div className="space-y-0.5">
                <span className="text-slate-400 font-semibold block uppercase text-[8px]">
                  En caso de emergencia:
                </span>
                <p className="font-bold text-slate-800 truncate max-w-[190px]">
                  {estudiante.acudiente || 'Tutor registrado'}
                </p>
                <p className="font-semibold text-slate-600">
                  Tel: {estudiante.telefono || db.escuela.telefono}
                </p>
              </div>

              {/* QR Code mockup */}
              <div className="p-1 bg-white rounded-lg border border-slate-300 shadow-2xs text-center shrink-0">
                <QrCode className="w-10 h-10 text-[#003366]" />
                <span className="text-[7px] font-mono text-slate-500 block">RUE ID</span>
              </div>
            </div>

            {/* Ribbon footer */}
            <div className="mt-2 text-center text-[8px] font-bold text-[#003366] uppercase tracking-wider">
              VÁLIDO PARA PASE-U &bull; TRANSPORTE ESCOLAR
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
