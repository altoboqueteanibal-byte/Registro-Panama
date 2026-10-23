import React from 'react';
import {
  ShieldAlert,
  Lock,
  GraduationCap,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  CheckCircle2,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { Docente } from '../types';
import { AppDatabase, obtenerDocenteOfflineRegistrado } from '../utils/storage';

interface AccesoDocenteRequeridoProps {
  modulo: 'asistencia' | 'notas';
  onOpenLoginDocente: () => void;
  onOpenLoginDocenteConCorreo?: (correo: string) => void;
  onNavigate: (view: any) => void;
  db: AppDatabase;
  onLoginDirecto?: (docente: Docente) => void;
}

export const AccesoDocenteRequerido: React.FC<AccesoDocenteRequeridoProps> = ({
  modulo,
  onOpenLoginDocente,
  onOpenLoginDocenteConCorreo,
  onNavigate,
  db,
  onLoginDirecto,
}) => {
  const docenteOffline = obtenerDocenteOfflineRegistrado();

  const tituloModulo =
    modulo === 'asistencia'
      ? 'Control de Asistencia Escolar y Monitoreo PASE-U'
      : 'Planilla Oficial de Calificaciones — Notas Diarias';

  const iconoModulo =
    modulo === 'asistencia' ? CalendarCheck : ClipboardList;
  const ModuloIcon = iconoModulo;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 animate-in fade-in duration-300">
      {/* Banner Superior Institucional MEDUCA */}
      <div className="bg-gradient-to-r from-[#002244] via-[#003366] to-[#004d99] text-white p-6 rounded-2xl shadow-lg border-2 border-amber-400/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Lock className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
              <ShieldAlert className="w-3.5 h-3.5" />
              Módulo Oficial Protegido — MEDUCA
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <ModuloIcon className="w-6 h-6 text-amber-300" />
              {tituloModulo}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              <strong>Asistencia y calificaciones solo abren cuando el docente encargado de la materia ingresa al sistema de acuerdo al grupo que le corresponda.</strong>
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button
              onClick={onOpenLoginDocente}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFC107] hover:bg-amber-400 text-slate-950 px-5 py-3 rounded-xl font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition transform active:scale-95"
            >
              <GraduationCap className="w-5 h-5 text-slate-950" />
              <span>Iniciar Sesión Docente</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      </div>

      {/* Explicación de Políticas Institucionales de Acceso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tarjeta 1: Maestros Consejeros */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#003366] flex items-center justify-center font-bold">
              🎓
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Maestros(as) Consejeros(as)
              </h3>
              <p className="text-[11px] text-slate-500">
                Pase de lista y asignaturas del aula asignada
              </p>
            </div>
          </div>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Asistencia diaria:</strong> Exclusiva para el grado y grupo asignado en su consejería oficial.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Calificaciones:</strong> Materias fundamentales (Español, Matemáticas, Ciencias Sociales, Ciencias Naturales, Arte, Religión) y vista unificada de Tecnología.
              </span>
            </li>
          </ul>
        </div>

        {/* Tarjeta 2: Docentes Especiales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              ⭐
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Docentes Especiales
              </h3>
              <p className="text-[11px] text-slate-500">
                Inglés, Educación Física y Tecnología (Hogar, Agropecuaria, Informática)
              </p>
            </div>
          </div>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Acceso por carga horaria:</strong> Únicamente a los grados y grupos autorizados en su registro oficial.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Evaluación individual:</strong> Asientan notas en su especialidad, las cuales el sistema unifica automáticamente al final de cada trimestre.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Selección Rápida del Docente Encargado del Plantel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-[#003366]" />
              Docentes Registrados del Plantel — Elija su Perfil para Ingresar
            </h3>
            <p className="text-xs text-slate-500">
              Seleccione su cuenta oficial @meduca.edu.pa para abrir la libreta de asistencia o calificaciones de su grupo asignado.
            </p>
          </div>
          {docenteOffline && (
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold border border-emerald-300">
              Dispositivo registrado: {docenteOffline.nombre.split(' ')[0]}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {db.docentes.map((doc) => {
            const esConsejero = doc.tipo === 'consejero';
            const gruposDesc = esConsejero
              ? `${doc.gradoTutor || '3°'} "${doc.grupoTutor || 'A'}" (Consejero)`
              : `${doc.gruposAsignados?.map((g) => `${g.grado} ${g.grupo}`).join(', ') || 'Grupos Asignados'}`;

            return (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition flex flex-col justify-between gap-3 group bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        esConsejero
                          ? 'bg-blue-100 text-[#003366] border border-blue-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {esConsejero ? 'Consejería' : 'Especial'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">PIN: {doc.pin}</span>
                  </div>

                  <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-[#003366]">
                    {doc.nombre}
                  </h4>
                  <p className="text-[11px] text-blue-700 font-medium truncate">
                    {doc.correo}
                  </p>

                  <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-700 font-semibold">
                      <span>Grupos:</span>
                      <span className="text-slate-900 font-bold">{gruposDesc}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate" title={doc.materias.join(', ')}>
                      Materias: {doc.materias.join(', ')}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onOpenLoginDocenteConCorreo) {
                      onOpenLoginDocenteConCorreo(doc.correo);
                    } else {
                      onOpenLoginDocente();
                    }
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 hover:border-[#003366] hover:bg-[#003366] hover:text-white text-[#003366] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Ingresar a este Grupo</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón de Retorno */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-200/60 transition"
        >
          ← Volver al Panel de Control Principal
        </button>
        <span className="text-[11px] text-slate-400">
          Sistema Institucional R.U.E. — MEDUCA Panamá
        </span>
      </div>
    </div>
  );
};
