import React, { useState } from 'react';
import {
  X,
  Printer,
  Award,
  Calendar,
  Building,
  User,
  CheckCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { AppDatabase } from '../utils/storage';
import {
  calcularPromedioTrimestre,
  calcularPromedioMateriaAnual,
  calcularPromedioGeneralAnual,
  calcularPromedioGeneralTrimestre,
  calcularAsistenciaEstudiante,
} from '../utils/calculations';
import {
  MATERIAS_CONSEJERO,
  MATERIAS_ESPECIALES,
  TODAS_MATERIAS,
  SUBMATERIAS_TECNOLOGIA,
} from '../types';

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

  // Docente consejero del grado y grupo
  const consejero = db.docentes.find(
    (d) =>
      d.tipo === 'consejero' &&
      d.gradoTutor === estudiante.grado &&
      d.grupoTutor === estudiante.grupo
  );

  // Cálculos generales
  const promGeneralAnual = calcularPromedioGeneralAnual(
    estudiante.id,
    db.calificaciones,
    db.annoLectivo
  );

  const promT1 = calcularPromedioGeneralTrimestre(estudiante.id, 1, db.calificaciones, db.annoLectivo);
  const promT2 = calcularPromedioGeneralTrimestre(estudiante.id, 2, db.calificaciones, db.annoLectivo);
  const promT3 = calcularPromedioGeneralTrimestre(estudiante.id, 3, db.calificaciones, db.annoLectivo);

  const asistenciaData = calcularAsistenciaEstudiante(
    estudiante.id,
    db.asistencia,
    db.annoLectivo
  );

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
              <h2 className="text-sm font-bold">Boletín Oficial de Calificaciones</h2>
              <p className="text-[11px] text-blue-200">
                Formato Institucional MEDUCA Panamá &bull; Nivel Primaria
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
              className="bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Boletín</span>
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

        {/* CONTENIDO DEL BOLETÍN (Imprimible) */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 print:p-0 print:space-y-4 print-page">
          {/* Membrete Oficial */}
          <div className="text-center border-b-2 border-[#003366] pb-4">
            <div className="inline-block mb-1">
              <span className="text-[11px] font-extrabold tracking-widest text-[#003366] uppercase block">
                REPÚBLICA DE PANAMÁ &bull; GOBIERNO NACIONAL
              </span>
              <span className="text-xs font-bold text-slate-700 uppercase block">
                MINISTERIO DE EDUCACIÓN &bull; DIRECCIÓN GENERAL DE EDUCACIÓN
              </span>
              <span className="text-xs text-slate-600 block">
                {db.escuela.regionEducativa}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#003366] uppercase tracking-wide mt-1">
              {db.escuela.nombrePlantel}
            </h1>
            <p className="text-xs font-bold text-slate-600 tracking-wider uppercase mt-0.5">
              BOLETÍN OFICIAL DE EVALUACIÓN DEL APRENDIZAJE &bull; EDUCACIÓN PRIMARIA
            </p>
          </div>

          {/* Ficha del Estudiante */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 print:bg-white print:border-slate-400">
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                Estudiante:
              </span>
              <span className="font-extrabold text-slate-900 text-sm">
                {estudiante.nombre}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                Cédula / ID:
              </span>
              <span className="font-bold text-slate-800 font-mono">
                {estudiante.cedula}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                Grado y Sección:
              </span>
              <span className="font-extrabold text-[#003366]">
                {estudiante.grado} &ldquo;{estudiante.grupo}&rdquo;
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                Año Lectivo:
              </span>
              <span className="font-bold text-slate-800">
                {db.annoLectivo}
              </span>
            </div>
            <div className="col-span-2 mt-1 pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-semibold text-[10px] uppercase">
                Maestro(a) Consejero(a):
              </span>
              <span className="font-bold text-slate-800 ml-1">
                {consejero ? consejero.nombre : 'Consejero no asignado'}
              </span>
            </div>
            <div className="col-span-2 mt-1 pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-semibold text-[10px] uppercase">
                Acudiente:
              </span>
              <span className="font-medium text-slate-800 ml-1">
                {estudiante.acudiente || 'Sin registrar'}
              </span>
            </div>
          </div>

          {/* TABLA DE CALIFICACIONES OFICIAL (11 Asignaturas) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs border border-slate-300">
              <thead>
                <tr className="bg-[#003366] text-white text-[11px] font-bold uppercase text-center">
                  <th className="py-2 px-3 text-left w-1/3">Asignatura</th>
                  <th className="py-2 px-2 w-16">Trim. I</th>
                  <th className="py-2 px-2 w-16">Trim. II</th>
                  <th className="py-2 px-2 w-16">Trim. III</th>
                  <th className="py-2 px-2 w-20">Prom. Final</th>
                  <th className="py-2 px-3 text-left">Estado / Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* 1. Área Humanística y Científica Básica (Consejero) */}
                <tr className="bg-slate-100 font-bold text-slate-700 text-[10px] uppercase tracking-wider">
                  <td colSpan={6} className="py-1 px-3">
                    Asignaturas Nucleares de Educación Primaria
                  </td>
                </tr>

                {MATERIAS_CONSEJERO.map((materia) => {
                  const t1 = calcularPromedioTrimestre(estudiante.id, materia, 1, db.calificaciones, db.annoLectivo);
                  const t2 = calcularPromedioTrimestre(estudiante.id, materia, 2, db.calificaciones, db.annoLectivo);
                  const t3 = calcularPromedioTrimestre(estudiante.id, materia, 3, db.calificaciones, db.annoLectivo);
                  const anual = calcularPromedioMateriaAnual(estudiante.id, materia, db.calificaciones, db.annoLectivo);

                  return (
                    <tr key={materia} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-semibold text-slate-800 border-r border-slate-200">
                        {materia}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200">
                        {t1 !== null ? t1.toFixed(1) : '—'}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200">
                        {t2 !== null ? t2.toFixed(1) : '—'}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200">
                        {t3 !== null ? t3.toFixed(1) : '—'}
                      </td>
                      <td className="py-1.5 px-2 text-center font-bold border-r border-slate-200 bg-slate-50">
                        {anual !== null ? (
                          <span className={anual >= 3.0 ? 'text-slate-900' : 'text-rose-600 font-black'}>
                            {anual.toFixed(1)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-[11px]">
                        {anual !== null ? (
                          anual >= 3.0 ? (
                            <span className="text-emerald-700 font-medium">Aprobada</span>
                          ) : (
                            <span className="text-rose-700 font-bold">Reprobada</span>
                          )
                        ) : (
                          <span className="text-slate-400">En curso</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* 2. Asignaturas Especiales y Área Tecnológica */}
                <tr className="bg-slate-100 font-bold text-slate-700 text-[10px] uppercase tracking-wider">
                  <td colSpan={6} className="py-1 px-3">
                    Asignaturas Especiales y Complementarias (Plan Primaria MEDUCA)
                  </td>
                </tr>

                {/* Inglés y Educación Física */}
                {(['Inglés', 'Educación Física'] as const).map((materia) => {
                  const t1 = calcularPromedioTrimestre(estudiante.id, materia, 1, db.calificaciones, db.annoLectivo);
                  const t2 = calcularPromedioTrimestre(estudiante.id, materia, 2, db.calificaciones, db.annoLectivo);
                  const t3 = calcularPromedioTrimestre(estudiante.id, materia, 3, db.calificaciones, db.annoLectivo);
                  const anual = calcularPromedioMateriaAnual(estudiante.id, materia, db.calificaciones, db.annoLectivo);

                  return (
                    <tr key={materia} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-semibold text-slate-800 border-r border-slate-200">
                        {materia}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200">
                        {t1 !== null ? t1.toFixed(1) : '—'}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200">
                        {t2 !== null ? t2.toFixed(1) : '—'}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200">
                        {t3 !== null ? t3.toFixed(1) : '—'}
                      </td>
                      <td className="py-1.5 px-2 text-center font-bold border-r border-slate-200 bg-slate-50">
                        {anual !== null ? (
                          <span className={anual >= 3.0 ? 'text-slate-900' : 'text-rose-600 font-black'}>
                            {anual.toFixed(1)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-[11px]">
                        {anual !== null ? (
                          anual >= 3.0 ? (
                            <span className="text-emerald-700 font-medium">Aprobada</span>
                          ) : (
                            <span className="text-rose-700 font-bold">Reprobada</span>
                          )
                        ) : (
                          <span className="text-slate-400">En curso</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* TECNOLOGÍA: Asignatura Oficial Unificada */}
                {(() => {
                  const t1 = calcularPromedioTrimestre(estudiante.id, 'Tecnología', 1, db.calificaciones, db.annoLectivo);
                  const t2 = calcularPromedioTrimestre(estudiante.id, 'Tecnología', 2, db.calificaciones, db.annoLectivo);
                  const t3 = calcularPromedioTrimestre(estudiante.id, 'Tecnología', 3, db.calificaciones, db.annoLectivo);
                  const anual = calcularPromedioMateriaAnual(estudiante.id, 'Tecnología', db.calificaciones, db.annoLectivo);

                  return (
                    <>
                      <tr className="bg-amber-50/50 hover:bg-amber-50/80 font-bold border-t border-b border-amber-200">
                        <td className="py-2 px-3 text-slate-900 border-r border-slate-200">
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-800">Tecnología</span>
                            <span className="text-[9px] font-black uppercase bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                              Nota Unificada
                            </span>
                          </div>
                          <span className="text-[10px] font-normal text-slate-500 block">
                            (Unificación trimestral de Ed. para el Hogar, Agropecuaria e Informática)
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center border-r border-slate-200 font-black text-slate-900">
                          {t1 !== null ? t1.toFixed(1) : '—'}
                        </td>
                        <td className="py-2 px-2 text-center border-r border-slate-200 font-black text-slate-900">
                          {t2 !== null ? t2.toFixed(1) : '—'}
                        </td>
                        <td className="py-2 px-2 text-center border-r border-slate-200 font-black text-slate-900">
                          {t3 !== null ? t3.toFixed(1) : '—'}
                        </td>
                        <td className="py-2 px-2 text-center font-black border-r border-slate-200 bg-amber-100/60">
                          {anual !== null ? (
                            <span className={anual >= 3.0 ? 'text-slate-950 font-black' : 'text-rose-600 font-black'}>
                              {anual.toFixed(1)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2 px-3 text-[11px]">
                          {anual !== null ? (
                            anual >= 3.0 ? (
                              <span className="text-emerald-700 font-bold">Aprobada (Oficial)</span>
                            ) : (
                              <span className="text-rose-700 font-bold">Reprobada</span>
                            )
                          ) : (
                            <span className="text-slate-400">En curso</span>
                          )}
                        </td>
                      </tr>

                      {/* Desglose individual de las 3 áreas evaluadas por los docentes especiales */}
                      {SUBMATERIAS_TECNOLOGIA.map((sub) => {
                        const st1 = calcularPromedioTrimestre(estudiante.id, sub, 1, db.calificaciones, db.annoLectivo);
                        const st2 = calcularPromedioTrimestre(estudiante.id, sub, 2, db.calificaciones, db.annoLectivo);
                        const st3 = calcularPromedioTrimestre(estudiante.id, sub, 3, db.calificaciones, db.annoLectivo);
                        const sanual = calcularPromedioMateriaAnual(estudiante.id, sub, db.calificaciones, db.annoLectivo);

                        return (
                          <tr key={sub} className="bg-slate-50/60 text-slate-600 text-[11px]">
                            <td className="py-1 px-3 pl-7 italic border-r border-slate-200 flex items-center gap-1">
                              <span className="text-slate-400 font-mono">↳</span>
                              <span>{sub} (Evaluación Docente Especial)</span>
                            </td>
                            <td className="py-1 px-2 text-center border-r border-slate-200 font-mono">
                              {st1 !== null ? st1.toFixed(1) : '—'}
                            </td>
                            <td className="py-1 px-2 text-center border-r border-slate-200 font-mono">
                              {st2 !== null ? st2.toFixed(1) : '—'}
                            </td>
                            <td className="py-1 px-2 text-center border-r border-slate-200 font-mono">
                              {st3 !== null ? st3.toFixed(1) : '—'}
                            </td>
                            <td className="py-1 px-2 text-center border-r border-slate-200 font-mono">
                              {sanual !== null ? sanual.toFixed(1) : '—'}
                            </td>
                            <td className="py-1 px-3 text-[10px] text-slate-500 italic">
                              Sub-área individual
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  );
                })()}

                {/* FILA DE PROMEDIOS GENERALES */}
                <tr className="bg-[#003366]/10 font-bold text-slate-900">
                  <td className="py-2 px-3 uppercase border-r border-slate-200">
                    PROMEDIO TRIMESTRAL
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-200 font-black">
                    {promT1 !== null ? promT1.toFixed(2) : '—'}
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-200 font-black">
                    {promT2 !== null ? promT2.toFixed(2) : '—'}
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-200 font-black">
                    {promT3 !== null ? promT3.toFixed(2) : '—'}
                  </td>
                  <td className="py-2 px-2 text-center font-black text-sm bg-[#003366] text-white">
                    {promGeneralAnual !== null ? promGeneralAnual.toFixed(2) : '—'}
                  </td>
                  <td className="py-2 px-3 text-[11px] font-bold">
                    {promGeneralAnual !== null ? (
                      promGeneralAnual >= 4.5 ? (
                        <span className="text-amber-800 font-black">⭐ Cuadro de Honor</span>
                      ) : promGeneralAnual >= 3.0 ? (
                        <span className="text-emerald-800">Aprobado</span>
                      ) : (
                        <span className="text-rose-700">Reprobado</span>
                      )
                    ) : (
                      'Período en desarrollo'
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Resumen de Asistencia y PASE-U */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 print:border-slate-400">
              <span className="font-bold text-slate-700 block mb-1">
                Registro de Asistencia y Puntualidad
              </span>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block">Días Presente</span>
                  <span className="font-bold text-slate-800">{asistenciaData.presentes}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Ausencias</span>
                  <span className="font-bold text-rose-600">{asistenciaData.ausentes}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">% Asistencia</span>
                  <span className="font-black text-[#003366]">{asistenciaData.porcentaje}%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 print:border-slate-400">
              <span className="font-bold text-slate-700 block mb-1">
                Certificación para Beca PASE-U (IFARHU)
              </span>
              <p className="text-[11px] text-slate-600 leading-tight">
                {asistenciaData.paseuAprobado ? (
                  <span className="text-emerald-800 font-bold">
                    ✓ El estudiante cumple con el mínimo del 90% de asistencia escolar exigido por la Ley de PASE-U.
                  </span>
                ) : (
                  <span className="text-rose-800 font-bold">
                    ⚠️ El estudiante NO alcanza el 90% de asistencia requerida. Su beneficio económico se encuentra condicionado.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Sección de Firmas Oficiales */}
          <div className="grid grid-cols-2 gap-8 pt-10 text-center text-xs print:pt-14">
            <div>
              <div className="border-t border-slate-400 pt-2 w-4/5 mx-auto">
                <p className="font-bold text-slate-800">
                  {consejero ? consejero.nombre : 'Maestro(a) Consejero(a)'}
                </p>
                <p className="text-[10px] text-slate-500 uppercase">
                  Maestro(a) de Grado
                </p>
              </div>
            </div>

            <div>
              <div className="border-t border-slate-400 pt-2 w-4/5 mx-auto">
                <p className="font-bold text-slate-800">
                  {db.escuela.director}
                </p>
                <p className="text-[10px] text-slate-500 uppercase">
                  Director(a) del Plantel Educativo
                </p>
              </div>
            </div>
          </div>

          {/* Pie de página oficial */}
          <div className="text-center pt-2 text-[9px] text-slate-400 border-t border-slate-200 print:border-slate-400 uppercase">
            Documento emitido electrónicamente por el Sistema RUE Primaria MEDUCA &bull; Válido para trámites del IFARHU y Traslados Oficiales
          </div>
        </div>
      </div>
    </div>
  );
};
