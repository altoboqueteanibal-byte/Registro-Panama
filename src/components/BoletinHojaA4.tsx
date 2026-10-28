import React from 'react';
import { AppDatabase } from '../utils/storage';
import { Estudiante, MATERIAS_CONSEJERO, SUBMATERIAS_TECNOLOGIA } from '../types';
import {
  calcularPromedioTrimestre,
  calcularPromedioMateriaAnual,
  calcularPromedioGeneralAnual,
  calcularPromedioGeneralTrimestre,
  calcularAsistenciaEstudiante,
} from '../utils/calculations';

interface BoletinHojaA4Props {
  db: AppDatabase;
  estudiante: Estudiante;
  esHojaUnica?: boolean;
}

export const BoletinHojaA4: React.FC<BoletinHojaA4Props> = ({
  db,
  estudiante,
  esHojaUnica = true,
}) => {
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

  const promT1 = calcularPromedioGeneralTrimestre(
    estudiante.id,
    1,
    db.calificaciones,
    db.annoLectivo
  );
  const promT2 = calcularPromedioGeneralTrimestre(
    estudiante.id,
    2,
    db.calificaciones,
    db.annoLectivo
  );
  const promT3 = calcularPromedioGeneralTrimestre(
    estudiante.id,
    3,
    db.calificaciones,
    db.annoLectivo
  );

  const asistenciaData = calcularAsistenciaEstudiante(
    estudiante.id,
    db.asistencia,
    db.annoLectivo
  );

  return (
    <div
      className={`bg-white text-slate-800 ${
        esHojaUnica
          ? 'p-6 sm:p-8 space-y-6 print:p-0 print:space-y-2 print-page a4-page-single'
          : 'p-6 my-4 shadow-sm border border-slate-200 a4-sheet print:shadow-none print:border-none print:my-0 print:p-0 print:space-y-2'
      }`}
    >
      {/* Membrete Oficial MEDUCA */}
      <div className="text-center border-b-2 border-[#003366] pb-3 print:pb-1.5">
        <div className="inline-block mb-1 print:mb-0.5">
          <span className="text-[11px] font-extrabold tracking-widest text-[#003366] uppercase block print:text-[8.5px]">
            REPÚBLICA DE PANAMÁ &bull; GOBIERNO NACIONAL
          </span>
          <span className="text-xs font-bold text-slate-700 uppercase block print:text-[8px]">
            MINISTERIO DE EDUCACIÓN &bull; DIRECCIÓN GENERAL DE EDUCACIÓN
          </span>
          <span className="text-xs text-slate-600 block print:text-[8px]">
            {db.escuela.regionEducativa}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#003366] uppercase tracking-wide mt-1 print:text-base print:mt-0.5">
          {db.escuela.nombrePlantel}
        </h1>
        <p className="text-xs font-bold text-slate-600 tracking-wider uppercase mt-0.5 print:text-[8.5px]">
          BOLETÍN OFICIAL DE EVALUACIÓN DEL APRENDIZAJE &bull; EDUCACIÓN PRIMARIA
        </p>
      </div>

      {/* Ficha del Estudiante */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 print:bg-white print:border-slate-400 print:p-2 print:gap-1.5 print:text-[9.5px]">
        <div>
          <span className="text-slate-500 font-semibold block text-[10px] print:text-[8px] uppercase">
            Estudiante:
          </span>
          <span className="font-extrabold text-slate-900 text-sm print:text-xs">
            {estudiante.nombre}
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block text-[10px] print:text-[8px] uppercase">
            Cédula / ID:
          </span>
          <span className="font-bold text-slate-800 font-mono print:text-[10px]">
            {estudiante.cedula}
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block text-[10px] print:text-[8px] uppercase">
            Grado y Sección:
          </span>
          <span className="font-extrabold text-[#003366] print:text-[10px]">
            {estudiante.grado} &ldquo;{estudiante.grupo}&rdquo;
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block text-[10px] print:text-[8px] uppercase">
            Año Lectivo:
          </span>
          <span className="font-bold text-slate-800 print:text-[10px]">
            {db.annoLectivo}
          </span>
        </div>
        <div className="col-span-2 mt-1 pt-1 border-t border-slate-200 print:mt-0.5 print:pt-0.5">
          <span className="text-slate-500 font-semibold text-[10px] print:text-[8px] uppercase">
            Maestro(a) Consejero(a):
          </span>
          <span className="font-bold text-slate-800 ml-1 print:text-[9.5px]">
            {consejero ? consejero.nombre : 'Consejero no asignado'}
          </span>
        </div>
        <div className="col-span-2 mt-1 pt-1 border-t border-slate-200 print:mt-0.5 print:pt-0.5">
          <span className="text-slate-500 font-semibold text-[10px] print:text-[8px] uppercase">
            Acudiente:
          </span>
          <span className="font-medium text-slate-800 ml-1 print:text-[9.5px]">
            {estudiante.acudiente || 'Sin registrar'}
          </span>
        </div>
      </div>

      {/* TABLA DE CALIFICACIONES OFICIAL (11 Asignaturas) */}
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left border-collapse text-xs border border-slate-300 print:text-[9px]">
          <thead>
            <tr className="bg-[#003366] text-white text-[11px] font-bold uppercase text-center print:text-[8.5px]">
              <th className="py-2 px-3 text-left w-1/3 print:py-0.5 print:px-2">Asignatura</th>
              <th className="py-2 px-2 w-16 print:py-0.5 print:px-1.5">Trim. I</th>
              <th className="py-2 px-2 w-16 print:py-0.5 print:px-1.5">Trim. II</th>
              <th className="py-2 px-2 w-16 print:py-0.5 print:px-1.5">Trim. III</th>
              <th className="py-2 px-2 w-20 print:py-0.5 print:px-1.5">Prom. Final</th>
              <th className="py-2 px-3 text-left print:py-0.5 print:px-2">Estado / Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {/* 1. Área Humanística y Científica Básica (Consejero) */}
            <tr className="bg-slate-100 font-bold text-slate-700 text-[10px] uppercase tracking-wider print:text-[8px]">
              <td colSpan={6} className="py-1 px-3 print:py-0.5 print:px-2">
                Asignaturas Nucleares de Educación Primaria
              </td>
            </tr>

            {MATERIAS_CONSEJERO.map((materia) => {
              const t1 = calcularPromedioTrimestre(
                estudiante.id,
                materia,
                1,
                db.calificaciones,
                db.annoLectivo
              );
              const t2 = calcularPromedioTrimestre(
                estudiante.id,
                materia,
                2,
                db.calificaciones,
                db.annoLectivo
              );
              const t3 = calcularPromedioTrimestre(
                estudiante.id,
                materia,
                3,
                db.calificaciones,
                db.annoLectivo
              );
              const anual = calcularPromedioMateriaAnual(
                estudiante.id,
                materia,
                db.calificaciones,
                db.annoLectivo
              );

              return (
                <tr key={materia} className="hover:bg-slate-50">
                  <td className="py-1.5 px-3 font-semibold text-slate-800 border-r border-slate-200 print:py-0.5 print:px-2">
                    {materia}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200 print:py-0.5 print:px-1">
                    {t1 !== null ? t1.toFixed(1) : '—'}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200 print:py-0.5 print:px-1">
                    {t2 !== null ? t2.toFixed(1) : '—'}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200 print:py-0.5 print:px-1">
                    {t3 !== null ? t3.toFixed(1) : '—'}
                  </td>
                  <td className="py-1.5 px-2 text-center font-bold border-r border-slate-200 bg-slate-50 print:py-0.5 print:px-1">
                    {anual !== null ? (
                      <span
                        className={
                          anual >= 3.0 ? 'text-slate-900' : 'text-rose-600 font-black'
                        }
                      >
                        {anual.toFixed(1)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-1.5 px-3 text-[11px] print:py-0.5 print:px-2 print:text-[8.5px]">
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

            {/* 2. Asignaturas Especiales y Complementarias */}
            <tr className="bg-slate-100 font-bold text-slate-700 text-[10px] uppercase tracking-wider print:text-[8px]">
              <td colSpan={6} className="py-1 px-3 print:py-0.5 print:px-2">
                Asignaturas Especiales y Complementarias (Plan Primaria MEDUCA)
              </td>
            </tr>

            {(['Inglés', 'Educación Física'] as const).map((materia) => {
              const t1 = calcularPromedioTrimestre(
                estudiante.id,
                materia,
                1,
                db.calificaciones,
                db.annoLectivo
              );
              const t2 = calcularPromedioTrimestre(
                estudiante.id,
                materia,
                2,
                db.calificaciones,
                db.annoLectivo
              );
              const t3 = calcularPromedioTrimestre(
                estudiante.id,
                materia,
                3,
                db.calificaciones,
                db.annoLectivo
              );
              const anual = calcularPromedioMateriaAnual(
                estudiante.id,
                materia,
                db.calificaciones,
                db.annoLectivo
              );

              return (
                <tr key={materia} className="hover:bg-slate-50">
                  <td className="py-1.5 px-3 font-semibold text-slate-800 border-r border-slate-200 print:py-0.5 print:px-2">
                    {materia}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200 print:py-0.5 print:px-1">
                    {t1 !== null ? t1.toFixed(1) : '—'}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200 print:py-0.5 print:px-1">
                    {t2 !== null ? t2.toFixed(1) : '—'}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-200 print:py-0.5 print:px-1">
                    {t3 !== null ? t3.toFixed(1) : '—'}
                  </td>
                  <td className="py-1.5 px-2 text-center font-bold border-r border-slate-200 bg-slate-50 print:py-0.5 print:px-1">
                    {anual !== null ? (
                      <span
                        className={
                          anual >= 3.0 ? 'text-slate-900' : 'text-rose-600 font-black'
                        }
                      >
                        {anual.toFixed(1)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-1.5 px-3 text-[11px] print:py-0.5 print:px-2 print:text-[8.5px]">
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
              const t1 = calcularPromedioTrimestre(
                estudiante.id,
                'Tecnología',
                1,
                db.calificaciones,
                db.annoLectivo
              );
              const t2 = calcularPromedioTrimestre(
                estudiante.id,
                'Tecnología',
                2,
                db.calificaciones,
                db.annoLectivo
              );
              const t3 = calcularPromedioTrimestre(
                estudiante.id,
                'Tecnología',
                3,
                db.calificaciones,
                db.annoLectivo
              );
              const anual = calcularPromedioMateriaAnual(
                estudiante.id,
                'Tecnología',
                db.calificaciones,
                db.annoLectivo
              );

              return (
                <>
                  <tr className="bg-amber-50/50 hover:bg-amber-50/80 font-bold border-t border-b border-amber-200">
                    <td className="py-2 px-3 text-slate-900 border-r border-slate-200 print:py-0.5 print:px-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-800">Tecnología</span>
                        <span className="text-[9px] font-black uppercase bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300 print:text-[7.5px]">
                          Nota Unificada
                        </span>
                      </div>
                      <span className="text-[10px] font-normal text-slate-500 block print:text-[7.5px]">
                        (Unificación trimestral de Hogar, Agropecuaria e Informática)
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-200 font-black text-slate-900 print:py-0.5 print:px-1">
                      {t1 !== null ? t1.toFixed(1) : '—'}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-200 font-black text-slate-900 print:py-0.5 print:px-1">
                      {t2 !== null ? t2.toFixed(1) : '—'}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-200 font-black text-slate-900 print:py-0.5 print:px-1">
                      {t3 !== null ? t3.toFixed(1) : '—'}
                    </td>
                    <td className="py-2 px-2 text-center font-black border-r border-slate-200 bg-amber-100/60 print:py-0.5 print:px-1">
                      {anual !== null ? (
                        <span
                          className={
                            anual >= 3.0 ? 'text-slate-950 font-black' : 'text-rose-600 font-black'
                          }
                        >
                          {anual.toFixed(1)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 px-3 text-[11px] print:py-0.5 print:px-2 print:text-[8.5px]">
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

                  {SUBMATERIAS_TECNOLOGIA.map((sub) => {
                    const st1 = calcularPromedioTrimestre(
                      estudiante.id,
                      sub,
                      1,
                      db.calificaciones,
                      db.annoLectivo
                    );
                    const st2 = calcularPromedioTrimestre(
                      estudiante.id,
                      sub,
                      2,
                      db.calificaciones,
                      db.annoLectivo
                    );
                    const st3 = calcularPromedioTrimestre(
                      estudiante.id,
                      sub,
                      3,
                      db.calificaciones,
                      db.annoLectivo
                    );
                    const sanual = calcularPromedioMateriaAnual(
                      estudiante.id,
                      sub,
                      db.calificaciones,
                      db.annoLectivo
                    );

                    return (
                      <tr
                        key={sub}
                        className="bg-slate-50/60 text-slate-600 text-[11px] print:text-[8px]"
                      >
                        <td className="py-1 px-3 pl-7 italic border-r border-slate-200 flex items-center gap-1 print:py-0.2 print:px-2 print:pl-4">
                          <span className="text-slate-400 font-mono">↳</span>
                          <span>{sub} (Docente Especial)</span>
                        </td>
                        <td className="py-1 px-2 text-center border-r border-slate-200 font-mono print:py-0.2 print:px-1">
                          {st1 !== null ? st1.toFixed(1) : '—'}
                        </td>
                        <td className="py-1 px-2 text-center border-r border-slate-200 font-mono print:py-0.2 print:px-1">
                          {st2 !== null ? st2.toFixed(1) : '—'}
                        </td>
                        <td className="py-1 px-2 text-center border-r border-slate-200 font-mono print:py-0.2 print:px-1">
                          {st3 !== null ? st3.toFixed(1) : '—'}
                        </td>
                        <td className="py-1 px-2 text-center border-r border-slate-200 font-mono print:py-0.2 print:px-1">
                          {sanual !== null ? sanual.toFixed(1) : '—'}
                        </td>
                        <td className="py-1 px-3 text-[10px] text-slate-500 italic print:py-0.2 print:px-2 print:text-[7.5px]">
                          Sub-área formativa
                        </td>
                      </tr>
                    );
                  })}
                </>
              );
            })()}

            {/* FILA DE PROMEDIOS GENERALES */}
            <tr className="bg-[#003366]/10 font-bold text-slate-900 print:text-[9.5px]">
              <td className="py-2 px-3 uppercase border-r border-slate-200 print:py-1 print:px-2">
                PROMEDIO TRIMESTRAL
              </td>
              <td className="py-2 px-2 text-center border-r border-slate-200 font-black print:py-1 print:px-1">
                {promT1 !== null ? promT1.toFixed(2) : '—'}
              </td>
              <td className="py-2 px-2 text-center border-r border-slate-200 font-black print:py-1 print:px-1">
                {promT2 !== null ? promT2.toFixed(2) : '—'}
              </td>
              <td className="py-2 px-2 text-center border-r border-slate-200 font-black print:py-1 print:px-1">
                {promT3 !== null ? promT3.toFixed(2) : '—'}
              </td>
              <td className="py-2 px-2 text-center font-black text-sm bg-[#003366] text-white print:text-[10px] print:py-1 print:px-1">
                {promGeneralAnual !== null ? promGeneralAnual.toFixed(2) : '—'}
              </td>
              <td className="py-2 px-3 text-[11px] font-bold print:py-1 print:px-2 print:text-[8.5px]">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs print:gap-2 print:text-[8.5px]">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 print:p-1.5 print:border-slate-400">
          <span className="font-bold text-slate-700 block mb-1 print:mb-0.5">
            Registro de Asistencia y Puntualidad
          </span>
          <div className="grid grid-cols-3 gap-2 text-center pt-1 print:pt-0">
            <div>
              <span className="text-[10px] text-slate-500 block print:text-[7.5px]">
                Días Presente
              </span>
              <span className="font-bold text-slate-800 print:text-[9px]">
                {asistenciaData.presentes}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block print:text-[7.5px]">
                Ausencias
              </span>
              <span className="font-bold text-rose-600 print:text-[9px]">
                {asistenciaData.ausentes}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block print:text-[7.5px]">
                % Asistencia
              </span>
              <span className="font-black text-[#003366] print:text-[9px]">
                {asistenciaData.porcentaje}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 print:p-1.5 print:border-slate-400">
          <span className="font-bold text-slate-700 block mb-1 print:mb-0.5">
            Certificación para Beca PASE-U (IFARHU)
          </span>
          <p className="text-[11px] text-slate-600 leading-tight print:text-[8px]">
            {asistenciaData.paseuAprobado ? (
              <span className="text-emerald-800 font-bold">
                ✓ Cumple con el mínimo del 90% de asistencia escolar exigido por la Ley de PASE-U.
              </span>
            ) : (
              <span className="text-rose-800 font-bold">
                ⚠️ NO alcanza el 90% de asistencia requerida. Beneficio económico condicionado.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Sección de Firmas Oficiales */}
      <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs print:pt-4 print:pb-0 print:text-[8.5px] avoid-break">
        <div>
          <div className="border-t border-slate-400 pt-2 w-4/5 mx-auto print:pt-1">
            <p className="font-bold text-slate-800 print:text-[9px]">
              {consejero ? consejero.nombre : 'Maestro(a) Consejero(a)'}
            </p>
            <p className="text-[10px] text-slate-500 uppercase print:text-[7.5px]">
              Maestro(a) de Grado
            </p>
          </div>
        </div>

        <div>
          <div className="border-t border-slate-400 pt-2 w-4/5 mx-auto print:pt-1">
            <p className="font-bold text-slate-800 print:text-[9px]">{db.escuela.director}</p>
            <p className="text-[10px] text-slate-500 uppercase print:text-[7.5px]">
              Director(a) del Plantel Educativo
            </p>
          </div>
        </div>
      </div>

      {/* Pie de página oficial */}
      <div className="text-center pt-2 text-[9px] text-slate-400 border-t border-slate-200 print:border-slate-400 print:pt-1 print:text-[7.5px] uppercase">
        Documento emitido electrónicamente por el Sistema RUE Primaria MEDUCA &bull; Válido para
        trámites del IFARHU y Traslados Oficiales
      </div>
    </div>
  );
};
