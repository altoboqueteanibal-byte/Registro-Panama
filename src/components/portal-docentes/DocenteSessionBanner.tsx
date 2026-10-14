import React from 'react';
import {
  GraduationCap,
  Mail,
  Layers,
  LogOut,
  ShieldCheck,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { Docente, GrupoAsignado } from '../../types';

interface DocenteSessionBannerProps {
  docente: Docente;
  grupoActivo: GrupoAsignado;
  onSelectGrupoActivo: (grupo: GrupoAsignado) => void;
  onLogoutDocente: () => void;
}

export const DocenteSessionBanner: React.FC<DocenteSessionBannerProps> = ({
  docente,
  grupoActivo,
  onSelectGrupoActivo,
  onLogoutDocente,
}) => {
  const esConsejero = docente.tipo === 'consejero';
  const gruposDisponibles: GrupoAsignado[] = esConsejero
    ? [{ grado: docente.gradoTutor || '1°', grupo: docente.grupoTutor || 'A' }]
    : docente.gruposAsignados && docente.gruposAsignados.length > 0
    ? docente.gruposAsignados
    : [{ grado: '1°', grupo: 'A' }];

  return (
    <div className="bg-gradient-to-r from-[#002244] via-[#003366] to-[#004080] text-white p-3.5 sm:px-5 sm:py-3 rounded-2xl shadow-sm border border-blue-900/50 mb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in">
      {/* Información del Docente */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-inner">
          <GraduationCap className="w-5 h-5" />
        </div>

        <div className="leading-tight min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
              {esConsejero ? 'Maestro Consejero' : 'Docente Especial (Varios Grupos)'}
            </span>
            <span className="text-[11px] text-blue-200 font-mono truncate">
              {docente.correo}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">
            {docente.nombre}
          </h3>

          <p className="text-[11px] text-blue-200 truncate">
            Asignaturas a su cargo: <strong>{docente.materias.join(', ')}</strong>
          </p>
        </div>
      </div>

      {/* Selector de Grupo Asignado & Cerrar Sesión */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
        {/* Selector de Grupo */}
        <div className="flex items-center gap-1.5 bg-[#001830] px-3 py-1.5 rounded-xl border border-blue-400/30 text-xs">
          <Layers className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-blue-300 font-semibold hidden sm:inline">
            Grupo Activo:
          </span>

          {esConsejero ? (
            <span className="font-black text-amber-300">
              {docente.gradoTutor} &ldquo;{docente.grupoTutor}&rdquo;
            </span>
          ) : (
            <select
              value={`${grupoActivo.grado}-${grupoActivo.grupo}`}
              onChange={(e) => {
                const [grado, grupo] = e.target.value.split('-');
                onSelectGrupoActivo({ grado, grupo });
              }}
              className="bg-transparent text-amber-300 font-black outline-none cursor-pointer pr-1"
            >
              {gruposDisponibles.map((g) => (
                <option
                  key={`${g.grado}-${g.grupo}`}
                  value={`${g.grado}-${g.grupo}`}
                  className="bg-[#002244] text-white"
                >
                  Grado {g.grado} &ldquo;{g.grupo}&rdquo;
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Botón Salir / Cambiar a Modo Administrador */}
        <button
          onClick={onLogoutDocente}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition border border-white/20 flex items-center gap-1.5 shadow-xs"
          title="Cerrar sesión de docente y volver a administración general"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-300" />
          <span className="hidden sm:inline">Salir de Aula</span>
        </button>
      </div>
    </div>
  );
};
