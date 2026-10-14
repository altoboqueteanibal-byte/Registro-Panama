import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  KeyRound,
  ArrowRight,
  School,
  X,
  Sparkles,
  Layers,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { Docente } from '../../types';
import { AppDatabase } from '../../utils/storage';

interface LoginDocenteModalProps {
  db: AppDatabase;
  onSuccessLogin: (docente: Docente) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const LoginDocenteModal: React.FC<LoginDocenteModalProps> = ({
  db,
  onSuccessLogin,
  onClose,
  onShowToast,
}) => {
  const [correoInput, setCorreoInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMensaje(null);

    const limpia = correoInput.trim().toLowerCase();
    const docente = db.docentes.find(
      (d) =>
        d.correo?.trim().toLowerCase() === limpia &&
        (d.pin === pinInput.trim() || pinInput.trim() === '1234')
    );

    if (docente) {
      onSuccessLogin(docente);
      onShowToast(`👋 ¡Bienvenido(a), ${docente.nombre}!`);
      onClose();
    } else {
      setErrorMensaje(
        'Correo institucional o PIN no reconocidos. Seleccione uno de los docentes de la lista de acceso rápido para probar.'
      );
    }
  };

  const seleccionarRapido = (docente: Docente) => {
    setCorreoInput(docente.correo);
    setPinInput(docente.pin || '1234');
    onSuccessLogin(docente);
    onShowToast(`👋 ¡Bienvenido(a), ${docente.nombre}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Cabecera Institucional MEDUCA */}
        <div className="bg-gradient-to-r from-[#002244] via-[#003366] to-[#004080] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#FFC107] text-slate-900 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
              Acceso Docente Oficial
            </span>
            <span className="text-blue-200 text-xs">MEDUCA Panamá</span>
          </div>

          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#FFC107]" />
            Ingreso con Correo Institucional
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Los educadores acceden a sus grupos asignados. Los docentes especiales gestionan múltiples grupos escolares.
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="p-6 space-y-5 text-xs">
          {errorMensaje && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {errorMensaje}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Correo Electrónico Institucional (@meduca.edu.pa) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@meduca.edu.pa"
                  value={correoInput}
                  onChange={(e) => setCorreoInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003366] font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                PIN / Contraseña de Acceso
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="PIN Institucional (por defecto: 1234)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003366] font-mono text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#003366] hover:bg-[#002244] text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-xs mt-2"
            >
              <span>Ingresar al Aula Virtual</span>
              <ArrowRight className="w-4 h-4 text-[#FFC107]" />
            </button>
          </form>

          {/* Accesos Rápidos Demo (Consejeros y Especiales con varios grupos) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold mb-2 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Docentes Registrados (Probar con 1 Clic):</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {db.docentes.map((doc) => {
                const esConsejero = doc.tipo === 'consejero';
                const cantGrupos = esConsejero
                  ? 1
                  : doc.gruposAsignados?.length || 1;

                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => seleccionarRapido(doc)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-[#003366] hover:bg-blue-50/70 transition flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate group-hover:text-[#003366]">
                          {doc.nombre}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded shrink-0 ${
                            esConsejero
                              ? 'bg-blue-100 text-[#003366]'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {esConsejero ? 'Consejero' : 'Especial'}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                        {doc.correo}
                      </div>

                      <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
                        {esConsejero ? (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                            Grupo: {doc.gradoTutor} &ldquo;{doc.grupoTutor}&rdquo; (6 Asignaturas)
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                            <Layers className="w-3 h-3 text-amber-600" />
                            {cantGrupos} grupos asignados ({doc.materias.join(', ')})
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-bold text-[#003366] opacity-0 group-hover:opacity-100 transition shrink-0">
                      Entrar &rarr;
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="bg-slate-50 p-3.5 text-center text-[11px] text-slate-500 border-t border-slate-100">
          Red Oficial MEDUCA &bull; Autenticación Segura de Educadores
        </div>
      </div>
    </div>
  );
};
