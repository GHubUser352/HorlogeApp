const { useState, useEffect } = React;
const { ipcRenderer } = window.require ? window.require('electron') : {};

function App() {
    const [time, setTime] = useState(new Date());
    const [onTop, setOnTop] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [minimal, setMinimal] = useState(false);
    const [timerSec, setTimerSec] = useState(0);
    const [running, setRunning] = useState(false);
    const [mode, setMode] = useState('chrono');
    const [startTime] = useState(Date.now());
    const [sessionSec, setSessionSec] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 16);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const t = setInterval(() => setSessionSec(Math.floor((Date.now() - startTime) / 1000)), 1000);
        return () => clearInterval(t);
    }, [startTime]);

    useEffect(() => {
        if (running) {
            const t = setInterval(() => {
                setTimerSec(p => {
                    if (mode === 'chrono') return p + 1;
                    if (p <= 0) {
                        setRunning(false);
                        return 0;
                    }
                    return p - 1;
                });
            }, 1000);
            return () => clearInterval(t);
        }
    }, [running, mode]);

    useEffect(() => {
        if (ipcRenderer) ipcRenderer.send('set-always-on-top', onTop);
    }, [onTop]);

    const getWeekNumber = (date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    const getProgress = () => {
        const h = time.getHours(), m = time.getMinutes(), s = time.getSeconds(), ms = time.getMilliseconds();
        const d = time.getDate(), month = time.getMonth(), year = time.getFullYear();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 366 : 365;
        const dayOfYear = Math.floor((time - new Date(year, 0, 0)) / 86400000);

        return {
            minute: (((s * 1000 + ms) / 60000) * 100).toFixed(2),
            heure: (((m * 60 + s) / 3600) * 100).toFixed(2),
            jour: (((h * 3600 + m * 60 + s) / 86400) * 100).toFixed(2),
            mois: (((d - 1 + (h * 3600 + m * 60 + s) / 86400) / daysInMonth) * 100).toFixed(2),
            annee: (((dayOfYear + (h * 3600 + m * 60 + s) / 86400) / daysInYear) * 100).toFixed(2)
        };
    };

    const prog = getProgress();
    const weekNum = getWeekNumber(time);
    
    const themes = {
        dark: { bg: 'from-slate-950 via-blue-950 to-slate-950', card: 'bg-slate-900/80', text: 'text-white', accent: 'text-blue-400' },
        light: { bg: 'from-slate-50 via-blue-50 to-slate-100', card: 'bg-white/80', text: 'text-slate-900', accent: 'text-blue-600' },
        ocean: { bg: 'from-cyan-950 via-blue-950 to-indigo-950', card: 'bg-cyan-900/80', text: 'text-white', accent: 'text-cyan-400' },
        sunset: { bg: 'from-orange-950 via-red-950 to-purple-950', card: 'bg-orange-900/80', text: 'text-white', accent: 'text-orange-400' },
        forest: { bg: 'from-green-950 via-emerald-950 to-teal-950', card: 'bg-green-900/80', text: 'text-white', accent: 'text-green-400' }
    };

    const t = themes[theme];

    const formatTime = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };

    const setQuickTimer = (seconds) => {
        setTimerSec(seconds);
        setMode('timer');
        setRunning(false);
    };

    const Bar = ({ val, label, color }) => (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${t.text} opacity-80`}>{label}</span>
                <span className={`text-sm font-bold ${t.accent}`}>{val}%</span>
            </div>
            <div className={`w-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'} rounded-full h-3 shadow-inner`}>
                <div className={`h-3 rounded-full ${color} shadow-lg`} style={{width: `${val}%`, transition: 'width 0.016s linear'}}/>
            </div>
        </div>
    );

    if (minimal) {
        return (
            <div className={`h-screen bg-gradient-to-br ${t.bg} flex items-center justify-center p-4`}>
                <div className={`${t.card} backdrop-blur-xl rounded-3xl shadow-2xl p-10 border ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'} max-w-md`}>
                    <div className={`text-6xl font-bold ${t.text} mb-3 font-mono tracking-tight text-center`}>
                        {time.toLocaleTimeString('fr-FR')}
                    </div>
                    <div className={`text-lg ${t.text} opacity-70 text-center mb-4`}>
                        {time.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'})}
                    </div>
                    <button onClick={() => setMinimal(false)} className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg">
                        Mode Complet
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br ${t.bg} p-6`}>
            <div className="max-w-7xl mx-auto">
                {/* Toolbar */}
                <div className={`${t.card} backdrop-blur-xl rounded-2xl p-4 mb-6 border ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'} shadow-xl`}>
                    <div className="flex gap-3 flex-wrap items-center justify-between">
                        <div className="flex gap-3 flex-wrap">
                            <button onClick={() => setOnTop(!onTop)} className={`px-4 py-2.5 rounded-xl font-medium transition shadow-lg ${onTop ? 'bg-blue-600 text-white' : theme === 'light' ? 'bg-slate-200 text-slate-900 hover:bg-slate-300' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                                📌 {onTop ? 'Épinglé' : 'Épingler'}
                            </button>
                            <button onClick={() => setMinimal(true)} className={`px-4 py-2.5 rounded-xl font-medium transition shadow-lg ${theme === 'light' ? 'bg-slate-200 text-slate-900 hover:bg-slate-300' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                                🔽 Minimal
                            </button>
                        </div>
                        <select value={theme} onChange={e => setTheme(e.target.value)} className={`px-4 py-2.5 rounded-xl font-medium shadow-lg cursor-pointer ${theme === 'light' ? 'bg-slate-200 text-slate-900' : 'bg-slate-800 text-white'}`}>
                            <option value="dark">🌙 Sombre</option>
                            <option value="light">☀️ Clair</option>
                            <option value="ocean">🌊 Océan</option>
                            <option value="sunset">🌅 Coucher</option>
                            <option value="forest">🌲 Forêt</option>
                        </select>
                    </div>
                </div>

                {/* Horloge + Timer */}
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    <div className={`${t.card} backdrop-blur-xl rounded-3xl p-8 border ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'} shadow-2xl`}>
                        <h1 className={`text-3xl font-bold ${t.text} text-center mb-6 flex items-center justify-center gap-3`}>
                            <span className="text-4xl">⏰</span> Horloge Temporelle
                        </h1>
                        <div className={`text-7xl font-bold ${t.text} text-center mb-4 font-mono tracking-tight`}>
                            {time.toLocaleTimeString('fr-FR')}
                        </div>
                        <div className={`text-center text-xl ${t.text} opacity-80 mb-6`}>
                            {time.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                {label: 'Année', val: time.getFullYear()},
                                {label: 'Mois', val: time.getMonth() + 1},
                                {label: 'Semaine', val: weekNum},
                                {label: 'Jour', val: time.getDate()}
                            ].map((item, i) => (
                                <div key={i} className={`${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'} rounded-xl p-3 text-center shadow-lg`}>
                                    <div className={`text-xs ${t.accent} font-semibold mb-1`}>{item.label}</div>
                                    <div className={`text-2xl font-bold ${t.text}`}>{item.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${t.card} backdrop-blur-xl rounded-3xl p-8 border ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'} shadow-2xl`}>
                        <h2 className={`text-3xl font-bold ${t.text} text-center mb-6 flex items-center justify-center gap-3`}>
                            <span className="text-4xl">⏱️</span> {mode === 'chrono' ? 'Chronomètre' : 'Timer'}
                        </h2>
                        <div className={`text-7xl font-bold ${t.text} text-center mb-6 font-mono tracking-tight`}>
                            {formatTime(timerSec)}
                        </div>
                        
                        {/* Boutons de mode */}
                        <div className="flex gap-3 justify-center mb-4">
                            <button 
                                onClick={() => {setMode('chrono'); setTimerSec(0); setRunning(false);}} 
                                className={`px-5 py-3 rounded-xl font-semibold transition shadow-lg ${mode === 'chrono' ? 'bg-blue-600 text-white' : theme === 'light' ? 'bg-slate-200 text-slate-900 hover:bg-slate-300' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                                ⏱️ Chrono
                            </button>
                            <button 
                                onClick={() => {setMode('timer'); setTimerSec(0); setRunning(false);}} 
                                className={`px-5 py-3 rounded-xl font-semibold transition shadow-lg ${mode === 'timer' ? 'bg-blue-600 text-white' : theme === 'light' ? 'bg-slate-200 text-slate-900 hover:bg-slate-300' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                                ⏲️ Timer
                            </button>
                        </div>

                        {/* Boutons rapides pour Timer */}
                        {mode === 'timer' && !running && (
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {[
                                    {label: '1 min', sec: 60},
                                    {label: '5 min', sec: 300},
                                    {label: '10 min', sec: 600},
                                    {label: '15 min', sec: 900},
                                    {label: '20 min', sec: 1200},
                                    {label: '30 min', sec: 1800},
                                    {label: '45 min', sec: 2700},
                                    {label: '1h', sec: 3600}
                                ].map((btn, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setQuickTimer(btn.sec)}
                                        className={`px-3 py-2 rounded-lg font-medium transition text-sm ${theme === 'light' ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Contrôles */}
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={() => setRunning(!running)} 
                                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-xl text-lg">
                                {running ? '⏸️ Pause' : '▶️ Start'}
                            </button>
                            <button 
                                onClick={() => {setTimerSec(0); setRunning(false);}} 
                                className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold shadow-xl text-lg">
                                🔄 Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Session */}
                <div className={`${t.card} backdrop-blur-xl rounded-3xl p-8 mb-6 border ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'} shadow-2xl`}>
                    <h2 className={`text-2xl font-bold ${t.text} mb-4 flex items-center gap-3`}>
                        <span className="text-3xl">📊</span> Session actuelle
                    </h2>
                    <div className="text-center">
                        <div className={`text-5xl font-bold ${t.text} font-mono`}>{formatTime(sessionSec)}</div>
                        <div className={`text-lg ${t.text} opacity-60 mt-2`}>Temps total</div>
                    </div>
                </div>

                {/* Progression */}
                <div className={`${t.card} backdrop-blur-xl rounded-3xl p-8 border ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'} shadow-2xl`}>
                    <h2 className={`text-2xl font-bold ${t.text} mb-6 flex items-center gap-3`}>
                        <span className="text-3xl">📈</span> Progression Temporelle
                    </h2>
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div>
                            <Bar val={prog.minute} label="Minute actuelle" color="bg-gradient-to-r from-blue-500 to-cyan-500" />
                            <Bar val={prog.heure} label="Heure actuelle" color="bg-gradient-to-r from-green-500 to-emerald-500" />
                            <Bar val={prog.jour} label="Journée actuelle" color="bg-gradient-to-r from-yellow-500 to-orange-500" />
                        </div>
                        <div>
                            <Bar val={prog.mois} label="Mois actuel" color="bg-gradient-to-r from-indigo-500 to-purple-500" />
                            <Bar val={prog.annee} label="Année actuelle" color="bg-gradient-to-r from-teal-500 to-cyan-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));