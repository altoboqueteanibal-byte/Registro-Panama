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
} from 'lucide-react';

export type ViewType =
  | 'dashboard'
  | 'estudiantes'
  | 'docentes'
  | 'notas'
  | 'asistencia'
  | 'boletines'
  | 'comunicados';

interface NavbarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  onOpenPortalPadres: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  onOpenPortalPadres,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ViewType,
      label: 'Inicio',
      icon: LayoutDashboard,
    },
    {
      id: 'estudiantes' as ViewType,
      label: 'Estudiantes',
      icon: Users,
    },
    {
      id: 'docentes' as ViewType,
      label: 'Docentes',
      icon: GraduationCap,
    },
    {
      id: 'notas' as ViewType,
      label: 'Notas Diarias',
      icon: ClipboardList,
    },
    {
      id: 'asistencia' as ViewType,
      label: 'Asistencia & PASE-U',
      icon: CalendarCheck,
    },
    {
      id: 'boletines' as ViewType,
      label: 'Boletines Oficiales',
      icon: FileText,
    },
    {
      id: 'comunicados' as ViewType,
      label: 'Comunicados',
      icon: Bell,
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Navigation */}
      <nav className="bg-white border-b border-slate-200 shadow-xs sticky top-[69px] z-30 hidden md:block no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-2">
            <div className="flex space-x-1 lg:space-x-1.5 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#003366] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#003366] hover:bg-slate-100'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#FFC107]' : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Botón directo para padres */}
            <button
              onClick={onOpenPortalPadres}
              className="ml-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0"
              title="Iniciar sesión o consultar como Padre de Familia"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Portal para Padres</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden flex justify-around py-1.5 px-1 shadow-lg no-print overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors flex-1 min-w-[50px] ${
                isActive
                  ? 'text-[#003366] font-bold'
                  : 'text-slate-500 hover:text-slate-700 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-full ${
                  isActive ? 'bg-blue-100 text-[#003366]' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] mt-0.5 tracking-tight text-center leading-tight truncate max-w-[54px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
