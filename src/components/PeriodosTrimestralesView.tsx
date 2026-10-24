import React, { useState } from 'react';
import {
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck,
  Save,
  Info,
} from 'lucide-react';
import { AppDatabase } from '../utils/storage';
import { PeriodoTrimestral } from '../types';

interface PeriodosTrimestralesViewProps {
  db: AppDatabase;
  onUpdateDb: (db: AppDatabase) => void;
  onShowToast: (msg: string) => void;
}

export const PeriodosTrimestralesView: React.FC<PeriodosTrimestralesViewProps> = ({
  db,
  onUpdateDb,
  onShowToast,
}) => {
  const [periodosLocales, setPeriodosLocales] = useState<PeriodoTrimestral[]>(
    db.periodos || []
  );
  const [trimestreConfirmandoCierre, setTrimestreConfirmandoCierre] = useState<number | null>(null);

  const handleCambiarFecha = (
    trimestre: number,
    campo: 'fechaInicio' | 'fechaFin' | 'fechaLimiteNotas',
    valor: string
  ) => {
    const actualizados = periodosLocales.map((p) =>
      p.trimestre === trimestre ? { ...p, [campo]: valor } : p
    );
    setPeriodosLocales(actualizados);
    onUpdateDb({ ...db, periodos: actualizados });
    onShowToast('📅 Fecha del período actualizada');
  };

  const handleToggleEstadoPeriodo = (trimestre: number) => {
    const periodo = periodosLocales.find((p) => p.trimestre === trimestre);
    if (!periodo) return;

    const nuevoEstado = periodo.estado === 'abierto' ? 'cerrado' : 'abierto';
    const ahora = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const actualizados: PeriodoTrimestral[] = periodosLocales.map((p) => {
      if (p.trimestre === trimestre) {
        return {
          ...p,
          estado: nuevoEstado,
          cerradoPor: nuevoEstado === 'cerrado' ? 'Dirección del Plantel' : undefined,
          fechaCierre: nuevoEstado === 'cerrado' ? ahora : undefined,
        };
      }
      return p;
    });

    setPeriodosLocales(actualizados);
    onUpdateDb({ ...db, periodos: actualizados });

    if (nuevoEstado === 'cerrado') {
      onShowToast(`🔒 ${periodo.nombre} cerrado y sellado oficialmente. Notas bloqueadas a docentes.`);
    } else {
      onShowToast(`🔓 ${periodo.nombre} reabierto para evaluación docente.`);
    }
    setTrimestreConfirmandoCierre(null);
  };

  const handleEstablecerTrimestreActual = (trimestre: number) => {
    onUpdateDb({ ...db, trimestreActual: trimestre });
    onShowToast(`⭐ Trimestre actual del plantel establecido en T${trimestre}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Encabezado */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#003366] text-[#FFC107] px-2.5 py-0.5 rounded-md">
              Control Directivo MEDUCA
            </span>
            <span className="text-xs font-bold text-slate-500">
              Año Lectivo: {db.annoLectivo}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#003366]" />
            Control de Períodos y Cierre Trimestral Oficial
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestione el calendario escolar, fije fechas límites y selle las actas para impedir modificaciones de notas fuera de fecha.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-300 px-4 py-2 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-2">
          <span>Trimestre Activo en Curso:</span>
          <span className="bg-[#003366] text-white px-2.5 py-0.5 rounded-md font-black">
            Trimestre {db.trimestreActual}
          </span>
        </div>
      </div>

      {/* Tarjetas de los 3 Trimestres */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {periodosLocales.map((periodo) => {
          const esActivo = db.trimestreActual === periodo.trimestre;
          const estaCerrado = periodo.estado === 'cerrado';

          // Conteo de notas registradas en este trimestre
          const totalNotasTrim = db.calificaciones
            .filter((c) => c.trimestre === periodo.trimestre)
            .reduce((acc, c) => acc + (c.notasDiarias?.length || 0), 0);

          return (
            <div
              key={periodo.trimestre}
              className={`bg-white rounded-3xl p-6 border-2 transition shadow-sm flex flex-col justify-between ${
                estaCerrado
                  ? 'border-slate-300 bg-slate-50/60'
                  : esActivo
                  ? 'border-amber-400 ring-2 ring-amber-300/40'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-4">
                {/* Cabecera del Trimestre */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      Período Académico
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      {periodo.nombre}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full border ${
                      estaCerrado
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {estaCerrado ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-rose-700" />
                        Cerrado & Sellado
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                        Abierto (En Evaluación)
                      </>
                    )}
                  </span>
                </div>

                {/* Resumen de Estado */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Notas asentadas en el sistema:</span>
                    <strong className="text-slate-900 font-black">{totalNotasTrim} notas</strong>
                  </div>
                  {estaCerrado && periodo.fechaCierre && (
                    <div className="flex items-center justify-between text-[11px] text-rose-700 font-semibold bg-rose-50 p-2 rounded-lg">
                      <span>Sellado el:</span>
                      <span>{periodo.fechaCierre}</span>
                    </div>
                  )}
                  {esActivo && (
                    <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Trimestre Oficial en Curso</span>
                    </div>
                  )}
                </div>

                {/* Formulario de Fechas */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">
                      Fecha Inicio de Clases
                    </label>
                    <input
                      type="date"
                      value={periodo.fechaInicio}
                      onChange={(e) =>
                        handleCambiarFecha(periodo.trimestre, 'fechaInicio', e.target.value)
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">
                      Fecha Fin de Clases
                    </label>
                    <input
                      type="date"
                      value={periodo.fechaFin}
                      onChange={(e) =>
                        handleCambiarFecha(periodo.trimestre, 'fechaFin', e.target.value)
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-extrabold mb-1 flex items-center justify-between">
                      <span>Fecha Límite Carga de Notas</span>
                      <span className="text-[10px] text-amber-600 font-bold">MEDUCA</span>
                    </label>
                    <input
                      type="date"
                      value={periodo.fechaLimiteNotas}
                      onChange={(e) =>
                        handleCambiarFecha(
                          periodo.trimestre,
                          'fechaLimiteNotas',
                          e.target.value
                        )
                      }
                      className="w-full p-2 bg-amber-50/60 border border-amber-300 rounded-xl font-bold text-amber-950 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Acciones Directivas */}
              <div className="pt-5 border-t border-slate-100 space-y-2 mt-4">
                {!esActivo && (
                  <button
                    onClick={() => handleEstablecerTrimestreActual(periodo.trimestre)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    Establecer como Trimestre Actual
                  </button>
                )}

                {estaCerrado ? (
                  <button
                    onClick={() => handleToggleEstadoPeriodo(periodo.trimestre)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    <span>Reabrir Período (Extraordinario)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setTrimestreConfirmandoCierre(periodo.trimestre)}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Lock className="w-4 h-4 text-white" />
                    <span>Cerrar y Sellar Trimestre</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner de Normativa MEDUCA */}
      <div className="bg-blue-50 border border-blue-200 p-4.5 rounded-2xl flex items-start gap-3.5 text-xs text-blue-900">
        <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold">Efectos del Cierre Trimestral en el Sistema</h4>
          <p className="text-blue-800 leading-relaxed">
            Al <strong>Cerrar y Sellar</strong> un trimestre, la planilla de calificaciones pasa inmediatamente a modo <strong>Solo Lectura Oficial</strong> para todos los maestros consejeros y docentes especiales. Ningún educador podrá agregar, corregir o borrar notas de ese trimestre a menos que la Dirección reabra formalmente el período.
          </p>
        </div>
      </div>

      {/* Modal de Confirmación de Cierre */}
      {trimestreConfirmandoCierre !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-black">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-slate-900 text-base">
                ¿Confirmar Cierre Oficial del Trimestre {trimestreConfirmandoCierre}?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Esta acción bloqueará la edición de calificaciones a todo el cuerpo docente. Las notas quedarán selladas como actas oficiales del plantel.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setTrimestreConfirmandoCierre(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleToggleEstadoPeriodo(trimestreConfirmandoCierre)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white transition shadow-md"
              >
                Sí, Cerrar y Sellar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
