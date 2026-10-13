import {
  CalificacionMateria,
  AsistenciaRegistro,
  TRIMESTRES,
  TODAS_MATERIAS,
} from '../types';

/**
 * Calcula el promedio de una materia en un trimestre específico
 * basado exclusivamente en sus notas diarias (Normativa Primaria MEDUCA).
 */
export function calcularPromedioTrimestre(
  estId: string,
  materia: string,
  trimestre: number,
  calificaciones: CalificacionMateria[],
  annoLectivo: string
): number | null {
  const cal = calificaciones.find(
    (c) =>
      c.estudianteId === estId &&
      c.materia === materia &&
      c.trimestre === trimestre &&
      c.annoLectivo === annoLectivo
  );

  if (!cal || !cal.notasDiarias || cal.notasDiarias.length === 0) {
    return null;
  }

  const suma = cal.notasDiarias.reduce((acc, curr) => acc + curr.valor, 0);
  return Number((suma / cal.notasDiarias.length).toFixed(2));
}

/**
 * Calcula el promedio anual de una materia a partir de los trimestres evaluados.
 */
export function calcularPromedioMateriaAnual(
  estId: string,
  materia: string,
  calificaciones: CalificacionMateria[],
  annoLectivo: string
): number | null {
  const promedios = TRIMESTRES.map((t) =>
    calcularPromedioTrimestre(estId, materia, t, calificaciones, annoLectivo)
  ).filter((p): p is number => p !== null);

  if (promedios.length === 0) return null;
  const suma = promedios.reduce((acc, val) => acc + val, 0);
  return Number((suma / promedios.length).toFixed(2));
}

/**
 * Calcula el promedio general del estudiante en un trimestre dado considerando todas las materias evaluadas.
 */
export function calcularPromedioGeneralTrimestre(
  estId: string,
  trimestre: number,
  calificaciones: CalificacionMateria[],
  annoLectivo: string
): number | null {
  const proms = TODAS_MATERIAS.map((m) =>
    calcularPromedioTrimestre(estId, m, trimestre, calificaciones, annoLectivo)
  ).filter((p): p is number => p !== null);

  if (proms.length === 0) return null;
  const suma = proms.reduce((a, b) => a + b, 0);
  return Number((suma / proms.length).toFixed(2));
}

/**
 * Calcula el promedio general anual del estudiante.
 */
export function calcularPromedioGeneralAnual(
  estId: string,
  calificaciones: CalificacionMateria[],
  annoLectivo: string
): number | null {
  const proms = TODAS_MATERIAS.map((m) =>
    calcularPromedioMateriaAnual(estId, m, calificaciones, annoLectivo)
  ).filter((p): p is number => p !== null);

  if (proms.length === 0) return null;
  const suma = proms.reduce((a, b) => a + b, 0);
  return Number((suma / proms.length).toFixed(2));
}

/**
 * Calcula la tasa de asistencia de un estudiante y su estado ante el beneficio PASE-U.
 * Requisito MEDUCA / IFARHU: Asistencia igual o superior al 90%.
 */
export function calcularAsistenciaEstudiante(
  estId: string,
  asistencias: AsistenciaRegistro[],
  annoLectivo: string
) {
  const registros = asistencias.filter(
    (a) => a.estudianteId === estId && a.annoLectivo === annoLectivo
  );

  const total = registros.length;
  if (total === 0) {
    return {
      total: 0,
      presentes: 0,
      ausentes: 0,
      tardanzas: 0,
      justificados: 0,
      porcentaje: 100,
      paseuAprobado: true,
      paseuMensaje: 'Sin registros aún (Cumple por defecto)',
    };
  }

  const presentes = registros.filter((r) => r.estado === 'P').length;
  const ausentes = registros.filter((r) => r.estado === 'A').length;
  const tardanzas = registros.filter((r) => r.estado === 'T').length;
  const justificados = registros.filter((r) => r.estado === 'J').length;

  // En la normativa, tardanzas y justificados cuentan como presencia efectiva para PASE-U escolar
  const asistenciasEfectivas = presentes + tardanzas + justificados;
  const porcentaje = Number(((asistenciasEfectivas / total) * 100).toFixed(1));

  const paseuAprobado = porcentaje >= 90.0;
  const paseuMensaje = paseuAprobado
    ? 'Cumple con el mínimo de 90%'
    : `Alerta: Asistencia en ${porcentaje}% (Menor al 90% requerido)`;

  return {
    total,
    presentes,
    ausentes,
    tardanzas,
    justificados,
    porcentaje,
    paseuAprobado,
    paseuMensaje,
  };
}

/**
 * Formatea una nota numérica con un color o estado.
 */
export function obtenerEstadoNota(nota: number | null): {
  texto: string;
  badgeClass: string;
  aprobado: boolean;
} {
  if (nota === null) {
    return {
      texto: 'Sin evaluar',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
      aprobado: false,
    };
  }
  if (nota >= 3.0) {
    return {
      texto: 'Aprobado',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
      aprobado: true,
    };
  }
  return {
    texto: 'Reprobado',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
    aprobado: false,
  };
}
