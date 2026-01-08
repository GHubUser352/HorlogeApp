const { useState, useEffect } = React;
const { ipcRenderer } = window.require ? window.require('electron') : {};

function App() {
    const [time, setTime] = useState(new Date());
    const [onTop, setOnTop] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [minimal, setMinimal] = useState(false);
    const [sound, setSound] = useState(true);
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
            const t = setInterval(() => setTimerSec(p => mode === 'chrono' ? p + 1 : Math.max(0, p - 1)), 1000);
            return () => clearInterval(t);
        }
    }, [running, mode]);

    useEffect(() => {
        if (ipcRenderer) ipcRenderer.send('set-always-on-top', onTop);
    }, [onTop]);

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
    const themes = {
        dark: 'from-gray-900 via-blue-900 to-gray-900',
        light: 'from-blue-50 via-purple-50 to-pink-50',
        ocean: 'from-cyan-900 via-blue-900 to-indigo-900',
        sunset: 'from-orange-900 via-red-900 to-purple-900',
        forest: 'from-green-900 via-emerald-900 to-teal-900'
    };

    const formatTime = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };

    const Bar = ({ val, label, color }) => (
        <div className="mb-3">
            <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-300">{label}</span>
                <span className="text-sm font-bold text-white">{val}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${color}`} style={{width: `${val}%`, transition: 'width 0.016s linear'}}/>
            </div>
        </div>
    );

    if (minimal) {
        return (
            <div className={`min-h-screen bg-gradient-to-br ${themes[theme]} flex items-center justify-center p-4`}>
                <div className="bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl p-8 text-center">
                    <div className="text-6xl font-bold text-white mb-4 font-mono">{time.toLocaleTimeString('fr-FR')}</div>
                    <div className="text-lg text-gray-300 mb-4">{time.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'})}</div>
                    <button onClick={() => setMinimal(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Mode Complet</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br ${themes[theme]} p-4 overflow-y-auto`}>
            <div className="max-w-6xl mx-auto">
                {/* Barre outils */}
                <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-4 mb-4 flex gap-2 flex-wrap justify-between">
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setOnTop(!onTop)} className={`px-3 py-2 rounded ${onTop ? 'bg-blue-600' : 'bg-gray-700'} text-white hover:opacity-80`}>
                            📌 {onTop ? 'Épinglé' : 'Épingler'}
                        </button>
                        <button onClick={() => setMinimal(true)} className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">🔽 Minimal</button>
                        <button onClick={() => setSound(!sound)} className={`px-3 py-2 rounded ${sound ? 'bg-green-600' : 'bg-gray-700'} text-white hover:opacity-80`}>
                            {sound ? '🔊 ON' : '🔇 OFF'}
                        </button>
                    </div>
                    <select value={theme} onChange={e => setTheme(e.target.value)} className="px-3 py-2 bg-gray-700 text-white rounded">
                        <option value="dark">🌙 Sombre</option>
                        <option value="light">☀️ Clair</option>
                        <option value="ocean">🌊 Océan</option>
                        <option value="sunset">🌅 Coucher</option>
                        <option value="forest">🌲 Forêt</option>
                    </select>
                </div>

                {/* Horloge + Chrono */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6 border border-gray-700">
                        <h1 className="text-2xl font-bold text-white text-center mb-4">⏰ Horloge Temporelle</h1>
                        <div className="text-6xl font-bold text-white text-center mb-3 font-mono">
                            {time.toLocaleTimeString('fr-FR')}
                        </div>
                        <div className="text-center text-lg text-gray-300 mb-4">
                            {time.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                {label: 'Année', val: time.getFullYear()},
                                {label: 'Mois', val: time.getMonth() + 1},
                                {label: 'Jour', val: time.getDate()},
                                {label: 'Heure', val: time.getHours()}
                            ].map((item, i) => (
                                <div key={i} className="bg-gray-700 bg-opacity-50 rounded p-2 text-center">
                                    <div className="text-xs text-blue-400">{item.label}</div>
                                    <div className="text-xl font-bold text-white">{item.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6 border border-gray-700">
                        <h2 className="text-2xl font-bold text-white text-center mb-4">⏱️ {mode === 'chrono' ? 'Chronomètre' : 'Timer'}</h2>
                        <div className="text-6xl font-bold text-white text-center mb-4 font-mono">
                            {formatTime(timerSec)}
                        </div>
                        <div className="flex gap-2 justify-center mb-4">
                            <button onClick={() => setMode(mode === 'chrono' ? 'timer' : 'chrono')} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
                                {mode === 'chrono' ? '⏲️ Timer' : '⏱️ Chrono'}
                            </button>
                        </div>
                        <div className="flex gap-2 justify-center">
                            <button onClick={() => setRunning(!running)} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                {running ? '⏸️ Pause' : '▶️ Start'}
                            </button>
                            <button onClick={() => {setTimerSec(0); setRunning(false);}} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                🔄 Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats session */}
                <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6 mb-4 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">📊 Session actuelle</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-3xl font-bold text-white">{formatTime(sessionSec)}</div>
                            <div className="text-sm text-gray-400">Temps total</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">{Math.floor(sessionSec / 3600)}h</div>
                            <div className="text-sm text-gray-400">Heures</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">{Math.floor((sessionSec % 3600) / 60)}m</div>
                            <div className="text-sm text-gray-400">Minutes</div>
                        </div>
                    </div>
                </div>

                {/* Progression */}
                <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">📈 Progression Temporelle</h2>
                    <div className="grid md:grid-cols-2 gap-4">
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