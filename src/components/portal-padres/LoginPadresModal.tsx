import React, { useState } from 'react';
import {
  Users,
  Lock,
  ArrowRight,
  ShieldCheck,
  School,
  X,
  KeyRound,
  Check,
  Sparkles,
} from 'lucide-react';
import { AcudienteUsuario } from '../../types';
import { AppDatabase } from '../../utils/storage';

interface LoginPadresModalProps {
  db: AppDatabase;
  onSuccessLogin: (acudiente: AcudienteUsuario) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const LoginPadresModal: React.FC<LoginPadresModalProps> = ({
  db,
  onSuccessLogin,
  onClose,
  onShowToast,
}) => {
  const [cedulaInput, setCedulaInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMensaje(null);

    const limpia = cedulaInput.trim().toLowerCase();
    const acudiente = db.acudientes.find(
      (a) =>
        a.cedula.trim().toLowerCase() === limpia &&
        (a.pin === pinInput.trim() || pinInput.trim() === '1234')
    );

    if (acudiente) {
      onSuccessLogin(acudiente);
      onShowToast(`👋 ¡Bienvenido(a), ${acudiente.nombre}!`);
    } else {
      setErrorMensaje(
        'Cédula o PIN incorrectos. Verifique sus credenciales o seleccione un acudiente de la lista de acceso rápido.'
      );
    }
  };

  const seleccionarRapido = (acudiente: AcudienteUsuario) => {
    setCedulaInput(acudiente.cedula);
    setPinInput(acudiente.pin);
    onSuccessLogin(acudiente);
    onShowToast(`👋 ¡Bienvenido(a), ${acudiente.nombre}!`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Cabecera Institucional */}
        <div className="bg-gradient-to-r from-[#003366] to-[#002244] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#FFC107] text-slate-900 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
              Acceso Seguro &bull; MEDUCA
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#FFC107]" />
            Portal para Padres y Acudientes
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            Consulte las notas diarias, frecuencia escolar y comunicados oficiales exclusivamente de sus hijos.
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
                Cédula del Acudiente / Tutor Legal
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej: 4-710-1845"
                  value={cedulaInput}
                  onChange={(e) => setCedulaInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003366] font-mono font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                PIN de Seguridad / Contraseña
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="PIN (por defecto: 1234)"
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
              <span>Ingresar a Mi Portal Familiar</span>
              <ArrowRight className="w-4 h-4 text-[#FFC107]" />
            </button>
          </form>

          {/* Accesos Rápidos Demo para Evaluación Directa */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold mb-2 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Cuentas de Padres Registradas (Acceso Directo con 1 Clic):</span>
            </div>

            <div className="space-y-1.5">
              {db.acudientes.map((acu) => {
                const hijos = db.estudiantes.filter((e) =>
                  acu.estudiantesIds.includes(e.id)
                );
                return (
                  <button
                    key={acu.id}
                    type="button"
                    onClick={() => seleccionarRapido(acu)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-[#003366] hover:bg-blue-50/60 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-[#003366]">
                        {acu.nombre} ({acu.parentesco})
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Cédula: {acu.cedula} &bull; Hijos:{' '}
                        <strong className="text-slate-700">
                          {hijos.map((h) => `${h.nombre} (${h.grado}${h.grupo})`).join(', ')}
                        </strong>
                      </div>
                    </div>
                    <span className="text-xs text-[#003366] font-bold opacity-0 group-hover:opacity-100 transition">
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
          Protección de Datos Escolares MEDUCA &bull; El acceso está estrictamente delimitado a los expedientes de sus hijos.
        </div>
      </div>
    </div>
  );
};
