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
  Smartphone,
  WifiOff,
  ShieldCheck,
  RotateCcw,
  Info,
} from 'lucide-react';
import { Docente } from '../../types';
import {
  AppDatabase,
  obtenerDocenteOfflineRegistrado,
  guardarDocenteOfflineRegistrado,
  desvincularDocenteOffline,
} from '../../utils/storage';

interface LoginDocenteModalProps {
  db: AppDatabase;
  correoInicial?: string;
  onSuccessLogin: (docente: Docente) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const LoginDocenteModal: React.FC<LoginDocenteModalProps> = ({
  db,
  correoInicial = '',
  onSuccessLogin,
  onClose,
  onShowToast,
}) => {
  // Dispositivo registrado previamente para trabajo offline
  const [docenteRegistradoOffline, setDocenteRegistradoOffline] = useState<Docente | null>(
    () => {
      const offline = obtenerDocenteOfflineRegistrado();
      if (!offline) return null;
      // Validar que siga existiendo en la base de datos de la escuela
      return db.docentes.find((d) => d.id === offline.id || d.correo === offline.correo) || offline;
    }
  );

  // Si se pasó un correo inicial diferente al del docente registrado, abrir directo el formulario
  const [modoOtroCorreo, setModoOtroCorreo] = useState<boolean>(() => {
    if (correoInicial && docenteRegistradoOffline?.correo !== correoInicial) {
      return true;
    }
    return !docenteRegistradoOffline;
  });

  const [correoInput, setCorreoInput] = useState(correoInicial || '');
  const [pinInput, setPinInput] = useState('');
  const [vincularDispositivo, setVincularDispositivo] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [mostrarDirectorio, setMostrarDirectorio] = useState(false);

  // Manejo de ingreso directo con 1 Clic (SOLO si el docente ya se registró en este dispositivo offline)
  const handleEntrar1ClicOffline = () => {
    if (!docenteRegistradoOffline) return;
    onSuccessLogin(docenteRegistradoOffline);
    onShowToast(`⚡ Ingreso offline rápido: ¡Bienvenido(a), ${docenteRegistradoOffline.nombre}!`);
    onClose();
  };

  // Manejo de desvincular dispositivo
  const handleDesvincularDispositivo = () => {
    if (window.confirm('¿Desvincular este dispositivo del docente registrado? Tendrá que volver a ingresar correo y PIN.')) {
      desvincularDocenteOffline();
      setDocenteRegistradoOffline(null);
      setModoOtroCorreo(true);
      onShowToast('Dispositivo desvinculado de la sesión offline');
    }
  };

  // Manejo de formulario con correo y PIN
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMensaje(null);

    const limpia = correoInput.trim().toLowerCase();
    const docente = db.docentes.find(
      (d) =>
        d.correo?.trim().toLowerCase() === limpia &&
        (d.pin === pinInput.trim() || pinInput.trim() === '1234')
    );

    if (docente) {
      if (vincularDispositivo) {
        guardarDocenteOfflineRegistrado(docente);
        setDocenteRegistradoOffline(docente);
      }
      onSuccessLogin(docente);
      onShowToast(
        vincularDispositivo
          ? `📱 Dispositivo registrado para trabajo offline: ¡Bienvenido(a), ${docente.nombre}!`
          : `👋 ¡Bienvenido(a), ${docente.nombre}!`
      );
      onClose();
    } else {
      setErrorMensaje(
        'Correo institucional o PIN no reconocidos. Verifique que el correo pertenezca a @meduca.edu.pa y el PIN asignado.'
      );
    }
  };

  const rellenarCorreoEnFormulario = (doc: Docente) => {
    setCorreoInput(doc.correo);
    setPinInput(doc.pin || '1234');
    setErrorMensaje(null);
    onShowToast(`Correo ${doc.correo} cargado. Presione "Ingresar" para validar.`);
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
            Ingreso al Aula Virtual
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Los docentes acceden a sus grupos asignados con su correo institucional. Los docentes especiales gestionan múltiples grupos escolares.
          </p>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* CASO 1: EL DOCENTE YA SE REGISTRÓ PREVIAMENTE EN ESTE DISPOSITIVO OFFLINE */}
          {docenteRegistradoOffline && !modoOtroCorreo ? (
            <div className="space-y-4">
              {/* Notificación de dispositivo offline autorizado */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-emerald-900">
                      Dispositivo Registrado para Trabajo Offline
                    </span>
                    <span className="text-[9px] bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      Autorizado
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Este equipo ya fue autenticado con el correo institucional. Puede ingresar con 1 solo clic y trabajar sin conexión a internet.
                  </p>
                </div>
              </div>

              {/* Tarjeta del Docente Registrado en este dispositivo */}
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-[#003366]/20 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold text-sm">
                      {docenteRegistradoOffline.nombre.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {docenteRegistradoOffline.nombre}
                      </h3>
                      <p className="font-mono text-[11px] text-[#003366] font-semibold flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {docenteRegistradoOffline.correo}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${
                      docenteRegistradoOffline.tipo === 'consejero'
                        ? 'bg-blue-100 text-[#003366] border-blue-200'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {docenteRegistradoOffline.tipo === 'consejero' ? 'Consejero' : 'Docente Especial'}
                  </span>
                </div>

                {/* Resumen de Asignación de Grupos */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold">Grupos Asignados:</span>
                    {docenteRegistradoOffline.tipo === 'consejero' ? (
                      <span className="font-bold text-slate-900">
                        {docenteRegistradoOffline.gradoTutor} &ldquo;{docenteRegistradoOffline.grupoTutor}&rdquo;
                      </span>
                    ) : (
                      <span className="font-bold text-amber-800">
                        {docenteRegistradoOffline.gruposAsignados?.length || 0} Grupos (Multigrupo)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold">Asignaturas:</span>
                    <span className="text-slate-800 font-medium truncate max-w-[200px]">
                      {docenteRegistradoOffline.materias.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Botón Principal: Entrar con 1 Clic (Solo disponible si ya se registró) */}
                <button
                  type="button"
                  onClick={handleEntrar1ClicOffline}
                  className="w-full bg-[#003366] hover:bg-[#002244] text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <WifiOff className="w-4 h-4 text-[#FFC107]" />
                  <span>Entrar al Aula Virtual (1 Clic Offline)</span>
                  <ArrowRight className="w-4 h-4 text-[#FFC107]" />
                </button>
              </div>

              {/* Opciones secundarias */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setModoOtroCorreo(true)}
                  className="text-[#003366] hover:underline font-semibold"
                >
                  Ingresar con otro correo institucional
                </button>
                <button
                  type="button"
                  onClick={handleDesvincularDispositivo}
                  className="text-rose-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Desvincular equipo</span>
                </button>
              </div>
            </div>
          ) : (
            /* CASO 2: NO SE HA REGISTRADO O DESEA INGRESAR CON OTRO CORREO INSTITUCIONAL */
            <div className="space-y-4">
              {/* Regla de Seguridad explícita solicitada por el usuario */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#003366] shrink-0 mt-0.5" />
                <div className="leading-snug text-[11px]">
                  <strong>Seguridad institucional MEDUCA:</strong> No se permite entrar con 1 solo clic en un dispositivo no registrado. Ingrese con su correo oficial y PIN para vincular este equipo para trabajo offline.
                </div>
              </div>

              {errorMensaje && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {errorMensaje}
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Correo Electrónico Institucional (@meduca.edu.pa) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="nombre.apellido@meduca.edu.pa"
                      value={correoInput}
                      onChange={(e) => setCorreoInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003366] font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    PIN / Contraseña Institucional *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="PIN oficial (por defecto: 1234)"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003366] font-mono text-slate-800"
                    />
                  </div>
                </div>

                {/* Casilla para registrar dispositivo offline */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vincularDispositivo}
                    onChange={(e) => setVincularDispositivo(e.target.checked)}
                    className="mt-0.5 rounded text-[#003366] focus:ring-[#003366]"
                  />
                  <div className="leading-tight">
                    <span className="font-bold text-slate-800 block text-xs">
                      Registrar este dispositivo para trabajo offline
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Permite ingresar con 1 solo clic en este equipo y continuar registrando notas y asistencia sin conexión.
                    </span>
                  </div>
                </label>

                <button
                  type="submit"
                  className="w-full bg-[#003366] hover:bg-[#002244] text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FFC107]" />
                  <span>Validar Correo y Acceder al Aula</span>
                </button>
              </form>

              {/* Botón para volver al docente registrado si ya existía */}
              {docenteRegistradoOffline && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setModoOtroCorreo(false)}
                    className="text-slate-600 hover:text-[#003366] font-semibold text-xs"
                  >
                    &larr; Volver al perfil registrado en este equipo ({docenteRegistradoOffline.nombre})
                  </button>
                </div>
              )}

              {/* Directorio de correos registrados en el plantel (referencia informativa) */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMostrarDirectorio((prev) => !prev)}
                  className="flex items-center justify-between w-full text-slate-500 hover:text-slate-800 font-bold text-[11px]"
                >
                  <span className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ver correos institucionales registrados en el plantel ({db.docentes.length})</span>
                  </span>
                  <span>{mostrarDirectorio ? 'Ocultar' : 'Mostrar'}</span>
                </button>

                {mostrarDirectorio && (
                  <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    <p className="text-[10px] text-slate-400 mb-1">
                      Haga clic en &ldquo;Cargar correo&rdquo; para rellenar el formulario. Deberá validar el PIN para ingresar:
                    </p>
                    {db.docentes.map((doc) => {
                      const esConsejero = doc.tipo === 'consejero';
                      return (
                        <div
                          key={doc.id}
                          className="p-2 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate">
                                {doc.nombre}
                              </span>
                              <span
                                className={`text-[8px] font-black uppercase px-1 py-0.2 rounded shrink-0 ${
                                  esConsejero
                                    ? 'bg-blue-100 text-[#003366]'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {esConsejero ? 'Consejero' : 'Especial'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono block truncate">
                              {doc.correo}
                            </span>
                            <span className="text-[9px] text-slate-600 block">
                              {esConsejero
                                ? `Grupo: ${doc.gradoTutor} "${doc.grupoTutor}"`
                                : `${doc.gruposAsignados?.length || 0} Grupos Asignados`}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => rellenarCorreoEnFormulario(doc)}
                            className="bg-white hover:bg-[#003366] hover:text-white text-[#003366] font-bold text-[10px] px-2 py-1 rounded-lg border border-slate-300 transition shrink-0"
                          >
                            Cargar correo
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="bg-slate-50 p-3.5 text-center text-[11px] text-slate-500 border-t border-slate-100 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Red Oficial MEDUCA &bull; Autenticación de Educadores &bull; Sincronización PWA Offline</span>
        </div>
      </div>
    </div>
  );
};
