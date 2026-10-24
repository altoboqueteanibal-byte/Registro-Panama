import React, { useState } from 'react';
import {
  School,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { AppDatabase, obtenerDocenteOfflineRegistrado } from '../utils/storage';
import { Docente } from '../types';

interface PortalTripartitoGatewayProps {
  db: AppDatabase;
  onLoginAdmin: () => void;
  onOpenLoginDocente: () => void;
  onOpenPortalPadres: () => void;
  docenteOffline?: Docente | null;
}

export const PortalTripartitoGateway: React.FC<PortalTripartitoGatewayProps> = ({
  db,
  onLoginAdmin,
  onOpenLoginDocente,
  onOpenPortalPadres,
  docenteOffline,
}) => {
  const [modalAdminAbierto, setModalAdminAbierto] = useState(false);
  const [pinAdminInput, setPinAdminInput] = useState('');
  const [errorPinAdmin, setErrorPinAdmin] = useState(false);

  const docenteRegistrado = docenteOffline || obtenerDocenteOfflineRegistrado();

  const handleValidarPinAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const pinEsperado = db.escuela.pinAdministrador || '1234';
    if (pinAdminInput.trim() === pinEsperado) {
      setErrorPinAdmin(false);
      setModalAdminAbierto(false);
      onLoginAdmin();
    } else {
      setErrorPinAdmin(true);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4 animate-in fade-in duration-300">
      <div className="max-w-5xl w-full space-y-8">
        {/* Cabecera Institucional MEDUCA */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#003366] text-[#FFC107] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border border-amber-400/30">
            <ShieldCheck className="w-4 h-4 text-[#FFC107]" />
            <span>República de Panamá — Ministerio de Educación</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Portal Institucional R.U.E.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium">
            {db.escuela.nombrePlantel} &bull; Región Educativa de {db.escuela.regionEducativa}
          </p>

          <div className="inline-block bg-blue-50 border border-blue-200 text-blue-900 text-xs px-3.5 py-1 rounded-xl font-bold">
            🔒 Segregación Estricta de Funciones Pedagógicas y Administrativas
          </div>
        </div>

        {/* Las 3 Puertas de Acceso (Tripartito) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PUERTA 1: DIRECCIÓN Y SECRETARÍA */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-[#003366] shadow-md hover:shadow-xl transition flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />

            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#003366] text-[#FFC107] flex items-center justify-center shadow-inner">
                <School className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-md">
                  Estamento Directivo
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1.5 group-hover:text-[#003366] transition">
                  Dirección & Secretaría
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Supervisión general del plantel, matrícula oficial, asignación horaria docente, cierre trimestral de períodos y bitácora de auditoría.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Cierre oficial y sellado de actas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Bitácora inmutable de notas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Matrícula y expedientes SIACE</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6">
              <button
                onClick={() => setModalAdminAbierto(true)}
                className="w-full py-3 px-4 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <KeyRound className="w-4 h-4 text-[#FFC107]" />
                <span>Ingreso Dirección</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PUERTA 2: AULA VIRTUAL DOCENTE */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 hover:border-amber-500 shadow-md hover:shadow-xl transition flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />

            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-inner">
                <GraduationCap className="w-7 h-7" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md">
                    Cuerpo Educador
                  </span>
                  {docenteRegistrado && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Dispositivo listo
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-1.5 group-hover:text-amber-800 transition">
                  Aula Virtual Docente
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Registro diario de notas y pase de lista restringido estrictamente a las asignaturas y grupos asignados a su carga horaria oficial.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Maestros Consejeros (Aula fija)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Docentes Especiales (Inglés, Tecnología)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Trabajo seguro 100% Offline</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6">
              <button
                onClick={onOpenLoginDocente}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <Lock className="w-4 h-4 text-slate-950" />
                <span>Ingreso @meduca.edu.pa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PUERTA 3: PORTAL FAMILIAR ACUDIENTES */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-emerald-500 shadow-md hover:shadow-xl transition flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />

            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-inner">
                <HeartHandshake className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                  Comunidad Familiar
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1.5 group-hover:text-emerald-700 transition">
                  Portal de Padres & Acudientes
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Supervisión de calificaciones, alerta de ausencias para el PASE-U (90%), emisión de justificantes médicos y descarga de boletines.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Acceso exclusivo a sus propios hijos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Monitoreo de beca IFARHU</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Envío digital de justificantes</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6">
              <button
                onClick={onOpenPortalPadres}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>Ingreso con Cédula</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Pie de Página Informativo */}
        <div className="bg-slate-100/80 rounded-2xl p-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Año Lectivo: {db.annoLectivo}</span>
            <span>&bull;</span>
            <span>Trimestre en Curso: T{db.trimestreActual}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Diseñado para cumplir con normativas de evaluación y privacidad del MEDUCA Panamá.
          </div>
        </div>
      </div>

      {/* Modal de Validación de Clave de Dirección */}
      {modalAdminAbierto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#002244] to-[#003366] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#FFC107]">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm">Dirección del Plantel</h3>
                  <p className="text-[11px] text-blue-200">Autenticación de Administrador</p>
                </div>
              </div>
              <button
                onClick={() => setModalAdminAbierto(false)}
                className="text-white/60 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleValidarPinAdmin} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Ingrese la clave o PIN de Dirección para acceder al panel de control directivo, gestión de períodos y matrícula:
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIN de Acceso Directivo
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="PIN predeterminado: 1234"
                  value={pinAdminInput}
                  onChange={(e) => {
                    setPinAdminInput(e.target.value);
                    setErrorPinAdmin(false);
                  }}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center tracking-widest text-lg font-bold text-slate-900 focus:bg-white focus:border-[#003366] outline-none"
                />
                {errorPinAdmin && (
                  <p className="text-xs font-bold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    PIN incorrecto. (PIN inicial demo: 1234)
                  </p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 space-y-1">
                <span className="font-bold">🔐 Seguridad Institucional:</span>
                <p>
                  El rol de dirección no debe asentar notas directas a los alumnos; supervisa la validez de actas y cierra oficialmente los períodos.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAdminAbierto(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs transition shadow-md"
                >
                  Verificar y Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
