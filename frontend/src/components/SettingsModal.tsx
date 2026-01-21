import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, LogOut, Settings } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLeaveGame?: () => void;
}

export default function SettingsModal({ isOpen, onClose, onLeaveGame }: SettingsModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl pointer-events-auto">
                            <div className="flex justify-between items-center mb-5 sm:mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
                                    Settings
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition touch-manipulation">
                                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800 rounded-xl">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                                        <span className="font-bold text-sm sm:text-base">Sound Effects</span>
                                    </div>
                                    <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-green-400 rounded-full shadow-lg"></div>
                                    </div>
                                </div>

                                {onLeaveGame && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to leave?')) {
                                                onLeaveGame();
                                                onClose();
                                            }
                                        }}
                                        className="w-full flex items-center justify-center gap-2 p-3 sm:p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/20 transition text-sm sm:text-base touch-manipulation"
                                    >
                                        <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Leave Game
                                    </button>
                                )}
                            </div>

                            <div className="mt-6 sm:mt-8 text-center text-slate-600 text-xs sm:text-sm">
                                Prime Chain v1.0
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
