import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Search, MapPin, Phone, LogOut, Filter, Info, Users, Zap, Navigation, RefreshCw, User, Globe, Briefcase, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EngineerDashboard = () => {
    const { t } = useTranslation();
    const { logout, user } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('workers'); // 'workers' or 'jobs'
    const [radius, setRadius] = useState(5);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState(null);
    const [pincode, setPincode] = useState(user?.pincode || '');
    const [error, setError] = useState('');
    const [jobMsg, setJobMsg] = useState('');

    const [jobFormData, setJobFormData] = useState({
        title: '',
        description: '',
        salary: '',
        pincode: ''
    });

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
        fetchMyJobs();
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

    const fetchMyJobs = async () => {
        try {
            const res = await api.get('/jobs/engineer');
            setJobs(res.data);
        } catch (err) {
            console.error(err);
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

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Get coordinates for job pincode
            const response = await fetch(`https://api.zippopotam.us/in/${jobFormData.pincode}`);
            if (!response.ok) throw new Error('Invalid pincode');
            const data = await response.json();
            const place = data.places[0];
            const coordinates = [parseFloat(place.longitude), parseFloat(place.latitude)];

            await api.post('/jobs', {
                ...jobFormData,
                coordinates
            });

            setJobMsg(t('post_success'));
            setJobFormData({ title: '', description: '', salary: '', pincode: '' });
            fetchMyJobs();
            setTimeout(() => setJobMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || t('error'));
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
            <nav className="glass sticky top-0 z-50 p-6 flex justify-between items-center border-b-2 border-slate-100 shadow-sm">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center space-x-3"
                >
                    <div className="w-12 h-12 bg-primary-600 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-primary-500/20">
                        <Users className="text-white" size={24} />
                    </div>
                    <h1 className="text-3xl font-black text-gradient">DailyWages</h1>
                </motion.div>
                <div className="flex items-center space-x-6">
                    <button
                        onClick={logout}
                        className="text-slate-600 hover:text-red-500 flex items-center font-black transition-all bg-white py-3 px-6 rounded-2xl border-2 border-slate-200 shadow-sm active:scale-95"
                    >
                        <LogOut size={24} className="mr-2" />
                        <span className="uppercase tracking-widest text-sm">{t('logout')}</span>
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto mt-10 px-4 relative z-10">
                {/* Tabs */}
                <div className="flex space-x-6 mb-12 bg-slate-100 p-3 rounded-[3rem] border-2 border-slate-200 w-fit mx-auto shadow-inner">
                    <button
                        onClick={() => setActiveTab('workers')}
                        className={`px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all ${activeTab === 'workers' ? 'bg-primary-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <User className="inline mr-2" size={20} />
                        {t('find_workers_tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all ${activeTab === 'jobs' ? 'bg-accent text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <Briefcase className="inline mr-2" size={20} />
                        {t('jobs_tab')}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'workers' ? (
                        <motion.div
                            key="workers"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                                <motion.div className="glass-card p-12 rounded-[3.5rem] lg:col-span-2 relative overflow-hidden border-4 border-white shadow-2xl">
                                    <div className="relative z-10">
                                        <h2 className="text-4xl font-black text-slate-900 mb-8 flex items-center">
                                            <Navigation className="mr-4 text-primary-600" size={48} strokeWidth={3} />
                                            {t('find_workers')}
                                        </h2>
                                        <div className="flex flex-col md:flex-row gap-6 mb-10">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    maxLength="6"
                                                    placeholder={t('pincode')}
                                                    value={pincode}
                                                    onChange={(e) => setPincode(e.target.value)}
                                                    className="input-field py-6 text-3xl font-black tracking-[0.5em] text-center"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handlePincodeSearch(pincode)}
                                                className="btn-primary px-12 text-xl"
                                            >
                                                {t('search')}
                                            </button>
                                        </div>
                                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-inner">
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('radius')}</span>
                                                <span className="text-3xl font-black text-primary-600">{radius} km</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="50" value={radius}
                                                onChange={handleRadiusChange}
                                                className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                                <div className="glass-card p-12 rounded-[3.5rem] flex flex-col justify-center items-center text-center border-4 border-white shadow-2xl">
                                    <div className="text-7xl font-black text-primary-600 mb-4">{workers.length}</div>
                                    <div className="text-slate-400 font-black uppercase tracking-widest text-sm">{t('nearby_workers')}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {workers.length > 0 ? workers.map((worker) => (
                                    <motion.div
                                        key={worker._id}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className="glass-card p-10 rounded-[3rem] border-4 border-white hover:border-primary-100 transition-all shadow-xl"
                                    >
                                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                                            <User size={32} className="text-slate-400" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 mb-2">{worker.name}</h3>
                                        <div className="text-slate-400 font-bold mb-8 flex items-center bg-slate-50 w-fit px-4 py-1 rounded-full text-sm">
                                            <Globe size={16} className="mr-2 text-primary-500" />
                                            <span className="uppercase tracking-widest">{nativeNames[worker.language] || worker.language}</span>
                                        </div>
                                        <a href={`tel:${worker.phone}`} className="btn-primary flex items-center justify-center w-full py-6 text-2xl shadow-primary-500/20">
                                            <Phone size={28} className="mr-4" strokeWidth={3} />
                                            <span className="tracking-widest">{worker.phone}</span>
                                        </a>
                                    </motion.div>
                                )) : !loading && (
                                    <div className="col-span-full py-32 text-center glass-card rounded-[3.5rem] border-4 border-dashed border-slate-200 bg-slate-50/50">
                                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-2 border-slate-100">
                                            <Users size={48} className="text-slate-200" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-400">{t('no_workers_found')}</h3>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="jobs"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Post Job Form */}
                                <div className="glass-card p-12 rounded-[3.5rem] lg:col-span-1 border-4 border-white shadow-2xl h-fit sticky top-32">
                                    <h2 className="text-3xl font-black text-slate-900 mb-10 flex items-center">
                                        <Zap className="mr-4 text-accent" size={32} strokeWidth={3} />
                                        {t('post_job')}
                                    </h2>
                                    <form onSubmit={handleJobSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 px-2 uppercase tracking-widest">{t('job_title')}</label>
                                            <input
                                                type="text"
                                                required
                                                value={jobFormData.title}
                                                onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                                                className="input-field py-5 text-xl font-black"
                                                placeholder="e.g. Construction"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 px-2 uppercase tracking-widest">{t('job_description')}</label>
                                            <textarea
                                                required
                                                rows="4"
                                                value={jobFormData.description}
                                                onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                                                className="input-field py-5 text-lg font-bold"
                                                placeholder="What needs to be done?"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 px-2 uppercase tracking-widest">{t('salary')}</label>
                                                <input
                                                    type="text"
                                                    value={jobFormData.salary}
                                                    onChange={(e) => setJobFormData({ ...jobFormData, salary: e.target.value })}
                                                    className="input-field py-5 text-xl font-black"
                                                    placeholder="₹ 000"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 px-2 uppercase tracking-widest">{t('pincode')}</label>
                                                <input
                                                    type="text"
                                                    maxLength="6"
                                                    required
                                                    value={jobFormData.pincode}
                                                    onChange={(e) => setJobFormData({ ...jobFormData, pincode: e.target.value })}
                                                    className="input-field py-5 text-xl font-black tracking-widest"
                                                    placeholder="000 000"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-primary w-full py-6 text-2xl from-accent to-accent-dark shadow-accent/20 mt-4"
                                        >
                                            {loading ? <RefreshCw className="animate-spin" size={32} /> : <span>{t('post_job')}</span>}
                                        </button>
                                        {jobMsg && (
                                            <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-green-600 text-center font-black p-4 bg-green-50 rounded-2xl border-2 border-green-100 text-lg"
                                            >
                                                <CheckCircle className="inline mr-2" size={20} />
                                                {jobMsg}
                                            </motion.div>
                                        )}
                                        {error && <p className="text-red-500 text-center font-black">{error}</p>}
                                    </form>
                                </div>

                                {/* My Jobs List */}
                                <div className="lg:col-span-2 space-y-8">
                                    <h2 className="text-3xl font-black text-slate-800 flex items-center px-4">
                                        <Info className="mr-4 text-primary-600" size={32} />
                                        {t('my_jobs')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {jobs.length > 0 ? jobs.map((job) => (
                                            <motion.div
                                                key={job._id}
                                                whileHover={{ scale: 1.02 }}
                                                className="glass-card p-8 rounded-[2.5rem] border-4 border-white shadow-xl flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-2xl font-black text-slate-900 leading-tight">{job.title}</h3>
                                                        <span className="bg-primary-50 text-primary-700 px-4 py-1 rounded-xl text-lg font-black border-2 border-primary-100 italic">
                                                            ₹{job.salary}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-500 font-bold text-base mb-6 line-clamp-2 leading-relaxed">{job.description}</p>
                                                </div>
                                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                                                    <span className="flex items-center"><MapPin size={14} className="mr-2 text-primary-500" /> {job.pincode}</span>
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <div className="col-span-full py-24 text-center glass-card rounded-[3.5rem] border-4 border-dashed border-slate-200">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <Briefcase size={40} className="text-slate-200" />
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">
                                                    {t('no_jobs_found')}
                                                </h3>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading && (
                    <div className="flex flex-col justify-center items-center mt-20 space-y-4">
                        <div className="w-16 h-16 border-4 border-white/10 border-t-primary-500 rounded-full animate-spin"></div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EngineerDashboard;
