import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Award,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  User,
  X,
  Layers,
} from 'lucide-react';
import { GRADOS, GRUPOS, Docente, GrupoAsignado } from '../types';
import { AppDatabase } from '../utils/storage';
import {
  calcularPromedioGeneralTrimestre,
  calcularPromedioGeneralAnual,
  calcularAsistenciaEstudiante,
} from '../utils/calculations';
import { BoletinHojaA4 } from './BoletinHojaA4';

interface BoletinesViewProps {
  db: AppDatabase;
  onOpenBoletin: (estudianteId: string) => void;
  onShowToast: (msg: string) => void;
  docenteActivo?: Docente | null;
}

export const BoletinesView: React.FC<BoletinesViewProps> = ({
  db,
  onOpenBoletin,
  onShowToast,
  docenteActivo = null,
}) => {
  const esConsejero = docenteActivo?.tipo === 'consejero';
  const esEspecial = docenteActivo?.tipo === 'especial';

  const gruposDocente: GrupoAsignado[] = esConsejero
    ? [{ grado: docenteActivo.gradoTutor || '3°', grupo: docenteActivo.grupoTutor || 'A' }]
    : esEspecial && docenteActivo.gruposAsignados && docenteActivo.gruposAsignados.length > 0
    ? docenteActivo.gruposAsignados
    : [];

  const defaultGrado = esConsejero
    ? docenteActivo.gradoTutor || '3°'
    : esEspecial && gruposDocente.length > 0
    ? gruposDocente[0].grado
    : '3°';

  const defaultGrupo = esConsejero
    ? docenteActivo.grupoTutor || 'A'
    : esEspecial && gruposDocente.length > 0
    ? gruposDocente[0].grupo
    : 'A';

  const [gradoSeleccionado, setGradoSeleccionado] = useState<string>(defaultGrado);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>(defaultGrupo);
  const [busqueda, setBusqueda] = useState('');
  const [modalImpresionLoteA4, setModalImpresionLoteA4] = useState(false);

  React.useEffect(() => {
    if (docenteActivo) {
      if (esConsejero && docenteActivo.gradoTutor && docenteActivo.grupoTutor) {
        setGradoSeleccionado(docenteActivo.gradoTutor);
        setGrupoSeleccionado(docenteActivo.grupoTutor);
      } else if (esEspecial && gruposDocente.length > 0) {
        setGradoSeleccionado(gruposDocente[0].grado);
        setGrupoSeleccionado(gruposDocente[0].grupo);
      }
    }
  }, [docenteActivo]);

  const estudiantesFiltrados = db.estudiantes.filter((e) => {
    const coincideGrado = e.grado === gradoSeleccionado;
    const coincideGrupo = e.grupo === grupoSeleccionado;
    const coincideTexto =
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.cedula.toLowerCase().includes(busqueda.toLowerCase());
    return coincideGrado && coincideGrupo && coincideTexto;
  });

  return (
    <div className="space-y-6">
      {/* Banner docente */}
      {docenteActivo && (
        <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl text-xs flex items-center justify-between gap-2">
          <span className="text-amber-950 font-bold">
            {esConsejero ? (
              <>🎓 Emisión de Boletines: <strong>{docenteActivo.nombre}</strong> — Grupo asignado de consejería ({docenteActivo.gradoTutor} &ldquo;{docenteActivo.grupoTutor}&rdquo;)</>
            ) : (
              <>⭐ Emisión de Boletines: <strong>{docenteActivo.nombre}</strong> — <strong>{gruposDocente.length} grupos asignados</strong> ({docenteActivo.materias.join(', ')})</>
            )}
          </span>
          <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 shrink-0">
            {docenteActivo.correo}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#003366]" />
              Emisión de Boletines Oficiales de Primaria
            </h2>
            <span className="hidden sm:inline-block text-[10px] font-extrabold bg-blue-100 text-[#003366] px-2 py-0.5 rounded-md uppercase">
              Formato A4
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Generación e impresión de libretas de calificaciones normalizadas en papel A4 (210 x 297 mm).
          </p>
        </div>

        {/* Acciones y Filtros rápidos */}
        <div className="flex flex-wrap items-center gap-2 text-xs w-full lg:w-auto">
          {/* Botón de Impresión de Grupo Completo en Lote A4 */}
          <button
            onClick={() => setModalImpresionLoteA4(true)}
            disabled={estudiantesFiltrados.length === 0}
            className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Imprimir todos los boletines de este grupo en hojas A4 consecutivas"
          >
            <Printer className="w-4 h-4 text-[#FFC107]" />
            <span>Imprimir Grupo en A4 ({estudiantesFiltrados.length})</span>
          </button>

          {docenteActivo && esConsejero ? (
            <div className="p-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-800">
              Grado {gradoSeleccionado} &ldquo;{grupoSeleccionado}&rdquo; (Consejería)
            </div>
          ) : docenteActivo && esEspecial ? (
            <select
              value={`${gradoSeleccionado}-${grupoSeleccionado}`}
              onChange={(e) => {
                const [g, grp] = e.target.value.split('-');
                setGradoSeleccionado(g);
                setGrupoSeleccionado(grp);
              }}
              className="p-2 bg-amber-50 border border-amber-300 rounded-lg outline-none font-bold text-slate-800"
            >
              {gruposDocente.map((ga) => (
                <option key={`${ga.grado}-${ga.grupo}`} value={`${ga.grado}-${ga.grupo}`}>
                  Grado {ga.grado} &ldquo;{ga.grupo}&rdquo;
                </option>
              ))}
            </select>
          ) : (
            <>
              <select
                value={gradoSeleccionado}
                onChange={(e) => setGradoSeleccionado(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-700"
              >
                {GRADOS.map((g) => (
                  <option key={g} value={g}>
                    Grado {g}
                  </option>
                ))}
              </select>

              <select
                value={grupoSeleccionado}
                onChange={(e) => setGrupoSeleccionado(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-700"
              >
                {GRUPOS.map((g) => (
                  <option key={g} value={g}>
                    Grupo {g}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar estudiante en este grupo por nombre o cédula..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-[#003366] shadow-xs"
        />
      </div>

      {/* Listado de tarjetas de boletines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {estudiantesFiltrados.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            No se encontraron estudiantes para los filtros seleccionados.
          </div>
        ) : (
          estudiantesFiltrados.map((est) => {
            const t1 = calcularPromedioGeneralTrimestre(est.id, 1, db.calificaciones, db.annoLectivo);
            const t2 = calcularPromedioGeneralTrimestre(est.id, 2, db.calificaciones, db.annoLectivo);
            const t3 = calcularPromedioGeneralTrimestre(est.id, 3, db.calificaciones, db.annoLectivo);
            const anual = calcularPromedioGeneralAnual(est.id, db.calificaciones, db.annoLectivo);
            const asis = calcularAsistenciaEstudiante(est.id, db.asistencia, db.annoLectivo);

            const esCuadroHonor = anual !== null && anual >= 4.5;
            const reprobado = anual !== null && anual < 3.0;

            return (
              <div
                key={est.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-[#003366] transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold bg-blue-50 text-[#003366] px-2 py-0.5 rounded border border-blue-200">
                          {est.grado} &ldquo;{est.grupo}&rdquo;
                        </span>
                        {esCuadroHonor && (
                          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-300">
                            <Award className="w-3 h-3 text-amber-600" />
                            Honor
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {est.nombre}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Cédula: {est.cedula}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Promedio Anual
                      </span>
                      <span
                        className={`text-xl font-black ${
                          anual === null
                            ? 'text-slate-400'
                            : anual >= 3.0
                            ? 'text-[#003366]'
                            : 'text-rose-600'
                        }`}
                      >
                        {anual !== null ? anual.toFixed(2) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Resumen de los 3 trimestres */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-2 bg-slate-50 rounded-lg text-center text-xs border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Trimestre I</span>
                      <span className="font-bold text-slate-800">
                        {t1 !== null ? t1.toFixed(1) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Trimestre II</span>
                      <span className="font-bold text-slate-800">
                        {t2 !== null ? t2.toFixed(1) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Trimestre III</span>
                      <span className="font-bold text-slate-800">
                        {t3 !== null ? t3.toFixed(1) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Asistencia PASE-U indicator */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                      <span>Asistencia PASE-U:</span>
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        asis.paseuAprobado
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-rose-700 bg-rose-50'
                      }`}
                    >
                      {asis.porcentaje}% ({asis.paseuAprobado ? 'Cumple' : 'Alerta'})
                    </span>
                  </div>
                </div>

                {/* Botón de Abrir Boletín */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onOpenBoletin(est.id)}
                    className="w-full bg-[#003366] hover:bg-[#002244] text-white py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#FFC107]" />
                    <span>Ver Boletín A4 Individual</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE IMPRESIÓN MASIVA EN FORMATO A4 */}
      {modalImpresionLoteA4 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/85 backdrop-blur-xs flex flex-col items-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
          {/* Header de herramientas de impresión (no-print) */}
          <div className="w-full max-w-4xl bg-[#003366] text-white p-3 sm:px-6 sm:py-3.5 rounded-t-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 no-print sticky top-2 z-50 border border-blue-400/30">
            <div className="flex items-center gap-2.5">
              <Printer className="w-5 h-5 text-[#FFC107]" />
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  Impresión Masiva de Boletines Oficiales en A4
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded uppercase">
                    A4 Paginado
                  </span>
                </h3>
                <p className="text-[11px] text-blue-200">
                  Grado {gradoSeleccionado} &ldquo;{grupoSeleccionado}&rdquo; &bull; {estudiantesFiltrados.length} Estudiantes (1 hoja A4 por alumno)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs py-2 px-4 rounded-xl flex items-center gap-2 transition shadow-md cursor-pointer"
                title="Imprimir todos los boletines en hojas A4 independientes"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Todo el Lote A4 ({estudiantesFiltrados.length} Hojas)</span>
              </button>
              <button
                onClick={() => setModalImpresionLoteA4(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
                title="Cerrar vista de impresión en lote"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Listado de boletines en hojas A4 consecutivas */}
          <div className="w-full max-w-4xl bg-slate-200/60 rounded-b-2xl p-4 space-y-6 print:p-0 print:m-0 print:bg-white print:space-y-0 print:max-w-none">
            {estudiantesFiltrados.map((est) => (
              <BoletinHojaA4
                key={est.id}
                db={db}
                estudiante={est}
                esHojaUnica={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
