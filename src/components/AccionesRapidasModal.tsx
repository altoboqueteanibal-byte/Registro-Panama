import React, { useState } from 'react';
import {
  X,
  Zap,
  UserPlus,
  ClipboardCheck,
  CalendarCheck,
  Bell,
  HeartHandshake,
  Download,
  Printer,
  Sparkles,
  Settings,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { AppDatabase } from '../utils/storage';
import { TODAS_MATERIAS, TIPOS_NOTA, NotaDiaria, CalificacionMateria } from '../types';

interface AccionesRapidasModalProps {
  db: AppDatabase;
  onUpdateDb: (db: AppDatabase) => void;
  onClose: () => void;
  onOpenNuevoEstudiante: () => void;
  onOpenNuevoComunicado: () => void;
  onOpenPortalPadres: () => void;
  onOpenLoginDocente?: () => void;
  onOpenConfig: () => void;
  onNavigateToView: (view: any) => void;
  onShowToast: (msg: string) => void;
}

export const AccionesRapidasModal: React.FC<AccionesRapidasModalProps> = ({
  db,
  onUpdateDb,
  onClose,
  onOpenNuevoEstudiante,
  onOpenNuevoComunicado,
  onOpenPortalPadres,
  onOpenLoginDocente,
  onOpenConfig,
  onNavigateToView,
  onShowToast,
}) => {
  // Mini form para registrar nota diaria exprés directamente desde el modal
  const [mostrarFormNota, setMostrarFormNota] = useState(false);
  const [estudianteId, setEstudianteId] = useState(db.estudiantes[0]?.id || '');
  const [materia, setMateria] = useState<string>('Matemáticas');
  const [valor, setValor] = useState('4.8');
  const [tipo, setTipo] = useState<string>(TIPOS_NOTA[0]);
  const [observacion, setObservacion] = useState('');

  const handleGuardarNotaExpress = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum < 1.0 || valorNum > 5.0) {
      onShowToast('⚠️ Calificación debe estar entre 1.0 y 5.0');
      return;
    }

    const nuevaNota: NotaDiaria = {
      id: 'nd_' + Date.now(),
      fecha: new Date().toISOString().split('T')[0],
      valor: Number(valorNum.toFixed(1)),
      desc: tipo,
      observacion: observacion.trim() || undefined,
    };

    let calExistente = db.calificaciones.find(
      (c) =>
        c.estudianteId === estudianteId &&
        c.materia === materia &&
        c.trimestre === db.trimestreActual &&
        c.annoLectivo === db.annoLectivo
    );

    let nuevasCalificaciones: CalificacionMateria[];
    if (calExistente) {
      nuevasCalificaciones = db.calificaciones.map((c) =>
        c.id === calExistente!.id
          ? { ...c, notasDiarias: [...c.notasDiarias, nuevaNota] }
          : c
      );
    } else {
      const nuevaCal: CalificacionMateria = {
        id: 'cal_' + Date.now(),
        estudianteId,
        materia,
        trimestre: db.trimestreActual,
        annoLectivo: db.annoLectivo,
        notasDiarias: [nuevaNota],
      };
      nuevasCalificaciones = [...db.calificaciones, nuevaCal];
    }

    onUpdateDb({ ...db, calificaciones: nuevasCalificaciones });
    const est = db.estudiantes.find((e) => e.id === estudianteId);
    onShowToast(`✅ Nota de ${nuevaNota.valor.toFixed(1)} registrada a ${est?.nombre || 'estudiante'}`);
    setMostrarFormNota(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#002244] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFC107] text-slate-950 flex items-center justify-center font-black shadow-inner">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-white/10 px-2 py-0.5 rounded">
                  Panel de Accesos Directos
                </span>
              </div>
              <h3 className="text-base font-black">Centro de Acciones Rápidas</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5 text-xs">
          {!mostrarFormNota ? (
            <>
              <p className="text-slate-500 font-medium">
                Ejecute tareas operativas inmediatas sin necesidad de navegar manualmente entre pestañas:
              </p>

              {/* Grid de botones de acción rápida */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Registrar Nota Exprés */}
                <button
                  onClick={() => setMostrarFormNota(true)}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/70 transition flex items-start gap-3 text-left group"
                >
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0 group-hover:scale-105 transition-transform">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs group-hover:text-[#003366]">
                      Calificar Nota Diaria Exprés
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ingreso directo de tarea o prueba en 1 paso.
                    </p>
                  </div>
                </button>

                {/* 2. Matricular Estudiante */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenNuevoEstudiante();
                  }}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/70 transition flex items-start gap-3 text-left group"
                >
                  <div className="p-2 rounded-xl bg-blue-100 text-[#003366] shrink-0 group-hover:scale-105 transition-transform">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs group-hover:text-[#003366]">
                      Matricular Nuevo Alumno
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ficha de ingreso, acudiente y cédula.
                    </p>
                  </div>
                </button>

                {/* 3. Pasar Lista Hoy */}
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToView('asistencia');
                  }}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/70 transition flex items-start gap-3 text-left group"
                >
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs group-hover:text-emerald-800">
                      Pase de Lista del Día
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Marcación rápida P/A/T/J y PASE-U.
                    </p>
                  </div>
                </button>

                {/* 4. Publicar Comunicado */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenNuevoComunicado();
                  }}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/70 transition flex items-start gap-3 text-left group"
                >
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 group-hover:scale-105 transition-transform">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs group-hover:text-amber-900">
                      Emitir Circular a Padres
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Aviso por grado o general con acuse.
                    </p>
                  </div>
                </button>

                {/* 5. Ingreso a Aula Docente Oficial */}
                {onOpenLoginDocente && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLoginDocente();
                    }}
                    className="p-3.5 rounded-2xl border border-blue-300 bg-blue-50/70 hover:bg-blue-100 transition flex items-start gap-3 text-left group"
                  >
                    <div className="p-2 rounded-xl bg-[#003366] text-[#FFC107] shrink-0 group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs group-hover:text-[#003366]">
                        Ingreso Docente Oficial
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Acceso con correo @meduca.edu.pa a sus grupos asignados.
                      </p>
                    </div>
                  </button>
                )}

                {/* 6. Ingreso a Portal de Padres */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenPortalPadres();
                  }}
                  className={`p-3.5 rounded-2xl border border-amber-300 bg-amber-50/50 hover:bg-amber-100/70 transition flex items-start gap-3 text-left group ${
                    onOpenLoginDocente ? '' : 'sm:col-span-2'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-amber-200 text-slate-950 shrink-0 group-hover:scale-105 transition-transform">
                    <HeartHandshake className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs group-hover:text-amber-950">
                      Portal Familiar para Padres
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Acceso restringido a calificaciones y asistencia de sus hijos.
                    </p>
                  </div>
                </button>
              </div>

              {/* Botón adicional de Configuración */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Centro Educativo: <strong>{db.escuela.nombrePlantel}</strong>
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenConfig();
                  }}
                  className="text-[#003366] hover:underline font-bold flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Ajustes y Respaldos</span>
                </button>
              </div>
            </>
          ) : (
            /* Subformulario para Registrar Nota Diaria Exprés */
            <form onSubmit={handleGuardarNotaExpress} className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-[#003366]" />
                  <span>Registrar Nota Diaria Exprés (Trimestre {db.trimestreActual})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setMostrarFormNota(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  &larr; Volver
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estudiante a Evaluar *
                </label>
                <select
                  value={estudianteId}
                  onChange={(e) => setEstudianteId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:bg-white"
                >
                  {db.estudiantes.map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.nombre} — {est.grado} &ldquo;{est.grupo}&rdquo; ({est.cedula})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Materia
                  </label>
                  <select
                    value={materia}
                    onChange={(e) => setMateria(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-[#003366] focus:bg-white"
                  >
                    {TODAS_MATERIAS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nota (1.0 a 5.0) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    required
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-center text-sm focus:bg-white focus:border-[#003366]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Criterio / Actividad
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                >
                  {TIPOS_NOTA.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observación Pedagógica (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Destacó en participación oral y dictado"
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMostrarFormNota(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-xl font-bold transition shadow-xs"
                >
                  Guardar Nota Exprés
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
