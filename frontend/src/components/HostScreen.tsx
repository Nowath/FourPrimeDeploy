import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import NavigationBar from './NavigationBar';
import SettingsModal from './SettingsModal';
import { socket } from '../socket';
import { Heart, Skull } from 'lucide-react';

interface Player {
    id: string;
    name: string;
    score: number;
    lives: number;
    isDead: boolean;
}

export default function HostScreen({ onBack }: { onBack?: () => void }) {
    const [status, setStatus] = useState<'setup' | 'lobby' | 'playing' | 'ended'>('setup');
    const [players, setPlayers] = useState<Player[]>([]);
    const [roomId, setRoomId] = useState('');
    const [currentNumber, setCurrentNumber] = useState(0);
    const [lastWinner, setLastWinner] = useState<Player | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [difficulty, setDifficulty] = useState<'relax' | 'medium' | 'hard'>('medium');

    useEffect(() => {
        socket.connect();

        socket.on('room_created', (id: string) => {
            setRoomId(id);
            setStatus('lobby');
        });

        socket.on('player_joined', (updatedPlayers: Player[]) => {
            setPlayers(updatedPlayers);
        });

        socket.on('game_started', ({ currentNumber }: { currentNumber: number }) => {
            setStatus('playing');
            setCurrentNumber(currentNumber);
        });

        socket.on('number_updated', ({ currentNumber, lastWinner, skipped }: any) => {
            setCurrentNumber(currentNumber);
            if (skipped) {
                // Flash skipped or unlocked feedback?
            }
            if (lastWinner) {
                setLastWinner(lastWinner);
                setTimeout(() => setLastWinner(null), 3000); // Show winner for 3s
            }
        });

        socket.on('leaderboard_update', (updatedPlayers: Player[]) => {
            setPlayers(updatedPlayers);
        });

        socket.on('game_ended', ({ leaderboard }: { leaderboard: Player[] }) => {
            setStatus('ended');
            setPlayers(leaderboard);
        });

        socket.on('error', (msg: string) => alert(msg));

        return () => {
            socket.off('room_created');
            socket.off('player_joined');
            socket.off('game_started');
            socket.off('number_updated');
            socket.off('leaderboard_update');
            socket.off('game_ended');
            socket.off('error');
            socket.disconnect();
        };
    }, []);

    const createRoom = () => {
        socket.emit('create_room', { difficulty });
    };

    const startGame = () => {
        socket.emit('start_game', { roomId });
    };

    const joinUrl = `${window.location.origin}?room=${roomId}`;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-violet-500/30">
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onLeaveGame={onBack}
            />

            <div className="max-w-7xl mx-auto p-8">
                <NavigationBar
                    onBack={onBack}
                    onSettingsClick={() => setShowSettings(true)}
                    className="mb-8"
                />

                {/* Header */}
                <header className="w-full flex justify-between items-center mb-12 max-w-6xl">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">PRIME CHAIN</h1>
                    {roomId && (
                        <div className="bg-slate-900/50 backdrop-blur-md px-6 py-2 rounded-full font-mono text-xl border border-slate-700/50 shadow-lg">
                            Code: <span className="text-fuchsia-400 font-bold tracking-widest">{roomId}</span>
                        </div>
                    )}
                </header>

                {status === 'setup' && (
                    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto">
                        <h2 className="text-4xl font-bold mb-8">Select Difficulty</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full">
                            <button
                                onClick={() => setDifficulty('relax')}
                                className={`p-8 rounded-3xl border-2 transition relative overflow-hidden group ${difficulty === 'relax' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'}`}
                            >
                                <div className="relative z-10 flex flex-col items-center gap-4">
                                    <Heart className={`w-16 h-16 ${difficulty === 'relax' ? 'text-sky-400' : 'text-slate-500 group-hover:text-sky-400'} transition`} fill={difficulty === 'relax' ? "currentColor" : "none"} />
                                    <h3 className="text-2xl font-bold">Relax</h3>
                                    <p className="text-slate-400">20 Lives</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setDifficulty('medium')}
                                className={`p-8 rounded-3xl border-2 transition relative overflow-hidden group ${difficulty === 'medium' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'}`}
                            >
                                <div className="relative z-10 flex flex-col items-center gap-4">
                                    <Heart className={`w-16 h-16 ${difficulty === 'medium' ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'} transition`} fill={difficulty === 'medium' ? "currentColor" : "none"} />
                                    <h3 className="text-2xl font-bold">Medium</h3>
                                    <p className="text-slate-400">10 Lives</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setDifficulty('hard')}
                                className={`p-8 rounded-3xl border-2 transition relative overflow-hidden group ${difficulty === 'hard' ? 'border-red-500 bg-red-500/10' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'}`}
                            >
                                <div className="relative z-10 flex flex-col items-center gap-4">
                                    <Skull className={`w-16 h-16 ${difficulty === 'hard' ? 'text-red-400' : 'text-slate-500 group-hover:text-red-400'} transition`} />
                                    <h3 className="text-2xl font-bold">Hardcore</h3>
                                    <p className="text-slate-400">5 Lives • 1 Try</p>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={createRoom}
                            className="px-16 py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl text-2xl font-bold hover:scale-105 active:scale-95 transition shadow-[0_0_40px_rgba(139,92,246,0.5)] border border-white/20"
                        >
                            CREATE ROOM
                        </button>
                    </div>
                )}

                {status === 'lobby' && (
                    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl relative mx-auto">
                        <div className="absolute top-0 left-0 w-full h-full bg-violet-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="bg-white p-4 rounded-3xl shadow-2xl mb-8 relative z-10 transform hover:scale-105 transition duration-500">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinUrl)}`}
                                alt="Join QR"
                                className="rounded-xl"
                            />
                        </div>
                        <p className="text-2xl text-slate-400 mb-12 font-light relative z-10">
                            Scan to join ({difficulty.toUpperCase()})
                        </p>

                        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 relative z-10">
                            {players.map(p => (
                                <div key={p.id} className="bg-slate-800/80 backdrop-blur p-4 rounded-xl text-center font-bold animate-in fade-in zoom-in duration-300 border border-slate-700/50 shadow-lg ring-1 ring-white/10 flex flex-col items-center gap-2">
                                    <span>{p.name}</span>
                                    <div className="flex gap-1">
                                        {Array.from({ length: 3 }).map((_, i) => ( // Show simplified hearts in lobby
                                            <div key={i} className={`w-2 h-2 rounded-full ${i < (p.lives > 3 ? 3 : p.lives) ? 'bg-fuchsia-500' : 'bg-slate-700'}`} />
                                        ))}
                                        {p.lives > 3 && <span className="text-[10px] leading-none text-slate-500">+{p.lives - 3}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={startGame}
                            disabled={players.length === 0}
                            className="relative z-10 px-16 py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl text-2xl font-bold hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(139,92,246,0.5)] border border-white/20"
                        >
                            START GAME
                        </button>
                    </div>
                )}

                {status === 'playing' && (
                    <div className="flex-1 w-full max-w-6xl flex flex-col items-center justify-between py-10 mx-auto relative">
                        {/* Host Controls */}
                        <div className="absolute top-0 right-0 flex gap-4">
                            <button
                                onClick={() => socket.emit('skip_number', { roomId })}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold border border-slate-600 transition text-sm"
                            >
                                Unlock/Retry 🔓
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Start a new number chain?')) socket.emit('force_new_number', { roomId });
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold border border-slate-600 transition text-sm"
                            >
                                New Chain 🆕
                            </button>
                            <button
                                onClick={() => socket.emit('enable_exception', { roomId })}
                                className="bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 px-4 py-2 rounded-xl font-bold border border-fuchsia-500/30 transition text-sm"
                            >
                                Exception ✨
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('End the game?')) socket.emit('end_game', { roomId });
                                }}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl font-bold border border-red-500/30 transition text-sm"
                            >
                                End Game 🏁
                            </button>
                        </div>

                        <div className="text-center w-full mt-12">
                            <p className="text-slate-400 text-lg mb-4 font-medium tracking-widest uppercase">Current Chain</p>
                            <div className="w-full flex justify-center">
                                <div className="bg-slate-900/50 backdrop-blur-xl px-12 py-8 rounded-3xl border border-slate-800 shadow-2xl">
                                    <span className="text-7xl md:text-9xl font-black font-mono tracking-tight break-all text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 drop-shadow-xl">
                                        {currentNumber}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {lastWinner && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                                <div className="bg-emerald-500 text-white text-4xl font-black px-8 py-4 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.6)] animate-bounce border-4 border-emerald-400 flex items-center gap-4">
                                    <span>🎉</span>
                                    <span>{lastWinner.name}</span>
                                    <span className="bg-white/20 px-3 py-1 rounded-lg text-2xl">+100 pts</span>
                                </div>
                            </div>
                        )}

                        <div className="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-xl">
                                <h3 className="text-xl font-bold mb-6 text-slate-300 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-fuchsia-500 rounded-full"></span>
                                    LEADERBOARD
                                </h3>
                                <div className="space-y-3">
                                    {players.slice(0, 5).map((p, i) => (
                                        <div key={p.id} className={`flex justify-between items-center bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 transition ${p.isDead ? 'opacity-50 grayscale' : 'hover:bg-slate-800/60'}`}>
                                            <div className="flex items-center gap-4">
                                                <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${i === 0 ? 'bg-yellow-500 text-yellow-950' : 'bg-slate-700 text-slate-400'}`}>
                                                    {i + 1}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-lg">{p.name}</span>
                                                    {p.isDead ? (
                                                        <span className="text-red-500 text-xs font-bold uppercase tracking-widest">ELIMINATED</span>
                                                    ) : (
                                                        <div className="flex gap-1 mt-1">
                                                            {Array.from({ length: Math.min(5, p.lives) }).map((_, i) => (
                                                                <Heart key={i} className="w-3 h-3 text-fuchsia-500" fill="currentColor" />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="font-mono text-fuchsia-400 font-bold text-xl">{p.score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* History/Logs */}
                            <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-xl opacity-50">
                                <h3 className="text-xl font-bold mb-6 text-slate-300 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-slate-600 rounded-full"></span>
                                    HISTORY
                                </h3>
                                <div className="text-slate-500 text-sm italic">
                                    Game active...
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'ended' && (
                    <div className="flex-1 w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                        <h1 className="text-5xl md:text-7xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 drop-shadow-xl z-10">
                            GAME OVER
                        </h1>

                        <div className="flex items-end justify-center gap-4 md:gap-8 min-h-[400px] z-10">
                            {/* 2nd Place */}
                            {players.length >= 2 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="mb-4 text-center">
                                        <div className="w-20 h-20 rounded-full bg-slate-700 border-4 border-slate-500 flex items-center justify-center text-2xl font-bold mb-2 mx-auto">
                                            🥈
                                        </div>
                                        <div className="font-bold text-xl">{players[1].name}</div>
                                        <div className="text-slate-400 font-mono">{players[1].score} pts</div>
                                    </div>
                                    <div className="w-24 md:w-32 h-48 bg-slate-700/50 backdrop-blur rounded-t-xl border-t border-x border-slate-600 shadow-xl flex items-end justify-center pb-4 text-4xl font-black text-slate-500/50">
                                        2
                                    </div>
                                </motion.div>
                            )}

                            {/* 1st Place */}
                            {players.length >= 1 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    transition={{ delay: 1.0, duration: 0.8 }}
                                    className="flex flex-col items-center -mt-12"
                                >
                                    <div className="mb-4 text-center">
                                        <div className="w-24 h-24 rounded-full bg-yellow-500/20 border-4 border-yellow-500 flex items-center justify-center text-4xl font-bold mb-2 mx-auto shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                                            👑
                                        </div>
                                        <div className="font-bold text-2xl text-yellow-500">{players[0].name}</div>
                                        <div className="text-yellow-200 font-mono text-xl">{players[0].score} pts</div>
                                    </div>
                                    <div className="w-28 md:w-40 h-64 bg-gradient-to-t from-yellow-600/20 to-yellow-500/40 backdrop-blur rounded-t-xl border-t border-x border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)] flex items-end justify-center pb-4 text-6xl font-black text-yellow-500/50 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-yellow-400/10 animate-pulse"></div>
                                        1
                                    </div>
                                </motion.div>
                            )}

                            {/* 3rd Place */}
                            {players.length >= 3 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.8 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="mb-4 text-center">
                                        <div className="w-20 h-20 rounded-full bg-orange-700/50 border-4 border-orange-600 flex items-center justify-center text-2xl font-bold mb-2 mx-auto">
                                            🥉
                                        </div>
                                        <div className="font-bold text-xl">{players[2].name}</div>
                                        <div className="text-slate-400 font-mono">{players[2].score} pts</div>
                                    </div>
                                    <div className="w-24 md:w-32 h-36 bg-orange-800/30 backdrop-blur rounded-t-xl border-t border-x border-orange-700/50 shadow-xl flex items-end justify-center pb-4 text-4xl font-black text-orange-700/50">
                                        3
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <button onClick={onBack} className="mt-16 z-20 text-slate-500 hover:text-white underline transition">
                            Back to Menu
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
