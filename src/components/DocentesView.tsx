import React, { useState } from 'react';
import {
  GraduationCap,
  UserPlus,
  BookOpen,
  Award,
  Edit2,
  Trash2,
  Phone,
  X,
  Check,
} from 'lucide-react';
import {
  Docente,
  MATERIAS_CONSEJERO,
  MATERIAS_ESPECIALES,
  GRADOS,
  GRUPOS,
} from '../types';
import { AppDatabase } from '../utils/storage';

interface DocentesViewProps {
  db: AppDatabase;
  onUpdateDb: (db: AppDatabase) => void;
  onShowToast: (msg: string) => void;
}

export const DocentesView: React.FC<DocentesViewProps> = ({
  db,
  onUpdateDb,
  onShowToast,
}) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [docenteAEditar, setDocenteAEditar] = useState<Docente | null>(null);

  // Form states
  const [formNombre, setFormNombre] = useState('');
  const [formCedula, setFormCedula] = useState('');
  const [formTipo, setFormTipo] = useState<'consejero' | 'especial'>('consejero');
  const [formMaterias, setFormMaterias] = useState<string[]>([...MATERIAS_CONSEJERO]);
  const [formGradoTutor, setFormGradoTutor] = useState<string>('3°');
  const [formGrupoTutor, setFormGrupoTutor] = useState<string>('A');
  const [formTelefono, setFormTelefono] = useState('');

  const abrirModalNuevo = () => {
    setDocenteAEditar(null);
    setFormNombre('');
    setFormCedula('');
    setFormTipo('consejero');
    setFormMaterias([...MATERIAS_CONSEJERO]);
    setFormGradoTutor('1°');
    setFormGrupoTutor('A');
    setFormTelefono('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (doc: Docente) => {
    setDocenteAEditar(doc);
    setFormNombre(doc.nombre);
    setFormCedula(doc.cedula);
    setFormTipo(doc.tipo);
    setFormMaterias([...doc.materias]);
    setFormGradoTutor(doc.gradoTutor || '1°');
    setFormGrupoTutor(doc.grupoTutor || 'A');
    setFormTelefono(doc.telefono || '');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setDocenteAEditar(null);
  };

  const handleTipoChange = (nuevoTipo: 'consejero' | 'especial') => {
    setFormTipo(nuevoTipo);
    if (nuevoTipo === 'consejero') {
      setFormMaterias([...MATERIAS_CONSEJERO]);
    } else {
      setFormMaterias(['Inglés']);
    }
  };

  const toggleMateria = (materia: string) => {
    if (formMaterias.includes(materia)) {
      setFormMaterias(formMaterias.filter((m) => m !== materia));
    } else {
      setFormMaterias([...formMaterias, materia]);
    }
  };

  const guardarDocente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) {
      onShowToast('⚠️ El nombre del docente es obligatorio');
      return;
    }
    if (formMaterias.length === 0) {
      onShowToast('⚠️ Seleccione al menos una materia asignada');
      return;
    }

    if (docenteAEditar) {
      const actualizados = db.docentes.map((d) =>
        d.id === docenteAEditar.id
          ? {
              ...d,
              nombre: formNombre.trim(),
              cedula: formCedula.trim(),
              tipo: formTipo,
              materias: formMaterias,
              gradoTutor: formTipo === 'consejero' ? formGradoTutor : undefined,
              grupoTutor: formTipo === 'consejero' ? formGrupoTutor : undefined,
              telefono: formTelefono.trim(),
            }
          : d
      );
      onUpdateDb({ ...db, docentes: actualizados });
      onShowToast('✅ Docente actualizado con éxito');
    } else {
      const nuevo: Docente = {
        id: 'doc_' + Date.now(),
        nombre: formNombre.trim(),
        cedula: formCedula.trim(),
        tipo: formTipo,
        materias: formMaterias,
        gradoTutor: formTipo === 'consejero' ? formGradoTutor : undefined,
        grupoTutor: formTipo === 'consejero' ? formGrupoTutor : undefined,
        telefono: formTelefono.trim(),
      };
      onUpdateDb({ ...db, docentes: [...db.docentes, nuevo] });
      onShowToast('✅ Docente registrado en el plantel');
    }
    cerrarModal();
  };

  const eliminarDocente = (id: string, nombre: string) => {
    if (!window.confirm(`¿Está seguro de eliminar al docente "${nombre}"?`)) {
      return;
    }
    const nuevos = db.docentes.filter((d) => d.id !== id);
    onUpdateDb({ ...db, docentes: nuevos });
    onShowToast('🗑️ Docente eliminado');
  };

  const consejeros = db.docentes.filter((d) => d.tipo === 'consejero');
  const especiales = db.docentes.filter((d) => d.tipo === 'especial');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#003366]" />
            Cuerpo Docente de Primaria
          </h2>
          <p className="text-xs text-slate-500">
            {consejeros.length} Maestros Consejeros &bull; {especiales.length} Docentes Especiales
          </p>
        </div>

        <button
          onClick={abrirModalNuevo}
          className="inline-flex items-center gap-1.5 bg-[#003366] hover:bg-[#002244] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
        >
          <UserPlus className="w-4 h-4 text-[#FFC107]" />
          <span>Registrar Docente</span>
        </button>
      </div>

      {/* Explicación de roles MEDUCA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 font-bold text-xs text-[#003366] mb-1">
            <Award className="w-4 h-4 text-[#003366]" />
            <span>Maestros Consejeros (Grado Específico)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Responsables de la consejería del grado y de impartir las 6 asignaturas del plan nuclear:
            Español, Matemáticas, Ciencias Sociales, Ciencias Naturales, Expresiones Artísticas, y Religión.
          </p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-900 mb-1">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>Docentes Especiales (Áreas Complementarias)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Imparten asignaturas transversales en diferentes grados:
            Inglés, Educación Física, Educación para el Hogar, Agropecuaria, y Tecnología e Informática.
          </p>
        </div>
      </div>

      {/* Lista de Docentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {db.docentes.map((doc) => {
          const esConsejero = doc.tipo === 'consejero';
          return (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-blue-300 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        esConsejero
                          ? 'bg-blue-100 text-[#003366] border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {doc.nombre.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">{doc.nombre}</h3>
                      <p className="text-xs text-slate-500 font-mono">
                        Cédula: {doc.cedula || 'En trámite'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      esConsejero
                        ? 'bg-blue-50 text-[#003366] border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {esConsejero ? 'Consejero' : 'Especial'}
                  </span>
                </div>

                {/* Consejería asignada */}
                {esConsejero && doc.gradoTutor && (
                  <div className="mt-3 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Grado a su cargo:</span>
                    <span className="font-bold text-slate-800">
                      {doc.gradoTutor} &ldquo;{doc.grupoTutor}&rdquo;
                    </span>
                  </div>
                )}

                {/* Materias */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Materias que imparte ({doc.materias.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {doc.materias.map((mat) => (
                      <span
                        key={mat}
                        className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>

                {doc.telefono && (
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{doc.telefono}</span>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => abrirModalEditar(doc)}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-slate-100 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => eliminarDocente(doc.id, doc.nombre)}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 px-2 py-1 rounded hover:bg-rose-50 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Agregar / Editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-[#003366] text-white p-4 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#FFC107]" />
                {docenteAEditar ? 'Editar Docente' : 'Registrar Nuevo Docente'}
              </h3>
              <button onClick={cerrarModal} className="text-white/80 hover:text-white p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={guardarDocente} className="p-5 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo del Educador *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Profa. Carmen Samudio de Morales"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cédula de Identidad
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 4-189-423"
                    value={formCedula}
                    onChange={(e) => setFormCedula(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teléfono Celular
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 6700-1122"
                    value={formTelefono}
                    onChange={(e) => setFormTelefono(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#003366] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tipo de Docente (MEDUCA)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTipoChange('consejero')}
                    className={`p-2.5 rounded-lg border text-center font-bold transition flex items-center justify-center gap-1.5 ${
                      formTipo === 'consejero'
                        ? 'bg-[#003366] text-white border-[#003366]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🎓 Consejero (6 Asignaturas)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTipoChange('especial')}
                    className={`p-2.5 rounded-lg border text-center font-bold transition flex items-center justify-center gap-1.5 ${
                      formTipo === 'especial'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>⭐ Especialista</span>
                  </button>
                </div>
              </div>

              {formTipo === 'consejero' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-700 mb-2">
                    Grado de Consejería Asignado
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Grado</label>
                      <select
                        value={formGradoTutor}
                        onChange={(e) => setFormGradoTutor(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                      >
                        {GRADOS.map((g) => (
                          <option key={g} value={g}>
                            {g} Grado
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Grupo</label>
                      <select
                        value={formGrupoTutor}
                        onChange={(e) => setFormGrupoTutor(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                      >
                        {GRUPOS.map((g) => (
                          <option key={g} value={g}>
                            Grupo {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Selección de materias */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">
                    Materias Asignadas *
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {formMaterias.length} seleccionada(s)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {(formTipo === 'consejero' ? MATERIAS_CONSEJERO : MATERIAS_ESPECIALES).map(
                    (mat) => {
                      const selected = formMaterias.includes(mat);
                      return (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => toggleMateria(mat)}
                          className={`p-2 rounded-lg text-left text-xs font-medium flex items-center justify-between transition border ${
                            selected
                              ? 'bg-blue-100 text-[#003366] border-blue-300 font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{mat}</span>
                          {selected && <Check className="w-3.5 h-3.5 text-[#003366] shrink-0" />}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-xl font-bold transition shadow-xs"
                >
                  {docenteAEditar ? 'Guardar Cambios' : 'Registrar Docente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
