import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  FileText,
  IdCard,
  Phone,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { Estudiante, GRADOS, GRUPOS } from '../types';
import { AppDatabase } from '../utils/storage';
import {
  calcularPromedioGeneralTrimestre,
  calcularAsistenciaEstudiante,
} from '../utils/calculations';

interface EstudiantesViewProps {
  db: AppDatabase;
  onUpdateDb: (db: AppDatabase) => void;
  onOpenBoletin: (estudianteId: string) => void;
  onOpenCarnet: (estudianteId: string) => void;
  onShowToast: (msg: string) => void;
}

export const EstudiantesView: React.FC<EstudiantesViewProps> = ({
  db,
  onUpdateDb,
  onOpenBoletin,
  onOpenCarnet,
  onShowToast,
}) => {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroGrado, setFiltroGrado] = useState<string>('todos');
  const [filtroGrupo, setFiltroGrupo] = useState<string>('todos');

  // Modal para agregar o editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [estudianteAEditar, setEstudianteAEditar] = useState<Estudiante | null>(null);

  // Formulario temporal
  const [formNombre, setFormNombre] = useState('');
  const [formCedula, setFormCedula] = useState('');
  const [formGrado, setFormGrado] = useState<string>('1°');
  const [formGrupo, setFormGrupo] = useState<string>('A');
  const [formGenero, setFormGenero] = useState<'M' | 'F'>('M');
  const [formAcudiente, setFormAcudiente] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formFechaNac, setFormFechaNac] = useState('');

  const abrirModalNuevo = () => {
    setEstudianteAEditar(null);
    setFormNombre('');
    setFormCedula('');
    setFormGrado('1°');
    setFormGrupo('A');
    setFormGenero('M');
    setFormAcudiente('');
    setFormTelefono('');
    setFormFechaNac('2018-01-01');
    setModalAbierto(true);
  };

  const abrirModalEditar = (est: Estudiante) => {
    setEstudianteAEditar(est);
    setFormNombre(est.nombre);
    setFormCedula(est.cedula);
    setFormGrado(est.grado);
    setFormGrupo(est.grupo);
    setFormGenero(est.genero || 'M');
    setFormAcudiente(est.acudiente || '');
    setFormTelefono(est.telefono || '');
    setFormFechaNac(est.fechaNacimiento || '');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEstudianteAEditar(null);
  };

  const guardarEstudiante = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formCedula.trim()) {
      onShowToast('⚠️ El nombre y la cédula son obligatorios');
      return;
    }

    if (estudianteAEditar) {
      // Editar
      const actualizados = db.estudiantes.map((est) =>
        est.id === estudianteAEditar.id
          ? {
              ...est,
              nombre: formNombre.trim(),
              cedula: formCedula.trim(),
              grado: formGrado,
              grupo: formGrupo,
              genero: formGenero,
              acudiente: formAcudiente.trim(),
              telefono: formTelefono.trim(),
              fechaNacimiento: formFechaNac,
            }
          : est
      );
      onUpdateDb({ ...db, estudiantes: actualizados });
      onShowToast('✅ Estudiante actualizado con éxito');
    } else {
      // Nuevo
      const nuevo: Estudiante = {
        id: 'est_' + Date.now(),
        nombre: formNombre.trim(),
        cedula: formCedula.trim(),
        grado: formGrado,
        grupo: formGrupo,
        genero: formGenero,
        acudiente: formAcudiente.trim(),
        telefono: formTelefono.trim(),
        fechaNacimiento: formFechaNac,
        annoLectivo: db.annoLectivo,
      };
      onUpdateDb({ ...db, estudiantes: [...db.estudiantes, nuevo] });
      onShowToast('✅ Estudiante registrado en el sistema');
    }
    cerrarModal();
  };

  const eliminarEstudiante = (id: string, nombre: string) => {
    if (
      !window.confirm(
        `¿Está seguro de eliminar al estudiante "${nombre}"? Esta acción borrará todas sus calificaciones y registros de asistencia.`
      )
    ) {
      return;
    }

    const nuevosEstudiantes = db.estudiantes.filter((e) => e.id !== id);
    const nuevasCalificaciones = db.calificaciones.filter((c) => c.estudianteId !== id);
    const nuevasAsistencias = db.asistencia.filter((a) => a.estudianteId !== id);

    onUpdateDb({
      ...db,
      estudiantes: nuevosEstudiantes,
      calificaciones: nuevasCalificaciones,
      asistencia: nuevasAsistencias,
    });
    onShowToast('🗑️ Estudiante eliminado del sistema');
  };

  // Filtrado
  const estudiantesFiltrados = db.estudiantes.filter((e) => {
    const coincideTexto =
      e.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      e.cedula.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      (e.acudiente && e.acudiente.toLowerCase().includes(filtroTexto.toLowerCase()));

    const coincideGrado = filtroGrado === 'todos' || e.grado === filtroGrado;
    const coincideGrupo = filtroGrupo === 'todos' || e.grupo === filtroGrupo;

    return coincideTexto && coincideGrado && coincideGrupo;
  });

  return (
    <div className="space-y-5">
      {/* Barra de cabecera con botón de agregar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#003366]" />
            Directorio de Estudiantes Matriculados
          </h2>
          <p className="text-xs text-slate-500">
            Total en registro: {db.estudiantes.length} estudiantes &bull; Nivel Primaria (1° a 6°)
          </p>
        </div>

        <button
          onClick={abrirModalNuevo}
          className="inline-flex items-center gap-1.5 bg-[#003366] hover:bg-[#002244] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
        >
          <UserPlus className="w-4 h-4 text-[#FFC107]" />
          <span>Matricular Estudiante</span>
        </button>
      </div>

      {/* Filtros de búsqueda */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        {/* Input búsqueda */}
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula (ej. 4-820-112) o acudiente..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003366] transition"
          />
        </div>

        {/* Filtro Grado */}
        <div>
          <select
            value={filtroGrado}
            onChange={(e) => setFiltroGrado(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003366] transition text-slate-700 font-medium"
          >
            <option value="todos">Todos los Grados (1° - 6°)</option>
            {GRADOS.map((g) => (
              <option key={g} value={g}>
                Grado {g}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Grupo */}
        <div>
          <select
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003366] transition text-slate-700 font-medium"
          >
            <option value="todos">Todos los Grupos (A - D)</option>
            {GRUPOS.map((g) => (
              <option key={g} value={g}>
                Grupo {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Estudiantes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-3 px-3.5">Estudiante</th>
                <th className="py-3 px-3">Cédula</th>
                <th className="py-3 px-3 text-center">Grado / Grupo</th>
                <th className="py-3 px-3">Acudiente y Contacto</th>
                <th className="py-3 px-3 text-center">Promedio (T{db.trimestreActual})</th>
                <th className="py-3 px-3 text-center">PASE-U (Asist.)</th>
                <th className="py-3 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estudiantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron estudiantes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                estudiantesFiltrados.map((est) => {
                  const promT = calcularPromedioGeneralTrimestre(
                    est.id,
                    db.trimestreActual,
                    db.calificaciones,
                    db.annoLectivo
                  );
                  const asis = calcularAsistenciaEstudiante(
                    est.id,
                    db.asistencia,
                    db.annoLectivo
                  );

                  return (
                    <tr key={est.id} className="hover:bg-slate-50 transition">
                      {/* Nombre y avatar */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                            est.genero === 'F'
                              ? 'bg-pink-100 text-pink-700 border border-pink-200'
                              : 'bg-blue-100 text-[#003366] border border-blue-200'
                          }`}>
                            {est.nombre.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{est.nombre}</p>
                            <span className="text-[10px] text-slate-400">
                              Año {est.annoLectivo}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cédula */}
                      <td className="py-3 px-3 font-mono font-medium text-slate-700">
                        {est.cedula}
                      </td>

                      {/* Grado / Grupo */}
                      <td className="py-3 px-3 text-center">
                        <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200">
                          {est.grado} &ldquo;{est.grupo}&rdquo;
                        </span>
                      </td>

                      {/* Acudiente */}
                      <td className="py-3 px-3 text-slate-600">
                        <p className="font-medium text-slate-700">{est.acudiente || 'No registrado'}</p>
                        {est.telefono && (
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {est.telefono}
                          </p>
                        )}
                      </td>

                      {/* Promedio */}
                      <td className="py-3 px-3 text-center">
                        {promT !== null ? (
                          <span
                            className={`font-black text-xs px-2 py-0.5 rounded ${
                              promT >= 3.0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {promT.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Sin notas</span>
                        )}
                      </td>

                      {/* PASE-U */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            asis.paseuAprobado
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                          title={asis.paseuMensaje}
                        >
                          {asis.paseuAprobado ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span>{asis.porcentaje}%</span>
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenBoletin(est.id)}
                            className="p-1.5 text-slate-600 hover:text-[#003366] hover:bg-blue-50 rounded-lg transition"
                            title="Ver Boletín Oficial de Calificaciones"
                          >
                            <FileText className="w-4 h-4 text-[#003366]" />
                          </button>
                          <button
                            onClick={() => onOpenCarnet(est.id)}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Generar Carnet Estudiantil"
                          >
                            <IdCard className="w-4 h-4 text-amber-600" />
                          </button>
                          <button
                            onClick={() => abrirModalEditar(est)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                            title="Editar Datos"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => eliminarEstudiante(est.id, est.nombre)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Eliminar Estudiante"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal Agregar/Editar Estudiante */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            {/* Header del modal */}
            <div className="bg-[#003366] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FFC107]" />
                {estudianteAEditar ? 'Editar Estudiante' : 'Matricular Nuevo Estudiante'}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={guardarEstudiante} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo del Estudiante *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan David González Morales"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cédula Panameña / ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 4-821-1402"
                    value={formCedula}
                    onChange={(e) => setFormCedula(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Género
                  </label>
                  <select
                    value={formGenero}
                    onChange={(e) => setFormGenero(e.target.value as 'M' | 'F')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Grado de Primaria
                  </label>
                  <select
                    value={formGrado}
                    onChange={(e) => setFormGrado(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white font-bold"
                  >
                    {GRADOS.map((g) => (
                      <option key={g} value={g}>
                        Grado {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Grupo / Sección
                  </label>
                  <select
                    value={formGrupo}
                    onChange={(e) => setFormGrupo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white font-bold"
                  >
                    {GRUPOS.map((g) => (
                      <option key={g} value={g}>
                        Grupo {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre del Acudiente / Tutor Legal
                </label>
                <input
                  type="text"
                  placeholder="Ej: Marta Morales de González"
                  value={formAcudiente}
                  onChange={(e) => setFormAcudiente(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 6745-1234"
                    value={formTelefono}
                    onChange={(e) => setFormTelefono(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formFechaNac}
                    onChange={(e) => setFormFechaNac(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <span>{estudianteAEditar ? 'Guardar Cambios' : 'Registrar Matrícula'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
