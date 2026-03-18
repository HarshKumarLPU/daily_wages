import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Search, MapPin, Phone, LogOut, Filter, Info, Users, Zap, Navigation, RefreshCw, User, Globe, Briefcase, CheckCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';

const EngineerDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
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
        pincode: ''
    });

    const nativeNames = {
        en: 'English', hi: 'हिंदी', te: 'తెలుగు', mr: 'मराठी', pa: 'ਪੰਜਾਬੀ'
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
            const res = await api.get(`/engineers/workers?lng=${location.lng}&lat=${lat}&radius=${r}`);
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
            // Re-fetch with new coords
            const res = await api.get(`/engineers/workers?lng=${newCoords.lng}&lat=${newCoords.lat}&radius=${radius}`);
            setWorkers(res.data);
        } catch (err) {
            console.error('Pincode fetch error:', err);
            setError(t('enterPincode'));
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
            const response = await fetch(`https://api.zippopotam.us/in/${jobFormData.pincode}`);
            if (!response.ok) throw new Error('Invalid pincode');
            const data = await response.json();
            const place = data.places[0];
            const coordinates = [parseFloat(place.longitude), parseFloat(place.latitude)];

            await api.post('/jobs', { ...jobFormData, coordinates });
            setJobMsg(t('success'));
            setJobFormData({ title: '', description: '', pincode: '' });
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
        if (coords) {
            api.get(`/engineers/workers?lng=${coords.lng}&lat=${coords.lat}&radius=${newRadius}`)
                .then(res => setWorkers(res.data));
        }
    };

    const handleCallClick = async (workerId, phone) => {
        try {
            await api.patch(`/engineers/workers/${workerId}/call`);
            window.location.href = `tel:${phone}`;
        } catch (err) {
            console.error('Tracking call error:', err);
            window.location.href = `tel:${phone}`;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Hero Stats */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="onshop-card bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white p-8">
                        <Users size={32} className="mb-4 opacity-50" />
                        <p className="text-xs font-bold uppercase tracking-widest opacity-70">{t('nearbyWorkers')}</p>
                        <h3 className="text-3xl font-black">{workers.length}</h3>
                    </div>
                    <div className="onshop-card bg-gradient-to-br from-orange-400 to-orange-500 text-white p-8">
                        <Briefcase size={32} className="mb-4 opacity-50" />
                        <p className="text-xs font-bold uppercase tracking-widest opacity-70">{t('myPostedJobs')}</p>
                        <h3 className="text-3xl font-black">{jobs.length}</h3>
                    </div>
                    <div className="onshop-card md:col-span-2 flex items-center justify-between p-8">
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{t('searchRadius')}</p>
                            <h3 className="text-2xl font-black text-slate-800">{radius} km</h3>
                        </div>
                        <div className="flex-1 max-w-[200px] ml-10">
                            <input
                                type="range" min="1" max="50" value={radius}
                                onChange={handleRadiusChange}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('workers')}
                                className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'workers' ? 'bg-[var(--primary)] text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400'}`}
                            >
                                {t('findWorkers')}
                            </button>
                            <button
                                onClick={() => setActiveTab('jobs')}
                                className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'jobs' ? 'bg-[var(--primary)] text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400'}`}
                            >
                                {t('myPostedJobs')}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'workers' ? (
                            <motion.div
                                key="workers"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                {/* Search Pincode */}
                                <div className="onshop-card flex flex-col md:flex-row gap-6 items-center">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-[var(--primary)]">
                                        <Navigation size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800">{t('changeLocation')}</h3>
                                        <p className="text-xs text-slate-400 font-medium">{t('findWorkersByPincode')}</p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <input
                                            type="text"
                                            maxLength="6"
                                            placeholder={t('pincode')}
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value)}
                                            className="input-onshop md:w-32 text-center font-bold tracking-widest"
                                        />
                                        <button
                                            onClick={() => handlePincodeSearch(pincode)}
                                            className="btn-onshop px-6"
                                        >
                                            <Search size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Workers Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {workers.length > 0 ? workers.map((worker) => (
                                        <motion.div
                                            key={worker._id}
                                            whileHover={{ y: -5 }}
                                            className="onshop-card"
                                        >
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                                    <User size={28} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-800 leading-none mb-1">{worker.name}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{worker.role || t('vendor')}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-8">
                                                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                                    <Globe size={10} /> {nativeNames[worker.language] || worker.language}
                                                </div>
                                                <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                                    <Star size={10} className="fill-amber-600" /> 4.9
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleCallClick(worker._id, worker.phone)}
                                                className="btn-onshop w-full"
                                            >
                                                <Phone size={18} /> {t('callWorker')}
                                            </button>
                                        </motion.div>
                                    )) : (
                                        <div className="col-span-full py-20 text-center onshop-card bg-slate-50/50 border-dashed border-2">
                                            <p className="text-slate-400 font-bold">{t('noWorkersFound')}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="jobs"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                            >
                                {/* Post Job Form */}
                                <div className="onshop-card h-fit sticky top-32 lg:col-span-1">
                                    <h2 className="text-xl font-black text-slate-800 mb-6 font-bold flex items-center gap-3">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
                                            <Zap size={18} />
                                        </div>
                                        {t('postAJob')}
                                    </h2>
                                    <form onSubmit={handleJobSubmit} className="space-y-5">
                                        <input
                                            type="text"
                                            required
                                            value={jobFormData.title}
                                            onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                                            className="input-onshop"
                                            placeholder={t('jobTitlePlaceholder')}
                                        />
                                        <textarea
                                            required
                                            rows="4"
                                            value={jobFormData.description}
                                            onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                                            className="input-onshop text-sm"
                                            placeholder={t('jobDescriptionPlaceholder')}
                                        />
                                        <input
                                            type="text"
                                            maxLength="6"
                                            required
                                            value={jobFormData.pincode}
                                            onChange={(e) => setJobFormData({ ...jobFormData, pincode: e.target.value })}
                                            className="input-onshop text-center font-bold tracking-widest"
                                            placeholder={t('workPincode')}
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-onshop w-full py-4 from-orange-500 to-orange-600 bg-gradient-to-r"
                                        >
                                            {loading ? <RefreshCw className="animate-spin" size={24} /> : <span>{t('postJobNow')}</span>}
                                        </button>
                                        {jobMsg && <p className="text-emerald-500 text-center font-bold text-sm">{jobMsg}</p>}
                                        {error && <p className="text-red-500 text-center font-bold text-sm">{error}</p>}
                                    </form>
                                </div>

                                {/* My Jobs List */}
                                <div className="lg:col-span-2 space-y-6">
                                    <h3 className="font-bold text-slate-800 mb-4 ml-2">{t('myRecentlyPostedJobs')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {jobs.length > 0 ? jobs.map((job) => (
                                            <motion.div
                                                key={job._id}
                                                whileHover={{ scale: 1.01 }}
                                                className="onshop-card border-none"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] bg-indigo-50 px-2 py-1 rounded-md">{t('live')}</span>
                                                    <span className="text-slate-300"><MapPin size={16} /></span>
                                                </div>
                                                <h3 className="text-lg font-black text-slate-800 mb-2 truncate">{job.title}</h3>
                                                <p className="text-sm text-slate-400 font-medium line-clamp-2 mb-6 h-10">{job.description}</p>
                                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-50">
                                                    <span>{job.pincode}</span>
                                                    <span className="text-emerald-500">{t('active')}</span>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <div className="col-span-full py-20 text-center onshop-card bg-slate-50/50 border-dashed border-2">
                                                <p className="text-slate-400 font-bold">{t('noJobsPosted')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default EngineerDashboard;

