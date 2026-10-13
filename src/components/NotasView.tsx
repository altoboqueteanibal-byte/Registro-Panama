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
} from 'lucide-react';
import {
  GRADOS,
  GRUPOS,
  TRIMESTRES,
  TODAS_MATERIAS,
  TIPOS_NOTA,
  CalificacionMateria,
  NotaDiaria,
} from '../types';
import { AppDatabase } from '../utils/storage';
import { calcularPromedioTrimestre } from '../utils/calculations';

interface NotasViewProps {
  db: AppDatabase;
  onUpdateDb: (db: AppDatabase) => void;
  onShowToast: (msg: string) => void;
}

export const NotasView: React.FC<NotasViewProps> = ({
  db,
  onUpdateDb,
  onShowToast,
}) => {
  const [gradoSeleccionado, setGradoSeleccionado] = useState<string>('3°');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>('A');
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string>('Matemáticas');
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState<number>(
    db.trimestreActual
  );

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

        {/* 4 selectores principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Grado</label>
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
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Grupo</label>
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
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Asignatura</label>
            <select
              value={materiaSeleccionada}
              onChange={(e) => {
                setMateriaSeleccionada(e.target.value);
                setEstudianteIdDetalle(null);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-[#003366] focus:bg-white truncate"
            >
              {TODAS_MATERIAS.map((m) => (
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

      {/* Regla normativa MEDUCA */}
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

      {/* Tabla de notas de los estudiantes */}
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
