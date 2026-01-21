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
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <h1 className="text-6xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 drop-shadow-lg">
        PRIME CHAIN
      </h1>
      <div className="flex flex-col sm:flex-row gap-6 z-10">
        <button
          onClick={() => setRole('host')}
          className="px-8 py-4 bg-violet-600 rounded-2xl font-bold text-xl hover:bg-violet-500 hover:scale-105 transition shadow-[0_0_20px_rgba(124,58,237,0.5)] border border-violet-400/30"
        >
          Create Room
        </button>
        <button
          onClick={() => setRole('player')}
          className="px-8 py-4 bg-slate-800 rounded-2xl font-bold text-xl hover:bg-slate-700 hover:scale-105 transition shadow-lg border border-slate-600"
        >
          Join Game
        </button>
      </div>
    </div>
  );
}

export default App;
