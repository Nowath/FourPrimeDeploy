import { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationBar from './NavigationBar';
import SettingsModal from './SettingsModal';
import { Heart, Lock, Skull, AlertCircle } from 'lucide-react';

interface PlayerControllerProps {
    initialRoomId?: string;
    onBack?: () => void;
}

export default function PlayerController({ initialRoomId, onBack }: PlayerControllerProps) {
    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState(initialRoomId || '');
    const [status, setStatus] = useState<'join' | 'lobby' | 'playing' | 'ended' | 'spectating'>('join');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(10);
    const [currentNumber, setCurrentNumber] = useState<number | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [maxAttempts, setMaxAttempts] = useState(3); // Default to easy, but should get from join
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    // Sounds
    const sfxCorrect = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'));
    const sfxWrong = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'));
    const sfxDie = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3')); // Game over sound

    useEffect(() => {
        socket.connect();

        socket.on('joined_success', ({ initialLives, difficulty }: { initialLives: number, difficulty: 'easy' | 'hard' }) => {
            setStatus('lobby');
            setLives(initialLives);
            setMaxAttempts(difficulty === 'hard' ? 1 : 3);
            setError('');
        });

        socket.on('error', (msg: string) => {
            setError(msg);
        });

        socket.on('game_started', ({ currentNumber }: { currentNumber: number }) => {
            setStatus('playing');
            setCurrentNumber(currentNumber);
            setIsLocked(false);
            setAttempts(0);
        });

        socket.on('number_updated', ({ currentNumber, lastWinner }: any) => {
            setCurrentNumber(currentNumber);
            setIsLocked(false); // Reset lock when number changes
            setAttempts(0);

            if (lastWinner && lastWinner.id === socket.id) {
                // Score updated via personal feedback usually
            }
        });

        socket.on('move_feedback', ({ correct, score, lives, attempts: newAttempts, locked }: { correct: boolean, score?: number, lives?: number, attempts?: number, locked?: boolean }) => {
            if (correct) {
                setFeedback('correct');
                if (score !== undefined) setScore(prev => prev + score);
                sfxCorrect.current.currentTime = 0;
                sfxCorrect.current.play().catch(() => { });
            } else {
                setFeedback('wrong');
                if (lives !== undefined) setLives(lives);
                if (newAttempts !== undefined) setAttempts(newAttempts);
                if (locked !== undefined) setIsLocked(locked);

                sfxWrong.current.currentTime = 0;
                sfxWrong.current.play().catch(() => { });
            }
            setTimeout(() => setFeedback(null), 1000);
        });

        socket.on('game_over_personal', () => {
            setStatus('spectating');
            sfxDie.current.currentTime = 0;
            sfxDie.current.play().catch(() => { });
        });

        socket.on('game_ended', () => {
            setStatus('ended');
        });

        return () => {
            socket.off('joined_success');
            socket.off('error');
            socket.off('game_started');
            socket.off('number_updated');
            socket.off('move_feedback');
            socket.off('game_over_personal');
            socket.off('game_ended');
            socket.disconnect();
        };
    }, []);

    const joinGame = () => {
        if (!name || !roomId) return;
        socket.emit('join_room', { roomId, name });
    };

    const submitDigit = (digit: number) => {
        if (isLocked) return;
        socket.emit('submit_move', { roomId, digit });
    };

    if (status === 'join') {
        return (
            <div className="min-h-[100dvh] bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
                <SettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    onLeaveGame={onBack}
                />

                <div className="absolute top-0 left-0 w-full z-20">
                    <NavigationBar
                        onBack={onBack}
                        onSettingsClick={() => setShowSettings(true)}
                    />
                </div>

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-violet-600/30 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-pink-600/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg md:bg-slate-900/80 md:backdrop-blur-xl md:border md:border-white/10 md:p-12 md:rounded-3xl md:shadow-2xl transition-all">
                    <h1 className="text-4xl md:text-6xl font-black mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 drop-shadow-sm tracking-tight">
                        JOIN GAME
                    </h1>

                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <label className="block text-slate-400 mb-3 font-bold uppercase tracking-widest text-xs md:text-sm">Room Code</label>
                            <input
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                className="w-full bg-slate-950/50 border-2 border-slate-700/50 rounded-2xl p-5 text-3xl font-mono text-center tracking-[0.5em] font-bold text-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:outline-none transition-all placeholder:text-slate-800 shadow-inner"
                                placeholder="ABCD"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-3 font-bold uppercase tracking-widest text-xs md:text-sm">Nickname</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-950/50 border-2 border-slate-700/50 rounded-2xl p-5 text-xl font-bold text-center text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 focus:outline-none transition-all placeholder:text-slate-800 shadow-inner"
                                placeholder="Enter your name"
                                maxLength={12}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-center font-bold text-sm animate-bounce">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={joinGame}
                            className="w-full bg-gradient-to-r from-violet-600 to-pink-600 py-5 rounded-2xl font-black text-xl tracking-wider shadow-lg shadow-violet-600/20 active:scale-95 transition-all hover:shadow-violet-600/40 hover:brightness-110 border border-white/10 mt-4 group"
                        >
                            <span className="group-hover:scale-105 inline-block transition-transform duration-200">
                                ENTER GAME
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'lobby') {
        return (
            <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                    <span className="text-4xl">🎮</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">You're in!</h2>
                <div className="flex items-center gap-2 mb-4 bg-slate-800 px-4 py-2 rounded-full">
                    {Array.from({ length: Math.min(5, lives) }).map((_, i) => (
                        <Heart key={i} className="w-5 h-5 text-fuchsia-500" fill="currentColor" />
                    ))}
                    {lives > 5 && <span className="font-bold">+{lives - 5}</span>}
                </div>
                <p className="text-slate-400">Waiting for host to start...</p>
                <div className="mt-8 p-4 bg-slate-800 rounded-lg">
                    <span className="text-sm text-slate-500 uppercase font-bold">Your Name</span>
                    <div className="text-xl font-bold text-violet-400">{name}</div>
                </div>
            </div>
        );
    }

    if (status === 'spectating') {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center text-center p-8">
                <div className="w-32 h-32 mb-6 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                    <Skull className="w-16 h-16 text-red-500" />
                </div>
                <h1 className="text-5xl font-black text-red-500 mb-4">GAME OVER</h1>
                <p className="text-xl text-slate-400 mb-8 max-w-md">You ran out of hearts! But you can still watch the game proceed.</p>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 w-full max-w-sm">
                    <div className="text-sm text-slate-500 uppercase font-bold mb-2">Final Score</div>
                    <div className="text-4xl font-mono text-yellow-500 font-bold">{score}</div>
                </div>
                <button
                    onClick={onBack}
                    className="mt-12 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition shadow-lg border border-slate-600"
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    if (status === 'ended') {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center text-center p-8">
                <div className="w-32 h-32 mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center animate-bounce">
                    <span className="text-6xl">🏆</span>
                </div>
                <h1 className="text-5xl font-black text-yellow-500 mb-4">GAME ENDED</h1>
                <p className="text-xl text-slate-400 mb-8 max-w-md">Check the main screen for the Podium!</p>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 w-full max-w-sm">
                    <div className="text-sm text-slate-500 uppercase font-bold mb-2">Your Final Score</div>
                    <div className="text-4xl font-mono text-white font-bold">{score}</div>
                </div>
                <button
                    onClick={onBack}
                    className="mt-12 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition shadow-lg border border-violet-400/30 w-full max-w-xs"
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onLeaveGame={() => {
                    if (onBack) onBack();
                }}
            />

            {/* Header */}
            <NavigationBar
                title={name}
                onSettingsClick={() => setShowSettings(true)}
                className="bg-slate-800/50 backdrop-blur border-b border-slate-700"
            />

            <div className="p-4 flex justify-between items-center bg-slate-800/50 backdrop-blur border-b border-slate-700">
                <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5 text-fuchsia-500" fill="currentColor" />
                    <span className="font-bold text-xl">{lives}</span>
                </div>
                <div className="bg-slate-900 px-3 py-1 rounded-lg border border-slate-600 font-mono text-yellow-400 font-bold">
                    {score} pts
                </div>
            </div>

            {/* Current Number Display */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="mb-2 text-slate-400 uppercase tracking-widest text-xs font-bold">Current Number</div>
                <div className="text-6xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 drop-shadow-lg tracking-tight min-h-[4rem]">
                    {currentNumber ?? "..."}
                </div>

                {/* Attempts / Lock indicator */}
                {isLocked ? (
                    <div className="mt-8 flex items-center gap-2 text-fuchsia-300 bg-fuchsia-500/10 px-4 py-2 rounded-full border border-fuchsia-500/20 animate-pulse">
                        <Lock className="w-4 h-4" />
                        <span className="font-bold text-sm uppercase">Locked</span>
                    </div>
                ) : (
                    maxAttempts > 1 && (
                        <div className="mt-8 flex items-center gap-2 text-slate-400 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-bold text-sm uppercase">Attempts: {maxAttempts - attempts}</span>
                        </div>
                    )
                )}
            </div>

            {/* Feedback Overlay */}
            <AnimatePresence>
                {feedback === 'correct' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-green-500/80 backdrop-blur-sm pointer-events-none"
                    >
                        <div className="text-9xl font-black text-white drop-shadow-lg">✓</div>
                    </motion.div>
                )}
                {feedback === 'wrong' && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: [0, -20, 20, -20, 20, 0] }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-red-500/50 backdrop-blur-sm pointer-events-none"
                    >
                        <div className="text-9xl font-black text-white drop-shadow-lg">✕</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Numpad */}
            <div className={`flex-1 p-4 flex flex-col justify-end pb-8 max-w-md mx-auto w-full transition-opacity duration-300 ${isLocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <p className="text-center text-slate-400 mb-6 font-bold uppercase tracking-widest text-sm">Add next digit</p>
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => submitDigit(num)}
                            className="h-20 bg-slate-800 rounded-2xl text-3xl font-bold shadow-[0_4px_0_0_rgba(30,41,59,1)] active:shadow-none active:translate-y-1 transition text-blue-200 border-t border-slate-700 hover:bg-slate-700 active:bg-slate-600"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="col-start-2">
                        <button
                            onClick={() => submitDigit(0)}
                            className="w-full h-20 bg-slate-800 rounded-2xl text-3xl font-bold shadow-[0_4px_0_0_rgba(30,41,59,1)] active:shadow-none active:translate-y-1 transition text-blue-200 border-t border-slate-700 hover:bg-slate-700 active:bg-slate-600"
                        >
                            0
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
