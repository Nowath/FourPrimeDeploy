import { useState, useEffect } from 'react';
import HostScreen from './components/HostScreen';
import PlayerController from './components/PlayerController';

function App() {
  const [role, setRole] = useState<'landing' | 'host' | 'player'>('landing');
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setRoomId(room);
      setRole('player');
    }
  }, []);

  if (role === 'host') return <HostScreen onBack={() => setRole('landing')} />;
  if (role === 'player') return <PlayerController initialRoomId={roomId} onBack={() => setRole('landing')} />;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-violet-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 drop-shadow-2xl animate-in fade-in slide-in-from-top duration-700 text-center">
          PRIME CHAIN
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mb-12 text-center animate-in fade-in slide-in-from-top duration-700 delay-150">
          Build the longest prime number chain
        </p>
        
        <div className="flex flex-col w-full gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <button
            onClick={() => setRole('host')}
            className="group relative w-full px-8 py-5 sm:py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl font-bold text-xl sm:text-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] border border-white/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <span className="relative flex items-center justify-center gap-2">
              <span>🎮</span>
              Create Room
            </span>
          </button>
          
          <button
            onClick={() => setRole('player')}
            className="group relative w-full px-8 py-5 sm:py-6 bg-slate-800/80 backdrop-blur-sm rounded-2xl font-bold text-xl sm:text-2xl hover:bg-slate-700/80 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg border border-slate-600/50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <span className="relative flex items-center justify-center gap-2">
              <span>🎯</span>
              Join Game
            </span>
          </button>
        </div>
        
        <div className="mt-12 text-center text-slate-500 text-xs sm:text-sm animate-in fade-in duration-700 delay-500">
          <p>Powered by Prime Numbers</p>
        </div>
      </div>
    </div>
  );
}

export default App;
