import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { MapPin, User, LogOut, CheckCircle, RefreshCw, Zap, Phone, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkerDashboard = () => {
    const { t } = useTranslation();
    const { user, logout, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [pincode, setPincode] = useState(user?.pincode || '');
    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'jobs'

    React.useEffect(() => {
        if (user?.location?.coordinates) {
            fetchNearbyJobs(user.location.coordinates[0], user.location.coordinates[1]);
        }
    }, [user?.location]);

    const fetchNearbyJobs = async (lng, lat) => {
        try {
            const res = await api.get(`/jobs/nearby?lng=${lng}&lat=${lat}&radius=50`);
            setJobs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

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
            <nav className="glass sticky top-0 z-50 p-6 flex justify-between items-center border-b-2 border-slate-100 shadow-sm">
                <motion.h1
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-3xl font-black text-gradient flex items-center"
                >
                    <Briefcase className="mr-3 text-primary-600" size={32} />
                    DailyWages
                </motion.h1>
                <div className="flex items-center space-x-6">
                    <motion.button
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        onClick={logout}
                        className="text-slate-600 hover:text-red-500 flex items-center font-black transition-all bg-white py-3 px-6 rounded-2xl border-2 border-slate-200 shadow-sm active:scale-95"
                    >
                        <LogOut size={24} className="mr-2" />
                        <span className="uppercase tracking-widest text-sm">{t('logout')}</span>
                    </motion.button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto mt-10 px-4 relative z-10">
                {/* Tabs */}
                <div className="flex space-x-6 mb-12 bg-slate-100 p-3 rounded-[3rem] border-2 border-slate-200 w-fit mx-auto shadow-inner">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all ${activeTab === 'profile' ? 'bg-primary-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <User className="inline mr-2" size={20} />
                        {t('update_profile')}
                    </button>
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all ${activeTab === 'jobs' ? 'bg-accent text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <Briefcase className="inline mr-2" size={20} />
                        {t('available_jobs')}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'profile' ? (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="glass-card p-12 rounded-[3.5rem] mb-12 relative overflow-hidden group border-4 border-white shadow-2xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <User size={180} className="text-slate-900" />
                                </div>
                                <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12 relative z-10">
                                    <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary-500/30">
                                        <User size={64} className="text-white" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h2 className="text-5xl font-black text-slate-900 mb-2 truncate max-w-xs">{user?.name}</h2>
                                        <p className="text-primary-600 font-black text-2xl mb-6 tracking-widest">{user?.phone}</p>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                            <div className="flex items-center text-sm font-black text-slate-500 bg-slate-50 py-3 px-6 rounded-full border-2 border-slate-200 uppercase tracking-widest shadow-sm">
                                                <MapPin size={18} className="mr-3 text-accent" />
                                                {user?.pincode}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-12 rounded-[3.5rem] border-4 border-white shadow-2xl">
                                <h3 className="text-3xl font-black text-slate-800 mb-10 flex items-center">
                                    <MapPin className="mr-4 text-accent" size={36} />
                                    {t('update_location')}
                                </h3>
                                <div className="space-y-6">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            maxLength="6"
                                            placeholder={t('enter_pincode')}
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value)}
                                            className="input-field py-8 text-3xl font-black tracking-[0.5em] text-center"
                                        />
                                    </div>
                                    <button
                                        onClick={updateLocation}
                                        disabled={loading}
                                        className="btn-primary w-full py-7 flex items-center justify-center text-2xl"
                                    >
                                        {loading ? <RefreshCw className="animate-spin mr-4" size={32} /> : <RefreshCw className="mr-4" size={32} strokeWidth={3} />}
                                        <span className="uppercase tracking-widest">{t('update_location')}</span>
                                    </button>
                                    {msg && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center font-black p-6 rounded-[2rem] bg-green-50 text-green-600 border-2 border-green-100 shadow-sm text-lg"
                                        >
                                            <CheckCircle className="inline mr-3" size={24} />
                                            {msg}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="jobs"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {jobs.length > 0 ? jobs.map((job) => (
                                    <motion.div
                                        key={job._id}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className="glass-card p-10 rounded-[3rem] border-4 border-white hover:border-primary-100 transition-all flex flex-col justify-between shadow-xl"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <h3 className="text-3xl font-black text-slate-900 leading-tight">{job.title}</h3>
                                                <span className="px-6 py-3 bg-accent text-white rounded-2xl text-lg font-black shadow-lg shadow-accent/30">
                                                    ₹{job.salary}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 font-bold text-lg mb-8 line-clamp-3 leading-relaxed">{job.description}</p>
                                            <div className="flex items-center space-x-6 mb-10">
                                                <div className="flex items-center text-sm font-black text-slate-400 uppercase tracking-widest">
                                                    <User size={18} className="mr-2 text-primary-500" />
                                                    {job.engineer?.name}
                                                </div>
                                                <div className="flex items-center text-sm font-black text-slate-400 uppercase tracking-widest">
                                                    <MapPin size={18} className="mr-2 text-accent" />
                                                    {job.pincode}
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href={`tel:${job.engineer?.phone}`}
                                            className="btn-primary flex items-center justify-center w-full py-6 text-2xl shadow-primary-500/20"
                                        >
                                            <Phone size={28} className="mr-4" strokeWidth={3} />
                                            {t('call_engineer')}
                                        </a>
                                    </motion.div>
                                )) : (
                                    <div className="col-span-full py-32 text-center glass-card rounded-[3.5rem] border-4 border-dashed border-slate-200 bg-slate-50/50">
                                        <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-2 border-slate-100">
                                            <Zap size={56} className="text-slate-200" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-400 mb-4">{t('no_jobs_found')}</h3>
                                        <p className="text-slate-400 font-bold text-lg">{t('update_profile_tip')}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default WorkerDashboard;
