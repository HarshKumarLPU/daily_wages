import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { MapPin, User, LogOut, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkerDashboard = () => {
    const { t } = useTranslation();
    const { user, logout, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [pincode, setPincode] = useState(user?.pincode || '');

    const updateLocation = async () => {
        if (!pincode || pincode.length !== 6) {
            setMsg(t('enter_pincode'));
            setTimeout(() => setMsg(''), 3000);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://api.zippopotam.us/in/${pincode}`);
            if (!response.ok) throw new Error('Invalid pincode');
            const data = await response.json();
            const place = data.places[0];
            const coordinates = [parseFloat(place.longitude), parseFloat(place.latitude)];

            const res = await api.put('/workers/me', {
                coordinates,
                pincode
            });
            setUser(res.data.user);
            setMsg(t('saved'));
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setMsg(t('error'));
            setTimeout(() => setMsg(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative pb-20">

            <nav className="glass sticky top-0 z-50 p-4 flex justify-between items-center border-b border-white/10">
                <motion.h1
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-2xl font-black text-gradient"
                >
                    DailyWages
                </motion.h1>
                <motion.button
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={logout}
                    className="text-white/70 hover:text-red-400 flex items-center font-bold transition-colors bg-white/5 py-2 px-4 rounded-xl border border-white/10"
                >
                    <LogOut size={18} className="mr-2" /> {t('logout')}
                </motion.button>
            </nav>

            <main className="max-w-2xl mx-auto mt-10 px-4 relative z-10">
                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 rounded-3xl mb-8 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={120} className="text-white" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                        <motion.div
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            className="w-28 h-28 bg-gradient-to-br from-primary-500 to-accent rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/20 rotate-3"
                        >
                            <User size={56} className="text-white" />
                        </motion.div>

                        <div className="text-center md:text-left">
                            <h2 className="text-4xl font-black text-white mb-1">{user?.name}</h2>
                            <p className="text-primary-300 font-bold text-lg mb-4">{user?.phone}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <div className="flex items-center text-sm font-bold text-white/80 bg-white/10 py-2 px-4 rounded-full border border-white/10 backdrop-blur-md">
                                    <MapPin size={16} className="mr-2 text-primary-400" />
                                    {user?.location?.coordinates[1].toFixed(4)}, {user?.location?.coordinates[0].toFixed(4)}
                                </div>
                                {user?.pincode && (
                                    <div className="flex items-center text-sm font-bold text-white/80 bg-accent/20 py-2 px-4 rounded-full border border-accent/20 backdrop-blur-md">
                                        {t('pincode_label')}: {user.pincode}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Location Update Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <div className="glass-card p-8 rounded-3xl">
                        <h3 className="text-xl font-black text-white mb-6 flex items-center">
                            <MapPin className="mr-2 text-primary-400" size={24} />
                            {t('update_location')}
                        </h3>

                        <div className="space-y-4">
                            <div className="relative group">
                                <input
                                    type="text"
                                    maxLength="6"
                                    placeholder={t('enter_pincode')}
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    className="input-field py-5 pl-14 text-xl font-black tracking-widest transition-all group-focus-within:ring-primary-500 group-hover:bg-white/15"
                                />
                            </div>

                            <button
                                onClick={updateLocation}
                                disabled={loading}
                                className="btn-primary w-full py-5 flex items-center justify-center text-xl relative group overflow-hidden"
                            >
                                <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                                {loading ? (
                                    <RefreshCw className="animate-spin mr-3" size={24} />
                                ) : (
                                    <RefreshCw className="mr-3 group-hover:rotate-180 transition-transform duration-500" size={24} />
                                )}
                                <span className="relative">{t('update_location')}</span>
                            </button>

                            <AnimatePresence>
                                {msg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`flex items-center justify-center p-3 rounded-2xl font-bold ${msg.includes('valid') || msg.includes('Invalid')
                                            ? 'bg-red-500/20 text-red-100 border border-red-500/30'
                                            : 'bg-green-500/20 text-green-100 border border-green-500/30'
                                            }`}
                                    >
                                        <CheckCircle size={20} className="mr-2" /> {msg}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="glass-card p-6 rounded-3xl border-l-4 border-l-primary-500"
                    >
                        <h4 className="font-black text-white mb-2">{t('update_profile')}</h4>
                        <p className="text-white/60 font-medium text-sm">
                            {t('location')}: {t('update_profile_tip')}
                        </p>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
};

export default WorkerDashboard;
