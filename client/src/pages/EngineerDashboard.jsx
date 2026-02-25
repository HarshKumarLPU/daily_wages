import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Search, MapPin, Phone, LogOut, Filter, Info, Users, Zap, Navigation, RefreshCw, User, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EngineerDashboard = () => {
    const { t } = useTranslation();
    const { logout, user } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [radius, setRadius] = useState(5);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState(null);
    const [pincode, setPincode] = useState(user?.pincode || '');
    const [error, setError] = useState('');
    const nativeNames = {
        en: 'English',
        hi: 'हिंदी',
        bn: 'বাংলা',
        te: 'తెలుగు',
        mr: 'मराठी'
    };

    useEffect(() => {
        if (user?.pincode) {
            handlePincodeSearch(user.pincode);
        }
    }, []);

    const fetchWorkers = async (location, r) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/engineers/workers?lng=${location.lng}&lat=${location.lat}&radius=${r}`);
            setWorkers(res.data);
        } catch (err) {
            console.error(err);
            setError(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const handlePincodeSearch = async (pin) => {
        if (!pin || pin.length !== 6) return;

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`https://api.zippopotam.us/in/${pin}`);
            if (!response.ok) throw new Error('Invalid pincode');
            const data = await response.json();
            const place = data.places[0];
            const newCoords = { lng: parseFloat(place.longitude), lat: parseFloat(place.latitude) };
            setCoords(newCoords);
            await fetchWorkers(newCoords, radius);
        } catch (err) {
            console.error('Pincode fetch error:', err);
            setError(t('enter_pincode'));
            setWorkers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRadiusChange = (e) => {
        const newRadius = e.target.value;
        setRadius(newRadius);
        if (coords) fetchWorkers(coords, newRadius);
    };

    return (
        <div className="min-h-screen relative pb-24">

            <nav className="glass sticky top-0 z-50 p-4 flex justify-between items-center border-b border-white/10">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center space-x-2"
                >
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Users className="text-white" size={20} />
                    </div>
                    <h1 className="text-2xl font-black text-gradient">DailyWages</h1>
                </motion.div>
                <div className="flex items-center space-x-4">
                    <button onClick={logout} className="text-white/70 hover:text-red-400 flex items-center font-bold transition-colors bg-white/5 py-2.5 px-5 rounded-2xl border border-white/10">
                        <LogOut size={18} className="mr-2" /> {t('logout')}
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto mt-10 px-4 relative z-10">
                {/* Search & Stats Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 rounded-[2.5rem] lg:col-span-2 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Search size={160} className="text-white" />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-white mb-2 flex items-center">
                                <Navigation className="mr-3 text-primary-400 animate-pulse" size={32} />
                                {t('find_workers')}
                            </h2>
                            <p className="text-white/50 font-medium mb-8 uppercase tracking-widest text-[10px]">{t('enter_pincode')} to explore laborers</p>

                            <div className="flex flex-col md:flex-row gap-4 mb-8">
                                <div className="relative flex-1 group">
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder={`${t('pincode')} (e.g. 110001)`}
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                        className="input-field py-4 pl-12 text-lg font-bold tracking-widest focus:ring-accent"
                                    />
                                </div>
                                <button
                                    onClick={() => handlePincodeSearch(pincode)}
                                    disabled={loading}
                                    className="btn-primary px-8 py-4 flex items-center justify-center min-w-[140px]"
                                >
                                    {loading ? <RefreshCw className="animate-spin mr-2" /> : <Search className="mr-2" size={20} />}
                                    <span className="font-black uppercase tracking-wider text-sm">{t('search')}</span>
                                </button>
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-red-400 text-xs font-bold mb-6 flex items-center"
                                >
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2 animate-pulse" />
                                    {error}
                                </motion.p>
                            )}

                            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold text-white/70 uppercase tracking-widest">{t('radius')}</span>
                                    <span className="text-2xl font-black text-primary-400">{radius} km</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={radius}
                                    onChange={handleRadiusChange}
                                    className="w-full accent-primary-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] font-black text-white/30 uppercase mt-2 tracking-tighter">
                                    <span>1km</span>
                                    <span>25km</span>
                                    <span>50km</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                            <Filter className="text-primary-400" size={40} />
                        </div>
                        <div className="text-5xl font-black text-white mb-2">{workers.length}</div>
                        <div className="text-white/50 font-bold uppercase tracking-widest text-xs">{t('nearby_workers')}</div>
                    </motion.div>
                </div>

                {/* Workers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {workers.length > 0 ? workers.map((worker, idx) => (
                            <motion.div
                                key={worker._id}
                                layout
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05, duration: 0.4 }}
                                whileHover={{ y: -8 }}
                                className="glass-card p-7 rounded-[2rem] border border-white/5 hover:border-primary-500/30 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:from-primary-500 group-hover:to-primary-600 transition-all duration-500">
                                        <User size={32} className="text-white/70 group-hover:text-white" />
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest group-hover:bg-primary-500/20 group-hover:text-primary-300 transition-colors">
                                        ID: {worker._id.slice(-4)}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-white mb-2 group-hover:text-primary-400 transition-colors">{worker.name}</h3>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center text-sm font-medium text-white/50 bg-white/5 py-2 px-4 rounded-xl border border-white/5">
                                        <Globe size={16} className="mr-3 text-accent-light" />
                                        <span>{worker.language === 'en' ? 'English' : nativeNames[worker.language] || worker.language} {t('speaker_suffix')}</span>
                                    </div>
                                    <div className="flex items-center text-sm font-medium text-white/50 bg-white/5 py-2 px-4 rounded-xl border border-white/5">
                                        <MapPin size={16} className="mr-3 text-primary-400" />
                                        <span>{t('nearby_worker')}</span>
                                    </div>
                                </div>

                                <motion.a
                                    whileTap={{ scale: 0.95 }}
                                    href={`tel:${worker.phone}`}
                                    className="flex items-center justify-center w-full bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-primary-500 hover:text-white transition-all shadow-xl shadow-white/5"
                                >
                                    <Phone size={20} className="mr-3" />
                                    {worker.phone}
                                </motion.a>
                            </motion.div>
                        )) : !loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full py-24 text-center glass-card rounded-[3rem] border-2 border-dashed border-white/10"
                            >
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Info size={48} className="text-white/20" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">{t('no_workers_found')}</h3>
                                <p className="text-white/40 font-medium max-w-xs mx-auto">{t('no_workers_found')}.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {loading && (
                    <div className="flex flex-col justify-center items-center mt-20 space-y-4">
                        <div className="w-16 h-16 border-4 border-white/10 border-t-primary-500 rounded-full animate-spin shadow-2xl shadow-primary-500/20"></div>
                        <p className="text-white/30 font-black uppercase tracking-[0.3em] text-[10px]">{t('scanning')}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EngineerDashboard;
