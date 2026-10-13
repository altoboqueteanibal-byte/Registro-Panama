import React from 'react';
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  CalendarCheck,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { AppDatabase } from '../utils/storage';
import {
  calcularPromedioTrimestre,
  calcularPromedioGeneralTrimestre,
  calcularAsistenciaEstudiante,
} from '../utils/calculations';
import { TODAS_MATERIAS } from '../types';
import { ViewType } from './Navbar';

interface DashboardViewProps {
  db: AppDatabase;
  onNavigate: (view: ViewType) => void;
  onSelectEstudianteParaBoletin: (estId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  db,
  onNavigate,
  onSelectEstudianteParaBoletin,
}) => {
  const { estudiantes, docentes, calificaciones, asistencia, trimestreActual, annoLectivo } = db;

  // Calculos generales
  const totalEstudiantes = estudiantes.length;
  const totalDocentes = docentes.length;
  const totalNotas = calificaciones.reduce(
    (acc, c) => acc + (c.notasDiarias ? c.notasDiarias.length : 0),
    0
  );

  // Tasa de aprobación global en el trimestre actual
  let totalEvaluaciones = 0;
  let evaluacionesAprobadas = 0;

  estudiantes.forEach((est) => {
    TODAS_MATERIAS.forEach((mat) => {
      const prom = calcularPromedioTrimestre(
        est.id,
        mat,
        trimestreActual,
        calificaciones,
        annoLectivo
      );
      if (prom !== null) {
        totalEvaluaciones++;
        if (prom >= 3.0) {
          evaluacionesAprobadas++;
        }
      }
    });
  });

  const tasaAprobacion =
    totalEvaluaciones > 0
      ? Number(((evaluacionesAprobadas / totalEvaluaciones) * 100).toFixed(1))
      : 100;

  // Estudiantes con cumplimiento PASE-U (≥ 90%)
  const estudiantesPaseuCumple = estudiantes.filter((est) => {
    const asis = calcularAsistenciaEstudiante(est.id, asistencia, annoLectivo);
    return asis.paseuAprobado;
  });
  const porcentajePaseuCumplimiento =
    totalEstudiantes > 0
      ? Math.round((estudiantesPaseuCumple.length / totalEstudiantes) * 100)
      : 100;

  // Estudiantes en riesgo académico (promedio general < 3.0 en el trimestre actual)
  const estudiantesEnRiesgo = estudiantes
    .map((est) => {
      const prom = calcularPromedioGeneralTrimestre(
        est.id,
        trimestreActual,
        calificaciones,
        annoLectivo
      );
      return { est, prom };
    })
    .filter((item) => item.prom !== null && item.prom < 3.0);

  // Estudiantes en riesgo de asistencia PASE-U (< 90%)
  const estudiantesRiesgoAsistencia = estudiantes
    .map((est) => {
      const asis = calcularAsistenciaEstudiante(est.id, asistencia, annoLectivo);
      return { est, asis };
    })
    .filter((item) => item.asis.total > 0 && !item.asis.paseuAprobado);

  // Cuadro de honor (promedio general >= 4.5)
  const cuadroHonor = estudiantes
    .map((est) => {
      const prom = calcularPromedioGeneralTrimestre(
        est.id,
        trimestreActual,
        calificaciones,
        annoLectivo
      );
      return { est, prom };
    })
    .filter((item): item is { est: typeof estudiantes[0]; prom: number } => item.prom !== null && item.prom >= 4.5)
    .sort((a, b) => b.prom - a.prom);

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Normativa MEDUCA */}
      <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#002244] text-white p-5 rounded-2xl shadow-sm border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FFC107] text-slate-900 font-extrabold text-[11px] px-2 py-0.5 rounded tracking-wide uppercase">
              Año Escolar {annoLectivo}
            </span>
            <span className="text-blue-200 text-xs font-medium">
              Trimestre {trimestreActual} en curso
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Panel de Gestión Escolar — Nivel Primaria
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mt-1">
            Sistema alineado al currículo del Ministerio de Educación (MEDUCA):
            evaluación de notas diarias continuas (1.0 a 5.0) y seguimiento de asistencia para la Beca Digital PASE-U.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => onNavigate('asistencia')}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#FFC107] hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Pasar Lista</span>
          </button>
          <button
            onClick={() => onNavigate('notas')}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition border border-white/15"
          >
            <ClipboardCheck className="w-4 h-4 text-blue-200" />
            <span>Registrar Notas</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Estudiantes */}
        <div
          onClick={() => onNavigate('estudiantes')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Estudiantes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003366] flex items-center justify-center group-hover:bg-[#003366] group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{totalEstudiantes}</p>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
            Matriculados en 1° a 6°
          </span>
        </div>

        {/* Docentes */}
        <div
          onClick={() => onNavigate('docentes')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Docentes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{totalDocentes}</p>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
            Consejeros y Especiales
          </span>
        </div>

        {/* Notas Diarias */}
        <div
          onClick={() => onNavigate('notas')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Notas Diarias</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{totalNotas}</p>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
            Evaluaciones sumativas y formativas
          </span>
        </div>

        {/* Tasa Aprobación */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Aprobación (T{trimestreActual})</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${tasaAprobacion >= 80 ? 'text-emerald-700' : 'text-amber-600'}`}>
            {tasaAprobacion}%
          </p>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
            Mínimo aprobatorio: 3.0
          </span>
        </div>

        {/* Asistencia PASE-U */}
        <div
          onClick={() => onNavigate('asistencia')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition cursor-pointer group col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Control PASE-U</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#003366] mt-2">
            {porcentajePaseuCumplimiento}%
          </p>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
            Alumnos con ≥ 90% asistencia
          </span>
        </div>
      </div>

      {/* Grid de Alertas y Cuadro de Honor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cuadro de Honor */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Cuadro de Honor (≥ 4.5)</h3>
            </div>
            <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
              {cuadroHonor.length} estudiantes
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {cuadroHonor.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                Aún no hay estudiantes con promedio superior a 4.5 en este trimestre.
              </p>
            ) : (
              cuadroHonor.slice(0, 5).map((item, idx) => (
                <div
                  key={item.est.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 transition border border-slate-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full text-xs font-black flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-900 shadow-xs'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {item.est.nombre}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {item.est.grado} {item.est.grupo} &bull; Cédula: {item.est.cedula}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-[#003366] bg-blue-100/70 px-2 py-0.5 rounded">
                      {item.prom.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alerta Académica: Estudiantes en Riesgo (< 3.0) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Alerta Académica (&lt; 3.0)</h3>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              estudiantesEnRiesgo.length > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {estudiantesEnRiesgo.length} en riesgo
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {estudiantesEnRiesgo.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-6 text-center">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mb-1" />
                <p className="text-xs text-slate-500 font-medium">
                  Excelente: Ningún estudiante presenta promedio reprobatorio en este trimestre.
                </p>
              </div>
            ) : (
              estudiantesEnRiesgo.map((item) => (
                <div
                  key={item.est.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/60 border border-rose-100"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {item.est.nombre}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {item.est.grado} {item.est.grupo} &bull; Acudiente: {item.est.acudiente}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      {item.prom?.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alerta Asistencia PASE-U (< 90%) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Alerta Beca PASE-U</h3>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              estudiantesRiesgoAsistencia.length > 0
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {estudiantesRiesgoAsistencia.length} en observación
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {estudiantesRiesgoAsistencia.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-6 text-center">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mb-1" />
                <p className="text-xs text-slate-500 font-medium">
                  Todos los estudiantes evaluados cumplen con el 90% mínimo de asistencia exigido por MEDUCA e IFARHU.
                </p>
              </div>
            ) : (
              estudiantesRiesgoAsistencia.map((item) => (
                <div
                  key={item.est.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/70 border border-amber-200"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {item.est.nombre}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {item.est.grado} {item.est.grupo} &bull; {item.asis.ausentes} ausencias ({item.asis.porcentaje}%)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                      Riesgo PASE-U
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Rendimiento por Asignatura del Trimestre */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#003366]" />
              Promedios y Rendimiento por Materia (Trimestre {trimestreActual})
            </h3>
            <p className="text-xs text-slate-500">
              Evaluación diagnóstica basada en las notas diarias registradas en el período.
            </p>
          </div>
          <button
            onClick={() => onNavigate('notas')}
            className="text-xs font-bold text-[#003366] hover:text-blue-800 flex items-center gap-1"
          >
            <span>Ver Planilla Completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Asignatura</th>
                <th className="py-2.5 px-3">Tipo Docente</th>
                <th className="py-2.5 px-3 text-center">Alumnos Evaluados</th>
                <th className="py-2.5 px-3 text-center">Promedio General</th>
                <th className="py-2.5 px-3 text-center">Aprobados (≥ 3.0)</th>
                <th className="py-2.5 px-3 text-center">Reprobados (&lt; 3.0)</th>
                <th className="py-2.5 px-3 text-center">% Aprobación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TODAS_MATERIAS.map((materia) => {
                const proms: number[] = [];
                estudiantes.forEach((e) => {
                  const p = calcularPromedioTrimestre(
                    e.id,
                    materia,
                    trimestreActual,
                    calificaciones,
                    annoLectivo
                  );
                  if (p !== null) proms.push(p);
                });

                const totalEvaluados = proms.length;
                const promGeneral =
                  totalEvaluados > 0
                    ? Number((proms.reduce((a, b) => a + b, 0) / totalEvaluados).toFixed(2))
                    : null;
                const aprobados = proms.filter((p) => p >= 3.0).length;
                const reprobados = totalEvaluados - aprobados;
                const pct =
                  totalEvaluados > 0 ? Math.round((aprobados / totalEvaluados) * 100) : null;

                const esConsejero = [
                  'Español',
                  'Matemáticas',
                  'Ciencias Sociales',
                  'Ciencias Naturales',
                  'Expresiones Artísticas',
                  'Religión, Moral y Valores',
                ].includes(materia);

                return (
                  <tr key={materia} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {materia}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          esConsejero
                            ? 'bg-blue-50 text-[#003366] border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {esConsejero ? 'Maestro Consejero' : 'Docente Especial'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600">
                      {totalEvaluados}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {promGeneral !== null ? (
                        <span
                          className={`font-black px-2 py-0.5 rounded text-xs ${
                            promGeneral >= 3.0
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {promGeneral.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Sin datos</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-emerald-700">
                      {totalEvaluados > 0 ? aprobados : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-rose-600">
                      {totalEvaluados > 0 ? reprobados : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      {pct !== null ? (
                        <span className={pct >= 80 ? 'text-emerald-700' : 'text-amber-700'}>
                          {pct}%
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información del Sistema Escolar MEDUCA */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#003366] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-800">
            Reglamentación de Evaluación en Educación Primaria — MEDUCA
          </p>
          <p>
            1. <strong>Notas Diarias:</strong> Las calificaciones de los tres trimestres se obtienen del promedio de las actividades diarias (tareas, proyectos, cuadernos, participación y pruebas formativas/sumativas).
          </p>
          <p>
            2. <strong>Escala Numérica:</strong> De 1.0 (mínima) a 5.0 (máxima). El puntaje mínimo para aprobar es de <strong>3.0</strong>.
          </p>
          <p>
            3. <strong>Beca Digital / PASE-U:</strong> Para mantener el beneficio económico del IFARHU, el estudiante debe registrar una asistencia no menor al <strong>90%</strong> y no reprobar asignaturas.
          </p>
        </div>
      </div>
    </div>
  );
};
