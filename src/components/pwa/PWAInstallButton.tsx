import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'button' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'card') {
      return (
        <button
          onClick={install}
          className={`flex items-center justify-center gap-2 w-full p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs ${className}`}
        >
          <Download className="w-4 h-4 text-[#FFC107]" />
          <span>Instalar RUE en este Dispositivo</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs ${className}`}
        title="Instalar aplicación en tu teléfono o computadora"
      >
        <Download className="w-3.5 h-3.5 text-[#FFC107]" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition ${className}`}
          title="Instalar en iPhone o iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-300" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 text-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#003366]" />
                  <h3 className="text-sm font-bold">Instalar en iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <p>Para usar RUE Primaria como app nativa sin conexión:</p>
                <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Share2 className="w-4 h-4 text-[#003366] shrink-0 mt-0.5" />
                  <p>
                    1. Toca el botón <strong>Compartir</strong> (ícono con flecha hacia arriba) en la barra de Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <PlusSquare className="w-4 h-4 text-[#003366] shrink-0 mt-0.5" />
                  <p>
                    2. Desplázate hacia abajo y selecciona <strong>Agregar al inicio</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-[#003366] py-2 text-xs font-bold text-white hover:bg-[#002244]"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for desktop/mobile browsers: Show an installation button with guidance or manual trigger
  return (
    <button
      onClick={() => {
        alert(
          'Para instalar la app RUE Primaria:\n\n• En Chrome/Edge: Haz clic en el ícono de instalación (⊕) en la barra de direcciones.\n• En Android: Toca el menú (⋮) y selecciona "Instalar aplicación".\n• En iPhone: Toca Compartir y luego "Agregar al inicio".'
        );
      }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition ${className}`}
      title="Información de instalación PWA"
    >
      <Download className="w-3.5 h-3.5 text-amber-300" />
      <span>Instalar PWA</span>
    </button>
  );
};
