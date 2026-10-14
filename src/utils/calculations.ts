import {
  CalificacionMateria,
  AsistenciaRegistro,
  TRIMESTRES,
  TODAS_MATERIAS,
  SUBMATERIAS_TECNOLOGIA,
  MATERIA_TECNOLOGIA_UNIFICADA,
  ASIGNATURAS_OFICIALES_BOLETIN,
} from '../types';

export interface DesgloseSubmateriaTecnologia {
  nombre: string;
  promedio: number | null;
  notasCount: number;
}

export interface DesgloseTecnologia {
  estudianteId: string;
  trimestre: number;
  submaterias: DesgloseSubmateriaTecnologia[];
  promedioUnificado: number | null;
  evaluadasCount: number;
  totalSubmaterias: number;
  completo: boolean;
}

/**
 * Normaliza nombres de materias para permitir alias como "Tecnología e Informática" -> "Informática"
 */
export function normalizarNombreMateria(materia: string): string {
  if (materia === 'Tecnología e Informática') return 'Informática';
  return materia;
}

/**
 * Obtiene el registro de calificación de una sub-materia o materia considerando alias.
 */
function buscarCalificacion(
  estId: string,
  materia: string,
  trimestre: number,
  calificaciones: CalificacionMateria[],
  annoLectivo: string
): CalificacionMateria | undefined {
  return calificaciones.find((c) => {
    if (c.estudianteId !== estId || c.trimestre !== trimestre || c.annoLectivo !== annoLectivo) {
      return false;
    }
    if (c.materia === materia) return true;
    if (materia === 'Informática' && (c.materia === 'Tecnología e Informática' || c.materia === 'Informatica')) {
      return true;
    }
    if (materia === 'Educación para el Hogar' && (c.materia === 'Educacion para el Hogar' || c.materia === 'Hogar')) {
      return true;
    }
    return false;
  });
}

/**
 * Obtiene el desglose detallado de las 3 áreas del componente Tecnológico:
 * - Educación para el Hogar
 * - Agropecuaria
 * - Informática
 * y calcula su nota unificada de trimestre.
 */
export function obtenerDesgloseTecnologia(
  estId: string,
  trimestre: number,
  calificaciones: CalificacionMateria[],
  annoLectivo: string
): DesgloseTecnologia {
  const desgloseSubmaterias: DesgloseSubmateriaTecnologia[] = SUBMATERIAS_TECNOLOGIA.map((sub) => {
    const cal = buscarCalificacion(estId, sub, trimestre, calificaciones, annoLectivo);
    if (!cal || !cal.notasDiarias || cal.notasDiarias.length === 0) {
      return {
        nombre: sub,
        promedio: null,
        notasCount: 0,
      };
    }
    const suma = cal.notasDiarias.reduce((acc, curr) => acc + curr.valor, 0);
    const prom = Number((suma / cal.notasDiarias.length).toFixed(2));
    return {
      nombre: sub,
      promedio: prom,
      notasCount: cal.notasDiarias.length,
    };
  });

  const promsValidos = desgloseSubmaterias
    .map((s) => s.promedio)
    .filter((p): p is number => p !== null);

  let promedioUnificado: number | null = null;
  if (promsValidos.length > 0) {
    const suma = promsValidos.reduce((acc, val) => acc + val, 0);
    promedioUnificado = Number((suma / promsValidos.length).toFixed(2));
  } else {
    // Si no hay notas en las sub-materias, verificar si existe una calificación directa en "Tecnología"
    const directCal = calificaciones.find(
      (c) =>
        c.estudianteId === estId &&
        c.materia === MATERIA_TECNOLOGIA_UNIFICADA &&
        c.trimestre === trimestre &&
        c.annoLectivo === annoLectivo
    );
    if (directCal && directCal.notasDiarias && directCal.notasDiarias.length > 0) {
      const suma = directCal.notasDiarias.reduce((acc, curr) => acc + curr.valor, 0);
      promedioUnificado = Number((suma / directCal.notasDiarias.length).toFixed(2));
    }
  }

  return {
    estudianteId: estId,
    trimestre,
    submaterias: desgloseSubmaterias,
    promedioUnificado,
    evaluadasCount: promsValidos.length,
    totalSubmaterias: SUBMATERIAS_TECNOLOGIA.length,
    completo: promsValidos.length === SUBMATERIAS_TECNOLOGIA.length,
  };
}

/**
 * Calcula el promedio unificado de Tecnología para un trimestre.
 * Unifica las notas de Educación para el Hogar, Agropecuaria e Informática.
 */
export function calcularPromedioTecnologiaTrimestre(
  estId: string,
  trimestre: number,
  calificaciones: CalificacionMateria[],
  annoLectivo: string
): number | null {
  const desglose = obtenerDesgloseTecnologia(estId, trimestre, calificaciones, annoLectivo);
  return desglose.promedioUnificado;
}

/**
 * Calcula el promedio de una materia en un trimestre específico
 * basado exclusivamente en sus notas diarias (Normativa Primaria MEDUCA).
 * Si la materia es "Tecnología", unifica automáticamente las notas de Hogar, Agropecuaria e Informática.
 */
export function calcularPromedioTrimestre(
  estId: string,
  materia: string,
  trimestre: number,
  calificaciones: CalificacionMateria[],
  annoLectivo: string
): number | null {
  if (materia === 'Tecnología' || materia === MATERIA_TECNOLOGIA_UNIFICADA) {
    return calcularPromedioTecnologiaTrimestre(estId, trimestre, calificaciones, annoLectivo);
  }

  const cal = buscarCalificacion(estId, materia, trimestre, calificaciones, annoLectivo);

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
 * Calcula el promedio general del estudiante en un trimestre dado considerando
 * las 9 asignaturas oficiales de Primaria MEDUCA (donde Tecnología es la unificación de Hogar, Agropecuaria e Informática).
 */
export function calcularPromedioGeneralTrimestre(
  estId: string,
  trimestre: number,
  calificaciones: CalificacionMateria[],
  annoLectivo: string
): number | null {
  const proms = ASIGNATURAS_OFICIALES_BOLETIN.map((m) =>
    calcularPromedioTrimestre(estId, m, trimestre, calificaciones, annoLectivo)
  ).filter((p): p is number => p !== null);

  if (proms.length === 0) return null;
  const suma = proms.reduce((a, b) => a + b, 0);
  return Number((suma / proms.length).toFixed(2));
}

/**
 * Calcula el promedio general anual del estudiante en las asignaturas oficiales de Primaria MEDUCA.
 */
export function calcularPromedioGeneralAnual(
  estId: string,
  calificaciones: CalificacionMateria[],
  annoLectivo: string
): number | null {
  const proms = ASIGNATURAS_OFICIALES_BOLETIN.map((m) =>
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
