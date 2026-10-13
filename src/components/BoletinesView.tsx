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
} from 'lucide-react';
import { GRADOS, GRUPOS } from '../types';
import { AppDatabase } from '../utils/storage';
import {
  calcularPromedioGeneralTrimestre,
  calcularPromedioGeneralAnual,
  calcularAsistenciaEstudiante,
} from '../utils/calculations';

interface BoletinesViewProps {
  db: AppDatabase;
  onOpenBoletin: (estudianteId: string) => void;
  onShowToast: (msg: string) => void;
}

export const BoletinesView: React.FC<BoletinesViewProps> = ({
  db,
  onOpenBoletin,
  onShowToast,
}) => {
  const [gradoSeleccionado, setGradoSeleccionado] = useState<string>('3°');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>('A');
  const [busqueda, setBusqueda] = useState('');

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
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#003366]" />
            Emisión de Boletines Oficiales de Primaria
          </h2>
          <p className="text-xs text-slate-500">
            Generación e impresión de libretas de calificaciones con formato normado por MEDUCA.
          </p>
        </div>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
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
                    className="w-full bg-[#003366] hover:bg-[#002244] text-white py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#FFC107]" />
                    <span>Ver Boletín Oficial</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
