import { ArrowLeft, Settings } from 'lucide-react';

interface NavigationBarProps {
    title?: string;
    onBack?: () => void;
    onSettingsClick: () => void;
    className?: string;
}

export default function NavigationBar({ title, onBack, onSettingsClick, className = '' }: NavigationBarProps) {
    return (
        <div className={`flex items-center justify-between p-4 ${className} z-40 relative`}>
            {onBack ? (
                <button
                    onClick={onBack}
                    className="p-3 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition active:scale-95 shadow-lg"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
            ) : (
                <div className="w-12"></div> // Spacer
            )}

            {title && (
                <h1 className="text-lg font-bold uppercase tracking-wider text-slate-300 drop-shadow-md">
                    {title}
                </h1>
            )}

            <button
                onClick={onSettingsClick}
                className="p-3 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition active:scale-95 shadow-lg"
            >
                <Settings className="w-6 h-6 text-white" />
            </button>
        </div>
    );
}
