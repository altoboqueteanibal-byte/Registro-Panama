import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Trash2,
  Calendar,
  Award,
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
  BookOpen,
  X,
  Layers,
  Cpu,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  GRADOS,
  GRUPOS,
  TRIMESTRES,
  TODAS_MATERIAS,
  TIPOS_NOTA,
  CalificacionMateria,
  NotaDiaria,
  Docente,
  GrupoAsignado,
  SUBMATERIAS_TECNOLOGIA,
  MATERIA_TECNOLOGIA_UNIFICADA,
} from '../types';
import { AppDatabase } from '../utils/storage';
import {
  calcularPromedioTrimestre,
  obtenerDesgloseTecnologia,
} from '../utils/calculations';

interface NotasViewProps {
  db: AppDatabase;
  onUpdateDb: (db: AppDatabase) => void;
  onShowToast: (msg: string) => void;
  docenteActivo?: Docente | null;
  grupoActivoDocente?: GrupoAsignado;
  onSelectGrupoActivoDocente?: (grupo: GrupoAsignado) => void;
}

export const NotasView: React.FC<NotasViewProps> = ({
  db,
  onUpdateDb,
  onShowToast,
  docenteActivo = null,
  grupoActivoDocente,
  onSelectGrupoActivoDocente,
}) => {
  // Grupos permitidos según el docente autenticado
  const esConsejero = docenteActivo?.tipo === 'consejero';
  const esEspecial = docenteActivo?.tipo === 'especial';

  const gruposPermitidos: GrupoAsignado[] = docenteActivo
    ? esConsejero
      ? [{ grado: docenteActivo.gradoTutor || '3°', grupo: docenteActivo.grupoTutor || 'A' }]
      : docenteActivo.gruposAsignados && docenteActivo.gruposAsignados.length > 0
      ? docenteActivo.gruposAsignados
      : [{ grado: '1°', grupo: 'A' }]
    : [];

  const materiasPermitidas: string[] = docenteActivo
    ? Array.from(new Set([...docenteActivo.materias, 'Tecnología']))
    : [...TODAS_MATERIAS];

  const defaultGrado = docenteActivo
    ? esConsejero
      ? docenteActivo.gradoTutor || '3°'
      : grupoActivoDocente?.grado || gruposPermitidos[0]?.grado || '1°'
    : '3°';

  const defaultGrupo = docenteActivo
    ? esConsejero
      ? docenteActivo.grupoTutor || 'A'
      : grupoActivoDocente?.grupo || gruposPermitidos[0]?.grupo || 'A'
    : 'A';

  const defaultMateria = docenteActivo
    ? materiasPermitidas[0] || 'Español'
    : 'Matemáticas';

  const [gradoSeleccionado, setGradoSeleccionado] = useState<string>(defaultGrado);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>(defaultGrupo);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string>(defaultMateria);
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState<number>(
    db.trimestreActual
  );

  // Sincronizar si cambia grupoActivoDocente externamente
  React.useEffect(() => {
    if (docenteActivo) {
      if (esConsejero && docenteActivo.gradoTutor && docenteActivo.grupoTutor) {
        setGradoSeleccionado(docenteActivo.gradoTutor);
        setGrupoSeleccionado(docenteActivo.grupoTutor);
      } else if (esEspecial && grupoActivoDocente) {
        setGradoSeleccionado(grupoActivoDocente.grado);
        setGrupoSeleccionado(grupoActivoDocente.grupo);
      }
      if (!materiasPermitidas.includes(materiaSeleccionada)) {
        setMateriaSeleccionada(materiasPermitidas[0] || 'Inglés');
      }
    }
  }, [docenteActivo, grupoActivoDocente]);

  // Modal / Drawer de notas diarias para un estudiante
  const [estudianteIdDetalle, setEstudianteIdDetalle] = useState<string | null>(null);

  // Formulario de nueva nota diaria
  const [nuevaNotaFecha, setNuevaNotaFecha] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [nuevaNotaValor, setNuevaNotaValor] = useState<string>('4.5');
  const [nuevaNotaTipo, setNuevaNotaTipo] = useState<string>(TIPOS_NOTA[0]);
  const [nuevaNotaObservacion, setNuevaNotaObservacion] = useState<string>('');

  // Estudiantes filtrados
  const estudiantesFiltrados = db.estudiantes.filter(
    (e) => e.grado === gradoSeleccionado && e.grupo === grupoSeleccionado
  );

  // Estudiante en detalle
  const estudianteEnDetalle = db.estudiantes.find((e) => e.id === estudianteIdDetalle);

  // Registro de calificación para este estudiante/materia/trimestre
  const calificacionEstudiante = db.calificaciones.find(
    (c) =>
      c.estudianteId === estudianteIdDetalle &&
      c.materia === materiaSeleccionada &&
      c.trimestre === trimestreSeleccionado &&
      c.annoLectivo === db.annoLectivo
  );

  const notasDiariasEstudiante = calificacionEstudiante?.notasDiarias || [];

  const promedioDetalle = estudianteIdDetalle
    ? calcularPromedioTrimestre(
        estudianteIdDetalle,
        materiaSeleccionada,
        trimestreSeleccionado,
        db.calificaciones,
        db.annoLectivo
      )
    : null;

  // Agregar nueva nota diaria
  const handleAgregarNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudianteIdDetalle) return;

    const valorNum = parseFloat(nuevaNotaValor);
    if (isNaN(valorNum) || valorNum < 1.0 || valorNum > 5.0) {
      onShowToast('⚠️ La calificación debe estar en la escala de 1.0 a 5.0');
      return;
    }

    const nuevaNota: NotaDiaria = {
      id: 'nd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      fecha: nuevaNotaFecha,
      valor: Number(valorNum.toFixed(1)),
      desc: nuevaNotaTipo,
      observacion: nuevaNotaObservacion.trim() || undefined,
    };

    let calExistente = db.calificaciones.find(
      (c) =>
        c.estudianteId === estudianteIdDetalle &&
        c.materia === materiaSeleccionada &&
        c.trimestre === trimestreSeleccionado &&
        c.annoLectivo === db.annoLectivo
    );

    let nuevasCalificaciones: CalificacionMateria[];

    if (calExistente) {
      nuevasCalificaciones = db.calificaciones.map((c) =>
        c.id === calExistente!.id
          ? { ...c, notasDiarias: [...c.notasDiarias, nuevaNota] }
          : c
      );
    } else {
      const nuevaCal: CalificacionMateria = {
        id: 'cal_' + Date.now(),
        estudianteId: estudianteIdDetalle,
        materia: materiaSeleccionada,
        trimestre: trimestreSeleccionado,
        annoLectivo: db.annoLectivo,
        notasDiarias: [nuevaNota],
      };
      nuevasCalificaciones = [...db.calificaciones, nuevaCal];
    }

    onUpdateDb({ ...db, calificaciones: nuevasCalificaciones });
    onShowToast(`✅ Nota de ${nuevaNota.valor.toFixed(1)} registrada`);
    setNuevaNotaObservacion('');
  };

  // Eliminar nota diaria
  const handleEliminarNota = (notaId: string) => {
    if (!estudianteIdDetalle) return;
    if (!window.confirm('¿Desea eliminar esta nota diaria?')) return;

    const calExistente = db.calificaciones.find(
      (c) =>
        c.estudianteId === estudianteIdDetalle &&
        c.materia === materiaSeleccionada &&
        c.trimestre === trimestreSeleccionado &&
        c.annoLectivo === db.annoLectivo
    );

    if (!calExistente) return;

    const notasRestantes = calExistente.notasDiarias.filter((n) => n.id !== notaId);
    let nuevasCalificaciones: CalificacionMateria[];

    if (notasRestantes.length === 0) {
      nuevasCalificaciones = db.calificaciones.filter((c) => c.id !== calExistente.id);
    } else {
      nuevasCalificaciones = db.calificaciones.map((c) =>
        c.id === calExistente.id ? { ...c, notasDiarias: notasRestantes } : c
      );
    }

    onUpdateDb({ ...db, calificaciones: nuevasCalificaciones });
    onShowToast('🗑️ Nota eliminada');
  };

  // Exportar a CSV
  const exportarPlanillaCSV = () => {
    if (materiaSeleccionada === 'Tecnología' || materiaSeleccionada === MATERIA_TECNOLOGIA_UNIFICADA) {
      const encabezados = [
        'Estudiante',
        'Cédula',
        'Grado',
        'Grupo',
        'Trimestre',
        'Ed. para el Hogar',
        'Agropecuaria',
        'Informática',
        'Tecnología (Unificada)',
        'Áreas Evaluadas',
        'Resultado Oficial',
      ];
      const filas = estudiantesFiltrados.map((est) => {
        const d = obtenerDesgloseTecnologia(est.id, trimestreSeleccionado, db.calificaciones, db.annoLectivo);
        const p1 = d.submaterias[0]?.promedio !== null ? d.submaterias[0]?.promedio.toFixed(2) : 'Sin notas';
        const p2 = d.submaterias[1]?.promedio !== null ? d.submaterias[1]?.promedio.toFixed(2) : 'Sin notas';
        const p3 = d.submaterias[2]?.promedio !== null ? d.submaterias[2]?.promedio.toFixed(2) : 'Sin notas';
        const pUni = d.promedioUnificado !== null ? d.promedioUnificado.toFixed(2) : 'Pendiente';
        const estUni = `${d.evaluadasCount} de ${d.totalSubmaterias} áreas`;
        const res = d.promedioUnificado !== null ? (d.promedioUnificado >= 3.0 ? 'Aprobado' : 'Reprobado') : 'En curso';
        return [
          `"${est.nombre}"`,
          `"${est.cedula}"`,
          `"${est.grado}"`,
          `"${est.grupo}"`,
          `"Trimestre ${trimestreSeleccionado}"`,
          p1,
          p2,
          p3,
          pUni,
          `"${estUni}"`,
          res,
        ].join(',');
      });

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [encabezados.join(','), ...filas].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Acta_Unificacion_Tecnologia_${gradoSeleccionado}${grupoSeleccionado}_T${trimestreSeleccionado}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast('📑 Acta de Unificación de Tecnología exportada en CSV');
      return;
    }

    const encabezados = ['Estudiante', 'Cédula', 'Grado', 'Grupo', 'Materia', 'Trimestre', 'Total Notas', 'Promedio Trimestral', 'Estado'];
    const filas = estudiantesFiltrados.map((est) => {
      const cal = db.calificaciones.find(
        (c) =>
          c.estudianteId === est.id &&
          c.materia === materiaSeleccionada &&
          c.trimestre === trimestreSeleccionado &&
          c.annoLectivo === db.annoLectivo
      );
      const cant = cal?.notasDiarias?.length || 0;
      const prom = calcularPromedioTrimestre(
        est.id,
        materiaSeleccionada,
        trimestreSeleccionado,
        db.calificaciones,
        db.annoLectivo
      );
      const promStr = prom !== null ? prom.toFixed(2) : 'Sin datos';
      const estado = prom !== null ? (prom >= 3.0 ? 'Aprobado' : 'Reprobado') : 'Pendiente';
      return [
        `"${est.nombre}"`,
        `"${est.cedula}"`,
        `"${est.grado}"`,
        `"${est.grupo}"`,
        `"${materiaSeleccionada}"`,
        `"Trimestre ${trimestreSeleccionado}"`,
        cant,
        promStr,
        estado,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [encabezados.join(','), ...filas].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Planilla_Notas_${materiaSeleccionada}_${gradoSeleccionado}${grupoSeleccionado}_T${trimestreSeleccionado}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('📊 Planilla exportada en formato CSV');
  };

  return (
    <div className="space-y-6">
      {/* Selector de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#003366]" />
              Planilla de Calificaciones — Notas Diarias
            </h2>
            <p className="text-xs text-slate-500">
              Evaluación continua según normativa de educación primaria MEDUCA.
            </p>
          </div>

          <button
            onClick={exportarPlanillaCSV}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Descargar Planilla (CSV)</span>
          </button>
        </div>

        {/* Banner de rol docente */}
        {docenteActivo && (
          <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl text-xs flex items-center justify-between gap-2">
            <span className="text-amber-950 font-bold">
              {esConsejero ? (
                <>🎓 Maestro(a) Consejero(a): <strong>{docenteActivo.nombre}</strong> — Asignado a su grado de consejería.</>
              ) : (
                <>⭐ Docente Especial: <strong>{docenteActivo.nombre}</strong> — Acceso autorizado a <strong>{gruposPermitidos.length} grupos asignados</strong>.</>
              )}
            </span>
            <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 shrink-0">
              {docenteActivo.correo}
            </span>
          </div>
        )}

        {/* Selectores de filtrado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Grado */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Grado {docenteActivo && esConsejero ? '(Fijo Consejería)' : ''}
            </label>
            {docenteActivo && esConsejero ? (
              <div className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-800">
                {gradoSeleccionado} Grado
              </div>
            ) : docenteActivo && esEspecial ? (
              <select
                value={`${gradoSeleccionado}-${grupoSeleccionado}`}
                onChange={(e) => {
                  const [g, grp] = e.target.value.split('-');
                  setGradoSeleccionado(g);
                  setGrupoSeleccionado(grp);
                  setEstudianteIdDetalle(null);
                  if (onSelectGrupoActivoDocente) {
                    onSelectGrupoActivoDocente({ grado: g, grupo: grp });
                  }
                }}
                className="w-full p-2 bg-amber-50 border border-amber-300 rounded-lg outline-none font-bold text-slate-800 focus:bg-white"
              >
                {gruposPermitidos.map((ga) => (
                  <option key={`${ga.grado}-${ga.grupo}`} value={`${ga.grado}-${ga.grupo}`}>
                    {ga.grado} Grupo &ldquo;{ga.grupo}&rdquo;
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={gradoSeleccionado}
                onChange={(e) => {
                  setGradoSeleccionado(e.target.value);
                  setEstudianteIdDetalle(null);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-700 focus:bg-white"
              >
                {GRADOS.map((g) => (
                  <option key={g} value={g}>
                    {g} Grado
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Grupo */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Grupo {docenteActivo && esConsejero ? '(Fijo)' : ''}
            </label>
            {docenteActivo && (esConsejero || esEspecial) ? (
              <div className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-800">
                Grupo &ldquo;{grupoSeleccionado}&rdquo;
              </div>
            ) : (
              <select
                value={grupoSeleccionado}
                onChange={(e) => {
                  setGrupoSeleccionado(e.target.value);
                  setEstudianteIdDetalle(null);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-700 focus:bg-white"
              >
                {GRUPOS.map((g) => (
                  <option key={g} value={g}>
                    Grupo {g}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Asignatura */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Asignatura {docenteActivo ? '(Asignada)' : ''}
            </label>
            <select
              value={materiaSeleccionada}
              onChange={(e) => {
                setMateriaSeleccionada(e.target.value);
                setEstudianteIdDetalle(null);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-[#003366] focus:bg-white truncate"
            >
              {materiasPermitidas.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Trimestre</label>
            <select
              value={trimestreSeleccionado}
              onChange={(e) => {
                setTrimestreSeleccionado(parseInt(e.target.value, 10));
                setEstudianteIdDetalle(null);
              }}
              className="w-full p-2 bg-amber-50 border border-amber-300 rounded-lg outline-none font-extrabold text-amber-900 focus:bg-white"
            >
              {TRIMESTRES.map((t) => (
                <option key={t} value={t}>
                  Trimestre {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Banner especial para Sub-áreas de Tecnología o para la Unificación Oficial */}
      {materiaSeleccionada === 'Tecnología' || materiaSeleccionada === MATERIA_TECNOLOGIA_UNIFICADA ? (
        <div className="bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-emerald-500/15 border-2 border-amber-300 rounded-2xl p-4.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-black shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Tablero Oficial de Unificación: Área de Tecnología
                  </h3>
                  <span className="text-[10px] font-black uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                    Normativa MEDUCA
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Los docentes especiales evalúan individualmente sus notas diarias. Al término del <strong>Trimestre {trimestreSeleccionado}</strong>, sus notas se consolidan automáticamente en una <strong>sola materia oficial unificada: TECNOLOGÍA</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-700 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-300/80 shadow-2xs">
                Grado {gradoSeleccionado} &ldquo;{grupoSeleccionado}&rdquo; &bull; Trimestre {trimestreSeleccionado}
              </span>
            </div>
          </div>

          {/* Tarjetas de Métricas Grupales de Tecnología */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
            {/* Promedio General Tecnología */}
            {(() => {
              const promsTec = estudiantesFiltrados
                .map((e) => obtenerDesgloseTecnologia(e.id, trimestreSeleccionado, db.calificaciones, db.annoLectivo).promedioUnificado)
                .filter((p): p is number => p !== null);
              const promGrupal = promsTec.length > 0 ? (promsTec.reduce((a, b) => a + b, 0) / promsTec.length).toFixed(2) : '—';
              const completosCount = estudiantesFiltrados.filter(
                (e) => obtenerDesgloseTecnologia(e.id, trimestreSeleccionado, db.calificaciones, db.annoLectivo).completo
              ).length;

              return (
                <>
                  <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">
                      Promedio Grupal Tecnología
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {promGrupal}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {completosCount} de {estudiantesFiltrados.length} estudiantes completos (3/3)
                    </span>
                  </div>

                  {SUBMATERIAS_TECNOLOGIA.map((sub, idx) => {
                    const subProms = estudiantesFiltrados
                      .map((e) => {
                        const d = obtenerDesgloseTecnologia(e.id, trimestreSeleccionado, db.calificaciones, db.annoLectivo);
                        return d.submaterias[idx]?.promedio;
                      })
                      .filter((p): p is number => p !== null && p !== undefined);
                    const subGrupal = subProms.length > 0 ? (subProms.reduce((a, b) => a + b, 0) / subProms.length).toFixed(2) : '—';
                    const iconEmoji = idx === 0 ? '🏠' : idx === 1 ? '🌱' : '💻';

                    return (
                      <div key={sub} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block truncate" title={sub}>
                          {iconEmoji} {sub}
                        </span>
                        <span className="text-lg font-black text-slate-800">
                          {subGrupal}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {subProms.length} de {estudiantesFiltrados.length} evaluados
                        </span>
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
        </div>
      ) : SUBMATERIAS_TECNOLOGIA.includes(materiaSeleccionada as any) ? (
        <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <span className="text-base">
              {materiaSeleccionada === 'Educación para el Hogar' ? '🏠' : materiaSeleccionada === 'Agropecuaria' ? '🌱' : '💻'}
            </span>
            <div>
              <p className="font-bold text-amber-950">
                Especialidad con Evaluación Individual: <strong>{materiaSeleccionada}</strong>
              </p>
              <p className="text-[11px] text-slate-600">
                Usted registra las notas diarias para esta especialidad. Al finalizar el trimestre, se unificará automáticamente con las otras 2 áreas en la asignatura oficial de <strong>TECNOLOGÍA</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setMateriaSeleccionada('Tecnología');
              setEstudianteIdDetalle(null);
            }}
            className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-3 py-1.5 rounded-lg text-xs transition shadow-2xs shrink-0 self-start sm:self-center"
          >
            <span>Ver Tablero de Unificación</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Regla normativa MEDUCA para materias generales */
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-[#003366] shrink-0" />
            <span>
              <strong>Normativa MEDUCA:</strong> La nota trimestral de cada materia es el <strong>promedio exacto de todas las notas diarias</strong> registradas en el período. Escala: <strong>1.0 a 5.0</strong> &bull; Mínimo aprobatorio: <strong>3.0</strong>.
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#003366] bg-blue-100 px-2 py-0.5 rounded whitespace-nowrap hidden sm:inline">
            {materiaSeleccionada} &bull; {gradoSeleccionado}{grupoSeleccionado}
          </span>
        </div>
      )}

      {/* RENDERIZADO CONDICIONAL DE LA TABLA: UNIFICACIÓN DE TECNOLOGÍA O TABLA ESTÁNDAR */}
      {materiaSeleccionada === 'Tecnología' || materiaSeleccionada === MATERIA_TECNOLOGIA_UNIFICADA ? (
        /* TABLERO COMPARATIVO DE UNIFICACIÓN DE TECNOLOGÍA */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <h4 className="font-bold text-xs text-slate-800">
                Consolidación de Sub-áreas y Nota Final Unificada de Tecnología
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 italic">
              Haga clic en cualquiera de las 3 sub-áreas para calificar directamente
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <th className="py-3 px-3.5">Estudiante</th>
                  <th className="py-3 px-2 text-center bg-amber-50/50 border-x border-slate-200">
                    🏠 Ed. para el Hogar
                  </th>
                  <th className="py-3 px-2 text-center bg-emerald-50/50 border-r border-slate-200">
                    🌱 Agropecuaria
                  </th>
                  <th className="py-3 px-2 text-center bg-blue-50/50 border-r border-slate-200">
                    💻 Informática
                  </th>
                  <th className="py-3 px-3 text-center bg-amber-100/70 border-r border-slate-200">
                    ⚡ TECNOLOGÍA (Unificada)
                  </th>
                  <th className="py-3 px-3 text-center">Estado de Carga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estudiantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No hay estudiantes registrados en {gradoSeleccionado} grupo {grupoSeleccionado}.
                    </td>
                  </tr>
                ) : (
                  estudiantesFiltrados.map((est) => {
                    const desglose = obtenerDesgloseTecnologia(
                      est.id,
                      trimestreSeleccionado,
                      db.calificaciones,
                      db.annoLectivo
                    );
                    const hogar = desglose.submaterias[0];
                    const agro = desglose.submaterias[1];
                    const info = desglose.submaterias[2];
                    const promUni = desglose.promedioUnificado;
                    const aprobado = promUni !== null && promUni >= 3.0;

                    return (
                      <tr key={est.id} className="hover:bg-slate-50 transition">
                        {/* Estudiante */}
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-slate-900 block truncate">
                            {est.nombre}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {est.cedula}
                          </span>
                        </td>

                        {/* 1. Ed. para el Hogar */}
                        <td className="py-3 px-2 text-center bg-amber-50/20 border-x border-slate-200">
                          <div className="flex flex-col items-center gap-1">
                            {hogar.promedio !== null ? (
                              <span className="font-black text-sm text-slate-800">
                                {hogar.promedio.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Sin notas</span>
                            )}
                            <button
                              onClick={() => {
                                setMateriaSeleccionada('Educación para el Hogar');
                                setEstudianteIdDetalle(est.id);
                              }}
                              className="text-[10px] font-bold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded transition"
                              title="Calificar notas diarias de Educación para el Hogar"
                            >
                              {hogar.notasCount > 0 ? `${hogar.notasCount} notas` : '+ Calificar'}
                            </button>
                          </div>
                        </td>

                        {/* 2. Agropecuaria */}
                        <td className="py-3 px-2 text-center bg-emerald-50/20 border-r border-slate-200">
                          <div className="flex flex-col items-center gap-1">
                            {agro.promedio !== null ? (
                              <span className="font-black text-sm text-slate-800">
                                {agro.promedio.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Sin notas</span>
                            )}
                            <button
                              onClick={() => {
                                setMateriaSeleccionada('Agropecuaria');
                                setEstudianteIdDetalle(est.id);
                              }}
                              className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded transition"
                              title="Calificar notas diarias de Agropecuaria"
                            >
                              {agro.notasCount > 0 ? `${agro.notasCount} notas` : '+ Calificar'}
                            </button>
                          </div>
                        </td>

                        {/* 3. Informática */}
                        <td className="py-3 px-2 text-center bg-blue-50/20 border-r border-slate-200">
                          <div className="flex flex-col items-center gap-1">
                            {info.promedio !== null ? (
                              <span className="font-black text-sm text-slate-800">
                                {info.promedio.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Sin notas</span>
                            )}
                            <button
                              onClick={() => {
                                setMateriaSeleccionada('Informática');
                                setEstudianteIdDetalle(est.id);
                              }}
                              className="text-[10px] font-bold text-blue-800 hover:text-blue-950 bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded transition"
                              title="Calificar notas diarias de Informática"
                            >
                              {info.notasCount > 0 ? `${info.notasCount} notas` : '+ Calificar'}
                            </button>
                          </div>
                        </td>

                        {/* 4. Nota Unificada de Tecnología */}
                        <td className="py-3 px-3 text-center bg-amber-50/60 border-r border-slate-200 font-bold">
                          {promUni !== null ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span
                                className={`font-black text-base px-2.5 py-0.5 rounded-lg ${
                                  aprobado
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                                }`}
                              >
                                {promUni.toFixed(2)}
                              </span>
                              <span className="text-[10px] font-extrabold text-amber-900 uppercase">
                                {aprobado ? 'Aprobada' : 'Reprobada'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Sin notas en sub-áreas</span>
                          )}
                        </td>

                        {/* 5. Estado de Carga */}
                        <td className="py-3 px-3 text-center">
                          {desglose.completo ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Completo (3/3)
                            </span>
                          ) : desglose.evaluadasCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              Parcial ({desglose.evaluadasCount}/3)
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Pendiente (0/3)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TABLA ESTÁNDAR DE NOTAS DE LOS ESTUDIANTES PARA OTRAS ASIGNATURAS */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-3.5">Estudiante</th>
                  <th className="py-3 px-3">Cédula</th>
                  <th className="py-3 px-3 text-center">Notas Diarias</th>
                  <th className="py-3 px-3 text-center">Promedio Trimestral</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-3 text-center">Evaluación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estudiantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No hay estudiantes registrados en {gradoSeleccionado} grupo {grupoSeleccionado}.
                    </td>
                  </tr>
                ) : (
                  estudiantesFiltrados.map((est) => {
                    const cal = db.calificaciones.find(
                      (c) =>
                        c.estudianteId === est.id &&
                        c.materia === materiaSeleccionada &&
                        c.trimestre === trimestreSeleccionado &&
                        c.annoLectivo === db.annoLectivo
                    );
                    const cantidadNotas = cal?.notasDiarias?.length || 0;
                    const prom = calcularPromedioTrimestre(
                      est.id,
                      materiaSeleccionada,
                      trimestreSeleccionado,
                      db.calificaciones,
                      db.annoLectivo
                    );
                    const aprobado = prom !== null && prom >= 3.0;
                    const esSeleccionado = estudianteIdDetalle === est.id;

                    return (
                      <tr
                        key={est.id}
                        className={`hover:bg-slate-50 transition ${
                          esSeleccionado ? 'bg-blue-50/70 border-l-4 border-l-[#003366]' : ''
                        }`}
                      >
                        <td className="py-3 px-3.5 font-bold text-slate-800">
                          {est.nombre}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 font-medium">
                          {est.cedula}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {cantidadNotas} {cantidadNotas === 1 ? 'nota' : 'notas'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {prom !== null ? (
                            <span
                              className={`font-black text-sm px-2.5 py-0.5 rounded ${
                                aprobado
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {prom.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Sin notas</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {prom === null ? (
                            <span className="text-slate-400 text-[11px]">Pendiente</span>
                          ) : aprobado ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Aprobado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" />
                              Reprobado
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setEstudianteIdDetalle(est.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 mx-auto ${
                              esSeleccionado
                                ? 'bg-[#003366] text-white shadow-xs'
                                : 'bg-blue-50 text-[#003366] hover:bg-blue-100 border border-blue-200'
                            }`}
                          >
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span>{cantidadNotas > 0 ? 'Ver / Calificar' : '+ Calificar'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Panel Detalle de Notas Diarias (Modal / Floating Panel) */}
      {estudianteEnDetalle && (
        <div className="bg-slate-50 border-2 border-[#003366] rounded-2xl p-5 shadow-lg space-y-5 animate-in fade-in duration-200">
          {/* Header del Panel */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#003366] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  {materiaSeleccionada}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Trimestre {trimestreSeleccionado} &bull; {gradoSeleccionado}{grupoSeleccionado}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                {estudianteEnDetalle.nombre}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Cédula: {estudianteEnDetalle.cedula}
              </p>

              {/* Selector de sub-áreas si pertenece al componente de Tecnología */}
              {(materiaSeleccionada === 'Tecnología' || SUBMATERIAS_TECNOLOGIA.includes(materiaSeleccionada as any)) && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 p-1 bg-amber-100/70 rounded-xl border border-amber-300 w-fit">
                  <span className="text-[10px] font-bold text-amber-950 px-1.5 uppercase">
                    Especialidad:
                  </span>
                  {SUBMATERIAS_TECNOLOGIA.map((sub, sIdx) => {
                    const iconEmoji = sIdx === 0 ? '🏠' : sIdx === 1 ? '🌱' : '💻';
                    const activa = materiaSeleccionada === sub;
                    const subProm = calcularPromedioTrimestre(estudianteEnDetalle.id, sub, trimestreSeleccionado, db.calificaciones, db.annoLectivo);

                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setMateriaSeleccionada(sub)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                          activa
                            ? 'bg-[#003366] text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
                        }`}
                      >
                        <span>{iconEmoji} {sub}</span>
                        {subProm !== null && (
                          <span className={`text-[10px] px-1 py-0.2 rounded font-black ${activa ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            {subProm.toFixed(1)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Promedio destacado */}
            <div className="flex items-center gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-xs min-w-[120px]">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  Promedio Trimestral
                </span>
                <span
                  className={`text-2xl font-black ${
                    promedioDetalle === null
                      ? 'text-slate-400'
                      : promedioDetalle >= 3.0
                      ? 'text-emerald-700'
                      : 'text-rose-600'
                  }`}
                >
                  {promedioDetalle !== null ? promedioDetalle.toFixed(2) : '—'}
                </span>
                <span className="text-[10px] block font-bold text-slate-500">
                  {notasDiariasEstudiante.length} nota(s) diaria(s)
                </span>
              </div>

              <button
                onClick={() => setEstudianteIdDetalle(null)}
                className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-xl border border-slate-200"
                title="Cerrar panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Formulario para agregar nueva nota */}
          <form
            onSubmit={handleAgregarNota}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#003366]">
              <Plus className="w-4 h-4 text-[#FFC107]" />
              <span>Registrar Nueva Nota Diaria</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={nuevaNotaFecha}
                  onChange={(e) => setNuevaNotaFecha(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Nota (1.0 - 5.0) *
                </label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  value={nuevaNotaValor}
                  onChange={(e) => setNuevaNotaValor(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003366] font-bold text-center text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Actividad / Criterio
                </label>
                <select
                  value={nuevaNotaTipo}
                  onChange={(e) => setNuevaNotaTipo(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003366]"
                >
                  {TIPOS_NOTA.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Observación (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sumas con llevada"
                  value={nuevaNotaObservacion}
                  onChange={(e) => setNuevaNotaObservacion(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003366]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-[#003366] hover:bg-[#002244] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#FFC107]" />
                <span>Guardar Nota Diaria</span>
              </button>
            </div>
          </form>

          {/* Historial de Notas Diarias Registradas */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Historial de Notas Registradas ({notasDiariasEstudiante.length})
            </h4>

            {notasDiariasEstudiante.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-slate-200 text-center">
                Aún no hay notas registradas para este estudiante en este trimestre.
              </p>
            ) : (
              <div className="space-y-2">
                {[...notasDiariasEstudiante]
                  .sort((a, b) => b.fecha.localeCompare(a.fecha))
                  .map((nota) => (
                    <div
                      key={nota.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-12 text-center py-1 rounded-lg font-black text-sm ${
                            nota.valor >= 3.0
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {nota.valor.toFixed(1)}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{nota.desc}</span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              &bull; {nota.fecha}
                            </span>
                          </div>
                          {nota.observacion && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5">
                              {nota.observacion}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleEliminarNota(nota.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Eliminar esta nota"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
