import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  CalendarCheck,
  FileText,
  Bell,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  School,
  Zap,
  Settings,
  ShieldCheck,
  X,
  Sparkles,
  LogOut,
  Layers,
  CheckCircle2,
  Lock,
  Calendar,
  History,
} from 'lucide-react';
import { ViewType } from './Navbar';
import { AppDatabase, obtenerDocenteOfflineRegistrado } from '../utils/storage';
import { Docente } from '../types';

interface NavItem {
  id: ViewType;
  label: string;
  shortLabel: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface GrupoNav {
  categoria: string;
  items: NavItem[];
}

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenPortalPadres: () => void;
  onOpenLoginDocente: () => void;
  onLogoutDocente?: () => void;
  docenteActivo?: Docente | null;
  onOpenAccionesRapidas: () => void;
  onOpenConfig: () => void;
  db: AppDatabase;
  esAdminAutenticado?: boolean;
  onLogoutAdmin?: () => void;
  onSwitchToGateway?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
  onOpenPortalPadres,
  onOpenLoginDocente,
  onLogoutDocente,
  docenteActivo = null,
  onOpenAccionesRapidas,
  onOpenConfig,
  db,
  esAdminAutenticado = false,
  onLogoutAdmin,
  onSwitchToGateway,
}) => {
  // Conteo de estudiantes y comunicados
  const totalEstudiantes = db.estudiantes.length;
  const totalComunicados = db.comunicados.length;
  const docenteOffline = obtenerDocenteOfflineRegistrado();

  const gruposNavegacion: GrupoNav[] = [
    {
      categoria: 'Gestión Principal',
      items: [
        {
          id: 'dashboard' as ViewType,
          label: 'Panel de Control',
          shortLabel: 'Inicio',
          icon: LayoutDashboard,
          badge: undefined,
        },
        {
          id: 'estudiantes' as ViewType,
          label: 'Estudiantes',
          shortLabel: 'Alumnos',
          icon: Users,
          badge: totalEstudiantes.toString(),
        },
        {
          id: 'docentes' as ViewType,
          label: 'Cuerpo Docente',
          shortLabel: 'Docentes',
          icon: GraduationCap,
          badge: db.docentes.length.toString(),
        },
      ],
    },
    {
      categoria: 'Evaluación & Control',
      items: [
        {
          id: 'notas' as ViewType,
          label: 'Notas Diarias',
          shortLabel: 'Notas',
          icon: ClipboardList,
          badge: docenteActivo ? `T${db.trimestreActual}` : '🔒 Protegido',
          badgeColor: docenteActivo
            ? undefined
            : 'text-amber-300 bg-amber-950/80 border-amber-500/40',
        },
        {
          id: 'asistencia' as ViewType,
          label: 'Asistencia & PASE-U',
          shortLabel: 'Asistencia',
          icon: CalendarCheck,
          badge: docenteActivo ? '90%' : '🔒 Protegido',
          badgeColor: docenteActivo
            ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
            : 'text-amber-300 bg-amber-950/80 border-amber-500/40',
        },
        {
          id: 'boletines' as ViewType,
          label: 'Boletines Oficiales',
          shortLabel: 'Boletines',
          icon: FileText,
          badge: undefined,
        },
      ],
    },
    {
      categoria: 'Comunidad Escolar',
      items: [
        {
          id: 'comunicados' as ViewType,
          label: 'Circulares y Avisos',
          shortLabel: 'Avisos',
          icon: Bell,
          badge: totalComunicados > 0 ? totalComunicados.toString() : undefined,
          badgeColor: 'text-amber-300 bg-amber-950/80 border-amber-500/30',
        },
      ],
    },
    {
      categoria: 'Supervisión Directiva',
      items: [
        {
          id: 'periodos' as ViewType,
          label: 'Períodos & Cierre',
          shortLabel: 'Períodos',
          icon: Calendar,
          badge: `T${db.trimestreActual}`,
        },
        {
          id: 'auditoria' as ViewType,
          label: 'Bitácora de Auditoría',
          shortLabel: 'Auditoría',
          icon: History,
          badge: (db.auditoriaNotas?.length || 0).toString(),
          badgeColor: 'text-blue-300 bg-blue-950/80 border-blue-500/30',
        },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop overlay para pantallas móviles */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-xs transition-opacity animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Contenedor del Menú Lateral */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-gradient-to-b from-[#002244] via-[#003366] to-[#001830] text-white shadow-2xl transition-all duration-300 ease-in-out no-print border-r border-blue-900/40 ${
          /* En móvil: drawer deslizante. En desktop: ancho según colapso */
          isOpenMobile
            ? 'translate-x-0 w-72'
            : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[76px]' : 'lg:w-[268px]'}`}
      >
        {/* CABECERA DEL SIDEBAR */}
        <div className="p-3.5 border-b border-blue-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#001830] to-[#004080] border-2 border-[#FFC107] flex items-center justify-center shrink-0 shadow-inner">
              <School className="w-5 h-5 text-[#FFC107]" />
            </div>

            {(!isCollapsed || isOpenMobile) && (
              <div className="min-w-0 leading-tight animate-in fade-in duration-200">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 bg-[#001830]/80 px-1.5 py-0.5 rounded border border-amber-400/30 block w-max">
                  MEDUCA Panamá
                </span>
                <h2 className="text-xs font-bold text-white truncate mt-0.5">
                  {db.escuela.nombrePlantel}
                </h2>
                <p className="text-[10px] text-blue-300 truncate">
                  RUE Primaria &bull; {db.annoLectivo}
                </p>
              </div>
            )}
          </div>

          {/* Botón para cerrar en móvil */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800/50 lg:hidden"
            title="Cerrar Menú"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Botón para colapsar / expandir en desktop */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-white/10 transition"
            title={isCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-amber-300" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* BOTÓN DE ACCIÓN RÁPIDA / MODAL LAUNCHER */}
        <div className="p-3 shrink-0">
          <button
            onClick={() => {
              onOpenAccionesRapidas();
              if (isOpenMobile) onCloseMobile();
            }}
            className={`w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black transition-all shadow-md flex items-center justify-center gap-2 group ${
              isCollapsed && !isOpenMobile ? 'p-2.5' : ''
            }`}
            title="Abrir Centro de Acciones Rápidas (Modal)"
          >
            <Zap className="w-4 h-4 text-slate-950 fill-current shrink-0 group-hover:scale-110 transition-transform" />
            {(!isCollapsed || isOpenMobile) && (
              <span className="text-xs tracking-tight truncate">
                ⚡ Acciones Rápidas
              </span>
            )}
          </button>
        </div>

        {/* LISTADO DE ITEMS DE NAVEGACIÓN */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 text-xs scrollbar-thin scrollbar-thumb-blue-800">
          {gruposNavegacion.map((grupo, gIdx) => (
            <div key={grupo.categoria} className="space-y-1">
              {/* Título de categoría (solo si expandido) */}
              {(!isCollapsed || isOpenMobile) ? (
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-300/70">
                  {grupo.categoria}
                </div>
              ) : (
                gIdx > 0 && <div className="border-t border-blue-800/40 my-2" />
              )}

              {/* Items */}
              {grupo.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectView(item.id);
                      if (isOpenMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-white/20 to-white/10 text-white border-l-4 border-l-[#FFC107] shadow-inner'
                        : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                    } ${isCollapsed && !isOpenMobile ? 'justify-center px-0' : ''}`}
                    title={item.label}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#FFC107]' : 'text-blue-300'
                      }`}
                    />

                    {(!isCollapsed || isOpenMobile) && (
                      <span className="truncate flex-1 text-left text-xs">
                        {item.label}
                      </span>
                    )}

                    {/* Badges */}
                    {item.badge && (!isCollapsed || isOpenMobile) && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border shrink-0 ${
                          item.badgeColor ||
                          'bg-blue-950/60 text-blue-200 border-blue-400/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip flotante en modo colapsado para desktop */}
                    {isCollapsed && !isOpenMobile && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-slate-700 font-bold">
                        {item.label}
                        {item.badge && ` (${item.badge})`}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* ACCESO OFICIAL AULA VIRTUAL DOCENTE */}
          <div className="pt-2 border-t border-blue-800/40">
            {(!isCollapsed || isOpenMobile) && (
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-300/80 flex items-center justify-between">
                <span>Aula Docente</span>
                {docenteActivo && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                    Conectado
                  </span>
                )}
              </div>
            )}

            {docenteActivo ? (
              <div
                className={`rounded-xl border transition-all ${
                  isCollapsed && !isOpenMobile
                    ? 'p-2 bg-emerald-950/40 border-emerald-500/40 text-center relative group'
                    : 'p-2.5 bg-gradient-to-r from-blue-900/60 to-[#002244] border-blue-400/30'
                }`}
              >
                {isCollapsed && !isOpenMobile ? (
                  <button
                    onClick={onOpenLoginDocente}
                    className="w-full flex flex-col items-center justify-center gap-1 text-emerald-400"
                    title={`Docente activo: ${docenteActivo.nombre} (${docenteActivo.correo})`}
                  >
                    <GraduationCap className="w-5 h-5 text-amber-300" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-slate-700">
                      <p className="font-bold">{docenteActivo.nombre}</p>
                      <p className="text-[10px] text-blue-300 font-mono">{docenteActivo.correo}</p>
                    </div>
                  </button>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-white truncate text-[11px]">
                        {docenteActivo.nombre}
                      </span>
                      <span
                        className={`text-[8px] font-black uppercase px-1 py-0.2 rounded shrink-0 ${
                          docenteActivo.tipo === 'consejero'
                            ? 'bg-blue-400/20 text-blue-200 border border-blue-400/30'
                            : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        }`}
                      >
                        {docenteActivo.tipo === 'consejero' ? 'Consejero' : 'Especial'}
                      </span>
                    </div>

                    <p className="text-[10px] text-blue-200 font-mono truncate">
                      {docenteActivo.correo}
                    </p>

                    <div className="flex items-center gap-1 pt-1 border-t border-blue-800/40">
                      <button
                        onClick={onOpenLoginDocente}
                        className="flex-1 text-[10px] bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-1.5 rounded transition text-center"
                        title="Cambiar de docente o revisar grupos"
                      >
                        Cambiar
                      </button>
                      {onLogoutDocente && (
                        <button
                          onClick={onLogoutDocente}
                          className="text-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold py-1 px-2 rounded transition flex items-center gap-1"
                          title="Cerrar sesión de docente"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Salir</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : docenteOffline ? (
              <button
                onClick={() => {
                  onOpenLoginDocente();
                  if (isOpenMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 hover:text-white border border-emerald-400/30 transition-all group relative ${
                  isCollapsed && !isOpenMobile ? 'justify-center px-0' : ''
                }`}
                title={`Dispositivo registrado para ${docenteOffline.nombre} (${docenteOffline.correo}). Entrada 1 clic offline`}
              >
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
                {(!isCollapsed || isOpenMobile) && (
                  <div className="text-left flex-1 min-w-0">
                    <span className="block text-xs font-black truncate text-emerald-100">
                      Entrada Offline (1 Clic)
                    </span>
                    <span className="block text-[9px] text-emerald-300/80 truncate font-mono">
                      {docenteOffline.nombre.split(' ')[0]} &bull; {docenteOffline.tipo === 'consejero' ? 'Consejero' : 'Especial'}
                    </span>
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenLoginDocente();
                  if (isOpenMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 hover:text-white border border-blue-400/20 transition-all group relative ${
                  isCollapsed && !isOpenMobile ? 'justify-center px-0' : ''
                }`}
                title="Acceso Oficial para Educadores con correo institucional @meduca.edu.pa"
              >
                <GraduationCap className="w-4 h-4 text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
                {(!isCollapsed || isOpenMobile) && (
                  <div className="text-left flex-1 min-w-0">
                    <span className="block text-xs font-black truncate">
                      Ingreso Docente
                    </span>
                    <span className="block text-[9px] text-blue-300/70 truncate font-mono">
                      @meduca.edu.pa
                    </span>
                  </div>
                )}
              </button>
            )}
          </div>

          {/* ACCESO ESPECIAL AL PORTAL DE PADRES */}
          <div className="pt-2 border-t border-blue-800/40">
            {(!isCollapsed || isOpenMobile) && (
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300/80">
                Acceso Familiar
              </div>
            )}
            <button
              onClick={() => {
                onOpenPortalPadres();
                if (isOpenMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all group relative ${
                isCollapsed && !isOpenMobile ? 'justify-center px-0' : ''
              }`}
              title="Abrir Portal para Padres y Acudientes"
            >
              <HeartHandshake className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              {(!isCollapsed || isOpenMobile) && (
                <div className="text-left flex-1 min-w-0">
                  <span className="block text-xs font-black truncate">
                    Portal de Padres
                  </span>
                  <span className="block text-[9px] text-amber-200/70 truncate">
                    Acceso Restringido a Hijos
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* PIE DEL SIDEBAR (Ajustes y estado institucional) */}
        <div className="p-3 border-t border-blue-800/40 shrink-0 space-y-2 bg-[#001830]/60">
          {onSwitchToGateway && (
            <button
              onClick={() => {
                onSwitchToGateway();
                if (isOpenMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-200 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold transition ${
                isCollapsed && !isOpenMobile ? 'justify-center px-0' : ''
              }`}
              title="Cambiar de Estamento (Volver al Selector Tripartito)"
            >
              <LogOut className="w-4 h-4 text-amber-400 shrink-0" />
              {(!isCollapsed || isOpenMobile) && (
                <span className="truncate">Cambiar de Estamento</span>
              )}
            </button>
          )}

          <button
            onClick={() => {
              onOpenConfig();
              if (isOpenMobile) onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 text-xs font-semibold transition ${
              isCollapsed && !isOpenMobile ? 'justify-center px-0' : ''
            }`}
            title="Configuración del Plantel y Respaldos"
          >
            <Settings className="w-4 h-4 text-amber-300 shrink-0" />
            {(!isCollapsed || isOpenMobile) && (
              <span className="truncate">Ajustes del Plantel</span>
            )}
          </button>

          {(!isCollapsed || isOpenMobile) && (
            <div className="px-2 pt-1 text-[10px] text-blue-300/60 text-center flex items-center justify-between">
              <span>Trimestre {db.trimestreActual}</span>
              <span className="text-emerald-400 font-bold">● Sistema Activo</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
