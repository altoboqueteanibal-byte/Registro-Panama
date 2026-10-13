import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Send,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  FileCheck,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { ComunicadoEscolar, JustificacionAusencia, GRADOS } from '../types';
import { AppDatabase } from '../utils/storage';

interface ComunicadosAdminViewProps {
  db: AppDatabase;
  onUpdateDb: (db: AppDatabase) => void;
  onShowToast: (msg: string) => void;
  onOpenPortalPadres: () => void;
}

export const ComunicadosAdminView: React.FC<ComunicadosAdminViewProps> = ({
  db,
  onUpdateDb,
  onShowToast,
  onOpenPortalPadres,
}) => {
  const [pestana, setPestana] = useState<'comunicados' | 'justificaciones' | 'padres'>('comunicados');

  // Modal nuevo comunicado
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [formTitulo, setFormTitulo] = useState('');
  const [formContenido, setFormContenido] = useState('');
  const [formPrioridad, setFormPrioridad] = useState<'urgente' | 'importante' | 'informativo'>('importante');
  const [formCategoria, setFormCategoria] = useState<'academico' | 'paseu' | 'reunion' | 'evento' | 'general'>('reunion');
  const [formDestinatarios, setFormDestinatarios] = useState<string>('todos');
  const [formRemitente, setFormRemitente] = useState<string>(db.escuela.director);

  const guardarNuevoComunicado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim() || !formContenido.trim()) {
      onShowToast('⚠️ El título y contenido son obligatorios');
      return;
    }

    const nuevo: ComunicadoEscolar = {
      id: 'com_' + Date.now(),
      titulo: formTitulo.trim(),
      contenido: formContenido.trim(),
      fecha: new Date().toISOString().split('T')[0],
      prioridad: formPrioridad,
      categoria: formCategoria,
      destinatarios: formDestinatarios,
      remitente: formRemitente.trim() || 'Dirección del Plantel',
      leidoPor: [],
    };

    onUpdateDb({
      ...db,
      comunicados: [nuevo, ...db.comunicados],
    });

    onShowToast('📢 Comunicado publicado para los padres');
    setModalNuevoAbierto(false);
    setFormTitulo('');
    setFormContenido('');
  };

  const eliminarComunicado = (id: string) => {
    if (!window.confirm('¿Desea eliminar este comunicado escolar?')) return;
    const filtrados = db.comunicados.filter((c) => c.id !== id);
    onUpdateDb({ ...db, comunicados: filtrados });
    onShowToast('🗑️ Comunicado eliminado');
  };

  // Aprobar / Rechazar justificantes de ausencia
  const resolverJustificacion = (justId: string, nuevoEstado: 'aprobada' | 'rechazada') => {
    const actualizadas = (db.justificaciones || []).map((j) => {
      if (j.id === justId) {
        return {
          ...j,
          estado: nuevoEstado,
          observacionDocente:
            nuevoEstado === 'aprobada'
              ? 'Ausencia justificada por la dirección/consejería.'
              : 'Justificante no procedente según reglamento interno.',
        };
      }
      return j;
    });

    // Si fue aprobada, actualizar la asistencia de ese día a 'J' (Justificado)
    const justTarget = (db.justificaciones || []).find((j) => j.id === justId);
    let nuevasAsistencias = [...db.asistencia];
    if (justTarget && nuevoEstado === 'aprobada') {
      const idx = nuevasAsistencias.findIndex(
        (a) =>
          a.estudianteId === justTarget.estudianteId &&
          a.fecha === justTarget.fechaAusencia &&
          a.annoLectivo === db.annoLectivo
      );
      if (idx !== -1) {
        nuevasAsistencias[idx] = { ...nuevasAsistencias[idx], estado: 'J' };
      }
    }

    onUpdateDb({
      ...db,
      justificaciones: actualizadas,
      asistencia: nuevasAsistencias,
    });

    onShowToast(
      nuevoEstado === 'aprobada'
        ? '✓ Justificante aprobado y reflejado como asistencia justificada'
        : '✗ Justificante rechazado'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#003366]" />
            Comunicación con Padres &bull; Portal Familiar
          </h2>
          <p className="text-xs text-slate-500">
            Publicación de circulares oficiales, control de confirmaciones y resolución de justificantes de inasistencia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPortalPadres}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-300"
          >
            <Users className="w-4 h-4 text-amber-700" />
            <span>Abrir Vista de Padres</span>
          </button>

          <button
            onClick={() => setModalNuevoAbierto(true)}
            className="bg-[#003366] hover:bg-[#002244] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#FFC107]" />
            <span>Nuevo Comunicado</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setPestana('comunicados')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            pestana === 'comunicados'
              ? 'bg-[#003366] text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Circulares Publicadas ({db.comunicados.length})</span>
        </button>

        <button
          onClick={() => setPestana('justificaciones')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            pestana === 'justificaciones'
              ? 'bg-[#003366] text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4 text-[#FFC107]" />
          <span>Justificantes de Padres ({(db.justificaciones || []).length})</span>
        </button>

        <button
          onClick={() => setPestana('padres')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            pestana === 'padres'
              ? 'bg-[#003366] text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Directorio de Acudientes ({db.acudientes.length})</span>
        </button>
      </div>

      {/* PESTAÑA 1: COMUNICADOS */}
      {pestana === 'comunicados' && (
        <div className="space-y-3">
          {db.comunicados.map((com) => {
            const porcentajeLectura =
              db.acudientes.length > 0
                ? Math.round((com.leidoPor.length / db.acudientes.length) * 100)
                : 0;

            return (
              <div
                key={com.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        com.prioridad === 'urgente'
                          ? 'bg-rose-100 text-rose-800'
                          : com.prioridad === 'importante'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-[#003366]'
                      }`}
                    >
                      {com.prioridad}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Fecha: {com.fecha} &bull; Destinatarios:{' '}
                      <strong>{com.destinatarios === 'todos' ? 'Todos los grados' : `${com.destinatarios} Grado`}</strong>
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{com.titulo}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {com.contenido}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    Emitido por: {com.remitente}
                  </span>
                </div>

                {/* Métricas de lectura */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Confirmación de Lectura
                    </span>
                    <span className="font-black text-sm text-[#003366]">
                      {com.leidoPor.length} de {db.acudientes.length} padres ({porcentajeLectura}%)
                    </span>
                  </div>

                  <button
                    onClick={() => eliminarComunicado(com.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Eliminar comunicado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PESTAÑA 2: JUSTIFICANTES RECIBIDOS */}
      {pestana === 'justificaciones' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-800">
              Justificantes de Inasistencia Enviados por los Acudientes
            </h3>
            <p className="text-xs text-slate-500">
              Al aprobar un justificante, la inasistencia se computa automáticamente como &ldquo;Justificada&rdquo; (J) para la auditoría de la Beca PASE-U.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {(!db.justificaciones || db.justificaciones.length === 0) ? (
              <div className="p-8 text-center text-slate-400 italic">
                No hay justificantes de inasistencia pendientes.
              </div>
            ) : (
              db.justificaciones.map((j) => {
                const estudiante = db.estudiantes.find((e) => e.id === j.estudianteId);
                const acudiente = db.acudientes.find((a) => a.id === j.acudienteId);

                return (
                  <div key={j.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {estudiante?.nombre || 'Estudiante'} ({estudiante?.grado}{estudiante?.grupo})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Fecha ausente: <strong>{j.fechaAusencia}</strong>
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Acudiente: <strong>{acudiente?.nombre || 'Tutor'}</strong> &bull; Motivo:{' '}
                        <span className="italic font-medium">&ldquo;{j.motivo}&rdquo;</span>
                      </p>
                      {j.observacionDocente && (
                        <p className="text-[11px] text-slate-500">
                          Respuesta: {j.observacionDocente}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          j.estado === 'aprobada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : j.estado === 'rechazada'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {j.estado}
                      </span>

                      {j.estado === 'pendiente' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => resolverJustificacion(j.id, 'aprobada')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => resolverJustificacion(j.id, 'rechazada')}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: DIRECTORIO DE ACUDIENTES */}
      {pestana === 'padres' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-800">
              Directorio y Credenciales de Padres de Familia
            </h3>
            <p className="text-xs text-slate-500">
              Los acudientes inician sesión en el Portal Familiar con su número de cédula y PIN de seguridad.
            </p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-3.5">Nombre del Acudiente</th>
                  <th className="py-3 px-3">Parentesco</th>
                  <th className="py-3 px-3 font-mono">Cédula (Usuario)</th>
                  <th className="py-3 px-3">PIN Acceso</th>
                  <th className="py-3 px-3">Hijos Vinculados</th>
                  <th className="py-3 px-3">Contacto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.acudientes.map((acu) => {
                  const hijos = db.estudiantes.filter((e) =>
                    acu.estudiantesIds.includes(e.id)
                  );

                  return (
                    <tr key={acu.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3.5 font-bold text-slate-800">
                        {acu.nombre}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{acu.parentesco}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#003366]">
                        {acu.cedula}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{acu.pin}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {hijos.map((h) => (
                            <span
                              key={h.id}
                              className="bg-blue-50 text-[#003366] text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200"
                            >
                              {h.nombre} ({h.grado}&ldquo;{h.grupo}&rdquo;)
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{acu.telefono}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nuevo Comunicado */}
      {modalNuevoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            <div className="bg-[#003366] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FFC107]" />
                <span>Redactar Comunicado Escolar</span>
              </h3>
              <button
                onClick={() => setModalNuevoAbierto(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={guardarNuevoComunicado} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Título del Comunicado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Convocatoria a Entrega de Boletines"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003366] font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nivel de Prioridad
                  </label>
                  <select
                    value={formPrioridad}
                    onChange={(e) => setFormPrioridad(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                  >
                    <option value="informativo">Informativo</option>
                    <option value="importante">Importante</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Destinatarios
                  </label>
                  <select
                    value={formDestinatarios}
                    onChange={(e) => setFormDestinatarios(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                  >
                    <option value="todos">Todos los Grados (1° - 6°)</option>
                    {GRADOS.map((g) => (
                      <option key={g} value={g}>
                        Solo {g} Grado
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contenido del Mensaje *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escriba los detalles de la circular, fecha, hora y requisitos..."
                  value={formContenido}
                  onChange={(e) => setFormContenido(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Remitente Oficial
                </label>
                <input
                  type="text"
                  value={formRemitente}
                  onChange={(e) => setFormRemitente(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalNuevoAbierto(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-4 h-4 text-[#FFC107]" />
                  <span>Publicar a los Padres</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
