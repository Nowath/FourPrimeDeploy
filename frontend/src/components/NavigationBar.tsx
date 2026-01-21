import { ArrowLeft, Settings } from 'lucide-react';

interface NavigationBarProps {
    title?: string;
    onBack?: () => void;
    onSettingsClick: () => void;
    className?: string;
}

export default function NavigationBar({ title, onBack, onSettingsClick, className = '' }: NavigationBarProps) {
    return (
        <div className={`flex items-center justify-between p-3 sm:p-4 ${className} z-40 relative`}>
            {onBack ? (
                <button
                    onClick={onBack}
                    className="p-2 sm:p-3 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition active:scale-95 shadow-lg touch-manipulation"
                >
                    <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
            ) : (
                <div className="w-10 sm:w-12"></div>
            )}

            {title && (
                <h1 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-300 drop-shadow-md truncate max-w-[150px] sm:max-w-none">
                    {title}
                </h1>
            )}

            <button
                onClick={onSettingsClick}
                className="p-2 sm:p-3 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition active:scale-95 shadow-lg touch-manipulation"
            >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
        </div>
    );
}
