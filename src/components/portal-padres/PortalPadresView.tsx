import React, { useState } from 'react';
import {
  Users,
  Award,
  BookOpen,
  CalendarCheck,
  Bell,
  LogOut,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Phone,
  FileText,
  IdCard,
  Send,
  Printer,
  ChevronDown,
  Clock,
  Sparkles,
  School,
  X,
  FileCheck,
  Calendar,
} from 'lucide-react';
import {
  AcudienteUsuario,
  Estudiante,
  TODAS_MATERIAS,
  MATERIAS_CONSEJERO,
  MATERIAS_ESPECIALES,
  JustificacionAusencia,
} from '../../types';
import { AppDatabase } from '../../utils/storage';
import {
  calcularPromedioTrimestre,
  calcularPromedioGeneralTrimestre,
  calcularPromedioMateriaAnual,
  calcularPromedioGeneralAnual,
  calcularAsistenciaEstudiante,
} from '../../utils/calculations';

interface PortalPadresViewProps {
  db: AppDatabase;
  acudiente: AcudienteUsuario;
  onLogout: () => void;
  onSwitchToAdmin: () => void;
  onOpenBoletin: (estId: string) => void;
  onOpenCarnet: (estId: string) => void;
  onUpdateDb: (db: AppDatabase) => void;
  onShowToast: (msg: string) => void;
}

export const PortalPadresView: React.FC<PortalPadresViewProps> = ({
  db,
  acudiente,
  onLogout,
  onSwitchToAdmin,
  onOpenBoletin,
  onOpenCarnet,
  onUpdateDb,
  onShowToast,
}) => {
  // Obtener estrictamente los estudiantes asociados a este acudiente
  const misHijos = db.estudiantes.filter((e) =>
    acudiente.estudiantesIds.includes(e.id)
  );

  // Si tiene al menos un hijo, seleccionar el primero por defecto
  const [hijoSeleccionadoId, setHijoSeleccionadoId] = useState<string>(
    misHijos[0]?.id || ''
  );

  // Pestañas del portal para padres
  const [pestanaActiva, setPestanaActiva] = useState<
    'notas' | 'asistencia' | 'comunicados' | 'docente'
  >('notas');

  // Materia expandida en la vista de notas
  const [materiaExpandida, setMateriaExpandida] = useState<string | null>(null);

  // Modal para justificar inasistencia
  const [modalJustificarAbierto, setModalJustificarAbierto] = useState(false);
  const [justFecha, setJustFecha] = useState(new Date().toISOString().split('T')[0]);
  const [justMotivo, setJustMotivo] = useState('');

  const hijoSeleccionado = misHijos.find((h) => h.id === hijoSeleccionadoId);

  if (!hijoSeleccionado) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-auto my-8 border border-slate-200">
        <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">
          No hay estudiantes vinculados
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Su cuenta no tiene estudiantes asociados actualmente. Por favor, contacte a la dirección del plantel.
        </p>
        <button
          onClick={onLogout}
          className="mt-4 bg-[#003366] text-white px-4 py-2 rounded-xl text-xs font-bold"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  // Docente consejero del hijo seleccionado
  const consejero = db.docentes.find(
    (d) =>
      d.tipo === 'consejero' &&
      d.gradoTutor === hijoSeleccionado.grado &&
      d.grupoTutor === hijoSeleccionado.grupo
  );

  // Métricas del hijo seleccionado
  const promTrimestreActual = calcularPromedioGeneralTrimestre(
    hijoSeleccionado.id,
    db.trimestreActual,
    db.calificaciones,
    db.annoLectivo
  );

  const promAnual = calcularPromedioGeneralAnual(
    hijoSeleccionado.id,
    db.calificaciones,
    db.annoLectivo
  );

  const asistenciaStats = calcularAsistenciaEstudiante(
    hijoSeleccionado.id,
    db.asistencia,
    db.annoLectivo
  );

  // Registros de inasistencias / tardanzas del hijo seleccionado
  const inasistenciasHijo = db.asistencia
    .filter(
      (a) =>
        a.estudianteId === hijoSeleccionado.id &&
        a.annoLectivo === db.annoLectivo &&
        (a.estado === 'A' || a.estado === 'T' || a.estado === 'J')
    )
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  // Comunicados que aplican a este hijo (destinados a 'todos' o a su grado específico)
  const comunicadosFiltrados = db.comunicados.filter(
    (c) => c.destinatarios === 'todos' || c.destinatarios === hijoSeleccionado.grado
  );

  // Confirmar lectura de comunicado
  const handleConfirmarLectura = (comunicadoId: string) => {
    const nuevosComunicados = db.comunicados.map((c) => {
      if (c.id === comunicadoId) {
        if (!c.leidoPor.includes(acudiente.id)) {
          return { ...c, leidoPor: [...c.leidoPor, acudiente.id] };
        }
      }
      return c;
    });

    onUpdateDb({ ...db, comunicados: nuevosComunicados });
    onShowToast('✓ Confirmación de lectura enviada a la escuela');
  };

  // Enviar justificación de ausencia
  const handleEnviarJustificacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justMotivo.trim()) {
      onShowToast('⚠️ Ingrese el motivo de la ausencia');
      return;
    }

    const nuevaJust: JustificacionAusencia = {
      id: 'just_' + Date.now(),
      estudianteId: hijoSeleccionado.id,
      acudienteId: acudiente.id,
      fechaAusencia: justFecha,
      motivo: justMotivo.trim(),
      fechaEnvio: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
    };

    onUpdateDb({
      ...db,
      justificaciones: [...(db.justificaciones || []), nuevaJust],
    });

    onShowToast('✉️ Justificante enviado a la consejería escolar');
    setJustMotivo('');
    setModalJustificarAbierto(false);
  };

  // Justificaciones enviadas para este hijo
  const justificacionesHijo = (db.justificaciones || []).filter(
    (j) => j.estudianteId === hijoSeleccionado.id
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Barra de Bienvenida para el Padre */}
      <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#002244] text-white p-5 rounded-2xl shadow-sm border border-blue-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FFC107] text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">
              Portal de Acudientes
            </span>
            <span className="text-xs text-blue-200">
              {db.escuela.nombrePlantel} &bull; {db.annoLectivo}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Bienvenido(a), {acudiente.nombre}
          </h2>
          <p className="text-xs text-blue-100 mt-0.5">
            Parentesco: <strong>{acudiente.parentesco}</strong> &bull; Cédula: {acudiente.cedula}
          </p>
        </div>

        {/* Acciones de Cuenta */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onSwitchToAdmin}
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl transition border border-white/20 font-medium"
            title="Cambiar a Modo Administrativo"
          >
            Modo Administrativo
          </button>
          <button
            onClick={onLogout}
            className="text-xs bg-rose-600/90 hover:bg-rose-700 text-white px-3 py-2 rounded-xl transition font-bold flex items-center gap-1.5 shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* SELECTOR DE HIJOS (Restricción estricta a sus propios hijos) */}
      {misHijos.length > 1 && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600 mr-2 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#003366]" />
            <span>Seleccionar hijo(a):</span>
          </span>
          {misHijos.map((hijo) => {
            const esActivo = hijo.id === hijoSeleccionadoId;
            return (
              <button
                key={hijo.id}
                onClick={() => setHijoSeleccionadoId(hijo.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                  esActivo
                    ? 'bg-[#003366] text-white border-[#003366] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{hijo.nombre}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded ${
                    esActivo ? 'bg-amber-400 text-slate-900 font-extrabold' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {hijo.grado} &ldquo;{hijo.grupo}&rdquo;
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* TARJETA PRINCIPAL DEL HIJO SELECCIONADO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${
              hijoSeleccionado.genero === 'F'
                ? 'bg-pink-100 text-pink-700 border border-pink-200'
                : 'bg-blue-100 text-[#003366] border border-blue-200'
            }`}
          >
            {hijoSeleccionado.nombre.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">
                {hijoSeleccionado.nombre}
              </h3>
              <span className="bg-blue-50 text-[#003366] font-bold text-xs px-2 py-0.5 rounded border border-blue-200">
                {hijoSeleccionado.grado} &ldquo;{hijoSeleccionado.grupo}&rdquo;
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Cédula: <strong>{hijoSeleccionado.cedula}</strong> &bull; Consejero(a):{' '}
              {consejero ? consejero.nombre : 'Por asignar'}
            </p>
          </div>
        </div>

        {/* Botones de acción rápida: Boletín Oficial y Carnet */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => onOpenBoletin(hijoSeleccionado.id)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#003366] hover:bg-[#002244] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-4 h-4 text-[#FFC107]" />
            <span>Boletín Oficial</span>
          </button>
          <button
            onClick={() => onOpenCarnet(hijoSeleccionado.id)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-amber-300"
          >
            <IdCard className="w-4 h-4 text-amber-700" />
            <span>Carnet Digital</span>
          </button>
        </div>
      </div>

      {/* KPIS RÁPIDOS DEL HIJO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Promedio Trimestre Actual */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Promedio Trimestre {db.trimestreActual}
          </span>
          <p
            className={`text-2xl font-black mt-1 ${
              promTrimestreActual === null
                ? 'text-slate-400'
                : promTrimestreActual >= 3.0
                ? 'text-emerald-700'
                : 'text-rose-600'
            }`}
          >
            {promTrimestreActual !== null ? promTrimestreActual.toFixed(2) : '—'}
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {promTrimestreActual !== null && promTrimestreActual >= 3.0
              ? '✓ Aprobando satisfactoriamente'
              : 'Requiere reforzamiento'}
          </span>
        </div>

        {/* Promedio Anual */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Promedio General Anual
          </span>
          <p className="text-2xl font-black text-[#003366] mt-1">
            {promAnual !== null ? promAnual.toFixed(2) : '—'}
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {promAnual !== null && promAnual >= 4.5
              ? '⭐ Cuadro de Honor'
              : 'Acumulado del ciclo escolar'}
          </span>
        </div>

        {/* Asistencia Escolar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Asistencia Presencial
          </span>
          <p
            className={`text-2xl font-black mt-1 ${
              asistenciaStats.paseuAprobado ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {asistenciaStats.porcentaje}%
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {asistenciaStats.ausentes} inasistencia(s) registrada(s)
          </span>
        </div>

        {/* Estatus PASE-U */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Beca Digital PASE-U
          </span>
          <div className="mt-2">
            {asistenciaStats.paseuAprobado ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Elegible (≥ 90%)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>En Riesgo (&lt; 90%)</span>
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            Supervisado por IFARHU / MEDUCA
          </span>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN DEL PORTAL */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs flex gap-1 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setPestanaActiva('notas')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 ${
            pestanaActiva === 'notas'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Calificaciones y Tareas</span>
        </button>

        <button
          onClick={() => setPestanaActiva('asistencia')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 ${
            pestanaActiva === 'asistencia'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Asistencia &amp; PASE-U</span>
        </button>

        <button
          onClick={() => setPestanaActiva('comunicados')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 relative ${
            pestanaActiva === 'comunicados'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Avisos de la Escuela</span>
          {comunicadosFiltrados.some((c) => !c.leidoPor.includes(acudiente.id)) && (
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2 ring-2 ring-white animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setPestanaActiva('docente')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 ${
            pestanaActiva === 'docente'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Consejero(a) Tutor</span>
        </button>
      </div>

      {/* CONTENIDO 1: CALIFICACIONES DETALLADAS */}
      {pestanaActiva === 'notas' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-slate-700 flex items-center justify-between">
            <span>
              📘 <strong>Evaluación en Educación Primaria:</strong> La nota del trimestre se calcula con el <strong>promedio exacto de las notas diarias</strong> registradas por los educadores. Haga clic en cualquier materia para ver el desglose de tareas y proyectos.
            </span>
          </div>

          <div className="space-y-2.5">
            {TODAS_MATERIAS.map((materia) => {
              const cal = db.calificaciones.find(
                (c) =>
                  c.estudianteId === hijoSeleccionado.id &&
                  c.materia === materia &&
                  c.trimestre === db.trimestreActual &&
                  c.annoLectivo === db.annoLectivo
              );

              const notasDiarias = cal?.notasDiarias || [];
              const promMateria = calcularPromedioTrimestre(
                hijoSeleccionado.id,
                materia,
                db.trimestreActual,
                db.calificaciones,
                db.annoLectivo
              );
              const estaExpandida = materiaExpandida === materia;

              return (
                <div
                  key={materia}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition"
                >
                  {/* Fila principal de la materia */}
                  <div
                    onClick={() =>
                      setMateriaExpandida(estaExpandida ? null : materia)
                    }
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-[#003366]">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{materia}</h4>
                        <span className="text-[10px] text-slate-400">
                          {notasDiarias.length} actividad(es) evaluada(s)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Promedio</span>
                        <span
                          className={`font-black text-sm px-2 py-0.5 rounded ${
                            promMateria === null
                              ? 'text-slate-400 bg-slate-100'
                              : promMateria >= 3.0
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : 'text-rose-700 bg-rose-50 border border-rose-200'
                          }`}
                        >
                          {promMateria !== null ? promMateria.toFixed(2) : 'Sin notas'}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          estaExpandida ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Desglose de notas diarias expandido */}
                  {estaExpandida && (
                    <div className="bg-slate-50/80 p-4 border-t border-slate-100 space-y-2 text-xs">
                      <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                        Desglose de Notas Diarias Registradas
                      </p>

                      {notasDiarias.length === 0 ? (
                        <p className="text-slate-400 italic text-[11px] py-2">
                          El docente aún no ha registrado notas diarias para esta materia en el trimestre actual.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {notasDiarias.map((nota) => (
                            <div
                              key={nota.id}
                              className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                            >
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 block truncate">
                                  {nota.desc}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Fecha: {nota.fecha}
                                </span>
                                {nota.observacion && (
                                  <p className="text-[10px] text-slate-500 italic mt-0.5">
                                    Nota del docente: {nota.observacion}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`text-sm font-black px-2 py-0.5 rounded shrink-0 ${
                                  nota.valor >= 3.0
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {nota.valor.toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENIDO 2: ASISTENCIA Y PASE-U */}
      {pestanaActiva === 'asistencia' && (
        <div className="space-y-5">
          {/* Alerta / Certificación de Beca PASE-U */}
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs ${
              asistenciaStats.paseuAprobado
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {asistenciaStats.paseuAprobado ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {asistenciaStats.paseuAprobado
                    ? 'Cumplimiento de la Beca Digital PASE-U'
                    : 'Atención: Asistencia Escolar en Riesgo para el PASE-U'}
                </h4>
                <p className="mt-0.5 leading-relaxed">
                  {asistenciaStats.paseuAprobado
                    ? `Su hijo(a) cuenta con una tasa de asistencia del ${asistenciaStats.porcentaje}%, superando el mínimo del 90% exigido por la ley de becas escolares del IFARHU.`
                    : `Su hijo(a) registra una tasa de asistencia del ${asistenciaStats.porcentaje}%, la cual está por debajo del 90% requerido. Favor justificar las ausencias oportunamente.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setModalJustificarAbierto(true)}
              className="bg-[#003366] hover:bg-[#002244] text-white font-bold px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shrink-0 transition shadow-xs flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5 text-[#FFC107]" />
              <span>Enviar Justificante</span>
            </button>
          </div>

          {/* Desglose Estadístico */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Días Presente</span>
              <p className="text-xl font-black text-emerald-700 mt-1">{asistenciaStats.presentes}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Ausencias</span>
              <p className="text-xl font-black text-rose-600 mt-1">{asistenciaStats.ausentes}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Tardanzas</span>
              <p className="text-xl font-black text-amber-600 mt-1">{asistenciaStats.tardanzas}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Justificadas</span>
              <p className="text-xl font-black text-sky-600 mt-1">{asistenciaStats.justificados}</p>
            </div>
          </div>

          {/* Historial de Inasistencias o Justificaciones */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#003366]" />
                <span>Historial de Inasistencias y Novedades</span>
              </h4>
              <button
                onClick={() => setModalJustificarAbierto(true)}
                className="text-xs text-[#003366] hover:underline font-bold"
              >
                + Justificar otra fecha
              </button>
            </div>

            {inasistenciasHijo.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6 italic">
                ¡Excelente! Su hijo(a) no registra faltas ni tardanzas en el período escolar.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {inasistenciasHijo.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{reg.fecha}</span>
                      <span className="text-[11px] text-slate-500 ml-2">
                        {reg.estado === 'A'
                          ? 'Ausencia injustificada'
                          : reg.estado === 'T'
                          ? 'Tardanza al aula'
                          : 'Ausencia Justificada'}
                      </span>
                    </div>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        reg.estado === 'A'
                          ? 'bg-rose-100 text-rose-800'
                          : reg.estado === 'T'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {reg.estado === 'A' ? 'Falta' : reg.estado === 'T' ? 'Tarde' : 'Justificada'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Justificantes enviados por el acudiente */}
          {justificacionesHijo.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Justificantes Presentados por Usted</span>
              </h4>
              <div className="space-y-2 text-xs">
                {justificacionesHijo.map((j) => (
                  <div
                    key={j.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          Fecha ausente: {j.fechaAusencia}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          (Enviado el {j.fechaEnvio})
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 italic">
                        &ldquo;{j.motivo}&rdquo;
                      </p>
                      {j.observacionDocente && (
                        <p className="text-slate-700 font-medium text-[11px] mt-1 bg-white p-1.5 rounded border border-slate-200">
                          Respuesta de la escuela: {j.observacionDocente}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        j.estado === 'aprobada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : j.estado === 'rechazada'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {j.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO 3: COMUNICADOS Y AVISOS ESCOLARES */}
      {pestanaActiva === 'comunicados' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Circulares y Avisos Oficiales del Plantel ({comunicadosFiltrados.length})
            </h3>
            <span className="text-[11px] text-slate-500">
              MEDUCA &bull; {db.escuela.nombrePlantel}
            </span>
          </div>

          {comunicadosFiltrados.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-10 bg-white rounded-xl border border-slate-200 italic">
              No hay avisos ni circulares publicadas en este momento.
            </p>
          ) : (
            <div className="space-y-3">
              {comunicadosFiltrados.map((com) => {
                const leido = com.leidoPor.includes(acudiente.id);
                const esUrgente = com.prioridad === 'urgente';

                return (
                  <div
                    key={com.id}
                    className={`bg-white rounded-2xl p-5 border transition shadow-xs ${
                      esUrgente
                        ? 'border-rose-300 ring-1 ring-rose-200'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              esUrgente
                                ? 'bg-rose-100 text-rose-800'
                                : com.prioridad === 'importante'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-[#003366]'
                            }`}
                          >
                            {com.prioridad}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Publicado el {com.fecha} &bull; Por {com.remitente}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">
                          {com.titulo}
                        </h4>
                      </div>

                      {/* Estado de Lectura */}
                      <div>
                        {leido ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Lectura Confirmada</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConfirmarLectura(com.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] px-3 py-1.5 rounded-xl transition shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC107]" />
                            <span>Confirmar Lectura</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {com.contenido}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO 4: CONTACTO CON EL DOCENTE CONSEJERO */}
      {pestanaActiva === 'docente' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#003366] flex items-center justify-center font-bold text-lg">
              {consejero ? consejero.nombre.charAt(0) : 'P'}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Consejero(a) de {hijoSeleccionado.grado} &ldquo;{hijoSeleccionado.grupo}&rdquo;
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {consejero ? consejero.nombre : 'Consejero pendiente de designación'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Cédula: {consejero?.cedula || 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">
                Atención y Orientación a Padres
              </span>
              <p className="text-slate-600 leading-relaxed">
                El docente consejero atiende consultas académicas y formativas en el horario estipulado por el plantel. Se solicita agendar cita con anticipación para la revisión presencial de carpetas de actividades.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block">
                Canales Institucionales
              </span>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Teléfono Consejería: <strong>{consejero?.telefono || db.escuela.telefono}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <School className="w-4 h-4 text-slate-400" />
                <span>Plantel: <strong>{db.escuela.nombrePlantel}</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500">
            Horario general de atención escolar: Lunes a Viernes de 7:30 a.m. a 1:00 p.m.
          </div>
        </div>
      )}

      {/* MODAL PARA JUSTIFICAR INASISTENCIA */}
      {modalJustificarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            <div className="bg-[#003366] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-[#FFC107]" />
                <span>Justificar Inasistencia Escolar</span>
              </h3>
              <button
                onClick={() => setModalJustificarAbierto(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnviarJustificacion} className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600">
                Estudiante: <strong>{hijoSeleccionado.nombre}</strong> ({hijoSeleccionado.grado} &ldquo;{hijoSeleccionado.grupo}&rdquo;)
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fecha de la Inasistencia *
                </label>
                <input
                  type="date"
                  required
                  value={justFecha}
                  onChange={(e) => setJustFecha(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003366] font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motivo / Causa de la Ausencia *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ej: Cita médica en el centro de salud de Boquete por cuadro gripal."
                  value={justMotivo}
                  onChange={(e) => setJustMotivo(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003366]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalJustificarAbierto(false)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-[#FFC107]" />
                  <span>Enviar al Docente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
