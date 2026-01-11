import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Power, ShoppingBag } from 'lucide-react';
import { liveService } from './services/liveService';
import AvatarVisualizer from './components/AvatarVisualizer';
import ProductCard from './components/ProductCard';
import { PRODUCTS } from './constants';
import { Product, ConnectionStatus } from './types';

function App() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [volume, setVolume] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Setup volume listener
    liveService.setVolumeCallback((vol) => {
      setVolume(vol);
    });

    return () => {
      liveService.disconnect();
    };
  }, []);

  const toggleConnection = async () => {
    if (status === 'connected' || status === 'connecting') {
      liveService.disconnect();
      setStatus('disconnected');
      setVolume(0);
    } else {
      setStatus('connecting');
      setErrorMsg(null);
      await liveService.connect(
        () => setStatus('disconnected'),
        (err) => {
          setStatus('error');
          setErrorMsg(err.message);
        }
      );
      // Wait a tick to confirm connection state if no immediate error
      setStatus((prev) => prev === 'error' ? 'error' : 'connected');
    }
  };

  const handleProductAsk = useCallback(async (product: Product) => {
    if (status !== 'connected') {
      // If not connected, connect first implies user intent, but simpler to ask to connect
      setErrorMsg("Por favor activa el avatar primero para preguntar.");
      return;
    }

    // Context injection: Tell the avatar specifically what the user did
    const prompt = `El usuario acaba de hacer clic en el producto: "${product.name}". 
    Precio: $${product.price}. 
    Descripción: ${product.description}. 
    Características: ${product.features.join(', ')}.
    
    Explica por qué este producto es genial para el cliente y trata de venderlo de forma breve y emocionante.`;
    
    await liveService.sendTextContext(prompt);
  }, [status]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar / Avatar Area */}
      <aside className="w-full md:w-1/3 lg:w-1/4 bg-slate-950 border-r border-slate-800 flex flex-col relative z-20 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-sky-600 p-2 rounded-lg">
             <ShoppingBag className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white">TechVibe</h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Asistente Virtual</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center p-6 relative">
          {/* Avatar Visualizer */}
          <AvatarVisualizer volume={volume} isActive={status === 'connected'} />
          
          <div className="mt-8 text-center max-w-xs">
            <h2 className="text-lg font-semibold text-white mb-2">
              {status === 'connected' ? 'Soy Alex, tu vendedor.' : 'Avatar Desconectado'}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {status === 'connected' 
                ? 'Pregúntame sobre cualquier producto o haz clic en "Preguntar" para saber más.'
                : 'Haz clic en el botón de encendido para iniciar una conversación de voz en tiempo real.'}
            </p>
          </div>

          {/* Control Button */}
          <button
            onClick={toggleConnection}
            className={`mt-8 rounded-full p-4 transition-all duration-300 shadow-lg border-4 
              ${status === 'connected' 
                ? 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500 hover:text-white' 
                : 'bg-sky-500/20 border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white'
              }`}
          >
            {status === 'connecting' ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
            ) : status === 'connected' ? (
              <MicOff size={32} />
            ) : (
              <Power size={32} />
            )}
          </button>
          
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-800 rounded text-red-200 text-xs text-center">
              {errorMsg}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-600">Powered by Gemini Live API</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Productos Destacados</h2>
            <p className="text-slate-400">Descubre la última tecnología seleccionada para ti.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCTS.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAskDetails={handleProductAsk}
                disabled={status !== 'connected'}
              />
            ))}
          </div>

          {!status.includes('connect') && (
            <div className="mt-16 p-8 rounded-2xl bg-slate-800/50 border border-slate-700 text-center">
              <Mic className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">Experimenta el Futuro de las Compras</h3>
              <p className="text-slate-400 max-w-lg mx-auto mb-6">
                Activa el avatar para obtener recomendaciones personalizadas y explicaciones detalladas simplemente usando tu voz.
              </p>
              <button 
                onClick={toggleConnection}
                className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                Activar Asistente de Voz
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
