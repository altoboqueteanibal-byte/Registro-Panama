export interface NotaDiaria {
  id: string;
  fecha: string;
  valor: number; // 1.0 to 5.0
  desc: string; // 'Trabajo en clase', 'Tarea en casa', 'Participación', etc.
  observacion?: string;
}

export interface CalificacionMateria {
  id: string;
  estudianteId: string;
  materia: string;
  trimestre: number; // 1, 2, 3
  annoLectivo: string;
  notasDiarias: NotaDiaria[];
}

export interface AcudienteUsuario {
  id: string;
  nombre: string;
  cedula: string; // Utilizada para inicio de sesión
  pin: string; // Clave de acceso numérico / contraseña
  parentesco: 'Madre' | 'Padre' | 'Tutor Legal' | 'Abuelo/a' | 'Familiar';
  telefono: string;
  correo?: string;
  estudiantesIds: string[]; // IDs de sus hijos vinculados (restringido estrictamente a ellos)
}

export interface ComunicadoEscolar {
  id: string;
  titulo: string;
  contenido: string;
  fecha: string; // YYYY-MM-DD
  prioridad: 'urgente' | 'importante' | 'informativo';
  categoria: 'academico' | 'paseu' | 'reunion' | 'evento' | 'general';
  destinatarios: 'todos' | string; // 'todos' o grado como '3°' o estudianteId
  remitente: string;
  leidoPor: string[]; // Lista de IDs de acudientes que confirmaron lectura
}

export interface JustificacionAusencia {
  id: string;
  estudianteId: string;
  acudienteId: string;
  fechaAusencia: string;
  motivo: string;
  fechaEnvio: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  observacionDocente?: string;
}

export interface Estudiante {
  id: string;
  nombre: string;
  cedula: string;
  grado: string; // '1°' to '6°'
  grupo: string; // 'A', 'B', 'C', 'D'
  genero: 'M' | 'F';
  acudiente: string;
  acudienteId?: string;
  telefono: string;
  annoLectivo: string;
  fechaNacimiento?: string;
}

export interface GrupoAsignado {
  grado: string; // '1°' to '6°'
  grupo: string; // 'A', 'B', 'C', 'D'
}

export interface Docente {
  id: string;
  nombre: string;
  cedula: string;
  correo: string; // Correo institucional registrado (@meduca.edu.pa)
  pin: string; // PIN de acceso
  tipo: 'consejero' | 'especial';
  materias: string[];
  // Para maestro consejero (1 grupo específico):
  gradoTutor?: string;
  grupoTutor?: string;
  // Para docentes especiales (acceso a múltiples grupos):
  gruposAsignados?: GrupoAsignado[];
  telefono?: string;
}

export interface AsistenciaRegistro {
  id: string;
  estudianteId: string;
  fecha: string; // YYYY-MM-DD
  estado: 'P' | 'A' | 'T' | 'J'; // Presente, Ausente, Tardanza, Justificado
  annoLectivo: string;
  timestamp: number;
}

export interface EscuelaConfig {
  nombrePlantel: string;
  codigoSiace: string;
  regionEducativa: string;
  director: string;
  subdirector?: string;
  distrito: string;
  provincia: string;
  telefono: string;
}

export const MATERIAS_CONSEJERO = [
  'Español',
  'Matemáticas',
  'Ciencias Sociales',
  'Ciencias Naturales',
  'Expresiones Artísticas',
  'Religión, Moral y Valores',
] as const;

// Sub-áreas evaluadas individualmente por los docentes especiales (Componentes del Área Tecnológica MEDUCA)
export const SUBMATERIAS_TECNOLOGIA = [
  'Educación para el Hogar',
  'Agropecuaria',
  'Informática',
] as const;

export type SubmateriaTecnologia = (typeof SUBMATERIAS_TECNOLOGIA)[number];

// Materia oficial unificada en el boletín y cuadro de calificaciones
export const MATERIA_TECNOLOGIA_UNIFICADA = 'Tecnología';

export const MATERIAS_ESPECIALES = [
  'Inglés',
  'Educación Física',
  'Educación para el Hogar',
  'Agropecuaria',
  'Informática',
  'Tecnología',
] as const;

// 9 Asignaturas oficiales del plan de estudios de Primaria MEDUCA para el Boletín y GPA
export const ASIGNATURAS_OFICIALES_BOLETIN = [
  ...MATERIAS_CONSEJERO,
  'Inglés',
  'Educación Física',
  'Tecnología',
] as const;

export const TODAS_MATERIAS = [
  ...MATERIAS_CONSEJERO,
  'Inglés',
  'Educación Física',
  'Educación para el Hogar',
  'Agropecuaria',
  'Informática',
  'Tecnología',
] as const;

export const GRADOS = ['1°', '2°', '3°', '4°', '5°', '6°'] as const;
export const GRUPOS = ['A', 'B', 'C', 'D'] as const;
export const TRIMESTRES = [1, 2, 3] as const;

export const TIPOS_NOTA = [
  'Trabajo en clase',
  'Tarea en casa',
  'Participación activa',
  'Revisión de cuaderno',
  'Proyecto formativo',
  'Exposición oral',
  'Lectura comprensiva',
  'Dictado y caligrafía',
  'Prueba sumativa',
  'Laboratorio / Taller',
  'Comportamiento y valores',
  'Otro',
] as const;

export const ESTADOS_ASISTENCIA: Record<
  'P' | 'A' | 'T' | 'J',
  { label: string; color: string; badgeClass: string; bgClass: string }
> = {
  P: {
    label: 'Presente',
    color: '#16a34a',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bgClass: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  A: {
    label: 'Ausente',
    color: '#dc2626',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    bgClass: 'bg-rose-600 text-white hover:bg-rose-700',
  },
  T: {
    label: 'Tardanza',
    color: '#d97706',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    bgClass: 'bg-amber-500 text-slate-900 hover:bg-amber-600',
  },
  J: {
    label: 'Justificado',
    color: '#0284c7',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    bgClass: 'bg-sky-600 text-white hover:bg-sky-700',
  },
};
