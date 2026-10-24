import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Clock,
  User,
  GraduationCap,
  History,
  AlertCircle,
  PlusCircle,
  Edit3,
  Trash2,
} from 'lucide-react';
import { AppDatabase } from '../utils/storage';
import { RegistroAuditoriaNota } from '../types';

interface AuditoriaNotasViewProps {
  db: AppDatabase;
  onShowToast: (msg: string) => void;
}

export const AuditoriaNotasView: React.FC<AuditoriaNotasViewProps> = ({
  db,
  onShowToast,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroAccion, setFiltroAccion] = useState<'todas' | 'creacion' | 'edicion' | 'eliminacion'>('todas');
  const [filtroTrimestre, setFiltroTrimestre] = useState<string>('todos');

  const auditorias = db.auditoriaNotas || [];

  const filtradas = auditorias.filter((item) => {
    const coincideTexto =
      item.estudianteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.docenteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.docenteCorreo.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.materia.toLowerCase().includes(busqueda.toLowerCase()) ||
      (item.criterio && item.criterio.toLowerCase().includes(busqueda.toLowerCase()));

    const coincideAccion =
      filtroAccion === 'todas' ? true : item.accion === filtroAccion;

    const coincideTrimestre =
      filtroTrimestre === 'todos'
        ? true
        : item.trimestre === parseInt(filtroTrimestre, 10);

    return coincideTexto && coincideAccion && coincideTrimestre;
  });

  // Exportar auditoría a CSV
  const exportarAuditoriaCSV = () => {
    const encabezados = [
      'ID Registro',
      'Fecha y Hora',
      'Educador Responsable',
      'Correo Institucional',
      'Estudiante',
      'ID Estudiante',
      'Asignatura',
      'Trimestre',
      'Acción',
      'Criterio',
      'Valor Anterior',
      'Valor Nuevo',
      'Motivo / Observación',
    ];

    const filas = filtradas.map((r) => [
      `"${r.id}"`,
      `"${r.fechaHora}"`,
      `"${r.docenteNombre}"`,
      `"${r.docenteCorreo}"`,
      `"${r.estudianteNombre}"`,
      `"${r.estudianteId}"`,
      `"${r.materia}"`,
      `"Trimestre ${r.trimestre}"`,
      `"${r.accion.toUpperCase()}"`,
      `"${r.criterio || ''}"`,
      r.valorAnterior !== undefined ? r.valorAnterior : 'N/A',
      r.valorNuevo !== undefined ? r.valorNuevo : 'N/A',
      `"${r.motivo || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [encabezados.join(','), ...filas.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bitacora_Auditoria_Notas_${db.annoLectivo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('📊 Bitácora de Auditoría exportada en CSV');
  };

  const totalCreaciones = auditorias.filter((a) => a.accion === 'creacion').length;
  const totalEdiciones = auditorias.filter((a) => a.accion === 'edicion').length;
  const totalEliminaciones = auditorias.filter((a) => a.accion === 'eliminacion').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Encabezado */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#003366] text-[#FFC107] px-2.5 py-0.5 rounded-md">
              Seguridad & Transparencia MEDUCA
            </span>
            <span className="text-xs font-bold text-slate-500">
              Año Lectivo {db.annoLectivo}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-[#003366]" />
            Bitácora de Auditoría de Calificaciones
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro inmutable de trazabilidad: quién, cuándo y qué calificación se registró, modificó o eliminó.
          </p>
        </div>

        <button
          onClick={exportarAuditoriaCSV}
          className="inline-flex items-center gap-1.5 bg-[#003366] hover:bg-[#002244] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Download className="w-4 h-4 text-[#FFC107]" />
          <span>Exportar Bitácora (CSV)</span>
        </button>
      </div>

      {/* Tarjetas Métricas de Auditoría */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">
            Total Eventos
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{auditorias.length}</p>
          <span className="text-[10px] text-slate-400">Trazabilidad completa</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
            <PlusCircle className="w-3.5 h-3.5" />
            Notas Nuevas
          </span>
          <p className="text-2xl font-black text-emerald-900 mt-1">{totalCreaciones}</p>
          <span className="text-[10px] text-emerald-700">Asentadas por docentes</span>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-blue-800 uppercase flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5" />
            Modificaciones
          </span>
          <p className="text-2xl font-black text-blue-900 mt-1">{totalEdiciones}</p>
          <span className="text-[10px] text-blue-700">Ajustes o rectificaciones</span>
        </div>

        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-rose-800 uppercase flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" />
            Eliminaciones
          </span>
          <p className="text-2xl font-black text-rose-900 mt-1">{totalEliminaciones}</p>
          <span className="text-[10px] text-rose-700">Registros borrados</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Buscador */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por estudiante, docente, materia..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-800 focus:bg-white focus:border-[#003366]"
            />
          </div>

          {/* Filtro Acción */}
          <div>
            <select
              value={filtroAccion}
              onChange={(e) => setFiltroAccion(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:bg-white"
            >
              <option value="todas">Todas las acciones</option>
              <option value="creacion">➕ Creaciones de Notas</option>
              <option value="edicion">✏️ Modificaciones</option>
              <option value="eliminacion">🗑️ Eliminaciones</option>
            </select>
          </div>

          {/* Filtro Trimestre */}
          <div>
            <select
              value={filtroTrimestre}
              onChange={(e) => setFiltroTrimestre(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:bg-white"
            >
              <option value="todos">Todos los trimestres</option>
              <option value="1">I Trimestre</option>
              <option value="2">II Trimestre</option>
              <option value="3">III Trimestre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Registros de Auditoría */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-3 px-3.5">Fecha / Hora</th>
                <th className="py-3 px-3">Docente Responsable</th>
                <th className="py-3 px-3">Estudiante</th>
                <th className="py-3 px-3">Materia & Período</th>
                <th className="py-3 px-3 text-center">Acción</th>
                <th className="py-3 px-3 text-center">Detalle / Valor</th>
                <th className="py-3 px-3">Criterio / Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron registros de auditoría con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtradas
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((r) => {
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {r.fechaHora}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-slate-900">
                              {r.docenteNombre}
                            </span>
                            <span className="text-[10px] font-mono text-blue-700">
                              {r.docenteCorreo}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-bold text-slate-800">
                          {r.estudianteNombre}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#003366]">{r.materia}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              Trimestre {r.trimestre}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${
                              r.accion === 'creacion'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : r.accion === 'edicion'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {r.accion === 'creacion'
                              ? 'Ingreso'
                              : r.accion === 'edicion'
                              ? 'Ajuste'
                              : 'Borrado'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {r.accion === 'creacion' && (
                            <span className="font-black text-sm text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                              {r.valorNuevo?.toFixed(1)}
                            </span>
                          )}
                          {r.accion === 'edicion' && (
                            <div className="inline-flex items-center gap-1 font-black text-xs">
                              <span className="text-slate-400 line-through">
                                {r.valorAnterior?.toFixed(1)}
                              </span>
                              <span>&rarr;</span>
                              <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                {r.valorNuevo?.toFixed(1)}
                              </span>
                            </div>
                          )}
                          {r.accion === 'eliminacion' && (
                            <span className="font-bold text-xs text-rose-700 line-through bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              {r.valorAnterior?.toFixed(1)}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-slate-600">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">
                              {r.criterio}
                            </span>
                            {r.motivo && (
                              <span className="text-[11px] text-slate-500 italic">
                                {r.motivo}
                              </span>
                            )}
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
    </div>
  );
};
