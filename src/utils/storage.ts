import {
  Estudiante,
  Docente,
  CalificacionMateria,
  AsistenciaRegistro,
  EscuelaConfig,
  AcudienteUsuario,
  ComunicadoEscolar,
  JustificacionAusencia,
  MATERIAS_CONSEJERO,
  MATERIAS_ESPECIALES,
} from '../types';

export const STORAGE_KEY = 'rue_primaria_meduca_v2';

export interface AppDatabase {
  escuela: EscuelaConfig;
  estudiantes: Estudiante[];
  docentes: Docente[];
  calificaciones: CalificacionMateria[];
  asistencia: AsistenciaRegistro[];
  acudientes: AcudienteUsuario[];
  comunicados: ComunicadoEscolar[];
  justificaciones: JustificacionAusencia[];
  annoLectivo: string;
  trimestreActual: number;
}

export const ESCUELA_INICIAL: EscuelaConfig = {
  nombrePlantel: 'C.E.B.G. Alto Boquete',
  codigoSiace: 'MED-CH-4029',
  regionEducativa: 'Chiriquí — Distrito de Boquete',
  director: 'Prof. Aníbal Castillo Miranda',
  subdirector: 'Profa. Xiomara de Gracia',
  distrito: 'Boquete',
  provincia: 'Chiriquí',
  telefono: '+507 720-1845',
};

export const ESTUDIANTES_INICIALES: Estudiante[] = [
  {
    id: 'est_101',
    nombre: 'Juan David González Morales',
    cedula: '4-821-1402',
    grado: '3°',
    grupo: 'A',
    genero: 'M',
    acudiente: 'Marta Morales de González',
    acudienteId: 'acu_1',
    telefono: '6745-1234',
    annoLectivo: '2026',
    fechaNacimiento: '2017-04-12',
  },
  {
    id: 'est_102',
    nombre: 'Sofía Isabella Valdés Pittí',
    cedula: '4-819-2311',
    grado: '3°',
    grupo: 'A',
    genero: 'F',
    acudiente: 'Roberto Valdés',
    acudienteId: 'acu_2',
    telefono: '6890-5544',
    annoLectivo: '2026',
    fechaNacimiento: '2017-09-28',
  },
  {
    id: 'est_103',
    nombre: 'Carlos Manuel Rodríguez Araúz',
    cedula: '4-825-994',
    grado: '3°',
    grupo: 'A',
    genero: 'M',
    acudiente: 'Elena Araúz de Rodríguez',
    acudienteId: 'acu_3',
    telefono: '6543-9821',
    annoLectivo: '2026',
    fechaNacimiento: '2017-01-15',
  },
  {
    id: 'est_104',
    nombre: 'Valeria Nicole Batista Santos',
    cedula: '4-830-412',
    grado: '3°',
    grupo: 'A',
    genero: 'F',
    acudiente: 'Gabriel Batista',
    acudienteId: 'acu_4',
    telefono: '6612-4433',
    annoLectivo: '2026',
    fechaNacimiento: '2017-11-03',
  },
  {
    id: 'est_105',
    nombre: 'Mateo Alejandro Quintero Ríos',
    cedula: '4-822-1980',
    grado: '3°',
    grupo: 'A',
    genero: 'M',
    acudiente: 'Rosa Ríos de Quintero',
    acudienteId: 'acu_5',
    telefono: '6488-7711',
    annoLectivo: '2026',
    fechaNacimiento: '2017-06-20',
  },
  {
    id: 'est_106',
    nombre: 'Ana Lucía Samudio Vega',
    cedula: '4-828-3011',
    grado: '4°',
    grupo: 'B',
    genero: 'F',
    acudiente: 'Fernando Samudio',
    telefono: '6933-2211',
    annoLectivo: '2026',
    fechaNacimiento: '2016-03-08',
  },
  {
    id: 'est_107',
    nombre: 'Diego Andrés Moreno Chen',
    cedula: '4-817-5509',
    grado: '4°',
    grupo: 'B',
    genero: 'M',
    acudiente: 'Lissette Chen',
    telefono: '6755-8899',
    annoLectivo: '2026',
    fechaNacimiento: '2016-08-19',
  },
  {
    id: 'est_108',
    nombre: 'Camila Victoria Pimentel Lasso',
    cedula: '4-820-7761',
    grado: '1°',
    grupo: 'A',
    genero: 'F',
    acudiente: 'Marta Morales de González',
    acudienteId: 'acu_1',
    telefono: '6745-1234',
    annoLectivo: '2026',
    fechaNacimiento: '2019-02-14',
  },
  {
    id: 'est_109',
    nombre: 'Lucas Gabriel Espinosa Guerra',
    cedula: '4-824-3450',
    grado: '1°',
    grupo: 'A',
    genero: 'M',
    acudiente: 'Héctor Espinosa',
    telefono: '6522-3344',
    annoLectivo: '2026',
    fechaNacimiento: '2019-07-22',
  },
  {
    id: 'est_110',
    nombre: 'Isabella Marie Serracín Bonilla',
    cedula: '4-815-9902',
    grado: '6°',
    grupo: 'A',
    genero: 'F',
    acudiente: 'Claudia Bonilla',
    telefono: '6911-0022',
    annoLectivo: '2026',
    fechaNacimiento: '2014-10-05',
  },
];

export const ACUDIENTES_INICIALES: AcudienteUsuario[] = [
  {
    id: 'acu_1',
    nombre: 'Marta Morales de González',
    cedula: '4-710-1845',
    pin: '1234',
    parentesco: 'Madre',
    telefono: '6745-1234',
    correo: 'marta.morales@correo.pa',
    estudiantesIds: ['est_101', 'est_108'], // 2 hijos en diferentes grados (3° A y 1° A)
  },
  {
    id: 'acu_2',
    nombre: 'Roberto Valdés',
    cedula: '4-688-293',
    pin: '1234',
    parentesco: 'Padre',
    telefono: '6890-5544',
    correo: 'roberto.valdes@correo.pa',
    estudiantesIds: ['est_102'], // Sofía Valdés
  },
  {
    id: 'acu_3',
    nombre: 'Elena Araúz de Rodríguez',
    cedula: '4-702-881',
    pin: '1234',
    parentesco: 'Madre',
    telefono: '6543-9821',
    correo: 'elena.arauz@correo.pa',
    estudiantesIds: ['est_103'], // Carlos Rodríguez (estudiante en riesgo)
  },
  {
    id: 'acu_4',
    nombre: 'Gabriel Batista',
    cedula: '4-733-119',
    pin: '1234',
    parentesco: 'Padre',
    telefono: '6612-4433',
    estudiantesIds: ['est_104'], // Valeria Batista
  },
  {
    id: 'acu_5',
    nombre: 'Rosa Ríos de Quintero',
    cedula: '4-690-334',
    pin: '1234',
    parentesco: 'Madre',
    telefono: '6488-7711',
    estudiantesIds: ['est_105'], // Mateo Quintero
  },
];

export const COMUNICADOS_INICIALES: ComunicadoEscolar[] = [
  {
    id: 'com_1',
    titulo: 'Convocatoria: Primera Entrega Oficial de Boletines del I Trimestre',
    contenido:
      'Estimados padres de familia y acudientes: Se les convoca formalmente a la reunión presencial de entrega de boletines y evaluación diagnóstica de progreso del primer trimestre. La cita será este viernes a las 8:00 a.m. en el aula de consejería correspondiente.',
    fecha: '2026-04-14',
    prioridad: 'urgente',
    categoria: 'reunion',
    destinatarios: 'todos',
    remitente: 'Dirección del Plantel — Prof. Aníbal Castillo',
    leidoPor: ['acu_1'],
  },
  {
    id: 'com_2',
    titulo: 'Aviso del IFARHU: Cumplimiento de Asistencia Mínima (90%) para el PASE-U',
    contenido:
      'Recordamos a todos los acudientes que para el segundo desembolso del PASE-U / Beca Digital, el IFARHU y MEDUCA auditan un mínimo estricto del 90% de asistencia presencial. Favor justificar oportunamente con certificado médico cualquier ausencia de su acudido.',
    fecha: '2026-04-10',
    prioridad: 'importante',
    categoria: 'paseu',
    destinatarios: 'todos',
    remitente: 'Comisión de Bienestar Estudiantil y PASE-U',
    leidoPor: [],
  },
  {
    id: 'com_3',
    titulo: 'Feria Científica y Ecológica 2026 — Presentación de Maquetas',
    contenido:
      'A los acudientes de 3° Grado: Los estudiantes presentarán sus proyectos del ciclo del agua y biodiversidad el próximo martes. Agradecemos su apoyo en la preparación de materiales reciclados.',
    fecha: '2026-04-06',
    prioridad: 'informativo',
    categoria: 'academico',
    destinatarios: '3°',
    remitente: 'Profa. Carmen Samudio — Consejería 3° A',
    leidoPor: ['acu_1', 'acu_2'],
  },
  {
    id: 'com_4',
    titulo: 'Jornada Nacional de Vacunación Escolar MINSA',
    contenido:
      'Personal de salud del MINSA visitará el plantel para aplicar refuerzos de esquemas de vacunación. Es indispensable que los estudiantes porten su tarjeta de vacunas actualizada.',
    fecha: '2026-04-02',
    prioridad: 'informativo',
    categoria: 'evento',
    destinatarios: 'todos',
    remitente: 'Enfermería y Dirección Escolar',
    leidoPor: [],
  },
];

export const JUSTIFICACIONES_INICIALES: JustificacionAusencia[] = [
  {
    id: 'just_1',
    estudianteId: 'est_103',
    acudienteId: 'acu_3',
    fechaAusencia: '2026-04-08',
    motivo: 'Cita médica odontológica en la policlínica de Boquete.',
    fechaEnvio: '2026-04-09',
    estado: 'aprobada',
    observacionDocente: 'Justificante validado y registrado en el sistema.',
  },
];

export const DOCENTES_INICIALES: Docente[] = [
  {
    id: 'doc_201',
    nombre: 'Profa. Carmen Samudio de Morales',
    cedula: '4-189-423',
    tipo: 'consejero',
    materias: [...MATERIAS_CONSEJERO],
    gradoTutor: '3°',
    grupoTutor: 'A',
    telefono: '6700-1122',
  },
  {
    id: 'doc_202',
    nombre: 'Prof. Aníbal Castillo Miranda',
    cedula: '4-150-891',
    tipo: 'consejero',
    materias: [...MATERIAS_CONSEJERO],
    gradoTutor: '4°',
    grupoTutor: 'B',
    telefono: '6655-4433',
  },
  {
    id: 'doc_203',
    nombre: 'Teacher Kevin Montezuma',
    cedula: '4-722-1044',
    tipo: 'especial',
    materias: ['Inglés'],
    telefono: '6811-9922',
  },
  {
    id: 'doc_204',
    nombre: 'Prof. Javier Atencio Cárdenas',
    cedula: '4-233-891',
    tipo: 'especial',
    materias: ['Educación Física', 'Agropecuaria'],
    telefono: '6599-3388',
  },
  {
    id: 'doc_205',
    nombre: 'Profa. Mayra Montenegro',
    cedula: '4-210-544',
    tipo: 'especial',
    materias: ['Educación para el Hogar', 'Tecnología e Informática'],
    telefono: '6733-4411',
  },
];

export const CALIFICACIONES_INICIALES: CalificacionMateria[] = [
  // Juan David González (3° A)
  {
    id: 'cal_01',
    estudianteId: 'est_101',
    materia: 'Matemáticas',
    trimestre: 1,
    annoLectivo: '2026',
    notasDiarias: [
      { id: 'nd_1', fecha: '2026-03-10', valor: 4.8, desc: 'Trabajo en clase', observacion: 'Tablas de multiplicar' },
      { id: 'nd_2', fecha: '2026-03-18', valor: 4.5, desc: 'Tarea en casa', observacion: 'Resolución de problemas' },
      { id: 'nd_3', fecha: '2026-03-25', valor: 5.0, desc: 'Prueba sumativa', observacion: 'Operaciones básicas' },
      { id: 'nd_4', fecha: '2026-04-05', valor: 4.7, desc: 'Revisión de cuaderno', observacion: 'Excelente orden' },
    ],
  },
  {
    id: 'cal_02',
    estudianteId: 'est_101',
    materia: 'Español',
    trimestre: 1,
    annoLectivo: '2026',
    notasDiarias: [
      { id: 'nd_5', fecha: '2026-03-12', valor: 4.6, desc: 'Lectura comprensiva', observacion: 'Fluidez y entonación' },
      { id: 'nd_6', fecha: '2026-03-22', valor: 4.9, desc: 'Dictado y caligrafía', observacion: 'Sin faltas ortográficas' },
      { id: 'nd_7', fecha: '2026-04-02', valor: 4.7, desc: 'Trabajo en clase', observacion: 'Sustantivos y adjetivos' },
    ],
  },
  {
    id: 'cal_03',
    estudianteId: 'est_101',
    materia: 'Ciencias Naturales',
    trimestre: 1,
    annoLectivo: '2026',
    notasDiarias: [
      { id: 'nd_8', fecha: '2026-03-15', valor: 5.0, desc: 'Proyecto formativo', observacion: 'Maqueta del ciclo del agua' },
      { id: 'nd_9', fecha: '2026-03-29', valor: 4.5, desc: 'Trabajo en clase', observacion: 'Los seres vivos' },
    ],
  },
  {
    id: 'cal_04',
    estudianteId: 'est_101',
    materia: 'Inglés',
    trimestre: 1,
    annoLectivo: '2026',
    notasDiarias: [
      { id: 'nd_10', fecha: '2026-03-14', valor: 4.8, desc: 'Participación activa', observacion: 'Greetings & vocabulary' },
      { id: 'nd_11', fecha: '2026-03-28', valor: 4.6, desc: 'Tarea en casa', observacion: 'Numbers and colors' },
    ],
  },
  // Sofía Valdés (3° A)
  {
    id: 'cal_05',
    estudianteId: 'est_102',
    materia: 'Matemáticas',
    trimestre: 1,
    annoLectivo: '2026',
    notasDiarias: [
      { id: 'nd_12', fecha: '2026-03-10', valor: 5.0, desc: 'Trabajo en clase' },
      { id: 'nd_13', fecha: '2026-03-18', valor: 4.9, desc: 'Tarea en casa' },
      { id: 'nd_14', fecha: '2026-03-25', valor: 5.0, desc: 'Prueba sumativa' },
    ],
  },
  {
    id: 'cal_06',
    estudianteId: 'est_102',
    materia: 'Español',
    trimestre: 1,
    annoLectivo: '2026',
    notasDiarias: [
      { id: 'nd_15', fecha: '2026-03-12', valor: 5.0, desc: 'Lectura comprensiva' },
      { id: 'nd_16', fecha: '2026-03-22', valor: 4.8, desc: 'Dictado y caligrafía' },
    ],
  },
  // Carlos Rodríguez (3° A - en riesgo)
  {
    id: 'cal_07',
    estudianteId: 'est_103',
    materia: 'Matemáticas',
    trimestre: 1,
    annoLectivo: '2026',
    notasDiarias: [
      { id: 'nd_17', fecha: '2026-03-10', valor: 2.8, desc: 'Trabajo en clase', observacion: 'Dificultad en restas' },
      { id: 'nd_18', fecha: '2026-03-18', valor: 2.5, desc: 'Tarea en casa', observacion: 'Incompleta' },
      { id: 'nd_19', fecha: '2026-03-25', valor: 3.1, desc: 'Prueba sumativa', observacion: 'Repaso individual' },
    ],
  },
  {
    id: 'cal_08',
    estudianteId: 'est_103',
    materia: 'Español',
    trimestre: 1,
    annoLectivo: '2026',
    notasDiarias: [
      { id: 'nd_20', fecha: '2026-03-12', valor: 3.2, desc: 'Lectura comprensiva' },
      { id: 'nd_21', fecha: '2026-03-22', valor: 2.9, desc: 'Dictado y caligrafía' },
    ],
  },
];

// Generar registros de asistencia iniciales para el grado 3° A
export function generarAsistenciaInicial(): AsistenciaRegistro[] {
  const fechas = ['2026-04-06', '2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10'];
  const estudiantes3A = ['est_101', 'est_102', 'est_103', 'est_104', 'est_105'];
  const registros: AsistenciaRegistro[] = [];

  fechas.forEach((fecha, fIdx) => {
    estudiantes3A.forEach((estId, eIdx) => {
      let estado: 'P' | 'A' | 'T' | 'J' = 'P';
      // Simular ausencias realistas
      if (estId === 'est_103' && fIdx === 2) estado = 'A'; // Carlos faltó un día
      if (estId === 'est_103' && fIdx === 3) estado = 'A'; // Carlos faltó otro día (riesgo PASE-U)
      if (estId === 'est_104' && fIdx === 1) estado = 'T'; // Valeria tardanza
      if (estId === 'est_105' && fIdx === 4) estado = 'J'; // Mateo justificado

      registros.push({
        id: `asis_${fecha}_${estId}`,
        estudianteId: estId,
        fecha,
        estado,
        annoLectivo: '2026',
        timestamp: Date.now() - (fechas.length - fIdx) * 86400000,
      });
    });
  });

  return registros;
}

export function cargarBaseDeDatos(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.estudiantes && parsed.docentes) {
        return {
          ...parsed,
          acudientes: parsed.acudientes && parsed.acudientes.length > 0 ? parsed.acudientes : ACUDIENTES_INICIALES,
          comunicados: parsed.comunicados && parsed.comunicados.length > 0 ? parsed.comunicados : COMUNICADOS_INICIALES,
          justificaciones: parsed.justificaciones ? parsed.justificaciones : JUSTIFICACIONES_INICIALES,
        };
      }
    }
  } catch (err) {
    console.error('Error leyendo base de datos local:', err);
  }

  // Si no existe, crear inicial
  const inicial: AppDatabase = {
    escuela: ESCUELA_INICIAL,
    estudiantes: ESTUDIANTES_INICIALES,
    docentes: DOCENTES_INICIALES,
    calificaciones: CALIFICACIONES_INICIALES,
    asistencia: generarAsistenciaInicial(),
    acudientes: ACUDIENTES_INICIALES,
    comunicados: COMUNICADOS_INICIALES,
    justificaciones: JUSTIFICACIONES_INICIALES,
    annoLectivo: '2026',
    trimestreActual: 1,
  };
  guardarBaseDeDatos(inicial);
  return inicial;
}

export function guardarBaseDeDatos(db: AppDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Error guardando base de datos:', err);
  }
}

export function reiniciarBaseDeDatos(): AppDatabase {
  const resetDb: AppDatabase = {
    escuela: ESCUELA_INICIAL,
    estudiantes: ESTUDIANTES_INICIALES,
    docentes: DOCENTES_INICIALES,
    calificaciones: CALIFICACIONES_INICIALES,
    asistencia: generarAsistenciaInicial(),
    acudientes: ACUDIENTES_INICIALES,
    comunicados: COMUNICADOS_INICIALES,
    justificaciones: JUSTIFICACIONES_INICIALES,
    annoLectivo: '2026',
    trimestreActual: 1,
  };
  guardarBaseDeDatos(resetDb);
  return resetDb;
}
