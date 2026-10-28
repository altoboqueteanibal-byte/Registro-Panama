import React, { useState } from 'react';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  Download,
  Users,
  Info,
  Printer,
} from 'lucide-react';
import {
  GRADOS,
  GRUPOS,
  ESTADOS_ASISTENCIA,
  AsistenciaRegistro,
  Docente,
  GrupoAsignado,
} from '../types';
import { AppDatabase } from '../utils/storage';
import { calcularAsistenciaEstudiante } from '../utils/calculations';
import { AccesoDocenteRequerido } from './AccesoDocenteRequerido';

interface AsistenciaViewProps {
  db: AppDatabase;
  onUpdateDb: (db: AppDatabase) => void;
  onShowToast: (msg: string) => void;
  docenteActivo?: Docente | null;
  grupoActivoDocente?: GrupoAsignado;
  onSelectGrupoActivoDocente?: (grupo: GrupoAsignado) => void;
  onOpenLoginDocente?: () => void;
  onNavigate?: (view: any) => void;
}

export const AsistenciaView: React.FC<AsistenciaViewProps> = ({
  db,
  onUpdateDb,
  onShowToast,
  docenteActivo = null,
  grupoActivoDocente,
  onSelectGrupoActivoDocente,
  onOpenLoginDocente,
  onNavigate,
}) => {
  if (!docenteActivo) {
    return (
      <AccesoDocenteRequerido
        modulo="asistencia"
        onOpenLoginDocente={onOpenLoginDocente || (() => {})}
        onNavigate={onNavigate || (() => {})}
        db={db}
      />
    );
  }

  const esConsejero = docenteActivo.tipo === 'consejero';
  const esEspecial = docenteActivo.tipo === 'especial';

  const gruposPermitidos: GrupoAsignado[] = docenteActivo
    ? esConsejero
      ? [{ grado: docenteActivo.gradoTutor || '3°', grupo: docenteActivo.grupoTutor || 'A' }]
      : docenteActivo.gruposAsignados && docenteActivo.gruposAsignados.length > 0
      ? docenteActivo.gruposAsignados
      : [{ grado: '1°', grupo: 'A' }]
    : [];

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

  const [gradoSeleccionado, setGradoSeleccionado] = useState<string>(defaultGrado);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>(defaultGrupo);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [pestana, setPestana] = useState<'pase' | 'paseu'>('pase');
  const [modalImprimirAsistenciaA4, setModalImprimirAsistenciaA4] = useState(false);

  const esGrupoAutorizado = gruposPermitidos.some(
    (g) => g.grado === gradoSeleccionado && g.grupo === grupoSeleccionado
  );

  React.useEffect(() => {
    if (docenteActivo) {
      if (esConsejero && docenteActivo.gradoTutor && docenteActivo.grupoTutor) {
        setGradoSeleccionado(docenteActivo.gradoTutor);
        setGrupoSeleccionado(docenteActivo.grupoTutor);
      } else if (esEspecial && grupoActivoDocente) {
        setGradoSeleccionado(grupoActivoDocente.grado);
        setGrupoSeleccionado(grupoActivoDocente.grupo);
      }
    }
  }, [docenteActivo, grupoActivoDocente]);

  const estudiantesFiltrados = esGrupoAutorizado
    ? db.estudiantes.filter(
        (e) => e.grado === gradoSeleccionado && e.grupo === grupoSeleccionado
      )
    : [];

  // Registros de la fecha seleccionada
  const asistenciasFecha = db.asistencia.filter(
    (a) =>
      a.fecha === fechaSeleccionada &&
      a.annoLectivo === db.annoLectivo &&
      estudiantesFiltrados.some((e) => e.id === a.estudianteId)
  );

  const conteoP = asistenciasFecha.filter((a) => a.estado === 'P').length;
  const conteoA = asistenciasFecha.filter((a) => a.estado === 'A').length;
  const conteoT = asistenciasFecha.filter((a) => a.estado === 'T').length;
  const conteoJ = asistenciasFecha.filter((a) => a.estado === 'J').length;
  const totalRegistrados = asistenciasFecha.length;

  const porcentajeDia =
    totalRegistrados > 0
      ? Math.round(((conteoP + conteoT + conteoJ) / totalRegistrados) * 100)
      : 100;

  // Registrar asistencia individual
  const marcarAsistencia = (estId: string, estado: 'P' | 'A' | 'T' | 'J') => {
    const regExistente = db.asistencia.find(
      (a) =>
        a.estudianteId === estId &&
        a.fecha === fechaSeleccionada &&
        a.annoLectivo === db.annoLectivo
    );

    let nuevasAsistencias: AsistenciaRegistro[];

    if (regExistente) {
      nuevasAsistencias = db.asistencia.map((a) =>
        a.id === regExistente.id
          ? { ...a, estado, timestamp: Date.now() }
          : a
      );
    } else {
      const nuevo: AsistenciaRegistro = {
        id: `asis_${fechaSeleccionada}_${estId}`,
        estudianteId: estId,
        fecha: fechaSeleccionada,
        estado,
        annoLectivo: db.annoLectivo,
        timestamp: Date.now(),
      };
      nuevasAsistencias = [...db.asistencia, nuevo];
    }

    onUpdateDb({ ...db, asistencia: nuevasAsistencias });
    onShowToast(`Marcado como: ${ESTADOS_ASISTENCIA[estado].label}`);
  };

  // Marcar a todos los alumnos del grupo como Presente
  const marcarTodosPresentes = () => {
    let nuevas = [...db.asistencia];

    estudiantesFiltrados.forEach((est) => {
      const idx = nuevas.findIndex(
        (a) =>
          a.estudianteId === est.id &&
          a.fecha === fechaSeleccionada &&
          a.annoLectivo === db.annoLectivo
      );
      if (idx !== -1) {
        nuevas[idx] = { ...nuevas[idx], estado: 'P', timestamp: Date.now() };
      } else {
        nuevas.push({
          id: `asis_${fechaSeleccionada}_${est.id}`,
          estudianteId: est.id,
          fecha: fechaSeleccionada,
          estado: 'P',
          annoLectivo: db.annoLectivo,
          timestamp: Date.now(),
        });
      }
    });

    onUpdateDb({ ...db, asistencia: nuevas });
    onShowToast(`✅ Todos los estudiantes (${estudiantesFiltrados.length}) marcados como Presentes`);
  };

  // Exportar reporte de asistencia a CSV
  const exportarAsistenciaCSV = () => {
    const encabezados = [
      'Estudiante',
      'Cédula',
      'Grado',
      'Grupo',
      'Total Registros',
      'Presentes',
      'Ausencias',
      'Tardanzas',
      'Justificados',
      '% Asistencia',
      'Estado PASE-U',
    ];

    const filas = estudiantesFiltrados.map((est) => {
      const stats = calcularAsistenciaEstudiante(est.id, db.asistencia, db.annoLectivo);
      return [
        `"${est.nombre}"`,
        `"${est.cedula}"`,
        `"${est.grado}"`,
        `"${est.grupo}"`,
        stats.total,
        stats.presentes,
        stats.ausentes,
        stats.tardanzas,
        stats.justificados,
        `${stats.porcentaje}%`,
        stats.paseuAprobado ? '"CUMPLE (≥ 90%)"' : '"EN RIESGO (< 90%)"',
      ].join(',');
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [encabezados.join(','), ...filas].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Asistencia_PASEU_${gradoSeleccionado}${grupoSeleccionado}_${db.annoLectivo}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('📊 Reporte de Asistencia descargado');
  };

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#003366]" />
              Control de Asistencia Escolar y Monitoreo PASE-U
            </h2>
            <p className="text-xs text-slate-500">
              Registro diario en tiempo real con cálculo automático del umbral de beca escolar (90%).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalImprimirAsistenciaA4(true)}
              className="inline-flex items-center gap-1.5 bg-[#003366] hover:bg-[#002244] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Imprimir Registro Oficial de Asistencia en Formato A4"
            >
              <Printer className="w-3.5 h-3.5 text-[#FFC107]" />
              <span>Imprimir Asistencia A4</span>
            </button>
            <button
              onClick={exportarAsistenciaCSV}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition border border-slate-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar Reporte</span>
            </button>
          </div>
        </div>

        {/* Banner de rol docente */}
        {docenteActivo && (
          <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl text-xs flex items-center justify-between gap-2">
            <span className="text-amber-950 font-bold">
              {esConsejero ? (
                <>🎓 Maestro(a) Consejero(a): <strong>{docenteActivo.nombre}</strong> — Asistencia de su grupo de consejería.</>
              ) : (
                <>⭐ Docente Especial: <strong>{docenteActivo.nombre}</strong> — Asistencia de sus <strong>{gruposPermitidos.length} grupos asignados</strong>.</>
              )}
            </span>
            <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 shrink-0">
              {docenteActivo.correo}
            </span>
          </div>
        )}

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Fecha</label>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800 focus:bg-white"
            />
          </div>

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
                onChange={(e) => setGradoSeleccionado(e.target.value)}
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

          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Grupo {docenteActivo && (esConsejero || esEspecial) ? '(Fijo)' : ''}
            </label>
            {docenteActivo && (esConsejero || esEspecial) ? (
              <div className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-800">
                Grupo &ldquo;{grupoSeleccionado}&rdquo;
              </div>
            ) : (
              <select
                value={grupoSeleccionado}
                onChange={(e) => setGrupoSeleccionado(e.target.value)}
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
        </div>

        {/* Toggle Pestañas */}
        <div className="flex gap-2 border-t border-slate-100 pt-3">
          <button
            onClick={() => setPestana('pase')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              pestana === 'pase'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Pase de Lista del Día ({fechaSeleccionada})</span>
          </button>
          <button
            onClick={() => setPestana('paseu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              pestana === 'paseu'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#FFC107]" />
            <span>Control Acumulado PASE-U (IFARHU)</span>
          </button>
        </div>
      </div>

      {!esGrupoAutorizado ? (
        <div className="bg-amber-50 border-2 border-amber-300 p-8 rounded-2xl text-center space-y-3 shadow-xs">
          <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-base">
            Grupo No Asignado a su Carga Horaria Oficial
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Educador(a) <strong>{docenteActivo.nombre}</strong>: El grupo{' '}
            <strong>
              {gradoSeleccionado} &ldquo;{grupoSeleccionado}&rdquo;
            </strong>{' '}
            no forma parte de sus grupos autorizados por MEDUCA.
          </p>
          <button
            onClick={() => {
              if (gruposPermitidos.length > 0) {
                setGradoSeleccionado(gruposPermitidos[0].grado);
                setGrupoSeleccionado(gruposPermitidos[0].grupo);
              }
            }}
            className="mt-2 px-4 py-2 bg-[#003366] text-white text-xs font-bold rounded-xl hover:bg-[#002244] transition shadow-xs"
          >
            Abrir mi grupo asignado ({gruposPermitidos[0]?.grado} &ldquo;
            {gruposPermitidos[0]?.grupo}&rdquo;)
          </button>
        </div>
      ) : pestana === 'pase' ? (
        <>
          {/* Métricas del Día */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">Presentes</span>
              <p className="text-2xl font-black text-emerald-800">{conteoP}</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
              <span className="text-[11px] font-bold text-rose-700 uppercase">Ausentes</span>
              <p className="text-2xl font-black text-rose-800">{conteoA}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
              <span className="text-[11px] font-bold text-amber-700 uppercase">Tardanzas</span>
              <p className="text-2xl font-black text-amber-800">{conteoT}</p>
            </div>
            <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-center">
              <span className="text-[11px] font-bold text-sky-700 uppercase">Justificados</span>
              <p className="text-2xl font-black text-sky-800">{conteoJ}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-[#003366] uppercase">% Asistencia Hoy</span>
              <p className="text-2xl font-black text-[#003366]">{porcentajeDia}%</p>
            </div>
          </div>

          {/* Botón rápido "Marcar todos presentes" */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">
              Alumnos en {gradoSeleccionado} {grupoSeleccionado}: <strong>{estudiantesFiltrados.length}</strong>
            </span>
            <button
              onClick={marcarTodosPresentes}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Marcar Todos Presentes (P)</span>
            </button>
          </div>

          {/* Tabla de Pase de Lista */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-3.5">Estudiante</th>
                    <th className="py-3 px-3">Cédula</th>
                    <th className="py-3 px-3 text-center">Estado Hoy</th>
                    <th className="py-3 px-3 text-center">Marcación Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {estudiantesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No hay estudiantes registrados en este grado y grupo.
                      </td>
                    </tr>
                  ) : (
                    estudiantesFiltrados.map((est) => {
                      const reg = db.asistencia.find(
                        (a) =>
                          a.estudianteId === est.id &&
                          a.fecha === fechaSeleccionada &&
                          a.annoLectivo === db.annoLectivo
                      );
                      const estado = reg?.estado;

                      return (
                        <tr key={est.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3.5 font-bold text-slate-800">
                            {est.nombre}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">
                            {est.cedula}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {estado ? (
                              <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                                  ESTADOS_ASISTENCIA[estado].badgeClass
                                }`}
                              >
                                {ESTADOS_ASISTENCIA[estado].label}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">
                                Sin marcar
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                              <button
                                onClick={() => marcarAsistencia(est.id, 'P')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                                  estado === 'P'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                                }`}
                                title="Presente"
                              >
                                P
                              </button>
                              <button
                                onClick={() => marcarAsistencia(est.id, 'A')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                                  estado === 'A'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-700 hover:bg-rose-100 hover:text-rose-800'
                                }`}
                                title="Ausente"
                              >
                                A
                              </button>
                              <button
                                onClick={() => marcarAsistencia(est.id, 'T')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                                  estado === 'T'
                                    ? 'bg-amber-500 text-slate-900 shadow-xs'
                                    : 'text-slate-700 hover:bg-amber-100 hover:text-amber-800'
                                }`}
                                title="Tardanza"
                              >
                                T
                              </button>
                              <button
                                onClick={() => marcarAsistencia(est.id, 'J')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                                  estado === 'J'
                                    ? 'bg-sky-600 text-white shadow-xs'
                                    : 'text-slate-700 hover:bg-sky-100 hover:text-sky-800'
                                }`}
                                title="Justificado"
                              >
                                J
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Pestaña Control Acumulado PASE-U */
        <div className="space-y-4">
          <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-950 mb-0.5">
                Criterios del IFARHU y MEDUCA para la Beca Digital PASE-U
              </p>
              <p className="leading-relaxed">
                El Programa de Asistencia Social Educativa Universal (PASE-U) requiere que el estudiante mantenga una asistencia no inferior al <strong>90%</strong> de las jornadas lectivas. Aquellos estudiantes que presenten porcentaje inferior están en riesgo de suspensión temporal del beneficio.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-3.5">Estudiante</th>
                    <th className="py-3 px-3">Cédula</th>
                    <th className="py-3 px-3 text-center">Días Evaluados</th>
                    <th className="py-3 px-3 text-center">Presente / Tardanza</th>
                    <th className="py-3 px-3 text-center">Ausencias</th>
                    <th className="py-3 px-3 text-center">% Asistencia Total</th>
                    <th className="py-3 px-3 text-center">Estatus PASE-U</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {estudiantesFiltrados.map((est) => {
                    const stats = calcularAsistenciaEstudiante(
                      est.id,
                      db.asistencia,
                      db.annoLectivo
                    );
                    const cumple = stats.paseuAprobado;

                    return (
                      <tr key={est.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3.5 font-bold text-slate-800">
                          {est.nombre}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 font-medium">
                          {est.cedula}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-700">
                          {stats.total}
                        </td>
                        <td className="py-3 px-3 text-center text-emerald-700 font-semibold">
                          {stats.presentes + stats.tardanzas + stats.justificados}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-rose-600">
                          {stats.ausentes}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-black text-xs px-2.5 py-0.5 rounded ${
                              cumple
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {stats.porcentaje}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {cumple ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Beca Asegurada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              En Riesgo PASE-U
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE IMPRESIÓN OFICIAL DEL REGISTRO DE ASISTENCIA EN FORMATO A4 */}
      {modalImprimirAsistenciaA4 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/85 backdrop-blur-xs flex flex-col items-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
          {/* Barra de herramientas (no-print) */}
          <div className="w-full max-w-4xl bg-[#003366] text-white p-3 sm:px-6 sm:py-3.5 rounded-t-2xl shadow-xl flex items-center justify-between no-print sticky top-2 z-50 border border-blue-400/30">
            <div className="flex items-center gap-2.5">
              <Printer className="w-5 h-5 text-[#FFC107]" />
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  Registro Oficial de Asistencia Escolar y PASE-U
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded uppercase">
                    Formato A4
                  </span>
                </h3>
                <p className="text-[11px] text-blue-200">
                  Grado {gradoSeleccionado} &ldquo;{grupoSeleccionado}&rdquo; &bull; Fecha: {fechaSeleccionada}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition shadow-md cursor-pointer"
                title="Imprimir registro en papel A4 vertical"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Asistencia A4</span>
              </button>
              <button
                onClick={() => setModalImprimirAsistenciaA4(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Registro Impreso en Formato A4 */}
          <div className="w-full max-w-4xl bg-white rounded-b-2xl p-6 sm:p-8 space-y-4 print:p-2 print:m-0 print:border-none print:shadow-none print-page a4-page-single">
            {/* Membrete Oficial */}
            <div className="text-center border-b-2 border-[#003366] pb-3 print:pb-1.5">
              <div className="inline-block mb-1 print:mb-0.5">
                <span className="text-[11px] font-extrabold tracking-widest text-[#003366] uppercase block print:text-[8.5px]">
                  REPÚBLICA DE PANAMÁ &bull; GOBIERNO NACIONAL
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase block print:text-[8px]">
                  MINISTERIO DE EDUCACIÓN &bull; DIRECCIÓN GENERAL DE EDUCACIÓN
                </span>
                <span className="text-xs text-slate-600 block print:text-[8px]">
                  {db.escuela.regionEducativa} &bull; {db.escuela.nombrePlantel}
                </span>
              </div>
              <h1 className="text-lg font-black text-[#003366] uppercase tracking-wide mt-1 print:text-sm">
                PARTE DIARIO OFICIAL DE ASISTENCIA Y MONITOREO PASE-U
              </h1>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider print:text-[8px]">
                NIVEL DE EDUCACIÓN PRIMARIA &bull; AÑO LECTIVO {db.annoLectivo}
              </p>
            </div>

            {/* Metadatos */}
            <div className="grid grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 print:bg-white print:border-slate-300 print:p-1.5 print:text-[9px]">
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[8px]">Fecha del Registro:</span>
                <span className="font-extrabold text-[#003366]">{fechaSeleccionada}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[8px]">Grado y Grupo:</span>
                <span className="font-bold text-slate-800">{gradoSeleccionado} &ldquo;{grupoSeleccionado}&rdquo;</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[8px]">Total Matrícula:</span>
                <span className="font-bold text-slate-800">{estudiantesFiltrados.length} Estudiantes</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[8px]">Docente Responsable:</span>
                <span className="font-bold text-slate-800">{docenteActivo.nombre}</span>
              </div>
            </div>

            {/* Resumen de Asistencia del Día */}
            <div className="grid grid-cols-5 gap-2 text-center text-xs print:text-[8.5px]">
              <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-lg print:p-1">
                <span className="block text-[8px] uppercase font-bold text-emerald-800">Presentes</span>
                <span className="font-black text-sm print:text-xs text-emerald-900">{conteoP}</span>
              </div>
              <div className="p-2 bg-rose-50 border border-rose-300 rounded-lg print:p-1">
                <span className="block text-[8px] uppercase font-bold text-rose-800">Ausentes</span>
                <span className="font-black text-sm print:text-xs text-rose-900">{conteoA}</span>
              </div>
              <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg print:p-1">
                <span className="block text-[8px] uppercase font-bold text-amber-800">Tardanzas</span>
                <span className="font-black text-sm print:text-xs text-amber-900">{conteoT}</span>
              </div>
              <div className="p-2 bg-sky-50 border border-sky-300 rounded-lg print:p-1">
                <span className="block text-[8px] uppercase font-bold text-sky-800">Justificados</span>
                <span className="font-black text-sm print:text-xs text-sky-900">{conteoJ}</span>
              </div>
              <div className="p-2 bg-blue-50 border border-blue-300 rounded-lg print:p-1">
                <span className="block text-[8px] uppercase font-bold text-[#003366]">% Asistencia</span>
                <span className="font-black text-sm print:text-xs text-[#003366]">{porcentajeDia}%</span>
              </div>
            </div>

            {/* Tabla Oficial de Asistencia */}
            <table className="w-full text-left border-collapse text-xs border border-slate-300 print:text-[8.5px]">
              <thead>
                <tr className="bg-[#003366] text-white text-[10px] font-bold uppercase text-center print:text-[8px]">
                  <th className="py-1.5 px-2 w-8">N°</th>
                  <th className="py-1.5 px-3 text-left">Estudiante</th>
                  <th className="py-1.5 px-2 w-28">Cédula</th>
                  <th className="py-1.5 px-2 w-24">Estado Hoy</th>
                  <th className="py-1.5 px-2 w-28">Asistencia Acum.</th>
                  <th className="py-1.5 px-2 w-28">Estatus PASE-U</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {estudiantesFiltrados.map((est, idx) => {
                  const reg = db.asistencia.find(
                    (a) => a.estudianteId === est.id && a.fecha === fechaSeleccionada && a.annoLectivo === db.annoLectivo
                  );
                  const asisTotal = calcularAsistenciaEstudiante(est.id, db.asistencia, db.annoLectivo);
                  const estado = reg?.estado || 'P';

                  return (
                    <tr key={est.id} className="hover:bg-slate-50">
                      <td className="py-1 px-2 text-center text-slate-400 border-r border-slate-200">{idx + 1}</td>
                      <td className="py-1 px-3 font-semibold text-slate-800 border-r border-slate-200">{est.nombre}</td>
                      <td className="py-1 px-2 font-mono text-slate-600 border-r border-slate-200 text-center">{est.cedula}</td>
                      <td className="py-1 px-2 text-center border-r border-slate-200 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          estado === 'P' ? 'bg-emerald-100 text-emerald-800' :
                          estado === 'A' ? 'bg-rose-100 text-rose-800' :
                          estado === 'T' ? 'bg-amber-100 text-amber-800' :
                          'bg-sky-100 text-sky-800'
                        }`}>
                          {ESTADOS_ASISTENCIA[estado]?.label || estado}
                        </span>
                      </td>
                      <td className="py-1 px-2 text-center font-bold border-r border-slate-200">
                        {asisTotal.porcentaje}% ({asisTotal.presentes} de {asisTotal.total})
                      </td>
                      <td className="py-1 px-2 text-center font-bold">
                        {asisTotal.paseuAprobado ? (
                          <span className="text-emerald-700">✓ Cumple (&ge;90%)</span>
                        ) : (
                          <span className="text-rose-600 font-bold">⚠️ En Riesgo (&lt;90%)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Firmas Oficiales */}
            <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs print:pt-4 avoid-break">
              <div>
                <div className="border-t border-slate-400 pt-1 w-3/4 mx-auto">
                  <p className="font-bold text-slate-800">{docenteActivo.nombre}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Docente Responsable</p>
                </div>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-1 w-3/4 mx-auto">
                  <p className="font-bold text-slate-800">{db.escuela.director}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Director(a) del Plantel Educativo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
